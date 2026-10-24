import jwt from 'jsonwebtoken';
export function requireAuth(req,res,next){
  const token=req.headers.authorization?.startsWith('Bearer ')?req.headers.authorization.slice(7):'';
  if(!token)return res.status(401).json({error:'Please sign in to continue.'});
  try{req.user=jwt.verify(token,process.env.JWT_SECRET);next();}catch{return res.status(401).json({error:'Your session expired. Please sign in again.'});}
}
