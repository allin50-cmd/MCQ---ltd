const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];

const reviews=[
  {
    id:"michi-x430",category:"amplifier",type:"Technical brief",
    title:"Michi Prestige X430",strap:"A heavyweight integrated amplifier built around Class AB power, modern digital inputs and a serious analogue front end.",
    image:"https://unsplash.com/photos/5D2KsMj0e3Y/download?force=true&w=1200",
    specs:[["Power","210W/ch continuous into 8Ω; 340W/ch max into 4Ω"],["DAC","ESS ES9039Q2M"],["USB","Up to 32-bit/384kHz; DSD support"],["THD","<0.03%"],["Weight","16.9kg"],["Phono","Moving Magnet"]],
    body:[
      "The X430 is a useful example of where high-end integrated amplification is heading: fewer separate boxes, but no attempt to make the amplifier itself lightweight or compromised.",
      "Its published electrical specification is substantial enough for demanding loudspeakers, while HDMI ARC, USB, optical/coaxial digital inputs, Bluetooth and MM phono make it unusually flexible for a premium integrated design.",
      "This is a specification-led technical brief, not an MCQ listening test. The useful buying question is whether you need this level of power and connectivity in one chassis, and whether your loudspeakers and room can exploit it."
    ],
    sources:[
      ["Manufacturer specs","https://www.rotel.com/en-gb/product/x430"],
      ["Independent review","https://www.whathifi.com/hi-fi/stereo-amplifiers/rotel-michi-prestige-x430"]
    ],
    query:"Michi X430 amplifier"
  },
  {
    id:"topping-dx1ii",category:"digital",type:"Review digest",
    title:"Topping DX1 II",strap:"A compact desktop DAC/headphone amplifier with unusually broad digital format support for its price class.",
    image:"https://unsplash.com/photos/qtKOZH1iDY4/download?force=true&w=1200",
    specs:[["Role","USB DAC + headphone amplifier"],["PCM","Up to 32-bit/384kHz"],["DSD","Up to DSD256"],["Headphones","3.5mm + 4.4mm"],["Inputs","USB-C + optical"],["Output","RCA line out"]],
    body:[
      "The DX1 II belongs to the modern desktop category where digital conversion and headphone amplification are combined in a very small chassis.",
      "Published reviews praise its cleanliness, detail and feature set while noting that technical competence does not automatically equal the most expressive or rhythmically engaging presentation.",
      "That makes it an interesting system-matching product rather than an automatic choice: excellent where compact digital functionality matters, less obvious where the system needs warmth or drive."
    ],
    sources:[["Independent review","https://www.whathifi.com/hi-fi/dacs/topping-dx1-ii"]],
    query:"Topping DX1 II"
  },
  {
    id:"ath-wp900se",category:"headphones",type:"Review digest",
    title:"Audio-Technica ATH-WP900SE",strap:"Limited-edition closed-back headphones combining 53mm drivers, wood cups and balanced connectivity.",
    image:"https://unsplash.com/photos/FFM2RHe1nQE/download?force=true&w=1200",
    specs:[["Type","Closed-back dynamic"],["Driver","53mm"],["Response","5Hz–50kHz"],["Sensitivity","98dB/mW"],["Weight","235g"],["Cables","3.5mm + 4.4mm balanced"]],
    body:[
      "The WP900SE takes a deliberately traditional audiophile route: wired, closed-back, lightweight and visually distinctive rather than feature-loaded with wireless processing.",
      "Independent listening reports emphasise clarity, spaciousness for a closed design and strong vocal/instrumental presentation, while also pointing out that bass-heavy listeners may prefer a different balance.",
      "This kind of product is best auditioned with your own source and amplifier because sensitivity, output impedance and tonal balance all affect the result."
    ],
    sources:[["Independent review","https://www.whathifi.com/headphones/wired-headphones/audio-technica-ath-wp900se"]],
    query:"Audio Technica ATH WP900SE"
  },
  {
    id:"technics-sl1500cs",category:"analogue",type:"Review digest",
    title:"Technics SL-1500CS",strap:"A modern direct-drive turntable that keeps the convenience of an integrated phono stage while aiming at serious two-channel systems.",
    image:"https://unsplash.com/photos/Fl75UpeRyEI/download?force=true&w=1200",
    specs:[["Drive","Direct drive"],["Category","Turntable"],["Use","Home hi-fi"],["Setup","Integrated system-friendly design"],["Focus","Speed stability + usability"],["Context","Current-generation SL-1500 line"]],
    body:[
      "The appeal of the SL-1500 concept is straightforward: direct-drive engineering, restrained industrial design and fewer setup barriers than many enthusiast decks.",
      "For buyers, the real comparison is not simply belt versus direct drive. Cartridge choice, phono stage quality, isolation and support furniture can have as much influence on the final result.",
      "Use this as a starting point for system matching rather than treating any turntable as a self-contained sound."
    ],
    sources:[["Independent review","https://www.whathifi.com/hi-fi/turntables/technics-sl-1500cs"]],
    query:"Technics SL-1500C turntable"
  }
];

