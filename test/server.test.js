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

  const musicPage=await fetch(base+"/urban");
  assert.equal(musicPage.status,200);
  assert.equal(musicPage.headers.get("x-content-type-options"),"nosniff");
  assert.match(musicPage.headers.get("content-security-policy")||"",/media-src 'self' https: blob:/);
  const musicHtml=await musicPage.text();
  assert.match(musicHtml,/URBAN UNDERGROUND/);
  assert.match(musicHtml,/THE URBAN CHART|The Urban Chart/);
  assert.match(musicHtml,/SELF PUBLISH/);
  assert.match(musicHtml,/URBAN SWAP SHOP/);
  assert.match(musicHtml,/site\.webmanifest/);
  assert.match(musicHtml,/Skip to content/);

  for (const route of ["/","/microphones","/headphones","/wireless","/dj","/music","/urban","/chart","/shop","/magazine","/live","/hire","/trade","/about","/publish","/swap","/vinyl"]) {
    const page=await fetch(base+route);
    const html=await page.text();
    assert.doesNotMatch(html,/href=["']https?:\/\//i);
    assert.doesNotMatch(html,/target=["']_blank["']/i);
  }

  const magazinePages=[
    ["/shop","Sound for"],
    ["/magazine","Sound has"],
    ["/live","The room"],
    ["/hire","Sound that"],
    ["/trade","When audio is"],
    ["/about","More than"],
    ["/chart","The chart"],
    ["/publish","Made tonight"],
    ["/swap","Good records"],
    ["/vinyl","The archive"]
  ];
  for (const [route,marker] of magazinePages) {
    const page=await fetch(base+route);
    assert.equal(page.status,200);
    assert.equal(page.headers.get("x-content-type-options"),"nosniff");
    const html=await page.text();
    assert.match(html,/MCQ/);
    assert.match(html,new RegExp(marker,"i"));
    assert.match(html,/magazine\.css/);
    assert.match(html,/Skip to content/);
  }

  const future=await fetch(base+"/prototype");
  assert.equal(future.status,200);
  const futureHtml=await future.text();
  assert.match(futureHtml,/MCQ — Cinematic Prototype/);
  assert.match(futureHtml,/future\.css/);
  assert.match(futureHtml,/future\.js/);
  assert.match(futureHtml,/MONTHLY BROADCAST/);
  assert.match(futureHtml,/More than/);
  assert.match(futureHtml,/The chart/);
  assert.match(futureHtml,/Hire & install/);

  const suppliers=await fetch(base+"/api/suppliers");
  assert.equal(suppliers.status,200);
  const supplierList=await suppliers.json();
  assert.ok(supplierList.length>0);
  assert.equal("homepage" in supplierList[0],false);
  assert.equal("search_url" in supplierList[0],false);

  const catalog=await fetch(base+"/api/catalog/search?q=Sony%20WH-1000XM6");
  assert.equal(catalog.status,200);
  const catalogBody=await catalog.json();
  assert.equal(catalogBody.results.length,0);

  const validation=await fetch(base+"/api/admin/catalog/validation",{headers:{authorization:"Bearer test-admin"}});
  assert.equal(validation.status,200);
  const validationBody=await validation.json();
  assert.ok(validationBody.summary.total>0);
  assert.equal(validationBody.summary.public_display,100);
  assert.equal(validationBody.summary.sellable,0);
  assert.equal(validationBody.summary.draft,validationBody.summary.total-100);

  const urbanSubmit1=await fetch(base+"/api/urban/submissions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    artist_name:"Bedroom Producer",
    title:"Tomorrow's Dub",
    genre:"Garage",
    release_stage:"pre-pre-release",
    creator_type:"Bedroom producer",
    creator_name:"Creator One",
    contact:"creator1@example.com",
    preview_url:"https://media.example.com/tomorrows-dub.mp3",
    artwork_url:"https://media.example.com/tomorrows-dub.jpg",
    rights_declared:true
  })});
  assert.equal(urbanSubmit1.status,201);
  const urban1=await urbanSubmit1.json();
  assert.equal(urban1.contact,undefined);

  const urbanSubmit2=await fetch(base+"/api/urban/submissions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    artist_name:"Unsigned Artist",
    title:"No Label Needed",
    genre:"Hip-Hop",
    release_stage:"unsigned",
    creator_type:"Artist / vocalist",
    creator_name:"Creator Two",
    contact:"creator2@example.com",
    preview_url:"https://media.example.com/no-label-needed.mp3",
    rights_declared:true
  })});
  assert.equal(urbanSubmit2.status,201);
  const urban2=await urbanSubmit2.json();

  const vote1=await fetch(base+"/api/urban/vote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({submission_id:urban1.id,contact:"listener@example.com"})});
  assert.equal(vote1.status,201);
  const vote2=await fetch(base+"/api/urban/vote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({submission_id:urban1.id,contact:"listener2@example.com"})});
  assert.equal(vote2.status,201);
  const duplicateVote=await fetch(base+"/api/urban/vote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({submission_id:urban1.id,contact:"listener@example.com"})});
  assert.equal(duplicateVote.status,400);

  const chart=await fetch(base+"/api/urban/chart");
  assert.equal(chart.status,200);
  const chartBody=await chart.json();
  assert.equal(chartBody.items[0].id,urban1.id);
  assert.equal(chartBody.items[0].rank,1);
  assert.equal(chartBody.items[0].votes,2);
  assert.equal("contact" in chartBody.items[0],false);
  assert.match(chartBody.ranking,/unique user support votes/i);

  const genreChart=await fetch(base+"/api/urban/chart?genre=Hip-Hop");
  const genreBody=await genreChart.json();
  assert.equal(genreBody.count,1);
  assert.equal(genreBody.items[0].id,urban2.id);

  const unsafeSubmit=await fetch(base+"/api/urban/submissions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    artist_name:"Bad URL",title:"Unsafe",genre:"Other",creator_name:"Bad",contact:"bad@example.com",preview_url:"javascript:alert(1)",rights_declared:true
  })});
  assert.equal(unsafeSubmit.status,400);

  const urbanReport=await fetch(base+"/api/urban/report",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({submission_id:urban2.id,reason:"Possible copyright issue"})});
  assert.equal(urbanReport.status,201);

  const liveShow=await fetch(base+"/api/urban/live");
  assert.equal(liveShow.status,200);
  const liveBody=await liveShow.json();
  assert.equal(liveBody.frequency,"Monthly");
  assert.deepEqual(liveBody.hosts,["DJ Dexter","Mickey Simms"]);
  assert.deepEqual(liveBody.guests,["MC Creed","Romeo (So Solid Crew)"]);

  const liveReminder=await fetch(base+"/api/urban/live/remind",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({event_id:liveBody.id,contact:"viewer@example.com"})});
  assert.equal(liveReminder.status,201);
  const liveReminderAgain=await fetch(base+"/api/urban/live/remind",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({event_id:liveBody.id,contact:"viewer@example.com"})});
  assert.equal(liveReminderAgain.status,200);
  assert.equal((await liveReminderAgain.json()).already_registered,true);

  const showTrack=await fetch(base+"/api/urban/live/submit-track",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({event_id:liveBody.id,submission_id:urban1.id,contact:"creator1@example.com"})});
  assert.equal(showTrack.status,201);
  const wrongCreator=await fetch(base+"/api/urban/live/submit-track",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({event_id:liveBody.id,submission_id:urban2.id,contact:"notcreator@example.com"})});
  assert.equal(wrongCreator.status,400);

  const configuredLive=await fetch(base+"/api/urban/live/configure",{method:"POST",headers:{"content-type":"application/json",authorization:"Bearer test-admin"},body:JSON.stringify({
    id:"urban-live-launch",
    title:"Urban Underground Live — Launch Edition",
    starts_at:"2026-10-31T20:00:00+00:00",
    stream_embed_url:"https://video.example.com/embed/live",
    hosts:["DJ Dexter","Mickey Simms"],
    guests:["MC Creed","Romeo (So Solid Crew)"]
  })});
  assert.equal(configuredLive.status,200);
  const configuredBody=await configuredLive.json();
  assert.equal(configuredBody.stream_embed_url,"https://video.example.com/embed/live");

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
test("market evidence APIs expose public benchmarks separately from MCQ stock", async ()=>{
  const {default:server}=await import("../src/server.js?marketapi="+Date.now());
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  try{
    const base="http://127.0.0.1:"+server.address().port;
    const market=await (await fetch(base+"/api/market/catalog")).json();
    assert.ok(market.items.length>=7);
    assert.equal(market.items[0].mcq_sellable,false);
    const competitors=await (await fetch(base+"/api/market/competitors")).json();
    assert.ok(competitors.items.length>=8);
  } finally {await new Promise(resolve=>server.close(resolve))}
});



