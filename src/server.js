import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load, save, id } from "./store.js";
import { assertPence, isAvailable, createQuote, confirmBooking } from "./core.js";
import { listSuppliers, searchFarnell } from "./suppliers.js";
import { searchInternalCatalog, listInternalCatalog } from "./catalog.js";
import { listMarketCatalog, searchMarketCatalog, listCompetitors } from "./market.js";
import { evaluateCatalogRow, CATALOG_STATES, IMAGE_PERMISSION_STATES } from "./catalog_contract.js";
import { buildAgentControl, runAgentCommand } from "./agents.js";
import { enrichAgentCommand } from "./intelligence.js";
import { createStripeCheckout, verifyStripeSignature, verifiedDepositFromStripeEvent } from "./payments.js";
import { deliverQuote } from "./notifications.js";
import { applyCrmUpdate } from "./crm.js";
import { runExactlyOnceProductionProof } from "./production-proof.js";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".ico":"image/x-icon"};
const securityHeaders={
  "x-content-type-options":"nosniff",
  "referrer-policy":"strict-origin-when-cross-origin",
  "permissions-policy":"camera=(), microphone=(), geolocation=()",
  "content-security-policy":"default-src 'self'; img-src 'self' data: https:; media-src 'self' https: blob:; frame-src https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.element14.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
};
const json=(res,status,body)=>{res.writeHead(status,{...securityHeaders,"content-type":"application/json; charset=utf-8","cache-control":"no-store"});res.end(JSON.stringify(body))};
const rawBody=async req=>{let s="";for await(const chunk of req){s+=chunk;if(s.length>5_500_000)throw new Error("request too large")}return s};
const body=async req=>{const s=await rawBody(req);return s?JSON.parse(s):{}};
const route=(u,...paths)=>paths.includes(u.pathname);
const normalizeEmail=v=>String(v||"").trim().toLowerCase();
const normalizePhone=v=>String(v||"").replace(/\D/g,"").slice(-11);
const customerKey=row=>{
  const email=normalizeEmail(row.contact);
  const phone=normalizePhone(row.phone);
  return email?`email:${email}`:phone?`phone:${phone}`:`record:${row.id}`;
};
function requireAdmin(req){
  const expected=(process.env.MCQ_ADMIN_TOKEN||"").trim();
  if(!expected)throw new Error("admin access is not configured");
  const auth=req.headers.authorization||"";
  if(auth!==`Bearer ${expected}`)throw new Error("unauthorized");
}
function requireCrmAccess(req){
  const admin=(process.env.MCQ_ADMIN_TOKEN||"").trim();
  const operator=(process.env.MCQ_OPERATOR_TOKEN||"").trim();
  const agent=(process.env.MCQ_AGENT_TOKEN||"").trim();
  if(!admin&&!operator&&!agent)throw new Error("CRM access is not configured");
  const auth=req.headers.authorization||"";
  if(![admin,operator,agent].filter(Boolean).some(token=>auth===`Bearer ${token}`))throw new Error("unauthorized");
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
  ["/featured","/featured.html"],
  ["/urban-gallery","/urban-gallery.html"],
  ["/magazine","/magazine.html"],
  ["/insights/djs-ditching-laptops","/djs-ditching-laptops.html"],
  ["/hire","/hire.html"],
  ["/hire-install","/hire.html"],
  ["/trade","/trade.html"],
  ["/club","/club.html"],
  ["/crm","/crm.html"],
  ["/about","/about.html"],
  ["/contact","/about.html"],
  ["/pay","/pay.html"],
  ["/live","/live.html"],
  ["/publish","/publish.html"],
  ["/self-publish","/publish.html"],
  ["/swap","/swap.html"],
  ["/vinyl","/vinyl.html"],
  ["/white-labels","/vinyl.html"],
  ["/prototype","/future.html"],
  ["/future","/future.html"]
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
  if(ext===".html"){
    let html=fs.readFileSync(target,"utf8");
    if(!html.includes("/site-shell.css"))html=html.replace(/<\/head>/i,'<link rel="stylesheet" href="/site-shell.css"></head>');
    if(!html.includes("/site-shell.js"))html=html.replace(/<\/body>/i,'<script src="/site-shell.js" defer></script></body>');
    res.end(html);return true;
  }
  fs.createReadStream(target).pipe(res);
  return true;
}

let durableStateReady=false;
let durableStateError="not checked";

