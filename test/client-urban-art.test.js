import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("client-supplied founding Urban art is embedded and visible on the real gallery page",()=>{
  const chunks=[];
  for(let i=0;i<6;i++){
    const src=fs.readFileSync(new URL("../public/assets/urban/client-art-part-"+i+".js",import.meta.url),"utf8");
    const m=src.match(/\+"([^"]+)"\s*;\s*$/);
    assert.ok(m,"missing client art chunk "+i);
    chunks.push(m[1]);
  }
  const bytes=Buffer.from(chunks.join(""),"base64");
  assert.ok(bytes.length>20000,"founding art asset is unexpectedly small");
  assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF");
  assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP");

  const html=fs.readFileSync(new URL("../public/urban-gallery.html",import.meta.url),"utf8");
  assert.match(html,/Founding Gallery/i);
  assert.match(html,/CLIENT-SUPPLIED/i);
  assert.match(html,/founding-art-grid/);
  for(let i=0;i<6;i++)assert.match(html,new RegExp("client-art-part-"+i+"\\.js"));
  assert.match(html,/client-art\.js/);

  const renderer=fs.readFileSync(new URL("../public/assets/urban/client-art.js",import.meta.url),"utf8");
  for(const name of ["IMG_5851","IMG_5852","IMG_5853","IMG_5855","IMG_5857","IMG_5858","IMG_5860","IMG_5861"])assert.match(renderer,new RegExp(name));
});
