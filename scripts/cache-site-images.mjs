import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root=path.resolve("public");
const outDir=path.join(root,"assets","products");
fs.mkdirSync(outDir,{recursive:true});

const files=[];
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name), st=fs.statSync(p);
    if(st.isDirectory()){
      if(p===outDir)continue;
      walk(p);
    }else if(/\.(?:html|js)$/i.test(name)) files.push(p);
  }
}
walk(root);

const sourceByFile=new Map(files.map(f=>[f,fs.readFileSync(f,"utf8")]));
const productHosts=["sony.scene7.com","shure.widen.net","www.pioneerdj.com","panasonic.scene7.com"];
const urls=new Set();

for(const source of sourceByFile.values()){
  for(const m of source.matchAll(/https:\/\/[^"'\s)<>]+/g)){
    const raw=m[0];
    try{
      const u=new URL(raw.replace(/&amp;/g,"&"));
      if(productHosts.includes(u.hostname)) urls.add(raw);
    }catch{}
  }
}

const extFor=type=>{
  if(/png/i.test(type))return ".png";
  if(/webp/i.test(type))return ".webp";
  if(/svg/i.test(type))return ".svg";
  if(/gif/i.test(type))return ".gif";
  return ".jpg";
};

async function download(raw){
  const url=raw.replace(/&amp;/g,"&");
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),25000);
  let res;
  try{
    res=await fetch(url,{redirect:"follow",signal:controller.signal,headers:{
      "user-agent":"Mozilla/5.0 (compatible; MCQ-Audio-Product-Asset-Validator/2.0)",
      "accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    }});
  }finally{clearTimeout(timeout)}
  if(!res.ok)throw new Error(`HTTP ${res.status}`);
  const type=(res.headers.get("content-type")||"").toLowerCase();
  if(!type.startsWith("image/"))throw new Error(`not image content-type: ${type||"missing"}`);
  const bytes=Buffer.from(await res.arrayBuffer());
  if(bytes.length<5000)throw new Error(`image too small: ${bytes.length} bytes`);
  const hash=crypto.createHash("sha256").update(url).digest("hex").slice(0,18);
  const filename=hash+extFor(type);
  fs.writeFileSync(path.join(outDir,filename),bytes);
  return "/assets/products/"+filename;
}

const mapping=new Map();
for(const raw of urls){
  try{
    const local=await download(raw);
    mapping.set(raw,local);
    console.log(`PRODUCT IMAGE VERIFIED: ${raw} -> ${local}`);
  }catch(err){
    console.error(`REQUIRED PRODUCT IMAGE FAILED: ${raw}: ${err.message}`);
    process.exitCode=1;
  }
}
if(process.exitCode)process.exit(process.exitCode);

for(const [file,source] of sourceByFile){
  let next=source;
  for(const [raw,local] of mapping) next=next.split(raw).join(local);
  if(next!==source)fs.writeFileSync(file,next,"utf8");
}

fs.writeFileSync(path.join(outDir,"manifest.json"),JSON.stringify(Object.fromEntries(mapping),null,2)+"\n");
console.log(`MCQ PRODUCT IMAGE GATE PASSED: ${mapping.size} manufacturer assets are local.`);
