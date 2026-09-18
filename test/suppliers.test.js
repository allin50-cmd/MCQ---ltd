import test from "node:test";
import assert from "node:assert/strict";
import { supplierSearchUrl, searchFarnell } from "../src/suppliers.js";

test("supplier search links safely encode user queries",()=>{
  assert.equal(
    supplierSearchUrl("farnell","XLR cable 10m"),
    "https://uk.farnell.com/search?st=XLR%20cable%2010m"
  );
});

test("Farnell adapter maps official API product data without exposing key",async()=>{
  const previous=process.env.FARNELL_API_KEY;
  process.env.FARNELL_API_KEY="test-key";
  try{
    let called="";
    const result=await searchFarnell("xlr",async url=>{
      called=String(url);
      return {
        ok:true,
        status:200,
        async text(){return JSON.stringify({keywordSearchReturn:{products:[{
          sku:"123",
          displayName:"XLR connector",
          brandName:"Example",
          productURL:"https://uk.farnell.com/item",
          image:{mainImageURL:"https://uk.farnell.com/image.jpg"}
        }]}})}
      };
    });
    assert.equal(result.configured,true);
    assert.equal(result.products[0].sku,"123");
    assert.match(called,/api\.element14\.com\/catalog\/products/);
    assert.match(called,/storeInfo\.id=uk\.farnell\.com/);
    assert.match(called,/callInfo\.apiKey=test-key/);
  }finally{
    if(previous===undefined)delete process.env.FARNELL_API_KEY;
    else process.env.FARNELL_API_KEY=previous;
  }
});