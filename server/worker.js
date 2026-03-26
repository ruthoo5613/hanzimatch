/**
 * 腾讯云 ASR Cloudflare Workers 版本
 * 
 * 部署方式：
 * 1. cd server && wrangler deploy
 * 2. 或在 Cloudflare Dashboard 创建 Workers
 * 
 * 环境变量（在 Workers 设置中添加）：
 * - TENCENTCLOUD_SECRET_ID
 * - TENCENTCLOUD_SECRET_KEY
 */

export default {
  async fetch(request, env, ctx) {
    // CORS 处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method === 'POST' && request.url.includes('/asr')) {
      try {
        const body = await request.json();
        const audioBase64 = body.audio;

        if (!audioBase64) {
          return new Response(JSON.stringify({ error: 'No audio data' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }

        const result = await callTencentASR(env.TENCENTCLOUD_SECRET_ID, env.TENCENTCLOUD_SECRET_KEY, audioBase64);

        return new Response(JSON.stringify({ text: result }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    return new Response('ASR Worker Running', { status: 200 });
  },
};

// 调用腾讯云 ASR API
async function callTencentASR(secretId, secretKey, audioBase64) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    EngineType: '16k',
    Audio: audioBase64,
    VoiceFormat: 'wav',
    SampleRate: 16000,
    Seq: 1,
    End: 1,
  });

  const authorization = generateSignature(secretId, secretKey, payload, timestamp);

  const response = await fetch('https://asr.tencentcloudapi.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Host': 'asr.tencentcloudapi.com',
      'X-TC-Action': 'SentenceRecog',
      'X-TC-Version': '2019-06-14',
      'X-TC-Timestamp': timestamp.toString(),
      'Authorization': authorization,
    },
    body: payload,
  });

  const result = await response.json();
  
  if (result.Response && result.Response.Result) {
    return result.Response.Result;
  } else {
    throw new Error(JSON.stringify(result));
  }
}

// 简单的 hash 和 hmac 实现（使用 Web Crypto API）
function hex(buff) {
  return Array.from(new Uint8Array(buff)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(message) {
  return await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message));
}

async function hmac(key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
}

// 生成 TC3-HMAC-SHA256 签名
async function generateSignature(secretId, secretKey, payload, timestamp) {
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];

  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQuerystring = '';
  const contentType = 'application/json';
  const canonicalHeaders = `content-type:${contentType}\nhost:asr.tencentcloudapi.com\nx-tc-action:sentenceRecog\n`;
  const signedHeaders = 'content-type;host;x-tc-action';
  const hashedRequestPayload = hex(await sha256(payload));

  const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;

  const algorithm = 'TC3-HMAC-SHA256';
  const credentialScope = `${date}/asr/tc3_request`;
  const hashedCanonicalRequest = hex(await sha256(canonicalRequest));
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

  const secretDate = await hmac(new TextEncoder().encode('TC3' + secretKey), date);
  const secretSigning = await hmac(secretDate, 'asr');
  const signature = hex(await hmac(secretSigning, stringToSign));

  return `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}