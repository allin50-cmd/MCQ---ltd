import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

test("website backend protects admin writes and accepts public hire enquiries", async (t)=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"mcq-"));
  process.env.NODE_ENV="test";
  process.env.MCQ_DATA_FILE=path.join(dir,"mcq.json");
  process.env.MCQ_ADMIN_TOKEN="test-admin";
  const {default:server}=await import(`../src/server.js?test=${Date.now()}`);
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;

  const home=await fetch(base+"/");
  assert.equal(home.status,200);
  assert.match(await home.text(),/MCQ Audio — Hi‑Fi Magazine/);

  for (const route of ["/microphones","/headphones","/wireless","/dj"]) {
    const page=await fetch(base+route);
    assert.equal(page.status,200);
    assert.equal(page.headers.get("x-content-type-options"),"nosniff");
    assert.match(page.headers.get("content-security-policy")||"",/default-src 'self'/);
    const html=await page.text();
    assert.match(html,/MCQ Audio/);
    assert.match(html,/CHEAP → PREMIUM/);
    assert.match(html,/site\.webmanifest/);
    assert.match(html,/Skip to content/);
  }

  const musicPage=await fetch(base+"/music");
  assert.equal(musicPage.status,200);
  assert.equal(musicPage.headers.get("x-content-type-options"),"nosniff");
  const musicHtml=await musicPage.text();
  assert.match(musicHtml,/VINYL UNDERGROUND/);
  assert.match(musicHtml,/URBAN SWAP SHOP/);
  assert.match(musicHtml,/MP3 \/ DIGITAL/);
  assert.match(musicHtml,/site\.webmanifest/);
  assert.match(musicHtml,/Skip to content/);

  for (const route of ["/","/microphones","/headphones","/wireless","/dj","/music"]) {
    const page=await fetch(base+route);
    const html=await page.text();
    assert.doesNotMatch(html,/href=["']https?:\/\//i);
    assert.doesNotMatch(html,/target=["']_blank["']/i);
  }

  const suppliers=await fetch(base+"/api/suppliers");
  assert.equal(suppliers.status,200);
  const supplierList=await suppliers.json();
  assert.ok(supplierList.length>0);
  assert.equal("homepage" in supplierList[0],false);
  assert.equal("search_url" in supplierList[0],false);

  const catalog=await fetch(base+"/api/catalog/search?q=Sony%20WH-1000XM6");
  assert.equal(catalog.status,200);
  const catalogBody=await catalog.json();
  assert.ok(catalogBody.results.length>0);
  assert.equal("product_url" in catalogBody.results[0],false);

  const musicImport=await fetch(base+"/api/music/catalog/import",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer test-admin"},body:JSON.stringify({items:[{
    id:"vu-test-001",
    artist:"Test Artist",
    title:"Test Garage Cut",
    label:"Vinyl Underground",
    catalogue_no:"VU001",
    genre:"UK Garage",
    format:"vinyl",
    release_type:"exclusive",
    price_pence:1299,
    stock:10,
    status:"LIVE"
  }]})});
  assert.equal(musicImport.status,200);
  const imported=await musicImport.json();
  assert.equal(imported.imported,1);

  const musicCatalog=await fetch(base+"/api/music/catalog?q=Garage&format=vinyl&type=exclusive");
  assert.equal(musicCatalog.status,200);
  const musicBody=await musicCatalog.json();
  assert.equal(musicBody.count,1);
  assert.equal(musicBody.items[0].catalogue_no,"VU001");

  const musicOrder=await fetch(base+"/api/music/order-interest",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    item_id:"vu-test-001",name:"Garage Buyer",contact:"buyer@example.com",quantity:2
  })});
  assert.equal(musicOrder.status,201);

  const dropSignup=await fetch(base+"/api/music/drop-signup",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    name:"DJ Test",contact:"dj@example.com",interests:["pre-release","reissues"]
  })});
  assert.equal(dropSignup.status,201);

  const swap=await fetch(base+"/api/swap/offer",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    name:"Seller",contact:"seller@example.com",item_type:"Collection / job lot",description:"40 UK Garage 12-inch records",quantity:40,condition:"Very good"
  })});
  assert.equal(swap.status,201);

  const manifest=await fetch(base+"/site.webmanifest");
  assert.equal(manifest.status,200);
  assert.match(await manifest.text(),/"name": "MCQ Audio"/);

  const missing=await fetch(base+"/definitely-not-a-real-page");
  assert.equal(missing.status,404);
  assert.match(await missing.text(),/That page isn’t here/);

  const lead=await fetch(base+"/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    name:"HiFi Customer",
    contact:"hifi@example.com",
    interest:"system",
    budget:"£3,000–£7,500",
    message:"Vinyl system"
  })});
  assert.equal(lead.status,201);
  const leadPayload=await lead.json();
  assert.equal(leadPayload.status,"NEW");

  const denied=await fetch(base+"/api/equipment",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"Test PA",price_pence:10000})});
  assert.equal(denied.status,401);

  const created=await fetch(base+"/api/equipment",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer test-admin"},body:JSON.stringify({name:"Test PA",price_pence:10000})});
  assert.equal(created.status,201);
  const eq=await created.json();

  const enquiry=await fetch(base+"/api/hire/request",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    customer_name:"Customer",
    contact:"customer@example.com",
    equipment_id:eq.id,
    start_at:"2026-12-20T10:00:00.000Z",
    end_at:"2026-12-20T18:00:00.000Z"
  })});
  assert.equal(enquiry.status,201);
  const payload=await enquiry.json();
  assert.ok(payload.enquiry.id);
  assert.ok(payload.quote.id);
  assert.equal(payload.quote.deposit_pence,2500);

  const general=await fetch(base+"/api/hire/request",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    customer_name:"General Customer",
    contact:"general@example.com",
    start_at:"2026-12-21T10:00:00.000Z",
    end_at:"2026-12-21T18:00:00.000Z"
  })});
  assert.equal(general.status,201);
  const generalPayload=await general.json();
  assert.equal(generalPayload.quote,null);
});