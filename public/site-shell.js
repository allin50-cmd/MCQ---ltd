(()=>{const path=location.pathname.replace(/\/$/,"")||"/";
const pages={
"/":{label:"Home",parent:"/"},
"/shop":{label:"Shop Audio",parent:"/"},
"/featured":{label:"Featured Gear",parent:"/shop"},
"/headphones":{label:"Headphones",parent:"/shop"},
"/microphones":{label:"Microphones",parent:"/shop"},
"/wireless":{label:"Wireless",parent:"/shop"},
"/dj":{label:"DJ Equipment",parent:"/shop"},
"/urban":{label:"Urban Underground",parent:"/"},
"/music":{label:"Urban Underground",parent:"/"},
"/urban-gallery":{label:"Urban Art Chart",parent:"/urban"},
"/chart":{label:"Music Chart",parent:"/urban"},
"/publish":{label:"Publish Music",parent:"/urban"},
"/live":{label:"Live",parent:"/urban"},
"/vinyl":{label:"Vinyl & White Labels",parent:"/urban"},
"/swap":{label:"Swap Shop",parent:"/urban"},
"/magazine":{label:"Magazine",parent:"/"},
"/hire":{label:"Hire & Install",parent:"/"},
"/trade":{label:"Trade",parent:"/"},
"/club":{label:"MCQ Club",parent:"/"},
"/about":{label:"About & Contact",parent:"/"},
"/future":{label:"Future Experience",parent:"/"}
};
const aliases={"/urban-underground":"/urban","/vinyl-underground":"/urban","/swap-shop":"/urban","/self-publish":"/publish","/hire-install":"/hire","/contact":"/about","/white-labels":"/vinyl","/prototype":"/future"};
const canonical=aliases[path]||path;
const showSplash=()=>{if(canonical!=="/")return;let enteredFromInside=false;try{enteredFromInside=!!document.referrer&&new URL(document.referrer).origin===location.origin}catch{}if(enteredFromInside)return;
const splash=document.createElement("div");splash.className="mcq-splash";splash.setAttribute("role","dialog");splash.setAttribute("aria-label","Welcome to MCQ Audio");
splash.innerHTML='<div class="mcq-splash-stage"><div class="mcq-splash-artboard"><img src="/mcq-splash-production.jpg" alt="MCQ Audio — professional sound, music culture and real equipment"><a class="mcq-hotspot hs-logo" href="/" aria-label="MCQ Audio home"></a><a class="mcq-hotspot hs-shopall" href="/shop" aria-label="Shop all"></a><a class="mcq-hotspot hs-djnav" href="/dj" aria-label="DJ"></a><a class="mcq-hotspot hs-studionav" href="/featured" aria-label="Studio"></a><a class="mcq-hotspot hs-livenav" href="/hire" aria-label="Live Sound"></a><a class="mcq-hotspot hs-vinylnav" href="/vinyl" aria-label="Vinyl"></a><a class="mcq-hotspot hs-accessoriesnav" href="/shop" aria-label="Accessories"></a><a class="mcq-hotspot hs-brands" href="/shop" aria-label="Brands"></a><a class="mcq-hotspot hs-deals" href="/shop" aria-label="Deals"></a><a class="mcq-hotspot hs-search" href="/shop" aria-label="Search MCQ products"></a><a class="mcq-hotspot hs-account" href="/club" aria-label="MCQ Club"></a><a class="mcq-hotspot hs-cart" href="/shop" aria-label="Shop"></a><a class="mcq-hotspot hs-culture" href="/urban" aria-label="MCQ Urban Underground"></a><a class="mcq-hotspot hs-about" href="/about" aria-label="55 years of MCQ"></a><a class="mcq-hotspot hs-musiclives" href="/vinyl" aria-label="Music lives on — vinyl"></a><a class="mcq-hotspot hs-turntables" href="/shop" aria-label="Turntables"></a><a class="mcq-hotspot hs-djgear" href="/dj" aria-label="DJ Gear"></a><a class="mcq-hotspot hs-studio" href="/featured" aria-label="Studio"></a><a class="mcq-hotspot hs-live" href="/hire" aria-label="Live Sound"></a><a class="mcq-hotspot hs-vinyl" href="/vinyl" aria-label="Vinyl"></a><a class="mcq-hotspot hs-accessories" href="/shop" aria-label="Accessories"></a><a class="mcq-splash-enter" href="/shop" aria-label="Enter MCQ Audio shop">ENTER MCQ AUDIO <b>→</b></a></div></div>';
document.body.prepend(splash);document.documentElement.classList.add("mcq-splash-open");
const closeSplash=()=>{if(splash.classList.contains("closing"))return;splash.classList.add("closing");setTimeout(()=>{splash.remove();document.documentElement.classList.remove("mcq-splash-open")},520)};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.contains(splash))closeSplash()},{once:true});
};
const meta=pages[canonical]||{label:document.title.split("|")[0].trim()||"MCQ",parent:"/"};
const nav=[["/shop","Shop"],["/urban","Urban"],["/urban-gallery","Art Chart"],["/magazine","Magazine"],["/live","Live"],["/hire","Hire"],["/trade","Trade"],["/club","Club"],["/about","About"]];
const section=canonical==="/"?"Home":meta.label;
const back=()=>{let same=false;try{same=document.referrer&&new URL(document.referrer).origin===location.origin}catch{}if(same&&history.length>1)history.back();else location.href=meta.parent||"/"};
const shell=document.createElement("div");shell.className="mcq-shell";
shell.innerHTML='<div class="mcq-shell-row">'+
(canonical!=="/"?'<button class="mcq-back" type="button" aria-label="Go back">← <span>Back</span></button>':'<a class="mcq-home" href="/">MCQ</a>')+
'<a class="mcq-brand" href="/" aria-label="MCQ Audio home"><b>MCQ</b><span>AUDIO · REAL PEOPLE · REAL SOUND</span></a>'+
'<div class="mcq-context"><div class="mcq-crumbs"><a href="/">Home</a><span>›</span>'+(meta.parent&&meta.parent!=="/"?'<a href="'+meta.parent+'">'+(pages[meta.parent]?.label||"Section")+'</a><span>›</span>':'')+'<strong>'+section+'</strong></div></div>'+
'<nav class="mcq-primary" aria-label="Primary navigation">'+nav.map(([href,label])=>'<a href="'+href+'"'+(canonical===href?' aria-current="page"':'')+'>'+label+'</a>').join("")+'</nav>'+
'<button class="mcq-menu-btn" type="button" aria-label="Open menu">Menu</button></div>';
document.body.prepend(shell);showSplash();
const sheet=document.createElement("div");sheet.className="mcq-sheet";sheet.setAttribute("aria-hidden","true");sheet.innerHTML='<div class="mcq-sheet-head"><b>Explore MCQ</b><button class="mcq-sheet-close" type="button" aria-label="Close menu">×</button></div><div class="mcq-sheet-grid">'+[
["/shop","Shop Audio","Products & sourcing"],["/featured","Featured Gear","Selected equipment"],["/urban","Urban Underground","Music & culture"],["/urban-gallery","Urban Art Chart","Upload & vote"],["/chart","Music Chart","Listen & support"],["/publish","Publish","Submit music"],["/live","Live","Shows & streams"],["/vinyl","Vinyl","White labels & archive"],["/swap","Swap Shop","Buy, sell, trade"],["/magazine","Magazine","Stories & reviews"],["/hire","Hire & Install","PA & systems"],["/trade","Trade","Business supply"],["/club","MCQ Club","Listeners · trade · creators"],["/about","About & Contact","MCQ story & help"]
].map(x=>'<a href="'+x[0]+'">'+x[1]+'<span>'+x[2]+'</span></a>').join("")+'</div>';document.body.append(sheet);
const mobile=document.createElement("nav");mobile.className="mcq-mobile-nav";mobile.setAttribute("aria-label","Mobile navigation");mobile.innerHTML='<button type="button" data-mcq-back><span class="icon">←</span>Back</button><a href="/"><span class="icon">⌂</span>Home</a><a href="/shop"'+(canonical==="/shop"?' aria-current="page"':'')+'><span class="icon">⌕</span>Shop</a><a href="/urban"'+(canonical==="/urban"?' aria-current="page"':'')+'><span class="icon">●</span>Urban</a><button type="button" data-mcq-menu><span class="icon">☰</span>Menu</button>';document.body.append(mobile);
const open=()=>{sheet.classList.add("open");sheet.setAttribute("aria-hidden","false")},close=()=>{sheet.classList.remove("open");sheet.setAttribute("aria-hidden","true")};
shell.querySelector(".mcq-back")?.addEventListener("click",back);mobile.querySelector("[data-mcq-back]")?.addEventListener("click",back);shell.querySelector(".mcq-menu-btn")?.addEventListener("click",open);mobile.querySelector("[data-mcq-menu]")?.addEventListener("click",open);sheet.querySelector(".mcq-sheet-close")?.addEventListener("click",close);sheet.addEventListener("click",e=>{if(e.target===sheet)close()});document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
})();