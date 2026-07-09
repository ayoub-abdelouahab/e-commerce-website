const COST_NORTH = 500;
const COST_HIGH_PLATEAUX = 600;
const COST_SAHARA = 700;

const NORTHERN_WILAYAS = [
  'Algiers', 'Blida', 'Oran', 'Constantine', 'Annaba', 'Tipaza',
  'Boumerdes', 'Chlef', 'Tizi Ouzou', 'Bejaia', 'Jijel', 'Skikda',
  'Mostaganem', 'Ain Temouchent', 'Mascara', 'Relizane', 'El Taref',
];

const HIGH_PLATEAUX_WILAYAS = [
  'Setif', 'Batna', 'Bordj Bou Arreridj', 'Medea', 'Bouira',
  'Djelfa', 'Tiaret', 'Saida', 'Tlemcen', 'Sidi Bel Abbes',
  'Oum El Bouaghi', 'Khenchela', 'Tebessa', 'Souk Ahras',
  'Mila', 'Guelma', "M'Sila",
];

const SAHARA_WILAYAS = [
  'Ouargla', 'Ghardaia', 'Biskra', 'El Oued', 'Adrar',
  'Tamanrasset', 'Illizi', 'Tindouf', 'Bechar', 'Laghouat',
  'Naama', 'El Bayadh', 'Touggourt', 'Djanet', 'In Salah',
  'In Guezzam', "El M'Ghair", 'Ouled Djellal', 'Timimoun',
  'Bordj Badji Mokhtar', 'Beni Abbes', 'El Meniaa',
];

export const getRegion = (wilaya) => {
  if (NORTHERN_WILAYAS.includes(wilaya)) return 'north';
  if (HIGH_PLATEAUX_WILAYAS.includes(wilaya)) return 'high_plateaux';
  if (SAHARA_WILAYAS.includes(wilaya)) return 'sahara';
  return null;
};

export const getShippingCost = (wilaya) => {
  const region = getRegion(wilaya);
  switch (region) {
    case 'north': return COST_NORTH;
    case 'high_plateaux': return COST_HIGH_PLATEAUX;
    case 'sahara': return COST_SAHARA;
    default: return 0;
  }
};

export const getRegionLabel = (wilaya) => {
  const region = getRegion(wilaya);
  switch (region) {
    case 'north': return 'Northern';
    case 'high_plateaux': return 'High Plateaux';
    case 'sahara': return 'Saharan';
    default: return '';
  }
};
