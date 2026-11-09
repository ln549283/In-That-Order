import { Capacitor } from '@capacitor/core';
import { Purchases, type CustomerInfo, type PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { AdMob, AdmobConsentStatus, RewardAdPluginEvents, InterstitialAdPluginEvents } from '@capacitor-community/admob';
const env=import.meta.env;
const platform=Capacitor.getPlatform();
const native=Capacitor.isNativePlatform();
const entitlement='no_ads';
const apiKey=platform==='ios'?env.VITE_REVENUECAT_IOS_KEY:env.VITE_REVENUECAT_ANDROID_KEY;
const adId=(kind:'REWARDED'|'INTERSTITIAL')=>env[`VITE_ADMOB_${platform==='ios'?'IOS':'ANDROID'}_${kind}`] as string|undefined;
let offer:PurchasesPackage|undefined;
let initialized=false;
let consentReady=false;
let initTask:Promise<void>|undefined;
export interface CommerceState {premium:boolean;known:boolean;price:string;available:boolean;busy:boolean}
let state:CommerceState={premium:false,known:!native,price:'1,99 €',available:false,busy:false};
const listeners=new Set<(s:CommerceState)=>void>();
function publish(next:Partial<CommerceState>){state={...state,...next};listeners.forEach(l=>l(state));}
function updateInfo(info:CustomerInfo){publish({premium:!!info.entitlements.active[entitlement],known:true});}
export function subscribeCommerce(fn:(s:CommerceState)=>void){listeners.add(fn);fn(state);return()=>{listeners.delete(fn);};}
export function initCommerce(){return initTask??=(async()=>{
 if(!native||!apiKey)return;
 try {await Purchases.configure({apiKey});initialized=true;await Purchases.addCustomerInfoUpdateListener(updateInfo);updateInfo((await Purchases.getCustomerInfo()).customerInfo);
 const offerings=await Purchases.getOfferings();offer=offerings.current?.availablePackages.find(p=>p.product.identifier==='no_ads_lifetime');
 publish({available:!!offer,price:offer?.product.priceString||'1,99 €'});
 }catch{/* No synthetic entitlement or purchase fallback. Cached SDK entitlements remain authoritative. */}
})();}
export async function refreshEntitlement(){if(initialized)try{updateInfo((await Purchases.getCustomerInfo()).customerInfo);if(!offer){const offerings=await Purchases.getOfferings();offer=offerings.current?.availablePackages.find(p=>p.product.identifier==='no_ads_lifetime');publish({available:!!offer,price:offer?.product.priceString||'1,99 €'});}}catch{/* Offline cache remains in SDK. */}}
export async function buyPremium():Promise<string>{
 if(state.busy)return '';
 if(!offer)return 'L’achat est disponible dans l’application publiée sur le store.';
 publish({busy:true});
 try{updateInfo((await Purchases.purchasePackage({aPackage:offer})).customerInfo);return state.premium?'Merci ! À vous les petites pauses sans publicité.':'Achat en attente de confirmation du store.';}
 catch(e){return (e as {userCancelled?:boolean}).userCancelled?'Achat annulé.':'Achat non terminé. Vous pouvez réessayer depuis le store.';}
 finally{publish({busy:false});}
}
export async function restorePremium():Promise<string>{
 if(!initialized)return 'La restauration se fait dans l’application mobile, avec le compte utilisé pour l’achat.';
 if(state.busy)return '';publish({busy:true});
 try{updateInfo((await Purchases.restorePurchases()).customerInfo);return state.premium?'Votre achat a été restauré.':'Aucun achat trouvé pour ce compte du store.';}
 catch{return 'Restauration indisponible. Vérifiez votre connexion et réessayez.';}finally{publish({busy:false});}
}
async function prepareConsent():Promise<boolean>{
 if(!native||state.premium||!state.known||env.VITE_ADS_ENABLED!=='true')return false;
 if(consentReady)return true;
 try{let info=await AdMob.requestConsentInfo();if(info.status===AdmobConsentStatus.REQUIRED&&info.isConsentFormAvailable)info=await AdMob.showConsentForm();
 if(!info.canRequestAds)return false;
 await AdMob.initialize();consentReady=true;return true;
 }catch{return false;}
}
export async function privacyOptions(){if(!native||env.VITE_ADS_ENABLED!=='true')return false;try{await AdMob.showPrivacyOptionsForm();consentReady=false;return true;}catch{return false;}}
export function rewardedAvailable(){return native&&env.VITE_ADS_ENABLED==='true'&&!!adId('REWARDED');}
export async function showAd(kind:'reward'|'interstitial'):Promise<{shown:boolean;rewarded:boolean}>{
 const empty={shown:false,rewarded:false};if(state.busy||state.premium)return empty;
 const id=adId(kind==='reward'?'REWARDED':'INTERSTITIAL');if(!id)return empty;
 publish({busy:true});let shown=false;let earned=false;
 const handles:{remove:()=>Promise<void>}[]=[];let timer:ReturnType<typeof setTimeout>|undefined;
 try{
 if(!await prepareConsent()||state.premium)return empty;
 // Preparation has a bounded wait; no blocking screen if inventory is unavailable.
 const load=kind==='reward'?AdMob.prepareRewardVideoAd({adId:id,npa:true,isTesting:env.VITE_ADS_TESTING==='true'}):AdMob.prepareInterstitial({adId:id,npa:true,isTesting:env.VITE_ADS_TESTING==='true'});
 await Promise.race([load,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('No ad')),12000);})]);clearTimeout(timer);
 if(state.premium)return empty;
 await new Promise<void>(async(resolve,reject)=>{
   try{
     const done=()=>{resolve();};
     if(kind==='reward'){
       handles.push(await AdMob.addListener(RewardAdPluginEvents.Showed,()=>{shown=true;}));
       handles.push(await AdMob.addListener(RewardAdPluginEvents.Rewarded,()=>{earned=true;}));
       handles.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed,done));
       handles.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow,()=>reject(new Error('Ad failed'))));
       void AdMob.showRewardVideoAd().then(()=>{earned=true;}).catch(reject);
     }else{
       handles.push(await AdMob.addListener(InterstitialAdPluginEvents.Showed,()=>{shown=true;}));
       handles.push(await AdMob.addListener(InterstitialAdPluginEvents.Dismissed,done));
       handles.push(await AdMob.addListener(InterstitialAdPluginEvents.FailedToShow,()=>reject(new Error('Ad failed'))));
       void AdMob.showInterstitial().catch(reject);
     }
   }catch(e){reject(e);}
 });
 return {shown,rewarded:kind==='reward'&&earned};
 }catch{return {shown,rewarded:earned};}finally{clearTimeout(timer);await Promise.allSettled(handles.map(h=>h.remove()));publish({busy:false});}
}
