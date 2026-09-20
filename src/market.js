export const MARKET_CATALOG = [
  {
    id:"mkt-westend-ddj-flx4",
    brand:"Pioneer DJ",
    name:"DDJ-FLX4",
    category:"dj",
    image:"https://www.pioneerdj.com/product-images/556/d067d24e-28a0-42d1-ac50-5cf2392f755e/ddj-flx4_1.png",
    observed_price_gbp:299,
    observed_availability:"ADD_TO_CART",
    supplier:"WestendDJ",
    source_url:"https://westenddj.co.uk/products/pioneer-dj-ddj-flx4-smart-dj-controller",
    checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET",
    mcq_sellable:false,
    sell_status:"TRADE_TERMS_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ must confirm its own supply, cost and availability before accepting payment."
  },
  {
    id:"mkt-westend-ddj-flx10",
    brand:"Pioneer DJ",
    name:"DDJ-FLX10",
    category:"dj",
    image:"https://www.pioneerdj.com/product-images/1303/130db239-d874-411b-b2ea-395c83f09255/ddj-flx10_1.png",
    observed_price_gbp:1449,
    observed_availability:"ADD_TO_CART",
    supplier:"WestendDJ",
    source_url:"https://westenddj.co.uk/collections/ddj-flx10",
    checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET",
    mcq_sellable:false,
    sell_status:"TRADE_TERMS_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ must confirm its own supply, cost and availability before accepting payment."
  },
  {
    id:"mkt-thomann-denon-sc-live-4",
    brand:"Denon DJ",
    name:"SC Live 4",
    category:"dj",
    image:"https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/552768.jpg",
    observed_price_gbp:933,
    observed_availability:"CURRENT_DJ_LISTING",
    supplier:"Thomann UK",
    source_url:"https://www.thomann.co.uk/dj_equipment.html",
    checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET",
    mcq_sellable:false,
    sell_status:"TRADE_TERMS_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ must confirm its own supply, cost and availability before accepting payment."
  },
  {
    id:"mkt-thomann-numark-mixstream-pro-plus",
    brand:"Numark",
    name:"Mixstream Pro+",
    category:"dj",
    image:"https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/559714.jpg",
    observed_price_gbp:559,
    observed_availability:"CURRENT_DJ_LISTING",
    supplier:"Thomann UK",
    source_url:"https://www.thomann.co.uk/dj_equipment.html",
    checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET",
    mcq_sellable:false,
    sell_status:"TRADE_TERMS_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ must confirm its own supply, cost and availability before accepting payment."
  },
  {
    id:"mkt-thomann-sennheiser-hd25",
    brand:"Sennheiser",
    name:"HD 25",
    category:"headphones",
    image:"https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/379291.jpg",
    observed_price_gbp:105,
    observed_availability:"CURRENT_DJ_LISTING",
    supplier:"Thomann UK",
    source_url:"https://www.thomann.co.uk/dj_equipment.html",
    checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET",
    mcq_sellable:false,
    sell_status:"TRADE_TERMS_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ must confirm its own supply, cost and availability before accepting payment."
  },
  {
    id:"mkt-thomann-shure-sm58",
    brand:"Shure",
    name:"SM58 LC",
    category:"microphones",
    image:"https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/105767.jpg",
    observed_price_gbp:99,
    observed_availability:"IN_STOCK_IMMEDIATE",
    supplier:"Thomann UK",
    source_url:"https://www.thomann.co.uk/shure_sm58.htm",
    checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET",
    mcq_sellable:false,
    sell_status:"TRADE_TERMS_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ must confirm its own supply, cost and availability before accepting payment."
  },
  {
    id:"mkt-thomann-shure-sm57",
    brand:"Shure",
    name:"SM57 LC",
    category:"microphones",
    image:"https://thumbs.static-thomann.de/thumb//bdbmagic/pics/prod/105768.jpg",
    observed_price_gbp:95,
    observed_availability:"CURRENT_LISTING",
    supplier:"Thomann UK",
    source_url:"https://www.thomann.co.uk/shure_microphones.html",
    checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET",
    mcq_sellable:false,
    sell_status:"TRADE_TERMS_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ must confirm its own supply, cost and availability before accepting payment."
  }
];