test("admin CRM aggregates real customer records and supports governed updates", async (t)=>{
  process.env.MCQ_ADMIN_TOKEN="crm-admin";
  process.env.MCQ_AGENT_TOKEN="crm-agent";
  const {default:server}=await import(`../src/server.js?crmtest=${Date.now()}`);
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;

  let r=await fetch(base+"/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"CRM Test Customer",contact:"crm-test@example.com",interest:"Trade",source:"test-suite"})});
  assert.equal(r.status,201);
  const created=await r.json();

  const headers={authorization:"Bearer crm-agent"};
  r=await fetch(base+"/api/admin/crm",{headers});
  assert.equal(r.status,200);
  let payload=await r.json();
  assert(payload.items.some(v=>v.id===created.id));
  assert(payload.counts.open>=1);

  r=await fetch(base+"/api/admin/crm/update",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({entity_type:"lead",entity_id:created.id,status:"FOLLOW_UP",owner:"Lola",next_action:"Reply to customer",note:"Customer service review"})});
  assert.equal(r.status,200);
  payload=await r.json();
  assert.equal(payload.item.status,"FOLLOW_UP");
  assert.equal(payload.item.crm_owner,"Lola");

  r=await fetch(base+"/api/admin/crm",{headers});
  payload=await r.json();
  assert(payload.recent_events.some(v=>v.entity_id===created.id&&v.owner==="Lola"));
});


