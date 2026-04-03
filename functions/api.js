/**
 * 腾讯云 ASR Cloudflare Workers 版本
 * 使用 URL 参数签名方式
 * 
 * PayPal webhook 和订单验证
 */

// PayPal 配置
const PAYPAL_CLIENT_ID = 'AR4yawe_hpBv1Ops3gzrX6ZYvujhQknnxY63vOjfu5b1uFR4Y33Cofov-m6iiZ71GKDaGYit1_KtolxL';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com'; // Sandbox
// 生产环境: const PAYPAL_BASE_URL = 'https://api-m.paypal.com';

export default {
  async fetch(request, env, ctx) {
    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, PayPal-Transmission-Signature, PayPal-Transmission-Id',
        },
      });
    }

    // PayPal Webhook 端点
    if (request.method === 'POST' && request.url.includes('/webhook/paypal')) {
      return handlePayPalWebhook(request, env);
    }

    // 订单验证端点
    if (request.method === 'POST' && request.url.includes('/api/verify-order')) {
      return handleVerifyOrder(request, env);
    }

    // ASR 端点
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

// ========== PayPal Webhook 处理 ==========

/**
 * 处理 PayPal Webhook 回调
 */
async function handlePayPalWebhook(request, env) {
  try {
    const body = await request.text();
    const headers = request.headers;
    
    // 获取 Webhook 头部信息
    const transmissionId = headers.get('Paypal-Transmission-Id');
    const timestamp = headers.get('Paypal-Transmission-Time');
    const signature = headers.get('Paypal-Transmission-Signature');
    const certUrl = headers.get('Paypal-Cert-Url');
    const webhookId = env.PAYPAL_WEBHOOK_ID || 'YOUR_WEBHOOK_ID';
    
    console.log('Received PayPal webhook:', {
      transmissionId,
      timestamp,
      event_type: JSON.parse(body).event_type
    });
    
    // 验证 Webhook 签名 (可选，生产环境建议启用)
    // const isValid = await verifyPayPalSignature(body, transmissionId, timestamp, signature, certUrl);
    // if (!isValid) {
    //   console.error('Invalid PayPal webhook signature');
    //   return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    // }
    
    const event = JSON.parse(body);
    
    // 处理不同事件类型
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED':
        // 订单已批准
        console.log('Order approved:', event.resource.purchase_units[0].custom_id);
        break;
        
      case 'PAYMENT.CAPTURE.COMPLETED':
        // 支付已完成
        await handlePaymentCompleted(event.resource, env);
        break;
        
      case 'PAYMENT.CAPTURE.DENIED':
        // 支付被拒绝
        await handlePaymentDenied(event.resource, env);
        break;
        
      case 'SUBSCRIPTION.ACTIVATED':
        // 订阅已激活
        await handleSubscriptionActivated(event.resource, env);
        break;
        
      case 'SUBSCRIPTION.CANCELLED':
        // 订阅已取消
        await handleSubscriptionCancelled(event.resource, env);
        break;
        
      case 'SUBSCRIPTION.EXPIRED':
        // 订阅已过期
        await handleSubscriptionExpired(event.resource, env);
        break;
        
      default:
        console.log('Unhandled event type:', event.event_type);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
    
  } catch (error) {
    console.error('Webhook处理错误:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

/**
 * 处理支付完成事件
 */
async function handlePaymentCompleted(payment, env) {
  const purchaseUnit = payment.payments?.captures?.[0] || payment;
  const amount = purchaseUnit.amount?.value;
  const currency = purchaseUnit.amount?.currency_code;
  const customId = purchaseUnit.custom_id; // 我们传递的用户ID
  const paypalOrderId = purchaseUnit.id;
  
  console.log(`Payment completed: ${amount} ${currency}, OrderID: ${paypalOrderId}, User: ${customId}`);
  
  // TODO: 在这里更新用户订阅状态
  // 可以使用 KV 存储或数据库保存订阅信息
  if (env.SUBSCRIPTIONS) {
    const subscriptionData = {
      userId: customId,
      plan: 'pro', // 从 custom_id 或 description 解析
      status: 'active',
      paypalOrderId,
      amount,
      currency,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    await env.SUBSCRIPTIONS.put(customId, JSON.stringify(subscriptionData));
  }
}

/**
 * 处理支付被拒绝事件
 */
async function handlePaymentDenied(payment, env) {
  const customId = payment.custom_id;
  console.log(`Payment denied for user: ${customId}`);
  
  // TODO: 更新用户状态为支付失败
}

/**
 * 处理订阅激活事件
 */
async function handleSubscriptionActivated(subscription, env) {
  const subscriberId = subscription.subscriber?.payer_id;
  const planId = subscription.plan_id;
  console.log(`Subscription activated: ${subscriberId}, Plan: ${planId}`);
  
  // TODO: 更新订阅状态
}

/**
 * 处理订阅取消事件
 */
async function handleSubscriptionCancelled(subscription, env) {
  const subscriberId = subscription.subscriber?.payer_id;
  console.log(`Subscription cancelled: ${subscriberId}`);
  
  // TODO: 更新订阅状态为已取消
}

/**
 * 处理订阅过期事件
 */
async function handleSubscriptionExpired(subscription, env) {
  const subscriberId = subscription.subscriber?.payer_id;
  console.log(`Subscription expired: ${subscriberId}`);
  
  // TODO: 更新订阅状态为已过期
}

// ========== 订单验证 ==========

/**
 * 验证 PayPal 订单
 */
async function handleVerifyOrder(request, env) {
  try {
    const { orderID } = await request.json();
    
    if (!orderID) {
      return new Response(JSON.stringify({ error: 'Missing orderID' }), { status: 400 });
    }
    
    // 调用 PayPal API 验证订单
    const accessToken = await getPayPalAccessToken(env);
    
    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Failed to get access token' }), { status: 500 });
    }
    
    // 查询订单详情
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const order = await response.json();
    
    if (order.status === 'COMPLETED') {
      // 订单已完成，验证金额
      const purchaseUnit = order.purchase_units?.[0];
      const amount = purchaseUnit?.payments?.captures?.[0]?.amount?.value;
      
      return new Response(JSON.stringify({
        valid: true,
        status: 'completed',
        amount,
        custom_id: purchaseUnit?.custom_id,
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } else {
      return new Response(JSON.stringify({
        valid: false,
        status: order.status,
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
  } catch (error) {
    console.error('Order verification error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

/**
 * 获取 PayPal Access Token
 */
async function getPayPalAccessToken(env) {
  const clientId = env.PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID;
  const clientSecret = env.PAYPAL_SECRET || PAYPAL_SECRET;
  
  if (!clientSecret) {
    console.error('PAYPAL_SECRET not configured');
    return null;
  }
  
  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  const data = await response.json();
  return data.access_token;
}