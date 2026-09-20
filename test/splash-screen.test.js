import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("homepage splash uses supplied MCQ artwork with live hotspot navigation",()=>{
  const js=fs.readFileSync(new URL("../public/site-shell.js",import.meta.url),"utf8");
  const css=fs.readFileSync(new URL("../public/site-shell.css",import.meta.url),"utf8");
  assert.match(js,/\/mcq-splash-production\.jpg/);
  assert.match(js,/ENTER MCQ AUDIO/);
  for(const href of ["/","/shop","/dj","/featured","/hire","/vinyl","/club","/urban","/about"]){
    assert.match(js,new RegExp('href="'+href.replace("/","\\/")+'"'));
  }
  for(const cls of ["hs-logo","hs-shopall","hs-djgear","hs-studio","hs-live","hs-vinyl","hs-accessories"]){
    assert.match(js,new RegExp(cls));
  }
  assert.doesNotMatch(css,/unsplash\.com/);
  assert.match(css,/url\("\/mcq-splash-production\.jpg"\)/);
  assert.match(css,/\.mcq-hotspot:focus-visible/);
});
