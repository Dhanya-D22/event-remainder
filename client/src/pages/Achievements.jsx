import React, { useState } from 'react';
import { CalendarDays, Clock3, Sparkles, Trophy, Footprints, Flame, PartyPopper, UsersRound, Heart, Gift, Cake, Gem, Crown, Star, LockKeyhole, X } from 'lucide-react';
import { BadgeCard } from '../components/BadgeCard.jsx';
import { upcomingCount } from '../services/date.js';
import './Achievements.css';

export function Achievements({ events, streak, unlockedBadges = [] }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const count = events.length;
  const anniversaries = events.filter(event => event.event_type === 'Anniversary').length;
  const wishes = events.filter(event => /wish/i.test(`${event.event_type} ${event.title || ''} ${event.notes || ''}`)).length;
  const badges = [
    { id: 'first-steps', name: 'First Steps', desc: 'Save your first special date.', howTo: 'Add any one event to your calendar. Your first saved event unlocks this badge.', icon: Footprints, current: count, target: 1, unit: 'events' },
    { id: 'consistent', name: 'Consistent', desc: 'Keep your calendar active for seven days.', howTo: 'Save at least one event on seven consecutive days to build a 7-day streak.', icon: Flame, current: streak, target: 7, unit: 'days' },
    { id: 'celebrant', name: 'Celebrant', desc: 'Collect five meaningful dates.', howTo: 'Add five events to your calendar. Any event category counts.', icon: PartyPopper, current: count, target: 5, unit: 'events' },
    { id: 'collector', name: 'Collector', desc: 'Save ten events to your calendar.', howTo: 'Keep ten events saved in your calendar.', icon: UsersRound, current: count, target: 10, unit: 'events' },
    { id: 'dedicated', name: 'Dedicated', desc: 'Build a collection of thirty events.', howTo: 'Save thirty events to your calendar.', icon: Star, current: count, target: 30, unit: 'events' },
    { id: 'party-starter', name: 'Party Starter', desc: 'Reach twenty-five saved events.', howTo: 'Save twenty-five events of any kind.', icon: Gift, current: count, target: 25, unit: 'events' },
    { id: 'wishful', name: 'Wishful', desc: 'Save ten events with wishes or notes.', howTo: 'Add the word “wish” to an event title or notes, then save ten such events.', icon: Heart, current: wishes, target: 10, unit: 'wishes' },
    { id: 'anniversary-pro', name: 'Anniversary Pro', desc: 'Remember five anniversaries.', howTo: 'Save five events using the Anniversary category.', icon: Cake, current: anniversaries, target: 5, unit: 'anniversaries' },
    { id: 'memory-master', name: 'Memory Master', desc: 'Save fifty special dates.', howTo: 'Build your calendar up to fifty saved events.', icon: Gem, current: count, target: 50, unit: 'events' },
    { id: 'champion', name: 'Champion', desc: 'Reach one hundred saved events.', howTo: 'Save one hundred events to your calendar.', icon: Trophy, current: count, target: 100, unit: 'events' },
    { id: 'legendary', name: 'Legendary', desc: 'Build a collection of 365 events.', howTo: 'Save 365 events and become a legendary reminder keeper.', icon: Crown, current: count, target: 365, unit: 'events' },
  ];
  const unlockedIds = new Set(unlockedBadges.map(badge => typeof badge === 'string' ? badge : badge.badge_id));
  const unlocked = badges.filter(badge => unlockedIds.has(badge.id)).length;
  const SelectedIcon = selectedBadge?.icon;

  return <div className="achievements-page">
    <div className="welcome-row"><div><div className="eyebrow">YOUR LITTLE WINS</div><h1>Achievements</h1><p className="page-subtitle">Every date you save brings a new badge within reach.</p></div><div className="achievement-count"><Trophy size={18}/><b>{unlocked}</b><span>of {badges.length} unlocked</span></div></div>
    <div className="achievement-summary">
      <div className="achievement-progress"><div><strong>Your Progress</strong><small>{unlocked} of {badges.length} unlocked</small></div><b>{Math.round(unlocked / badges.length * 100)}%</b><span className="achievement-progress-track"><i style={{ width: `${unlocked / badges.length * 100}%` }}/></span></div>
      <div className="achievement-streak"><span className="summary-icon peach"><Flame size={19}/></span><div><b>{streak} Day Streak!</b><small>{streak >= 7 ? 'Your consistency badge is unlocked!' : `Keep going! ${7 - streak} days until your 7-day badge.`}</small></div></div>
      <div className="achievement-stats-grid"><div className="stat-card"><div className="stat-icon purple"><CalendarDays size={18}/></div><div className="stat-label">DATES SAVED</div><strong>{count}</strong><small>{count} moments saved</small><span className="stat-decoration">✳</span></div><div className="stat-card"><div className="stat-icon peach"><Clock3 size={18}/></div><div className="stat-label">COMING UP SOON</div><strong>{upcomingCount(events)}</strong><small>in the next 30 days</small><span className="stat-decoration">✳</span></div><div className="stat-card"><div className="stat-icon green"><Sparkles size={18}/></div><div className="stat-label">YOUR LITTLE STREAK</div><strong>{streak} days</strong><small>days with a saved moment</small><span className="stat-decoration">✳</span></div><div className="stat-card"><div className="stat-icon blue"><Heart size={18}/></div><div className="stat-label">MEMORIES KEPT</div><strong>{wishes}</strong><small>and counting</small><span className="stat-decoration">✳</span></div></div>
    </div>
    <section className="badge-section"><div className="section-heading"><div><div className="eyebrow">YOUR COLLECTION</div><h2>Badges <span className="heading-spark">✦</span></h2></div></div><div className="badge-grid">{badges.map((badge, index) => { const progress = Math.min(100, Math.round(badge.current / badge.target * 100)); return <BadgeCard key={badge.name} badge={badge} index={index} done={unlockedIds.has(badge.id)} progress={unlockedIds.has(badge.id) ? 100 : progress} onClick={() => setSelectedBadge({ ...badge, progress: unlockedIds.has(badge.id) ? 100 : progress, done: unlockedIds.has(badge.id) })}/>; })}</div></section>
    {selectedBadge && <div className="badge-detail-backdrop" onMouseDown={event => event.target === event.currentTarget && setSelectedBadge(null)}><section className="badge-detail" role="dialog" aria-modal="true" aria-labelledby="badge-detail-title"><button className="badge-detail-close" onClick={() => setSelectedBadge(null)} aria-label="Close badge details"><X size={18}/></button><div className={`badge-illustration ${selectedBadge.done ? '' : 'detail-locked'}`}>{selectedBadge.done ? <SelectedIcon size={25}/> : <LockKeyhole size={21}/>}</div><div className="badge-status">{selectedBadge.done ? 'UNLOCKED' : 'LOCKED'} BADGE</div><h2 id="badge-detail-title">{selectedBadge.name}</h2><p>{selectedBadge.desc}</p><div className="badge-howto"><b>How to earn it</b><span>{selectedBadge.howTo}</span></div><div className="badge-detail-progress"><div><span>Your progress</span><b>{Math.min(selectedBadge.current, selectedBadge.target)} / {selectedBadge.target} {selectedBadge.unit}</b></div><div className="progress-track"><i style={{ width: `${selectedBadge.progress}%` }}/></div><small>{selectedBadge.done ? 'You earned this badge. Great job!' : `${selectedBadge.target - Math.min(selectedBadge.current, selectedBadge.target)} more ${selectedBadge.unit} to go.`}</small></div><button className="primary-btn" onClick={() => setSelectedBadge(null)}>Got it</button></section></div>}
  </div>;
}

export default Achievements;
