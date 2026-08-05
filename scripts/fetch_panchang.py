import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

# Force UTF-8 encoding for standard output on Windows to avoid UnicodeEncodeError from third-party libraries (e.g. vedastro)
if sys.platform.startswith("win"):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")

from vedastro import *


ZONES = [
    {"name": "north", "city": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"name": "northwest", "city": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    {"name": "west", "city": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"name": "central", "city": "Nagpur", "lat": 21.1458, "lng": 79.0882},
    {"name": "northeast", "city": "Kolkata", "lat": 22.5726, "lng": 88.3639},
    {"name": "south", "city": "Bengaluru", "lat": 12.9716, "lng": 77.5946},
]

DATA_DIR = Path("public/data")
HEALTH_PATH = DATA_DIR / "panchang-health.json"
IST = ZoneInfo("Asia/Kolkata")
API_DELAY_SECONDS = 13
ZONE_FETCH_RETRIES = 3
ZONE_RETRY_BACKOFF_SECONDS = 20
RAHU_ORDER = {0: 2, 1: 7, 2: 4, 3: 5, 4: 6, 5: 3, 6: 8}
VARA_BY_WEEKDAY = {
    0: "Somvaar",
    1: "Mangalvaar",
    2: "Budhvaar",
    3: "Guruvaar",
    4: "Shukravaar",
    5: "Shanivaar",
    6: "Ravivaar",
}
TITHI_NAME_NUMBERS = {
    "pratipada": 1,
    "prathama": 1,
    "dwitiya": 2,
    "dvitiiya": 2,
    "tritiya": 3,
    "tritiiya": 3,
    "chaturthi": 4,
    "panchami": 5,
    "shashthi": 6,
    "sashti": 6,
    "saptami": 7,
    "ashtami": 8,
    "astami": 8,
    "navami": 9,
    "dashami": 10,
    "dasimi": 10,
    "ekadashi": 11,
    "dwadashi": 12,
    "dvadasi": 12,
    "trayodashi": 13,
    "triodasi": 13,
    "triyodasi": 13,
    "chaturdashi": 14,
    "purnima": 15,
    "poornima": 15,
    "amavasya": 15,
}


def clean_text(value):
    if value is None:
        return ""
    if isinstance(value, dict):
        for key in ("Name", "name", "Value", "value"):
            if key in value:
                return clean_text(value[key])
        return " ".join(clean_text(item) for item in value.values()).strip()
    text = str(value)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def parse_time(value):
    text = clean_text(value)
    match = re.search(r"(\d{1,2}):(\d{2})", text)
    if not match:
        raise ValueError(f"Unable to parse time: {text}")
    hour = int(match.group(1))
    minute = int(match.group(2))
    suffix_match = re.search(r"\b(AM|PM)\b", text, re.IGNORECASE)
    if suffix_match:
        suffix = suffix_match.group(1).upper()
        if suffix == "PM" and hour != 12:
            hour += 12
        elif suffix == "AM" and hour == 12:
            hour = 0
    return hour, minute


def minutes_to_time(total_minutes):
    total_minutes = int(round(total_minutes)) % (24 * 60)
    hour_24 = total_minutes // 60
    minute = total_minutes % 60
    suffix = "AM" if hour_24 < 12 else "PM"
    hour_12 = hour_24 % 12 or 12
    return f"{hour_12:02d}:{minute:02d} {suffix}"


def format_time(value):
    hour, minute = parse_time(value)
    return minutes_to_time(hour * 60 + minute)


def calculate_rahu_kaal(sunrise_str, sunset_str, weekday):
    sunrise_hour, sunrise_minute = parse_time(sunrise_str)
    sunset_hour, sunset_minute = parse_time(sunset_str)
    sunrise = sunrise_hour * 60 + sunrise_minute
    sunset = sunset_hour * 60 + sunset_minute

    if sunset <= sunrise:
        raise ValueError("Sunset must be after sunrise")

    part_length = (sunset - sunrise) / 8
    part_number = RAHU_ORDER[weekday]
    start = sunrise + (part_number - 1) * part_length
    end = start + part_length
    return f"{minutes_to_time(start)} - {minutes_to_time(end)}"


def calculate_brahma_muhurat(sunrise_str):
    sunrise_hour, sunrise_minute = parse_time(sunrise_str)
    sunrise = sunrise_hour * 60 + sunrise_minute
    return f"{minutes_to_time(sunrise - 96)} - {minutes_to_time(sunrise - 48)}"


def extract_tithi_number(tithi):
    text = clean_text(tithi).lower()
    match = re.search(r"(\d{1,2})\s*/\s*30", text)
    if match:
        return int(match.group(1))
    match = re.search(r"\b(\d{1,2})\b", text)
    if match:
        return int(match.group(1))
    for name, number in TITHI_NAME_NUMBERS.items():
        if name in text:
            return number
    return 0


def determine_paksha(tithi, tithi_number):
    text = clean_text(tithi).lower()
    if "krishna" in text or "dark" in text:
        return "Krishna"
    if "shukla" in text or "sukla" in text or "bright" in text:
        return "Shukla"
    if 1 <= tithi_number <= 15:
        return "Shukla"
    return "Krishna"


def rate_limited_call(callable_fn):
    result = callable_fn()
    time.sleep(API_DELAY_SECONDS)
    return result


def calculate_with_fallback(method_names, *args):
    last_error = None
    for method_name in method_names:
        try:
            method = getattr(Calculate, method_name)
            return rate_limited_call(lambda: method(*args))
        except AttributeError as error:
            last_error = error
    raise last_error or AttributeError(f"Missing VedAstro methods: {method_names}")


def read_zone_file_date(zone_name, date_str=None):
    if date_str:
        output_path = DATA_DIR / f"panchang-{zone_name}-{date_str}.json"
    else:
        output_path = DATA_DIR / f"panchang-{zone_name}.json"
    if not output_path.exists():
        return None
    try:
        payload = json.loads(output_path.read_text(encoding="utf-8"))
        date = payload.get("date")
        return date if isinstance(date, str) and date else None
    except (json.JSONDecodeError, OSError):
        return None


def cleanup_old_files(max_age_days=7):
    from datetime import timedelta
    today = datetime.now(IST).date()
    pattern = re.compile(r"^panchang-[a-z]+-(\d{4}-\d{2}-\d{2})\.json$")
    for file in DATA_DIR.glob("panchang-*-*.json"):
        match = pattern.match(file.name)
        if match:
            try:
                file_date = datetime.strptime(match.group(1), "%Y-%m-%d").date()
                if (today - file_date).days > max_age_days:
                    file.unlink(missing_ok=True)
                    print(f"CLEANED old archive: {file.name}")
            except ValueError:
                pass


def zones_needing_update_for_date(target_date_str):
    pending = []
    for zone in ZONES:
        if read_zone_file_date(zone["name"], target_date_str) != target_date_str:
            pending.append(zone)
    return pending


def fetch_zone_with_retries(zone, target_dt):
    last_error = None
    for attempt in range(1, ZONE_FETCH_RETRIES + 1):
        try:
            return fetch_zone(zone, target_dt)
        except Exception as error:
            last_error = error
            if attempt < ZONE_FETCH_RETRIES:
                wait_seconds = ZONE_RETRY_BACKOFF_SECONDS * attempt
                print(
                    f"RETRY {zone['city']} ({target_dt.strftime('%Y-%m-%d')}) attempt {attempt}/{ZONE_FETCH_RETRIES} "
                    f"in {wait_seconds}s: {error}"
                )
                time.sleep(wait_seconds)
    raise last_error


def fetch_zone(zone, target_dt):
    location = GeoLocation(f"{zone['city']}, India", zone["lng"], zone["lat"])
    day_time = Time(
        hour=5,
        minute=0,
        day=target_dt.day,
        month=target_dt.month,
        year=target_dt.year,
        offset="+05:30",
        geolocation=location,
    )

    tithi = calculate_with_fallback(["LunarDay"], day_time)
    nakshatra = calculate_with_fallback(["MoonConstellation"], day_time)
    yoga = calculate_with_fallback(["Yoga", "NithyaYoga"], day_time)
    karana = calculate_with_fallback(["Karana"], day_time)
    sunrise = calculate_with_fallback(["SunRise", "SunriseTime"], day_time)
    sunset = calculate_with_fallback(["SunSet", "SunsetTime"], day_time)

    tithi_number = extract_tithi_number(tithi)
    date_str = target_dt.strftime("%Y-%m-%d")
    sunrise_text = format_time(sunrise)
    sunset_text = format_time(sunset)

    return {
        "date": date_str,
        "zone": zone["name"],
        "city": zone["city"],
        "tithi": clean_text(tithi),
        "tithi_number": tithi_number,
        "nakshatra": clean_text(nakshatra),
        "yoga": clean_text(yoga),
        "karana": clean_text(karana),
        "paksha": determine_paksha(tithi, tithi_number),
        "sunrise": sunrise_text,
        "sunset": sunset_text,
        "rahu_kaal": calculate_rahu_kaal(sunrise_text, sunset_text, target_dt.weekday()),
        "brahma_muhurat": calculate_brahma_muhurat(sunrise_text),
        "vara": VARA_BY_WEEKDAY[target_dt.weekday()],
        "updated_at": datetime.now(IST).isoformat(timespec="seconds"),
    }


def count_zones_for_today(today_str):
    return sum(1 for zone in ZONES if read_zone_file_date(zone["name"]) == today_str)

def write_health(now, failed_zones):
    success_count = count_zones_for_today(now.strftime("%Y-%m-%d"))
    health = {
        "date": now.strftime("%Y-%m-%d"),
        "status": "ok" if success_count == len(ZONES) else "warning" if success_count > 0 else "failed",
        "total_zones": len(ZONES),
        "successful_zones": success_count,
        "failed_zones": failed_zones,
        "updated_at": now.isoformat(timespec="seconds"),
        "message": (
            f"All {len(ZONES)} Panchang zones updated successfully"
            if success_count == len(ZONES)
            else f"Panchang updated for {success_count}/{len(ZONES)} zones"
        ),
    }
    HEALTH_PATH.write_text(json.dumps(health, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return success_count


def main():
    from datetime import timedelta
    Calculate.SetAPIKey("FreeAPIUser")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    now = datetime.now(IST)
    today_dt = now

    # We want a 3-day history window: today, 1 day ago, 2 days ago, 3 days ago
    days_to_check = [today_dt - timedelta(days=d) for d in range(4)]
    
    cleanup_old_files(max_age_days=7)

    failed_zones = []

    for target_dt in days_to_check:
        target_date_str = target_dt.strftime("%Y-%m-%d")
        pending_zones = zones_needing_update_for_date(target_date_str)
        if not pending_zones:
            print(f"SKIP Panchang for {target_date_str} already cached ({len(ZONES)} zones).")
            continue

        print(
            f"RUN Panchang fetch for {target_date_str}: "
            f"{len(pending_zones)} zone(s) missing ({', '.join(zone['city'] for zone in pending_zones)})"
        )

        for index, zone in enumerate(pending_zones, start=1):
            try:
                data = fetch_zone_with_retries(zone, target_dt)
                # Write to date-stamped file
                date_path = DATA_DIR / f"panchang-{zone['name']}-{target_date_str}.json"
                date_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

                # If it's today, also update the default panchang-{zone}.json file
                if target_date_str == today_dt.strftime("%Y-%m-%d"):
                    default_path = DATA_DIR / f"panchang-{zone['name']}.json"
                    default_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

                print(f"OK {zone['city']} ({target_date_str}) done ({index}/{len(pending_zones)})")
            except Exception as error:
                error_message = str(error)
                failed_zones.append(
                    {
                        "zone": zone["name"],
                        "city": zone["city"],
                        "date": target_date_str,
                        "error": error_message,
                    }
                )
                print(f"FAILED {zone['city']} ({target_date_str}) failed: {error_message}")
                continue

    success_count = write_health(now, failed_zones)
    print(f"Panchang update finished for {today_dt.strftime('%Y-%m-%d')} - {success_count}/{len(ZONES)} zones for today OK.")


if __name__ == "__main__":
    main()
