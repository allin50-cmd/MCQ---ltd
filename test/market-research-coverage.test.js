import test from "node:test";
import assert from "node:assert/strict";
import {listSuppliers} from "../src/suppliers.js";
import {listCompetitors} from "../src/market.js";

test("supplier and competitor research coverage expanded",()=>{
  const suppliers=listSuppliers();
  const competitors=listCompetitors();
  assert.ok(suppliers.length>=9,`expected at least 9 suppliers/sourcing sources, got ${suppliers.length}`);
  assert.ok(competitors.length>=11,`expected at least 11 competitor/channel benchmarks, got ${competitors.length}`);
  assert.ok(suppliers.some(x=>x.name==="Leisuretec"));
  assert.ok(suppliers.some(x=>x.name==="Bax Music UK"));
  assert.ok(competitors.some(x=>x.name==="Bax Music"));
  assert.ok(competitors.some(x=>x.name==="CPC / Farnell"));
  assert.ok(competitors.some(x=>x.name==="Leisuretec"));
});
