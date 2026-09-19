import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("homepage follows the approved dense black MCQ reference structure",()=>{
  const html=read("public/index.html");
  assert.match(html,/reference-style\.css\?v=[a-z0-9-]+/);
  assert.doesNotMatch(html,/rebuild\.css/);
  for(const text of ["SHOP BY CATEGORY","SPECIALIST SOURCING","URBAN UNDERGROUND","THE PEOPLE'S ART","FEATURED GEAR","FEATURED BRANDS","HIRE & INSTALL"]){
    assert.ok(html.includes(text),text);
  }
  assert.match(html,/URBAN UNDERGROUND <em>LIVE<\/em>/);
  for(let i=0;i<6;i++)assert.match(html,new RegExp("client-art-part-"+i+"\\.js"));
  assert.match(html,/id="home-urban-art"/);
  assert.match(html,/id="hero-client-art"/);
});

test("reference stylesheet encodes the approved visual contract",()=>{
  const css=read("public/reference-style.css");
  assert.match(css,/--mcq-bg:#05080a/);
  assert.match(css,/grid-template-columns:repeat\(4,1fr\)/);
  assert.match(css,/Impact/);
  assert.match(css,/--mcq-gold:#e5ad30/);
  assert.match(css,/ref-culture-strip/);
  assert.match(css,/home-art-card/);
  assert.match(css,/\.ref-brand-panel\{min-width:0/);
  assert.match(css,/@media\(max-width:1450px\)/);
});

test("Urban Underground uses the same graffiti-club visual language",()=>{
  const html=read("public/music.html");
  const css=read("public/reference-urban.css");
  assert.match(html,/reference-urban\.css/);
  assert.match(html,/URBAN<br><span>UNDERGROUND<\/span>/);
  assert.match(html,/client-art-part-0\.js/);
  assert.match(css,/text-shadow:5px 5px 0 #18d2e2/);
  assert.match(css,/Comic Sans MS/);
});

test("live catalogue no longer contains known dead product image URLs",()=>{
  const cat=read("src/catalog.js");
  assert.doesNotMatch(cat,/www\.technics\.com\/content\/dam\/pim/);
  assert.doesNotMatch(cat,/ULT_FIELD_1_Black_Gallery_01/);
  assert.match(cat,/panasonic\.scene7\.com/);
});
