import express from 'express';
import { verifyTelegram, requireAdmin } from '../middleware/verifyTelegram.js';
import Setting, { DEFAULT_SETTINGS } from '../models/Setting.js';
import User from '../models/User.js';
import Withdraw from '../models/Withdraw.js';

const router = express.Router();
router.use(verifyTelegram, requireAdmin);

router.get('/settings', async (req,res)=>{
  const doc = await Setting.findOne({ key:'global' }).lean();
  res.json({ ok:true, settings: doc?.value || DEFAULT_SETTINGS });
});

router.post('/settings', async (req,res)=>{
  const payload = req.body || {};
  const doc = await Setting.findOneAndUpdate(
    { key: 'global' },
    { value: payload },
    { upsert: true, new: true }
  );
  res.json({ ok:true, settings: doc.value });
});

router.get('/withdraws', async (req,res)=>{
  const { status } = req.query;
  const q = status ? { status } : {};
  const rows = await Withdraw.find(q).sort({ createdAt: -1 }).limit(500).lean();
  res.json({ ok:true, items: rows });
});

router.patch('/withdraws/:id', async (req,res)=>{
  const { id } = req.params;
  const { status } = req.body || {};
  const doc = await Withdraw.findByIdAndUpdate(id, { status }, { new: true });
  res.json({ ok:true, request: doc });
});

router.post('/user/:tgId/adjust', async (req,res)=>{
  const { tgId } = req.params;
  const { amount } = req.body || {}; // milli-USDT (+/-)
  const user = await User.findOne({ tgId: String(tgId) });
  if(!user) return res.status(404).json({ ok:false });
  user.balance += Number(amount||0);
  if(Number(amount||0) > 0) user.totalEarned += Number(amount||0);
  await user.save();
  res.json({ ok:true, user });
});

router.post('/user/:tgId/toggle-premium', async (req,res)=>{
  const user = await User.findOne({ tgId: String(req.params.tgId) });
  user.premium = !user.premium; await user.save();
  res.json({ ok:true, user });
});

router.post('/user/:tgId/toggle-ban', async (req,res)=>{
  const user = await User.findOne({ tgId: String(req.params.tgId) });
  user.banned = !user.banned; await user.save();
  res.json({ ok:true, user });
});

export default router;
