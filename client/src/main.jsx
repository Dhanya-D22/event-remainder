import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './auth.css';
import { ThemeProvider } from './context/ThemeContext.jsx';

class StartupBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('Momentra failed to render:', error, info); }
  render() {
    if (this.state.error) return <main style={{minHeight:'100vh',display:'grid',placeContent:'center',padding:24,background:'#f7f5ff',color:'#29243a',fontFamily:'sans-serif'}}><h1>Momentra could not open</h1><p>Use this message to identify the startup error:</p><pre style={{maxWidth:760,whiteSpace:'pre-wrap',color:'#a33'}}>{this.state.error.message}</pre><button onClick={()=>window.location.reload()}>Reload app</button></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<React.StrictMode><StartupBoundary><ThemeProvider><App /></ThemeProvider></StartupBoundary></React.StrictMode>);
