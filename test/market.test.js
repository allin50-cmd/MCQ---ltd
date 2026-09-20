import test from "node:test";
import assert from "node:assert/strict";
import {MARKET_CATALOG,COMPETITORS,searchMarketCatalog,listMarketCatalog} from "../src/market.js";

test("public-market research stays DRAFT until image rights and real commercial evidence exist",()=>{
  assert.ok(MARKET_CATALOG.length>=7);
  const evaluated=listMarketCatalog();
  for(const row of evaluated){
    assert.equal(row.evidence_state,"PUBLIC_MARKET");
    assert.equal(row.state,"DRAFT");
    assert.equal(row.public_display,false);
    assert.equal(row.sellable,false);
    if(row.image) assert.match(row.image,/^https:\/\//);
    assert.match(row.source_url,/^https:\/\//);
    assert.ok(Number(row.observed_price_gbp)>0);
    assert.match(row.checked_at,/^2026-09-20$/);
    assert.ok(row.validation.common_errors.length>0 || row.validation.sellable_errors.length>0);
  }
  assert.equal(searchMarketCatalog("DDJ FLX4").length,0);
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
