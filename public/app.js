const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
async function api(url,opt={}){const res=await fetch(url,{...opt,headers:{"content-type":"application/json",...(opt.headers||{})}});const t=await res.text();let d;try{d=t?JSON.parse(t):null}catch{d=t}if(!res.ok){const e=new Error(d?.error||d?.message||`Request failed (${res.status})`);e.data=d;throw e}return d}
function track(type,label,href=""){api("/api/events",{method:"POST",body:JSON.stringify({type,label,href})}).catch(()=>{})}

const products=[
{brand:"Sony",name:"WH‑1000XM6",category:"Headphones",image:"https://sony.scene7.com/is/image/sonyglobalsolutions/GGB-8071_Olive_Gray_Gallery-1?$originalDimensions$=",desc:"Flagship wireless noise cancelling with 30 mm drivers, LDAC and up to 30 hours playback with NC on.",specs:["30 mm","LDAC","Bluetooth 5.3","30h NC"],url:"https://www.sony.co.uk/headphones/products/wh-1000xm6",query:"Sony WH-1000XM6"},
{brand:"Technics",name:"SL‑1200G",category:"Turntable",image:"https://panasonic.scene7.com/is/image/Panasonic/ast-1651355-25?fmt=png-alpha&hei=644&wid=644",desc:"Grand Class direct-drive turntable with coreless motor, three-layer platter and magnesium tonearm.",specs:["Direct drive","18 kg","33/45/78","0.025% W&F"],url:"https://www.technics.com/uk/products/grand-class/turntables/sl-1200g.html",query:"Technics SL-1200G"},
{brand:"Technics",name:"SU‑R1000",category:"Amplifier",image:"https://panasonic.scene7.com/is/image/Panasonic/ast-1263320-29?fmt=png-alpha&hei=644&wid=644",desc:"Reference Class integrated amplifier with JENO Engine, LAPC, MM/MC phono and balanced analogue inputs.",specs:["150W/8Ω","300W/4Ω","MM + MC","USB + XLR"],url:"https://www.technics.com/uk/products/reference-class/su-r1000.html",query:"Technics SU-R1000"},
{brand:"Sony",name:"WF‑1000XM6",category:"Earbuds",image:"https://sony.scene7.com/is/image/sonyglobalsolutions/WF-1000XM6_Image-Gallery_image01_d?$originalDimensions$=&fmt=png-alpha",desc:"True wireless flagship with QN3e noise cancelling, mastering-engineer sound tuning and compact ergonomic design.",specs:["True wireless","QN3e","ANC","Hi-res"],url:"https://www.sony.co.uk/headphones/products/wf-1000xm6",query:"Sony WF-1000XM6"},
{brand:"MCQ Edit",name:"Vinyl System",category:"Buying guide",image:"https://unsplash.com/photos/kcTl2boB4SQ/download?force=true&w=1200",desc:"Build from cartridge, phono gain and isolation outward — not from brand reputation inward.",specs:["Turntable","Phono","Amp","Speakers"],url:"#build",query:"turntable phono amplifier"},
{brand:"MCQ Edit",name:"Cable Lab",category:"Technical guide",image:"https://unsplash.com/photos/-oT4BM9PAQQ/download?force=true&w=1200",desc:"Resistance, capacitance, shielding, connector quality and the point where engineering becomes marketing.",specs:["XLR","RCA","Jack","Speaker"],url:"#shop",query:"audio cable XLR RCA"}
];

const brands=[
["Sony","https://www.sony.co.uk/headphones","Headphones • wireless • pro"],
["Technics","https://www.technics.com/uk/","Turntables • amplifiers • systems"],
["Audio-Technica","https://www.audio-technica.com/en-gb/","Cartridges • headphones • microphones"],
["Sennheiser","https://www.sennheiser-hearing.com/en-UK/","Headphones • wireless"],
["Shure","https://www.shure.com/en-GB","Microphones • IEM • headphones"],
["Denon","https://www.denon.com/en-gb/","Amplifiers • AV • streaming"],
["Marantz","https://www.marantz.com/en-gb/","Amplifiers • CD • streaming"],
["Yamaha","https://uk.yamaha.com/en/products/audio_visual/","Hi-fi • AV • speakers"],
["Pioneer DJ","https://www.pioneerdj.com/en-gb/","DJ decks • mixers • monitoring"],
["Naim","https://www.naimaudio.com/","Streaming • amplification"],
["Bowers & Wilkins","https://www.bowerswilkins.com/en-gb/","Loudspeakers • headphones"],
["Cambridge Audio","https://www.cambridgeaudio.com/gbr/en","Amplifiers • streamers • DACs"],
["Rotel","https://www.rotel.com/en-gb","Amplifiers • CD • DAC"],
["Focal","https://www.focal.com/","Loudspeakers • headphones"],
["KEF","https://uk.kef.com/","Loudspeakers • wireless systems"],
["Rega","https://www.rega.co.uk/","Turntables • amplifiers • cartridges"]
];

