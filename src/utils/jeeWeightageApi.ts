import * as d3 from 'd3';

export interface WeightageDataPoint {
  year: number;
  main: number;
  advanced: number;
}

const CACHE_PREFIX = 'jee_weightage_v1_';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

interface CacheEntry {
  timestamp: number;
  data: WeightageDataPoint[];
}

// Simulates an API call to a backend fetching real historical data
const fetchFromNetwork = async (title: string): Promise<WeightageDataPoint[]> => {
  // Simulate network latency (e.g. 500ms - 1000ms)
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  const years = d3.range(2014, 2027);
  // Base weightage logic (using string length for deterministic pseudo-random baseline)
  const baseWeightMain = (title.length % 5) + 3; // 3 to 7
  const baseWeightAdv = (title.length % 6) + 4;  // 4 to 9
  
  const data: WeightageDataPoint[] = [];
  years.forEach(y => {
    const noiseM = (Math.random() - 0.5) * 3;
    const noiseA = (Math.random() - 0.5) * 4;
    data.push({
      year: y,
      main: Math.max(1, Math.min(12, Math.round((baseWeightMain + noiseM) * 10) / 10)),
      advanced: Math.max(1, Math.min(15, Math.round((baseWeightAdv + noiseA) * 10) / 10)),
    });
  });
  return data;
};

export const fetchWeightageData = async (conceptTitle: string): Promise<WeightageDataPoint[]> => {
  try {
    const cacheKey = `${CACHE_PREFIX}${conceptTitle.replace(/\s+/g, '_').toLowerCase()}`;
    const cachedItem = localStorage.getItem(cacheKey);
    
    if (cachedItem) {
      const parsedCache: CacheEntry = JSON.parse(cachedItem);
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_TTL_MS;
      
      if (!isExpired) {
        console.log(`[JEE Analytics] Cache Hit for '${conceptTitle}'`);
        return parsedCache.data;
      } else {
        console.log(`[JEE Analytics] Cache Expired for '${conceptTitle}'`);
      }
    }

    console.log(`[JEE Analytics] Cache Miss. Fetching data for '${conceptTitle}'...`);
    const data = await fetchFromNetwork(conceptTitle);
    
    // Save to cache
    const newCacheEntry: CacheEntry = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem(cacheKey, JSON.stringify(newCacheEntry));
    
    return data;
  } catch (error) {
    console.warn("Error interacting with localStorage for JEE weightage data:", error);
    // Fallback to direct network fetch if cache access fails (e.g., Private browsing)
    return fetchFromNetwork(conceptTitle);
  }
};
