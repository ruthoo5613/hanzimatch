/**
 * 腾讯云 ASR Cloudflare Worker
 * 
 * 环境变量（通过 wrangler secret 设置）：
 * - TENCENTCLOUD_SECRET_ID
 * - TENCENTCLOUD_SECRET_KEY
 */

// SHA256 哈希
async function sha256Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// HMAC-SHA256
async function hmacSha256Hex(key, msg) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(msg);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 生成 TC3-HMAC-SHA256 签名
async function generateSignature(secretId, secretKey, payload, timestamp) {
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];
  
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQuerystring = '';
  const contentType = 'application/json';
  const canonicalHeaders = `content-type:${contentType}\nhost:asr.tencentcloudapi.com\nx-tc-action:SentenceRecognition\n`;
  const signedHeaders = 'content-type;host;x-tc-action';
  const hashedRequestPayload = await sha256Hex(payload);
  
  const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;
  
  const algorithm = 'TC3-HMAC-SHA256';
  const credentialScope = `${date}/asr/tc3_request`;
  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
  
  const secretDate = await hmacSha256Hex('TC3' + secretKey, date);
  const secretSigning = await hmacSha256Hex(secretDate, 'asr');
  const signature = await hmacSha256Hex(secretSigning, stringToSign);
  
  return `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

// 调用腾讯云 ASR API
async function callTencentASR(audioBase64, env) {
  const secretId = env.TENCENTCLOUD_SECRET_ID;
  const secretKey = env.TENCENTCLOUD_SECRET_KEY;
  
  if (!secretId || !secretKey) {
    throw new Error('Tencent Cloud credentials not configured');
  }
  
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    EngineType: '16k',
    Audio: audioBase64,
    VoiceFormat: 'wav',
    SampleRate: 16000,
    Seq: 1,
    End: 1
  });
  
  const authorization = await generateSignature(secretId, secretKey, payload, timestamp);
  
  const response = await fetch('https://asr.tencentcloudapi.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Host': 'asr.tencentcloudapi.com',
      'X-TC-Action': 'SentenceRecognition',
      'X-TC-Version': '2019-06-14',
      'X-TC-Timestamp': timestamp.toString(),
      'Authorization': authorization
    },
    body: payload
  });
  
  const data = await response.json();
  
  if (data.Response && data.Response.Result) {
    return data.Response.Result;
  } else {
    throw new Error(JSON.stringify(data));
  }
}

export default {
  async fetch(request, env, ctx) {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method === 'GET') {
      return new Response('ASR Worker Running', { 
        headers: { 'Content-Type': 'text/plain' } 
      });
    }

    if (request.method === 'POST' && request.url.endsWith('/asr')) {
      try {
        const body = await request.json();
        const audioBase64 = body.audio;
        
        if (!audioBase64) {
          return new Response(JSON.stringify({ error: 'No audio data' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const result = await callTencentASR(audioBase64, env);
        
        return new Response(JSON.stringify({ text: result }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      } catch (error) {
        console.error('ASR Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};