const reviews=[
{title:"Sony WH‑1000XM6",kind:"Technical brief",category:"Wireless",image:products[0].image,intro:"Sony's current flagship noise-cancelling headphone combines a 30 mm driver, LDAC, LC3 and multipoint connectivity with up to 30 hours playback with noise cancelling enabled.",specs:[["Driver","30 mm"],["Weight","Approx. 254 g"],["Bluetooth","5.3"],["Codecs","SBC / AAC / LDAC / LC3"],["Battery","Max 30 h NC on"],["Wired","3.5 mm, passive supported"]],notes:["The engineering proposition is convenience without abandoning high-resolution wireless support.","For a hi-fi buyer, the important question is whether you want one headphone to cover commuting, calls and serious listening, or a simpler wired design optimised purely for home use."],sources:[["Sony product","https://www.sony.co.uk/headphones/products/wh-1000xm6"],["Sony specifications","https://www.sony.co.uk/electronics/support/wireless-headphones-bluetooth-headphones/wh-1000xm6/specifications"]]},
{title:"Technics SL‑1200G",kind:"Technical review",category:"Analogue",image:products[1].image,intro:"A heavyweight direct-drive deck built around motor control, platter inertia, cabinet rigidity and a traditional gimbal tonearm rather than convenience features.",specs:[["Drive","Coreless direct drive"],["Speeds","33⅓ / 45 / 78 rpm"],["Wow & flutter","0.025% WRMS"],["Platter","Brass + aluminium"],["Tonearm","230 mm effective length"],["Weight","Approx. 18 kg"]],notes:["This is a machine-first approach to analogue replay: rotational stability, vibration control and cartridge flexibility are the headline engineering choices.","System matching still matters. Cartridge, phono stage, support and isolation can change the final result as much as the deck itself."],sources:[["Technics product","https://www.technics.com/uk/products/grand-class/turntables/sl-1200g.html"]]},
{title:"Technics SU‑R1000",kind:"Technical review",category:"Amplification",image:products[2].image,intro:"Reference Class integrated amplification with a fully digital signal architecture, load-adaptive correction and unusually serious phono facilities.",specs:[["Output","150W + 150W / 8Ω"],["Output 4Ω","300W + 300W"],["Phono","MM/MC + balanced MC"],["Digital","Optical / coax / USB-B"],["Headphone","6.3 mm"],["Weight","22.8 kg"]],notes:["The feature set makes this less of a minimalist integrated and more of a system control centre.","Its value is strongest where the owner needs high power, analogue and digital flexibility, and intends to keep the amplifier through multiple source or speaker upgrades."],sources:[["Technics product","https://www.technics.com/uk/products/reference-class/su-r1000.html"]]}
];

