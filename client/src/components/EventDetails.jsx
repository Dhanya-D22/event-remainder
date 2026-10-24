import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Clock3, Copy, Image, Mail, MessageCircle, Pencil, Phone, Share2, Trash2 } from 'lucide-react';
import './EventDetails.css';

const dateLabel = value => new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

const zodiacSigns = [
  { name: 'Capricorn', symbol: '♑', start: 1222, end: 119, element: 'Earth', traits: ['Ambitious', 'Patient', 'Practical', 'Reliable'] },
  { name: 'Aquarius', symbol: '♒', start: 120, end: 218, element: 'Air', traits: ['Original', 'Independent', 'Curious', 'Thoughtful'] },
  { name: 'Pisces', symbol: '♓', start: 219, end: 320, element: 'Water', traits: ['Imaginative', 'Kind', 'Intuitive', 'Gentle'] },
  { name: 'Aries', symbol: '♈', start: 321, end: 419, element: 'Fire', traits: ['Confident', 'Energetic', 'Brave', 'Direct'] },
  { name: 'Taurus', symbol: '♉', start: 420, end: 520, element: 'Earth', traits: ['Patient', 'Loyal', 'Steady', 'Warm'] },
  { name: 'Gemini', symbol: '♊', start: 521, end: 620, element: 'Air', traits: ['Curious', 'Witty', 'Adaptable', 'Expressive'] },
  { name: 'Cancer', symbol: '♋', start: 621, end: 722, element: 'Water', traits: ['Caring', 'Intuitive', 'Protective', 'Loyal'] },
  { name: 'Leo', symbol: '♌', start: 723, end: 822, element: 'Fire', traits: ['Warm', 'Creative', 'Confident', 'Generous'] },
  { name: 'Virgo', symbol: '♍', start: 823, end: 922, element: 'Earth', traits: ['Thoughtful', 'Helpful', 'Careful', 'Practical'] },
  { name: 'Libra', symbol: '♎', start: 923, end: 1022, element: 'Air', traits: ['Fair', 'Charming', 'Cooperative', 'Kind'] },
  { name: 'Scorpio', symbol: '♏', start: 1023, end: 1121, element: 'Water', traits: ['Passionate', 'Resourceful', 'Brave', 'Loyal'] },
  { name: 'Sagittarius', symbol: '♐', start: 1122, end: 1221, element: 'Fire', traits: ['Adventurous', 'Optimistic', 'Honest', 'Open-minded'] },
];

const zodiacFor = value => {
  const date = new Date(`${value}T12:00:00`);
  const day = (date.getMonth() + 1) * 100 + date.getDate();
  return zodiacSigns.find(sign => sign.start <= sign.end
    ? day >= sign.start && day <= sign.end
    : day >= sign.start || day <= sign.end);
};

const dateLabelForRange = sign => {
  const format = value => {
    const month = Math.floor(value / 100) - 1;
    const day = value % 100;
    return `${new Date(2026, month, 1).toLocaleDateString(undefined, { month: 'short' })} ${day}`;
  };
  return `${format(sign.start)} – ${format(sign.end)}`;
};

const countdownFor = (event, now) => {
  const date = new Date(`${event.event_date}T00:00:00`);
  let target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (event.repeat_yearly) {
    target.setFullYear(now.getFullYear());
    if (target < today) target.setFullYear(now.getFullYear() + 1);
  } else if (target < today) return { passed: true, days: 0, hours: 0, minutes: 0 };
  const remaining = Math.max(0, target.getTime() - now.getTime());
  return {
    passed: false,
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
  };
};

const roundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
};

