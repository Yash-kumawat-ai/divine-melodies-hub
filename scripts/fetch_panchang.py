import json
import re
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

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


def read_zone_file_date(zone_name):
    output_path = DATA_DIR / f"panchang-{zone_name}.json"
    if not output_path.exists():
        return None
    try:
        payload = json.loads(output_path.read_text(encoding="utf-8"))
        date = payload.get("date")
        return date if isinstance(date, str) and date else None
    except (json.JSONDecodeError, OSError):
        return None


def zones_needing_update(today_str):
    pending = []
    for zone in ZONES:
        if read_zone_file_date(zone["name"]) != today_str:
            pending.append(zone)
    return pending


def fetch_zone_with_retries(zone, now):
    last_error = None
    for attempt in range(1, ZONE_FETCH_RETRIES + 1):
        try:
            return fetch_zone(zone, now)
        except Exception as error:
            last_error = error
            if attempt < ZONE_FETCH_RETRIES:
                wait_seconds = ZONE_RETRY_BACKOFF_SECONDS * attempt
                print(
                    f"RETRY {zone['city']} attempt {attempt}/{ZONE_FETCH_RETRIES} "
                    f"in {wait_seconds}s: {error}"
                )
                time.sleep(wait_seconds)
    raise last_error


def fetch_zone(zone, now):
    location = GeoLocation(f"{zone['city']}, India", zone["lng"], zone["lat"])
    today = Time(
        hour=12,
        minute=0,
        day=now.day,
        month=now.month,
        year=now.year,
        offset="+05:30",
        geolocation=location,
    )

    tithi = calculate_with_fallback(["LunarDay"], today)
    nakshatra = calculate_with_fallback(["MoonConstellation"], today)
    yoga = calculate_with_fallback(["Yoga"], today)
    karana = calculate_with_fallback(["Karana"], today)
    sunrise = calculate_with_fallback(["SunRise", "SunriseTime"], today)
    sunset = calculate_with_fallback(["SunSet", "SunsetTime"], today)

    tithi_number = extract_tithi_number(tithi)
    date = now.strftime("%Y-%m-%d")
    sunrise_text = format_time(sunrise)
    sunset_text = format_time(sunset)

    return {
        "date": date,
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
        "rahu_kaal": calculate_rahu_kaal(sunrise_text, sunset_text, now.weekday()),
        "brahma_muhurat": calculate_brahma_muhurat(sunrise_text),
        "vara": VARA_BY_WEEKDAY[now.weekday()],
        "updated_at": now.isoformat(timespec="seconds"),
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
    Calculate.SetAPIKey("FreeAPIUser")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    now = datetime.now(IST)
    today_str = now.strftime("%Y-%m-%d")
    pending_zones = zones_needing_update(today_str)

    if not pending_zones:
        write_health(now, [])
        print(f"SKIP Panchang already up to date for {today_str} (all {len(ZONES)} zones).")
        return

    print(
        f"RUN Panchang fetch for {today_str}: "
        f"{len(pending_zones)} zone(s) need update ({', '.join(zone['city'] for zone in pending_zones)})"
    )

    failed_zones = []

    for index, zone in enumerate(pending_zones, start=1):
        try:
            data = fetch_zone_with_retries(zone, now)
            output_path = DATA_DIR / f"panchang-{zone['name']}.json"
            output_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"OK {zone['city']} done ({index}/{len(pending_zones)})")
        except Exception as error:
            error_message = str(error)
            failed_zones.append(
                {
                    "zone": zone["name"],
                    "city": zone["city"],
                    "error": error_message,
                }
            )
            print(f"FAILED {zone['city']} failed after {ZONE_FETCH_RETRIES} attempts: {error_message}")
            continue

    success_count = write_health(now, failed_zones)
    print(f"Panchang updated for {today_str} - {success_count}/{len(ZONES)} zones successful")

    if success_count < len(ZONES):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
