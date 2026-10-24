import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
const router=Router();
const makeToken=user=>jwt.sign({id:user.id,email:user.email},process.env.JWT_SECRET,{expiresIn:'7d'});
const publicUser=row=>({id:row.id,name:row.name,email:row.email});
const genericOtpMessage='If an account exists for that email, a sign-in code has been sent.';
const hashOtp=(email,code)=>crypto.createHmac('sha256',process.env.JWT_SECRET).update(`${email}:${code}`).digest();
router.post('/register',async(req,res,next)=>{try{const name=String(req.body.name||'').trim(),email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||'');if(name.length<2||name.length>120)return res.status(400).json({error:'Name must be between 2 and 120 characters.'});if(!/^\S+@\S+\.\S+$/.test(email)||email.length>255)return res.status(400).json({error:'Enter a valid email address.'});if(password.length<8||password.length>200)return res.status(400).json({error:'Password must be at least 8 characters.'});const hash=await bcrypt.hash(password,12);const result=await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email',[name,email,hash]);const user=result.rows[0];await pool.query('INSERT INTO user_settings(user_id) VALUES($1)',[user.id]);res.status(201).json({token:makeToken(user),user:publicUser(user)});}catch(e){if(e.code==='23505')return res.status(409).json({error:'An account with this email already exists.'});next(e);}});
router.post('/request-code',async(req,res,next)=>{try{
  const email=String(req.body.email||'').trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(email)||email.length>255)return res.status(400).json({error:'Enter a valid email address.'});
  const smtpHost=process.env.SMTP_HOST,smtpUser=process.env.SMTP_USER,smtpPass=process.env.SMTP_PASS;
  if(!smtpHost||!smtpUser||!smtpPass||!process.env.SMTP_FROM)return res.status(503).json({error:'Email sign-in is not configured. Set the SMTP values in server/.env.'});
  const userResult=await pool.query('SELECT id FROM users WHERE email=$1',[email]);
  if(!userResult.rowCount)return res.json({message:genericOtpMessage});
  const code=String(crypto.randomInt(100000,1000000));
  const codeHash=hashOtp(email,code);
  const result=await pool.query(`INSERT INTO login_otps(email,code_hash,expires_at,attempts,last_sent_at)
    VALUES($1,$2,NOW()+INTERVAL '10 minutes',0,NOW())
    ON CONFLICT(email) DO UPDATE SET code_hash=EXCLUDED.code_hash,expires_at=EXCLUDED.expires_at,attempts=0,last_sent_at=NOW()
    WHERE login_otps.last_sent_at<=NOW()-INTERVAL '60 seconds' OR login_otps.expires_at<=NOW()
    RETURNING email`,[email,codeHash]);
  if(!result.rowCount)return res.json({message:genericOtpMessage});
  const port=Number(process.env.SMTP_PORT)||587;
  const transporter=nodemailer.createTransport({host:smtpHost,port,secure:String(process.env.SMTP_SECURE).toLowerCase()==='true'||port===465,auth:{user:smtpUser,pass:smtpPass}});
  try {
    await transporter.sendMail({from:process.env.SMTP_FROM,to:email,subject:'Your Momentra sign-in code',text:`Your Momentra sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,html:`<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#302942"><div style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#7259c7">MOMENTRA</div><h1 style="font-size:24px;margin:24px 0 8px">Your sign-in code</h1><p style="color:#777181">Use this one-time code to sign in. It expires in 10 minutes.</p><div style="margin:24px 0;padding:18px;border-radius:14px;background:#f3efff;color:#6047b6;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px">${code}</div><p style="color:#9992a4;font-size:12px">If you did not request this code, you can ignore this email.</p></div>`});
  } catch (mailError) {
    await pool.query('DELETE FROM login_otps WHERE email=$1 AND code_hash=$2',[email,codeHash]);
    throw mailError;
  }
  res.json({message:genericOtpMessage});
}catch(e){next(e);}});
router.post('/verify-code',async(req,res,next)=>{
  const email=String(req.body.email||'').trim().toLowerCase();
  const code=String(req.body.code||'').trim();
  if(!/^\S+@\S+\.\S+$/.test(email)||email.length>255||!/^\d{6}$/.test(code))return res.status(400).json({error:'Enter the email address and six-digit code.'});
  let client;
  try {
    client=await pool.connect();
    await client.query('BEGIN');
    const otpResult=await client.query('SELECT code_hash,expires_at,attempts FROM login_otps WHERE email=$1 FOR UPDATE',[email]);
    const otp=otpResult.rows[0];
    if(!otp||new Date(otp.expires_at)<=new Date()||otp.attempts>=5){
      await client.query('DELETE FROM login_otps WHERE email=$1',[email]);
      await client.query('COMMIT');
      return res.status(401).json({error:'That code is invalid or expired. Request a new code.'});
    }
    const expected=Buffer.from(otp.code_hash),provided=hashOtp(email,code);
    if(expected.length!==provided.length||!crypto.timingSafeEqual(expected,provided)){
      const attempts=otp.attempts+1;
      if(attempts>=5)await client.query('DELETE FROM login_otps WHERE email=$1',[email]);
      else await client.query('UPDATE login_otps SET attempts=$2 WHERE email=$1',[email,attempts]);
      await client.query('COMMIT');
      return res.status(401).json({error:attempts>=5?'Too many incorrect codes. Request a new code.':'That code is incorrect.'});
    }
    const userResult=await client.query('SELECT id,name,email FROM users WHERE email=$1',[email]);
    await client.query('DELETE FROM login_otps WHERE email=$1',[email]);
    await client.query('COMMIT');
    const user=userResult.rows[0];
    if(!user)return res.status(401).json({error:'That code is invalid or expired. Request a new code.'});
    res.json({token:makeToken(user),user:publicUser(user)});
  } catch(e) {
    if(client)await client.query('ROLLBACK').catch(()=>{});
    next(e);
  } finally { client?.release(); }
});
router.get('/me',requireAuth,async(req,res,next)=>{try{const result=await pool.query('SELECT id,name,email FROM users WHERE id=$1',[req.user.id]);if(!result.rowCount)return res.status(401).json({error:'Account no longer exists.'});res.json({user:publicUser(result.rows[0])});}catch(e){next(e);}});
export default router;
