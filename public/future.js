const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
async function api(url,opt={}){const r=await fetch(url,{...opt,headers:{"content-type":"application/json",...(opt.headers||{})}});const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok)throw new Error(d?.error||d?.message||`Request failed (${r.status})`);return d}

const slides=$$(".slide"),dots=$("#slide-dots");let active=0,timer;
slides.forEach((_,i)=>{const b=document.createElement("button");b.setAttribute("aria-label",`Go to slide ${i+1}`);b.addEventListener("click",()=>go(i,true));dots.appendChild(b)});
function go(i,user=false){active=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle("is-active",n===active));$$("button",dots).forEach((b,n)=>b.classList.toggle("is-active",n===active));if(user)restart()}
function restart(){clearInterval(timer);timer=setInterval(()=>go(active+1),7000)}
$("#prev-slide").addEventListener("click",()=>go(active-1,true));$("#next-slide").addEventListener("click",()=>go(active+1,true));go(0);restart();

$$("[data-jump]").forEach(b=>b.addEventListener("click",()=>$("#"+b.dataset.jump)?.scrollIntoView({behavior:"smooth"})));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("is-visible")}),{threshold:.12});$$(".reveal").forEach(x=>io.observe(x));

$$(".tilt").forEach(card=>{card.addEventListener("pointermove",e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(700px) rotateX(${-y*8}deg) rotateY(${x*10}deg) translateY(-3px)`});card.addEventListener("pointerleave",()=>card.style.transform="")});

let soundOn=false;$("#sound-toggle")?.addEventListener("click",e=>{soundOn=!soundOn;e.currentTarget.textContent=soundOn?"◉":"○";e.currentTarget.setAttribute("aria-pressed",String(soundOn))});

$("#movie-scrubber").addEventListener("input",e=>{const max=Math.max(0,$("#movie-track").scrollWidth-innerWidth*.8),x=max*(Number(e.target.value)/100);$("#movie-track").style.transform=`translateX(-${x}px)`});

$("#future-search").addEventListener("submit",async e=>{e.preventDefault();const q=new FormData(e.currentTarget).get("q")?.trim();if(!q)return;const out=$("#future-search-results");out.innerHTML='<div class="loading">Scanning MCQ catalogue…</div>';try{const d=await api("/api/catalog/search?q="+encodeURIComponent(q));out.innerHTML=d.results?.length?d.results.slice(0,10).map(p=>`<article class="result-card"><img src="${esc(p.image||"")}" alt="${esc((p.brand||"")+" "+(p.name||""))}"><h4>${esc((p.brand||"")+" "+(p.name||""))}</h4><small>${esc(p.source||"MCQ catalogue")} • ${esc(p.availability||"Ask MCQ")}</small><a class="glow-btn" href="/shop">Open in MCQ</a></article>`).join(""):'<div class="loading">No direct match. MCQ can still source it.</div>'}catch(err){out.innerHTML='<div class="loading">'+esc(err.message)+'</div>'}});

async function loadChart(){const out=$("#future-chart");try{const d=await api("/api/urban/chart?limit=5");$("#hero-chart-count").textContent=d.count||"0";out.innerHTML=d.items?.length?d.items.map(x=>`<article class="track-row"><div class="track-rank">${String(x.rank).padStart(2,"0")}</div><div><h3>${esc(x.artist_name)} — ${esc(x.title)}</h3><p>${esc(x.genre)} • ${esc((x.release_stage||"").replaceAll("-"," "))} • ${x.votes} support</p></div><button class="support" data-id="${esc(x.id)}">SUPPORT</button></article>`).join(""):'<div class="loading">The chart is waiting for the first public tracks.</div>';$$(".support",out).forEach(b=>b.addEventListener("click",()=>support(b)))}catch(err){out.innerHTML='<div class="loading">'+esc(err.message)+'</div>'}}
async function support(button){const contact=prompt("Enter your email to support this track once.");if(!contact)return;const old=button.textContent;button.textContent="…";button.disabled=true;try{await api("/api/urban/vote",{method:"POST",body:JSON.stringify({submission_id:button.dataset.id,contact})});button.textContent="SUPPORTED";setTimeout(loadChart,450)}catch(err){button.textContent=err.message==="already supported"?"ALREADY":"RETRY";setTimeout(()=>{button.textContent=old;button.disabled=false},1300)}}

async function loadLive(){try{const x=await api("/api/urban/live");$("#live-meta").innerHTML=`<b>${esc(x.title)}</b><small>${x.starts_at?new Date(x.starts_at).toLocaleString("en-GB"):"Next date to be announced"}</small>`;if(x.stream_embed_url){$("#future-live-player").innerHTML=`<iframe src="${esc(x.stream_embed_url)}" title="${esc(x.title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:0"></iframe>`}}catch{}}
$("#fake-play").addEventListener("click",()=>{const el=$("#future-live-player");el.animate([{transform:"scale(.985)",filter:"brightness(1.6)"},{transform:"scale(1)",filter:"brightness(1)"}],{duration:650,easing:"ease-out"});$("#fake-play").textContent="LIVE"});

window.addEventListener("pointermove",e=>{document.documentElement.style.setProperty("--mx",e.clientX+"px");document.documentElement.style.setProperty("--my",e.clientY+"px")},{passive:true});
loadChart();loadLive();