const articles={
  "system-matching":{
    title:"Why the best component can still make the wrong system",tag:"SYSTEM BUILDING",
    image:"https://unsplash.com/photos/XdRf3vsLh5Y/download?force=true&w=1600",
    intro:"A hi-fi system is a chain. The meaningful question is not which box has the biggest review score, but whether source, amplifier, loudspeaker and room are electrically and sonically compatible.",
    sections:[
      ["Start with the room","Small rooms usually reward controlled bass, sensible cabinet size and manageable listening distance. Large rooms need displacement, headroom and current. Buying speakers before thinking about the room is one of the most expensive ways to get hi-fi wrong."],
      ["Amplifier and speaker matching","Sensitivity, impedance behaviour and required listening level matter more than the headline watt figure alone. A nominally powerful amplifier can still struggle with an awkward load; an efficient speaker can produce convincing scale from modest power."],
      ["Source quality still matters","Digital and analogue sources fail in different ways. Turntables need mechanical setup and phono gain/loading. Digital systems depend on conversion, clocking, analogue output stage and sensible level matching."],
      ["System balance beats trophy collecting","Independent publications regularly build complete systems rather than merely ranking isolated products. That reflects the central truth: synergy is a system property, not a product feature."]
    ],
    sources:[["System matching reference","https://premiumsound.co.uk/journal/hi-fi-systems-complete-setups-our-picks/"],["Independent systems feature","https://www.whathifi.com/hi-fi/hugely-capable-and-surprisingly-unfussy-this-streaming-and-vinyl-hi-fi-system-is-a-premium-package-but-youll-be-richly-rewarded"]]
  },
  "analogue-path":{
    title:"The signal starts here",tag:"ANALOGUE",
    image:"https://unsplash.com/photos/D5iKflt76eU/download?force=true&w=1600",
    intro:"Vinyl replay is mechanical first and electrical second. Small setup errors are amplified along with the music.",
    sections:[
      ["Geometry","Tracking force, cartridge alignment, arm height and anti-skate affect how the stylus sits in the groove. Get these fundamentals wrong and no cable upgrade will rescue the result."],
      ["Gain and loading","Moving-magnet and moving-coil cartridges produce very different signal levels. The phono stage has to provide the right gain and electrical loading before the line-level amplifier ever sees the signal."],
      ["Isolation","Turntables convert movement into voltage. That includes unwanted movement from floors, loudspeakers and furniture, so support and placement are part of the signal path."]
    ],
    sources:[["Browse turntable reviews","https://www.whathifi.com/hi-fi/reviews"]]
  },
  "cables":{
    title:"Cables: what actually matters",tag:"ENGINEERING",
    image:"https://unsplash.com/photos/-oT4BM9PAQQ/download?force=true&w=1600",
    intro:"Cables are electrical components, but they are not magic. The useful variables are measurable and application-specific.",
    sections:[
      ["Resistance","Speaker cable resistance rises with length and falls with conductor cross-section. Long runs and low-impedance loudspeakers deserve thicker cable than short desktop systems."],
      ["Capacitance and shielding","Low-level analogue signals, especially phono, can be sensitive to cable capacitance and interference. Shielding and sensible routing matter more here than decorative construction."],
      ["Connectors","Reliable contact, strain relief, corrosion resistance and the right mechanical standard matter. A robust XLR or RCA termination is valuable because it keeps working."],
      ["Where MCQ fits","Legacy phono, headphone extensions, adapters, DJ leads and professional interconnects are exactly where practical stock knowledge matters more than marketing language."]
    ],
    sources:[["Canford Audio","https://www.canford.co.uk/"],["CPC","https://cpc.farnell.com/"]]
  },
  "listening-room":{
    title:"The room is part of the system",tag:"ROOM / SETUP",
    image:"https://unsplash.com/photos/QtgGYlug6Cw/download?force=true&w=1600",
    intro:"Move the loudspeakers or chair and you can change the tonal balance more than many component swaps.",
    sections:[
      ["Position first","Distance from rear and side walls changes bass reinforcement. Toe-in changes treble balance and image focus. Listening distance changes how directly you hear the loudspeaker versus the room."],
      ["Control the first reflections","Bare side walls, glass and hard floors increase early reflections. Rugs, curtains, furniture and well-placed acoustic treatment can improve clarity without making the room visually clinical."],
      ["Comfort matters","A dedicated listening position is not a luxury detail. Recent listening-room commentary has highlighted how physical comfort and intentional placement can transform engagement with a system."],
      ["Measure before buying more boxes","A simple room measurement often reveals whether the next pound should go into electronics, loudspeaker placement, bass control or treatment."]
    ],
    sources:[["Listening-room trend","https://www.ft.com/content/7f2f0322-2568-4ad3-9199-5245e09d889e"],["Practical listening-room perspective","https://www.whathifi.com/hi-fi/forget-speakers-and-amps-this-is-the-best-upgrade-ive-made-to-my-hi-fi-listening-room-in-years"]]
  }
};

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
async function api(url,options={}){
  const res=await fetch(url,{...options,headers:{"content-type":"application/json",...(options.headers||{})}});
  const text=await res.text();let data;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!res.ok){const e=new Error(data?.error||data?.message||`Request failed (${res.status})`);e.data=data;throw e}
  return data;
}
function track(type,label,href=""){api("/api/events",{method:"POST",body:JSON.stringify({type,label,href})}).catch(()=>{})}

