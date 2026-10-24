import React from 'react';
import { Home, CalendarDays, Trophy, Settings } from 'lucide-react';
export default function BottomNavigation({ page, navigate }) { const nav=[['Home',Home],['Calendar',CalendarDays],['Achievements',Trophy],['Settings',Settings]]; return <nav className="mobile-nav">{nav.map(([name,Icon])=><button key={name} className={page===name?'active':''} onClick={()=>navigate(name)}><Icon size={19}/><span>{name}</span></button>)}</nav>; }
