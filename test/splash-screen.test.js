import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("homepage splash uses supplied high-quality MCQ artwork with invisible live hotspots",()=>{
  const js=fs.readFileSync(new URL("../public/site-shell.js",import.meta.url),"utf8");
  const css=fs.readFileSync(new URL("../public/site-shell.css",import.meta.url),"utf8");
  assert.match(js,/\/mcq-splash-production\.webp/);
  assert.doesNotMatch(js,/mcq-splash-production\.jpg/);
  assert.match(js,/ENTER MCQ AUDIO/);
  for(const href of ["/","/shop","/dj","/featured","/hire","/vinyl","/club","/urban","/about"]){
    assert.match(js,new RegExp('href="'+href.replace("/","\\/")+'"'));
  }
  for(const cls of ["hs-logo","hs-shopall","hs-djnav","hs-studionav","hs-livenav","hs-vinylnav","hs-accessoriesnav","hs-brands","hs-deals","hs-search","hs-account","hs-cart","hs-culture","hs-about","hs-musiclives","hs-turntables","hs-djgear","hs-studio","hs-live","hs-vinyl","hs-accessories"]){
    assert.match(js,new RegExp(cls));
  }
  assert.doesNotMatch(js,/mcq-splash-skip/);
  assert.doesNotMatch(css,/unsplash\.com/);
  assert.match(css,/aspect-ratio:1122\/1402/);
  assert.match(css,/\.mcq-hotspot:focus-visible/);
});
