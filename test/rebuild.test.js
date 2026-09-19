import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("MCQ rebuild keeps client-requested Urban Gallery",()=>{
  const server=read("src/server.js");
  const home=read("public/index.html");
  assert.match(server,/\/urban-gallery/);
  assert.match(home,/href="\/urban-gallery"/);
  assert.ok(fs.existsSync(new URL("../public/urban-gallery.html",import.meta.url)));
});

test("product image trust gate is loaded on commerce surfaces",()=>{
  for(const file of ["public/index.html","public/shop.html","public/featured.html","public/headphones.html","public/microphones.html","public/wireless.html","public/dj.html"]){
    assert.match(read(file),/image-quality\.js/,file);
  }
  const gate=read("public/image-quality.js");
  assert.match(gate,/naturalWidth<500/);
  assert.match(gate,/load-error/);
});

test("homepage uses collection selectors and image-verified supplier search",()=>{
  const app=read("public/app.js");
  assert.match(app,/\$\$\("\.product-detail"\)\.forEach/);
  assert.match(app,/\$\$\("\.brand-tile"\)\.forEach/);
  assert.match(app,/async function runSupplierSearch/);
  assert.match(app,/filter\(p=>p\.image/);
});

test("branded homepage product cards use explicit image-required gate",()=>{
  const home=read("public/index.html");
  const matches=home.match(/data-product-image="required"/g)||[];
  assert.ok(matches.length>=6);
});
