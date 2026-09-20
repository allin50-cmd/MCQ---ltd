import {listMarketCatalog} from "../src/market.js";
function assert(c,m){if(!c)throw new Error(m)}
function pngSize(buf){if(buf.length<24||buf.readUInt32BE(0)!==0x89504e47)return null;return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)}}
function jpegSize(buf){
 if(buf.length<4||buf[0]!==0xff||buf[1]!==0xd8)return null;
 let i=2; while(i+9<buf.length){if(buf[i]!==0xff){i++;continue}const marker=buf[i+1];i+=2;if(marker===0xd8||marker===0xd9)continue;if(i+2>buf.length)break;const len=buf.readUInt16BE(i);if(len<2||i+len>buf.length)break;if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {height:buf.readUInt16BE(i+3),width:buf.readUInt16BE(i+5)};i+=len}return null;
}
const items=listMarketCatalog();
assert(items.length===22,`expected 22 items, got ${items.length}`);
const unique=[...new Set(items.map(x=>x.image))];
const failures=[];
for(const url of unique){
 try{
  const r=await fetch(url,{redirect:"follow",headers:{"user-agent":"MCQ-Audio-image-validator/1.0"}});
  assert(r.ok,`HTTP ${r.status}`);
  const type=(r.headers.get("content-type")||"").toLowerCase();
  assert(type.startsWith("image/"),`non-image content-type ${type}`);
  const buf=Buffer.from(await r.arrayBuffer());
  assert(buf.length>=5000,`payload too small ${buf.length}`);
  const size=pngSize(buf)||jpegSize(buf);
  assert(size,"unsupported/unreadable PNG/JPEG");
  assert(size.width>=500&&size.height>=300,`below threshold ${size.width}x${size.height}`);
  console.log(`PASS ${size.width}x${size.height} ${url}`);
 }catch(e){failures.push({url,error:e.message})}
}
if(failures.length){console.error(JSON.stringify({failures},null,2));process.exit(1)}
console.log(JSON.stringify({ok:true,items:items.length,unique_images:unique.length}));
