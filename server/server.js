/**
 * 腾讯云 ASR 服务端
 * 使用方式: TENCENTCLOUD_SECRET_ID=xxx TENCENTCLOUD_SECRET_KEY=xxx node server.js
 */
import http from 'http';
import crypto from 'crypto';

const SECRET_ID = process.env.TENCENTCLOUD_SECRET_ID || 'YOUR_SECRET_ID';
const SECRET_KEY = process.env.TENCENTCLOUD_SECRET_KEY || 'YOUR_SECRET_KEY';

// 生成 TC3-HMAC-SHA256 签名
function generateSignature(secretId, secretKey, payload, timestamp) {
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];
  
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQuerystring = '';
  const contentType = 'application/json';
  const canonicalHeaders = `content-type:${contentType}\nhost:asr.tencentcloudapi.com\nx-tc-action:sentenceRecog\n`;
  const signedHeaders = 'content-type;host;x-tc-action';
  const hashedRequestPayload = crypto.createHash('sha256').update(payload).digest('hex');
  
  const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;
  
  const algorithm = 'TC3-HMAC-SHA256';
  const credentialScope = `${date}/asr/tc3_request`;
  const hashedCanonicalRequest = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
  const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;
  
  const secretDate = crypto.createHmac('sha256', 'TC3' + secretKey).update(date).digest();
  const secretSigning = crypto.createHmac('sha256', secretDate).update('asr').digest();
  const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');
  
  return `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

// 调用腾讯云 ASR API
async function callTencentASR(audioBase64, engineType = '16k') {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = JSON.stringify({
    EngineType: engineType,
    Audio: audioBase64,
    VoiceFormat: 'wav',
    SampleRate: 16000,
    Seq: 1,
    End: 1
  });
  
  const authorization = generateSignature(SECRET_ID, SECRET_KEY, payload, timestamp);
  
  const options = {
    hostname: 'asr.tencentcloudapi.com',
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Host': 'asr.tencentcloudapi.com',
      'X-TC-Action': 'SentenceRecog',
      'X-TC-Version': '2019-06-14',
      'X-TC-Timestamp': timestamp.toString(),
      'Authorization': authorization
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.Response && result.Response.Result) {
            resolve(result.Response.Result);
          } else {
            reject(new Error(JSON.stringify(result)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// 解析 multipart/form-data 音频
function parseMultipart(buffer, boundary) {
  const parts = buffer.toString('binary').split('--' + boundary);
  for (const part of parts) {
    if (part.includes('audio')) {
      const audioMatch = part.match(/Content-Type: audio\/\w+\r\n\r\n([\s\S]*?)(?=\r\n--)/);
      if (audioMatch) {
        return Buffer.from(audioMatch[1], 'binary').toString('base64');
      }
    }
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'POST' && req.url === '/asr') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', async () => {
      try {
        const buffer = Buffer.concat(body);
        const contentType = req.headers['content-type'] || '';
        
        let audioBase64;
        if (contentType.includes('application/json')) {
          const json = JSON.parse(buffer.toString());
          audioBase64 = json.audio;
        } else if (contentType.includes('multipart/form-data')) {
          const boundary = contentType.match(/boundary=(.+)/)[1];
          audioBase64 = parseMultipart(buffer, boundary);
        }
        
        if (!audioBase64) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No audio data' }));
          return;
        }
        
        const result = await callTencentASR(audioBase64);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ text: result }));
      } catch (error) {
        console.error('ASR Error:', error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`ASR Server running on http://localhost:${PORT}`);
  console.log(`请设置环境变量: TENCENTCLOUD_SECRET_ID 和 TENCENTCLOUD_SECRET_KEY`);
});