const url="https://www.gear4music.com/dj-equipment/dj-controllers";
const html=await (await fetch(url,{headers:{"user-agent":"Mozilla/5.0"}})).text();
console.log("bytes",html.length);
for(const name of ["Numark MixTrack Go","AlphaTheta DDJ-FLX2","Pioneer DJ DDJ-REV1","Denon DJ Prime GO+"]){
  const i=html.toLowerCase().indexOf(name.toLowerCase());
  console.log("\nNAME",name,"INDEX",i);
  if(i>=0){
    const s=html.slice(Math.max(0,i-5000),Math.min(html.length,i+5000));
    const urls=[...s.matchAll(/https?:[^"'<> ]+?(?:\.jpg|\.jpeg|\.png|\.webp)(?:\?[^"'<> ]*)?/gi)].map(m=>m[0].replace(/&amp;/g,"&"));
    console.log([...new Set(urls)].slice(0,10));
  }
}
