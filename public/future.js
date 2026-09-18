const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
async function api(url,opt={}){const r=await fetch(url,{...opt,headers:{"content-type":"application/json",...(opt.headers||{})}});const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(d?.error||d?.message||`Request failed (${r.status})`);return d}

$$("[data-scene]").forEach(el=>el.addEventListener("click",()=>$("#"+el.dataset.scene)?.scrollIntoView({behavior:"smooth"})));

const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("is-visible")}),{threshold:.22});
$$(".reveal-copy").forEach(el=>reveal.observe(el));

const cards=$$(".object-card");let objectIndex=0;
function showObject(i){objectIndex=(i+cards.length)%cards.length;cards.forEach((c,n)=>c.classList.toggle("is-active",n===objectIndex));$("#object-label").textContent=cards[objectIndex]?.dataset.label||""}
$("#obj-prev")?.addEventListener("click",()=>showObject(objectIndex-1));
$("#obj-next")?.addEventListener("click",()=>showObject(objectIndex+1));
showObject(0);

let touchStartX=null;
$(".object-gallery")?.addEventListener("touchstart",e=>touchStartX=e.touches[0].clientX,{passive:true});
$(".object-gallery")?.addEventListener("touchend",e=>{if(touchStartX==null)return;const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>45)showObject(objectIndex+(dx<0?1:-1));touchStartX=null},{passive:true});

async function loadChart(){
 const out=$("#future-chart");if(!out)return;
 try{
   const d=await api("/api/urban/chart?limit=5");
   if(!d.items?.length){out.innerHTML='<div class="chart-loading">The chart is waiting for the first public tracks.</div>';return}
   out.innerHTML=d.items.slice(0,5).map(x=>`<article class="chart-row"><div class="chart-rank">${String(x.rank).padStart(2,"0")}</div><div><h3>${esc(x.artist_name)} — ${esc(x.title)}</h3><p>${esc(x.genre)} • ${x.votes} support</p></div><button data-support="${esc(x.id)}">＋</button></article>`).join("");
   $$("[data-support]",out).forEach(b=>b.addEventListener("click",()=>support(b)));
 }catch(err){out.innerHTML='<div class="chart-loading">'+esc(err.message)+'</div>'}
}
async function support(button){
 const contact=prompt("Email to support this track once:");
 if(!contact)return;
 button.disabled=true;
 try{await api("/api/urban/vote",{method:"POST",body:JSON.stringify({submission_id:button.dataset.support,contact})});button.textContent="✓";setTimeout(loadChart,500)}
 catch(err){button.textContent="!";button.title=err.message;setTimeout(()=>{button.disabled=false;button.textContent="＋"},1200)}
}

async function loadLive(){
 const meta=$("#live-meta");if(!meta)return;
 try{
   const x=await api("/api/urban/live");
   const when=x.starts_at?new Date(x.starts_at).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"}):"Date to be announced";
   meta.innerHTML=`<small>NEXT SHOW</small><strong>${esc(when)}</strong>`;
 }catch{meta.innerHTML="<small>NEXT SHOW</small><strong>Date to be announced</strong>"}
}

function updateProgress(){
 const max=document.documentElement.scrollHeight-innerHeight;
 const pct=max>0?(scrollY/max)*100:0;
 $("#scene-progress-bar").style.width=Math.min(100,Math.max(0,pct))+"%";
}
addEventListener("scroll",updateProgress,{passive:true});updateProgress();

const scenes=$$(".scene");
const sceneObs=new IntersectionObserver(entries=>{
 entries.forEach(e=>{
   if(e.isIntersecting){
     history.replaceState(null,"","#"+e.target.id);
   }
 })
},{threshold:.62});
scenes.forEach(s=>sceneObs.observe(s));

loadChart();
loadLive();