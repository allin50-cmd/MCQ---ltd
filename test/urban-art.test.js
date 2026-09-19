import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

test("Urban Art upload moderation voting and ranking work", async (t)=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"mcq-art-"));
  process.env.NODE_ENV="test";
  process.env.MCQ_DATA_FILE=path.join(dir,"mcq.json");
  process.env.MCQ_ADMIN_TOKEN="test-admin";
  const {default:server}=await import(`../src/server.js?art=${Date.now()}`);
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  const image="data:image/jpeg;base64,"+Buffer.alloc(6000,7).toString("base64");

  const submit=await fetch(base+"/api/urban/art/submissions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    title:"South London Wall",creator_name:"Photographer",contact:"artist@example.com",
    artist_credit:"Unknown artist",location:"South London",story:"Community mural",
    rights_declared:true,image_data:image
  })});
  assert.equal(submit.status,201);
  const art=await submit.json();
  assert.equal(art.status,"PENDING");

  const before=await (await fetch(base+"/api/urban/art/chart")).json();
  assert.equal(before.count,0);

  const approve=await fetch(base+"/api/urban/art/moderate",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer test-admin"},body:JSON.stringify({submission_id:art.id,status:"LIVE"})});
  assert.equal(approve.status,200);

  const vote=await fetch(base+"/api/urban/art/vote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({submission_id:art.id,contact:"voter@example.com"})});
  assert.equal(vote.status,201);

  const duplicate=await fetch(base+"/api/urban/art/vote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({submission_id:art.id,contact:"voter@example.com"})});
  assert.equal(duplicate.status,400);

  const chart=await (await fetch(base+"/api/urban/art/chart")).json();
  assert.equal(chart.count,1);
  assert.equal(chart.items[0].id,art.id);
  assert.equal(chart.items[0].rank,1);
  assert.equal(chart.items[0].votes,1);
  assert.equal("contact" in chart.items[0],false);
  assert.match(chart.items[0].image_data,/^data:image\/jpeg;base64,/);

  const report=await fetch(base+"/api/urban/art/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({submission_id:art.id,reason:"Test report"})});
  assert.equal(report.status,201);

  const page=await fetch(base+"/urban-gallery");
  const html=await page.text();
  assert.equal(page.status,200);
  assert.match(html,/Upload your own art photo/i);
  assert.match(html,/Urban Art Chart/i);
  assert.match(html,/urban-gallery\.js/);
});
