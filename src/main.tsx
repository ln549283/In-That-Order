import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Capacitor } from '@capacitor/core';
import { registerSW } from 'virtual:pwa-register';
if (import.meta.env.PROD && !Capacitor.isNativePlatform()) registerSW({ immediate: true });
import '@fontsource-variable/nunito/wght.css';
import './style.css';
class Boundary extends React.Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<main className="recovery"><h1>Une petite pause imprévue.</h1><p>Relancez le jeu pour retrouver votre progression sauvegardée.</p><button className="primary" onClick={()=>location.reload()}>Relancer le jeu</button></main>:this.props.children;}}
ReactDOM.createRoot(document.getElementById('root')!).render(<Boundary><App/></Boundary>);
