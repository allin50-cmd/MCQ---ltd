import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load, save, id } from "./store.js";
import { assertPence, isAvailable, createQuote, confirmBooking } from "./core.js";
import { listSuppliers, searchFarnell } from "./suppliers.js";

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".ico":"image/x-icon"};
const securityHeaders={
  "x-content-type-options":"nosniff",
  "referrer-policy":"strict-origin-when-cross-origin",
  "permissions-policy":"camera=(), microphone=(), geolocation=()",
  "content-security-policy":"default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.element14.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
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
  ["/dj","/dj.html"]
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
    if(req.method==="GET"&&route(u,"/suppliers","/api/suppliers")) return json(res,200,listSuppliers());

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
      return json(res,200,{equipment:db.equipment.length,enquiries:db.enquiries.length,quotes:db.quotes.length,bookings:db.bookings.length,payments:db.payments.length,leads:db.leads.length,events:db.events.length});
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
