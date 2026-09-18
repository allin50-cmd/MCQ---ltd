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