test("CRM exposes alerts, detail timeline and governed quote handoff", async (t)=>{
  process.env.MCQ_ADMIN_TOKEN="crm-admin-2";
  process.env.MCQ_AGENT_TOKEN="crm-agent-2";
  const {default:server}=await import(`../src/server.js?crmflow=${Date.now()}`);
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;
  const headers={authorization:"Bearer crm-agent-2","content-type":"application/json"};

  let r=await fetch(base+"/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"CRM Flow Lead",contact:"flow@example.com",interest:"Install",source:"website"})});
  assert.equal(r.status,201);
  const lead=await r.json();

  r=await fetch(base+"/api/admin/crm",{headers});
  assert.equal(r.status,200);
  let payload=await r.json();
  const item=payload.items.find(v=>v.id===lead.id);
  assert(item);
  assert.equal(item.owner,"");
  assert(payload.counts.unowned>=1);
  assert(payload.counts.without_next_action>=1);

  r=await fetch(base+"/api/admin/crm/update",{method:"POST",headers,body:JSON.stringify({entity_type:"lead",entity_id:lead.id,status:"CONTACT",owner:"Lola",next_action:"Call customer",next_action_at:"2026-09-21T09:00:00Z"})});
  assert.equal(r.status,200);

  r=await fetch(base+`/api/admin/crm/detail?entity_type=lead&entity_id=${encodeURIComponent(lead.id)}`,{headers});
  assert.equal(r.status,200);
  payload=await r.json();
  assert.equal(payload.item.crm_owner,"Lola");
  assert(payload.timeline.some(v=>v.entity_id===lead.id));

  r=await fetch(base+"/api/quotes",{method:"POST",headers,body:JSON.stringify({enquiry_id:"missing"})});
  assert.notEqual(r.status,401);
});


test("CRM operator and agent access share one real queue without exposing operator auth", async (t)=>{
  process.env.MCQ_ADMIN_TOKEN="admin_test_value";
  process.env.MCQ_OPERATOR_TOKEN="operator_test_value";
  process.env.MCQ_AGENT_TOKEN="agent_test_value";
  const {default:server}=await import(`../src/server.js?crmproper=${Date.now()}`);
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;

  let r=await fetch(base+"/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"Same Customer",contact:"SAME@EXAMPLE.COM",interest:"Trade"})});
  assert.equal(r.status,201);
  const lead=await r.json();

  r=await fetch(base+"/api/swap/offer",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"Same Customer",contact:"same@example.com",item_type:"Technics",description:"1210 deck"})});
  assert.equal(r.status,201);
  const swap=await r.json();

  const operatorHeaders={authorization:"Bearer operator_test_value","content-type":"application/json"};
  r=await fetch(base+"/api/admin/crm/update",{method:"POST",headers:operatorHeaders,body:JSON.stringify({entity_type:"lead",entity_id:lead.id,status:"FOLLOW_UP",owner:"Lola",next_action:"Call customer",next_action_at:"2020-01-01T09:00:00Z"})});
  assert.equal(r.status,200);

  r=await fetch(base+"/api/admin/crm",{headers:operatorHeaders});
  assert.equal(r.status,200);
  let payload=await r.json();
  const l=payload.items.find(v=>v.id===lead.id);
  const s=payload.items.find(v=>v.id===swap.id);
  assert(l&&s);
  assert.equal(l.customer_key,s.customer_key);
  assert(payload.related_by_customer[l.customer_key].length>=2);
  assert.equal(payload.queue[0].id,lead.id);
  assert.equal(payload.queue[0].overdue,true);

  r=await fetch(base+`/api/admin/crm/detail?entity_type=lead&entity_id=${encodeURIComponent(lead.id)}`,{headers:operatorHeaders});
  assert.equal(r.status,200);
  payload=await r.json();
  assert(payload.related.some(v=>v.id===swap.id));

  r=await fetch(base+"/api/admin/crm/queue",{headers:{authorization:"Bearer agent_test_value"}});
  assert.equal(r.status,200);
  payload=await r.json();
  assert(payload.items.some(v=>v.id===lead.id));

  r=await fetch(base+"/api/admin/crm",{headers:{authorization:"Bearer invalid_test_value"}});
  assert.equal(r.status,401);
});


