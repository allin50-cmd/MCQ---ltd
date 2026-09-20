const SUPPLIERS = [
  {
    id: "farnell",
    name: "Farnell UK",
    kind: "API + live supplier",
    homepage: "https://uk.farnell.com/",
    search_url: "https://uk.farnell.com/search?st={query}",
    api: "element14 Product Search API",
    api_status: "CONFIGURABLE",
    notes: "Official REST product search supports UK catalogue, product URLs, images, pricing and inventory when FARNELL_API_KEY is configured."
  },
  {
    id: "cpc",
    name: "CPC",
    kind: "live supplier",
    homepage: "https://cpc.farnell.com/",
    search_url: "https://cpc.farnell.com/search?st={query}",
    api_status: "LINK_ONLY",
    notes: "Business/trade supplier with audio, AV, cables, connectors and installation stock."
  },
  {
    id: "canford",
    name: "Canford Audio",
    kind: "live supplier",
    homepage: "https://www.canford.co.uk/",
    search_url: "https://www.canford.co.uk/Search?query={query}",
    api_status: "LINK_ONLY",
    notes: "Professional audio, video, broadcast, installation, cabling and accessories."
  },
  {
    id: "thomann",
    name: "Thomann UK",
    kind: "live supplier",
    homepage: "https://www.thomann.co.uk/",
    search_url: "https://www.thomann.co.uk/search_dir.html?sw={query}",
    api_status: "LINK_ONLY",
    notes: "PA, DJ, microphones, mixers, lighting, cables and installation equipment."
  },
  {
    id: "gear4music",
    name: "Gear4music",
    kind: "live supplier",
    homepage: "https://www.gear4music.com/",
    search_url: "https://www.gear4music.com/search?str_search_phrase={query}",
    api_status: "LINK_ONLY",
    notes: "UK music and professional audio supplier."
  },
  {
    id: "leisuretec",
    name: "Leisuretec",
    kind: "trade-only AV distributor",
    homepage: "https://leisuretec.co.uk/",
    search_url: "https://leisuretec.co.uk/search?q={query}",
    api_status: "TRADE_LOGIN_REQUIRED",
    notes: "UK trade-only distributor for professional/commercial audio, lighting and video. Approved trade accounts get live inventory and trade pricing; same-day despatch up to 16:00 is advertised."
  },
  {
    id: "bax",
    name: "Bax Music UK",
    kind: "retail sourcing + market benchmark",
    homepage: "https://www.bax-shop.co.uk/",
    search_url: "https://www.bax-shop.co.uk/search?q={query}",
    api_status: "LINK_ONLY",
    notes: "Large UK-facing music, DJ and pro-audio retailer used for availability, product-launch and pricing comparison."
  },
  {
    id: "westenddj",
    name: "WestendDJ",
    kind: "London DJ retail sourcing + market benchmark",
    homepage: "https://westenddj.co.uk/",
    search_url: "https://westenddj.co.uk/search?q={query}",
    api_status: "LINK_ONLY",
    notes: "London DJ specialist used for local DJ price, bundle and availability comparison."
  },
  {
    id: "djkit",
    name: "DJKIT",
    kind: "UK DJ retail sourcing + market benchmark",
    homepage: "https://www.djkit.com/",
    search_url: "https://www.djkit.com/search?query={query}",
    api_status: "LINK_ONLY",
    notes: "UK DJ specialist used for price, finance, bundle and availability comparison."
  },
];

export function listSuppliers(){ return SUPPLIERS.map(s => ({...s})); }

export function supplierSearchUrl(id, query){
  const supplier = SUPPLIERS.find(s => s.id === id);
  if(!supplier) throw new Error("supplier not found");
  return supplier.search_url.replace("{query}", encodeURIComponent(String(query || "").trim()));
}

export async function searchFarnell(query, fetchImpl = fetch){
  const q = String(query || "").trim();
  if(!q) throw new Error("q required");
  const apiKey = (process.env.FARNELL_API_KEY || "").trim();
  if(!apiKey) {
    return {
      configured: false,
      supplier: "Farnell UK",
      live_url: supplierSearchUrl("farnell", q),
      message: "FARNELL_API_KEY is not configured"
    };
  }

  const params = new URLSearchParams({
    term: `any:${q}`,
    "storeInfo.id": "uk.farnell.com",
    "resultsSettings.offset": "0",
    "resultsSettings.numberOfResults": "12",
    "resultsSettings.refinements.filters": "inStock",
    "resultsSettings.responseGroup": "medium",
    "callInfo.responseDataFormat": "JSON",
    "callInfo.apiKey": apiKey
  });
  const response = await fetchImpl(`https://api.element14.com/catalog/products?${params}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10000)
  });
  const text = await response.text();
  if(!response.ok) throw new Error(`Farnell API returned ${response.status}`);
  let payload;
  try { payload = JSON.parse(text); } catch { throw new Error("Farnell API returned invalid JSON"); }
  const root = payload.keywordSearchReturn || payload.manufacturerPartNumberSearchReturn || payload.premierFarnellPartNumberReturn || {};
  const products = Array.isArray(root.products) ? root.products : [];
  return {
    configured: true,
    supplier: "Farnell UK",
    count: products.length,
    products: products.map(p => ({
      sku: p.sku || null,
      name: p.displayName || p.productName || null,
      brand: p.brandName || p.brand || null,
      product_url: p.productURL || null,
      image_url: p.image?.mainImageURL || p.image?.thumbNailImageURL || null,
      prices: p.prices || [],
      stock: p.inv || p.inventory || null
    }))
  };
}
