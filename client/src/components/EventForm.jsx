import React, { useState } from 'react';
import { CalendarDays, Heart, Sparkles, Trash2, X } from 'lucide-react';
import { kinds } from '../services/eventTypes.js';
import './EventForm.css';

const typeIcons = ['\u{1F382}', '\u{1F49E}', '\u{1F490}', '\u{1F393}', '\u{2728}', '\u{1F38A}', '\u{2733}'];
const reminderChoices = [[1, '1 day'], [4, '4 days'], [5, '5 days'], [7, '1 week'], [14, '2 weeks']];

export default function EventForm({ event, onClose, onSave, onDelete }) {
  const [error, setError] = useState('');
  const [type, setType] = useState(event?.event_type || 'Birthday');
  const [customType, setCustomType] = useState(event?.custom_type || '');
  const [repeat, setRepeat] = useState(event?.repeat_yearly ?? ['Birthday', 'Anniversary'].includes(event?.event_type));
  const [reminders, setReminders] = useState(event?.reminders || [1, 7]);

  const toggleReminder = days => setReminders(current => current.includes(days)
    ? current.filter(value => value !== days)
    : [...current, days]);

  const chooseType = value => {
    setType(value);
    setError('');
    if (['Birthday', 'Anniversary'].includes(value)) setRepeat(true);
  };

  const submit = e => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      person_name: String(form.get('person_name') || '').trim(),
      title: String(form.get('title') || '').trim(),
      event_type: type,
      custom_type: type === 'Custom' ? customType.trim() : '',
      event_date: form.get('event_date'),
      repeat_yearly: repeat,
      notes: String(form.get('notes') || '').trim(),
      reminders,
      contact_phone: String(form.get('contact_phone') || '').trim(),
      contact_email: String(form.get('contact_email') || '').trim(),
      instagram_url: String(form.get('instagram_url') || '').trim(),
      facebook_url: String(form.get('facebook_url') || '').trim(),
      linkedin_url: String(form.get('linkedin_url') || '').trim(),
      snapchat_url: String(form.get('snapchat_url') || '').trim(),
    };
    if (!payload.person_name || !payload.event_date) {
      setError('Add a name and date to continue.');
      return;
    }
    if (type === 'Custom' && !payload.custom_type) {
      setError('Give your custom celebration a name.');
      return;
    }
    onSave(payload);
  };

  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="event-modal" onSubmit={submit}>
      <div className="modal-head event-modal-head">
        <div>
          <div className="eyebrow"><Sparkles size={13}/> A DATE WORTH REMEMBERING</div>
          <h2>{event ? 'Edit this moment' : 'Add a moment'}</h2>
          <p>Keep every special day a little closer.</p>
          <div className="form-progress"><span/><span/><span/><span/><b>MAKE IT YOURS</b></div>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close event form"><X size={20}/></button>
      </div>

      <div className="form-scroll">
        <label>Who is it for?<input name="person_name" defaultValue={event?.person_name || ''} placeholder="A person's name" required maxLength="120"/></label>
        <label>Give it a name <span className="optional">OPTIONAL</span><input name="title" defaultValue={event?.title || ''} placeholder="e.g. Mum's 60th birthday" maxLength="160"/></label>

        <fieldset className="celebration-fieldset">
          <legend>What are you celebrating?</legend>
          <div className="type-grid">{kinds.map((kind, index) => <button type="button" key={kind} className={`type-chip ${type === kind ? 'selected' : ''}`} onClick={() => chooseType(kind)} aria-pressed={type === kind}><span>{typeIcons[index]}</span>{kind}{type === kind && <i>✓</i>}</button>)}</div>
          {type === 'Custom' && <label className="custom-type-reveal"><span><Sparkles size={15}/> Name your celebration</span><input autoFocus name="custom_type" value={customType} onChange={e => { setCustomType(e.target.value); setError(''); }} placeholder="e.g. Housewarming, baby shower, new job" maxLength="60" required/><small>This name will appear on your calendar and event card.</small></label>}
        </fieldset>

        <label className="date-field-label"><span><CalendarDays size={15}/> Choose the date</span><input name="event_date" type="date" defaultValue={event?.event_date?.slice(0, 10) || ''} required/></label>
        <div className="setting-row modal-repeat"><div><b>Repeat every year</b><small>For birthdays and anniversaries.</small></div><button type="button" className={`toggle ${repeat ? 'on' : ''}`} role="switch" aria-checked={repeat} onClick={() => setRepeat(!repeat)}><i/></button></div>

        <fieldset><legend>Remind me beforehand</legend><div className="reminder-chips">{reminderChoices.map(([days, label]) => <button type="button" key={days} className={reminders.includes(days) ? 'selected' : ''} onClick={() => toggleReminder(days)}>{reminders.includes(days) && <span>✓</span>}{label}</button>)}</div></fieldset>
        <label>Notes and gift ideas <span className="optional">OPTIONAL</span><textarea name="notes" defaultValue={event?.notes || ''} placeholder="A thoughtful gift, a favourite thing, a note for later?" rows="3" maxLength="2000"/></label>
        <div className="form-columns"><label>Phone <span className="optional">OPTIONAL</span><input name="contact_phone" defaultValue={event?.contact_phone || ''} placeholder="Phone number"/></label><label>Email <span className="optional">OPTIONAL</span><input name="contact_email" type="email" defaultValue={event?.contact_email || ''} placeholder="Email address"/></label></div>
        <fieldset className="social-links-fieldset"><legend>Social links <span className="optional">OPTIONAL</span></legend><div className="form-columns"><label>Instagram<input name="instagram_url" defaultValue={event?.instagram_url || ''} placeholder="instagram.com/username"/></label><label>Facebook<input name="facebook_url" defaultValue={event?.facebook_url || ''} placeholder="facebook.com/username"/></label><label>LinkedIn<input name="linkedin_url" defaultValue={event?.linkedin_url || event?.social_url || ''} placeholder="linkedin.com/in/username"/></label><label>Snapchat<input name="snapchat_url" defaultValue={event?.snapchat_url || ''} placeholder="snapchat.com/add/username"/></label></div></fieldset>
        {error && <div className="form-error">{error}</div>}
      </div>

      <div className="modal-actions">{event && <button className="delete-btn" type="button" onClick={() => onDelete(event)}><Trash2 size={16}/> Delete</button>}<button className="secondary-btn" type="button" onClick={onClose}>Cancel</button><button className="primary-btn" type="submit"><Heart size={16}/>{event ? 'Save changes' : 'Save this moment'}</button></div>
    </form>
  </div>;
}