export const COMPETITORS = [
  {
    name:"WestendDJ",
    url:"https://westenddj.co.uk/",
    segment:"London DJ specialist",
    watch:["price","stock","bundles","finance","clearance","exclusive products","delivery","store/demo"],
    current_observations:[
      "Free UK delivery over £49",
      "Interest-free credit advertised up to 18 months",
      "Authorised AlphaTheta/Pioneer DJ positioning",
      "Clearance collection and product bundles",
      "Two London stores and demo-led selling"
    ],
    checked_at:"2026-09-20"
  },
  {
    name:"DJKIT",
    url:"https://www.djkit.com/",
    segment:"UK DJ specialist",
    watch:["price","stock","finance","reviews","bundles","guides","delivery"],
    current_observations:[
      "0% finance positioning",
      "Free shipping messaging",
      "Expert-advice / talk-to-a-DJ positioning",
      "Category-first image-led merchandising"
    ],
    checked_at:"2026-09-20"
  },
  {
    name:"Gear4music",
    url:"https://www.gear4music.com/",
    segment:"Large UK music retailer",
    watch:["price","stock counts","promotions","bundles","warranty","delivery"],
    current_observations:[
      "Visible unit stock counts on many products",
      "Bundle-and-save promotions",
      "30-day money-back guarantee",
      "Two-year warranty messaging"
    ],
    checked_at:"2026-09-20"
  },
  {
    name:"Andertons",
    url:"https://www.andertons.co.uk/",
    segment:"Large UK music retailer",
    watch:["price","stock","bundles","loyalty","finance","second-hand","b-stock","content"],
    current_observations:[
      "Real-time store and warehouse stock on product pages",
      "Loyalty points displayed per purchase",
      "Free next-day delivery over £199 on many products",
      "DJ bundles, second-hand and B-stock offers",
      "V12 finance including selected 0% terms"
    ],
    checked_at:"2026-09-20"
  },
  {
    name:"Thomann UK",
    url:"https://www.thomann.co.uk/",
    segment:"Large European retailer serving UK",
    watch:["price","sales rank","b-stock","warranty","returns","buyer guides","stock"],
    current_observations:[
      "Top-seller and sales-rank signals",
      "30-day money-back guarantee",
      "Three-year warranty on many products",
      "B-stock with full warranty",
      "Long-form buyer guides integrated with categories"
    ],
    checked_at:"2026-09-20"
  },
  {
    name:"Richer Sounds",
    url:"https://www.richersounds.com/",
    segment:"UK hi-fi / home cinema specialist",
    watch:["price promise","VIP","appointments","installation","finance","local service"],
    current_observations:[
      "VIP Club",
      "Video appointments",
      "Finance options including 0% on eligible purchases",
      "Local price-beat messaging",
      "Delivery, installation and on-site survey service"
    ],
    checked_at:"2026-09-20"
  },
  {
    name:"Canford",
    url:"https://www.canford.co.uk/",
    segment:"Professional audio / broadcast specialist",
    watch:["new products","technical content","stock","next-day delivery","B2B","custom manufacturing"],
    current_observations:[
      "Technical editorial around new professional products",
      "Real-time stock messaging",
      "Next-day delivery on stocked lines",
      "Custom metalwork and professional integration focus"
    ],
    checked_at:"2026-09-20"
  },
  {
    name:"Juno",
    url:"https://www.juno.co.uk/",
    segment:"DJ / vinyl / electronic music retailer",
    watch:["vinyl","DJ hardware","new releases","editorial","pricing","rare stock"],
    current_observations:[
      "Important comparator for MCQ's vinyl, DJ and culture crossover",
      "Keep in fortnightly scan even when a specific tactic is not evidenced in this baseline"
    ],
    checked_at:"2026-09-20"
  }
];

export function searchMarketCatalog(query){
  const q=String(query||"").trim().toLowerCase();
  if(!q)return [];
  const tokens=q.split(/\s+/).filter(Boolean);
  return MARKET_CATALOG.filter(p=>{
    const hay=(p.brand+" "+p.name+" "+p.category+" "+p.supplier).toLowerCase();
    return tokens.every(t=>hay.includes(t));
  }).map(p=>({...p,source:"PUBLIC_MARKET"}));
}

export function listMarketCatalog(){
  return MARKET_CATALOG.map(p=>({...p,source:"PUBLIC_MARKET"}));
}

export function listCompetitors(){
  return COMPETITORS.map(v=>({...v}));
}
