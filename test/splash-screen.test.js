import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("homepage splash is simple, branded and dependency-free",()=>{
  const js=fs.readFileSync(new URL("../public/site-shell.js",import.meta.url),"utf8");
  const css=fs.readFileSync(new URL("../public/site-shell.css",import.meta.url),"utf8");
  assert.match(js,/MCQ<\/strong><span>AUDIO<\/span>/);
  assert.match(js,/55 YEARS OF REAL SOUND/);
  assert.match(js,/PROFESSIONAL AUDIO • DJ • HI-FI/);
  assert.match(js,/Audio equipment, DJ gear, microphones, speakers, specialist parts, PA hire and installation/);
  assert.match(js,/SHOP AUDIO/);
  assert.match(js,/VINYL & SPECIALIST SOURCING/);
  assert.match(js,/ENTER MCQ AUDIO/);
  assert.doesNotMatch(js,/https?:\/\//);
  assert.doesNotMatch(js,/rabbit/i);
  assert.doesNotMatch(js,/setTimeout\(closeSplash/);
  assert.match(css,/\.mcq-splash-wordmark\{/);
  assert.match(css,/\.mcq-splash-services\{/);
});
