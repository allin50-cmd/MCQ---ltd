const BASE=(process.env.MCQ_BASE_URL||"https://mcq-audio.onrender.com").replace(/\/$/,"");
const EXPECTED_COMMIT=String(process.env.MCQ_EXPECTED_COMMIT||"").trim();

function assert(cond,msg){if(!cond)throw new Error(msg)}
async function get(path,opts={}){
  const r=await fetch(BASE+path,{redirect:"follow",signal:AbortSignal.timeout(12000),...opts});
  const body=await r.arrayBuffer();
  return {r,buf:Buffer.from(body),text:Buffer.from(body).toString("utf8")};
}
async function retry(fn,{attempts=18,delayMs=5000}={}){
  let last;
  for(let i=1;i<=attempts;i++){
    try{return await fn(i)}catch(e){last=e;console.log(`attempt ${i}/${attempts}: ${e.message}`);if(i<attempts)await new Promise(r=>setTimeout(r,delayMs))}
  }
  throw last;
}

await retry(async()=>{
  const h=await get("/health");
  assert(h.r.status===200,`/health status ${h.r.status}`);
  const j=JSON.parse(h.text); assert(j.ok===true,"health ok!=true");
  if(EXPECTED_COMMIT) assert(j.commit===EXPECTED_COMMIT,`production commit ${j.commit||"missing"} != expected ${EXPECTED_COMMIT}`);
  assert(j.durable_state_configured===true,"durable MCQ state is not configured in production");
  assert(j.quote_delivery_configured===true,"SendGrid quote delivery is not configured in production");
  assert(j.verified_payment_configured===true,"Stripe verified payment is not configured in production");


  const home=await get("/");
  assert(home.r.status===200,`/ status ${home.r.status}`);
  assert(home.text.includes('/site-shell.css'),"homepage missing production shell stylesheet");
  assert(home.text.includes('/site-shell.js'),"homepage missing production shell script");

  const shellJs=await get("/site-shell.js");
  assert(shellJs.r.status===200,`/site-shell.js status ${shellJs.r.status}`);
  assert(shellJs.text.includes("/mcq-splash-production.jpg"),"splash missing supplied production artwork");
  assert(shellJs.text.includes("ENTER MCQ AUDIO"),"splash missing corrected MCQ entry CTA");
  assert(shellJs.text.includes("hs-turntables")&&shellJs.text.includes("hs-djgear")&&shellJs.text.includes("hs-studio")&&shellJs.text.includes("hs-live")&&shellJs.text.includes("hs-vinyl")&&shellJs.text.includes("hs-accessories"),"splash category hotspots missing");
  assert(shellJs.text.includes('href="/urban"')&&shellJs.text.includes('href="/about"'),"splash supporting hotspots missing");
  assert(shellJs.text.includes("ENTER MCQ AUDIO"),"splash missing explicit entry action");
  assert(!/rabbit/i.test(shellJs.text),"irrelevant rabbit artwork found in production splash");
  assert(!shellJs.text.includes("setTimeout(closeSplash"),"production splash still auto-dismisses");

  const splashAsset=await get("/mcq-splash-production.jpg");
  assert(splashAsset.r.status===200,`/mcq-splash-production.jpg status ${splashAsset.r.status}`);
  assert((splashAsset.r.headers.get("content-type")||"").includes("image/jpeg"),"splash asset is not JPEG");
  assert(splashAsset.buf.length>400000,`splash asset unexpectedly small (${splashAsset.buf.length})`);
  const splashHash=(await import("node:crypto")).createHash("sha256").update(splashAsset.buf).digest("hex");
  assert(splashHash==="67015e59de1c121c62ce6a1521926062f7395655678332ca571fed7ae017fe67",`splash asset drifted: ${splashHash}`);
  for(const route of ["/shop","/dj","/featured","/hire","/vinyl","/club","/urban","/about"]){
    const page=await get(route);
    assert(page.r.status===200,`splash destination ${route} status ${page.r.status}`);
  }

  const shellCss=await get("/site-shell.css");
  assert(!shellCss.text.includes("unsplash.com"),"production splash still depends on substitute stock imagery");
  assert(shellCss.r.status===200,`/site-shell.css status ${shellCss.r.status}`);
  assert(shellCss.text.includes(".mcq-splash-artboard"),"splash artwork styling missing");
  assert(shellCss.text.includes(".mcq-hotspot"),"splash hotspot styling missing");
  assert(!shellCss.text.includes(".mcq-splash-backdrop"),"decorative substitute splash backdrop still present");
  assert(!shellCss.text.includes(".mcq-splash-skip"),"extra splash skip UI still present");
  assert(shellCss.text.includes("aspect-ratio:1122/1402"),"splash artwork aspect ratio drifted");

  const crmPage=await get("/crm");
  assert(crmPage.r.status===200,`/crm status ${crmPage.r.status}`);
  assert(crmPage.text.includes("CUSTOMER CONTROL"),"CRM operator surface missing");
  assert(crmPage.text.includes("/api/admin/crm/detail"),"CRM detail wiring missing");
  assert(crmPage.text.includes("/api/admin/crm/update"),"CRM update wiring missing");
  const unauthCrm=await get("/api/admin/crm");
  assert(unauthCrm.r.status===401,`unauthenticated CRM should be 401, got ${unauthCrm.r.status}`);

  const swap=await get("/swap");
  assert(swap.r.status===200,`/swap status ${swap.r.status}`);
  for(const required of ["Technics","M1","M6","RTX 3090","network"]){
    assert(swap.text.toLowerCase().includes(required.toLowerCase()),`swap page missing ${required}`);
  }

  const shop=await get("/shop");
  assert(shop.r.status===200,`/shop status ${shop.r.status}`);
  assert(shop.text.includes("MCQ 100 PRODUCT RESEARCH CATALOGUE"),"shop missing 100-product research catalogue heading");
  assert(shop.text.includes('id="regular-products-grid"'),"shop missing regular-products-grid");
  assert(shop.text.includes("/shop-products.js"),"shop missing product loader");
  assert(shop.text.includes("ALL 100 RESEARCHED PRODUCTS"),"shop missing full 100-product catalogue section");
  assert(shop.text.includes('id="catalogue-table-body"'),"shop missing catalogue table");

  const feature=await get("/insights/djs-ditching-laptops");
  assert(feature.r.status===200,`feature status ${feature.r.status}`);
  assert(feature.text.includes("Laptop or<br>USB sticks?"),"feature hero missing");
  assert(feature.text.includes("MacBook Air 13-inch M4 — 16GB / 512GB"),"feature laptop recommendation missing");
  assert(feature.text.includes("SanDisk Extreme PRO USB-A — 256GB"),"feature SanDisk recommendation missing");
  assert(feature.text.includes("Samsung BAR Plus — 128GB or 256GB"),"feature Samsung recommendation missing");
  assert(feature.text.includes("Carry two independently exported USB drives"),"feature backup guidance missing");

  const featureImages=[...feature.text.matchAll(/<img[^>]+src="(https:[^"]+)"/g)].map(m=>m[1]);
  assert(featureImages.length>=4,`expected at least 4 feature images, got ${featureImages.length}`);
  assert(new Set(featureImages).size>=4,"feature images must be distinct");

  const cat=await get("/api/market/catalog");
  assert(cat.r.status===200,`catalog status ${cat.r.status}`);
  const data=JSON.parse(cat.text); const items=data.items||[];
  assert(items.length===100,`expected 100 catalogue rows, got ${items.length}`);
  for(const p of items){
    assert(p.id&&p.brand&&p.name,`identity missing for ${p.id||"unknown"}`);
    if(p.image) assert(/^https:\/\//.test(p.image),`invalid image for ${p.id}`);
    assert(/^https:\/\//.test(p.source_url||""),`source_url missing for ${p.id}`);
    assert(Number.isFinite(Number(p.observed_public_price_inc_vat_gbp??p.observed_price_gbp)),`public reference price missing for ${p.id}`);
    assert(p.mcq_sellable===false,`unverified row incorrectly sellable: ${p.id}`);
    assert(p.real_cost_price_ex_vat_gbp==null,`invented MCQ cost present: ${p.id}`);
    assert(p.mcq_retail_price_inc_vat_gbp==null,`invented MCQ retail price present: ${p.id}`);
  }

  const uniqueImages=[...new Set(items.map(x=>x.image).filter(Boolean))];
  assert(uniqueImages.length>=50,`expected at least 50 unique product images, got ${uniqueImages.length}`);
  console.log(JSON.stringify({ok:true,base:BASE,products:items.length,unique_images:uniqueImages.length},null,2));
},{attempts:Number(process.env.MCQ_SMOKE_ATTEMPTS||18),delayMs:Number(process.env.MCQ_SMOKE_DELAY_MS||5000)});
