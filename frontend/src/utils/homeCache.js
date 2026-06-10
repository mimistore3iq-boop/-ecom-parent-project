/** In-memory cache so Home remounts instantly when returning from product detail */
let homeDataCache = null;

export function getCachedHomeData() {
  return homeDataCache;
}

export function setCachedHomeData(products, categories) {
  const prev = homeDataCache;
  homeDataCache = {
    products: products?.length ? products : (prev?.products || []),
    categories: categories?.length ? categories : (prev?.categories || []),
    cachedAt: Date.now(),
  };
}

export function clearHomeCache() {
  homeDataCache = null;
}
