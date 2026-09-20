const BASE=(process.env.MCQ_BASE_URL||"https://mcq-audio.onrender.com").replace(/\/$/,"");

function assert(cond,msg){if(!cond)throw new Error(msg)}
async function get(path,opts={}){
  const r=await fetch(BASE+path,{redirect:"follow",...opts});
  const body=await r.arrayBuffer();
  return {r,buf:Buffer.from(body),text:Buffer.from(body).toString("utf8")};
}
function pngSize(buf){
  if(buf.length<24||buf.readUInt32BE(0)!==0x89504e47)return null;
  return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
}
function jpegSize(buf){
  if(buf.length<4||buf[0]!==0xff||buf[1]!==0xd8)return null;
  let i=2;
  while(i+9<buf.length){
    if(buf[i]!==0xff){i++;continue}
    const marker=buf[i+1]; i+=2;
    if(marker===0xd8||marker===0xd9)continue;
    if(i+2>buf.length)break;
    const len=buf.readUInt16BE(i);
    if(len<2||i+len>buf.length)break;
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
      return {height:buf.readUInt16BE(i+3),width:buf.readUInt16BE(i+5)};
    }
    i+=len;
  }
  return null;
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

  const shop=await get("/shop");
  assert(shop.r.status===200,`/shop status ${shop.r.status}`);
  assert(shop.text.includes("STAR REGULAR PRODUCTS"),"shop missing Star Regular Products heading");
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
  const featureImageFailures=[];
  for(const url of [...new Set(featureImages)]){
    try{
      const r=await fetch(url,{redirect:"follow",headers:{"user-agent":"MCQ-Audio-production-smoke/1.0"}});
      assert(r.ok,`HTTP ${r.status}`);
      const type=(r.headers.get("content-type")||"").toLowerCase();
      assert(type.startsWith("image/"),`non-image content-type ${type}`);
      const buf=Buffer.from(await r.arrayBuffer());
      assert(buf.length>=5000,`payload too small (${buf.length})`);
    }catch(e){featureImageFailures.push({url,error:e.message})}
  }
  if(featureImageFailures.length){
    console.error(JSON.stringify({feature_image_failures:featureImageFailures},null,2));
    throw new Error(`${featureImageFailures.length} DJ feature image(s) failed production checks`);
  }

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

  const unique=[...new Set(items.map(x=>x.image).filter(Boolean))];
  const imageFailures=[];
  for(const url of unique){
    try{
      const r=await fetch(url,{redirect:"follow",headers:{"user-agent":"MCQ-Audio-production-smoke/1.0"}});
      assert(r.ok,`HTTP ${r.status}`);
      const type=(r.headers.get("content-type")||"").toLowerCase();
      assert(type.startsWith("image/"),`non-image content-type ${type}`);
      const buf=Buffer.from(await r.arrayBuffer());
      assert(buf.length>=5000,`payload too small (${buf.length})`);
      const size=pngSize(buf)||jpegSize(buf);
      assert(size,"unsupported/unreadable PNG/JPEG image");
      assert(size.width>=500&&size.height>=300,`below site threshold ${size.width}x${size.height}`);
    }catch(e){imageFailures.push({url,error:e.message})}
  }
  if(imageFailures.length){
    console.error(JSON.stringify({image_failures:imageFailures},null,2));
    throw new Error(`${imageFailures.length} product image(s) failed production quality checks`);
  }

  console.log(JSON.stringify({ok:true,base:BASE,products:items.length,unique_images:unique.length},null,2));
},{attempts:Number(process.env.MCQ_SMOKE_ATTEMPTS||18),delayMs:Number(process.env.MCQ_SMOKE_DELAY_MS||5000)});
