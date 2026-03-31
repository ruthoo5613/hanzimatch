/**
 * 腾讯云 ASR Cloudflare Workers 版本
 * 使用 URL 参数签名方式
 */

export default {
  async fetch(request, env, ctx) {
    // CORS
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
        console.error('ASR Error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    return new Response('ASR Worker Running', { status: 200 });
  },
};

// 使用腾讯云 REST API URL 签名方式
async function callTencentASR(secretId, secretKey, audioBase64) {
  const endpoint = 'asr.tencentcloudapi.com';
  const service = 'asr';
  
  const timestamp = Math.floor(Date.now() / 1000) * 1000;  // 毫秒
  const date = new Date(timestamp).toISOString().split('T')[0];
  
  // 构建 GET 请求参数（按字母顺序）
  const params = new URLSearchParams({
    Action: 'SentenceRecognition',
    Version: '2019-06-14',
    Region: 'ap-guangzhou',
    EngineType: '16k',
    Audio: audioBase64,
    VoiceFormat: 'wav',
    SampleRate: '16000',
    Seq: '1',
    End: '1',
    Timestamp: timestamp.toString(),
   Nonce: Math.floor(Math.random() * 1000000).toString(),
  });

  // GET 请求 URL
  const method = 'GET';
  const path = '/';
  const queryString = params.toString();
  const url = `https://${endpoint}/${path}?${queryString}`;

  // 生成签名
  const authorization = await generateTC3Signature(
    secretId, secretKey, method, path, queryString, timestamp, date
  );

  // 发送请求
  const response = await fetch(url, {
    method: method,
    headers: {
      'Host': endpoint,
      'Content-Type': 'application/json',
      'Authorization': authorization,
      'X-TC-Action': 'SentenceRecognition',
      'X-TC-Version': '2019-06-14',
      'X-TC-Timestamp': Math.floor(timestamp / 1000).toString(),
      'X-TC-Region': 'ap-guangzhou',
    },
  });

  const result = await response.json();
  
  if (result.Response && result.Response.Result) {
    return result.Response.Result;
  } else if (result.Response && result.Response.Error) {
    throw new Error(JSON.stringify(result.Response.Error));
  } else {
    throw new Error(JSON.stringify(result));
  }
}

// TC3-HMAC-SHA256 签名
async function generateTC3Signature(secretId, secretKey, method, path, queryString, timestamp, date) {
  const algorithm = 'TC3-HMAC-SHA256';
  const service = 'asr';
  
  // 1. 规范请求串
  const canonicalUri = path;
  const canonicalQueryString = queryString;
  const canonicalHeaders = `content-type:application/json\nhost:asr.tencentcloudapi.com\n`;
  const signedHeaders = 'content-type;host';
  
  const hashedRequestPayload = await sha256Hex('');
  
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    hashedRequestPayload,
  ].join('\n');

  // 2. 拼接待签名字符串
  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = await sha256Hex(canonicalRequest);
  const stringToSign = [
    algorithm,
    Math.floor(timestamp / 1000),
    credentialScope,
    hashedCanonicalRequest,
  ].join('\n');

  // 3. 计算签名
  const kSecretKey = 'TC3' + secretKey;
  const kDate = await hmacHex(kSecretKey, date);
  const kService = await hmacHex(kDate, service);
  const kSigning = await hmacHex(kService, 'tc3_request');
  const signature = await hmacHex(kSigning, stringToSign);

  // 4. 拼接
  return `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function sha256Hex(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return bin2hex(hashBuffer);
}

async function hmacHex(key, message) {
  const keyBuffer = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return bin2hex(signature);
}

function bin2hex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}