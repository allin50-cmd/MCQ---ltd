import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("homepage entrance splash is branded, dismissible and shown on fresh site entry",()=>{
  const js=fs.readFileSync(new URL("../public/site-shell.js",import.meta.url),"utf8");
  const css=fs.readFileSync(new URL("../public/site-shell.css",import.meta.url),"utf8");
  assert.match(js,/canonical!=="\/"/);
  assert.match(js,/sessionStorage\.getItem\("mcq-splash-seen"\)/);
  assert.match(js,/55 YEARS OF REAL SOUND/);
  assert.match(js,/ENTER MCQ/);
  assert.match(js,/setTimeout\(closeSplash,2600\)/);
  assert.match(css,/\.mcq-splash\{/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