const createStyledShareCard = async (event, kind, socialLinks) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const width = 1080;
  const lines = [];
  if (event.title) lines.push(['Title', event.title]);
  if (event.notes) lines.push(['Notes', event.notes]);
  if (event.contact_phone) lines.push(['Phone', event.contact_phone]);
  if (event.contact_email) lines.push(['Email', event.contact_email]);
  socialLinks.forEach(([label, url]) => lines.push([label, url]));
  ctx.font = '27px Arial';
  const lineHeight = 42;
  const bodyHeight = lines.reduce((height, [, value]) => {
    const words = String(value).split(/\s+/);
    let count = 1;
    let current = '';
    words.forEach(word => {
      const next = current ? `${current} ${word}` : word;
      if (ctx.measureText(next).width > 850 && current) { count += 1; current = word; }
      else current = next;
    });
    return height + 42 + count * lineHeight;
  }, 0);
  const height = Math.max(1000, 780 + bodyHeight);
  canvas.width = width;
  canvas.height = height;
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#f1edff');
  bg.addColorStop(1, '#fff6f1');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#d8cef9';
  ctx.beginPath(); ctx.arc(930, 120, 190, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f8dce2';
  ctx.beginPath(); ctx.arc(80, height - 80, 180, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  roundedRect(ctx, 70, 70, 940, height - 140, 44); ctx.fill();
  ctx.fillStyle = '#7259c7';
  roundedRect(ctx, 120, 125, 220, 58, 29); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = '700 25px Arial'; ctx.fillText(kind.toUpperCase(), 145, 163);
  ctx.fillStyle = '#302942'; ctx.font = '700 72px Arial';
  const name = event.person_name || 'A special moment';
  ctx.fillText(name.length > 20 ? `${name.slice(0, 19)}…` : name, 120, 300);
  ctx.fillStyle = '#796f8b'; ctx.font = '36px Arial';
  ctx.fillText(dateLabel(event.event_date), 120, 365);
  ctx.fillStyle = '#f4f0ff'; roundedRect(ctx, 120, 420, 840, 115, 26); ctx.fill();
  ctx.fillStyle = '#624dbc'; ctx.font = '700 31px Arial'; ctx.fillText('A date worth remembering', 155, 468);
  ctx.fillStyle = '#81788f'; ctx.font = '26px Arial'; ctx.fillText(event.repeat_yearly ? 'Celebrated every year' : 'Saved with care', 155, 510);
  let y = 590;
  const wrapText = (text, maxWidth) => {
    const result = [];
    let current = '';
    String(text).split(/\s+/).forEach(word => {
      const next = current ? `${current} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && current) { result.push(current); current = word; }
      else current = next;
    });
    if (current) result.push(current);
    return result;
  };
  for (const [label, value] of lines) {
    ctx.fillStyle = '#f8f6fb';
    const wrapped = wrapText(value, 810);
    const cardHeight = 38 + wrapped.length * lineHeight + 25;
    roundedRect(ctx, 120, y, 840, cardHeight, 20); ctx.fill();
    ctx.fillStyle = '#7259c7'; ctx.font = '700 23px Arial'; ctx.fillText(label.toUpperCase(), 150, y + 38);
    ctx.fillStyle = '#50495d'; ctx.font = '27px Arial';
    wrapped.forEach((line, index) => ctx.fillText(line, 150, y + 78 + index * lineHeight));
    y += cardHeight + 16;
  }
  ctx.fillStyle = '#a29aac'; ctx.font = '22px Arial'; ctx.fillText('Make every moment count · Momentra', 120, height - 115);
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (blob) resolve(new File([blob], 'momentra-event.png', { type: 'image/png' }));
    else reject(new Error('Could not create the share card.'));
  }, 'image/png'));
};

export default function EventDetails({ event, onBack, onEdit, onDelete }) {
  const kind = event.event_type === 'Custom' && event.custom_type ? event.custom_type : event.event_type;
  const reminders = Array.isArray(event.reminders) ? event.reminders : [];
  const socialLinks = [
    ['Instagram', event.instagram_url], ['Facebook', event.facebook_url],
    ['LinkedIn', event.linkedin_url || event.social_url], ['Snapchat', event.snapchat_url],
  ].filter(([, url]) => url);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const countdown = countdownFor(event, now);
  const zodiac = zodiacFor(event.event_date);
  const eventDate = new Date(`${event.event_date}T12:00:00`);
  const isEventToday = eventDate.getMonth() === now.getMonth()
    && eventDate.getDate() === now.getDate()
    && (event.repeat_yearly || eventDate.getFullYear() === now.getFullYear());
  const isBirthdayToday = isEventToday && event.event_type === 'Birthday';
  const [candleShown, setCandleShown] = useState(false);
  const [candleBlown, setCandleBlown] = useState(false);
  const [celebrationOpened, setCelebrationOpened] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const lastCandleTap = React.useRef(0);
  const tapCandle = () => {
    const tapTime = Date.now();
    if (tapTime - lastCandleTap.current < 450) setCandleBlown(true);
    lastCandleTap.current = tapTime;
  };
  const shareText = [
    `${kind}: ${event.person_name}`,
    event.title && `Title: ${event.title}`,
    `Date: ${dateLabel(event.event_date)}`,
    event.repeat_yearly && 'Repeats every year',
    reminders.length > 0 && `Reminders: ${reminders.map(days => days === 1 ? '1 day before' : days === 7 ? '1 week before' : `${days} days before`).join(', ')}`,
    event.notes && `Notes: ${event.notes}`,
    event.contact_phone && `Phone: ${event.contact_phone}`,
    event.contact_email && `Email: ${event.contact_email}`,
    ...socialLinks.map(([label, url]) => `${label}: ${url}`),
  ].filter(Boolean).join('\n');
  const sendDetails = async () => {
    if (navigator.share) {
      try {
        const card = await createStyledShareCard(event, kind, socialLinks);
        const shareData = { title: event.title || `${kind} · ${event.person_name}`, text: shareText };
        if (navigator.canShare?.({ files: [card] })) shareData.files = [card];
        await navigator.share(shareData);
        setShareOpen(false);
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }
    setShareOpen(open => !open);
  };
  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setShareOpen(true);
    }
  };
  const downloadStyledCard = async () => {
    try {
      const card = await createStyledShareCard(event, kind, socialLinks);
      const url = URL.createObjectURL(card);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(event.person_name || 'event').replace(/[^a-z0-9-_]/gi, '-')}-momentra.png`;
      link.click();
      URL.revokeObjectURL(url);
      setShareOpen(false);
    } catch {
      setShareOpen(true);
    }
  };
  const celebration = isEventToday && !isBirthdayToday ? (() => {
    if (event.event_type === 'Anniversary' || event.event_type === 'Wedding') {
      const heading = event.event_type === 'Wedding' ? 'Happy Wedding Day!' : 'Happy Anniversary!';
      return <section className={`special-day-celebration bouquet-celebration ${celebrationOpened ? 'opened' : ''}`}>
        <h2>{heading}</h2>
        <button type="button" className="special-day-icon bouquet-icon" onClick={() => setCelebrationOpened(true)} aria-label="Open the bouquet">{celebrationOpened ? '💐' : '🌷'}</button>
        <p>{celebrationOpened ? 'A little bouquet for your special day! 💐' : 'Tap the flower to open your bouquet.'}</p>
      </section>;
    }
    if (event.event_type === 'Work') return <section className={`special-day-celebration work-celebration ${celebrationOpened ? 'opened' : ''}`}>
      <h2>Work milestone day!</h2><button type="button" className="special-day-icon" onClick={() => setCelebrationOpened(true)} aria-label="Open the work bag">{celebrationOpened ? '🎉' : '💼'}</button>
      <p>{celebrationOpened ? 'Here’s to all your hard work!' : 'Tap the work bag to open it.'}</p>
    </section>;
    if (event.event_type === 'Festival') return <section className={`special-day-celebration festival-celebration ${celebrationOpened ? 'opened' : ''}`}>
      <h2>Happy {event.title || event.custom_type || 'Festival'}!</h2><button type="button" className="special-day-icon" onClick={() => setCelebrationOpened(true)} aria-label="Pop the party balloon">{celebrationOpened ? '🎊' : '🎈'}</button>
      <p>{celebrationOpened ? 'Let’s celebrate! 🎉' : 'Tap the balloon to pop it and celebrate.'}</p>
    </section>;
    if (event.event_type === 'Custom') return <section className="special-day-celebration custom-celebration"><h2>{event.custom_type || event.title || 'Your special day'}!</h2></section>;
    return null;
  })() : null;

  return <div className="event-details-backdrop" onMouseDown={e => e.target === e.currentTarget && onBack()}>
    <section className="event-details" role="dialog" aria-modal="true" aria-labelledby="event-details-title">
      <div className="event-details-actions">
        <button type="button" className="icon-button" onClick={onBack} aria-label="Back"><ArrowLeft size={21}/></button>
        <div className="event-details-action-group"><button type="button" className="icon-button event-send-button" onClick={sendDetails} aria-label="Send event details" title="Send"><Share2 size={19}/></button><button type="button" className="icon-button" onClick={onEdit} aria-label="Edit moment"><Pencil size={19}/></button><button type="button" className="icon-button event-details-delete" onClick={() => onDelete(event)} aria-label="Delete moment"><Trash2 size={19}/></button>
          {shareOpen && <div className="event-share-menu">
            <div className="event-share-menu-heading"><div><span>SHARE A MOMENT</span><strong>Send a little joy</strong></div><Share2 size={17}/></div>
            <div className="event-share-preview"><span>{kind}</span><strong>{event.person_name}</strong><small>{dateLabel(event.event_date)}</small><i aria-hidden="true">✳</i></div>
            <a className="share-option whatsapp" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer"><MessageCircle size={17}/>WhatsApp<small>Send event details</small></a>
            <a className="share-option email" href={`mailto:?subject=${encodeURIComponent(`${kind}: ${event.person_name}`)}&body=${encodeURIComponent(shareText)}`}><Mail size={17}/>Email<small>Send event details</small></a>
            <button className="share-option card-download" type="button" onClick={downloadStyledCard}><Image size={17}/>Download share card<small>Save the designed image</small></button>
            <button className="share-copy-option" type="button" onClick={copyDetails}><Copy size={14}/>{copied ? 'Copied to clipboard' : 'Copy details as text'}</button>
          </div>}
        </div>
      </div>
      <div className="event-details-content">
        <div className="event-details-avatar">{event.person_name?.trim()?.[0]?.toUpperCase() || '✦'}</div>
        <div className="event-details-heading">
          <span className="event-details-kind">{kind}</span>
          <h1 id="event-details-title">{event.person_name}</h1>
          {event.title && <p className="event-details-subtitle">{event.title}</p>}
          <p className="event-details-date"><CalendarDays size={17}/>{dateLabel(event.event_date)}</p>
        </div>

        <div className="event-details-facts">
          {event.repeat_yearly && <div><strong>Yearly</strong><span>Repeats</span></div>}
          {reminders.length > 0 && <div><strong>{reminders.slice().sort((a,b)=>a-b).map(days => days === 1 ? '1 day' : days === 7 ? '1 week' : `${days} days`).join(', ')}</strong><span>Reminders</span></div>}
        </div>

        {isBirthdayToday ? <section className={`birthday-celebration ${candleBlown ? 'wish-made' : ''}`} aria-label="Birthday candle celebration">
          <h2>🎉 Happy Birthday! 🎉</h2>
          {!candleShown ? <button type="button" className="birthday-candle-start" onClick={() => setCandleShown(true)}>🕯️ Light a candle</button> : <>
            <button type="button" className={`birthday-candle ${candleBlown ? 'blown' : ''}`} onPointerUp={tapCandle} onDoubleClick={() => setCandleBlown(true)} aria-label={candleBlown ? 'Candle blown out' : 'Double tap to blow out the candle'} disabled={candleBlown}>
              <span className="candle-flame" aria-hidden="true">{candleBlown ? '' : '🔥'}</span><span className="candle-wick"/><span className="candle-stick"/>
            </button>
            <p>{candleBlown ? 'Wish made! ✨' : 'Make a wish, then double tap the candle to blow it out.'}</p>
          </>}
        </section> : celebration || <section className="event-countdown" aria-label="Countdown to event">
          {countdown.passed ? <><strong>This moment has passed</strong><span>{dateLabel(event.event_date)}</span></> : <>
            <div className="event-countdown-date"><CalendarDays size={15}/>{countdown.days === 0 ? 'Today is the day!' : `Coming up ${countdown.days === 1 ? 'tomorrow' : `in ${countdown.days} days`}`}</div>
            <div className="event-countdown-units">{[[countdown.days, 'Days'], [countdown.hours, 'Hours'], [countdown.minutes, 'Mins']].map(([value,label]) => <div key={label}><strong>{String(value).padStart(2,'0')}</strong><span>{label}</span></div>)}</div>
          </>}
        </section>}

        {zodiac && <section className="event-zodiac" aria-label="Zodiac sign based on event date">
          <div className="event-zodiac-intro"><span className="event-zodiac-symbol">{zodiac.symbol}</span><div><h2>{zodiac.name}</h2><p>{zodiac.element} sign · {dateLabelForRange(zodiac)}</p></div></div>
          <p className="event-zodiac-description">A fun astrology snapshot based on this event date.</p>
          <div className="event-zodiac-traits">{zodiac.traits.map(trait => <span key={trait}>{trait}</span>)}</div>
        </section>}

        {event.notes && <section className="event-details-section"><h2>Notes</h2><p>{event.notes}</p></section>}
        {(event.contact_phone || event.contact_email) && <section className="event-details-section"><h2>Contact</h2><div className="event-details-contact">{event.contact_phone && <a href={`tel:${event.contact_phone}`}><Phone size={16}/>{event.contact_phone}</a>}{event.contact_email && <a href={`mailto:${event.contact_email}`}><Mail size={16}/>{event.contact_email}</a>}</div></section>}
        {socialLinks.length > 0 && <section className="event-details-section"><h2>Social links</h2><div className="event-details-socials">{socialLinks.map(([label,url]) => <a key={label} href={/^(https?:\/\/)/i.test(url) ? url : `https://${url}`} target="_blank" rel="noreferrer">{label}<span>↗</span></a>)}</div></section>}
        <div className="event-details-footer"><Clock3 size={15}/>{event.repeat_yearly ? 'A date to remember every year' : 'A date worth remembering'}</div>
      </div>
    </section>
  </div>;
}
