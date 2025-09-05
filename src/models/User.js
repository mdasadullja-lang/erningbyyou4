import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  tgId: { type: String, index: true, unique: true },
  username: String,
  firstName: String,
  joinedAt: { type: Date, default: Date.now },
  premium: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },

  balance: { type: Number, default: 0 },       // milli-USDT
  totalEarned: { type: Number, default: 0 },
  totalAds: { type: Number, default: 0 },
  dailyAds: { type: Number, default: 0 },
  lastAdDate: { type: String, default: null }, // YYYY-MM-DD

  dailyBonusDate: { type: String, default: null },
  referrals: { type: Number, default: 0 },
  joinedViaRef: { type: Boolean, default: false },

  name: String,
  email: String,
  phone: String,
  photoUrl: String,
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
