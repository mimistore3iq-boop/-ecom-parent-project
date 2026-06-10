/** In-memory cache so Home remounts instantly when returning from product detail */
let homeDataCache = null;

export function getCachedHomeData() {
  return homeDataCache;
}

export function setCachedHomeData(products, categories) {
  homeDataCache = {
    products: products || [],
    categories: categories || [],
    cachedAt: Date.now(),
  };
}

export function clearHomeCache() {
  homeDataCache = null;
}