test("CRM update idempotency prevents duplicate durable effects", async (t)=>{
  process.env.MCQ_ADMIN_TOKEN="idem-admin";
  process.env.MCQ_AGENT_TOKEN="idem-agent";
  const {default:server}=await import(`../src/server.js?crmidem=${Date.now()}`);
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;

  let r=await fetch(base+"/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    name:"Idempotency Test Customer",contact:"idem-test@example.com",interest:"Trade",source:"test-suite"
  })});
  assert.equal(r.status,201);
  const lead=await r.json();

  const headers={
    authorization:"Bearer idem-agent",
    "content-type":"application/json",
    "idempotency-key":"agentx-test-action-1"
  };
  const update={entity_type:"lead",entity_id:lead.id,status:"FOLLOW_UP",owner:"Lola",next_action:"Call customer"};

  r=await fetch(base+"/api/admin/crm/update",{method:"POST",headers,body:JSON.stringify(update)});
  assert.equal(r.status,200);
  const first=await r.json();
  assert.equal(first.idempotent_replay,false);

  r=await fetch(base+"/api/admin/crm/update",{method:"POST",headers,body:JSON.stringify(update)});
  assert.equal(r.status,200);
  const replay=await r.json();
  assert.equal(replay.idempotent_replay,true);
  assert.equal(replay.event.id,first.event.id);

  r=await fetch(base+`/api/admin/crm/detail?entity_type=lead&entity_id=${encodeURIComponent(lead.id)}`,{headers:{authorization:"Bearer idem-agent"}});
  assert.equal(r.status,200);
  const detail=await r.json();
  assert.equal(detail.timeline.filter(v=>v.id===first.event.id).length,1);

  r=await fetch(base+"/api/admin/crm/update",{method:"POST",headers,body:JSON.stringify({...update,next_action:"Different action"})});
  assert.equal(r.status,400);
  const conflict=await r.json();
  assert.match(conflict.error,/idempotency key reused/);
});
