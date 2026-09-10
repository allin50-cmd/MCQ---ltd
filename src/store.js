import fs from "node:fs";import path from "node:path";
const file=process.env.MCQ_DATA_FILE||path.join(process.cwd(),"data","mcq.json");
const empty={equipment:[],enquiries:[],quotes:[],payments:[],bookings:[]};
export function load(){try{return JSON.parse(fs.readFileSync(file,"utf8"))}catch(e){if(e.code==="ENOENT")return structuredClone(empty);throw e}}
export function save(db){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(db,null,2));}
export function id(prefix){return prefix+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8)}
