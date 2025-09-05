import express from 'express';
import { verifyTelegram } from '../middleware/verifyTelegram.js';
import Setting, { DEFAULT_SETTINGS } from '../models/Setting.js';
import User from '../models/User.js';
import Withdraw from '../models/Withdraw.js';
import AdEvent from '../models/AdEvent.js';
import { DateTime } from 'luxon';

const router = express.Router();

async function getSettings(){
  const s = await Setting.findOne({ key:'global' }).lean();
  return s?.value || DEFAULT_SETTINGS;
}

function fmtDate(d=Date.now()){ return DateTime.fromMillis(d).toISODate(); }

// Ensure user exists
router.post('/auth/verify', verifyTelegram, async (req,res)=>{
  const u = req.tgUser;
  let user = await User.findOne({ tgId: String(u.id) });
  if(!user){
    user = await User.create({
      tgId: String(u.id),
      username: u.username || null,
      firstName: u.first_name || null,
      joinedViaRef: String(req.body?.start_param||'').startsWith('ref')
    });
  }
  res.json({ ok:true, userId: user._id });
});

router.get('/me', verifyTelegram, async (req,res)=>{
  const u = await User.findOne({ tgId: String(req.tgUser.id) }).lean();
  if(!u) return res.status(404).json({ ok:false });
  const settings = await getSettings();
  res.json({ ok:true, user: u, settings });
});

router.post('/me/profile', verifyTelegram, async (req,res)=>{
  const { name, email, phone, photoUrl } = req.body || {};
  const u = await User.findOneAndUpdate({ tgId: String(req.tgUser.id) },
    { name, email, phone, photoUrl },
    { new:true });
  res.json({ ok:true, user: u });
});

router.post('/bonus/daily', verifyTelegram, async (req,res)=>{
  const settings = await getSettings();
  const user = await User.findOne({ tgId: String(req.tgUser.id) });
  const today = fmtDate();
  if(user.dailyBonusDate === today) return res.status(400).json({ ok:false, error:'already_claimed' });
  const amt = Math.round(settings.dailyBonus.amount * settings.eventMultiplier);
  user.dailyBonusDate = today;
  user.balance += amt; user.totalEarned += amt;
  await user.save();
  res.json({ ok:true, amount: amt, balance: user.balance });
});

router.post('/ad/credit', verifyTelegram, async (req,res)=>{
  const { placement='rewardedPopup' } = req.body || {};
  const settings = await getSettings();
  const user = await User.findOne({ tgId: String(req.tgUser.id) });

  if(user.banned) return res.status(403).json({ ok:false, error:'banned' });

  // daily reset
  const today = fmtDate();
  if(user.lastAdDate !== today){ user.dailyAds = 0; user.lastAdDate = today; }

  const limit = user.premium ? settings.dailyLimit.premium : settings.dailyLimit.normal;
  if(user.dailyAds >= limit) return res.status(400).json({ ok:false, error:'daily_limit' });

  const base = user.premium ? settings.adReward.premium : settings.adReward.normal;
  const reward = Math.round(base * settings.eventMultiplier);

  user.dailyAds += 1;
  user.totalAds += 1;
  if(settings.adAutoCredit){
    user.balance += reward;
    user.totalEarned += reward;
  }
  await user.save();
  await AdEvent.create({ user: user._id, tgId: user.tgId, placement, amount: settings.adAutoCredit ? reward : 0 });

  res.json({ ok:true, reward, balance: user.balance, totalAds: user.totalAds, dailyAds: user.dailyAds });
});

router.post('/withdraw', verifyTelegram, async (req,res)=>{
  const { method, account } = req.body || {};
  const settings = await getSettings();
  const user = await User.findOne({ tgId: String(req.tgUser.id) });

  const thr = user.premium ? settings.thresholds.premium : settings.thresholds.normal;
  if(user.balance < thr) return res.status(400).json({ ok:false, error:'not_enough' });
  if(user.banned) return res.status(403).json({ ok:false, error:'banned' });

  const doc = await Withdraw.create({
    user: user._id, tgId: user.tgId, amount: user.balance, method, account
  });
  user.balance = 0;
  await user.save();
  res.json({ ok:true, request: doc });
});

router.get('/withdraw', verifyTelegram, async (req,res)=>{
  const user = await User.findOne({ tgId: String(req.tgUser.id) });
  const rows = await Withdraw.find({ user: user._id }).sort({ createdAt: -1 }).lean();
  res.json({ ok:true, items: rows });
});

router.get('/leaderboard', verifyTelegram, async (req,res)=>{
  const rows = await User.find({}).sort({ totalEarned: -1 }).limit(50).select('tgId firstName username totalEarned').lean();
  res.json({ ok:true, items: rows });
});

export default router;
