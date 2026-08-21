// User fitness constants
export const TDEE = 1717;
export const PROTEIN_TARGET = 120;
export const DEFICIT_TARGET = 300;
export const EPOC = 1.10;

export const SERVING_GRAMS = {
  "Lactaid Whole Milk": 240,
  "Naked Whey Protein Powder": 44,
  "Wyman's Frozen Mixed Berries": 140,
  "Frozen Mango chunks": 227,
  "Cocojune Organic Coconut Yogurt": 114,
  "Daisy 2% Cottage Cheese": 113,
  "Siggi's Vanilla Yogurt (0% fat)": 170,
  "Bob Evans Egg Whites": 46,
  "Fage 0% Greek Yogurt": 170,
};

export const DEFAULT_PROFILE = {
  name: "", age: 35, gender: "female", weight_lbs: 156.0, height_in: 64, tdee: 1717, rhr: 64,
};

export function fmtMacro(v) {
  const n = parseFloat(v) || 0;
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

export function fmtHeight(inches) {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

export const fmtDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function parseLocal(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function shiftDate(str, n) {
  const d = parseLocal(str);
  d.setDate(d.getDate() + n);
  return fmtDate(d);
}

export function displayShort(str) {
  const d = parseLocal(str);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function displayFull(str) {
  return parseLocal(str).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
