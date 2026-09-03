import * as m from '@ishubhamx/panchangam-js';

const date = new Date('1995-06-15T09:00:00.000Z');

const observer = new m.Observer(
  26.9124, // latitude
  75.7873, // longitude
  431      // elevation
);

const ayanamsa = m.getAyanamsa(date);

console.log('==========================================');
console.log('   PANCHANGAM-JS v3.0.0 CAPABILITY TEST');
console.log('==========================================');

console.log('\nInput');
console.log('UTC:', date.toISOString());
console.log('Latitude:', observer.latitude);
console.log('Longitude:', observer.longitude);
console.log('Elevation:', observer.height);

console.log('\n------------------------------------------');
console.log('1. AYANAMSA');
console.log('------------------------------------------');

console.log(ayanamsa);

console.log('\n------------------------------------------');
console.log('2. LAGNA / ASCENDANT');
console.log('------------------------------------------');

const lagna = m.getUdayaLagna(
  date,
  observer,
  ayanamsa
);

console.log('Longitude:', lagna);

console.log(
  'Rashi:',
  m.lonToRashi(lagna)
);

console.log(
  'Nakshatra:',
  m.getNakshatra(lagna)
);

console.log(
  'Pada:',
  m.getNakshatraPada(lagna)
);

console.log('\n------------------------------------------');
console.log('3. RAHU');
console.log('------------------------------------------');

const rahu = m.getRahuPosition(
  date,
  ayanamsa
);

console.log(rahu);

console.log('\n------------------------------------------');
console.log('4. KETU');
console.log('------------------------------------------');

const ketu = m.getKetuPosition(rahu);

console.log(ketu);

console.log('\n------------------------------------------');
console.log('5. FULL KUNDLI OBJECT');
console.log('------------------------------------------');

const kundli = m.getKundli(
  date,
  observer
);

console.log('Kundli generated:', !!kundli);

console.log(
  'Top-level keys:',
  Object.keys(kundli)
);

console.log('\n------------------------------------------');
console.log('6. ASCENDANT FROM KUNDLI');
console.log('------------------------------------------');

console.log(kundli.ascendant);

console.log('\n------------------------------------------');
console.log('7. PLANETS');
console.log('------------------------------------------');

for (const [name, planet] of Object.entries(kundli.planets ?? {})) {
  const p = planet as any;

  console.log(
    `${name.padEnd(8)} | ` +
    `Rashi: ${String(p.rashiName ?? p.rashi ?? '—').padEnd(12)} | ` +
    `Degree: ${typeof p.degree === 'number'
      ? p.degree.toFixed(4)
      : '—'} | ` +
    `Nakshatra: ${p.nakshatra ?? '—'} | ` +
    `Pada: ${p.pada ?? '—'} | ` +
    `Retro: ${p.isRetrograde ?? '—'}`
  );
}

console.log('\n------------------------------------------');
console.log('8. HOUSES / BHAVAS');
console.log('------------------------------------------');

console.log(
  'House count:',
  kundli.houses?.length ?? 0
);

for (const house of kundli.houses ?? []) {
  const h = house as any;

  console.log(
    `House ${h.house ?? h.number ?? '?'} | ` +
    `Rashi: ${h.rashiName ?? h.rashi ?? '—'} | ` +
    `Start: ${h.startLongitude ?? '—'} | ` +
    `End: ${h.endLongitude ?? '—'} | ` +
    `Planets: ${(h.planets ?? []).join(', ') || 'None'}`
  );
}

console.log('\n------------------------------------------');
console.log('9. VIMSHOTTARI DASHA');
console.log('------------------------------------------');

console.log(
  'Dasha exists:',
  !!kundli.dasha
);

console.log(
  'Dasha keys:',
  Object.keys(kundli.dasha ?? {})
);

console.log(
  'Dasha summary:',
  JSON.stringify(
    kundli.dasha,
    null,
    2
  )
);

console.log('\n------------------------------------------');
console.log('10. VARGAS / DIVISIONAL CHARTS');
console.log('------------------------------------------');

console.log(
  'Varga keys:',
  Object.keys(kundli.vargas ?? {})
);

for (const [name, varga] of Object.entries(
  kundli.vargas ?? {}
)) {
  const v = varga as any;

  console.log(
    `${name}:`,
    Object.keys(v ?? {})
  );

  if (v?.planets) {
    console.log(
      `  planets: ${Object.keys(v.planets).join(', ')}`
    );
  }
}

console.log('\n------------------------------------------');
console.log('11. PANCHANGAM');
console.log('------------------------------------------');

const panchang = m.getPanchangam(
  date,
  observer
);

console.log(
  'Panchang keys:',
  Object.keys(panchang ?? {})
);

console.log(
  JSON.stringify(
    panchang,
    null,
    2
  )
);

console.log('\n------------------------------------------');
console.log('12. SUNRISE / SUNSET');
console.log('------------------------------------------');

console.log(
  'Sunrise:',
  m.getSunrise(date, observer)
);

console.log(
  'Sunset:',
  m.getSunset(date, observer)
);

console.log('\n------------------------------------------');
console.log('13. MOONRISE / MOONSET');
console.log('------------------------------------------');

console.log(
  'Moonrise:',
  m.getMoonrise(date, observer)
);

console.log(
  'Moonset:',
  m.getMoonset(date, observer)
);

console.log('\n------------------------------------------');
console.log('14. TITHI');
console.log('------------------------------------------');

console.log(
  'Tithi:',
  m.getTithiAtTime(date)
);

console.log(
  'Tithi at sunrise:',
  m.getTithiAtSunrise(date, observer)
);

console.log('\n------------------------------------------');
console.log('15. NAKSHATRA');
console.log('------------------------------------------');

console.log(
  'Nakshatra:',
  m.getNakshatra(
    kundli.planets?.Moon?.longitude
  )
);

console.log(
  'Nakshatra Pada:',
  m.getNakshatraPada(
    kundli.planets?.Moon?.longitude
  )
);

console.log('\n------------------------------------------');
console.log('16. YOGA');
console.log('------------------------------------------');

console.log(
  'Yoga:',
  m.getYoga(date)
);

console.log('\n------------------------------------------');
console.log('17. KARANA');
console.log('------------------------------------------');

console.log(
  'Karana:',
  m.getKarana(date)
);

console.log('\n------------------------------------------');
console.log('18. AYANA');
console.log('------------------------------------------');

console.log(
  'Ayana:',
  m.getAyana(date)
);

console.log('\n------------------------------------------');
console.log('19. RASHI');
console.log('------------------------------------------');

console.log(
  'Moon Rashi:',
  m.getRashi(
    kundli.planets?.Moon?.longitude
  )
);

console.log(
  'Sun Rashi:',
  m.getRashi(
    kundli.planets?.Sun?.longitude
  )
);

console.log('\n------------------------------------------');
console.log('20. AVAILABLE LIBRARY FUNCTIONS');
console.log('------------------------------------------');

console.log(
  Object.keys(m)
    .filter(
      key =>
        typeof (m as any)[key] === 'function'
    )
    .sort()
    .join('\n')
);

console.log('\n==========================================');
console.log('              TEST COMPLETE');
console.log('==========================================');