import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("homepage splash is an editorial MCQ entrance with live category links",()=>{
  const js=fs.readFileSync(new URL("../public/site-shell.js",import.meta.url),"utf8");
  const css=fs.readFileSync(new URL("../public/site-shell.css",import.meta.url),"utf8");
  assert.match(js,/GEAR <em>FUELS<\/em> CULTURE/);
  assert.match(js,/Professional Sound/);
  assert.match(js,/55 YEARS OF REAL SOUND/);
  assert.match(js,/SHOP ALL GEAR/);
  for(const href of ["/shop","/dj","/featured","/hire","/vinyl","/swap"]){
    assert.match(js,new RegExp('href="'+href.replace("/","\\/")+'"'));
  }
  assert.match(js,/mcq-splash-skip/);
  assert.doesNotMatch(js,/rabbit/i);
  assert.match(css,/\.mcq-splash-bg\{/);
  assert.match(css,/photo-1516280440614-37939bbacd81/);
  assert.match(css,/\.mcq-splash-links a:hover/);
});