function renderProducts(){
 $("#featured-products").innerHTML=products.map((p,i)=>`<article class="product-card" data-product-card>
  <div class="product-media"><img data-product-image="required" loading="${i<2?"eager":"lazy"}" src="${esc(p.image)}" alt="${esc(p.brand+" "+p.name)}"></div>
  <div class="product-body"><div class="product-brand">${esc(p.brand)} / ${esc(p.category)}</div><h3>${esc(p.name)}</h3><p class="product-desc">${esc(p.desc)}</p>
  <div class="spec-line">${p.specs.map(x=>`<span>${esc(x)}</span>`).join("")}</div>
  <div class="product-actions"><button class="mini-btn product-detail" data-index="${i}">View details</button><button class="mini-btn secondary source-product" data-query="${esc(p.query)}" data-product="${esc(p.brand+" "+p.name)}">Buy / source from MCQ</button></div></div>
 </article>`).join("");
 $$(".product-detail").forEach(b=>b.addEventListener("click",()=>openProduct(Number(b.dataset.index))));
 $$(".source-product").forEach(b=>b.addEventListener("click",()=>prepareLead(b.dataset.product,b.dataset.query)));
}
function renderBrands(){
 $("#brand-grid").innerHTML=brands.map(([name,url,desc])=>`<button class="brand-tile brand-button" type="button" data-brand="${esc(name)}"><strong>${esc(name)}</strong><span>${esc(desc)}</span></button>`).join("");
 $$(".brand-tile").forEach(a=>a.addEventListener("click",()=>prepareLead(a.dataset.brand,a.dataset.brand)));
}
function renderReviews(){
 $("#review-rail").innerHTML=reviews.map((r,i)=>`<article class="review-card" data-review="${i}"><img data-product-image="required" loading="lazy" src="${esc(r.image)}" alt="${esc(r.title)}"><div class="review-body"><div class="review-meta"><span>${esc(r.kind)}</span><span>${esc(r.category)}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.intro)}</p><button class="text-btn open-review">Open review →</button></div></article>`).join("");
 $$(".open-review").forEach(b=>b.addEventListener("click",()=>openReview(Number(b.closest("[data-review]").dataset.review))));
}
function openReview(i){
 const r=reviews[i];if(!r)return;$("#review-body").innerHTML=`<article class="dialog-body"><img class="hero-img" src="${esc(r.image)}" alt=""><p class="eyebrow dark">${esc(r.kind)} / ${esc(r.category)}</p><h1>${esc(r.title)}</h1><p>${esc(r.intro)}</p><div class="spec-grid">${r.specs.map(([k,v])=>`<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}</div>${r.notes.map(n=>`<p>${esc(n)}</p>`).join("")}<div class="source-row">${r.sources.map(([n])=>`<span>${esc(n)}</span>`).join("")}</div></article>`;
 $("#review-dialog").showModal();track("review_open",r.title)
}
$("#review-close").addEventListener("click",()=>$("#review-dialog").close());$("#review-dialog").addEventListener("click",e=>{if(e.target===$("#review-dialog"))e.currentTarget.close()});

let suppliers=[];
async function loadSuppliers(){const select=$("#supplier-select");if(select){select.innerHTML='<option value="mcq">MCQ live catalogue</option>';select.disabled=true}}
$("#shop-search-btn").addEventListener("click",()=>runSupplierSearch());$("#shop-search").addEventListener("keydown",e=>{if(e.key==="Enter")runSupplierSearch()});$$("[data-query]").forEach(x=>x.addEventListener("click",()=>{runSupplierSearch(x.dataset.query);$("#shop").scrollIntoView({behavior:"smooth"})}));

async function runSupplierSearch(forcedQuery=""){
 const input=$("#shop-search"),out=$("#live-products");if(!input||!out)return;
 const q=(forcedQuery||input.value||"").trim();if(!q){out.innerHTML='<div class="live-message">Enter a product, brand or part.</div>';return}
 input.value=q;out.innerHTML='<div class="live-message">Searching MCQ and connected supplier data…</div>';
 try{
  const d=await api("/api/catalog/search?q="+encodeURIComponent(q));
  const visible=(d.results||[]).filter(p=>p.image&&/^https:\/\//i.test(p.image));
  if(!visible.length){out.innerHTML='<div class="live-message"><strong>No image-verified public result yet.</strong><br>MCQ will not display a broken or image-less product. Use the sourcing form and we can find it properly.</div>';return}
  out.innerHTML=visible.map(p=>`<article class="product-row" data-product-card><img data-product-image="required" src="${esc(p.image)}" alt="${esc((p.brand||"")+" "+p.name)}"><div><b>${esc((p.brand||"")+" "+p.name)}</b><p>${esc(p.summary||p.category||"Audio product")}</p><small>${esc(p.availability||p.source||"Ask MCQ")}</small></div><button class="mini-btn supplier-source" data-product="${esc((p.brand||"")+" "+p.name)}" data-query="${esc(q)}">Buy / source</button></article>`).join("");
  $$(".supplier-source",out).forEach(b=>b.addEventListener("click",()=>prepareLead(b.dataset.product,b.dataset.query)));
 }catch(err){out.innerHTML=`<div class="live-message">Search unavailable: ${esc(err.message)}</div>`}
}
function openProduct(i){
 const p=products[i];if(!p)return;
 $("#review-body").innerHTML=`<article class="dialog-body"><img data-product-image="required" class="hero-img" src="${esc(p.image)}" alt="${esc(p.brand+" "+p.name)}"><p class="eyebrow dark">${esc(p.brand)} / ${esc(p.category)}</p><h1>${esc(p.name)}</h1><p>${esc(p.desc)}</p><div class="spec-grid">${p.specs.map((v,n)=>`<div><b>Specification ${n+1}</b><span>${esc(v)}</span></div>`).join("")}</div><p>MCQ can advise, source and supply this product or the closest suitable alternative.</p><button class="mini-btn" id="dialog-source">Buy / source from MCQ</button></article>`;
 $("#review-dialog").showModal();
 $("#dialog-source").addEventListener("click",()=>{ $("#review-dialog").close(); prepareLead(p.brand+" "+p.name,p.query); });
 track("product_view",p.brand+" "+p.name);
}
function prepareLead(product,query){
 const form=$("#lead-form");
 if(form){
   const interest=form.querySelector("[name=interest]"); if(interest) interest.value="Product sourcing";
   let productInput=form.querySelector("[name=product]");
   if(!productInput){productInput=document.createElement("input");productInput.type="hidden";productInput.name="product";form.appendChild(productInput)}
   productInput.value=product||query||"";
   const message=form.querySelector("[name=message]"); if(message) message.value=`I want MCQ to source / supply: ${product||query}.`;
   $(".lead-section").scrollIntoView({behavior:"smooth"});
   form.querySelector("[name=name]")?.focus({preventScroll:true});
   track("mcq_source_intent",product||query);
 }
}

$("#system-form").addEventListener("submit",e=>{e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));const map={Vinyl:"Turntable + cartridge + correctly matched phono stage","Streaming":"Streamer/DAC with stable control software and appropriate analogue output","CD":"CD player/transport with a clean conversion path","TV + music":"Integrated amp with HDMI ARC or optical input","DJ / mixed sources":"Flexible analogue front end with robust gain structure"};const room={"Small room":"controlled standmount speakers or compact floorstanders","Medium room":"standmount or floorstanding speakers with moderate bass extension","Large room":"higher-output loudspeakers and greater amplifier current/headroom","Commercial / venue":"professional loudspeaker and installation-first design"};$("#system-result").innerHTML=`<div class="system-card"><p class="eyebrow dark">YOUR MCQ BRIEF</p><h3>${esc(x.source)} / ${esc(x.room)}</h3><p><b>Front end:</b> ${esc(map[x.source])}</p><p><b>Room:</b> ${esc(room[x.room])}</p><p><b>Budget:</b> ${esc(x.budget)}</p><p><b>Priority:</b> ${esc(x.priority)}</p><button class="mini-btn" id="send-brief">Send this brief to MCQ</button></div>`;$("#send-brief").addEventListener("click",()=>{$("#lead-form [name=interest]").value="Hi‑Fi system";$("#lead-form [name=message]").value=`System brief: ${x.source}; ${x.room}; ${x.budget}; priority: ${x.priority}.`;$(".lead-section").scrollIntoView({behavior:"smooth"});track("system_builder",JSON.stringify(x))})});

$("#lead-form").addEventListener("submit",async e=>{e.preventDefault();const status=$("#lead-status"),data=Object.fromEntries(new FormData(e.currentTarget));status.textContent="Sending…";try{const r=await api("/api/leads",{method:"POST",body:JSON.stringify({...data,source:"mcq-audio"})});status.textContent=`Received — reference ${r.id}.`;e.currentTarget.reset();track("lead","submitted")}catch(err){status.textContent=err.message}});

$("#search-open").addEventListener("click",()=>{$("#search-drawer").classList.add("open");$("#search-drawer").setAttribute("aria-hidden","false");setTimeout(()=>$("#global-search").focus(),150)});$("#search-close").addEventListener("click",()=>{$("#search-drawer").classList.remove("open");$("#search-drawer").setAttribute("aria-hidden","true")});
$("#global-search").addEventListener("input",e=>{const q=e.target.value.toLowerCase().trim();if(!q){$("#global-results").innerHTML="";return}const ps=products.filter(p=>(p.brand+" "+p.name+" "+p.category+" "+p.desc).toLowerCase().includes(q));const bs=brands.filter(b=>(b[0]+" "+b[2]).toLowerCase().includes(q));$("#global-results").innerHTML=ps.map((p,i)=>`<button class="global-result global-action" data-product="${esc(p.brand+" "+p.name)}" data-query="${esc(p.query)}"><img data-product-image="required" src="${esc(p.image)}" alt=""><div><b>${esc(p.brand)} ${esc(p.name)}</b><p>${esc(p.category)} — source through MCQ</p></div></button>`).join("")+bs.map(([n,u,d])=>`<button class="global-result global-action" data-product="${esc(n)}" data-query="${esc(n)}"><div></div><div><b>${esc(n)}</b><p>${esc(d)} — ask MCQ</p></div></button>`).join("");$$(".global-action",$("#global-results")).forEach(b=>b.addEventListener("click",()=>{$("#search-drawer").classList.remove("open");prepareLead(b.dataset.product,b.dataset.query)}))});

renderProducts();renderBrands();renderReviews();loadSuppliers();
$$('[data-query].cta').forEach(b=>b.addEventListener('click',()=>prepareLead(b.dataset.query,b.dataset.query)));
