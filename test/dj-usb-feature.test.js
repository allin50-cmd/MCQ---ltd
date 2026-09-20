import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("DJ laptop vs USB feature is surfaced and complete",()=>{
  const article=fs.readFileSync(new URL("../public/djs-ditching-laptops.html",import.meta.url),"utf8");
  const home=fs.readFileSync(new URL("../public/index.html",import.meta.url),"utf8");
  const magazine=fs.readFileSync(new URL("../public/magazine.html",import.meta.url),"utf8");
  const shop=fs.readFileSync(new URL("../public/shop.html",import.meta.url),"utf8");
  const server=fs.readFileSync(new URL("../src/server.js",import.meta.url),"utf8");

  assert.match(server,/\/insights\/djs-ditching-laptops/);
  assert.match(home,/DJ WORKFLOW: LAPTOP OR USB\?/);
  assert.match(magazine,/Why DJs are moving from laptops to USB sticks/);
  assert.match(shop,/Laptop or USB sticks\?/);

  assert.match(article,/MacBook Air 13-inch M4 — 16GB \/ 512GB/);
  assert.match(article,/SanDisk Extreme PRO USB-A — 256GB/);
  assert.match(article,/Samsung BAR Plus — 128GB or 256GB/);
  assert.match(article,/FAT16, FAT32, exFAT and HFS\+/);
  assert.match(article,/NTFS is not supported/);
  assert.match(article,/Carry two independently exported USB drives/);
  assert.match(article,/Ask MCQ to source/);
  assert.doesNotMatch(article,/demo data|fake stock|invented price/i);
});
