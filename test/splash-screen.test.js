import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("homepage splash is unmistakably MCQ audio and uses real product imagery",()=>{
  const js=fs.readFileSync(new URL("../public/site-shell.js",import.meta.url),"utf8");
  const css=fs.readFileSync(new URL("../public/site-shell.css",import.meta.url),"utf8");
  assert.match(js,/MCQ<span>AUDIO<\/span>/);
  assert.match(js,/Technics SL-1210MK7 turntable/);
  assert.match(js,/Pioneer DJ DDJ-FLX10 controller/);
  assert.match(js,/Shure SM58 microphone/);
  assert.match(js,/PROFESSIONAL AUDIO • DJ • HI-FI/);
  assert.match(js,/PA hire, installation, vinyl and hard-to-find sourcing/);
  assert.doesNotMatch(js,/favicon\.svg/);
  assert.doesNotMatch(js,/rabbit/i);
  assert.match(js,/ENTER MCQ AUDIO/);
  assert.match(css,/\.mcq-splash-product-strip\{/);
  assert.match(css,/object-fit:contain/);
});
