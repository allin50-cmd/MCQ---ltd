import fs from "node:fs";
import path from "node:path";

const file=process.env.MCQ_DATA_FILE||path.join(process.cwd(),"data","mcq.json");
const empty={equipment:[],enquiries:[],quotes:[],payments:[],bookings:[],leads:[],events:[],music_catalog:[],music_orders:[],swap_offers:[],drop_signups:[]};

export function load(){
  try{
    const parsed=JSON.parse(fs.readFileSync(file,"utf8"));
    return {...structuredClone(empty),...parsed,
      equipment:Array.isArray(parsed.equipment)?parsed.equipment:[],
      enquiries:Array.isArray(parsed.enquiries)?parsed.enquiries:[],
      quotes:Array.isArray(parsed.quotes)?parsed.quotes:[],
      payments:Array.isArray(parsed.payments)?parsed.payments:[],
      bookings:Array.isArray(parsed.bookings)?parsed.bookings:[],
      leads:Array.isArray(parsed.leads)?parsed.leads:[],
      events:Array.isArray(parsed.events)?parsed.events:[],
      music_catalog:Array.isArray(parsed.music_catalog)?parsed.music_catalog:[],
      music_orders:Array.isArray(parsed.music_orders)?parsed.music_orders:[],
      swap_offers:Array.isArray(parsed.swap_offers)?parsed.swap_offers:[],
      drop_signups:Array.isArray(parsed.drop_signups)?parsed.drop_signups:[]
    };
  }catch(e){
    if(e.code==="ENOENT")return structuredClone(empty);
    throw e;
  }
}
export function save(db){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify(db,null,2));
}
export function id(prefix){return prefix+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8)}
