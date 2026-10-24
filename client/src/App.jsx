import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Home, Settings, Trophy, Moon, Sun } from 'lucide-react';

import { api } from './services/api.js';
import { todayISO, daysUntil } from './services/date.js';
import Dashboard from './pages/Dashboard.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import { Achievements } from './pages/Achievements.jsx';
import SettingsPage from './pages/Settings.jsx';
import EventForm from './components/EventForm.jsx';
import EventDetails from './components/EventDetails.jsx';
import Sidebar from './components/Sidebar.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import { SplashScreen } from './pages/Welcome.jsx';
import LoginPage from './pages/Login.jsx';
import { useTheme } from './context/ThemeContext.jsx';


function App() {
  const { setTheme } = useTheme();
  const [token,setToken]=useState(()=>{try{return localStorage.getItem('er_token')||'';}catch{return '';}}); const [user,setUser]=useState(null); const [events,setEvents]=useState([]); const [settings,setSettings]=useState({theme:'light',remindersEnabled:true}); const [summary,setSummary]=useState({streak:0,badges:[]}); const [page,setPage]=useState('Home'); const [auth,setAuth]=useState(()=>{try{return !localStorage.getItem('er_token');}catch{return true;}}); const [authMode,setAuthMode]=useState('login'); const [authError,setAuthError]=useState(''); const [loading,setLoading]=useState(false); const [modal,setModal]=useState(null); const [toast,setToast]=useState(''); const [month,setMonth]=useState(new Date()); const [selectedDate,setSelectedDate]=useState(todayISO()); const [mobileMenu,setMobileMenu]=useState(false); const [showSplash,setShowSplash]=useState(()=>{try{return !sessionStorage.getItem('er_splash_seen');}catch{return true;}});
  const refresh=async t=>{ const [me,ev,st,dash]=await Promise.all([api('/auth/me',{},t),api('/events',{},t),api('/settings',{},t),api('/dashboard',{},t)]); setUser(me.user);setEvents(ev.events);setSettings(st.settings);setTheme(st.settings.theme);setSummary(dash);setAuth(false); };
  useEffect(()=>{ if(token) refresh(token).catch(()=>{localStorage.removeItem('er_token');setToken('');setAuth(true);}); },[token]);
  useEffect(()=>{if(!showSplash)return;const timer=setTimeout(()=>{try{sessionStorage.setItem('er_splash_seen','1');}catch{}setShowSplash(false);},2500);return()=>clearTimeout(timer);},[showSplash]);
  useEffect(()=>{if(toast){const id=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(id);}},[toast]);
  const sorted=useMemo(()=>[...events].sort((a,b)=>daysUntil(a.event_date,a.repeat_yearly)-daysUntil(b.event_date,b.repeat_yearly)),[events]);
  const greeting=()=>{const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening';};
  const acceptSignIn=data=>{localStorage.setItem('er_token',data.token);setToken(data.token);setUser(data.user);setAuth(false);};
  const submitAuth=async e=>{e.preventDefault();setAuthError('');setLoading(true);try{const data=await api('/auth/register',{method:'POST',body:JSON.stringify({name:e.target.name.value,email:e.target.email.value,password:e.target.password.value})});acceptSignIn(data);}catch(err){setAuthError(err.message);}finally{setLoading(false);}};
  const requestLoginCode=async email=>{setAuthError('');setLoading(true);try{return await api('/auth/request-code',{method:'POST',body:JSON.stringify({email})});}catch(err){setAuthError(err.message);throw err;}finally{setLoading(false);}};
  const verifyLoginCode=async(email,code)=>{setAuthError('');setLoading(true);try{const data=await api('/auth/verify-code',{method:'POST',body:JSON.stringify({email,code})});acceptSignIn(data);}catch(err){setAuthError(err.message);}finally{setLoading(false);}};
  const saveEvent=async form=>{try{if(modal?.event) await api(`/events/${modal.event.id}`,{method:'PUT',body:JSON.stringify(form)},token);else await api('/events',{method:'POST',body:JSON.stringify(form)},token);await refresh(token);setModal(null);setToast(modal?.event?'Event updated':'Your moment is saved');}catch(e){setToast(e.message);}};
  const deleteEvent=async ev=>{if(!window.confirm(`Delete ${ev.person_name}'s ${ev.event_type.toLowerCase()}?`))return;try{await api(`/events/${ev.id}`,{method:'DELETE'},token);await refresh(token);setModal(null);setToast('Event deleted');}catch(e){setToast(e.message);}};
  const logout=()=>{localStorage.removeItem('er_token');setToken('');setAuth(true);};
  const changeSettings=async next=>{const merged={...settings,...next};setSettings(merged);if(next.theme)setTheme(next.theme);try{await api('/settings',{method:'PUT',body:JSON.stringify(merged)},token);}catch(e){setToast(e.message);}};
  if(showSplash) return <SplashScreen/>;
  if(auth||!token) return <LoginPage mode={authMode} setMode={setAuthMode} onSubmit={submitAuth} onRequestCode={requestLoginCode} onVerifyCode={verifyLoginCode} error={authError} loading={loading}/>;
  if(!user) return <div className="loading"><div className="loader"/> Getting your moments ready…</div>;
  const navigate=p=>{setPage(p);setMobileMenu(false);};
  return <div className={`app-shell ${mobileMenu ? 'sidebar-collapsed' : ''}`}>
    <Sidebar page={page} navigate={navigate} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} user={user} onAdd={()=>setModal({})} onLogout={logout}/>
    <main className="main-area"><header className="topbar"><div className="breadcrumb">My space <span>/</span> <b>{page}</b></div><div className="top-actions"><div className="today-chip"><span className="live-dot"/>{new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}</div><button className="icon-button theme-toggle" title="Toggle theme" onClick={()=>changeSettings({theme:settings.theme==='dark'?'light':'dark'})}>{settings.theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button><button className="avatar top-avatar" onClick={()=>navigate('Settings')}>{user.name?.[0]?.toUpperCase()}</button></div></header>
      <div className="content-wrap">{page==='Home'&&<Dashboard user={user} events={sorted} streak={summary.streak} onAdd={()=>setModal({})} onOpen={ev=>setModal({event:ev,details:true})} navigate={navigate} greeting={greeting}/>}{page==='Calendar'&&<CalendarPage events={events} month={month} setMonth={setMonth} selected={selectedDate} setSelected={setSelectedDate} onAdd={()=>setModal({})} onOpen={ev=>setModal({event:ev,details:true})}/>}{page==='Achievements'&&<Achievements events={events} streak={summary.streak} unlockedBadges={summary.badges || []}/>}{page==='Settings'&&<SettingsPage settings={settings} onChange={changeSettings} user={user} onLogout={logout}/>}</div>
    </main><BottomNavigation page={page} navigate={navigate}/>
    {modal?.details&&<EventDetails event={modal.event} onBack={()=>setModal(null)} onEdit={()=>setModal({event:modal.event})} onDelete={deleteEvent}/>}{modal&&!modal.details&&<EventForm event={modal.event} onClose={()=>setModal(null)} onSave={saveEvent} onDelete={deleteEvent}/>}{toast&&<div className="toast"><span className="toast-check">✓</span>{toast}</div>}
  </div>;
}

export default App;

