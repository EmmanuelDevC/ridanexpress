// utiles/delivery.js
const zones = {
  "South West": ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"],
  "South East": ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
  "South South": ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
  "North Central": ["Benue", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau", "FCT"],
  "North West": ["Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Sokoto", "Zamfara"],
  "North East": ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"]
};

// quick reverse map state -> zone
const stateToZone = {};
Object.entries(zones).forEach(([zone, states]) => {
  states.forEach(s => stateToZone[s.toLowerCase()] = zone);
});

// category fee map (use the affordable table we agreed)
const fees = {
  intra: {
    "mobile phones & accessories": 1500,
    "fashion apparel & jewelry": 1200,
    "beauty & personal care": 1200,
    "small home appliances": 2000,
    "large home appliances": 4000,
    "electronics & computer accessories": 1800,
    "groceries & essentials": 1200,
    "health & wellness products": 1200,
    "small furniture": 3000,
    "large furniture": 5000
  },
  within: {
    "mobile phones & accessories": 2500,
    "fashion apparel & jewelry": 2000,
    "beauty & personal care": 2000,
    "small home appliances": 3000,
    "large home appliances": 5000,
    "electronics & computer accessories": 2500,
    "groceries & essentials": 2000,
    "health & wellness products": 2000,
    "small furniture": 4000,
    "large furniture": 7000
  },
  long: {
    "mobile phones & accessories": 3000,
    "fashion apparel & jewelry": 2500,
    "beauty & personal care": 2500,
    "small home appliances": 4000,
    "large home appliances": 7000,
    "electronics & computer accessories": 3500,
    "groceries & essentials": 2500,
    "health & wellness products": 2500,
    "small furniture": 5500,
    "large furniture": 9000
  }
};

/**
 * Normalizes category name to match keys above.
 * You can expand this mapping to match your product.category values.
 */
function normalizeCategory(cat) {
  if (!cat) return '';
  const c = cat.toString().toLowerCase().trim();
  // try exact match first
  if (fees.intra[c]) return c;

  // simple mapping examples (adjust to your categories)
  if (c.includes('phone') || c.includes('mobile')) return 'mobile phones & accessories';
  if (c.includes('fashion') || c.includes('clothe') || c.includes('apparel')) return 'fashion apparel & jewelry';
  if (c.includes('beauty') || c.includes('skin') || c.includes('cosmet')) return 'beauty & personal care';
  if (c.includes('kitchen') || c.includes('appliance') || c.includes('blender')) return 'small home appliances';
  if (c.includes('fridge') || c.includes('washing') || c.includes('large appliance')) return 'large home appliances';
  if (c.includes('laptop') || c.includes('electronic') || c.includes('computer')) return 'electronics & computer accessories';
  if (c.includes('grocery') || c.includes('food') || c.includes('pantry')) return 'groceries & essentials';
  if (c.includes('health') || c.includes('supplement')) return 'health & wellness products';
  if (c.includes('chair') || c.includes('table') || c.includes('small furniture')) return 'small furniture';
  if (c.includes('sofa') || c.includes('bed') || c.includes('large furniture')) return 'large furniture';

  // fallback to fashion
  return 'fashion apparel & jewelry';
}

function getDistanceType(origin, destination) {
  const o = (origin || '').toString().toLowerCase().trim();
  const d = (destination || '').toString().toLowerCase().trim();
  if (!o || !d) return 'long';

  if (o === d) return 'intra';
  const oz = stateToZone[o];
  const dz = stateToZone[d];
  if (oz && dz && oz === dz) return 'within';
  return 'long';
}

function getDeliveryFee(origin, destination, category) {
  const cat = normalizeCategory(category);
  const distanceType = getDistanceType(origin, destination); // 'intra'|'within'|'long'
  const feeMap = fees[distanceType] || fees.long;
  return feeMap[cat] || feeMap['fashion apparel & jewelry']; // default fallback
}

module.exports = {
  getDeliveryFee,
  normalizeCategory,
  getDistanceType
};