const server=http.createServer(async(req,res)=>{
  try{
    const u=new URL(req.url,"http://localhost");

    if(req.method==="GET"&&u.pathname==="/health") return json(res,200,{
      ok:true,
      service:"mcq-hire",
      commit:String(process.env.RENDER_GIT_COMMIT||""),
      durable_state_configured:Boolean(process.env.AGENTX_SERVICE_URL&&process.env.MCQ_SERVICE_TOKEN),
      quote_delivery_configured:Boolean(process.env.SENDGRID_API_KEY&&process.env.MCQ_FROM_EMAIL),
      verified_payment_configured:Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET),
      durable_state_ready:durableStateReady,
      durable_state_error:durableStateReady?"":durableStateError,
      payment_rule:"RECEIVED requires signed provider evidence in production"
    });

    if(req.method==="GET"&&u.pathname==="/ready"){
      try{
        await load();
        durableStateReady=true;
        durableStateError="";
        return json(res,200,{ok:true,durable_state_ready:true});
      }catch(error){
        durableStateReady=false;
        durableStateError=String(error?.message||error);
        return json(res,503,{ok:false,durable_state_ready:false,error:"durable state unavailable"});
      }
    }

    if(req.method==="GET"&&serveStatic(u,res)) return;

    let db;
    try{
      db=await load();
      durableStateReady=true;
      durableStateError="";
    }catch(error){
      durableStateReady=false;
      durableStateError=String(error?.message||error);
      return json(res,503,{error:"MCQ operational state is temporarily unavailable"});
    }

    if(req.method==="GET"&&route(u,"/equipment","/api/equipment")) return json(res,200,db.equipment);
    if(req.method==="GET"&&route(u,"/suppliers","/api/suppliers")) return json(res,200,listSuppliers().map(({id,name,kind,api_status})=>({id,name,kind,api_status})));
    if(req.method==="GET"&&u.pathname==="/api/catalog") return json(res,200,listInternalCatalog());
    if(req.method==="GET"&&u.pathname==="/api/market/catalog") return json(res,200,{items:listMarketCatalog()});
    if(req.method==="GET"&&u.pathname==="/api/market/competitors") return json(res,200,{items:listCompetitors()});
    if(req.method==="GET"&&u.pathname==="/api/admin/agents"){
      requireCrmAccess(req);
      return json(res,200,buildAgentControl(db,[...listInternalCatalog(),...listMarketCatalog()]));
    }
    if(req.method==="POST"&&u.pathname==="/api/admin/agents/command"){
      requireCrmAccess(req);
      const command=await body(req);
      const deterministic=runAgentCommand(db,[...listInternalCatalog(),...listMarketCatalog()],command);
      const result=await enrichAgentCommand(deterministic);
      db.crm_events.push({id:id("agent"),entity_type:"agent_command",entity_id:result.requested_agent,status:result.status,owner:"operator",next_action:result.approval_required?"Approve or reject proposed restricted action":"Review agent recommendations",note:JSON.stringify({instruction:result.instruction,agents_invoked:result.responses.map(x=>x.agent),evidence:result.responses.map(x=>x.evidence),approval_required:result.approval_required,executed_restricted_action:false}),created_at:result.generated_at});
      await save(db);
      return json(res,200,result);
    }
    if(req.method==="GET"&&u.pathname==="/api/admin/catalog/validation"){
      requireAdmin(req);
      const internal=listInternalCatalog();
      const market=listMarketCatalog();
      const all=[...internal,...market];
      return json(res,200,{
        summary:{
          total:all.length,
          public_display:all.filter(x=>x.public_display).length,
          sellable:all.filter(x=>x.sellable).length,
          draft:all.filter(x=>x.state==="DRAFT").length
        },
        items:all.map(x=>({
          id:x.id,
          brand:x.brand,
          model:x.model||x.name,
          state:x.state,
          public_display:x.public_display,
          sellable:x.sellable,
          common_errors:x.validation?.common_errors||[],
          sellable_errors:x.validation?.sellable_errors||[],
          decision:x.commercial?.decision||"INSUFFICIENT_REAL_DATA"
        }))
      });
    }
    if(req.method==="GET"&&u.pathname==="/api/catalog/search"){
      const q=u.searchParams.get("q")||"";
      const internal=searchInternalCatalog(q);
      const market=searchMarketCatalog(q);
      let live=[];
      try{
        const result=await searchFarnell(q);
        if(result.configured&&Array.isArray(result.products)){
          live=result.products.map(p=>evaluateCatalogRow({
            id:`farnell-${p.sku||Math.random().toString(36).slice(2)}`,
            brand:p.brand||"Farnell",
            name:p.name||p.sku||q,
            model:p.name||p.sku||q,
            category:"supplier",
            image:p.image_url||"",
            images:p.image_url?[{
              url:p.image_url,
              source:"Farnell/element14 API",
              permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
              verified:false,
              width:null,
              height:null
            }]:[],
            requested_state:CATALOG_STATES.DRAFT,
            supplier:"Farnell UK",
            supplier_sku:p.sku||null,
            real_availability:String(p.stock||"LIVE_FEED"),
            availability_checked_at:new Date().toISOString(),
            availability_evidence_url:"https://uk.farnell.com/",
            real_cost_price_ex_vat_gbp:null,
            delivery_cost_ex_vat_gbp:null,
            mcq_retail_price_inc_vat_gbp:null,
            cost_evidence_url:null,
            source_url:"https://uk.farnell.com/",
            source_note:"Live supplier API observation only. MCQ trade cost, image-use permission, delivery and retail price are not yet confirmed.",
            last_checked:new Date().toISOString(),
            summary:"Live supplier result available for internal sourcing review.",
            specs:[],
            source:"Farnell live feed",
            prices:p.prices||[]
          })).filter(p=>p.public_display);
        }
      }catch{}
      return json(res,200,{query:q,results:[...market,...internal,...live].slice(0,24)});
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
      await save(db);return json(res,200,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/live/remind"){
      const x=await body(req);
      if(!x.contact)throw new Error("contact required");
      const contact=String(x.contact).trim().toLowerCase();
      const email_hash=crypto.createHash("sha256").update(contact).digest("hex");
      const event_id=String(x.event_id||"urban-live-launch");
      if(db.stream_reminders.some(v=>v.event_id===event_id&&v.email_hash===email_hash))return json(res,200,{ok:true,already_registered:true});
      db.stream_reminders.push({id:id("remind"),event_id,email_hash,created_at:new Date().toISOString()});
      await save(db);return json(res,201,{ok:true,event_id});
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
      db.stream_track_submissions.push(row);await save(db);return json(res,201,row);
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
      db.urban_submissions.push(row);await save(db);
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
      db.urban_votes.push(row);await save(db);
      return json(res,201,{ok:true,submission_id:submission.id,votes:db.urban_votes.filter(v=>v.submission_id===submission.id).length});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/report"){
      const x=await body(req);
      if(!x.submission_id||!x.reason)throw new Error("submission_id and reason required");
      if(!db.urban_submissions.some(v=>v.id===x.submission_id))throw new Error("submission not found");
      const row={id:id("ureport"),submission_id:String(x.submission_id),reason:String(x.reason).slice(0,500),contact:String(x.contact||"").slice(0,200),status:"NEW",created_at:new Date().toISOString()};
      db.urban_reports.push(row);await save(db);return json(res,201,{ok:true,id:row.id});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/moderate"){
      requireAdmin(req);
      const x=await body(req);
      const row=db.urban_submissions.find(v=>v.id===x.submission_id);
      if(!row)throw new Error("submission not found");
      const status=String(x.status||"").toUpperCase();
      if(!["LIVE","HIDDEN","REMOVED"].includes(status))throw new Error("invalid status");
      row.status=status;row.moderated_at=new Date().toISOString();await save(db);return json(res,200,{id:row.id,status:row.status});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/art/submissions"){
      const x=await body(req);
      if(!x.title||!x.creator_name||!x.contact||!x.image_data)throw new Error("title, creator_name, contact and image required");
      if(x.rights_declared!==true)throw new Error("rights declaration required");
      const image=String(x.image_data||"");
      const m=image.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
      if(!m)throw new Error("image must be JPEG, PNG or WebP");
      const approxBytes=Math.floor(m[2].length*3/4);
      if(approxBytes>3_000_000)throw new Error("image must be 3MB or smaller after optimisation");
      const row={
        id:id("uart"),
        title:String(x.title).trim().slice(0,120),
        creator_name:String(x.creator_name).trim().slice(0,120),
        contact:String(x.contact).trim().slice(0,200),
        artist_credit:String(x.artist_credit||"").trim().slice(0,160),
        location:String(x.location||"").trim().slice(0,160),
        story:String(x.story||"").trim().slice(0,1200),
        image_data:image,
        rights_declared:true,
        status:"PENDING",
        created_at:new Date().toISOString()
      };
      db.urban_art_submissions.push(row);await save(db);
      return json(res,201,{id:row.id,status:row.status,title:row.title,created_at:row.created_at});
    }

    if(req.method==="GET"&&u.pathname==="/api/urban/art/chart"){
      const limit=Math.min(100,Math.max(1,Number(u.searchParams.get("limit")||50)));
      const live=db.urban_art_submissions.filter(v=>v.status==="LIVE");
      const ranked=live.map(v=>{
        const votes=db.urban_art_votes.filter(x=>x.submission_id===v.id).length;
        const {contact,...publicRow}=v;
        return {...publicRow,votes};
      }).sort((a,b)=>b.votes-a.votes||new Date(b.created_at)-new Date(a.created_at))
        .slice(0,limit).map((v,i)=>({...v,rank:i+1}));
      return json(res,200,{count:ranked.length,ranking:"unique public support votes; ties by newest submission",items:ranked});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/art/vote"){
      const x=await body(req);
      if(!x.submission_id||!x.contact)throw new Error("submission_id and contact required");
      const submission=db.urban_art_submissions.find(v=>v.id===x.submission_id&&v.status==="LIVE");
      if(!submission)throw new Error("art submission not found");
      const voter_hash=crypto.createHash("sha256").update(String(x.contact).trim().toLowerCase()).digest("hex");
      if(db.urban_art_votes.some(v=>v.submission_id===submission.id&&v.voter_hash===voter_hash))throw new Error("already voted");
      db.urban_art_votes.push({id:id("uavote"),submission_id:submission.id,voter_hash,created_at:new Date().toISOString()});
      await save(db);
      return json(res,201,{ok:true,submission_id:submission.id,votes:db.urban_art_votes.filter(v=>v.submission_id===submission.id).length});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/art/report"){
      const x=await body(req);
      if(!x.submission_id||!x.reason)throw new Error("submission_id and reason required");
      if(!db.urban_art_submissions.some(v=>v.id===x.submission_id))throw new Error("art submission not found");
      const row={id:id("uareport"),submission_id:String(x.submission_id),reason:String(x.reason).slice(0,500),contact:String(x.contact||"").slice(0,200),status:"NEW",created_at:new Date().toISOString()};
      db.urban_art_reports.push(row);await save(db);return json(res,201,{ok:true,id:row.id});
    }

    if(req.method==="POST"&&u.pathname==="/api/urban/art/moderate"){
      requireAdmin(req);
      const x=await body(req);
      const row=db.urban_art_submissions.find(v=>v.id===x.submission_id);
      if(!row)throw new Error("art submission not found");
      const status=String(x.status||"").toUpperCase();
      if(!["LIVE","HIDDEN","REMOVED","PENDING"].includes(status))throw new Error("invalid status");
      row.status=status;row.moderated_at=new Date().toISOString();await save(db);
      return json(res,200,{id:row.id,status:row.status});
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
      await save(db);return json(res,200,{imported:imported.length,ids:imported});
    }

    if(req.method==="POST"&&u.pathname==="/api/music/order-interest"){
      const x=await body(req);
      if(!x.name||!x.contact||!x.item_id)throw new Error("name, contact and item_id required");
      const item=db.music_catalog.find(v=>v.id===x.item_id);
      if(!item)throw new Error("music item not found");
      const row={id:id("morder"),item_id:item.id,name:String(x.name).trim(),contact:String(x.contact).trim(),phone:String(x.phone||"").trim(),quantity:Math.max(1,Number(x.quantity||1)),status:"NEW",created_at:new Date().toISOString()};
      db.music_orders.push(row);await save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/music/drop-signup"){
      const x=await body(req);
      if(!x.contact)throw new Error("contact required");
      const row={id:id("drop"),name:String(x.name||"").trim(),contact:String(x.contact).trim(),interests:Array.isArray(x.interests)?x.interests.map(String):[],created_at:new Date().toISOString()};
      db.drop_signups.push(row);await save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/swap/offer"){
      const x=await body(req);
      if(!x.name||!x.contact||!x.item_type||!x.description)throw new Error("name, contact, item_type and description required");
      const row={id:id("swap"),name:String(x.name).trim(),contact:String(x.contact).trim(),phone:String(x.phone||"").trim(),item_type:String(x.item_type).trim(),artist:String(x.artist||"").trim(),title:String(x.title||"").trim(),quantity:Math.max(1,Number(x.quantity||1)),condition:String(x.condition||"unspecified").trim(),description:String(x.description).trim(),asking_price:String(x.asking_price||"").trim(),status:"NEW",created_at:new Date().toISOString()};
      db.swap_offers.push(row);await save(db);return json(res,201,row);
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
      db.leads.push(row);await save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/events"){
      const x=await body(req);
      const row={id:id("evt"),type:String(x.type||"interaction").slice(0,80),label:String(x.label||"").slice(0,200),href:String(x.href||"").slice(0,500),created_at:new Date().toISOString()};
      db.events.push(row);await save(db);return json(res,201,{ok:true});
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
      db.equipment.push(row);await save(db);return json(res,201,row);
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
      db.enquiries.push(row);await save(db);return json(res,201,row);
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
      db.enquiries.push(enquiry);if(quote)db.quotes.push(quote);await save(db);
      return json(res,201,{enquiry,quote});
    }

    if(req.method==="POST"&&route(u,"/quotes","/api/quotes")){
      requireCrmAccess(req);
      const x=await body(req),enq=db.enquiries.find(v=>v.id===x.enquiry_id);
      if(!enq)throw new Error("enquiry not found");
      const eq=db.equipment.find(v=>v.id===enq.equipment_id);
      if(!eq)throw new Error("equipment not found");
      const row={id:id("quo"),...createQuote(enq,eq)};db.quotes.push(row);await save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&u.pathname==="/api/quotes/send"){
      requireCrmAccess(req);
      const x=await body(req);
      const quote=db.quotes.find(v=>v.id===x.quote_id);
      if(!quote)throw new Error("quote not found");
      if(quote.status==="ACCEPTED")throw new Error("accepted quote cannot be resent");
      const enq=db.enquiries.find(v=>v.id===quote.enquiry_id);
      if(!enq)throw new Error("enquiry not found");
      const origin=String(process.env.MCQ_PUBLIC_BASE_URL||((req.headers["x-forwarded-proto"]||"https")+"://"+req.headers.host)).replace(/\/$/,"");
      const delivery=await deliverQuote({quote,enquiry:enq,origin});
      quote.status="SENT";
      quote.sent_at=new Date().toISOString();
      quote.delivery_provider=delivery.provider;
      quote.provider_message_id=delivery.message_id;
      db.crm_events.push({
        id:id("receipt"),entity_type:"quote",entity_id:quote.id,status:"SENT",owner:"operator",
        next_action:"Await customer deposit",note:JSON.stringify({provider:delivery.provider,provider_message_id:delivery.message_id,recipient:delivery.recipient}),
        created_at:new Date().toISOString()
      });
      await save(db);
      return json(res,200,{sent:true,quote_id:quote.id,provider:delivery.provider,provider_message_id:delivery.message_id});
    }

    if(req.method==="POST"&&u.pathname==="/api/payments/checkout"){
      const x=await body(req);
      const quote=db.quotes.find(v=>v.id===x.quote_id);
      if(!quote)throw new Error("quote not found");
      const enq=db.enquiries.find(v=>v.id===quote.enquiry_id);
      if(!enq)throw new Error("enquiry not found");
      const origin=String(process.env.MCQ_PUBLIC_BASE_URL||((req.headers["x-forwarded-proto"]||"https")+"://"+req.headers.host)).replace(/\/$/,"");
      const session=await createStripeCheckout({quote,enquiry:enq,origin});
      return json(res,201,{checkout_url:session.url,session_id:session.id});
    }

    if(req.method==="POST"&&u.pathname==="/api/payments/webhook"){
      const payload=await rawBody(req);
      const signature=String(req.headers["stripe-signature"]||"");
      const secret=String(process.env.STRIPE_WEBHOOK_SECRET||"").trim();
      if(!secret)throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
      if(!verifyStripeSignature(payload,signature,secret))return json(res,400,{error:"invalid stripe signature"});
      let event;try{event=JSON.parse(payload)}catch{return json(res,400,{error:"invalid webhook JSON"})}
      if(event?.type!=="checkout.session.completed")return json(res,200,{received:true,ignored:true});
      if(db.payments.some(v=>v.provider_event_id&&v.provider_event_id===String(event.id)))return json(res,200,{received:true,duplicate:true});
      const quoteId=String(event?.data?.object?.metadata?.quote_id||event?.data?.object?.client_reference_id||"");
      const quote=db.quotes.find(v=>v.id===quoteId);
      if(!quote)return json(res,404,{error:"quote not found"});
      const verified=verifiedDepositFromStripeEvent(event,quote);
      if(!verified)return json(res,200,{received:true,ignored:true});
      if(db.payments.some(v=>v.reference===verified.reference))return json(res,200,{received:true,duplicate:true});
      const row={id:id("pay"),...verified};
      db.payments.push(row);
      db.crm_events.push({
        id:id("receipt"),entity_type:"payment",entity_id:row.id,status:"RECEIVED",owner:"provider",
        next_action:"Confirm booking",note:JSON.stringify({provider:"stripe",provider_event_id:row.provider_event_id,reference:row.reference,amount_pence:row.amount_pence,verified:true}),
        created_at:new Date().toISOString()
      });
      await save(db);
      return json(res,200,{received:true,payment_id:row.id,verified:true});
    }

    if(req.method==="POST"&&route(u,"/payments/confirm","/api/payments/confirm")){
      requireAdmin(req);
      if(process.env.NODE_ENV!=="test"&&process.env.MCQ_STATE_MODE!=="local"){
        return json(res,410,{error:"manual payment confirmation is disabled; production RECEIVED status requires signed provider evidence"});
      }
      const x=await body(req);assertPence(x.amount_pence);
      if(!x.reference)throw new Error("test payment reference required");
      if(!db.quotes.some(q=>q.id===x.quote_id))throw new Error("quote not found");
      const row={id:id("pay"),quote_id:x.quote_id,amount_pence:x.amount_pence,reference:String(x.reference).trim(),status:"RECEIVED",verified:false,provider:"test",received_at:new Date().toISOString()};
      db.payments.push(row);await save(db);return json(res,201,row);
    }

    if(req.method==="POST"&&route(u,"/bookings","/api/bookings")){
      requireAdmin(req);
      const x=await body(req),quote=db.quotes.find(v=>v.id===x.quote_id),payment=db.payments.find(v=>v.quote_id===x.quote_id&&v.status==="RECEIVED"&&(v.verified===true||process.env.NODE_ENV==="test"||process.env.MCQ_STATE_MODE==="local"));
      if(!quote||!payment)throw new Error("quote and verified deposit required");
      const enq=db.enquiries.find(v=>v.id===quote.enquiry_id);
      const row={id:id("book"),...confirmBooking({quote,payment,start_at:enq.start_at,end_at:enq.end_at,bookings:db.bookings}),enquiry_id:enq.id,quote_id:quote.id,confirmed_at:new Date().toISOString()};
      db.bookings.push(row);await save(db);return json(res,201,row);
    }

    if(req.method==="GET"&&u.pathname==="/api/admin/crm"){
      requireCrmAccess(req);
      const openStatuses=new Set(["NEW","CONTACT","QUALIFIED","QUOTE","FOLLOW_UP","WAITING_CUSTOMER"]);
      const now=Date.now();
      const decorate=(type,row)=>{
        const status=String(row.status||"NEW").toUpperCase();
        const nextAt=row.crm_next_action_at||"";
        const nextMs=nextAt?Date.parse(nextAt):NaN;
        return {
          entity_type:type,
          id:row.id,
          name:row.name||row.customer_name||"",
          contact:row.contact||"",
          phone:row.phone||"",
          interest:row.interest||row.event_type||row.item_type||"",
          source:row.source||type,
          customer_key:customerKey(row),
          status,
          owner:row.crm_owner||"",
          next_action:row.crm_next_action||"",
          next_action_at:nextAt,
          overdue:Number.isFinite(nextMs)&&nextMs<now&&!["WON","LOST","CLOSED"].includes(status),
          note:row.crm_note||"",
          created_at:row.created_at||"",
          updated_at:row.crm_updated_at||row.created_at||""
        };
      };
      const items=[
        ...db.leads.map(v=>decorate("lead",v)),
        ...db.enquiries.map(v=>decorate("enquiry",v)),
        ...db.swap_offers.map(v=>decorate("swap_offer",v))
      ].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
      const open=items.filter(v=>openStatuses.has(v.status));
      const unowned=open.filter(v=>!v.owner);
      const withoutNextAction=open.filter(v=>!v.next_action);
      const overdue=open.filter(v=>v.overdue);
      const relatedByCustomer=items.reduce((acc,item)=>{
        (acc[item.customer_key]??=[]).push({entity_type:item.entity_type,id:item.id,status:item.status,interest:item.interest,created_at:item.created_at});
        return acc;
      },{});
      const queue=open.slice().sort((a,b)=>{
        if(a.overdue!==b.overdue)return a.overdue?-1:1;
        if(!!a.next_action_at!==!!b.next_action_at)return a.next_action_at?-1:1;
        return String(a.next_action_at||a.created_at).localeCompare(String(b.next_action_at||b.created_at));
      });
      return json(res,200,{
        source:"MCQ production",
        counts:{
          customers:items.length,
          open:open.length,
          overdue:overdue.length,
          unowned:unowned.length,
          without_next_action:withoutNextAction.length,
          leads:db.leads.length,
          hire_enquiries:db.enquiries.length,
          swap_offers:db.swap_offers.length,
          quotes:db.quotes.length,
          bookings:db.bookings.length,
          payments:db.payments.length
        },
        alerts:{overdue,unowned,without_next_action:withoutNextAction},
        queue,
        related_by_customer:relatedByCustomer,
        open,
        items,
        recent_events:db.crm_events.slice(-100).reverse()
      });
    }

    if(req.method==="GET"&&u.pathname==="/api/admin/crm/queue"){
      requireCrmAccess(req);
      const openStatuses=new Set(["NEW","CONTACT","QUALIFIED","QUOTE","FOLLOW_UP","WAITING_CUSTOMER"]);
      const now=Date.now();
      const rows=[
        ...db.leads.map(v=>({entity_type:"lead",...v})),
        ...db.enquiries.map(v=>({entity_type:"enquiry",...v})),
        ...db.swap_offers.map(v=>({entity_type:"swap_offer",...v}))
      ].map(row=>{
        const status=String(row.status||"NEW").toUpperCase();
        const nextAt=row.crm_next_action_at||"";
        const nextMs=nextAt?Date.parse(nextAt):NaN;
        return {
          entity_type:row.entity_type,id:row.id,name:row.name||row.customer_name||"",contact:row.contact||"",
          status,owner:row.crm_owner||"",next_action:row.crm_next_action||"",next_action_at:nextAt,
          overdue:Number.isFinite(nextMs)&&nextMs<now&&!["WON","LOST","CLOSED"].includes(status),
          customer_key:customerKey(row),created_at:row.created_at||""
        };
      }).filter(v=>openStatuses.has(v.status))
      .sort((a,b)=>{
        if(a.overdue!==b.overdue)return a.overdue?-1:1;
        if(!!a.next_action_at!==!!b.next_action_at)return a.next_action_at?-1:1;
        return String(a.next_action_at||a.created_at).localeCompare(String(b.next_action_at||b.created_at));
      });
      return json(res,200,{source:"MCQ production",generated_at:new Date().toISOString(),items:rows});
    }

    if(req.method==="GET"&&u.pathname==="/api/admin/crm/queue"){
      requireCrmAccess(req);
      const openStatuses=new Set(["NEW","CONTACT","QUALIFIED","QUOTE","FOLLOW_UP","WAITING_CUSTOMER"]);
      const now=Date.now();
      const rows=[
        ...db.leads.map(v=>({entity_type:"lead",...v})),
        ...db.enquiries.map(v=>({entity_type:"enquiry",...v})),
        ...db.swap_offers.map(v=>({entity_type:"swap_offer",...v}))
      ].map(row=>{
        const status=String(row.status||"NEW").toUpperCase();
        const nextAt=row.crm_next_action_at||"";
        const nextMs=nextAt?Date.parse(nextAt):NaN;
        return {
          entity_type:row.entity_type,id:row.id,name:row.name||row.customer_name||"",contact:row.contact||"",
          status,owner:row.crm_owner||"",next_action:row.crm_next_action||"",next_action_at:nextAt,
          overdue:Number.isFinite(nextMs)&&nextMs<now&&!["WON","LOST","CLOSED"].includes(status),
          customer_key:customerKey(row),created_at:row.created_at||""
        };
      }).filter(v=>openStatuses.has(v.status))
      .sort((a,b)=>{
        if(a.overdue!==b.overdue)return a.overdue?-1:1;
        if(!!a.next_action_at!==!!b.next_action_at)return a.next_action_at?-1:1;
        return String(a.next_action_at||a.created_at).localeCompare(String(b.next_action_at||b.created_at));
      });
      return json(res,200,{source:"MCQ production",generated_at:new Date().toISOString(),items:rows});
    }

    if(req.method==="GET"&&u.pathname==="/api/admin/crm/detail"){
      requireCrmAccess(req);
      const entityType=String(u.searchParams.get("entity_type")||"");
      const entityId=String(u.searchParams.get("entity_id")||"");
      const maps={lead:db.leads,enquiry:db.enquiries,swap_offer:db.swap_offers};
      const rows=maps[entityType];
      if(!rows)throw new Error("entity_type must be lead, enquiry or swap_offer");
      const row=rows.find(v=>v.id===entityId);
      if(!row)throw new Error("CRM entity not found");
      const quotes=entityType==="enquiry"?db.quotes.filter(v=>v.enquiry_id===entityId):[];
      const quoteIds=new Set(quotes.map(v=>v.id));
      const payments=db.payments.filter(v=>quoteIds.has(v.quote_id));
      const bookings=db.bookings.filter(v=>v.enquiry_id===entityId||quoteIds.has(v.quote_id));
      const timeline=db.crm_events.filter(v=>v.entity_type===entityType&&v.entity_id===entityId).slice().reverse();
      const key=customerKey(row);
      const related=[
        ...db.leads.map(v=>({entity_type:"lead",row:v})),
        ...db.enquiries.map(v=>({entity_type:"enquiry",row:v})),
        ...db.swap_offers.map(v=>({entity_type:"swap_offer",row:v}))
      ].filter(v=>customerKey(v.row)===key&&!(v.entity_type===entityType&&v.row.id===entityId))
       .map(v=>({entity_type:v.entity_type,id:v.row.id,status:String(v.row.status||"NEW").toUpperCase(),interest:v.row.interest||v.row.event_type||v.row.item_type||"",created_at:v.row.created_at||""}));
      return json(res,200,{entity_type:entityType,item:row,customer_key:key,related,timeline,quotes,payments,bookings});
    }

    if(req.method==="POST"&&u.pathname==="/api/admin/crm/quote"){
      requireCrmAccess(req);
      const x=await body(req);
      const enq=db.enquiries.find(v=>v.id===x.enquiry_id);
      if(!enq)throw new Error("enquiry not found");
      const existing=db.quotes.find(v=>v.enquiry_id===enq.id);
      if(existing)return json(res,200,{ok:true,created:false,quote:existing});
      const eq=db.equipment.find(v=>v.id===enq.equipment_id);
      if(!eq)throw new Error("equipment not found");
      const row={id:id("quo"),...createQuote(enq,eq)};
      db.quotes.push(row);
      enq.status="QUOTE";
      enq.crm_updated_at=new Date().toISOString();
      const event={id:id("crm"),entity_type:"enquiry",entity_id:enq.id,status:"QUOTE",owner:enq.crm_owner||"",next_action:enq.crm_next_action||"",next_action_at:enq.crm_next_action_at||"",note:"Quote created from CRM",created_at:enq.crm_updated_at};
      db.crm_events.push(event);
      await save(db);
      return json(res,201,{ok:true,created:true,quote:row,event});
    }

    if(req.method==="POST"&&u.pathname==="/api/admin/crm/update"){
      requireCrmAccess(req);
      const x=await body(req);
      const idempotencyKey=String(req.headers["idempotency-key"]||"").trim().slice(0,200);
      const result=applyCrmUpdate(db,x,idempotencyKey,{idFn:id});
      if(!result.idempotent_replay)await save(db);
      return json(res,200,result);
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
    const status=e.message==="unauthorized"?401:/access is not configured/.test(e.message)?503:/not found/.test(e.message)?404:/unavailable/.test(e.message)?409:/Farnell API returned/.test(e.message)?502:400;
    return json(res,status,{error:e.message});
  }
});
if(process.env.NODE_ENV!=="test"){
  const port=Number(process.env.PORT||3000);
  server.listen(port,()=>{
    console.log(`MCQ Audio listening on ${port}`);
    load()
      .then(async()=>{
        durableStateReady=true;
        durableStateError="";
        console.log("MCQ durable state ready");
        if(String(process.env.MCQ_EXACTLY_ONCE_PROOF||"").trim().toLowerCase()==="true"){
          try{
            const proof=await runExactlyOnceProductionProof();
            console.log("MCQ_EXACTLY_ONCE_PROOF "+JSON.stringify(proof));
          }catch(error){
            console.error("MCQ_EXACTLY_ONCE_PROOF_FAILED",String(error?.message||error));
          }
        }
      })
      .catch(error=>{durableStateReady=false;durableStateError=String(error?.message||error);console.error("MCQ durable state unavailable at startup:",durableStateError)});
  });
}
export default server;
