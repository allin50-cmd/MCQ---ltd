import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("homepage contains no image-less commercial category cards",()=>{
  const html=read("public/index.html");
  assert.doesNotMatch(html,/ref-cat-icon/);
  assert.doesNotMatch(html,/class="ref-hard-card"/);
  const cards=[...html.matchAll(/<a class="ref-category"[\s\S]*?<\/a>/g)].map(m=>m[0]);
  assert.ok(cards.length>=6);
  for(const card of cards){
    assert.match(card,/<img\b[^>]*data-product-image="required"/);
  }
});

test("service and hire cards are image-first and fail closed",()=>{
  const home=read("public/index.html");
  for(const card of [...home.matchAll(/<a href="\/(?:hire|trade|about)" data-image-required-card>[\s\S]*?<\/a>/g)].map(m=>m[0])){
    assert.match(card,/<img\b/);
  }
  const hire=read("public/hire.html");
  assert.match(hire,/id="hire" data-image-required-card/);
  assert.match(hire,/id="install" data-image-required-card/);
  assert.match(hire,/\/image-quality\.js/);
});

test("runtime image gate removes whole commercial card when image is missing or weak",()=>{
  const js=read("public/image-quality.js");
  assert.match(js,/missing-image/);
  assert.match(js,/card\.remove\(\)/);
  assert.match(js,/naturalWidth<500/);
  assert.match(js,/ref-category/);
  assert.match(js,/ref-service-row>a/);
});
