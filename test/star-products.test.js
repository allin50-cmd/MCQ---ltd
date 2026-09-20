import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {listMarketCatalog} from "../src/market.js";

test("star regular product catalogue contains all 50 researched rows",()=>{
  const items=listMarketCatalog();
  assert.equal(items.length,50);
  for(const item of items){
    assert.ok(item.id);
    assert.ok(item.brand);
    assert.ok(item.name);
    assert.ok(item.image&&item.image.startsWith("https://"));
    assert.ok(Number.isFinite(Number(item.observed_public_price_inc_vat_gbp)));
    assert.ok(item.source_url&&item.source_url.startsWith("https://"));
    assert.equal(item.mcq_sellable,false);
    assert.equal(item.requested_state,"DRAFT");
    assert.equal(item.real_cost_price_ex_vat_gbp,null);
    assert.equal(item.mcq_retail_price_inc_vat_gbp,null);
  }
});

test("shop surfaces Star Regular Products and real enquiry workflow",()=>{
  const html=fs.readFileSync(new URL("../public/shop.html",import.meta.url),"utf8");
  const js=fs.readFileSync(new URL("../public/shop-products.js",import.meta.url),"utf8");
  assert.match(html,/STAR REGULAR PRODUCTS/);
  assert.match(html,/id="regular-products-grid"/);
  assert.match(html,/shop-products\.js/);
  assert.match(js,/\/api\/market\/catalog/);
  assert.match(js,/\/api\/leads/);
  assert.match(js,/MCQ selling price, availability and delivery/);
  assert.doesNotMatch(js,/dummy stock|fake stock/i);
});
