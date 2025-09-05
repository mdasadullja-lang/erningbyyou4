import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('Setting', SettingSchema);

// Default settings in code (used if DB empty)
export const DEFAULT_SETTINGS = {
  thresholds: { normal: 2000, premium: 1000 },
  adReward:   { normal: 2, premium: 4 },
  dailyLimit: { normal: 1000, premium: 99999999 },
  eventMultiplier: 1.0,
  dailyBonus: { enabled: true, amount: 10 },
  referralBonusUSDT: 0.50,
  methods: { usdt: true, bkash: true, nagad: true },
  perPlacement: { rewardedInterstitial: 2, rewardedPopup: 2, appOpen: 0 },
  adAutoCredit: true,
  adCountAsShow: true,
  theme: 'auto'
};
