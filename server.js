import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import publicRouter from './src/routes/public.js';
import userRouter from './src/routes/user.js';
import adminRouter from './src/routes/admin.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res)=> res.json({ ok: true, service: 'Earning Backend' }));
app.use('/api', publicRouter);
app.use('/api', userRouter);
app.use('/api/admin', adminRouter);

connectDB().then(()=>{
  app.listen(PORT, ()=> console.log(`API running on http://localhost:${PORT}`));
}).catch(err=>{
  console.error('Failed to connect DB', err);
  process.exit(1);
});
