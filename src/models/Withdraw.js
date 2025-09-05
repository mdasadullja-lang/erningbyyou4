import mongoose from 'mongoose';

const WithdrawSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  tgId: String,
  amount: Number, // milli-USDT
  method: { type: String, enum: ['usdt','bkash','nagad'] },
  account: String,
  status: { type: String, enum:['Pending','Approved','Rejected'], default: 'Pending', index: true },
}, { timestamps: true });

export default mongoose.model('Withdraw', WithdrawSchema);
