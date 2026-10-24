import { Router } from 'express';
import { pool } from '../config/db.js';
const router=Router();
router.get('/',async(req,res,next)=>{try{let r=await pool.query('SELECT theme,reminders_enabled FROM user_settings WHERE user_id=$1',[req.user.id]);if(!r.rowCount){r=await pool.query('INSERT INTO user_settings(user_id) VALUES($1) RETURNING theme,reminders_enabled',[req.user.id]);}res.json({settings:{theme:r.rows[0].theme,remindersEnabled:r.rows[0].reminders_enabled}});}catch(e){next(e);}});
router.put('/',async(req,res,next)=>{try{const theme=req.body.theme==='dark'?'dark':'light',enabled=req.body.remindersEnabled!==false;const r=await pool.query(`INSERT INTO user_settings(user_id,theme,reminders_enabled) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET theme=EXCLUDED.theme,reminders_enabled=EXCLUDED.reminders_enabled,updated_at=NOW() RETURNING theme,reminders_enabled`,[req.user.id,theme,enabled]);res.json({settings:{theme:r.rows[0].theme,remindersEnabled:r.rows[0].reminders_enabled}});}catch(e){next(e);}});
export default router;
