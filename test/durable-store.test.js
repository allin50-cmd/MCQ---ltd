import test from "node:test";
import assert from "node:assert/strict";

test("production store fails closed when durable state is not configured", async()=>{
  const oldNode=process.env.NODE_ENV,oldMode=process.env.MCQ_STATE_MODE,oldUrl=process.env.AGENTX_SERVICE_URL,oldToken=process.env.MCQ_SERVICE_TOKEN;
  process.env.NODE_ENV="production";delete process.env.MCQ_STATE_MODE;delete process.env.AGENTX_SERVICE_URL;delete process.env.MCQ_SERVICE_TOKEN;
  const {load}=await import("../src/store.js?durable="+Date.now());
  await assert.rejects(load(),/durable MCQ state is not configured/);
  if(oldNode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=oldNode;
  if(oldMode===undefined)delete process.env.MCQ_STATE_MODE;else process.env.MCQ_STATE_MODE=oldMode;
  if(oldUrl===undefined)delete process.env.AGENTX_SERVICE_URL;else process.env.AGENTX_SERVICE_URL=oldUrl;
  if(oldToken===undefined)delete process.env.MCQ_SERVICE_TOKEN;else process.env.MCQ_SERVICE_TOKEN=oldToken;
});


test("durable state retries transient GET but never blindly retries PUT", async()=>{
  const old={
    node:process.env.NODE_ENV,
    mode:process.env.MCQ_STATE_MODE,
    url:process.env.AGENTX_SERVICE_URL,
    token:process.env.MCQ_SERVICE_TOKEN,
    retryBase:process.env.MCQ_DURABLE_GET_RETRY_BASE_MS,
    attempts:process.env.MCQ_DURABLE_GET_ATTEMPTS,
    fetch:globalThis.fetch
  };
  process.env.NODE_ENV="production";
  delete process.env.MCQ_STATE_MODE;
  process.env.AGENTX_SERVICE_URL="https://agentx.example";
  process.env.MCQ_SERVICE_TOKEN="token";
  process.env.MCQ_DURABLE_GET_RETRY_BASE_MS="1";
  process.env.MCQ_DURABLE_GET_ATTEMPTS="12";

  let getCalls=0;
  globalThis.fetch=async(_url,init)=>{
    if(init.method==="GET"){
      getCalls++;
      if(getCalls===1)return new Response("upstream cold",{status:502});
      return new Response(JSON.stringify({payload:{equipment:[]},version:1}),{status:200,headers:{"content-type":"application/json"}});
    }
    throw new Error("unexpected write during load");
  };

  const store=await import("../src/store.js?retry="+Date.now());
  const state=await store.load();
  assert.equal(getCalls,2);
  assert.deepEqual(state.equipment,[]);

  let putCalls=0;
  globalThis.fetch=async(_url,init)=>{
    if(init.method==="PUT"){
      putCalls++;
      return new Response(JSON.stringify({error:"temporary"}),{status:502,headers:{"content-type":"application/json"}});
    }
    throw new Error("unexpected method");
  };
  await assert.rejects(store.save(state),/temporary/);
  assert.equal(putCalls,1);

  globalThis.fetch=old.fetch;
  if(old.node===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=old.node;
  if(old.mode===undefined)delete process.env.MCQ_STATE_MODE;else process.env.MCQ_STATE_MODE=old.mode;
  if(old.url===undefined)delete process.env.AGENTX_SERVICE_URL;else process.env.AGENTX_SERVICE_URL=old.url;
  if(old.token===undefined)delete process.env.MCQ_SERVICE_TOKEN;else process.env.MCQ_SERVICE_TOKEN=old.token;
  if(old.retryBase===undefined)delete process.env.MCQ_DURABLE_GET_RETRY_BASE_MS;else process.env.MCQ_DURABLE_GET_RETRY_BASE_MS=old.retryBase;
  if(old.attempts===undefined)delete process.env.MCQ_DURABLE_GET_ATTEMPTS;else process.env.MCQ_DURABLE_GET_ATTEMPTS=old.attempts;
});
