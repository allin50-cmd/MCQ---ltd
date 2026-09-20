
import crypto from "node:crypto";
import { MARKET_CATALOG, COMPETITORS } from "../src/market.js";

const sleep = ms => new Promise(r => setTimeout(r, ms));
const strip = html => html
  .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
  .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&pound;/gi, "£")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/\\s+/g, " ")
  .trim();

const pounds = s => [...s.matchAll(/£\\s*([0-9][0-9,]*(?:\\.[0-9]{1,2})?)/g)]
  .map(m => Number(m[1].replace(/,/g, ""))).filter(Number.isFinite);

const hash = s => crypto.createHash("sha256").update(s).digest("hex").slice(0,16);

async function fetchPage(url){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try{
    const r = await fetch(url, {
      redirect:"follow",
      signal:controller.signal,
      headers:{
        "user-agent":"Mozilla/5.0 (compatible; MCQ-Audio-Market-Watch/1.0; evidence-only)",
        "accept":"text/html,application/xhtml+xml"
      }
    });
    const html = await r.text();
    return {ok:r.ok,status:r.status,url:r.url,text:strip(html),hash:hash(html)};
  } catch(e){
    return {ok:false,status:0,url,error:String(e.message||e),text:"",hash:""};
  } finally {
    clearTimeout(timer);
  }
}

function productEvidence(row,page){
  if(!page.ok) return {state:"SOURCE_UNAVAILABLE",detail:"HTTP "+(page.status||0),availability:"UNCONFIRMED"};
  const text = page.text;
  const idx = text.toLowerCase().indexOf(row.name.toLowerCase());
  if(idx < 0) return {state:"PRODUCT_NOT_FOUND",detail:"Product name not found on source page",availability:"UNCONFIRMED"};
  const chunk = text.slice(Math.max(0,idx-1200),Math.min(text.length,idx+2600));
  const prices = pounds(chunk);
  const expected = Number(row.observed_price_gbp);
  const exact = prices.some(p => Math.abs(p-expected) < 0.01);
  const availability = /\\bin stock\\b|add to (?:basket|cart)|available|ships immediately/i.test(chunk)
    ? "AVAILABLE"
    : /sold out|out of stock|pre-?order/i.test(chunk)
      ? "NOT_IMMEDIATE"
      : "UNCONFIRMED";
  return {
    state: exact ? "PRICE_CONFIRMED" : "PRICE_REVIEW_REQUIRED",
    detail: exact
      ? "Observed £"+expected.toFixed(2)+" still found near product"
      : "Observed £"+expected.toFixed(2)+" not confirmed; nearby prices: "+(prices.slice(0,6).map(x=>"£"+x.toFixed(2)).join(", ")||"none"),
    availability
  };
}

const productRows=[];
for(const row of MARKET_CATALOG){
  const page=await fetchPage(row.source_url);
  productRows.push({row,page,evidence:productEvidence(row,page)});
  await sleep(300);
}

const competitorRows=[];
for(const c of COMPETITORS){
  const page=await fetchPage(c.url);
  competitorRows.push({c,page});
  await sleep(300);
}

const now=new Date().toISOString();
let md="# MCQ Fortnightly Market Watch\\n\\nGenerated: "+now+"\\n\\n";
md+="## Publication rule\\n\\nThis is evidence gathering, not automatic stock truth. **No verified image + no confirmed MCQ supply/cost + no confirmed availability = do not publish as MCQ sellable inventory.** Public retailer data remains a benchmark/source opportunity only.\\n\\n";
md+="## Product-source checks\\n\\n| Product | Source | Last benchmark | Verification | Availability signal | Source |\\n|---|---|---:|---|---|---|\\n";
for(const x of productRows){
  md+="| "+x.row.brand+" "+x.row.name+" | "+x.row.supplier+" | £"+x.row.observed_price_gbp.toFixed(2)+" | "+x.evidence.state+": "+x.evidence.detail.replace(/\\|/g,"/")+" | "+x.evidence.availability+" | "+x.row.source_url+" |\\n";
}
md+="\\n## Competitor source health\\n\\n| Competitor | Segment | HTTP | Page fingerprint | Watch |\\n|---|---|---:|---|---|\\n";
for(const x of competitorRows){
  md+="| "+x.c.name+" | "+x.c.segment+" | "+(x.page.status||0)+" | "+(x.page.hash||"unavailable")+" | "+x.c.watch.join(", ")+" |\\n";
}
md+="\\n## Human review required\\n\\n";
const review=productRows.filter(x=>x.evidence.state!=="PRICE_CONFIRMED"||x.evidence.availability==="NOT_IMMEDIATE");
if(review.length){
  for(const x of review) md+="- Review "+x.row.brand+" "+x.row.name+": "+x.evidence.state+"; "+x.evidence.availability+".\\n";
}else{
  md+="- All tracked public benchmark prices were found on their source pages. This still does **not** prove MCQ trade cost or MCQ stock.\\n";
}
md+="- Compare promotions, bundles, finance, delivery promises, loyalty, B-stock/clearance and editorial changes before making MCQ commercial changes.\\n";
md+="- Obtain/refresh supplier-confirmed MCQ net cost before converting any benchmark row into a live checkout item.\\n";
process.stdout.write(md);
