export interface SubTypeOption {
  labelHindi: string;
  value: string;
}

export interface DeityOption {
  id?: number | null;
  name: string;
  nameHindi: string;
  isGeneral?: boolean;
}

// Sub-type options — Chalisa
export const CHALISA_SUB_TYPES: SubTypeOption[] = [
  { labelHindi: 'चालीसा', value: 'chalisa' },
  { labelHindi: 'स्तोत्र', value: 'stotra' },
  { labelHindi: 'कवच', value: 'kavach' },
  { labelHindi: 'पाठ', value: 'path' },
  { labelHindi: 'अष्टक', value: 'ashtak' },
];

// Sub-type options — Other
export const OTHER_SUB_TYPES: SubTypeOption[] = [
  { labelHindi: 'स्तोत्र', value: 'stotra' },
  { labelHindi: 'अष्टकम', value: 'ashtakam' },
  { labelHindi: 'कवच', value: 'kavach' },
  { labelHindi: 'दोहा', value: 'doha' },
  { labelHindi: 'भजन-कविता', value: 'bhajan_kavita' },
  { labelHindi: 'अन्य', value: 'other' },
];

// Extended Deity list for Bhajan / Aarti / Chalisa / Other
export const EXTENDED_DEITIES: DeityOption[] = [
  { id: 1, name: 'Krishna', nameHindi: 'कृष्ण' },
  { id: 2, name: 'Shiva', nameHindi: 'शिव' },
  { id: 3, name: 'Hanuman', nameHindi: 'हनुमान' },
  { id: 4, name: 'Rama', nameHindi: 'राम' },
  { id: 5, name: 'Durga', nameHindi: 'दुर्गा' },
  { id: 6, name: 'Ganesh', nameHindi: 'गणेश' },
  { id: 7, name: 'Sai Baba', nameHindi: 'साईं बाबा' },
  { id: 8, name: 'Lakshmi', nameHindi: 'लक्ष्मी' },
  { id: 9, name: 'Khatu Shyam', nameHindi: 'खाटू श्याम' },
  { id: 10, name: 'Saraswati', nameHindi: 'सरस्वती' },
  { id: 11, name: 'Vishnu', nameHindi: 'विष्णु' },
  { id: 12, name: 'Surya Dev', nameHindi: 'सूर्य देव' },
];

// Deity list for Katha (Includes General/Multiple tile)
export const KATHA_DEITIES: DeityOption[] = [
  ...EXTENDED_DEITIES,
  { id: null, name: 'General / Multiple', nameHindi: 'सामान्य / एकाधिक', isGeneral: true },
];
