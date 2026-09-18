const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
async function api(url,opt={}){const r=await fetch(url,{...opt,headers:{"content-type":"application/json",...(opt.headers||{})}});const t=await r.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}if(!r.ok){const e=new Error(d?.error||d?.message||`Request failed (${r.status})`);e.data=d;throw e}return d}
const data=window.MCQ_SHOWCASE;

function ensureDrawer(){
 let drawer=$("#mcq-source-drawer");
 if(drawer)return drawer;
 drawer=document.createElement("section");
 drawer.id="mcq-source-drawer";
 drawer.className="source-drawer";
 drawer.innerHTML=`<button class="source-close" type="button" aria-label="Close">×</button>
 <div class="source-inner">
   <p class="eyebrow" style="color:#8b4f28">BUY THROUGH MCQ</p>
   <h2>Keep it with MCQ.</h2>
   <p id="source-product-copy"></p>
   <form id="source-form">
     <input name="name" placeholder="Name" required>
     <input name="contact" type="email" placeholder="Email" required>
     <input name="phone" placeholder="Phone">
     <select name="budget"><option value="">Budget / target price</option><option>Under £250</option><option>£250–£500</option><option>£500–£1,000</option><option>£1,000–£2,500</option><option>£2,500+</option></select>
     <textarea name="message" rows="4"></textarea>
     <button class="btn" type="submit">Request MCQ price</button>
     <p id="source-status" aria-live="polite"></p>
   </form>
 </div>`;
 document.body.appendChild(drawer);
 drawer.querySelector(".source-close").addEventListener("click",()=>drawer.classList.remove("open"));
 drawer.querySelector("#source-form").addEventListener("submit",async e=>{
   e.preventDefault();const f=e.currentTarget,status=$("#source-status",drawer),d=Object.fromEntries(new FormData(f));status.textContent="Sending…";
   try{const r=await api("/api/leads",{method:"POST",body:JSON.stringify({...d,interest:"Product sourcing",product:drawer.dataset.product||"",source:"mcq-showcase"})});status.textContent=`Received — MCQ reference ${r.id}.`;f.reset()}catch(err){status.textContent=err.message}
 });
 return drawer;
}
function sourceDrawer(product,query){
 const drawer=ensureDrawer();drawer.dataset.product=product||query||"";
 $("#source-product-copy",drawer).textContent=`MCQ will source, advise and quote ${product||query}. Supplier data stays inside MCQ.`;
 drawer.querySelector("[name=message]").value=`I want MCQ to source / supply: ${product||query}.`;
 drawer.classList.add("open");drawer.querySelector("[name=name]").focus();
}
function productCard(p){return `<article class="card"><div class="card-media"><img loading="lazy" src="${esc(p.image)}" alt="${esc(p.brand+" "+p.name)}" onerror="this.style.opacity=.12"></div><div class="card-body"><div class="brand">${esc(p.brand)} / ${esc(p.use)}</div><h3>${esc(p.name)}</h3><div class="price">${esc(p.price)}</div><p>${esc(p.desc)}</p><div class="specs">${p.specs.map(s=>`<span>${esc(s)}</span>`).join("")}</div><div class="actions"><button class="btn source" type="button" data-product="${esc(p.brand+" "+p.name)}" data-query="${esc(p.query)}">Buy / source from MCQ</button><button class="btn alt detail" type="button" data-product="${esc(p.brand+" "+p.name)}">Details</button></div></div></article>`}
for(const tier of data.tiers){const el=document.querySelector(`[data-tier="${tier.id}"] .product-rail`);if(el)el.innerHTML=tier.products.map(productCard).join("")}
$$(".source").forEach(b=>b.addEventListener("click",()=>sourceDrawer(b.dataset.product,b.dataset.query)));
$$(".detail").forEach(b=>b.addEventListener("click",()=>{const p=data.tiers.flatMap(t=>t.products).find(x=>x.brand+" "+x.name===b.dataset.product);if(p)sourceDrawer(p.brand+" "+p.name,p.query)}));

async function runSearch(q){
 q=String(q||$("#shop-search").value||"").trim();if(!q)return;
 const out=$("#live-products");out.innerHTML='<div class="message">Checking MCQ catalogue and live supplier feeds…</div>';
 try{
   const d=await api(`/api/catalog/search?q=${encodeURIComponent(q)}`);
   if(!d.results?.length){out.innerHTML=`<div class="message"><b>No direct match yet.</b><p>MCQ can still source ${esc(q)}.</p><button class="btn source-any" type="button">Ask MCQ to source it</button></div>`;$(".source-any",out).addEventListener("click",()=>sourceDrawer(q,q));return}
   out.innerHTML=d.results.map(p=>`<div class="live-row">${p.image?`<img src="${esc(p.image)}" alt="${esc((p.brand||"")+" "+(p.name||""))}">`:"<div></div>"}<div><b>${esc((p.brand||"")+" "+(p.name||""))}</b><br><small>${esc(p.source||"MCQ catalogue")} • ${esc(p.availability||"Ask MCQ")}</small></div><button class="btn mcq-buy" type="button" data-product="${esc((p.brand||"")+" "+(p.name||q))}">Request MCQ price</button></div>`).join("");
   $$(".mcq-buy",out).forEach(b=>b.addEventListener("click",()=>sourceDrawer(b.dataset.product,q)));
 }catch(err){out.innerHTML=`<div class="message">MCQ search is temporarily unavailable. <button class="btn source-any" type="button">Ask MCQ to source ${esc(q)}</button></div>`;$(".source-any",out)?.addEventListener("click",()=>sourceDrawer(q,q))}
}
$("#shop-search-btn").addEventListener("click",()=>runSearch());$("#shop-search").addEventListener("keydown",e=>{if(e.key==="Enter")runSearch()});
$$("[data-query]").forEach(b=>b.addEventListener("click",()=>{const q=b.dataset.query;if($("#shop-search"))$("#shop-search").value=q;$("#shop")?.scrollIntoView({behavior:"smooth"});setTimeout(()=>runSearch(q),250)}));
