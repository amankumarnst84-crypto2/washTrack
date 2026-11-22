// Small, reusable business rules. The API checks these even when the UI validates.
const ITEM_TYPES = [
  "Shirt",
  "T-shirt",
  "Pant",
  "Shorts",
  "Kurta",
  "Bedsheet",
  "Towel",
  "Other",
];
const COMPLAINT_TYPES = ["MISSING", "EXTRA", "WASH_QUALITY", "COLOUR_DAMAGE"];
const MAX_CLOTHES = 15;
function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
function validateItems(items) {
  if (
    !Array.isArray(items) ||
    !items.length ||
    items.length > ITEM_TYPES.length
  ) {
    fail("Select at least one clothing type.");
  }
  const seen = new Set();
  let total = 0;
  for (const item of items) {
    if (!item || !ITEM_TYPES.includes(item.type) || seen.has(item.type)) {
      fail("Invalid or duplicate clothing type.");
    }
    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_CLOTHES
    ) {
      fail("Quantities must be whole numbers from 1 to 15.");
    }
    seen.add(item.type);
    total += item.quantity;
  }
  if (total > MAX_CLOTHES) {
    fail("Maximum 15 clothes per bag. Contact staff for exceptions.");
  }
  return total;
}
function text(value, label, max = 1000) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    fail(`${label} is required (maximum ${max} characters).`);
  }
  return value.trim();
}
module.exports = {
  ITEM_TYPES,
  COMPLAINT_TYPES,
  MAX_CLOTHES,
  validateItems,
  fail,
  text,
};
