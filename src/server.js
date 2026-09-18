import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load, save, id } from "./store.js";
import { assertPence, isAvailable, createQuote, confirmBooking } from "./core.js";
import { listSuppliers, searchFarnell } from "./suppliers.js";
import { searchInternalCatalog, listInternalCatalog } from "./catalog.js";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".ico":"image/x-icon"};
const securityHeaders={
  "x-content-type-options":"nosniff",
  "referrer-policy":"strict-origin-when-cross-origin",
  "permissions-policy":"camera=(), microphone=(), geolocation=()",
  "content-security-policy":"default-src 'self'; img-src 'self' data: https:; media-src 'self' https: blob:; frame-src https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.element14.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
};
const json=(res,status,body)=>{res.writeHead(status,{...securityHeaders,"content-type":"application/json; charset=utf-8","cache-control":"no-store"});res.end(JSON.stringify(body))};
const body=async req=>{let s="";for await(const c of req){s+=c;if(s.length>1_000_000)throw new Error("request too large")}return s?JSON.parse(s):{}};
const route=(u,...paths)=>paths.includes(u.pathname);
function requireAdmin(req){
  const expected=(process.env.MCQ_ADMIN_TOKEN||"").trim();
  if(!expected)throw new Error("admin access is not configured");
  const auth=req.headers.authorization||"";
  if(auth!==`Bearer ${expected}`)throw new Error("unauthorized");
}

const prettyRoutes=new Map([
  ["/microphones","/microphones.html"],
  ["/headphones","/headphones.html"],
  ["/wireless","/wireless.html"],
  ["/dj","/dj.html"],
  ["/music","/music.html"],
  ["/vinyl-underground","/music.html"],
  ["/swap-shop","/music.html"],
  ["/urban","/music.html"],
  ["/urban-underground","/music.html"],
  ["/chart","/chart.html"],
  ["/shop","/shop.html"],
  ["/magazine","/magazine.html"],
  ["/hire","/hire.html"],
  ["/hire-install","/hire.html"],
  ["/trade","/trade.html"],
  ["/about","/about.html"],
  ["/contact","/about.html"],
  ["/live","/live.html"],
  ["/publish","/publish.html"],
  ["/self-publish","/publish.html"],
  ["/swap","/swap.html"],
  ["/vinyl","/vinyl.html"],
  ["/white-labels","/vinyl.html"]
]);

function serveStatic(u,res){
  let pathname = u.pathname === "/" ? "/index.html" : (prettyRoutes.get(u.pathname)||u.pathname);
  try { pathname = decodeURIComponent(pathname); } catch { return false; }
  const target = path.resolve(publicDir, "." + pathname);
  if(!target.startsWith(publicDir + path.sep) && target !== publicDir) return false;
  if(!fs.existsSync(target) || !fs.statSync(target).isFile()) return false;
  const ext=path.extname(target).toLowerCase();
  const immutable=/\.(?:css|js|svg|png|jpe?g|webp|ico)$/.test(ext);
  res.writeHead(200,{...securityHeaders,"content-type":mime[ext]||"application/octet-stream","cache-control":ext===".html"?"no-store":immutable?"public, max-age=3600":"public, max-age=300"});
  fs.createReadStream(target).pipe(res);
  return true;
}

