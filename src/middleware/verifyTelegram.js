import { verifyTelegramInitData, extractUserFromInit } from '../utils/telegram.js';

export function verifyTelegram(req, res, next){
  const initData = req.header('x-telegram-init-data') || req.body?.initData;
  const result = verifyTelegramInitData(initData);
  if(!result.ok) return res.status(401).json({ ok:false, error:'unauthorized', reason: result.reason });
  req.tgUser = result.user || extractUserFromInit(initData) || null;
  next();
}

export function requireAdmin(req, res, next){
  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map(s=>s.trim()).filter(Boolean);
  const id = String(req.tgUser?.id || '');
  if(adminIds.includes(id)) return next();
  return res.status(403).json({ ok:false, error:'forbidden' });
}
