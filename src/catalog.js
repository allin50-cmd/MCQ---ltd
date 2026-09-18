const CATALOG = [
  {id:"sony-wh1000xm6",brand:"Sony",name:"WH-1000XM6",category:"headphones",price_band:"premium",image:"https://sony.scene7.com/is/image/sonyglobalsolutions/GGB-8071_Olive_Gray_Gallery-1?$originalDimensions$=",summary:"Flagship wireless noise cancelling with 30 mm drivers, LDAC/LC3 and long battery life.",specs:["30 mm driver","Bluetooth 5.3","LDAC / LC3","Up to 30h ANC"]},
  {id:"sony-wf1000xm6",brand:"Sony",name:"WF-1000XM6",category:"headphones",price_band:"premium",image:"https://sony.scene7.com/is/image/sonyglobalsolutions/WF-1000XM6_Image-Gallery_image01_d?$originalDimensions$=&fmt=png-alpha",summary:"Flagship true-wireless earbuds with current-generation Sony noise cancelling.",specs:["True wireless","ANC","Portable","Hi-res"]},
  {id:"sony-whch720n",brand:"Sony",name:"WH-CH720N",category:"headphones",price_band:"entry",image:"https://sony.scene7.com/is/image/sonyglobalsolutions/GGB-8071_Olive_Gray_Gallery-1?$originalDimensions$=",summary:"Lightweight everyday wireless ANC headphones with multipoint and long battery life.",specs:["ANC","Multipoint","DSEE","Up to 35h"]},
  {id:"technics-sl1200g",brand:"Technics",name:"SL-1200G",category:"turntables",price_band:"premium",image:"https://www.technics.com/content/dam/pim/uk/en/SL/SL-120/SL-1200G/ast-1651355.png.pub.thumb.644.644.png",summary:"Grand Class direct-drive turntable with coreless motor and magnesium tonearm.",specs:["Direct drive","33/45/78 rpm","0.025% W&F","Approx 18 kg"]},
  {id:"technics-sur1000",brand:"Technics",name:"SU-R1000",category:"amplifiers",price_band:"premium",image:"https://www.technics.com/content/dam/pim/uk/en/SU/SU-R10/SU-R1000/ast-1263320.png.pub.thumb.644.644.png",summary:"Reference Class integrated amplifier with digital architecture and serious phono support.",specs:["150W/ch 8Ω","300W/ch 4Ω","MM/MC phono","USB + XLR"]},
  {id:"technics-sccx700",brand:"Technics",name:"SC-CX700",category:"wireless",price_band:"premium",image:"https://www.technics.com/content/dam/pim/uk/en/SC/SC-CX7/SC-CX700/ast-2108609.png.pub.thumb.644.644.png",summary:"Active wireless hi-fi system with streaming, phono, HDMI ARC and room adjustment.",specs:["200W total","Phono MM","HDMI ARC","Space Tune"]},
  {id:"shure-sm58",brand:"Shure",name:"SM58",category:"microphones",price_band:"entry",image:"https://shure.widen.net/content/dxlbvgdzn6/webp/faq-whats-the-difference-between-the-sm58-and-the-beta58a_header.webp?color=ffffffff&position=c&quality=80&u=zenegx",summary:"Industry-standard cardioid dynamic vocal microphone.",specs:["Dynamic","Cardioid","50Hz-15kHz","Wired XLR"]},
  {id:"shure-beta58a",brand:"Shure",name:"Beta 58A",category:"microphones",price_band:"mid",image:"https://shure.widen.net/content/dxlbvgdzn6/webp/faq-whats-the-difference-between-the-sm58-and-the-beta58a_header.webp?color=ffffffff&position=c&quality=80&u=zenegx",summary:"Higher-output supercardioid dynamic vocal microphone.",specs:["Dynamic","Supercardioid","Live vocal","High output"]},
  {id:"shure-glxd24r",brand:"Shure",name:"GLXD24R+/SM58",category:"microphones",price_band:"premium",image:"https://shure.widen.net/content/zvvktyclo8/jpeg/SM57_SM58_Musician_Vocals_Environment.jpeg?color=ffffffff&position=c&quality=80&u=bx760c",summary:"Digital wireless rack system with SM58 handheld transmitter.",specs:["Digital wireless","Dual band","Rechargeable","Rack receiver"]},
  {id:"pioneer-ddjflx4",brand:"Pioneer DJ",name:"DDJ-FLX4",category:"dj",price_band:"entry",image:"https://www.pioneerdj.com/product-images/556/d067d24e-28a0-42d1-ac50-5cf2392f755e/ddj-flx4_1.png",summary:"Compact two-channel DJ controller for learning and portable setups.",specs:["2-channel","USB-C","iPhone/iPad","rekordbox / Serato"]},
  {id:"pioneer-ddjflx10",brand:"Pioneer DJ",name:"DDJ-FLX10",category:"dj",price_band:"premium",image:"https://www.pioneerdj.com/product-images/1303/130db239-d874-411b-b2ea-395c83f09255/ddj-flx10_1.png",summary:"Four-channel performance DJ controller with stems and DMX integration.",specs:["4-channel","STEMS","DMX","Professional"]},
  {id:"alphatheta-omnisduo",brand:"AlphaTheta",name:"OMNIS-DUO",category:"dj",price_band:"mid",image:"https://www.pioneerdj.com/product-images/556/d067d24e-28a0-42d1-ac50-5cf2392f755e/ddj-flx4_1.png",summary:"Portable battery-powered all-in-one DJ system.",specs:["Standalone","Battery","7-inch screen","Bluetooth I/O"]},
  {id:"sony-ultfield1",brand:"Sony",name:"ULT FIELD 1",category:"wireless",price_band:"entry",image:"https://sony.scene7.com/is/image/sonyglobalsolutions/ULT_FIELD_1_Black_Gallery_01?$originalDimensions$=",summary:"Compact portable Bluetooth speaker with IP67 protection.",specs:["IP67","Bluetooth","12h","Portable"]},
  {id:"sony-ultfield7",brand:"Sony",name:"ULT FIELD 7",category:"wireless",price_band:"mid",image:"https://unsplash.com/photos/Qia1BBnS3Tk/download?force=true&w=1000",summary:"Large portable party speaker with mic/guitar input and long battery life.",specs:["30h","IP67","Mic/guitar","Party Connect"]}
];

export function searchInternalCatalog(query){
  const q=String(query||"").trim().toLowerCase();
  if(!q)return [];
  const tokens=q.split(/\s+/).filter(Boolean);
  return CATALOG.filter(p=>{
    const hay=(p.brand+" "+p.name+" "+p.category+" "+p.summary+" "+p.specs.join(" ")).toLowerCase();
    return tokens.every(t=>hay.includes(t));
  }).map(p=>({...p,source:"MCQ catalogue",availability:"ASK_MCQ"}));
}

export function listInternalCatalog(){
  return CATALOG.map(p=>({...p,source:"MCQ catalogue",availability:"ASK_MCQ"}));
}
