import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

test("all major MCQ pages receive one unified production navigation shell", async (t)=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"mcq-nav-"));
  process.env.NODE_ENV="test";
  process.env.MCQ_DATA_FILE=path.join(dir,"mcq.json");
  const {default:server}=await import(`../src/server.js?nav=${Date.now()}`);
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const base=`http://127.0.0.1:${server.address().port}`;

  const routes=["/","/shop","/featured","/headphones","/microphones","/wireless","/dj","/urban","/urban-gallery","/chart","/publish","/live","/vinyl","/swap","/magazine","/hire","/trade","/about"];
  for(const route of routes){
    const res=await fetch(base+route);
    assert.equal(res.status,200,route);
    const html=await res.text();
    assert.match(html,/\/site-shell\.css/,route+" css");
    assert.match(html,/\/site-shell\.js/,route+" js");
  }
  const shell=await (await fetch(base+"/site-shell.js")).text();
  assert.match(shell,/mcq-back/);
  assert.match(shell,/data-mcq-back/);
  assert.match(shell,/Home/);
  assert.match(shell,/Art Chart/);
  assert.match(shell,/Hire/);
  assert.match(shell,/history\.back/);

  const css=await (await fetch(base+"/site-shell.css")).text();
  assert.match(css,/\.mcq-mobile-nav/);
  assert.match(css,/header\.mast/);
  assert.match(css,/header\.g-top/);
});
