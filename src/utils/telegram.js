import crypto from 'crypto';

export function verifyTelegramInitData(initData){
  // initData: string from Telegram WebApp 'initData'
  const token = process.env.BOT_TOKEN;
  if(!token) throw new Error('BOT_TOKEN missing');
  if(!initData) return { ok:false, reason:'missing' };
  // Parse querystring
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  // Build data_check_string (sorted by keys)
  const entries = Array.from(params.entries())
    .map(([k,v])=>`${k}=${v}`)
    .sort();
  const dataCheckString = entries.join('\n');

  // secret key = HMAC_SHA256(bot_token) with "WebAppData" key
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  const ok = crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(hash));
  if(!ok) return { ok:false, reason:'bad_hash' };

  // Optionally check auth_date freshness (e.g., <= 24h)
  const authDate = Number(params.get('auth_date') || '0') * 1000;
  const maxAgeMs = 24*60*60*1000;
  if(Date.now() - authDate > maxAgeMs) return { ok:false, reason:'stale' };

  // Parse user
  let user = null;
  try {
    user = JSON.parse(params.get('user'));
  } catch(e){}
  return { ok:true, user };
}

export function extractUserFromInit(initData){
  const params = new URLSearchParams(initData);
  try{
    return JSON.parse(params.get('user'));
  }catch(e){
    return null;
  }
}
