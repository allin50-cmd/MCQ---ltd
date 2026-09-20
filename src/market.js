import {evaluateCatalogRow,CATALOG_STATES,IMAGE_PERMISSION_STATES} from "./catalog_contract.js";

export const MARKET_CATALOG = [
  {
    id:"mkt-thomann-hd25", brand:"Sennheiser", name:"HD 25", model:"HD 25", category:"headphones",
    image:"https://www.blue-music.de/out/pictures/master/product/1/product-detail-x2-desktop-HD-25-Isofront-RGB-01-1-736918.jpg",
    images:[{url:"https://www.blue-music.de/out/pictures/master/product/1/product-detail-x2-desktop-HD-25-Isofront-RGB-01-1-736918.jpg",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:105, delivery_cost_inc_vat_gbp:8.9,
    observed_price_gbp:105, observed_availability:"CURRENT_LISTING", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/sennheiser_hd_25.htm", source_url:"https://www.thomann.co.uk/sennheiser_hd_25.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/sennheiser_hd_25.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-athm50x", brand:"Audio-Technica", name:"ATH-M50X", model:"ATH-M50X", category:"headphones",
    image:"https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1750176997-audio-technica-ath-m50x-headphones-001-685194d1af581.jpg?crop=0.700xw%3A0.933xh%3B0.132xw%2C0.0478xh&resize=980%3A%2A",
    images:[{url:"https://hips.hearstapps.com/vader-prod.s3.amazonaws.com/1750176997-audio-technica-ath-m50x-headphones-001-685194d1af581.jpg?crop=0.700xw%3A0.933xh%3B0.132xw%2C0.0478xh&resize=980%3A%2A",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:129, delivery_cost_inc_vat_gbp:8.9,
    observed_price_gbp:129, observed_availability:"IN_STOCK_IMMEDIATE", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/audio_technica_ath_m50_x.htm", source_url:"https://www.thomann.co.uk/audio_technica_ath_m50_x.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/audio_technica_ath_m50_x.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-sm58", brand:"Shure", name:"SM58 LC", model:"SM58 LC", category:"microphones",
    image:"https://www.beatboxentertainment.com/cdn/shop/products/sm58_front.jpg?v=1673798437&width=2048",
    images:[{url:"https://www.beatboxentertainment.com/cdn/shop/products/sm58_front.jpg?v=1673798437&width=2048",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:99, delivery_cost_inc_vat_gbp:8.9,
    observed_price_gbp:99, observed_availability:"IN_STOCK_IMMEDIATE", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/shure_sm58.htm", source_url:"https://www.thomann.co.uk/shure_sm58.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/shure_sm58.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-sm57", brand:"Shure", name:"SM57 LC", model:"SM57 LC", category:"microphones",
    image:"https://promusic.cl/cdn/shop/files/SM57_2_b22e3862-2138-4cf8-a70e-66418fff9a29.jpg?v=1765564417&width=2000",
    images:[{url:"https://promusic.cl/cdn/shop/files/SM57_2_b22e3862-2138-4cf8-a70e-66418fff9a29.jpg?v=1765564417&width=2000",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:95, delivery_cost_inc_vat_gbp:8.9,
    observed_price_gbp:95, observed_availability:"CURRENT_LISTING", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/shure_sm57_lc.htm", source_url:"https://www.thomann.co.uk/shure_sm57_lc.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/shure_sm57_lc.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-e835", brand:"Sennheiser", name:"e835", model:"e835", category:"microphones",
    image:"https://cdn11.bigcommerce.com/s-qzsvj0y9o3/images/stencil/1280x1280/products/64239/430631/YOTHER139968__51474.1726049688.jpg?c=1",
    images:[{url:"https://cdn11.bigcommerce.com/s-qzsvj0y9o3/images/stencil/1280x1280/products/64239/430631/YOTHER139968__51474.1726049688.jpg?c=1",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:77, delivery_cost_inc_vat_gbp:8.9,
    observed_price_gbp:77, observed_availability:"IN_STOCK", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/sennheiser_e835.htm", source_url:"https://www.thomann.co.uk/sennheiser_e835.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/sennheiser_e835.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-hs5", brand:"Yamaha", name:"HS5", model:"HS5", category:"studio",
    image:"https://www.musicworks.co.nz/content/products/yamaha-hs5-powered-studio-monitor-5-inch-hs5-0351048001710815370.jpg?canvas=1%3A1&width=2500",
    images:[{url:"https://www.musicworks.co.nz/content/products/yamaha-hs5-powered-studio-monitor-5-inch-hs5-0351048001710815370.jpg?canvas=1%3A1&width=2500",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:139, delivery_cost_inc_vat_gbp:8.9,
    observed_price_gbp:139, observed_availability:"CURRENT_TOP_SELLER", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/yamaha_hs_5.htm", source_url:"https://www.thomann.co.uk/yamaha_hs_5.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/yamaha_hs_5.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-t5v", brand:"ADAM Audio", name:"T5V", model:"T5V", category:"studio",
    image:"https://m.media-amazon.com/images/S/aplus-media-library-service-media/8b7df165-3524-4f71-a5e5-6dc16d12357a.__CR0%2C0%2C1940%2C1200_PT0_SX970_V1___.jpg",
    images:[{url:"https://m.media-amazon.com/images/S/aplus-media-library-service-media/8b7df165-3524-4f71-a5e5-6dc16d12357a.__CR0%2C0%2C1940%2C1200_PT0_SX970_V1___.jpg",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:155, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:155, observed_availability:"CURRENT_LISTING", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/adam_t5v.htm", source_url:"https://www.thomann.co.uk/adam_t5v.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/adam_t5v.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-jbl305", brand:"JBL", name:"305P MKII", model:"305P MKII", category:"studio",
    image:"https://cdn10.bigcommerce.com/s-31108/products/1079/images/19389/JBL_305P_MKII_A__41178.1593773189.1280.1280.jpg?c=2",
    images:[{url:"https://cdn10.bigcommerce.com/s-31108/products/1079/images/19389/JBL_305P_MKII_A__41178.1593773189.1280.1280.jpg?c=2",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:119, delivery_cost_inc_vat_gbp:8.9,
    observed_price_gbp:119, observed_availability:"IN_STOCK", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/jbl_lsr_305p_mkii.htm", source_url:"https://www.thomann.co.uk/jbl_lsr_305p_mkii.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/jbl_lsr_305p_mkii.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-eris35", brand:"PreSonus", name:"Eris 3.5 2nd Gen", model:"Eris 3.5 2nd Gen", category:"studio",
    image:"https://produtos.egitana.pt/presonus-eris-35-2nd-gen_652d136f6b2ef.jpg?v=2026-04-15+09%3A30%3A11",
    images:[{url:"https://produtos.egitana.pt/presonus-eris-35-2nd-gen_652d136f6b2ef.jpg?v=2026-04-15+09%3A30%3A11",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:85, delivery_cost_inc_vat_gbp:8.9,
    observed_price_gbp:85, observed_availability:"CURRENT_LISTING", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/presonus_eris_3.5_2nd_gen.htm", source_url:"https://www.thomann.co.uk/presonus_eris_3.5_2nd_gen.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/presonus_eris_3.5_2nd_gen.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-sclive4", brand:"Denon DJ", name:"SC Live 4", model:"SC Live 4", category:"dj",
    image:"https://rubadub.co.uk/cdn/shop/products/SCLIVE4_Top_Web_1200x.jpg?v=1667396610",
    images:[{url:"https://rubadub.co.uk/cdn/shop/products/SCLIVE4_Top_Web_1200x.jpg?v=1667396610",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:933, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:933, observed_availability:"IN_STOCK", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/denon_dj_sc_live_4.htm", source_url:"https://www.thomann.co.uk/denon_dj_sc_live_4.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/denon_dj_sc_live_4.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-mixstream", brand:"Numark", name:"Mixstream Pro+", model:"Mixstream Pro+", category:"dj",
    image:"https://westenddj.co.uk/cdn/shop/products/mixstream-pro-plus-top.jpg?v=1700694486&width=1024",
    images:[{url:"https://westenddj.co.uk/cdn/shop/products/mixstream-pro-plus-top.jpg?v=1700694486&width=1024",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:559, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:559, observed_availability:"CURRENT_LISTING", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/numark_mixstream_pro_559714.htm", source_url:"https://www.thomann.co.uk/numark_mixstream_pro_559714.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/numark_mixstream_pro_559714.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-sl1210mk7", brand:"Technics", name:"SL-1210MK7", model:"SL-1210MK7", category:"turntables",
    image:"https://a.storyblok.com/f/49568/4102x4102/b654e8affd/tps_1335_479661_december138002-479661n.jpg/m/1600x0/filters%3Aquality%2890%29",
    images:[{url:"https://a.storyblok.com/f/49568/4102x4102/b654e8affd/tps_1335_479661_december138002-479661n.jpg/m/1600x0/filters%3Aquality%2890%29",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:855, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:855, observed_availability:"CURRENT_LISTING_VERIFY_LEAD", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/technics_sl_1210_mk_7.htm", source_url:"https://www.thomann.co.uk/technics_sl_1210_mk_7.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/technics_sl_1210_mk_7.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-ts412", brand:"Alto Professional", name:"TS412", model:"TS412", category:"pa",
    image:"https://static.sonovente.com/img/library/zoom/84/optim/84763_1.jpg",
    images:[{url:"https://static.sonovente.com/img/library/zoom/84/optim/84763_1.jpg",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:298, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:298, observed_availability:"HIGH_AVAILABILITY", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/alto_ts_412.htm", source_url:"https://www.thomann.co.uk/alto_ts_412.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/alto_ts_412.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-eon715", brand:"JBL", name:"EON715", model:"EON715", category:"pa",
    image:"https://www.americanmusical.com/media/catalog/product/j/b/jbl_eon715_m4.jpg",
    images:[{url:"https://www.americanmusical.com/media/catalog/product/j/b/jbl_eon715_m4.jpg",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:479, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:479, observed_availability:"CURRENT_LISTING_VERIFY_STOCK", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/jbl_eon715.htm", source_url:"https://www.thomann.co.uk/jbl_eon715.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/jbl_eon715.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-h4essential", brand:"Zoom", name:"H4essential", model:"H4essential", category:"recorders",
    image:"https://cdn.uniquephoto.com/resources/uniquephoto/images/products/processed/ZOM3065.superZoom.l.jpg",
    images:[{url:"https://cdn.uniquephoto.com/resources/uniquephoto/images/products/processed/ZOM3065.superZoom.l.jpg",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:169, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:169, observed_availability:"HIGH_CONFIDENCE", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/zoom_h4essential.htm", source_url:"https://www.thomann.co.uk/zoom_h4essential.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/zoom_h4essential.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-thomann-concorde-mix", brand:"Ortofon", name:"Concorde Mix MKII System", model:"Concorde Mix MKII System", category:"turntables",
    image:"https://hifi.nl/gfx/20180125102510_Ortofon_Concorde_Mix.jpg",
    images:[{url:"https://hifi.nl/gfx/20180125102510_Ortofon_Concorde_Mix.jpg",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:72, delivery_cost_inc_vat_gbp:8.9,
    observed_price_gbp:72, observed_availability:"CURRENT_LISTING", supplier:"Thomann UK",
    product_url:"https://www.thomann.co.uk/ortofon_concorde_mix_mkii_system.htm", source_url:"https://www.thomann.co.uk/ortofon_concorde_mix_mkii_system.htm",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.thomann.co.uk/ortofon_concorde_mix_mkii_system.htm", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-g4m-flx10", brand:"Pioneer DJ", name:"DDJ-FLX10", model:"DDJ-FLX10", category:"dj",
    image:"https://www.pioneerdj.com/product-images/1303/130db239-d874-411b-b2ea-395c83f09255/ddj-flx10_1.png",
    images:[{url:"https://www.pioneerdj.com/product-images/1303/130db239-d874-411b-b2ea-395c83f09255/ddj-flx10_1.png",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:1568, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:1568, observed_availability:"12_IN_STOCK_AT_SCAN", supplier:"Gear4music",
    product_url:"https://www.gear4music.com/PA-DJ-and-Lighting/Pioneer-DJ-DDJ-FLX10-Controller-for-Rekordbox-and-Serato/5HVN", source_url:"https://www.gear4music.com/PA-DJ-and-Lighting/Pioneer-DJ-DDJ-FLX10-Controller-for-Rekordbox-and-Serato/5HVN",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.gear4music.com/PA-DJ-and-Lighting/Pioneer-DJ-DDJ-FLX10-Controller-for-Rekordbox-and-Serato/5HVN", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-westend-flx4", brand:"Pioneer DJ", name:"DDJ-FLX4", model:"DDJ-FLX4", category:"dj",
    image:"https://www.pioneerdj.com/product-images/556/d067d24e-28a0-42d1-ac50-5cf2392f755e/ddj-flx4_1.png",
    images:[{url:"https://www.pioneerdj.com/product-images/556/d067d24e-28a0-42d1-ac50-5cf2392f755e/ddj-flx4_1.png",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:299, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:299, observed_availability:"ADD_TO_CART", supplier:"WestendDJ",
    product_url:"https://westenddj.co.uk/products/pioneer-dj-ddj-flx4-smart-dj-controller", source_url:"https://westenddj.co.uk/products/pioneer-dj-ddj-flx4-smart-dj-controller",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://westenddj.co.uk/products/pioneer-dj-ddj-flx4-smart-dj-controller", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-g4m-flx4", brand:"Pioneer DJ", name:"DDJ-FLX4", model:"DDJ-FLX4", category:"dj",
    image:"https://www.pioneerdj.com/product-images/556/d067d24e-28a0-42d1-ac50-5cf2392f755e/ddj-flx4_1.png",
    images:[{url:"https://www.pioneerdj.com/product-images/556/d067d24e-28a0-42d1-ac50-5cf2392f755e/ddj-flx4_1.png",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:324, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:324, observed_availability:"20_PLUS_IN_STOCK_AT_SCAN", supplier:"Gear4music",
    product_url:"https://www.gear4music.com/PA-DJ-and-Lighting/DJ-Controllers", source_url:"https://www.gear4music.com/PA-DJ-and-Lighting/DJ-Controllers",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.gear4music.com/PA-DJ-and-Lighting/DJ-Controllers", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-g4m-sclive4", brand:"Denon DJ", name:"SC Live 4", model:"SC Live 4", category:"dj",
    image:"https://rubadub.co.uk/cdn/shop/products/SCLIVE4_Top_Web_1200x.jpg?v=1667396610",
    images:[{url:"https://rubadub.co.uk/cdn/shop/products/SCLIVE4_Top_Web_1200x.jpg?v=1667396610",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:979, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:979, observed_availability:"1_IN_STOCK_AT_SCAN", supplier:"Gear4music",
    product_url:"https://www.gear4music.com/PA-DJ-and-Lighting/DJ-Controllers", source_url:"https://www.gear4music.com/PA-DJ-and-Lighting/DJ-Controllers",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.gear4music.com/PA-DJ-and-Lighting/DJ-Controllers", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-g4m-grv6", brand:"AlphaTheta", name:"DDJ-GRV6", model:"DDJ-GRV6", category:"dj",
    image:"https://cf1.zzounds.com/media/productmedia/fit%2C2018by3200/quality%2C85/APT_DDJGRV6_Angle_891889-5ba349dfa7d8510f7e3f7781ed0c02ba.jpg",
    images:[{url:"https://cf1.zzounds.com/media/productmedia/fit%2C2018by3200/quality%2C85/APT_DDJGRV6_Angle_891889-5ba349dfa7d8510f7e3f7781ed0c02ba.jpg",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:756, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:756, observed_availability:"13_IN_STOCK_AT_SCAN", supplier:"Gear4music",
    product_url:"https://www.gear4music.com/PA-DJ-and-Lighting/DJ-Controllers", source_url:"https://www.gear4music.com/PA-DJ-and-Lighting/DJ-Controllers",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://www.gear4music.com/PA-DJ-and-Lighting/DJ-Controllers", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
  },
  {
    id:"mkt-westend-flx10", brand:"Pioneer DJ", name:"DDJ-FLX10", model:"DDJ-FLX10", category:"dj",
    image:"https://www.pioneerdj.com/product-images/1303/130db239-d874-411b-b2ea-395c83f09255/ddj-flx10_1.png",
    images:[{url:"https://www.pioneerdj.com/product-images/1303/130db239-d874-411b-b2ea-395c83f09255/ddj-flx10_1.png",source:"public manufacturer/supplier media reference",permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,verified:false,width:null,height:null}],
    image_source:"public manufacturer/supplier media reference", image_permission_status:IMAGE_PERMISSION_STATES.UNVERIFIED,
    supplier_sku:null, real_cost_price_ex_vat_gbp:null, delivery_cost_ex_vat_gbp:null, mcq_retail_price_inc_vat_gbp:null, cost_evidence_url:null,
    requested_state:CATALOG_STATES.DRAFT,
    observed_public_price_inc_vat_gbp:1449, delivery_cost_inc_vat_gbp:0,
    observed_price_gbp:1449, observed_availability:"CURRENT_LISTING", supplier:"WestendDJ",
    product_url:"https://westenddj.co.uk/collections/pioneer-dj-1", source_url:"https://westenddj.co.uk/collections/pioneer-dj-1",
    source_note:"Public market observation only; not MCQ stock or supplier trade evidence. Product may be sourced through MCQ after MCQ confirms supply, selling price and current availability.",
    last_checked:"2026-09-20", availability_checked_at:"2026-09-20", availability_evidence_url:"https://westenddj.co.uk/collections/pioneer-dj-1", checked_at:"2026-09-20",
    evidence_state:"PUBLIC_MARKET", mcq_sellable:false, sell_status:"MCQ_CONFIRMATION_REQUIRED",
    summary:"Current UK public-market benchmark. MCQ will confirm its own supply, selling price and availability before payment."
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

export function evaluatedMarketCatalog(){
  return MARKET_CATALOG.map(row=>evaluateCatalogRow(row));
}

export function searchMarketCatalog(query){
  const q=String(query||"").trim().toLowerCase();
  if(!q)return [];
  const tokens=q.split(/\s+/).filter(Boolean);
  return evaluatedMarketCatalog().filter(p=>p.public_display).filter(p=>{
    const hay=(p.brand+" "+p.name+" "+p.category+" "+p.supplier).toLowerCase();
    return tokens.every(t=>hay.includes(t));
  }).map(p=>({...p,source:"PUBLIC_MARKET"}));
}

export function listMarketCatalog(){
  return evaluatedMarketCatalog().map(p=>({...p,source:"PUBLIC_MARKET"}));
}

export function listCompetitors(){
  return COMPETITORS.map(v=>({...v}));
}
