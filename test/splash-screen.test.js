import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("homepage entrance splash is branded, dismissible and shown on fresh site entry",()=>{
  const js=fs.readFileSync(new URL("../public/site-shell.js",import.meta.url),"utf8");
  const css=fs.readFileSync(new URL("../public/site-shell.css",import.meta.url),"utf8");
  assert.match(js,/canonical!=="\/"/);
  assert.match(js,/document\.referrer/);
  assert.match(js,/new URL\(document\.referrer\)\.origin===location\.origin/);
  assert.match(js,/55 YEARS OF REAL SOUND/);
  assert.match(js,/PROFESSIONAL AUDIO • DJ • HI-FI/);
  assert.match(js,/Shop audio equipment, DJ gear, microphones, speakers and specialist parts/);
  assert.match(js,/PA hire, installation, vinyl and hard-to-find sourcing/);
  assert.match(js,/\/favicon\.svg/);
  assert.match(js,/ENTER MCQ AUDIO/);
  assert.match(js,/setTimeout\(closeSplash,4200\)/);
  assert.match(css,/\.mcq-splash\{/);
  assert.match(css,/\.mcq-splash-logo\{/);
  assert.match(css,/\.mcq-splash-tags\{/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