function renderReviews(filter="all"){
  const grid=$("#review-grid");
  const items=filter==="all"?reviews:reviews.filter(x=>x.category===filter);
  grid.innerHTML=items.map(r=>`<article class="review-card" data-review="${r.id}">
    <img src="${r.image}" alt="">
    <div class="inner"><div class="meta"><span>${esc(r.type)}</span><span>${esc(r.category)}</span></div>
    <h3>${esc(r.title)}</h3><p>${esc(r.strap)}</p>
    <button class="text-link review-open">Open technical review →</button></div>
  </article>`).join("");
  $$(".review-open",grid).forEach(btn=>btn.addEventListener("click",()=>openReview(btn.closest("[data-review]").dataset.review)));
}
function articleMarkup(x){
  return `<article class="article-body">
    <img class="hero" src="${x.image}" alt="">
    <p class="tag">${esc(x.tag||x.type||"MCQ AUDIO")}</p>
    <h1>${esc(x.title)}</h1>
    <p class="dek">${esc(x.intro||x.strap||"")}</p>
    ${(x.specs||[]).length?`<div class="spec-grid">${x.specs.map(([k,v])=>`<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}</div>`:""}
    ${(x.sections||[]).map(([h,p])=>`<h2>${esc(h)}</h2><p>${esc(p)}</p>`).join("")}
    ${(x.body||[]).map(p=>`<p>${esc(p)}</p>`).join("")}
    <div class="source-links">${(x.sources||[]).map(([label,url])=>`<a href="${url}" target="_blank" rel="noreferrer">${esc(label)} ↗</a>`).join("")}</div>
    ${x.query?`<button class="btn btn-dark" id="article-shop" data-query="${esc(x.query)}">Find live price</button>`:""}
  </article>`;
}
function showDialog(content,label){
  const d=$("#article-dialog");$("#article-content").innerHTML=content;d.showModal();track("view",label);
  const shop=$("#article-shop");if(shop)shop.addEventListener("click",()=>{d.close();runSupplierSearch(shop.dataset.query);$("#shop").scrollIntoView({behavior:"smooth"})});
}
function openReview(id){const r=reviews.find(x=>x.id===id);if(r)showDialog(articleMarkup(r),`review:${id}`)}
function openArticle(id){const a=articles[id];if(a)showDialog(articleMarkup(a),`article:${id}`)}

$$(".article-open").forEach(btn=>btn.addEventListener("click",()=>openArticle(btn.closest("[data-article]").dataset.article)));
$(".dialog-close").addEventListener("click",()=>$("#article-dialog").close());
$("#article-dialog").addEventListener("click",e=>{if(e.target===$("#article-dialog"))$("#article-dialog").close()});
$$(".chip").forEach(btn=>btn.addEventListener("click",()=>{$$(".chip").forEach(x=>x.classList.remove("active"));btn.classList.add("active");renderReviews(btn.dataset.filter)}));
$("#menu-button").addEventListener("click",()=>$(".site-header").classList.toggle("menu-open"));

let suppliers=[];
async function loadSuppliers(){
  suppliers=await api("/api/suppliers");
  $("#supplier-select").innerHTML=suppliers.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
}
function supplierLink(s,q){return s.search_url.replace("{query}",encodeURIComponent(q))}
async function runSupplierSearch(query){
  const q=String(query||$("#shop-search").value||"").trim();if(!q)return;
  $("#shop-search").value=q;
  const supplierId=$("#supplier-select").value||"farnell";
  const supplier=suppliers.find(s=>s.id===supplierId)||suppliers[0];
  const out=$("#live-products");
  out.innerHTML='<div class="live-message">Checking live supplier route…</div>';
  track("supplier_search",q,supplier?.homepage||"");
  if(supplierId==="farnell"){
    try{
      const data=await api(`/api/suppliers/farnell/search?q=${encodeURIComponent(q)}`);
      if(data.products?.length){
        out.innerHTML=data.products.map(p=>`<div class="product-row">
          ${p.image_url?`<img src="${esc(p.image_url)}" alt="">`:"<div></div>"}
          <div><h4>${esc(p.name||p.sku)}</h4><small>${esc(p.brand||"Farnell")} • ${esc(p.sku||"")}</small></div>
          ${p.product_url?`<a class="btn btn-dark supplier-buy" href="${esc(p.product_url)}" target="_blank" rel="noreferrer">View / buy</a>`:""}
        </div>`).join("");
        $$(".supplier-buy",out).forEach(a=>a.addEventListener("click",()=>track("purchase_click",a.textContent,a.href)));
        return;
      }
    }catch{}
  }
  const live=supplier?supplierLink(supplier,q):"#";
  out.innerHTML=`<div class="live-message"><b>${esc(supplier?.name||"Supplier")}</b><br>Open the supplier's live search for current price and stock.<br><br><a class="btn btn-dark supplier-buy" href="${esc(live)}" target="_blank" rel="noreferrer">View / buy live</a></div>`;
  $(".supplier-buy",out)?.addEventListener("click",e=>track("purchase_click",q,e.currentTarget.href));
}
$("#shop-search-button").addEventListener("click",()=>runSupplierSearch());
$("#shop-search").addEventListener("keydown",e=>{if(e.key==="Enter")runSupplierSearch()});
$$("[data-shop-query]").forEach(el=>el.addEventListener("click",()=>{runSupplierSearch(el.dataset.shopQuery);$("#shop").scrollIntoView({behavior:"smooth"})}));

$("#builder-form").addEventListener("submit",e=>{
  e.preventDefault();const x=Object.fromEntries(new FormData(e.currentTarget));
  const sourceMap={Vinyl:"Turntable + correctly matched phono stage","Streaming":"Streamer/DAC with stable app support","CD":"CD transport/player with appropriate DAC path","TV + music":"Integrated amplifier with HDMI ARC or optical input","DJ / mixed sources":"Flexible analogue/digital preamp or mixer front end"};
  const roomMap={"Small room":"compact standmount speakers or controlled small floorstanders","Medium room":"standmount or floorstanding speakers with sensible bass extension","Large room":"higher-output loudspeakers and amplifier current/headroom","Venue / commercial":"professional loudspeakers, protection and installation-first design"};
  const result={source:x.source,room:x.room,budget:x.budget,priority:x.priority};
  $("#builder-result").innerHTML=`<div class="system-card"><p class="tag">YOUR MCQ SYSTEM BRIEF</p><h3>${esc(x.source)} / ${esc(x.room)}</h3>
    <ul><li><b>Source:</b> ${esc(sourceMap[x.source])}</li><li><b>Room:</b> ${esc(roomMap[x.room])}</li><li><b>Budget:</b> ${esc(x.budget)}</li><li><b>Priority:</b> ${esc(x.priority)}</li></ul>
    <p>Next step: MCQ can turn this brief into a short list using live supplier availability and system-matching constraints.</p>
    <button class="btn btn-dark" id="builder-lead">Send brief to MCQ</button></div>`;
  $("#builder-lead").addEventListener("click",()=>{$("#trade").scrollIntoView({behavior:"smooth"});$("[name=interest]",$("#lead-form")).value="system";$("[name=message]",$("#lead-form")).value=`System brief: ${result.source}; ${result.room}; ${result.budget}; priority ${result.priority}.`;track("system_builder","lead")});
  track("system_builder",JSON.stringify(result));
});

$("#lead-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget,status=$("#lead-status");status.textContent="Sending…";
  const data=Object.fromEntries(new FormData(form));
  try{const row=await api("/api/leads",{method:"POST",body:JSON.stringify({...data,source:"mcq-audio-journal"})});status.textContent=`Received — reference ${row.id}. MCQ can follow this up.`;form.reset();track("lead","submitted")}
  catch(err){status.textContent=err.message}
});

renderReviews();
loadSuppliers().catch(()=>{});
