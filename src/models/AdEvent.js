import mongoose from 'mongoose';
const AdEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  tgId: String,
  placement: { type: String, enum: ['rewardedInterstitial','rewardedPopup','appOpen'] },
  amount: Number, // milli-USDT credited
}, { timestamps: true });

export default mongoose.model('AdEvent', AdEventSchema);
