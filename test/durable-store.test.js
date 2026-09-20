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
