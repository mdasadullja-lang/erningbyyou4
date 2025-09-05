import express from 'express';
import Setting, { DEFAULT_SETTINGS } from '../models/Setting.js';
const router = express.Router();

router.get('/settings', async (req,res)=>{
  const doc = await Setting.findOne({ key: 'global' }).lean();
  res.json({ ok:true, settings: doc?.value || DEFAULT_SETTINGS });
});

export default router;
