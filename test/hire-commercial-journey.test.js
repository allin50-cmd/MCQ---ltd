import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

test("hire lead preserves commercial context and is agent-ready", async (t)=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"mcq-hire-proof-"));
  process.env.NODE_ENV="test";
  process.env.MCQ_DATA_FILE=path.join(dir,"mcq.json");
  process.env.MCQ_AGENT_TOKEN="hire-agent-test";
  const {default:server}=await import(`../src/server.js?hireproof=${Date.now()}`);
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;

  let response=await fetch(base+"/api/leads",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({
      name:"Corporate Christmas Test",
      contact:"christmas-proof@example.com",
      phone:"020 0000 0000",
      interest:"Hire & Install",
      event_date:"2026-12-18",
      venue_postcode:"SE20 8XX",
      guest_count:"120",
      event_type:"Company Christmas party",
      playback:"DJ equipment required",
      budget:"£1,500",
      message:"PA, two radio microphones, DJ setup and lighting",
      source:"hire-page",
      utm_source:"linkedin",
      utm_medium:"social",
      utm_campaign:"corporate-christmas-2026",
      campaign_context:"christmas-2026",
      landing_url:"https://mcq-audio.onrender.com/hire?utm_source=linkedin#christmas"
    })
  });
  assert.equal(response.status,201);
  const lead=await response.json();
  assert.ok(lead.id);
  assert.equal(lead.event_date,"2026-12-18");
  assert.equal(lead.venue_postcode,"SE20 8XX");
  assert.equal(lead.guest_count,"120");
  assert.equal(lead.event_type,"Company Christmas party");
  assert.equal(lead.playback,"DJ equipment required");
  assert.equal(lead.utm_source,"linkedin");
  assert.equal(lead.utm_campaign,"corporate-christmas-2026");
  assert.equal(lead.campaign_context,"christmas-2026");
  assert.equal(lead.crm_owner,"Lola");
  assert.equal(lead.crm_next_action,"Qualify hire/install enquiry");

  response=await fetch(base+"/api/admin/crm",{headers:{authorization:"Bearer hire-agent-test"}});
  assert.equal(response.status,200);
  const crm=await response.json();
  const item=crm.items.find(v=>v.id===lead.id);
  assert.ok(item);
  assert.equal(item.owner,"Lola");
  assert.equal(item.next_action,"Qualify hire/install enquiry");
  assert.equal(crm.counts.unowned,0);
  assert.ok(crm.recent_events.some(v=>v.entity_id===lead.id&&v.owner==="Lola"));
});

test("hire page captures campaign attribution and handles failed saves",()=>{
  const html=fs.readFileSync(new URL("../public/hire.html",import.meta.url),"utf8");
  assert.match(html,/submitHireLead/);
  assert.match(html,/URLSearchParams/);
  assert.match(html,/utm_source/);
  assert.match(html,/utm_campaign/);
  assert.match(html,/campaign_context/);
  assert.match(html,/landing_url/);
  assert.match(html,/response\.ok/);
  assert.match(html,/MCQ has your event details/);
});
