const CACHE_PREFIX = 'viwiki_city_thumb_v1:';


const NEUTRAL_FALLBACK = '/danang.jpeg';


const LOCAL_CITY_IMAGE_BY_KEY = {
  'ho chi minh': '/tphcm.jpeg',
  'ha noi': '/hanoi.jpeg',
  'da nang': '/danang.jpeg',
  'can tho': '/cantho.jpeg',
  'binh duong': '/binhduong.jpeg',
  'hai phong': '/haiphong.jpeg',
  'bac giang': '/bacgiang.jpeg',
};

const readCache = (normKey) => {
  try {
    return localStorage.getItem(CACHE_PREFIX + normKey) || null;
  } catch {
    return null;
  }
};

const writeCache = (normKey, url) => {
  try {
    localStorage.setItem(CACHE_PREFIX + normKey, url);
  } catch {
    /* quota */
  }
};

const isLikelyBadThumb = (url) => {
  if (!url) return true;
  const u = url.toLowerCase();
  return u.includes('logo') || u.includes('icon') || u.includes('commons-logo');
};

const titleCandidates = (displayTitle) => {
  const base = String(displayTitle || '').trim();
  if (!base) return [];
  const list = [
    base,
    `${base} (tỉnh)`,
    `${base} (thành phố trực thuộc trung ương)`,
    `Tỉnh ${base}`,
    `Thành phố ${base}`,
    `${base} (Việt Nam)`,
  ];
  const seen = new Set();
  return list.filter((t) => t && !seen.has(t) && seen.add(t));
};

/**
 * Lấy URL thumbnail từ vi.wikipedia (prop pageimages).
 */
async function fetchViWikiThumbnailForTitle(title) {
  const url = new URL('https://vi.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('redirects', '1');
  url.searchParams.set('prop', 'pageimages');
  url.searchParams.set('piprop', 'thumbnail');
  url.searchParams.set('pithumbsize', '900');
  url.searchParams.set('titles', title);

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined || page.invalid !== undefined) return null;
  const src = page.thumbnail?.source;
  if (isLikelyBadThumb(src)) return null;
  return src;
}

export async function resolveRegionCardImage(normKey, displayTitle) {
  const key = String(normKey || '').trim();
  const local = LOCAL_CITY_IMAGE_BY_KEY[key];
  if (local) return local;

  const cached = readCache(key);
  if (cached && !isLikelyBadThumb(cached)) return cached;

  for (const t of titleCandidates(displayTitle)) {
    try {
      const src = await fetchViWikiThumbnailForTitle(t);
      if (src) {
        writeCache(key, src);
        return src;
      }
    } catch {
      /* try next title */
    }
  }

  return NEUTRAL_FALLBACK;
}

export { LOCAL_CITY_IMAGE_BY_KEY, NEUTRAL_FALLBACK };
