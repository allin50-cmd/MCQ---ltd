const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
async function api(url,opt={}){const r=await fetch(url,{...opt,headers:{"content-type":"application/json",...(opt.headers||{})}});const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok){const e=new Error(d?.error||d?.message||`Request failed (${r.status})`);e.data=d;throw e}return d}
function money(p){return Number.isInteger(p)?new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(p/100):"Ask MCQ"}
function labelType(t){return ({"catalogue":"Catalogue","reissue":"Reissue","exclusive":"Exclusive white label","pre-release":"Pre-release white label","used":"Urban Swap Shop"})[t]||t||"Release"}
function card(x){return `<article class="record-card">
  <div class="record-art">${x.image_url?`<img loading="lazy" src="${esc(x.image_url)}" alt="${esc(x.artist+" – "+x.title)}">`:'<div class="record-fallback" aria-hidden="true"></div>'}</div>
  <div class="record-body">
    <div class="record-meta">${esc(labelType(x.release_type))} / ${esc((x.format||"").toUpperCase())} ${x.catalogue_no?" / "+esc(x.catalogue_no):""}</div>
    <h3>${esc(x.artist)}</h3><p><strong>${esc(x.title)}</strong></p>
    ${x.description?`<p>${esc(x.description)}</p>`:""}
    <div class="record-bottom"><strong>${money(x.price_pence)}</strong><button class="btn dark buy" data-id="${esc(x.id)}" data-title="${esc(x.artist+" — "+x.title)}">Buy / reserve</button></div>
  </div></article>`}
async function loadCatalog(){
 const q=$("#catalog-search").value.trim(),format=$("#format-filter").value,type=$("#type-filter").value;
 const p=new URLSearchParams();if(q)p.set("q",q);if(format)p.set("format",format);if(type)p.set("type",type);
 const grid=$("#catalog-grid");grid.innerHTML='<div class="empty">Loading the MCQ catalogue…</div>';
 try{
  const d=await api("/api/music/catalog?"+p);
  grid.innerHTML=d.items?.length?d.items.map(card).join(""):'<div class="empty"><strong>No catalogue records are loaded for this filter yet.</strong><br>The website will not invent stock. Import the real Vinyl Underground catalogue and it appears here immediately.</div>';
  $$(".buy",grid).forEach(b=>b.addEventListener("click",()=>openBuy(b.dataset.id,b.dataset.title)));
 }catch(e){grid.innerHTML=`<div class="empty">Catalogue unavailable: ${esc(e.message)}</div>`}
}
let timer;$("#catalog-search").addEventListener("input",()=>{clearTimeout(timer);timer=setTimeout(loadCatalog,220)});$("#format-filter").addEventListener("change",loadCatalog);$("#type-filter").addEventListener("change",loadCatalog);
$("#show-mp3").addEventListener("click",()=>{$("#format-filter").value="mp3";$("#catalogue").scrollIntoView({behavior:"smooth"});loadCatalog()});

const buyDialog=$("#buy-dialog"),buyForm=$("#buy-form");
function openBuy(id,title){buyForm.reset();buyForm.item_id.value=id;$("#buy-title").textContent=title;$("#buy-status").textContent="";buyDialog.showModal()}
$("#buy-dialog .dialog-close").addEventListener("click",()=>buyDialog.close());
buyForm.addEventListener("submit",async e=>{e.preventDefault();const st=$("#buy-status"),d=Object.fromEntries(new FormData(buyForm));st.textContent="Sending…";try{const r=await api("/api/music/order-interest",{method:"POST",body:JSON.stringify(d)});st.textContent=`Reserved/requested with MCQ — reference ${r.id}.`}catch(err){st.textContent=err.message}});

const drop=$("#drop-dialog");$("#drop-open").addEventListener("click",()=>drop.showModal());$("#drop-dialog .dialog-close").addEventListener("click",()=>drop.close());
$("#drop-form").addEventListener("submit",async e=>{e.preventDefault();const f=e.currentTarget,fd=new FormData(f),st=$("#drop-status");const interests=fd.getAll("interests");st.textContent="Joining…";try{const r=await api("/api/music/drop-signup",{method:"POST",body:JSON.stringify({name:fd.get("name"),contact:fd.get("contact"),interests})});st.textContent=`You're on the MCQ drop list — ${r.id}.`;f.reset()}catch(err){st.textContent=err.message}});

$("#swap-form").addEventListener("submit",async e=>{e.preventDefault();const f=e.currentTarget,st=$("#swap-status"),d=Object.fromEntries(new FormData(f));st.textContent="Sending collection details…";try{const r=await api("/api/swap/offer",{method:"POST",body:JSON.stringify(d)});st.textContent=`Received by Urban Swap Shop — reference ${r.id}. MCQ can appraise from here.`;f.reset()}catch(err){st.textContent=err.message}});

loadCatalog();