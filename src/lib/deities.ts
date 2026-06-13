export interface Deity {
  id: string
  nameHindi: string
  nameEnglish: string
  jaikara: string
  image: string
  glow: string
}

export const deities: Deity[] = [
  {
    id: 'radha-krishna',
    nameHindi: 'राधा कृष्ण',
    nameEnglish: 'Radha Krishna',
    jaikara: 'राधे राधे',
    image: '/images/deity-radha-krishna.webp',
    glow: 'rgba(56, 189, 248, 0.35)',
  },
  {
    id: 'shree-ram',
    nameHindi: 'श्री राम',
    nameEnglish: 'Shree Ram',
    jaikara: 'जय श्री राम',
    image: '/images/deity-ram.webp',
    glow: 'rgba(249, 115, 22, 0.35)',
  },
  {
    id: 'mahakal',
    nameHindi: 'महाकाल',
    nameEnglish: 'Mahakaleshwar',
    jaikara: 'जय महाकाल',
    image: '/images/deity-mahakal.jpg',
    glow: 'rgba(250, 204, 21, 0.3)',
  },
  {
    id: 'hanuman',
    nameHindi: 'हनुमान जी',
    nameEnglish: 'Hanuman Ji',
    jaikara: 'जय बजरंगबली',
    image: '/images/deity-hanuman.png',
    glow: 'rgba(239, 68, 68, 0.35)',
  },
  {
    id: 'salangpur',
    nameHindi: 'कष्टभंजन देव',
    nameEnglish: 'Salangpur Hanumanji',
    jaikara: 'जय कष्टभंजन देव',
    image: '/images/deity-salangpur.jpg',
    glow: 'rgba(212, 168, 83, 0.4)',
  },
]