const server=http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,"http://localhost");
    const db=load();

    if(req.method==="GET"&&u.pathname==="/health") return json(res,200,{ok:true,service:"mcq-hire"});
    if(req.method==="GET"&&route(u,"/equipment","/api/equipment")) return json(res,200,db.equipment);
    if(req.method==="GET"&&route(u,"/suppliers","/api/suppliers")) return json(res,200,listSuppliers().map(({id,name,kind,api_status})=>({id,name,kind,api_status})));
    if(req.method==="GET"&&u.pathname==="/api/catalog") return json(res,200,listInternalCatalog());
    if(req.method==="GET"&&u.pathname==="/api/catalog/search"){
      const q=u.searchParams.get("q")||"";
      const internal=searchInternalCatalog(q);
      let live=[];
      try{
        const result=await searchFarnell(q);
        if(result.configured&&Array.isArray(result.products)){
          live=result.products.map(p=>({
            id:`farnell-${p.sku||Math.random().toString(36).slice(2)}`,
            brand:p.brand||"Farnell",
            name:p.name||p.sku||q,
            category:"supplier",
            price_band:"live",
            image:p.image_url||"",
            summary:"Live supplier result available through MCQ.",
            specs:[],
            source:"Farnell live feed",
            availability:p.stock||"LIVE_FEED",
            sku:p.sku||null,
            prices:p.prices||[]
          }));
        }
      }catch{}
      return json(res,200,{query:q,results:[...internal,...live].slice(0,24)});
    }

    if(req.method==="GET"&&u.pathname==="/api/urban/live"){
      const configured=db.live_stream_events.filter(v=>v.status!=="ARCHIVED").sort((a,b)=>new Date(a.starts_at||0)-new Date(b.starts_at||0))[0]||null;
      const fallback={
        id:"urban-live-launch",
        title:"Urban Underground Live — Launch Edition",
        frequency:"Monthly",
        status:"UPCOMING",
        starts_at:"",
        duration_minutes:120,
        hosts:["DJ Dexter","Mickey Simms"],
        guests:["MC Creed","Romeo (So Solid Crew)"],
        segments:["Hosts' opening sets","Guest conversation + performance","Urban Chart: unsigned/pre-pre-release picks","White-label / archive selection","Community shout-outs"],
        stream_embed_url:(process.env.MCQ_URBAN_LIVE_EMBED_URL||"").trim(),
        replay_embed_url:"",
        description:"Monthly live music stream from MCQ Urban Underground, connecting established urban names with unsigned and pre-pre-release music from the user-powered chart."
      };
      return json(res,200,configured||fallback);
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/live/configure"){
      requireAdmin(req);
      const x=await body(req);
      const safeEmbed=(value)=>{
        const raw=String(value||"").trim();if(!raw)return "";
        let parsed;try{parsed=new URL(raw)}catch{throw new Error("invalid stream URL")}
        if(parsed.protocol!=="https:")throw new Error("stream URL must use https");
        return parsed.toString();
      };
      const row={
        id:String(x.id||id("live")),
        title:String(x.title||"Urban Underground Live").trim(),
        frequency:String(x.frequency||"Monthly").trim(),
        status:String(x.status||"UPCOMING").trim().toUpperCase(),
        starts_at:String(x.starts_at||"").trim(),
        duration_minutes:Math.max(30,Number(x.duration_minutes||120)),
        hosts:Array.isArray(x.hosts)?x.hosts.map(String):["DJ Dexter","Mickey Simms"],
        guests:Array.isArray(x.guests)?x.guests.map(String):["MC Creed","Romeo (So Solid Crew)"],
        segments:Array.isArray(x.segments)?x.segments.map(String):[],
        stream_embed_url:safeEmbed(x.stream_embed_url),
        replay_embed_url:safeEmbed(x.replay_embed_url),
        description:String(x.description||"").trim(),
        updated_at:new Date().toISOString()
      };
      const i=db.live_stream_events.findIndex(v=>v.id===row.id);
      if(i>=0)db.live_stream_events[i]=row;else db.live_stream_events.push(row);
      save(db);return json(res,200,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/live/remind"){
      const x=await body(req);
      if(!x.contact)throw new Error("contact required");
      const contact=String(x.contact).trim().toLowerCase();
      const email_hash=crypto.createHash("sha256").update(contact).digest("hex");
      const event_id=String(x.event_id||"urban-live-launch");
      if(db.stream_reminders.some(v=>v.event_id===event_id&&v.email_hash===email_hash))return json(res,200,{ok:true,already_registered:true});
      db.stream_reminders.push({id:id("remind"),event_id,email_hash,created_at:new Date().toISOString()});
      save(db);return json(res,201,{ok:true,event_id});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/live/submit-track"){
      const x=await body(req);
      if(!x.submission_id||!x.contact)throw new Error("submission_id and contact required");
      const track=db.urban_submissions.find(v=>v.id===x.submission_id&&v.status==="LIVE");
      if(!track)throw new Error("submission not found");
      const creatorMatch=String(x.contact).trim().toLowerCase()===String(track.contact||"").trim().toLowerCase();
      if(!creatorMatch)throw new Error("creator contact does not match submission");
      const event_id=String(x.event_id||"urban-live-launch");
      if(db.stream_track_submissions.some(v=>v.event_id===event_id&&v.submission_id===track.id))return json(res,200,{ok:true,already_submitted:true});
      const row={id:id("streamtrack"),event_id,submission_id:track.id,status:"SUBMITTED",created_at:new Date().toISOString()};
      db.stream_track_submissions.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="GET"&&u.pathname==="/api/urban/live/submissions"){
      requireAdmin(req);
      const event_id=String(u.searchParams.get("event_id")||"urban-live-launch");
      const rows=db.stream_track_submissions.filter(v=>v.event_id===event_id).map(v=>{
        const track=db.urban_submissions.find(t=>t.id===v.submission_id);
        return {...v,track:track?{id:track.id,artist_name:track.artist_name,title:track.title,genre:track.genre,preview_url:track.preview_url,release_stage:track.release_stage}:null};
      });
      return json(res,200,{count:rows.length,items:rows});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/submissions"){
      const x=await body(req);
      if(!x.artist_name||!x.title||!x.genre||!x.creator_name||!x.contact||!x.preview_url)throw new Error("artist_name, title, genre, creator_name, contact and preview_url required");
      if(x.rights_declared!==true)throw new Error("rights declaration required");
      const stage=String(x.release_stage||"pre-pre-release").trim().toLowerCase();
      if(!["pre-pre-release","unsigned","independent"].includes(stage))throw new Error("invalid release_stage");
      const safeHttpUrl=(value,required=false)=>{
        const raw=String(value||"").trim();
        if(!raw){if(required)throw new Error("preview_url required");return ""}
        let parsed;try{parsed=new URL(raw)}catch{throw new Error("invalid media URL")}
        if(!["http:","https:"].includes(parsed.protocol))throw new Error("invalid media URL");
        return parsed.toString();
      };
      const row={
        id:id("urban"),
        artist_name:String(x.artist_name).trim(),
        title:String(x.title).trim(),
        genre:String(x.genre).trim(),
        release_stage:stage,
        creator_type:String(x.creator_type||"music maker").trim(),
        creator_name:String(x.creator_name).trim(),
        contact:String(x.contact).trim(),
        location:String(x.location||"").trim(),
        artwork_url:safeHttpUrl(x.artwork_url,false),
        preview_url:safeHttpUrl(x.preview_url,true),
        description:String(x.description||"").trim(),
        socials:String(x.socials||"").trim(),
        rights_declared:true,
        status:"LIVE",
        created_at:new Date().toISOString()
      };
      db.urban_submissions.push(row);save(db);
      return json(res,201,{...row,contact:undefined});
    }

    if(req.method==="GET"&&u.pathname==="/api/urban/chart"){
      const genre=String(u.searchParams.get("genre")||"").trim().toLowerCase();
      const limit=Math.min(100,Math.max(1,Number(u.searchParams.get("limit")||40)));
      const live=db.urban_submissions.filter(v=>v.status==="LIVE"&&(!genre||String(v.genre).toLowerCase()===genre));
      const ranked=live.map(v=>{
        const votes=db.urban_votes.filter(x=>x.submission_id===v.id).length;
        return {...v,contact:undefined,votes};
      }).sort((a,b)=>b.votes-a.votes||new Date(b.created_at)-new Date(a.created_at))
        .slice(0,limit)
        .map((v,i)=>({...v,rank:i+1}));
      return json(res,200,{count:ranked.length,ranking:"unique user support votes; ties by newest submission",items:ranked});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/vote"){
      const x=await body(req);
      if(!x.submission_id||!x.contact)throw new Error("submission_id and contact required");
      const submission=db.urban_submissions.find(v=>v.id===x.submission_id&&v.status==="LIVE");
      if(!submission)throw new Error("submission not found");
      const voter_hash=crypto.createHash("sha256").update(String(x.contact).trim().toLowerCase()).digest("hex");
      if(db.urban_votes.some(v=>v.submission_id===submission.id&&v.voter_hash===voter_hash))throw new Error("already supported");
      const row={id:id("uvote"),submission_id:submission.id,voter_hash,created_at:new Date().toISOString()};
      db.urban_votes.push(row);save(db);
      return json(res,201,{ok:true,submission_id:submission.id,votes:db.urban_votes.filter(v=>v.submission_id===submission.id).length});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/report"){
      const x=await body(req);
      if(!x.submission_id||!x.reason)throw new Error("submission_id and reason required");
      if(!db.urban_submissions.some(v=>v.id===x.submission_id))throw new Error("submission not found");
      const row={id:id("ureport"),submission_id:String(x.submission_id),reason:String(x.reason).slice(0,500),contact:String(x.contact||"").slice(0,200),status:"NEW",created_at:new Date().toISOString()};
      db.urban_reports.push(row);save(db);return json(res,201,{ok:true,id:row.id});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/moderate"){
      requireAdmin(req);
      const x=await body(req);
      const row=db.urban_submissions.find(v=>v.id===x.submission_id);
      if(!row)throw new Error("submission not found");
      const status=String(x.status||"").toUpperCase();
      if(!["LIVE","HIDDEN","REMOVED"].includes(status))throw new Error("invalid status");
      row.status=status;row.moderated_at=new Date().toISOString();save(db);return json(res,200,{id:row.id,status:row.status});
    }

    if(req.method==="GET"&&u.pathname==="/api/music/catalog"){
      const q=String(u.searchParams.get("q")||"").trim().toLowerCase();
      const format=String(u.searchParams.get("format")||"").trim().toLowerCase();
      const type=String(u.searchParams.get("type")||"").trim().toLowerCase();
      const rows=db.music_catalog.filter(item=>{
        if(format&&String(item.format||"").toLowerCase()!==format)return false;
        if(type&&String(item.release_type||"").toLowerCase()!==type)return false;
        if(!q)return true;
        const hay=[item.artist,item.title,item.label,item.catalogue_no,item.genre,item.format,item.release_type].join(" ").toLowerCase();
        return hay.includes(q);
      });
      return json(res,200,{count:rows.length,items:rows});
    }

    if(req.method==="POST"&&u.pathname==="/api/music/catalog/import"){
      requireAdmin(req);
      const x=await body(req);
      if(!Array.isArray(x.items))throw new Error("items array required");
      const imported=[];
      for(const raw of x.items){
        if(!raw||!raw.title||!raw.artist)continue;
        const row={
          id:String(raw.id||id("music")),
          artist:String(raw.artist).trim(),
          title:String(raw.title).trim(),
          label:String(raw.label||"Vinyl Underground").trim(),
          catalogue_no:String(raw.catalogue_no||"").trim(),
          genre:String(raw.genre||"UK Garage").trim(),
          format:String(raw.format||"vinyl").trim().toLowerCase(),
          release_type:String(raw.release_type||"catalogue").trim().toLowerCase(),
          price_pence:Number.isInteger(raw.price_pence)?raw.price_pence:null,
          stock:Number.isInteger(raw.stock)?raw.stock:null,
          release_date:String(raw.release_date||"").trim(),
          image_url:String(raw.image_url||"").trim(),
          audio_preview_url:String(raw.audio_preview_url||"").trim(),
          description:String(raw.description||"").trim(),
          status:String(raw.status||"LIVE").trim().toUpperCase(),
          created_at:String(raw.created_at||new Date().toISOString())
        };
        const existing=db.music_catalog.findIndex(v=>v.id===row.id||(row.catalogue_no&&v.catalogue_no===row.catalogue_no));
        if(existing>=0)db.music_catalog[existing]=row;else db.music_catalog.push(row);
        imported.push(row.id);
      }
      save(db);return json(res,200,{imported:imported.length,ids:imported});
    }

    if(req.method==="POST"&&u.pathname==="/api/music/order-interest"){
      const x=await body(req);
      if(!x.name||!x.contact||!x.item_id)throw new Error("name, contact and item_id required");
      const item=db.music_catalog.find(v=>v.id===x.item_id);
      if(!item)throw new Error("music item not found");
      const row={id:id("morder"),item_id:item.id,name:String(x.name).trim(),contact:String(x.contact).trim(),phone:String(x.phone||"").trim(),quantity:Math.max(1,Number(x.quantity||1)),status:"NEW",created_at:new Date().toISOString()};
      db.music_orders.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/music/drop-signup"){
      const x=await body(req);
      if(!x.contact)throw new Error("contact required");
      const row={id:id("drop"),name:String(x.name||"").trim(),contact:String(x.contact).trim(),interests:Array.isArray(x.interests)?x.interests.map(String):[],created_at:new Date().toISOString()};
      db.drop_signups.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/swap/offer"){
      const x=await body(req);
      if(!x.name||!x.contact||!x.item_type||!x.description)throw new Error("name, contact, item_type and description required");
      const row={id:id("swap"),name:String(x.name).trim(),contact:String(x.contact).trim(),phone:String(x.phone||"").trim(),item_type:String(x.item_type).trim(),artist:String(x.artist||"").trim(),title:String(x.title||"").trim(),quantity:Math.max(1,Number(x.quantity||1)),condition:String(x.condition||"unspecified").trim(),description:String(x.description).trim(),asking_price:String(x.asking_price||"").trim(),status:"NEW",created_at:new Date().toISOString()};
      db.swap_offers.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/leads"){
      const x=await body(req);
      if(!x.name||!x.contact)throw new Error("name and contact required");
      const row={
        id:id("lead"),
        name:String(x.name).trim(),
        contact:String(x.contact).trim(),
        phone:String(x.phone||"").trim(),
        interest:String(x.interest||"general").trim(),
        product:String(x.product||"").trim(),
        budget:String(x.budget||"").trim(),
        message:String(x.message||"").trim(),
        source:String(x.source||"website").trim(),
        status:"NEW",
        created_at:new Date().toISOString()
      };
      db.leads.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/events"){
      const x=await body(req);
      const row={id:id("evt"),type:String(x.type||"interaction").slice(0,80),label:String(x.label||"").slice(0,200),href:String(x.href||"").slice(0,500),created_at:new Date().toISOString()};
      db.events.push(row);save(db);return json(res,201,{ok:true});
    }

    if(req.method==="GET"&&u.pathname==="/api/suppliers/farnell/search"){
      const result=await searchFarnell(u.searchParams.get("q")||"");
      return json(res,result.configured?200:503,result);
    }

    if(req.method==="POST"&&route(u,"/equipment","/api/equipment")){
      requireAdmin(req);
      const x=await body(req);
      assertPence(x.price_pence);
      if(!x.name)throw new Error("name required");
      const row={id:id("eq"),name:String(x.name).trim(),category:String(x.category||"PA").trim(),description:String(x.description||"").trim(),price_pence:x.price_pence,image_url:String(x.image_url||"").trim()};
      db.equipment.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="GET"&&route(u,"/availability","/api/availability")){
      const start=u.searchParams.get("start"),end=u.searchParams.get("end");
      if(!start||!end)throw new Error("start and end required");
      if(new Date(start)>=new Date(end))throw new Error("end must be after start");
      return json(res,200,db.equipment.filter(e=>isAvailable(e.id,start,end,db.bookings)));
    }

    if(req.method==="POST"&&route(u,"/enquiries","/api/enquiries")){
      const x=await body(req);
      if(!x.customer_name||!x.contact||!x.equipment_id||!x.start_at||!x.end_at)throw new Error("customer_name, contact, equipment_id, start_at, end_at required");
      if(new Date(x.start_at)>=new Date(x.end_at))throw new Error("end must be after start");
      if(!db.equipment.some(e=>e.id===x.equipment_id))throw new Error("equipment not found");
      if(!isAvailable(x.equipment_id,x.start_at,x.end_at,db.bookings))throw new Error("equipment unavailable");
      const row={id:id("enq"),customer_name:String(x.customer_name).trim(),contact:String(x.contact).trim(),phone:String(x.phone||"").trim(),venue:String(x.venue||"").trim(),event_type:String(x.event_type||"").trim(),notes:String(x.notes||"").trim(),equipment_id:x.equipment_id,start_at:x.start_at,end_at:x.end_at,status:"NEW",created_at:new Date().toISOString()};
      db.enquiries.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/hire/request"){
      const x=await body(req);
      if(!x.customer_name||!x.contact||!x.start_at||!x.end_at)throw new Error("customer_name, contact, start_at, end_at required");
      if(new Date(x.start_at)>=new Date(x.end_at))throw new Error("end must be after start");
      const equipmentId=String(x.equipment_id||"").trim();
      const eq=equipmentId?db.equipment.find(v=>v.id===equipmentId):null;
      if(equipmentId&&!eq)throw new Error("equipment not found");
      if(eq&&!isAvailable(eq.id,x.start_at,x.end_at,db.bookings))throw new Error("equipment unavailable");
      const enquiry={id:id("enq"),customer_name:String(x.customer_name).trim(),contact:String(x.contact).trim(),phone:String(x.phone||"").trim(),venue:String(x.venue||"").trim(),event_type:String(x.event_type||"").trim(),notes:String(x.notes||"").trim(),equipment_id:eq?.id||null,start_at:x.start_at,end_at:x.end_at,status:"NEW",created_at:new Date().toISOString()};
      const quote=eq?{id:id("quo"),...createQuote(enquiry,eq)}:null;
      db.enquiries.push(enquiry);if(quote)db.quotes.push(quote);save(db);
      return json(res,201,{enquiry,quote});
    }

    if(req.method==="POST"&&route(u,"/quotes","/api/quotes")){
      const x=await body(req),enq=db.enquiries.find(v=>v.id===x.enquiry_id);
      if(!enq)throw new Error("enquiry not found");
      const eq=db.equipment.find(v=>v.id===enq.equipment_id);
      if(!eq)throw new Error("equipment not found");
      const row={id:id("quo"),...createQuote(enq,eq)};db.quotes.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&route(u,"/payments/confirm","/api/payments/confirm")){
      requireAdmin(req);
      const x=await body(req);assertPence(x.amount_pence);
      if(!x.reference)throw new Error("real payment reference required");
      if(!db.quotes.some(q=>q.id===x.quote_id))throw new Error("quote not found");
      const row={id:id("pay"),quote_id:x.quote_id,amount_pence:x.amount_pence,reference:String(x.reference).trim(),status:"RECEIVED",received_at:new Date().toISOString()};
      db.payments.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&route(u,"/bookings","/api/bookings")){
      requireAdmin(req);
      const x=await body(req),quote=db.quotes.find(v=>v.id===x.quote_id),payment=db.payments.find(v=>v.quote_id===x.quote_id&&v.status==="RECEIVED");
      if(!quote||!payment)throw new Error("quote and received deposit required");
      const enq=db.enquiries.find(v=>v.id===quote.enquiry_id);
      const row={id:id("book"),...confirmBooking({quote,payment,start_at:enq.start_at,end_at:enq.end_at,bookings:db.bookings}),enquiry_id:enq.id,quote_id:quote.id,confirmed_at:new Date().toISOString()};
      db.bookings.push(row);save(db);return json(res,201,row);
    }

    if(req.method==="GET"&&u.pathname==="/api/admin/summary"){
      requireAdmin(req);
      return json(res,200,{equipment:db.equipment.length,enquiries:db.enquiries.length,quotes:db.quotes.length,bookings:db.bookings.length,payments:db.payments.length,leads:db.leads.length,events:db.events.length,music_catalog:db.music_catalog.length,music_orders:db.music_orders.length,swap_offers:db.swap_offers.length,drop_signups:db.drop_signups.length,urban_submissions:db.urban_submissions.length,urban_votes:db.urban_votes.length,urban_reports:db.urban_reports.length,live_stream_events:db.live_stream_events.length,stream_reminders:db.stream_reminders.length,stream_track_submissions:db.stream_track_submissions.length});
    }

    if(req.method==="GET"&&serveStatic(u,res)) return;
    if(req.method==="GET"&&u.pathname.startsWith("/api/")) return json(res,404,{error:"not found"});
    if(req.method==="GET"){
      const fallback=path.join(publicDir,"404.html");
      if(fs.existsSync(fallback)){
        res.writeHead(404,{...securityHeaders,"content-type":"text/html; charset=utf-8","cache-control":"no-store"});
        return fs.createReadStream(fallback).pipe(res);
      }
    }
    return json(res,404,{error:"not found"});
  }catch(e){
    const status=e.message==="unauthorized"?401:e.message==="admin access is not configured"?503:/not found/.test(e.message)?404:/unavailable/.test(e.message)?409:/Farnell API returned/.test(e.message)?502:400;
    return json(res,status,{error:e.message});
  }
});
if(process.env.NODE_ENV!=="test")server.listen(Number(process.env.PORT||3000),()=>console.log(`MCQ Audio listening on ${process.env.PORT||3000}`));
export default server;
