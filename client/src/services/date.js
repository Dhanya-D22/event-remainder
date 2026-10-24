export const todayISO = () => new Date().toLocaleDateString('en-CA');
export const dateLabel = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) => new Date(`${value}T12:00:00`).toLocaleDateString(undefined, options);
export const daysUntil = (value, recurring = true) => { const now = new Date(); now.setHours(0,0,0,0); let d = new Date(`${value}T12:00:00`); if(recurring){d.setFullYear(now.getFullYear());if(d<now)d.setFullYear(now.getFullYear()+1);} return Math.round((d-now)/86400000); };
export const upcomingCount = events => events.filter(e=>{const d=daysUntil(e.event_date,e.repeat_yearly);return d>=0&&d<=30;}).length;
export const titleCase = s => s ? s[0].toUpperCase()+s.slice(1) : 'Friend';
