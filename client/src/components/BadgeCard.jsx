import React from 'react';
import { LockKeyhole } from 'lucide-react';
export function BadgeCard({ badge, index, done, progress, onClick }) {
  const Icon = badge.icon;
  return <button type="button" className={`badge-card ${done ? 'earned' : 'locked'}`} onClick={onClick} aria-label={`View ${badge.name} badge details`}>
    <span className={`badge-illustration badge-${index}`}>{done ? <Icon size={23} strokeWidth={2.2}/> : <LockKeyhole size={19} strokeWidth={1.8}/>}</span>
    <span className="badge-info"><span className="badge-status">{done ? 'UNLOCKED' : 'LOCKED'}</span><span className="badge-card-name">{badge.name}</span><span className="badge-card-desc">{badge.desc}</span><span className="progress-meta"><span>{Math.min(badge.current,badge.target)}/{badge.target} {badge.unit}</span><b>{progress}%</b></span><span className="progress-track"><i style={{width:`${progress}%`}}/></span></span>
  </button>;
}

export default BadgeCard;
