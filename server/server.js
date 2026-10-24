import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool } from './config/db.js';
import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import settingsRoutes from './routes/settings.js';
import dashboardRoutes from './routes/dashboard.js';

if(!process.env.JWT_SECRET){console.error('JWT_SECRET is required. Set it in server/.env.');process.exit(1);}
await pool.query(`
  ALTER TABLE events ADD COLUMN IF NOT EXISTS instagram_url TEXT NOT NULL DEFAULT '';
  ALTER TABLE events ADD COLUMN IF NOT EXISTS facebook_url TEXT NOT NULL DEFAULT '';
  ALTER TABLE events ADD COLUMN IF NOT EXISTS linkedin_url TEXT NOT NULL DEFAULT '';
  ALTER TABLE events ADD COLUMN IF NOT EXISTS snapchat_url TEXT NOT NULL DEFAULT '';
  CREATE TABLE IF NOT EXISTS login_otps (
    email VARCHAR(255) PRIMARY KEY,
    code_hash BYTEA NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`);
const app=express();
app.use(helmet());app.use(cors({origin:process.env.NODE_ENV==='production'?false:'http://localhost:5173'}));app.use(express.json({limit:'40kb'}));
app.get('/api/health',async(_req,res)=>{try{await pool.query('SELECT 1');res.json({status:'ok',database:'connected'});}catch{res.status(503).json({status:'error',database:'unavailable'});}});
app.use('/api/auth',authRoutes);
app.use('/api/events',requireAuth,eventRoutes);
app.use('/api/settings',requireAuth,settingsRoutes);
app.use('/api/dashboard',requireAuth,dashboardRoutes);
app.use((err,_req,res,_next)=>{console.error(err);res.status(500).json({error:'The server could not complete that request.'});});
const port=Number(process.env.PORT)||4000;
app.listen(port,()=>console.log(`Event Reminder API listening on ${port}`));
process.on('SIGTERM',async()=>{await pool.end();process.exit(0);});
