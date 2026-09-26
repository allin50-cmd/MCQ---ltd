import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

test("CRM UI exposes stored customer and campaign context",()=>{
  const html=fs.readFileSync(new URL("../public/crm.html",import.meta.url),"utf8");
  for(const marker of ["Event date","Venue / postcode","Guest count","Playback / DJ","Customer message","Campaign","utm_campaign"]){
    assert.ok(html.includes(marker), marker+" missing from CRM UI");
  }
});

test("promoted hire enquiry retains lead commercial context", async (t)=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"mcq-promote-"));
  process.env.NODE_ENV="test";
  process.env.MCQ_DATA_FILE=path.join(dir,"mcq.json");
  process.env.MCQ_AGENT_TOKEN="promote-agent";
  process.env.MCQ_ADMIN_TOKEN="promote-admin";
  const mod=await import("../src/server.js?promotecontext="+Date.now());
  const server=mod.default;
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base="http://127.0.0.1:"+server.address().port;

  let r=await fetch(base+"/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    name:"Christmas Company",contact:"event@example.com",phone:"02000000000",interest:"Hire & Install",
    event_date:"2026-12-18",venue_postcode:"SE20 8XX",guest_count:"120",event_type:"Company Christmas party",
    playback:"DJ equipment required",budget:"£1,500",message:"PA, mics and lighting",
    source:"hire-page",utm_source:"linkedin",utm_medium:"social",utm_campaign:"corporate-christmas-2026",
    campaign_context:"christmas-2026",landing_url:"https://mcq-audio.onrender.com/hire?utm_source=linkedin#christmas"
  })});
  assert.equal(r.status,201);
  const lead=await r.json();

  r=await fetch(base+"/api/equipment",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer promote-admin"},body:JSON.stringify({name:"Qualified PA",price_pence:10000})});
  assert.equal(r.status,201);
  const eq=await r.json();

  r=await fetch(base+"/api/admin/crm/promote-hire",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer promote-agent"},body:JSON.stringify({
    lead_id:lead.id,equipment_id:eq.id,start_at:"2026-12-18T18:00:00Z",end_at:"2026-12-19T00:00:00Z"
  })});
  assert.equal(r.status,201);
  const promoted=await r.json();
  assert.equal(promoted.enquiry.guest_count,"120");
  assert.equal(promoted.enquiry.playback,"DJ equipment required");
  assert.equal(promoted.enquiry.budget,"£1,500");
  assert.equal(promoted.enquiry.campaign_context,"christmas-2026");
  assert.equal(promoted.enquiry.utm_source,"linkedin");
  assert.equal(promoted.enquiry.utm_campaign,"corporate-christmas-2026");
  assert.equal(promoted.enquiry.venue,"SE20 8XX");
  assert.equal(promoted.enquiry.event_type,"Company Christmas party");
});