import test from "node:test";
import assert from "node:assert/strict";
import {MARKET_CATALOG,COMPETITORS,searchMarketCatalog} from "../src/market.js";

test("market catalogue is evidence-labelled and never claims MCQ stock",()=>{
  assert.ok(MARKET_CATALOG.length>=7);
  for(const row of MARKET_CATALOG){
    assert.equal(row.evidence_state,"PUBLIC_MARKET");
    assert.equal(row.mcq_sellable,false);
    assert.equal(row.sell_status,"TRADE_TERMS_REQUIRED");
    assert.match(row.image,/^https:\/\//);
    assert.match(row.source_url,/^https:\/\//);
    assert.ok(Number(row.observed_price_gbp)>0);
    assert.match(row.checked_at,/^2026-09-20$/);
  }
  assert.ok(searchMarketCatalog("DDJ FLX4").some(x=>x.name==="DDJ-FLX4"));
});

test("competitor baseline has current watch targets and source URLs",()=>{
  const names=COMPETITORS.map(x=>x.name);
  for(const required of ["WestendDJ","DJKIT","Gear4music","Andertons","Thomann UK","Richer Sounds","Canford","Juno"]){
    assert.ok(names.includes(required),required);
  }
  for(const c of COMPETITORS){
    assert.match(c.url,/^https:\/\//);
    assert.ok(c.watch.length>=4);
    assert.equal(c.checked_at,"2026-09-20");
  }
});
