import fs from "node:fs";
import path from "node:path";

const file=process.env.MCQ_DATA_FILE||path.join(process.cwd(),"data","mcq.json");
const empty={equipment:[],enquiries:[],quotes:[],payments:[],bookings:[],leads:[],events:[],crm_events:[],idempotency_receipts:[],music_catalog:[],music_orders:[],swap_offers:[],drop_signups:[],urban_submissions:[],urban_votes:[],urban_reports:[],urban_art_submissions:[],urban_art_votes:[],urban_art_reports:[],live_stream_events:[],stream_reminders:[],stream_track_submissions:[]};
let durableVersion=null;

function normalize(parsed={}){
  const out={...structuredClone(empty),...parsed};
  for(const key of Object.keys(empty))out[key]=Array.isArray(parsed[key])?parsed[key]:[];
  return out;
}
function localLoad(){
  try{return normalize(JSON.parse(fs.readFileSync(file,"utf8")))}
  catch(e){if(e.code==="ENOENT")return structuredClone(empty);throw e}
}
function config(){
  const base=String(process.env.AGENTX_SERVICE_URL||"").replace(/\/$/,"");
  const token=String(process.env.MCQ_SERVICE_TOKEN||"");
  return base&&token?{base,token}:null;
}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function remote(method,payload){
  const cfg=config();if(!cfg)throw new Error("durable MCQ state is not configured");
  const maxAttempts=method==="GET"?5:1;
  let lastError;
  for(let attempt=1;attempt<=maxAttempts;attempt++){
    try{
      const r=await fetch(cfg.base+"/api/internal/mcq/state",{
        method,
        headers:{"content-type":"application/json","x-mcq-service-token":cfg.token},
        body:payload?JSON.stringify(payload):undefined,
        signal:AbortSignal.timeout(15000)
      });
      const text=await r.text();
      let data={};try{data=text?JSON.parse(text):{}}catch{}
      if(r.ok)return data;
      const e=new Error(data.error||("durable MCQ state returned HTTP "+r.status));
      e.status=r.status;
      lastError=e;
      const transient=method==="GET"&&[502,503,504].includes(r.status);
      if(!transient||attempt===maxAttempts)throw e;
    }catch(error){
      lastError=error;
      const status=Number(error?.status||0);
      const transient=method==="GET"&&(status===0||[502,503,504].includes(status));
      if(!transient||attempt===maxAttempts)throw error;
    }
    await sleep(Math.min(1000*attempt,4000));
  }
  throw lastError||new Error("durable MCQ state unavailable");
}
export async function load(){
  if(process.env.NODE_ENV==="test"||process.env.MCQ_STATE_MODE==="local")return localLoad();
  const mode=process.env.MCQ_STATE_MODE||"durable";
  try{const data=await remote("GET");durableVersion=data.version;return normalize(data.payload)}
  catch(e){
    if(e.status===404&&mode==="migrate"){const local=localLoad();const created=await remote("PUT",{payload:local,expected_version:0});durableVersion=created.version;return local}
    throw e;
  }
}
export async function save(db){
  if(process.env.NODE_ENV==="test"||process.env.MCQ_STATE_MODE==="local"){
    fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(db,null,2));return;
  }
  const data=await remote("PUT",{payload:db,expected_version:durableVersion});
  durableVersion=data.version;
}
export function id(prefix){return prefix+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8)}
