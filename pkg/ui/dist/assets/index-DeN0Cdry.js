const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/login-B2ps9CJw.js","assets/press-BQyLhwVv.js","assets/router-B1wwybcr.js","assets/forms-ChSyHPkg.js","assets/auth-card-B-yRZZTk.js","assets/setup-KoskL9jE.js","assets/client-DaTS5Mxb.js","assets/overview-B4cPqSS6.js","assets/query-DEj2kaNm.js","assets/live-query-DDtzER30.js","assets/repeat-Utyd6s0W.js","assets/page-ITe5xmEa.js","assets/collection-type-CsNDn6tw.js","assets/collections-BlSdN6Pd.js","assets/rules-editor-CZ0ADqS3.js","assets/fieldValidation-D0RWDzzJ.js","assets/toast-CRunUHSe.js","assets/collection-CbJ-ls2c.js","assets/records-Cgbv9L75.js","assets/data-table-kOkcDszi.js","assets/record-helpers-BhvqQe0T.js","assets/realtime-Dm5qGaps.js","assets/analytics-CNqpWruM.js","assets/workers-_KxrxDDf.js","assets/flags-1JrrpT-X.js","assets/settings-DAITSizy.js","assets/docs-BzeMEI3R.js"])))=>i.map(i=>d[i]);
import{a as e,c as t,i as n,n as r,o as i,r as a,t as o}from"./press-BQyLhwVv.js";import{a as s,c,d as l,i as u,l as d,n as f,o as p,s as m,u as h}from"./query-DEj2kaNm.js";import{a as g,c as _,i as v,l as y,n as b,r as x,s as S,t as C,u as w}from"./client-DaTS5Mxb.js";import{i as T,n as E,r as ee,t as D}from"./router-B1wwybcr.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var O=`modulepreload`,te=function(e){return`/_moul_/`+e},ne={},re=function(e){return e.pathname.endsWith(`.css`)},ie=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},k=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=te(t,n);let r=s(t),i=re(r);return ie(ne,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:O,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{t.addEventListener(`load`,e),t.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${r}`)))})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},ae=globalThis,oe=ae.ShadowRoot&&(ae.ShadyCSS===void 0||ae.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,se=Symbol(),A=new WeakMap,ce=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==se)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(oe&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=A.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&A.set(t,e))}return e}toString(){return this.cssText}},j=e=>new ce(typeof e==`string`?e:e+``,void 0,se),M=(e,...t)=>new ce(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,se),le=(e,t)=>{if(oe)e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let n of t){let t=document.createElement(`style`),r=ae.litNonce;r!==void 0&&t.setAttribute(`nonce`,r),t.textContent=n.cssText,e.appendChild(t)}},N=oe?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return j(t)})(e):e,{is:ue,defineProperty:de,getOwnPropertyDescriptor:fe,getOwnPropertyNames:pe,getOwnPropertySymbols:P,getPrototypeOf:me}=Object,he=globalThis,ge=he.trustedTypes,_e=ge?ge.emptyScript:``,ve=he.reactiveElementPolyfillSupport,ye=(e,t)=>e,be={toAttribute(e,t){switch(t){case Boolean:e=e?_e:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},F=(e,t)=>!ue(e,t),I={attribute:!0,type:String,converter:be,reflect:!1,useDefault:!1,hasChanged:F};Symbol.metadata??=Symbol(`metadata`),he.litPropertyMetadata??=new WeakMap;var xe=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=I){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&de(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=fe(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??I}static _$Ei(){if(this.hasOwnProperty(ye(`elementProperties`)))return;let e=me(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ye(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ye(`properties`))){let e=this.properties,t=[...pe(e),...P(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(N(e))}else e!==void 0&&t.push(N(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return le(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?be:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?be:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??F)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};xe.elementStyles=[],xe.shadowRootOptions={mode:`open`},xe[ye(`elementProperties`)]=new Map,xe[ye(`finalized`)]=new Map,ve?.({ReactiveElement:xe}),(he.reactiveElementVersions??=[]).push(`2.1.2`);var L=globalThis,Se=e=>e,Ce=L.trustedTypes,we=Ce?Ce.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,Te=`$lit$`,Ee=`lit$${Math.random().toFixed(9).slice(2)}$`,De=`?`+Ee,Oe=`<${De}>`,ke=document,R=()=>ke.createComment(``),Ae=e=>e===null||typeof e!=`object`&&typeof e!=`function`,je=Array.isArray,Me=e=>je(e)||typeof e?.[Symbol.iterator]==`function`,Ne=`[ 	
\f\r]`,Pe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Fe=/-->/g,Ie=/>/g,z=RegExp(`>|${Ne}(?:([^\\s"'>=/]+)(${Ne}*=${Ne}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),Le=/'/g,Re=/"/g,ze=/^(?:script|style|textarea|title)$/i,Be=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),B=Be(1),V=Be(2),Ve=Symbol.for(`lit-noChange`),H=Symbol.for(`lit-nothing`),He=new WeakMap,Ue=ke.createTreeWalker(ke,129);function We(e,t){if(!je(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return we===void 0?t:we.createHTML(t)}var Ge=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=Pe;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===Pe?c[1]===`!--`?o=Fe:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=z):(ze.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=z):o=Ie:o===z?c[0]===`>`?(o=i??Pe,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?z:c[3]===`"`?Re:Le):o===Re||o===Le?o=z:o===Fe||o===Ie?o=Pe:(o=z,i=void 0);let d=o===z&&e[t+1].startsWith(`/>`)?` `:``;a+=o===Pe?n+Oe:l>=0?(r.push(s),n.slice(0,l)+Te+n.slice(l)+Ee+d):n+Ee+(l===-2?t:d)}return[We(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Ke=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Ge(t,n);if(this.el=e.createElement(l,r),Ue.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=Ue.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(Te)){let t=u[o++],n=i.getAttribute(e).split(Ee),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Ze:r[1]===`?`?Qe:r[1]===`@`?$e:Xe}),i.removeAttribute(e)}else e.startsWith(Ee)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(ze.test(i.tagName)){let e=i.textContent.split(Ee),t=e.length-1;if(t>0){i.textContent=Ce?Ce.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],R()),Ue.nextNode(),c.push({type:2,index:++a});i.append(e[t],R())}}}else if(i.nodeType===8){if(i.data===De)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(Ee,e+1))!==-1;)c.push({type:7,index:a}),e+=Ee.length-1}}a++}}static createElement(e,t){let n=ke.createElement(`template`);return n.innerHTML=e,n}};function qe(e,t,n=e,r){if(t===Ve)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=Ae(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=qe(e,i._$AS(e,t.values),i,r)),t}var Je=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??ke).importNode(t,!0);Ue.currentNode=r;let i=Ue.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new Ye(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new et(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=Ue.nextNode(),a++)}return Ue.currentNode=ke,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},Ye=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=H,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=qe(this,e,t),Ae(e)?e===H||e==null||e===``?(this._$AH!==H&&this._$AR(),this._$AH=H):e!==this._$AH&&e!==Ve&&this._(e):e._$litType$===void 0?e.nodeType===void 0?Me(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==H&&Ae(this._$AH)?this._$AA.nextSibling.data=e:this.T(ke.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Ke.createElement(We(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new Je(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=He.get(e.strings);return t===void 0&&He.set(e.strings,t=new Ke(e)),t}k(t){je(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(R()),this.O(R()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=Se(e).nextSibling;Se(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Xe=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=H,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=H}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=qe(this,e,t,0),a=!Ae(e)||e!==this._$AH&&e!==Ve,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=qe(this,r[n+o],t,o),s===Ve&&(s=this._$AH[o]),a||=!Ae(s)||s!==this._$AH[o],s===H?e=H:e!==H&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===H?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Ze=class extends Xe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===H?void 0:e}},Qe=class extends Xe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==H)}},$e=class extends Xe{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=qe(this,e,t,0)??H)===Ve)return;let n=this._$AH,r=e===H&&n!==H||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==H&&(n===H||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},et=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){qe(this,e)}},tt={M:Te,P:Ee,A:De,C:1,L:Ge,R:Je,D:Me,V:qe,I:Ye,H:Xe,N:Qe,U:$e,B:Ze,F:et},nt=L.litHtmlPolyfillSupport;nt?.(Ke,Ye),(L.litHtmlVersions??=[]).push(`3.3.3`);var rt=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new Ye(t.insertBefore(R(),e),e,void 0,n??{})}return i._$AI(e),i},it=globalThis,U=class extends xe{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=rt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Ve}};U._$litElement$=!0,U.finalized=!0,it.litElementHydrateSupport?.({LitElement:U});var at=it.litElementPolyfillSupport;at?.({LitElement:U}),(it.litElementVersions??=[]).push(`4.2.2`);var ot=[`primary`,`accent`,`success`,`warning`,`error`],st=[`solid`,`flat`,`shadow`,`bordered`,`glass`];function ct(e,t=`primary`){return typeof e==`string`&&ot.includes(e)?e:t}function lt(e,t=`flat`){return typeof e==`string`&&st.includes(e)?e:t}var ut=M`
  /* ── Tone-Scoped CSS Custom Properties ─────────────────────────── */

  /* Default / Primary Tone */
  :host,
  :host([tone="primary"]),
  [data-tone="primary"] {
    --_tone-solid-bg: var(--color-accent);
    --_tone-solid-fg: var(--color-accent-fg);
    --_tone-soft-bg: var(--color-accent-soft);
    --_tone-soft-fg: var(--color-accent-soft-fg);
    --_tone-border: var(--color-alert-border-accent);
  }

  /* Accent Tone */
  :host([tone="accent"]),
  [data-tone="accent"] {
    --_tone-solid-bg: var(--color-primary-500);
    --_tone-solid-fg: var(--color-accent-fg);
    --_tone-soft-bg: var(--color-alert-bg-accent);
    --_tone-soft-fg: var(--color-primary-600);
    --_tone-border: var(--color-alert-border-accent);
  }

  /* Success Tone */
  :host([tone="success"]),
  [data-tone="success"] {
    --_tone-solid-bg: var(--color-success);
    --_tone-solid-fg: var(--color-success-fg);
    --_tone-soft-bg: var(--color-success-soft);
    --_tone-soft-fg: var(--color-success-soft-fg);
    --_tone-border: var(--color-alert-border-success);
  }

  /* Warning Tone */
  :host([tone="warning"]),
  [data-tone="warning"] {
    --_tone-solid-bg: var(--color-warning);
    --_tone-solid-fg: var(--color-warning-fg);
    --_tone-soft-bg: var(--color-warning-soft);
    --_tone-soft-fg: var(--color-warning-soft-fg);
    --_tone-border: var(--color-alert-border-warning);
  }

  /* Error Tone */
  :host([tone="error"]),
  [data-tone="error"] {
    --_tone-solid-bg: var(--color-danger);
    --_tone-solid-fg: var(--color-danger-fg);
    --_tone-soft-bg: var(--color-danger-soft);
    --_tone-soft-fg: var(--color-danger-soft-fg);
    --_tone-border: var(--color-alert-border-error);
  }

  /* ── Visual Variant Rules ────────────────────────────────────────── */

  /* Solid Variant */
  :host([variant="solid"]),
  [data-variant="solid"] {
    background-color: var(--_tone-solid-bg);
    color: var(--_tone-solid-fg);
    border: 1px solid transparent;
  }

  /* Flat Variant - soft tint of the tone */
  :host([variant="flat"]),
  [data-variant="flat"] {
    background-color: var(--_tone-soft-bg);
    color: var(--_tone-soft-fg);
    border: 1px solid transparent;
  }

  /* Bordered Variant */
  :host([variant="bordered"]),
  [data-variant="bordered"] {
    background-color: transparent;
    color: var(--_tone-soft-fg);
    border: 1px solid var(--_tone-border);
  }

  /* Shadow Variant - solid fill with a glow in its own color */
  :host([variant="shadow"]),
  [data-variant="shadow"] {
    background-color: var(--_tone-solid-bg);
    color: var(--_tone-solid-fg);
    box-shadow:
      0 6px 16px -4px color-mix(in oklab, var(--_tone-solid-bg) 45%, transparent),
      var(--shadow-md);
    border: 1px solid transparent;
  }

  /* Glass Variant - Liquid glass material: tinted translucent fill, rim light, soft depth */
  :host([variant="glass"]),
  [data-variant="glass"] {
    background-color: color-mix(in oklch, var(--_tone-soft-bg) 45%, var(--glass-bg-thick));
    border: 1px solid var(--color-border-glass);
    color: var(--_tone-soft-fg);
    box-shadow: var(--glass-highlight), var(--shadow-glass);
  }

  /* Progressive enhancement: frost what's behind once backdrop-filter is available */
  @supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
    :host([variant="glass"]),
    [data-variant="glass"] {
      background-color: color-mix(in oklch, var(--_tone-soft-bg) 40%, var(--color-bg-glass));
      -webkit-backdrop-filter: var(--glass-filter);
      backdrop-filter: var(--glass-filter);
    }
  }
`;function W(e,t){if(typeof customElements<`u`){if(customElements.get(e)){console.warn(`[@moul-dev/ui] Custom element "${e}" is already registered. Skipping duplicate registration.`);return}customElements.define(e,t)}}var dt=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
`,ft=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
`,pt=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
`,mt=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6m0-6 6 6" />
  </svg>
`,ht=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
`,gt=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
`,_t=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
`,vt=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
`,yt=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.2" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" />
  </svg>
`,bt=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
`,xt=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
`,St=(e=``)=>V`
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class=${e}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
`;function Ct(e,t){e.indexOf(t)===-1&&e.push(t)}function wt(e,t){let n=e.indexOf(t);n>-1&&e.splice(n,1)}var Tt=(e,t,n)=>n>t?t:n<e?e:n,Et={},Dt=e=>/^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e),Ot=e=>typeof e==`object`&&!!e,kt=e=>/^0[^.\s]+$/u.test(e);function At(e){let t;return()=>(t===void 0&&(t=e()),t)}var jt=e=>e,Mt=(...e)=>e.reduce((e,t)=>n=>t(e(n))),Nt=(e,t,n)=>{let r=t-e;return r?(n-e)/r:1},Pt=class{constructor(){this.subscriptions=[]}add(e){return Ct(this.subscriptions,e),()=>this.remove(e)}remove(e){wt(this.subscriptions,e)}notify(e,t,n){let r=this.subscriptions.length;if(r){if(r===1)this.subscriptions[0](e,t,n);else for(let i=0;i<r;i++){let r=this.subscriptions[i];r&&r(e,t,n)}}}getSize(){return this.subscriptions.length}clear(){this.subscriptions.length=0}},Ft=e=>e*1e3,It=e=>e/1e3,Lt=(e,t)=>t?1e3/t*e:0,Rt=(e,t,n)=>{let r=t-e;return((n-e)%r+r)%r+e},zt=(e,t,n)=>(((1-3*n+3*t)*e+(3*n-6*t))*e+3*t)*e,Bt=1e-7,Vt=12;function Ht(e,t,n,r,i){let a,o,s=0;do o=t+(n-t)/2,a=zt(o,r,i)-e,a>0?n=o:t=o;while(Math.abs(a)>Bt&&++s<Vt);return o}function Ut(e,t,n,r){if(e===t&&n===r)return jt;let i=t=>Ht(t,0,1,e,n);return e=>e===0||e===1?e:zt(i(e),t,r)}var Wt=e=>t=>t<=.5?e(2*t)/2:(2-e(2*(1-t)))/2,Gt=e=>t=>1-e(1-t),Kt=Ut(.33,1.53,.69,.99),qt=Gt(Kt),Jt=Wt(qt),Yt=e=>e>=1?1:(e*=2)<1?.5*qt(e):.5*(2-2**(-10*(e-1))),Xt=e=>1-Math.sin(Math.acos(e)),Zt=Gt(Xt),Qt=Wt(Xt),$t=Ut(.42,0,1,1),en=Ut(0,0,.58,1),tn=Ut(.42,0,.58,1),nn=e=>Array.isArray(e)&&typeof e[0]!=`number`;function rn(e,t){return nn(e)?e[Rt(0,e.length,t)]:e}var an=e=>Array.isArray(e)&&typeof e[0]==`number`,on={linear:jt,easeIn:$t,easeInOut:tn,easeOut:en,circIn:Xt,circInOut:Qt,circOut:Zt,backIn:qt,backInOut:Jt,backOut:Kt,anticipate:Yt},sn=e=>typeof e==`string`,cn=e=>{if(an(e)){e.length;let[t,n,r,i]=e;return Ut(t,n,r,i)}return sn(e)?(on[e],`${e}`,on[e]):e},ln=[`setup`,`read`,`resolveKeyframes`,`preUpdate`,`update`,`preRender`,`render`,`postRender`];function un(e){let t=new Set,n=new Set,r=!1,i=!1,a=new Set,o={delta:0,timestamp:0,isProcessing:!1};function s(t){a.has(t)&&(n.add(t),e()),t(o)}let c={schedule:(e,i=!1,o=!1)=>{let s=o&&r?t:n;return i&&a.add(e),s.add(e),e},cancel:e=>{n.delete(e),a.delete(e)},process:e=>{if(o=e,r){i=!0;return}r=!0;let a=t;t=n,n=a,t.forEach(s),t.clear(),r=!1,i&&(i=!1,c.process(e))}};return c}var dn=40;function fn(e,t){let n=!1,r=!0,i={delta:0,timestamp:0,isProcessing:!1},a=()=>n=!0,o=ln.reduce((e,t)=>(e[t]=un(a),e),{}),{setup:s,read:c,resolveKeyframes:l,preUpdate:u,update:d,preRender:f,render:p,postRender:m}=o,h=()=>{let a=Et.useManualTiming,o=a?i.timestamp:performance.now();n=!1,a||(i.delta=r?1e3/60:Math.max(Math.min(o-i.timestamp,dn),1)),i.timestamp=o,i.isProcessing=!0,s.process(i),c.process(i),l.process(i),u.process(i),d.process(i),f.process(i),p.process(i),m.process(i),i.isProcessing=!1,n&&t&&(r=!1,e(h))},g=()=>{n=!0,r=!0,i.isProcessing||e(h)};return{schedule:ln.reduce((e,t)=>{let r=o[t];return e[t]=(e,t=!1,i=!1)=>(n||g(),r.schedule(e,t,i)),e},{}),cancel:e=>{for(let t=0;t<ln.length;t++)o[ln[t]].cancel(e)},state:i,steps:o}}var{schedule:pn,cancel:mn,state:hn,steps:gn}=fn(typeof requestAnimationFrame<`u`?requestAnimationFrame:jt,!0),_n;function vn(){_n=void 0}var yn={now:()=>(_n===void 0&&yn.set(hn.isProcessing||Et.useManualTiming?hn.timestamp:performance.now()),_n),set:e=>{_n=e,queueMicrotask(vn)}},bn=e=>Math.round(e*1e5)/1e5,xn=(e=>t=>typeof t==`string`&&t.startsWith(e))(`var(--`),Sn=e=>xn(e)?Cn.test(e.split(`/*`)[0].trim()):!1,Cn=/var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;function wn(e){return typeof e==`string`&&e.split(`/*`)[0].includes(`var(--`)}var Tn={test:e=>typeof e==`number`,parse:parseFloat,transform:e=>e},En={...Tn,transform:e=>Tt(0,1,e)},Dn={...Tn,default:1},On=/-?(?:\d+(?:\.\d+)?|\.\d+)/gu;function kn(e){return e==null}var An=/^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu,jn=(e,t)=>n=>!!(typeof n==`string`&&An.test(n)&&n.startsWith(e)||t&&!kn(n)&&Object.prototype.hasOwnProperty.call(n,t)),Mn=(e,t,n)=>r=>{if(typeof r!=`string`)return r;let[i,a,o,s]=r.match(On);return{[e]:parseFloat(i),[t]:parseFloat(a),[n]:parseFloat(o),alpha:s===void 0?1:parseFloat(s)}},Nn=e=>Tt(0,255,e),Pn={...Tn,transform:e=>Math.round(Nn(e))},Fn={test:jn(`rgb`,`red`),parse:Mn(`red`,`green`,`blue`),transform:({red:e,green:t,blue:n,alpha:r=1})=>`rgba(`+Pn.transform(e)+`, `+Pn.transform(t)+`, `+Pn.transform(n)+`, `+bn(En.transform(r))+`)`};function In(e){let t=``,n=``,r=``,i=``;return e.length>5?(t=e.substring(1,3),n=e.substring(3,5),r=e.substring(5,7),i=e.substring(7,9)):(t=e.substring(1,2),n=e.substring(2,3),r=e.substring(3,4),i=e.substring(4,5),t+=t,n+=n,r+=r,i+=i),{red:parseInt(t,16),green:parseInt(n,16),blue:parseInt(r,16),alpha:i?parseInt(i,16)/255:1}}var Ln={test:jn(`#`),parse:In,transform:Fn.transform},Rn=e=>({test:t=>typeof t==`string`&&t.endsWith(e)&&t.split(` `).length===1,parse:parseFloat,transform:t=>`${t}${e}`}),zn=Rn(`deg`),Bn=Rn(`%`),G=Rn(`px`),Vn=Rn(`vh`),Hn=Rn(`vw`),Un={...Bn,parse:e=>Bn.parse(e)/100,transform:e=>Bn.transform(e*100)},Wn={test:jn(`hsl`,`hue`),parse:Mn(`hue`,`saturation`,`lightness`),transform:({hue:e,saturation:t,lightness:n,alpha:r=1})=>`hsla(`+Math.round(e)+`, `+Bn.transform(bn(t))+`, `+Bn.transform(bn(n))+`, `+bn(En.transform(r))+`)`},Gn={test:e=>Fn.test(e)||Ln.test(e)||Wn.test(e),parse:e=>Fn.test(e)?Fn.parse(e):Wn.test(e)?Wn.parse(e):Ln.parse(e),transform:e=>typeof e==`string`?e:e.hasOwnProperty(`red`)?Fn.transform(e):Wn.transform(e),getAnimatableNone:e=>{let t=Gn.parse(e);return t.alpha=0,Gn.transform(t)}},Kn=/(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu,qn=new RegExp(On.source),Jn=new RegExp(Kn.source,`i`);function Yn(e){return isNaN(e)&&typeof e==`string`&&(qn.test(e)||Jn.test(e))}var Xn=`number`,Zn=`color`,Qn=`var`,$n=`var(`,er="${}",tr=/var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;function nr(e){let t=e.toString();return qn.test(t)||Jn.test(t)}function rr(e){let t=e.toString(),n=[],r={color:[],number:[],var:[]},i=[],a=0;return{values:n,split:t.replace(tr,e=>(Gn.test(e)?(r.color.push(a),i.push(Zn),n.push(Gn.parse(e))):e.startsWith($n)?(r.var.push(a),i.push(Qn),n.push(e)):(r.number.push(a),i.push(Xn),n.push(parseFloat(e))),++a,er)).split(er),indexes:r,types:i}}function ir(e){return rr(e).values}function ar({split:e,types:t}){let n=e.length;return r=>{let i=``;for(let a=0;a<n;a++)if(i+=e[a],r[a]!==void 0){let e=t[a];i+=e===Xn?bn(r[a]):e===Zn?Gn.transform(r[a]):r[a]}return i}}function or(e){return ar(rr(e))}var sr=e=>typeof e==`number`?0:Gn.test(e)?Gn.getAnimatableNone(e):e,cr=(e,t)=>typeof e==`number`?t?.trim().endsWith(`/`)?e:0:sr(e);function lr(e){let t=rr(e);return ar(t)(t.values.map((e,n)=>cr(e,t.split[n])))}var ur={test:Yn,parse:ir,createTransformer:or,getAnimatableNone:lr};function dr(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*(2/3-n)*6:e}function fr({hue:e,saturation:t,lightness:n,alpha:r}){e/=360,t/=100,n/=100;let i=0,a=0,o=0;if(!t)i=a=o=n;else{let r=n<.5?n*(1+t):n+t-n*t,s=2*n-r;i=dr(s,r,e+1/3),a=dr(s,r,e),o=dr(s,r,e-1/3)}return{red:Math.round(i*255),green:Math.round(a*255),blue:Math.round(o*255),alpha:r}}function pr(e,t){return n=>n>0?t:e}var mr=(e,t,n)=>e+(t-e)*n,hr=(e,t,n)=>{let r=e*e,i=n*(t*t-r)+r;return i<0?0:Math.sqrt(i)},gr=[Ln,Fn,Wn],_r=e=>gr.find(t=>t.test(e));function vr(e){let t=_r(e);if(!t)return`${e}`,!1;let n=t.parse(e);return t===Wn&&(n=fr(n)),n}var yr=(e,t)=>{let n=vr(e),r=vr(t);if(!n||!r)return pr(e,t);let i={...n};return e=>(i.red=hr(n.red,r.red,e),i.green=hr(n.green,r.green,e),i.blue=hr(n.blue,r.blue,e),i.alpha=mr(n.alpha,r.alpha,e),Fn.transform(i))},br=new Set([`none`,`hidden`]);function xr(e,t){return br.has(e)?n=>n<=0?e:t:n=>n>=1?t:e}function Sr(e,t){return n=>mr(e,t,n)}function Cr(e){return typeof e==`number`?Sr:typeof e==`string`?Sn(e)?pr:Gn.test(e)?yr:Dr:Array.isArray(e)?wr:typeof e==`object`?Gn.test(e)?yr:Tr:pr}function wr(e,t){let n=[...e],r=n.length,i=e.map((e,n)=>Cr(e)(e,t[n]));return e=>{for(let t=0;t<r;t++)n[t]=i[t](e);return n}}function Tr(e,t){let n={...e,...t},r={};for(let i in n)e[i]!==void 0&&t[i]!==void 0&&(r[i]=Cr(e[i])(e[i],t[i]));return e=>{for(let t in r)n[t]=r[t](e);return n}}function Er(e,t){let n=[],r={color:0,var:0,number:0};for(let i=0;i<t.values.length;i++){let a=t.types[i],o=e.indexes[a][r[a]];n[i]=e.values[o]??0,r[a]++}return n}var Dr=(e,t)=>{let n=ur.createTransformer(t),r=rr(e),i=rr(t);return r.indexes.var.length===i.indexes.var.length&&r.indexes.color.length===i.indexes.color.length&&r.indexes.number.length>=i.indexes.number.length?br.has(e)&&!i.values.length||br.has(t)&&!r.values.length?xr(e,t):Mt(wr(Er(r,i),i.values),n):(`${e}${t}`,pr(e,t))},Or=/^(-?(?:\d+(?:\.\d*)?|\.\d+))([a-z%]*)$/iu;function kr(e,t){let n=Or.exec(e);if(!n)return;let r=Or.exec(t);if(!r||n[2]!==r[2])return;let i=n[2],a=parseFloat(n[1]),o=parseFloat(r[1]);return e=>bn(mr(a,o,e))+i}function Ar(e,t,n){if(typeof e==`number`&&typeof t==`number`&&typeof n==`number`)return mr(e,t,n);if(typeof e==`string`&&typeof t==`string`){let n=kr(e,t);if(n)return n}return Cr(e)(e,t)}var jr=e=>{let t=({timestamp:t})=>e(t);return{start:(e=!0)=>pn.update(t,e),stop:()=>mn(t),now:()=>hn.isProcessing?hn.timestamp:yn.now()}},Mr=(e,t,n=10)=>{let r=``,i=Math.max(Math.round(t/n),2);for(let t=0;t<i;t++)r+=Math.round(e(t/(i-1))*1e4)/1e4+`, `;return`linear(${r.substring(0,r.length-2)})`},Nr=2e4;function Pr(e,t=50,n=Nr,r){let i=0,a=e.next(i);for(r?.push(a.value);!a.done&&i<n;)i+=t,a=e.next(i),r?.push(a.value);return i>=n?1/0:i}function Fr(e,t=100,n){let r=n({...e,keyframes:[0,t]}),i=Math.min(Pr(r),Nr);return{type:`keyframes`,ease:e=>r.next(i*e).value/t,duration:It(i)}}var K={stiffness:100,damping:10,mass:1,velocity:0,duration:800,bounce:.3,visualDuration:.3,restSpeed:{granular:.01,default:2},restDelta:{granular:.005,default:.5},minDuration:.01,maxDuration:10,minDamping:.05,maxDamping:1};function Ir(e,t){return e*Math.sqrt(1-t*t)}var Lr=12;function Rr(e,t,n){let r=n;for(let n=1;n<Lr;n++)r-=e(r)/t(r);return r}var zr=.001;function Br({duration:e=K.duration,bounce:t=K.bounce,velocity:n=K.velocity,mass:r=K.mass}){let i,a;K.maxDuration;let o=1-t;o=Tt(K.minDamping,K.maxDamping,o),e=Tt(K.minDuration,K.maxDuration,It(e)),o<1?(i=t=>{let r=t*o,i=r*e,a=r-n,s=Ir(t,o),c=Math.exp(-i);return zr-a/s*c},a=t=>{let r=t*o*e,a=r*n+n,s=o*o*t*t*e,c=Math.exp(-r),l=Ir(t*t,o);return(-i(t)+zr>0?-1:1)*((a-s)*c)/l}):(i=t=>-.001+Math.exp(-t*e)*((t-n)*e+1),a=t=>Math.exp(-t*e)*((n-t)*(e*e)));let s=5/e,c=Rr(i,a,s);if(e=Ft(e),isNaN(c))return{stiffness:K.stiffness,damping:K.damping,duration:e};{let t=c*c*r;return{stiffness:t,damping:o*2*Math.sqrt(r*t),duration:e}}}var Vr=[`duration`,`bounce`],Hr=[`stiffness`,`damping`,`mass`];function Ur(e,t){return t.some(t=>e[t]!==void 0)}function Wr(e){let t={velocity:K.velocity,stiffness:K.stiffness,damping:K.damping,mass:K.mass,isResolvedFromDuration:!1,...e};if(!Ur(e,Hr)&&Ur(e,Vr)){if(t.velocity=0,e.visualDuration){let n=e.visualDuration,r=2*Math.PI/(n*1.2),i=r*r,a=2*Tt(.05,1,1-(e.bounce||0))*Math.sqrt(i);t={...t,mass:K.mass,stiffness:i,damping:a}}else{let n=Br({...e,velocity:0});t={...t,...n,mass:K.mass},t.isResolvedFromDuration=!0}}return t}function Gr(e=K.visualDuration,t=K.bounce){let n=typeof e==`object`?e:{visualDuration:e,keyframes:[0,1],bounce:t},r=n.keyframes[0],i=n.keyframes[n.keyframes.length-1],a={done:!1,value:r},{stiffness:o,damping:s,mass:c,duration:l,velocity:u,isResolvedFromDuration:d}=Wr({...n,velocity:-It(n.velocity||0)}),f=s/(2*Math.sqrt(o*c)),p=It(Math.sqrt(o/c)),m=f*p,h={target:i,delta:i-r,velocity:u||0,restSpeed:0,restDelta:0},g=()=>{let e=Math.abs(h.delta)<5;h.restSpeed=n.restSpeed||(e?K.restSpeed.granular:K.restSpeed.default),h.restDelta=n.restDelta||(e?K.restDelta.granular:K.restDelta.default)};g();let _,v,y;if(f<1){let e=Ir(p,f),t={A:0,sinC:0,cosC:0,t:-1,env:0,sin:0,cos:0};y=()=>{t.A=(h.velocity+m*h.delta)/e,t.sinC=m*t.A+h.delta*e,t.cosC=m*h.delta-t.A*e};let n=n=>{n!==t.t&&(t.t=n,t.env=Math.exp(-m*n),t.sin=Math.sin(e*n),t.cos=Math.cos(e*n))};_=e=>(n(e),h.target-t.env*(t.A*t.sin+h.delta*t.cos)),v=e=>(n(e),t.env*(t.sinC*t.sin+t.cosC*t.cos))}else if(f===1){_=e=>h.target-Math.exp(-p*e)*(h.delta+(h.velocity+p*h.delta)*e);let e={C:0};y=()=>{e.C=h.velocity+p*h.delta},v=t=>Math.exp(-p*t)*(p*e.C*t-h.velocity)}else{let e=p*Math.sqrt(f*f-1);_=t=>{let n=Math.exp(-m*t),r=Math.min(e*t,300);return h.target-n*((h.velocity+m*h.delta)*Math.sinh(r)+e*h.delta*Math.cosh(r))/e};let t={P:0,sinh:0,cosh:0};y=()=>{t.P=(h.velocity+m*h.delta)/e,t.sinh=m*t.P-h.delta*e,t.cosh=m*h.delta-t.P*e},v=n=>{let r=Math.exp(-m*n),i=Math.min(e*n,300);return r*(t.sinh*Math.sinh(i)+t.cosh*Math.cosh(i))}}y();let b=!Ur(n,Hr)&&Ur(n,Vr),x=d&&l||null,S={calculatedDuration:x,retarget:(e,t)=>{h.target=e[e.length-1],h.delta=h.target-e[0],h.velocity=b?0:-It(t),n.restSpeed&&n.restDelta||g(),S.calculatedDuration=x,a.done=!1,y()},velocity:e=>Ft(v(e)),next:e=>{let t=_(e);if(d)a.done=e>=l;else{let n=Ft(v(e));a.done=Math.abs(n)<=h.restSpeed&&Math.abs(h.target-t)<=h.restDelta}return a.value=a.done?h.target:t,a},toString:()=>{let e=Math.min(Pr(S),Nr),t=Mr(t=>S.next(e*t).value,e,30);return e+`ms `+t},toTransition:()=>{}};return S}Gr.applyToOptions=e=>{let t=Fr(e,100,Gr);return e.ease=t.ease,e.duration=Ft(t.duration),e.type=`keyframes`,e};function Kr({keyframes:e,velocity:t=0,power:n=.8,timeConstant:r=325,bounceDamping:i=10,bounceStiffness:a=500,modifyTarget:o,min:s,max:c,restDelta:l=.5,restSpeed:u}){let d=e[0],f={done:!1,value:d},p=e=>e<s||e>c,m=e=>s===void 0?c:c===void 0||Math.abs(s-e)<Math.abs(c-e)?s:c,h=n*t,g=d+h,_=o===void 0?g:o(g);_!==g&&(h=_-d);let v=e=>-h*Math.exp(-e/r),y=e=>{let t=v(e);f.done=Math.abs(t)<=l,f.value=f.done?_:_+t},b,x,S=e=>{p(f.value)&&(b=e,x=Gr({keyframes:[f.value,m(f.value)],velocity:-v(e)/r*1e3,damping:i,stiffness:a,restDelta:l,restSpeed:u}))};return S(0),{calculatedDuration:null,next:e=>{let t=!1;return!x&&b===void 0&&(t=!0,y(e),S(e)),b!==void 0&&e>=b?x.next(e-b):(!t&&y(e),f)}}}function qr(e,t,n){let r=[],i=n||Et.mix||Ar,a=e.length-1;for(let n=0;n<a;n++){let a=i(e[n],e[n+1]);t&&(a=Mt(Array.isArray(t)?t[n]||jt:t,a)),r.push(a)}return r}function Jr(e,t,{clamp:n=!0,ease:r,mixer:i}={}){let a=e.length;if(t.length,a===1)return()=>t[0];if(a===2&&t[0]===t[1])return()=>t[1];let o=e[0]===e[1];e[0]>e[a-1]&&(e=[...e].reverse(),t=[...t].reverse());let s=qr(t,r,i),c=s.length,l=n=>{if(o&&n<e[0])return t[0];let r=0;if(c>1)for(;r<e.length-2&&!(n<e[r+1]);r++);let i=Nt(e[r],e[r+1],n);return s[r](i)};return n?t=>l(Tt(e[0],e[a-1],t)):l}function Yr(e,t){let n=e[e.length-1];for(let r=1;r<=t;r++){let i=Nt(0,t,r);e.push(mr(n,1,i))}}function Xr(e){let t=[0];return Yr(t,e.length-1),t}function Zr(e,t){return e.map(e=>e*t)}function Qr(e,t){return e.map(()=>t||tn).splice(0,e.length-1)}function $r({duration:e=300,keyframes:t,times:n,ease:r=`easeInOut`}){let i=nn(r)?r.map(cn):cn(r),a={done:!1,value:t[0]};if(t.length===2&&!Array.isArray(i)&&(!n||n.length!==2||n[0]===0&&n[1]===1)){let[n,r]=t,o=n===r?void 0:(Et.mix||Ar)(n,r);return{calculatedDuration:e,next:t=>(a.value=o?o(i(e>0?Tt(0,1,t/e):1)):r,a.done=t>=e,a)}}let o=Jr(Zr(n&&n.length===t.length?n:Xr(t),e),t,{ease:Array.isArray(i)?i:Qr(t,i)});return{calculatedDuration:e,next:t=>(a.value=o(t),a.done=t>=e,a)}}var ei=5;function ti(e,t,n){let r=Math.max(t-ei,0);return Lt(n-e(r),t-r)}function ni(e,t,n=0){return t<=0?n:e.velocity?e.velocity(t):ti(t=>e.next(t).value,t,e.next(t).value)}var ri=e=>e!==null;function ii(e,{repeat:t,repeatType:n=`loop`},r,i=1){let a=e.filter(ri),o=i<0||t&&n!==`loop`&&t%2==1?0:a.length-1;return!o||r===void 0?a[o]:r}var ai={decay:Kr,inertia:Kr,tween:$r,keyframes:$r,spring:Gr};function oi(e){typeof e.type==`string`&&(e.type=ai[e.type])}function si(e,t){return{kind:e,animation:t,timestamp:yn.now(),frameTimestamp:hn.timestamp,frameIsProcessing:hn.isProcessing}}function ci(e,t,n){let r=globalThis.__MOTION_INSPECT__;if(r)try{r({...si(`animation-start`,e),options:n?{...t,...n}:t})}catch{}}var li=class{constructor(){this.isResolved=!1}get finished(){return this._finished||=this.isResolved?Promise.resolve():new Promise(e=>{this._resolve=e}),this._finished}updateFinished(){this._finished=this._resolve=void 0,this.isResolved=!1}notifyFinished(){this.isResolved=!0,this._resolve?.()}then(e,t){return this.finished.then(e,t)}},ui=e=>e/100,di=class extends li{constructor(e){super(),this.state=`idle`,this.startTime=null,this.isStopped=!1,this.currentTime=0,this.holdTime=null,this.playbackSpeed=1,this.delayState={done:!1,value:void 0},this.stop=()=>{let{motionValue:e}=this.options;e&&e.updatedAt!==yn.now()&&this.tick(yn.now()),this.isStopped=!0,this.state!==`idle`&&(this.teardown(),this.options.onStop?.())},this.options=e,this.initAnimation(),this.play(),e.autoplay===!1&&this.pause(),ci(this,this.options)}initAnimation(){let{options:e}=this;oi(e);let{type:t=$r,repeat:n=0,repeatDelay:r=0,repeatType:i,velocity:a=0}=e,{keyframes:o}=e,s=t||$r;s!==$r&&typeof o[0]!=`number`&&(this.mixKeyframes=Mt(ui,Ar(o[0],o[1])),o=[0,100]);let c=s(o===e.keyframes?e:{...e,keyframes:o});i===`mirror`&&(this.mirroredGenerator=s({...e,keyframes:[...o].reverse(),velocity:-a})),c.calculatedDuration===null&&(c.calculatedDuration=Pr(c));let{calculatedDuration:l}=c;this.calculatedDuration=l,this.resolvedDuration=l+r,this.totalDuration=this.resolvedDuration*(n+1)-r,this.generator=c}updateTime(e){let t=Math.round(e-this.startTime)*this.playbackSpeed;this.currentTime=this.holdTime===null?t:this.holdTime}tick(e,t=!1){let{generator:n,totalDuration:r,mixKeyframes:i,mirroredGenerator:a,resolvedDuration:o,calculatedDuration:s}=this;if(this.startTime===null)return n.next(0);let{delay:c=0,keyframes:l,repeat:u,repeatType:d,repeatDelay:f,type:p,onUpdate:m,finalKeyframe:h}=this.options;this.speed>0?this.startTime=Math.min(this.startTime,e):this.speed<0&&(this.startTime=Math.min(e-r/this.speed,this.startTime)),t?this.currentTime=e:this.updateTime(e);let g=this.currentTime-c*(this.playbackSpeed>=0?1:-1),_=this.playbackSpeed>=0?g<0:g>r;this.currentTime=Math.max(g,0),this.state===`finished`&&this.holdTime===null&&(this.currentTime=r);let v=this.currentTime,y=n;if(u){let e=Math.min(this.currentTime,r)/o,t=Math.floor(e),n=e%1;!n&&e>=1&&(n=1),n===1&&t--,t=Math.min(t,u+1),t%2&&(d===`reverse`?(n=1-n,f&&(n-=f/o)):d===`mirror`&&(y=a)),v=Tt(0,1,n)*o}let b;_?(this.delayState.value=l[0],b=this.delayState):b=y.next(v),i&&!_&&(b.value=i(b.value));let{done:x}=b;!_&&s!==null&&(x=this.playbackSpeed>=0?this.currentTime>=r:this.currentTime<=0);let S=this.holdTime===null&&(this.state===`finished`||this.state===`running`&&x);return S&&p!==Kr&&(b.value=ii(l,this.options,h,this.speed)),m&&m(b.value),S&&this.finish(),b}then(e,t){return this.finished.then(e,t)}get duration(){return It(this.calculatedDuration)}get iterationDuration(){let{delay:e=0}=this.options||{};return this.duration+It(e)}get time(){return It(this.currentTime)}set time(e){e=Ft(e),this.currentTime=e,this.startTime===null||this.holdTime!==null||this.playbackSpeed===0?this.holdTime=e:this.driver&&(this.startTime=this.driver.now()-e/this.playbackSpeed),this.driver?this.driver.start(!1):(this.startTime=0,this.state=`paused`,this.holdTime=e,this.tick(e))}getGeneratorVelocity(){return ni(this.generator,this.currentTime,this.options.velocity)}get speed(){return this.playbackSpeed}set speed(e){let t=this.playbackSpeed!==e;t&&this.driver&&this.updateTime(yn.now()),this.playbackSpeed=e,t&&this.driver&&(this.time=It(this.currentTime))}play(){if(this.isStopped)return;let{driver:e=jr,startTime:t}=this.options;this.driver||=e(e=>this.tick(e)),this.options.onPlay?.();let n=this.driver.now();this.state===`finished`?(this.updateFinished(),this.startTime=n):this.holdTime===null?this.startTime||=t??n:this.startTime=n-this.holdTime,this.state===`finished`&&this.speed<0&&(this.startTime+=this.calculatedDuration),this.holdTime=null,this.state=`running`,this.driver.start()}pause(){this.state=`paused`,this.updateTime(yn.now()),this.holdTime=this.currentTime}complete(){this.state!==`running`&&this.play(),this.state=`finished`,this.holdTime=null}finish(){this.notifyFinished(),this.teardown(),this.state=`finished`,this.options.onComplete?.()}cancel(){this.holdTime=null,this.startTime=0,this.tick(0),this.teardown(),this.options.onCancel?.()}teardown(){this.state=`idle`,this.stopDriver(),this.startTime=this.holdTime=null}stopDriver(){this.driver&&=(this.driver.stop(),void 0)}sample(e){return this.startTime=0,this.tick(e,!0)}attachTimeline(e){return this.options.allowFlatten&&(this.options.type=`keyframes`,this.options.ease=`linear`,this.initAnimation()),this.driver?.stop(),e.observe(this)}},fi=new Set([`brightness`,`contrast`,`saturate`,`opacity`]);function pi(e){let[t,n]=e.slice(0,-1).split(`(`);if(t===`drop-shadow`)return e;let[r]=n.match(On)||[];if(!r)return e;let i=n.replace(r,``),a=+!!fi.has(t);return r!==n&&(a*=100),t+`(`+a+i+`)`}var mi=/\b([a-z-]*)\(.*?\)/gu,hi={...ur,getAnimatableNone:e=>{let t=e.match(mi);return t?t.map(pi).join(` `):e}},gi={...ur,getAnimatableNone:e=>{let t=ur.parse(e);return ur.createTransformer(e)(t.map(e=>typeof e==`number`?0:typeof e==`object`?{...e,alpha:1}:e))}},_i={...Tn,transform:Math.round},vi={rotate:zn,pathRotation:zn,rotateX:zn,rotateY:zn,rotateZ:zn,scale:Dn,scaleX:Dn,scaleY:Dn,scaleZ:Dn,skew:zn,skewX:zn,skewY:zn,distance:G,translateX:G,translateY:G,translateZ:G,x:G,y:G,z:G,perspective:G,transformPerspective:G,opacity:En,originX:Un,originY:Un,originZ:G},yi={borderWidth:G,borderTopWidth:G,borderRightWidth:G,borderBottomWidth:G,borderLeftWidth:G,borderRadius:G,borderTopLeftRadius:G,borderTopRightRadius:G,borderBottomRightRadius:G,borderBottomLeftRadius:G,width:G,maxWidth:G,height:G,maxHeight:G,top:G,right:G,bottom:G,left:G,inset:G,insetBlock:G,insetBlockStart:G,insetBlockEnd:G,insetInline:G,insetInlineStart:G,insetInlineEnd:G,padding:G,paddingTop:G,paddingRight:G,paddingBottom:G,paddingLeft:G,paddingBlock:G,paddingBlockStart:G,paddingBlockEnd:G,paddingInline:G,paddingInlineStart:G,paddingInlineEnd:G,margin:G,marginTop:G,marginRight:G,marginBottom:G,marginLeft:G,marginBlock:G,marginBlockStart:G,marginBlockEnd:G,marginInline:G,marginInlineStart:G,marginInlineEnd:G,fontSize:G,backgroundPositionX:G,backgroundPositionY:G,...vi,zIndex:_i,fillOpacity:En,strokeOpacity:En,numOctaves:_i},bi={...yi,color:Gn,backgroundColor:Gn,outlineColor:Gn,fill:Gn,stroke:Gn,borderColor:Gn,borderTopColor:Gn,borderRightColor:Gn,borderBottomColor:Gn,borderLeftColor:Gn,filter:hi,WebkitFilter:hi,mask:gi,WebkitMask:gi},xi=e=>bi[e],Si=new Set([hi,gi]);function Ci(e,t){let n=xi(e);return Si.has(n)||(n=ur),n.getAnimatableNone?n.getAnimatableNone(t):void 0}function wi(e){for(let t=1;t<e.length;t++)e[t]??(e[t]=e[t-1])}var Ti=e=>e*180/Math.PI,Ei=e=>Oi(Ti(Math.atan2(e[1],e[0]))),Di={x:4,y:5,translateX:4,translateY:5,scaleX:0,scaleY:3,scale:e=>(Math.abs(e[0])+Math.abs(e[3]))/2,rotate:Ei,rotateZ:Ei,skewX:e=>Ti(Math.atan(e[1])),skewY:e=>Ti(Math.atan(e[2])),skew:e=>(Math.abs(e[1])+Math.abs(e[2]))/2},Oi=e=>(e%=360,e<0&&(e+=360),e),ki=Ei,Ai=e=>Math.sqrt(e[0]*e[0]+e[1]*e[1]),ji=e=>Math.sqrt(e[4]*e[4]+e[5]*e[5]),Mi={x:12,y:13,z:14,translateX:12,translateY:13,translateZ:14,scaleX:Ai,scaleY:ji,scale:e=>(Ai(e)+ji(e))/2,rotateX:e=>Oi(Ti(Math.atan2(e[6],e[5]))),rotateY:e=>Oi(Ti(Math.atan2(-e[2],e[0]))),rotateZ:ki,rotate:ki,skewX:e=>Ti(Math.atan(e[4])),skewY:e=>Ti(Math.atan(e[1])),skew:e=>(Math.abs(e[1])+Math.abs(e[4]))/2};function Ni(e){return+!!e.includes(`scale`)}function Pi(e,t){if(!e||e===`none`)return Ni(t);let n=e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u),r,i;if(n)r=Mi,i=n;else{let t=e.match(/^matrix\(([-\d.e\s,]+)\)$/u);r=Di,i=t}if(!i)return Ni(t);let a=r[t],o=i[1].split(`,`).map(Ii);return typeof a==`function`?a(o):o[a]}var Fi=(e,t)=>{let{transform:n=`none`}=getComputedStyle(e);return Pi(n,t)};function Ii(e){return parseFloat(e.trim())}var Li=[`transformPerspective`,`x`,`y`,`z`,`translateX`,`translateY`,`translateZ`,`scale`,`scaleX`,`scaleY`,`rotate`,`rotateX`,`rotateY`,`rotateZ`,`skew`,`skewX`,`skewY`],Ri=new Set([...Li,`pathRotation`]),zi=e=>e===Tn||e===G,Bi=new Set([`x`,`y`,`z`]),Vi=Li.filter(e=>!Bi.has(e));function Hi(e){let t=[];return Vi.forEach(n=>{let r=e.getValue(n);if(r!==void 0){let e=r.get(),i=+!!n.startsWith(`scale`);if(e===i)return;t.push([n,e]),r.set(i)}}),t}var Ui=new Set([`bottom`,`right`]);function Wi(e,t,n,r,i,a){let o=parseFloat(e);if(!isNaN(o))return o;let{min:s,max:c}=t()[n],l=c-s;return a===`border-box`?l:l-parseFloat(r)-parseFloat(i)}var Gi={width:({width:e,paddingLeft:t=`0`,paddingRight:n=`0`,boxSizing:r},i)=>Wi(e,i,`x`,t,n,r),height:({height:e,paddingTop:t=`0`,paddingBottom:n=`0`,boxSizing:r},i)=>Wi(e,i,`y`,t,n,r),top:({top:e})=>parseFloat(e),left:({left:e})=>parseFloat(e),bottom:({top:e},t)=>{let{y:n}=t();return parseFloat(e)+(n.max-n.min)},right:({left:e},t)=>{let{x:n}=t();return parseFloat(e)+(n.max-n.min)},x:({transform:e})=>Pi(e,`x`),y:({transform:e})=>Pi(e,`y`)};Gi.translateX=Gi.x,Gi.translateY=Gi.y;var Ki=new Set,qi=!1,Ji=!1,Yi=!1;function Xi(){if(Ji){let e=[],t=new Set,n=new Set;Ki.forEach(r=>{r.needsMeasurement&&(e.push(r),t.add(r.element),Ui.has(r.name)&&n.add(r.element))});let r=new Map;n.forEach(e=>{let t=Hi(e);t.length&&(r.set(e,t),e.render())}),e.forEach(e=>e.measureInitialState()),t.forEach(e=>{e.render();let t=r.get(e);t&&t.forEach(([t,n])=>{e.getValue(t)?.set(n)})}),e.forEach(e=>e.measureEndState()),e.forEach(e=>{e.suspendedScrollY!==void 0&&window.scrollTo(0,e.suspendedScrollY)})}Ji=!1,qi=!1,Ki.forEach(e=>e.complete(Yi)),Ki.clear()}function Zi(){Ki.forEach(e=>{e.readKeyframes(),e.needsMeasurement&&(Ji=!0)})}function Qi(){Yi=!0,Zi(),Xi(),Yi=!1}function $i(e,t,n){if(typeof e==`string`){if(Dt(e)||kt(e))return parseFloat(e);if(!ur.test(e)&&ur.test(n))return Ci(t,n)}return e??void 0}var ea=class{constructor(e,t,n,r,i,a=!1){this.state=`pending`,this.isAsync=!1,this.needsMeasurement=!1,this.unresolvedKeyframes=[...e],this.onComplete=t,this.name=n,this.motionValue=r,this.element=i,this.isAsync=a}scheduleResolve(){this.state=`scheduled`,this.isAsync?(Ki.add(this),qi||(qi=!0,pn.read(Zi),pn.resolveKeyframes(Xi))):(this.readKeyframes(),this.complete())}readKeyframes(){let{unresolvedKeyframes:e,name:t,element:n,motionValue:r}=this;if(e[0]===null){let i=r?.get(),a=e[e.length-1];if(i!==void 0)e[0]=i;else if(n&&t){let r=$i(n.readValue(t,a),t,a);r!==void 0&&(e[0]=r)}e[0]===void 0&&(e[0]=a),r&&i===void 0&&r.set(e[0])}wi(e)}setFinalKeyframe(){}measureInitialState(){}renderEndStyles(){}measureEndState(){}complete(e=!1){this.state=`complete`,this.onComplete(this.unresolvedKeyframes,this.finalKeyframe,e),Ki.delete(this)}cancel(){this.state===`scheduled`&&(Ki.delete(this),this.state=`pending`)}resume(){this.state===`pending`&&this.scheduleResolve()}},ta=e=>e.startsWith(`--`);function na(e,t,n){ta(t)?e.style.setProperty(t,n):e.style[t]=n}var ra={};function ia(e,t){let n=At(e);return()=>ra[t]??n()}var aa=ia(()=>window.ScrollTimeline!==void 0,`scrollTimeline`),oa=ia(()=>{try{document.createElement(`div`).animate({opacity:0},{easing:`linear(0, 1)`})}catch{return!1}return!0},`linearEasing`),sa=([e,t,n,r])=>`cubic-bezier(${e}, ${t}, ${n}, ${r})`,ca={linear:`linear`,ease:`ease`,easeIn:`ease-in`,easeOut:`ease-out`,easeInOut:`ease-in-out`,circIn:sa([0,.65,.55,1]),circOut:sa([.55,0,1,.45]),backIn:sa([.31,.01,.66,-.59]),backOut:sa([.33,1.53,.69,.99])};function la(e,t){if(e)return typeof e==`function`?oa()?Mr(e,t):`ease-out`:an(e)?sa(e):Array.isArray(e)?e.map(e=>la(e,t)||ca.easeOut):ca[e]}function ua(e,t,n,{delay:r=0,duration:i=300,repeat:a=0,repeatType:o=`loop`,ease:s=`easeOut`,times:c}={},l=void 0){let u={[t]:n};c&&(u.offset=c);let d=la(s,i);Array.isArray(d)&&(u.easing=d);let f={delay:r,duration:i,easing:Array.isArray(d)?`linear`:d,fill:`both`,iterations:a+1,direction:o===`reverse`?`alternate`:`normal`};return l&&(f.pseudoElement=l),e.animate(u,f)}function da(e){return typeof e==`function`&&`applyToOptions`in e}function fa({type:e,...t}){return da(e)&&oa()?e.applyToOptions(t):(t.duration??=300,t.ease??=`easeOut`,t)}var pa=class extends li{constructor(e){if(super(),this.finishedTime=null,this.isStopped=!1,this.manualStartTime=null,!e)return;let{element:t,name:n,keyframes:r,pseudoElement:i,allowFlatten:a=!1,finalKeyframe:o,onComplete:s}=e;this.isPseudoElement=!!i,this.allowFlatten=a,this.options=e,e.type;let c=fa(e);this.animation=ua(t,n,r,c,i),c.autoplay===!1&&this.animation.pause(),this.animation.onfinish=()=>{if(this.finishedTime=this.time,!i){let e=ii(r,this.options,o,this.speed);this.updateMotionValue&&this.updateMotionValue(e),na(t,n,e),this.animation.cancel()}s?.(),this.notifyFinished()},ci(this,e,c)}play(){this.isStopped||(this.manualStartTime=null,this.animation.play(),this.state===`finished`&&this.updateFinished())}pause(){this.animation.pause()}complete(){this.animation.finish?.()}cancel(){try{this.animation.cancel()}catch{}}stop(){if(this.isStopped)return;this.isStopped=!0;let{state:e}=this;e===`idle`||e===`finished`||(this.updateMotionValue?this.updateMotionValue():this.commitStyles(),this.isPseudoElement||this.cancel())}commitStyles(){let e=this.options?.element;!this.isPseudoElement&&e?.isConnected&&this.animation.commitStyles?.()}get duration(){let e=this.animation.effect?.getComputedTiming?.().duration||0;return It(Number(e))}get iterationDuration(){let{delay:e=0}=this.options||{};return this.duration+It(e)}get time(){return It(Number(this.animation.currentTime)||0)}set time(e){let t=this.finishedTime!==null;this.manualStartTime=null,this.finishedTime=null,this.animation.currentTime=Ft(e),t&&this.animation.pause()}get speed(){return this.animation.playbackRate}set speed(e){e<0&&(this.finishedTime=null),this.animation.playbackRate=e}get state(){return this.finishedTime===null?this.animation.playState:`finished`}get startTime(){return this.manualStartTime??Number(this.animation.startTime)}set startTime(e){this.manualStartTime=this.animation.startTime=e}attachTimeline({timeline:e,rangeStart:t,rangeEnd:n,observe:r}){return this.allowFlatten&&this.animation.effect?.updateTiming({easing:`linear`}),this.animation.onfinish=null,e&&aa()?(this.animation.timeline=e,t&&(this.animation.rangeStart=t),n&&(this.animation.rangeEnd=n),jt):r(this)}},ma={anticipate:Yt,backInOut:Jt,circInOut:Qt};function ha(e){return e in ma}function ga(e){typeof e.ease==`string`&&ha(e.ease)&&(e.ease=ma[e.ease])}var _a=10,va=class extends pa{constructor(e){ga(e),oi(e),super(e),e.startTime!==void 0&&e.autoplay!==!1&&(this.startTime=e.startTime),this.options=e}updateMotionValue(e){let{motionValue:t,onUpdate:n,onComplete:r,element:i,...a}=this.options;if(!t)return;if(e!==void 0){t.set(e);return}let o=new di({...a,autoplay:!1}),s=Math.max(_a,yn.now()-this.startTime),c=Tt(0,_a,s-_a),l=o.sample(s).value,{name:u}=this.options;i&&u&&na(i,u,l),t.setWithVelocity(o.sample(Math.max(0,s-c)).value,l,c),o.stop()}},ya=(e,t)=>t!==`zIndex`&&!!(typeof e==`number`||Array.isArray(e)||typeof e==`string`&&(ur.test(e)||e===`0`)&&!e.startsWith(`url(`));function ba(e){let t=e[0];if(e.length===1)return!0;for(let n=0;n<e.length;n++)if(e[n]!==t)return!0}function xa(e,t,n,r){let i=e[0];if(i===null)return!1;if(t===`display`||t===`visibility`)return!0;let a=e[e.length-1],o=ya(i,t),s=ya(a,t);return!o||!s?(o!==s&&`${t}${i}${a}${o?a:i}`,!1):ba(e)||(n===`spring`||da(n))&&r}function Sa(e){e.duration=0,e.type=`keyframes`}var Ca=new Set([`opacity`,`clipPath`,`filter`,`transform`,`backgroundColor`]),wa=/^(?:oklch|oklab|lab|lch|color|color-mix|light-dark)\(/;function Ta(e){for(let t=0;t<e.length;t++)if(typeof e[t]==`string`&&wa.test(e[t]))return!0;return!1}var Ea=new Set([`color`,`backgroundColor`,`outlineColor`,`fill`,`stroke`,`borderColor`,`borderTopColor`,`borderRightColor`,`borderBottomColor`,`borderLeftColor`]),Da=At(()=>Object.hasOwnProperty.call(Element.prototype,`animate`));function Oa(e){let{motionValue:t,name:n,repeatDelay:r,repeatType:i,damping:a,type:o,keyframes:s}=e;if(!n||!(Ca.has(n)||Ea.has(n)))return!1;let c=t?.owner?.current;if(!(c instanceof HTMLElement)&&!(c instanceof SVGElement))return!1;let{onUpdate:l,transformTemplate:u}=t.owner.getProps();return Da()&&(Ca.has(n)||Ea.has(n)&&Ta(s))&&(n!==`transform`||!u)&&!l&&!r&&i!==`mirror`&&a!==0&&o!==`inertia`}var ka=40,Aa=class extends li{constructor(e){super(),this.stop=()=>{this._animation&&(this._animation.stop(),this.stopTimeline?.()),this.keyframeResolver?.cancel()},this.createdAt=yn.now();let{keyframes:t,name:n,motionValue:r,element:i}=e,a=e;a.autoplay??=!0,a.delay??=0,a.type??=`keyframes`,a.repeat??=0,a.repeatDelay??=0,a.repeatType??=`loop`;let o=i?.KeyframeResolver||ea;this.keyframeResolver=new o(t,(e,t,n)=>this.onKeyframesResolved(e,t,a,!n),n,r,i),this.keyframeResolver?.scheduleResolve()}onKeyframesResolved(e,t,n,r){this.keyframeResolver=void 0;let{name:i,type:a,velocity:o,delay:s,isHandoff:c,onUpdate:l}=n;this.resolvedAt=yn.now();let u=!0;xa(e,i,a,o)||(u=!1,(Et.instantAnimations||!s)&&l?.(ii(e,n,t)),e[0]=e[e.length-1],Sa(n),n.repeat=0);let d=r?this.resolvedAt&&this.resolvedAt-this.createdAt>ka?this.resolvedAt:this.createdAt:void 0,{onComplete:f}=n;n.startTime??=d,n.finalKeyframe=t,n.keyframes=e,n.onComplete=()=>{f?.(),this.notifyFinished()};let p=u&&!c&&Oa(n),m;if(p){n.element=n.motionValue?.owner?.current;try{m=new va(n)}catch{m=new di(n)}}else m=new di(n);this.pendingTimeline&&=(this.stopTimeline=m.attachTimeline(this.pendingTimeline),void 0),this._animation=m}get finished(){return this._animation?this._animation.finished:super.finished}then(e,t){return this.finished.finally(e).then(()=>{})}get animation(){return this._animation||(this.keyframeResolver?.resume(),Qi()),this._animation}get duration(){return this.animation.duration}get iterationDuration(){return this.animation.iterationDuration}get time(){return this.animation.time}set time(e){this.animation.time=e}get speed(){return this.animation.speed}get state(){return this.animation.state}set speed(e){this.animation.speed=e}get startTime(){return this.animation.startTime}attachTimeline(e){return this._animation?this.stopTimeline=this.animation.attachTimeline(e):this.pendingTimeline=e,()=>this.stop()}play(){this.animation.play()}pause(){this.animation.pause()}complete(){this.animation.complete()}cancel(){this._animation&&this.animation.cancel(),this.keyframeResolver?.cancel()}},ja=class{constructor(e){this.stop=()=>this.runAll(`stop`),this.animations=e.filter(Boolean)}get finished(){return Promise.all(this.animations.map(e=>e.finished))}getAll(e){return this.animations[0][e]}setAll(e,t){for(let n=0;n<this.animations.length;n++)this.animations[n][e]=t}attachTimeline(e){let t=this.animations.map(t=>t.attachTimeline(e));return()=>{t.forEach((e,t)=>{e&&e(),this.animations[t].stop()})}}get time(){return this.getAll(`time`)}set time(e){this.setAll(`time`,e)}get speed(){return this.getAll(`speed`)}set speed(e){this.setAll(`speed`,e)}get state(){return this.getAll(`state`)}get startTime(){return this.getAll(`startTime`)}get duration(){return Ma(this.animations,`duration`)}get iterationDuration(){return Ma(this.animations,`iterationDuration`)}runAll(e){this.animations.forEach(t=>t[e]())}play(){this.runAll(`play`)}pause(){this.runAll(`pause`)}cancel(){this.runAll(`cancel`)}complete(){this.runAll(`complete`)}};function Ma(e,t){let n=0;for(let r=0;r<e.length;r++){let i=e[r][t];i!==null&&i>n&&(n=i)}return n}var Na=class extends ja{then(e,t){return this.finished.finally(e).then(()=>{})}},Pa=30,Fa=e=>!isNaN(parseFloat(e)),Ia={current:void 0},La=class{constructor(e,t={}){this.canTrackVelocity=null,this.events={},this.updateAndNotify=e=>{let t=yn.now();if(this.updatedAt!==t&&this.setPrevFrameValue(),this.prev=this.current,this.setCurrent(e),this.current!==this.prev&&(this.notifyChange(),this.dependents))for(let e of this.dependents)e.dirty()},this.hasAnimated=!1,this.setCurrent(e),this.owner=t.owner}setCurrent(e){this.current=e,this.updatedAt=yn.now(),this.canTrackVelocity===null&&e!==void 0&&(this.canTrackVelocity=Fa(this.current))}setPrevFrameValue(e=this.current){this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt}onChange(e){return this.on(`change`,e)}on(e,t){var n;return e===`change`?this.onChangeSubscribe(t):((n=this.events)[e]||(n[e]=new Pt)).add(t)}onChangeSubscribe(e){let{events:t}=this;return!t.change&&!this.changeSubscriber?this.changeSubscriber=e:(t.change||(t.change=new Pt,t.change.add(this.changeSubscriber),this.changeSubscriber=void 0),t.change.add(e)),()=>{this.changeSubscriber===e?this.changeSubscriber=void 0:t.change?.remove(e),this.stopIfUnobserved()}}stopIfUnobserved(){pn.read(()=>{!this.changeSubscriber&&!this.events.change?.getSize()&&this.stop()})}clearListeners(){this.changeSubscriber=void 0;for(let e in this.events)this.events[e].clear()}attach(e,t){this.passiveEffect=e,this.stopPassiveEffect=t}set(e){this.passiveEffect?this.passiveEffect(e,this.updateAndNotify):this.updateAndNotify(e)}setWithVelocity(e,t,n){this.set(t),this.prev=void 0,this.prevFrameValue=e,this.prevUpdatedAt=this.updatedAt-n}jump(e,t=!0){this.updateAndNotify(e),this.prev=e,this.prevUpdatedAt=this.prevFrameValue=void 0,t&&this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}dirty(){this.notifyChange()}notifyChange(){let{current:e,changeSubscriber:t}=this;t?t(e):this.events.change?.notify(e)}addDependent(e){this.dependents||=new Set,this.dependents.add(e)}removeDependent(e){this.dependents&&this.dependents.delete(e)}get(){return Ia.current&&Ia.current.push(this),this.current}getPrevious(){return this.prev}getVelocity(){let e=yn.now();if(!this.canTrackVelocity||this.prevFrameValue===void 0||e-this.updatedAt>Pa)return 0;let t=Math.min(this.updatedAt-this.prevUpdatedAt,Pa);return Lt(parseFloat(this.current)-parseFloat(this.prevFrameValue),t)}start(e){return this.stop(),new Promise(t=>{this.hasAnimated=!0;let n=!1,r;r=e(()=>{n=!0,this.events.animationComplete?.notify(),this.animation===r&&this.clearAnimation(),t()}),n||(this.animation=r),this.events.animationStart?.notify()})}stop(){this.animation&&(this.animation.stop(),this.events.animationCancel&&this.events.animationCancel.notify()),this.clearAnimation()}isAnimating(){return!!this.animation}clearAnimation(){this.animation=void 0}destroy(){this.dependents?.clear(),this.events.destroy?.notify(),this.clearListeners(),this.stop(),this.stopPassiveEffect&&this.stopPassiveEffect()}};function Ra(e,t){return new La(e,t)}function za(e,t){if(e?.inherit&&t){let{inherit:n,...r}=e;return{...t,...r}}return e}function Ba(e,t){let n=e?.[t]??e?.default??e;return n===e?n:za(n,e)}var Va={type:`spring`,stiffness:500,damping:25,restSpeed:10},Ha=e=>({type:`spring`,stiffness:550,damping:e===0?2*Math.sqrt(550):30,restSpeed:10}),Ua={type:`keyframes`,duration:.8},Wa={type:`keyframes`,ease:[.25,.1,.35,1],duration:.3},Ga=(e,{keyframes:t})=>t.length>2?Ua:Ri.has(e)?e.startsWith(`scale`)?Ha(t[1]):Va:Wa,Ka=new Set([`when`,`delay`,`delayChildren`,`staggerChildren`,`staggerDirection`,`repeat`,`repeatType`,`repeatDelay`,`from`,`elapsed`]);function qa(e){for(let t in e)if(!Ka.has(t))return!0;return!1}var Ja=(e,t,n,r={},i,a)=>o=>{let s=Ba(r,e)||{},c=s.delay||r.delay||0,{elapsed:l=0}=r;l-=Ft(c);let u={keyframes:Array.isArray(n)?n:[null,n],ease:`easeOut`,velocity:t.getVelocity(),...s,delay:-l,onUpdate:e=>{t.set(e),s.onUpdate&&s.onUpdate(e)},onComplete:()=>{o(),s.onComplete&&s.onComplete()},name:e,motionValue:t,element:a?void 0:i};qa(s)||Object.assign(u,Ga(e,u)),u.duration&&=Ft(u.duration),u.repeatDelay&&=Ft(u.repeatDelay),u.from!==void 0&&(u.keyframes[0]=u.from);let d=!1;if((u.type===!1||u.duration===0&&!u.repeatDelay)&&(Sa(u),u.delay===0&&(d=!0)),(Et.instantAnimations||Et.skipAnimations||i?.shouldSkipAnimations||s.skipAnimations)&&(d=!0,Sa(u),u.delay=0),u.allowFlatten=!s.type&&!s.ease,d&&!a&&t.get()!==void 0){let e=ii(u.keyframes,s);if(e!==void 0){pn.update(()=>{u.onUpdate(e),u.onComplete()});return}}return s.isSync?new di(u):new Aa(u)},Ya=/^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;function Xa(e){let t=Ya.exec(e);if(!t)return[,];let[,n,r,i]=t;return[`--${n??r}`,i]}function Za(e,t,n=1){`${e}`;let[r,i]=Xa(e);if(!r)return;let a=window.getComputedStyle(t).getPropertyValue(r);if(a){let e=a.trim();return Dt(e)?parseFloat(e):e}return Sn(i)?Za(i,t,n+1):i}var Qa=new Set([`width`,`height`,`top`,`left`,`right`,`bottom`,...Li]),$a=e=>!!(e&&e.getVelocity);function eo(e){return e.replace(/([A-Z])/g,e=>`-${e.toLowerCase()}`)}var to={test:e=>e===`auto`,parse:e=>e},no=e=>t=>t.test(e),ro=[Tn,G,Bn,zn,Hn,Vn,to],io=e=>ro.find(no(e));function ao(e){return typeof e==`number`?e===0:e===null||e===`none`||e===`0`||kt(e)}var oo=new Set([`auto`,`none`,`0`]);function so(e,t,n){let r=0,i;for(;r<e.length&&!i;){let t=e[r];typeof t==`string`&&!oo.has(t)&&nr(t)&&(i=e[r]),r++}if(i&&n)for(let r of t)e[r]!==i&&(e[r]=Ci(n,i))}var co=class extends ea{constructor(e,t,n,r,i){super(e,t,n,r,i,!0)}readKeyframes(){let{unresolvedKeyframes:e,element:t,name:n}=this;if(!t||!t.current)return;super.readKeyframes();for(let n=0;n<e.length;n++){let r=e[n];if(typeof r==`string`&&(r=r.trim(),Sn(r))){let i=Za(r,t.current);i!==void 0&&(e[n]=i),n===e.length-1&&(this.finalKeyframe=r)}}if(this.resolveNoneKeyframes(),!Qa.has(n)||e.length!==2)return;let[r,i]=e;if(typeof r==`number`&&typeof i==`number`)return;let a=io(r),o=io(i);if(wn(r)!==wn(i)&&Gi[n])this.needsMeasurement=!0;else if(a!==o){if(zi(a)&&zi(o))for(let t=0;t<e.length;t++){let n=e[t];typeof n==`string`&&(e[t]=parseFloat(n))}else Gi[n]&&(this.needsMeasurement=!0)}}resolveNoneKeyframes(){let{unresolvedKeyframes:e,name:t}=this,n=[];for(let t=0;t<e.length;t++)(e[t]===null||ao(e[t]))&&n.push(t);n.length&&so(e,n,t)}measure(){let{element:e,name:t}=this;return Gi[t](window.getComputedStyle(e.current),()=>e.measureViewportBox())}measureInitialState(){let{element:e,unresolvedKeyframes:t,name:n}=this;if(!e||!e.current)return;n===`height`&&(this.suspendedScrollY=window.pageYOffset),this.measuredOrigin=this.measure(),t[0]=this.measuredOrigin;let r=t[t.length-1];r!==void 0&&this.motionValue?.jump(r,!1)}measureEndState(){let{element:e,unresolvedKeyframes:t}=this;if(!e||!e.current)return;this.motionValue?.jump(this.measuredOrigin,!1);let n=t.length-1,r=t[n];t[n]=this.measure(),r!==null&&this.finalKeyframe===void 0&&(this.finalKeyframe=r),this.removedTransforms?.length&&this.removedTransforms.forEach(([t,n])=>{e.getValue(t).set(n)}),this.resolveNoneKeyframes()}},lo=[];function uo(e){typeof e.test==`function`&&e.read,fo(e),lo.unshift(e)}function fo(e){wt(lo,e)}function po(e){return lo.find(t=>t.test(e))}function mo(e,t,n={},r){let i=[],{velocity:a}=n,o=n.reduceMotion??r?.shouldReduceMotion;for(let s in t){if(s===`transition`||s===`transitionEnd`)continue;let c=t[s];if(c===void 0)continue;let l=e(s),u=l.get();u!==void 0&&!l.isAnimating()&&!Array.isArray(c)&&c===u&&!a?pn.update(()=>l.set(c)):(l.start(Ja(s,l,c,o&&Qa.has(s)?{type:!1}:n,r)),l.animation&&i.push(l.animation))}let{transitionEnd:s}=t;if(s){let t=()=>pn.update(()=>{for(let t in s)e(t).set(s[t])});i.length?Promise.all(i).then(t):t()}return i}function ho(e,t,n,r,i){return mo(r=>{let a=e.get(t,r);if(!a){let o;if(!i){let i=n[r];o=go(i)??e.read(t,r,i),`${r}`}a=Ra(o,{owner:i}),e(t,{[r]:a})}return a},n,r,i)}function go(e){let t=Array.isArray(e)?e[0]:void 0;return t===null?void 0:t}function _o(e){return Ot(e)&&`offsetHeight`in e&&!(`ownerSVGElement`in e)}function vo(e){return Ot(e)&&`ownerSVGElement`in e}var yo=(e,t)=>t&&typeof e==`number`?t.transform(e):e;function bo(e,t,n){if(e==null)return[];if(e instanceof EventTarget)return[e];if(typeof e==`string`){let r=document;t&&(r=t.current);let i=n?.[e]??r.querySelectorAll(e);return i?Array.from(i):[]}return Array.from(e).filter(e=>e!=null)}var xo=class{constructor(e=pn.render){this.step=e,this.values=new Map,this.pending=[],this.numPending=0,this.flush=()=>{let{pending:e,numPending:t}=this;this.numPending=0;for(let n=0;n<t;n++)e[n]()}}set(e,t,n,r){if(this.values.get(e)?.onRemove(),r)for(let e of this.values.values())e.value===r&&(n=e.render);let i=()=>n&&this.schedule(n);t.get()!==void 0&&i();let a=t.on(`change`,i),o=()=>{a(),n&&!r&&this.cancel(n),this.values.delete(e)};return this.values.set(e,{value:t,render:r?void 0:n,onRemove:o}),o}get(e){return this.values.get(e)?.value}release(){let e=new Map;return this.values.forEach((t,n)=>{e.set(n,t.value),t.onRemove()}),this.transformKeys=this.transformValues=void 0,e}schedule(e){let{pending:t,numPending:n}=this;for(let r=0;r<n;r++)if(t[r]===e)return;n||this.step(this.flush),t[this.numPending++]=e}cancel(e){let{pending:t}=this;for(let n=0;n<this.numPending;n++)if(t[n]===e){t[n]=t[--this.numPending];return}}};function So(e,{step:t,...n}={}){let r=new WeakMap;return Object.assign((n,i)=>{let a=r.get(n)??new xo(t);r.set(n,a);let o=[];for(let t in i){let r=i[t],s=e(n,a,t,r);o.push(s)}return()=>{for(let e of o)e()}},n,{get:(e,t)=>r.get(e)?.get(t),flush:e=>r.get(e)?.flush(),state:e=>r.get(e)})}var Co={x:`translateX`,y:`translateY`,z:`translateZ`,transformPerspective:`perspective`},wo={};function To(e){let t=``,{transformKeys:n=[],transformValues:r={}}=e;for(let e=0;e<n.length;e++){let i=n[e],a=r[i].get();a!==void 0&&(typeof a==`number`?a:parseFloat(a))!==+!!i.startsWith(`scale`)&&(t+=(t&&` `)+(wo[i]||(wo[i]=(Co[i]||i)+`(`))+yo(a,vi[i])+`)`)}let i=e.get(`pathRotation`)?.get();return i&&(t+=(t&&` `)+`rotate(`+yo(i,vi.pathRotation)+`)`),t||`none`}var Eo=new Set([`originX`,`originY`,`originZ`]),Do=(e,t)=>yo(e.get(t)?.get(),yi[t]),Oo=(e,t,n,r)=>{let i,a;if(Ri.has(n)){if(n!==`pathRotation`){let e=t.transformKeys??=[];(t.transformValues??={})[n]=r,e.includes(n)||(e.push(n),e.sort((e,t)=>Li.indexOf(e)-Li.indexOf(t)))}t.get(`transform`)||(!_o(e)&&!t.get(`transformBox`)&&Oo(e,t,`transformBox`,new La(`fill-box`)),t.set(`transform`,new La(`none`),()=>{e.style.transform=To(t)})),a=t.get(`transform`)}else Eo.has(n)?(t.get(`transformOrigin`)||t.set(`transformOrigin`,new La(``),()=>{let n=Do(t,`originX`)??`50%`,r=Do(t,`originY`)??`50%`,i=Do(t,`originZ`)??0;e.style.transformOrigin=`${n} ${r} ${i}`}),a=t.get(`transformOrigin`)):i=ta(n)?()=>{e.style.setProperty(n,r.get())}:()=>{e.style[n]=yo(r.get(),yi[n])};return t.set(n,r,i,a)},ko=e=>_o(e)||vo(e),Ao=(e,t)=>{if(Ri.has(t))return Fi(e,t);let n=getComputedStyle(e),r=ta(t)?n.getPropertyValue(t):n[t];return typeof r==`string`&&r.trim()||0},jo=So(Oo,{test:ko,read:Ao}),Mo=[`transform`,`opacity`,`offsetDistance`,`offsetPath`,`offsetRotate`,`offsetAnchor`];function No(e,t){if(!(t in e))return!1;let n=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e),t)||Object.getOwnPropertyDescriptor(e,t);return n&&typeof n.set==`function`}var Po=(e,t,n,r,i=n)=>{let a=No(e,i);!a&&(i.startsWith(`data`)||i.startsWith(`aria`))&&(i=eo(i));let o=yi[n]||yi[i],s=a?()=>{e[i]=yo(r.get(),yi[n])}:()=>{let t=yo(r.get(),o);t==null?e.removeAttribute(i):e.setAttribute(i,String(t))};return t.set(n,r,s)};function Fo(e,t,n,r){return pn.render(()=>e.setAttribute(`pathLength`,`1`)),n===`pathOffset`?t.set(n,r,()=>{let t=r.get();e.setAttribute(`stroke-dashoffset`,`${-t}`)}):(t.get(`stroke-dasharray`)||t.set(`stroke-dasharray`,new La(`1 1`),()=>{let n=t.get(`pathLength`)?.get()??1,r=t.get(`pathSpacing`)?.get();e.setAttribute(`stroke-dasharray`,`${n} ${r??1-Number(n)}`)}),t.set(n,r,void 0,t.get(`stroke-dasharray`)))}var Io=So((e,t,n,r)=>n.startsWith(`path`)?Fo(e,t,n,r):n.startsWith(`attr`)?Po(e,t,n,r,Lo(n)):(ta(n)||n in e.style?Oo:Po)(e,t,n,r),{test:vo,read:(e,t)=>Ri.has(t)?yi[t]?.default||0:ta(t)||Mo.includes(t)?Ao(e,t):(t=Lo(t),e.getAttribute(eo(t))??e.getAttribute(t)??void 0)});function Lo(e){return e.replace(/^attr([A-Z])/,(e,t)=>t.toLowerCase())}function Ro({top:e,left:t,right:n,bottom:r}){return{x:{min:t,max:n},y:{min:e,max:r}}}function zo(e,t){if(!t)return e;let n=t({x:e.left,y:e.top}),r=t({x:e.right,y:e.bottom});return{top:n.y,left:n.x,bottom:r.y,right:r.x}}function Bo(e,t){return Ro(zo(e.getBoundingClientRect(),t))}var Vo={},Ho=e=>vo(e)?Io:jo,Uo=class{constructor(e,t){this.effect=e,this.current=t,this.KeyframeResolver=co}getValue(e){return this.effect.get(this.current,e)}readValue(e,t){return this.effect.read(this.current,e,t)}render(){this.effect.flush(this.current)}measureViewportBox(){return Bo(this.current)}getProps(){return Vo}};function Wo(e,t,n,r){if(r)return mo(e=>r.getValue(e,null),t,n,r);let i=Ho(e);return ho(i,e,t,n,new Uo(i,e))}var Go=So((e,t,n,r)=>t.set(n,r,()=>{e[n]=r.get()}),{test:e=>Ot(e),read:(e,t)=>{let n=e[t];return typeof n==`string`||typeof n==`number`?n:void 0}});function Ko(e,t){if(e===`first`)return 0;{let n=t-1;return e===`last`?n:n/2}}function qo(e=.1,{startDelay:t=0,from:n=0,ease:r}={}){return(i,a)=>{let o=typeof n==`number`?n:Ko(n,a),s=e*Math.abs(o-i);if(r){let t=a*e;s=cn(r)(s/t)*t}return t+s}}var Jo=new WeakMap;function Yo(e,t,n){let r=$a(e)?e:Ra(e);return r.start(Ja(``,r,t,n)),r.animation}function Xo(e){return typeof e==`object`&&!Array.isArray(e)}function Zo(e,t,n,r){return e==null?[]:typeof e==`string`&&Xo(t)?bo(e,n,r):e instanceof NodeList?Array.from(e):Array.isArray(e)?e.filter(e=>e!=null):[e]}function Qo(e,t,n){return e*(t+1)+n*t}function $o(e,t,n,r){return typeof t==`number`?t:t.startsWith(`-`)||t.startsWith(`+`)?Math.max(0,e+parseFloat(t)):t===`<`?n:t.startsWith(`<`)?Math.max(0,n+parseFloat(t.slice(1))):r.get(t)??e}function es(e,t,n){for(let r=0;r<e.length;r++){let i=e[r];i.at>t&&i.at<n&&(wt(e,i),r--)}}function ts(e,t,n,r,i,a){es(e,i,a);for(let o=0;o<t.length;o++)e.push({value:t[o],at:mr(i,a,r[o]),easing:rn(n,o)})}function ns(e,t,n=0){let r=t+1+t*n;for(let t=0;t<e.length;t++)e[t]=e[t]/r}function rs(e,t){return e.at===t.at?e.value===null?1:t.value===null?-1:0:e.at-t.at}var is=`easeInOut`,as=20;function os(e,{defaultTransition:t={},...n}={},r,i){let a=t.duration||.3,o=new Map,s=new Map,c={},l=new Map,u=0,d=0,f=0;for(let n=0;n<e.length;n++){let o=e[n];if(typeof o==`string`){l.set(o,d);continue}if(!Array.isArray(o)){l.set(o.name,$o(d,o.at,u,l));continue}let[p,m,h={}]=o;h.at!==void 0&&(d=$o(d,h.at,u,l));let g=0,_=(e,n,r,o=0,s=0)=>{let c=ls(e),{delay:l=0,times:u=Xr(c),type:p=t.type||`keyframes`,repeat:m,repeatType:h,repeatDelay:_=0,...v}=n,{ease:y=t.ease||`easeOut`,duration:b}=n,x=typeof l==`function`?l(o,s):l,S=c.length,C=da(p)?p:i?.[p||`keyframes`];if(S<=2&&C){let e=100;if(S===2&&fs(c)){let t=c[1]-c[0];e=Math.abs(t)}let n={...t,...v};b!==void 0&&(n.duration=Ft(b));let r=Fr(n,e,C);y=r.ease,b=r.duration}b??=a;let w=d+x;u.length===1&&u[0]===0&&(u[1]=1);let T=u.length-c.length;if(T>0&&Yr(u,T),c.length===1&&c.unshift(null),m&&`${m}${as}`,m&&m<as){let e=b>0?_/b:0;b=Qo(b,m,_);let t=[...c],n=[...u];y=Array.isArray(y)?[...y]:[y];let r=[...y],i=h===`reverse`||h===`mirror`,a=t,o=r;i&&(a=[...t].reverse(),h===`reverse`&&(o=[...r].reverse().map(e=>typeof e==`function`?Gt(e):e)));for(let s=0;s<m;s++){let l=i&&s%2==0,d=l?a:t,f=l?o:r,p=(s+1)*(1+e);e>0&&(c.push(c[c.length-1]),u.push(p),y.push(`linear`)),c.push(...d);for(let e=0;e<d.length;e++)u.push(n[e]+p),y.push(e===0?`linear`:rn(f,e-1))}ns(u,m,e)}let E=w+b;ts(r,c,y,u,w,E),g=Math.max(x+b,g),f=Math.max(E,f)};if($a(p)){let e=ss(p,s);_(m,h,cs(`default`,e))}else{let e=Zo(p,m,r,c),t=e.length;for(let n=0;n<t;n++){m=m,h=h;let r=e[n],i=ss(r,s);for(let e in m)_(m[e],us(h,e),cs(e,i),n,t)}}u=d,d+=g}return s.forEach((e,r)=>{for(let i in e){let a=e[i];a.sort(rs);let s=[],c=[],l=[];for(let e=0;e<a.length;e++){let{at:t,value:n,easing:r}=a[e];s.push(n),c.push(Nt(0,f,t)),l.push(r||`easeOut`)}c[0]!==0&&(c.unshift(0),s.unshift(s[0]),l.unshift(is)),c[c.length-1]!==1&&(c.push(1),s.push(null)),o.has(r)||o.set(r,{keyframes:{},transition:{}});let u=o.get(r);u.keyframes[i]=s;let{type:d,...p}=t;u.transition[i]={...p,duration:f,ease:l,times:c,...n}}}),o}function ss(e,t){return!t.has(e)&&t.set(e,{}),t.get(e)}function cs(e,t){return t[e]||(t[e]=[]),t[e]}function ls(e){return Array.isArray(e)?e:[e]}function us(e,t){return e&&e[t]?{...e,...e[t]}:{...e}}var ds=e=>typeof e==`number`,fs=e=>e.every(ds);function ps(e,t){return $a(e)||typeof e==`number`||typeof e==`string`&&!Xo(t)}function ms(e,t,n,r){let i=[];if(ps(e,t))i.push(Yo(e,Xo(t)&&t.default||t,n&&(n.default||n)));else{if(e==null)return i;let a=Zo(e,t,r),o=a.length;for(let e=0;e<o;e++){let r=a[e],s={...n};`delay`in s&&typeof s.delay==`function`&&(s.delay=s.delay(e,o)),r instanceof Element?i.push(...Wo(r,t,s,Jo.get(r))):i.push(...ho(po(r)??Go,r,t,s))}}return i}function hs(e,t,n){let r=[];return os(e.map(e=>{if(Array.isArray(e)&&typeof e[0]==`function`){let t=e[0],n=Ra(0);return n.on(`change`,t),e.length===1?[n,[0,1]]:e.length===2?[n,[0,1],e[1]]:[n,e[1],e[2]]}return e}),t,n,{spring:Gr}).forEach(({keyframes:e,transition:t},n)=>{r.push(...ms(n,e,t))}),r}function gs(e){return Array.isArray(e)&&e.some(Array.isArray)}function _s(e={}){let{scope:t,reduceMotion:n,skipAnimations:r}=e;function i(e,i,a){let o=[],s,c={};if(n!==void 0&&(c.reduceMotion=n),r!==void 0&&(c.skipAnimations=r),gs(e)){let{onComplete:n,...r}=i||{};typeof n==`function`&&(s=n),o=hs(e,{...c,...r},t)}else{let{onComplete:n,...r}=a||{};typeof n==`function`&&(s=n),o=ms(e,i,{...c,...r},t)}let l=new Na(o);return s&&l.finished.then(s),t&&(t.animations.push(l),l.finished.then(()=>{wt(t.animations,l)})),l}return i}var vs=Object.assign(_s(),{addEffect:uo,removeEffect:fo}),ys={type:`spring`,stiffness:500,damping:35,mass:.8},bs={type:`spring`,stiffness:320,damping:28,mass:1},xs=[.32,.72,0,1],Ss=[.22,1,.36,1],Cs=Ss;function ws(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}var Ts=new Set([`x`,`y`,`scale`,`scaleX`,`scaleY`,`rotate`,`transform`]),Es=/^(\s*(translate[XYZ3d]*\((\s*0(px|%)?\s*,?)+\)|scale[XYZ3d]*\((\s*1\s*,?)+\)|rotate[XYZ]?\(\s*0(deg)?\s*\))\s*)+$/;function Ds(e,t){return e===`opacity`||e.startsWith(`scale`)?Number(t)===1:e===`transform`?t===`none`||Es.test(String(t)):parseFloat(String(t))===0}var Os={opacity:1,y:0,scale:1};function ks(e){return`translateY(${e.y}px) scale(${e.scale})`}function As(e,t=Os){if(typeof getComputedStyle!=`function`)return t;let n=getComputedStyle(e),r=Number.parseFloat(n.opacity),i={opacity:Number.isFinite(r)?r:t.opacity,y:t.y,scale:t.scale},a=n.transform;if(a===`none`)return{...i,y:0,scale:1};let o=/^matrix(3d)?\(([^)]+)\)$/.exec(a??``);if(o){let e=o[2].split(`,`).map(Number),t=e[0],n=o[1]?e[13]:e[5];Number.isFinite(t)&&(i.scale=t),Number.isFinite(n)&&(i.y=n)}return i}function js(e){let t=[];for(let[n,r]of Object.entries(e)){if(!Array.isArray(r)||n!==`opacity`&&!Ts.has(n)||!Ds(n,r[r.length-1]))return null;t.push(n===`opacity`?`opacity`:`transform`)}return t.length>0?[...new Set(t)]:null}function Ms(e){return e instanceof Element?[e]:Array.from(e)}function q(e,t,n=bs){let r=vs(e,t,ws()?{duration:0}:n),i=js(t);if(i){let t=Ms(e);r.then(()=>{for(let e of t){let t=e.style;for(let e of i)t?.removeProperty(e)}})}return r}function Ns(e,t,n){return!t||ws()?null:(e.style.transformOrigin=`0 0`,q(e,{transform:[`translate(${t.left-n.left}px, ${t.top-n.top}px) scale(${t.width/Math.max(n.width,1)}, ${t.height/Math.max(n.height,1)})`,`translate(0px, 0px) scale(1, 1)`]},ys))}function Ps(e,t,n,r=!1){if(!n){e.removeAttribute(`data-visible`);return}let i=t.getBoundingClientRect(),a=n.getBoundingClientRect();if(a.width===0&&a.height===0)return;let o=r||!e.hasAttribute(`data-visible`);o&&(e.style.transition=`none`);let s=a.left-i.left-t.clientLeft+t.scrollLeft,c=a.top-i.top-t.clientTop+t.scrollTop;e.style.translate=`${s}px ${c}px`,e.style.width=`${a.width}px`,e.style.height=`${a.height}px`,e.setAttribute(`data-visible`,``),o&&(e.offsetWidth,e.style.removeProperty(`transition`))}var J=M`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    box-sizing: border-box;
    font-family: var(--font-family-base, inherit);
    font-size: var(--font-size-md, 1rem);
    line-height: var(--line-height-md, 1.5rem);
    color: var(--color-fg, inherit);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]),
  [hidden] {
    display: none !important;
  }

  /* Standard margin/padding resets for commonly used slotted or shadow elements */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  ul,
  ol,
  figure,
  blockquote,
  dl,
  dd {
    margin: 0;
  }

  /* Form control resets */
  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }

  button,
  select {
    text-transform: none;
  }

  button,
  [type="button"],
  [type="reset"],
  [type="submit"] {
    -webkit-appearance: button;
  }

  /* Shared accessible focus-visible indicator */
  :focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }
`,Fs=[J,ut,M`
    :host {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
      border-radius: var(--radius-surface, 1.5rem);
      width: 100%;
      box-sizing: border-box;
      position: relative;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
    }

    /* Default: a plain surface; only the indicator and title carry the tone */
    :host(:not([variant])) {
      background-color: var(--color-surface);
      color: var(--color-fg);
      border: none;
      box-shadow: var(--shadow-surface);
    }

    :host(:not([variant])) [part~="icon"],
    :host(:not([variant])) [part~="title"],
    :host(:not([variant])) ::slotted([slot="title"]) {
      color: var(--_tone-soft-fg);
    }

    :host(:not([variant])) [part~="description"] {
      color: var(--color-muted);
    }

    [part~="base"] {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: var(--spacing-4, 1rem);
      width: 100%;
    }

    /* 1rem glyph in a 1.5rem box, so it centers on the title's first line */
    [part~="icon"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: content-box;
      width: 1rem;
      height: 1rem;
      padding: var(--spacing-1, 0.25rem);
      user-select: none;
    }

    [part~="icon"] svg,
    ::slotted([slot="icon"]) {
      width: 1rem;
      height: 1rem;
    }

    [part~="content"] {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 1 1 auto;
      min-width: 0;
    }

    [part~="title"],
    ::slotted([slot="title"]) {
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-md, 1.5rem);
    }

    [part~="description"] {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
    }

    /* On tinted variants the description is a softer shade of the variant's text color */
    :host([variant]) [part~="description"] {
      color: color-mix(in oklch, currentColor 85%, transparent);
    }

    [part~="actions"] {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
      flex-shrink: 0;
      margin-inline-start: auto;
    }

    /* Close button: quiet neutral circle */
    .dismiss-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      padding: var(--spacing-1, 0.25rem);
      border: none;
      border-radius: var(--radius-xl, 0.75rem);
      background-color: var(--color-default);
      color: var(--color-muted);
      cursor: pointer;
      transition:
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        color 150ms var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        box-shadow 150ms var(--ease-out, ease-out);
    }

    :host([variant]) .dismiss-button {
      background-color: transparent;
      color: currentColor;
    }

    @media (hover: hover) {
      .dismiss-button:hover {
        background-color: var(--color-default-hover);
      }

      :host([variant]) .dismiss-button:hover {
        background-color: color-mix(in oklch, currentColor 12%, transparent);
      }
    }

    .dismiss-button:active {
      transform: scale(0.95);
    }

    .dismiss-button:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .dismiss-button svg {
      width: 1rem;
      height: 1rem;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .dismiss-button {
        transition: none;
      }

      .dismiss-button:active {
        transform: none;
      }
    }
  `];W(`moul-alert`,class extends U{static styles=Fs;static properties={tone:{type:String,reflect:!0},variant:{type:String,reflect:!0,useDefault:!0},title:{type:String,reflect:!0},description:{type:String,reflect:!0},isDismissible:{type:Boolean,reflect:!0,attribute:`is-dismissible`}};constructor(){super(),this.tone=`primary`,this.variant=`flat`,this.title=``,this.description=``,this.isDismissible=!1}connectedCallback(){super.connectedCallback(),this.updateRole()}updated(e){if(super.updated(e),e.has(`tone`)){let e=ct(this.tone);this.tone!==e&&(this.tone=e),this.updateRole()}if(e.has(`variant`)){let e=lt(this.variant);this.variant!==e&&(this.variant=e)}}firstUpdated(){q(this,{transform:[`translateY(-6px)`,`translateY(0px)`],opacity:[0,1]},{duration:.2,ease:Ss})}updateRole(){let e=this.tone===`error`||this.tone===`warning`?`alert`:`status`;this.setAttribute(`role`,e)}getDefaultIcon(){switch(this.tone){case`error`:return vt();case`warning`:return _t();case`success`:return gt();default:return ht()}}async handleDismiss(e){let t=q(this,{opacity:[1,0],transform:[`scale(1)`,`scale(0.96)`]},{duration:.15,ease:Ss});t?.finished&&await t.finished,this.dispatchEvent(new CustomEvent(`dismiss`,{bubbles:!0,composed:!0,detail:{originalEvent:e}}))}render(){return B`
      <div part="base">
        <div part="icon">
          <slot name="icon">${this.getDefaultIcon()}</slot>
        </div>
        <div part="content">
          <slot name="title">
            ${this.title?B`<div part="title">${this.title}</div>`:``}
          </slot>
          <div part="description">
            <slot>${this.description}</slot>
          </div>
        </div>
        <div part="actions">
          <slot name="action"></slot>
          ${this.isDismissible?B`
                <button
                  part="dismiss-button"
                  class="dismiss-button"
                  aria-label="Dismiss alert"
                  @click=${this.handleDismiss}
                >
                  ${dt()}
                </button>
              `:``}
        </div>
      </div>
    `}});var Is=`button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), details:not([disabled]), [contenteditable="true"]`;function Ls(){let e=typeof HTMLElement<`u`&&`popover`in HTMLElement.prototype,t=typeof CSS<`u`&&typeof CSS.supports==`function`&&CSS.supports(`anchor-name`,`--moul-anchor`);return!!(e&&t)}function Rs(e){if(!e)return[];let t=[],n=new Set;function r(e){let t=e.hasAttribute(`hidden`)||e.getAttribute(`aria-hidden`)===`true`,n=typeof window<`u`&&window.getComputedStyle?window.getComputedStyle(e):e.style,r=n?.display===`none`||n?.visibility===`hidden`;return!t&&!r}function i(e){n.has(e)||(n.add(e),typeof e.matches==`function`&&e.matches(Is)&&r(e)&&t.push(e))}function a(t){if(typeof HTMLSlotElement<`u`&&t instanceof HTMLSlotElement){let e=typeof t.assignedElements==`function`?t.assignedElements({flatten:!0}):[];for(let t of e)if(t instanceof HTMLElement&&(i(t),typeof t.querySelectorAll==`function`)){let e=t.querySelectorAll(Is);for(let t of Array.from(e))i(t)}}else if(t.shadowRoot)for(let e of Array.from(t.shadowRoot.children))a(e);else{t!==e&&t instanceof HTMLElement&&i(t);for(let e of Array.from(t.children))a(e)}}if(a(e),t.length===0&&typeof e.querySelectorAll==`function`){let t=Array.from(e.querySelectorAll(Is));for(let e of t)i(e)}return t}function zs(e){if(!e)return null;let t=Rs(e)[0]??(typeof e.focus==`function`?e:null);if(t&&typeof t.focus==`function`)try{return t.focus(),t}catch{return null}return null}function Bs(e,t){if(t.key!==`Tab`)return;let n=Rs(e);if(n.length===0){t.preventDefault();return}let r=n[0],i=n[n.length-1],a=(e.ownerDocument||document).activeElement,o=typeof e.getRootNode==`function`?e.getRootNode():null,s=o&&typeof ShadowRoot<`u`&&o instanceof ShadowRoot?o.host:null,c=!!a&&(n.includes(a)||e.contains(a)||!!s?.contains(a));t.shiftKey?a!==r&&c||(t.preventDefault(),i.focus()):a!==i&&c||(t.preventDefault(),r.focus())}function Vs(e,t){if(!e)return!1;try{e.open||e.showModal()}catch(e){return console.warn(`[@moul-dev/ui] Failed to call dialog.showModal() (element may be disconnected):`,e),!1}return zs(t??e),!0}function Hs(){if(typeof document>`u`)return null;let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}function Us(e){if(e&&typeof e.focus==`function`)try{e.focus()}catch{}}var Ws=6,Gs=8,Ks=600,qs={modal:{opacity:0,y:8,scale:.95},popover:{opacity:0,y:0,scale:.96},tooltip:{opacity:0,y:0,scale:.97},toast:{opacity:0,y:24,scale:.95},"toast-top":{opacity:0,y:-24,scale:.95}},Js={opacity:0,y:0,scale:.95},Ys={"drawer-left":[`translateX(-100%)`,`translateX(0%)`],"drawer-right":[`translateX(100%)`,`translateX(0%)`],"drawer-top":[`translateY(-100%)`,`translateY(0%)`],"drawer-bottom":[`translateY(100%)`,`translateY(0%)`]},Xs=class{isOpen=!1;isMounted=!1;host;options;set preset(e){this.options.preset=e}activeAnimation=null;cancelActiveAnimation=null;currentTransitionId=0;anchorFrame=0;watchedPopover=null;lastLightDismissAt=-1/0;handleNativeToggle=e=>{let{newState:t}=e;t===`closed`&&this.isOpen&&(this.lastLightDismissAt=performance.now(),this.options.onLightDismiss?.())};get wasJustDismissed(){return performance.now()-this.lastLightDismissAt<350}constructor(e,t={}){this.host=e,this.options=t,this.host.addController(this)}hostConnected(){}hostDisconnected(){this.stopAnchoring(),this.stopActiveAnimation(),this.currentTransitionId++}async setOpen(e,t,{instant:n=!1}={}){if(e===this.isOpen&&this.isMounted===e)return;let r=++this.currentTransitionId,i=this.options.preset??`modal`,a=n||ws(),o=this.activeAnimation?this.readTargetPose(t):null;if(e){if(this.isOpen=!0,this.isMounted=!0,this.stopActiveAnimation(),this.host.requestUpdate(),this.options.onOpenChange?.(!0),await this.hostUpdateComplete(),this.currentTransitionId!==r||(this.promoteTopLayer(),this.startAnchoring(),this.isCssDriven()))return;let e=this.resolveTarget(t);if(this.host.isConnected&&e){let t=this.getEnterKeyframes(i,o),n=a?{duration:0}:this.getEnterOptions(i);if(await this.runAnimation(e,t,n),this.currentTransitionId===r&&this.isOpen)for(let t of[`opacity`,`transform`,`filter`])e.style.removeProperty(t)}}else{if(this.isOpen=!1,this.host.requestUpdate(),this.options.onOpenChange?.(!1),this.stopActiveAnimation(),this.isCssDriven())a||await this.waitForCssExit();else{let e=this.resolveTarget(t);if(this.host.isConnected&&e){let t=this.getExitKeyframes(i,o),n=a?{duration:0}:this.getExitOptions(i);await this.runAnimation(e,t,n)}}if(this.currentTransitionId!==r||this.isOpen)return;this.stopAnchoring(),this.demoteTopLayer(),this.isMounted=!1,this.host.requestUpdate()}}async toggle(e){let t=typeof e==`boolean`?e:!this.isOpen;await this.setOpen(t)}isCssDriven(){return!!this.options.dialog?.()}resolveTarget(e){return e??this.options.target?.()??this.host}readTargetPose(e){let t=this.resolveTarget(e);return t?As(t):null}async hostUpdateComplete(){let e=this.host.updateComplete;this.host.isConnected&&e&&await e}async waitForCssExit(){if(!this.host.isConnected||document.visibilityState===`hidden`)return;await this.hostUpdateComplete();let e=this.resolveDialog();if(!e?.open||typeof e.getAnimations!=`function`)return;let t=e.getAnimations({subtree:!0}).filter(e=>Number.isFinite(Number(e.effect?.getComputedTiming().endTime??1/0)));if(t.length===0)return;let n=()=>{};await new Promise(e=>{let r=setTimeout(()=>n(),Ks);n=()=>{clearTimeout(r),e()},this.cancelActiveAnimation=n,Promise.allSettled(t.map(e=>e.finished)).then(n)}),this.cancelActiveAnimation===n&&(this.cancelActiveAnimation=null)}resolveDialog(){return this.options.dialog?.()??this.host.shadowRoot?.querySelector?.(`dialog`)??this.host.querySelector?.(`dialog`)}stopActiveAnimation(){this.cancelActiveAnimation&&=(this.cancelActiveAnimation(),null),this.activeAnimation?.stop(),this.activeAnimation=null}async runAnimation(e,t,n){this.stopActiveAnimation();let r=vs(e,t,n);this.activeAnimation=r,await new Promise(e=>{let t=!1,n=()=>{t||(t=!0,e())};this.cancelActiveAnimation=n,r.then(n,n)}),this.activeAnimation===r&&(this.activeAnimation=null,this.cancelActiveAnimation=null)}reposition=()=>{cancelAnimationFrame(this.anchorFrame),this.anchorFrame=requestAnimationFrame(()=>this.placeAgainstAnchor())};startAnchoring(){!this.options.anchor||typeof window>`u`||(this.placeAgainstAnchor(),window.addEventListener(`scroll`,this.reposition,!0),window.addEventListener(`resize`,this.reposition))}stopAnchoring(){!this.options.anchor||typeof window>`u`||(cancelAnimationFrame(this.anchorFrame),window.removeEventListener(`scroll`,this.reposition,!0),window.removeEventListener(`resize`,this.reposition))}placeAgainstAnchor(){let e=this.options.anchor?.(),t=this.options.popover?.();if(!e||!t)return;let n=e.getBoundingClientRect();if(n.width===0&&n.height===0)return;let r=t.style;r.position=`fixed`,r.margin=`0`,r.right=`auto`,r.bottom=`auto`,r.minWidth=`${n.width}px`;let i=window.innerWidth,a=window.innerHeight,o=t.offsetHeight,s=t.offsetWidth,c=a-n.bottom-Ws-Gs,l=n.top-Ws-Gs,u=o>c&&l>c,d=u?Math.max(Gs,n.top-Ws-o):n.bottom+Ws,f=Math.min(Math.max(Gs,n.left),Math.max(Gs,i-s-Gs));r.top=`${Math.round(d)}px`,r.left=`${Math.round(f)}px`,r.maxHeight=`${Math.max(120,Math.floor(u?l:c))}px`,r.transformOrigin=`${Math.round(n.left+n.width/2-f)}px ${u?`100%`:`0px`}`,t.toggleAttribute(`data-flipped`,u)}promoteTopLayer(){let e=this.options.dialog?.()??this.host.shadowRoot?.querySelector?.(`dialog`)??this.host.querySelector?.(`dialog`);e&&!e.open&&Vs(e);let t=this.options.popover?.()??this.host.shadowRoot?.querySelector?.(`[popover]`)??this.host.querySelector?.(`[popover]`);if(t&&t!==this.watchedPopover&&(this.watchedPopover?.removeEventListener(`toggle`,this.handleNativeToggle),t.addEventListener(`toggle`,this.handleNativeToggle),this.watchedPopover=t),t&&typeof t.showPopover==`function`&&!t.matches?.(`:popover-open`))try{t.showPopover()}catch{}}demoteTopLayer(){let e=this.options.dialog?.()??this.host.shadowRoot?.querySelector?.(`dialog`)??this.host.querySelector?.(`dialog`);if(e?.open)try{e.close()}catch{}let t=this.options.popover?.()??this.host.shadowRoot?.querySelector?.(`[popover]`)??this.host.querySelector?.(`[popover]`);if(t&&typeof t.hidePopover==`function`&&t.matches?.(`:popover-open`))try{t.hidePopover()}catch{}}getEnterKeyframes(e,t){let n=Ys[e];if(n)return{transform:n};let r=t??qs[e]??qs.modal;return{opacity:[r.opacity,1],transform:[ks(r),ks(Os)]}}getEnterOptions(e){switch(e){case`modal`:case`toast`:case`toast-top`:return bs;case`popover`:case`tooltip`:return ys;case`drawer-left`:case`drawer-right`:case`drawer-top`:case`drawer-bottom`:return{duration:.28,ease:xs};default:return bs}}getExitKeyframes(e,t){let n=Ys[e];if(n)return{transform:[n[1],n[0]]};let r=t??Os,i=e===`toast`||e===`toast-top`,a=i?Js:qs[e]??qs.modal,o={opacity:[r.opacity,0],transform:[ks(r),ks(a)]};return i&&(o.filter=[`blur(0px)`,`blur(4px)`]),o}getExitOptions(e){switch(e){case`modal`:return{duration:.15,ease:Ss};case`popover`:return{duration:.12,ease:Ss};case`tooltip`:return{duration:.1,ease:Ss};case`drawer-left`:case`drawer-right`:case`drawer-top`:case`drawer-bottom`:return{duration:.22,ease:xs};case`toast`:case`toast-top`:return{duration:.2,ease:Ss};default:return{duration:.15,ease:Ss}}}},Zs=M`
  dialog::backdrop {
    background-color: var(--color-overlay);
  }

  dialog[open]::backdrop {
    animation: moul-backdrop-in var(--duration-fast, 150ms) var(--ease-out, ease-out);
  }

  @keyframes moul-backdrop-in {
    from {
      opacity: 0;
    }
  }

  [part~='base'] {
    border: none;
    border-radius: var(--radius-surface, 1.5rem);
    background-color: var(--color-bg-elevated);
    box-shadow: var(--shadow-overlay);
    color: var(--color-fg);
  }

  @media (prefers-reduced-motion: reduce) {
    dialog[open]::backdrop {
      animation: none;
    }
  }
`,Qs=[J,M`
    :host {
      display: contents;
    }

    /* Status icon chip colors, per tone (default tone is error) */
    :host,
    :host([tone="error"]) {
      --_icon-bg: var(--color-danger-soft);
      --_icon-fg: var(--color-danger-soft-fg);
    }

    :host([tone="primary"]),
    :host([tone="accent"]) {
      --_icon-bg: var(--color-accent-soft);
      --_icon-fg: var(--color-accent-soft-fg);
    }

    :host([tone="success"]) {
      --_icon-bg: var(--color-success-soft);
      --_icon-fg: var(--color-success-soft-fg);
    }

    :host([tone="warning"]) {
      --_icon-bg: var(--color-warning-soft);
      --_icon-fg: var(--color-warning-soft-fg);
    }

    /* Full-viewport positioning layer; the panel is centred inside its padding */
    dialog {
      padding: var(--spacing-4, 1rem);
      border: none;
      background: transparent;
      overflow: visible;
      color: inherit;
      max-width: none;
      max-height: none;
      width: 100%;
      height: 100%;
      inset: 0;
      position: fixed;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal, 1300);
      margin: 0;
    }

    @media (min-width: 640px) {
      dialog {
        padding: 2.5rem;
      }
    }

    dialog:not([open]) {
      display: none;
    }

    /* Panel surface (fill, radius, shadow) comes from the shared overlay styles */
    [part~="base"] {
      position: relative;
      width: 100%;
      max-width: 28rem;
      max-height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: var(--spacing-6, 1.5rem);
      overflow: hidden;
      outline: none;
    }

    :host([size="sm"]) [part~="base"] {
      max-width: 24rem;
    }

    :host([size="md"]) [part~="base"] {
      max-width: 28rem;
    }

    :host([size="lg"]) [part~="base"] {
      max-width: 32rem;
    }

    [part~="header"] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3, 0.75rem);
      margin-bottom: var(--spacing-2, 0.5rem);
      font-size: var(--font-size-md, 1rem);
      line-height: var(--line-height-md, 1.5rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg);
    }

    /* Headings slotted into the header take its type instead of UA heading styles */
    ::slotted([slot="header"]) {
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
    }

    /* An <svg> slotted into the header becomes the tone-tinted status icon */
    ::slotted(svg[slot="header"]) {
      box-sizing: content-box;
      align-self: flex-start;
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0.625rem;
      border-radius: var(--radius-3xl, 1.5rem);
      background-color: var(--_icon-bg);
      color: var(--_icon-fg);
      user-select: none;
    }

    [part~="body"] {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
      /* Room for focus rings of controls inside the scroll area */
      margin-inline: -3px;
      padding: 3px;
      color: var(--color-muted);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
    }

    ::slotted([slot="body"]) {
      margin: 0;
    }

    [part~="footer"] {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-2, 0.5rem);
      margin-top: var(--spacing-5, 1.25rem);
    }

    /* Collapse sections with nothing slotted, where :has-slotted is supported */
    [part~="header"]:not(:has(> slot:has-slotted)),
    [part~="footer"]:not(:has(> slot:has-slotted)) {
      display: none;
    }

    /* Enter: fade + settle from 1.05; exit while closing: fade + shrink to .95 */
    dialog[open] [part~="base"] {
      animation: moul-alert-dialog-in 250ms var(--ease-out, ease-out);
    }

    :host(:not([is-open])) dialog[open] [part~="base"] {
      animation: moul-alert-dialog-out 100ms var(--ease-out, ease-out)
        forwards;
      pointer-events: none;
    }

    :host(:not([is-open])) dialog[open]::backdrop {
      animation: moul-alert-dialog-backdrop-out 100ms var(--ease-out, ease-out)
        forwards;
    }

    @keyframes moul-alert-dialog-in {
      from {
        opacity: 0;
        transform: scale(1.05);
      }
    }

    @keyframes moul-alert-dialog-out {
      to {
        opacity: 0;
        transform: scale(0.95);
      }
    }

    @keyframes moul-alert-dialog-backdrop-out {
      to {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog[open] [part~="base"],
      :host(:not([is-open])) dialog[open] [part~="base"],
      :host(:not([is-open])) dialog[open]::backdrop {
        animation: none;
      }
    }
  `,Zs];W(`moul-alert-dialog`,class extends U{static styles=Qs;static properties={isOpen:{type:Boolean,reflect:!0,attribute:`is-open`},tone:{type:String,reflect:!0},size:{type:String,reflect:!0}};overlayPresence;previousActiveElement=null;constructor(){super(),this.isOpen=!1,this.tone=`error`,this.size=`md`,this.overlayPresence=new Xs(this,{preset:`modal`,dialog:()=>this.dialogEl})}get dialogEl(){return this.shadowRoot?.querySelector(`dialog`)??null}get contentEl(){return this.shadowRoot?.querySelector(`[part="base"]`)??null}get isMounted(){return this.overlayPresence.isMounted}connectedCallback(){super.connectedCallback(),this.addEventListener(`keydown`,this.handleKeyDown),this.addEventListener(`click`,this.handleClick)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.handleKeyDown),this.removeEventListener(`click`,this.handleClick)}updated(e){super.updated(e),e.has(`isOpen`)&&this.isOpen!==this.overlayPresence.isOpen&&(this.isOpen?this.openDialog():this.closeDialog())}async setOpen(e){this.isOpen===e&&this.overlayPresence.isOpen===e||(this.isOpen=e,this.dispatchEvent(new CustomEvent(`openchange`,{bubbles:!0,composed:!0,detail:{isOpen:this.isOpen}})),e?await this.openDialog():await this.closeDialog())}confirm(){this.dispatchEvent(new CustomEvent(`confirm`,{bubbles:!0,composed:!0})),this.setOpen(!1)}cancel(){this.dispatchEvent(new CustomEvent(`cancel`,{bubbles:!0,composed:!0})),this.setOpen(!1)}async openDialog(){this.previousActiveElement=document.activeElement,await this.overlayPresence.setOpen(!0);let e=this.dialogEl;if(e){let t=this.querySelector(`[data-action="cancel"], [slot="cancel"]`);t&&typeof t.focus==`function`?t.focus():zs(this.contentEl??e)}}async closeDialog(){await this.overlayPresence.setOpen(!1),Us(this.previousActiveElement)}handleKeyDown=e=>{if(this.isOpen){if(e.key===`Escape`){e.preventDefault(),e.stopPropagation(),this.cancel();return}e.key===`Tab`&&Bs(this.dialogEl??this,e)}};handleClick=e=>{let t=e.target;if(!t)return;let n=t.getAttribute?.(`data-action`)||t.getAttribute?.(`slot`);n===`confirm`?this.confirm():n===`cancel`&&this.cancel()};render(){return B`
      <dialog
        part="dialog"
        role="alertdialog"
        aria-modal="true"
        class="dialog"
      >
        <div part="base" class="alert-dialog-card">
          <div part="header">
            <slot name="header"></slot>
          </div>
          <div part="body">
            <slot name="body"><slot></slot></slot>
          </div>
          <div part="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </dialog>
    `}});function $s(e,t){return e==null||t==null?NaN:e<t?-1:e>t?1:e>=t?0:NaN}function ec(e,t){return e==null||t==null?NaN:t<e?-1:t>e?1:t>=e?0:NaN}function tc(e){let t,n,r;e.length===2?(t=e===$s||e===ec?e:nc,n=e,r=e):(t=$s,n=(t,n)=>$s(e(t),n),r=(t,n)=>e(t)-n);function i(e,r,i=0,a=e.length){if(i<a){if(t(r,r)!==0)return a;do{let t=i+a>>>1;n(e[t],r)<0?i=t+1:a=t}while(i<a)}return i}function a(e,r,i=0,a=e.length){if(i<a){if(t(r,r)!==0)return a;do{let t=i+a>>>1;n(e[t],r)<=0?i=t+1:a=t}while(i<a)}return i}function o(e,t,n=0,a=e.length){let o=i(e,t,n,a-1);return o>n&&r(e[o-1],t)>-r(e[o],t)?o-1:o}return{left:i,center:o,right:a}}function nc(){return 0}function rc(e){return e===null?NaN:+e}var ic=tc($s),ac=ic.right;ic.left,tc(rc).center;var oc=class extends Map{constructor(e,t=uc){if(super(),Object.defineProperties(this,{_intern:{value:new Map},_key:{value:t}}),e!=null)for(let[t,n]of e)this.set(t,n)}get(e){return super.get(sc(this,e))}has(e){return super.has(sc(this,e))}set(e,t){return super.set(cc(this,e),t)}delete(e){return super.delete(lc(this,e))}};function sc({_intern:e,_key:t},n){let r=t(n);return e.has(r)?e.get(r):n}function cc({_intern:e,_key:t},n){let r=t(n);return e.has(r)?e.get(r):(e.set(r,n),n)}function lc({_intern:e,_key:t},n){let r=t(n);return e.has(r)&&(n=e.get(r),e.delete(r)),n}function uc(e){return typeof e==`object`&&e?e.valueOf():e}var dc=Math.sqrt(50),fc=Math.sqrt(10),pc=Math.sqrt(2);function mc(e,t,n){let r=(t-e)/Math.max(0,n),i=Math.floor(Math.log10(r)),a=r/10**i,o=a>=dc?10:a>=fc?5:a>=pc?2:1,s,c,l;return i<0?(l=10**-i/o,s=Math.round(e*l),c=Math.round(t*l),s/l<e&&++s,c/l>t&&--c,l=-l):(l=10**i*o,s=Math.round(e/l),c=Math.round(t/l),s*l<e&&++s,c*l>t&&--c),c<s&&.5<=n&&n<2?mc(e,t,n*2):[s,c,l]}function hc(e,t,n){if(t=+t,e=+e,n=+n,!(n>0))return[];if(e===t)return[e];let r=t<e,[i,a,o]=r?mc(t,e,n):mc(e,t,n);if(!(a>=i))return[];let s=a-i+1,c=Array(s);if(r){if(o<0)for(let e=0;e<s;++e)c[e]=(a-e)/-o;else for(let e=0;e<s;++e)c[e]=(a-e)*o}else if(o<0)for(let e=0;e<s;++e)c[e]=(i+e)/-o;else for(let e=0;e<s;++e)c[e]=(i+e)*o;return c}function gc(e,t,n){return t=+t,e=+e,n=+n,mc(e,t,n)[2]}function _c(e,t,n){t=+t,e=+e,n=+n;let r=t<e,i=r?gc(t,e,n):gc(e,t,n);return(r?-1:1)*(i<0?1/-i:i)}function vc(e,t,n){e=+e,t=+t,n=(i=arguments.length)<2?(t=e,e=0,1):i<3?1:+n;for(var r=-1,i=Math.max(0,Math.ceil((t-e)/n))|0,a=Array(i);++r<i;)a[r]=e+r*n;return a}function yc(e,t){switch(arguments.length){case 0:break;case 1:this.range(e);break;default:this.range(t).domain(e)}return this}var bc=Symbol(`implicit`);function xc(){var e=new oc,t=[],n=[],r=bc;function i(i){let a=e.get(i);if(a===void 0){if(r!==bc)return r;e.set(i,a=t.push(i)-1)}return n[a%n.length]}return i.domain=function(n){if(!arguments.length)return t.slice();t=[],e=new oc;for(let r of n)e.has(r)||e.set(r,t.push(r)-1);return i},i.range=function(e){return arguments.length?(n=Array.from(e),i):n.slice()},i.unknown=function(e){return arguments.length?(r=e,i):r},i.copy=function(){return xc(t,n).unknown(r)},yc.apply(i,arguments),i}function Sc(){var e=xc().unknown(void 0),t=e.domain,n=e.range,r=0,i=1,a,o,s=!1,c=0,l=0,u=.5;delete e.unknown;function d(){var e=t().length,d=i<r,f=d?i:r,p=d?r:i;a=(p-f)/Math.max(1,e-c+l*2),s&&(a=Math.floor(a)),f+=(p-f-a*(e-c))*u,o=a*(1-c),s&&(f=Math.round(f),o=Math.round(o));var m=vc(e).map(function(e){return f+a*e});return n(d?m.reverse():m)}return e.domain=function(e){return arguments.length?(t(e),d()):t()},e.range=function(e){return arguments.length?([r,i]=e,r=+r,i=+i,d()):[r,i]},e.rangeRound=function(e){return[r,i]=e,r=+r,i=+i,s=!0,d()},e.bandwidth=function(){return o},e.step=function(){return a},e.round=function(e){return arguments.length?(s=!!e,d()):s},e.padding=function(e){return arguments.length?(c=Math.min(1,l=+e),d()):c},e.paddingInner=function(e){return arguments.length?(c=Math.min(1,e),d()):c},e.paddingOuter=function(e){return arguments.length?(l=+e,d()):l},e.align=function(e){return arguments.length?(u=Math.max(0,Math.min(1,e)),d()):u},e.copy=function(){return Sc(t(),[r,i]).round(s).paddingInner(c).paddingOuter(l).align(u)},yc.apply(d(),arguments)}function Cc(e){var t=e.copy;return e.padding=e.paddingOuter,delete e.paddingInner,delete e.paddingOuter,e.copy=function(){return Cc(t())},e}function wc(){return Cc(Sc.apply(null,arguments).paddingInner(1))}function Tc(e,t,n){e.prototype=t.prototype=n,n.constructor=e}function Ec(e,t){var n=Object.create(e.prototype);for(var r in t)n[r]=t[r];return n}function Dc(){}var Oc=.7,kc=1/Oc,Ac=`\\s*([+-]?\\d+)\\s*`,jc=`\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*`,Mc=`\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*`,Nc=/^#([0-9a-f]{3,8})$/,Pc=RegExp(`^rgb\\(${Ac},${Ac},${Ac}\\)$`),Fc=RegExp(`^rgb\\(${Mc},${Mc},${Mc}\\)$`),Ic=RegExp(`^rgba\\(${Ac},${Ac},${Ac},${jc}\\)$`),Lc=RegExp(`^rgba\\(${Mc},${Mc},${Mc},${jc}\\)$`),Rc=RegExp(`^hsl\\(${jc},${Mc},${Mc}\\)$`),zc=RegExp(`^hsla\\(${jc},${Mc},${Mc},${jc}\\)$`),Bc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};Tc(Dc,Gc,{copy(e){return Object.assign(new this.constructor,this,e)},displayable(){return this.rgb().displayable()},hex:Vc,formatHex:Vc,formatHex8:Hc,formatHsl:Uc,formatRgb:Wc,toString:Wc});function Vc(){return this.rgb().formatHex()}function Hc(){return this.rgb().formatHex8()}function Uc(){return il(this).formatHsl()}function Wc(){return this.rgb().formatRgb()}function Gc(e){var t,n;return e=(e+``).trim().toLowerCase(),(t=Nc.exec(e))?(n=t[1].length,t=parseInt(t[1],16),n===6?Kc(t):n===3?new Xc(t>>8&15|t>>4&240,t>>4&15|t&240,(t&15)<<4|t&15,1):n===8?qc(t>>24&255,t>>16&255,t>>8&255,(t&255)/255):n===4?qc(t>>12&15|t>>8&240,t>>8&15|t>>4&240,t>>4&15|t&240,((t&15)<<4|t&15)/255):null):(t=Pc.exec(e))?new Xc(t[1],t[2],t[3],1):(t=Fc.exec(e))?new Xc(t[1]*255/100,t[2]*255/100,t[3]*255/100,1):(t=Ic.exec(e))?qc(t[1],t[2],t[3],t[4]):(t=Lc.exec(e))?qc(t[1]*255/100,t[2]*255/100,t[3]*255/100,t[4]):(t=Rc.exec(e))?rl(t[1],t[2]/100,t[3]/100,1):(t=zc.exec(e))?rl(t[1],t[2]/100,t[3]/100,t[4]):Bc.hasOwnProperty(e)?Kc(Bc[e]):e===`transparent`?new Xc(NaN,NaN,NaN,0):null}function Kc(e){return new Xc(e>>16&255,e>>8&255,e&255,1)}function qc(e,t,n,r){return r<=0&&(e=t=n=NaN),new Xc(e,t,n,r)}function Jc(e){return e instanceof Dc||(e=Gc(e)),e?(e=e.rgb(),new Xc(e.r,e.g,e.b,e.opacity)):new Xc}function Yc(e,t,n,r){return arguments.length===1?Jc(e):new Xc(e,t,n,r??1)}function Xc(e,t,n,r){this.r=+e,this.g=+t,this.b=+n,this.opacity=+r}Tc(Xc,Yc,Ec(Dc,{brighter(e){return e=e==null?kc:kc**+e,new Xc(this.r*e,this.g*e,this.b*e,this.opacity)},darker(e){return e=e==null?Oc:Oc**+e,new Xc(this.r*e,this.g*e,this.b*e,this.opacity)},rgb(){return this},clamp(){return new Xc(tl(this.r),tl(this.g),tl(this.b),el(this.opacity))},displayable(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:Zc,formatHex:Zc,formatHex8:Qc,formatRgb:$c,toString:$c}));function Zc(){return`#${nl(this.r)}${nl(this.g)}${nl(this.b)}`}function Qc(){return`#${nl(this.r)}${nl(this.g)}${nl(this.b)}${nl((isNaN(this.opacity)?1:this.opacity)*255)}`}function $c(){let e=el(this.opacity);return`${e===1?`rgb(`:`rgba(`}${tl(this.r)}, ${tl(this.g)}, ${tl(this.b)}${e===1?`)`:`, ${e})`}`}function el(e){return isNaN(e)?1:Math.max(0,Math.min(1,e))}function tl(e){return Math.max(0,Math.min(255,Math.round(e)||0))}function nl(e){return e=tl(e),(e<16?`0`:``)+e.toString(16)}function rl(e,t,n,r){return r<=0?e=t=n=NaN:n<=0||n>=1?e=t=NaN:t<=0&&(e=NaN),new ol(e,t,n,r)}function il(e){if(e instanceof ol)return new ol(e.h,e.s,e.l,e.opacity);if(e instanceof Dc||(e=Gc(e)),!e)return new ol;if(e instanceof ol)return e;e=e.rgb();var t=e.r/255,n=e.g/255,r=e.b/255,i=Math.min(t,n,r),a=Math.max(t,n,r),o=NaN,s=a-i,c=(a+i)/2;return s?(o=t===a?(n-r)/s+(n<r)*6:n===a?(r-t)/s+2:(t-n)/s+4,s/=c<.5?a+i:2-a-i,o*=60):s=c>0&&c<1?0:o,new ol(o,s,c,e.opacity)}function al(e,t,n,r){return arguments.length===1?il(e):new ol(e,t,n,r??1)}function ol(e,t,n,r){this.h=+e,this.s=+t,this.l=+n,this.opacity=+r}Tc(ol,al,Ec(Dc,{brighter(e){return e=e==null?kc:kc**+e,new ol(this.h,this.s,this.l*e,this.opacity)},darker(e){return e=e==null?Oc:Oc**+e,new ol(this.h,this.s,this.l*e,this.opacity)},rgb(){var e=this.h%360+(this.h<0)*360,t=isNaN(e)||isNaN(this.s)?0:this.s,n=this.l,r=n+(n<.5?n:1-n)*t,i=2*n-r;return new Xc(ll(e>=240?e-240:e+120,i,r),ll(e,i,r),ll(e<120?e+240:e-120,i,r),this.opacity)},clamp(){return new ol(sl(this.h),cl(this.s),cl(this.l),el(this.opacity))},displayable(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl(){let e=el(this.opacity);return`${e===1?`hsl(`:`hsla(`}${sl(this.h)}, ${cl(this.s)*100}%, ${cl(this.l)*100}%${e===1?`)`:`, ${e})`}`}}));function sl(e){return e=(e||0)%360,e<0?e+360:e}function cl(e){return Math.max(0,Math.min(1,e||0))}function ll(e,t,n){return(e<60?t+(n-t)*e/60:e<180?n:e<240?t+(n-t)*(240-e)/60:t)*255}var ul=e=>()=>e;function dl(e,t){return function(n){return e+n*t}}function fl(e,t,n){return e**=+n,t=t**+n-e,n=1/n,function(r){return(e+r*t)**+n}}function pl(e){return(e=+e)==1?ml:function(t,n){return n-t?fl(t,n,e):ul(isNaN(t)?n:t)}}function ml(e,t){var n=t-e;return n?dl(e,n):ul(isNaN(e)?t:e)}var hl=(function e(t){var n=pl(t);function r(e,t){var r=n((e=Yc(e)).r,(t=Yc(t)).r),i=n(e.g,t.g),a=n(e.b,t.b),o=ml(e.opacity,t.opacity);return function(t){return e.r=r(t),e.g=i(t),e.b=a(t),e.opacity=o(t),e+``}}return r.gamma=e,r})(1);function gl(e,t){t||=[];var n=e?Math.min(t.length,e.length):0,r=t.slice(),i;return function(a){for(i=0;i<n;++i)r[i]=e[i]*(1-a)+t[i]*a;return r}}function _l(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function vl(e,t){for(var n=t?t.length:0,r=e?Math.min(n,e.length):0,i=Array(r),a=Array(n),o=0;o<r;++o)i[o]=Dl(e[o],t[o]);for(;o<n;++o)a[o]=t[o];return function(e){for(o=0;o<r;++o)a[o]=i[o](e);return a}}function yl(e,t){var n=new Date;return e=+e,t=+t,function(r){return n.setTime(e*(1-r)+t*r),n}}function bl(e,t){return e=+e,t=+t,function(n){return e*(1-n)+t*n}}function xl(e,t){var n={},r={},i;for(i in typeof e==`object`&&e||(e={}),typeof t==`object`&&t||(t={}),t)i in e?n[i]=Dl(e[i],t[i]):r[i]=t[i];return function(e){for(i in n)r[i]=n[i](e);return r}}var Sl=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,Cl=new RegExp(Sl.source,`g`);function wl(e){return function(){return e}}function Tl(e){return function(t){return e(t)+``}}function El(e,t){var n=Sl.lastIndex=Cl.lastIndex=0,r,i,a,o=-1,s=[],c=[];for(e+=``,t+=``;(r=Sl.exec(e))&&(i=Cl.exec(t));)(a=i.index)>n&&(a=t.slice(n,a),s[o]?s[o]+=a:s[++o]=a),(r=r[0])===(i=i[0])?s[o]?s[o]+=i:s[++o]=i:(s[++o]=null,c.push({i:o,x:bl(r,i)})),n=Cl.lastIndex;return n<t.length&&(a=t.slice(n),s[o]?s[o]+=a:s[++o]=a),s.length<2?c[0]?Tl(c[0].x):wl(t):(t=c.length,function(e){for(var n=0,r;n<t;++n)s[(r=c[n]).i]=r.x(e);return s.join(``)})}function Dl(e,t){var n=typeof t,r;return t==null||n===`boolean`?ul(t):(n===`number`?bl:n===`string`?(r=Gc(t))?(t=r,hl):El:t instanceof Gc?hl:t instanceof Date?yl:_l(t)?gl:Array.isArray(t)?vl:typeof t.valueOf!=`function`&&typeof t.toString!=`function`||isNaN(t)?xl:bl)(e,t)}function Ol(e,t){return e=+e,t=+t,function(n){return Math.round(e*(1-n)+t*n)}}function kl(e){return function(){return e}}function Al(e){return+e}var jl=[0,1];function Ml(e){return e}function Nl(e,t){return(t-=e=+e)?function(n){return(n-e)/t}:kl(isNaN(t)?NaN:.5)}function Pl(e,t){var n;return e>t&&(n=e,e=t,t=n),function(n){return Math.max(e,Math.min(t,n))}}function Fl(e,t,n){var r=e[0],i=e[1],a=t[0],o=t[1];return i<r?(r=Nl(i,r),a=n(o,a)):(r=Nl(r,i),a=n(a,o)),function(e){return a(r(e))}}function Il(e,t,n){var r=Math.min(e.length,t.length)-1,i=Array(r),a=Array(r),o=-1;for(e[r]<e[0]&&(e=e.slice().reverse(),t=t.slice().reverse());++o<r;)i[o]=Nl(e[o],e[o+1]),a[o]=n(t[o],t[o+1]);return function(t){var n=ac(e,t,1,r)-1;return a[n](i[n](t))}}function Ll(e,t){return t.domain(e.domain()).range(e.range()).interpolate(e.interpolate()).clamp(e.clamp()).unknown(e.unknown())}function Rl(){var e=jl,t=jl,n=Dl,r,i,a,o=Ml,s,c,l;function u(){var n=Math.min(e.length,t.length);return o!==Ml&&(o=Pl(e[0],e[n-1])),s=n>2?Il:Fl,c=l=null,d}function d(i){return i==null||isNaN(i=+i)?a:(c||=s(e.map(r),t,n))(r(o(i)))}return d.invert=function(n){return o(i((l||=s(t,e.map(r),bl))(n)))},d.domain=function(t){return arguments.length?(e=Array.from(t,Al),u()):e.slice()},d.range=function(e){return arguments.length?(t=Array.from(e),u()):t.slice()},d.rangeRound=function(e){return t=Array.from(e),n=Ol,u()},d.clamp=function(e){return arguments.length?(o=e?!0:Ml,u()):o!==Ml},d.interpolate=function(e){return arguments.length?(n=e,u()):n},d.unknown=function(e){return arguments.length?(a=e,d):a},function(e,t){return r=e,i=t,u()}}function zl(){return Rl()(Ml,Ml)}function Bl(e){return Math.abs(e=Math.round(e))>=1e21?e.toLocaleString(`en`).replace(/,/g,``):e.toString(10)}function Vl(e,t){if(!isFinite(e)||e===0)return null;var n=(e=t?e.toExponential(t-1):e.toExponential()).indexOf(`e`),r=e.slice(0,n);return[r.length>1?r[0]+r.slice(2):r,+e.slice(n+1)]}function Hl(e){return e=Vl(Math.abs(e)),e?e[1]:NaN}function Ul(e,t){return function(n,r){for(var i=n.length,a=[],o=0,s=e[0],c=0;i>0&&s>0&&(c+s+1>r&&(s=Math.max(1,r-c)),a.push(n.substring(i-=s,i+s)),!((c+=s+1)>r));)s=e[o=(o+1)%e.length];return a.reverse().join(t)}}function Wl(e){return function(t){return t.replace(/[0-9]/g,function(t){return e[+t]})}}var Gl=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function Kl(e){if(!(t=Gl.exec(e)))throw Error(`invalid format: `+e);var t;return new ql({fill:t[1],align:t[2],sign:t[3],symbol:t[4],zero:t[5],width:t[6],comma:t[7],precision:t[8]&&t[8].slice(1),trim:t[9],type:t[10]})}Kl.prototype=ql.prototype;function ql(e){this.fill=e.fill===void 0?` `:e.fill+``,this.align=e.align===void 0?`>`:e.align+``,this.sign=e.sign===void 0?`-`:e.sign+``,this.symbol=e.symbol===void 0?``:e.symbol+``,this.zero=!!e.zero,this.width=e.width===void 0?void 0:+e.width,this.comma=!!e.comma,this.precision=e.precision===void 0?void 0:+e.precision,this.trim=!!e.trim,this.type=e.type===void 0?``:e.type+``}ql.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?`0`:``)+(this.width===void 0?``:Math.max(1,this.width|0))+(this.comma?`,`:``)+(this.precision===void 0?``:`.`+Math.max(0,this.precision|0))+(this.trim?`~`:``)+this.type};function Jl(e){out:for(var t=e.length,n=1,r=-1,i;n<t;++n)switch(e[n]){case`.`:r=i=n;break;case`0`:r===0&&(r=n),i=n;break;default:if(!+e[n])break out;r>0&&(r=0)}return r>0?e.slice(0,r)+e.slice(i+1):e}var Yl;function Xl(e,t){var n=Vl(e,t);if(!n)return Yl=void 0,e.toPrecision(t);var r=n[0],i=n[1],a=i-(Yl=Math.max(-8,Math.min(8,Math.floor(i/3)))*3)+1,o=r.length;return a===o?r:a>o?r+Array(a-o+1).join(`0`):a>0?r.slice(0,a)+`.`+r.slice(a):`0.`+Array(1-a).join(`0`)+Vl(e,Math.max(0,t+a-1))[0]}function Zl(e,t){var n=Vl(e,t);if(!n)return e+``;var r=n[0],i=n[1];return i<0?`0.`+Array(-i).join(`0`)+r:r.length>i+1?r.slice(0,i+1)+`.`+r.slice(i+1):r+Array(i-r.length+2).join(`0`)}var Ql={"%":(e,t)=>(e*100).toFixed(t),b:e=>Math.round(e).toString(2),c:e=>e+``,d:Bl,e:(e,t)=>e.toExponential(t),f:(e,t)=>e.toFixed(t),g:(e,t)=>e.toPrecision(t),o:e=>Math.round(e).toString(8),p:(e,t)=>Zl(e*100,t),r:Zl,s:Xl,X:e=>Math.round(e).toString(16).toUpperCase(),x:e=>Math.round(e).toString(16)};function $l(e){return e}var eu=Array.prototype.map,tu=[`y`,`z`,`a`,`f`,`p`,`n`,`µ`,`m`,``,`k`,`M`,`G`,`T`,`P`,`E`,`Z`,`Y`];function nu(e){var t=e.grouping===void 0||e.thousands===void 0?$l:Ul(eu.call(e.grouping,Number),e.thousands+``),n=e.currency===void 0?``:e.currency[0]+``,r=e.currency===void 0?``:e.currency[1]+``,i=e.decimal===void 0?`.`:e.decimal+``,a=e.numerals===void 0?$l:Wl(eu.call(e.numerals,String)),o=e.percent===void 0?`%`:e.percent+``,s=e.minus===void 0?`−`:e.minus+``,c=e.nan===void 0?`NaN`:e.nan+``;function l(e,l){e=Kl(e);var u=e.fill,d=e.align,f=e.sign,p=e.symbol,m=e.zero,h=e.width,g=e.comma,_=e.precision,v=e.trim,y=e.type;y===`n`?(g=!0,y=`g`):Ql[y]||(_===void 0&&(_=12),v=!0,y=`g`),(m||u===`0`&&d===`=`)&&(m=!0,u=`0`,d=`=`);var b=(l&&l.prefix!==void 0?l.prefix:``)+(p===`$`?n:p===`#`&&/[boxX]/.test(y)?`0`+y.toLowerCase():``),x=(p===`$`?r:/[%p]/.test(y)?o:``)+(l&&l.suffix!==void 0?l.suffix:``),S=Ql[y],C=/[defgprs%]/.test(y);_=_===void 0?6:/[gprs]/.test(y)?Math.max(1,Math.min(21,_)):Math.max(0,Math.min(20,_));function w(e){var n=b,r=x,o,l,p;if(y===`c`)r=S(e)+r,e=``;else{e=+e;var w=e<0||1/e<0;if(e=isNaN(e)?c:S(Math.abs(e),_),v&&(e=Jl(e)),w&&+e==0&&f!==`+`&&(w=!1),n=(w?f===`(`?f:s:f===`-`||f===`(`?``:f)+n,r=(y===`s`&&!isNaN(e)&&Yl!==void 0?tu[8+Yl/3]:``)+r+(w&&f===`(`?`)`:``),C){for(o=-1,l=e.length;++o<l;)if(p=e.charCodeAt(o),48>p||p>57){r=(p===46?i+e.slice(o+1):e.slice(o))+r,e=e.slice(0,o);break}}}g&&!m&&(e=t(e,1/0));var T=n.length+e.length+r.length,E=T<h?Array(h-T+1).join(u):``;switch(g&&m&&(e=t(E+e,E.length?h-r.length:1/0),E=``),d){case`<`:e=n+e+r+E;break;case`=`:e=n+E+e+r;break;case`^`:e=E.slice(0,T=E.length>>1)+n+e+r+E.slice(T);break;default:e=E+n+e+r}return a(e)}return w.toString=function(){return e+``},w}function u(e,t){var n=Math.max(-8,Math.min(8,Math.floor(Hl(t)/3)))*3,r=10**-n,i=l((e=Kl(e),e.type=`f`,e),{suffix:tu[8+n/3]});return function(e){return i(r*e)}}return{format:l,formatPrefix:u}}var ru,iu,au;ou({thousands:`,`,grouping:[3],currency:[`$`,``]});function ou(e){return ru=nu(e),iu=ru.format,au=ru.formatPrefix,ru}function su(e){return Math.max(0,-Hl(Math.abs(e)))}function cu(e,t){return Math.max(0,Math.max(-8,Math.min(8,Math.floor(Hl(t)/3)))*3-Hl(Math.abs(e)))}function lu(e,t){return e=Math.abs(e),t=Math.abs(t)-e,Math.max(0,Hl(t)-Hl(e))+1}function uu(e,t,n,r){var i=_c(e,t,n),a;switch(r=Kl(r??`,f`),r.type){case`s`:var o=Math.max(Math.abs(e),Math.abs(t));return r.precision==null&&!isNaN(a=cu(i,o))&&(r.precision=a),au(r,o);case``:case`e`:case`g`:case`p`:case`r`:r.precision==null&&!isNaN(a=lu(i,Math.max(Math.abs(e),Math.abs(t))))&&(r.precision=a-(r.type===`e`));break;case`f`:case`%`:r.precision==null&&!isNaN(a=su(i))&&(r.precision=a-(r.type===`%`)*2)}return iu(r)}function du(e){var t=e.domain;return e.ticks=function(e){var n=t();return hc(n[0],n[n.length-1],e??10)},e.tickFormat=function(e,n){var r=t();return uu(r[0],r[r.length-1],e??10,n)},e.nice=function(n){n??=10;var r=t(),i=0,a=r.length-1,o=r[i],s=r[a],c,l,u=10;for(s<o&&(l=o,o=s,s=l,l=i,i=a,a=l);u-->0;){if(l=gc(o,s,n),l===c)return r[i]=o,r[a]=s,t(r);if(l>0)o=Math.floor(o/l)*l,s=Math.ceil(s/l)*l;else if(l<0)o=Math.ceil(o*l)/l,s=Math.floor(s*l)/l;else break;c=l}return e},e}function fu(){var e=zl();return e.copy=function(){return Ll(e,fu())},yc.apply(e,arguments),du(e)}function Y(e){return function(){return e}}var pu=Math.abs,mu=Math.atan2,hu=Math.cos,gu=Math.max,_u=Math.min,vu=Math.sin,yu=Math.sqrt,bu=Math.PI,xu=bu/2,Su=2*bu;function Cu(e){return e>1?0:e<-1?bu:Math.acos(e)}function wu(e){return e>=1?xu:e<=-1?-xu:Math.asin(e)}var Tu=Math.PI,Eu=2*Tu,Du=1e-6,Ou=Eu-Du;function ku(e){this._+=e[0];for(let t=1,n=e.length;t<n;++t)this._+=arguments[t]+e[t]}function Au(e){let t=Math.floor(e);if(!(t>=0))throw Error(`invalid digits: ${e}`);if(t>15)return ku;let n=10**t;return function(e){this._+=e[0];for(let t=1,r=e.length;t<r;++t)this._+=Math.round(arguments[t]*n)/n+e[t]}}var ju=class{constructor(e){this._x0=this._y0=this._x1=this._y1=null,this._=``,this._append=e==null?ku:Au(e)}moveTo(e,t){this._append`M${this._x0=this._x1=+e},${this._y0=this._y1=+t}`}closePath(){this._x1!==null&&(this._x1=this._x0,this._y1=this._y0,this._append`Z`)}lineTo(e,t){this._append`L${this._x1=+e},${this._y1=+t}`}quadraticCurveTo(e,t,n,r){this._append`Q${+e},${+t},${this._x1=+n},${this._y1=+r}`}bezierCurveTo(e,t,n,r,i,a){this._append`C${+e},${+t},${+n},${+r},${this._x1=+i},${this._y1=+a}`}arcTo(e,t,n,r,i){if(e=+e,t=+t,n=+n,r=+r,i=+i,i<0)throw Error(`negative radius: ${i}`);let a=this._x1,o=this._y1,s=n-e,c=r-t,l=a-e,u=o-t,d=l*l+u*u;if(this._x1===null)this._append`M${this._x1=e},${this._y1=t}`;else if(d>Du){if(!(Math.abs(u*s-c*l)>Du)||!i)this._append`L${this._x1=e},${this._y1=t}`;else{let f=n-a,p=r-o,m=s*s+c*c,h=f*f+p*p,g=Math.sqrt(m),_=Math.sqrt(d),v=i*Math.tan((Tu-Math.acos((m+d-h)/(2*g*_)))/2),y=v/_,b=v/g;Math.abs(y-1)>Du&&this._append`L${e+y*l},${t+y*u}`,this._append`A${i},${i},0,0,${+(u*f>l*p)},${this._x1=e+b*s},${this._y1=t+b*c}`}}}arc(e,t,n,r,i,a){if(e=+e,t=+t,n=+n,a=!!a,n<0)throw Error(`negative radius: ${n}`);let o=n*Math.cos(r),s=n*Math.sin(r),c=e+o,l=t+s,u=1^a,d=a?r-i:i-r;this._x1===null?this._append`M${c},${l}`:(Math.abs(this._x1-c)>Du||Math.abs(this._y1-l)>Du)&&this._append`L${c},${l}`,n&&(d<0&&(d=d%Eu+Eu),d>Ou?this._append`A${n},${n},0,1,${u},${e-o},${t-s}A${n},${n},0,1,${u},${this._x1=c},${this._y1=l}`:d>Du&&this._append`A${n},${n},0,${+(d>=Tu)},${u},${this._x1=e+n*Math.cos(i)},${this._y1=t+n*Math.sin(i)}`)}rect(e,t,n,r){this._append`M${this._x0=this._x1=+e},${this._y0=this._y1=+t}h${n=+n}v${+r}h${-n}Z`}toString(){return this._}};ju.prototype;function Mu(e){let t=3;return e.digits=function(n){if(!arguments.length)return t;if(n==null)t=null;else{let e=Math.floor(n);if(!(e>=0))throw RangeError(`invalid digits: ${n}`);t=e}return e},()=>new ju(t)}function Nu(e){return e.innerRadius}function Pu(e){return e.outerRadius}function Fu(e){return e.startAngle}function Iu(e){return e.endAngle}function Lu(e){return e&&e.padAngle}function Ru(e,t,n,r,i,a,o,s){var c=n-e,l=r-t,u=o-i,d=s-a,f=d*c-u*l;if(!(f*f<1e-12))return f=(u*(t-a)-d*(e-i))/f,[e+f*c,t+f*l]}function zu(e,t,n,r,i,a,o){var s=e-n,c=t-r,l=(o?a:-a)/yu(s*s+c*c),u=l*c,d=-l*s,f=e+u,p=t+d,m=n+u,h=r+d,g=(f+m)/2,_=(p+h)/2,v=m-f,y=h-p,b=v*v+y*y,x=i-a,S=f*h-m*p,C=(y<0?-1:1)*yu(gu(0,x*x*b-S*S)),w=(S*y-v*C)/b,T=(-S*v-y*C)/b,E=(S*y+v*C)/b,ee=(-S*v+y*C)/b,D=w-g,O=T-_,te=E-g,ne=ee-_;return D*D+O*O>te*te+ne*ne&&(w=E,T=ee),{cx:w,cy:T,x01:-u,y01:-d,x11:w*(i/x-1),y11:T*(i/x-1)}}function Bu(){var e=Nu,t=Pu,n=Y(0),r=null,i=Fu,a=Iu,o=Lu,s=null,c=Mu(l);function l(){var l,u,d=+e.apply(this,arguments),f=+t.apply(this,arguments),p=i.apply(this,arguments)-xu,m=a.apply(this,arguments)-xu,h=pu(m-p),g=m>p;if(s||=l=c(),f<d&&(u=f,f=d,d=u),!(f>1e-12))s.moveTo(0,0);else if(h>Su-1e-12)s.moveTo(f*hu(p),f*vu(p)),s.arc(0,0,f,p,m,!g),d>1e-12&&(s.moveTo(d*hu(m),d*vu(m)),s.arc(0,0,d,m,p,g));else{var _=p,v=m,y=p,b=m,x=h,S=h,C=o.apply(this,arguments)/2,w=C>1e-12&&(r?+r.apply(this,arguments):yu(d*d+f*f)),T=_u(pu(f-d)/2,+n.apply(this,arguments)),E=T,ee=T,D,O;if(w>1e-12){var te=wu(w/d*vu(C)),ne=wu(w/f*vu(C));(x-=te*2)>1e-12?(te*=g?1:-1,y+=te,b-=te):(x=0,y=b=(p+m)/2),(S-=ne*2)>1e-12?(ne*=g?1:-1,_+=ne,v-=ne):(S=0,_=v=(p+m)/2)}var re=f*hu(_),ie=f*vu(_),k=d*hu(b),ae=d*vu(b);if(T>1e-12){var oe=f*hu(v),se=f*vu(v),A=d*hu(y),ce=d*vu(y),j;if(h<bu){if(j=Ru(re,ie,A,ce,oe,se,k,ae)){var M=re-j[0],le=ie-j[1],N=oe-j[0],ue=se-j[1],de=1/vu(Cu((M*N+le*ue)/(yu(M*M+le*le)*yu(N*N+ue*ue)))/2),fe=yu(j[0]*j[0]+j[1]*j[1]);E=_u(T,(d-fe)/(de-1)),ee=_u(T,(f-fe)/(de+1))}else E=ee=0}}S>1e-12?ee>1e-12?(D=zu(A,ce,re,ie,f,ee,g),O=zu(oe,se,k,ae,f,ee,g),s.moveTo(D.cx+D.x01,D.cy+D.y01),ee<T?s.arc(D.cx,D.cy,ee,mu(D.y01,D.x01),mu(O.y01,O.x01),!g):(s.arc(D.cx,D.cy,ee,mu(D.y01,D.x01),mu(D.y11,D.x11),!g),s.arc(0,0,f,mu(D.cy+D.y11,D.cx+D.x11),mu(O.cy+O.y11,O.cx+O.x11),!g),s.arc(O.cx,O.cy,ee,mu(O.y11,O.x11),mu(O.y01,O.x01),!g))):(s.moveTo(re,ie),s.arc(0,0,f,_,v,!g)):s.moveTo(re,ie),!(d>1e-12)||!(x>1e-12)?s.lineTo(k,ae):E>1e-12?(D=zu(k,ae,oe,se,d,-E,g),O=zu(re,ie,A,ce,d,-E,g),s.lineTo(D.cx+D.x01,D.cy+D.y01),E<T?s.arc(D.cx,D.cy,E,mu(D.y01,D.x01),mu(O.y01,O.x01),!g):(s.arc(D.cx,D.cy,E,mu(D.y01,D.x01),mu(D.y11,D.x11),!g),s.arc(0,0,d,mu(D.cy+D.y11,D.cx+D.x11),mu(O.cy+O.y11,O.cx+O.x11),g),s.arc(O.cx,O.cy,E,mu(O.y11,O.x11),mu(O.y01,O.x01),!g))):s.arc(0,0,d,b,y,g)}if(s.closePath(),l)return s=null,l+``||null}return l.centroid=function(){var n=(+e.apply(this,arguments)+ +t.apply(this,arguments))/2,r=(+i.apply(this,arguments)+ +a.apply(this,arguments))/2-bu/2;return[hu(r)*n,vu(r)*n]},l.innerRadius=function(t){return arguments.length?(e=typeof t==`function`?t:Y(+t),l):e},l.outerRadius=function(e){return arguments.length?(t=typeof e==`function`?e:Y(+e),l):t},l.cornerRadius=function(e){return arguments.length?(n=typeof e==`function`?e:Y(+e),l):n},l.padRadius=function(e){return arguments.length?(r=e==null?null:typeof e==`function`?e:Y(+e),l):r},l.startAngle=function(e){return arguments.length?(i=typeof e==`function`?e:Y(+e),l):i},l.endAngle=function(e){return arguments.length?(a=typeof e==`function`?e:Y(+e),l):a},l.padAngle=function(e){return arguments.length?(o=typeof e==`function`?e:Y(+e),l):o},l.context=function(e){return arguments.length?(s=e??null,l):s},l}Array.prototype.slice;function Vu(e){return typeof e==`object`&&`length`in e?e:Array.from(e)}function Hu(e){this._context=e}Hu.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line=1-this._line},point:function(e,t){switch(e=+e,t=+t,this._point){case 0:this._point=1,this._line?this._context.lineTo(e,t):this._context.moveTo(e,t);break;case 1:this._point=2;default:this._context.lineTo(e,t)}}};function Uu(e){return new Hu(e)}function Wu(e){return e[0]}function Gu(e){return e[1]}function Ku(e,t){var n=Y(!0),r=null,i=Uu,a=null,o=Mu(s);e=typeof e==`function`?e:e===void 0?Wu:Y(e),t=typeof t==`function`?t:t===void 0?Gu:Y(t);function s(s){var c,l=(s=Vu(s)).length,u,d=!1,f;for(r??(a=i(f=o())),c=0;c<=l;++c)!(c<l&&n(u=s[c],c,s))===d&&((d=!d)?a.lineStart():a.lineEnd()),d&&a.point(+e(u,c,s),+t(u,c,s));if(f)return a=null,f+``||null}return s.x=function(t){return arguments.length?(e=typeof t==`function`?t:Y(+t),s):e},s.y=function(e){return arguments.length?(t=typeof e==`function`?e:Y(+e),s):t},s.defined=function(e){return arguments.length?(n=typeof e==`function`?e:Y(!!e),s):n},s.curve=function(e){return arguments.length?(i=e,r!=null&&(a=i(r)),s):i},s.context=function(e){return arguments.length?(e==null?r=a=null:a=i(r=e),s):r},s}function qu(e,t,n){var r=null,i=Y(!0),a=null,o=Uu,s=null,c=Mu(l);e=typeof e==`function`?e:e===void 0?Wu:Y(+e),t=typeof t==`function`?t:Y(t===void 0?0:+t),n=typeof n==`function`?n:n===void 0?Gu:Y(+n);function l(l){var u,d,f,p=(l=Vu(l)).length,m,h=!1,g,_=Array(p),v=Array(p);for(a??(s=o(g=c())),u=0;u<=p;++u){if(!(u<p&&i(m=l[u],u,l))===h){if(h=!h)d=u,s.areaStart(),s.lineStart();else{for(s.lineEnd(),s.lineStart(),f=u-1;f>=d;--f)s.point(_[f],v[f]);s.lineEnd(),s.areaEnd()}}h&&(_[u]=+e(m,u,l),v[u]=+t(m,u,l),s.point(r?+r(m,u,l):_[u],n?+n(m,u,l):v[u]))}if(g)return s=null,g+``||null}function u(){return Ku().defined(i).curve(o).context(a)}return l.x=function(t){return arguments.length?(e=typeof t==`function`?t:Y(+t),r=null,l):e},l.x0=function(t){return arguments.length?(e=typeof t==`function`?t:Y(+t),l):e},l.x1=function(e){return arguments.length?(r=e==null?null:typeof e==`function`?e:Y(+e),l):r},l.y=function(e){return arguments.length?(t=typeof e==`function`?e:Y(+e),n=null,l):t},l.y0=function(e){return arguments.length?(t=typeof e==`function`?e:Y(+e),l):t},l.y1=function(e){return arguments.length?(n=e==null?null:typeof e==`function`?e:Y(+e),l):n},l.lineX0=l.lineY0=function(){return u().x(e).y(t)},l.lineY1=function(){return u().x(e).y(n)},l.lineX1=function(){return u().x(r).y(t)},l.defined=function(e){return arguments.length?(i=typeof e==`function`?e:Y(!!e),l):i},l.curve=function(e){return arguments.length?(o=e,a!=null&&(s=o(a)),l):o},l.context=function(e){return arguments.length?(e==null?a=s=null:s=o(a=e),l):a},l}function Ju(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function Yu(e){return e}function Xu(){var e=Yu,t=Ju,n=null,r=Y(0),i=Y(Su),a=Y(0);function o(o){var s,c=(o=Vu(o)).length,l,u,d=0,f=Array(c),p=Array(c),m=+r.apply(this,arguments),h=Math.min(Su,Math.max(-Su,i.apply(this,arguments)-m)),g,_=Math.min(Math.abs(h)/c,a.apply(this,arguments)),v=_*(h<0?-1:1),y;for(s=0;s<c;++s)(y=p[f[s]=s]=+e(o[s],s,o))>0&&(d+=y);for(t==null?n!=null&&f.sort(function(e,t){return n(o[e],o[t])}):f.sort(function(e,n){return t(p[e],p[n])}),s=0,u=d?(h-c*v)/d:0;s<c;++s,m=g)l=f[s],y=p[l],g=m+(y>0?y*u:0)+v,p[l]={data:o[l],index:s,value:y,startAngle:m,endAngle:g,padAngle:_};return p}return o.value=function(t){return arguments.length?(e=typeof t==`function`?t:Y(+t),o):e},o.sortValues=function(e){return arguments.length?(t=e,n=null,o):t},o.sort=function(e){return arguments.length?(n=e,t=null,o):n},o.startAngle=function(e){return arguments.length?(r=typeof e==`function`?e:Y(+e),o):r},o.endAngle=function(e){return arguments.length?(i=typeof e==`function`?e:Y(+e),o):i},o.padAngle=function(e){return arguments.length?(a=typeof e==`function`?e:Y(+e),o):a},o}function Zu(e){return e<0?-1:1}function Qu(e,t,n){var r=e._x1-e._x0,i=t-e._x1,a=(e._y1-e._y0)/(r||i<0&&-0),o=(n-e._y1)/(i||r<0&&-0),s=(a*i+o*r)/(r+i);return(Zu(a)+Zu(o))*Math.min(Math.abs(a),Math.abs(o),.5*Math.abs(s))||0}function $u(e,t){var n=e._x1-e._x0;return n?(3*(e._y1-e._y0)/n-t)/2:t}function ed(e,t,n){var r=e._x0,i=e._y0,a=e._x1,o=e._y1,s=(a-r)/3;e._context.bezierCurveTo(r+s,i+s*t,a-s,o-s*n,a,o)}function td(e){this._context=e}td.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=this._t0=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x1,this._y1);break;case 3:ed(this,this._t0,$u(this,this._t0))}(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line=1-this._line},point:function(e,t){var n=NaN;if(e=+e,t=+t,e!==this._x1||t!==this._y1){switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(e,t):this._context.moveTo(e,t);break;case 1:this._point=2;break;case 2:this._point=3,ed(this,$u(this,n=Qu(this,e,t)),n);break;default:ed(this,this._t0,n=Qu(this,e,t))}this._x0=this._x1,this._x1=e,this._y0=this._y1,this._y1=t,this._t0=n}}},Object.create(td.prototype).point=function(e,t){td.prototype.point.call(this,t,e)};function nd(e){return new td(e)}function rd(e){this._context=e}rd.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=[],this._y=[]},lineEnd:function(){var e=this._x,t=this._y,n=e.length;if(n){if(this._line?this._context.lineTo(e[0],t[0]):this._context.moveTo(e[0],t[0]),n===2)this._context.lineTo(e[1],t[1]);else for(var r=id(e),i=id(t),a=0,o=1;o<n;++a,++o)this._context.bezierCurveTo(r[0][a],i[0][a],r[1][a],i[1][a],e[o],t[o])}(this._line||this._line!==0&&n===1)&&this._context.closePath(),this._line=1-this._line,this._x=this._y=null},point:function(e,t){this._x.push(+e),this._y.push(+t)}};function id(e){var t,n=e.length-1,r,i=Array(n),a=Array(n),o=Array(n);for(i[0]=0,a[0]=2,o[0]=e[0]+2*e[1],t=1;t<n-1;++t)i[t]=1,a[t]=4,o[t]=4*e[t]+2*e[t+1];for(i[n-1]=2,a[n-1]=7,o[n-1]=8*e[n-1]+e[n],t=1;t<n;++t)r=i[t]/a[t-1],a[t]-=r,o[t]-=r*o[t-1];for(i[n-1]=o[n-1]/a[n-1],t=n-2;t>=0;--t)i[t]=(o[t]-i[t+1])/a[t];for(a[n-1]=(e[n]+i[n-1])/2,t=0;t<n-1;++t)a[t]=2*e[t+1]-i[t+1];return[i,a]}function ad(e){return new rd(e)}function od(e,t){this._context=e,this._t=t}od.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=this._y=NaN,this._point=0},lineEnd:function(){0<this._t&&this._t<1&&this._point===2&&this._context.lineTo(this._x,this._y),(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line>=0&&(this._t=1-this._t,this._line=1-this._line)},point:function(e,t){switch(e=+e,t=+t,this._point){case 0:this._point=1,this._line?this._context.lineTo(e,t):this._context.moveTo(e,t);break;case 1:this._point=2;default:if(this._t<=0)this._context.lineTo(this._x,t),this._context.lineTo(e,t);else{var n=this._x*(1-this._t)+e*this._t;this._context.lineTo(n,this._y),this._context.lineTo(n,t)}}this._x=e,this._y=t}};function sd(e){return new od(e,.5)}function cd(e){return new od(e,0)}function ld(e){return new od(e,1)}function ud(e){return!Number.isFinite(e)||e<480?`xs`:e<768?`sm`:e<1024?`md`:e<1280?`lg`:`xl`}var dd=class{breakpoint=`md`;width=0;height=0;host;options;observer=null;constructor(e,t={}){this.host=e,this.options=t,this.breakpoint=t.initialBreakpoint??`md`,this.host.addController(this)}hostConnected(){typeof ResizeObserver<`u`&&(this.observer=new ResizeObserver(e=>{let t=e[0];if(!t)return;let n=0,r=0;t.contentRect?(n=t.contentRect.width,r=t.contentRect.height):t.borderBoxSize?.[0]&&(n=t.borderBoxSize[0].inlineSize,r=t.borderBoxSize[0].blockSize),this.updateDimensions(n,r)}),this.observer.observe(this.host));let e=this.host.getBoundingClientRect?.();e&&(e.width>0||e.height>0)&&this.updateDimensions(e.width,e.height)}hostDisconnected(){this.observer?.disconnect(),this.observer=null}updateDimensions(e,t){let n=ud(e),r=n!==this.breakpoint,i=e!==this.width||t!==this.height;this.width=e,this.height=t,this.breakpoint=n,(r||this.options.observeDimensions&&i)&&this.host.requestUpdate()}};function fd(e){return`var(--color-chart-${(e%8+8)%8+1})`}function pd(e,t,n,r=8){let i=t.getBoundingClientRect(),a=e.offsetWidth,o=e.offsetHeight,s=n.left+n.width/2-i.left,c=Math.min(Math.max(s-a/2,0),Math.max(i.width-a,0)),l=n.top-i.top-r-o,u=l>=0?l:n.bottom-i.top+r;e.style.translate=`${Math.round(c)}px ${Math.round(u)}px`}var md=[J,M`
    :host {
      display: block;
      width: 100%;
      position: relative;
      user-select: none;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
    }

    .chart-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .chart-svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .grid-line {
      stroke: var(--color-separator, oklch(0.92 0.004 286.32));
      stroke-dasharray: 3 3;
      stroke-width: 1;
      shape-rendering: crispEdges;
    }

    .axis-label {
      fill: var(--color-muted, oklch(0.55 0.014 285.94));
      font-size: var(--font-size-xs, 0.75rem);
      font-family: var(--font-family-base, inherit);
      font-variant-numeric: tabular-nums;
    }

    .axis-label-x {
      text-anchor: middle;
      dominant-baseline: hanging;
    }

    .axis-label-y {
      text-anchor: end;
      dominant-baseline: central;
    }

    .area-path,
    .chart-area {
      pointer-events: none;
    }

    .stroke-path,
    .area-stroke,
    .chart-line {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      pointer-events: none;
    }

    /* Charts usually sit on a card, so the dot ring matches the surface. */
    .point-marker {
      stroke: var(--color-surface, #ffffff);
      stroke-width: 2;
      cursor: pointer;
      transition:
        r 150ms var(--ease-out, ease-out),
        transform 150ms var(--ease-out, ease-out);
    }

    .point-marker:hover {
      r: 6;
    }

    [part~="empty"],
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 200px;
      color: var(--color-muted, #71717a);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding: var(--spacing-8, 2rem) var(--spacing-4, 1rem);
      text-align: center;
    }

    .empty-message {
      margin: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .point-marker {
        transition: none;
      }
    }
  `];W(`moul-area-chart`,class extends U{static styles=md;static properties={data:{attribute:!1},xKey:{type:String,attribute:`x-key`},series:{attribute:!1},height:{type:Number},stacked:{type:Boolean},showGrid:{type:Boolean,attribute:`show-grid`,converter:{fromAttribute:e=>e!==null&&e!==`false`,toAttribute:e=>e?``:null}},valueFormatter:{attribute:!1}};layout;chartId=Math.random().toString(36).slice(2,9);constructor(){super(),this.data=[],this.xKey=`name`,this.series=[],this.height=300,this.stacked=!1,this.showGrid=!0,this.valueFormatter=void 0,this.layout=new dd(this,{observeDimensions:!0})}get hasData(){return Array.isArray(this.data)&&this.data.length>0}get effectiveSeries(){if(Array.isArray(this.series)&&this.series.length>0)return this.series;if(!this.hasData)return[];let e=this.data[0];return e?Object.keys(e).filter(t=>{if(t===this.xKey)return!1;let n=e[t],r=typeof n==`number`?n:Number(n);return(typeof n==`number`||typeof n==`string`&&n.trim()!==``)&&Number.isFinite(r)}).map((e,t)=>({key:e,name:e,color:fd(t)})):[]}updated(e){super.updated(e),(e.has(`data`)||e.has(`series`)||e.has(`stacked`))&&this.animateAreaPaths()}hasPlayedEntrance=!1;animateAreaPaths(){if(this.hasPlayedEntrance||ws())return;let e=this.renderRoot?.querySelectorAll(`.area-path, .chart-area`),t=this.renderRoot?.querySelectorAll(`.stroke-path, .area-stroke, .chart-line`);(e?.length||t?.length)&&(this.hasPlayedEntrance=!0),e&&e.length>0&&q(e,{opacity:[0,1]},{duration:.35,ease:Cs}),t&&t.length>0&&q(t,{opacity:[0,1]},{duration:.35,ease:Cs})}handlePointHover(e,t,n,r,i){let a={point:e.rawData,series:t,value:e.rawVal,label:e.xVal,x:n,y:r};this.dispatchEvent(new CustomEvent(`point-hover`,{bubbles:!0,composed:!0,detail:a}))}handlePointLeave(){this.dispatchEvent(new CustomEvent(`point-leave`,{bubbles:!0,composed:!0}))}render(){if(!this.hasData)return B`
        <div part="empty" class="empty-state">
          <slot name="empty">
            <p class="empty-message">No data available</p>
          </slot>
        </div>
      `;let e=this.effectiveSeries;if(e.length===0)return B`
        <div part="empty" class="empty-state">
          <slot name="empty">
            <p class="empty-message">No data available</p>
          </slot>
        </div>
      `;let t=this.layout.width>0?this.layout.width:this.clientWidth>0?this.clientWidth:600,n=this.height>0?this.height:300,r={top:16,right:16,bottom:28,left:40},i=this.data.map(e=>String(e[this.xKey]??``)),a=wc().domain(i).range([r.left,t-r.right]),o=Array(this.data.length).fill(0),s=Array(this.data.length).fill(0),c=[],l=0,u=0;e.forEach((e,t)=>{let n=e.color??fd(t),r=`area-grad-${this.chartId}-${e.key.replace(/[^a-zA-Z0-9_-]/g,`-`)}`,i=[];this.data.forEach((t,n)=>{let r=String(t[this.xKey]??``),a=t[e.key],c=Number(a),d=Number.isFinite(c)?c:0,f=0,p=0;this.stacked?d>=0?(f=o[n],p=o[n]+d,o[n]+=d):(f=s[n],p=s[n]+d,s[n]+=d):(f=0,p=d),Number.isFinite(f)||(f=0),Number.isFinite(p)||(p=0),l=Math.min(l,f,p),u=Math.max(u,f,p),i.push({xVal:r,rawVal:d,y0:f,y1:p,rawData:t})}),c.push({series:e,color:n,gradId:r,points:i})});let d=l<0?l:0,f=u>0?u:1;d===f&&(f=d+1),Math.abs(f-d)<1e-6&&(d<0&&f>0?(d=-1,f=1):f<=0?(d=-1,f=0):(d=0,f=1));let p=fu().domain([d,f]).range([n-r.bottom,r.top]).nice(),m=qu().defined(e=>Number.isFinite(e.y0)&&Number.isFinite(e.y1)).x(e=>{let t=a(e.xVal)??r.left;return Number.isFinite(t)?t:r.left}).y0(e=>{let t=p(e.y0);return Number.isFinite(t)?t:n-r.bottom}).y1(e=>{let t=p(e.y1);return Number.isFinite(t)?t:n-r.bottom}).curve(nd),h=Ku().defined(e=>Number.isFinite(e.y1)).x(e=>{let t=a(e.xVal)??r.left;return Number.isFinite(t)?t:r.left}).y(e=>{let t=p(e.y1);return Number.isFinite(t)?t:n-r.bottom}).curve(nd),g=[];try{g=p.ticks(5)}catch{g=[d,(d+f)/2,f]}return g&&g.length!==0||(g=[d,(d+f)/2,f]),B`
      <div
        part="container"
        class="chart-container"
        style="height: ${n}px;"
        @pointerleave=${this.handlePointLeave}
      >
        <svg
          part="svg"
          class="chart-svg"
          viewBox="0 0 ${t} ${n}"
          height="${n}"
          preserveAspectRatio="none"
        >
          <defs>
            ${c.map(e=>V`
                <linearGradient
                  id="${e.gradId}"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stop-color="${e.color}"
                    stop-opacity="0.25"
                  ></stop>
                  <stop
                    offset="100%"
                    stop-color="${e.color}"
                    stop-opacity="0"
                  ></stop>
                </linearGradient>
              `)}
          </defs>

          <!-- Grid Lines and Y-Axis Labels -->
          ${this.showGrid?V`
                <g part="grid" class="grid-group">
                  ${g.map(e=>{let n=p(e);return Number.isFinite(n)?V`
                      <line
                        class="grid-line"
                        part="grid"
                        x1="${r.left}"
                        y1="${n}"
                        x2="${t-r.right}"
                        y2="${n}"
                      ></line>
                      <text
                        class="axis-label axis-label-y"
                        x="${r.left-8}"
                        y="${n}"
                      >
                        ${this.valueFormatter?this.valueFormatter(e):String(e)}
                      </text>
                    `:V``})}
                </g>
              `:``}

          <!-- X-Axis Labels -->
          <g part="x-axis" class="axis-group-x">
            ${i.map(e=>V`
                <text
                  class="axis-label axis-label-x"
                  x="${a(e)??r.left}"
                  y="${n-r.bottom+8}"
                >
                  ${e}
                </text>
              `)}
          </g>

          <!-- Area Paths and Boundary Lines -->
          <g part="series" class="series-group">
            ${c.map(e=>{let t=m(e.points)??``,i=h(e.points)??``;if(e.points.length===1){let o=e.points[0],s=a(o.xVal)??r.left,c=p(o.y1),l=p(o.y0),u=Number.isFinite(c)?c:n-r.bottom,d=Number.isFinite(l)?l:n-r.bottom;t=`M ${s-2} ${d} L ${s-2} ${u} L ${s+2} ${u} L ${s+2} ${d} Z`,i=`M ${s-2} ${u} L ${s+2} ${u}`}return V`
                <g class="series-layer" data-series="${e.series.key}">
                  <path
                    class="chart-area area-path"
                    part="area"
                    d="${t}"
                    fill="url(#${e.gradId})"
                  ></path>
                  <path
                    class="chart-line area-stroke stroke-path"
                    part="line stroke"
                    d="${i}"
                    stroke="${e.color}"
                    stroke-width="${e.series.strokeWidth??2}"
                    fill="none"
                  ></path>
                </g>
              `})}
          </g>

          <!-- Interactive Data Points (Exactly 1 circle per data point) -->
          <g part="points" class="points-group">
            ${c.map(e=>e.points.map(t=>{if(!Number.isFinite(t.rawVal))return V``;let n=a(t.xVal)??r.left,i=p(t.y1);if(!Number.isFinite(i))return V``;let o=i;return V`
                  <circle
                    class="point-marker"
                    part="point"
                    cx="${n}"
                    cy="${o}"
                    r="4"
                    fill="${e.color}"
                    @pointerenter=${r=>this.handlePointHover(t,e.series,n,o,r)}
                    @pointerleave=${this.handlePointLeave}
                  ></circle>
                `}))}
          </g>
        </svg>
      </div>
    `}});var hd=[J,M`
    :host {
      display: inline-flex;
      position: relative;
      align-items: center;
      justify-content: center;
      /* Neutral fill behind initials and the fallback glyph */
      background-color: var(--color-default);
      color: var(--color-default-fg);
      font-weight: var(--font-weight-medium, 500);
      user-select: none;
      box-sizing: border-box;
      vertical-align: middle;
      flex-shrink: 0;
      line-height: 1;
    }

    /* Shapes */
    :host([shape="circle"]),
    :host(:not([shape])) {
      border-radius: var(--radius-full, 9999px);
    }

    :host([shape="square"]) {
      border-radius: var(--radius-xl, 0.75rem);
    }

    /* Sizes */
    :host([size="xs"]) {
      width: 1.5rem;
      height: 1.5rem;
      font-size: 0.625rem;
    }

    :host([size="sm"]) {
      width: 2rem;
      height: 2rem;
      font-size: var(--font-size-xs, 0.75rem);
    }

    :host([size="md"]),
    :host(:not([size])) {
      width: 2.5rem;
      height: 2.5rem;
      font-size: var(--font-size-sm, 0.875rem);
    }

    :host([size="lg"]) {
      width: 3rem;
      height: 3rem;
      font-size: var(--font-size-md, 1rem);
    }

    :host([size="xl"]) {
      width: 4rem;
      height: 4rem;
      font-size: var(--font-size-xl, 1.25rem);
    }

    [part~="image"] {
      width: 100%;
      height: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: inherit;
      display: block;
    }

    [part~="initials"] {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      text-transform: uppercase;
    }

    [part~="fallback"] {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: var(--color-muted);
    }

    [part~="fallback"] svg {
      width: 60%;
      height: 60%;
    }

    /* Status indicator dot, ringed in the surface color it usually sits on */
    [part~="status"] {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 25%;
      height: 25%;
      min-width: 8px;
      min-height: 8px;
      border-radius: var(--radius-full, 9999px);
      border: 2px solid var(--color-surface);
      box-sizing: content-box;
      z-index: 1;
    }

    .status-online {
      background-color: var(--color-success);
    }

    .status-offline {
      background-color: var(--color-muted);
    }

    .status-away {
      background-color: var(--color-warning);
    }

    .status-busy {
      background-color: var(--color-danger);
    }
  `],gd=[J,M`
    :host {
      display: inline-flex;
      align-items: center;
      flex-direction: row;
      --_overlap: 0.5rem;
      --_seam: 2px;
    }

    /* Overlapping stack; a seam in the surface color separates neighbours */
    ::slotted(moul-avatar) {
      box-shadow: 0 0 0 var(--_seam) var(--color-surface);
    }

    ::slotted(moul-avatar:not(:first-child)) {
      margin-inline-start: calc(-1 * var(--_overlap));
    }

    ::slotted(moul-avatar:hover) {
      z-index: 2;
    }

    .overflow-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      margin-inline-start: calc(-1 * var(--_overlap));
      box-shadow: 0 0 0 var(--_seam) var(--color-surface);
      background-color: var(--color-default);
      color: var(--color-default-fg);
      font-weight: var(--font-weight-medium, 500);
      line-height: 1;
      border-radius: var(--radius-full, 9999px);
      z-index: 1;
    }

    :host([size="xs"]) .overflow-badge {
      width: 1.5rem;
      height: 1.5rem;
      font-size: 0.625rem;
    }

    :host([size="sm"]) .overflow-badge {
      width: 2rem;
      height: 2rem;
      font-size: var(--font-size-xs, 0.75rem);
    }

    :host([size="md"]) .overflow-badge,
    :host(:not([size])) .overflow-badge {
      width: 2.5rem;
      height: 2.5rem;
      font-size: var(--font-size-sm, 0.875rem);
    }

    :host([size="lg"]) .overflow-badge {
      width: 3rem;
      height: 3rem;
      font-size: var(--font-size-md, 1rem);
    }

    :host([size="xl"]) .overflow-badge {
      width: 4rem;
      height: 4rem;
      font-size: var(--font-size-xl, 1.25rem);
    }
  `];function _d(e){let t=e?.trim()??``;if(!t)return``;let n=t.split(/\s+/);return n.length===1?(n[0][0]??``).toUpperCase():((n[0][0]??``)+(n[1][0]??``)).toUpperCase()}W(`moul-avatar`,class extends U{static styles=hd;static properties={src:{type:String,reflect:!0},name:{type:String,reflect:!0},size:{type:String},shape:{type:String,reflect:!0},status:{type:String,reflect:!0},hasImageError:{state:!0}};_size;get size(){return this._size??this.getAttribute(`size`)??`md`}set size(e){let t=this.size;this._size=e,e?this.getAttribute(`size`)!==e&&this.setAttribute(`size`,e):this.removeAttribute(`size`),this.requestUpdate(`size`,t)}constructor(){super(),this.src=``,this.name=``,this.shape=`circle`,this.hasImageError=!1}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`img`),this.updateAriaLabel()}willUpdate(e){super.willUpdate(e),e.has(`src`)&&(this.hasImageError=!1)}updated(e){super.updated(e),e.has(`src`)&&(this.hasImageError=!1),e.has(`name`)&&this.updateAriaLabel()}updateAriaLabel(){this.setAttribute(`aria-label`,this.name?.trim()||`Avatar`)}handleImageError=e=>{this.hasImageError=!0,this.dispatchEvent(new CustomEvent(`error`,{bubbles:!0,composed:!0,detail:{originalError:e}})),this.requestUpdate()};handleImageLoad=e=>{let t=e.currentTarget;q(t,{opacity:[0,1]},{duration:.18})};render(){let e=!!this.src&&!this.hasImageError,t=_d(this.name);return B`
      ${e?B`
            <img
              part="image"
              src=${this.src}
              alt=${this.name||`Avatar`}
              @error=${this.handleImageError}
              @load=${this.handleImageLoad}
            />
          `:t?B`<span part="initials">${t}</span>`:B`
              <slot name="fallback">
                <span part="fallback">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </span>
              </slot>
            `}
      ${this.status?B`
            <span
              part="status"
              class="status-dot status-${this.status}"
              aria-label="Status: ${this.status}"
            ></span>
          `:``}
    `}}),W(`moul-avatar-group`,class extends U{static styles=gd;static properties={max:{type:Number,reflect:!0},size:{type:String,reflect:!0},totalAvatars:{state:!0}};groupAssignedAvatars=new WeakSet;constructor(){super(),this.max=5,this.size=`md`,this.totalAvatars=0}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`group`),this.setAttribute(`aria-label`,`Avatar group`)}firstUpdated(){this.handleSlotChange()}handleSlotChange=()=>{let e=((this.shadowRoot?.querySelector(`slot`))?.assignedElements()??[]).filter(e=>e.tagName.toLowerCase()===`moul-avatar`);this.totalAvatars=e.length,e.forEach((e,t)=>{this.size&&(!e.hasAttribute(`size`)||this.groupAssignedAvatars.has(e))&&(this.groupAssignedAvatars.add(e),e.size=this.size),t>=this.max?e.style.display=`none`:e.style.display=``})};updated(e){super.updated(e),(e.has(`max`)||e.has(`size`))&&this.handleSlotChange()}render(){let e=Math.max(0,this.totalAvatars-this.max);return B`
      <slot @slotchange=${this.handleSlotChange}></slot>
      ${e>0?B`<span class="overflow-badge" part="overflow">+${e}</span>`:``}
    `}});var vd=[J,ut,M`
    /* Chip-style label: soft tone fill (the default flat variant), 16px corners, xs medium text */
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-1, 0.25rem);
      font-weight: var(--font-weight-medium, 500);
      white-space: nowrap;
      border-radius: var(--radius-2xl, 1rem);
      vertical-align: middle;
      box-sizing: border-box;
      flex-shrink: 0;
      line-height: var(--line-height-sm, 1.25rem);
    }

    [part~="base"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
      height: 100%;
    }

    :host([size="sm"]) {
      height: 1.25rem;
      padding: 0 calc(var(--spacing-1, 0.25rem) + 0.125rem);
      font-size: var(--font-size-xs, 0.75rem);
    }

    :host([size="md"]),
    :host(:not([size])) {
      height: 1.5rem;
      padding: 0 calc(var(--spacing-2, 0.5rem) + 0.125rem);
      font-size: var(--font-size-xs, 0.75rem);
    }

    :host([size="lg"]) {
      height: 1.75rem;
      padding: 0 calc(var(--spacing-3, 0.75rem) + 0.125rem);
      font-size: var(--font-size-sm, 0.875rem);
    }

    /* Dot badge: a solid tone fill so the dot reads at a few pixels */
    :host([is-dot]) {
      min-width: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
      padding: 0;
      border-radius: var(--radius-full, 9999px);
      overflow: hidden;
    }

    :host([is-dot][variant="flat"]),
    :host([is-dot]:not([variant])) {
      background-color: var(--_tone-solid-bg);
    }

    :host([is-dot][size="sm"]) {
      min-width: 0.375rem;
      width: 0.375rem;
      height: 0.375rem;
      padding: 0;
    }

    :host([is-dot][size="md"]),
    :host([is-dot]:not([size])) {
      min-width: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
      padding: 0;
    }

    :host([is-dot][size="lg"]) {
      min-width: 0.625rem;
      width: 0.625rem;
      height: 0.625rem;
      padding: 0;
    }

    :host([is-dot]) [part~="base"] {
      display: none;
    }

    ::slotted([slot="prefix"]),
    ::slotted([slot="suffix"]) {
      display: inline-flex;
      align-items: center;
      font-size: 0.9em;
    }
  `];W(`moul-badge`,class extends U{static styles=vd;static properties={tone:{type:String,reflect:!0},variant:{type:String,reflect:!0},size:{type:String,reflect:!0},isDot:{type:Boolean,reflect:!0,attribute:`is-dot`}};constructor(){super(),this.tone=`primary`,this.variant=`flat`,this.size=`md`,this.isDot=!1}willUpdate(e){if(super.willUpdate(e),e.has(`tone`)){let e=ct(this.tone);this.tone!==e&&(this.tone=e)}if(e.has(`variant`)){let e=lt(this.variant);this.variant!==e&&(this.variant=e)}}render(){return B`
      <span part="base">
        <slot name="prefix" part="prefix"></slot>
        <slot part="content"></slot>
        <slot name="suffix" part="suffix"></slot>
      </span>
    `}});var yd=[J,M`
    :host {
      display: block;
      position: relative;
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      overflow: hidden;
    }

    .chart-container {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .chart-svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .grid-line {
      stroke: var(--color-separator, oklch(0.92 0.004 286.32));
      stroke-dasharray: 3 3;
      stroke-width: 1;
      shape-rendering: crispEdges;
    }

    .axis-line {
      stroke: var(--color-border, oklch(0.9 0.004 286.32));
      stroke-width: 1;
      shape-rendering: crispEdges;
    }

    .axis-tick {
      fill: var(--color-muted, oklch(0.55 0.014 285.94));
      font-size: var(--font-size-xs, 0.75rem);
      font-family: var(--font-family-base, inherit);
      font-variant-numeric: tabular-nums;
      user-select: none;
    }

    .chart-bar {
      cursor: pointer;
      transition: opacity var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    .chart-bar:hover,
    .chart-bar.is-active {
      opacity: 0.8;
    }

    [part~="empty"],
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 200px;
      color: var(--color-muted, #71717a);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding: var(--spacing-8, 2rem) var(--spacing-4, 1rem);
      text-align: center;
    }

    .empty-message {
      margin: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .chart-bar {
        transition: none;
      }
    }
  `];W(`moul-bar-chart`,class extends U{static styles=yd;static properties={data:{attribute:!1},xKey:{type:String,attribute:`x-key`},series:{attribute:!1},height:{type:Number},layout:{type:String},stacked:{type:Boolean,converter:{fromAttribute:e=>e!==null&&e!==`false`,toAttribute:e=>e?``:null}},showGrid:{type:Boolean,attribute:`show-grid`,converter:{fromAttribute:e=>e!==null&&e!==`false`,toAttribute:e=>e?``:null}},valueFormatter:{attribute:!1}};layoutController;activeBar=null;constructor(){super(),this.data=[],this.xKey=`name`,this.series=[],this.height=300,this.layout=`vertical`,this.stacked=!1,this.showGrid=!0,this.valueFormatter=void 0,this.layoutController=new dd(this,{observeDimensions:!0})}get containerWidth(){return this.layoutController.width>0?this.layoutController.width:this.clientWidth>0?this.clientWidth:600}get containerHeight(){return this.height>0?this.height:300}updated(e){super.updated(e),(e.has(`data`)||e.has(`series`)||e.has(`layout`)||e.has(`stacked`))&&this.animateBars()}hasPlayedEntrance=!1;animateBars(){if(this.hasPlayedEntrance||ws())return;let e=this.renderRoot?.querySelectorAll(`rect.chart-bar, [part="bar"]`);e&&e.length>0&&(this.hasPlayedEntrance=!0,q(e,{opacity:[0,1]},{duration:.35,ease:Cs,delay:qo(.025)}))}getActiveSeries(){if(this.series&&this.series.length>0)return this.series;if(!this.data||this.data.length===0)return[];let e=this.data[0]||{};return Object.keys(e).filter(e=>e!==this.xKey).filter(t=>{let n=e[t],r=typeof n==`number`?n:Number(n);return(typeof n==`number`||typeof n==`string`&&n.trim()!==``)&&Number.isFinite(r)}).map((e,t)=>({key:e,name:e,color:fd(t)}))}handleBarEnter(e,t,n,r,i,a,o,s){this.activeBar={seriesKey:n.key,category:o,index:s},this.requestUpdate(),this.dispatchEvent(new CustomEvent(`point-hover`,{bubbles:!0,composed:!0,detail:{point:t,series:n,value:a,label:o,x:Math.round(r),y:Math.round(i)}}))}handleBarLeave(e){this.activeBar=null,this.requestUpdate(),this.dispatchEvent(new CustomEvent(`point-leave`,{bubbles:!0,composed:!0}))}render(){if(!this.data||!Array.isArray(this.data)||this.data.length===0)return B`
        <div part="empty" class="empty-state">
          <slot name="empty">
            <p class="empty-message">No data available</p>
          </slot>
        </div>
      `;let e=this.getActiveSeries();if(e.length===0)return B`
        <div part="empty" class="empty-state">
          <slot name="empty">
            <p class="empty-message">No data available</p>
          </slot>
        </div>
      `;let t=this.containerWidth,n=this.containerHeight,r=this.layout===`horizontal`,i=r?{top:20,right:24,bottom:32,left:64}:{top:20,right:20,bottom:32,left:48},a=this.data.map(e=>String(e[this.xKey]??``)),o=0,s=1;if(this.stacked){let t=[],n=[];for(let r of this.data){let i=0,a=0;for(let t of e){let e=r[t.key];if(e!=null){let t=Number(e);Number.isFinite(t)&&(t>=0?i+=t:a+=t)}}t.push(i),n.push(a)}let r=t.length>0?Math.max(...t):0,i=n.length>0?Math.min(...n):0;i<0?(o=i,s=Math.max(0,r)):(o=0,s=r>0?r:1)}else{let t=[];for(let n of this.data)for(let r of e){let e=n[r.key];if(e!=null){let n=Number(e);Number.isFinite(n)&&t.push(n)}}if(t.length>0){let e=Math.min(...t),n=Math.max(...t);e===n?e===0?(o=0,s=1):e>0?(o=0,s=n*1.2):(o=e*1.2,s=0):e<0?(o=e,s=Math.max(0,n)):(o=0,s=n||1)}}Math.abs(s-o)<1e-6&&(o<0&&s>0?(o=-1,s=1):s<=0?(o=-1,s=0):(o=0,s=1));let c=e.map(e=>e.key);if(!r){let r=Sc().domain(a).range([i.left,t-i.right]).paddingInner(.2).paddingOuter(.1),l=fu().domain([o,s]).range([n-i.bottom,i.top]).nice(),u=l(0),d=Number.isFinite(u)?Math.min(Math.max(u,i.top),n-i.bottom):n-i.bottom,f=[];try{f=l.ticks(5)}catch{f=[o,(o+s)/2,s]}f&&f.length!==0||(f=[o,(o+s)/2,s]);let p=Sc().domain(c).range([0,r.bandwidth()]).padding(.05);return B`
        <div class="chart-container" style="width: 100%; height: ${n}px; position: relative;">
          <svg
            class="chart-svg"
            viewBox="0 0 ${t} ${n}"
            height="${n}"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Bar chart"
          >
            <!-- Grid Lines -->
            ${this.showGrid?V`
                  <g class="grid-group" part="grid" aria-hidden="true">
                    ${f.map(e=>{let n=l(e);return Number.isFinite(n)?V`
                        <line
                          class="grid-line"
                          part="grid"
                          x1="${i.left}"
                          y1="${n}"
                          x2="${t-i.right}"
                          y2="${n}"
                        />
                      `:V``})}
                  </g>
                `:``}

            <!-- X Axis Baseline -->
            <line
              class="axis-line"
              x1="${i.left}"
              y1="${d}"
              x2="${t-i.right}"
              y2="${d}"
            />

            <!-- Y Axis Tick Labels -->
            <g class="y-axis-labels" aria-hidden="true">
              ${f.map(e=>{let t=l(e);if(!Number.isFinite(t))return V``;let n=this.valueFormatter?this.valueFormatter(e):String(e);return V`
                  <text
                    class="axis-tick y-tick"
                    x="${i.left-8}"
                    y="${t}"
                    text-anchor="end"
                    dominant-baseline="middle"
                  >
                    ${n}
                  </text>
                `})}
            </g>

            <!-- X Axis Category Labels -->
            <g class="x-axis-labels" aria-hidden="true">
              ${this.data.map(e=>{let t=String(e[this.xKey]??``);return V`
                  <text
                    class="axis-tick x-tick"
                    x="${(r(t)??0)+r.bandwidth()/2}"
                    y="${n-i.bottom+18}"
                    text-anchor="middle"
                    dominant-baseline="hanging"
                  >
                    ${t}
                  </text>
                `})}
            </g>

            <!-- Bars -->
            <g class="bars-group">
              ${this.data.map((t,n)=>{let i=String(t[this.xKey]??``),a=r(i)??0,o=0,s=0;return e.map((e,c)=>{let u=Number(t[e.key]),f=Number.isFinite(u)?u:0,m=e.color||fd(c),h=0,g=0,_=0,v=0,y=0,b=0;if(this.stacked){if(h=a,_=Math.max(1,r.bandwidth()),f>=0){let e=o,t=o+f;o+=f,g=l(t),v=Math.max(0,l(e)-l(t)),b=g}else{let e=s,t=s+f;s+=f,g=l(e),v=Math.max(0,l(t)-l(e)),b=g+v}y=h+_/2}else{h=a+(p(e.key)??0),_=Math.max(1,p.bandwidth());let t=l(f);g=Math.min(t,d),v=Math.max(0,Math.abs(t-d)),y=h+_/2,b=t}return V`
                    <rect
                      class="chart-bar ${this.activeBar?.seriesKey===e.key&&this.activeBar?.index===n?`is-active`:``}"
                      part="bar"
                      data-series-key="${e.key}"
                      data-category="${i}"
                      data-index="${n}"
                      x="${h}"
                      y="${g}"
                      width="${_}"
                      height="${v}"
                      fill="${m}"
                      rx="3"
                      ry="3"
                      cursor="pointer"
                      @pointerenter="${r=>this.handleBarEnter(r,t,e,y,b,f,i,n)}"
                      @pointerleave="${e=>this.handleBarLeave(e)}"
                    />
                  `})})}
            </g>
          </svg>
        </div>
      `}let l=Sc().domain(a).range([i.top,n-i.bottom]).paddingInner(.2).paddingOuter(.1),u=fu().domain([o,s]).range([i.left,t-i.right]).nice(),d=u(0),f=Number.isFinite(d)?Math.min(Math.max(d,i.left),t-i.right):i.left,p=[];try{p=u.ticks(5)}catch{p=[o,(o+s)/2,s]}p&&p.length!==0||(p=[o,(o+s)/2,s]);let m=Sc().domain(c).range([0,l.bandwidth()]).padding(.05);return B`
      <div class="chart-container" style="width: 100%; height: ${n}px; position: relative;">
        <svg
          class="chart-svg"
          viewBox="0 0 ${t} ${n}"
          height="${n}"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Bar chart"
        >
          <!-- Grid Lines -->
          ${this.showGrid?V`
                <g class="grid-group" part="grid" aria-hidden="true">
                  ${p.map(e=>{let t=u(e);return Number.isFinite(t)?V`
                      <line
                        class="grid-line"
                        part="grid"
                        x1="${t}"
                        y1="${i.top}"
                        x2="${t}"
                        y2="${n-i.bottom}"
                      />
                    `:V``})}
                </g>
              `:``}

          <!-- Y Axis Baseline -->
          <line
            class="axis-line"
            x1="${f}"
            y1="${i.top}"
            x2="${f}"
            y2="${n-i.bottom}"
          />

          <!-- Y Axis Category Labels -->
          <g class="y-axis-labels" aria-hidden="true">
            ${this.data.map(e=>{let t=String(e[this.xKey]??``),n=(l(t)??0)+l.bandwidth()/2;return V`
                <text
                  class="axis-tick y-tick"
                  x="${i.left-8}"
                  y="${n}"
                  text-anchor="end"
                  dominant-baseline="middle"
                >
                  ${t}
                </text>
              `})}
          </g>

          <!-- X Axis Metric Labels -->
          <g class="x-axis-labels" aria-hidden="true">
            ${p.map(e=>{let t=u(e);if(!Number.isFinite(t))return V``;let r=this.valueFormatter?this.valueFormatter(e):String(e);return V`
                <text
                  class="axis-tick x-tick"
                  x="${t}"
                  y="${n-i.bottom+18}"
                  text-anchor="middle"
                  dominant-baseline="hanging"
                >
                  ${r}
                </text>
              `})}
          </g>

          <!-- Bars -->
          <g class="bars-group">
            ${this.data.map((t,n)=>{let r=String(t[this.xKey]??``),i=l(r)??0,a=0,o=0;return e.map((e,s)=>{let c=Number(t[e.key]),d=Number.isFinite(c)?c:0,p=e.color||fd(s),h=0,g=0,_=0,v=0,y=0,b=0;if(this.stacked){if(g=i,v=Math.max(1,l.bandwidth()),d>=0){let e=a,t=a+d;a+=d,h=u(e),_=Math.max(0,u(t)-u(e)),y=h+_}else{let e=o,t=o+d;o+=d,h=u(t),_=Math.max(0,u(e)-u(t)),y=h}b=g+v/2}else{g=i+(m(e.key)??0),v=Math.max(1,m.bandwidth());let t=u(d);h=Math.min(t,f),_=Math.max(0,Math.abs(t-f)),y=d>=0?h+_:h,b=g+v/2}return V`
                  <rect
                    class="chart-bar ${this.activeBar?.seriesKey===e.key&&this.activeBar?.index===n?`is-active`:``}"
                    part="bar"
                    data-series-key="${e.key}"
                    data-category="${r}"
                    data-index="${n}"
                    x="${h}"
                    y="${g}"
                    width="${_}"
                    height="${v}"
                    fill="${p}"
                    rx="3"
                    ry="3"
                    cursor="pointer"
                    @pointerenter="${i=>this.handleBarEnter(i,t,e,y,b,d,r,n)}"
                    @pointerleave="${e=>this.handleBarLeave(e)}"
                  />
                `})})}
          </g>
        </svg>
      </div>
    `}});var bd=[J,M`
    :host {
      display: block;
    }

    [part~="base"] {
      display: flex;
      padding: 0;
      margin: 0;
    }

    [part~="list"] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      list-style: none;
      padding: 0;
      margin: 0;
      gap: 0.375rem;
    }
  `],xd=[J,M`
    :host {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-muted);
    }

    [part~="item"] {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1, 0.25rem);
      list-style: none;
    }

    [part~="link"] {
      color: inherit;
      text-decoration: none;
      border-radius: var(--radius-sm, 0.25rem);
      outline: none;
      cursor: pointer;
      transition:
        color 100ms var(--ease-smooth, ease),
        box-shadow 150ms var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      [part~="link"]:hover {
        text-decoration: underline;
      }
    }

    [part~="link"]:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    :host([is-current]) [part~="text"],
    [aria-current="page"] {
      color: var(--color-link, var(--color-fg));
      pointer-events: none;
    }

    [part~="separator"] {
      display: inline-flex;
      align-items: center;
      color: var(--color-muted);
      user-select: none;
    }

    [part~="separator"] ::slotted(svg) {
      width: 0.75rem;
      height: 0.75rem;
    }

    [part~="separator"]:dir(rtl) ::slotted(svg) {
      rotate: 180deg;
    }

    :host(:last-of-type) [part~="separator"],
    :host(:last-child) [part~="separator"] {
      display: none !important;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~="link"] {
        transition: none;
      }
    }
  `];W(`moul-breadcrumb-item`,class extends U{static styles=xd;static properties={href:{type:String,reflect:!0},isCurrent:{type:Boolean,reflect:!0,attribute:`is-current`},separator:{type:String}};constructor(){super(),this.href=``,this.isCurrent=!1,this.separator=``}render(){return B`
      <li part="item">
        ${this.href&&!this.isCurrent?B`<a part="link" href=${this.href}><slot></slot></a>`:B`<span part="text" aria-current=${this.isCurrent?`page`:H}><slot></slot></span>`}
        <span part="separator" aria-hidden="true">
          <slot name="separator">${this.separator||`/`}</slot>
        </span>
      </li>
    `}}),W(`moul-breadcrumbs`,class extends U{static styles=bd;static properties={separator:{type:String,reflect:!0}};constructor(){super(),this.separator=`/`}updated(e){super.updated(e),e.has(`separator`)&&this.syncSeparatorToChildren()}handleSlotChange(){this.syncSeparatorToChildren()}syncSeparatorToChildren(){let e=Array.from(this.querySelectorAll(`moul-breadcrumb-item`));for(let t of e)t.hasAttribute(`separator`)&&t.separator!==``||(t.separator=this.separator)}render(){return B`
      <nav part="base" aria-label="Breadcrumb">
        <ol part="list">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </ol>
      </nav>
    `}});var Sd=.1,Cd=.16,wd=class{isPressed=!1;isHovered=!1;isFocusVisible=!1;host;options;shouldSyncAriaPressed=!1;isPointerFocus=!1;activeAnimation=null;isPointerPress=!1;isMouseHover=!1;handlePointerDown=e=>{this.isPointerFocus=!0,!(this.isDisabled()||e.button!==0)&&(this.isPressed=!0,this.isPointerPress=!0,this.syncAriaPressed(),this.animateTransform(),this.host.requestUpdate())};handlePointerUp=()=>{this.isPressed&&(this.isPressed=!1,this.isPointerPress=!1,this.syncAriaPressed(),this.animateTransform(),this.host.requestUpdate())};handlePointerCancel=()=>{this.isPressed&&(this.isPressed=!1,this.isPointerPress=!1,this.syncAriaPressed(),this.animateTransform(),this.host.requestUpdate())};handlePointerEnter=e=>{this.isDisabled()||(this.isHovered=!0,this.isMouseHover=e.pointerType===`mouse`,this.animateTransform(),this.host.requestUpdate())};handlePointerLeave=()=>{this.isHovered=!1,this.isMouseHover=!1,this.isPressed&&(this.isPressed=!1,this.syncAriaPressed()),this.isPointerPress=!1,this.animateTransform(),this.host.requestUpdate()};handleKeyDown=e=>{this.isPointerFocus=!1,this.isDisabled()||e.repeat||e.key!==` `&&e.key!==`Enter`||this.isPressed||(this.isPressed=!0,this.isFocusVisible=!0,this.syncAriaPressed(),this.host.requestUpdate())};handleKeyUp=e=>{(e.key===` `||e.key===`Enter`)&&this.isPressed&&(this.isPressed=!1,this.syncAriaPressed(),this.host.requestUpdate())};handleFocusIn=()=>{if(!this.isDisabled()){try{this.isFocusVisible=!this.isPointerFocus||(this.host.matches?.(`:focus-visible`)??!1)}catch{this.isFocusVisible=!this.isPointerFocus}this.host.requestUpdate()}};handleFocusOut=()=>{this.isFocusVisible=!1,this.isPointerFocus=!1,this.isPressed&&(this.isPressed=!1,this.syncAriaPressed()),this.isPointerPress&&(this.isPointerPress=!1,this.animateTransform()),this.host.requestUpdate()};constructor(e,t={}){this.host=e,this.options=t,this.host.addController(this)}hostConnected(){let e=this.host.getAttribute?.(`type`),t=this.host.hasAttribute?.(`aria-pressed`)??!1;this.shouldSyncAriaPressed=e===`button`||e===`checkbox`||t,this.shouldSyncAriaPressed&&this.host.setAttribute(`aria-pressed`,String(this.isPressed));let n=this.host;n.addEventListener?.(`pointerdown`,this.handlePointerDown),n.addEventListener?.(`pointerup`,this.handlePointerUp),n.addEventListener?.(`pointercancel`,this.handlePointerCancel),n.addEventListener?.(`pointerenter`,this.handlePointerEnter),n.addEventListener?.(`pointerleave`,this.handlePointerLeave),n.addEventListener?.(`keydown`,this.handleKeyDown),n.addEventListener?.(`keyup`,this.handleKeyUp),n.addEventListener?.(`focusin`,this.handleFocusIn),n.addEventListener?.(`focusout`,this.handleFocusOut)}hostDisconnected(){let e=this.host;e.removeEventListener?.(`pointerdown`,this.handlePointerDown),e.removeEventListener?.(`pointerup`,this.handlePointerUp),e.removeEventListener?.(`pointercancel`,this.handlePointerCancel),e.removeEventListener?.(`pointerenter`,this.handlePointerEnter),e.removeEventListener?.(`pointerleave`,this.handlePointerLeave),e.removeEventListener?.(`keydown`,this.handleKeyDown),e.removeEventListener?.(`keyup`,this.handleKeyUp),e.removeEventListener?.(`focusin`,this.handleFocusIn),e.removeEventListener?.(`focusout`,this.handleFocusOut),this.activeAnimation?.stop(),this.activeAnimation=null,this.isPressed=!1,this.isPointerPress=!1,this.isHovered=!1,this.isMouseHover=!1,this.isFocusVisible=!1,this.isPointerFocus=!1}isDisabled(){if(this.options.disabled?.())return!0;let e=this.host;return(e.hasAttribute?.(`disabled`)??!1)||(e.hasAttribute?.(`is-disabled`)??!1)||!!e.disabled||!!e.isDisabled}syncAriaPressed(){this.shouldSyncAriaPressed&&this.host.setAttribute(`aria-pressed`,String(this.isPressed))}getAnimationTarget(){return this.options.target?this.options.target():this.host}animateTransform(){let{scaleOnPress:e,hoverLift:t}=this.options;if(!e&&!t||ws())return;let n=this.getAnimationTarget();if(!n)return;let r=!!e&&this.isPressed&&this.isPointerPress,i={opacity:1,scale:r?typeof e==`number`?e:.97:1,y:t&&this.isHovered&&this.isMouseHover?typeof t==`number`?t:-2:0},a=As(n);!this.activeAnimation&&a.scale===i.scale&&a.y===i.y||(this.activeAnimation?.stop(),this.activeAnimation=vs(n,{transform:[ks(a),ks(i)]},{duration:r?Sd:Cd,ease:Ss}))}};function Td(e,t,n=!1){if(typeof process<`u`)return;let r=e.getAttribute(`aria-label`)?.trim(),i=e.getAttribute(`aria-labelledby`)?.trim();if(!(r||i)&&!n){let n=e.tagName?e.tagName.toLowerCase():`element`;console.warn(`[@moul-dev/ui] <${n}> is missing an accessible label (${t}). Provide an "aria-label" or "aria-labelledby" attribute.`)}}var Ed=[J,M`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      vertical-align: middle;
      color: currentColor;
      pointer-events: none;
    }

    [part~="base"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .spinner-svg {
      display: block;
      width: 100%;
      height: 100%;
      animation: moul-spin 0.75s linear infinite;
    }

    :host([size="sm"]) [part~="base"] {
      width: 1rem;
      height: 1rem;
    }

    :host([size="md"]) [part~="base"],
    :host(:not([size])) [part~="base"] {
      width: 1.5rem;
      height: 1.5rem;
    }

    :host([size="lg"]) [part~="base"] {
      width: 2rem;
      height: 2rem;
    }

    @keyframes moul-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes moul-spin-pulse {
      50% {
        opacity: 0.4;
      }
    }

    /* Reduced motion: no rotation, but a slow pulse still says "working" */
    @media (prefers-reduced-motion: reduce) {
      .spinner-svg {
        animation: moul-spin-pulse 1.5s var(--ease-smooth, ease) infinite;
      }
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `];W(`moul-spinner`,class extends U{static styles=Ed;static properties={size:{type:String,reflect:!0},label:{type:String,reflect:!0}};constructor(){super(),this.size=`md`,this.label=`Loading`}render(){return B`
      <div part="base" role="status" aria-label=${this.label}>
        ${yt(`spinner-svg`)}
        <span class="sr-only">${this.label}</span>
      </div>
    `}});var Dd=[J,M`
    :host {
      display: inline-flex;
      vertical-align: middle;
      position: relative;
      font-family: var(--font-family-base, inherit);
      border-radius: var(--radius-3xl, 1.5rem);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      --_press-scale: var(--press-scale, 0.97);
      -webkit-user-select: none;
      cursor: pointer;
    }

    [part~="button"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border-radius: inherit;
      border: 1px solid transparent;
      background-color: var(--_bg);
      color: var(--_fg);
      font-family: inherit;
      font-weight: var(--font-weight-medium, 500);
      line-height: 1;
      text-decoration: none;
      transform-origin: center;
      transition:
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        box-shadow 100ms var(--ease-out, ease-out),
        opacity var(--duration-fast, 150ms) ease;
      cursor: pointer;
      position: relative;
      white-space: nowrap;
    }

    /* Sizes */
    :host([size="sm"]) {
      --_press-scale: 0.98;
    }

    :host([size="lg"]) {
      --_press-scale: 0.96;
    }

    :host([size="sm"]) [part~="button"] {
      height: 2rem;
      padding: 0 var(--spacing-3, 0.75rem);
      font-size: var(--font-size-sm, 0.875rem);
      gap: var(--spacing-1, 0.25rem);
    }

    :host([size="md"]) [part~="button"],
    :host(:not([size])) [part~="button"] {
      height: 2.25rem;
      padding: 0 var(--spacing-4, 1rem);
      font-size: var(--font-size-sm, 0.875rem);
      gap: var(--spacing-2, 0.5rem);
    }

    :host([size="lg"]) [part~="button"] {
      height: 2.5rem;
      padding: 0 var(--spacing-4, 1rem);
      font-size: var(--font-size-md, 1rem);
      gap: var(--spacing-2, 0.5rem);
    }

    /* Icon-only size variants */
    :host([is-icon][size="sm"]) [part~="button"] {
      width: 2rem;
      padding: 0;
    }

    :host([is-icon][size="md"]) [part~="button"],
    :host([is-icon]:not([size])) [part~="button"] {
      width: 2.25rem;
      padding: 0;
    }

    :host([is-icon][size="lg"]) [part~="button"] {
      width: 2.5rem;
      padding: 0;
    }

    /* Variants: each sets the fill trio; the shared rules below apply it. */
    :host([variant="primary"]),
    :host(:not([variant])) {
      --_bg: var(--color-accent);
      --_bg-hover: var(--color-accent-hover);
      --_fg: var(--color-accent-fg);
    }

    :host([variant="secondary"]) {
      --_bg: var(--color-default);
      --_bg-hover: var(--color-default-hover);
      --_fg: var(--color-accent-soft-fg);
    }

    :host([variant="tertiary"]) {
      --_bg: var(--color-default);
      --_bg-hover: var(--color-default-hover);
      --_fg: var(--color-default-fg);
    }

    :host([variant="ghost"]),
    :host([variant="outline"]) {
      --_bg: transparent;
      --_bg-hover: var(--color-default);
      --_fg: var(--color-default-fg);
    }

    :host([variant="outline"]) {
      --_bg-hover: color-mix(in srgb, var(--color-default) 60%, transparent);
    }

    :host([variant="outline"]) [part~="button"] {
      border-color: var(--color-border);
    }

    :host([variant="danger"]) {
      --_bg: var(--color-danger);
      --_bg-hover: var(--color-danger-hover);
      --_fg: var(--color-danger-fg);
    }

    :host([variant="danger-soft"]) {
      --_bg: var(--color-danger-soft);
      --_bg-hover: var(--color-danger-soft-hover);
      --_fg: var(--color-danger-soft-fg);
    }

    @media (hover: hover) {
      :host(:not([is-disabled]):not([is-pending])) [part~="button"]:hover {
        background-color: var(--_bg-hover);
      }
    }

    :host(:not([is-disabled]):not([is-pending])) [part~="button"]:active {
      background-color: var(--_bg-hover);
      transform: scale(var(--_press-scale));
    }

    [part~="button"]:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    /* Disabled State */
    :host([is-disabled]) {
      cursor: not-allowed;
      pointer-events: none;
    }

    :host([is-disabled]) [part~="button"] {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Pending State */
    :host([is-pending]) {
      cursor: wait;
      pointer-events: none;
    }

    :host([is-pending]) [part~="button"] {
      cursor: wait;
      pointer-events: none;
    }

    .spinner {
      margin-inline-end: var(--spacing-2, 0.5rem);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    :host([is-icon]) .spinner {
      margin-inline-end: 0;
    }

    .content {
      display: inline-flex;
      align-items: center;
      gap: inherit;
    }

    ::slotted([slot="prefix"]),
    ::slotted([slot="suffix"]) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    ::slotted(svg) {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~="button"] {
        transition: none;
      }

      :host(:not([is-disabled]):not([is-pending])) [part~="button"]:active {
        transform: none;
      }
    }
  `];W(`moul-button`,class extends U{static styles=Dd;static properties={variant:{type:String,reflect:!0},size:{type:String,reflect:!0},type:{type:String,reflect:!0},isIcon:{type:Boolean,reflect:!0,attribute:`is-icon`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isPending:{type:Boolean,reflect:!0,attribute:`is-pending`}};pressController;pressHandledInCycle=!1;constructor(){super(),this.variant=`primary`,this.size=`md`,this.type=`button`,this.isIcon=!1,this.isDisabled=!1,this.isPending=!1,this.pressController=new wd(this,{disabled:()=>this.isDisabled||this.isPending})}connectedCallback(){super.connectedCallback(),this.addEventListener(`pointerdown`,this.handlePointerDown),this.addEventListener(`pointerup`,this.handlePointerUp),this.addEventListener(`click`,this.handleClick),this.addEventListener(`keydown`,this.handleKeyDown),this.addEventListener(`keyup`,this.handleKeyUp)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`pointerdown`,this.handlePointerDown),this.removeEventListener(`pointerup`,this.handlePointerUp),this.removeEventListener(`click`,this.handleClick),this.removeEventListener(`keydown`,this.handleKeyDown),this.removeEventListener(`keyup`,this.handleKeyUp)}updated(e){if(super.updated(e),e.has(`isPending`)&&(this.isPending?this.setAttribute(`aria-busy`,`true`):this.removeAttribute(`aria-busy`)),e.has(`isDisabled`)&&(this.isDisabled?this.setAttribute(`aria-disabled`,`true`):this.removeAttribute(`aria-disabled`)),this.isIcon){let e=!!this.textContent?.trim();Td(this,`icon-only button`,e)}}handlePointerDown=e=>{this.isDisabled||this.isPending||e.button!==0||(this.pressHandledInCycle=!1)};handlePointerUp=e=>{this.isDisabled||this.isPending||e.button!==0||(this.dispatchPressEvent(e),this.pressHandledInCycle=!0,queueMicrotask(()=>{this.pressHandledInCycle=!1}))};handleClick=e=>{this.isDisabled||this.isPending?(e.preventDefault(),e.stopImmediatePropagation()):(this.pressHandledInCycle||this.dispatchPressEvent(e),this.pressHandledInCycle=!1,this.handleFormIntegration())};handleKeyDown=e=>{this.isDisabled||this.isPending||e.repeat||(e.key===` `||e.key===`Enter`)&&(this.pressHandledInCycle=!1)};handleKeyUp=e=>{this.isDisabled||this.isPending||(e.key===` `||e.key===`Enter`)&&(this.dispatchPressEvent(e),this.pressHandledInCycle=!0,queueMicrotask(()=>{this.pressHandledInCycle=!1}))};dispatchPressEvent(e){this.dispatchEvent(new CustomEvent(`press`,{bubbles:!0,composed:!0,detail:{originalEvent:e}}))}handleFormIntegration(){let e=this.closest(`form, moul-form`);e&&(this.type===`submit`?e instanceof HTMLFormElement&&typeof e.requestSubmit==`function`?e.requestSubmit():e.submit():this.type===`reset`&&e.reset())}render(){return B`
      <button
        part="button"
        type=${this.type}
        ?disabled=${this.isDisabled}
        aria-busy=${this.isPending?`true`:`false`}
        aria-disabled=${this.isDisabled?`true`:`false`}
      >
        ${this.isPending?B`<moul-spinner size="sm" part="spinner" class="spinner"></moul-spinner>`:``}
        <slot name="prefix" part="prefix"></slot>
        <span part="content" class="content"><slot></slot></span>
        <slot name="suffix" part="suffix"></slot>
      </button>
    `}});var Od=[J,M`
    :host {
      display: inline-flex;
      vertical-align: middle;
      position: relative;
      box-sizing: border-box;
    }

    [part~="base"] {
      display: inline-flex;
      justify-content: center;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    /* Orientation */
    :host([orientation="horizontal"]),
    :host(:not([orientation])) {
      flex-direction: row;
    }

    :host([orientation="horizontal"]) [part~="base"],
    :host(:not([orientation])) [part~="base"] {
      flex-direction: row;
      align-items: center;
    }

    :host([orientation="vertical"]) {
      flex-direction: column;
    }

    :host([orientation="vertical"]) [part~="base"] {
      flex-direction: column;
      align-items: stretch;
    }

    /* Spacing */
    :host([spacing="none"]) [part~="base"] {
      gap: 0;
    }

    :host([spacing="sm"]) [part~="base"],
    :host(:not([spacing])) [part~="base"] {
      gap: var(--spacing-1, 0.25rem);
    }

    :host([spacing="md"]) [part~="base"] {
      gap: var(--spacing-2, 0.5rem);
    }

    /*
     * Attached group (spacing="none"): the buttons read as one pill, rounded
     * only at the outer ends. Buttons keep their own radius-3xl at the ends;
     * inner corners are squared off and 1px borders overlap.
     */
    :host([spacing="none"]) ::slotted(*) {
      /* No press scale inside an attached group */
      --_press-scale: 1;
    }

    /* Raise the focused button so its offset ring paints over its neighbors */
    :host([spacing="none"]) ::slotted(:focus-within) {
      z-index: 1;
    }

    /* Horizontal collapse */
    :host([spacing="none"]:not([orientation="vertical"])) ::slotted(*:not(:first-child):not(:last-child)) {
      border-radius: 0 !important;
      margin-inline-start: -1px;
    }

    :host([spacing="none"]:not([orientation="vertical"])) ::slotted(*:first-child:not(:last-child)) {
      border-start-end-radius: 0 !important;
      border-end-end-radius: 0 !important;
    }

    :host([spacing="none"]:not([orientation="vertical"])) ::slotted(*:last-child:not(:first-child)) {
      border-start-start-radius: 0 !important;
      border-end-start-radius: 0 !important;
      margin-inline-start: -1px;
    }

    /* Vertical collapse */
    :host([spacing="none"][orientation="vertical"]) ::slotted(*:not(:first-child):not(:last-child)) {
      border-radius: 0 !important;
      margin-block-start: -1px;
    }

    :host([spacing="none"][orientation="vertical"]) ::slotted(*:first-child:not(:last-child)) {
      border-end-start-radius: 0 !important;
      border-end-end-radius: 0 !important;
    }

    :host([spacing="none"][orientation="vertical"]) ::slotted(*:last-child:not(:first-child)) {
      border-start-start-radius: 0 !important;
      border-start-end-radius: 0 !important;
      margin-block-start: -1px;
    }

    /*
     * Separators: a 1px divider over the middle half of each inner edge, in the
     * button's own foreground at 15%. It sits in the 1px overlap with the previous
     * button; outline buttons skip it since their collapsed border divides them.
     */
    :host([spacing="none"]:not([orientation="vertical"])) ::slotted(:not(:first-child):not([variant="outline"])) {
      border-inline-start: 1px solid transparent;
      border-image: linear-gradient(
          transparent 25%,
          color-mix(in oklab, var(--_fg, currentColor) 15%, transparent) 25% 75%,
          transparent 75%
        )
        1;
    }

    :host([spacing="none"][orientation="vertical"]) ::slotted(:not(:first-child):not([variant="outline"])) {
      border-block-start: 1px solid transparent;
      border-image: linear-gradient(
          to right,
          transparent 25%,
          color-mix(in oklab, var(--_fg, currentColor) 15%, transparent) 25% 75%,
          transparent 75%
        )
        1;
    }

    /* Disabled state: moul buttons dim themselves; dim anything else here */
    :host([is-disabled]) {
      cursor: not-allowed;
      pointer-events: none;
    }

    :host([is-disabled]) ::slotted(:not(moul-button):not(moul-toggle-button)) {
      opacity: var(--disabled-opacity, 0.5);
    }
  `];W(`moul-button-group`,class extends U{static styles=Od;static properties={orientation:{type:String,reflect:!0},spacing:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`}};constructor(){super(),this.orientation=`horizontal`,this.spacing=`sm`,this.isDisabled=!1}connectedCallback(){super.connectedCallback(),this.hasAttribute(`role`)||this.setAttribute(`role`,`group`),this.setAttribute(`aria-orientation`,this.orientation),this.syncDisabledState()}updated(e){super.updated(e),e.has(`orientation`)&&this.setAttribute(`aria-orientation`,this.orientation),e.has(`isDisabled`)&&this.syncDisabledState()}handleSlotChange=()=>{this.syncDisabledState()};syncDisabledState(){let e=this.shadowRoot?.querySelector(`slot`);(e?e.assignedElements({flatten:!0}):Array.from(this.children)).forEach(e=>{`isDisabled`in e?e.isDisabled=this.isDisabled:e instanceof HTMLElement&&(this.isDisabled?e.setAttribute(`is-disabled`,``):e.removeAttribute(`is-disabled`))})}render(){return B`
      <div part="base">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `}});var kd=[J,M`
    :host {
      display: inline-block;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      text-align: start;
      user-select: none;
      -webkit-user-select: none;
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: inline-flex;
      flex-direction: column;
      width: 15.75rem;
      max-width: 100%;
    }

    /* Month on the leading edge, previous/next grouped on the trailing edge */
    [part~='header'] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0.125rem var(--spacing-4, 1rem);
    }

    [part~='heading'] {
      order: 0;
      flex: 1;
      margin: 0;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg, inherit);
      text-align: start;
    }

    [part~='nav-btn-prev'] {
      order: 1;
    }

    [part~='nav-btn-next'] {
      order: 2;
    }

    [part~='nav-btn'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: var(--radius-2xl, 1rem);
      border: none;
      background-color: transparent;
      color: var(--color-accent-soft-fg);
      cursor: pointer;
      outline: none;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      transition:
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        box-shadow 100ms var(--ease-out, ease-out),
        opacity var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      [part~='nav-btn']:hover:not(:disabled) {
        background-color: var(--color-default);
      }
    }

    [part~='nav-btn']:active:not(:disabled) {
      transform: scale(0.95);
    }

    [part~='nav-btn']:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    [part~='nav-btn']:disabled {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
    }

    [part~='nav-btn'] svg {
      width: 1rem;
      height: 1rem;
    }

    :host(:dir(rtl)) [part~='nav-btn'] svg {
      transform: rotate(180deg);
    }

    [part~='grid'] {
      border-collapse: separate;
      border-spacing: 0;
      table-layout: fixed;
      width: 100%;
    }

    [part~='grid-header'] th {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-muted);
      text-align: center;
      padding: 0 0 var(--spacing-2, 0.5rem);
    }

    [part~='grid-cell'] {
      text-align: center;
      padding: 0;
    }

    tbody tr:first-child [part~='grid-cell'] {
      padding-top: var(--spacing-1, 0.25rem);
    }

    /* Block-level so the cell's line box doesn't add baseline slack under it */
    [part~='day-btn'] {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 2.25rem;
      aspect-ratio: 1;
      margin: 0 auto;
      border-radius: var(--radius-3xl, 1.5rem);
      border: none;
      background-color: transparent;
      color: var(--color-fg, inherit);
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: 1;
      font-variant-numeric: tabular-nums;
      cursor: pointer;
      outline: none;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      transition:
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        box-shadow 100ms var(--ease-out, ease-out);
    }

    [part~='day-btn']:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    [part~='day-btn'][data-today='true'] {
      background-color: var(--color-accent-soft);
      color: var(--color-accent-soft-fg);
    }

    [part~='day-btn'][data-selected='true'] {
      background-color: var(--color-accent);
      color: var(--color-accent-fg);
    }

    @media (hover: hover) {
      [part~='day-btn']:hover:not([data-selected='true']) {
        background-color: var(--color-default);
      }

      [part~='day-btn'][data-today='true']:hover:not([data-selected='true']) {
        background-color: var(--color-accent-soft-hover);
      }
    }

    [part~='day-btn']:active {
      background-color: var(--color-default);
      transform: scale(0.95);
    }

    [part~='day-btn'][data-selected='true']:active {
      background-color: var(--color-accent-hover);
    }

    [part~='day-btn'][data-outside='true'] {
      color: var(--color-muted);
      opacity: 0.5;
    }

    [part~='day-btn'][data-selected='true'][data-outside='true'] {
      background-color: var(--color-default);
    }

    /* Out-of-range dates: dimmed and struck through, but outside-month days stay as they are */
    [part~='day-btn']:disabled:not([data-outside='true']) {
      opacity: var(--disabled-opacity, 0.5);
      text-decoration: line-through;
    }

    [part~='day-btn']:disabled {
      cursor: not-allowed;
      pointer-events: none;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* The host already dims; don't dim its controls a second time */
    :host([is-disabled]) [part~='nav-btn']:disabled {
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~='nav-btn'],
      [part~='day-btn'] {
        transition: none;
      }

      [part~='nav-btn']:active:not(:disabled),
      [part~='day-btn']:active {
        transform: none;
      }
    }
  `];W(`moul-calendar`,class extends U{static styles=kd;static properties={value:{type:String,reflect:!0},locale:{type:String,reflect:!0},minDate:{type:String,reflect:!0,attribute:`min-date`},maxDate:{type:String,reflect:!0,attribute:`max-date`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`}};viewYear;viewMonth;focusedDate;constructor(){super(),this.value=``,this.locale=`en-US`,this.minDate=``,this.maxDate=``,this.isDisabled=!1;let e=new Date;this.viewYear=e.getFullYear(),this.viewMonth=e.getMonth(),this.focusedDate=this.formatDate(e)}formatDate(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`}parseDate(e){if(!e||!/^\d{4}-\d{2}-\d{2}$/.test(e))return null;let[t,n,r]=e.split(`-`).map(Number),i=new Date(t,n-1,r);return isNaN(i.getTime())?null:i}willUpdate(e){if(super.willUpdate(e),e.has(`value`)&&this.value){let e=this.parseDate(this.value);e&&(this.viewYear=e.getFullYear(),this.viewMonth=e.getMonth(),this.focusedDate=this.value)}}prevMonth(){this.isDisabled||(this.viewMonth===0?(this.viewMonth=11,--this.viewYear):--this.viewMonth,this.requestUpdate(),this.animateTransition(-1))}nextMonth(){this.isDisabled||(this.viewMonth===11?(this.viewMonth=0,this.viewYear+=1):this.viewMonth+=1,this.requestUpdate(),this.animateTransition(1))}animateTransition(e){let t=this.renderRoot?.querySelector(`tbody`);t&&q(t,{transform:[`translateX(${e*12}px)`,`translateX(0px)`],opacity:[.3,1]},{duration:.18,ease:Ss})}selectDate(e){if(this.isDisabled||this.minDate&&e<this.minDate||this.maxDate&&e>this.maxDate)return;this.value=e,this.focusedDate=e;let t=this.parseDate(e);t&&(this.viewYear=t.getFullYear(),this.viewMonth=t.getMonth()),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0}))}handleKeyDown=(e,t)=>{let n=this.parseDate(t)||new Date(this.viewYear,this.viewMonth,1),r=null;if(e.key===`ArrowRight`)e.preventDefault(),r=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1);else if(e.key===`ArrowLeft`)e.preventDefault(),r=new Date(n.getFullYear(),n.getMonth(),n.getDate()-1);else if(e.key===`ArrowDown`)e.preventDefault(),r=new Date(n.getFullYear(),n.getMonth(),n.getDate()+7);else if(e.key===`ArrowUp`)e.preventDefault(),r=new Date(n.getFullYear(),n.getMonth(),n.getDate()-7);else if(e.key===`PageDown`)e.preventDefault(),r=new Date(n.getFullYear(),n.getMonth()+1,n.getDate());else if(e.key===`PageUp`)e.preventDefault(),r=new Date(n.getFullYear(),n.getMonth()-1,n.getDate());else if(e.key===`Enter`||e.key===` `){e.preventDefault(),this.selectDate(t);return}if(r){let e=this.formatDate(r);this.focusedDate=e,this.viewYear=r.getFullYear(),this.viewMonth=r.getMonth(),this.requestUpdate(),this.updateComplete.then(()=>{(this.renderRoot?.querySelector(`[data-date="${e}"]`))?.focus()})}};getWeekdayHeaders(){let e=new Intl.DateTimeFormat(this.locale||`en-US`,{weekday:`narrow`}),t=[];for(let n=1;n<=7;n++)t.push(e.format(new Date(2023,0,n)));return t}getMonthTitle(){let e=new Date(this.viewYear,this.viewMonth,1);return new Intl.DateTimeFormat(this.locale||`en-US`,{month:`long`,year:`numeric`}).format(e)}generateDays(){let e=[],t=new Date(this.viewYear,this.viewMonth,1).getDay(),n=new Date(this.viewYear,this.viewMonth+1,0).getDate(),r=new Date(this.viewYear,this.viewMonth,0).getDate(),i=this.formatDate(new Date);for(let n=t-1;n>=0;n--){let t=r-n,a=new Date(this.viewYear,this.viewMonth-1,t),o=this.formatDate(a),s=this.isDisabled||!!(this.minDate&&o<this.minDate)||!!(this.maxDate&&o>this.maxDate);e.push({dateStr:o,dayNumber:t,isOutside:!0,isDisabledDate:s,isSelected:o===this.value,isToday:o===i})}for(let t=1;t<=n;t++){let n=new Date(this.viewYear,this.viewMonth,t),r=this.formatDate(n),a=this.isDisabled||!!(this.minDate&&r<this.minDate)||!!(this.maxDate&&r>this.maxDate);e.push({dateStr:r,dayNumber:t,isOutside:!1,isDisabledDate:a,isSelected:r===this.value,isToday:r===i})}let a=(e.length<=35?35:42)-e.length;for(let t=1;t<=a;t++){let n=new Date(this.viewYear,this.viewMonth+1,t),r=this.formatDate(n),a=this.isDisabled||!!(this.minDate&&r<this.minDate)||!!(this.maxDate&&r>this.maxDate);e.push({dateStr:r,dayNumber:t,isOutside:!0,isDisabledDate:a,isSelected:r===this.value,isToday:r===i})}return e}render(){let e=this.getWeekdayHeaders(),t=this.generateDays(),n=[];for(let e=0;e<t.length;e+=7)n.push(t.slice(e,e+7));return B`
      <div part="base">
        <div part="header">
          <button
            type="button"
            part="nav-btn nav-btn-prev"
            aria-label="Previous month"
            ?disabled=${this.isDisabled}
            @click=${this.prevMonth}
          >
            ${bt()}
          </button>

          <h2 part="heading" aria-live="polite">${this.getMonthTitle()}</h2>

          <button
            type="button"
            part="nav-btn nav-btn-next"
            aria-label="Next month"
            ?disabled=${this.isDisabled}
            @click=${this.nextMonth}
          >
            ${xt()}
          </button>
        </div>

        <table part="grid" role="grid" aria-label="Calendar">
          <thead part="grid-header">
            <tr>
              ${e.map(e=>B`<th scope="col" aria-label=${e}>${e}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${n.map(e=>B`
                <tr>
                  ${e.map(e=>{let t=e.dateStr===this.focusedDate;return B`
                      <td part="grid-cell" role="gridcell" aria-selected=${e.isSelected?`true`:`false`}>
                        <button
                          type="button"
                          part="day-btn"
                          data-date=${e.dateStr}
                          data-selected=${e.isSelected}
                          data-today=${e.isToday}
                          data-outside=${e.isOutside}
                          tabindex=${t&&!e.isDisabledDate?`0`:`-1`}
                          aria-disabled=${e.isDisabledDate?`true`:`false`}
                          ?disabled=${e.isDisabledDate}
                          @click=${()=>this.selectDate(e.dateStr)}
                          @keydown=${t=>this.handleKeyDown(t,e.dateStr)}
                        >
                          ${e.dayNumber}
                        </button>
                      </td>
                    `})}
                </tr>
              `)}
          </tbody>
        </table>
      </div>
    `}});var Ad=[J,ut,M`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3, 0.75rem);
      padding: var(--spacing-4, 1rem);
      border-radius: var(--radius-surface, 1.5rem);
      overflow: visible;
      box-sizing: border-box;
      position: relative;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      /* Secondary copy in sections; variants swap it for a tint of their own text color */
      --_card-muted: var(--color-muted);
      /* The hover lift and its shadow share one duration and curve so they move as one */
      transition:
        box-shadow var(--duration-base, 250ms) var(--ease-out, ease-out),
        translate var(--duration-base, 250ms) var(--ease-out, ease-out),
        scale var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color var(--duration-base, 250ms) var(--ease-smooth, ease);
    }

    /* Default: a white surface lifted by a soft shadow, no border */
    :host(:not([variant])) {
      background-color: var(--color-surface);
      color: var(--color-fg);
      border: none;
      box-shadow: var(--shadow-surface);
    }

    :host([variant]) {
      --_card-muted: color-mix(in oklch, currentColor 78%, transparent);
    }

    /* Body copy stays neutral on bordered and glass surfaces; the tone shows in the frame */
    :host([variant="bordered"]),
    :host([variant="glass"]) {
      color: var(--color-fg);
      --_card-muted: var(--color-muted);
    }

    :host([is-interactive]) {
      cursor: pointer;
      user-select: none;
    }

    /* Lift only under a real cursor: touch fires hover on tap and would leave it raised */
    @media (hover: hover) and (pointer: fine) {
      :host([is-interactive]:hover) {
        box-shadow: var(--shadow-overlay);
        translate: 0 -2px;
      }
    }

    :host([is-interactive]:active) {
      scale: 0.985;
    }

    :host([is-interactive]:focus-visible) {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    /* Slots generate no box, so empty ones add no gap and sections are the flex items */
    [part~="header"],
    [part~="body"],
    [part~="content"],
    [part~="footer"] {
      display: contents;
    }

    ::slotted([slot="body"]),
    ::slotted(moul-card-body) {
      flex: 1 1 auto;
    }

    ::slotted([slot="header"]:not(moul-card-header)) {
      display: block;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-md, 1.5rem);
      font-weight: var(--font-weight-medium, 500);
    }

    ::slotted([slot="body"]:not(moul-card-body)) {
      display: block;
      color: var(--_card-muted);
    }

    ::slotted([slot="footer"]:not(moul-card-footer)) {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: none;
      }

      :host([is-interactive]:hover) {
        translate: none;
      }

      :host([is-interactive]:active) {
        scale: none;
      }
    }
  `],jd=[J,M`
    :host {
      display: block;
      padding: 0;
      color: inherit;
      font-size: inherit;
      line-height: inherit;
    }

    /* Title row (block, so inline markup in the title keeps flowing) */
    :host([data-section="header"]) {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-md, 1.5rem);
      font-weight: var(--font-weight-medium, 500);
    }

    /* Description / content */
    :host([data-section="body"]) {
      flex: 1 1 auto;
      color: var(--_card-muted, var(--color-muted));
    }

    :host([data-section="footer"]) {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
    }
  `],Md=class extends U{static styles=Ad;static properties={tone:{type:String,reflect:!0},variant:{type:String,reflect:!0,useDefault:!0},isInteractive:{type:Boolean,reflect:!0,attribute:`is-interactive`}};pressController;pressHandledInCycle=!1;constructor(){super(),this.tone=`primary`,this.variant=`flat`,this.isInteractive=!1,this.pressController=new wd(this,{disabled:()=>!this.isInteractive})}connectedCallback(){super.connectedCallback(),this.addEventListener(`click`,this.handleClick),this.addEventListener(`keydown`,this.handleKeyDown),this.addEventListener(`keyup`,this.handleKeyUp)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`click`,this.handleClick),this.removeEventListener(`keydown`,this.handleKeyDown),this.removeEventListener(`keyup`,this.handleKeyUp)}updated(e){if(super.updated(e),e.has(`isInteractive`)&&(this.isInteractive?(this.hasAttribute(`role`)||this.setAttribute(`role`,`button`),this.hasAttribute(`tabindex`)||this.setAttribute(`tabindex`,`0`)):(this.getAttribute(`role`)===`button`&&this.removeAttribute(`role`),this.getAttribute(`tabindex`)===`0`&&this.removeAttribute(`tabindex`))),e.has(`tone`)){let e=ct(this.tone);this.tone!==e&&(this.tone=e)}if(e.has(`variant`)){let e=lt(this.variant);this.variant!==e&&(this.variant=e)}}handleClick=e=>{this.isInteractive&&(this.pressHandledInCycle||this.dispatchPressEvent(e),this.pressHandledInCycle=!1)};handleKeyDown=e=>{!this.isInteractive||e.repeat||(e.key===` `||e.key===`Enter`)&&(e.preventDefault(),this.pressHandledInCycle=!1)};handleKeyUp=e=>{this.isInteractive&&(e.key===` `||e.key===`Enter`)&&(e.preventDefault(),this.dispatchPressEvent(e),this.pressHandledInCycle=!0,queueMicrotask(()=>{this.pressHandledInCycle=!1}))};dispatchPressEvent(e){this.dispatchEvent(new CustomEvent(`press`,{bubbles:!0,composed:!0,detail:{originalEvent:e}}))}render(){return B`
      <slot name="header" part="header"></slot>
      <slot name="body" part="body"></slot>
      <slot part="content"></slot>
      <slot name="footer" part="footer"></slot>
    `}},Nd=class extends U{static styles=jd;connectedCallback(){super.connectedCallback(),this.dataset.section=`header`}render(){return B`<slot></slot>`}},Pd=class extends U{static styles=jd;connectedCallback(){super.connectedCallback(),this.dataset.section=`body`}render(){return B`<slot></slot>`}},Fd=class extends U{static styles=jd;connectedCallback(){super.connectedCallback(),this.dataset.section=`footer`}render(){return B`<slot></slot>`}};W(`moul-card`,Md),W(`moul-card-header`,Nd),W(`moul-card-body`,Pd),W(`moul-card-footer`,Fd);var Id=[J,M`
    /* HeroUI card surface: white fill lifted by a soft shadow, no border. */
    :host {
      display: block;
      position: relative;
      background-color: var(--color-surface, #ffffff);
      border-radius: var(--radius-surface, 1.5rem);
      box-shadow: var(--shadow-surface, 0 1px 2px 0 rgba(0, 0, 0, 0.06));
      padding: var(--spacing-5, 1.25rem);
      color: var(--color-fg, #18181b);
      box-sizing: border-box;
      overflow: hidden;
      font-family: var(--font-family-base, inherit);
    }

    [part~="header"],
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-4, 1rem);
      margin-bottom: var(--spacing-5, 1.25rem);
    }

    .header-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    [part~="title"],
    .title {
      font-size: var(--font-size-md, 1rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg, #18181b);
      margin: 0;
      line-height: var(--line-height-md, 1.5rem);
    }

    [part~="description"],
    .description {
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--color-muted, #71717a);
      margin: 0;
      line-height: var(--line-height-sm, 1.25rem);
    }

    .header-actions {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      gap: var(--spacing-2, 0.5rem);
    }

    [part~="content"],
    .content {
      position: relative;
      width: 100%;
      box-sizing: border-box;
    }

    [part~="empty"],
    .empty-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      min-height: 200px;
      gap: var(--spacing-2, 0.5rem);
      color: var(--color-muted, #71717a);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding: var(--spacing-8, 2rem) var(--spacing-4, 1rem);
      text-align: center;
    }

    .empty-message {
      margin: 0;
    }

    /* Legend: a wrapping row of muted, chip-sized entries. */
    [part~="legend"],
    .legend {
      margin-top: var(--spacing-3, 0.75rem);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-muted, #71717a);
      line-height: var(--line-height-xs, 1rem);
    }

    .header[data-empty],
    .legend[data-empty] {
      display: none;
    }

    ::slotted([slot="legend"]) {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-2, 0.5rem) var(--spacing-4, 1rem);
    }
  `];W(`moul-chart-container`,class extends U{static styles=Id;static properties={title:{type:String,reflect:!0},description:{type:String,reflect:!0},height:{type:Number,reflect:!0},isEmpty:{type:Boolean,reflect:!0,attribute:`is-empty`},hasHeaderContent:{state:!0},hasLegend:{state:!0}};layout;prevWidth=0;prevHeight=0;prevBreakpoint=``;constructor(){super(),this.title=``,this.description=``,this.height=void 0,this.isEmpty=!1,this.hasHeaderContent=!1,this.hasLegend=!1,this.layout=new dd(this,{observeDimensions:!0})}get containerWidth(){return this.layout.width}get containerHeight(){return this.layout.height}get breakpoint(){return this.layout.breakpoint}updated(e){super.updated(e);let t=this.layout.width,n=this.layout.height,r=this.layout.breakpoint,i=t!==this.prevWidth,a=n!==this.prevHeight,o=r!==this.prevBreakpoint;if(i||a||o){let e=this.prevWidth===0&&this.prevHeight===0&&t===0&&n===0;this.prevWidth=t,this.prevHeight=n,this.prevBreakpoint=r,e||this.dispatchEvent(new CustomEvent(`viewport-resize`,{bubbles:!0,composed:!0,detail:{width:t,height:n,breakpoint:r}}))}}firstUpdated(e){super.firstUpdated(e),this.syncSlots()}syncSlots(){let e=e=>(this.renderRoot.querySelector(`slot[name="${e}"]`)?.assignedNodes({flatten:!0})??[]).length>0||!!this.querySelector(`:scope > [slot="${e}"]`);this.hasHeaderContent=e(`header`),this.hasLegend=e(`legend`)}handleSlotChange=()=>{this.syncSlots()};render(){return B`
      <header part="header" class="header" ?data-empty=${!(this.title||this.description||this.hasHeaderContent)}>
        <div part="header-text" class="header-text">
          <h3 part="title" class="title" ?hidden=${!this.title}>${this.title}</h3>
          <p part="description" class="description" ?hidden=${!this.description}>
            ${this.description}
          </p>
        </div>
        <div part="header-actions" class="header-actions">
          <slot name="header" @slotchange=${this.handleSlotChange}></slot>
        </div>
      </header>

      <div
        part="content"
        class="content"
        style=${this.height&&this.height>0?`height: ${this.height}px;`:``}
      >
        ${this.isEmpty?B`
              <slot name="empty">
                <div part="empty" class="empty-container">
                  <p class="empty-message">No data available</p>
                </div>
              </slot>
            `:B`<slot></slot>`}
      </div>

      <footer part="legend" class="legend" ?data-empty=${!this.hasLegend}>
        <slot name="legend" @slotchange=${this.handleSlotChange}></slot>
      </footer>
    `}});var Ld=[J,M`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      z-index: var(--z-tooltip, 1500);
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--color-fg, inherit);
      pointer-events: none;
      user-select: none;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
    }

    :host(:not([is-open])) {
      display: none;
    }

    :host([is-open]) {
      display: block;
    }

    :host(:not(:popover-open):not(.\:popover-open)):not([is-open]) {
      display: none;
    }

    :host(:popover-open),
    :host(.\:popover-open) {
      display: block;
    }

    /* HeroUI tooltip surface: elevated fill lifted by the overlay shadow, no border */
    [part~="container"],
    .tooltip-container {
      display: inline-flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      padding: var(--spacing-2, 0.5rem);
      background-color: var(--color-bg-elevated);
      border: none;
      border-radius: min(2rem, var(--radius-xl, 0.75rem));
      box-shadow: var(--shadow-overlay);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-fg);
      white-space: nowrap;
      pointer-events: none;
      /* Sits above the hovered point, so it grows up out of it */
      transform-origin: bottom center;
    }

    /*
     * Opt-in glass (variant="glass"): a hairline-edged solid elevated fallback,
     * frosted with a 12px blur where backdrop-filter is supported.
     */
    :host([variant="glass"]) [part~="container"],
    :host([variant="glass"]) .tooltip-container {
      border: 1px solid var(--color-border-subtle);
    }

    @supports (backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px)) {
      :host([variant="glass"]) [part~="container"],
      :host([variant="glass"]) .tooltip-container {
        background-color: var(--color-bg-glass, oklch(1 0 0 / 0.64));
        border-color: var(--color-border-glass, oklch(0 0 0 / 0.08));
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
      }
    }

    [part~="header"],
    .tooltip-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
    }

    [part~="title"],
    .tooltip-title {
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg);
    }

    /* Multi-series list & item layout */
    [part~="list"],
    .tooltip-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    [part~="item"],
    .tooltip-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3, 0.75rem);
    }

    .tooltip-item-series {
      display: flex;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
    }

    [part~="indicator"],
    .indicator {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: var(--radius-full, 9999px);
      flex-shrink: 0;
      display: inline-block;
    }

    [part~="label"],
    .label {
      color: var(--color-muted);
    }

    [part~="value"],
    .value {
      color: var(--color-fg);
      font-weight: var(--font-weight-medium, 500);
      font-variant-numeric: tabular-nums;
    }
  `];W(`moul-chart-tooltip`,class extends U{static styles=Ld;static properties={label:{type:String},value:{type:String},color:{type:String},isOpen:{type:Boolean,reflect:!0,attribute:`is-open`},x:{type:Number},y:{type:Number},payload:{attribute:!1},valueFormatter:{attribute:!1}};overlayPresence;constructor(){super(),this.label=``,this.value=``,this.color=`var(--color-chart-1)`,this.isOpen=!1,this.x=0,this.y=0,this.payload=[],this.valueFormatter=void 0,this.overlayPresence=new Xs(this,{preset:`tooltip`,popover:()=>this.popoverEl,target:()=>this.renderRoot?.querySelector(`[part="container"]`)??null})}get popoverEl(){return this}connectedCallback(){super.connectedCallback(),this.hasAttribute(`popover`)||this.setAttribute(`popover`,`manual`),this.updatePosition()}updatePosition(){this.style.left=`0px`,this.style.top=`0px`,this.style.transform=`translate3d(${this.x}px, ${this.y}px, 0) translate(-50%, -100%) translateY(-8px)`}showPopover(){if(this.isConnected){try{this.matches(`:popover-open`)||super.showPopover()}catch{this.setAttribute(`:popover-open`,``),this.classList.add(`:popover-open`)}this.isOpen=!0}}hidePopover(){if(this.isConnected){try{this.matches(`:popover-open`)&&super.hidePopover()}catch{this.removeAttribute(`:popover-open`),this.classList.remove(`:popover-open`)}this.isOpen=!1}}show(e,t,n,r,i){typeof e==`object`&&e?(this.label=e.label===void 0?``:String(e.label),this.value=e.value===void 0?``:String(e.value),e.color!==void 0&&(this.color=e.color),e.x!==void 0&&(this.x=e.x),e.y!==void 0&&(this.y=e.y),this.payload=e.payload!==void 0&&Array.isArray(e.payload)?e.payload:[],e.valueFormatter!==void 0&&(this.valueFormatter=e.valueFormatter)):(typeof e==`number`&&(this.x=e,this.y=t??0,this.label=n===void 0?``:String(n),this.value=r===void 0?``:String(r),i!==void 0&&(this.color=i)),this.payload=[]),this.isOpen=!0,this.updatePosition(),this.showPopover(),this.overlayPresence.setOpen(!0),this.requestUpdate()}hide(){this.isOpen=!1,this.hidePopover(),this.overlayPresence.setOpen(!1),this.requestUpdate()}updated(e){super.updated(e),(e.has(`x`)||e.has(`y`))&&this.updatePosition(),e.has(`isOpen`)&&(this.isOpen?this.showPopover():this.hidePopover())}formatPayloadEntry(e,t){if(typeof e==`object`&&e){let n=e,r=typeof n.name==`string`?n.name:typeof n.label==`string`?n.label:typeof n.key==`string`?n.key:``,i=n.value===void 0?n.rawValue:n.value,a=``;i!=null&&(a=this.valueFormatter?this.valueFormatter(i):String(i));let o=typeof n.color==`string`?n.color:typeof n.fill==`string`?n.fill:typeof n.stroke==`string`?n.stroke:typeof n.payload?.fill==`string`?n.payload.fill:fd(t);return{name:r,value:a,color:o}}return{name:``,value:this.valueFormatter?this.valueFormatter(e):e==null?``:String(e),color:fd(t)}}render(){if(!(Array.isArray(this.payload)&&this.payload.length>0))return B`
        <div part="container" class="tooltip-container">
          <div part="header" class="tooltip-header">
            <span
              part="indicator"
              class="indicator"
              style="background-color: ${this.color};"
            ></span>
            <span part="label" class="label">${this.label}</span>
            <span part="value" class="value">${this.value}</span>
          </div>
          <slot></slot>
        </div>
      `;let e=this.value!==``&&this.value!==void 0,t=this.label!==``&&this.label!==void 0;return B`
      <div part="container" class="tooltip-container">
        ${e?B`
              <div part="header" class="tooltip-header">
                <span
                  part="indicator"
                  class="indicator"
                  style="background-color: ${this.color};"
                ></span>
                <span part="label" class="label">${this.label}</span>
                <span part="value" class="value">${this.value}</span>
              </div>
            `:t?B`
                <div part="header" class="tooltip-header tooltip-title">
                  <span part="title" class="title">${this.label}</span>
                </div>
              `:``}

        <ul part="list" class="tooltip-list">
          ${this.payload.map((e,t)=>{let n=this.formatPayloadEntry(e,t);return B`
              <li part="item" class="tooltip-item">
                <div class="tooltip-item-series">
                  <span
                    part="indicator"
                    class="indicator"
                    style="background-color: ${n.color};"
                  ></span>
                  ${n.name?B`<span part="label" class="label">${n.name}</span>`:``}
                </div>
                ${n.value?B`<span part="value" class="value">${n.value}</span>`:``}
              </li>
            `})}
        </ul>
        <slot></slot>
      </div>
    `}});var Rd=class{internals=null;host;options;constructor(e,t={}){this.host=e,this.options=t,this.host.addController(this)}markTouched=()=>{this.host.toggleAttribute(`data-touched`,!0)};hostConnected(){if(this.host.addEventListener(`focusout`,this.markTouched),this.host.addEventListener(`invalid`,this.markTouched),typeof this.host.attachInternals!=`function`){console.warn(`[@moul-dev/ui] ElementInternals is not supported in this environment.`),this.internals=null;return}if(!this.internals)try{this.internals=this.host.attachInternals()}catch(e){console.warn(`[@moul-dev/ui] Failed to attach ElementInternals:`,e),this.internals=null;return}let e=this.host.hasAttribute?.(`name`)??!1;if((this.options.requireFormConnection||e)&&this.internals&&!this.internals.form){let e=(this.host.tagName??`element`).toLowerCase();console.warn(`[@moul-dev/ui] Form-associated element <${e}> is not connected to a <form>.`)}}hostDisconnected(){this.host.removeEventListener(`focusout`,this.markTouched),this.host.removeEventListener(`invalid`,this.markTouched)}setValue(e,t){this.internals&&typeof this.internals.setFormValue==`function`&&this.internals.setFormValue(e,t)}setValidity(e,t,n){if(this.internals&&typeof this.internals.setValidity==`function`){let r=typeof t==`string`?t.slice(0,200):``;this.internals.setValidity(e,r,n)}}checkValidity(){return this.internals?.checkValidity?.()??!0}reportValidity(){return this.internals?.reportValidity?.()??!0}get form(){return this.internals?.form??null}get validity(){return this.internals?.validity??null}get validationMessage(){return this.internals?.validationMessage??``}get willValidate(){return this.internals?.willValidate??!1}get labels(){return this.internals?.labels??null}},zd=[J,M`
    :host {
      display: inline-flex;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    :host([hidden]) {
      display: none !important;
    }

    :host(:focus-visible) {
      outline: none;
    }

    /* Errors show once touched, like the text fields */
    :host([is-invalid][data-touched]) {
      --_control-ring: 0 0 0 1px var(--color-danger);
    }

    [part~='base'] {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-3, 0.75rem);
      cursor: pointer;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
    }

    /* A white, borderless field box; the accent fill grows in from a ::before layer */
    [part~='indicator'] {
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1rem;
      height: 1rem;
      overflow: hidden;
      border-radius: var(--radius-md, 0.375rem);
      background-color: var(--color-field);
      box-shadow:
        var(--_control-ring, 0 0 0 0 transparent),
        var(--shadow-field);
      color: var(--color-accent-fg);
      transition:
        background-color 200ms var(--ease-out, ease-out),
        box-shadow 150ms var(--ease-out, ease-out);
    }

    [part~='indicator']::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background-color: var(--color-accent);
      opacity: 0;
      scale: 0.7;
      pointer-events: none;
      transition:
        scale var(--duration-fast, 150ms) var(--ease-out, ease-out),
        opacity var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 200ms var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      :host(:not([is-checked]):not([is-indeterminate]))
        [part~='base']:hover:not([data-disabled])
        [part~='indicator'] {
        background-color: var(--color-field-hover);
      }

      [part~='base']:hover:not([data-disabled]) [part~='indicator']::before {
        background-color: var(--color-accent-hover);
      }
    }

    :host([is-checked]) [part~='indicator'],
    :host([is-indeterminate]) [part~='indicator'] {
      box-shadow: var(--shadow-field);
    }

    :host([is-checked]) [part~='indicator']::before,
    :host([is-indeterminate]) [part~='indicator']::before {
      opacity: 1;
      scale: 1;
    }

    /* Invalid + selected: the fill turns danger */
    :host([is-invalid][data-touched]:is([is-checked], [is-indeterminate]))
      [part~='indicator'] {
      color: var(--color-danger-fg);
    }

    :host([is-invalid][data-touched]:is([is-checked], [is-indeterminate]))
      [part~='indicator']::before {
      background-color: var(--color-danger);
    }

    :host(:focus-visible) [part~='indicator'] {
      box-shadow:
        var(--focus-ring),
        var(--shadow-field);
    }

    [part~='icon'] {
      position: relative;
      z-index: 1;
      width: 0.875rem;
      height: 0.875rem;
      stroke: currentColor;
      stroke-width: 2.5;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* The check mark draws itself in */
    [part~='icon'] path {
      stroke-dasharray: 24;
      stroke-dashoffset: 24;
      animation: moul-check-draw 150ms var(--ease-out, ease-out) 15ms forwards;
    }

    @keyframes moul-check-draw {
      to {
        stroke-dashoffset: 0;
      }
    }

    [part~='label'] {
      display: inline-flex;
      align-items: center;
      color: inherit;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~='indicator'],
      [part~='indicator']::before {
        transition: none;
      }

      [part~='icon'] path {
        animation: none;
        stroke-dashoffset: 0;
      }
    }
  `],Bd=[J,M`
    :host {
      display: block;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
    }

    :host([hidden]) {
      display: none !important;
    }

    /* Inherited by the slotted checkboxes, which outline their boxes in danger */
    :host([is-invalid][data-touched]) {
      --_control-ring: 0 0 0 1px var(--color-danger);
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
    }

    [part~='label'] {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg, inherit);
    }

    :host([is-invalid][data-touched]) [part~='label'] {
      color: var(--color-danger);
    }

    [part~='description'] {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted);
    }

    [part~='group'] {
      display: flex;
      gap: var(--spacing-4, 1rem);
    }

    [part~='label'] ~ [part~='group'],
    [part~='description'] ~ [part~='group'] {
      margin-top: var(--spacing-3, 0.75rem);
    }

    :host([orientation='vertical']) [part~='group'] {
      flex-direction: column;
    }

    :host([orientation='horizontal']) [part~='group'] {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }

    /* Each checkbox dims itself; only the group's own text needs it here */
    :host([is-disabled]) {
      cursor: not-allowed;
    }

    :host([is-disabled]) [part~='label'],
    :host([is-disabled]) [part~='description'] {
      opacity: var(--disabled-opacity, 0.5);
    }
  `];W(`moul-checkbox`,class extends U{static styles=zd;static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},isChecked:{type:Boolean,reflect:!0,attribute:`is-checked`},isIndeterminate:{type:Boolean,reflect:!0,attribute:`is-indeterminate`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},label:{type:String,reflect:!0}};internalsController;constructor(){super(),this.name=``,this.value=`on`,this.isChecked=!1,this.isIndeterminate=!1,this.isDisabled=!1,this.isRequired=!1,this.label=``,this.internalsController=new Rd(this)}connectedCallback(){super.connectedCallback(),this.setAttribute(`tabindex`,this.isDisabled?`-1`:`0`),this.addEventListener(`click`,this.handleClick),this.addEventListener(`keydown`,this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`click`,this.handleClick),this.removeEventListener(`keydown`,this.handleKeyDown)}toggle(){this.isDisabled||(this.isIndeterminate=!1,this.isChecked=!this.isChecked,this.syncFormValueAndValidity(),this.dispatchEvent(new CustomEvent(`change`,{detail:{isChecked:this.isChecked,value:this.value},bubbles:!0,composed:!0})))}willUpdate(e){super.willUpdate(e),(e.has(`isChecked`)||e.has(`value`)||e.has(`isRequired`))&&this.syncFormValueAndValidity(),e.has(`isDisabled`)&&this.setAttribute(`tabindex`,this.isDisabled?`-1`:`0`)}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.textContent?.trim());Td(this,`checkbox`,t),this.setAttribute(`role`,`checkbox`),this.setAttribute(`aria-checked`,this.isIndeterminate?`mixed`:this.isChecked?`true`:`false`)}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}syncFormValueAndValidity(){this.internalsController.setValue(this.isChecked?this.value:null),this.isRequired&&!this.isChecked?(this.internalsController.setValidity({valueMissing:!0},`This field is required.`),this.setAttribute(`is-invalid`,``)):(this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`))}handleClick=e=>{e.preventDefault(),this.toggle()};handleKeyDown=e=>{(e.key===` `||e.key===`Spacebar`)&&(e.preventDefault(),this.toggle())};render(){return B`
      <div
        part="base"
        ?data-disabled=${this.isDisabled}
      >
        <span part="indicator">
          ${this.isIndeterminate?V`
                <svg part="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 12h14" />
                </svg>
              `:this.isChecked?V`
                  <svg part="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                `:``}
        </span>

        <span part="label">
          <slot>${this.label}</slot>
        </span>
      </div>
    `}}),W(`moul-checkbox-group`,class extends U{static styles=Bd;static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:Array,converter:{fromAttribute:e=>{if(!e)return[];try{let t=JSON.parse(e);return Array.isArray(t)?t:[e]}catch{return e.split(`,`).map(e=>e.trim())}},toAttribute:e=>JSON.stringify(e)}},label:{type:String,reflect:!0},description:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},orientation:{type:String,reflect:!0}};internalsController;constructor(){super(),this.name=``,this.value=[],this.label=``,this.description=``,this.isDisabled=!1,this.isRequired=!1,this.orientation=`vertical`,this.internalsController=new Rd(this)}connectedCallback(){super.connectedCallback(),this.addEventListener(`change`,this.handleCheckboxChange)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`change`,this.handleCheckboxChange)}get checkboxes(){return Array.from(this.querySelectorAll(`moul-checkbox`))}willUpdate(e){if(super.willUpdate(e),(e.has(`value`)||e.has(`isRequired`))&&(this.syncFormValueAndValidity(),this.syncChildCheckboxes()),e.has(`isDisabled`)){if(this.isDisabled)for(let e of this.checkboxes)e.isDisabled=!0;else if(e.get(`isDisabled`)===!0)for(let e of this.checkboxes)e.hasAttribute(`is-disabled`)||(e.isDisabled=!1)}}updated(e){super.updated(e),this.setAttribute(`role`,`group`),this.label&&!this.hasAttribute(`aria-label`)&&this.setAttribute(`aria-label`,this.label)}hasSeededFromChildren=!1;syncChildCheckboxes(){let e=this.checkboxes;if(!this.hasSeededFromChildren&&e.length>0&&(this.hasSeededFromChildren=!0,this.value.length===0)){let t=e.filter(e=>e.isChecked||e.hasAttribute(`is-checked`)).map(e=>e.value);t.length>0&&(this.value=t)}for(let t of e)t.isChecked=this.value.includes(t.value),this.isDisabled&&(t.isDisabled=!0)}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}syncFormValueAndValidity(){if(this.value.length>0){let e=new FormData;for(let t of this.value)e.append(this.name,t);this.internalsController.setValue(e),this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`)}else this.internalsController.setValue(null),this.isRequired?(this.internalsController.setValidity({valueMissing:!0},`Please select at least one option.`),this.setAttribute(`is-invalid`,``)):(this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`))}handleSlotChange=()=>{this.syncChildCheckboxes()};handleCheckboxChange=e=>{if(e.target===this)return;let t=e.target||e.composedPath()[0];if(t&&t.tagName===`MOUL-CHECKBOX`){e.stopImmediatePropagation();let t=[];for(let e of this.checkboxes)e.isChecked&&t.push(e.value);this.value=t,this.syncFormValueAndValidity(),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0}))}};render(){return B`
      <div part="base">
        ${this.label?B`<div part="label"><slot name="label">${this.label}</slot></div>`:B`<slot name="label"></slot>`}
        ${this.description?B`<div part="description"><slot name="description">${this.description}</slot></div>`:B`<slot name="description"></slot>`}

        <div
          part="group"
          @slotchange=${this.handleSlotChange}
          @change=${this.handleCheckboxChange}
        >
          <slot></slot>
        </div>
      </div>
    `}});var Vd=M`
  [part~='label'] {
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-fg, inherit);
  }

  [part~='input-container'],
  [part~='textarea'],
  [part~='trigger'],
  [part~='slot'] {
    border: none;
    border-radius: var(--radius-field, 0.75rem);
    background-color: var(--color-field);
    color: var(--color-field-fg);
    box-shadow: var(--shadow-field);
    outline: none;
    transition:
      background-color var(--duration-fast, 150ms) var(--ease-smooth, ease),
      box-shadow var(--duration-fast, 150ms) var(--ease-out, ease-out);
  }

  @media (hover: hover) {
    [part~='input-container']:hover:not([data-disabled]):not(:focus-within),
    [part~='textarea']:hover:not(:disabled):not(:focus),
    [part~='trigger']:hover:not(:disabled):not(:focus-visible) {
      background-color: var(--color-field-hover);
    }
  }

  [part~='input-container']:focus-within:not([data-disabled]),
  [part~='textarea']:focus-visible,
  [part~='textarea']:focus,
  [part~='trigger']:focus-visible,
  [part~='slot']:focus {
    outline: none;
    background-color: var(--color-field-focus);
    box-shadow: var(--focus-ring-field), var(--shadow-field);
  }

  [part~='input']::placeholder,
  [part~='textarea']::placeholder {
    color: var(--color-field-placeholder);
  }

  /* Errors show once touched (or when an explicit error-message is supplied) */
  :host([is-invalid]:is([data-touched], [error-message]:not([error-message=""]))) [part~='input-container'],
  :host([is-invalid]:is([data-touched], [error-message]:not([error-message=""]))) [part~='textarea'],
  :host([is-invalid]:is([data-touched], [error-message]:not([error-message=""]))) [part~='trigger'] {
    box-shadow: 0 0 0 1px var(--color-danger), var(--shadow-field);
  }

  :host([is-invalid]:is([data-touched], [error-message]:not([error-message=""]))) [part~='input-container']:focus-within,
  :host([is-invalid]:is([data-touched], [error-message]:not([error-message=""]))) [part~='textarea']:focus,
  :host([is-invalid]:is([data-touched], [error-message]:not([error-message=""]))) [part~='trigger']:focus-visible {
    box-shadow: var(--focus-ring-invalid), var(--shadow-field);
  }

  /* Affixes only take space when something is slotted into them */
  [part~='prefix'],
  [part~='suffix'] {
    padding-inline: 0;
    color: var(--color-field-placeholder);
  }

  [part~='prefix'] ::slotted(*) {
    margin-inline-start: var(--spacing-3, 0.75rem);
  }

  [part~='suffix'] ::slotted(*) {
    margin-inline-end: var(--spacing-3, 0.75rem);
  }

  [part~='description'] {
    font-size: var(--font-size-xs, 0.75rem);
    color: var(--color-muted);
  }

  [part~='error'] {
    font-size: var(--font-size-xs, 0.75rem);
    color: var(--color-danger, #ef4444);
  }
`,Hd=[J,M`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      position: relative;
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    /* Flex drops template whitespace so the required mark sits tight to the text */
    [part~='label'] {
      display: flex;
      align-items: baseline;
      width: fit-content;
      line-height: var(--line-height-sm, 1.25rem);
    }

    :host([is-required][label]:not([label=''])) [part~='label']::after {
      content: '*';
      margin-inline-start: 0.125rem;
      color: var(--color-danger);
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='label'] {
      color: var(--color-danger);
    }

    [part~='input-container'] {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
      min-height: 2.25rem;
      font-size: var(--font-size-sm, 0.875rem);
    }

    /* The toggle rides in the flow and carries the end inset itself */
    [part~='input'] {
      flex: 1;
      width: 100%;
      min-width: 0;
      border: none;
      border-radius: 0;
      outline: none;
      background: transparent;
      box-shadow: none;
      color: inherit;
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding-block: var(--spacing-2, 0.5rem);
      padding-inline: var(--spacing-3, 0.75rem) 0;
    }

    [part~='toggle-btn'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: stretch;
      flex-shrink: 0;
      margin: 0;
      border: none;
      background: transparent;
      color: var(--color-field-placeholder);
      cursor: pointer;
      padding-inline: var(--spacing-1, 0.25rem) var(--spacing-2, 0.5rem);
      outline: none;
      -webkit-tap-highlight-color: transparent;
      transition: color var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    [part~='toggle-btn'] svg {
      width: 1rem;
      height: 1rem;
      transition: transform var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    @media (hover: hover) {
      [part~='toggle-btn']:hover:not(:disabled) {
        color: var(--color-field-fg);
      }
    }

    [part~='toggle-btn']:active:not(:disabled) {
      opacity: 0.7;
    }

    :host([is-open]) [part~='toggle-btn'] svg {
      transform: rotate(180deg);
    }

    /* Listbox panel: a solid overlay surface; geometry is set by the overlay
       controller against the trigger */
    [part~='popover'] {
      margin: 0;
      border: none;
      border-radius: var(--radius-surface, 1.5rem);
      background-color: var(--color-bg-elevated);
      box-shadow: var(--shadow-overlay);
      color: var(--color-fg);
      font-size: var(--font-size-sm, 0.875rem);
      z-index: var(--z-dropdown, 1000);
      outline: none;
      min-width: 8rem;
      max-height: 16rem;
      overflow-y: auto;
      overscroll-behavior: contain;
      scroll-padding-block: var(--spacing-1, 0.25rem);
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
      padding: 0.375rem;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
    }

    [part~='popover'][hidden] {
      display: none !important;
    }

    [part~='empty'] {
      padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-muted);
      text-align: center;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* :host raises specificity past the shared shell's transition */
    @media (prefers-reduced-motion: reduce) {
      :host [part~='input-container'],
      [part~='toggle-btn'],
      [part~='toggle-btn'] svg {
        transition: none;
      }
    }
  `,Vd],Ud=[J,M`
    :host {
      display: block;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      user-select: none;
      -webkit-user-select: none;
      outline: none;
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='item'] {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3, 0.75rem);
      min-height: 2.25rem;
      width: 100%;
      padding: 0.375rem 0.625rem;
      border-radius: var(--radius-2xl, 1rem);
      cursor: pointer;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      -webkit-tap-highlight-color: transparent;
      transition:
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        box-shadow var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      [part~='item']:hover:not([data-disabled]) {
        background-color: var(--color-default);
      }
    }

    :host([is-active]) [part~='item'] {
      background-color: var(--color-default);
    }

    :host(:focus-visible) [part~='item'] {
      box-shadow: var(--focus-ring);
    }

    [part~='item']:active:not([data-disabled]) {
      transform: scale(0.98);
    }

    /* Trailing check on the selected row, drawn in CSS to match the select list */
    :host([aria-selected='true']) [part~='item']::after {
      content: '';
      flex-shrink: 0;
      width: 0.875rem;
      height: 0.875rem;
      background-color: var(--color-default-fg);
      -webkit-mask: var(--_check) center / contain no-repeat;
      mask: var(--_check) center / contain no-repeat;
      --_check: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~='item'] {
        transition: none;
      }

      [part~='item']:active:not([data-disabled]) {
        transform: none;
      }
    }
  `];W(`moul-combobox`,class extends U{static styles=Hd;static formAssociated=!0;static properties={name:{type:String,reflect:!0},selectedKey:{type:String,reflect:!0,attribute:`selected-key`},inputValue:{type:String,reflect:!0,attribute:`input-value`},placeholder:{type:String,reflect:!0},label:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},isOpen:{type:Boolean,reflect:!0,attribute:`is-open`}};internalsController;overlayController;activeIndex=-1;constructor(){super(),this.name=``,this.selectedKey=``,this.inputValue=``,this.placeholder=``,this.label=``,this.isDisabled=!1,this.isRequired=!1,this.isOpen=!1,this.internalsController=new Rd(this),this.overlayController=new Xs(this,{preset:`popover`,popover:()=>this.popoverElement,target:()=>this.popoverElement,onLightDismiss:()=>this.close(),anchor:()=>this.renderRoot?.querySelector(`[part="input-container"]`)??null})}connectedCallback(){super.connectedCallback(),this.addEventListener(`combobox-item-click`,this.handleItemClick),this.addEventListener(`keydown`,this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`combobox-item-click`,this.handleItemClick),this.removeEventListener(`keydown`,this.handleKeyDown)}get inputElement(){return this.renderRoot?.querySelector(`input`)??null}get popoverElement(){return this.renderRoot?.querySelector(`[part="popover"]`)??null}get items(){return Array.from(this.querySelectorAll(`moul-combobox-item`))}get visibleItems(){return this.items.filter(e=>!e.hidden&&!e.isDisabled)}focus(e){this.inputElement?.focus(e)}blur(){this.inputElement?.blur()}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}open(){this.isDisabled||this.isOpen||this.overlayController.wasJustDismissed||(this.isOpen=!0,this.overlayController.setOpen(!0),this.filterItems())}close(){this.isOpen&&(this.isOpen=!1,this.overlayController.setOpen(!1))}toggle(){this.isOpen?this.close():(this.open(),this.focus())}willUpdate(e){super.willUpdate(e),(e.has(`selectedKey`)||e.has(`inputValue`)||e.has(`isRequired`))&&this.syncFormValueAndValidity(),e.has(`isOpen`)&&(this.isOpen?this.overlayController.setOpen(!0):this.overlayController.setOpen(!1))}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.querySelector(`[slot="label"]`));Td(this,`combobox`,t)}syncFormValueAndValidity(){let e=this.selectedKey||this.inputValue||null;this.internalsController.setValue(e),this.isRequired&&!e?(this.internalsController.setValidity({valueMissing:!0},`Please enter or select a value.`),this.setAttribute(`is-invalid`,``)):(this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`))}filterItems(){let e=this.inputValue.toLowerCase().trim();for(let t of this.items){let n=t.text.toLowerCase();t.hidden=!(!e||n.includes(e))}this.requestUpdate()}selectItem(e,t){this.selectedKey=e,this.inputValue=t,this.syncFormValueAndValidity(),this.close(),this.focus();for(let t of this.items)t.setAttribute(`aria-selected`,t.key===e?`true`:`false`),t.hidden=!1;this.dispatchEvent(new CustomEvent(`selectionchange`,{detail:{selectedKey:this.selectedKey},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`inputchange`,{detail:{inputValue:this.inputValue},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.inputValue},bubbles:!0,composed:!0}))}handleInput=e=>{let t=e.target;this.inputValue=t.value,this.selectedKey=``,this.syncFormValueAndValidity(),this.open(),this.filterItems(),this.dispatchEvent(new CustomEvent(`inputchange`,{detail:{inputValue:this.inputValue},bubbles:!0,composed:!0})),this.dispatchEvent(new Event(`input`,{bubbles:!0,composed:!0}))};handleKeyDown=e=>{if(this.isDisabled||e.defaultPrevented)return;if(!this.isOpen){(e.key===`ArrowDown`||e.key===`ArrowUp`)&&(e.preventDefault(),this.open());return}let t=this.visibleItems;if(t.length!==0){if(e.key===`ArrowDown`)e.preventDefault(),this.activeIndex=(this.activeIndex+1)%t.length,t[this.activeIndex]?.focus();else if(e.key===`ArrowUp`)e.preventDefault(),this.activeIndex=this.activeIndex<=0?t.length-1:this.activeIndex-1,t[this.activeIndex]?.focus();else if(e.key===`Enter`){e.preventDefault();let n=t[this.activeIndex];n&&this.selectItem(n.key,n.text)}else e.key===`Escape`&&(e.preventDefault(),this.close())}};handleItemClick=e=>{e.stopPropagation(),this.selectItem(e.detail.key,e.detail.text)};render(){let e=this.hasAttribute(`is-invalid`),t=this.visibleItems.length>0;return B`
      <div part="base" @keydown=${this.handleKeyDown}>
        ${this.label?B`<label part="label" for="input"><slot name="label">${this.label}</slot></label>`:B`<slot name="label"></slot>`}

        <div
          part="input-container"
          ?data-invalid=${e}
          ?data-disabled=${this.isDisabled}
        >
          <input
            id="input"
            part="input"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded=${this.isOpen?`true`:`false`}
            placeholder=${this.placeholder}
            .value=${this.inputValue}
            ?disabled=${this.isDisabled}
            ?required=${this.isRequired}
            aria-invalid=${e?`true`:`false`}
            @input=${this.handleInput}
          />

          <button
            type="button"
            part="toggle-btn"
            aria-label="Toggle options"
            tabindex="-1"
            ?disabled=${this.isDisabled}
            @click=${this.toggle}
          >
            ${ft()}
          </button>
        </div>

        <div
          part="popover"
          popover="auto"
          role="listbox"
          tabindex="-1"
          ?hidden=${!this.overlayController.isMounted}
          @combobox-item-click=${this.handleItemClick}
        >
          <slot @slotchange=${this.filterItems}></slot>
          ${t?``:B`<slot name="empty"><div part="empty">No results found</div></slot>`}
        </div>
      </div>
    `}}),W(`moul-combobox-item`,class extends U{static styles=Ud;static properties={key:{type:String,reflect:!0},textValue:{type:String,reflect:!0,attribute:`text-value`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`}};constructor(){super(),this.key=``,this.textValue=``,this.isDisabled=!1}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`option`),this.setAttribute(`tabindex`,`-1`),this.addEventListener(`click`,this.handleClick)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`click`,this.handleClick)}willUpdate(e){super.willUpdate(e),e.has(`isDisabled`)&&(this.isDisabled?this.setAttribute(`aria-disabled`,`true`):this.removeAttribute(`aria-disabled`))}get text(){return this.textValue||this.textContent?.trim()||this.key}handleClick=e=>{this.isDisabled||(e.preventDefault(),this.dispatchEvent(new CustomEvent(`combobox-item-click`,{detail:{key:this.key,text:this.text},bubbles:!0,composed:!0})))};render(){return B`
      <div part="item" ?data-disabled=${this.isDisabled}>
        <slot>${this.textValue||this.key}</slot>
      </div>
    `}});var Wd={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Gd=e=>(...t)=>({_$litDirective$:e,values:t}),Kd=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}},{I:qd}=tt,Jd=e=>e,Yd=e=>e.strings===void 0,Xd=()=>document.createComment(``),Zd=(e,t,n)=>{let r=e._$AA.parentNode,i=t===void 0?e._$AB:t._$AA;if(n===void 0)n=new qd(r.insertBefore(Xd(),i),r.insertBefore(Xd(),i),e,e.options);else{let t=n._$AB.nextSibling,a=n._$AM,o=a!==e;if(o){let t;n._$AQ?.(e),n._$AM=e,n._$AP!==void 0&&(t=e._$AU)!==a._$AU&&n._$AP(t)}if(t!==i||o){let e=n._$AA;for(;e!==t;){let t=Jd(e).nextSibling;Jd(r).insertBefore(e,i),e=t}}}return n},Qd=(e,t,n=e)=>(e._$AI(t,n),e),$d={},ef=(e,t=$d)=>e._$AH=t,tf=e=>e._$AH,nf=e=>{e._$AR(),e._$AA.remove()},rf=(e,t)=>{let n=e._$AN;if(n===void 0)return!1;for(let e of n)e._$AO?.(t,!1),rf(e,t);return!0},af=e=>{let t,n;do{if((t=e._$AM)===void 0)break;n=t._$AN,n.delete(e),e=t}while(n?.size===0)},of=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(n===void 0)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),lf(t)}};function sf(e){this._$AN===void 0?this._$AM=e:(af(this),this._$AM=e,of(this))}function cf(e,t=!1,n=0){let r=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0){if(t){if(Array.isArray(r))for(let e=n;e<r.length;e++)rf(r[e],!1),af(r[e]);else r!=null&&(rf(r,!1),af(r))}else rf(this,e)}}var lf=e=>{e.type==Wd.CHILD&&(e._$AP??=cf,e._$AQ??=sf)},uf=class extends Kd{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,n){super._$AT(e,t,n),of(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(rf(this,e),af(this))}setValue(e){if(Yd(this._$Ct))this._$Ct._$AI(e,this);else{let t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}},df=(e,t,n)=>{let r=new Map;for(let i=t;i<=n;i++)r.set(e[i],i);return r},ff=Gd(class extends Kd{constructor(e){if(super(e),e.type!==Wd.CHILD)throw Error(`repeat() can only be used in text expressions`)}dt(e,t,n){let r;n===void 0?n=t:t!==void 0&&(r=t);let i=[],a=[],o=0;for(let t of e)i[o]=r?r(t,o):o,a[o]=n(t,o),o++;return{values:a,keys:i}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,r]){let i=tf(e),{values:a,keys:o}=this.dt(t,n,r);if(!Array.isArray(i))return this.ut=o,a;let s=this.ut??=[],c=[],l,u,d=0,f=i.length-1,p=0,m=a.length-1;for(;d<=f&&p<=m;)if(i[d]===null)d++;else if(i[f]===null)f--;else if(s[d]===o[p])c[p]=Qd(i[d],a[p]),d++,p++;else if(s[f]===o[m])c[m]=Qd(i[f],a[m]),f--,m--;else if(s[d]===o[m])c[m]=Qd(i[d],a[m]),Zd(e,c[m+1],i[d]),d++,m--;else if(s[f]===o[p])c[p]=Qd(i[f],a[p]),Zd(e,i[d],i[f]),f--,p++;else if(l===void 0&&(l=df(o,p,m),u=df(s,d,f)),l.has(s[d])){if(l.has(s[f])){let t=u.get(o[p]),n=t===void 0?null:i[t];if(n===null){let t=Zd(e,i[d]);Qd(t,a[p]),c[p]=t}else c[p]=Qd(n,a[p]),Zd(e,i[d],n),i[t]=null;p++}else nf(i[f]),f--}else nf(i[d]),d++;for(;p<=m;){let t=Zd(e,c[m+1]);Qd(t,a[p]),c[p++]=t}for(;d<=f;){let e=i[d++];e!==null&&nf(e)}return this.ut=o,ef(e,c),Ve}}),pf=class e extends Event{constructor(t){super(e.eventName,{bubbles:!1}),this.first=t.first,this.last=t.last}};pf.eventName=`rangeChanged`;var mf=class e extends Event{constructor(t){super(e.eventName,{bubbles:!1}),this.first=t.first,this.last=t.last}};mf.eventName=`visibilityChanged`;var hf=class e extends Event{constructor(){super(e.eventName,{bubbles:!1})}};hf.eventName=`unpinned`;var gf=class{constructor(e){this._element=null;let t=e??window;this._node=t,e&&(this._element=e)}get element(){return this._element||document.scrollingElement||document.documentElement}get scrollTop(){return this.element.scrollTop||window.scrollY}get scrollLeft(){return this.element.scrollLeft||window.scrollX}get scrollHeight(){return this.element.scrollHeight}get scrollWidth(){return this.element.scrollWidth}get viewportHeight(){return this._element?this._element.getBoundingClientRect().height:window.innerHeight}get viewportWidth(){return this._element?this._element.getBoundingClientRect().width:window.innerWidth}get maxScrollTop(){return this.scrollHeight-this.viewportHeight}get maxScrollLeft(){return this.scrollWidth-this.viewportWidth}},_f=class extends gf{constructor(e,t){super(t),this._clients=new Set,this._retarget=null,this._end=null,this.__destination=null,this.correctingScrollError=!1,this._checkForArrival=this._checkForArrival.bind(this),this._updateManagedScrollTo=this._updateManagedScrollTo.bind(this),this.scrollTo=this.scrollTo.bind(this),this.scrollBy=this.scrollBy.bind(this);let n=this._node;this._originalScrollTo=n.scrollTo,this._originalScrollBy=n.scrollBy,this._originalScroll=n.scroll,this._attach(e)}get _destination(){return this.__destination}get scrolling(){return this._destination!==null}scrollTo(e,t){let n=typeof e==`number`&&typeof t==`number`?{left:e,top:t}:e;this._scrollTo(n)}scrollBy(e,t){let n=typeof e==`number`&&typeof t==`number`?{left:e,top:t}:e;n.top!==void 0&&(n.top+=this.scrollTop),n.left!==void 0&&(n.left+=this.scrollLeft),this._scrollTo(n)}_nativeScrollTo(e){this._originalScrollTo.bind(this._element||window)(e)}_scrollTo(e,t=null,n=null){this._end!==null&&this._end(),e.behavior===`smooth`?(this._setDestination(e),this._retarget=t,this._end=n):this._resetScrollState(),this._nativeScrollTo(e)}_setDestination(e){let{top:t,left:n}=e;return t=t===void 0?void 0:Math.max(0,Math.min(t,this.maxScrollTop)),n=n===void 0?void 0:Math.max(0,Math.min(n,this.maxScrollLeft)),this._destination!==null&&n===this._destination.left&&t===this._destination.top?!1:(this.__destination={top:t,left:n,behavior:`smooth`},!0)}_resetScrollState(){this.__destination=null,this._retarget=null,this._end=null}_updateManagedScrollTo(e){this._destination&&this._setDestination(e)&&this._nativeScrollTo(this._destination)}managedScrollTo(e,t,n){return this._scrollTo(e,t,n),this._updateManagedScrollTo}correctScrollError(e){this.correctingScrollError=!0,requestAnimationFrame(()=>requestAnimationFrame(()=>this.correctingScrollError=!1)),this._nativeScrollTo(e),this._retarget&&this._setDestination(this._retarget()),this._destination&&this._nativeScrollTo(this._destination)}_checkForArrival(){if(this._destination!==null){let{scrollTop:e,scrollLeft:t}=this,{top:n,left:r}=this._destination;n=Math.min(n||0,this.maxScrollTop),r=Math.min(r||0,this.maxScrollLeft);let i=Math.abs(n-e),a=Math.abs(r-t);i<1&&a<1&&(this._end&&this._end(),this._resetScrollState())}}detach(e){return this._clients.delete(e),this._clients.size===0&&(this._node.scrollTo=this._originalScrollTo,this._node.scrollBy=this._originalScrollBy,this._node.scroll=this._originalScroll,this._node.removeEventListener(`scroll`,this._checkForArrival)),null}_attach(e){this._clients.add(e),this._clients.size===1&&(this._node.scrollTo=this.scrollTo,this._node.scrollBy=this.scrollBy,this._node.scroll=this.scrollTo,this._node.addEventListener(`scroll`,this._checkForArrival))}},vf=typeof window<`u`?window.ResizeObserver:void 0,yf=Symbol(`virtualizerRef`),bf=`virtualizer-sizer`,xf,Sf=class{constructor(e){if(this._benchmarkStart=null,this._layout=null,this._clippingAncestors=[],this._scrollSize=null,this._scrollError=null,this._childrenPos=null,this._childMeasurements=null,this._toBeMeasured=new Map,this._rangeChanged=!0,this._itemsChanged=!0,this._visibilityChanged=!0,this._scrollerController=null,this._isScroller=!1,this._sizer=null,this._hostElementRO=null,this._childrenRO=null,this._mutationObserver=null,this._scrollEventListeners=[],this._scrollEventListenerOptions={passive:!0},this._loadListener=this._childLoaded.bind(this),this._scrollIntoViewTarget=null,this._updateScrollIntoViewCoordinates=null,this._items=[],this._first=-1,this._last=-1,this._firstVisible=-1,this._lastVisible=-1,this._scheduled=new WeakSet,this._measureCallback=null,this._measureChildOverride=null,this._layoutCompletePromise=null,this._layoutCompleteResolver=null,this._layoutCompleteRejecter=null,this._pendingLayoutComplete=null,this._layoutInitialized=null,this._connected=!1,!e)throw Error(`Virtualizer constructor requires a configuration object`);if(e.hostElement)this._init(e);else throw Error(`Virtualizer configuration requires the "hostElement" property`)}set items(e){Array.isArray(e)&&e!==this._items&&(this._itemsChanged=!0,this._items=e,this._schedule(this._updateLayout))}_init(e){this._isScroller=!!e.scroller,this._initHostElement(e);let t=e.layout||{};this._layoutInitialized=this._initLayout(t)}_initObservers(){this._mutationObserver=new MutationObserver(this._finishDOMUpdate.bind(this)),this._hostElementRO=new vf(()=>this._hostElementSizeChanged()),this._childrenRO=new vf(this._childrenSizeChanged.bind(this))}_initHostElement(e){let t=this._hostElement=e.hostElement;this._applyVirtualizerStyles(),t[yf]=this}connected(){this._initObservers();let e=this._isScroller;this._clippingAncestors=Df(this._hostElement,e),this._scrollerController=new _f(this,this._clippingAncestors[0]),this._schedule(this._updateLayout),this._observeAndListen(),this._connected=!0}_observeAndListen(){this._mutationObserver.observe(this._hostElement,{childList:!0}),this._hostElementRO.observe(this._hostElement),this._scrollEventListeners.push(window),window.addEventListener(`scroll`,this,this._scrollEventListenerOptions),this._clippingAncestors.forEach(e=>{e.addEventListener(`scroll`,this,this._scrollEventListenerOptions),this._scrollEventListeners.push(e),this._hostElementRO.observe(e)}),this._hostElementRO.observe(this._scrollerController.element),this._children.forEach(e=>this._childrenRO.observe(e)),this._scrollEventListeners.forEach(e=>e.addEventListener(`scroll`,this,this._scrollEventListenerOptions))}disconnected(){this._scrollEventListeners.forEach(e=>e.removeEventListener(`scroll`,this,this._scrollEventListenerOptions)),this._scrollEventListeners=[],this._clippingAncestors=[],this._scrollerController?.detach(this),this._scrollerController=null,this._mutationObserver?.disconnect(),this._mutationObserver=null,this._hostElementRO?.disconnect(),this._hostElementRO=null,this._childrenRO?.disconnect(),this._childrenRO=null,this._rejectLayoutCompletePromise(`disconnected`),this._connected=!1}_applyVirtualizerStyles(){let e=this._hostElement.style;e.display=e.display||`block`,e.position=e.position||`relative`,e.contain=e.contain||`size layout`,this._isScroller&&(e.overflow=e.overflow||`auto`,e.minHeight=e.minHeight||`150px`)}_getSizer(){let e=this._hostElement;if(!this._sizer){let t=e.querySelector(`[${bf}]`);t||(t=document.createElement(`div`),t.setAttribute(bf,``),e.appendChild(t)),Object.assign(t.style,{position:`absolute`,margin:`-2px 0 0 0`,padding:0,visibility:`hidden`,fontSize:`2px`}),t.textContent=`&nbsp;`,t.setAttribute(bf,``),this._sizer=t}return this._sizer}async updateLayoutConfig(e){await this._layoutInitialized;let t=e.type||xf;if(typeof t==`function`&&this._layout instanceof t){let t={...e};return delete t.type,this._layout.config=t,!0}return!1}async _initLayout(e){let t,n;if(typeof e.type==`function`){n=e.type;let r={...e};delete r.type,t=r}else t=e;n===void 0&&(xf=n=(await k(async()=>{let{FlowLayout:e}=await import(`./flow-C_2jcyZ5-SthcuBkX.js`);return{FlowLayout:e}},[])).FlowLayout),this._layout=new n(e=>this._handleLayoutMessage(e),t),this._layout.measureChildren&&typeof this._layout.updateItemSizes==`function`&&(typeof this._layout.measureChildren==`function`&&(this._measureChildOverride=this._layout.measureChildren),this._measureCallback=this._layout.updateItemSizes.bind(this._layout)),this._layout.listenForChildLoadEvents&&this._hostElement.addEventListener(`load`,this._loadListener,!0),this._schedule(this._updateLayout)}startBenchmarking(){this._benchmarkStart===null&&(this._benchmarkStart=window.performance.now())}stopBenchmarking(){if(this._benchmarkStart!==null){let e=window.performance.now(),t=e-this._benchmarkStart,n=performance.getEntriesByName(`uv-virtualizing`,`measure`).filter(t=>t.startTime>=this._benchmarkStart&&t.startTime<e).reduce((e,t)=>e+t.duration,0);return this._benchmarkStart=null,{timeElapsed:t,virtualizationTime:n}}return null}_measureChildren(){let e={},t=this._children,n=this._measureChildOverride||this._measureChild;for(let r=0;r<t.length;r++){let i=t[r],a=this._first+r;(this._itemsChanged||this._toBeMeasured.has(i))&&(e[a]=n.call(this,i,this._items[a]))}this._childMeasurements=e,this._schedule(this._updateLayout),this._toBeMeasured.clear()}_measureChild(e){let{width:t,height:n}=e.getBoundingClientRect();return Object.assign({width:t,height:n},Cf(e))}async _schedule(e){this._scheduled.has(e)||(this._scheduled.add(e),await Promise.resolve(),this._scheduled.delete(e),e.call(this))}async _updateDOM(e){this._scrollSize=e.scrollSize,this._adjustRange(e.range),this._childrenPos=e.childPositions,this._scrollError=e.scrollError||null;let{_rangeChanged:t,_itemsChanged:n}=this;this._visibilityChanged&&=(this._notifyVisibility(),!1),(t||n)&&(this._notifyRange(),this._rangeChanged=!1),this._finishDOMUpdate()}_finishDOMUpdate(){this._connected&&(this._children.forEach(e=>this._childrenRO.observe(e)),this._checkScrollIntoViewTarget(this._childrenPos),this._positionChildren(this._childrenPos),this._sizeHostElement(this._scrollSize),this._correctScrollError(),this._benchmarkStart&&`mark`in window.performance&&window.performance.mark(`uv-end`))}_updateLayout(){this._layout&&this._connected&&(this._layout.items=this._items,this._updateView(),this._childMeasurements!==null&&(this._measureCallback&&this._measureCallback(this._childMeasurements),this._childMeasurements=null),this._layout.reflowIfNeeded(),this._benchmarkStart&&`mark`in window.performance&&window.performance.mark(`uv-end`))}_handleScrollEvent(){if(this._benchmarkStart&&`mark`in window.performance){try{window.performance.measure(`uv-virtualizing`,`uv-start`,`uv-end`)}catch(e){console.warn(`Error measuring performance data: `,e)}window.performance.mark(`uv-start`)}this._scrollerController.correctingScrollError===!1&&this._layout?.unpin(),this._schedule(this._updateLayout)}handleEvent(e){switch(e.type){case`scroll`:(e.currentTarget===window||this._clippingAncestors.includes(e.currentTarget))&&this._handleScrollEvent();break;default:console.warn(`event not handled`,e)}}_handleLayoutMessage(e){e.type===`stateChanged`?this._updateDOM(e):e.type===`visibilityChanged`?(this._firstVisible=e.firstVisible,this._lastVisible=e.lastVisible,this._notifyVisibility()):e.type===`unpinned`&&this._hostElement.dispatchEvent(new hf)}get _children(){let e=[],t=this._hostElement.firstElementChild;for(;t;)t.hasAttribute(bf)||e.push(t),t=t.nextElementSibling;return e}_updateView(){let e=this._hostElement,t=this._scrollerController?.element,n=this._layout;if(e&&t&&n){let r,i,a,o,s=e.getBoundingClientRect();r=0,i=0,a=window.innerHeight,o=window.innerWidth;let c=this._clippingAncestors.map(e=>e.getBoundingClientRect());c.unshift(s);for(let e of c)r=Math.max(r,e.top),i=Math.max(i,e.left),a=Math.min(a,e.bottom),o=Math.min(o,e.right);let l=t.getBoundingClientRect(),u={left:s.left-l.left,top:s.top-l.top},d={width:t.scrollWidth,height:t.scrollHeight},f=r-s.top+e.scrollTop,p=i-s.left+e.scrollLeft,m=Math.max(0,a-r);n.viewportSize={width:Math.max(0,o-i),height:m},n.viewportScroll={top:f,left:p},n.totalScrollSize=d,n.offsetWithinScroller=u}}_sizeHostElement(e){let t=82e5,n=e&&e.width!==null?Math.min(t,e.width):0,r=e&&e.height!==null?Math.min(t,e.height):0;if(this._isScroller)this._getSizer().style.transform=`translate(${n}px, ${r}px)`;else{let e=this._hostElement.style;e.minWidth=n?`${n}px`:`100%`,e.minHeight=r?`${r}px`:`100%`}}_positionChildren(e){e&&e.forEach(({top:e,left:t,width:n,height:r,xOffset:i,yOffset:a},o)=>{let s=this._children[o-this._first];s&&(s.style.position=`absolute`,s.style.boxSizing=`border-box`,s.style.transform=`translate(${t}px, ${e}px)`,n!==void 0&&(s.style.width=n+`px`),r!==void 0&&(s.style.height=r+`px`),s.style.left=i===void 0?null:i+`px`,s.style.top=a===void 0?null:a+`px`)})}async _adjustRange(e){let{_first:t,_last:n,_firstVisible:r,_lastVisible:i}=this;this._first=e.first,this._last=e.last,this._firstVisible=e.firstVisible,this._lastVisible=e.lastVisible,this._rangeChanged=this._rangeChanged||this._first!==t||this._last!==n,this._visibilityChanged=this._visibilityChanged||this._firstVisible!==r||this._lastVisible!==i}_correctScrollError(){if(this._scrollError){let{scrollTop:e,scrollLeft:t}=this._scrollerController,{top:n,left:r}=this._scrollError;this._scrollError=null,this._scrollerController.correctScrollError({top:e-n,left:t-r})}}element(e){return e===1/0&&(e=this._items.length-1),this._items?.[e]===void 0?void 0:{scrollIntoView:(t={})=>this._scrollElementIntoView({...t,index:e})}}_scrollElementIntoView(e){if(e.index>=this._first&&e.index<=this._last)this._children[e.index-this._first].scrollIntoView(e);else if(e.index=Math.min(e.index,this._items.length-1),e.behavior===`smooth`){let t=this._layout.getScrollIntoViewCoordinates(e),{behavior:n}=e;this._updateScrollIntoViewCoordinates=this._scrollerController.managedScrollTo(Object.assign(t,{behavior:n}),()=>this._layout.getScrollIntoViewCoordinates(e),()=>this._scrollIntoViewTarget=null),this._scrollIntoViewTarget=e}else this._layout.pin=e}_checkScrollIntoViewTarget(e){let{index:t}=this._scrollIntoViewTarget||{};t&&e?.has(t)&&this._updateScrollIntoViewCoordinates(this._layout.getScrollIntoViewCoordinates(this._scrollIntoViewTarget))}_notifyRange(){this._hostElement.dispatchEvent(new pf({first:this._first,last:this._last}))}_notifyVisibility(){this._hostElement.dispatchEvent(new mf({first:this._firstVisible,last:this._lastVisible}))}get layoutComplete(){return this._layoutCompletePromise||=new Promise((e,t)=>{this._layoutCompleteResolver=e,this._layoutCompleteRejecter=t}),this._layoutCompletePromise}_rejectLayoutCompletePromise(e){this._layoutCompleteRejecter!==null&&this._layoutCompleteRejecter(e),this._resetLayoutCompleteState()}_scheduleLayoutComplete(){this._layoutCompletePromise&&this._pendingLayoutComplete===null&&(this._pendingLayoutComplete=requestAnimationFrame(()=>requestAnimationFrame(()=>this._resolveLayoutCompletePromise())))}_resolveLayoutCompletePromise(){this._layoutCompleteResolver!==null&&this._layoutCompleteResolver(),this._resetLayoutCompleteState()}_resetLayoutCompleteState(){this._layoutCompletePromise=null,this._layoutCompleteResolver=null,this._layoutCompleteRejecter=null,this._pendingLayoutComplete=null}_hostElementSizeChanged(){this._schedule(this._updateLayout)}_childLoaded(){}_childrenSizeChanged(e){if(this._layout?.measureChildren){for(let t of e)this._toBeMeasured.set(t.target,t.contentRect);this._measureChildren()}this._scheduleLayoutComplete(),this._itemsChanged=!1,this._rangeChanged=!1}};function Cf(e){let t=window.getComputedStyle(e);return{marginTop:wf(t.marginTop),marginRight:wf(t.marginRight),marginBottom:wf(t.marginBottom),marginLeft:wf(t.marginLeft)}}function wf(e){let t=e?parseFloat(e):NaN;return Number.isNaN(t)?0:t}function Tf(e){if(e.assignedSlot!==null)return e.assignedSlot;if(e.parentElement!==null)return e.parentElement;let t=e.parentNode;return t&&t.nodeType===Node.DOCUMENT_FRAGMENT_NODE&&t.host||null}function Ef(e,t=!1){let n=[],r=t?e:Tf(e);for(;r!==null;)n.push(r),r=Tf(r);return n}function Df(e,t=!1){let n=!1;return Ef(e,t).filter(e=>{if(n)return!1;let t=getComputedStyle(e);return n=t.position===`fixed`,t.overflow!==`visible`})}var Of=e=>e,kf=(e,t)=>B`${t}: ${JSON.stringify(e,null,2)}`,Af=Gd(class extends uf{constructor(e){if(super(e),this._virtualizer=null,this._first=0,this._last=-1,this._renderItem=(e,t)=>kf(e,t+this._first),this._keyFunction=(e,t)=>Of(e,t+this._first),this._items=[],e.type!==Wd.CHILD)throw Error(`The virtualize directive can only be used in child expressions`)}render(e){e&&this._setFunctions(e);let t=[];if(this._first>=0&&this._last>=this._first)for(let e=this._first;e<=this._last;e++)t.push(this._items[e]);return ff(t,this._keyFunction,this._renderItem)}update(e,[t]){this._setFunctions(t);let n=this._items!==t.items;return this._items=t.items||[],this._virtualizer?this._updateVirtualizerConfig(e,t):this._initialize(e,t),n?Ve:this.render()}async _updateVirtualizerConfig(e,t){if(!await this._virtualizer.updateLayoutConfig(t.layout||{})){let n=e.parentNode;this._makeVirtualizer(n,t)}this._virtualizer.items=this._items}_setFunctions(e){let{renderItem:t,keyFunction:n}=e;t&&(this._renderItem=(e,n)=>t(e,n+this._first)),n&&(this._keyFunction=(e,t)=>n(e,t+this._first))}_makeVirtualizer(e,t){this._virtualizer&&this._virtualizer.disconnected();let{layout:n,scroller:r,items:i}=t;this._virtualizer=new Sf({hostElement:e,layout:n,scroller:r}),this._virtualizer.items=i,this._virtualizer.connected()}_initialize(e,t){let n=e.parentNode;n&&n.nodeType===1&&(n.addEventListener(`rangeChanged`,e=>{this._first=e.first,this._last=e.last,this.setValue(this.render())}),this._makeVirtualizer(n,t))}disconnected(){this._virtualizer?.disconnected()}reconnected(){this._virtualizer?.connected()}}),jf=[J,M`
    :host {
      display: contents;
    }

    dialog {
      padding: 12vh var(--spacing-4, 1rem) var(--spacing-4, 1rem);
      border: none;
      background: transparent;
      overflow: visible;
      color: inherit;
      max-width: none;
      max-height: none;
      width: 100%;
      height: 100%;
      inset: 0;
      position: fixed;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: var(--z-modal, 1300);
      margin: 0;
      box-sizing: border-box;
    }

    dialog:not([open]) {
      display: none;
    }

    /*
     * Panel surface (fill, radius, shadow) comes from the shared overlay styles.
     * The 8px inset keeps the field and row radii concentric with the panel's.
     */
    [part~="base"] {
      width: 100%;
      max-width: 36rem;
      max-height: min(28rem, 100%);
      display: flex;
      flex-direction: column;
      padding: var(--spacing-2, 0.5rem);
      overflow: hidden;
      outline: none;
      box-sizing: border-box;
    }

    /* Search field (HeroUI secondary search field: soft fill, no shadow) */
    [part~="input-wrapper"] {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      height: 2.25rem;
      border-radius: var(--radius-field, 0.75rem);
      background-color: var(--color-default);
      color: var(--color-field-fg);
      transition:
        background-color 150ms var(--ease-smooth, ease),
        box-shadow 150ms var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      [part~="input-wrapper"]:hover:not(:focus-within) {
        background-color: var(--color-default-hover);
      }
    }

    [part~="input-wrapper"]:focus-within {
      box-shadow: var(--focus-ring-field);
    }

    .search-icon {
      width: 1rem;
      height: 1rem;
      margin-inline-start: var(--spacing-3, 0.75rem);
      color: var(--color-field-placeholder);
      flex-shrink: 0;
      display: inline-flex;
      pointer-events: none;
    }

    .search-icon svg {
      width: 100%;
      height: 100%;
    }

    [part~="input"] {
      flex: 1 1 auto;
      min-width: 0;
      height: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: var(--color-field-fg);
      font-family: inherit;
      /* 16px on touch screens avoids iOS focus zoom */
      font-size: var(--font-size-md, 1rem);
      line-height: var(--line-height-md, 1.5rem);
      padding: 0 var(--spacing-3, 0.75rem) 0 var(--spacing-2, 0.5rem);
    }

    @media (min-width: 640px) {
      [part~="input"] {
        font-size: var(--font-size-sm, 0.875rem);
        line-height: var(--line-height-sm, 1.25rem);
      }
    }

    [part~="input"]::placeholder {
      color: var(--color-field-placeholder);
    }

    /* List box */
    [part~="list"] {
      flex: 0 1 auto;
      min-height: 0;
      max-height: 20rem;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
      margin-top: var(--spacing-1, 0.25rem);
      padding: var(--spacing-1, 0.25rem) 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      outline: none;
    }

    [part~="item"] {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3, 0.75rem);
      min-height: 2.25rem;
      padding: 0.375rem var(--spacing-2, 0.5rem);
      border-radius: var(--radius-2xl, 1rem);
      color: var(--color-fg);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      /* scale, not transform: the virtualizer positions rows with transform */
      transition:
        scale var(--duration-fast, 150ms) var(--ease-out, ease-out),
        box-shadow 150ms var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      [part~="item"]:hover {
        background-color: var(--color-default);
      }
    }

    [part~="item-active"] {
      background-color: var(--color-default);
    }

    [part~="item"]:active {
      scale: 0.98;
    }

    [part~="item"]:focus-visible {
      box-shadow: var(--focus-ring);
    }

    [part~="item"][aria-disabled="true"] {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    .item-content {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-width: 0;
    }

    .item-title {
      font-weight: var(--font-weight-medium, 500);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-description {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Shortcut key cap (HeroUI kbd) */
    .item-shortcut {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      height: 1.5rem;
      padding: 0 var(--spacing-2, 0.5rem);
      border-radius: var(--radius-lg, 0.5rem);
      background-color: var(--color-default);
      color: var(--color-muted);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      white-space: nowrap;
    }

    /* Keep the key cap distinct on a highlighted row */
    [part~="item-active"] .item-shortcut {
      background-color: var(--color-bg-elevated);
    }

    @media (hover: hover) {
      [part~="item"]:hover .item-shortcut {
        background-color: var(--color-bg-elevated);
      }
    }

    [part~="empty"] {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-8, 2rem) var(--spacing-4, 1rem);
      color: var(--color-muted);
      font-size: var(--font-size-sm, 0.875rem);
      text-align: center;
    }

    [part~="footer"] {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-shrink: 0;
      gap: var(--spacing-4, 1rem);
      margin-top: var(--spacing-1, 0.25rem);
      padding: var(--spacing-2, 0.5rem) var(--spacing-2, 0.5rem) 0;
      border-top: 1px solid var(--color-separator);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted);
    }

    /*
     * No open/close motion: the palette is summoned from the keyboard many times a
     * day, and any entrance would stand between the shortcut and the first keystroke.
     * :host outranks the shared backdrop fade appended after these styles.
     */
    :host dialog[open]::backdrop {
      animation: none;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~="input-wrapper"],
      [part~="item"] {
        transition: none;
      }

      [part~="item"]:active {
        scale: none;
      }
    }
  `,Zs];W(`moul-command-palette`,class extends U{static styles=jf;static properties={isOpen:{type:Boolean,reflect:!0,attribute:`is-open`},items:{type:Array,attribute:!1},placeholder:{type:String,reflect:!0},shortcut:{type:String,reflect:!0},virtualized:{type:Boolean,reflect:!0},query:{state:!0},activeIndex:{state:!0}};overlayPresence;previousActiveElement=null;constructor(){super(),this.isOpen=!1,this.items=[],this.placeholder=`Type a command or search...`,this.shortcut=`k`,this.virtualized=!1,this.query=``,this.activeIndex=0,this.overlayPresence=new Xs(this,{preset:`modal`,dialog:()=>this.dialogEl})}get dialogEl(){return this.shadowRoot?.querySelector(`dialog`)??null}get inputEl(){return this.shadowRoot?.querySelector(`[part="input"]`)??null}get isMounted(){return this.overlayPresence.isMounted}connectedCallback(){super.connectedCallback(),window.addEventListener(`keydown`,this.handleGlobalKeyDown),this.addEventListener(`keydown`,this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`keydown`,this.handleGlobalKeyDown),this.removeEventListener(`keydown`,this.handleKeyDown)}updated(e){super.updated(e),e.has(`isOpen`)&&this.isOpen!==this.overlayPresence.isOpen&&(this.isOpen?this.openPalette():this.closePalette())}async setOpen(e){this.isOpen===e&&this.overlayPresence.isOpen===e||(this.isOpen=e,this.dispatchEvent(new CustomEvent(`openchange`,{bubbles:!0,composed:!0,detail:{isOpen:this.isOpen}})),e?await this.openPalette():await this.closePalette())}async toggle(e){let t=typeof e==`boolean`?e:!this.isOpen;await this.setOpen(t)}async openPalette(){this.previousActiveElement=document.activeElement,this.query=``,this.activeIndex=0,await this.overlayPresence.setOpen(!0);let e=this.inputEl;e&&e.focus()}async closePalette(){await this.overlayPresence.setOpen(!1),Us(this.previousActiveElement)}handleGlobalKeyDown=e=>{(e.metaKey||e.ctrlKey)&&e.key.toLowerCase()===this.shortcut.toLowerCase()&&(e.preventDefault(),this.toggle())};handleKeyDown=e=>{if(!this.isOpen)return;let t=this.getFilteredItems();switch(e.key){case`Escape`:e.preventDefault(),e.stopPropagation(),this.setOpen(!1);break;case`ArrowDown`:e.preventDefault(),t.length>0&&(this.activeIndex=Math.min(t.length-1,this.activeIndex+1));break;case`ArrowUp`:e.preventDefault(),t.length>0&&(this.activeIndex=Math.max(0,this.activeIndex-1));break;case`Enter`:e.preventDefault(),t.length>0&&t[this.activeIndex]&&this.selectItem(t[this.activeIndex]);break;case`Tab`:{let t=this.dialogEl;t&&Bs(t,e);break}}};handleInput(e){let t=e.target;this.query=t.value,this.activeIndex=0}getFilteredItems(){let e=this.query.trim().toLowerCase();return e?(this.items||[]).filter(t=>{let n=t.title?.toLowerCase().includes(e),r=t.description?.toLowerCase().includes(e);return n||r}):this.items||[]}selectItem(e){e.disabled||(this.dispatchEvent(new CustomEvent(`select`,{bubbles:!0,composed:!0,detail:{item:e}})),this.setOpen(!1))}renderItem(e,t){let n=t===this.activeIndex;return B`
      <div
        id="item-${e.id||t}"
        part="item ${n?`item-active`:``}"
        role="option"
        aria-selected=${n?`true`:`false`}
        aria-disabled=${e.disabled?`true`:`false`}
        tabindex="-1"
        @click=${()=>this.selectItem(e)}
      >
        <div class="item-content">
          <span class="item-title">${e.title}</span>
          ${e.description?B`<span class="item-description">${e.description}</span>`:``}
        </div>
        ${e.shortcut?B`<span class="item-shortcut">${e.shortcut}</span>`:``}
      </div>
    `}render(){let e=this.getFilteredItems(),t=e[this.activeIndex];return B`
      <dialog
        part="dialog"
        class="dialog"
        @click=${e=>{e.target===this.dialogEl&&this.setOpen(!1)}}
      >
        <div part="base" class="command-palette-card">
          <slot name="header"></slot>

          <div part="input-wrapper" class="input-wrapper">
            <span class="search-icon">${pt()}</span>
            <input
              part="input"
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-autocomplete="list"
              aria-controls="palette-list"
              aria-activedescendant=${t?`item-${t.id||this.activeIndex}`:``}
              placeholder=${this.placeholder}
              .value=${this.query}
              @input=${this.handleInput}
            />
          </div>

          <div id="palette-list" part="list" role="listbox" class="list">
            ${e.length===0?B`
                  <div part="empty" class="empty">
                    <slot name="empty">No results found.</slot>
                  </div>
                `:this.virtualized&&e.length>50?Af({items:e,renderItem:(e,t)=>this.renderItem(e,t)}):e.map((e,t)=>this.renderItem(e,t))}
          </div>

          <div part="footer">
            <slot name="footer">
              <span>Navigation: ↑↓, Select: ↵, Dismiss: Esc</span>
            </slot>
          </div>
        </div>
      </dialog>
    `}});var Mf=[J,M`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      position: relative;
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    /* Flex drops template whitespace so the required mark sits tight to the text */
    [part~='label'] {
      display: flex;
      align-items: baseline;
      width: fit-content;
      line-height: var(--line-height-sm, 1.25rem);
    }

    :host([is-required][label]:not([label=''])) [part~='label']::after {
      content: '*';
      margin-inline-start: 0.125rem;
      color: var(--color-danger);
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='label'] {
      color: var(--color-danger);
    }

    [part~='input-container'] {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
      min-height: 2.25rem;
      font-size: var(--font-size-sm, 0.875rem);
    }

    /* The calendar button carries the end inset, so the text stops short of it */
    [part~='input'] {
      flex: 1;
      width: 100%;
      min-width: 0;
      border: none;
      border-radius: 0;
      outline: none;
      background: transparent;
      box-shadow: none;
      color: inherit;
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-variant-numeric: tabular-nums;
      padding-block: var(--spacing-2, 0.5rem);
      padding-inline: var(--spacing-3, 0.75rem) var(--spacing-2, 0.5rem);
    }

    [part~='trigger-btn'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: stretch;
      flex-shrink: 0;
      margin: 0;
      border: none;
      background: transparent;
      color: var(--color-field-placeholder);
      cursor: pointer;
      padding-inline: var(--spacing-1, 0.25rem) var(--spacing-3, 0.75rem);
      outline: none;
      -webkit-tap-highlight-color: transparent;
      transition: color var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    @media (hover: hover) {
      [part~='trigger-btn']:hover:not(:disabled) {
        color: var(--color-field-fg);
      }
    }

    :host([is-open]) [part~='trigger-btn'] {
      color: var(--color-field-fg);
    }

    [part~='trigger-btn'] svg {
      width: 1rem;
      height: 1rem;
    }

    /* Calendar panel: a solid overlay surface; the calendar itself is unframed.
       The controller matches the panel to the field's width, so center it. */
    [part~='popover'] {
      margin: 0;
      border: none;
      border-radius: min(2rem, calc(var(--radius-base, 0.5rem) * 2.5));
      background-color: var(--color-bg-elevated);
      box-shadow: var(--shadow-overlay);
      color: var(--color-fg);
      z-index: var(--z-dropdown, 1000);
      outline: none;
      width: fit-content;
      text-align: center;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: none;
      padding: var(--spacing-3, 0.75rem);
    }

    [part~='popover'][hidden] {
      display: none !important;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* :host raises specificity past the shared shell's transition */
    @media (prefers-reduced-motion: reduce) {
      :host [part~='input-container'],
      [part~='trigger-btn'] {
        transition: none;
      }
    }
  `,Vd];W(`moul-date-picker`,class extends U{static styles=Mf;static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},locale:{type:String,reflect:!0},placeholder:{type:String,reflect:!0},label:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},minDate:{type:String,attribute:`min-date`},maxDate:{type:String,attribute:`max-date`},isOpen:{type:Boolean,reflect:!0,attribute:`is-open`}};internalsController;overlayController;constructor(){super(),this.name=``,this.value=``,this.locale=`en-US`,this.placeholder=`YYYY-MM-DD`,this.label=``,this.isDisabled=!1,this.isRequired=!1,this.minDate=``,this.maxDate=``,this.isOpen=!1,this.internalsController=new Rd(this),this.overlayController=new Xs(this,{preset:`popover`,popover:()=>this.popoverElement,target:()=>this.popoverElement,onLightDismiss:()=>this.close(),anchor:()=>this.renderRoot?.querySelector(`[part="input-container"]`)??null})}get inputElement(){return this.renderRoot?.querySelector(`input`)??null}get popoverElement(){return this.renderRoot?.querySelector(`[part="popover"]`)??null}get calendarElement(){return this.renderRoot?.querySelector(`moul-calendar`)??null}focus(e){this.inputElement?.focus(e)}blur(){this.inputElement?.blur()}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}open(){this.isDisabled||this.isOpen||this.overlayController.wasJustDismissed||(this.isOpen=!0,this.overlayController.setOpen(!0))}close(){this.isOpen&&(this.isOpen=!1,this.overlayController.setOpen(!1))}handleFieldClick=e=>{e.target?.closest?.(`[part~="trigger-btn"]`)||this.open()};toggle(){this.isOpen?this.close():this.open()}willUpdate(e){super.willUpdate(e),(e.has(`value`)||e.has(`isRequired`))&&this.syncFormValueAndValidity(),e.has(`isOpen`)&&(this.isOpen?this.overlayController.setOpen(!0):this.overlayController.setOpen(!1))}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.querySelector(`[slot="label"]`));Td(this,`date picker`,t)}syncFormValueAndValidity(){this.internalsController.setValue(this.value||null),this.isRequired&&!this.value?(this.internalsController.setValidity({valueMissing:!0},`Please select a date.`),this.setAttribute(`is-invalid`,``)):(this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`))}get formattedDisplayDate(){if(!this.value||!/^\d{4}-\d{2}-\d{2}$/.test(this.value))return this.value;let[e,t,n]=this.value.split(`-`).map(Number),r=new Date(e,t-1,n);if(isNaN(r.getTime()))return this.value;try{return new Intl.DateTimeFormat(this.locale||`en-US`,{year:`numeric`,month:`short`,day:`numeric`}).format(r)}catch{return this.value}}handleCalendarChange=e=>{e.stopPropagation(),this.value=e.detail.value,this.syncFormValueAndValidity(),this.close(),this.focus(),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0}))};handleInput=e=>{let t=e.target;this.value=t.value,this.syncFormValueAndValidity(),this.dispatchEvent(new Event(`input`,{bubbles:!0,composed:!0}))};handleChange=e=>{this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0}))};handleKeyDown=e=>{e.key===`Escape`&&this.isOpen&&(e.preventDefault(),this.close(),this.focus())};render(){let e=this.hasAttribute(`is-invalid`),t=this.formattedDisplayDate||this.value;return B`
      <div part="base" @keydown=${this.handleKeyDown}>
        ${this.label?B`<label part="label" for="input"><slot name="label">${this.label}</slot></label>`:B`<slot name="label"></slot>`}

        <div
          part="input-container"
          ?data-invalid=${e}
          ?data-disabled=${this.isDisabled}
          @click=${this.handleFieldClick}
        >
          <input
            id="input"
            part="input"
            type="text"
            placeholder=${this.placeholder}
            .value=${t}
            ?disabled=${this.isDisabled}
            ?required=${this.isRequired}
            aria-invalid=${e?`true`:`false`}
            @input=${this.handleInput}
            @change=${this.handleChange}
          />

          <button
            type="button"
            part="trigger-btn"
            aria-label="Open calendar"
            aria-haspopup="dialog"
            aria-expanded=${this.isOpen?`true`:`false`}
            tabindex="-1"
            ?disabled=${this.isDisabled}
            @click=${this.toggle}
          >
            ${V`
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            `}
          </button>
        </div>

        <div
          part="popover"
          popover="auto"
          tabindex="-1"
          ?hidden=${!this.overlayController.isMounted}
        >
          <moul-calendar
            .value=${this.value}
            .locale=${this.locale}
            .minDate=${this.minDate}
            .maxDate=${this.maxDate}
            ?is-disabled=${this.isDisabled}
            @change=${this.handleCalendarChange}
          ></moul-calendar>
        </div>

        ${this.renderRoot?B`<slot name="description"></slot><slot name="error"></slot>`:``}
      </div>
    `}});var Nf=[J,M`
    :host {
      display: block;
      position: relative;
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      overflow: hidden;
    }

    .chart-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    /* Slice gaps are painted in the card surface the chart usually sits on. */
    .slice {
      stroke: var(--color-surface, #ffffff);
      cursor: pointer;
      outline: none;
      transition: opacity var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    .slice:hover,
    .slice.is-active {
      opacity: 0.85;
    }

    .slice:focus-visible {
      outline: 2px solid var(--color-focus, #3b82f6);
      outline-offset: 2px;
    }

    /* Empty ring reads as an unfilled track, like HeroUI progress/meter. */
    .empty-track {
      stroke: var(--color-default, oklch(0.94 0.001 286.375));
      pointer-events: none;
    }

    .center-container {
      position: absolute;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      border-radius: 50%;
      box-sizing: border-box;
      padding: var(--spacing-2, 0.5rem);
    }

    .center-labels {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.125rem;
    }

    .center-label {
      font-size: var(--font-size-xl, 1.25rem);
      font-weight: var(--font-weight-semibold, 600);
      font-variant-numeric: tabular-nums;
      color: var(--color-fg, inherit);
      line-height: var(--line-height-xl, 1.75rem);
    }

    .center-sublabel {
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-muted, #71717a);
      line-height: var(--line-height-xs, 1rem);
    }

    ::slotted([slot="center"]) {
      pointer-events: auto;
    }

    [part~="empty"],
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;
      color: var(--color-muted, #71717a);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding: var(--spacing-8, 2rem) var(--spacing-4, 1rem);
      text-align: center;
    }

    .empty-message {
      margin: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .slice {
        transition: none;
      }
    }
  `];W(`moul-doughnut-chart`,class extends U{static styles=Nf;static properties={data:{attribute:!1},innerRadiusRatio:{type:Number,attribute:`inner-radius-ratio`},height:{type:Number},centerLabel:{type:String,attribute:`center-label`},centerSublabel:{type:String,attribute:`center-sublabel`},padAngle:{type:Number,attribute:`pad-angle`},cornerRadius:{type:Number,attribute:`corner-radius`},valueFormatter:{attribute:!1}};layout;activeSliceIndex=null;constructor(){super(),this.data=[],this.innerRadiusRatio=.6,this.height=300,this.centerLabel=``,this.centerSublabel=``,this.padAngle=.02,this.cornerRadius=4,this.valueFormatter=void 0,this.layout=new dd(this,{observeDimensions:!0})}get containerWidth(){return this.layout.width>0?this.layout.width:this.clientWidth>0?this.clientWidth:300}get containerHeight(){return this.height>0?this.height:this.layout.height>0?this.layout.height:300}get effectiveInnerRadiusRatio(){let e=Number(this.innerRadiusRatio);return!Number.isFinite(e)||e<=0?0:Math.min(.95,e)}updated(e){super.updated(e),(e.has(`data`)||e.has(`innerRadiusRatio`)||e.has(`height`))&&this.animateSlices()}hasPlayedEntrance=!1;animateSlices(){if(this.hasPlayedEntrance||ws())return;let e=this.renderRoot?.querySelectorAll(`.slice`);e&&e.length>0&&(this.hasPlayedEntrance=!0,q(e,{opacity:[0,1]},{duration:.38,delay:qo(.04),ease:Cs}))}handleSliceEnter(e,t,n,r,i,a){this.activeSliceIndex=n,this.requestUpdate();let o=this.valueFormatter?this.valueFormatter(t.data.value):t.data.value,s=t.data.color||fd(t.index),c={point:t.data,series:{key:t.data.name,name:t.data.name,color:s},value:o,label:t.data.name,x:Math.round(i+r[0]),y:Math.round(a+r[1])};this.dispatchEvent(new CustomEvent(`point-hover`,{bubbles:!0,composed:!0,detail:c}))}handleSliceLeave(e){this.activeSliceIndex=null,this.requestUpdate(),this.dispatchEvent(new CustomEvent(`point-leave`,{bubbles:!0,composed:!0}))}render(){if(!this.data||!Array.isArray(this.data)||this.data.length===0)return B`
        <div part="empty" class="empty-state">
          <slot name="empty">
            <p class="empty-message">No data available</p>
          </slot>
        </div>
      `;let e=this.containerWidth,t=this.containerHeight,n=e/2,r=t/2,i=Math.max(10,Math.min(e,t)/2-16),a=i*this.effectiveInnerRadiusRatio,o=this.data.reduce((e,t)=>e+Math.max(0,Number(t?.value)||0),0),s=this.data.filter(e=>(Number(e?.value)||0)>0).length<=1,c=Xu().value(e=>Math.max(0,Number(e.value)||0)).sort(null).padAngle(s?0:this.padAngle)(this.data),l=Bu().innerRadius(a).cornerRadius(s?0:this.cornerRadius);return B`
      <div class="chart-wrapper" part="wrapper" style="height: ${t}px">
        <svg
          class="chart-svg"
          viewBox="0 0 ${e} ${t}"
          preserveAspectRatio="xMidYMid meet"
          part="svg"
          role="img"
          aria-label="${this.centerLabel||`Doughnut chart`}"
        >
          <g transform="translate(${n}, ${r})">
            ${o===0?V`
                  <circle
                    class="empty-track"
                    cx="0"
                    cy="0"
                    r="${(i+a)/2}"
                    stroke="var(--color-default, #f4f4f5)"
                    stroke-width="${Math.max(2,i-a)}"
                    fill="none"
                  />
                `:c.map((e,t)=>{if(e.startAngle===e.endAngle)return V``;let a=this.activeSliceIndex===t,o=a?i+6:i,s=l.outerRadius(o)(e);if(!s)return V``;let c=e.data.color||fd(e.index),u=l.centroid(e),d=this.valueFormatter?this.valueFormatter(e.data.value):String(e.data.value);return V`
                    <path
                      class="slice ${a?`is-active`:``}"
                      part="slice"
                      data-index="${t}"
                      data-name="${e.data.name}"
                      data-value="${e.data.value}"
                      d="${s}"
                      fill="${c}"
                      stroke="var(--color-surface, #ffffff)"
                      stroke-width="1.5"
                      role="graphics-symbol"
                      aria-label="${e.data.name}: ${d}"
                      tabindex="0"
                      @pointerenter="${i=>this.handleSliceEnter(i,e,t,u,n,r)}"
                      @pointerleave="${e=>this.handleSliceLeave(e)}"
                      @focus="${i=>this.handleSliceEnter(i,e,t,u,n,r)}"
                      @blur="${e=>this.handleSliceLeave(e)}"
                    />
                  `})}
          </g>
        </svg>

        ${a>0?B`
              <div
                class="center-container"
                part="center"
                style="width: ${a*2}px; height: ${a*2}px; left: ${n-a}px; top: ${r-a}px;"
              >
                <slot name="center">
                  ${this.centerLabel||this.centerSublabel?B`
                        <div class="center-labels">
                          ${this.centerLabel?B`<div class="center-label" part="center-label">${this.centerLabel}</div>`:``}
                          ${this.centerSublabel?B`<div class="center-sublabel" part="center-sublabel">${this.centerSublabel}</div>`:``}
                        </div>
                      `:``}
                </slot>
              </div>
            `:``}
      </div>
    `}});var Pf=[J,M`
    :host {
      display: contents;
      --_radius: min(2rem, var(--radius-2xl, 1rem));
      --_slide-from: 100% 0;
    }

    dialog {
      padding: 0;
      border: none;
      background: transparent;
      /*
       * clip, not hidden: a hidden box is still a scroll container, so focusing
       * a control in a panel that is mid-slide scrolled the dialog toward it and
       * the panel overshot as that scroll unwound (right and bottom placements).
       */
      overflow: clip;
      margin: 0;
      width: 100vw;
      height: 100vh;
      max-width: 100vw;
      max-height: 100vh;
      position: fixed;
      inset: 0;
      display: flex;
      z-index: var(--z-modal, 1300);
    }

    dialog:not([open]) {
      display: none;
    }

    :host([placement="right"]) dialog {
      justify-content: flex-end;
      align-items: stretch;
    }

    :host([placement="left"]) dialog {
      justify-content: flex-start;
      align-items: stretch;
    }

    :host([placement="top"]) dialog {
      justify-content: stretch;
      align-items: flex-start;
    }

    :host([placement="bottom"]) dialog {
      justify-content: stretch;
      align-items: flex-end;
    }

    /* Panel surface (fill, shadow) comes from the shared overlay styles */
    [part~="base"] {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: var(--spacing-6, 1.5rem);
      overflow: hidden;
      outline: none;
    }

    /*
     * Edge-attached sheet: only the corners facing the content are rounded.
     * These selectors outrank the shared [part~="base"] radius that follows.
     */
    :host([placement="right"]) [part~="base"] {
      border-radius: var(--_radius) 0 0 var(--_radius);
    }

    :host([placement="left"]) [part~="base"] {
      border-radius: 0 var(--_radius) var(--_radius) 0;
    }

    :host([placement="top"]) [part~="base"] {
      border-radius: 0 0 var(--_radius) var(--_radius);
    }

    :host([placement="bottom"]) [part~="base"] {
      border-radius: var(--_radius) var(--_radius) 0 0;
    }

    /* Horizontal placements (left & right) */
    :host([placement="left"]) [part~="base"],
    :host([placement="right"]) [part~="base"] {
      height: 100%;
      max-width: 85vw;
    }

    :host([placement="left"][size="sm"]) [part~="base"],
    :host([placement="right"][size="sm"]) [part~="base"] {
      width: 20rem;
    }

    :host([placement="left"][size="md"]) [part~="base"],
    :host([placement="right"][size="md"]) [part~="base"] {
      width: 24rem;
    }

    :host([placement="left"][size="lg"]) [part~="base"],
    :host([placement="right"][size="lg"]) [part~="base"] {
      width: 32rem;
    }

    /* Vertical placements (top & bottom) */
    :host([placement="top"]) [part~="base"],
    :host([placement="bottom"]) [part~="base"] {
      width: 100%;
      max-height: 85vh;
    }

    :host([placement="top"][size="sm"]) [part~="base"],
    :host([placement="bottom"][size="sm"]) [part~="base"] {
      height: 16rem;
    }

    :host([placement="top"][size="md"]) [part~="base"],
    :host([placement="bottom"][size="md"]) [part~="base"] {
      height: 24rem;
    }

    :host([placement="top"][size="lg"]) [part~="base"],
    :host([placement="bottom"][size="lg"]) [part~="base"] {
      height: 32rem;
    }

    /* Bottom sheet drag handle */
    :host([placement="bottom"]) [part~="base"] {
      padding-top: var(--spacing-2, 0.5rem);
    }

    :host([placement="bottom"]) [part~="base"]::before {
      content: "";
      flex-shrink: 0;
      align-self: center;
      width: 2.25rem;
      height: 0.25rem;
      margin-bottom: var(--spacing-2, 0.5rem);
      border-radius: var(--radius-xs, 0.125rem);
      background-color: var(--color-separator);
    }

    [part~="header"] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3, 0.75rem);
      flex-shrink: 0;
      margin-bottom: var(--spacing-2, 0.5rem);
      font-size: var(--font-size-md, 1rem);
      line-height: var(--line-height-md, 1.5rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg);
    }

    /* Headings slotted into the header take its type instead of UA heading styles */
    ::slotted([slot="header"]) {
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
    }

    [part~="body"] {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
      /* Room for focus rings of controls inside the scroll area */
      margin-inline: -3px;
      padding: 3px;
      color: var(--color-muted);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
    }

    [part~="footer"] {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-2, 0.5rem);
      flex-shrink: 0;
      margin-top: var(--spacing-5, 1.25rem);
    }

    /* Collapse sections with nothing slotted, where :has-slotted is supported */
    [part~="header"]:not(:has(> slot:has-slotted)),
    [part~="footer"]:not(:has(> slot:has-slotted)) {
      display: none;
    }

    /* Slide in from (and back out to) the attached edge */
    :host([placement="left"]) {
      --_slide-from: -100% 0;
    }

    :host([placement="top"]) {
      --_slide-from: 0 -100%;
    }

    :host([placement="bottom"]) {
      --_slide-from: 0 100%;
    }

    dialog[open] [part~="base"] {
      animation: moul-drawer-in 250ms
        var(--ease-out-fluid, cubic-bezier(0.32, 0.72, 0, 1));
    }

    :host(:not([is-open])) dialog[open] [part~="base"] {
      animation: moul-drawer-out 200ms
        var(--ease-out-fluid, cubic-bezier(0.32, 0.72, 0, 1)) forwards;
      pointer-events: none;
    }

    :host dialog[open]::backdrop {
      animation-duration: 250ms;
      animation-timing-function: var(
        --ease-out-fluid,
        cubic-bezier(0.32, 0.72, 0, 1)
      );
    }

    :host(:not([is-open])) dialog[open]::backdrop {
      animation: moul-drawer-backdrop-out 200ms
        var(--ease-out-fluid, cubic-bezier(0.32, 0.72, 0, 1)) forwards;
    }

    @keyframes moul-drawer-in {
      from {
        translate: var(--_slide-from);
      }
    }

    @keyframes moul-drawer-out {
      to {
        translate: var(--_slide-from);
      }
    }

    @keyframes moul-drawer-backdrop-out {
      to {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog[open] [part~="base"],
      :host(:not([is-open])) dialog[open] [part~="base"],
      :host(:not([is-open])) dialog[open]::backdrop {
        animation: none;
      }
    }
  `,Zs];W(`moul-drawer`,class extends U{static styles=Pf;static properties={isOpen:{type:Boolean,reflect:!0,attribute:`is-open`},placement:{type:String,reflect:!0},size:{type:String,reflect:!0},isDismissable:{type:Boolean,reflect:!0,attribute:`is-dismissable`}};overlayPresence;previousActiveElement=null;constructor(){super(),this.isOpen=!1,this.placement=`right`,this.size=`md`,this.isDismissable=!0,this.overlayPresence=new Xs(this,{preset:`drawer-${this.placement}`,dialog:()=>this.dialogEl})}get dialogEl(){return this.shadowRoot?.querySelector(`dialog`)??null}get contentEl(){return this.shadowRoot?.querySelector(`[part="base"]`)??null}get isMounted(){return this.overlayPresence.isMounted}connectedCallback(){super.connectedCallback(),this.addEventListener(`keydown`,this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.handleKeyDown)}updated(e){if(super.updated(e),e.has(`placement`)){let e=`drawer-${this.placement}`;this.overlayPresence.options.preset=e}e.has(`isOpen`)&&this.isOpen!==this.overlayPresence.isOpen&&(this.isOpen?this.openDrawer():this.closeDrawer())}async setOpen(e){this.isOpen===e&&this.overlayPresence.isOpen===e||(this.isOpen=e,this.dispatchEvent(new CustomEvent(`openchange`,{bubbles:!0,composed:!0,detail:{isOpen:this.isOpen}})),e?await this.openDrawer():await this.closeDrawer())}async openDrawer(){this.previousActiveElement=Hs(),await this.overlayPresence.setOpen(!0);let e=this.dialogEl;e&&zs(this.contentEl??e)}async closeDrawer(){await this.overlayPresence.setOpen(!1),Us(this.previousActiveElement)}handleKeyDown=e=>{if(this.isOpen){if(e.key===`Escape`){e.preventDefault(),e.stopPropagation(),this.setOpen(!1);return}e.key===`Tab`&&Bs(this.dialogEl??this,e)}};handleDialogClick=e=>{if(!this.isDismissable)return;let t=this.contentEl;if(!t)return;let n=t.getBoundingClientRect();e.clientX>=n.left&&e.clientX<=n.right&&e.clientY>=n.top&&e.clientY<=n.bottom||this.setOpen(!1)};render(){return B`
      <dialog
        part="dialog"
        aria-modal="true"
        class="dialog"
        @click=${this.handleDialogClick}
      >
        <div part="base" class="drawer-card">
          <div part="header">
            <slot name="header"></slot>
          </div>
          <div part="body">
            <slot></slot>
          </div>
          <div part="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </dialog>
    `}});var Ff=[J,M`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-muted);
    }

    [part~="base"] {
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
      border-radius: var(--radius-surface, 1.5rem);
    }

    :host([align="center"]) [part~="base"],
    :host(:not([align])) [part~="base"] {
      align-items: center;
      text-align: center;
    }

    :host([align="start"]) [part~="base"] {
      align-items: flex-start;
      text-align: start;
    }

    /* Sizes */
    :host([size="sm"]) [part~="base"] {
      padding: var(--spacing-4, 1rem) var(--spacing-3, 0.75rem);
      gap: var(--spacing-2, 0.5rem);
    }

    :host([size="md"]) [part~="base"],
    :host(:not([size])) [part~="base"] {
      padding: var(--spacing-6, 1.5rem) var(--spacing-4, 1rem);
      gap: var(--spacing-3, 0.75rem);
    }

    :host([size="lg"]) [part~="base"] {
      padding: var(--spacing-8, 2rem) var(--spacing-6, 1.5rem);
      gap: var(--spacing-4, 1rem);
    }

    /* Variants. Flat (the default) has no container: muted copy on whatever it sits in. */
    :host([variant="flat"]) [part~="base"],
    :host(:not([variant])) [part~="base"] {
      background-color: transparent;
    }

    :host([variant="bordered"]) [part~="base"] {
      background-color: transparent;
      border: 1px dashed var(--color-border);
    }

    /* Solid: a surface card lifted by the soft surface shadow */
    :host([variant="solid"]) [part~="base"] {
      background-color: var(--color-surface);
      box-shadow: var(--shadow-surface);
    }

    /* Glass: opt-in translucent material */
    :host([variant="glass"]) [part~="base"] {
      background-color: var(--color-bg-glass);
      border: 1px solid var(--color-border-glass);
      box-shadow: var(--glass-highlight), var(--shadow-glass);
      -webkit-backdrop-filter: var(--glass-filter, blur(12px));
      backdrop-filter: var(--glass-filter, blur(12px));
    }

    [part~="icon"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted);
      font-size: 2rem;
      line-height: 1;
    }

    [part~="title"] {
      font-size: var(--font-size-md, 1rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-md, 1.5rem);
      color: var(--color-fg);
    }

    [part~="description"] {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-muted);
      max-width: 48ch;
    }

    [part~="actions"] {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
      margin-top: var(--spacing-2, 0.5rem);
    }

    /* Parts whose slots received nothing are flagged by the element so gaps don't stack up */
    [data-empty] {
      display: none;
    }
  `];W(`moul-empty-state`,class extends U{static styles=Ff;static properties={size:{type:String,reflect:!0},align:{type:String,reflect:!0},variant:{type:String,reflect:!0}};constructor(){super(),this.size=`md`,this.align=`center`,this.variant=`flat`}connectedCallback(){super.connectedCallback(),this.hasAttribute(`role`)||this.setAttribute(`role`,`status`)}firstUpdated(){let e=Array.from(this.shadowRoot?.querySelectorAll(`[part="icon"], [part="title"], [part="description"], [part="actions"]`)??[]);e.length>0&&q(e,{transform:[`translateY(8px)`,`translateY(0px)`],opacity:[0,1]},{duration:.25,ease:Ss,delay:qo(.05)})}handleSlotChange=e=>{let t=e.target.parentElement;if(!t)return;let n=Array.from(t.querySelectorAll(`slot`)).some(e=>e.assignedNodes({flatten:!0}).some(e=>e.nodeType===Node.ELEMENT_NODE||(e.textContent??``).trim()!==``));t.toggleAttribute(`data-empty`,!n)};render(){return B`
      <div part="base" @slotchange=${this.handleSlotChange}>
        <div part="icon" data-empty><slot name="icon"></slot></div>
        <div part="title" data-empty><slot name="title"></slot></div>
        <div part="description" data-empty><slot name="description"></slot><slot></slot></div>
        <div part="actions" data-empty><slot name="actions"></slot></div>
      </div>
    `}});var If=[J,M`
    :host {
      display: block;
      width: 100%;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4, 1rem);
      width: 100%;
    }

    /* Slotted fieldsets lose the browser's groove frame, after HeroUI, and keep
       the form's field rhythm; page styles still win over these defaults. */
    ::slotted(fieldset) {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4, 1rem);
      min-width: 0;
      margin: 0;
      /* A legend renders above the flex flow, so the top inset is its only gap */
      padding: var(--spacing-2, 0.5rem) 0 0;
      border: none;
    }
  `];W(`moul-form`,class extends U{static styles=If;static properties={action:{type:String,reflect:!0},method:{type:String,reflect:!0},novalidate:{type:Boolean,reflect:!0}};constructor(){super(),this.action=``,this.method=`post`,this.novalidate=!1}get nativeForm(){return this.renderRoot?.querySelector(`form`)??null}getControls(){return Array.from(this.querySelectorAll(`moul-text-field, moul-number-field, moul-search-field, moul-text-area, moul-checkbox, moul-checkbox-group, moul-radio-group, moul-switch, moul-slider, moul-input-otp, moul-select, moul-combobox, moul-calendar, moul-date-picker, input, select, textarea, button`))}getFormData(){let e=new FormData,t=this.getControls();for(let n of t){let t=n,r=t.name||t.getAttribute?.(`name`);if(r&&!(t.isDisabled||t.disabled)){if(typeof t.isChecked==`boolean`)t.isChecked&&e.append(r,t.value??`on`);else if(n.tagName===`INPUT`&&n.type===`checkbox`)n.checked&&e.append(r,n.value||`on`);else if(n.tagName===`INPUT`&&n.type===`radio`)n.checked&&e.append(r,n.value);else if(`selectedKey`in t){let n=t.selectedKey||t.inputValue;n&&e.append(r,String(n))}else if(Array.isArray(t.value))for(let n of t.value)e.append(r,String(n));else t.value!==void 0&&t.value!==null&&t.value!==``&&e.append(r,String(t.value))}}return e}settleControls(e){for(let t of e){let e=t;e.isUpdatePending&&typeof e.performUpdate==`function`&&e.performUpdate()}}checkValidity(){if(this.novalidate)return!0;let e=this.getControls();this.settleControls(e);let t=!0;for(let n of e){let e=n;typeof e.checkValidity==`function`&&(e.checkValidity()||(t=!1))}return t}reportValidity(){if(this.novalidate)return!0;let e=this.getControls();this.settleControls(e);let t=!0;for(let n of e){let e=n;typeof e.reportValidity==`function`?e.reportValidity()||(t=!1):typeof e.checkValidity==`function`&&(e.checkValidity()||(t=!1))}return t}submit(){this.handleSubmit(new Event(`submit`,{cancelable:!0}))}reset(){this.handleReset(new Event(`reset`,{cancelable:!0}))}handleSubmit=e=>{if(e.preventDefault(),e.stopImmediatePropagation(),!this.novalidate){let e={},t=!0,n=this.getControls();this.settleControls(n);for(let r of n){let n=r,i=!0;if(typeof n.reportValidity==`function`?i=n.reportValidity():typeof n.checkValidity==`function`&&(i=n.checkValidity()),!i){t=!1;let i=n.name||r.getAttribute(`name`)||r.id||`unknown`;e[i]=n.validationMessage||`This field is invalid.`}}if(!t){this.dispatchEvent(new CustomEvent(`invalid`,{detail:{errors:e},bubbles:!0,composed:!0}));return}}let t=this.getFormData();this.dispatchEvent(new CustomEvent(`submit`,{detail:{formData:t},bubbles:!0,composed:!0}))};handleReset=e=>{e.preventDefault();let t=this.getControls();for(let e of t){let t=e;typeof t.reset==`function`?t.reset():`value`in t&&t.defaultValue!==void 0?t.value=t.defaultValue:`isChecked`in t?t.isChecked=!1:`value`in t&&typeof t.value==`string`?t.value=``:`value`in t&&typeof t.value==`number`&&(t.value=typeof t.min==`number`&&t.min>0?t.min:0)}this.dispatchEvent(new CustomEvent(`reset`,{bubbles:!0,composed:!0}))};render(){return B`
      <form
        part="base"
        action=${this.action}
        method=${this.method}
        ?novalidate=${this.novalidate}
        @submit=${this.handleSubmit}
        @reset=${this.handleReset}
      >
        <slot></slot>
      </form>
    `}});var Lf=M`
  .hover-card {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
    background-color: var(--color-bg-elevated);
    border-radius: min(2rem, var(--radius-xl, 0.75rem));
    box-shadow: var(--shadow-overlay);
    font-size: var(--font-size-xs, 0.75rem);
    line-height: var(--line-height-xs, 1rem);
    color: var(--color-fg);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--duration-fast, 150ms) var(--ease-out, ease-out);
  }

  .hover-card[data-open] {
    opacity: 1;
  }

  .hover-card-value {
    font-size: var(--font-size-sm, 0.875rem);
    line-height: var(--line-height-sm, 1.25rem);
    font-weight: var(--font-weight-semibold, 600);
    font-variant-numeric: tabular-nums;
  }

  .hover-card-label {
    color: var(--color-muted);
  }

  .hover-card-row {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-4, 1rem);
    color: var(--color-muted);
  }

  .hover-card-row strong {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-fg);
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-motion: reduce) {
    .hover-card {
      transition: none;
    }
  }
`,Rf=[J,Lf,M`
    :host {
      display: block;
      position: relative;
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-fg, inherit);
      /* Ordinal ramp ends; stages without a color step between them */
      --_from: var(--color-chart-ordinal-from, oklch(0.64 0.18 277));
      --_to: var(--color-chart-ordinal-to, oklch(0.8 0.1 180));
      --_bar-h: 1.875rem;
      /* Keep in sync with NECK_HEIGHT */
      --_neck-h: 28px;
      --_fade-top: 0.3;
      --_fade-bottom: 0.04;
    }

    .frame {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-5, 1.25rem);
    }

    .summary p {
      margin: 0;
    }

    .headline {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      column-gap: var(--spacing-2, 0.5rem);
    }

    [part~="conversion"],
    .conversion {
      font-size: var(--font-size-xxl, 1.5rem);
      line-height: var(--line-height-xxl, 2rem);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: -0.035em;
      font-variant-numeric: tabular-nums;
    }

    .conversion-label {
      color: var(--color-muted);
      font-size: var(--font-size-md, 1rem);
    }

    .summary .biggest-drop {
      margin-top: var(--spacing-2, 0.5rem);
      color: var(--color-muted);
    }

    .drop-value {
      color: var(--color-danger);
      font-weight: var(--font-weight-medium, 500);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    [part~="stages"],
    .stages {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .stage {
      position: relative;
    }

    .stage-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--spacing-3, 0.75rem);
      margin-bottom: var(--spacing-2, 0.5rem);
    }

    .stage + .stage .stage-header {
      margin-top: var(--spacing-1, 0.25rem);
    }

    .stage-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .stage-value {
      flex: none;
      font-variant-numeric: tabular-nums;
    }

    .stage-sep {
      margin: 0 0.25em;
      color: var(--color-muted);
    }

    .stage-percent {
      color: var(--color-muted);
    }

    .track {
      display: flex;
      justify-content: center;
    }

    [part~="bar"],
    .bar {
      width: max(var(--_bar-h), var(--_w, 100%));
      max-width: 100%;
      height: var(--_bar-h);
      border-radius: var(--radius-lg, 0.5rem);
      background-color: var(--_color);
      transition: opacity var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    .connector {
      position: relative;
      height: var(--_neck-h);
    }

    .neck {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
      transition: opacity var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    [part~="drop"],
    .drop {
      position: absolute;
      top: 50%;
      left: 50%;
      translate: -50% -50%;
      padding: 0 var(--spacing-3, 0.75rem);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full, 9999px);
      background-color: var(--color-surface);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: 1.125rem;
      color: var(--color-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    /* Hovering a stage recedes the others */
    .stage.is-dimmed .bar,
    .stage.is-dimmed .neck {
      opacity: 0.45;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    [part~="empty"],
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 200px;
      padding: var(--spacing-8, 2rem) var(--spacing-4, 1rem);
      color: var(--color-muted, #71717a);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      text-align: center;
    }

    .empty-message {
      margin: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .bar,
      .neck {
        transition: none;
      }
    }
  `],zf=28,Bf=30,Vf=`−`;W(`moul-funnel-chart`,class extends U{static styles=Rf;static properties={data:{attribute:!1},summaryLabel:{type:String,attribute:`summary-label`},hideSummary:{type:Boolean,reflect:!0,attribute:`hide-summary`},valueFormatter:{attribute:!1},activeIndex:{state:!0}};layoutController;barHeight=Bf;lastShown=-1;hasPlayedEntrance=!1;constructor(){super(),this.data=[],this.summaryLabel=`overall conversion`,this.hideSummary=!1,this.valueFormatter=void 0,this.activeIndex=-1,this.layoutController=new dd(this,{observeDimensions:!0})}get locale(){let e=this.closest(`[lang]`)?.getAttribute(`lang`);if(e)try{return Intl.getCanonicalLocales(e)[0]}catch{return}}formatValue(e){return this.valueFormatter?this.valueFormatter(e):new Intl.NumberFormat(this.locale).format(e)}formatPercent(e,t=!1){let n=t||Math.abs(e)<.1?1:0;return new Intl.NumberFormat(this.locale,{style:`percent`,maximumFractionDigits:n}).format(e)}get stages(){let e=Array.isArray(this.data)?this.data:[],t=e.map(e=>{let t=Number(e?.value);return Number.isFinite(t)&&t>0?t:0}),n=t[0]??0,r=Math.max(e.length-1,1);return e.map((e,i)=>{let a=t[i],o=i===0?a:t[i-1],s=Math.round(i/r*100);return{stage:e,value:a,ofFirst:n>0?Math.min(a/n,1):0,ofPrevious:o>0?a/o:0,dropOff:Math.max(o-a,0),color:e?.color||`color-mix(in oklch, var(--_to) ${s}%, var(--_from))`}})}updated(e){super.updated(e);let t=this.renderRoot.querySelector(`.bar`);t&&t.offsetHeight>0&&t.offsetHeight!==this.barHeight&&(this.barHeight=t.offsetHeight,this.requestUpdate()),e.has(`data`)&&this.animateStages(),this.activeIndex>=0&&this.positionHoverCard()}animateStages(){if(this.hasPlayedEntrance||ws())return;let e=this.renderRoot.querySelectorAll(`.bar`);if(e.length===0)return;this.hasPlayedEntrance=!0,q(e,{opacity:[0,1],transform:[`scaleX(0.4)`,`scaleX(1)`]},{duration:.5,ease:Cs,delay:qo(.06)});let t=this.renderRoot.querySelectorAll(`.neck, .drop`);t.length>0&&q(t,{opacity:[0,1]},{duration:.4,ease:Cs,delay:qo(.03,{startDelay:.2})})}positionHoverCard(){let e=this.renderRoot.querySelector(`.hover-card`),t=this.renderRoot.querySelector(`.frame`),n=this.renderRoot.querySelector(`.stage[data-index="${this.activeIndex}"] .bar`);e&&t&&n&&pd(e,t,n.getBoundingClientRect())}handleStageEnter(e,t){if(e===this.activeIndex)return;this.activeIndex=e,this.lastShown=e;let n=this.renderRoot.querySelector(`.stage[data-index="${e}"] .bar`)?.getBoundingClientRect(),r=this.getBoundingClientRect();this.dispatchEvent(new CustomEvent(`point-hover`,{bubbles:!0,composed:!0,detail:{point:t.stage,value:t.value,label:t.stage.label,x:n?Math.round(n.left+n.width/2-r.left):0,y:n?Math.round(n.top-r.top):0}}))}handleStageLeave(){this.activeIndex<0||(this.activeIndex=-1,this.dispatchEvent(new CustomEvent(`point-leave`,{bubbles:!0,composed:!0})))}barWidth(e,t){return Math.min(Math.max(this.barHeight,e*t),e)}renderNeck(e,t,n,r){let i=this.barWidth(e,t.ofFirst),a=this.barWidth(e,n.ofFirst),o=Math.min(this.barHeight*.25,i/4),s=(e-i)/2+o,c=(e+i)/2-o,l=(e-a)/2,u=(e+a)/2,d=zf,f=d*.55,p=`M${s},0 L${c},0 C${c},${f} ${u},${d-f} ${u},${d} L${l},${d} C${l},${d-f} ${s},${f} ${s},0 Z`,m=`neck-fade-${r}`;return B`
      <div class="connector" aria-hidden="true">
        <svg
          class="neck"
          viewBox="0 0 ${e} ${d}"
          preserveAspectRatio="none"
          focusable="false"
        >
          ${V`
            <defs>
              <linearGradient id=${m} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style="stop-color: ${t.color}; stop-opacity: var(--_fade-top)" />
                <stop offset="1" style="stop-color: ${t.color}; stop-opacity: var(--_fade-bottom)" />
              </linearGradient>
            </defs>
            <path d=${p} fill="url(#${m})" />
          `}
        </svg>
        <span part="drop" class="drop">${Vf}${this.formatPercent(1-n.ofPrevious)}</span>
      </div>
    `}renderSummary(e){let t=e[e.length-1],n=-1;for(let t=1;t<e.length;t++)e[t].dropOff>0&&(n<0||e[t].ofPrevious<=e[n].ofPrevious)&&(n=t);return B`
      <div part="summary" class="summary">
        <p class="headline">
          <span part="conversion" class="conversion">${this.formatPercent(t.ofFirst)}</span>
          <span class="conversion-label">${this.summaryLabel}</span>
        </p>
        ${n>0?B`<p part="biggest-drop" class="biggest-drop">
                Biggest drop: ${e[n-1].stage.label} → ${e[n].stage.label}
                <span class="drop-value">${Vf}${this.formatPercent(1-e[n].ofPrevious)}</span>
              </p>`:H}
      </div>
    `}renderHoverCard(e){let t=this.activeIndex>=0,n=e[t?this.activeIndex:this.lastShown],r=e[(t?this.activeIndex:this.lastShown)-1];return B`
      <div part="tooltip" class="hover-card" aria-hidden="true" ?data-open=${t&&!!n}>
        ${n?B`
              <span class="hover-card-value">${this.formatValue(n.value)}</span>
              <span class="hover-card-label">${n.stage.label}</span>
              ${r?B`
                    <span class="hover-card-row">
                      From ${r.stage.label}
                      <strong>${this.formatPercent(n.ofPrevious,!0)}</strong>
                    </span>
                    <span class="hover-card-row">
                      Dropped off
                      <strong>${this.formatValue(n.dropOff)}</strong>
                    </span>
                  `:H}
            `:H}
      </div>
    `}render(){let e=this.stages;if(e.length===0)return B`
        <div part="empty" class="empty-state">
          <slot name="empty">
            <p class="empty-message">No data available</p>
          </slot>
        </div>
      `;let t=this.layoutController.width>0?this.layoutController.width:600;return B`
      <div part="base" class="frame">
        ${this.hideSummary?H:this.renderSummary(e)}
        <ol part="stages" class="stages" @pointerleave=${this.handleStageLeave}>
          ${e.map((n,r)=>{let i=e[r+1];return B`
              <li
                part="stage"
                class="stage ${this.activeIndex<0?``:r===this.activeIndex?`is-active`:`is-dimmed`}"
                data-index=${r}
                style="--_color: ${n.color}; --_w: ${n.ofFirst*100}%"
                @pointerenter=${()=>this.handleStageEnter(r,n)}
              >
                <div class="stage-header">
                  <span part="stage-label" class="stage-label">${n.stage.label}</span>
                  <span class="stage-value">
                    <span class="stage-count">${this.formatValue(n.value)}</span>
                    <span class="stage-sep" aria-hidden="true">·</span>
                    <span class="stage-percent">${this.formatPercent(n.ofFirst)}</span>
                    ${r>0?B`<span class="sr-only">
                            , ${this.formatPercent(1-n.ofPrevious)} drop-off from the previous step
                          </span>`:H}
                  </span>
                </div>
                <div class="track"><div part="bar" class="bar"></div></div>
                ${i?this.renderNeck(t,n,i,r):H}
              </li>
            `})}
        </ol>
        ${this.renderHoverCard(e)}
      </div>
    `}});var Hf=Gd(class extends Kd{constructor(){super(...arguments),this.key=H}render(e,t){return this.key=e,t}update(e,[t,n]){return t!==this.key&&(ef(e),this.key=t),n}}),Uf=[J,Lf,M`
    :host {
      display: block;
      position: relative;
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-fg, inherit);
      /* Ramp hue; each level mixes more of it into the empty-cell track */
      --_heat: var(--color-chart-sequential, oklch(0.76 0.15 163));
      --_heat-0: var(--color-default, oklch(0.94 0.001 286.375));
      --_gap: 3px;
      --_cell-min: 0.625rem;
      --_cell-max: 1.75rem;
      --_stagger: 6ms;
      /* Day-label column, fixed so the cell size can be solved in CSS */
      --_gutter: 2.25rem;
      --_gutter-gap: var(--spacing-2, 0.5rem);
      --_label-row: var(--line-height-xs, 1rem);
    }

    :host([mode="hour"]) {
      --_gap: 4px;
      --_cell-max: 2rem;
      --_stagger: 12ms;
    }

    .frame {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3, 0.75rem);
    }

    [part~="summary"],
    .summary {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--spacing-1, 0.25rem) var(--spacing-4, 1rem);
    }

    .summary p {
      margin: 0;
    }

    [part~="total"],
    .total {
      font-weight: var(--font-weight-medium, 500);
      font-variant-numeric: tabular-nums;
    }

    [part~="peak"],
    .peak {
      color: var(--color-muted);
      font-variant-numeric: tabular-nums;
    }

    /* Cells fill the width until they hit --_cell-min, then the grid scrolls */
    .plot {
      container-type: inline-size;
    }

    .plot-body {
      display: flex;
      gap: var(--_gutter-gap);
      --_cell: clamp(
        var(--_cell-min),
        (
            100cqi - var(--_gutter) - var(--_gutter-gap) - (var(--_cols) - 1) *
              var(--_gap)
          ) /
          var(--_cols),
        var(--_cell-max)
      );
    }

    .days,
    .grid {
      display: grid;
      grid-template-rows: var(--_label-row) repeat(7, var(--_cell));
      row-gap: var(--_gap);
    }

    .days {
      flex: none;
      width: var(--_gutter);
    }

    .row-label,
    .col-label {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--_label-row);
      color: var(--color-muted);
      white-space: nowrap;
      user-select: none;
    }

    .row-label {
      align-self: center;
    }

    .col-label {
      grid-row: 1;
    }

    /* Padding gives focus rings room; overflow-x also clips vertically */
    [part~="scroller"],
    .scroller {
      flex: 1;
      min-width: 0;
      padding: 3px;
      margin: -3px;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
    }

    .scroller[data-clipped] {
      mask-image: linear-gradient(to right, transparent, #000 var(--spacing-6, 1.5rem));
    }

    .grid {
      grid-template-columns: repeat(var(--_cols), var(--_cell));
      column-gap: var(--_gap);
      width: max-content;
    }

    .row {
      display: contents;
    }

    [part~="cell"],
    .cell {
      position: relative;
      border-radius: min(25%, var(--radius-sm, 0.25rem));
      background-color: var(--_heat-0);
      outline: none;
      transition: box-shadow var(--duration-fast, 150ms) var(--ease-out, ease-out);
      animation: heat-in 420ms var(--ease-out, ease-out) both;
      animation-delay: calc(var(--_c, 0) * var(--_stagger));
    }

    .cell[data-level="1"],
    .swatch[data-level="1"] {
      background-color: color-mix(in oklab, var(--_heat) 30%, var(--_heat-0));
    }

    .cell[data-level="2"],
    .swatch[data-level="2"] {
      background-color: color-mix(in oklab, var(--_heat) 55%, var(--_heat-0));
    }

    .cell[data-level="3"],
    .swatch[data-level="3"] {
      background-color: color-mix(in oklab, var(--_heat) 80%, var(--_heat-0));
    }

    .cell[data-level="4"],
    .swatch[data-level="4"] {
      background-color: var(--_heat);
    }

    .cell:hover {
      box-shadow: 0 0 0 1.5px color-mix(in oklab, var(--color-fg) 55%, transparent);
    }

    .cell:focus-visible {
      z-index: 1;
      box-shadow:
        0 0 0 1px var(--color-surface, var(--color-bg)),
        0 0 0 3px var(--color-focus);
    }

    @keyframes heat-in {
      from {
        opacity: 0;
        scale: 0.6;
      }
    }

    [part~="legend"],
    .legend {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-2, 0.5rem);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted);
      user-select: none;
    }

    .legend-scale {
      display: inline-flex;
      gap: 3px;
    }

    .swatch {
      width: 0.75rem;
      height: 0.75rem;
      border-radius: var(--radius-xs, 0.125rem);
      background-color: var(--_heat-0);
    }

    @media (prefers-reduced-motion: reduce) {
      .cell {
        animation: none;
        transition: none;
      }
    }
  `],Wf=864e5,Gf=/^(\d{4})-(\d{2})-(\d{2})$/,Kf=new Set([1,3,5]),qf=[0,6,12,18],Jf=[`data`,`mode`,`weeks`,`endDate`,`weekStart`,`unit`,`unitSingular`];function Yf(e){if(e instanceof Date)return Number.isNaN(e.getTime())?null:e;if(typeof e==`string`){let t=Gf.exec(e.trim());if(t)return new Date(+t[1],t[2]-1,+t[3])}if(typeof e!=`string`&&typeof e!=`number`)return null;let t=new Date(e);return Number.isNaN(t.getTime())?null:t}function Xf(e){return Math.round(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())/Wf)}function Zf(e){let t=new Date(e*Wf);return new Date(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate())}function Qf(e){return((e+4)%7+7)%7}function $f(e){let t=e.filter(e=>e>0).sort((e,t)=>e-t);if(t.length===0)return[0,0,0,0];let n=e=>t[Math.floor(e*(t.length-1))];return[n(.25),n(.5),n(.75),t[t.length-1]]}function ep(e,[t,n,r,i]){return e<=0?0:e>=i?4:e<=t?1:e<=n?2:e<=r?3:4}function tp(e){return/ies$/i.test(e)?e.replace(/ies$/i,`y`):/[^s]s$/i.test(e)?e.slice(0,-1):e}W(`moul-heatmap-chart`,class extends U{static styles=Uf;static properties={data:{attribute:!1},mode:{type:String,reflect:!0},weeks:{type:Number},endDate:{type:String,attribute:`end-date`},weekStart:{type:Number,attribute:`week-start`},unit:{type:String},unitSingular:{type:String,attribute:`unit-singular`},color:{type:String},hideSummary:{type:Boolean,reflect:!0,attribute:`hide-summary`},hideLegend:{type:Boolean,reflect:!0,attribute:`hide-legend`},valueFormatter:{attribute:!1},activeIndex:{state:!0},focusIndex:{state:!0}};model={cells:[],columns:0,colLabels:[],rowLabels:[],total:0,peak:null,lookup:new Int32Array};lastShown=null;needsScrollToEnd=!0;constructor(){super(),this.data=[],this.mode=`calendar`,this.weeks=53,this.endDate=``,this.weekStart=0,this.unit=`contributions`,this.unitSingular=``,this.color=``,this.hideSummary=!1,this.hideLegend=!1,this.valueFormatter=void 0,this.activeIndex=-1,this.focusIndex=-1}get cells(){return this.model.cells}willUpdate(e){if(!Jf.some(t=>e.has(t)))return;let t=e.has(`mode`)||e.has(`weeks`);this.model=this.buildModel();let n=this.model.cells.length;(t||this.focusIndex>=n||this.focusIndex<0)&&(this.focusIndex=n-1),(t||this.activeIndex>=n)&&(this.activeIndex=-1),t&&(this.needsScrollToEnd=!0)}updated(e){super.updated(e);let t=this.renderRoot.querySelector(`.scroller`);this.needsScrollToEnd&&t&&t.clientWidth>0&&(t.scrollLeft=t.scrollWidth,this.needsScrollToEnd=!1,this.markClipped(t)),this.activeIndex>=0&&this.positionHoverCard()}markClipped(e){e.toggleAttribute(`data-clipped`,e.scrollLeft>1)}handleScroll=e=>{this.markClipped(e.currentTarget)};get locale(){let e=this.closest(`[lang]`)?.getAttribute(`lang`);if(e)try{return Intl.getCanonicalLocales(e)[0]}catch{return}}formatValue(e){return this.valueFormatter?this.valueFormatter(e):new Intl.NumberFormat(this.locale).format(e)}unitFor(e){return e===1?this.unitSingular||tp(this.unit):this.unit}valueText(e){return e===0?`No ${this.unit}`:`${this.formatValue(e)} ${this.unitFor(e)}`}get periodText(){let e=this.columnCount;return e>=52?`in the last year`:`in the last ${e} weeks`}get columnCount(){let e=Math.round(Number(this.weeks));return Number.isFinite(e)&&e>0?e:53}buildModel(){let e=this.locale,t=Xf(this.endDate&&Yf(this.endDate)||new Date),n=+(Number(this.weekStart)===1),r=this.columnCount,i=t-(Qf(t)-n+7)%7-(r-1)*7,a=new Map,o=new Float64Array(168),s=0;for(let e of Array.isArray(this.data)?this.data:[]){let n=Yf(e?.date);if(!n)continue;let r=Xf(n);if(r<i||r>t)continue;let c=e.value===void 0?1:Number(e.value);Number.isFinite(c)&&(a.set(r,(a.get(r)??0)+c),o[n.getDay()*24+n.getHours()]+=c,s+=c)}let c=new Intl.DateTimeFormat(e,{weekday:`short`}),l=e=>c.format(new Date(1970,0,4+e)),u=[];for(let e=0;e<7;e++){let t=(n+e)%7;Kf.has(t)&&u.push({row:e,text:l(t)})}let d=[],f,p=[];if(this.mode===`hour`){f=24;let t=new Intl.DateTimeFormat(e,{hour:`numeric`}),r=e=>t.format(new Date(2e3,0,1,e));for(let e=0;e<24;e++)for(let t=0;t<7;t++){let i=(n+t)%7;d.push({row:t,col:e,weekday:i,hour:e,value:o[i*24+e],level:0,label:`${l(i)}, ${r(e)} – ${r((e+1)%24)}`})}p=qf.map(e=>({col:e,text:r(e)}))}else{f=r;let n=new Intl.DateTimeFormat(e,{weekday:`short`,month:`short`,day:`numeric`,year:`numeric`}),o=new Intl.DateTimeFormat(e,{month:`short`}),s=-1;for(let e=0;e<r;e++){let r=Zf(i+e*7);r.getMonth()!==s&&(s=r.getMonth(),p.push({col:e,text:o.format(r)}));for(let r=0;r<7;r++){let o=i+e*7+r;if(o>t)break;let s=Zf(o);d.push({row:r,col:e,weekday:s.getDay(),date:s,value:a.get(o)??0,level:0,label:n.format(s)})}}p.length>1&&p[1].col-p[0].col<3&&p.shift(),p=p.filter(e=>e.col<=r-2)}let m=$f(d.map(e=>e.value)),h=new Int32Array(7*f).fill(-1),g=null;return d.forEach((e,t)=>{e.level=ep(e.value,m),h[e.row*f+e.col]=t,e.value>0&&(!g||e.value>=g.value)&&(g=e)}),{cells:d,columns:f,colLabels:p,rowLabels:u,total:s,peak:g,lookup:h}}cellAt(e,t){let{columns:n,lookup:r}=this.model;return e<0||e>6||t<0||t>=n?-1:r[e*n+t]}cellElement(e){return this.renderRoot.querySelector(`.cell[data-index="${e}"]`)}activate(e){let t=this.model.cells[e];if(!t||e===this.activeIndex)return;this.activeIndex=e,this.lastShown=t;let n=this.cellElement(e)?.getBoundingClientRect(),r=this.getBoundingClientRect();this.dispatchEvent(new CustomEvent(`point-hover`,{bubbles:!0,composed:!0,detail:{point:{date:t.date,weekday:t.weekday,hour:t.hour,level:t.level,value:t.value},value:t.value,label:t.label,x:n?Math.round(n.left+n.width/2-r.left):0,y:n?Math.round(n.top-r.top):0}}))}deactivate(){this.activeIndex<0||(this.activeIndex=-1,this.dispatchEvent(new CustomEvent(`point-leave`,{bubbles:!0,composed:!0})))}positionHoverCard(){let e=this.renderRoot.querySelector(`.hover-card`),t=this.renderRoot.querySelector(`.frame`),n=this.cellElement(this.activeIndex);e&&t&&n&&pd(e,t,n.getBoundingClientRect())}handlePointerOver=e=>{let t=e.target?.closest?.(`.cell`);t&&this.activate(Number(t.dataset.index))};handlePointerLeave=()=>{this.matches(`:focus-within`)||this.deactivate()};handleFocusIn=e=>{let t=e.target?.closest?.(`.cell`);if(!t)return;let n=Number(t.dataset.index);this.focusIndex=n,this.activate(n)};handleFocusOut=e=>{let t=e.relatedTarget;t&&this.renderRoot.contains(t)||this.deactivate()};handleKeyDown=e=>{let t=this.model.cells[this.focusIndex];if(!t)return;let{row:n,col:r}=t,i=this.model.columns-1;switch(e.key){case`ArrowRight`:r+=1;break;case`ArrowLeft`:--r;break;case`ArrowDown`:n+=1;break;case`ArrowUp`:--n;break;case`Home`:r=0;break;case`End`:r=i;break;default:return}e.preventDefault();let a=this.cellAt(n,r);for(;a<0&&e.key===`End`&&r>0;)--r,a=this.cellAt(n,r);a<0||(this.focusIndex=a,this.updateComplete.then(()=>this.cellElement(a)?.focus()))};renderSummary(){let{total:e,peak:t}=this.model;return B`
      <div part="summary" class="summary">
        <p part="total" class="total">
          ${this.formatValue(e)} ${this.unitFor(e)} ${this.periodText}
        </p>
        ${t?B`<p part="peak" class="peak">
                Peak ${t.label} · ${this.formatValue(t.value)}
              </p>`:H}
      </div>
    `}renderGrid(){let{cells:e,columns:t,colLabels:n,rowLabels:r}=this.model,i=Array.from({length:7},()=>[]);e.forEach((e,t)=>{i[e.row].push({cell:e,index:t})});let a=this.unit.charAt(0).toUpperCase()+this.unit.slice(1);return B`
      <div class="plot-body" style="--_cols: ${t}">
        <div class="days" aria-hidden="true">
          ${r.map(e=>B`<span class="row-label" style="grid-row: ${e.row+2}">${e.text}</span>`)}
        </div>
        <div part="scroller" class="scroller" @scroll=${this.handleScroll}>
          <div
            part="grid"
            class="grid"
            role="grid"
            aria-label="${a} by ${this.mode===`hour`?`hour of day`:`day`}"
            @pointerover=${this.handlePointerOver}
            @pointerleave=${this.handlePointerLeave}
            @focusin=${this.handleFocusIn}
            @focusout=${this.handleFocusOut}
            @keydown=${this.handleKeyDown}
          >
            ${n.map(e=>B`<span class="col-label" aria-hidden="true" style="grid-column: ${e.col+1}">${e.text}</span>`)}
            ${i.map(e=>B`
                <div role="row" class="row">
                  ${e.map(({cell:e,index:t})=>B`
                      <div
                        role="gridcell"
                        part="cell"
                        class="cell"
                        data-index=${t}
                        data-level=${e.level}
                        tabindex=${t===this.focusIndex?0:-1}
                        aria-label="${this.valueText(e.value)}, ${e.label}"
                        style="grid-area: ${e.row+2} / ${e.col+1}; --_c: ${e.col}"
                      ></div>
                    `)}
                </div>
              `)}
          </div>
        </div>
      </div>
    `}renderLegend(){return B`
      <div part="legend" class="legend" aria-hidden="true">
        <span>Less</span>
        <span class="legend-scale">
          ${[0,1,2,3,4].map(e=>B`<span class="swatch" data-level=${e}></span>`)}
        </span>
        <span>More</span>
      </div>
    `}render(){let e=this.activeIndex>=0?this.model.cells[this.activeIndex]:null,t=e??this.lastShown;return B`
      <div
        part="base"
        class="frame"
        style=${this.color?`--_heat: ${this.color}`:``}
      >
        ${this.hideSummary?H:this.renderSummary()}
        <div class="plot">${Hf(this.mode,this.renderGrid())}</div>
        ${this.hideLegend?H:this.renderLegend()}
        <div
          part="tooltip"
          class="hover-card"
          aria-hidden="true"
          ?data-open=${!!e}
        >
          ${t?B`
                <span class="hover-card-value">${this.valueText(t.value)}</span>
                <span class="hover-card-label">${t.label}</span>
              `:H}
        </div>
      </div>
    `}});var np=[J,M`
    :host {
      display: inline-block;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2, 0.5rem);
    }

    /* Flex drops template whitespace so the required mark sits tight to the text */
    [part~='label'] {
      display: flex;
      align-items: baseline;
      width: fit-content;
      line-height: var(--line-height-sm, 1.25rem);
    }

    :host([is-required][label]:not([label=''])) [part~='label']::after {
      content: '*';
      margin-inline-start: 0.125rem;
      color: var(--color-danger);
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='label'] {
      color: var(--color-danger);
    }

    [part~='group'] {
      display: flex;
      align-items: center;
      min-width: 0;
      gap: var(--spacing-2, 0.5rem);
    }

    [part~='slot'] {
      position: relative;
      width: 2.375rem;
      min-width: 0;
      height: 2.5rem;
      margin: 0;
      padding: 0;
      font-family: inherit;
      font-size: var(--font-size-lg, 1.125rem);
      font-weight: var(--font-weight-semibold, 600);
      line-height: var(--line-height-md, 1.5rem);
      font-variant-numeric: tabular-nums;
      text-align: center;
      caret-color: var(--color-field-placeholder);
    }

    /* Lift the focused slot so its ring isn't covered by its neighbour */
    [part~='slot']:focus {
      z-index: 1;
    }

    @media (hover: hover) {
      [part~='slot']:hover:not(:disabled):not(:focus) {
        background-color: var(--color-field-hover);
      }
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='slot'] {
      box-shadow: 0 0 0 1px var(--color-danger), var(--shadow-field);
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='slot']:focus {
      box-shadow: var(--focus-ring-invalid), var(--shadow-field);
    }

    [part~='slot']:disabled {
      cursor: not-allowed;
    }

    /* A short rule between slot groups instead of a typed dash */
    [part~='separator'] {
      display: inline-block;
      flex-shrink: 0;
      width: 6px;
      height: 2px;
      border-radius: var(--radius-sm, 0.25rem);
      background-color: var(--color-separator);
      color: transparent;
      font-size: 0;
      line-height: 0;
      overflow: hidden;
      user-select: none;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* :host raises specificity past the shared shell's transition */
    @media (prefers-reduced-motion: reduce) {
      :host [part~='slot'] {
        transition: none;
      }
    }
  `,Vd];W(`moul-input-otp`,class extends U{static styles=np;static formAssociated=!0;static properties={name:{type:String,reflect:!0},length:{type:Number,reflect:!0},value:{type:String,reflect:!0},pattern:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},label:{type:String,reflect:!0}};internalsController;constructor(){super(),this.name=``,this.length=6,this.value=``,this.pattern=`^\\d+$`,this.isDisabled=!1,this.isRequired=!1,this.label=``,this.internalsController=new Rd(this)}get slotInputs(){return Array.from(this.renderRoot?.querySelectorAll(`input`)??[])}focus(e){let t=this.slotInputs,n=t.find(e=>!e.value);n?n.focus(e):t[0]?.focus(e)}blur(){for(let e of this.slotInputs)e.blur()}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}shake(){let e=this.renderRoot?.querySelector(`[part="group"]`);e&&q(e,{transform:[0,-6,6,-4,4,0].map(e=>`translateX(${e}px)`)},{duration:.25,ease:Ss})}willUpdate(e){super.willUpdate(e),(e.has(`value`)||e.has(`isRequired`)||e.has(`length`))&&this.syncFormValueAndValidity()}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.querySelector(`[slot="label"]`));Td(this,`OTP input`,t)}syncFormValueAndValidity(){this.internalsController.setValue(this.value||null),this.isRequired&&(!this.value||this.value.length<this.length)?(this.internalsController.setValidity({valueMissing:!0},`Please enter the full code.`),this.setAttribute(`is-invalid`,``)):(this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`))}handleSlotInput(e,t){let n=e.target,r=n.value,i=r?r.slice(-1):``,a=new RegExp(this.pattern);if(i&&a.test(i)){let e=this.value.padEnd(this.length,` `).split(``);e[t]=i,this.value=e.join(``).trimEnd(),this.syncFormValueAndValidity(),this.dispatchEvent(new CustomEvent(`input`,{detail:{value:this.value},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0})),this.value.length===this.length?this.dispatchEvent(new CustomEvent(`complete`,{detail:{value:this.value},bubbles:!0,composed:!0})):t<this.length-1&&this.slotInputs[t+1]?.focus()}else n.value=this.value[t]||``}handleSlotKeyDown(e,t){if(e.key===`Backspace`){if(!e.target.value&&t>0){e.preventDefault();let n=this.slotInputs[t-1];if(n){n.focus();let e=this.value.split(``);e.splice(t-1,1),this.value=e.join(``),this.syncFormValueAndValidity(),this.dispatchEvent(new CustomEvent(`input`,{detail:{value:this.value},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0}))}}else{let e=this.value.split(``);e[t]=``,this.value=e.join(``).trimEnd(),this.syncFormValueAndValidity(),this.dispatchEvent(new CustomEvent(`input`,{detail:{value:this.value},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0}))}}else e.key===`ArrowLeft`&&t>0?(e.preventDefault(),this.slotInputs[t-1]?.focus()):e.key===`ArrowRight`&&t<this.length-1&&(e.preventDefault(),this.slotInputs[t+1]?.focus())}handleSlotPaste(e){e.preventDefault();let t=e.clipboardData?.getData(`text`)??``,n=new RegExp(this.pattern),r=Array.from(t).filter(e=>n.test(e)).slice(0,this.length);if(r.length>0){this.value=r.join(``),this.syncFormValueAndValidity();let e=Math.min(r.length,this.length-1);this.slotInputs[e]?.focus(),this.dispatchEvent(new CustomEvent(`input`,{detail:{value:this.value},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0})),this.value.length===this.length&&this.dispatchEvent(new CustomEvent(`complete`,{detail:{value:this.value},bubbles:!0,composed:!0}))}}render(){let e=this.hasAttribute(`is-invalid`),t=Array.from({length:this.length},(e,t)=>t);return B`
      <div part="base">
        ${this.label?B`<label part="label"><slot name="label">${this.label}</slot></label>`:B`<slot name="label"></slot>`}

        <div
          part="group"
          role="group"
          aria-label=${this.label||`One-time password`}
          @paste=${this.handleSlotPaste}
        >
          ${t.map(t=>B`
              <input
                part="slot"
                type="text"
                inputmode="numeric"
                maxlength="1"
                data-index=${t}
                .value=${this.value[t]||``}
                ?disabled=${this.isDisabled}
                aria-label=${`Digit ${t+1} of ${this.length}`}
                autocomplete="one-time-code"
                ?data-invalid=${e}
                @input=${e=>this.handleSlotInput(e,t)}
                @keydown=${e=>this.handleSlotKeyDown(e,t)}
              />
              ${t===Math.floor(this.length/2)-1?B`<slot name="separator"><span part="separator">-</span></slot>`:``}
            `)}
        </div>
      </div>
    `}});var rp=[J,M`
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1, 0.25rem);
      vertical-align: middle;
    }

    /* Key combo wrapper: lay keys and "+" out on a fixed gap */
    [role="group"] {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1, 0.25rem);
    }

    .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.125rem;
      min-width: 1.5rem;
      height: 1.5rem;
      padding: 0 var(--spacing-2, 0.5rem);
      font-family: var(--font-family-base, inherit);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      text-align: center;
      white-space: nowrap;
      word-spacing: -0.25rem;
      color: var(--color-muted);
      background-color: var(--color-default);
      border-radius: var(--radius-lg, 0.5rem);
    }

    .separator {
      color: var(--color-muted);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      user-select: none;
    }
  `],ip={"⌘":`Command`,"⌥":`Option`,"⇧":`Shift`,"⌃":`Control`,"↵":`Enter`,"⎋":`Escape`,"⌫":`Backspace`};function ap(e){return ip[e]??e}W(`moul-kbd`,class extends U{static styles=rp;static properties={keys:{type:String,reflect:!0}};constructor(){super(),this.keys=``}render(){if(!this.keys)return B`<kbd part="key" class="kbd"><slot></slot></kbd>`;let e=this.keys.split(`+`).map(e=>e.trim()).filter(Boolean);return e.length===0?B`<kbd part="key" class="kbd"><slot></slot></kbd>`:B`
      <span role="group" aria-label=${e.map(ap).join(` plus `)}>
        ${e.map((e,t)=>B`
          ${t>0?B`<span class="separator" aria-hidden="true">+</span>`:``}
          <kbd part="key" class="kbd">${e}</kbd>
        `)}
      </span>
    `}});var op=[J,M`
    :host {
      display: block;
      position: relative;
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      overflow: hidden;
    }

    .chart-svg {
      display: block;
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .grid-line {
      stroke: var(--color-separator, oklch(0.92 0.004 286.32));
      stroke-dasharray: 3 3;
      stroke-width: 1;
      shape-rendering: crispEdges;
    }

    .axis-line {
      stroke: var(--color-border, oklch(0.9 0.004 286.32));
      stroke-width: 1;
      shape-rendering: crispEdges;
    }

    .axis-tick {
      fill: var(--color-muted, oklch(0.55 0.014 285.94));
      font-size: var(--font-size-xs, 0.75rem);
      font-family: var(--font-family-base, inherit);
      font-variant-numeric: tabular-nums;
      user-select: none;
    }

    .series-path,
    .line-path,
    .chart-line {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      pointer-events: stroke;
      transition: stroke-width var(--duration-fast, 150ms)
        var(--ease-out, ease-out);
    }

    /* Hollow dots filled with the card surface the chart usually sits on. */
    .point-marker {
      fill: var(--color-surface, #ffffff);
      cursor: pointer;
      transform-origin: center;
      transition: r var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    .point-marker:hover,
    .point-marker.is-active {
      r: 6;
    }

    [part~="empty"],
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;
      color: var(--color-muted, #71717a);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding: var(--spacing-8, 2rem) var(--spacing-4, 1rem);
      text-align: center;
    }

    .empty-message {
      margin: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .series-path,
      .line-path,
      .chart-line,
      .point-marker {
        transition: none;
      }
    }
  `];function sp(e){switch(e){case`linear`:return Uu;case`natural`:return ad;case`step`:return sd;case`stepAfter`:return ld;case`stepBefore`:return cd;default:return nd}}W(`moul-line-chart`,class extends U{static styles=op;static properties={data:{attribute:!1},xKey:{type:String,attribute:`x-key`},series:{attribute:!1},height:{type:Number},showGrid:{type:Boolean,attribute:`show-grid`,converter:{fromAttribute:e=>e!==null&&e!==`false`,toAttribute:e=>e?``:null}},curve:{type:String},valueFormatter:{attribute:!1}};layout;activePoint=null;constructor(){super(),this.data=[],this.xKey=`name`,this.series=[],this.height=300,this.showGrid=!0,this.curve=`monotoneX`,this.valueFormatter=void 0,this.layout=new dd(this,{observeDimensions:!0})}get containerWidth(){return this.layout.width>0?this.layout.width:this.clientWidth>0?this.clientWidth:600}get containerHeight(){return this.height>0?this.height:300}updated(e){super.updated(e),(e.has(`data`)||e.has(`series`)||e.has(`curve`))&&this.animatePaths()}hasPlayedEntrance=!1;animatePaths(){if(this.hasPlayedEntrance||ws())return;let e=this.renderRoot?.querySelectorAll(`.series-path`);e&&e.length>0&&(this.hasPlayedEntrance=!0,q(e,{opacity:[0,1]},{duration:.35,ease:Cs}))}getActiveSeries(){if(this.series&&this.series.length>0)return this.series;if(!this.data||this.data.length===0)return[];let e=this.data[0]||{};return Object.keys(e).filter(e=>e!==this.xKey).filter(t=>{let n=e[t],r=typeof n==`number`?n:Number(n);return(typeof n==`number`||typeof n==`string`&&n.trim()!==``)&&Number.isFinite(r)}).map((e,t)=>({key:e,name:e,color:fd(t)}))}handlePointEnter(e,t,n,r,i,a){this.activePoint={seriesKey:n.key,index:a},this.requestUpdate();let o=t[n.key],s=String(t[this.xKey]??``);this.dispatchEvent(new CustomEvent(`point-hover`,{bubbles:!0,composed:!0,detail:{point:t,series:n,value:o,label:s,x:r,y:i}}))}handlePointLeave(e){this.activePoint=null,this.requestUpdate(),this.dispatchEvent(new CustomEvent(`point-leave`,{bubbles:!0,composed:!0}))}render(){if(!this.data||!Array.isArray(this.data)||this.data.length===0)return B`
        <div part="empty" class="empty-state">
          <slot name="empty">
            <p class="empty-message">No data available</p>
          </slot>
        </div>
      `;let e=this.containerWidth,t=this.containerHeight,n={top:20,right:24,bottom:32,left:48},r=this.getActiveSeries(),i=this.data.map(e=>String(e[this.xKey]??``)),a=wc().domain(i).range([n.left,e-n.right]),o=[];for(let e of this.data)for(let t of r){let n=e[t.key];if(n!=null){let e=Number(n);!Number.isNaN(e)&&Number.isFinite(e)&&o.push(e)}}let s=0,c=1;if(o.length>0){let e=Math.min(...o),t=Math.max(...o);e===t?e===0?(s=0,c=1):e>0?(s=0,c=t*1.2):(s=e*1.2,c=0):e<0?(s=e,c=Math.max(0,t)):(s=0,c=t||1)}Math.abs(c-s)<1e-6&&(s<0&&c>0?(s=-1,c=1):c<=0?(s=-1,c=0):(s=0,c=1));let l=fu().domain([s,c]).range([t-n.bottom,n.top]).nice(),u=sp(this.curve),d=[];try{d=l.ticks(5)}catch{d=[s,(s+c)/2,c]}d&&d.length!==0||(d=[s,(s+c)/2,c]);let f=l(0),p=Number.isFinite(f)?f:t-n.bottom;return B`
      <div style="width: 100%; height: ${t}px; position: relative;">
        <svg
          class="chart-svg"
          viewBox="0 0 ${e} ${t}"
          height="${t}"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Line chart"
        >
          <!-- Grid Lines -->
          ${this.showGrid?V`
                <g class="grid-group" part="grid" aria-hidden="true">
                  ${d.map(t=>{let r=l(t);return Number.isFinite(r)?V`
                      <line
                        class="grid-line"
                        part="grid"
                        x1="${n.left}"
                        y1="${r}"
                        x2="${e-n.right}"
                        y2="${r}"
                      />
                    `:V``})}
                </g>
              `:``}

          <!-- X Axis Baseline -->
          <line
            class="axis-line"
            x1="${n.left}"
            y1="${p}"
            x2="${e-n.right}"
            y2="${p}"
          />

          <!-- Y Axis Labels -->
          <g class="y-axis-labels" aria-hidden="true">
            ${d.map(e=>{let t=l(e);if(!Number.isFinite(t))return V``;let r=this.valueFormatter?this.valueFormatter(e):String(e);return V`
                <text
                  class="axis-tick y-tick"
                  x="${n.left-8}"
                  y="${t}"
                  text-anchor="end"
                  dominant-baseline="middle"
                >
                  ${r}
                </text>
              `})}
          </g>

          <!-- X Axis Labels -->
          <g class="x-axis-labels" aria-hidden="true">
            ${this.data.map(e=>{let r=String(e[this.xKey]??``);return V`
                <text
                  class="axis-tick x-tick"
                  x="${a(r)??0}"
                  y="${t-n.bottom+18}"
                  text-anchor="middle"
                  dominant-baseline="hanging"
                >
                  ${r}
                </text>
              `})}
          </g>

          <!-- Series Lines -->
          <g class="series-lines-group">
            ${r.map((e,t)=>{let n=e.color||fd(t),r=e.strokeWidth??2,i=Ku().defined(t=>{let n=t[e.key];if(n==null)return!1;let r=Number(n);return Number.isFinite(r)}).x(e=>{let t=a(String(e[this.xKey]??``))??0;return Number.isFinite(t)?t:0}).y(t=>{let n=Number(t[e.key]),r=Number.isFinite(n)?l(n):0;return Number.isFinite(r)?r:0}).curve(u)(this.data)??``;if(!i&&this.data.length===1){let t=this.data[0],n=Number(t[e.key]);if(Number.isFinite(n)){let e=a(String(t[this.xKey]??``))??0,r=l(n);i=`M ${e} ${Number.isFinite(r)?r:0}`}}return V`
                <path
                  class="chart-line line-path series-path"
                  part="line"
                  data-series-key="${e.key}"
                  d="${i}"
                  stroke="${n}"
                  stroke-width="${r}"
                />
              `})}
          </g>

          <!-- Data Points (Exactly 1 circle per data point) -->
          <g class="series-points-group">
            ${r.map((e,t)=>{let n=e.color||fd(t);return this.data.map((t,r)=>{let i=t[e.key];if(i==null)return V``;let o=Number(i);if(!Number.isFinite(o))return V``;let s=a(String(t[this.xKey]??``))??0,c=l(o),u=Number.isFinite(c)?c:0,d=this.activePoint?.seriesKey===e.key&&this.activePoint?.index===r;return V`
                  <circle
                    class="point-marker ${d?`is-active`:``}"
                    part="point"
                    data-series="${e.key}"
                    data-index="${r}"
                    cx="${s}"
                    cy="${u}"
                    r="${d?6:4}"
                    stroke="${n}"
                    stroke-width="2"
                    fill="var(--color-surface, #ffffff)"
                    @pointerenter="${n=>this.handlePointEnter(n,t,e,s,u,r)}"
                    @pointerleave="${e=>this.handlePointLeave(e)}"
                  />
                `})})}
          </g>
        </svg>
      </div>
    `}});var cp=[J,M`
    :host {
      display: inline-flex;
      align-items: center;
      vertical-align: baseline;
      font-size: inherit;
      line-height: inherit;
      border-radius: var(--radius-xl, 0.75rem);
      /* Underline colors: faint at rest, muted on hover and press */
      --_decoration: color-mix(in oklab, var(--color-surface) 81%, var(--color-fg) 19%);
      --_decoration-hover: color-mix(in oklab, var(--color-muted) 50%, transparent);
      --_decoration-pressed: var(--color-muted);
    }

    [part~="base"] {
      position: relative;
      display: inline-flex;
      align-items: center;
      border-radius: inherit;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-link);
      text-decoration-line: none;
      text-decoration-color: var(--_decoration);
      text-decoration-thickness: 1.5px;
      text-underline-offset: 4px;
      cursor: pointer;
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      -webkit-tap-highlight-color: transparent;
      transition:
        color 100ms var(--ease-smooth, ease),
        text-decoration-color 100ms var(--ease-smooth, ease),
        background-color 150ms var(--ease-smooth, ease),
        box-shadow 150ms var(--ease-out, ease-out),
        opacity 100ms var(--ease-out, ease-out);
    }

    /* Variants */
    :host([variant="subtle"]) [part~="base"] {
      color: var(--color-muted);
    }

    :host([variant="underline"]) [part~="base"] {
      text-decoration-line: underline;
    }

    @media (hover: hover) {
      :host(:not([is-disabled])) [part~="base"]:hover {
        text-decoration-line: underline;
        text-decoration-color: var(--_decoration-hover);
      }

      :host([variant="subtle"]:not([is-disabled])) [part~="base"]:hover {
        color: var(--color-fg);
      }
    }

    :host(:not([is-disabled])) [part~="base"]:active {
      text-decoration-line: underline;
      text-decoration-color: var(--_decoration-pressed);
    }

    [part~="base"]:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    /* Disabled State */
    :host([is-disabled]) {
      cursor: not-allowed;
      pointer-events: none;
    }

    [part~="base"]:disabled,
    [part~="base"][aria-disabled="true"] {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
      text-decoration-line: none;
    }

    [part~="external-icon"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 0.75em;
      height: 0.75em;
      flex-shrink: 0;
      margin-inline-start: var(--spacing-1, 0.25rem);
      color: currentColor;
      opacity: 0.6;
      pointer-events: none;
      transition: opacity 150ms var(--ease-out, ease-out);
    }

    [part~="external-icon"] svg {
      display: block;
      width: 100%;
      height: 100%;
    }

    @media (hover: hover) {
      [part~="base"]:hover [part~="external-icon"] {
        opacity: 1;
      }
    }

    [part~="base"]:active [part~="external-icon"],
    [part~="base"]:focus-visible [part~="external-icon"] {
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~="base"],
      [part~="external-icon"] {
        transition: none;
      }
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `];W(`moul-link`,class extends U{static styles=cp;static properties={href:{type:String,reflect:!0},target:{type:String,reflect:!0},rel:{type:String,reflect:!0},isExternal:{type:Boolean,reflect:!0,attribute:`is-external`},variant:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`}};pressController;constructor(){super(),this.href=``,this.target=``,this.rel=``,this.isExternal=!1,this.variant=`default`,this.isDisabled=!1,this.pressController=new wd(this,{disabled:()=>this.isDisabled})}getEffectiveRel(){let e=new Set(this.rel?this.rel.split(/\s+/).filter(Boolean):[]);return this.isExternal&&(e.add(`noopener`),e.add(`noreferrer`)),Array.from(e).join(` `)}handleClick(e){this.isDisabled?(e.preventDefault(),e.stopPropagation()):this.dispatchEvent(new CustomEvent(`press`,{bubbles:!0,composed:!0,detail:{originalEvent:e}}))}handleKeyDown(e){this.isDisabled||this.href||e.key!==`Enter`&&e.key!==` `||(e.preventDefault(),this.dispatchEvent(new CustomEvent(`press`,{bubbles:!0,composed:!0,detail:{originalEvent:e}})))}render(){let e=this.getEffectiveRel(),t=this.target||(this.isExternal?`_blank`:``);return B`
      <a
        part="base"
        href=${this.isDisabled?H:this.href||H}
        target=${t||H}
        rel=${e||H}
        role=${this.href?H:`button`}
        tabindex=${this.isDisabled?`-1`:`0`}
        aria-disabled=${this.isDisabled?`true`:H}
        @click=${this.handleClick}
        @keydown=${this.handleKeyDown}
      >
        <slot></slot>
        ${this.isExternal?B`
              <span part="external-icon">${St()}</span>
              <span class="sr-only">(opens in new window)</span>
            `:``}
      </a>
    `}});var lp=Object.assign(Object.create(null),{trace:`trace`,trac:`trace`,debug:`debug`,debu:`debug`,info:`info`,inf:`info`,warn:`warn`,warning:`warn`,error:`error`,erro:`error`,err:`error`,fatal:`fatal`,fata:`fatal`,panic:`fatal`,crit:`fatal`,critical:`fatal`}),up={10:`trace`,20:`debug`,30:`info`,40:`warn`,50:`error`,60:`fatal`};function dp(e){if(e==null)return`info`;if(typeof e==`number`)return Object.hasOwn(up,e)?up[e]:`info`;let t=String(e).trim();if(!t)return`info`;if(/^\d+$/.test(t)){let e=Number(t);return Object.hasOwn(up,e)?up[e]:`info`}let n=t.toLowerCase().replace(/[^a-z]/g,``);if(!n)return`info`;if(Object.hasOwn(lp,n)){let e=lp[n];if(typeof e==`string`)return e}return`info`}function fp(e){if(!e?.includes(`=`))return{};let t={},n=/(?:^|\s+)([a-zA-Z0-9_.-]+)=(?:"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)'|([^\s]+))/g,r=n.exec(e);for(;r!==null;){let i=r[1],a=r[2]===void 0?r[3]===void 0?r[4]:r[3].replace(/\\'/g,`'`):r[2].replace(/\\"/g,`"`);a===`true`?a=!0:a===`false`?a=!1:a===`null`?a=null:!Number.isNaN(Number(a))&&a.trim()!==``&&(a=Number(a)),Object.defineProperty(t,i,{value:a,enumerable:!0,writable:!0,configurable:!0}),r=n.exec(e)}return t}function pp(e){return e?e.includes(`=`)?e.replace(/(?:^|\s+)[a-zA-Z0-9_.-]+=(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\s]+)/g,``).trim():e.trim():``}function mp(e,t=0){let n=e.trim();if(!n)return{id:`log-${t}`,lineNumber:t+1,message:``,raw:e,level:`info`};if(n.startsWith(`{`)&&n.endsWith(`}`))try{let r=JSON.parse(n),i=dp(r.level||r.severity||r.lvl||r.status||`info`),a=r.time||r.timestamp||r[`@timestamp`]||r.date||void 0,o=r.msg||r.message||r.log||r.text||JSON.stringify(r),{level:s,severity:c,lvl:l,time:u,timestamp:d,"@timestamp":f,date:p,msg:m,message:h,...g}=r;return{id:r.id??`log-${t}`,lineNumber:t+1,timestamp:a?String(a):void 0,level:i,message:String(o),attributes:g,raw:e}}catch{}let r=n.match(/^\[?(\d{4}[/-]\d{2}[/-]\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?)\]?\s+\[?([A-Z]{3,7})\]?\s+(.*)$/i);if(r){let n=r[1],i=r[2],a=r[3],o=fp(a),s=pp(a)||a;return{id:`log-${t}`,lineNumber:t+1,timestamp:n,level:dp(i),message:s,attributes:Object.keys(o).length>0?o:void 0,raw:e}}let i=fp(n),a=pp(n)||n;return{id:`log-${t}`,lineNumber:t+1,level:`info`,message:a,attributes:Object.keys(i).length>0?i:void 0,raw:e}}function hp(e){return e?typeof e==`string`?e.split(/\r?\n/).filter(e=>e.trim().length>0).map((e,t)=>mp(e,t)):Array.isArray(e)?e.filter(e=>e!=null).map((e,t)=>typeof e==`string`?mp(e,t):typeof e==`object`?{...e,id:e.id??`log-${t}`,lineNumber:e.lineNumber??t+1,level:dp(e.level)}:mp(String(e),t)):[]:[]}hp(`2026/08/19 11:16:49 INFO Starting mould engine server addr="http://localhost:8090" env="development" version="dev"
2026/08/19 11:16:49 INFO Request tracking flusher started component="analytics"
2026/08/19 11:16:50 DEBU Flushed request records component="analytics" count=12
2026/08/19 11:16:52 INFO HTTP request bytes_sent=48 ip="127.0.0.1" latency="182.4µs" method="GET" path="/api/health" status=200
2026/08/19 11:16:55 INFO HTTP request bytes_sent=1420 email="alex@example.com" ip="192.168.1.45" latency="3.12ms" method="GET" path="/api/mouls/posts/records" status=200 user_id="usr_01j7k9p2"
2026/08/19 11:17:02 WARN HTTP request bytes_sent=68 ip="192.168.1.45" latency="410.5µs" method="GET" path="/api/mouls/nonexistent/records" status=404 error="moul 'nonexistent' not found"
2026/08/19 11:17:08 WARN Request tracking channel full, dropping request component="analytics" path="/api/events"
2026/08/19 11:17:15 WARN Background job failed, scheduled for retry error="dial tcp: lookup smtp.mailgun.org: no such host" jobID="job_01j7k8a" nextAttemptAt="2026-08-19 11:18:15" worker="SendEmail"
2026/08/19 11:17:21 ERRO HTTP request bytes_sent=112 email="alex@example.com" ip="192.168.1.80" latency="14.85ms" method="POST" path="/api/mouls/orders/records" status=500 user_id="usr_01j7k9p2" error="database locked (sqlite busy)"
2026/08/19 11:17:25 ERRO After-webhook execution failed err="Post \\"https://webhook.site/test\\": context deadline exceeded" url="https://webhook.site/test"
2026/08/19 11:17:30 ERRO Failed to start Litestream replication err="credentials not set in environment (AWS_ACCESS_KEY_ID)"
2026/08/19 11:17:40 INFO Cleaned up old requests count=42
2026/08/19 11:17:40 INFO Cleaned up old visits count=15
2026/08/19 11:17:40 INFO Cleaned up expired revoked tokens count=0
2026/08/19 11:17:55 INFO Stopping Litestream replication...
2026/08/19 11:17:55 INFO Server stopped gracefully
2026/08/19 11:18:02 FATA Server failed to run err="listen tcp :8090: bind: address already in use"`);var gp=[J,M`
    :host {
      display: block;
      box-sizing: border-box;
      width: 100%;
      color: var(--color-fg, #18181b);
      font-family: var(--font-family-base, inherit);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
    }

    /* HeroUI card surface: white fill lifted by a soft shadow, no border. */
    .container {
      display: flex;
      flex-direction: column;
      background-color: var(--color-surface, #ffffff);
      border-radius: var(--radius-surface, 1.5rem);
      overflow: hidden;
      box-shadow: var(--shadow-surface, 0 1px 2px 0 rgba(0, 0, 0, 0.06));
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-2, 0.5rem);
      padding: var(--spacing-3, 0.75rem);
      border-bottom: 1px solid var(--color-separator, #e4e4e7);
      user-select: none;
    }

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
      flex-wrap: wrap;
    }

    /* Search: HeroUI secondary search field (default fill, no shadow, used inside surfaces). */
    .search-box {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      inset-inline-start: var(--spacing-3, 0.75rem);
      width: 1rem;
      height: 1rem;
      color: var(--color-field-placeholder, #71717a);
      pointer-events: none;
    }

    .search-input {
      height: 2rem;
      min-width: 10rem;
      padding-block: 0;
      padding-inline: 2.25rem 2rem;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      border: none;
      border-radius: var(--radius-field, 0.75rem);
      background-color: var(--color-default, #f4f4f5);
      color: var(--color-field-fg, #18181b);
      outline: none;
      transition:
        background-color var(--duration-fast, 150ms) var(--ease-smooth, ease),
        box-shadow var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    .search-input::placeholder {
      color: var(--color-field-placeholder, #71717a);
    }

    @media (hover: hover) {
      .search-input:hover:not(:focus) {
        background-color: var(--color-default-hover, #e4e4e7);
      }
    }

    .search-input:focus,
    .search-input:focus-visible {
      outline: none;
      background-color: var(--color-default, #f4f4f5);
      box-shadow: var(--focus-ring-field);
    }

    .search-clear-btn {
      position: absolute;
      inset-inline-end: var(--spacing-2, 0.5rem);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--color-muted, #71717a);
      font-size: var(--font-size-xs, 0.75rem);
      cursor: pointer;
      border-radius: var(--radius-full, 9999px);
      transition:
        background-color var(--duration-fast, 150ms) var(--ease-smooth, ease),
        color var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    @media (hover: hover) {
      .search-clear-btn:hover {
        background-color: var(--color-default-hover, #e4e4e7);
        color: var(--color-fg, #18181b);
      }
    }

    .search-clear-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    /* Level filter: HeroUI tabs (default track, raised segment indicator). */
    .filter-group {
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      background-color: var(--color-default, #f4f4f5);
      border-radius: var(--radius-3xl, 1.5rem);
      padding: 0.125rem;
      gap: 0;
    }

    .filter-indicator {
      position: absolute;
      top: 0.125rem;
      bottom: 0.125rem;
      background-color: var(--color-segment, #ffffff);
      border-radius: var(--radius-3xl, 1.5rem);
      pointer-events: none;
      box-shadow: var(--shadow-surface, 0 1px 2px 0 rgba(0, 0, 0, 0.06));
      z-index: 0;
    }

    .filter-pill {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 1.75rem;
      padding: 0 var(--spacing-3, 0.75rem);
      border: none;
      background: transparent;
      color: var(--color-muted, #71717a);
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-xs, 1rem);
      text-transform: capitalize;
      border-radius: var(--radius-3xl, 1.5rem);
      cursor: pointer;
      outline: none;
      transition:
        color var(--duration-fast, 150ms) var(--ease-smooth, ease),
        opacity var(--duration-fast, 150ms) var(--ease-smooth, ease),
        box-shadow var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      .filter-pill:not([aria-pressed='true']):not(.active):hover {
        opacity: 0.7;
      }
    }

    .filter-pill[aria-pressed='true'],
    .filter-pill.active {
      color: var(--color-fg, #18181b);
    }

    .filter-pill:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    /* Counts: HeroUI default chip. */
    .counts-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem var(--spacing-2, 0.5rem);
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: 1.25rem;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      color: var(--color-muted, #71717a);
      background-color: var(--color-default, #f4f4f5);
      border-radius: var(--radius-2xl, 1rem);
    }

    /* Toolbar buttons: HeroUI ghost buttons (sm); pressed toggles use accent-soft. */
    .tool-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-1, 0.25rem);
      height: 2rem;
      min-width: 2rem;
      padding: 0 var(--spacing-2, 0.5rem);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: 1;
      border: none;
      border-radius: var(--radius-3xl, 1.5rem);
      background-color: transparent;
      color: var(--color-default-fg, #18181b);
      cursor: pointer;
      outline: none;
      transform-origin: center;
      transition:
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        box-shadow 100ms var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      .tool-btn:hover {
        background-color: var(--color-default, #f4f4f5);
      }
    }

    .tool-btn:active {
      background-color: var(--color-default-hover, #e4e4e7);
      transform: scale(var(--press-scale, 0.97));
    }

    .tool-btn[aria-pressed='true'],
    .tool-btn.active {
      background-color: var(--color-accent-soft);
      color: var(--color-accent-soft-fg);
    }

    @media (hover: hover) {
      .tool-btn[aria-pressed='true']:hover,
      .tool-btn.active:hover {
        background-color: var(--color-accent-soft-hover);
      }
    }

    .tool-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .tool-btn svg {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    /* Logs viewport */
    .scroll-container {
      position: relative;
      overflow-y: auto;
      overflow-x: auto;
      max-height: var(--logs-max-height, 600px);
      background-color: var(--color-surface, #ffffff);
      font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: 1.5;
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
    }

    .logs-table {
      display: table;
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }

    /* Rows: HeroUI table rows with separator dividers. */
    .row {
      display: table-row;
      border-bottom: 1px solid var(--color-separator, #e4e4e7);
      cursor: pointer;
      transition: background-color 100ms var(--ease-out, ease-out);
    }

    .row:last-child {
      border-bottom-color: transparent;
    }

    @media (hover: hover) {
      .row:hover {
        background-color: var(--color-default-soft, rgba(244, 244, 245, 0.5));
      }
    }

    .row.selected {
      background-color: var(--color-accent-soft);
    }

    @media (hover: hover) {
      .row.selected:hover {
        background-color: var(--color-accent-soft-hover);
      }
    }

    /* Inset ring so the scroll viewport never clips it. */
    .row:focus-visible {
      outline: 2px solid var(--color-focus, #3b82f6);
      outline-offset: -2px;
    }

    .row.compact .cell {
      padding-top: 0.125rem;
      padding-bottom: 0.125rem;
    }

    /* Cells */
    .cell {
      display: table-cell;
      padding: 0.375rem var(--spacing-2, 0.5rem);
      vertical-align: top;
      white-space: nowrap;
    }

    .cell:first-child {
      padding-inline-start: var(--spacing-3, 0.75rem);
    }

    .cell:last-child {
      padding-inline-end: var(--spacing-3, 0.75rem);
    }

    .cell-line {
      width: 44px;
      min-width: 44px;
      text-align: right;
      color: var(--color-muted, #71717a);
      user-select: none;
      font-variant-numeric: tabular-nums;
    }

    .cell-time {
      width: 170px;
      min-width: 170px;
      color: var(--color-muted, #71717a);
      font-variant-numeric: tabular-nums;
    }

    .cell-level {
      width: 4rem;
      min-width: 4rem;
    }

    /* Level badges: HeroUI soft chips (sm), sized to the log line box. */
    .level-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 3rem;
      padding: 0 var(--spacing-2, 0.5rem);
      font-family: var(--font-family-base, inherit);
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: inherit;
      white-space: nowrap;
      border-radius: var(--radius-2xl, 1rem);
      background-color: var(--color-default, #f4f4f5);
      color: var(--color-default-fg, #18181b);
    }

    .level-badge.level-info {
      background-color: var(--color-accent-soft);
      color: var(--color-accent-soft-fg);
    }

    .level-badge.level-warn {
      background-color: var(--color-warning-soft);
      color: var(--color-warning-soft-fg);
    }

    .level-badge.level-error {
      background-color: var(--color-danger-soft);
      color: var(--color-danger-soft-fg);
    }

    /* Fatal escalates to the solid danger chip. */
    .level-badge.level-fatal {
      background-color: var(--color-danger);
      color: var(--color-danger-fg);
    }

    .level-badge.level-debug,
    .level-badge.level-trace {
      background-color: var(--color-default, #f4f4f5);
      color: var(--color-muted, #71717a);
    }

    .cell-message {
      width: 100%;
      word-break: break-word;
      color: var(--color-fg, #18181b);
    }

    /* Preserve whitespace in the log text only — not the template's own indentation */
    .wrap-lines .cell-message {
      white-space: normal;
    }

    .no-wrap .cell-message {
      white-space: nowrap;
    }

    .wrap-lines .cell-message > .message-text {
      white-space: pre-wrap;
    }

    .no-wrap .cell-message > .message-text {
      white-space: pre;
    }

    /* Attribute chips: HeroUI default chips (sm). */
    .attribute-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.125rem;
      margin: 1px var(--spacing-1, 0.25rem) 1px 0;
      padding: 0 0.375rem;
      font-size: 0.6875rem;
      border-radius: var(--radius-2xl, 1rem);
      background-color: var(--color-default, #f4f4f5);
      color: var(--color-muted, #71717a);
      vertical-align: middle;
      line-height: 1.4;
    }

    .attribute-key {
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-muted, #71717a);
    }

    /* Keep "key=" whole when a long value wraps inside the chip. */
    .attribute-chip > .attribute-key {
      flex-shrink: 0;
      white-space: nowrap;
    }

    .attribute-val {
      color: var(--color-fg, #18181b);
    }

    /* Highlight */
    mark.highlight,
    .highlight {
      background-color: color-mix(
        in oklab,
        var(--color-warning, #f5a524) 35%,
        transparent
      );
      color: inherit;
      padding: 0 2px;
      border-radius: var(--radius-xs, 2px);
    }

    /* Empty state */
    .empty-state {
      padding: var(--spacing-8, 2rem);
      text-align: center;
      font-family: var(--font-family-base, inherit);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-muted, #71717a);
    }

    /* Log detail drawer: content slotted into <moul-drawer>, styled from this shadow root. */
    .inspector-header {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3, 0.75rem);
      min-width: 0;
    }

    .inspector-title {
      font-size: var(--font-size-md, 1rem);
      line-height: var(--line-height-md, 1.5rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg, #18181b);
    }

    .inspector-close-btn {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--color-muted, #71717a);
      cursor: pointer;
      border-radius: var(--radius-full, 9999px);
      outline: none;
      transition:
        background-color 100ms var(--ease-out, ease-out),
        color 100ms var(--ease-out, ease-out),
        box-shadow 100ms var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      .inspector-close-btn:hover {
        color: var(--color-fg, #18181b);
        background-color: var(--color-default, #f4f4f5);
      }
    }

    .inspector-close-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .inspector-body {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-5, 1.25rem);
      padding-top: var(--spacing-2, 0.5rem);
    }

    /* Level, timestamp and line as a row of secondary tiles. */
    .inspector-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
      gap: var(--spacing-2, 0.5rem);
    }

    .inspector-meta-item {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
      background-color: var(--color-surface-secondary, #f4f4f5);
      border-radius: var(--radius-xl, 0.75rem);
    }

    .inspector-meta-item > dt {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted, #71717a);
    }

    .inspector-meta-item > dd {
      display: flex;
      align-items: center;
      min-height: 1.25rem;
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-fg, #18181b);
      word-break: break-word;
    }

    .inspector-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2, 0.5rem);
    }

    .inspector-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-2, 0.5rem);
    }

    .inspector-section-header > .tool-btn {
      height: 1.75rem;
      font-size: var(--font-size-xs, 0.75rem);
    }

    .inspector-label {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1, 0.25rem);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-muted, #71717a);
    }

    .inspector-count {
      min-width: 1.125rem;
      padding: 0 0.3125rem;
      border-radius: var(--radius-full, 9999px);
      background-color: var(--color-default, #f4f4f5);
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .inspector-message {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-md, 1.5rem);
      color: var(--color-fg, #18181b);
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Attribute table: keys share one column so values line up. */
    .inspector-attrs {
      display: grid;
      grid-template-columns: minmax(5rem, max-content) 1fr;
      background-color: var(--color-surface-secondary, #f4f4f5);
      border-radius: var(--radius-xl, 0.75rem);
      overflow: hidden;
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
    }

    .inspector-attr-row {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      gap: var(--spacing-3, 0.75rem);
      padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
    }

    .inspector-attr-row + .inspector-attr-row {
      border-top: 1px solid var(--color-separator, #e4e4e7);
    }

    .inspector-attr-row > .attribute-val {
      min-width: 0;
      word-break: break-all;
    }

    .inspector-raw {
      margin: 0;
      padding: var(--spacing-3, 0.75rem);
      background-color: var(--color-surface-secondary, #f4f4f5);
      border-radius: var(--radius-xl, 0.75rem);
      font-family: var(--font-family-mono, monospace);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: 1.5;
      color: var(--color-fg, #18181b);
      white-space: pre-wrap;
      word-break: break-all;
    }

    .inspector-raw > code {
      font-family: inherit;
    }

    @media (prefers-reduced-motion: reduce) {
      .search-input,
      .search-clear-btn,
      .filter-pill,
      .tool-btn,
      .row,
      .inspector-close-btn {
        transition: none;
      }

      .tool-btn:active {
        transform: none;
      }
    }
  `],_p=[`all`,`info`,`warn`,`error`,`debug`];function vp({text:e,query:t}){if(!t?.trim()||!e)return e;let n=t.trim(),r=n.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`),i=RegExp(`(${r})`,`gi`),a=e.split(i),o=n.toLowerCase();return B`${a.map(e=>e.toLowerCase()===o?B`<mark class="highlight" part="highlight">${e}</mark>`:e)}`}function yp(e){return typeof e==`object`&&e?JSON.stringify(e):String(e)}function bp({name:e,value:t}){return B`
    <span class="attribute-chip" part="attribute-chip">
      <span class="attribute-key">${e}=</span>
      <span class="attribute-val">${yp(t)}</span>
    </span>
  `}function xp({level:e=`info`}){let t=(typeof e==`string`?e:String(e||`info`)).toLowerCase();return B`
    <span
      class="level-badge level-${t}"
      part="cell-level"
    >${t}</span>
  `}function Sp({content:e=``,label:t=`Copy`}){return B`
    <button
      type="button"
      class="tool-btn"
      aria-label=${t}
      title=${t}
      @click=${t=>{t.stopPropagation(),typeof navigator<`u`&&navigator.clipboard&&navigator.clipboard.writeText(e).catch(()=>{})}}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
      <span>${t}</span>
    </button>
  `}W(`moul-logs-viewer`,class extends U{static styles=gp;static properties={logs:{type:Array,attribute:!1},filterLevel:{type:String,attribute:`filter-level`,reflect:!0},searchQuery:{type:String,attribute:`search-query`,reflect:!0},showTimestamps:{type:Boolean,attribute:`show-timestamps`,reflect:!0},showLineNumbers:{type:Boolean,attribute:`show-line-numbers`,reflect:!0},showLevels:{type:Boolean,attribute:`show-levels`,reflect:!0},showToolbar:{type:Boolean,attribute:`show-toolbar`,reflect:!0},wrapLines:{type:Boolean,attribute:`wrap-lines`,reflect:!0},compact:{type:Boolean,attribute:`compact`,reflect:!0},virtualized:{type:Boolean,attribute:`virtualized`,reflect:!0},maxHeight:{type:String,attribute:`max-height`,reflect:!0},selectedId:{type:String,attribute:`selected-id`,reflect:!0},isInspectorOpen:{type:Boolean,attribute:`is-inspector-open`,reflect:!0},title:{type:String,reflect:!0},searchPlaceholder:{type:String,attribute:`search-placeholder`}};previousIndicatorRect=null;inspectedLog=null;constructor(){super(),this.logs=[],this.filterLevel=`all`,this.searchQuery=``,this.showTimestamps=!0,this.showLineNumbers=!0,this.showLevels=!0,this.showToolbar=!0,this.wrapLines=!1,this.compact=!1,this.virtualized=!0,this.maxHeight=`600px`,this.selectedId=null,this.isInspectorOpen=!1,this.title=``,this.searchPlaceholder=`Filter logs...`}_resizeObserver=null;_hasDimensions=!1;connectedCallback(){super.connectedCallback(),this.hasUpdated&&!this._resizeObserver&&this.setupResizeObserver()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupResizeObserver()}firstUpdated(){this.updateIndicator(!1),this.setupResizeObserver()}updated(e){super.updated(e),e.has(`filterLevel`)&&this.updateIndicator(!0)}setupResizeObserver(){if(typeof ResizeObserver>`u`)return;let e=this.shadowRoot?.querySelector(`.scroll-container`);e&&(this._resizeObserver=new ResizeObserver(e=>{for(let t of e){let{height:e,width:n}=t.contentRect||{height:0,width:0},r=e>0||n>0;r!==this._hasDimensions&&(this._hasDimensions=r,this.requestUpdate())}}),this._resizeObserver.observe(e))}cleanupResizeObserver(){this._resizeObserver&&=(this._resizeObserver.disconnect(),null)}hasContainerDimensions(){if(typeof window>`u`)return!1;if(this._hasDimensions)return!0;let e=this.shadowRoot?.querySelector(`.scroll-container`);return this.offsetHeight>0||(e?.clientHeight??0)>0||(e?.getBoundingClientRect?.()?.height??0)>0}get filteredLogs(){let e=Array.isArray(this.logs)?this.logs:[],t=this.filterLevel,n=this.searchQuery.trim().toLowerCase();return e.filter(e=>{if(!e||typeof e!=`object`)return!1;if(t!==`all`){let n=(typeof e.level==`string`?e.level:String(e.level||`info`)).toLowerCase();if(t===`error`){if(n!==`error`&&n!==`fatal`)return!1}else if(t===`warn`){if(n!==`warn`)return!1}else if(t===`info`){if(n!==`info`)return!1}else if(t===`debug`){if(n!==`debug`&&n!==`trace`)return!1}else if(n!==t)return!1}if(n){let t=(e.message||``).toLowerCase().includes(n),r=(typeof e.level==`string`?e.level:String(e.level||``)).toLowerCase().includes(n),i=(e.timestamp||``).toLowerCase().includes(n),a=!1;if(e.attributes&&typeof e.attributes==`object`){for(let[t,r]of Object.entries(e.attributes))if(t.toLowerCase().includes(n)||String(r).toLowerCase().includes(n)){a=!0;break}}let o=(e.raw||``).toLowerCase().includes(n);if(!t&&!r&&!i&&!a&&!o)return!1}return!0})}updateIndicator(e=!0){let t=this.shadowRoot?.querySelector(`.filter-pill[data-level="${this.filterLevel}"]`),n=this.shadowRoot?.querySelector(`.filter-indicator`);if(!t||!n)return;let r=t.getBoundingClientRect();n.style.left=`${t.offsetLeft}px`,n.style.width=`${t.offsetWidth}px`,e&&this.previousIndicatorRect&&r.width>0&&r.height>0&&Ns(n,this.previousIndicatorRect,r),this.previousIndicatorRect=r}handleLevelClick=e=>{let t=this.shadowRoot?.querySelector(`.filter-pill[data-level="${this.filterLevel}"]`);t&&(this.previousIndicatorRect=t.getBoundingClientRect()),this.filterLevel=e,this.dispatchEvent(new CustomEvent(`filterlevelchange`,{bubbles:!0,composed:!0,detail:{filterLevel:this.filterLevel}})),this.dispatchEvent(new CustomEvent(`filterchange`,{bubbles:!0,composed:!0,detail:{filterLevel:this.filterLevel,searchQuery:this.searchQuery}}))};handleSearchInput=e=>{let t=e.target;this.searchQuery=t.value,this.dispatchEvent(new CustomEvent(`searchchange`,{bubbles:!0,composed:!0,detail:{searchQuery:this.searchQuery}})),this.dispatchEvent(new CustomEvent(`filterchange`,{bubbles:!0,composed:!0,detail:{filterLevel:this.filterLevel,searchQuery:this.searchQuery}}))};handleClearSearch=()=>{this.searchQuery=``,this.dispatchEvent(new CustomEvent(`searchchange`,{bubbles:!0,composed:!0,detail:{searchQuery:``}})),this.dispatchEvent(new CustomEvent(`filterchange`,{bubbles:!0,composed:!0,detail:{filterLevel:this.filterLevel,searchQuery:``}}))};handleClearAll=()=>{this.dispatchEvent(new CustomEvent(`clear`,{bubbles:!0,composed:!0,detail:{}}))};toggleTimestamps=()=>{this.showTimestamps=!this.showTimestamps};toggleWrap=()=>{this.wrapLines=!this.wrapLines};handleRowClick=e=>{this.selectedId=e.id,this.isInspectorOpen=!0,this.dispatchEvent(new CustomEvent(`logselect`,{bubbles:!0,composed:!0,detail:{log:e}})),this.dispatchEvent(new CustomEvent(`rowclick`,{bubbles:!0,composed:!0,detail:{log:e}}))};closeInspector=()=>{this.isInspectorOpen=!1,this.selectedId=null};handleInspectorOpenChange=e=>{e.stopPropagation(),e.detail?.isOpen||this.closeInspector()};handleCopyAll=()=>{let e=this.filteredLogs.map(e=>e.raw||e.message).join(`
`);typeof navigator<`u`&&navigator.clipboard&&navigator.clipboard.writeText(e).catch(()=>{})};handleDownload=()=>{let e=this.filteredLogs.map(e=>e.raw||e.message).join(`
`);if(typeof document<`u`){let t=new Blob([e],{type:`text/plain`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`logs-${new Date().toISOString().slice(0,10)}.log`,r.click(),URL.revokeObjectURL(n)}};renderRow(e,t){let n=this.selectedId!==null&&String(this.selectedId)===String(e.id),r=e.lineNumber??t+1,i=(typeof e.level==`string`?e.level:String(e.level||`info`)).toLowerCase();return B`
      <div
        class="row ${n?`selected`:``} ${this.compact?`compact`:``}"
        part="row"
        role="row"
        tabindex="0"
        aria-selected=${n?`true`:`false`}
        data-id=${e.id}
        @click=${()=>this.handleRowClick(e)}
        @keydown=${t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),this.handleRowClick(e))}}
      >
        ${this.showLineNumbers?B`
              <div class="cell cell-line" part="cell-linenumber" role="cell">
                ${r}
              </div>
            `:``}
        ${this.showTimestamps?B`
              <div class="cell cell-time" part="cell-timestamp" role="cell">
                ${vp({text:e.timestamp||``,query:this.searchQuery})}
              </div>
            `:``}
        ${this.showLevels?B`
              <div class="cell cell-level" part="cell-level" role="cell">
                ${xp({level:i})}
              </div>
            `:``}
        <div class="cell cell-message" part="cell-message" role="cell">
          <span class="message-text">${vp({text:e.message,query:this.searchQuery})}</span>
          ${e.attributes&&Object.keys(e.attributes).length>0?B`
                <span class="attributes-wrapper" part="attributes">
                  ${Object.entries(e.attributes).map(([e,t])=>bp({name:e,value:t}))}
                </span>
              `:``}
        </div>
      </div>
    `}get selectedLog(){return this.selectedId===null?null:(this.logs||[]).find(e=>e&&String(e.id)===String(this.selectedId))??null}willUpdate(e){super.willUpdate(e),this.inspectedLog=this.selectedLog??this.inspectedLog}renderInspector(e){let t=Object.entries(e.attributes||{}),n=e.raw||e.message,r=(typeof e.level==`string`?e.level:String(e.level||`info`)).toLowerCase();return B`
      <div slot="header" class="inspector-header" part="inspector-header">
        <h2 class="inspector-title">Log details</h2>
        <button
          type="button"
          class="inspector-close-btn"
          aria-label="Close log details"
          @click=${this.closeInspector}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="inspector-body">
        <dl class="inspector-meta" part="inspector-meta">
          <div class="inspector-meta-item">
            <dt>Level</dt>
            <dd>${xp({level:r})}</dd>
          </div>
          ${e.timestamp?B`
                <div class="inspector-meta-item">
                  <dt>Timestamp</dt>
                  <dd>${e.timestamp}</dd>
                </div>
              `:``}
          ${e.lineNumber===void 0?``:B`
                <div class="inspector-meta-item">
                  <dt>Line</dt>
                  <dd>${e.lineNumber}</dd>
                </div>
              `}
        </dl>

        <section class="inspector-section">
          <h3 class="inspector-label">Message</h3>
          <p class="inspector-message" part="inspector-message">${e.message}</p>
        </section>

        ${t.length>0?B`
              <section class="inspector-section">
                <h3 class="inspector-label">
                  Attributes <span class="inspector-count">${t.length}</span>
                </h3>
                <dl class="inspector-attrs" part="inspector-attrs">
                  ${t.map(([e,t])=>B`
                      <div class="inspector-attr-row">
                        <dt class="attribute-key">${e}</dt>
                        <dd class="attribute-val">${yp(t)}</dd>
                      </div>
                    `)}
                </dl>
              </section>
            `:``}

        <section class="inspector-section">
          <div class="inspector-section-header">
            <h3 class="inspector-label">Raw</h3>
            ${Sp({content:n,label:`Copy`})}
          </div>
          <pre class="inspector-raw" part="inspector-raw"><code>${n}</code></pre>
        </section>
      </div>
    `}render(){let e=this.filteredLogs,t=Array.isArray(this.logs)?this.logs.length:0,n=e.length;return B`
      <div class="container" part="container">
        ${this.showToolbar?B`
              <div class="toolbar" part="toolbar" role="toolbar" aria-label="Logs Filter Toolbar">
                <div class="toolbar-left">
                  <div class="search-box" part="search">
                    <svg
                      class="search-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                      type="text"
                      class="search-input"
                      placeholder=${this.searchPlaceholder}
                      .value=${this.searchQuery}
                      aria-label="Filter logs"
                      @input=${this.handleSearchInput}
                    />
                    ${this.searchQuery?B`
                          <button
                            type="button"
                            class="search-clear-btn"
                            aria-label="Clear search"
                            @click=${this.handleClearSearch}
                          >
                            ✕
                          </button>
                        `:``}
                  </div>

                  <div class="filter-group" part="filter-group" role="radiogroup" aria-label="Filter by level">
                    <div class="filter-indicator" part="filter-indicator"></div>
                    ${_p.map(e=>B`
                        <button
                          type="button"
                          class="filter-pill ${this.filterLevel===e?`active`:``}"
                          part="filter-pill"
                          role="radio"
                          data-level=${e}
                          aria-checked=${this.filterLevel===e?`true`:`false`}
                          aria-pressed=${this.filterLevel===e?`true`:`false`}
                          @click=${()=>this.handleLevelClick(e)}
                        >
                          ${e}
                        </button>
                      `)}
                  </div>
                </div>

                <div class="toolbar-right">
                  <span class="counts-badge" part="counts" aria-live="polite">
                    ${n} / ${t} events
                  </span>

                  <button
                    type="button"
                    class="tool-btn ${this.showTimestamps?`active`:``}"
                    title="Toggle timestamps"
                    aria-label="Toggle timestamps"
                    aria-pressed=${this.showTimestamps?`true`:`false`}
                    @click=${this.toggleTimestamps}
                  >
                    <span>T</span>
                  </button>

                  <button
                    type="button"
                    class="tool-btn ${this.wrapLines?`active`:``}"
                    title="Toggle line wrapping"
                    aria-label="Toggle line wrapping"
                    aria-pressed=${this.wrapLines?`true`:`false`}
                    @click=${this.toggleWrap}
                  >
                    <span>W</span>
                  </button>

                  <button
                    type="button"
                    class="tool-btn"
                    title="Copy filtered logs"
                    aria-label="Copy logs"
                    @click=${this.handleCopyAll}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="tool-btn"
                    title="Download logs"
                    aria-label="Download logs"
                    @click=${this.handleDownload}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="tool-btn"
                    title="Clear view"
                    aria-label="Clear view"
                    @click=${this.handleClearAll}
                  >
                    ✕
                  </button>
                </div>
              </div>
            `:``}

        <div
          class="scroll-container ${this.wrapLines?`wrap-lines`:`no-wrap`}"
          part="scroll-container"
          style="max-height: ${this.maxHeight};"
          role="region"
          aria-label="Logs Stream"
        >
          <div class="logs-table" part="table" role="table">
            ${e.length===0?B`
                  <div class="empty-state" part="empty" role="cell">
                    No logs match your filter criteria.
                  </div>
                `:this.virtualized&&e.length>50&&this.hasContainerDimensions()?Af({items:e,renderItem:(e,t)=>this.renderRow(e,t)}):e.map((e,t)=>this.renderRow(e,t))}
          </div>
        </div>

        <moul-drawer
          part="inspector"
          placement="right"
          size="lg"
          .isOpen=${this.isInspectorOpen&&this.selectedLog!==null}
          @openchange=${this.handleInspectorOpenChange}
        >
          ${this.inspectedLog?this.renderInspector(this.inspectedLog):``}
        </moul-drawer>
      </div>
    `}}),W(`moul-logs`,class extends U{static styles=M`
    :host {
      display: block;
      width: 100%;
    }
    ::slotted(*) {
      display: none;
    }
  `;static properties={raw:{type:String,reflect:!0},filterLevel:{type:String,attribute:`filter-level`,reflect:!0},searchQuery:{type:String,attribute:`search-query`,reflect:!0},showTimestamps:{type:Boolean,attribute:`show-timestamps`,reflect:!0},showLineNumbers:{type:Boolean,attribute:`show-line-numbers`,reflect:!0},showLevels:{type:Boolean,attribute:`show-levels`,reflect:!0},showToolbar:{type:Boolean,attribute:`show-toolbar`,reflect:!0},wrapLines:{type:Boolean,attribute:`wrap-lines`,reflect:!0},compact:{type:Boolean,attribute:`compact`,reflect:!0},virtualized:{type:Boolean,attribute:`virtualized`,reflect:!0},maxHeight:{type:String,attribute:`max-height`,reflect:!0}};_slottedContent=``;constructor(){super(),this.raw=``,this.filterLevel=`all`,this.searchQuery=``,this.showTimestamps=!0,this.showLineNumbers=!0,this.showLevels=!0,this.showToolbar=!0,this.wrapLines=!1,this.compact=!1,this.virtualized=!0,this.maxHeight=`600px`}handleSlotChange(e){let t=e.target.assignedNodes({flatten:!0}).map(e=>e.textContent||``).join(`
`).trim();t!==this._slottedContent&&(this._slottedContent=t,this.requestUpdate())}get parsedLogs(){return hp(this.raw||this._slottedContent||this.textContent||``)}render(){return B`
      <slot @slotchange=${this.handleSlotChange}></slot>
      <moul-logs-viewer
        .logs=${this.parsedLogs}
        .filterLevel=${this.filterLevel}
        .searchQuery=${this.searchQuery}
        .showTimestamps=${this.showTimestamps}
        .showLineNumbers=${this.showLineNumbers}
        .showLevels=${this.showLevels}
        .showToolbar=${this.showToolbar}
        .wrapLines=${this.wrapLines}
        .compact=${this.compact}
        .virtualized=${this.virtualized}
        .maxHeight=${this.maxHeight}
      ></moul-logs-viewer>
    `}});var Cp=[J,M`
    :host {
      display: contents;
    }

    /* Full-viewport positioning layer; the panel is centred inside its padding */
    dialog {
      padding: var(--spacing-4, 1rem);
      border: none;
      background: transparent;
      overflow: visible;
      color: inherit;
      max-width: none;
      max-height: none;
      width: 100%;
      height: 100%;
      inset: 0;
      position: fixed;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal, 1300);
      margin: 0;
    }

    @media (min-width: 640px) {
      dialog {
        padding: 2.5rem;
      }
    }

    dialog:not([open]) {
      display: none;
    }

    /* Panel surface (fill, radius, shadow) comes from the shared overlay styles */
    [part~="base"] {
      position: relative;
      width: 100%;
      max-width: 28rem;
      max-height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: var(--spacing-6, 1.5rem);
      overflow: hidden;
      outline: none;
      --_enter-scale: 1.05;
    }

    :host([size="sm"]) [part~="base"] {
      max-width: 24rem;
    }

    :host([size="md"]) [part~="base"] {
      max-width: 28rem;
    }

    :host([size="lg"]) [part~="base"] {
      max-width: 32rem;
    }

    :host([size="fullscreen"]) dialog {
      padding: 0;
    }

    :host([size="fullscreen"]) [part~="base"] {
      max-width: none;
      width: 100%;
      height: 100%;
      border-radius: 0;
      box-shadow: none;
      --_enter-scale: 1;
    }

    [part~="header"] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3, 0.75rem);
      margin-bottom: var(--spacing-2, 0.5rem);
      font-size: var(--font-size-md, 1rem);
      line-height: var(--line-height-md, 1.5rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg);
    }

    /* Headings slotted into the header take its type instead of UA heading styles */
    ::slotted([slot="header"]) {
      margin: 0;
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit;
    }

    [part~="body"] {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
      /* Room for focus rings of controls inside the scroll area */
      margin-inline: -3px;
      padding: 3px;
      color: var(--color-muted);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
    }

    [part~="footer"] {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--spacing-2, 0.5rem);
      margin-top: var(--spacing-5, 1.25rem);
    }

    /* Collapse sections with nothing slotted, where :has-slotted is supported */
    [part~="header"]:not(:has(> slot:has-slotted)),
    [part~="footer"]:not(:has(> slot:has-slotted)) {
      display: none;
    }

    /* Enter: fade + settle from 1.05; exit while closing: fade + shrink to .95 */
    dialog[open] [part~="base"] {
      animation: moul-modal-in 250ms var(--ease-out, ease-out);
    }

    :host(:not([is-open])) dialog[open] [part~="base"] {
      animation: moul-modal-out 100ms var(--ease-out, ease-out) forwards;
      pointer-events: none;
    }

    :host(:not([is-open])) dialog[open]::backdrop {
      animation: moul-modal-backdrop-out 100ms var(--ease-out, ease-out) forwards;
    }

    @keyframes moul-modal-in {
      from {
        opacity: 0;
        transform: scale(var(--_enter-scale, 1.05));
      }
    }

    @keyframes moul-modal-out {
      to {
        opacity: 0;
        transform: scale(0.95);
      }
    }

    @keyframes moul-modal-backdrop-out {
      to {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog[open] [part~="base"],
      :host(:not([is-open])) dialog[open] [part~="base"],
      :host(:not([is-open])) dialog[open]::backdrop {
        animation: none;
      }
    }
  `,Zs];W(`moul-modal`,class extends U{static styles=Cp;static properties={isOpen:{type:Boolean,reflect:!0,attribute:`is-open`},size:{type:String,reflect:!0},isDismissable:{type:Boolean,reflect:!0,attribute:`is-dismissable`}};overlayPresence;previousActiveElement=null;constructor(){super(),this.isOpen=!1,this.size=`md`,this.isDismissable=!0,this.overlayPresence=new Xs(this,{preset:`modal`,dialog:()=>this.dialogEl})}get dialogEl(){return this.shadowRoot?.querySelector(`dialog`)??null}get contentEl(){return this.shadowRoot?.querySelector(`[part="base"]`)??null}get isMounted(){return this.overlayPresence.isMounted}connectedCallback(){super.connectedCallback(),Td(this,`moul-modal`),this.addEventListener(`keydown`,this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.handleKeyDown)}updated(e){super.updated(e),e.has(`isOpen`)&&this.isOpen!==this.overlayPresence.isOpen&&(this.isOpen?this.openModal():this.closeModal())}async setOpen(e){this.isOpen===e&&this.overlayPresence.isOpen===e||(this.isOpen=e,this.dispatchEvent(new CustomEvent(`openchange`,{bubbles:!0,composed:!0,detail:{isOpen:this.isOpen}})),e?await this.openModal():await this.closeModal())}async openModal(){this.previousActiveElement=document.activeElement,await this.overlayPresence.setOpen(!0);let e=this.dialogEl;e&&zs(this.contentEl??e)}async closeModal(){await this.overlayPresence.setOpen(!1),Us(this.previousActiveElement)}handleKeyDown=e=>{if(this.isOpen){if(e.key===`Escape`){e.preventDefault(),e.stopPropagation(),this.setOpen(!1);return}e.key===`Tab`&&Bs(this.dialogEl??this,e)}};handleDialogClick=e=>{if(!this.isDismissable)return;let t=this.contentEl;if(!t)return;let n=t.getBoundingClientRect();e.clientX>=n.left&&e.clientX<=n.right&&e.clientY>=n.top&&e.clientY<=n.bottom||this.setOpen(!1)};render(){return B`
      <dialog
        part="dialog"
        class="dialog"
        @click=${this.handleDialogClick}
      >
        <div part="base" class="modal-card">
          <div part="header">
            <slot name="header"></slot>
          </div>
          <div part="body">
            <slot></slot>
          </div>
          <div part="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </dialog>
    `}});var wp=[J,M`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    /* Flex drops template whitespace so the required mark sits tight to the text */
    [part~='label'] {
      display: flex;
      align-items: baseline;
      width: fit-content;
      line-height: var(--line-height-sm, 1.25rem);
    }

    :host([is-required][label]:not([label=''])) [part~='label']::after {
      content: '*';
      margin-inline-start: 0.125rem;
      color: var(--color-danger);
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='label'] {
      color: var(--color-danger);
    }

    /* Stretch so the stepper column fills the shell; overflow clips it to the radius */
    [part~='input-container'] {
      display: flex;
      align-items: stretch;
      position: relative;
      width: 100%;
      min-height: 2.25rem;
      overflow: hidden;
      font-size: var(--font-size-sm, 0.875rem);
    }

    [part~='input'] {
      flex: 1;
      width: 100%;
      min-width: 0;
      border: none;
      border-radius: 0;
      outline: none;
      background: transparent;
      box-shadow: none;
      color: inherit;
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-variant-numeric: tabular-nums;
      padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
    }

    [part~='input']:-webkit-autofill {
      box-shadow: 0 0 0 1000px transparent inset;
      -webkit-text-fill-color: var(--color-field-fg);
      caret-color: var(--color-field-fg);
      transition: background-color 9999s ease-in-out 0s;
    }

    [part~='prefix'],
    [part~='suffix'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Steppers: a flush column split by hairlines in the placeholder tint */
    [part~='stepper-group'] {
      display: flex;
      flex-direction: column;
      width: 2rem;
      flex-shrink: 0;
      border-inline-start: 1px solid
        color-mix(in oklab, var(--color-field-placeholder) 15%, transparent);
    }

    [part~='stepper-btn'] {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 0;
      border: none;
      border-radius: 0;
      background: transparent;
      color: var(--color-field-fg);
      cursor: pointer;
      padding: 0;
      font-size: 0.5625rem;
      line-height: 1;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      transition:
        background-color var(--duration-fast, 150ms) var(--ease-smooth, ease),
        color var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    [part~='stepper-btn-up'] {
      border-bottom: 1px solid
        color-mix(in oklab, var(--color-field-placeholder) 15%, transparent);
    }

    @media (hover: hover) {
      [part~='stepper-btn']:hover:not(:disabled) {
        background-color: color-mix(in oklab, var(--color-field-fg) 5%, transparent);
      }
    }

    [part~='stepper-btn']:active:not(:disabled) {
      background-color: color-mix(in oklab, var(--color-field-fg) 10%, transparent);
    }

    [part~='stepper-btn']:disabled {
      cursor: not-allowed;
      opacity: var(--disabled-opacity, 0.5);
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* The host already dims; don't dim the steppers a second time */
    :host([is-disabled]) [part~='stepper-btn']:disabled {
      opacity: 1;
    }

    /* :host raises specificity past the shared shell's transition */
    @media (prefers-reduced-motion: reduce) {
      :host [part~='input-container'],
      [part~='stepper-btn'] {
        transition: none;
      }
    }
  `,Vd];W(`moul-number-field`,class extends U{static styles=wp;static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:Number,attribute:`value`},min:{type:Number,reflect:!0},max:{type:Number,reflect:!0},step:{type:Number,reflect:!0},placeholder:{type:String,reflect:!0},label:{type:String,reflect:!0},description:{type:String,reflect:!0},errorMessage:{type:String,reflect:!0,attribute:`error-message`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},isReadonly:{type:Boolean,reflect:!0,attribute:`is-readonly`}};internalsController;constructor(){super(),this.name=``,this.value=null,this.step=1,this.placeholder=``,this.label=``,this.description=``,this.errorMessage=``,this.isDisabled=!1,this.isRequired=!1,this.isReadonly=!1,this.internalsController=new Rd(this)}get inputElement(){return this.renderRoot?.querySelector(`input`)??null}focus(e){this.inputElement?.focus(e)}blur(){this.inputElement?.blur()}select(){this.inputElement?.select()}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}stepUp(){if(this.isDisabled||this.isReadonly)return;let e=(typeof this.value==`number`&&!isNaN(this.value)?this.value:this.min??0)+(this.step||1);this.max!==void 0&&e>this.max&&(e=this.max),this.min!==void 0&&e<this.min&&(e=this.min),this.value=e,this.syncFormValueAndValidity(),this.dispatchEvents()}stepDown(){if(this.isDisabled||this.isReadonly)return;let e=(typeof this.value==`number`&&!isNaN(this.value)?this.value:this.min??0)-(this.step||1);this.min!==void 0&&e<this.min&&(e=this.min),this.max!==void 0&&e>this.max&&(e=this.max),this.value=e,this.syncFormValueAndValidity(),this.dispatchEvents()}willUpdate(e){super.willUpdate(e),(e.has(`value`)||e.has(`isRequired`)||e.has(`min`)||e.has(`max`)||e.has(`errorMessage`))&&this.syncFormValueAndValidity()}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.querySelector(`[slot="label"]`));if(Td(this,`number field`,t),e.has(`errorMessage`)&&this.errorMessage){let e=this.renderRoot?.querySelector(`[part="error"]`);e&&q(e,{transform:[`translateY(-4px)`,`translateY(0px)`],opacity:[0,1]},{duration:.2,ease:Ss})}}syncFormValueAndValidity(){let e=this.value!==null&&!isNaN(this.value)?String(this.value):``;if(this.internalsController.setValue(e||null),this.isRequired&&(this.value===null||isNaN(this.value))){let e=this.errorMessage||`This field is required.`;this.internalsController.setValidity({valueMissing:!0},e),this.setAttribute(`is-invalid`,``)}else this.min!==void 0&&this.value!==null&&this.value<this.min?(this.internalsController.setValidity({rangeUnderflow:!0},`Value must be greater than or equal to ${this.min}.`),this.setAttribute(`is-invalid`,``)):this.max!==void 0&&this.value!==null&&this.value>this.max?(this.internalsController.setValidity({rangeOverflow:!0},`Value must be less than or equal to ${this.max}.`),this.setAttribute(`is-invalid`,``)):(this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`))}dispatchEvents(){this.dispatchEvent(new Event(`input`,{bubbles:!0,composed:!0})),this.dispatchEvent(new Event(`change`,{bubbles:!0,composed:!0}))}handleInput=e=>{let t=e.target.value.trim();if(t===``)this.value=null;else{let e=parseFloat(t);this.value=isNaN(e)?null:e}this.syncFormValueAndValidity(),this.dispatchEvent(new Event(`input`,{bubbles:!0,composed:!0}))};handleChange=e=>{this.dispatchEvent(new Event(`change`,{bubbles:!0,composed:!0}))};handleKeyDown=e=>{this.isDisabled||this.isReadonly||(e.key===`ArrowUp`?(e.preventDefault(),this.stepUp()):e.key===`ArrowDown`?(e.preventDefault(),this.stepDown()):e.key===`Home`&&this.min!==void 0?(e.preventDefault(),this.value=this.min,this.syncFormValueAndValidity(),this.dispatchEvents()):e.key===`End`&&this.max!==void 0&&(e.preventDefault(),this.value=this.max,this.syncFormValueAndValidity(),this.dispatchEvents()))};reset(){let e=this.defaultValue;this.value=typeof e==`number`?e:typeof this.min==`number`&&this.min>0?this.min:0,this.syncFormValueAndValidity()}render(){let e=this.hasAttribute(`is-invalid`),t=this.value!==null&&!isNaN(this.value)?String(this.value):``;return B`
      <div part="base">
        <label part="label" for="input">
          <slot name="label">${this.label}</slot>
        </label>

        <div
          part="input-container"
          ?data-invalid=${e}
          ?data-disabled=${this.isDisabled}
        >
          <span part="prefix"><slot name="prefix"></slot></span>
          <input
            id="input"
            part="input"
            type="text"
            inputmode="numeric"
            role="spinbutton"
            placeholder=${this.placeholder}
            .value=${t}
            ?disabled=${this.isDisabled}
            ?required=${this.isRequired}
            ?readonly=${this.isReadonly}
            aria-valuenow=${this.value===null?void 0:this.value}
            aria-valuemin=${this.min===void 0?void 0:this.min}
            aria-valuemax=${this.max===void 0?void 0:this.max}
            aria-invalid=${e?`true`:`false`}
            @input=${this.handleInput}
            @change=${this.handleChange}
            @keydown=${this.handleKeyDown}
          />
          <span part="suffix"><slot name="suffix"></slot></span>

          <div part="stepper-group">
            <button
              type="button"
              part="stepper-btn stepper-btn-up"
              aria-label="Increase value"
              tabindex="-1"
              ?disabled=${this.isDisabled||this.isReadonly}
              @click=${()=>this.stepUp()}
            >
              ▲
            </button>
            <button
              type="button"
              part="stepper-btn stepper-btn-down"
              aria-label="Decrease value"
              tabindex="-1"
              ?disabled=${this.isDisabled||this.isReadonly}
              @click=${()=>this.stepDown()}
            >
              ▼
            </button>
          </div>
        </div>

        ${this.description?B`<div id="description" part="description"><slot name="description">${this.description}</slot></div>`:B`<slot name="description"></slot>`}
        ${this.errorMessage?B`<div id="error" part="error"><slot name="error">${this.errorMessage}</slot></div>`:B`<slot name="error"></slot>`}
      </div>
    `}});var Tp=[J,M`
    :host {
      display: inline-flex;
      align-items: center;
    }

    [part~="base"] {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1, 0.25rem);
      list-style: none;
      padding: 0;
      margin: 0;
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
    }

    /* Ghost buttons; the current page gets the neutral fill of a tertiary button */
    [part~="button"],
    [part~="page"] {
      --_bg: transparent;
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      height: 2rem;
      padding: 0 var(--spacing-1, 0.25rem);
      border: none;
      border-radius: var(--radius-3xl, 1.5rem);
      background-color: var(--_bg);
      color: var(--color-default-fg);
      font-family: inherit;
      font-size: inherit;
      font-weight: var(--font-weight-medium, 500);
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      transform-origin: center;
      transition:
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        box-shadow 100ms var(--ease-out, ease-out);
    }

    [part~="page"][aria-current="page"] {
      --_bg: var(--color-default);
    }

    @media (hover: hover) {
      [part~="button"]:hover:not(:disabled),
      [part~="page"]:hover:not(:disabled) {
        background-color: var(--color-default-hover);
      }
    }

    [part~="button"]:active:not(:disabled),
    [part~="page"]:active:not(:disabled) {
      background-color: var(--color-default-hover);
      transform: scale(var(--press-scale, 0.97));
    }

    :host([shape="rounded"]) [part~="button"],
    :host([shape="rounded"]) [part~="page"] {
      border-radius: var(--radius-3xl, 1.5rem);
    }

    :host([shape="square"]) [part~="button"],
    :host([shape="square"]) [part~="page"] {
      border-radius: var(--radius-none, 0);
    }

    :host([shape="pill"]) [part~="button"],
    :host([shape="pill"]) [part~="page"] {
      border-radius: var(--radius-full, 9999px);
    }

    [part~="button"]:focus-visible,
    [part~="page"]:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    [part~="button"]:disabled,
    [part~="button"][aria-disabled="true"] {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    [part~="ellipsis"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2rem;
      height: 2rem;
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--color-muted);
      user-select: none;
    }

    .icon {
      display: inline-flex;
      width: 1rem;
      height: 1rem;
    }

    .icon:dir(rtl) {
      rotate: 180deg;
    }

    .icon svg {
      width: 100%;
      height: 100%;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~="button"],
      [part~="page"] {
        transition: none;
      }

      [part~="button"]:active:not(:disabled),
      [part~="page"]:active:not(:disabled) {
        transform: none;
      }
    }
  `];function Ep(e,t,n){let r=1,i=1,a=1;if(typeof e==`object`&&e?(r=e.currentPage??e.page??1,i=e.totalPages,a=e.siblingCount??1):(r=Number(e)||1,i=Number(t)||1,a=typeof n==`number`?n:1),i<=0||i===1)return[1];let o=Math.max(1,Math.min(r,i)),s=a*2+5;if(i<=s)return Array.from({length:i},(e,t)=>t+1);let c=Math.max(o-a,1),l=Math.min(o+a,i),u=c>2,d=l<i-1;return!u&&d?[...Array.from({length:l},(e,t)=>t+1),`...`,i]:u&&!d?[1,`...`,...Array.from({length:i-c+1},(e,t)=>c+t)]:[1,`...`,...Array.from({length:l-c+1},(e,t)=>c+t),`...`,i]}W(`moul-pagination`,class extends U{static styles=Tp;static properties={totalPages:{type:Number,reflect:!0,attribute:`total-pages`},currentPage:{type:Number,reflect:!0,attribute:`current-page`},pageSize:{type:Number,reflect:!0,attribute:`page-size`},shape:{type:String,reflect:!0},siblingCount:{type:Number,reflect:!0,attribute:`sibling-count`}};constructor(){super(),this.totalPages=1,this.currentPage=1,this.pageSize=10,this.shape=`rounded`,this.siblingCount=1}willUpdate(e){if(super.willUpdate(e),e.has(`totalPages`)||e.has(`currentPage`)){let e=Math.max(1,this.totalPages||1),t=Math.max(1,Math.min(this.currentPage||1,e));this.currentPage!==t&&(this.currentPage=t)}}setPage(e){let t=Math.max(1,this.totalPages||1),n=Math.max(1,Math.min(e,t));n!==this.currentPage&&(this.currentPage=n,this.dispatchEvent(new CustomEvent(`pagechange`,{bubbles:!0,composed:!0,detail:{page:n}})))}render(){let e=Ep(this.currentPage,this.totalPages,this.siblingCount),t=this.currentPage<=1,n=this.currentPage>=this.totalPages;return B`
      <nav part="base" aria-label="Pagination">
        <button
          part="button prev"
          aria-label="Previous page"
          ?disabled=${t}
          aria-disabled=${t?`true`:`false`}
          @click=${()=>this.setPage(this.currentPage-1)}
        >
          <span class="icon">${bt()}</span>
        </button>

        ${e.map((e,t)=>{if(typeof e==`number`){let t=e===this.currentPage;return B`
              <button
                key="page-${e}"
                part="page ${t?`page-active`:``}"
                aria-label="Page ${e}"
                aria-current=${t?`page`:H}
                @click=${()=>this.setPage(e)}
              >
                ${e}
              </button>
            `}return B`
            <span key="ellipsis-${t}" part="ellipsis" aria-hidden="true">…</span>
          `})}

        <button
          part="button next"
          aria-label="Next page"
          ?disabled=${n}
          aria-disabled=${n?`true`:`false`}
          @click=${()=>this.setPage(this.currentPage+1)}
        >
          <span class="icon">${xt()}</span>
        </button>
      </nav>
    `}});var Dp=[J,M`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      box-sizing: border-box;
    }

    .bar-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    .bar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg, inherit);
    }

    .bar-label {
      color: var(--color-fg, inherit);
    }

    .bar-value {
      color: var(--color-fg, inherit);
      font-variant-numeric: tabular-nums;
    }

    /* Flat neutral track, solid tone fill, fully rounded */
    .bar-svg {
      display: block;
      width: 100%;
      overflow: hidden;
      border-radius: var(--radius-full, 9999px);
    }

    :host([size="sm"]) .bar-svg {
      height: 0.25rem;
    }

    :host([size="md"]) .bar-svg,
    :host(:not([size])) .bar-svg {
      height: 0.5rem;
    }

    :host([size="lg"]) .bar-svg {
      height: 0.75rem;
    }

    .bar-track {
      fill: var(--color-default);
    }

    .bar-fill {
      fill: var(--bar-color, var(--color-accent));
      transition: width 300ms var(--ease-out, ease-out);
    }

    :host([tone="primary"]) { --bar-color: var(--color-accent); }
    :host([tone="accent"]) { --bar-color: var(--color-chart-2); }
    :host([tone="success"]) { --bar-color: var(--color-success); }
    :host([tone="warning"]) { --bar-color: var(--color-warning); }
    :host([tone="error"]) { --bar-color: var(--color-danger); }

    @media (prefers-reduced-motion: reduce) {
      .bar-fill {
        transition: none;
      }
    }
  `],Op=[J,M`
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2, 0.5rem);
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      box-sizing: border-box;
    }

    .circle-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .circle-svg {
      display: block;
      overflow: visible;
    }

    /* Flat neutral ring, solid tone arc */
    .circle-track {
      fill: var(--color-default);
    }

    .circle-fill {
      fill: var(--circle-color, var(--color-accent));
      transition: fill 300ms var(--ease-out, ease-out);
    }

    .circle-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .circle-value {
      font-size: var(--font-size-md, 1rem);
      line-height: var(--line-height-md, 1.5rem);
      font-weight: var(--font-weight-semibold, 600);
      color: var(--color-fg, inherit);
      font-variant-numeric: tabular-nums;
    }

    .circle-label {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-muted);
      text-align: center;
    }

    :host([tone="primary"]) { --circle-color: var(--color-accent); }
    :host([tone="accent"]) { --circle-color: var(--color-chart-2); }
    :host([tone="success"]) { --circle-color: var(--color-success); }
    :host([tone="warning"]) { --circle-color: var(--color-warning); }
    :host([tone="error"]) { --circle-color: var(--color-danger); }

    @media (prefers-reduced-motion: reduce) {
      .circle-fill {
        transition: none;
      }
    }
  `];W(`moul-percentage-bar`,class extends U{static styles=Dp;static properties={value:{type:Number},size:{type:String,reflect:!0},tone:{type:String,reflect:!0},showLabel:{type:Boolean,attribute:`show-label`},label:{type:String},showValueText:{type:Boolean,attribute:`show-value-text`},color:{type:String},valueFormatter:{attribute:!1}};constructor(){super(),this.value=0,this.size=`md`,this.tone=`primary`,this.showLabel=!0,this.label=``,this.showValueText=!0,this.color=``,this.valueFormatter=void 0}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`progressbar`),this.setAttribute(`aria-valuemin`,`0`),this.setAttribute(`aria-valuemax`,`100`),this.syncAria()}willUpdate(e){if(super.willUpdate(e),e.has(`tone`)){let e=ct(this.tone);this.tone!==e&&(this.tone=e)}e.has(`value`)&&this.syncAria()}syncAria(){let e=Math.max(0,Math.min(100,Number.isFinite(this.value)?this.value:0));this.setAttribute(`aria-valuenow`,String(e)),this.label&&this.setAttribute(`aria-label`,this.label)}render(){let e=Number.isFinite(this.value)?this.value:0,t=Math.max(0,Math.min(100,e)),n=fu().domain([0,100]).range([0,100]).clamp(!0)(t),r=this.valueFormatter?this.valueFormatter(t):`${Math.round(t)}%`;return B`
      <div class="bar-container" style="${this.color?`--bar-color: ${this.color};`:``}" part="container">
        ${this.showLabel||this.showValueText?B`
              <div class="bar-header" part="header">
                ${this.showLabel?B`<span class="bar-label" part="label"><slot name="label">${this.label}</slot></span>`:``}
                ${this.showValueText?B`<span class="bar-value" part="value">${r}</span>`:``}
              </div>
            `:``}

        <svg class="bar-svg" viewBox="0 0 100 10" preserveAspectRatio="none" part="svg" aria-hidden="true">
          <rect class="bar-track" x="0" y="0" width="100" height="10" rx="5" ry="5" />
          <rect class="bar-fill" x="0" y="0" width="${n}" height="10" rx="5" ry="5" />
        </svg>
      </div>
    `}}),W(`moul-percentage-circle`,class extends U{static styles=Op;static properties={value:{type:Number},size:{type:String,converter:{fromAttribute:e=>{if(!e)return`md`;let t=Number(e);return Number.isFinite(t)&&!isNaN(t)?t:e},toAttribute:e=>String(e)}},tone:{type:String,reflect:!0},showLabel:{type:Boolean,attribute:`show-label`},strokeWidth:{type:Number,attribute:`stroke-width`},label:{type:String},showValueText:{type:Boolean,attribute:`show-value-text`},color:{type:String},valueFormatter:{attribute:!1}};constructor(){super(),this.value=0,this.size=`md`,this.tone=`primary`,this.showLabel=!0,this.strokeWidth=8,this.label=``,this.showValueText=!0,this.color=``,this.valueFormatter=void 0}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`progressbar`),this.setAttribute(`aria-valuemin`,`0`),this.setAttribute(`aria-valuemax`,`100`),this.syncAria()}willUpdate(e){if(super.willUpdate(e),e.has(`tone`)){let e=ct(this.tone);this.tone!==e&&(this.tone=e)}e.has(`value`)&&this.syncAria()}syncAria(){let e=Math.max(0,Math.min(100,Number.isFinite(this.value)?this.value:0));this.setAttribute(`aria-valuenow`,String(e)),this.label&&this.setAttribute(`aria-label`,this.label)}resolvePixelSize(){if(typeof this.size==`number`)return this.size;switch(this.size){case`sm`:return 60;case`lg`:return 120;default:return 80}}render(){let e=Number.isFinite(this.value)?this.value:0,t=Math.max(0,Math.min(100,e)),n=this.resolvePixelSize(),r=Math.max(2,Math.min(n/2,this.strokeWidth||8)),i=n/2,a=Math.max(0,i-r),o=Bu().innerRadius(a).outerRadius(i).startAngle(0).endAngle(2*Math.PI),s=Bu().innerRadius(a).outerRadius(i).startAngle(0).endAngle(t/100*2*Math.PI).cornerRadius(r/2),c=o({})||``,l=t>0&&s({})||``,u=this.valueFormatter?this.valueFormatter(t):`${Math.round(t)}%`;return B`
      <div class="circle-wrapper" style="width: ${n}px; height: ${n}px; ${this.color?`--circle-color: ${this.color};`:``}" part="wrapper">
        <svg
          class="circle-svg"
          width="${n}"
          height="${n}"
          viewBox="-${n/2} -${n/2} ${n} ${n}"
          part="svg"
          aria-hidden="true"
        >
          <path class="circle-track" d="${c}" />
          ${l?V`<path class="circle-fill" d="${l}" />`:``}
        </svg>

        <div class="circle-center" part="center">
          <slot>
            ${this.showValueText?B`<span class="circle-value" part="value">${u}</span>`:``}
          </slot>
          ${this.showLabel&&this.label?B`<span class="circle-label" part="label"><slot name="label">${this.label}</slot></span>`:``}
        </div>
      </div>
    `}});var kp=[J,M`
    :host {
      display: inline-block;
      position: relative;
      /* Grow out of the trigger edge */
      --_origin: top center;
    }

    :host([placement="top"]) {
      --_origin: bottom center;
    }

    :host([placement="left"]) {
      --_origin: center right;
    }

    :host([placement="right"]) {
      --_origin: center left;
    }

    [part~="trigger"] {
      display: inline-block;
      anchor-name: --moul-popover-anchor;
    }

    [part~="popover"] {
      margin: 0;
      padding: var(--spacing-4, 1rem);
      background-color: var(--color-bg-elevated);
      border: none;
      border-radius: var(--radius-surface, 1.5rem);
      box-shadow: var(--shadow-overlay);
      color: var(--color-fg);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      outline: none;
      position-anchor: --moul-popover-anchor;
      inset: auto;
      min-width: 8rem;
      max-width: 24rem;
      box-sizing: border-box;
      z-index: var(--z-popover, 1000);
      transform-origin: var(--_origin);
    }

    /* Native popover visibility */
    [part~="popover"]:not(:popover-open):not(.\:popover-open) {
      display: none;
    }

    [part~="popover"]:popover-open,
    [part~="popover"].\:popover-open {
      display: block;
    }

    /* Enter/exit motion (fade + zoom) is driven by OverlayPresenceController on the panel. */
    /* Anchor positioning styles */
    @supports (anchor-name: --test) {
      :host([placement="bottom"]) [part~="popover"] {
        top: anchor(bottom);
        left: anchor(center);
        translate: -50% 0;
        margin-top: var(--_offset, 8px);
      }

      :host([placement="top"]) [part~="popover"] {
        bottom: anchor(top);
        left: anchor(center);
        translate: -50% 0;
        margin-bottom: var(--_offset, 8px);
      }

      :host([placement="left"]) [part~="popover"] {
        right: anchor(left);
        top: anchor(center);
        translate: 0 -50%;
        margin-right: var(--_offset, 8px);
      }

      :host([placement="right"]) [part~="popover"] {
        left: anchor(right);
        top: anchor(center);
        translate: 0 -50%;
        margin-left: var(--_offset, 8px);
      }
    }
  `];W(`moul-popover`,class e extends U{static styles=kp;static properties={isOpen:{type:Boolean,reflect:!0,attribute:`is-open`},trigger:{type:String,reflect:!0},placement:{type:String,reflect:!0},offset:{type:Number,reflect:!0}};overlayPresence;static warnedFallback=!1;previousActiveElement=null;constructor(){super(),this.isOpen=!1,this.trigger=`click`,this.placement=`bottom`,this.offset=8,this.overlayPresence=new Xs(this,{preset:`popover`,popover:()=>this.popoverEl,target:()=>this.popoverEl})}get popoverEl(){return this.shadowRoot?.querySelector(`[part="popover"]`)??null}connectedCallback(){super.connectedCallback(),this.addEventListener(`keydown`,this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.handleKeyDown)}firstUpdated(){let t=this.popoverEl;t&&t.addEventListener(`toggle`,this.handleNativeToggle),!Ls()&&!e.warnedFallback&&(e.warnedFallback=!0,console.warn(`[@moul-dev/ui] Native Popover or Anchor Positioning not supported; applying fallback fixed positioning.`))}updated(e){super.updated(e),e.has(`offset`)&&this.style.setProperty(`--_offset`,`${this.offset}px`),e.has(`isOpen`)&&this.isOpen!==this.overlayPresence.isOpen&&(this.isOpen?this.openPopover():this.closePopover())}handleNativeToggle=e=>{e.newState===`closed`&&this.isOpen&&(this.isOpen=!1,this.dispatchEvent(new CustomEvent(`openchange`,{bubbles:!0,composed:!0,detail:{isOpen:!1}})),Us(this.previousActiveElement))};async setOpen(e){this.isOpen===e&&this.overlayPresence.isOpen===e||(this.isOpen=e,this.dispatchEvent(new CustomEvent(`openchange`,{bubbles:!0,composed:!0,detail:{isOpen:this.isOpen}})),e?await this.openPopover():await this.closePopover())}async openPopover(){this.previousActiveElement=document.activeElement,this.updateFallbackPosition(),await this.overlayPresence.setOpen(!0);let e=this.popoverEl;e&&zs(e)}async closePopover(){await this.overlayPresence.setOpen(!1),Us(this.previousActiveElement)}async toggle(){await this.setOpen(!this.isOpen)}updateFallbackPosition(){if(Ls())return;let e=this.shadowRoot?.querySelector(`[part="trigger"]`),t=this.popoverEl;if(!e||!t)return;let n=e.getBoundingClientRect();switch(t.style.position=`fixed`,this.placement){case`bottom`:t.style.top=`${n.bottom+this.offset}px`,t.style.left=`${n.left+n.width/2}px`,t.style.translate=`-50% 0`;break;case`top`:t.style.bottom=`${window.innerHeight-n.top+this.offset}px`,t.style.left=`${n.left+n.width/2}px`,t.style.translate=`-50% 0`;break;case`left`:t.style.right=`${window.innerWidth-n.left+this.offset}px`,t.style.top=`${n.top+n.height/2}px`,t.style.translate=`0 -50%`;break;case`right`:t.style.left=`${n.right+this.offset}px`,t.style.top=`${n.top+n.height/2}px`,t.style.translate=`0 -50%`}}handleTriggerClick=()=>{this.trigger===`click`&&this.toggle()};handleKeyDown=e=>{if(!this.isOpen){e.key!==`Enter`&&e.key!==` `&&e.key!==`ArrowDown`||e.target!==this&&!this.contains(e.target)||(e.preventDefault(),this.setOpen(!0));return}if(e.key===`Escape`){e.preventDefault(),this.setOpen(!1);return}let t=this.popoverEl;t?.contains(e.target)&&Bs(t,e)};render(){return B`
      <div
        part="trigger"
        class="trigger"
        @click=${this.handleTriggerClick}
      >
        <slot name="trigger"></slot>
      </div>

      <div
        part="popover"
        popover=${this.trigger===`manual`?`manual`:`auto`}
        class="popover"
      >
        <slot></slot>
      </div>
    `}});var Ap=[J,ut,M`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
    }

    /* Tone/variant drive the fill only — never paint the host surface */
    :host,
    :host([variant]) {
      background: none;
      border: none;
      box-shadow: none;
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
      color: var(--color-fg, inherit);
    }

    [part~="header"] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      font-variant-numeric: tabular-nums;
      color: var(--color-fg, inherit);
    }

    /* Flat neutral track, solid tone fill */
    [part~="track"] {
      width: 100%;
      background-color: var(--color-default);
      overflow: hidden;
      position: relative;
    }

    :host([size="sm"]) [part~="track"] {
      height: 0.25rem;
    }

    :host([size="md"]) [part~="track"],
    :host(:not([size])) [part~="track"] {
      height: 0.5rem;
    }

    :host([size="lg"]) [part~="track"] {
      height: 0.75rem;
    }

    :host([shape="square"]) [part~="track"],
    :host([shape="square"]) [part~="fill"] {
      border-radius: var(--radius-none, 0);
    }

    /* Rounded follows the size: 2px / 4px / 6px corners */
    :host([shape="rounded"]) [part~="track"],
    :host([shape="rounded"]) [part~="fill"] {
      border-radius: var(--radius-sm, 0.25rem);
    }

    :host([shape="rounded"][size="sm"]) [part~="track"],
    :host([shape="rounded"][size="sm"]) [part~="fill"] {
      border-radius: var(--radius-xs, 0.125rem);
    }

    :host([shape="rounded"][size="lg"]) [part~="track"],
    :host([shape="rounded"][size="lg"]) [part~="fill"] {
      border-radius: var(--radius-md, 0.375rem);
    }

    :host([shape="pill"]) [part~="track"],
    :host(:not([shape])) [part~="track"],
    :host([shape="pill"]) [part~="fill"],
    :host(:not([shape])) [part~="fill"] {
      border-radius: var(--radius-full, 9999px);
    }

    [part~="fill"] {
      height: 100%;
      width: 0%;
      background-color: var(--_tone-solid-bg, var(--color-accent));
      border-radius: inherit;
      transition: width 300ms var(--ease-out, ease-out);
    }

    :host([is-indeterminate]) [part~="fill"] {
      width: 40%;
      animation: moul-progress-indeterminate 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }

    @keyframes moul-progress-pulse {
      50% {
        opacity: 0.35;
      }
    }

    @keyframes moul-progress-indeterminate {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(350%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [part~="fill"] {
        transition: none;
      }

      /* No sweep, but a slow pulse keeps the bar reading as in progress */
      :host([is-indeterminate]) [part~="fill"] {
        animation: moul-progress-pulse 1.5s var(--ease-smooth, ease) infinite;
        transform: none;
        width: 100%;
        opacity: 0.7;
      }
    }
  `];W(`moul-progress-bar`,class extends U{static styles=Ap;static properties={value:{type:Number,reflect:!0},min:{type:Number,reflect:!0},max:{type:Number,reflect:!0},tone:{type:String,reflect:!0},variant:{type:String,reflect:!0},size:{type:String,reflect:!0},shape:{type:String,reflect:!0},isIndeterminate:{type:Boolean,reflect:!0,attribute:`is-indeterminate`}};constructor(){super(),this.value=0,this.min=0,this.max=100,this.tone=`primary`,this.variant=`solid`,this.size=`md`,this.shape=`pill`,this.isIndeterminate=!1}get clampedValue(){return Math.min(this.max,Math.max(this.min,this.value))}get percentage(){let e=this.max-this.min;return e<=0?0:Math.min(100,Math.max(0,(this.value-this.min)/e*100))}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`progressbar`),this.setAttribute(`aria-valuemin`,String(this.min)),this.setAttribute(`aria-valuemax`,String(this.max)),this.isIndeterminate||this.setAttribute(`aria-valuenow`,String(this.clampedValue))}updated(e){if(super.updated(e),(e.has(`value`)||e.has(`min`)||e.has(`max`)||e.has(`isIndeterminate`))&&(this.setAttribute(`aria-valuemin`,String(this.min)),this.setAttribute(`aria-valuemax`,String(this.max)),this.isIndeterminate?this.removeAttribute(`aria-valuenow`):this.setAttribute(`aria-valuenow`,String(this.clampedValue))),e.has(`tone`)){let e=ct(this.tone);this.tone!==e&&(this.tone=e)}if(e.has(`variant`)){let e=lt(this.variant);this.variant!==e&&(this.variant=e)}}render(){return B`
      <div part="header">
        <slot name="label"></slot>
      </div>
      <div part="track">
        <div
          part="fill"
          style=${this.isIndeterminate?``:`width: ${this.percentage}%;`}
        ></div>
      </div>
    `}});var jp=[J,M`
    :host {
      display: inline-flex;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    :host([hidden]) {
      display: none !important;
    }

    :host(:focus-visible) {
      outline: none;
    }

    [part~='base'] {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-3, 0.75rem);
      cursor: pointer;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
    }

    /* A white, borderless field circle that fills with the accent when selected */
    [part~='indicator'] {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1rem;
      height: 1rem;
      border-radius: var(--radius-full, 9999px);
      background-color: var(--color-field);
      box-shadow:
        var(--_control-ring, 0 0 0 0 transparent),
        var(--shadow-field);
      transition:
        background-color 200ms var(--ease-out, ease-out),
        box-shadow 150ms var(--ease-out, ease-out),
        transform 100ms var(--ease-out, ease-out);
    }

    :host([is-checked]) [part~='indicator'] {
      background-color: var(--color-accent);
    }

    :host(:focus-visible) [part~='indicator'] {
      box-shadow:
        var(--focus-ring),
        var(--shadow-field);
    }

    [part~='base']:active:not([data-disabled]) [part~='indicator'] {
      transform: scale(0.95);
    }

    :host([is-checked]) [part~='base']:active:not([data-disabled]) [part~='indicator'] {
      background-color: var(--color-accent-hover);
    }

    /* A clear disc fills the control (leaving the field hairline visible), then
       turns accent-fg and shrinks to a 6px pip when selected */
    [part~='dot'] {
      width: 100%;
      height: 100%;
      border-radius: var(--radius-full, 9999px);
      background-color: transparent;
      scale: 1;
      transition:
        scale 200ms var(--ease-out, ease-out),
        background-color 200ms var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      :host(:not([is-checked])) [part~='base']:hover:not([data-disabled]) [part~='dot'] {
        background-color: var(--color-field-hover);
      }
    }

    :host([is-checked]) [part~='dot'] {
      background-color: var(--color-accent-fg);
      scale: 0.4286;
    }

    :host([is-checked]) [part~='base']:active:not([data-disabled]) [part~='dot'] {
      scale: 0.5714;
    }

    [part~='label'] {
      display: inline-flex;
      align-items: center;
      color: inherit;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~='indicator'],
      [part~='dot'] {
        transition: none;
      }

      [part~='base']:active:not([data-disabled]) [part~='indicator'] {
        transform: none;
      }
    }
  `],Mp=[J,M`
    :host {
      display: block;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
    }

    :host([hidden]) {
      display: none !important;
    }

    /* Inherited by the slotted radios, which outline their circles in danger */
    :host([is-invalid][data-touched]) {
      --_control-ring: 0 0 0 1px var(--color-danger);
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
    }

    [part~='label'] {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg, inherit);
    }

    :host([is-invalid][data-touched]) [part~='label'] {
      color: var(--color-danger);
    }

    [part~='description'] {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted);
    }

    [part~='group'] {
      display: flex;
      gap: var(--spacing-4, 1rem);
    }

    [part~='label'] ~ [part~='group'],
    [part~='description'] ~ [part~='group'] {
      margin-top: var(--spacing-3, 0.75rem);
    }

    :host([orientation='vertical']) [part~='group'] {
      flex-direction: column;
    }

    :host([orientation='horizontal']) [part~='group'] {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }

    /* Each radio dims itself; only the group's own text needs it here */
    :host([is-disabled]) {
      cursor: not-allowed;
    }

    :host([is-disabled]) [part~='label'],
    :host([is-disabled]) [part~='description'] {
      opacity: var(--disabled-opacity, 0.5);
    }
  `];W(`moul-radio`,class extends U{static styles=jp;static properties={value:{type:String,reflect:!0},isChecked:{type:Boolean,reflect:!0,attribute:`is-checked`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`}};constructor(){super(),this.value=``,this.isChecked=!1,this.isDisabled=!1}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`radio`),this.setAttribute(`tabindex`,this.isChecked?`0`:`-1`),this.addEventListener(`click`,this.handleClick)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`click`,this.handleClick)}willUpdate(e){super.willUpdate(e),(e.has(`isChecked`)||e.has(`isDisabled`))&&(this.setAttribute(`tabindex`,this.isChecked&&!this.isDisabled?`0`:`-1`),this.setAttribute(`aria-checked`,this.isChecked?`true`:`false`),this.isDisabled?this.setAttribute(`aria-disabled`,`true`):this.removeAttribute(`aria-disabled`))}handleClick=e=>{this.isDisabled||(e.preventDefault(),this.dispatchEvent(new CustomEvent(`radio-select`,{detail:{value:this.value},bubbles:!0,composed:!0})))};render(){return B`
      <div part="base" ?data-disabled=${this.isDisabled}>
        <span part="indicator">
          <span part="dot"></span>
        </span>
        <span part="label">
          <slot></slot>
        </span>
      </div>
    `}}),W(`moul-radio-group`,class extends U{static styles=Mp;static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},label:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},orientation:{type:String,reflect:!0}};internalsController;constructor(){super(),this.name=``,this.value=``,this.label=``,this.isDisabled=!1,this.isRequired=!1,this.orientation=`vertical`,this.internalsController=new Rd(this)}get radios(){return Array.from(this.querySelectorAll(`moul-radio`))}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`radiogroup`),this.addEventListener(`keydown`,this.handleKeyDown),this.addEventListener(`radio-select`,this.handleRadioSelect)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.handleKeyDown),this.removeEventListener(`radio-select`,this.handleRadioSelect)}willUpdate(e){if(super.willUpdate(e),(e.has(`value`)||e.has(`isRequired`))&&(this.syncFormValueAndValidity(),this.syncRadios()),e.has(`isDisabled`)){if(this.isDisabled)for(let e of this.radios)e.isDisabled=!0;else if(e.get(`isDisabled`)===!0)for(let e of this.radios)e.hasAttribute(`is-disabled`)||(e.isDisabled=!1)}}updated(e){super.updated(e),this.label&&!this.hasAttribute(`aria-label`)&&this.setAttribute(`aria-label`,this.label)}syncRadios(){let e=this.radios,t=e.some(e=>e.value===this.value);e.forEach((e,n)=>{let r=e.value===this.value;e.isChecked=r,this.isDisabled&&(e.isDisabled=!0),t?e.setAttribute(`tabindex`,r&&!e.isDisabled?`0`:`-1`):e.setAttribute(`tabindex`,n===0&&!e.isDisabled?`0`:`-1`)})}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}syncFormValueAndValidity(){this.internalsController.setValue(this.value||null),this.isRequired&&!this.value?(this.internalsController.setValidity({valueMissing:!0},`Please select an option.`),this.setAttribute(`is-invalid`,``)):(this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`))}handleSlotChange=()=>{this.syncRadios()};handleRadioSelect=e=>{e.stopPropagation();let t=e.detail.value;this.value!==t&&(this.value=t,this.syncFormValueAndValidity(),this.syncRadios(),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0})))};handleKeyDown=e=>{let t=this.radios.filter(e=>!e.isDisabled);if(t.length===0)return;let n=t.findIndex(e=>e.value===this.value),r=n;if(e.key===`ArrowDown`||e.key===`ArrowRight`)e.preventDefault(),r=n<0?0:(n+1)%t.length;else if(e.key===`ArrowUp`||e.key===`ArrowLeft`)e.preventDefault(),r=n<=0?t.length-1:n-1;else return;let i=t[r];i&&(i.focus(),this.value=i.value,this.syncFormValueAndValidity(),this.syncRadios(),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0})))};render(){return B`
      <div part="base">
        ${this.label?B`<div part="label"><slot name="label">${this.label}</slot></div>`:B`<slot name="label"></slot>`}

        <div part="group" @slotchange=${this.handleSlotChange}>
          <slot></slot>
        </div>
      </div>
    `}});var Np=[J,M`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    /* Flex drops template whitespace so the required mark sits tight to the text */
    [part~='label'] {
      display: flex;
      align-items: baseline;
      width: fit-content;
      line-height: var(--line-height-sm, 1.25rem);
    }

    :host([is-required][label]:not([label=''])) [part~='label']::after {
      content: '*';
      margin-inline-start: 0.125rem;
      color: var(--color-danger);
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='label'] {
      color: var(--color-danger);
    }

    search,
    [part~='search'] {
      display: block;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    [part~='input-container'] {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
      min-height: 2.25rem;
      font-size: var(--font-size-sm, 0.875rem);
    }

    [part~='search-icon'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-field-placeholder);
      width: 1rem;
      height: 1rem;
      margin-inline-start: var(--spacing-3, 0.75rem);
      flex-shrink: 0;
      pointer-events: none;
    }

    [part~='search-icon'] svg {
      width: 100%;
      height: 100%;
    }

    /* The icon sits on the leading edge, so the text tucks in closer to it */
    [part~='input'] {
      flex: 1;
      width: 100%;
      min-width: 0;
      border: none;
      border-radius: 0;
      outline: none;
      background: transparent;
      box-shadow: none;
      color: inherit;
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding-block: var(--spacing-2, 0.5rem);
      padding-inline: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
    }

    [part~='input-container']:has([part~='clear-btn']) [part~='input'] {
      padding-inline-end: var(--spacing-2, 0.5rem);
    }

    [part~='input']::-webkit-search-cancel-button,
    [part~='input']::-webkit-search-decoration,
    [part~='input']::-webkit-search-results-button,
    [part~='input']::-webkit-search-results-decoration {
      display: none;
      -webkit-appearance: none;
    }

    [part~='input']:-webkit-autofill {
      box-shadow: 0 0 0 1000px transparent inset;
      -webkit-text-fill-color: var(--color-field-fg);
      caret-color: var(--color-field-fg);
      transition: background-color 9999s ease-in-out 0s;
    }

    [part~='clear-btn'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: var(--color-muted);
      cursor: pointer;
      padding: 0;
      width: 1.25rem;
      height: 1.25rem;
      margin-inline-end: var(--spacing-2, 0.5rem);
      border-radius: var(--radius-xl, 0.75rem);
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
      transition:
        color var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      [part~='clear-btn']:hover {
        color: var(--color-fg, inherit);
      }
    }

    [part~='clear-btn']:active {
      transform: scale(0.95);
    }

    [part~='clear-btn']:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    [part~='clear-btn'] svg {
      width: 1rem;
      height: 1rem;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* :host raises specificity past the shared shell's transition */
    @media (prefers-reduced-motion: reduce) {
      :host [part~='input-container'],
      [part~='clear-btn'] {
        transition: none;
      }

      [part~='clear-btn']:active {
        transform: none;
      }
    }
  `,Vd];W(`moul-search-field`,class extends U{static styles=Np;static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},placeholder:{type:String,reflect:!0},label:{type:String,reflect:!0},description:{type:String,reflect:!0},errorMessage:{type:String,reflect:!0,attribute:`error-message`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},isReadonly:{type:Boolean,reflect:!0,attribute:`is-readonly`}};internalsController;wasClearVisible=!1;constructor(){super(),this.name=``,this.value=``,this.placeholder=`Search...`,this.label=``,this.description=``,this.errorMessage=``,this.isDisabled=!1,this.isRequired=!1,this.isReadonly=!1,this.internalsController=new Rd(this)}get inputElement(){return this.renderRoot?.querySelector(`input`)??null}focus(e){this.inputElement?.focus(e)}blur(){this.inputElement?.blur()}select(){this.inputElement?.select()}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}clear(){this.isDisabled||this.isReadonly||(this.value=``,this.syncFormValueAndValidity(),this.dispatchEvent(new CustomEvent(`clear`,{bubbles:!0,composed:!0})),this.dispatchEvent(new Event(`input`,{bubbles:!0,composed:!0})),this.dispatchEvent(new Event(`change`,{bubbles:!0,composed:!0})),this.focus())}willUpdate(e){super.willUpdate(e),(e.has(`value`)||e.has(`isRequired`)||e.has(`errorMessage`))&&this.syncFormValueAndValidity()}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.querySelector(`[slot="label"]`));Td(this,`search field`,t);let n=!(!this.value||this.isDisabled||this.isReadonly);if(n&&!this.wasClearVisible){let e=this.renderRoot?.querySelector(`[part="clear-btn"]`);e&&q(e,{transform:[`scale(0.9)`,`scale(1)`],opacity:[0,1]},{duration:.15,ease:Ss})}if(this.wasClearVisible=n,e.has(`errorMessage`)&&this.errorMessage){let e=this.renderRoot?.querySelector(`[part="error"]`);e&&q(e,{transform:[`translateY(-4px)`,`translateY(0px)`],opacity:[0,1]},{duration:.2,ease:Ss})}}syncFormValueAndValidity(){if(this.internalsController.setValue(this.value||null),this.isRequired&&!this.value){let e=this.errorMessage||`This field is required.`;this.internalsController.setValidity({valueMissing:!0},e),this.setAttribute(`is-invalid`,``)}else this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`)}handleInput=e=>{let t=e.target;this.value=t.value,this.syncFormValueAndValidity(),this.dispatchEvent(new Event(`input`,{bubbles:!0,composed:!0}))};handleChange=e=>{this.dispatchEvent(new Event(`change`,{bubbles:!0,composed:!0}))};handleKeyDown=e=>{e.key===`Enter`?this.dispatchEvent(new CustomEvent(`submit`,{detail:{value:this.value},bubbles:!0,composed:!0})):e.key===`Escape`&&this.value&&(e.preventDefault(),this.clear())};render(){let e=this.hasAttribute(`is-invalid`),t=!(!this.value||this.isDisabled||this.isReadonly),n=[this.description?`description`:``,this.errorMessage?`error`:``].filter(Boolean).join(` `);return B`
      <div part="base">
        <label part="label" for="input">
          <slot name="label">${this.label}</slot>
        </label>

        <search part="search" role="search">
          <div
            part="input-container"
            ?data-invalid=${e}
            ?data-disabled=${this.isDisabled}
          >
            <span part="search-icon">${pt()}</span>

            <input
              id="input"
              part="input"
              type="search"
              placeholder=${this.placeholder}
              .value=${this.value}
              ?disabled=${this.isDisabled}
              ?required=${this.isRequired}
              ?readonly=${this.isReadonly}
              aria-invalid=${e?`true`:`false`}
              aria-describedby=${n||H}
              @input=${this.handleInput}
              @change=${this.handleChange}
              @keydown=${this.handleKeyDown}
            />

            ${t?B`
                  <button
                    type="button"
                    part="clear-btn"
                    aria-label="Clear search"
                    tabindex="-1"
                    @click=${this.clear}
                  >
                    ${mt()}
                  </button>
                `:``}
          </div>
        </search>

        ${this.description?B`<div id="description" part="description"><slot name="description">${this.description}</slot></div>`:B`<slot name="description"></slot>`}
        ${this.errorMessage?B`<div id="error" part="error"><slot name="error">${this.errorMessage}</slot></div>`:B`<slot name="error"></slot>`}
      </div>
    `}});var Pp=[J,M`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      position: relative;
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    /* Flex drops template whitespace so the required mark sits tight to the text */
    [part~='label'] {
      display: flex;
      align-items: baseline;
      width: fit-content;
      line-height: var(--line-height-sm, 1.25rem);
    }

    :host([is-required][label]:not([label=''])) [part~='label']::after {
      content: '*';
      margin-inline-start: 0.125rem;
      color: var(--color-danger);
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='label'] {
      color: var(--color-danger);
    }

    /* The chevron rides in the flow, so the end padding is shorter than the start */
    [part~='trigger'] {
      display: flex;
      align-items: center;
      width: 100%;
      min-width: 0;
      min-height: 2.25rem;
      margin: 0;
      padding-block: var(--spacing-2, 0.5rem);
      padding-inline: var(--spacing-3, 0.75rem) var(--spacing-2, 0.5rem);
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      text-align: start;
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    [part~='value'] {
      flex: 1;
      min-width: 0;
      text-align: start;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    [part~='value'][data-placeholder] {
      color: var(--color-field-placeholder);
    }

    [part~='chevron'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-field-placeholder);
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
      margin-inline-start: var(--spacing-1, 0.25rem);
      transition: transform var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    [part~='chevron'] svg {
      width: 100%;
      height: 100%;
    }

    :host([is-open]) [part~='chevron'] {
      transform: rotate(180deg);
    }

    /* Listbox panel: a solid overlay surface; geometry is set by the overlay
       controller against the trigger */
    [part~='popover'] {
      margin: 0;
      border: none;
      border-radius: var(--radius-surface, 1.5rem);
      background-color: var(--color-bg-elevated);
      box-shadow: var(--shadow-overlay);
      color: var(--color-fg);
      font-size: var(--font-size-sm, 0.875rem);
      z-index: var(--z-dropdown, 1000);
      outline: none;
      min-width: 8rem;
      max-height: 16rem;
      overflow-y: auto;
      overscroll-behavior: contain;
      scroll-padding-block: var(--spacing-1, 0.25rem);
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
      padding: 0.375rem;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
    }

    [part~='popover'][hidden] {
      display: none !important;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* :host raises specificity past the shared shell's transition */
    @media (prefers-reduced-motion: reduce) {
      :host [part~='trigger'],
      [part~='chevron'] {
        transition: none;
      }
    }
  `,Vd],Fp=[J,M`
    :host {
      display: block;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      user-select: none;
      -webkit-user-select: none;
      outline: none;
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='item'] {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3, 0.75rem);
      min-height: 2.25rem;
      width: 100%;
      padding: 0.375rem 0.625rem;
      border-radius: var(--radius-2xl, 1rem);
      cursor: pointer;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      -webkit-tap-highlight-color: transparent;
      transition:
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        box-shadow var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      [part~='item']:hover:not([data-disabled]) {
        background-color: var(--color-default);
      }
    }

    :host([is-active]) [part~='item'] {
      background-color: var(--color-default);
    }

    :host(:focus-visible) [part~='item'] {
      box-shadow: var(--focus-ring);
    }

    [part~='item']:active:not([data-disabled]) {
      transform: scale(0.98);
    }

    [part~='check'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--color-default-fg);
      width: 0.875rem;
      height: 0.875rem;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~='item'] {
        transition: none;
      }

      [part~='item']:active:not([data-disabled]) {
        transform: none;
      }
    }
  `];W(`moul-select`,class extends U{static styles=Pp;static formAssociated=!0;static properties={name:{type:String,reflect:!0},selectedKey:{type:String,reflect:!0,attribute:`selected-key`},placeholder:{type:String,reflect:!0},label:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},isOpen:{type:Boolean,reflect:!0,attribute:`is-open`}};internalsController;overlayController;activeItemIndex=-1;constructor(){super(),this.name=``,this.selectedKey=``,this.placeholder=`Select an option`,this.label=``,this.isDisabled=!1,this.isRequired=!1,this.isOpen=!1,this.internalsController=new Rd(this),this.overlayController=new Xs(this,{preset:`popover`,popover:()=>this.popoverElement,target:()=>this.popoverElement,onLightDismiss:()=>this.close(),anchor:()=>this.renderRoot?.querySelector(`[part="trigger"]`)??null})}connectedCallback(){super.connectedCallback(),this.addEventListener(`select-item-click`,this.handleItemClick)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`select-item-click`,this.handleItemClick)}get triggerButton(){return this.renderRoot?.querySelector(`[part="trigger"]`)??null}get popoverElement(){return this.renderRoot?.querySelector(`[part="popover"]`)??null}get items(){return Array.from(this.querySelectorAll(`moul-select-item`))}focus(e){this.triggerButton?.focus(e)}blur(){this.triggerButton?.blur()}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}open(){this.isDisabled||this.isOpen||this.overlayController.wasJustDismissed||(this.isOpen=!0,this.overlayController.setOpen(!0),this.syncActiveItem())}close(){this.isOpen&&(this.isOpen=!1,this.overlayController.setOpen(!1))}toggle(){this.isOpen?this.close():this.open()}willUpdate(e){super.willUpdate(e),(e.has(`selectedKey`)||e.has(`isRequired`))&&(this.syncFormValueAndValidity(),this.syncSelectedItems()),e.has(`isOpen`)&&(this.isOpen?this.overlayController.setOpen(!0):this.overlayController.setOpen(!1))}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.querySelector(`[slot="label"]`));Td(this,`select`,t)}syncFormValueAndValidity(){this.internalsController.setValue(this.selectedKey||null),this.isRequired&&!this.selectedKey?(this.internalsController.setValidity({valueMissing:!0},`Please select an option.`),this.setAttribute(`is-invalid`,``)):(this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`))}syncSelectedItems(){for(let e of this.items){let t=e.key===this.selectedKey;e.setAttribute(`aria-selected`,t?`true`:`false`)}this.requestUpdate()}syncActiveItem(){let e=this.items.filter(e=>!e.isDisabled).findIndex(e=>e.key===this.selectedKey);this.activeItemIndex=e>=0?e:0}get selectedText(){let e=this.items.find(e=>e.key===this.selectedKey);return e?e.value||e.textContent?.trim()||e.key:``}handleTriggerClick=e=>{e.preventDefault(),this.toggle()};handleKeyDown=e=>{if(this.isDisabled)return;if(!this.isOpen){(e.key===`ArrowDown`||e.key===`ArrowUp`||e.key===` `||e.key===`Enter`)&&(e.preventDefault(),this.open());return}let t=this.items.filter(e=>!e.isDisabled);if(t.length!==0){if(e.key===`ArrowDown`)e.preventDefault(),this.activeItemIndex=(this.activeItemIndex+1)%t.length,t[this.activeItemIndex]?.focus();else if(e.key===`ArrowUp`)e.preventDefault(),this.activeItemIndex=this.activeItemIndex<=0?t.length-1:this.activeItemIndex-1,t[this.activeItemIndex]?.focus();else if(e.key===`Enter`||e.key===` `){e.preventDefault();let n=t[this.activeItemIndex];n&&this.selectItem(n.key,n.value||n.textContent?.trim()||n.key)}else e.key===`Escape`&&(e.preventDefault(),this.close(),this.focus())}};selectItem(e,t){this.selectedKey=e,this.syncFormValueAndValidity(),this.syncSelectedItems(),this.close(),this.focus(),this.dispatchEvent(new CustomEvent(`selectionchange`,{detail:{selectedKey:this.selectedKey},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:t||this.selectedKey},bubbles:!0,composed:!0}))}handleItemClick=e=>{e.stopPropagation(),this.selectItem(e.detail.key,e.detail.value)};render(){let e=this.hasAttribute(`is-invalid`),t=this.selectedText||this.placeholder,n=!this.selectedText;return B`
      <div part="base" @keydown=${this.handleKeyDown}>
        ${this.label?B`<label part="label"><slot name="label">${this.label}</slot></label>`:B`<slot name="label"></slot>`}

        <button
          type="button"
          part="trigger"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded=${this.isOpen?`true`:`false`}
          aria-label=${this.label||this.placeholder}
          ?disabled=${this.isDisabled}
          ?data-invalid=${e}
          @click=${this.handleTriggerClick}
        >
          <span part="value" ?data-placeholder=${n}>${t}</span>
          <span part="chevron">${ft()}</span>
        </button>

        <div
          part="popover"
          popover="auto"
          role="listbox"
          tabindex="-1"
          ?hidden=${!this.overlayController.isMounted}
          @select-item-click=${this.handleItemClick}
        >
          <slot @slotchange=${this.syncSelectedItems}></slot>
        </div>
      </div>
    `}}),W(`moul-select-item`,class extends U{static styles=Fp;static properties={key:{type:String,reflect:!0},value:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`}};constructor(){super(),this.key=``,this.value=``,this.isDisabled=!1}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`option`),this.setAttribute(`tabindex`,`-1`),this.addEventListener(`click`,this.handleClick)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`click`,this.handleClick)}willUpdate(e){super.willUpdate(e),e.has(`isDisabled`)&&(this.isDisabled?this.setAttribute(`aria-disabled`,`true`):this.removeAttribute(`aria-disabled`))}handleClick=e=>{this.isDisabled||(e.preventDefault(),this.dispatchEvent(new CustomEvent(`select-item-click`,{detail:{key:this.key,value:this.value||this.textContent?.trim()||this.key},bubbles:!0,composed:!0})))};render(){let e=this.getAttribute(`aria-selected`)===`true`;return B`
      <div part="item" ?data-disabled=${this.isDisabled}>
        <slot>${this.value||this.key}</slot>
        ${e?V`
              <span part="check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="width: 100%; height: 100%;">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            `:``}
      </div>
    `}});var Ip=[J,M`
    :host {
      display: block;
      flex-shrink: 0;
    }

    :host([orientation="vertical"]) {
      display: inline-block;
      height: 100%;
      align-self: stretch;
    }

    [part~="separator"] {
      flex-shrink: 0;
      border: none;
      margin: 0;
      border-radius: var(--radius-sm, 0.25rem);
      background-color: var(--color-separator);
      box-sizing: border-box;
    }

    :host([orientation="horizontal"]) [part~="separator"],
    :host(:not([orientation])) [part~="separator"] {
      width: 100%;
      height: 1px;
    }

    :host([orientation="vertical"]) [part~="separator"] {
      width: 1px;
      height: 100%;
      min-height: 0.5rem;
    }
  `];W(`moul-separator`,class extends U{static styles=Ip;static properties={orientation:{type:String,reflect:!0}};constructor(){super(),this.orientation=`horizontal`}render(){return B`
      <hr
        part="separator"
        role="separator"
        aria-orientation=${this.orientation}
      />
    `}});var Lp=class extends Event{constructor(e,t,n,r){super(`context-request`,{bubbles:!0,composed:!0}),this.context=e,this.contextTarget=t,this.callback=n,this.subscribe=r??!1}};function Rp(e){return e}var zp=class{constructor(e,t,n,r){if(this.subscribe=!1,this.provided=!1,this.value=void 0,this.t=(e,t)=>{this.unsubscribe&&(this.unsubscribe!==t&&(this.provided=!1,this.unsubscribe()),this.subscribe||this.unsubscribe()),this.value=e,this.host.requestUpdate(),this.provided&&!this.subscribe||(this.provided=!0,this.callback&&this.callback(e,t)),this.unsubscribe=t},this.host=e,t.context!==void 0){let e=t;this.context=e.context,this.callback=e.callback,this.subscribe=e.subscribe??!1}else this.context=t,this.callback=n,this.subscribe=r??!1;this.host.addController(this)}hostConnected(){this.dispatchRequest()}hostDisconnected(){this.unsubscribe&&=(this.unsubscribe(),void 0)}dispatchRequest(){this.host.dispatchEvent(new Lp(this.context,this.host,this.t,this.subscribe))}},Bp=class{get value(){return this.o}set value(e){this.setValue(e)}setValue(e,t=!1){let n=t||!Object.is(e,this.o);this.o=e,n&&this.updateObservers()}constructor(e){this.subscriptions=new Map,this.updateObservers=()=>{for(let[e,{disposer:t}]of this.subscriptions)e(this.o,t)},e!==void 0&&(this.value=e)}addCallback(e,t,n){if(!n)return void e(this.value);this.subscriptions.has(e)||this.subscriptions.set(e,{disposer:()=>{this.subscriptions.delete(e)},consumerHost:t});let{disposer:r}=this.subscriptions.get(e);e(this.value,r)}clearCallbacks(){this.subscriptions.clear()}},Vp=class extends Event{constructor(e,t){super(`context-provider`,{bubbles:!0,composed:!0}),this.context=e,this.contextTarget=t}},Hp=class extends Bp{constructor(e,t,n){super(t.context===void 0?n:t.initialValue),this.onContextRequest=e=>{if(e.context!==this.context)return;let t=e.contextTarget??e.composedPath()[0];t!==this.host&&(e.stopPropagation(),this.addCallback(e.callback,t,e.subscribe))},this.onProviderRequest=e=>{if(e.context!==this.context||(e.contextTarget??e.composedPath()[0])===this.host)return;let t=new Set;for(let[e,{consumerHost:n}]of this.subscriptions)t.has(e)||(t.add(e),n.dispatchEvent(new Lp(this.context,n,e,!0)));e.stopPropagation()},this.host=e,this.context=t.context===void 0?t:t.context,this.attachListeners(),this.host.addController?.(this)}attachListeners(){this.host.addEventListener(`context-request`,this.onContextRequest),this.host.addEventListener(`context-provider`,this.onProviderRequest)}hostConnected(){this.host.dispatchEvent(new Vp(this.context,this.host))}},Up=[J,M`
    :host {
      display: inline-block;
      position: relative;
      /* Grow out of the trigger edge, nudged 4px toward it (default: top) */
      --_origin: bottom center;
    }

    :host([placement="bottom"]) {
      --_origin: top center;
    }

    :host([placement="left"]) {
      --_origin: center right;
    }

    :host([placement="right"]) {
      --_origin: center left;
    }

    [part~="trigger"] {
      display: inline-block;
      anchor-name: --moul-tooltip-anchor;
    }

    /* A light floating label: elevated fill and overlay shadow, not an inverted bubble */
    [part~="popover"],
    [part~="tooltip"] {
      margin: 0;
      padding: var(--spacing-2, 0.5rem);
      background-color: var(--color-bg-elevated);
      color: var(--color-fg);
      border: none;
      border-radius: min(2rem, var(--radius-xl, 0.75rem));
      box-shadow: var(--shadow-overlay);
      font-family: inherit;
      font-weight: var(--font-weight-normal, 400);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      z-index: var(--z-tooltip, 1500);
      pointer-events: none;
      position-anchor: --moul-tooltip-anchor;
      inset: auto;
      max-width: 20rem;
      box-sizing: border-box;
      white-space: normal;
      overflow-wrap: anywhere;
      transform-origin: var(--_origin);
    }

    [part~="popover"]:not(:popover-open):not(.\:popover-open) {
      display: none;
    }

    [part~="popover"]:popover-open,
    [part~="popover"].\:popover-open {
      display: block;
    }

    /* Enter/exit motion (fade + zoom) is driven by OverlayPresenceController on the panel. */
    @supports (anchor-name: --test) {
      :host([placement="top"]) [part~="popover"] {
        bottom: anchor(top);
        left: anchor(center);
        translate: -50% 0;
        margin-bottom: 6px;
      }

      :host([placement="bottom"]) [part~="popover"] {
        top: anchor(bottom);
        left: anchor(center);
        translate: -50% 0;
        margin-top: 6px;
      }

      :host([placement="left"]) [part~="popover"] {
        right: anchor(left);
        top: anchor(center);
        translate: 0 -50%;
        margin-right: 6px;
      }

      :host([placement="right"]) [part~="popover"] {
        left: anchor(right);
        top: anchor(center);
        translate: 0 -50%;
        margin-left: 6px;
      }
    }
  `],Wp=0,Gp=300,Kp=null;function qp(e){return Kp?.tooltip.isConnected?Kp.tooltip.parentElement===e.parentElement&&performance.now()-Kp.leftAt<Gp:!1}function Jp(e){try{return e instanceof Element&&e.matches(`:focus-visible`)}catch{return!1}}W(`moul-tooltip`,class extends U{static styles=Up;static properties={content:{type:String,reflect:!0},placement:{type:String,reflect:!0},delay:{type:Number,reflect:!0},isOpen:{type:Boolean,reflect:!0,attribute:`is-open`}};overlayPresence;tooltipId;hoverTimer=null;constructor(){super(),this.content=``,this.placement=`top`,this.delay=300,this.isOpen=!1,this.tooltipId=`moul-tooltip-${++Wp}`,this.overlayPresence=new Xs(this,{preset:`tooltip`,popover:()=>this.popoverEl,target:()=>this.popoverEl})}get popoverEl(){return this.shadowRoot?.querySelector(`[role="tooltip"]`)??null}connectedCallback(){super.connectedCallback(),this.addEventListener(`pointerenter`,this.handlePointerEnter),this.addEventListener(`pointerleave`,this.handlePointerLeave),this.addEventListener(`focusin`,this.handleFocusIn),this.addEventListener(`focusout`,this.handleFocusOut),this.addEventListener(`keydown`,this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.clearHoverTimer(),this.removeEventListener(`pointerenter`,this.handlePointerEnter),this.removeEventListener(`pointerleave`,this.handlePointerLeave),this.removeEventListener(`focusin`,this.handleFocusIn),this.removeEventListener(`focusout`,this.handleFocusOut),this.removeEventListener(`keydown`,this.handleKeyDown)}firstUpdated(){this.syncAriaDescribedBy()}updated(e){super.updated(e),e.has(`isOpen`)&&this.isOpen!==this.overlayPresence.isOpen&&this.overlayPresence.setOpen(this.isOpen)}syncAriaDescribedBy(){let e=(this.shadowRoot?.querySelector(`slot:not([name])`))?.assignedElements({flatten:!0})??[];for(let t of e)t.hasAttribute(`aria-describedby`)||t.setAttribute(`aria-describedby`,this.tooltipId)}clearHoverTimer(){this.hoverTimer!==null&&(clearTimeout(this.hoverTimer),this.hoverTimer=null)}async setOpen(e,t={}){this.clearHoverTimer(),(this.isOpen!==e||this.overlayPresence.isOpen!==e)&&(this.isOpen=e,await this.overlayPresence.setOpen(e,null,t),this.dispatchEvent(new CustomEvent(`openchange`,{bubbles:!0,composed:!0,detail:{isOpen:this.isOpen}})))}handlePointerEnter=()=>{this.clearHoverTimer(),qp(this)?this.setOpen(!0,{instant:!0}):this.delay<=0?this.setOpen(!0):this.hoverTimer=setTimeout(()=>{this.setOpen(!0)},this.delay)};handlePointerLeave=()=>{this.clearHoverTimer(),this.isOpen&&(Kp={tooltip:this,leftAt:performance.now()}),this.setOpen(!1)};handleFocusIn=e=>{this.clearHoverTimer(),this.setOpen(!0,{instant:Jp(e.target)})};handleFocusOut=()=>{this.clearHoverTimer(),this.setOpen(!1)};handleKeyDown=e=>{e.key===`Escape`&&this.isOpen&&(e.stopPropagation(),this.setOpen(!1))};render(){return B`
      <div part="trigger" class="trigger">
        <slot @slotchange=${this.syncAriaDescribedBy}></slot>
      </div>

      <div
        id=${this.tooltipId}
        part="popover tooltip"
        role="tooltip"
        popover="manual"
        class="tooltip"
      >
        <slot name="content">${this.content}</slot>
      </div>
    `}});var Yp=Rp(Symbol(`sidebar-context`)),Xp=[J,M`
    :host {
      display: flex;
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 0;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg);
      background-color: var(--color-bg);
    }
  `],Zp=[J,M`
    /* Unframed fallback: a full-height white rail with a separator hairline. */
    :host {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
      width: var(--sidebar-width, 260px);
      height: 100%;
      background-color: var(--color-surface);
      border-inline-end: 1px solid var(--color-separator);
      transition:
        width var(--duration-base, 250ms)
          var(--ease-out-fluid, cubic-bezier(0.32, 0.72, 0, 1)),
        background-color 200ms var(--ease-smooth, ease);
    }

    :host([collapsed]) {
      width: var(--sidebar-collapsed-width, 72px);
    }

    /* Sidebar-framed: the aside is a HeroUI card floating on the page. */
    :host([layout='sidebar-framed']) {
      margin-block: var(--spacing-3);
      margin-inline-start: var(--spacing-3);
      margin-inline-end: 0;
      border: none;
      border-radius: var(--radius-surface);
      box-shadow: var(--shadow-surface);
      height: calc(100% - var(--spacing-3) * 2);
    }

    /* Main-framed: the aside sits directly on the page; the main is the card. */
    :host([layout='main-framed']) {
      border: none;
      background-color: transparent;
    }

    .aside {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      box-sizing: border-box;
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
    }

    /* Collapse toggle: HeroUI tertiary icon button (sm). */
    .toggle-button {
      position: absolute;
      bottom: var(--spacing-4);
      right: var(--spacing-4);
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: none;
      border-radius: var(--radius-full);
      background-color: var(--color-default);
      color: var(--color-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      outline: none;
      transition:
        translate var(--duration-base, 250ms)
          var(--ease-out-fluid, cubic-bezier(0.32, 0.72, 0, 1)),
        scale var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        color 100ms var(--ease-out, ease-out),
        box-shadow 100ms var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      .toggle-button:hover {
        background-color: var(--color-default-hover);
        color: var(--color-fg);
      }
    }

    /* scale (not transform) so it composes with the collapsed centering. */
    .toggle-button:active {
      background-color: var(--color-default-hover);
      scale: var(--press-scale, 0.97);
    }

    .toggle-button:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    /*
     * Stay pinned to the right edge, which rides the width transition, and nudge into
     * the rail's center with translate. Jumping right to 50% teleported the button
     * across the still-wide rail before the collapse had started.
     */
    :host([collapsed]) .toggle-button {
      translate: calc(
          var(--spacing-4) - (var(--sidebar-collapsed-width, 72px) - 2rem) / 2
        )
        0;
    }

    @media (prefers-reduced-motion: reduce) {
      :host,
      .toggle-button {
        transition: none !important;
      }

      .toggle-button:active {
        scale: none;
      }
    }
  `],Qp=[J,M`
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      min-height: 0;
      box-sizing: border-box;
      overflow: auto;
    }

    /* Main-framed: the content area is a HeroUI card on the page. */
    :host([layout='main-framed']) {
      margin: var(--spacing-3);
      border-radius: var(--radius-surface);
      background-color: var(--color-surface);
      box-shadow: var(--shadow-surface);
      padding: var(--spacing-4);
    }

    :host([layout='sidebar-framed']) {
      padding: var(--spacing-4);
    }

    .main {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 0;
      box-sizing: border-box;
    }
  `],$p=[J,M`
    :host {
      display: flex;
      align-items: center;
      padding: var(--spacing-4);
      min-height: 64px;
      box-sizing: border-box;
      gap: var(--spacing-3);
      flex-shrink: 0;
      width: 100%;
    }

    :host([dense]) {
      min-height: 48px;
      padding: var(--spacing-2) var(--spacing-3);
      gap: var(--spacing-2);
    }

    :host([collapsed]) {
      justify-content: center;
      padding: var(--spacing-3) var(--spacing-2);
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
    }

    :host([collapsed]) .header {
      justify-content: center;
      gap: 0;
    }
  `],em=[J,M`
    :host {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      width: 100%;
      min-width: 0;
      overflow: hidden;
      box-sizing: border-box;
      border-radius: var(--radius-xl);
      text-decoration: none;
      color: var(--color-fg);
      user-select: none;
    }

    :host([dense]) {
      gap: var(--spacing-2);
    }

    :host([collapsed]) {
      justify-content: center;
      gap: 0;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      width: 100%;
      min-width: 0;
      overflow: hidden;
      color: inherit;
      text-decoration: none;
      border-radius: var(--radius-xl);
    }

    /* Flush ring: the header clips overflow, so an offset ring would be cut. */
    .brand-link:focus-visible {
      outline: 2px solid var(--color-focus);
      outline-offset: -2px;
    }

    :host([collapsed]) .brand-link {
      justify-content: center;
      gap: 0;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .brand-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
      overflow: hidden;
    }

    :host([collapsed]) .brand-info {
      display: none !important;
    }

    .brand-title {
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-semibold, 600);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-fg);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .brand-subtitle {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `],tm=[J,M`
    :host {
      display: flex;
      flex-direction: column;
      padding-inline: var(--spacing-3);
      padding-block-end: var(--spacing-4);
      gap: var(--spacing-1);
      box-sizing: border-box;
      width: 100%;
    }

    :host([dense]) {
      padding-inline: var(--spacing-2);
      padding-block-end: var(--spacing-2);
    }

    :host([collapsed-sidebar]) {
      padding-inline: var(--spacing-2);
      align-items: center;
    }

    /* Group label: HeroUI list-box section header (text-xs, medium, muted). */
    .group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-2);
      padding-block: var(--spacing-1);
      padding-inline: var(--spacing-2);
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted);
      user-select: none;
      box-sizing: border-box;
      height: var(--spacing-7, 1.75rem);
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      cursor: default;
      outline: none;
      border-radius: var(--radius-xl);
      font-family: inherit;
      transition:
        background-color 150ms var(--ease-smooth, ease),
        color 150ms var(--ease-smooth, ease);
    }

    :host([dense]) .group-header {
      height: var(--spacing-6, 1.5rem);
      padding-block: 0;
      padding-inline: var(--spacing-2);
    }

    :host([collapsible]) .group-header {
      cursor: pointer;
    }

    @media (hover: hover) {
      :host([collapsible]) .group-header:hover {
        background-color: var(--color-default);
        color: var(--color-fg);
      }
    }

    .group-header:focus-visible {
      outline: 2px solid var(--color-focus);
      outline-offset: -2px;
    }

    :host([collapsed-sidebar]) .group-header {
      display: none;
    }

    .group-title {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .chevron {
      width: var(--spacing-3, 12px);
      height: var(--spacing-3, 12px);
      flex-shrink: 0;
      transition: transform 200ms var(--ease-out, ease-out);
    }

    :host([collapsed]) .chevron {
      transform: rotate(-90deg);
    }

    /* Pure CSS Grid Height Collapse (Requirement 12.7) */
    .group-items {
      display: grid;
      grid-template-rows: 1fr;
      opacity: 1;
      transition:
        grid-template-rows 200ms var(--ease-out, ease-out),
        opacity 200ms var(--ease-out, ease-out);
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }

    :host([collapsed]) .group-items,
    .group-items.collapsed {
      grid-template-rows: 0fr;
      opacity: 0;
      pointer-events: none;
    }

    .group-items-inner {
      min-height: 0;
      overflow: clip;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 4px);
    }

    :host([dense]) .group-items-inner {
      gap: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .group-header,
      .chevron,
      .group-items {
        transition: none !important;
      }
    }
  `],nm=[J,M`
    :host {
      display: block;
      position: relative;
      box-sizing: border-box;
      width: 100%;
    }

    /* Row: HeroUI list-box item / ghost button — h-9, rounded-xl, text-sm. */
    .item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding-block: 0;
      padding-inline: var(--spacing-2);
      border-radius: var(--radius-xl);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-normal, 400);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-fg);
      text-decoration: none;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      outline: none;
      box-sizing: border-box;
      height: 2.25rem;
      width: 100%;
      transition:
        background-color 150ms var(--ease-smooth, ease),
        color 150ms var(--ease-smooth, ease),
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out);
      position: relative;
      border: none;
      background: transparent;
      text-align: left;
      font-family: inherit;
    }

    :host([dense]) .item {
      height: 2rem;
      padding-inline: var(--spacing-2);
      gap: var(--spacing-2);
    }

    @media (hover: hover) {
      :host(:not([is-selected]):not([is-disabled])) .item:hover {
        background-color: var(--color-default);
      }
    }

    :host(:not([is-disabled])) .item:active {
      transform: scale(0.98);
    }

    /* Current page: neutral --color-default fill, fg text, medium weight. */
    :host([is-selected]) .item {
      color: var(--color-fg);
      font-weight: var(--font-weight-medium, 500);
    }

    .indicator {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background-color: var(--color-default);
      pointer-events: none;
      z-index: 0;
      transition: background-color 150ms var(--ease-smooth, ease);
    }

    @media (hover: hover) {
      :host([is-selected]) .item:hover .indicator {
        background-color: var(--color-default-hover);
      }
    }

    /* Flush ring: group rows clip overflow, so an offset ring would be cut. */
    .item:focus-visible {
      outline: 2px solid var(--color-focus);
      outline-offset: -2px;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--spacing-4, 16px);
      height: var(--spacing-4, 16px);
      position: relative;
      z-index: 1;
      color: var(--color-muted);
      transition: color 150ms var(--ease-smooth, ease);
    }

    :host([is-selected]) .icon {
      color: var(--color-fg);
    }

    .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      position: relative;
      z-index: 1;
    }

    /* Badge: HeroUI default chip (sm); lifts to the surface on a filled row. */
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.25rem;
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: 1.25rem;
      font-variant-numeric: tabular-nums;
      color: var(--color-muted);
      background-color: var(--color-default);
      padding: 0 var(--spacing-2);
      border-radius: var(--radius-2xl);
      margin-inline-start: auto;
      position: relative;
      z-index: 1;
    }

    :host([is-selected]) .badge {
      background-color: var(--color-surface);
    }

    @media (hover: hover) {
      :host(:not([is-disabled])) .item:hover .badge {
        background-color: var(--color-surface);
      }
    }

    :host([collapsed]) .item {
      justify-content: center;
      padding-inline: 0;
      width: 2.25rem;
      height: 2.25rem;
      margin-inline: auto;
    }

    :host([collapsed][dense]) .item {
      width: 2rem;
      height: 2rem;
    }

    :host([collapsed]) .label,
    :host([collapsed]) .badge {
      display: none !important;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      pointer-events: none;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      .item,
      .indicator,
      .icon {
        transition: none;
      }

      :host(:not([is-disabled])) .item:active {
        transform: none;
      }
    }
  `],rm=[J,M`
    :host {
      display: block;
      box-sizing: border-box;
      margin-block: var(--spacing-3);
      margin-inline: var(--spacing-3);
      height: 1px;
      border-radius: var(--radius-sm);
      background-color: var(--color-separator);
      border: none;
    }

    :host([dense]) {
      margin-block: var(--spacing-2);
    }

    :host([collapsed]) {
      margin-inline: var(--spacing-2);
    }
  `],im=[J,M`
    :host {
      display: flex;
      align-items: center;
      padding-block: var(--spacing-3);
      padding-inline: var(--spacing-3);
      box-sizing: border-box;
      margin-top: auto;
      gap: var(--spacing-3);
      min-height: 64px;
      flex-shrink: 0;
      width: 100%;
    }

    :host([show-border]) {
      border-block-start: 1px solid var(--color-separator);
    }

    :host([dense]) {
      min-height: 48px;
      padding-block: var(--spacing-2);
      padding-inline: var(--spacing-2);
      gap: var(--spacing-2);
    }

    :host([collapsed]) {
      justify-content: center;
      padding-inline: var(--spacing-2);
      padding-block: var(--spacing-3);
    }

    .footer {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
    }

    :host([collapsed]) .footer {
      justify-content: center;
      gap: 0;
    }
  `],am=[J,M`
    /* User row: card-header typography (title + muted description) in a list-box row. */
    :host {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      width: 100%;
      min-width: 0;
      overflow: hidden;
      box-sizing: border-box;
      border-radius: var(--radius-xl);
      text-decoration: none;
      color: var(--color-fg);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      padding: var(--spacing-2);
      transition:
        background-color 150ms var(--ease-smooth, ease),
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      :host(:hover) {
        background-color: var(--color-default);
      }
    }

    :host(:active) {
      transform: scale(0.98);
    }

    :host([dense]) {
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-2);
    }

    :host([collapsed]) {
      justify-content: center;
      gap: 0;
      padding-inline: 0;
    }

    .user-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
      overflow: hidden;
    }

    :host([collapsed]) .user-info {
      display: none !important;
    }

    .user-name {
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-fg);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-email {
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-action {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--color-muted);
      margin-inline-start: auto;
    }

    :host([collapsed]) .user-action {
      display: none !important;
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: none;
      }

      :host(:active) {
        transform: none;
      }
    }
  `],om=()=>V`
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
`,sm=()=>V`
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
`,cm=class extends U{static styles=Xp;static properties={layout:{type:String,reflect:!0},dense:{type:Boolean,reflect:!0},collapsed:{type:Boolean,reflect:!0},selectedKey:{type:String,reflect:!0,attribute:`selected-key`}};contextProvider;previousActiveRect=null;constructor(){super(),this.layout=`sidebar-framed`,this.dense=!1,this.collapsed=!1,this.selectedKey=``,this.contextProvider=new Hp(this,{context:Yp,initialValue:this.computeContextValue()})}computeContextValue(){return{layout:this.layout||`sidebar-framed`,dense:this.dense,collapsed:this.collapsed,selectedKey:this.selectedKey,previousActiveRect:this.previousActiveRect,onSelect:e=>this.selectItem(e),selectItem:e=>this.selectItem(e),toggleCollapse:()=>this.toggleCollapse()}}selectItem(e){if(this.selectedKey===e)return;let t=this.querySelector(`moul-sidebar-item[key="${this.selectedKey}"], moul-sidebar-item[id="${this.selectedKey}"], moul-sidebar-item[is-selected]`);this.previousActiveRect=t?.getBoundingClientRect()??null,this.selectedKey=e,this.dispatchEvent(new CustomEvent(`selectionchange`,{bubbles:!0,composed:!0,detail:{selectedKey:e}})),this.contextProvider.setValue(this.computeContextValue())}toggleCollapse(){this.collapsed=!this.collapsed,this.dispatchEvent(new CustomEvent(`collapsechange`,{bubbles:!0,composed:!0,detail:{collapsed:this.collapsed}})),this.contextProvider.setValue(this.computeContextValue())}updated(e){super.updated(e),(e.has(`layout`)||e.has(`dense`)||e.has(`collapsed`)||e.has(`selectedKey`))&&this.contextProvider.setValue(this.computeContextValue())}render(){return B`<slot></slot>`}},lm=class extends U{static styles=Zp;static properties={ariaLabel:{type:String,attribute:`aria-label`,reflect:!0},showCollapseToggle:{type:Boolean,attribute:`show-collapse-toggle`,reflect:!0},dense:{type:Boolean,reflect:!0},collapsed:{type:Boolean,reflect:!0},layout:{type:String,reflect:!0}};sidebarConsumer=new zp(this,{context:Yp,subscribe:!0,callback:e=>{e&&(this.collapsed=e.collapsed,this.dense=e.dense,this.layout=e.layout,this.requestUpdate())}});constructor(){super(),this.ariaLabel=`Main Navigation`,this.showCollapseToggle=!1,this.dense=!1,this.collapsed=!1,this.layout=`sidebar-framed`}connectedCallback(){super.connectedCallback(),this.sidebarConsumer.value&&(this.collapsed=this.sidebarConsumer.value.collapsed,this.dense=this.sidebarConsumer.value.dense,this.layout=this.sidebarConsumer.value.layout)}handleToggleClick=()=>{this.sidebarConsumer.value?.toggleCollapse?.()};render(){return B`
      <aside
        part="aside"
        class="aside"
        role="complementary"
        aria-label=${this.ariaLabel||`Main Navigation`}
      >
        <slot></slot>
        ${this.showCollapseToggle?B`
              <button
                type="button"
                class="toggle-button"
                part="toggle-button"
                aria-label=${this.collapsed?`Expand sidebar`:`Collapse sidebar`}
                @click=${this.handleToggleClick}
              >
                ${this.collapsed?sm():om()}
              </button>
            `:``}
      </aside>
    `}},um=class extends U{static styles=Qp;static properties={layout:{type:String,reflect:!0}};sidebarConsumer=new zp(this,{context:Yp,subscribe:!0,callback:e=>{e&&(this.layout=e.layout,this.requestUpdate())}});constructor(){super(),this.layout=`sidebar-framed`}connectedCallback(){super.connectedCallback(),this.sidebarConsumer.value&&(this.layout=this.sidebarConsumer.value.layout)}render(){return B`
      <main part="main" class="main" role="main">
        <slot></slot>
      </main>
    `}},dm=class extends U{static styles=$p;static properties={dense:{type:Boolean,reflect:!0},collapsed:{type:Boolean,reflect:!0}};sidebarConsumer=new zp(this,{context:Yp,subscribe:!0,callback:e=>{e&&(this.dense=e.dense,this.collapsed=e.collapsed,this.requestUpdate())}});constructor(){super(),this.dense=!1,this.collapsed=!1}connectedCallback(){super.connectedCallback(),this.sidebarConsumer.value&&(this.dense=this.sidebarConsumer.value.dense,this.collapsed=this.sidebarConsumer.value.collapsed)}render(){return B`
      <header part="header" class="header">
        <slot></slot>
      </header>
    `}},fm=class extends U{static styles=em;static properties={logo:{type:String,reflect:!0},title:{type:String,reflect:!0},subtitle:{type:String,reflect:!0},href:{type:String,reflect:!0},dense:{type:Boolean,reflect:!0},collapsed:{type:Boolean,reflect:!0}};sidebarConsumer=new zp(this,{context:Yp,subscribe:!0,callback:e=>{e&&(this.dense=e.dense,this.collapsed=e.collapsed,this.requestUpdate())}});constructor(){super(),this.logo=``,this.title=``,this.subtitle=``,this.href=``,this.dense=!1,this.collapsed=!1}connectedCallback(){super.connectedCallback(),this.sidebarConsumer.value&&(this.dense=this.sidebarConsumer.value.dense,this.collapsed=this.sidebarConsumer.value.collapsed)}render(){let e=B`
      <div class="brand-logo" part="logo">
        <slot name="logo">
          ${this.logo?B`<img src=${this.logo} alt="" />`:``}
        </slot>
      </div>
      <div class="brand-info" part="info">
        <span class="brand-title" part="title">
          <slot name="title">${this.title}</slot>
        </span>
        ${this.subtitle?B`
              <span class="brand-subtitle" part="subtitle">
                <slot name="subtitle">${this.subtitle}</slot>
              </span>
            `:``}
      </div>
      <slot></slot>
    `;return this.href?B`
        <a href=${this.href} class="brand-link" part="link">
          ${e}
        </a>
      `:e}},pm=class extends U{static styles=tm;static properties={label:{type:String,reflect:!0},collapsible:{type:Boolean,reflect:!0},collapsed:{type:Boolean,reflect:!0},dense:{type:Boolean,reflect:!0},collapsedSidebar:{type:Boolean,attribute:`collapsed-sidebar`,reflect:!0}};get title(){return this.label}set title(e){this.label=e}sidebarConsumer=new zp(this,{context:Yp,subscribe:!0,callback:e=>{e&&(this.dense=e.dense,this.collapsedSidebar=e.collapsed,this.requestUpdate())}});constructor(){super(),this.label=``,this.collapsible=!0,this.collapsed=!1,this.dense=!1,this.collapsedSidebar=!1}connectedCallback(){super.connectedCallback(),this.sidebarConsumer.value&&(this.dense=this.sidebarConsumer.value.dense,this.collapsedSidebar=this.sidebarConsumer.value.collapsed)}toggleCollapse=()=>{this.collapsible&&(this.collapsed=!this.collapsed,this.dispatchEvent(new CustomEvent(`collapsechange`,{bubbles:!0,composed:!0,detail:{collapsed:this.collapsed}})))};handleKeyDown=e=>{(e.key===`Enter`||e.key===` `||e.key===`Spacebar`)&&(e.preventDefault(),this.toggleCollapse())};render(){return B`
      ${this.label&&!this.collapsedSidebar?B`
            <button
              type="button"
              part="group-header"
              class="group-header"
              aria-expanded=${!this.collapsed}
              @click=${this.toggleCollapse}
              @keydown=${this.handleKeyDown}
            >
              <span part="group-title" class="group-title">${this.label}</span>
              ${this.collapsible?B`
                    <svg
                      part="chevron"
                      class="chevron ${this.collapsed?`is-collapsed`:``}"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  `:``}
            </button>
          `:``}
      <div
        class="group-items ${this.collapsed?`collapsed`:`expanded`}"
        part="items"
      >
        <div class="group-items-inner" part="items-inner">
          <slot></slot>
        </div>
      </div>
    `}},mm=class extends U{static styles=nm;static properties={key:{type:String,reflect:!0},id:{type:String,reflect:!0},href:{type:String,reflect:!0},label:{type:String,reflect:!0},badge:{type:String,reflect:!0},isDisabled:{type:Boolean,attribute:`is-disabled`,reflect:!0},isSelected:{type:Boolean,attribute:`is-selected`,reflect:!0},dense:{type:Boolean,reflect:!0},collapsed:{type:Boolean,reflect:!0}};sidebarConsumer=new zp(this,{context:Yp,subscribe:!0,callback:e=>{if(e){this.collapsed=e.collapsed,this.dense=e.dense;let t=this.key||this.id;t&&(this.isSelected=e.selectedKey===t),this.requestUpdate()}}});constructor(){super(),this.key=``,this.id=``,this.href=``,this.label=``,this.badge=``,this.isDisabled=!1,this.isSelected=!1,this.dense=!1,this.collapsed=!1}connectedCallback(){if(super.connectedCallback(),this.sidebarConsumer.value){this.collapsed=this.sidebarConsumer.value.collapsed,this.dense=this.sidebarConsumer.value.dense;let e=this.key||this.id;e&&(this.isSelected=this.sidebarConsumer.value.selectedKey===e)}}updated(e){if(super.updated(e),e.has(`isSelected`)&&this.isSelected){let e=this.shadowRoot?.querySelector(`[part="indicator"]`),t=this.sidebarConsumer.value?.previousActiveRect;if(e&&t){let n=this.getBoundingClientRect();if(n.width>0&&n.height>0)try{Ns(e,t,n)}catch{}}}}handleClick=e=>{if(this.isDisabled){e.preventDefault(),e.stopPropagation();return}let t=this.key||this.id;t&&(this.dispatchEvent(new CustomEvent(`selectionchange`,{bubbles:!1,composed:!0,detail:{selectedKey:t}})),this.sidebarConsumer.value?.onSelect?.(t),this.sidebarConsumer.value?.selectItem?.(t))};handleKeyDown=e=>{(e.key===`Enter`||e.key===` `||e.key===`Spacebar`)&&(e.preventDefault(),this.handleClick(e))};render(){let e=this.href?B`
        <a
          href=${this.href}
          part="item"
          class="item"
          aria-current=${this.isSelected?`page`:H}
          @click=${this.handleClick}
          @keydown=${this.handleKeyDown}
        >
          ${this.isSelected?B`<span class="indicator" part="indicator"></span>`:``}
          <span class="icon" part="icon"><slot name="icon"></slot></span>
          ${this.collapsed?``:B`
                <span class="label" part="label">
                  ${this.label}<slot></slot>
                </span>
              `}
          ${!this.collapsed&&this.badge?B`<span class="badge" part="badge">${this.badge}</span>`:``}
        </a>
      `:B`
        <button
          type="button"
          part="item"
          class="item"
          aria-selected=${this.isSelected?`true`:`false`}
          ?disabled=${this.isDisabled}
          @click=${this.handleClick}
          @keydown=${this.handleKeyDown}
        >
          ${this.isSelected?B`<span class="indicator" part="indicator"></span>`:``}
          <span class="icon" part="icon"><slot name="icon"></slot></span>
          ${this.collapsed?``:B`
                <span class="label" part="label">
                  ${this.label}<slot></slot>
                </span>
              `}
          ${!this.collapsed&&this.badge?B`<span class="badge" part="badge">${this.badge}</span>`:``}
        </button>
      `;if(this.collapsed){let t=this.label||this.textContent?.trim()||``;if(t)return B`
          <moul-tooltip content=${t} placement="right" delay="200">
            ${e}
          </moul-tooltip>
        `}return e}},hm=class extends U{static styles=rm;static properties={dense:{type:Boolean,reflect:!0},collapsed:{type:Boolean,reflect:!0}};sidebarConsumer=new zp(this,{context:Yp,subscribe:!0,callback:e=>{e&&(this.dense=e.dense,this.collapsed=e.collapsed,this.requestUpdate())}});constructor(){super(),this.dense=!1,this.collapsed=!1}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`separator`),this.setAttribute(`aria-orientation`,`horizontal`),this.sidebarConsumer.value&&(this.dense=this.sidebarConsumer.value.dense,this.collapsed=this.sidebarConsumer.value.collapsed)}render(){return B``}},gm=class extends U{static styles=im;static properties={dense:{type:Boolean,reflect:!0},collapsed:{type:Boolean,reflect:!0},showBorder:{type:Boolean,attribute:`show-border`,reflect:!0}};sidebarConsumer=new zp(this,{context:Yp,subscribe:!0,callback:e=>{e&&(this.dense=e.dense,this.collapsed=e.collapsed,this.requestUpdate())}});constructor(){super(),this.dense=!1,this.collapsed=!1,this.showBorder=!0}connectedCallback(){super.connectedCallback(),this.sidebarConsumer.value&&(this.dense=this.sidebarConsumer.value.dense,this.collapsed=this.sidebarConsumer.value.collapsed)}render(){return B`
      <footer part="footer" class="footer">
        <slot></slot>
      </footer>
    `}},_m=class extends U{static styles=am;static properties={name:{type:String,reflect:!0},email:{type:String,reflect:!0},avatarSrc:{type:String,attribute:`avatar-src`,reflect:!0},status:{type:String,reflect:!0},dense:{type:Boolean,reflect:!0},collapsed:{type:Boolean,reflect:!0}};get description(){return this.email}set description(e){this.email=e}sidebarConsumer=new zp(this,{context:Yp,subscribe:!0,callback:e=>{e&&(this.dense=e.dense,this.collapsed=e.collapsed,this.requestUpdate())}});constructor(){super(),this.name=``,this.email=``,this.avatarSrc=``,this.status=``,this.dense=!1,this.collapsed=!1}connectedCallback(){super.connectedCallback(),this.sidebarConsumer.value&&(this.dense=this.sidebarConsumer.value.dense,this.collapsed=this.sidebarConsumer.value.collapsed)}render(){let e=B`
      <div class="user-avatar" part="avatar">
        <slot name="avatar">
          <moul-avatar
            src=${this.avatarSrc}
            name=${this.name}
            status=${this.status||``}
            size=${this.dense?`sm`:`md`}
          ></moul-avatar>
        </slot>
      </div>
      ${this.collapsed?``:B`
            <div class="user-info" part="info">
              <span class="user-name" part="name">
                <slot name="name">${this.name}</slot>
              </span>
              ${this.email?B`
                    <span class="user-email" part="email">
                      <slot name="email">${this.email}</slot>
                    </span>
                  `:``}
            </div>
            <div class="user-action" part="action">
              <slot name="action"></slot>
            </div>
            <slot></slot>
          `}
    `;if(this.collapsed){let t=this.name?this.email?`${this.name} • ${this.email}`:this.name:this.email||``;if(t)return B`
          <moul-tooltip content=${t} placement="right" delay="200">
            ${e}
          </moul-tooltip>
        `}return e}};W(`moul-sidebar`,cm),W(`moul-sidebar-aside`,lm),W(`moul-sidebar-main`,um),W(`moul-sidebar-header`,dm),W(`moul-sidebar-brand`,fm),W(`moul-sidebar-group`,pm),W(`moul-sidebar-item`,mm),W(`moul-sidebar-divider`,hm),W(`moul-sidebar-footer`,gm),W(`moul-sidebar-user`,_m);var vm=[J,M`
    :host {
      display: block;
      box-sizing: border-box;
      pointer-events: none;
    }

    [part~="base"] {
      display: block;
      box-sizing: border-box;
      background-color: color-mix(in oklab, var(--color-surface-tertiary) 70%, transparent);
      overflow: hidden;
      position: relative;
      border-radius: var(--radius-sm, 0.25rem);
    }

    :host([shape="line"]) [part~="base"],
    :host(:not([shape])) [part~="base"] {
      width: 100%;
      height: 1rem;
      border-radius: var(--radius-lg, 0.5rem);
    }

    :host([shape="circle"]) {
      flex-shrink: 0;
    }

    :host([shape="circle"]) [part~="base"] {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-full, 9999px);
      flex-shrink: 0;
    }

    :host([shape="rect"]) [part~="base"] {
      width: 100%;
      height: 6rem;
      border-radius: var(--radius-lg, 0.5rem);
    }

    /* Pulse variant: the whole block breathes */
    :host([variant="pulse"]) [part~="base"],
    :host(:not([variant])) [part~="base"] {
      animation: moul-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes moul-skeleton-pulse {
      50% {
        opacity: 0.5;
      }
    }

    /* Wave variant: a shimmer band sweeps across the block */
    :host([variant="wave"]) [part~="base"]::after {
      content: "";
      position: absolute;
      inset: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        to right,
        transparent,
        var(--color-surface-tertiary),
        transparent
      );
      animation: moul-skeleton-shimmer 2s linear infinite;
    }

    @keyframes moul-skeleton-shimmer {
      100% {
        transform: translateX(200%);
      }
    }

    /* Reduced motion: drop the moving shimmer; the opacity pulse is not movement, so every variant keeps it */
    @media (prefers-reduced-motion: reduce) {
      [part~="base"]::after {
        animation: none !important;
      }

      :host([variant="wave"]) [part~="base"]::after {
        content: none;
      }

      :host([variant="wave"]) [part~="base"] {
        animation: moul-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    }
  `];W(`moul-skeleton`,class extends U{static styles=vm;static properties={shape:{type:String,reflect:!0},variant:{type:String,reflect:!0},width:{type:String,reflect:!0},height:{type:String,reflect:!0}};constructor(){super(),this.shape=`line`,this.variant=`wave`,this.width=``,this.height=``}connectedCallback(){super.connectedCallback(),this.setAttribute(`aria-hidden`,`true`)}render(){return B`
      <div
        part="base"
        style=${[this.width?`width: ${this.width};`:``,this.height?`height: ${this.height};`:``].filter(Boolean).join(` `)||void 0}
        aria-hidden="true"
      ></div>
    `}});var ym=[J,M`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      /* Half the thumb's width: the bar runs this far past either end of the value range */
      --_inset: 0.75rem;
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    [part~='header'] {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
    }

    [part~='label'] {
      color: var(--color-fg, inherit);
    }

    [part~='output'] {
      color: var(--color-fg, inherit);
      font-variant-numeric: tabular-nums;
    }

    /* The padding keeps the track (the value range) clear of the bar's rounded ends */
    [part~='track-container'] {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 1.25rem;
      padding-inline: var(--_inset);
      cursor: pointer;
      touch-action: none;
    }

    [part~='track-container']::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: var(--radius-xl, 0.75rem);
      background-color: var(--color-default);
    }

    [part~='track'] {
      position: relative;
      width: 100%;
      height: 100%;
    }

    /* Extends back over the inset so the fill starts at the bar's rounded end */
    [part~='fill'] {
      position: absolute;
      left: 0;
      top: 0;
      box-sizing: content-box;
      height: 100%;
      margin-left: calc(-1 * var(--_inset));
      padding-left: var(--_inset);
      border-radius: var(--radius-xl, 0.75rem) 0 0 var(--radius-xl, 0.75rem);
      background-color: var(--color-accent);
      pointer-events: none;
    }

    /* An accent socket holding a white pill */
    [part~='thumb'] {
      position: absolute;
      top: 50%;
      translate: -50% -50%;
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(2 * var(--_inset) + 0.25rem);
      height: 100%;
      border-radius: var(--radius-xl, 0.75rem);
      background-color: var(--color-accent);
      cursor: grab;
      outline: none;
      transition:
        background-color 250ms var(--ease-smooth, ease),
        box-shadow 150ms var(--ease-out, ease-out);
    }

    [part~='thumb']::after {
      content: '';
      width: 1.5rem;
      height: 1rem;
      border-radius: var(--radius-lg, 0.5rem);
      background-color: var(--color-accent-fg);
      box-shadow: var(--shadow-field);
      transition: scale 150ms var(--ease-out, ease-out);
    }

    [part~='track-container']:active [part~='thumb'] {
      cursor: grabbing;
    }

    [part~='track-container']:active [part~='thumb']::after {
      scale: 0.9;
    }

    [part~='thumb']:focus-visible {
      z-index: 1;
      outline: none;
      box-shadow: var(--focus-ring);
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    :host([is-disabled]) [part~='track-container'],
    :host([is-disabled]) [part~='thumb'] {
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~='thumb'],
      [part~='thumb']::after {
        transition: none;
      }

      [part~='track-container']:active [part~='thumb']::after {
        scale: none;
      }
    }
  `];W(`moul-slider`,class extends U{static styles=ym;static formAssociated=!0;static properties={name:{type:String,reflect:!0},min:{type:Number,reflect:!0},max:{type:Number,reflect:!0},step:{type:Number,reflect:!0},value:{type:Number,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},label:{type:String,reflect:!0},showOutput:{type:Boolean,reflect:!0,attribute:`show-output`}};internalsController;isDragging=!1;constructor(){super(),this.name=``,this.min=0,this.max=100,this.step=1,this.value=0,this.isDisabled=!1,this.label=``,this.showOutput=!0,this.internalsController=new Rd(this)}get thumbElement(){return this.renderRoot?.querySelector(`[part="thumb"]`)??null}get trackElement(){return this.renderRoot?.querySelector(`[part="track"]`)??null}focus(e){this.thumbElement?.focus(e)}blur(){this.thumbElement?.blur()}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}willUpdate(e){super.willUpdate(e),(e.has(`value`)||e.has(`min`)||e.has(`max`))&&(this.value=this.clampAndSnap(this.value),this.internalsController.setValue(String(this.value)))}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.querySelector(`[slot="label"]`));Td(this,`slider`,t)}reset(){let e=this.defaultValue;this.value=typeof e==`number`?e:typeof this.min==`number`?this.min:0,this.internalsController.setValue(String(this.value)),this.requestUpdate()}clampAndSnap(e){let t=typeof this.min==`number`?this.min:0,n=typeof this.max==`number`?this.max:100,r=typeof this.step==`number`&&this.step>0?this.step:1,i=Math.round((Math.min(Math.max(e,t),n)-t)/r),a=Math.min(Math.max(t+i*r,t),n);return Number(a.toFixed(6))}setValueFromPosition(e){let t=this.trackElement;if(!t)return;let n=t.getBoundingClientRect(),r=n.width;if(r<=0)return;let i=Math.min(Math.max(e-n.left,0),r)/r,a=this.min+i*(this.max-this.min),o=this.clampAndSnap(a);this.value!==o&&(this.value=o,this.internalsController.setValue(String(this.value)),this.dispatchEvent(new CustomEvent(`input`,{detail:{value:this.value},bubbles:!0,composed:!0})))}handlePointerDown=e=>{this.isDisabled||(this.isDragging=!0,e.currentTarget.setPointerCapture?.(e.pointerId),this.setValueFromPosition(e.clientX),this.focus())};handlePointerMove=e=>{!this.isDragging||this.isDisabled||this.setValueFromPosition(e.clientX)};handlePointerUp=e=>{if(!this.isDragging)return;this.isDragging=!1;let t=e.currentTarget;try{t.releasePointerCapture?.(e.pointerId)}catch{}this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0}))};handleKeyDown=e=>{if(this.isDisabled)return;let t=this.value;if(e.key===`ArrowRight`||e.key===`ArrowUp`)e.preventDefault(),t=this.clampAndSnap(this.value+(this.step||1));else if(e.key===`ArrowLeft`||e.key===`ArrowDown`)e.preventDefault(),t=this.clampAndSnap(this.value-(this.step||1));else if(e.key===`Home`)e.preventDefault(),t=this.min;else if(e.key===`End`)e.preventDefault(),t=this.max;else return;this.value!==t&&(this.value=t,this.internalsController.setValue(String(this.value)),this.dispatchEvent(new CustomEvent(`input`,{detail:{value:this.value},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:this.value},bubbles:!0,composed:!0})))};render(){let e=this.max-this.min||1,t=Math.max(0,Math.min(100,(this.value-this.min)/e*100));return B`
      <div part="base">
        <div part="header">
          <label part="label">
            <slot name="label">${this.label}</slot>
          </label>
          ${this.showOutput?B`<output part="output" aria-live="off">${this.value}</output>`:``}
        </div>

        <div
          part="track-container"
          @pointerdown=${this.handlePointerDown}
          @pointermove=${this.handlePointerMove}
          @pointerup=${this.handlePointerUp}
          @pointercancel=${this.handlePointerUp}
        >
          <div part="track">
            <div part="fill" style="width: ${t}%"></div>
            <div
              part="thumb"
              role="slider"
              tabindex=${this.isDisabled?`-1`:`0`}
              style="left: ${t}%"
              aria-valuemin=${this.min}
              aria-valuemax=${this.max}
              aria-valuenow=${this.value}
              aria-label=${this.label||`Slider`}
              @keydown=${this.handleKeyDown}
            ></div>
          </div>
        </div>
      </div>
    `}});var bm=-999999999,xm=999999999;function Sm(e){return Number.isFinite(e)?e<-999999999?bm:e>999999999?xm:e:0}var Cm=class{targetValue=0;displayValue=0;host;options;controls=null;constructor(e,t={}){this.host=e,this.options=t,this.targetValue=Sm(t.initialValue??0),this.displayValue=this.targetValue,this.host.addController(this)}hostConnected(){}hostDisconnected(){this.controls?.stop(),this.controls=null}setTarget(e){let t=Sm(e);if(t===this.targetValue&&this.displayValue===this.targetValue)return;if(this.targetValue=t,ws()){this.controls?.stop(),this.controls=null,this.displayValue=t,this.host.requestUpdate(),this.options.onUpdate?.(this.displayValue);return}this.controls?.stop(),this.controls=null;let n=this.options.threshold??.5;Math.abs(this.displayValue-t)<=n?(this.displayValue=t,this.host.requestUpdate(),this.options.onUpdate?.(this.displayValue)):this.controls=vs(this.displayValue,t,{type:`spring`,stiffness:this.options.stiffness??260,damping:this.options.damping??28,mass:this.options.mass??1,onUpdate:e=>{Math.abs(e-this.targetValue)<=n?(this.displayValue=this.targetValue,this.controls?.stop(),this.controls=null):this.displayValue=e,this.host.requestUpdate(),this.options.onUpdate?.(this.displayValue)}})}reset(e){this.controls?.stop(),this.controls=null,this.targetValue=Sm(e),this.displayValue=this.targetValue,this.host.requestUpdate(),this.options.onUpdate?.(this.displayValue)}},wm=[J,ut,M`
    /* Presented as a card surface: muted label, bold value, edge-to-edge sparkline */
    :host {
      display: flex;
      flex-direction: column;
      padding: var(--_stat-pad);
      border-radius: var(--radius-surface, 1.5rem);
      font-family: var(--font-family-base, inherit);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-fg, inherit);
      min-width: 180px;
      box-sizing: border-box;
      position: relative;
      overflow: hidden;
      isolation: isolate;
      --_stat-pad: var(--spacing-5, 1.25rem);
      /* Secondary copy; variants swap it for a tint of their own text color */
      --_stat-muted: var(--color-muted);
      /* Sparkline color; the color attribute overrides it */
      --_stat-chart: var(--_tone-solid-bg);
      /* Ring that lifts the scrub dot off the line */
      --_stat-ring: var(--color-surface);
      transition:
        background-color var(--duration-fast, 150ms) var(--ease-smooth, ease),
        border-color var(--duration-fast, 150ms) var(--ease-smooth, ease),
        box-shadow var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    :host(:not([variant])) {
      background-color: var(--color-surface);
      color: var(--color-fg);
      border: none;
      box-shadow: var(--shadow-surface);
    }

    /* Tinted variants draw the sparkline in their own text color */
    :host([variant]) {
      --_stat-muted: color-mix(in oklch, currentColor 78%, transparent);
      --_stat-chart: currentColor;
    }

    :host([variant="solid"]),
    :host([variant="shadow"]) {
      --_stat-ring: var(--_tone-solid-bg);
    }

    /* Bordered and glass keep neutral copy; the tone shows in the frame and chart */
    :host([variant="bordered"]),
    :host([variant="glass"]) {
      color: var(--color-fg);
      --_stat-muted: var(--color-muted);
      --_stat-chart: var(--_tone-solid-bg);
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
      min-height: 1.5rem;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--_stat-muted);
      flex-shrink: 0;
    }

    .label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--_stat-muted);
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      margin-top: var(--spacing-2, 0.5rem);
    }

    /* Affixes share the value's type so "$45,896" and "3.26%" read as one figure */
    .value-row {
      display: flex;
      align-items: baseline;
      font-size: var(--font-size-4xl, 2.25rem);
      line-height: 1.1;
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: -0.035em;
      font-variant-numeric: tabular-nums;
      color: inherit;
    }

    .prefix,
    .suffix {
      white-space: pre;
    }

    .value {
      color: inherit;
    }

    /* Holds its line even when empty, so scrub labels don't shift the card */
    .description {
      min-height: var(--line-height-sm, 1.25rem);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--_stat-muted);
    }

    .footer {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-2, 0.5rem);
      margin-top: var(--spacing-3, 0.75rem);
      font-size: var(--font-size-xs, 0.75rem);
      color: var(--_stat-muted);
    }

    /* Delta pill: soft sentiment fill, solid triangle */
    .trend-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3125rem;
      flex-shrink: 0;
      margin-inline-start: auto;
      padding-block: 0.125rem;
      padding-inline: var(--spacing-2, 0.5rem);
      border-radius: var(--radius-full, 9999px);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .trend-badge.is-positive {
      background-color: var(--color-success-soft);
      color: var(--color-success-soft-fg);
    }

    .trend-badge.is-negative {
      background-color: var(--color-danger-soft);
      color: var(--color-danger-soft-fg);
    }

    .trend-badge.is-neutral {
      background-color: var(--color-default-soft);
      color: var(--color-default-fg);
    }

    /* On solid fills the pill becomes a translucent wash; the triangle carries direction */
    :host([variant="solid"]) .trend-badge,
    :host([variant="shadow"]) .trend-badge {
      background-color: color-mix(in oklch, currentColor 16%, transparent);
      color: inherit;
    }

    .trend-icon {
      width: 0.5rem;
      height: 0.5rem;
      fill: currentColor;
      stroke: currentColor;
      stroke-width: 1;
      stroke-linejoin: round;
    }

    /* Edge to edge: cancels the card padding on the sides and bottom */
    .sparkline {
      margin-top: auto;
      margin-inline: calc(var(--_stat-pad) * -1);
      margin-bottom: calc(var(--_stat-pad) * -1);
      padding-top: var(--spacing-5, 1.25rem);
      color: var(--_stat-chart);
      outline: none;
      /* Horizontal drags scrub; vertical ones still scroll the page */
      touch-action: pan-y;
      user-select: none;
      -webkit-user-select: none;
    }

    /* Keyboard focus on the sparkline rings the whole card */
    .focus-ring {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: inset 0 0 0 2px var(--color-focus);
      opacity: 0;
      pointer-events: none;
    }

    .sparkline:focus-visible + .focus-ring {
      opacity: 1;
    }

    .sparkline-svg,
    .sparkline-guide,
    .sparkline-dot {
      pointer-events: none;
    }

    .sparkline-plot {
      position: relative;
      height: 4rem;
      /* Room for the end dots, so they never sit on the clipped edges */
      --_spark-inset: 0.75rem;
    }

    .sparkline-svg {
      position: absolute;
      top: 0;
      left: var(--_spark-inset);
      width: calc(100% - 2 * var(--_spark-inset));
      height: 100%;
      overflow: visible;
    }

    .sparkline-line {
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }

    .sparkline-stop-start {
      stop-color: light-dark(
        color-mix(in oklch, currentColor 28%, transparent),
        color-mix(in oklch, currentColor 34%, transparent)
      );
    }

    .sparkline-stop-end {
      stop-color: color-mix(in oklch, currentColor 0%, transparent);
    }

    /* Dashed guide under the scrubbed point; reaches up into the gap above the plot.
       Positions use physical sides: time runs left to right in every writing direction. */
    .sparkline-guide {
      position: absolute;
      top: calc(var(--spacing-5, 1.25rem) * -1);
      bottom: 0;
      width: 1px;
      translate: -50% 0;
      background-image: repeating-linear-gradient(
        to bottom,
        color-mix(in oklch, var(--_stat-muted) 60%, transparent) 0 3px,
        transparent 3px 7px
      );
      opacity: 0;
      transition: opacity var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    .sparkline[data-active] .sparkline-guide {
      opacity: 1;
    }

    /* At rest it marks the latest point with a halo; while scrubbing it gains a ring */
    .sparkline-dot {
      position: absolute;
      width: 0.5rem;
      height: 0.5rem;
      translate: -50% -50%;
      border-radius: var(--radius-full, 9999px);
      background-color: currentColor;
      box-shadow: 0 0 0 0.25rem color-mix(in oklch, currentColor 22%, transparent);
      transition:
        width var(--duration-fast, 150ms) var(--ease-smooth, ease),
        height var(--duration-fast, 150ms) var(--ease-smooth, ease),
        box-shadow var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    .sparkline[data-active] .sparkline-dot {
      width: 0.625rem;
      height: 0.625rem;
      box-shadow: 0 0 0 2px var(--_stat-ring);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      :host,
      .sparkline-guide,
      .sparkline-dot {
        transition: none;
      }
    }
  `],Tm=100,Em=8,Dm=22;function Om(e){return`calc(var(--_spark-inset) + (100% - 2 * var(--_spark-inset)) * ${e/Tm})`}function km(e){let t=/\.(\d+)/.exec(String(e))?.[1]??``;return Math.min(t.length,4)}W(`moul-stat`,class extends U{static styles=wm;static properties={label:{type:String},value:{type:Number},prefix:{type:String},suffix:{type:String},trend:{type:String},trendValue:{type:String,attribute:`trend-value`},isLowerBetter:{type:Boolean,reflect:!0,attribute:`is-lower-better`},tone:{type:String,reflect:!0},variant:{type:String,reflect:!0,useDefault:!0},color:{type:String},description:{type:String},valueFormatter:{attribute:!1},sparklineData:{attribute:!1},sparklineLabels:{attribute:!1}};spring;sparklineId=Math.random().toString(36).slice(2,9);hasIcon=!1;hasFooter=!1;sparkline=null;activeIndex=null;constructor(){super(),this.label=``,this.value=0,this.prefix=``,this.suffix=``,this.trend=`neutral`,this.trendValue=``,this.isLowerBetter=!1,this.tone=`primary`,this.variant=`flat`,this.color=``,this.description=``,this.valueFormatter=void 0,this.sparklineData=void 0,this.sparklineLabels=void 0,this.spring=new Cm(this,{initialValue:0})}get targetValue(){return this.spring.targetValue}get displayValue(){return this.spring.displayValue}reset(e){this.value=e,this.spring.reset(e)}get trendSentiment(){return this.trend!==`up`&&this.trend!==`down`?`neutral`:this.trend===`up`===this.isLowerBetter?`negative`:`positive`}willUpdate(e){if(super.willUpdate(e),e.has(`tone`)){let e=ct(this.tone);this.tone!==e&&(this.tone=e)}if(e.has(`variant`)){let e=lt(this.variant);this.variant!==e&&(this.variant=e)}if(e.has(`sparklineData`)||e.has(`sparklineLabels`)){this.sparkline=this.computeSparkline();let e=this.sparkline?.points.length??0;this.activeIndex!==null&&this.activeIndex>=e&&(this.activeIndex=null)}e.has(`value`)&&(this.hasUpdated?this.spring.setTarget(this.value??0):this.spring.reset(this.value??0))}updated(e){if(super.updated(e),e.has(`trend`)||e.has(`trendValue`)){let e=this.renderRoot?.querySelector(`.trend-badge`);e&&q(e,{transform:[`scale(0.9)`,`scale(1)`],opacity:[0,1]},ys)}e.has(`sparklineData`)&&this.animateSparkline()}hasPlayedEntrance=!1;animateSparkline(){if(this.hasPlayedEntrance||ws())return;let e=this.renderRoot?.querySelector(`.sparkline-plot`);if(!e)return;this.hasPlayedEntrance=!0,e.animate?.({clipPath:[`inset(-12px 100% 0 0)`,`inset(-12px 0% 0 0)`]},{duration:900,easing:`cubic-bezier(${Cs.join(`, `)})`});let t=this.renderRoot?.querySelector(`.sparkline-dot`);t&&q(t,{transform:[`scale(0)`,`scale(1)`],opacity:[0,1]},{...ys,delay:.75})}handleIconSlotChange(e){let t=e.target;this.hasIcon=t.assignedNodes({flatten:!0}).length>0,this.requestUpdate()}handleFooterSlotChange(e){let t=e.target;this.hasFooter=t.assignedNodes({flatten:!0}).length>0,this.requestUpdate()}setActiveIndex(e){e!==this.activeIndex&&(this.activeIndex=e,this.requestUpdate())}handleSparklinePointer(e){let t=this.sparkline?.points.length??0,n=(this.renderRoot?.querySelector(`.sparkline-svg`))?.getBoundingClientRect();if(!t||!n?.width)return;let r=Math.min(Math.max((e.clientX-n.left)/n.width,0),1);this.setActiveIndex(Math.round(r*(t-1)))}handleSparklineLeave(){this.setActiveIndex(null)}handleSparklineKeydown(e){let t=this.sparkline?.points.length??0;if(!t)return;if(e.key===`Escape`){this.setActiveIndex(null);return}let n=this.activeIndex??t-1,r={ArrowLeft:n-1,ArrowDown:n-1,ArrowRight:n+1,ArrowUp:n+1,Home:0,End:t-1}[e.key];r!==void 0&&(e.preventDefault(),this.setActiveIndex(Math.min(Math.max(r,0),t-1)))}computeSparkline(){let e=this.sparklineLabels??[],t=(this.sparklineData??[]).map((t,n)=>({value:t,label:e[n]})).filter(e=>Number.isFinite(e.value));if(t.length<2)return null;let n=fu().domain([0,t.length-1]).range([0,Tm]),r=t.map(e=>e.value),i=Math.min(...r),a=Math.max(...r),o=fu().domain(i===a?[i-1,a+1]:[i,a]).range([Tm-Dm,Em]),s=t.map((e,t)=>({...e,x:n(t),y:o(e.value)})),c=(Ku().x(e=>e.x).y(e=>e.y).curve(nd)(s)??``).replace(/^M/,`L`),l=`M-50,${s[0].y}${c}H150`;return{points:s,linePath:l,areaPath:`${l}V${Tm}H-50Z`}}formatValue(e){if(this.valueFormatter)return this.valueFormatter(e);let t=km(this.value);return e.toLocaleString(void 0,{minimumFractionDigits:t,maximumFractionDigits:t})}renderSparkline(){if(!this.sparkline)return``;let{points:e,linePath:t,areaPath:n}=this.sparkline,r=this.activeIndex!==null,i=this.activeIndex??e.length-1,a=e[i],o=`stat-spark-${this.sparklineId}`,s=a.label?`${a.label}: ${this.formatValue(a.value)}`:this.formatValue(a.value);return B`
      <div
        class="sparkline"
        part="sparkline"
        style=${this.color?`--_stat-chart: ${this.color}`:``}
        ?data-active=${r}
        role="slider"
        tabindex="0"
        aria-label=${this.label}
        aria-valuemin="0"
        aria-valuemax=${e.length-1}
        aria-valuenow=${i}
        aria-valuetext=${s}
        @pointerdown=${this.handleSparklinePointer}
        @pointermove=${this.handleSparklinePointer}
        @pointerleave=${this.handleSparklineLeave}
        @pointercancel=${this.handleSparklineLeave}
        @keydown=${this.handleSparklineKeydown}
        @blur=${this.handleSparklineLeave}
      >
        <div class="sparkline-plot">
          <svg
            class="sparkline-svg"
            viewBox="0 0 ${Tm} ${Tm}"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="${o}" x1="0" y1="0" x2="0" y2="1">
                <stop class="sparkline-stop-start" offset="0%"></stop>
                <stop class="sparkline-stop-end" offset="100%"></stop>
              </linearGradient>
            </defs>
            <path class="sparkline-area" d="${n}" fill="url(#${o})" />
            <path class="sparkline-line" d="${t}" vector-effect="non-scaling-stroke" />
          </svg>
          <span class="sparkline-guide" style="left: ${Om(a.x)}"></span>
          <span
            class="sparkline-dot"
            style="left: ${Om(a.x)}; top: ${a.y}%"
          ></span>
        </div>
      </div>
      <span class="focus-ring" aria-hidden="true"></span>
    `}renderTrendIcon(e){return e===`up`?V`
        <svg class="trend-icon" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M5 1.75 8.75 8.25H1.25Z" />
        </svg>
      `:e===`down`?V`
        <svg class="trend-icon" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M5 8.25 8.75 1.75H1.25Z" />
        </svg>
      `:V`
      <svg class="trend-icon" viewBox="0 0 10 10" aria-hidden="true">
        <rect x="1.5" y="4.25" width="7" height="1.5" rx="0.75" />
      </svg>
    `}renderTrendBadge(){if(!this.trendValue&&this.trend===`neutral`)return``;let e=this.trend===`up`?`Up`:this.trend===`down`?`Down`:``;return B`
      <span
        class="trend-badge trend-${this.trend} is-${this.trendSentiment}"
        part="trend-badge"
      >
        ${this.renderTrendIcon(this.trend)}
        ${e?B`<span class="sr-only">${e}</span>`:``}
        ${this.trendValue?B`<span>${this.trendValue}</span>`:``}
      </span>
    `}render(){let e=this.activeIndex===null?void 0:this.sparkline?.points[this.activeIndex],t=this.formatValue(e?e.value:this.spring.displayValue),n=!!this.sparkline?.points.some(e=>e.label),r=e?.label??this.description;return B`
      <div class="header" part="header">
        <span class="icon" part="icon" ?hidden=${!this.hasIcon}>
          <slot name="icon" @slotchange=${this.handleIconSlotChange}></slot>
        </span>
        <span class="label" part="label">${this.label}</span>
        ${this.renderTrendBadge()}
      </div>

      <div class="body" part="body">
        <div class="value-row" part="value-row">
          ${this.prefix?B`<span class="prefix" part="prefix">${this.prefix}</span>`:``}
          <span class="value" part="value">${t}</span>
          ${this.suffix?B`<span class="suffix" part="suffix">${this.suffix}</span>`:``}
        </div>
        ${this.description||n?B`<span class="description" part="description">${r}</span>`:``}
      </div>

      <div class="footer" part="footer" ?hidden=${!this.hasFooter}>
        <slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot>
      </div>

      ${this.renderSparkline()}
    `}});var Am=[J,M`
    :host {
      display: inline-flex;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-3, 0.75rem);
      cursor: pointer;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      -webkit-tap-highlight-color: transparent;
    }

    /* Geometry: a pill thumb, wider than tall, inset by --_pad from either end */
    :host {
      --_track-w: 2.5rem;
      --_track-h: 1.25rem;
      --_track-radius: var(--radius-xl, 0.75rem);
      --_thumb-w: 1.375rem;
      --_thumb-h: 1rem;
      --_thumb-radius: var(--radius-lg, 0.5rem);
      --_pad: 0.125rem;
      --_track-bg: var(--color-default);
      --_track-bg-hover: color-mix(in oklab, var(--color-default) 80%, transparent);
    }

    :host([size='sm']) {
      --_track-w: 2rem;
      --_track-h: 1rem;
      --_track-radius: var(--radius-lg, 0.5rem);
      --_thumb-w: 1.03125rem;
      --_thumb-h: 0.75rem;
      --_thumb-radius: var(--radius-md, 0.375rem);
    }

    :host([size='lg']) {
      --_track-w: 3rem;
      --_track-h: 1.5rem;
      --_track-radius: var(--radius-xl, 0.75rem);
      --_thumb-w: 1.71875rem;
      --_thumb-h: 1.25rem;
      --_thumb-radius: var(--radius-xl, 0.75rem);
    }

    :host([is-checked]) {
      --_track-bg: var(--color-accent);
      --_track-bg-hover: var(--color-accent-hover);
    }

    [part~='track'] {
      position: relative;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      width: var(--_track-w);
      height: var(--_track-h);
      overflow: hidden;
      border-radius: var(--_track-radius);
      background-color: var(--_track-bg);
      transition:
        background-color 250ms var(--ease-smooth, ease),
        box-shadow 150ms var(--ease-out, ease-out);
    }

    @media (hover: hover) {
      [part~='base']:hover:not([data-disabled]) [part~='track'] {
        background-color: var(--_track-bg-hover);
      }
    }

    [part~='base']:active:not([data-disabled]) [part~='track'] {
      background-color: var(--_track-bg-hover);
    }

    :host(:focus-visible) {
      outline: none;
    }

    :host(:focus-visible) [part~='track'] {
      box-shadow: var(--focus-ring);
    }

    /* Margin, not translate, so the travel mirrors under RTL */
    [part~='thumb'] {
      display: block;
      flex-shrink: 0;
      width: var(--_thumb-w);
      height: var(--_thumb-h);
      margin-inline-start: var(--_pad);
      border-radius: var(--_thumb-radius);
      background-color: var(--color-white, #fff);
      box-shadow: var(--shadow-field);
      transition:
        margin 300ms var(--ease-out-fluid, ease-out),
        background-color 200ms var(--ease-out, ease-out);
      pointer-events: none;
    }

    :host([is-checked]) [part~='thumb'] {
      margin-inline-start: calc(100% - var(--_thumb-w) - var(--_pad));
      background-color: var(--color-accent-fg);
      box-shadow:
        0 0 5px 0 oklch(0 0 0 / 0.02),
        0 2px 10px 0 oklch(0 0 0 / 0.06),
        0 0 1px 0 oklch(0 0 0 / 0.3);
    }

    [part~='label'] {
      display: inline-flex;
      align-items: center;
      color: inherit;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    :host([is-disabled]:not([is-checked])) [part~='thumb'] {
      background-color: color-mix(in oklab, var(--color-default-fg) 20%, transparent);
    }

    :host([is-disabled][is-checked]) [part~='thumb'] {
      opacity: 0.4;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~='track'],
      [part~='thumb'] {
        transition: none;
      }
    }
  `];W(`moul-switch`,class extends U{static styles=Am;static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},isChecked:{type:Boolean,reflect:!0,attribute:`is-checked`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},label:{type:String,reflect:!0},size:{type:String,reflect:!0}};internalsController;constructor(){super(),this.name=``,this.value=`on`,this.isChecked=!1,this.isDisabled=!1,this.label=``,this.size=`md`,this.internalsController=new Rd(this)}connectedCallback(){super.connectedCallback(),this.setAttribute(`tabindex`,this.isDisabled?`-1`:`0`),this.addEventListener(`click`,this.handleClick),this.addEventListener(`keydown`,this.handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`click`,this.handleClick),this.removeEventListener(`keydown`,this.handleKeyDown)}toggle(){this.isDisabled||(this.isChecked=!this.isChecked,this.syncFormValue(),this.dispatchEvent(new CustomEvent(`change`,{detail:{isChecked:this.isChecked,value:this.value},bubbles:!0,composed:!0})))}willUpdate(e){super.willUpdate(e),(e.has(`isChecked`)||e.has(`value`))&&this.syncFormValue(),e.has(`isDisabled`)&&(this.setAttribute(`tabindex`,this.isDisabled?`-1`:`0`),this.isDisabled?this.setAttribute(`aria-disabled`,`true`):this.removeAttribute(`aria-disabled`))}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.textContent?.trim());Td(this,`switch`,t),this.setAttribute(`role`,`switch`),this.setAttribute(`aria-checked`,this.isChecked?`true`:`false`)}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}syncFormValue(){this.internalsController.setValue(this.isChecked?this.value:null)}handleClick=e=>{e.preventDefault(),this.toggle()};handleKeyDown=e=>{(e.key===` `||e.key===`Enter`)&&(e.preventDefault(),this.toggle())};render(){return B`
      <div part="base" ?data-disabled=${this.isDisabled}>
        <span part="track">
          <span part="thumb"></span>
        </span>
        <span part="label">
          <slot>${this.label}</slot>
        </span>
      </div>
    `}});var jm=[J,M`
    /* Secondary-surface frame; header sits on the frame, the body is a white card inside it */
    :host {
      display: block;
      width: 100%;
      overflow-x: auto;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      padding: 0 var(--spacing-1, 0.25rem) var(--spacing-1, 0.25rem);
      border-radius: min(2rem, calc(var(--radius-base, 0.5rem) * 2.5));
      background-color: var(--color-surface-secondary);
      scrollbar-width: thin;
      scrollbar-color: var(--color-scrollbar-thumb) transparent;
      /* HeroUI separator-tertiary at 50%: the hairline between body rows */
      --_row-separator: color-mix(
        in oklab,
        color-mix(in oklab, var(--color-surface) 81%, var(--color-fg) 19%) 50%,
        transparent
      );
      --_body-radius: var(--radius-2xl, 1rem);
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      text-align: start;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-fg, inherit);
    }

    thead {
      background-color: transparent;
    }

    /* Column headers: small muted labels with a short separator between columns */
    th {
      position: relative;
      padding: 0.625rem var(--spacing-4, 1rem);
      font-size: var(--font-size-xs, 0.75rem);
      line-height: var(--line-height-xs, 1rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-muted);
      user-select: none;
      text-align: start;
      white-space: nowrap;
      transition: color var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    th::after {
      content: "";
      position: absolute;
      inset-inline-end: 0;
      top: 50%;
      width: 1px;
      height: 1rem;
      transform: translateY(-50%);
      border-radius: var(--radius-sm, 0.25rem);
      background-color: var(--color-separator);
      pointer-events: none;
    }

    th:last-child::after {
      content: none;
    }

    th[aria-sort] {
      cursor: pointer;
    }

    @media (hover: hover) {
      th[aria-sort]:hover {
        color: var(--color-fg);
      }
    }

    .th-content {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1, 0.25rem);
    }

    .sort-icon {
      display: inline-grid;
      place-content: center;
      width: 0.75rem;
      height: 0.75rem;
      transition: transform 100ms var(--ease-out, ease-out);
    }

    .sort-icon.desc {
      transform: rotate(180deg);
    }

    .sort-icon svg {
      width: 100%;
      height: 100%;
    }

    /* Body cells carry the surface so the card's corners can be rounded per cell */
    td {
      padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
      vertical-align: middle;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--_row-separator);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:first-child td:first-child {
      border-start-start-radius: var(--_body-radius);
    }

    tbody tr:first-child td:last-child {
      border-start-end-radius: var(--_body-radius);
    }

    tbody tr:last-child td:first-child {
      border-end-start-radius: var(--_body-radius);
    }

    tbody tr:last-child td:last-child {
      border-end-end-radius: var(--_body-radius);
    }

    /* Hover and selection thin the surface so the frame shows through */
    @media (hover: hover) {
      tbody tr[part~="row"]:hover td {
        background-color: color-mix(in oklab, var(--color-surface) 40%, transparent);
      }
    }

    tbody tr[part~="row"][aria-selected="true"] td {
      background-color: color-mix(in oklab, var(--color-surface) 10%, transparent);
    }

    .checkbox-cell {
      width: 2.5rem;
      padding-inline: var(--spacing-2, 0.5rem);
      text-align: center;
    }

    .empty-cell {
      padding: var(--spacing-8, 2rem);
      text-align: center;
      color: var(--color-muted);
    }

    /* Footer sits on the frame, below the body card */
    tfoot {
      background-color: transparent;
    }

    ::slotted([slot="footer"]) {
      padding: 0.625rem var(--spacing-4, 1rem);
    }

    input[type="checkbox"] {
      cursor: pointer;
      accent-color: var(--color-accent);
    }

    @media (prefers-reduced-motion: reduce) {
      th,
      .sort-icon {
        transition: none;
      }
    }
  `],Mm={fromAttribute(e){if(!e)return[];try{return JSON.parse(e)}catch{return[]}},toAttribute(e){return JSON.stringify(e)}};W(`moul-table`,class extends U{static styles=jm;static properties={data:{type:Array,converter:Mm},columns:{type:Array,converter:Mm},isSortable:{type:Boolean,reflect:!0,attribute:`is-sortable`},isSelectable:{type:Boolean,reflect:!0,attribute:`is-selectable`},isLoading:{type:Boolean,reflect:!0,attribute:`is-loading`},selectedKeys:{type:Array,attribute:`selected-keys`,converter:Mm},sortColumn:{type:String,attribute:`sort-column`},sortDirection:{type:String,attribute:`sort-direction`}};constructor(){super(),this.data=[],this.columns=[],this.isSortable=!1,this.isSelectable=!1,this.isLoading=!1,this.selectedKeys=[],this.sortColumn=``,this.sortDirection=`asc`}getEffectiveColumns(){return this.columns&&this.columns.length>0?this.columns:this.data&&this.data.length>0?Object.keys(this.data[0]).map(e=>({key:e,title:e.charAt(0).toUpperCase()+e.slice(1),sortable:!0})):[]}handleSort(e){!this.isSortable||e.sortable===!1||(this.sortColumn===e.key?this.sortDirection=this.sortDirection===`asc`?`desc`:`asc`:(this.sortColumn=e.key,this.sortDirection=`asc`),this.dispatchEvent(new CustomEvent(`sortchange`,{bubbles:!0,composed:!0,detail:{column:this.sortColumn,direction:this.sortDirection}})),this.requestUpdate())}handleSelectAll(e){this.selectedKeys=e.target.checked?this.data.map((e,t)=>String(e.key??e.id??t)):[],this.dispatchEvent(new CustomEvent(`selectionchange`,{bubbles:!0,composed:!0,detail:{selectedKeys:this.selectedKeys}})),this.requestUpdate()}handleRowSelect(e,t){t.stopPropagation(),t.target.checked?this.selectedKeys.includes(e)||(this.selectedKeys=[...this.selectedKeys,e]):this.selectedKeys=this.selectedKeys.filter(t=>t!==e),this.dispatchEvent(new CustomEvent(`selectionchange`,{bubbles:!0,composed:!0,detail:{selectedKeys:this.selectedKeys}})),this.requestUpdate()}render(){let e=this.getEffectiveColumns(),t=e.length+ +!!this.isSelectable,n=this.data.length>0&&this.data.every((e,t)=>this.selectedKeys.includes(String(e.key??e.id??t)));return B`
      <table>
        <caption part="caption"><slot name="caption"></slot></caption>
        <thead>
          <tr>
            ${this.isSelectable?B`
                  <th class="checkbox-cell" part="header-checkbox">
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      .checked=${n}
                      @change=${this.handleSelectAll}
                    />
                  </th>
                `:``}
            ${e.map(e=>{let t=this.sortColumn===e.key;return B`
                <th
                  part="th"
                  aria-sort=${(this.isSortable?t?this.sortDirection===`asc`?`ascending`:`descending`:`none`:void 0)||void 0}
                  @click=${()=>this.handleSort(e)}
                >
                  <span class="th-content">
                    <span>${e.title}</span>
                    ${this.isSortable&&e.sortable!==!1?B`
                          <span class="sort-icon ${t&&this.sortDirection===`desc`?`desc`:``}">
                            ${ft()}
                          </span>
                        `:``}
                  </span>
                </th>
              `})}
          </tr>
        </thead>
        <tbody>
          ${this.isLoading?B`
                ${[0,1,2].map(()=>B`
                    <tr part="loading-row">
                      ${this.isSelectable?B`
                            <td class="checkbox-cell">
                              <moul-skeleton shape="rect" width="1rem" height="1rem"></moul-skeleton>
                            </td>
                          `:``}
                      ${e.map(()=>B`
                          <td>
                            <moul-skeleton shape="line" height="1.25rem"></moul-skeleton>
                          </td>
                        `)}
                    </tr>
                  `)}
              `:this.data.length===0?B`
                  <tr>
                    <td class="empty-cell" colspan=${t}>
                      <slot name="empty">No data available</slot>
                    </td>
                  </tr>
                `:this.data.map((t,n)=>{let r=String(t.key??t.id??n),i=this.selectedKeys.includes(r);return B`
                    <tr
                      part="row"
                      role="row"
                      aria-selected=${this.isSelectable?i?`true`:`false`:void 0}
                    >
                      ${this.isSelectable?B`
                            <td class="checkbox-cell">
                              <input
                                type="checkbox"
                                aria-label="Select row ${n+1}"
                                .checked=${i}
                                @change=${e=>this.handleRowSelect(r,e)}
                              />
                            </td>
                          `:``}
                      ${e.map(e=>B`<td>${String(t[e.key]??``)}</td>`)}
                    </tr>
                  `})}
        </tbody>
        <tfoot part="footer">
          <slot name="footer"></slot>
        </tfoot>
      </table>
    `}});var Nm=[J,M`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    :host([orientation="vertical"]) {
      flex-direction: row;
      gap: var(--spacing-4, 1rem);
    }

    [part~="base"] {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    :host([orientation="vertical"]) [part~="base"] {
      flex-direction: row;
      gap: var(--spacing-4, 1rem);
    }

    [part~="tablist"] {
      display: flex;
      flex-direction: row;
      position: relative;
      isolation: isolate;
      overflow-x: auto;
      scrollbar-width: none;
    }

    [part~="tablist"]::-webkit-scrollbar {
      display: none;
    }

    /* A scroll container's automatic min-size is 0; keep the panels from crushing it */
    :host([orientation="vertical"]) [part~="tablist"] {
      flex-direction: column;
      flex-shrink: 0;
    }

    /* Line: a hairline under the strip; the active tab carries a 2px accent underline */
    :host(:not([variant])) [part~="tablist"],
    :host([variant="line"]) [part~="tablist"] {
      border-bottom: 1px solid var(--color-border);
    }

    :host([orientation="vertical"]:not([variant])) [part~="tablist"],
    :host([orientation="vertical"][variant="line"]) [part~="tablist"] {
      border-bottom: none;
      border-inline-end: 1px solid var(--color-border);
    }

    /* Pill: a segmented control — a soft track, the active tab rides a raised segment */
    :host([variant="pill"]) [part~="tablist"] {
      padding: var(--spacing-1, 0.25rem);
      border-radius: calc(var(--radius-base, 0.5rem) * 2.5);
      background-color: var(--color-default);
    }

    :host([variant="pill"]:not([orientation="vertical"])) ::slotted([slot="tab"]) {
      flex: 1 1 0;
    }

    :host([variant="pill"][orientation="vertical"]) [part~="tablist"] {
      gap: var(--spacing-1, 0.25rem);
    }

    :host([variant="pill"][orientation="vertical"]) ::slotted([slot="tab"]) {
      min-width: 5rem;
    }

    /* Enclosed: folder tabs; the active one opens onto the content below */
    :host([variant="enclosed"]) [part~="tablist"] {
      gap: var(--spacing-1, 0.25rem);
      box-shadow: inset 0 -1px 0 var(--color-border);
    }

    :host([variant="enclosed"][orientation="vertical"]) [part~="tablist"] {
      box-shadow: inset -1px 0 0 var(--color-border);
    }

    [part~="indicator"] {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      pointer-events: none;
      opacity: 0;
      transition:
        translate 250ms var(--ease-out-fluid, ease-out),
        width 250ms var(--ease-out-fluid, ease-out),
        height 250ms var(--ease-out-fluid, ease-out),
        opacity var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    [part~="indicator"][data-visible] {
      opacity: 1;
    }

    :host(:not([variant])) [part~="indicator"]::after,
    :host([variant="line"]) [part~="indicator"]::after {
      content: "";
      position: absolute;
      inset: auto 0 0;
      height: 2px;
      background-color: var(--color-accent);
    }

    :host([orientation="vertical"]:not([variant])) [part~="indicator"]::after,
    :host([orientation="vertical"][variant="line"]) [part~="indicator"]::after {
      inset-block: 0;
      inset-inline: auto 0;
      width: 2px;
      height: auto;
    }

    :host([variant="pill"]) [part~="indicator"] {
      border-radius: var(--radius-3xl, 1.5rem);
      background-color: var(--color-segment);
      box-shadow: var(--shadow-surface);
    }

    :host([variant="enclosed"]) [part~="indicator"] {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-bottom-color: transparent;
      border-radius: var(--radius-xl, 0.75rem) var(--radius-xl, 0.75rem) 0 0;
    }

    :host([variant="enclosed"][orientation="vertical"]) [part~="indicator"] {
      border-bottom-color: var(--color-border);
      border-right-color: transparent;
      border-radius: var(--radius-xl, 0.75rem) 0 0 var(--radius-xl, 0.75rem);
    }

    @media (prefers-reduced-motion: reduce) {
      [part~="indicator"] {
        transition: none;
      }
    }

    [part~="panels"] {
      display: block;
      width: 100%;
      position: relative;
    }
  `],Pm=[J,M`
    :host {
      display: inline-flex;
      position: relative;
      z-index: 1;
      -webkit-tap-highlight-color: transparent;
    }

    [part~="base"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 2rem;
      padding: 0 var(--spacing-4, 1rem);
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-muted);
      text-align: center;
      white-space: nowrap;
      background: transparent;
      border: none;
      border-radius: 0;
      outline: none;
      cursor: pointer;
      user-select: none;
      transition:
        color 150ms var(--ease-smooth, ease),
        background-color 150ms var(--ease-smooth, ease),
        box-shadow 150ms var(--ease-out, ease-out),
        opacity 150ms var(--ease-smooth, ease);
    }

    :host([data-variant="pill"]) [part~="base"] {
      border-radius: var(--radius-3xl, 1.5rem);
    }

    :host([data-variant="enclosed"]) [part~="base"] {
      border-radius: var(--radius-xl, 0.75rem) var(--radius-xl, 0.75rem) 0 0;
    }

    :host([aria-selected="true"]) [part~="base"],
    :host([is-selected]) [part~="base"] {
      color: var(--color-fg);
    }

    @media (hover: hover) {
      :host(:not([is-selected])) [part~="base"]:hover:not(:disabled) {
        opacity: 0.7;
      }
    }

    :host([is-disabled]) [part~="base"],
    [part~="base"]:disabled {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    :host(:focus-visible) {
      outline: none;
    }

    :host(:focus-visible) [part~="base"] {
      box-shadow: var(--focus-ring);
    }

    @media (prefers-reduced-motion: reduce) {
      [part~="base"] {
        transition: none;
      }
    }
  `],Fm=[J,M`
    :host {
      display: block;
      padding: var(--spacing-4, 1rem) 0;
      color: var(--color-fg);
      border-radius: var(--radius-xl, 0.75rem);
      outline: none;
    }

    :host([hidden]),
    [hidden] {
      display: none !important;
    }

    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--focus-ring);
    }
  `];W(`moul-tab`,class extends U{static styles=Pm;static properties={key:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isSelected:{type:Boolean,reflect:!0,attribute:`is-selected`}};pressController;constructor(){super(),this.key=``,this.isDisabled=!1,this.isSelected=!1,this.pressController=new wd(this,{disabled:()=>this.isDisabled})}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`tab`),this.updateAriaAttributes()}updated(e){super.updated(e),(e.has(`isSelected`)||e.has(`isDisabled`))&&this.updateAriaAttributes()}updateAriaAttributes(){this.setAttribute(`aria-selected`,this.isSelected?`true`:`false`),this.setAttribute(`tabindex`,this.isSelected&&!this.isDisabled?`0`:`-1`),this.isDisabled?this.setAttribute(`aria-disabled`,`true`):this.removeAttribute(`aria-disabled`)}render(){return B`
      <button
        part="base"
        type="button"
        ?disabled=${this.isDisabled}
        tabindex="-1"
        aria-hidden="true"
      >
        <slot></slot>
      </button>
    `}}),W(`moul-tab-panel`,class extends U{static styles=Fm;static properties={key:{type:String,reflect:!0}};constructor(){super(),this.key=``}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`tabpanel`),this.setAttribute(`tabindex`,`0`)}reveal(){this.hasAttribute(`hidden`)&&(this.removeAttribute(`hidden`),q(this,{opacity:[0,1]},{duration:.15,ease:Ss}))}hide(){this.setAttribute(`hidden`,``)}render(){return B`<slot></slot>`}}),W(`moul-tabs`,class extends U{static styles=Nm;static properties={selectedKey:{type:String,reflect:!0,attribute:`selected-key`},orientation:{type:String,reflect:!0},variant:{type:String,reflect:!0}};resizeObserver=null;constructor(){super(),this.selectedKey=``,this.orientation=`horizontal`,this.variant=`pill`}connectedCallback(){super.connectedCallback(),this.setAttribute(`role`,`tablist`),this.setAttribute(`aria-orientation`,this.orientation),this.addEventListener(`click`,this.handleTabClick),this.addEventListener(`keydown`,this.handleKeyDown),this.distributeTabsAndPanels()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`click`,this.handleTabClick),this.removeEventListener(`keydown`,this.handleKeyDown),this.resizeObserver?.disconnect(),this.resizeObserver=null}firstUpdated(){if(typeof ResizeObserver>`u`)return;this.resizeObserver=new ResizeObserver(()=>this.updateIndicator(!0));let e=this.shadowRoot?.querySelector(`[part="tablist"]`);e&&this.resizeObserver.observe(e);for(let e of this.getTabs())this.resizeObserver.observe(e)}updated(e){super.updated(e),e.has(`orientation`)&&this.setAttribute(`aria-orientation`,this.orientation),(e.has(`selectedKey`)||e.has(`variant`))&&this.syncSelection()}distributeTabsAndPanels(){let e=Array.from(this.querySelectorAll(`moul-tab`));for(let t of e)t.hasAttribute(`slot`)||t.setAttribute(`slot`,`tab`)}handleSlotChange(){this.distributeTabsAndPanels(),this.syncSelection()}getTabs(){return Array.from(this.querySelectorAll(`moul-tab`))}getPanels(){return Array.from(this.querySelectorAll(`moul-tab-panel`))}syncSelection(){let e=this.getTabs(),t=this.getPanels();if(e.length===0)return;let n=e.filter(e=>!e.isDisabled);if(n.length!==0){n.some(e=>e.key===this.selectedKey)||(this.selectedKey=n[0].key);for(let t of e)t.isSelected=t.key===this.selectedKey,t.dataset.variant=this.variant;for(let e of t)e.key===this.selectedKey?e.reveal():e.hide();this.updateIndicator()}}updateIndicator(e=!1){let t=this.shadowRoot?.querySelector(`[part="indicator"]`),n=this.shadowRoot?.querySelector(`[part="tablist"]`);if(!t||!n)return;let r=this.getTabs().find(e=>e.key===this.selectedKey)??null,i=()=>Ps(t,n,r,e);r?r.updateComplete.then(i):i()}handleTabClick=e=>{let t=e.target.closest(`moul-tab`);!t||t.isDisabled||t.key&&t.key!==this.selectedKey&&(this.selectedKey=t.key,this.dispatchEvent(new CustomEvent(`selectionchange`,{bubbles:!0,composed:!0,detail:{selectedKey:this.selectedKey}})))};handleKeyDown=e=>{let t=this.getTabs().filter(e=>!e.isDisabled);if(t.length===0)return;let n=t.findIndex(e=>e.key===this.selectedKey),r=-1;switch(e.key){case`ArrowRight`:case`ArrowDown`:e.preventDefault(),r=(n+1)%t.length;break;case`ArrowLeft`:case`ArrowUp`:e.preventDefault(),r=(n-1+t.length)%t.length;break;case`Home`:e.preventDefault(),r=0;break;case`End`:e.preventDefault(),r=t.length-1;break;default:return}if(r>=0&&r!==n){let e=t[r];this.selectedKey=e.key,e.focus(),this.dispatchEvent(new CustomEvent(`selectionchange`,{bubbles:!0,composed:!0,detail:{selectedKey:this.selectedKey}}))}};render(){return B`
      <div part="base">
        <div part="tablist" class="tablist">
          <slot name="tab" @slotchange=${this.handleSlotChange}></slot>
          <div part="indicator" class="indicator"></div>
        </div>
        <div part="panels" class="panels">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `}});var Im=[J,ut,M`
    :host {
      display: inline-flex;
      align-items: center;
      position: relative;
      gap: var(--spacing-1, 0.25rem);
      box-sizing: border-box;
      border-radius: var(--radius-xl, 0.75rem);
      font-family: var(--font-family-base, inherit);
      font-weight: var(--font-weight-medium, 500);
      line-height: 1;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition:
        color 100ms var(--ease-smooth, ease),
        opacity 100ms var(--ease-smooth, ease),
        background-color 100ms var(--ease-smooth, ease),
        box-shadow 100ms var(--ease-out, ease-out),
        scale var(--duration-fast, 150ms) var(--ease-out, ease-out);
    }

    /* scale, not transform: removal animates transform on the host */
    :host(:not([is-disabled]):active) {
      scale: var(--press-scale, 0.97);
    }

    [part~="base"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
      height: 100%;
    }

    ::slotted(svg) {
      width: 0.75rem;
      height: 0.75rem;
      flex-shrink: 0;
      pointer-events: none;
    }

    /* Sizes */
    :host([size="sm"]) {
      height: 1.25rem;
      padding: 0 var(--spacing-2, 0.5rem);
      font-size: var(--font-size-xs, 0.75rem);
    }

    :host([size="md"]),
    :host(:not([size])) {
      height: 1.5rem;
      padding: 0 var(--spacing-2, 0.5rem);
      font-size: var(--font-size-xs, 0.75rem);
    }

    :host([size="lg"]) {
      height: 2rem;
      padding: 0 0.625rem;
      font-size: var(--font-size-sm, 0.875rem);
      border-radius: var(--radius-2xl, 1rem);
    }

    /* The default tag (flat + primary) is a neutral chip, as in HeroUI */
    :host([variant="flat"][tone="primary"]) {
      background-color: var(--color-default);
      color: var(--color-default-fg);
    }

    @media (hover: hover) {
      :host([variant="flat"][tone="primary"]:not([is-selected]):hover) {
        background-color: var(--color-default-hover);
      }
    }

    /* Selected: a neutral tag turns accent-soft; a toned tag fills solid */
    :host([is-selected]) {
      background-color: var(--_tone-solid-bg);
      color: var(--_tone-solid-fg);
      border-color: transparent;
    }

    :host([is-selected][variant="flat"][tone="primary"]) {
      background-color: var(--color-accent-soft);
      color: var(--color-accent-soft-fg);
    }

    @media (hover: hover) {
      :host([is-selected][variant="flat"][tone="primary"]:hover) {
        background-color: var(--color-accent-soft-hover);
      }
    }

    :host(:focus-visible) {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    /* A 12px glyph with a 24px invisible hit area */
    .remove-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 0.75rem;
      height: 0.75rem;
      padding: 0;
      border: none;
      background: transparent;
      color: inherit;
      border-radius: var(--radius-full, 9999px);
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 100ms var(--ease-smooth, ease);
    }

    .remove-button::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 1.5rem;
      height: 1.5rem;
      translate: -50% -50%;
    }

    @media (hover: hover) {
      .remove-button:hover {
        opacity: 1;
      }
    }

    .remove-button:focus-visible {
      opacity: 1;
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .remove-button svg {
      width: 100%;
      height: 100%;
    }

    @media (prefers-reduced-motion: reduce) {
      :host,
      .remove-button {
        transition: none;
      }

      :host(:not([is-disabled]):active) {
        scale: none;
      }
    }
  `],Lm=[J,M`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      box-sizing: border-box;
    }

    [part~="label"] {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--color-fg, inherit);
    }

    [part~="container"] {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      align-items: center;
    }
  `];W(`moul-tag`,class extends U{static styles=Im;static properties={key:{type:String,reflect:!0},tone:{type:String,reflect:!0},variant:{type:String,reflect:!0},size:{type:String,reflect:!0},isSelected:{type:Boolean,reflect:!0,attribute:`is-selected`},isRemovable:{type:Boolean,reflect:!0,attribute:`is-removable`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`}};pressController;constructor(){super(),this.key=``,this.tone=`primary`,this.variant=`flat`,this.size=`md`,this.isSelected=!1,this.isRemovable=!1,this.isDisabled=!1,this.pressController=new wd(this,{disabled:()=>this.isDisabled})}connectedCallback(){super.connectedCallback(),this.hasAttribute(`role`)||this.setAttribute(`role`,`button`),this.addEventListener(`click`,this.handleClick)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`click`,this.handleClick)}updated(e){if(super.updated(e),e.has(`isSelected`)&&this.setAttribute(`aria-selected`,String(this.isSelected)),e.has(`tone`)){let e=ct(this.tone);this.tone!==e&&(this.tone=e)}if(e.has(`variant`)){let e=lt(this.variant);this.variant!==e&&(this.variant=e)}}handleClick=()=>{this.isDisabled||this.dispatchEvent(new CustomEvent(`press`,{bubbles:!0,composed:!0,detail:{key:this.key,isSelected:!this.isSelected}}))};handleRemove=async e=>{e.stopPropagation(),e.preventDefault();let t=q(this,{transform:[`scale(1)`,`scale(0.9)`],opacity:[1,0]},{duration:.12,ease:Ss});t?.finished&&await t.finished,this.dispatchEvent(new CustomEvent(`remove`,{bubbles:!0,composed:!0,detail:{key:this.key}}))};render(){return B`
      <span part="base">
        <slot></slot>
        ${this.isRemovable?B`
              <button
                class="remove-button"
                part="remove-button"
                aria-label="Remove tag"
                @click=${this.handleRemove}
              >
                ${dt()}
              </button>
            `:``}
      </span>
    `}}),W(`moul-tag-group`,class extends U{static styles=Lm;static properties={selectedKeys:{type:Array,attribute:`selected-keys`},selectionMode:{type:String,reflect:!0,attribute:`selection-mode`},isRemovable:{type:Boolean,reflect:!0,attribute:`is-removable`},label:{type:String,reflect:!0}};constructor(){super(),this.selectedKeys=[],this.selectionMode=`none`,this.isRemovable=!1,this.label=``}connectedCallback(){super.connectedCallback(),this.hasAttribute(`role`)||this.setAttribute(`role`,this.selectionMode===`none`?`group`:`listbox`),this.label&&this.setAttribute(`aria-label`,this.label),this.addEventListener(`press`,this.handleTagPress),this.addEventListener(`remove`,this.handleTagRemove)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`press`,this.handleTagPress),this.removeEventListener(`remove`,this.handleTagRemove)}updated(e){super.updated(e),e.has(`selectionMode`)&&this.setAttribute(`role`,this.selectionMode===`none`?`group`:`listbox`),e.has(`label`)&&this.label&&this.setAttribute(`aria-label`,this.label),(e.has(`selectedKeys`)||e.has(`isRemovable`))&&this.syncChildren()}hasSeededFromChildren=!1;syncChildren(){let e=((this.shadowRoot?.querySelector(`slot`))?.assignedElements()??[]).filter(e=>e.tagName.toLowerCase()===`moul-tag`);if(!this.hasSeededFromChildren&&e.length>0&&(this.hasSeededFromChildren=!0,this.selectedKeys.length===0)){let t=e.filter(e=>e.isSelected||e.hasAttribute(`is-selected`)).map(e=>e.key);t.length>0&&(this.selectedKeys=t)}e.forEach(e=>{this.isRemovable&&!e.hasAttribute(`is-removable`)&&(e.isRemovable=!0),e.isSelected=this.selectedKeys.includes(e.key)})}handleSlotChange=()=>{this.syncChildren()};handleTagPress=e=>{if(this.selectionMode===`none`)return;let t=e.detail?.key;t&&(this.selectionMode===`single`?this.selectedKeys=this.selectedKeys.includes(t)?[]:[t]:this.selectionMode===`multiple`&&(this.selectedKeys=this.selectedKeys.includes(t)?this.selectedKeys.filter(e=>e!==t):[...this.selectedKeys,t]),this.syncChildren(),this.dispatchEvent(new CustomEvent(`selectionchange`,{bubbles:!0,composed:!0,detail:{selectedKeys:this.selectedKeys}})))};handleTagRemove=e=>{let t=e.detail?.key;t&&this.selectedKeys.includes(t)&&(this.selectedKeys=this.selectedKeys.filter(e=>e!==t),this.syncChildren(),this.dispatchEvent(new CustomEvent(`selectionchange`,{bubbles:!0,composed:!0,detail:{selectedKeys:this.selectedKeys}})))};render(){return B`
      ${this.label?B`<span class="label" part="label">${this.label}</span>`:``}
      <div class="tag-container" part="container">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `}});var Rm=[J,M`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    /* Flex drops template whitespace so the required mark sits tight to the text */
    [part~='label'] {
      display: flex;
      align-items: baseline;
      line-height: var(--line-height-sm, 1.25rem);
    }

    :host([is-required][label]:not([label=''])) [part~='label']::after {
      content: '*';
      margin-inline-start: 0.125rem;
      color: var(--color-danger);
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='label'] {
      color: var(--color-danger);
    }

    [part~='textarea'] {
      display: block;
      width: 100%;
      min-height: 2.375rem;
      margin: 0;
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
      resize: vertical;
    }

    :host([auto-resize]) [part~='textarea'] {
      field-sizing: content;
      resize: none;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    :host([is-disabled]) [part~='textarea'] {
      cursor: not-allowed;
    }

    /* :host raises specificity past the shared shell's transition */
    @media (prefers-reduced-motion: reduce) {
      :host [part~='textarea'] {
        transition: none;
      }
    }
  `,Vd];W(`moul-text-area`,class extends U{static styles=Rm;static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},rows:{type:Number,reflect:!0},autoResize:{type:Boolean,reflect:!0,attribute:`auto-resize`},placeholder:{type:String,reflect:!0},label:{type:String,reflect:!0},description:{type:String,reflect:!0},errorMessage:{type:String,reflect:!0,attribute:`error-message`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},isReadonly:{type:Boolean,reflect:!0,attribute:`is-readonly`}};internalsController;constructor(){super(),this.name=``,this.value=``,this.rows=3,this.autoResize=!1,this.placeholder=``,this.label=``,this.description=``,this.errorMessage=``,this.isDisabled=!1,this.isRequired=!1,this.isReadonly=!1,this.internalsController=new Rd(this)}get textareaElement(){return this.renderRoot?.querySelector(`textarea`)??null}focus(e){this.textareaElement?.focus(e)}blur(){this.textareaElement?.blur()}select(){this.textareaElement?.select()}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}adjustHeight(){if(!this.autoResize)return;let e=this.textareaElement;e&&(e.style.height=`auto`,e.style.height=`${e.scrollHeight}px`)}willUpdate(e){super.willUpdate(e),(e.has(`value`)||e.has(`isRequired`)||e.has(`errorMessage`))&&this.syncFormValueAndValidity()}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.querySelector(`[slot="label"]`));if(Td(this,`text area`,t),this.autoResize&&this.adjustHeight(),e.has(`errorMessage`)&&this.errorMessage){let e=this.renderRoot?.querySelector(`[part="error"]`);e&&q(e,{transform:[`translateY(-4px)`,`translateY(0px)`],opacity:[0,1]},{duration:.2,ease:Ss})}}syncFormValueAndValidity(){if(this.internalsController.setValue(this.value||null),this.isRequired&&!this.value){let e=this.errorMessage||`This field is required.`;this.internalsController.setValidity({valueMissing:!0},e),this.setAttribute(`is-invalid`,``)}else this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`)}handleInput=e=>{let t=e.target;this.value=t.value,this.syncFormValueAndValidity(),this.adjustHeight(),this.dispatchEvent(new Event(`input`,{bubbles:!0,composed:!0}))};handleChange=e=>{this.dispatchEvent(new Event(`change`,{bubbles:!0,composed:!0}))};render(){let e=this.hasAttribute(`is-invalid`),t=[this.description?`description`:``,this.errorMessage?`error`:``].filter(Boolean).join(` `);return B`
      <div part="base">
        <label part="label" for="textarea">
          <slot name="label">${this.label}</slot>
        </label>

        <textarea
          id="textarea"
          part="textarea"
          rows=${this.rows}
          placeholder=${this.placeholder}
          .value=${this.value}
          ?disabled=${this.isDisabled}
          ?required=${this.isRequired}
          ?readonly=${this.isReadonly}
          aria-invalid=${e?`true`:`false`}
          aria-describedby=${t||H}
          @input=${this.handleInput}
          @change=${this.handleChange}
        ></textarea>

        ${this.description?B`<div id="description" part="description"><slot name="description">${this.description}</slot></div>`:B`<slot name="description"></slot>`}
        ${this.errorMessage?B`<div id="error" part="error"><slot name="error">${this.errorMessage}</slot></div>`:B`<slot name="error"></slot>`}
      </div>
    `}});var zm=[J,M`
    :host {
      display: block;
      width: 100%;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
    }

    :host([hidden]) {
      display: none !important;
    }

    [part~='base'] {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    /* Flex drops template whitespace so the required mark sits tight to the text */
    [part~='label'] {
      display: flex;
      align-items: baseline;
      line-height: var(--line-height-sm, 1.25rem);
    }

    :host([is-required][label]:not([label=''])) [part~='label']::after {
      content: '*';
      margin-inline-start: 0.125rem;
      color: var(--color-danger);
    }

    :host([is-invalid]:is([data-touched], [error-message]:not([error-message='']))) [part~='label'] {
      color: var(--color-danger);
    }

    [part~='input-container'] {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
      min-height: 2.25rem;
      font-size: var(--font-size-sm, 0.875rem);
    }

    [part~='input'] {
      flex: 1;
      width: 100%;
      min-width: 0;
      border: none;
      border-radius: 0;
      outline: none;
      background: transparent;
      box-shadow: none;
      color: inherit;
      font-family: inherit;
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding: var(--spacing-2, 0.5rem) var(--spacing-3, 0.75rem);
    }

    /* Keep the browser's autofill paint from drawing a square box inside the rounded shell */
    [part~='input']:-webkit-autofill {
      box-shadow: 0 0 0 1000px transparent inset;
      -webkit-text-fill-color: var(--color-field-fg);
      caret-color: var(--color-field-fg);
      transition: background-color 9999s ease-in-out 0s;
    }

    [part~='prefix'],
    [part~='suffix'] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    :host([is-disabled]) {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    :host([is-disabled]) [part~='input'] {
      cursor: not-allowed;
    }

    /* :host raises specificity past the shared shell's transition */
    @media (prefers-reduced-motion: reduce) {
      :host [part~='input-container'] {
        transition: none;
      }
    }
  `,Vd];W(`moul-text-field`,class extends U{static styles=zm;static formAssociated=!0;static properties={name:{type:String,reflect:!0},value:{type:String,reflect:!0},type:{type:String,reflect:!0},placeholder:{type:String,reflect:!0},label:{type:String,reflect:!0},description:{type:String,reflect:!0},errorMessage:{type:String,reflect:!0,attribute:`error-message`},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`},isRequired:{type:Boolean,reflect:!0,attribute:`is-required`},isReadonly:{type:Boolean,reflect:!0,attribute:`is-readonly`}};internalsController;constructor(){super(),this.name=``,this.value=``,this.type=`text`,this.placeholder=``,this.label=``,this.description=``,this.errorMessage=``,this.isDisabled=!1,this.isRequired=!1,this.isReadonly=!1,this.internalsController=new Rd(this)}get inputElement(){return this.renderRoot?.querySelector(`input`)??null}focus(e){this.inputElement?.focus(e)}blur(){this.inputElement?.blur()}select(){this.inputElement?.select()}checkValidity(){return this.internalsController.checkValidity()}reportValidity(){return this.internalsController.reportValidity()}get validity(){return this.internalsController.validity}get validationMessage(){return this.internalsController.validationMessage}willUpdate(e){super.willUpdate(e),(e.has(`value`)||e.has(`isRequired`)||e.has(`errorMessage`))&&this.syncFormValueAndValidity()}updated(e){super.updated(e);let t=!!(this.label||this.getAttribute(`aria-label`)||this.getAttribute(`aria-labelledby`)||this.querySelector(`[slot="label"]`));if(Td(this,`text field`,t),e.has(`errorMessage`)&&this.errorMessage){let e=this.renderRoot?.querySelector(`[part="error"]`);e&&q(e,{transform:[`translateY(-4px)`,`translateY(0px)`],opacity:[0,1]},{duration:.2,ease:Ss})}}syncFormValueAndValidity(){if(this.internalsController.setValue(this.value),this.isRequired&&!this.value){let e=this.errorMessage||`This field is required.`;this.internalsController.setValidity({valueMissing:!0},e),this.setAttribute(`is-invalid`,``)}else this.internalsController.setValidity({}),this.removeAttribute(`is-invalid`)}handleInput=e=>{let t=e.target;this.value=t.value,this.syncFormValueAndValidity(),this.dispatchEvent(new Event(`input`,{bubbles:!0,composed:!0}))};handleChange=e=>{this.dispatchEvent(new Event(`change`,{bubbles:!0,composed:!0}))};render(){let e=this.hasAttribute(`is-invalid`),t=[this.description?`description`:``,this.errorMessage?`error`:``].filter(Boolean).join(` `);return B`
      <div part="base">
        <label part="label" for="input">
          <slot name="label">${this.label}</slot>
        </label>

        <div
          part="input-container"
          ?data-invalid=${e}
          ?data-disabled=${this.isDisabled}
        >
          <span part="prefix"><slot name="prefix"></slot></span>
          <input
            id="input"
            part="input"
            type=${this.type}
            placeholder=${this.placeholder}
            .value=${this.value}
            ?disabled=${this.isDisabled}
            ?required=${this.isRequired}
            ?readonly=${this.isReadonly}
            aria-invalid=${e?`true`:`false`}
            aria-describedby=${t||H}
            @input=${this.handleInput}
            @change=${this.handleChange}
          />
          <span part="suffix"><slot name="suffix"></slot></span>
        </div>

        ${this.description?B`<div id="description" part="description"><slot name="description">${this.description}</slot></div>`:B`<slot name="description"></slot>`}
        ${this.errorMessage?B`<div id="error" part="error"><slot name="error">${this.errorMessage}</slot></div>`:B`<slot name="error"></slot>`}
      </div>
    `}});var Bm=[J,ut,M`
    :host {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      padding: var(--spacing-3, 0.75rem) var(--spacing-4, 1rem);
      border-radius: var(--radius-surface, 1.5rem);
      width: min(380px, calc(100vw - 2rem));
      box-sizing: border-box;
      /* Floating: every variant keeps a lift unless it brings its own shadow */
      box-shadow: var(--shadow-overlay);
      pointer-events: auto;
      font-family: var(--font-family-base, inherit);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      position: relative;
    }

    /* Default: a plain surface; the title (and status indicators) carry the tone */
    :host(:not([variant])) {
      background-color: var(--color-surface);
      color: var(--color-fg);
      border: none;
    }

    :host(:not([variant])) [part~="title"],
    :host(:not([variant])) ::slotted([slot="title"]) {
      color: var(--_tone-soft-fg);
    }

    :host(:not([variant])[tone="success"]) [part~="icon"],
    :host(:not([variant])[tone="warning"]) [part~="icon"],
    :host(:not([variant])[tone="error"]) [part~="icon"] {
      color: var(--_tone-soft-fg);
    }

    :host(:not([variant])) [part~="description"] {
      color: var(--color-muted);
    }

    /* On tinted variants the description is a softer shade of the variant's text color */
    :host([variant]) [part~="description"] {
      color: color-mix(in oklch, currentColor 85%, transparent);
    }

    /* Opt-in glass: notifications float over arbitrary content, so use the thick material */
    :host([variant="glass"]) {
      color: var(--color-fg);
      background-color: color-mix(in oklch, var(--_tone-soft-bg) 22%, var(--glass-bg-thick));
    }

    :host([variant="glass"]) [part~="icon"] {
      color: var(--_tone-solid-bg);
    }

    [part~="base"] {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 0.375rem;
      width: 100%;
    }

    /* 1rem glyph in a 1.5rem box */
    [part~="icon"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: content-box;
      width: 1rem;
      height: 1rem;
      padding: var(--spacing-1, 0.25rem);
      user-select: none;
    }

    [part~="icon"] svg,
    ::slotted([slot="icon"]) {
      width: 1rem;
      height: 1rem;
    }

    [part~="content"] {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      align-self: center;
      flex: 1 1 auto;
      min-width: 0;
    }

    [part~="title"],
    ::slotted([slot="title"]) {
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-sm, 1.25rem);
    }

    [part~="description"] {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
    }

    [part~="actions"] {
      display: inline-flex;
      align-items: center;
      align-self: center;
      gap: var(--spacing-2, 0.5rem);
      flex-shrink: 0;
      margin-inline-start: auto;
    }

    /* Close button: a small bordered disc on the top-end corner, revealed on hover or focus */
    .dismiss-button {
      position: absolute;
      top: calc(-1 * var(--spacing-1, 0.25rem));
      inset-inline-end: calc(-1 * var(--spacing-1, 0.25rem));
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full, 9999px);
      background-color: var(--color-bg-elevated);
      color: var(--color-muted);
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition:
        opacity 150ms var(--ease-smooth, ease),
        background-color 100ms var(--ease-out, ease-out);
    }

    :host(:hover) .dismiss-button,
    :host(:focus-within) .dismiss-button {
      opacity: 1;
      pointer-events: auto;
    }

    /* No hover on touch screens: keep the close button visible */
    @media (hover: none) {
      .dismiss-button {
        opacity: 1;
        pointer-events: auto;
      }
    }

    @media (hover: hover) {
      .dismiss-button:hover {
        background-color: var(--color-default);
      }
    }

    .dismiss-button:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .dismiss-button svg {
      width: 0.75rem;
      height: 0.75rem;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .dismiss-button {
        transition: none;
      }
    }
  `],Vm=[J,M`
    :host {
      position: fixed;
      inset: auto;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      overflow: visible;
      color: inherit;
      z-index: var(--z-toast, 1700);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3, 0.75rem);
      pointer-events: none;
      box-sizing: border-box;
      max-width: calc(100vw - 2rem);
      max-height: calc(100vh - 2rem);
      --_edge: var(--spacing-4, 1rem);
    }

    /* Popover UA styles hide closed popovers; keep the fallback stack visible */
    :host(:not([popover])) {
      display: flex;
    }

    :host([popover]:not(:popover-open)) {
      display: none;
    }

    /* Bottom stacks grow upward from the edge, newest nearest the edge */
    :host(:not([placement])),
    :host([placement^="bottom"]) {
      bottom: var(--_edge);
      justify-content: flex-end;
    }

    /* Top stacks grow downward, newest nearest the edge */
    :host([placement^="top"]) {
      top: var(--_edge);
      flex-direction: column-reverse;
      justify-content: flex-end;
    }

    :host(:not([placement])),
    :host([placement$="end"]) {
      right: var(--_edge);
      align-items: flex-end;
    }

    :host([placement$="start"]) {
      left: var(--_edge);
      align-items: flex-start;
    }

    /* translate (not margin:auto) so page-level resets can't de-center the stack */
    :host([placement$="center"]) {
      left: 50%;
      translate: -50% 0;
      align-items: center;
    }
  `];W(`moul-toast`,class extends U{static styles=Bm;static properties={tone:{type:String,reflect:!0},variant:{type:String,reflect:!0,useDefault:!0},duration:{type:Number,reflect:!0},title:{type:String},description:{type:String,reflect:!0},isOpen:{type:Boolean,reflect:!0,attribute:`is-open`}};overlayPresence;timerId=null;remainingTime=0;timerStartedAt=0;constructor(){super(),this.tone=`primary`,this.variant=`flat`,this.duration=5e3,this.title=``,this.description=``,this.isOpen=!0,this.overlayPresence=new Xs(this,{preset:`toast`,popover:()=>null,dialog:()=>null})}connectedCallback(){super.connectedCallback();let e=this.closest(`moul-toast-region`);this.overlayPresence.preset=e?.isTop?`toast-top`:`toast`;let t=this.tone===`error`;this.setAttribute(`role`,t?`alert`:`status`),this.setAttribute(`aria-live`,t?`assertive`:`polite`),this.addEventListener(`pointerenter`,this.handlePointerEnter),this.addEventListener(`pointerleave`,this.handlePointerLeave),this.isOpen&&(this.startDismissTimer(this.duration),this.overlayPresence.setOpen(!0))}disconnectedCallback(){super.disconnectedCallback(),this.clearDismissTimer(),this.removeEventListener(`pointerenter`,this.handlePointerEnter),this.removeEventListener(`pointerleave`,this.handlePointerLeave)}updated(e){if(super.updated(e),e.has(`isOpen`)&&(this.isOpen?(this.overlayPresence.setOpen(!0),this.startDismissTimer(this.duration)):this.close()),e.has(`tone`)){let e=ct(this.tone);this.tone!==e&&(this.tone=e)}if(e.has(`variant`)){let e=lt(this.variant);this.variant!==e&&(this.variant=e)}}startDismissTimer(e){this.clearDismissTimer(),!(e<=0||Number.isNaN(e))&&(this.remainingTime=e,this.timerStartedAt=Date.now(),this.timerId=setTimeout(()=>{this.close()},e))}clearDismissTimer(){this.timerId!==null&&(clearTimeout(this.timerId),this.timerId=null)}handlePointerEnter=()=>{if(this.timerId!==null){this.clearDismissTimer();let e=Date.now()-this.timerStartedAt;this.remainingTime=Math.max(0,this.remainingTime-e)}};handlePointerLeave=()=>{this.isOpen&&this.remainingTime>0&&this.startDismissTimer(this.remainingTime)};async close(){this.clearDismissTimer(),this.isOpen=!1,await this.overlayPresence.setOpen(!1),this.dispatchEvent(new CustomEvent(`dismiss`,{bubbles:!0,composed:!0,detail:{id:this.id}}))}getDefaultIcon(){switch(this.tone){case`error`:return vt();case`warning`:return _t();case`success`:return gt();default:return ht()}}render(){return B`
      <div part="base">
        <div part="icon">
          <slot name="icon">${this.getDefaultIcon()}</slot>
        </div>
        <div part="content">
          <slot name="title">
            ${this.title?B`<div part="title">${this.title}</div>`:``}
          </slot>
          <div part="description">
            <slot>${this.description}</slot>
          </div>
        </div>
        <div part="actions">
          <slot name="action"></slot>
          <button
            part="dismiss-button"
            class="dismiss-button"
            aria-label="Dismiss toast"
            @click=${()=>this.close()}
          >
            ${dt()}
          </button>
        </div>
      </div>
    `}}),W(`moul-toast-region`,class extends U{static styles=Vm;static properties={placement:{type:String,reflect:!0}};observer=null;constructor(){super(),this.placement=`bottom-end`}connectedCallback(){super.connectedCallback(),this.hasAttribute(`popover`)||this.setAttribute(`popover`,`manual`),this.hasAttribute(`aria-label`)||this.setAttribute(`aria-label`,`Notifications`),this.setAttribute(`role`,`region`),this.observer=new MutationObserver(()=>this.syncTopLayer()),this.observer.observe(this,{childList:!0}),this.syncTopLayer()}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observer=null}glides=new WeakMap;get isTop(){return this.placement.startsWith(`top`)}removeToast(e){let t=Array.from(this.children).filter(t=>t!==e&&t instanceof HTMLElement),n=new Map(t.map(e=>[e,e.getBoundingClientRect()]));if(e.remove(),!ws()){for(let e of t)this.glides.has(e)&&(this.glides.get(e)?.cancel(),this.glides.delete(e),e.style.removeProperty(`transform`));for(let e of t){let t=n.get(e);if(!t)continue;let r=t.top-e.getBoundingClientRect().top;if(Math.abs(r)<.5)continue;let i=vs(e,{transform:[`translateY(${r}px)`,`translateY(0px)`]},bs);this.glides.set(e,i),i.then(()=>{this.glides.get(e)===i&&(this.glides.delete(e),e.style.removeProperty(`transform`))})}}}syncTopLayer(){if(typeof this.showPopover!=`function`)return;let e=this.childElementCount>0;try{let t=this.matches(`:popover-open`);e&&!t?this.showPopover():!e&&t&&this.hidePopover()}catch{}}render(){return B`<slot></slot>`}});var Hm=0,Um=new class{region=null;defaultPlacement=`bottom-end`;get placement(){return this.region?.placement??this.defaultPlacement}set placement(e){this.defaultPlacement=e;let t=this.region?.isConnected?this.region:null;t&&(t.placement=e)}getOrCreateRegion(){if(typeof document>`u`)return null;if(!this.region?.isConnected){let e=document.querySelector(`moul-toast-region`);e||(e=document.createElement(`moul-toast-region`),e.placement=this.defaultPlacement,document.body.appendChild(e)),this.region=e}return this.region}add(e){let t=e.id??`toast-${++Hm}`,n=this.getOrCreateRegion();if(!n)return t;let r=document.createElement(`moul-toast`);return r.id=t,r.title=e.title,e.description&&(r.description=e.description),e.tone&&(r.tone=e.tone),e.variant&&(r.variant=e.variant),typeof e.duration==`number`&&(r.duration=e.duration),r.addEventListener(`dismiss`,()=>{n.removeToast(r)}),n.appendChild(r),t}close(e){let t=this.getOrCreateRegion();if(!t)return;let n=t.querySelector(`#${e}`);n&&n.close()}clear(){let e=this.getOrCreateRegion();e&&Array.from(e.querySelectorAll(`moul-toast`)).forEach(e=>{e.close()})}},Wm=[J,M`
    :host {
      display: inline-flex;
      vertical-align: middle;
      position: relative;
      font-family: var(--font-family-base, inherit);
      border-radius: var(--radius-3xl, 1.5rem);
      user-select: none;
      -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      cursor: pointer;
      --_press-scale: var(--press-scale, 0.97);
      /* Unselected: neutral fill */
      --_bg: var(--color-default);
      --_bg-hover: var(--color-default-hover);
      --_fg: var(--color-default-fg);
    }

    /* Selected: soft accent tint */
    :host([is-selected]) {
      --_bg: var(--color-accent-soft);
      --_bg-hover: var(--color-accent-soft-hover);
      --_fg: var(--color-accent-soft-fg);
    }

    [part~="button"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border: none;
      border-radius: inherit;
      background-color: var(--_bg);
      color: var(--_fg);
      font-family: inherit;
      font-weight: var(--font-weight-medium, 500);
      line-height: 1;
      text-decoration: none;
      transform-origin: center;
      transition:
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        background-color 100ms var(--ease-out, ease-out),
        box-shadow 100ms var(--ease-out, ease-out),
        color 100ms var(--ease-out, ease-out);
      cursor: pointer;
      position: relative;
      white-space: nowrap;
    }

    @media (hover: hover) {
      :host(:not([is-disabled])) [part~="button"]:hover {
        background-color: var(--_bg-hover);
      }
    }

    :host(:not([is-disabled])) [part~="button"]:active {
      background-color: var(--_bg-hover);
      transform: scale(var(--_press-scale));
    }

    :host(:focus-visible) {
      outline: none;
    }

    :host(:focus-visible) [part~="button"],
    [part~="button"]:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    /* Sizes */
    :host([size="sm"]) {
      --_press-scale: 0.98;
    }

    :host([size="lg"]) {
      --_press-scale: 0.96;
    }

    :host([size="sm"]) [part~="button"] {
      height: 2rem;
      padding: 0 var(--spacing-3, 0.75rem);
      font-size: var(--font-size-sm, 0.875rem);
      gap: var(--spacing-2, 0.5rem);
    }

    :host([size="md"]) [part~="button"],
    :host(:not([size])) [part~="button"] {
      height: 2.25rem;
      padding: 0 var(--spacing-4, 1rem);
      font-size: var(--font-size-sm, 0.875rem);
      gap: var(--spacing-2, 0.5rem);
    }

    :host([size="lg"]) [part~="button"] {
      height: 2.5rem;
      padding: 0 var(--spacing-4, 1rem);
      font-size: var(--font-size-md, 1rem);
      gap: var(--spacing-2, 0.5rem);
    }

    /*
     * Inside a moul-toggle-button-group the group paints the neutral fill and
     * slides the selected tint (its indicator) beneath the buttons, so the
     * buttons themselves stay transparent and don't scale on press.
     */
    :host([data-in-group]) {
      --_press-scale: 1;
      --_bg: transparent;
      --_bg-hover: var(--color-default-hover);
    }

    :host([data-in-group][is-selected]) {
      --_bg: transparent;
      /* Layered over the indicator's accent-soft, this lands near accent-soft-hover */
      --_bg-hover: color-mix(in oklab, var(--color-accent) 6%, transparent);
    }

    /* Inset ring so it stays inside the group's clipped outline */
    :host([data-in-group]:focus-visible) [part~="button"],
    :host([data-in-group]) [part~="button"]:focus-visible {
      box-shadow: inset 0 0 0 2px var(--color-focus);
    }

    /* Disabled State */
    :host([is-disabled]) {
      cursor: not-allowed;
      pointer-events: none;
    }

    :host([is-disabled]) [part~="button"] {
      opacity: var(--disabled-opacity, 0.5);
      cursor: not-allowed;
      pointer-events: none;
    }

    .content {
      display: inline-flex;
      align-items: center;
      gap: inherit;
    }

    ::slotted(svg) {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      [part~="button"] {
        transition: none;
      }

      :host(:not([is-disabled])) [part~="button"]:active {
        transform: none;
      }
    }
  `];W(`moul-toggle-button`,class extends U{static styles=Wm;static properties={value:{type:String,reflect:!0},isSelected:{type:Boolean,reflect:!0,attribute:`is-selected`},size:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`}};pressController;toggleHandledInCycle=!1;constructor(){super(),this.value=``,this.isSelected=!1,this.size=`md`,this.isDisabled=!1,this.pressController=new wd(this,{disabled:()=>this.isDisabled})}connectedCallback(){super.connectedCallback(),this.setAttribute(`aria-pressed`,this.isSelected?`true`:`false`),this.addEventListener(`pointerdown`,this.handlePointerDown),this.addEventListener(`pointerup`,this.handlePointerUp),this.addEventListener(`click`,this.handleClick),this.addEventListener(`keydown`,this.handleKeyDown),this.addEventListener(`keyup`,this.handleKeyUp)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`pointerdown`,this.handlePointerDown),this.removeEventListener(`pointerup`,this.handlePointerUp),this.removeEventListener(`click`,this.handleClick),this.removeEventListener(`keydown`,this.handleKeyDown),this.removeEventListener(`keyup`,this.handleKeyUp)}updated(e){super.updated(e),e.has(`isSelected`)&&this.setAttribute(`aria-pressed`,this.isSelected?`true`:`false`),e.has(`isDisabled`)&&(this.isDisabled?this.setAttribute(`aria-disabled`,`true`):this.removeAttribute(`aria-disabled`))}handlePointerDown=e=>{this.isDisabled||e.button!==0||(this.toggleHandledInCycle=!1)};handlePointerUp=e=>{this.isDisabled||e.button!==0||(this.toggle(),this.toggleHandledInCycle=!0,queueMicrotask(()=>{this.toggleHandledInCycle=!1}))};handleClick=e=>{this.isDisabled?(e.preventDefault(),e.stopImmediatePropagation()):(this.toggleHandledInCycle||this.toggle(),this.toggleHandledInCycle=!1)};handleKeyDown=e=>{this.isDisabled||e.repeat||(e.key===` `||e.key===`Enter`)&&(this.toggleHandledInCycle=!1)};handleKeyUp=e=>{this.isDisabled||(e.key===` `||e.key===`Enter`)&&(this.toggle(),this.toggleHandledInCycle=!0,queueMicrotask(()=>{this.toggleHandledInCycle=!1}))};toggle(){this.isDisabled||(this.isSelected=!this.isSelected,this.setAttribute(`aria-pressed`,this.isSelected?`true`:`false`),this.dispatchEvent(new CustomEvent(`change`,{bubbles:!0,composed:!0,detail:{isSelected:this.isSelected,value:this.value}})),this.dispatchEvent(new CustomEvent(`press`,{bubbles:!0,composed:!0,detail:{isSelected:this.isSelected}})))}render(){return B`
      <button
        part="button"
        type="button"
        role="button"
        ?disabled=${this.isDisabled}
        aria-pressed=${this.isSelected?`true`:`false`}
        aria-disabled=${this.isDisabled?`true`:`false`}
      >
        <span part="content" class="content"><slot></slot></span>
      </button>
    `}});var Gm=[J,M`
    :host {
      display: inline-flex;
      vertical-align: middle;
      position: relative;
      box-sizing: border-box;
      border-radius: var(--radius-3xl, 1.5rem);
      user-select: none;
      -webkit-user-select: none;
    }

    /*
     * Attached buttons read as one pill: the base carries the neutral fill and
     * clips the outer ends, so the sliding indicator picks up the end radius.
     */
    [part~="base"] {
      display: inline-flex;
      position: relative;
      justify-content: center;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      gap: 0;
      border-radius: inherit;
      background-color: var(--color-default);
      overflow: hidden;
      isolation: isolate;
    }

    /* Orientation */
    :host([orientation="horizontal"]),
    :host(:not([orientation])) {
      flex-direction: row;
    }

    :host([orientation="horizontal"]) [part~="base"],
    :host(:not([orientation])) [part~="base"] {
      flex-direction: row;
      align-items: center;
    }

    :host([orientation="vertical"]) {
      flex-direction: column;
    }

    :host([orientation="vertical"]) [part~="base"] {
      flex-direction: column;
      align-items: stretch;
    }

    /* Selected tint: accent-soft composited over the surface, gliding between items */
    .active-indicator {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      background-color: var(--color-surface);
      background-image: linear-gradient(var(--color-accent-soft), var(--color-accent-soft));
      pointer-events: none;
      opacity: 0;
      transition:
        translate 250ms var(--ease-out-fluid, ease-out),
        width 250ms var(--ease-out-fluid, ease-out),
        height 250ms var(--ease-out-fluid, ease-out),
        opacity var(--duration-fast, 150ms) var(--ease-smooth, ease);
    }

    .active-indicator[data-visible] {
      opacity: 1;
    }

    /* Inner corners square off; the outer ends match the group pill */
    ::slotted(*) {
      position: relative;
      border-radius: 0;
    }

    :host(:not([orientation="vertical"])) ::slotted(:first-child) {
      border-start-start-radius: var(--radius-3xl, 1.5rem);
      border-end-start-radius: var(--radius-3xl, 1.5rem);
    }

    :host(:not([orientation="vertical"])) ::slotted(:last-child) {
      border-start-end-radius: var(--radius-3xl, 1.5rem);
      border-end-end-radius: var(--radius-3xl, 1.5rem);
    }

    :host([orientation="vertical"]) ::slotted(:first-child) {
      border-start-start-radius: var(--radius-3xl, 1.5rem);
      border-start-end-radius: var(--radius-3xl, 1.5rem);
    }

    :host([orientation="vertical"]) ::slotted(:last-child) {
      border-end-start-radius: var(--radius-3xl, 1.5rem);
      border-end-end-radius: var(--radius-3xl, 1.5rem);
    }

    /* Separators: 1px over the middle half of each inner edge, at 15% of the item's text color */
    :host(:not([orientation="vertical"])) ::slotted(:not(:first-child)) {
      border-inline-start: 1px solid transparent;
      border-image: linear-gradient(
          transparent 25%,
          color-mix(in oklab, var(--_fg, currentColor) 15%, transparent) 25% 75%,
          transparent 75%
        )
        1;
    }

    :host([orientation="vertical"]) ::slotted(:not(:first-child)) {
      border-block-start: 1px solid transparent;
      border-image: linear-gradient(
          to right,
          transparent 25%,
          color-mix(in oklab, var(--_fg, currentColor) 15%, transparent) 25% 75%,
          transparent 75%
        )
        1;
    }

    /* Disabled state: items dim themselves, so only fade the group's own paint */
    :host([is-disabled]) {
      pointer-events: none;
      cursor: not-allowed;
    }

    :host([is-disabled]) [part~="base"] {
      background-color: color-mix(in oklab, var(--color-default) 50%, transparent);
    }

    :host([is-disabled]) .active-indicator[data-visible] {
      opacity: var(--disabled-opacity, 0.5);
    }

    @media (prefers-reduced-motion: reduce) {
      .active-indicator {
        transition: none;
      }
    }
  `];W(`moul-toggle-button-group`,class extends U{static styles=Gm;static properties={selectedKey:{type:String,reflect:!0,attribute:`selected-key`},orientation:{type:String,reflect:!0},isDisabled:{type:Boolean,reflect:!0,attribute:`is-disabled`}};previousSelectedButton=null;resizeObserver=null;constructor(){super(),this.selectedKey=``,this.orientation=`horizontal`,this.isDisabled=!1}connectedCallback(){super.connectedCallback(),this.hasAttribute(`role`)||this.setAttribute(`role`,`group`),this.setAttribute(`aria-orientation`,this.orientation),this.addEventListener(`keydown`,this.handleKeyDown),this.addEventListener(`change`,this.handleChildChange),this.addEventListener(`press`,this.handleChildPress)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.handleKeyDown),this.removeEventListener(`change`,this.handleChildChange),this.removeEventListener(`press`,this.handleChildPress),this.resizeObserver?.disconnect(),this.resizeObserver=null}updated(e){super.updated(e),e.has(`orientation`)&&this.setAttribute(`aria-orientation`,this.orientation),e.has(`selectedKey`)&&this.syncSelection(),e.has(`isDisabled`)&&this.syncDisabledState()}firstUpdated(e){super.firstUpdated(e),this.syncSelection(),typeof ResizeObserver<`u`&&(this.resizeObserver=new ResizeObserver(()=>this.updateIndicator(null,this.getSelectedButton(),!0)),this.resizeObserver.observe(this))}getItems(){let e=Array.from(this.querySelectorAll(`moul-toggle-button`));if(e.length>0)return e;let t=this.shadowRoot?.querySelector(`slot`);return(t?t.assignedElements({flatten:!0}):Array.from(this.children)).filter(e=>e.tagName.toLowerCase()===`moul-toggle-button`)}getSelectedButton(){let e=this.getItems();if(this.selectedKey){let t=e.find(e=>e.value===this.selectedKey);if(t)return t}return e.find(e=>e.isSelected)??null}syncSelection(){let e=this.getItems();if(e.length===0)return;let t=null;e.forEach(e=>{e.toggleAttribute(`data-in-group`,!0);let n=!!(this.selectedKey&&e.value===this.selectedKey);e.isSelected=n,n&&(t=e)}),this.updateRovingTabindex(t),this.updateIndicator(this.previousSelectedButton,t),this.previousSelectedButton=t}syncDisabledState(){this.getItems().forEach(e=>{e.isDisabled=this.isDisabled})}updateRovingTabindex(e){let t=this.getItems();if(t.length===0)return;let n=e;n||=t.find(e=>!e.isDisabled)??t[0],t.forEach(e=>{e===n?e.setAttribute(`tabindex`,`0`):e.setAttribute(`tabindex`,`-1`)})}focusItem(e){this.updateRovingTabindex(e),e.focus()}handleSlotChange=()=>{this.syncSelection(),this.syncDisabledState()};handleKeyDown=e=>{if(this.isDisabled)return;let t=this.getItems().filter(e=>!e.isDisabled);if(t.length===0)return;let n=t.findIndex(t=>t===e.target||t.contains(e.target));if(n!==-1)switch(e.key){case`ArrowRight`:case`ArrowDown`:{e.preventDefault();let r=(n+1)%t.length;this.focusItem(t[r]);break}case`ArrowLeft`:case`ArrowUp`:{e.preventDefault();let r=(n-1+t.length)%t.length;this.focusItem(t[r]);break}case`Home`:e.preventDefault(),this.focusItem(t[0]);break;case`End`:e.preventDefault(),this.focusItem(t[t.length-1])}};handleChildChange=e=>{let t=e.target;t?.tagName?.toLowerCase()===`moul-toggle-button`&&(e.stopPropagation(),this.handleSelectionFromChild(t))};handleChildPress=e=>{let t=e.target;t?.tagName?.toLowerCase()===`moul-toggle-button`&&(e.stopPropagation(),t.value!==this.selectedKey&&this.handleSelectionFromChild(t))};handleSelectionFromChild(e){let t=this.previousSelectedButton,n=e.value;this.selectedKey=n,this.getItems().forEach(t=>{t.isSelected=t===e}),this.updateRovingTabindex(e),this.updateIndicator(t,e),this.previousSelectedButton=e,this.dispatchEvent(new CustomEvent(`selectionchange`,{bubbles:!0,composed:!0,detail:{selectedKey:this.selectedKey}}))}updateIndicator(e,t,n=!1){let r=this.shadowRoot?.querySelector(`.active-indicator`),i=this.shadowRoot?.querySelector(`[part="base"]`);if(!r||!i)return;let a=()=>Ps(r,i,t,n);t?t.updateComplete.then(a):a()}render(){return B`
      <div part="base">
        <div part="indicator" class="active-indicator"></div>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `}});var Km=[J,M`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-family-base, inherit);
      color: var(--color-fg, inherit);
    }

    .container {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3, 0.75rem);
    }

    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1, 0.25rem);
      width: 100%;
    }

    /* Rows follow HeroUI list-box-item: min-h-9, px-2 py-1.5, rounded. */
    .item {
      display: grid;
      grid-template-columns: minmax(100px, 1.5fr) 2fr minmax(60px, auto);
      align-items: center;
      gap: var(--spacing-3, 0.75rem);
      min-height: 2.25rem;
      padding: 0.375rem var(--spacing-2, 0.5rem);
      border-radius: var(--radius-xl, 0.75rem);
      outline: none;
      transition:
        background-color var(--duration-fast, 150ms) var(--ease-smooth, ease),
        transform var(--duration-fast, 150ms) var(--ease-out, ease-out),
        box-shadow var(--duration-fast, 150ms) var(--ease-out, ease-out);
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      box-sizing: border-box;
    }

    :host([show-rank]) .item,
    .item.has-rank {
      grid-template-columns: 2rem minmax(100px, 1.5fr) 2fr minmax(60px, auto);
    }

    .item:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .item--interactive {
      cursor: pointer;
    }

    @media (hover: hover) {
      .item--interactive:hover {
        background-color: var(--color-default, oklch(0.94 0.001 286.375));
      }
    }

    .item--interactive:active {
      transform: scale(0.98);
    }

    /* Rank: a small default-tone chip. */
    .rank {
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-xs, 1rem);
      color: var(--color-muted, #71717a);
      text-align: center;
      font-variant-numeric: tabular-nums;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      justify-self: center;
      box-sizing: border-box;
      min-width: 1.5rem;
      height: 1.5rem;
      padding-inline: var(--spacing-1, 0.25rem);
      border-radius: var(--radius-full, 9999px);
      background-color: var(--color-default, oklch(0.94 0.001 286.375));
    }

    .label {
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-fg, inherit);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Track and fill follow HeroUI meter: h-2, rounded-sm, default track. */
    .track {
      height: 0.5rem;
      background-color: var(--color-default, oklch(0.94 0.001 286.375));
      border-radius: var(--radius-sm, 0.25rem);
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    .bar {
      height: 100%;
      border-radius: inherit;
      transition: width 300ms var(--ease-out, ease-out);
      min-width: 0;
      background-color: var(--color-chart-1);
    }

    .value {
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-medium, 500);
      line-height: var(--line-height-sm, 1.25rem);
      color: var(--color-fg, inherit);
      text-align: end;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 120px;
      color: var(--color-muted, #71717a);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      padding: var(--spacing-4, 1rem);
      text-align: center;
    }

    .empty-message {
      margin: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      .item,
      .bar {
        transition: none;
      }

      .item--interactive:active {
        transform: none;
      }
    }
  `];W(`moul-top-list`,class extends U{static styles=Km;static properties={data:{attribute:!1},max:{type:Number},maxValue:{type:Number,attribute:`max-value`},maxItems:{type:Number,attribute:`max-items`},valueFormatter:{attribute:!1},showRank:{type:Boolean,attribute:`show-rank`,reflect:!0,converter:{fromAttribute:e=>e!==`false`&&e!==null,toAttribute:e=>e?``:null}},multiColor:{type:Boolean,attribute:`multi-color`},barColor:{type:String,attribute:`bar-color`},interactive:{type:Boolean,reflect:!0}};constructor(){super(),this.data=[],this.max=void 0,this.maxValue=void 0,this.maxItems=10,this.valueFormatter=void 0,this.showRank=!0,this.multiColor=!1,this.barColor=`var(--color-chart-1)`,this.interactive=!1}updated(e){super.updated(e),e.has(`data`)&&this.animateEntrance()}hasPlayedEntrance=!1;animateEntrance(){if(this.hasPlayedEntrance||ws())return;let e=this.renderRoot?.querySelectorAll(`.item`);e&&e.length>0&&(this.hasPlayedEntrance=!0,q(e,{transform:[`translateY(6px)`,`translateY(0px)`],opacity:[0,1]},{duration:.35,delay:qo(.03),ease:Cs}))}handleItemPress(e,t){let n=new CustomEvent(`item-press`,{detail:{item:e,index:t},bubbles:!0,composed:!0,cancelable:!0});this.dispatchEvent(n)}handleKeyDown(e,t,n){(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this.handleItemPress(t,n))}render(){if(!this.data||!Array.isArray(this.data)||this.data.length===0)return B`
        <div class="empty-state" part="empty">
          <slot name="empty">
            <p class="empty-message">No data available</p>
          </slot>
        </div>
      `;let e=this.maxItems>0?this.data.slice(0,this.maxItems):this.data;if(e.length===0)return B`
        <div class="empty-state" part="empty">
          <slot name="empty">
            <p class="empty-message">No data available</p>
          </slot>
        </div>
      `;let t=this.max??this.maxValue,n=1;if(typeof t==`number`&&Number.isFinite(t)&&t>0)n=t;else{let t=e.map(e=>typeof e.value==`number`&&Number.isFinite(e.value)?e.value:0).filter(e=>e>0);n=t.length>0?Math.max(...t):1}return B`
      <div class="container" part="container">
        <ul class="list" role="list" part="list">
          ${e.map((e,t)=>{let r=typeof e.value==`number`&&Number.isFinite(e.value)?e.value:0,i=Math.max(0,r),a=Math.min(100,Math.max(0,i/n*100)),o=e.color?e.color:this.multiColor?fd(t):this.barColor||`var(--color-chart-1)`,s=this.valueFormatter?this.valueFormatter(r):r.toLocaleString(),c=e.label||e.name||`Item ${t+1}`;return B`
              <li
                class="item ${this.showRank?`has-rank`:``} ${this.interactive?`item--interactive`:``}"
                role="listitem"
                part="item"
                data-index="${t}"
                tabindex="0"
                @click="${()=>this.handleItemPress(e,t)}"
                @keydown="${n=>this.handleKeyDown(n,e,t)}"
              >
                ${this.showRank?B`<span class="rank" part="rank">${t+1}</span>`:``}

                <span class="label" part="label" title="${c}">
                  ${c}
                </span>

                <div
                  class="track"
                  part="track"
                  role="progressbar"
                  aria-valuenow="${i}"
                  aria-valuemin="0"
                  aria-valuemax="${n}"
                  aria-label="${c}"
                  aria-valuetext="${s}"
                >
                  <div
                    class="bar"
                    part="bar"
                    style="width: ${a}%; background-color: ${o};"
                  ></div>
                </div>

                <span class="value" part="value">${s}</span>
              </li>
            `})}
        </ul>
      </div>
    `}});var qm=[J,M`
    :host {
      display: block;
      color: var(--color-fg);
      font-family: var(--font-family-base, inherit);
    }

    .typography {
      margin: 0;
      padding: 0;
      color: inherit;
      font-family: inherit;
    }

    /* Headings: semibold with tight tracking */
    :host([variant="h1"]) .typography,
    :host([variant="h2"]) .typography,
    :host([variant="h3"]) .typography,
    :host([variant="h4"]) .typography,
    :host([variant="h5"]) .typography,
    :host([variant="h6"]) .typography {
      font-weight: var(--font-weight-semibold, 600);
      letter-spacing: -0.025em;
    }

    :host([variant="h1"]) .typography {
      font-size: var(--font-size-4xl, 2.25rem);
      line-height: var(--line-height-4xl, 2.5rem);
    }

    :host([variant="h2"]) .typography {
      font-size: var(--font-size-3xl, 1.875rem);
      line-height: var(--line-height-3xl, 2.25rem);
    }

    :host([variant="h3"]) .typography {
      font-size: var(--font-size-2xl, 1.5rem);
      line-height: var(--line-height-2xl, 2rem);
    }

    :host([variant="h4"]) .typography {
      font-size: var(--font-size-xl, 1.25rem);
      line-height: var(--line-height-xl, 1.75rem);
    }

    :host([variant="h5"]) .typography {
      font-size: var(--font-size-lg, 1.125rem);
      line-height: var(--line-height-lg, 1.75rem);
    }

    :host([variant="h6"]) .typography {
      font-size: var(--font-size-md, 1rem);
      line-height: var(--line-height-md, 1.5rem);
    }

    /* Body copy: relaxed leading-7 */
    :host([variant="body"]) .typography,
    :host(:not([variant])) .typography {
      font-size: var(--font-size-md, 1rem);
      line-height: 1.75rem;
      font-weight: var(--font-weight-normal, 400);
    }

    /* Caption: small muted text */
    :host([variant="caption"]) .typography {
      font-size: var(--font-size-sm, 0.875rem);
      line-height: 1.5rem;
      color: var(--color-muted);
    }

    /* Inline code: a neutral chip */
    :host([variant="code"]) .typography {
      font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
      font-size: var(--font-size-sm, 0.875rem);
      line-height: var(--line-height-sm, 1.25rem);
      background-color: var(--color-default);
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-md, 0.375rem);
    }

    :host([variant="mono"]) .typography {
      font-family: var(--font-family-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
      font-size: var(--font-size-md, 1rem);
      line-height: 1.75rem;
    }

    /* Tones: readable foregrounds on light and dark surfaces */
    :host([tone="primary"]) {
      color: var(--color-accent-soft-fg);
    }

    :host([tone="accent"]) {
      color: var(--color-accent);
    }

    :host([tone="success"]) {
      color: var(--color-success-soft-fg);
    }

    :host([tone="warning"]) {
      color: var(--color-warning-soft-fg);
    }

    :host([tone="error"]) {
      color: var(--color-danger);
    }
  `];W(`moul-typography`,class extends U{static styles=qm;static properties={variant:{type:String,reflect:!0},tone:{type:String,reflect:!0}};constructor(){super(),this.variant=`body`}render(){switch(this.variant){case`h1`:return B`<h1 part="root" class="typography"><slot></slot></h1>`;case`h2`:return B`<h2 part="root" class="typography"><slot></slot></h2>`;case`h3`:return B`<h3 part="root" class="typography"><slot></slot></h3>`;case`h4`:return B`<h4 part="root" class="typography"><slot></slot></h4>`;case`h5`:return B`<h5 part="root" class="typography"><slot></slot></h5>`;case`h6`:return B`<h6 part="root" class="typography"><slot></slot></h6>`;case`caption`:return B`<span part="root" class="typography"><slot></slot></span>`;case`code`:case`mono`:return B`<code part="root" class="typography"><slot></slot></code>`;default:return B`<p part="root" class="typography"><slot></slot></p>`}}});var Jm=class extends h{constructor(e){if(super(e),this.it=n,e.type!==l.CHILD)throw Error(this.constructor.directiveName+`() can only be used in child bindings`)}render(t){if(t===n||t==null)return this._t=void 0,this.it=t;if(t===e)return t;if(typeof t!=`string`)throw Error(this.constructor.directiveName+`() called with a non-string value`);if(t===this.it)return this._t;this.it=t;let r=[t];return r.raw=r,this._t={_$litType$:this.constructor.resultType,strings:r,values:[]}}};Jm.directiveName=`unsafeHTML`,Jm.resultType=1,d(Jm);var Ym=class extends Jm{};Ym.directiveName=`unsafeSVG`,Ym.resultType=2;var Xm=d(Ym),Zm={"apple-logo":{fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128.23,30A40,40,0,0,1,167,0h1a8,8,0,0,1,0,16h-1a24,24,0,0,0-23.24,18,8,8,0,1,1-15.5-4ZM223.3,169.59a8.07,8.07,0,0,0-2.8-3.4C203.53,154.53,200,134.64,200,120c0-17.67,13.47-33.06,21.5-40.67a8,8,0,0,0,0-11.62C208.82,55.74,187.82,48,168,48a72.23,72.23,0,0,0-40,12.13,71.56,71.56,0,0,0-90.71,9.09A74.63,74.63,0,0,0,16,123.4a127,127,0,0,0,40.14,89.73A39.8,39.8,0,0,0,83.59,224h87.68a39.84,39.84,0,0,0,29.12-12.57,125,125,0,0,0,17.82-24.6C225.23,174,224.33,172,223.3,169.59Z"/></svg>`},"arrow-right":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>`},"arrow-square-out":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"/></svg>`},"arrows-clockwise":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"/></svg>`},"arrows-counter-clockwise":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M88,104H40a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V76.69L62.63,62.06A95.43,95.43,0,0,1,130,33.94h.53a95.36,95.36,0,0,1,67.07,27.33,8,8,0,0,1-11.18,11.44,79.52,79.52,0,0,0-55.89-22.77h-.45A79.56,79.56,0,0,0,73.94,73.37L59.31,88H88a8,8,0,0,1,0,16Zm128,48H168a8,8,0,0,0,0,16h28.69l-14.63,14.63a79.56,79.56,0,0,1-56.13,23.43h-.45a79.52,79.52,0,0,1-55.89-22.77,8,8,0,1,0-11.18,11.44,95.36,95.36,0,0,0,67.07,27.33H126a95.43,95.43,0,0,0,67.36-28.12L208,179.31V208a8,8,0,0,0,16,0V160A8,8,0,0,0,216,152Z"/></svg>`},article:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z"/></svg>`},"book-open":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M232,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H24a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h72a8,8,0,0,0,8-8V56A8,8,0,0,0,232,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"/></svg>`},"brackets-curly":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M43.18,128a29.78,29.78,0,0,1,8,10.26c4.8,9.9,4.8,22,4.8,33.74,0,24.31,1,36,24,36a8,8,0,0,1,0,16c-17.48,0-29.32-6.14-35.2-18.26-4.8-9.9-4.8-22-4.8-33.74,0-24.31-1-36-24-36a8,8,0,0,1,0-16c23,0,24-11.69,24-36,0-11.72,0-23.84,4.8-33.74C50.68,38.14,62.52,32,80,32a8,8,0,0,1,0,16C57,48,56,59.69,56,84c0,11.72,0,23.84-4.8,33.74A29.78,29.78,0,0,1,43.18,128ZM240,120c-23,0-24-11.69-24-36,0-11.72,0-23.84-4.8-33.74C205.32,38.14,193.48,32,176,32a8,8,0,0,0,0,16c23,0,24,11.69,24,36,0,11.72,0,23.84,4.8,33.74a29.78,29.78,0,0,0,8,10.26,29.78,29.78,0,0,0-8,10.26c-4.8,9.9-4.8,22-4.8,33.74,0,24.31-1,36-24,36a8,8,0,0,0,0,16c17.48,0,29.32-6.14,35.2-18.26,4.8-9.9,4.8-22,4.8-33.74,0-24.31,1-36,24-36a8,8,0,0,0,0-16Z"/></svg>`},broadcast:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,88a40,40,0,1,0,40,40A40,40,0,0,0,128,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,152Zm73.71,7.14a80,80,0,0,1-14.08,22.2,8,8,0,0,1-11.92-10.67,63.95,63.95,0,0,0,0-85.33,8,8,0,1,1,11.92-10.67,80.08,80.08,0,0,1,14.08,84.47ZM69,103.09a64,64,0,0,0,11.26,67.58,8,8,0,0,1-11.92,10.67,79.93,79.93,0,0,1,0-106.67A8,8,0,1,1,80.29,85.34,63.77,63.77,0,0,0,69,103.09ZM248,128a119.58,119.58,0,0,1-34.29,84,8,8,0,1,1-11.42-11.2,103.9,103.9,0,0,0,0-145.56A8,8,0,1,1,213.71,44,119.58,119.58,0,0,1,248,128ZM53.71,200.78A8,8,0,1,1,42.29,212a119.87,119.87,0,0,1,0-168,8,8,0,1,1,11.42,11.2,103.9,103.9,0,0,0,0,145.56Z"/></svg>`,bold:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,84a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,84Zm0,64a20,20,0,1,1,20-20A20,20,0,0,1,128,148Zm77.39,12.7A83.94,83.94,0,0,1,190.61,184a12,12,0,0,1-17.89-16,59.92,59.92,0,0,0,0-80,12,12,0,0,1,17.89-16,84.07,84.07,0,0,1,14.78,88.7ZM83.28,168a12,12,0,0,1-17.89,16,83.94,83.94,0,0,1,0-112A12,12,0,0,1,83.28,88a59.92,59.92,0,0,0,0,80ZM252,128a123.63,123.63,0,0,1-35.43,86.78A12,12,0,1,1,199.43,198a99.88,99.88,0,0,0,0-140,12,12,0,0,1,17.14-16.8A123.63,123.63,0,0,1,252,128ZM56.57,198a12,12,0,0,1-17.14,16.8,123.89,123.89,0,0,1,0-173.56A12,12,0,0,1,56.57,58a99.88,99.88,0,0,0,0,140Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M168,128a40,40,0,1,1-40-40A40,40,0,0,1,168,128Zm40,0a79.74,79.74,0,0,0-20.37-53.33,8,8,0,1,0-11.92,10.67,64,64,0,0,1,0,85.33,8,8,0,0,0,11.92,10.67A79.79,79.79,0,0,0,208,128ZM80.29,85.34A8,8,0,1,0,68.37,74.67a79.94,79.94,0,0,0,0,106.67,8,8,0,0,0,11.92-10.67,63.95,63.95,0,0,1,0-85.33Zm158.28-4A119.48,119.48,0,0,0,213.71,44a8,8,0,1,0-11.42,11.2,103.9,103.9,0,0,1,0,145.56A8,8,0,1,0,213.71,212,120.12,120.12,0,0,0,238.57,81.29ZM32.17,168.48A103.9,103.9,0,0,1,53.71,55.22,8,8,0,1,0,42.29,44a119.87,119.87,0,0,0,0,168,8,8,0,1,0,11.42-11.2A103.61,103.61,0,0,1,32.17,168.48Z"/></svg>`},"calendar-blank":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"/></svg>`},"caret-down":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/></svg>`},"caret-left":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/></svg>`},"caret-right":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/></svg>`},"caret-up":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,165.66a8,8,0,0,1-11.32,0L128,91.31,53.66,165.66a8,8,0,0,1-11.32-11.32l80-80a8,8,0,0,1,11.32,0l80,80A8,8,0,0,1,213.66,165.66Z"/></svg>`},"chart-line-up":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM200,192H56a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v76.69l34.34-34.35a8,8,0,0,1,11.32,0L128,132.69,172.69,88H144a8,8,0,0,1,0-16h48a8,8,0,0,1,8,8v48a8,8,0,0,1-16,0V99.31l-50.34,50.35a8,8,0,0,1-11.32,0L104,131.31l-40,40V176H200a8,8,0,0,1,0,16Z"/></svg>`},check:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>`},"check-circle":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>`,bold:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M176.49,95.51a12,12,0,0,1,0,17l-56,56a12,12,0,0,1-17,0l-24-24a12,12,0,1,1,17-17L112,143l47.51-47.52A12,12,0,0,1,176.49,95.51ZM236,128A108,108,0,1,1,128,20,108.12,108.12,0,0,1,236,128Zm-24,0a84,84,0,1,0-84,84A84.09,84.09,0,0,0,212,128Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/></svg>`},clock:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"/></svg>`},cloud:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M160,40A88.09,88.09,0,0,0,81.29,88.67,64,64,0,1,0,72,216h88a88,88,0,0,0,0-176Zm0,160H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.11A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,72,72Z"/></svg>`},"cloud-arrow-up":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M178.34,165.66,160,147.31V208a8,8,0,0,1-16,0V147.31l-18.34,18.35a8,8,0,0,1-11.32-11.32l32-32a8,8,0,0,1,11.32,0l32,32a8,8,0,0,1-11.32,11.32ZM160,40A88.08,88.08,0,0,0,81.29,88.68,64,64,0,1,0,72,216h40a8,8,0,0,0,0-16H72a48,48,0,0,1,0-96c1.1,0,2.2,0,3.29.12A88,88,0,0,0,72,128a8,8,0,0,0,16,0,72,72,0,1,1,100.8,66,8,8,0,0,0,3.2,15.34,7.9,7.9,0,0,0,3.2-.68A88,88,0,0,0,160,40Z"/></svg>`},code:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z"/></svg>`},compass:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM172.42,72.84l-64,32a8.05,8.05,0,0,0-3.58,3.58l-32,64A8,8,0,0,0,80,184a8.1,8.1,0,0,0,3.58-.84l64-32a8.05,8.05,0,0,0,3.58-3.58l32-64a8,8,0,0,0-10.74-10.74ZM138,138,97.89,158.11,118,118l40.15-20.07Z"/></svg>`},copy:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"/></svg>`},cpu:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M152,96H104a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8h48a8,8,0,0,0,8-8V104A8,8,0,0,0,152,96Zm-8,48H112V112h32Zm88,0H216V112h16a8,8,0,0,0,0-16H216V56a16,16,0,0,0-16-16H160V24a8,8,0,0,0-16,0V40H112V24a8,8,0,0,0-16,0V40H56A16,16,0,0,0,40,56V96H24a8,8,0,0,0,0,16H40v32H24a8,8,0,0,0,0,16H40v40a16,16,0,0,0,16,16H96v16a8,8,0,0,0,16,0V216h32v16a8,8,0,0,0,16,0V216h40a16,16,0,0,0,16-16V160h16a8,8,0,0,0,0-16Zm-32,56H56V56H200v95.87s0,.09,0,.13,0,.09,0,.13V200Z"/></svg>`},database:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64ZM69.61,53.08C85.07,44.65,105.81,40,128,40s42.93,4.65,58.39,13.08C200.12,60.57,208,70.38,208,80s-7.88,19.43-21.61,26.92C170.93,115.35,150.19,120,128,120s-42.93-4.65-58.39-13.08C55.88,99.43,48,89.62,48,80S55.88,60.57,69.61,53.08ZM186.39,202.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24C74.17,24,32,48.6,32,80v96c0,31.4,42.17,56,96,56s96-24.6,96-56V80C224,48.6,181.83,24,128,24Zm80,104c0,9.62-7.88,19.43-21.61,26.92C170.93,163.35,150.19,168,128,168s-42.93-4.65-58.39-13.08C55.88,147.43,48,137.62,48,128V111.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64Zm-21.61,74.92C170.93,211.35,150.19,216,128,216s-42.93-4.65-58.39-13.08C55.88,195.43,48,185.62,48,176V159.36c17.06,15,46.23,24.64,80,24.64s62.94-9.68,80-24.64V176C208,185.62,200.12,195.43,186.39,202.92Z"/></svg>`},desktop:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24h72v16H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V200h72a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40ZM48,56H208a8,8,0,0,1,8,8v80H40V64A8,8,0,0,1,48,56ZM208,184H48a8,8,0,0,1-8-8V160H216v16A8,8,0,0,1,208,184Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24h72v16H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V200h72a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm0,144H48a8,8,0,0,1-8-8V160H216v16A8,8,0,0,1,208,184Z"/></svg>`},"dots-three-outline-vertical":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,96a32,32,0,1,0,32,32A32,32,0,0,0,128,96Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,144Zm0-64A32,32,0,1,0,96,48,32,32,0,0,0,128,80Zm0-48a16,16,0,1,1-16,16A16,16,0,0,1,128,32Zm0,144a32,32,0,1,0,32,32A32,32,0,0,0,128,176Zm0,48a16,16,0,1,1,16-16A16,16,0,0,1,128,224Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M156,128a28,28,0,1,1-28-28A28,28,0,0,1,156,128ZM128,76a28,28,0,1,0-28-28A28,28,0,0,0,128,76Zm0,104a28,28,0,1,0,28,28A28,28,0,0,0,128,180Z"/></svg>`},"download-simple":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"/></svg>`},"envelope-simple":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"/></svg>`},eye:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/></svg>`},file:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/></svg>`},"file-code":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M181.66,146.34a8,8,0,0,1,0,11.32l-24,24a8,8,0,0,1-11.32-11.32L164.69,152l-18.35-18.34a8,8,0,0,1,11.32-11.32Zm-72-24a8,8,0,0,0-11.32,0l-24,24a8,8,0,0,0,0,11.32l24,24a8,8,0,0,0,11.32-11.32L91.31,152l18.35-18.34A8,8,0,0,0,109.66,122.34ZM216,88V216a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V40A16,16,0,0,1,56,24h96a8,8,0,0,1,5.66,2.34l56,56A8,8,0,0,1,216,88Zm-56-8h28.69L160,51.31Zm40,136V96H152a8,8,0,0,1-8-8V40H56V216H200Z"/></svg>`},"file-csv":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M48,180c0,11,7.18,20,16,20a14.24,14.24,0,0,0,10.22-4.66A8,8,0,0,1,85.78,206.4,30.06,30.06,0,0,1,64,216c-17.65,0-32-16.15-32-36s14.35-36,32-36a30.06,30.06,0,0,1,21.78,9.6,8,8,0,0,1-11.56,11.06A14.24,14.24,0,0,0,64,160C55.18,160,48,169,48,180Zm79.6-8.69c-4-1.16-8.14-2.35-10.45-3.84-1.25-.81-1.23-1-1.12-1.9a4.57,4.57,0,0,1,2-3.67c4.6-3.12,15.34-1.73,19.82-.56A8,8,0,0,0,142,145.86c-2.12-.55-21-5.22-32.84,2.76a20.58,20.58,0,0,0-9,14.95c-2,15.88,13.65,20.41,23,23.11,12.06,3.49,13.12,4.92,12.78,7.59-.31,2.41-1.26,3.34-2.14,3.93-4.6,3.06-15.17,1.56-19.55.36A8,8,0,0,0,109.94,214a61.34,61.34,0,0,0,15.19,2c5.82,0,12.3-1,17.49-4.46a20.82,20.82,0,0,0,9.19-15.23C154,179,137.49,174.17,127.6,171.31Zm83.09-26.84a8,8,0,0,0-10.23,4.84L188,184.21l-12.47-34.9a8,8,0,0,0-15.07,5.38l20,56a8,8,0,0,0,15.07,0l20-56A8,8,0,0,0,210.69,144.47ZM216,88v24a8,8,0,0,1-16,0V96H152a8,8,0,0,1-8-8V40H56v72a8,8,0,0,1-16,0V40A16,16,0,0,1,56,24h96a8,8,0,0,1,5.66,2.34l56,56A8,8,0,0,1,216,88Zm-27.31-8L160,51.31V80Z"/></svg>`},flag:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M42.76,50A8,8,0,0,0,40,56V224a8,8,0,0,0,16,0V179.77c26.79-21.16,49.87-9.75,76.45,3.41,16.4,8.11,34.06,16.85,53,16.85,13.93,0,28.54-4.75,43.82-18a8,8,0,0,0,2.76-6V56A8,8,0,0,0,218.76,50c-28,24.23-51.72,12.49-79.21-1.12C111.07,34.76,78.78,18.79,42.76,50ZM216,172.25c-26.79,21.16-49.87,9.74-76.45-3.41-25-12.35-52.81-26.13-83.55-8.4V59.79c26.79-21.16,49.87-9.75,76.45,3.4,25,12.35,52.82,26.13,83.55,8.4Z"/></svg>`},flask:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z"/></svg>`},"floppy-disk":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M219.31,72,184,36.69A15.86,15.86,0,0,0,172.69,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V83.31A15.86,15.86,0,0,0,219.31,72ZM168,208H88V152h80Zm40,0H184V152a16,16,0,0,0-16-16H88a16,16,0,0,0-16,16v56H48V48H172.69L208,83.31ZM160,72a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h56A8,8,0,0,1,160,72Z"/></svg>`},funnel:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M230.6,49.53A15.81,15.81,0,0,0,216,40H40A16,16,0,0,0,28.19,66.76l.08.09L96,139.17V216a16,16,0,0,0,24.87,13.32l32-21.34A16,16,0,0,0,160,194.66V139.17l67.74-72.32.08-.09A15.8,15.8,0,0,0,230.6,49.53ZM40,56h0Zm106.18,74.58A8,8,0,0,0,144,136v58.66L112,216V136a8,8,0,0,0-2.16-5.47L40,56H216Z"/></svg>`},gauge:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M207.06,72.67A111.24,111.24,0,0,0,128,40h-.4C66.07,40.21,16,91,16,153.13V176a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V152A111.25,111.25,0,0,0,207.06,72.67ZM224,176H119.71l54.76-75.3a8,8,0,0,0-12.94-9.42L99.92,176H32V153.13c0-3.08.15-6.12.43-9.13H56a8,8,0,0,0,0-16H35.27c10.32-38.86,44-68.24,84.73-71.66V80a8,8,0,0,0,16,0V56.33A96.14,96.14,0,0,1,221,128H200a8,8,0,0,0,0,16h23.67c.21,2.65.33,5.31.33,8Z"/></svg>`},gear:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"/></svg>`},"github-logo":{fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,104v8a56.06,56.06,0,0,1-48.44,55.47A39.8,39.8,0,0,1,176,192v40a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V216H72a40,40,0,0,1-40-40A24,24,0,0,0,8,152a8,8,0,0,1,0-16,40,40,0,0,1,40,40,24,24,0,0,0,24,24H96v-8a39.8,39.8,0,0,1,8.44-24.53A56.06,56.06,0,0,1,56,112v-8a58.14,58.14,0,0,1,7.69-28.32A59.78,59.78,0,0,1,69.07,28,8,8,0,0,1,76,24a59.75,59.75,0,0,1,48,24h24a59.75,59.75,0,0,1,48-24,8,8,0,0,1,6.93,4,59.74,59.74,0,0,1,5.37,47.68A58,58,0,0,1,216,104Z"/></svg>`},globe:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a115.11,115.11,0,0,1,26-45A115.27,115.27,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z"/></svg>`},"globe-hemisphere-west":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM143.31,41.34,152,56.9,125.09,81.24,112.85,88H96.14a16,16,0,0,0-13.88,8l-8.73,15.23L63.38,84.19,74.32,58.32a87.87,87.87,0,0,1,69-17ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,16.23a16,16,0,0,0,2.86,17.37l.14.14L128,205.94l-1.94,10A88.11,88.11,0,0,1,40,128Zm102.58,86.78,1.13-5.81a16.09,16.09,0,0,0-4-13.9,1.85,1.85,0,0,1-.14-.14L120,174.74,133.7,144l22.82,3.08,45.72,28.12A88.18,88.18,0,0,1,142.58,214.78Z"/></svg>`},"google-logo":{bold:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M228,128a100,100,0,1,1-22.86-63.64,12,12,0,0,1-18.51,15.28A76,76,0,1,0,203.05,140H128a12,12,0,0,1,0-24h88A12,12,0,0,1,228,128Z"/></svg>`},"hard-drives":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,136H48a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V152A16,16,0,0,0,208,136Zm0,64H48V152H208v48Zm0-160H48A16,16,0,0,0,32,56v48a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,64H48V56H208v48ZM192,80a12,12,0,1,1-12-12A12,12,0,0,1,192,80Zm0,96a12,12,0,1,1-12-12A12,12,0,0,1,192,176Z"/></svg>`},hash:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,88H175.4l8.47-46.57a8,8,0,0,0-15.74-2.86l-9,49.43H111.4l8.47-46.57a8,8,0,0,0-15.74-2.86L95.14,88H48a8,8,0,0,0,0,16H92.23L83.5,152H32a8,8,0,0,0,0,16H80.6l-8.47,46.57a8,8,0,0,0,6.44,9.3A7.79,7.79,0,0,0,80,224a8,8,0,0,0,7.86-6.57l9-49.43H144.6l-8.47,46.57a8,8,0,0,0,6.44,9.3A7.79,7.79,0,0,0,144,224a8,8,0,0,0,7.86-6.57l9-49.43H208a8,8,0,0,0,0-16H163.77l8.73-48H224a8,8,0,0,0,0-16Zm-76.5,64H99.77l8.73-48h47.73Z"/></svg>`},info:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/></svg>`},link:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M240,88.23a54.43,54.43,0,0,1-16,37L189.25,160a54.27,54.27,0,0,1-38.63,16h-.05A54.63,54.63,0,0,1,96,119.84a8,8,0,0,1,16,.45A38.62,38.62,0,0,0,150.58,160h0a38.39,38.39,0,0,0,27.31-11.31l34.75-34.75a38.63,38.63,0,0,0-54.63-54.63l-11,11A8,8,0,0,1,135.7,59l11-11A54.65,54.65,0,0,1,224,48,54.86,54.86,0,0,1,240,88.23ZM109,185.66l-11,11A38.41,38.41,0,0,1,70.6,208h0a38.63,38.63,0,0,1-27.29-65.94L78,107.31A38.63,38.63,0,0,1,144,135.71a8,8,0,0,0,16,.45A54.86,54.86,0,0,0,144,96a54.65,54.65,0,0,0-77.27,0L32,130.75A54.62,54.62,0,0,0,70.56,224h0a54.28,54.28,0,0,0,38.64-16l11-11A8,8,0,0,0,109,185.66Z"/></svg>`},"link-simple":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M165.66,90.34a8,8,0,0,1,0,11.32l-64,64a8,8,0,0,1-11.32-11.32l64-64A8,8,0,0,1,165.66,90.34ZM215.6,40.4a56,56,0,0,0-79.2,0L106.34,70.45a8,8,0,0,0,11.32,11.32l30.06-30a40,40,0,0,1,56.57,56.56l-30.07,30.06a8,8,0,0,0,11.31,11.32L215.6,119.6a56,56,0,0,0,0-79.2ZM138.34,174.22l-30.06,30.06a40,40,0,1,1-56.56-56.57l30.05-30.05a8,8,0,0,0-11.32-11.32L40.4,136.4a56,56,0,0,0,79.2,79.2l30.06-30.07a8,8,0,0,0-11.32-11.31Z"/></svg>`},"list-bullets":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M80,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H88A8,8,0,0,1,80,64Zm136,56H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H88a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM44,52A12,12,0,1,0,56,64,12,12,0,0,0,44,52Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,116Zm0,64a12,12,0,1,0,12,12A12,12,0,0,0,44,180Z"/></svg>`},"list-dashes":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M88,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H96A8,8,0,0,1,88,64Zm128,56H96a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Zm0,64H96a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16ZM56,56H40a8,8,0,0,0,0,16H56a8,8,0,0,0,0-16Zm0,64H40a8,8,0,0,0,0,16H56a8,8,0,0,0,0-16Zm0,64H40a8,8,0,0,0,0,16H56a8,8,0,0,0,0-16Z"/></svg>`},lock:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"/></svg>`},"lock-key":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,112a28,28,0,0,0-8,54.83V184a8,8,0,0,0,16,0V166.83A28,28,0,0,0,128,112Zm0,40a12,12,0,1,1,12-12A12,12,0,0,1,128,152Zm80-72H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"/></svg>`},moon:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M235.54,150.21a104.84,104.84,0,0,1-37,52.91A104,104,0,0,1,32,120,103.09,103.09,0,0,1,52.88,57.48a104.84,104.84,0,0,1,52.91-37,8,8,0,0,1,10,10,88.08,88.08,0,0,0,109.8,109.8,8,8,0,0,1,10,10Z"/></svg>`,duotone:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M227.89,147.89A96,96,0,1,1,108.11,28.11,96.09,96.09,0,0,0,227.89,147.89Z" opacity="0.2"/><path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"/></svg>`},paperclip:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M209.66,122.34a8,8,0,0,1,0,11.32l-82.05,82a56,56,0,0,1-79.2-79.21L147.67,35.73a40,40,0,1,1,56.61,56.55L105,193A24,24,0,1,1,71,159L154.3,74.38A8,8,0,1,1,165.7,85.6L82.39,170.31a8,8,0,1,0,11.27,11.36L192.93,81A24,24,0,1,0,159,47L59.76,147.68a40,40,0,1,0,56.53,56.62l82.06-82A8,8,0,0,1,209.66,122.34Z"/></svg>`},"pencil-simple":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/></svg>`},play:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/></svg>`},plus:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/></svg>`,bold:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z"/></svg>`},prohibit:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.56,87.56,0,0,1-20.41,56.28L71.72,60.4A88,88,0,0,1,216,128ZM40,128A87.56,87.56,0,0,1,60.41,71.72L184.28,195.6A88,88,0,0,1,40,128Z"/></svg>`},pulse:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M240,128a8,8,0,0,1-8,8H204.94l-37.78,75.58A8,8,0,0,1,160,216h-.4a8,8,0,0,1-7.08-5.14L95.35,60.76,63.28,131.31A8,8,0,0,1,56,136H24a8,8,0,0,1,0-16H50.85L88.72,36.69a8,8,0,0,1,14.76.46l57.51,151,31.85-63.71A8,8,0,0,1,200,120h32A8,8,0,0,1,240,128Z"/></svg>`},queue:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm104,56H40a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Zm0,64H40a8,8,0,0,0,0,16h96a8,8,0,0,0,0-16Zm112-24a8,8,0,0,1-3.76,6.78l-64,40A8,8,0,0,1,168,200V120a8,8,0,0,1,12.24-6.78l64,40A8,8,0,0,1,248,160Zm-23.09,0L184,134.43v51.14Z"/></svg>`},"share-network":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M176,160a39.89,39.89,0,0,0-28.62,12.09l-46.1-29.63a39.8,39.8,0,0,0,0-28.92l46.1-29.63a40,40,0,1,0-8.66-13.45l-46.1,29.63a40,40,0,1,0,0,55.82l46.1,29.63A40,40,0,1,0,176,160Zm0-128a24,24,0,1,1-24,24A24,24,0,0,1,176,32ZM64,152a24,24,0,1,1,24-24A24,24,0,0,1,64,152Zm112,72a24,24,0,1,1,24-24A24,24,0,0,1,176,224Z"/></svg>`},"shield-check":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.26,47,25.53a8,8,0,0,0,4.2,0c1-.27,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Zm0,72c0,37.07-13.66,67.16-40.6,89.42A129.3,129.3,0,0,1,128,223.62a128.25,128.25,0,0,1-38.92-21.81C61.82,179.51,48,149.3,48,112l0-56,160,0ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,40H48A16,16,0,0,0,32,56v56c0,52.72,25.52,84.67,46.93,102.19,23.06,18.86,46,25.26,47,25.53a8,8,0,0,0,4.2,0c1-.27,23.91-6.67,47-25.53C198.48,196.67,224,164.72,224,112V56A16,16,0,0,0,208,40Zm-34.32,69.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/></svg>`},"sign-out":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M120,216a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H56V208h56A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z"/></svg>`,bold:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M124,216a12,12,0,0,1-12,12H48a12,12,0,0,1-12-12V40A12,12,0,0,1,48,28h64a12,12,0,0,1,0,24H60V204h52A12,12,0,0,1,124,216Zm108.49-96.49-40-40a12,12,0,0,0-17,17L195,116H112a12,12,0,0,0,0,24h83l-19.52,19.51a12,12,0,0,0,17,17l40-40A12,12,0,0,0,232.49,119.51Z"/></svg>`},sliders:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M64,105V40a8,8,0,0,0-16,0v65a32,32,0,0,0,0,62v49a8,8,0,0,0,16,0V167a32,32,0,0,0,0-62Zm-8,47a16,16,0,1,1,16-16A16,16,0,0,1,56,152Zm80-95V40a8,8,0,0,0-16,0V57a32,32,0,0,0,0,62v97a8,8,0,0,0,16,0V119a32,32,0,0,0,0-62Zm-8,47a16,16,0,1,1,16-16A16,16,0,0,1,128,104Zm104,64a32.06,32.06,0,0,0-24-31V40a8,8,0,0,0-16,0v97a32,32,0,0,0,0,62v17a8,8,0,0,0,16,0V199A32.06,32.06,0,0,0,232,168Zm-32,16a16,16,0,1,1,16-16A16,16,0,0,1,200,184Z"/></svg>`},sparkle:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"/></svg>`,duotone:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M194.82,151.43l-55.09,20.3-20.3,55.09a7.92,7.92,0,0,1-14.86,0l-20.3-55.09-55.09-20.3a7.92,7.92,0,0,1,0-14.86l55.09-20.3,20.3-55.09a7.92,7.92,0,0,1,14.86,0l20.3,55.09,55.09,20.3A7.92,7.92,0,0,1,194.82,151.43Z" opacity="0.2"/><path d="M197.58,129.06,146,110l-19-51.62a15.92,15.92,0,0,0-29.88,0L78,110l-51.62,19a15.92,15.92,0,0,0,0,29.88L78,178l19,51.62a15.92,15.92,0,0,0,29.88,0L146,178l51.62-19a15.92,15.92,0,0,0,0-29.88ZM137,164.22a8,8,0,0,0-4.74,4.74L112,223.85,91.78,169A8,8,0,0,0,87,164.22L32.15,144,87,123.78A8,8,0,0,0,91.78,119L112,64.15,132.22,119a8,8,0,0,0,4.74,4.74L191.85,144ZM144,40a8,8,0,0,1,8-8h16V16a8,8,0,0,1,16,0V32h16a8,8,0,0,1,0,16H184V64a8,8,0,0,1-16,0V48H152A8,8,0,0,1,144,40ZM248,88a8,8,0,0,1-8,8h-8v8a8,8,0,0,1-16,0V96h-8a8,8,0,0,1,0-16h8V72a8,8,0,0,1,16,0v8h8A8,8,0,0,1,248,88Z"/></svg>`},"squares-four":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M120,56v48a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40h48A16,16,0,0,1,120,56Zm80-16H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm-96,96H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm96,0H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Z"/></svg>`},stop:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M200,40H56A16,16,0,0,0,40,56V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,160H56V56H200V200Z"/></svg>`},sun:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"/></svg>`,fill:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm8,24a64,64,0,1,0,64,64A64.07,64.07,0,0,0,128,64ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"/></svg>`,duotone:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M184,128a56,56,0,1,1-56-56A56,56,0,0,1,184,128Z" opacity="0.2"/><path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-16-16A8,8,0,0,0,42.34,53.66Zm0,116.68-16,16a8,8,0,0,0,11.32,11.32l16-16a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l16-16a8,8,0,0,0-11.32-11.32l-16,16A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32-11.32ZM48,128a8,8,0,0,0-8-8H16a8,8,0,0,0,0,16H40A8,8,0,0,0,48,128Zm80,80a8,8,0,0,0-8,8v24a8,8,0,0,0,16,0V216A8,8,0,0,0,128,208Zm112-88H216a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Z"/></svg>`},table:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,112H80v32H40Zm56,0H216v32H96ZM216,64V96H40V64ZM40,160H80v32H40Zm176,32H96V160H216v32Z"/></svg>`},tag:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z"/></svg>`},"text-aa":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M87.24,52.59a8,8,0,0,0-14.48,0l-64,136a8,8,0,1,0,14.48,6.81L39.9,160h80.2l16.66,35.4a8,8,0,1,0,14.48-6.81ZM47.43,144,80,74.79,112.57,144ZM200,96c-12.76,0-22.73,3.47-29.63,10.32a8,8,0,0,0,11.26,11.36c3.8-3.77,10-5.68,18.37-5.68,13.23,0,24,9,24,20v3.22A42.76,42.76,0,0,0,200,128c-22.06,0-40,16.15-40,36s17.94,36,40,36a42.73,42.73,0,0,0,24-7.25,8,8,0,0,0,16-.75V132C240,112.15,222.06,96,200,96Zm0,88c-13.23,0-24-9-24-20s10.77-20,24-20,24,9,24,20S213.23,184,200,184Z"/></svg>`},"toggle-left":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M176,56H80a72,72,0,0,0,0,144h96a72,72,0,0,0,0-144Zm0,128H80A56,56,0,0,1,80,72h96a56,56,0,0,1,0,112ZM80,88a40,40,0,1,0,40,40A40,40,0,0,0,80,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,80,152Z"/></svg>`},trash:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/></svg>`},"upload-simple":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0ZM93.66,77.66,120,51.31V144a8,8,0,0,0,16,0V51.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,77.66Z"/></svg>`},user:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/></svg>`},"user-gear":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M144,157.68a68,68,0,1,0-71.9,0c-20.65,6.76-39.23,19.39-54.17,37.17a8,8,0,1,0,12.24,10.3C50.25,181.19,77.91,168,108,168s57.75,13.19,77.87,37.15a8,8,0,0,0,12.26-10.3C183.18,177.07,164.6,164.44,144,157.68ZM56,100a52,52,0,1,1,52,52A52.06,52.06,0,0,1,56,100Zm196.25,43.07-4.66-2.69a23.6,23.6,0,0,0,0-8.76l4.66-2.69a8,8,0,1,0-8-13.86l-4.67,2.7a23.92,23.92,0,0,0-7.58-4.39V108a8,8,0,0,0-16,0v5.38a23.92,23.92,0,0,0-7.58,4.39l-4.67-2.7a8,8,0,1,0-8,13.86l4.66,2.69a23.6,23.6,0,0,0,0,8.76l-4.66,2.69a8,8,0,0,0,8,13.86l4.67-2.7a23.92,23.92,0,0,0,7.58,4.39V164a8,8,0,0,0,16,0v-5.38a23.92,23.92,0,0,0,7.58-4.39l4.67,2.7a7.92,7.92,0,0,0,4,1.07,8,8,0,0,0,4-14.93ZM216,136a8,8,0,1,1,8,8A8,8,0,0,1,216,136Z"/></svg>`},users:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"/></svg>`},"warning-circle":{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"/></svg>`},x:{regular:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/></svg>`},"x-circle":{bold:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M168.49,104.49,145,128l23.52,23.51a12,12,0,0,1-17,17L128,145l-23.51,23.52a12,12,0,0,1-17-17L111,128,87.51,104.49a12,12,0,0,1,17-17L128,111l23.51-23.52a12,12,0,0,1,17,17ZM236,128A108,108,0,1,1,128,20,108.12,108.12,0,0,1,236,128Zm-24,0a84,84,0,1,0-84,84A84.09,84.09,0,0,0,212,128Z"/></svg>`}},Qm=class extends a{static styles=t`
    :host {
      display: inline-flex;
      flex-shrink: 0;
      inline-size: var(--_size, 1em);
      block-size: var(--_size, 1em);
      color: var(--_color, currentColor);
      line-height: 0;
    }
    svg {
      inline-size: 100%;
      block-size: 100%;
    }
  `;static properties={name:{type:String},size:{type:Number},weight:{type:String},color:{type:String}};constructor(){super(),this.name=``,this.size=void 0,this.weight=`regular`,this.color=``}connectedCallback(){super.connectedCallback(),this.setAttribute(`aria-hidden`,`true`)}willUpdate(){this.style.setProperty(`--_size`,this.size?`${this.size}px`:null),this.style.setProperty(`--_color`,this.color||null)}render(){let e=Zm[this.name],t=e?.[this.weight]??e?.regular;return t?i`${Xm(t)}`:n}};customElements.get(`admin-icon`)||customElements.define(`admin-icon`,Qm);var $m=`moul_admin_user`,eh=`mould_admin_user`;function th(){try{let e=localStorage.getItem($m)||localStorage.getItem(eh);if(e)return JSON.parse(e);let t=b();if(t&&t.includes(`.`)){let e=JSON.parse(atob(t.split(`.`)[1]));return{id:e.id||e.sub,username:e.username||e.identity||`admin`,name:e.name||e.username||`admin`,email:e.email||``,role:e.role||`Admin`}}}catch{}return null}function nh(){localStorage.removeItem($m),localStorage.removeItem(eh)}var rh=new class extends ee{token=b();adminKey=x();storedUser=th();needsSetup=!1;isLoading=!0;initialized=!1;get isAuthenticated(){return!!(this.token&&this.adminKey)}get user(){return this.storedUser||(this.isAuthenticated?{username:`admin`,name:`admin`,role:`Admin`}:null)}async init(){if(this.initialized)return;this.initialized=!0,this.isLoading=!0,this.notify();let e=x(),t=b();if(e)try{let e=await C.getSetupStatus();this.needsSetup=e.needsSetup,t&&await this.refreshUser()}catch{g(),v(),nh(),this.adminKey=null,this.token=null,this.storedUser=null,this.needsSetup=!1}else this.needsSetup=!1;this.isLoading=!1,this.notify(),w({isAuthenticated:!!(b()&&x()),user:th(),adminKey:!!x()})}async refreshUser(){if(b()&&x())try{let e=await C.getRootAccount();if(e){let t={id:e.id,username:e.username||`admin`,name:e.name||e.username||`admin`,email:e.email||``,role:`Admin`};localStorage.setItem($m,JSON.stringify(t)),this.storedUser=t,this.notify(),w({isAuthenticated:!0,user:t,adminKey:!!x()})}}catch{}}async checkSetup(e){if(!(e||this.adminKey||x()))return!1;e&&(_(e),this.adminKey=e);try{let t=e?await C.verifyAdminKeyWithKey(e):await C.getSetupStatus();return this.needsSetup=t.needsSetup,t.needsSetup}catch{return!1}finally{this.notify()}}async verifyAndSetAdminKey(e){let t=e.trim();if(!t)throw Error(`Master Admin Key is required`);let n=await C.verifyAdminKeyWithKey(t);return _(t),this.adminKey=t,this.needsSetup=n.needsSetup,this.notify(),w({isAuthenticated:!!(this.token&&t),user:this.storedUser,adminKey:!0}),y({action:`auth:admin-key-verified`,category:`auth`,details:{needsSetup:n.needsSetup}}),{needsSetup:n.needsSetup}}clearAdminKey(){g(),v(),nh(),this.adminKey=null,this.token=null,this.storedUser=null,this.needsSetup=!1,this.notify(),w({isAuthenticated:!1,user:null,adminKey:!1}),y({action:`auth:admin-key-cleared`,category:`auth`})}async adminLogin(e,t){let n=(this.adminKey||x()||``).trim(),r=e.trim();if(!n)throw Error(`Master Admin Key is required`);if(!r||!t)throw Error(`Username/Email and Password are required`);_(n),this.adminKey=n;try{let e=await C.adminLogin(r,t);if(!e.token)throw Error(`Authentication succeeded but no token was returned`);let n=r.includes(`@`)?r.split(`@`)[0]:r,i=e.record||{username:n,name:n,email:r.includes(`@`)?r:``,role:`Admin`};e.record?.name&&(i.name=e.record.name),localStorage.setItem($m,JSON.stringify(i)),this.storedUser=i,S(e.token),this.token=e.token,this.needsSetup=!1,this.notify(),w({isAuthenticated:!0,user:i,adminKey:!0}),y({action:`auth:login-success`,category:`auth`,details:{username:i.username,role:i.role}})}catch(e){throw v(),nh(),this.storedUser=null,this.token=null,this.notify(),w({isAuthenticated:!1,user:null,adminKey:!!n}),y({action:`auth:login-failed`,category:`auth`,details:{error:e.message}}),Error(e.message||`Invalid root credentials`)}}saveAdminKey(e){let t=e.trim();_(t),this.adminKey=t,this.notify(),w({isAuthenticated:!!(this.token&&t),user:this.storedUser,adminKey:!0})}saveToken(e){S(e),this.token=e,this.notify(),w({isAuthenticated:!!(e&&this.adminKey),user:this.storedUser,adminKey:!!this.adminKey})}updateUser(e){let t=this.storedUser?{...this.storedUser,...e}:{username:`admin`,name:`admin`,role:`Admin`,...e};localStorage.setItem($m,JSON.stringify(t)),this.storedUser=t,this.notify(),w({isAuthenticated:this.isAuthenticated,user:t,adminKey:!!this.adminKey})}logout(){v(),nh(),this.storedUser=null,this.token=null,this.notify(),w({isAuthenticated:!1,user:null,adminKey:!!this.adminKey}),y({action:`auth:logout`,category:`auth`})}},ih=`moul_theme_mode`,ah={system:`light`,light:`dark`,dark:`system`};function oh(){try{let e=localStorage.getItem(ih);if(e===`light`||e===`dark`||e===`system`)return e}catch{}return`system`}var sh=new class extends ee{theme=oh();systemQuery=window.matchMedia(`(prefers-color-scheme: dark)`);constructor(){super(),this.systemQuery.addEventListener(`change`,()=>{this.apply(),this.notify()}),this.apply()}get resolvedTheme(){return this.theme===`system`?this.systemQuery.matches?`dark`:`light`:this.theme}setTheme(e){this.theme=e;try{localStorage.setItem(ih,e)}catch{}this.apply(),this.notify()}cycleTheme(){this.setTheme(ah[this.theme])}apply(){let e=document.documentElement;e.setAttribute(`data-theme`,this.resolvedTheme),e.style.colorScheme=this.theme===`system`?`light dark`:this.theme}},ch=[{to:`/overview`,label:`Overview`,ariaLabel:`Overview`,icon:`squares-four`,isActive:()=>D.location.pathname===`/overview`||D.location.pathname===`/`},{to:`/collections`,label:`Collections`,ariaLabel:`Collections`,icon:`database`,isActive:()=>D.isActive(`/collections`)||D.isActive(`/records`)},{to:`/analytics`,label:`Analytics`,ariaLabel:`Analytics`,icon:`chart-line-up`,isActive:()=>D.isActive(`/analytics`)},{to:`/realtime`,label:`Realtime`,ariaLabel:`Realtime Hub`,icon:`broadcast`,isActive:()=>D.isActive(`/realtime`)}],lh=[`/workers`,`/flags`,`/settings`,`/docs`],uh=class extends a{static styles=[r,t`
      nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 50;
        height: calc(58px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding-inline: var(--spacing-2);
        background-color: var(--color-bg-glass);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-top: 1px solid var(--color-border-subtle);
        box-shadow: var(--shadow-sm);
      }

      @media (min-width: 768px) {
        nav {
          display: none;
        }
      }

      button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        flex: 1;
        max-width: 72px;
        height: 46px;
        padding: 4px;
        border-radius: var(--radius-md);
        border: 0;
        background-color: transparent;
        color: var(--color-fg-subtle);
        cursor: pointer;
        font: inherit;
        outline: none;
        transition: all 0.15s ease;
        -webkit-tap-highlight-color: transparent;
        position: relative;
      }

      button:focus-visible {
        box-shadow: var(--focus-ring);
      }

      button.active {
        color: var(--color-primary-500);
      }

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 24px;
        position: relative;
        transition: transform 0.15s ease;
      }

      .active .icon {
        transform: scale(1.08);
      }

      .dot {
        position: absolute;
        top: -2px;
        right: 2px;
        width: 5px;
        height: 5px;
        border-radius: 9999px;
        background-color: var(--color-primary-500);
      }

      .label {
        font-size: 0.6875rem;
        font-weight: 500;
        font-family: var(--font-family-base);
        line-height: 1.1;
        letter-spacing: -0.01em;
        transition: font-weight 0.15s ease;
      }

      .active .label {
        font-weight: 600;
      }
    `];static properties={isMoreOpen:{type:Boolean,attribute:`is-more-open`}};constructor(){super(),this.isMoreOpen=!1,new T(this,D)}renderTab(e,t,r,a=n){return i`
      <span class="icon">
        <admin-icon name=${e} size="22" weight=${r?`fill`:`regular`}></admin-icon>
        ${a}
      </span>
      <span class="label">${t}</span>
    `}render(){let e=this.isMoreOpen||lh.some(e=>D.isActive(e));return i`
      <nav aria-label="Mobile Bottom Navigation">
        ${ch.map(e=>{let t=e.isActive();return i`
            <button
              type="button"
              class=${t?`active`:``}
              aria-label=${e.ariaLabel}
              aria-current=${t?`page`:n}
              @click=${()=>D.navigate(e.to)}
            >
              ${this.renderTab(e.icon,e.label,t)}
            </button>
          `})}
        <button
          type="button"
          class=${e?`active`:``}
          aria-label="More navigation and system settings"
          aria-expanded=${this.isMoreOpen?`true`:`false`}
          @click=${()=>this.dispatchEvent(new CustomEvent(`openmore`))}
        >
          ${this.renderTab(`dots-three-outline-vertical`,`More`,e,e&&!this.isMoreOpen?i`<span class="dot"></span>`:n)}
        </button>
      </nav>
    `}};customElements.define(`admin-bottom-tab-bar`,uh);function dh(e=24,t=`currentColor`){return i`
    <svg
      viewBox="0 0 100 100"
      width=${e}
      height=${e}
      fill=${t}
      style="display: block; flex-shrink: 0"
      aria-hidden="true"
    >
      <title>moul.dev</title>
      <!-- Center Pentagon -->
      <polygon points="80.29,50.00 65.06,73.08 35.53,66.00 35.53,34.00 65.06,26.92" />
      <!-- Right Face -->
      <polygon points="82.01,51.24 95.00,51.24 88.99,72.83 71.53,88.94 66.78,74.32" />
      <!-- Bottom Face -->
      <polygon points="64.33,75.29 69.08,89.92 43.24,94.02 17.82,80.55 34.80,68.21" />
      <!-- Bottom-Left Face -->
      <polygon points="33.04,66.00 16.06,78.34 5.00,50.00 16.06,21.66 33.04,34.00" />
      <!-- Top-Left Face -->
      <polygon points="34.80,31.79 17.82,19.45 43.24,5.98 69.08,10.08 64.33,24.71" />
      <!-- Top-Right Face -->
      <polygon points="66.78,25.68 71.53,11.06 88.99,27.17 95.00,48.76 82.01,48.76" />
    </svg>
  `}var fh=class extends a{static styles=[r,t`
      :host {
        display: block;
        width: 100%;
        max-width: var(--content-max-width, 1200px);
        transition: max-width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        flex-shrink: 0;
      }

      header {
        height: 48px;
        background-color: var(--color-bg-subtle);
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-inline: var(--spacing-4);
      }

      .left {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        min-width: 0;
        overflow: hidden;
      }

      .mobile-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--color-fg);
        flex-shrink: 0;
        margin-right: 2px;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        flex-shrink: 0;
      }

      .badge-content {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
      }

      @media (max-width: 767px) {
        header {
          padding-inline: var(--spacing-3);
        }
        .actions {
          gap: 4px;
        }
      }
    `];mobile=new E(this,`(max-width: 767px)`);constructor(){super(),new T(this,D)}render(){let e=this.mobile.matches,t=D.location.pathname.split(`/`).filter(Boolean),r=t.length>0?t[t.length-1].replace(/-/g,` `).replace(/\b\w/g,e=>e.toUpperCase()):`Overview`;return i`
      <header>
        <div class="left">
          ${e?i`<a class="mobile-logo" href=${D.href(`/overview`)} aria-label="moul.dev Home">${dh(24)}</a>`:n}
          <moul-breadcrumbs aria-label="Breadcrumbs">
            <moul-breadcrumb-item href=${D.href(`/overview`)}>moul</moul-breadcrumb-item>
            <moul-breadcrumb-item is-current>${r}</moul-breadcrumb-item>
          </moul-breadcrumbs>
        </div>

        <div class="actions">
          <moul-badge tone="primary">
            <span class="badge-content" title="Engine Online">
              <admin-icon name="cpu" size="13"></admin-icon>
              ${e?n:i`<span>Engine Online</span>`}
            </span>
          </moul-badge>
          <moul-badge tone="success">
            <span class="badge-content" title="Root Auth">
              <admin-icon name="shield-check" weight="fill" size="13"></admin-icon>
              ${e?n:i`<span>Root Auth</span>`}
            </span>
          </moul-badge>
        </div>
      </header>
    `}};customElements.define(`admin-header`,fh);var ph=[{to:`/overview`,label:`Overview`,icon:`squares-four`},{to:`/collections`,label:`Collections`,icon:`database`},{to:`/realtime`,label:`Realtime Hub`,icon:`broadcast`},{to:`/analytics`,label:`Analytics`,icon:`chart-line-up`}],mh=[{to:`/workers`,label:`Worker Queue`,icon:`queue`,description:`Background tasks & jobs`},{to:`/flags`,label:`Feature Flags`,icon:`flag`,description:`Toggles & rollouts`},{to:`/settings`,label:`Settings`,icon:`gear`,description:`System config & keys`},{to:`/docs`,label:`API Reference`,icon:`book-open`,description:`OpenAPI & endpoints`}],hh=[...ph,...mh];function gh(e){let t=!!(e?.name&&e.name.trim()!==``&&e.name.trim().toLowerCase()!==e.username?.trim().toLowerCase()),n=e?.username||`admin`,r=t?e.name.trim():n,i=e?.email||``;return{displayName:r,displayUsername:n,displayEmail:i,hasCustomName:t,subtitle:t?`@${n}${i?` • ${i}`:``}`:i?`${i} (@${n})`:`@${n}`}}var _h=[{key:`light`,icon:`sun`,label:`Light Theme`},{key:`dark`,icon:`moon`,label:`Dark Theme`},{key:`system`,icon:`desktop`,label:`System Theme`}],vh=t`
  moul-toggle-button-group moul-toggle-button::part(button) {
    padding-inline: 6px;
  }
`;function yh(e,t){return i`
    <moul-toggle-button-group
      selected-key=${e}
      aria-label="Theme switcher"
      @selectionchange=${e=>{let n=e.detail.selectedKey;(n===`light`||n===`dark`||n===`system`)&&t(n)}}
    >
      ${_h.map(t=>i`
          <moul-toggle-button value=${t.key} size="sm" aria-label=${t.label}>
            <admin-icon name=${t.icon} size="14" weight=${e===t.key?`fill`:`regular`}></admin-icon>
          </moul-toggle-button>
        `)}
    </moul-toggle-button-group>
  `}var bh=class extends a{static styles=[r,vh,t`
      /* Size the sheet to its content (up to the drawer's 85vh cap) instead of size="lg"'s fixed 32rem */
      moul-drawer::part(base) {
        height: auto;
      }

      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-fg);
      }

      .body {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-3);
        padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
      }

      .user-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-3);
        padding: var(--spacing-3);
        border-radius: var(--radius-lg);
        background-color: var(--color-bg-subtle);
        border: 1px solid var(--color-border-subtle);
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        min-width: 0;
        flex: 1;
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
      }

      .user-name-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .user-name {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--color-fg);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .user-sub {
        font-size: 0.75rem;
        color: var(--color-fg-subtle);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .section-title {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-fg-subtle);
        margin-top: var(--spacing-1);
        margin-bottom: 2px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-2);
      }

      .nav-card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-1);
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-border-subtle);
        background-color: var(--color-bg-subtle);
        cursor: pointer;
        text-align: left;
        font: inherit;
        transition: all 0.15s ease;
        outline: none;
      }

      .nav-card:hover,
      .nav-card:active,
      .nav-card.active {
        background-color: var(--color-bg-elevated);
      }

      .nav-card.active {
        border-color: var(--color-primary-500);
      }

      .nav-card:focus-visible {
        box-shadow: var(--focus-ring);
      }

      .nav-card-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md);
        background-color: var(--color-bg);
        color: var(--color-fg);
        margin-bottom: 2px;
      }

      .active .nav-card-icon {
        background-color: var(--color-primary-500);
        color: var(--color-fg-on-primary);
      }

      .nav-card-title {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--color-fg);
      }

      .nav-card-sub {
        font-size: 0.6875rem;
        color: var(--color-fg-subtle);
        line-height: 1.2;
      }

      .settings-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-3);
        border-radius: var(--radius-md);
        background-color: var(--color-bg-subtle);
        border: 1px solid var(--color-border-subtle);
      }

      .settings-row-label {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-fg);
      }

      .settings-row-label admin-icon {
        color: var(--color-fg-subtle);
      }

      .divider {
        height: 1px;
        background-color: var(--color-border-subtle);
        margin-block: var(--spacing-1);
      }

      .sign-out {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);
        padding: var(--spacing-3) var(--spacing-4);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-alert-border-error);
        background-color: var(--color-alert-bg-error);
        color: var(--color-error-500);
        font: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        outline: none;
      }

      .sign-out:hover {
        background-color: var(--color-alert-hover-error);
      }

      .sign-out:active {
        background-color: var(--color-alert-active-error);
      }

      .sign-out:focus-visible {
        box-shadow: var(--focus-ring);
      }
    `];static properties={isOpen:{type:Boolean,attribute:`is-open`},identity:{attribute:!1}};constructor(){super(),this.isOpen=!1,this.identity=gh(null),new T(this,D,sh)}close(){this.isOpen=!1,this.dispatchEvent(new CustomEvent(`openchange`,{detail:{isOpen:!1}}))}go(e,t){this.close(),D.navigate(e,{search:t})}onOpenChange(e){e.stopPropagation(),e.detail.isOpen||this.close()}render(){let{displayName:e,subtitle:t}=this.identity;return i`
      <moul-drawer placement="bottom" size="lg" ?is-open=${this.isOpen} @openchange=${this.onOpenChange}>
        <div slot="header" class="header-row">
          <h2>Menu & System Tools</h2>
          <moul-button variant="ghost" is-icon size="sm" aria-label="Close menu" @click=${o(()=>this.close())}>
            <admin-icon name="x" size="16"></admin-icon>
          </moul-button>
        </div>

        <div class="body">
          <div class="user-card">
            <div class="user-info">
              <moul-avatar name=${e} size="md"></moul-avatar>
              <div class="user-meta">
                <div class="user-name-row">
                  <span class="user-name">${e}</span>
                  <moul-badge tone="primary" size="sm">ROOT</moul-badge>
                </div>
                <span class="user-sub">${t}</span>
              </div>
            </div>
            <moul-button variant="ghost" is-icon aria-label="Account Settings" @click=${o(()=>this.go(`/settings`,{tab:`account`}))}>
              <admin-icon name="user-gear" size="18"></admin-icon>
            </moul-button>
          </div>

          <div>
            <div class="section-title">System Modules</div>
            <div class="grid">
              ${mh.map(e=>{let t=D.isActive(e.to);return i`
                  <button type="button" class="nav-card ${t?`active`:``}" @click=${()=>this.go(e.to)}>
                    <span class="nav-card-icon"><admin-icon name=${e.icon} size="18"></admin-icon></span>
                    <span class="nav-card-title">${e.label}</span>
                    <span class="nav-card-sub">${e.description}</span>
                  </button>
                `})}
            </div>
          </div>

          <div>
            <div class="section-title">Preferences</div>
            <div class="settings-row">
              <span class="settings-row-label">
                <admin-icon name="sun" size="18"></admin-icon>
                <span>Theme</span>
              </span>
              ${yh(sh.theme,e=>sh.setTheme(e))}
            </div>
          </div>

          <div class="divider"></div>

          <button
            type="button"
            class="sign-out"
            @click=${()=>{this.close(),rh.logout()}}
          >
            <admin-icon name="sign-out" weight="bold" size="18"></admin-icon>
            <span>Sign Out</span>
          </button>
        </div>
      </moul-drawer>
    `}};customElements.define(`admin-more-menu-drawer`,bh);var xh=`moul_sidebar_collapsed`;function Sh(){try{return localStorage.getItem(xh)===`true`}catch{return!1}}var Ch=class extends a{static styles=[r,vh,t`
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }

      :host([collapsed]) {
        --content-max-width: 100%;
      }

      moul-sidebar {
        height: 100%;
      }

      @media (max-width: 767px) {
        moul-sidebar-aside {
          display: none !important;
        }
      }

      moul-sidebar-header {
        padding-inline: var(--spacing-2);
      }

      :host([collapsed]) moul-sidebar-header {
        padding-inline: 0;
      }

      moul-popover {
        display: block;
        width: 100%;
      }

      moul-popover::part(trigger) {
        display: block;
      }

      .user-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        padding: 4px var(--spacing-3);
        height: 40px;
        width: 100%;
        min-width: 0;
        overflow: hidden;
        border-radius: var(--radius-md);
        border: 0;
        background-color: transparent;
        color: var(--color-fg);
        font: inherit;
        cursor: pointer;
        text-align: left;
        transition: background-color 0.15s ease;
        outline: none;
      }

      .user-trigger:hover {
        background-color: var(--color-bg-subtle);
      }

      .user-trigger:focus-visible {
        box-shadow: var(--focus-ring);
      }

      :host([collapsed]) .user-trigger {
        padding-inline: 0;
        justify-content: center;
        width: 36px;
        height: 36px;
      }

      .user-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        min-width: 0;
        overflow: hidden;
        flex: 1;
      }

      .user-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-fg);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .menu {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 260px;
        max-width: 280px;
      }

      .menu-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        padding: 6px 8px;
      }

      .menu-header-meta {
        display: flex;
        flex-direction: column;
        min-width: 0;
        overflow: hidden;
        flex: 1;
        gap: 2px;
      }

      .menu-header-name-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        min-width: 0;
      }

      .menu-header-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-fg);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .menu-header-sub {
        font-size: 0.75rem;
        color: var(--color-fg-subtle);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        line-height: 1.3;
      }

      .menu-divider {
        height: 1px;
        background-color: var(--color-border-subtle);
        margin-block: 4px;
      }

      .menu-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: 6px 8px;
        min-height: 36px;
        width: 100%;
        border-radius: var(--radius-md);
        border: 0;
        background-color: transparent;
        color: var(--color-fg);
        cursor: pointer;
        text-align: left;
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 500;
        transition:
          background-color 0.15s ease,
          color 0.15s ease;
        outline: none;
      }

      .menu-item:hover {
        background-color: var(--color-bg-subtle);
      }

      .menu-item:focus-visible {
        box-shadow: var(--focus-ring);
      }

      .menu-item admin-icon {
        color: var(--color-fg-subtle);
      }

      .menu-item.danger,
      .menu-item.danger admin-icon {
        color: var(--color-error-500);
      }

      .menu-item.danger:hover {
        background-color: var(--color-alert-hover-error);
      }

      .theme-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-2);
        padding: 4px 8px;
        min-height: 36px;
        border-radius: var(--radius-md);
        font-size: 0.8125rem;
        font-weight: 500;
      }

      .theme-row-label {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .theme-row-label admin-icon {
        color: var(--color-fg-subtle);
      }

      .brand {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--color-fg);
        flex-shrink: 0;
        padding: 2px;
        border-radius: var(--radius-md);
        line-height: 1;
      }

      .header-container {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        padding-inline: 0 var(--spacing-3);
        flex-shrink: 0;
      }

      main {
        flex: 1;
        padding-block: var(--spacing-3);
        padding-inline: 0 var(--spacing-3);
        overflow-y: auto;
        background-color: var(--color-bg);
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      @media (max-width: 767px) {
        .header-container {
          padding-inline: var(--spacing-3);
        }

        main {
          padding-block: var(--spacing-2) calc(68px + env(safe-area-inset-bottom, 0px));
          padding-inline: var(--spacing-3);
        }
      }
    `];static properties={collapsed:{type:Boolean,reflect:!0},isMoreOpen:{state:!0}};mobile=new E(this,`(max-width: 767px)`);account=new f(this,()=>({queryKey:[`rootAccount`],queryFn:C.getRootAccount,staleTime:3e5}));lastPath=``;constructor(){super(),this.collapsed=Sh(),this.isMoreOpen=!1,new T(this,D,rh,sh)}updated(){D.location.pathname!==this.lastPath&&(this.lastPath=D.location.pathname,this.renderRoot.querySelector(`main`)?.scrollTo({top:0}))}onSelectionChange(e){e.target===e.currentTarget&&D.navigate(e.detail.selectedKey)}onCollapseChange(e){if(e.target===e.currentTarget){this.collapsed=e.detail.collapsed;try{localStorage.setItem(xh,String(this.collapsed))}catch{}}}closeMenu(){let e=this.renderRoot.querySelector(`moul-popover`);e&&(e.isOpen=!1)}renderNavItem(e){return i`
      <moul-sidebar-item key=${e.to} href=${D.href(e.to)} label=${e.label}>
        <admin-icon slot="icon" name=${e.icon} size="18"></admin-icon>
      </moul-sidebar-item>
    `}render(){let e=gh(this.account.data||rh.user),{displayName:t,subtitle:r}=e,a=D.isActive(`/records`)?`/collections`:hh.find(e=>D.isActive(e.to))?.to||`/overview`,o=this.mobile.matches;return i`
      <moul-sidebar
        ?collapsed=${this.collapsed}
        selected-key=${a}
        @selectionchange=${this.onSelectionChange}
        @collapsechange=${this.onCollapseChange}
      >
        <moul-sidebar-aside show-collapse-toggle>
          <moul-sidebar-header>
            <moul-popover placement="bottom">
              <button slot="trigger" type="button" class="user-trigger" aria-label="Root User Menu">
                <span class="user-row">
                  <moul-avatar name=${t} size="sm"></moul-avatar>
                  ${this.collapsed?n:i`<span class="user-name">${t}</span>`}
                </span>
                ${this.collapsed?n:i`<admin-icon name="caret-down" size="12" color="var(--color-fg-subtle)"></admin-icon>`}
              </button>

              <div class="menu">
                <div class="menu-header">
                  <moul-avatar name=${t} size="sm"></moul-avatar>
                  <div class="menu-header-meta">
                    <div class="menu-header-name-row">
                      <span class="menu-header-name">${t}</span>
                      <moul-badge tone="primary" size="sm">ROOT</moul-badge>
                    </div>
                    <span class="menu-header-sub">${r}</span>
                  </div>
                </div>

                <div class="menu-divider"></div>

                <button
                  type="button"
                  class="menu-item"
                  @click=${()=>{this.closeMenu(),D.navigate(`/settings`,{search:{tab:`account`}})}}
                >
                  <admin-icon name="user-gear" size="16"></admin-icon>
                  <span>Account</span>
                </button>

                <div class="theme-row">
                  <span class="theme-row-label">
                    <admin-icon name="sun" size="16"></admin-icon>
                    <span>Theme</span>
                  </span>
                  ${yh(sh.theme,e=>sh.setTheme(e))}
                </div>

                <div class="menu-divider"></div>

                <button
                  type="button"
                  class="menu-item danger"
                  @click=${()=>{this.closeMenu(),rh.logout()}}
                >
                  <admin-icon name="sign-out" size="16"></admin-icon>
                  <span>Sign Out</span>
                </button>
              </div>
            </moul-popover>
          </moul-sidebar-header>

          <moul-sidebar-group label="Platform">${ph.map(e=>this.renderNavItem(e))}</moul-sidebar-group>
          <moul-sidebar-group label="System">${mh.map(e=>this.renderNavItem(e))}</moul-sidebar-group>

          <moul-sidebar-footer>
            <a class="brand" href=${D.href(`/overview`)} aria-label="moul.dev">${dh(32)}</a>
          </moul-sidebar-footer>
        </moul-sidebar-aside>

        <moul-sidebar-main>
          <div class="header-container"><admin-header></admin-header></div>
          <main><slot></slot></main>
        </moul-sidebar-main>
      </moul-sidebar>

      ${o?i`
            <admin-bottom-tab-bar ?is-more-open=${this.isMoreOpen} @openmore=${()=>this.isMoreOpen=!0}></admin-bottom-tab-bar>
            <admin-more-menu-drawer
              ?is-open=${this.isMoreOpen}
              .identity=${e}
              @openchange=${e=>this.isMoreOpen=e.detail.isOpen}
            ></admin-more-menu-drawer>
          `:n}
    `}};customElements.define(`admin-layout`,Ch);function wh(){try{return!1}catch{return!1}}function Th(e,t){return Array.isArray(e)?`[${e.map(e=>Th(e,!0)??`"[object]"`).join(`,`)}]`:e instanceof Error?t?void 0:JSON.stringify(e.message):typeof e==`symbol`||typeof e==`bigint`||t&&(e===void 0||typeof e==`number`&&!Number.isFinite(e))?JSON.stringify(String(e)):e===void 0||typeof e==`number`&&!Number.isFinite(e)?String(e):typeof e!=`object`||!e?JSON.stringify(e):void 0}function X(e,t={},n=`error`){let r=Object.entries(t).flatMap(([e,t])=>{try{let n=Th(t,!1);return n===void 0?[]:[`${e}=${n}`]}catch{return[]}}).join(`, `).replace(/[\u2028\u2029]/g,e=>`\\u${e.charCodeAt(0).toString(16)}`);return`TanStack DB ${n} ${e}${r&&` (${r})`}: https://tanstack.com/db/latest/docs/errors#${n}-${e}`}function Eh(e,t){return X(e,t,`warning`)}var Dh=Symbol(`refProxy`);function Oh(e){if(e&&typeof e==`object`)try{let t=e[Dh];return t===!0||Array.isArray(t)?t:void 0}catch{return}}function kh(e){return e&&typeof e==`object`&&Oh(e)!==void 0}var Ah=`__includes_scalar__`,jh=0,Mh=0,Nh=class{},Ph=class extends Nh{constructor(e,t,n){super(),this.type=`collectionRef`,this.#e=`source-${++jh}`,this.collection=e,this.alias=t,this.#t=n??`binding-${++Mh}`}#e;#t;get sourceId(){return this.#e}get bindingId(){return this.#t}},Fh=class extends Nh{constructor(e,t,n){super(),this.descriptor=e,this.alias=t,this.type=`descriptorRef`,this.#e=`source-${++jh}`,this.#t=n??`binding-${++Mh}`}#e;#t;get sourceId(){return this.#e}get bindingId(){return this.#t}};function Ih(e){if(e.type===`descriptorRef`)throw Error(X(113,{alias:e.alias}));return e.collection}var Lh=class extends Nh{constructor(e,t,n){super(),this.query=e,this.alias=t,this.type=`queryRef`,this.#e=n??`binding-${++Mh}`}#e;get bindingId(){return this.#e}},Rh=class extends Nh{constructor(e){super(),this.sources=e,this.type=`unionFrom`}get alias(){return this.sources[0]?.alias??``}},zh=class extends Nh{constructor(e){super(),this.queries=e,this.type=`unionAll`}get alias(){return``}},Bh=class extends Nh{constructor(e,t,n){super(),this.path=e,this.type=`ref`,t!==void 0&&(this.sourceAlias=t),n!==void 0&&Object.defineProperty(this,"bindingId",{value:n,enumerable:!1})}};function Vh(e){return e.sourceAlias!==void 0&&e.path[0]===e.sourceAlias?e.sourceAlias:void 0}function Hh(e){return Vh(e)===void 0?e.path:e.path.slice(1)}var Uh=class extends Nh{constructor(e){super(),this.value=e,this.type=`val`}},Wh=class extends Nh{constructor(e,t){super(),this.name=e,this.args=t,this.type=`func`}},Gh=class extends Nh{constructor(e,t,n){super(),this.name=e,this.args=t,this.grouping=n,this.type=`agg`}};function Kh(e){return e.type===`ref`?[e]:e.type===`func`||e.type===`agg`?e.args.flatMap(Kh):[]}var qh=class extends Nh{constructor(e,t,n,r,i,a,o,s=`collection`,c){super(),this.query=e,this.correlationField=t,this.childCorrelationField=n,this.fieldName=r,this.runtime=i,this.parentFilters=a,this.parentProjection=o,this.materialization=s,this.scalarField=c,this.type=`includesSubquery`}},Jh=class extends Nh{constructor(e,t){super(),this.branches=e,this.defaultValue=t,this.type=`conditionalSelect`}};function Yh(e){return e instanceof Gh||e instanceof Wh||e instanceof Bh||e instanceof Uh}function Xh(e){return Yh(e)||e instanceof Jh||e instanceof qh}function Zh(e,t){let n=[],r=new Set,i=0,a=e=>{e.type===`collectionRef`||e.type===`descriptorRef`?r.has(e.sourceId)||(r.add(e.sourceId),n.push(e),i>0&&t?.add(e.sourceId)):e.type===`queryRef`?s(e.query):e.type===`unionFrom`?e.sources.forEach(a):e.queries.forEach(s)},o=e=>{e instanceof qh?(i++,s(e.query),i--):e instanceof Jh?(e.branches.forEach(e=>o(e.value)),e.defaultValue!==void 0&&o(e.defaultValue)):typeof e==`object`&&e&&!Array.isArray(e)&&!Xh(e)&&!kh(e)&&Object.values(e).forEach(o)},s=e=>{a(e.from),e.join?.forEach(({from:e})=>a(e)),e.select&&Object.values(e.select).forEach(o)};return s(e),n}function Qh(e){return Zh(e).map(e=>e.type===`descriptorRef`?Ih(e):e)}function $h(e){return typeof e==`object`&&`expression`in e?e.expression:e}function eg(e){return typeof e==`object`&&`expression`in e?e.expression:e}function tg(e){return typeof e==`object`&&`expression`in e&&e.residual===!0}function ng(e){return{expression:e,residual:!0}}function rg(e){return e.type===`unionFrom`?e.sources:e.type===`unionAll`?[]:[e]}function ig(e,t,n){for(let r of rg(e.from))if(r.alias===t&&(n===void 0||r.bindingId===n))return r;for(let r of e.join||[])if(r.from.alias===t&&(n===void 0||r.from.bindingId===n))return r.from}function ag(e,t,n){let r=Vh(t);if(r!==void 0){let i=ig(e,r,t.bindingId);if(!i)return;let a=Hh(t);return i.type===`queryRef`?ag(i.query,new Bh(a),n):{collection:Ih(i),path:a,alias:r,sourceId:i.sourceId}}if(t.path.length!==0){if(t.path.length===1){let r=t.path[0];if(e.select){let t=e.select[r];if(t)return t.type===`ref`?ag(e,t,n):void 0}let i=rg(e.from)[0];return i?.type===`queryRef`?ag(i.query,new Bh([r]),n):i?.type===`collectionRef`?{collection:n,path:[r],alias:i.alias,sourceId:i.sourceId}:void 0}if(t.path.length>1){let[r,...i]=t.path,a=ig(e,r,t.bindingId);return a?a.type===`queryRef`?ag(a.query,new Bh(i),n):{collection:Ih(a),path:i,alias:r,sourceId:a.sourceId}:void 0}}}var og=new Set([`Temporal.Duration`,`Temporal.Instant`,`Temporal.PlainDate`,`Temporal.PlainDateTime`,`Temporal.PlainMonthDay`,`Temporal.PlainTime`,`Temporal.PlainYearMonth`,`Temporal.ZonedDateTime`]);function sg(e){let t=e[Symbol.toStringTag];return typeof t==`string`&&og.has(t)&&Object.getPrototypeOf(e)?.[Symbol.toStringTag]===t}var cg=3e4;function lg(e,t){if(t.length<=cg)e.push(...t);else for(let n=0;n<t.length;n+=cg){let r=t.slice(n,n+cg);e.push(...r)}}function ug(e,t,n){let r=0,i=e.length;for(;r<i;){let a=Math.floor((r+i)/2),o=n(e[a],t);if(o<0)r=a+1;else if(o>0)i=a;else return a}return r}function dg(e,t){let[n,r]=e,[i,a]=t;return{onlyInA:[...fg(n,Math.min(r,i)),...fg(Math.max(n,a),r)],onlyInB:[...fg(i,Math.min(a,n)),...fg(Math.max(i,r),a)]}}function fg(e,t){let n=[];for(let r=e;r<t;r++)n.push(r);return n}function pg(e,t){if(typeof e==typeof t){if(typeof e==`number`&&typeof t==`number`){let n=Number.isNaN(e),r=Number.isNaN(t);if(n||r)return n&&r?0:n?1:-1}return e<t?-1:+(e>t)}return typeof e==`string`?-1:1}function mg(e){return hg(e,new Set)?JSON.stringify(gg(e)):`~${JSON.stringify(_g(e,new Set))}`}function hg(e,t){if(e===null)return!0;switch(typeof e){case`boolean`:case`string`:return!0;case`number`:return Number.isFinite(e);case`undefined`:case`bigint`:case`symbol`:case`function`:return!1}return yg(e,t,()=>e instanceof Date||e instanceof RegExp||e instanceof Uint8Array||sg(e)||e instanceof Map||e instanceof Set?!1:Array.isArray(e)?e.every(e=>hg(e,t)):Object.keys(e).every(n=>hg(e[n],t)))}function gg(e){return e===null||typeof e==`boolean`||typeof e==`number`||typeof e==`string`?e:Array.isArray(e)?e.map(gg):Object.fromEntries(Object.keys(e).sort().map(t=>[t,gg(e[t])]))}function _g(e,t){if(e===void 0)return[`undefined`];if(e===null)return[`null`];switch(typeof e){case`boolean`:return[`boolean`,e];case`number`:return Number.isNaN(e)?[`number`,`NaN`]:e===1/0?[`number`,`Infinity`]:e===-1/0?[`number`,`-Infinity`]:[`number`,e===0?0:e];case`bigint`:return[`bigint`,e.toString()];case`string`:return[`string`,e];case`symbol`:case`function`:throw TypeError(`Cannot serialize ${typeof e} as a structural relation key`)}return yg(e,t,()=>{if(e instanceof Date){let t=e.getTime();return Number.isNaN(t)?[`date`,`Invalid`]:[`date`,t]}if(e instanceof RegExp)return[`regexp`,e.source,e.flags];if(e instanceof Uint8Array)return[`bytes`,Array.from(e)];if(sg(e))return[`temporal`,e[Symbol.toStringTag],e.toString()];if(Array.isArray(e))return[`array`,e.map(e=>_g(e,t))];if(e instanceof Map){let n=[...e.entries()].map(([e,n])=>[_g(e,t),_g(n,t)]);return n.sort((e,t)=>vg(JSON.stringify(e),JSON.stringify(t))),[`map`,n]}if(e instanceof Set){let n=[...e].map(e=>_g(e,t));return n.sort((e,t)=>vg(JSON.stringify(e),JSON.stringify(t))),[`set`,n]}return[`object`,Object.keys(e).sort().map(n=>[n,_g(e[n],t)])]})}function vg(e,t){return e<t?-1:+(e>t)}function yg(e,t,n){if(t.has(e))throw TypeError(`Cannot serialize a cyclic structural relation key`);t.add(e);try{return n()}finally{t.delete(e)}}var bg=Ag(),xg=Ag(),Sg=Ag(),Cg=Ag(),wg=Ag(),Tg=kg(),Eg=new Map,Dg=0;function Og(e){let t=Symbol.keyFor(e);if(t!==void 0){let e=Eg.get(t);return e===void 0&&(e=++Dg,Eg.set(t,e)),e}let n=Tg.get(e);return n===void 0&&(n=++Dg,Tg.set(e,n)),n}function kg(){let e=new WeakMap,t=Symbol();try{if(e.set(t,0),e.get(t)===0)return e}catch{}return new Map}function Ag(){return Math.random()*(2**31-1)>>>0}var jg=new DataView(new ArrayBuffer(8)),Mg=class{constructor(){this.hash=bg,this.length=0,this.carry=0,this.carryBytes=0}_mix(e){e=Math.imul(e,3432918353),e=e<<15|e>>>17,e=Math.imul(e,461845907),this.hash^=e,this.hash=this.hash<<13|this.hash>>>19,this.hash=Math.imul(this.hash,5)+3864292196}writeByte(e){this.carry|=(e&255)<<8*this.carryBytes,this.carryBytes++,this.length++,this.carryBytes===4&&(this._mix(this.carry>>>0),this.carry=0,this.carryBytes=0)}writeWord(e){if(this.length+=4,this.carryBytes===0){this._mix(e>>>0);return}let t=8*this.carryBytes;this._mix((this.carry|e<<t)>>>0),this.carry=e>>>32-t}update(e){switch(typeof e){case`symbol`:this.update(wg),this.update(Og(e));return;case`string`:this.update(xg);{let t=e.length-e.length%2;for(let n=0;n<t;n+=2)this.writeWord(e.charCodeAt(n)|e.charCodeAt(n+1)<<16);if(t<e.length){let n=e.charCodeAt(t);this.writeByte(n&255),this.writeByte(n>>>8&255)}}return;case`number`:jg.setFloat64(0,e,!0),this.writeWord(jg.getUint32(0,!0)),this.writeWord(jg.getUint32(4,!0));return;case`bigint`:{let t=e;for(t<0n?(t=-t,this.update(Cg)):this.update(Sg);t>0n;)this.writeByte(Number(t&255n)),t>>=8n;e===0n&&this.writeByte(0);return}default:throw TypeError(`Unsupported input type: ${typeof e}`)}}digest(){if(this.carryBytes>0){let e=this.carry>>>0;e=Math.imul(e,3432918353),e=e<<15|e>>>17,e=Math.imul(e,461845907),this.hash^=e}return this.hash^=this.length,this.hash^=this.hash>>>16,this.hash=Math.imul(this.hash,2246822507),this.hash^=this.hash>>>13,this.hash=Math.imul(this.hash,3266489909),this.hash^=this.hash>>>16,this.hash>>>0}},Ng=Ag(),Pg=Ag(),Fg=Ag(),Ig=Ag(),Lg=Ag(),Rg=Ag(),zg={hash:Ag()},Bg={hash:Ag()},Vg={hash:Ag()},Hg={hash:Ag()},Ug={hash:Ag()},Wg={hash:Ag()},Gg={hash:Ag()},Kg={hash:Ag()},qg=1e6,Jg=768,Yg=128,Xg=new WeakMap,Zg=new WeakSet;function Qg(e){c_(e)}function $g(e){let t=new Mg;return n_(t,e),t.digest()}function e_(e,t){if(t.activeObjects.size>=Jg)throw RangeError(`Value is too complex to hash safely: structural depth`);t.activeObjects.add(e);let n;try{let[r,i,a]=t_(e),o=new Mg;o.update(r.hash);for(let e of i)a?n_(o,e,t):o.update(e);if(a){let e=Object.keys(a);(!Array.isArray(a)||e.length!==a.length||e.length!==0&&e[e.length-1]!==String(a.length-1))&&e.sort(),e.push(...Object.getOwnPropertySymbols(a).filter(e=>Object.prototype.propertyIsEnumerable.call(a,e)).sort((e,t)=>Og(e)-Og(t)));for(let n of e)o.update(Lg),o.update(n),n_(o,a[n],t)}n=o.digest()}finally{t.activeObjects.delete(e)}return t.pendingHashes.set(e,n),n}function t_(e){if(e instanceof Date){let t=e.getTime();return[zg,[Number.isNaN(t)?`invalid`:t]]}return a_(e)?[Gg,[String.fromCharCode.apply(null,e)]]:sg(e)?[Kg,[e[Symbol.toStringTag],e.toString()]]:e instanceof RegExp?[Bg,[e.source,e.flags,e.lastIndex],e]:e instanceof Map?[Ug,[],[...e.entries()]]:e instanceof Set?[Wg,[],[...e.values()]]:e instanceof Array?[Hg,[e.length],e]:[Vg,[],e]}function n_(e,t,n){if(n&&++n.work>qg)throw RangeError(`Value is too complex to hash safely: structural work`);if(t===null)e.update(Fg);else switch(typeof t){case`undefined`:e.update(Ig);return;case`boolean`:e.update(t?Ng:Pg);return;case`number`:e.update(isNaN(t)?NaN:t===0?0:t);return;case`bigint`:case`string`:case`symbol`:e.update(t);return;case`object`:e.update(r_(t,n));return;case`function`:e.update(c_(t))}}function r_(e,t){let n=Xg.get(e)??t?.pendingHashes.get(e);if(n!==void 0)return n;if(i_(e))return c_(e);if(t){if(t.activeObjects.has(e))throw TypeError(`Cannot hash cyclic structural values`);return e_(e,t)}let r={activeObjects:new Set,work:0,pendingHashes:new Map},i=e_(e,r);for(let[e,t]of r.pendingHashes)Xg.set(e,t);return i}function i_(e){return Zg.has(e)||typeof File<`u`&&e instanceof File||a_(e)&&e.byteLength>Yg}function a_(e){return typeof Buffer<`u`&&e instanceof Buffer||e instanceof Uint8Array}function o_(e,t){let n=new Map,r=e=>Reflect.ownKeys(e).filter(t=>Object.prototype.propertyIsEnumerable.call(e,t));function i(e,t){if(e===t||Number.isNaN(e)&&Number.isNaN(t))return!0;if(e===null||t===null||typeof e!=`object`||typeof t!=`object`||i_(e)||i_(t)||Array.isArray(e)&&Array.isArray(t)&&e.length!==t.length)return!1;let a=n.get(e);if(a?.has(t))return!0;let[o,s,c]=t_(e),[l,u,d]=t_(t);if(o!==l||!s.every((e,t)=>e===u[t]))return!1;if(!c||!d)return!0;a?a.add(t):n.set(e,new Set([t]));let f=r(c);return f.length===r(d).length&&f.every(e=>Object.prototype.propertyIsEnumerable.call(d,e)&&i(c[e],d[e]))}return i(e,t)}var s_=1;function c_(e){let t=Xg.get(e);return t===void 0&&(t=s_^Rg,s_++,Xg.set(e,t),Zg.add(e)),t}var l_=class e{#e;constructor(e=[]){this.#e=e}toString(e=!1){return`MultiSet(${JSON.stringify(this.#e,null,e?2:void 0)})`}toJSON(){return JSON.stringify(Array.from(this.getInner()))}static fromJSON(t){return new e(JSON.parse(t))}map(t){return new e(this.#e.map(([e,n])=>[t(e),n]))}filter(t){return new e(this.#e.filter(([e,n])=>t(e)))}negate(){return new e(this.#e.map(([e,t])=>[e,-t]))}concat(t){let n=[];return lg(n,this.#e),lg(n,t.getInner()),new e(n)}consolidate(){let e=this.#e;if(e.every(([e])=>Array.isArray(e)&&e.length===2&&(typeof e[0]==`string`||typeof e[0]==`number`)))return u_(e);let t;return e.some(([e])=>{let n=typeof e;return n!==`string`&&n!==`number`||(t??=n,n!==t)})?d_(e,$g):d_(e,e=>e,!0)}extend(t){let n=t instanceof e?t.getInner():t;lg(this.#e,n)}add(e,t){t!==0&&this.#e.push([e,t])}getInner(){return this.#e}};function u_(e){let t=new Map,n=new Map,r=[];for(let[i,a]of e){let[e,o]=i,s;if(Array.isArray(o)&&o.length===2){let t=n.get(e);t||n.set(e,t=new Map);let a=t.get(o[0]);a||t.set(o[0],a=new Map),s=a.get(o[1]),s||(a.set(o[1],s=[i,0]),r.push(s))}else{let n=t.get(e);n||t.set(e,n=new Map),s=n.get(o),s||(n.set(o,s=[i,0]),r.push(s))}s[1]+=a}return new l_(r.filter(([,e])=>e!==0))}function d_(e,t,n=!1){let r=new Map;for(let[n,i]of e){let e=t(n),a=r.get(e);a?a[1]+=i:r.set(e,[n,i])}let i=[];for(let[e,[t,a]]of r)a!==0&&i.push([n?e:t,a]);return new l_(i)}var f_=class{#e;constructor(e){this.#e=e}drain(){let e=[...this.#e].reverse();return this.#e.length=0,e}isEmpty(){return this.#e.length===0}},p_=class{#e=[];sendData(e){e instanceof l_||(e=new l_(e));for(let t of this.#e)t.unshift(e)}newReader(){let e=[];return this.#e.push(e),new f_(e)}},m_=class{constructor(e,t,n){this.id=e,this.inputs=t,this.output=n}hasPendingWork(){return this.inputs.some(e=>!e.isEmpty())}},h_=class extends m_{constructor(e,t,n){super(e,[t],n),this.id=e}inputMessages(){return this.inputs[0].drain()}},g_=class extends m_{constructor(e,t,n,r){super(e,[t,n],r),this.id=e}inputAMessages(){return this.inputs[0].drain()}inputBMessages(){return this.inputs[1].drain()}},__=class extends h_{run(){for(let e of this.inputMessages())this.output.sendData(this.inner(e))}},v_=class{#e=[];#t=0;#n=!1;constructor(){}#r(){if(this.#n)throw Error(`Graph already finalized`)}getNextOperatorId(){return this.#r(),this.#t++}newInput(){this.#r();let e=new p_;return new b_(this,e)}addOperator(e){this.#r(),this.#e.push(e)}finalize(){this.#r(),this.#n=!0}step(){if(!this.#n)throw Error(`Graph not finalized`);for(let e of this.#e)e.run()}pendingWork(){return this.#e.some(e=>e.hasPendingWork())}run(){if(!this.#n)throw Error(`Graph not finalized`);let e=!0;for(;e;){e=!1;for(let t of this.#e)t.hasPendingWork()&&(t.run(),e=!0)}}},y_=class{#e;#t;constructor(e,t){this.#e=e,this.#t=t}connectReader(){return this.#t.newReader()}get writer(){return this.#t}get graph(){return this.#e}pipe(...e){return e.reduce((e,t)=>t(e),this)}},b_=class extends y_{sendData(e){this.writer.sendData(e)}},x_=class extends h_{run(){let e=this.inputMessages();if(e.length===0)return;let t=new l_;for(let n of e)t.extend(n);let n=t.consolidate();n.getInner().length>0&&this.output.sendData(n)}};function S_(){return e=>{let t=new y_(e.graph,new p_),n=new x_(e.graph.getNextOperatorId(),e.connectReader(),t.writer);return e.graph.addOperator(n),t}}var C_=`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`,w_=new Map;function T_(e){let t=w_.get(e);if(t===void 0){t=new Uint8Array(256);for(let n=0;n<e.length;n++)t[e.charCodeAt(n)]=n;w_.set(e,t)}return t}function E_(e,t,n,r){let i=n[0];if(t!=null&&e>=t)throw Error(e+` >= `+t);if(e.slice(-1)===i||t&&t.slice(-1)===i)throw Error(`trailing zero`);if(t){let a=0;for(;(e[a]||i)===t[a];)a++;if(a>0)return t.slice(0,a)+E_(e.slice(a),t.slice(a),n,r)}let a=e?r[e.charCodeAt(0)]:0,o=t==null?n.length:r[t.charCodeAt(0)];return o-a>1?n[Math.round(.5*(a+o))]:t&&t.length>1?t.slice(0,1):n[a]+E_(e.slice(1),null,n,r)}function D_(e,t){if(e.length!==O_(e[0],t))throw Error(`invalid integer part of order key: `+e)}function O_(e,t){if(t===void 0){let t=e.charCodeAt(0);if(t>=97&&t<=122)return t-97+2;if(t>=65&&t<=90)return 90-t+2}else{let n=t.indexOf(e);if(n!==-1){let e=t.length/2;return n<e?e-n+1:n-e+2}}throw Error(`invalid order key head: `+e)}function k_(e,t){let n=O_(e[0],t);if(n>e.length)throw Error(`invalid order key: `+e);return e.slice(0,n)}function A_(e,t,n){if(P_(e,t,n))throw Error(`invalid order key: `+e);let r=k_(e,n);if(e.slice(r.length).slice(-1)===t[0])throw Error(`invalid order key: `+e)}function j_(e,t,n,r){D_(e,r);let i=e[0],a=t[0],o=``;for(let r=e.length-1;r>=1;r--){let s=n[e.charCodeAt(r)]+1;if(s===t.length)o=a+o;else return i+e.slice(1,r)+t[s]+o}if(r===void 0){if(i===`Z`)return`a`+a;if(i===`z`)return null;let e=String.fromCharCode(i.charCodeAt(0)+1);return e+(e>`a`?o+a:o.slice(1))}let s=r.indexOf(i);if(s===r.length-1)return null;let c=r[s+1],l=O_(c,r)-O_(i,r);return c+(l>0?o+a:l<0?o.slice(1):o)}function M_(e,t,n,r){D_(e,r);let i=e[0],a=t[t.length-1],o=``;for(let r=e.length-1;r>=1;r--){let s=n[e.charCodeAt(r)]-1;if(s===-1)o=a+o;else return i+e.slice(1,r)+t[s]+o}if(r===void 0){if(i===`a`)return`Z`+a;if(i===`A`)return null;let e=String.fromCharCode(i.charCodeAt(0)-1);return e+(e<`Z`?o+a:o.slice(1))}let s=r.indexOf(i);if(s===0)return null;let c=r[s-1],l=O_(c,r)-O_(i,r);return c+(l>0?o+a:l<0?o.slice(1):o)}var N_=new Map;function P_(e,t,n=``){let r=N_.get(n);r===void 0&&(r=new Map,N_.set(n,r));let i=t.charCodeAt(0),a=r.get(i);return a===void 0&&(a=n===``?`A`+t[0].repeat(26):n[0]+t[0].repeat(n.length/2),r.set(i,a)),e===a}function F_(e){for(let t=1;t<e.length;t++)if(e.charCodeAt(t-1)>=e.charCodeAt(t))return!1;return!0}function I_(e){for(let t=0;t<e.length;t++)if(e.charCodeAt(t)>255)return!1;return!0}var L_=new Set;function R_(e){if(!L_.has(e)){if(e.length<2||!F_(e))throw Error(`digits must be at least 2 characters in strictly ascending character code order: `+e);if(!I_(e))throw Error(`digits must be single-byte (char code 0-255): `+e);L_.add(e)}}var z_=new Set;function B_(e){if(!z_.has(e)){if(e.length<2||e.length%2!=0||!F_(e))throw Error(`intDigits must be an even number of at least 2 characters in strictly ascending character code order: `+e);if(!I_(e))throw Error(`intDigits must be single-byte (char code 0-255): `+e);z_.add(e)}}function V_(e,t,n=C_,r=void 0){R_(n),r!==void 0&&B_(r);let i=T_(n);if(e!=null&&A_(e,n,r),t!=null&&A_(t,n,r),e!=null&&t!=null&&e>t){let n=e;e=t,t=n}if(e==null){if(t==null)return(r===void 0?`a`:r[r.length/2])+n[0];let e=k_(t,r),a=t.slice(e.length);if(P_(e,n,r))return e+E_(``,a,n,i);if(e<t)return e;let o=M_(e,n,i,r);if(o==null)throw Error(`cannot decrement any more`);return o}if(t==null){let t=k_(e,r),a=e.slice(t.length);return j_(t,n,i,r)??t+E_(a,null,n,i)}let a=k_(e,r),o=e.slice(a.length),s=k_(t,r),c=t.slice(s.length);if(a===s)return a+E_(o,c,n,i);let l=j_(a,n,i,r);if(l==null)throw Error(`cannot increment any more`);return l<t?l:a+E_(o,null,n,i)}function H_(e,t){return[e,t]}function U_(e){return e[0]}function W_(e){return e[1]}function G_(e){return([t,n],[r,i])=>{let a=e(n,i);return a===0?pg(t,r):a}}var K_=class{#e=[];#t;#n;#r;constructor(e,t,n){this.#n=e,this.#r=e+t,this.#t=n}get size(){let e=this.#n,t=this.#r-this.#n,n=this.#e.length-e;return Math.max(0,Math.min(t,n))}countLeadingInWindow(e){let t=0,n=this.#n+this.size;for(let r=this.#n;r<n&&e(U_(this.#e[r]));r++)t++;return t}move({offset:e,limit:t}){let n=this.#n,r=this.#r-this.#n,i=[this.#n,this.#r===1/0?this.#n+this.size:this.#r];this.#n=e??n,this.#r=this.#n+(t??r);let{onlyInA:a,onlyInB:o}=dg(i,[this.#n,this.#r===1/0?Math.max(this.#n+this.size,i[1]):this.#r]),s=[];o.forEach(e=>{let t=this.#e[e];t&&s.push(t)});let c=[];return a.forEach(e=>{let t=this.#e[e];t&&c.push(t)}),{moveIns:s,moveOuts:c,changes:a.length+o.length>0}}insert(e){let t={moveIn:null,moveOut:null},n=this.#i(e),r=H_(e,V_(n===0?null:W_(this.#e[n-1]),n===this.#e.length?null:W_(this.#e[n])));if(this.#e.splice(n,0,r),this.#n===this.#r)return t;if(n<this.#r){let e=Math.max(n,this.#n);e<this.#e.length&&(t.moveIn=this.#e[e],this.#r<this.#e.length&&(t.moveOut=this.#e[this.#r]))}return t}delete(e){let t={moveIn:null,moveOut:null},n=this.#i(e),[r]=this.#e.splice(n,1);if(this.#n===this.#r)return t;if(n<this.#r){if(t.moveOut=r,n<this.#n){let e=this.#n-1;t.moveOut=e<this.#e.length?this.#e[e]:null}let e=this.#r-1;e<this.#e.length&&(t.moveIn=this.#e[e])}return t}#i(e){return ug(this.#e,H_(e,``),(e,t)=>this.#t(U_(e),U_(t)))}};function*q_(e){let t=new Map;for(let n of e)for(let[e,r]of n.getInner()){let n=t.get(e[0]);n?n.push([e,r]):t.set(e[0],[[e,r]])}let n=[];for(let e of t.values()){if(e.length===1){n.push(e[0]);continue}let t=[];for(let[n,r]of e){let e=t.find(([e])=>o_(e[1],n[1]));e?e[1]+=r:t.push([n,r])}n.push(...t)}for(let e of n)e[1]<0&&(yield e);for(let e of n)e[1]>0&&(yield e)}var J_=class{#e=new Map;#t;constructor(e){this.#t=e}get size(){return this.#t.size}countLeadingInWindow(e){return this.#t.countLeadingInWindow?.(([,t])=>e(t))??this.#t.size}get isEmpty(){return this.#e.size===0&&this.#t.size===0}processElement(e,t,n){let{oldMultiplicity:r,newMultiplicity:i}=this.#n(e,n);return r<=0&&i>0?this.#t.insert([e,t]):r>0&&i<=0?this.#t.delete([e,t]):{moveIn:null,moveOut:null}}move(e){if(!(this.#t instanceof K_))throw Error(`Cannot move B+-tree implementation of TopK with fractional index`);return this.#t.move(e)}#n(e,t){if(t===0){let t=this.#e.get(e)??0;return{oldMultiplicity:t,newMultiplicity:t}}let n=this.#e.get(e)??0,r=n+t;return r===0?this.#e.delete(e):this.#e.set(e,r),{oldMultiplicity:n,newMultiplicity:r}}};function Y_(e,t){if(e){let[[n,r],i]=e;t.push([[n,[r,i]],1])}}function X_(e,t){if(e){let[[n,r],i]=e;t.push([[n,[r,i]],-1])}}var Z_=class extends h_{#e=new Map;#t;#n;#r;#i;constructor(e,t,n,r,i){super(e,t,n),this.#t=i.groupKeyFn,this.#i=i.limit??1/0,this.#r=i.offset??0,this.#n=G_(r),i.setSizeCallback?.(()=>this.#a()),i.setWindowFn?.(this.#c.bind(this))}#a(){let e=0;for(let t of this.#e.values())e+=t.size;return e}#o(e){let t=this.#e.get(e);return t||(t=new J_(new K_(this.#r,this.#i,this.#n)),this.#e.set(e,t)),t}#s(e,t){t.isEmpty&&this.#e.delete(e)}#c({offset:e,limit:t}){e!==void 0&&(this.#r=e),t!==void 0&&(this.#i=t);let n=[],r=!1;for(let e of this.#e.values()){let t=e.move({offset:this.#r,limit:this.#i});t.moveIns.forEach(e=>Y_(e,n)),t.moveOuts.forEach(e=>X_(e,n)),t.changes&&(r=!0)}r&&this.output.sendData(new l_(n))}run(){let e=[];for(let[[t,n],r]of q_(this.inputMessages()))this.#l(t,n,r,e);e.length>0&&this.output.sendData(new l_(e))}#l(e,t,n,r){let i=this.#t(e,t),a=this.#o(i),o=a.processElement(e,t,n);Y_(o.moveIn,r),X_(o.moveOut,r),this.#s(i,a)}};function Q_(e,t){return n=>{let r=new y_(n.graph,new p_),i=new Z_(n.graph.getNextOperatorId(),n.connectReader(),r.writer,e,t);return n.graph.addOperator(i),r}}var $_=class extends h_{#e;constructor(e,t,n,r,i){super(e,t,n);let a=i.limit??1/0,o=i.offset??0;this.#e=new J_(new K_(o,a,G_(r))),i.setSizeCallback?.(e=>e?this.#e.countLeadingInWindow(e):this.#e.size),i.setWindowFn?.(this.moveTopK.bind(this))}moveTopK({offset:e,limit:t}){let n=[],r=this.#e.move({offset:e,limit:t});r.moveIns.forEach(e=>Y_(e,n)),r.moveOuts.forEach(e=>X_(e,n)),r.changes&&this.output.sendData(new l_(n))}run(){let e=[];for(let[[t,n],r]of q_(this.inputMessages()))this.processElement(t,n,r,e);e.length>0&&this.output.sendData(new l_(e))}processElement(e,t,n,r){let i=this.#e.processElement(e,t,n);Y_(i.moveIn,r),X_(i.moveOut,r)}};function ev(e,t){let n=t||{};return t=>{let r=new y_(t.graph,new p_),i=new $_(t.graph.getNextOperatorId(),t.connectReader(),r.writer,e,n);return t.graph.addOperator(i),r}}function tv(e,t){let n=t.limit??1/0,r=t.offset??0,i=t.setSizeCallback,a=t.setWindowFn,o=t.groupKeyFn,s=t.comparator??((e,t)=>e===t?0:e<t?-1:1);return t=>t.pipe(Q_((t,n)=>s(e(t),e(n)),{limit:n,offset:r,setSizeCallback:i,setWindowFn:a,groupKeyFn:o}),S_())}function nv(e,t){let n=t?.limit??1/0,r=t?.offset??0,i=t?.setSizeCallback,a=t?.setWindowFn,o=t?.comparator??((e,t)=>e===t?0:e<t?-1:1);return t=>t.pipe(ev((t,n)=>o(e(t),e(n)),{limit:n,offset:r,setSizeCallback:i,setWindowFn:a}),S_())}function rv(){let e=typeof globalThis<`u`?globalThis.crypto:void 0;if(e&&typeof e.randomUUID==`function`)return e.randomUUID();if(e&&typeof e.getRandomValues==`function`){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let n=[];for(let e=0;e<16;e++)n.push(t[e].toString(16).padStart(2,`0`));return n.slice(0,4).join(``)+`-`+n.slice(4,6).join(``)+`-`+n.slice(6,8).join(``)+`-`+n.slice(8,10).join(``)+`-`+n.slice(10,16).join(``)}throw Error(X(171))}var iv=Symbol.for(`@tanstack/db.collectionOptions`);function av(e){return typeof e==`object`&&!!e&&e[iv]===!0}var ov=Symbol.for(`@tanstack/db.collectionOptions.claim`);function sv(e){return av(e)}var cv=class extends Error{constructor(e){super(e),this.name=`TanStackDBError`}},lv=class extends cv{constructor(e,t,n){let r=`${e===`insert`?`Insert`:`Update`} validation failed: ${t.map(e=>`
- ${e.message} - path: ${e.path}`).join(``)}`;super(n||r),this.name=`SchemaValidationError`,this.type=e,this.issues=t}},uv=class extends cv{constructor(e){super(e),this.name=`CollectionConfigurationError`}},dv=class extends uv{constructor(e){super(X(3,{reason:e})),this.name=`InvalidSyncPersistenceCapabilityError`}},fv=class extends uv{constructor(){super(X(4))}},pv=class extends uv{constructor(){super(X(5))}},mv=class extends uv{constructor(){super(X(6))}},hv=class extends uv{constructor(){super(X(7))}},gv=class extends cv{constructor(e){super(e),this.name=`CollectionStateError`}},_v=class extends gv{constructor(e,t){super(X(8,{operation:e,collectionId:t}))}},vv=class extends gv{constructor(e,t){super(X(254,{collectionId:e,dependents:t}))}},yv=class extends gv{constructor(e){super(X(255,{collectionId:e}))}},bv=class extends gv{constructor(e){super(X(256,{collectionId:e}))}},xv=class extends gv{constructor(e,t,n){super(X(9,{from:e,to:t,collectionId:n}))}},Sv=class extends gv{constructor(){super(X(10))}},Cv=class extends gv{constructor(){super(X(11))}},wv=class extends cv{constructor(e){super(e),this.name=`CollectionOperationError`}},Tv=class extends wv{constructor(e){super(X(14,{item:e}))}},Ev=class extends wv{constructor(e,t){super(X(15,{key:e,type:e===null?`null`:typeof e}))}},Dv=class extends wv{constructor(e){super(X(16,{key:e}))}},Ov=class extends wv{constructor(e,t,n){super(X(17,{key:e,collectionId:t,...n}))}},kv=class extends wv{constructor(){super(X(18))}},Av=class extends wv{constructor(){super(X(19))}},jv=class extends wv{constructor(e){super(X(20,{key:e}))}},Mv=class extends wv{constructor(e,t){super(X(21,{originalKey:e,newKey:t}))}},Nv=class extends wv{constructor(){super(X(22))}},Pv=class extends wv{constructor(e){super(X(23,{key:e}))}},Fv=class extends cv{constructor(e){super(e),this.name=`MissingHandlerError`}},Iv=class extends Fv{constructor(){super(X(24))}},Lv=class extends Fv{constructor(){super(X(25))}},Rv=class extends Fv{constructor(){super(X(26))}},zv=class extends cv{constructor(e){super(e),this.name=`TransactionError`}},Bv=class extends zv{constructor(){super(X(31))}},Vv=class extends zv{constructor(){super(X(33))}},Hv=class extends zv{constructor(){super(X(34))}},Uv=class extends zv{constructor(e){super(X(233,{id:e}))}},Wv=class extends zv{constructor(){super(X(35))}},Gv=class extends zv{constructor(){super(X(36))}},Kv=class extends zv{constructor(){super(X(37))}},qv=class extends zv{constructor(e){super(X(38,{key:e}))}},Jv=class extends zv{constructor(){super(X(39))}},Yv=class extends zv{constructor(){super(X(40))}},Xv=class extends zv{constructor(e){super(X(41,{detail:e}))}},Zv=class extends cv{constructor(e){super(e),this.name=`QueryBuilderError`}},Qv=class extends Zv{constructor(e){super(X(42,{context:e}))}},$v=class extends Zv{constructor(e){super(X(43,{context:e}))}},ey=class extends Zv{constructor(e){super(X(44,{alias:e}))}},ty=class extends Zv{constructor(e){super(X(248,{field:e}))}},ny=class extends Zv{constructor(e,t){super(X(45,{context:e,type:t}))}},ry=class extends Zv{constructor(){super(X(46))}},iy=class extends Zv{constructor(){super(X(47))}},ay=class extends Zv{constructor(e){super(X(48,{valueType:e}))}},oy=class extends cv{constructor(e){super(e),this.name=`QueryCompilationError`}},sy=class extends oy{constructor(e){super(X(49,{segment:e})),this.name=`UnsafeAliasPathError`}},cy=class extends oy{constructor(){super(X(50))}},ly=class extends oy{constructor(){super(X(51))}},uy=class extends oy{constructor(){super(X(247))}},dy=class extends oy{constructor(e){super(X(52,{valueDescription:e}))}},fy=class extends oy{constructor(){super(X(53))}},py=class extends oy{constructor(){super(X(54))}},my=class extends oy{constructor(){super(X(55))}},hy=class extends oy{constructor(e,t,n){super(X(56,{alias:e,collectionId:t,availableKeys:n}))}},gy=class extends oy{constructor(e){super(X(58,{type:e}))}},_y=class extends oy{constructor(e){super(X(59,{type:e}))}},vy=class extends oy{constructor(){super(X(60))}},yy=class extends oy{constructor(e){super(X(61,{functionName:e}))}},by=class extends oy{constructor(e){super(X(62,{collectionId:e}))}},xy=class extends cv{constructor(e){super(e),this.name=`JoinError`}},Sy=class extends xy{constructor(e){super(X(63,{joinType:e}))}},Cy=class extends xy{constructor(e){super(X(64,{sourceAlias:e}))}},wy=class extends xy{constructor(){super(X(65))}},Ty=class extends xy{constructor(e){super(X(66,{sourceAlias:e}))}},Ey=class extends xy{constructor(e){super(X(67,{sourceAlias:e}))}},Dy=class extends xy{constructor(){super(X(68))}},Oy=class extends xy{constructor(e){super(X(69,{type:e}))}},ky=class extends cv{constructor(e){super(e),this.name=`GroupByError`}},Ay=class extends ky{constructor(e){super(X(70,{alias:e}))}},jy=class extends cv{constructor(e,t){super(X(78,{collectionId:e,error:t})),this.name=`SyncCleanupError`}},My=class extends Error{constructor(){super(X(79)),this.name=`AbortError`}},Ny=class extends Error{constructor(){super(X(80)),this.name=`AbortError`}},Py=class extends Error{constructor(){super(X(81)),this.name=`AbortError`}},Fy=class extends cv{constructor(e){super(e),this.name=`QueryOptimizerError`}},Iy=class extends Fy{constructor(){super(X(82))}},Ly=class extends oy{constructor(e){super(X(83,{missingAliases:e}))}},Ry=class extends oy{constructor(){super(X(84))}},zy=class extends oy{constructor(){super(X(244))}},By=class extends cv{constructor(){super(X(85)),this.name=`SetWindowReentrancyError`}},Vy=class extends Error{constructor(e,t){super(X(87,{path:e,reason:t})),this.path=e,this.reason=t,this.name=`UnhashableQueryIRError`}},Hy=Symbol(`liveQueryInternal`),Uy=new WeakMap;function Wy(e){return e.utils?.[Hy]?.getBuilder?.()}function Gy(e,t){Uy.set(e,t)}function Ky(e){return Uy.get(e)}var qy=[`years`,`months`,`weeks`,`days`,`hours`,`minutes`,`seconds`,`milliseconds`,`microseconds`,`nanoseconds`];function Jy(e,t){return Zy(e,t,void 0)}function Yy(e){return e===null||Object.getPrototypeOf(e)===null}function Xy(e){let t=Object.keys(e);for(let n of Object.getOwnPropertySymbols(e))Object.prototype.propertyIsEnumerable.call(e,n)&&t.push(n);return t}function Zy(e,t,n,r=!1,i=!1){if(e===t||Object.is(e,t))return!0;if(e==null||t==null||typeof e!=typeof t||i&&typeof e==`object`&&Object.getPrototypeOf(e)!==Object.getPrototypeOf(t))return!1;if(e instanceof Date)return t instanceof Date&&Object.is(e.getTime(),t.getTime());if(t instanceof Date)return!1;if(e instanceof RegExp)return t instanceof RegExp&&e.source===t.source&&e.flags===t.flags&&(!r||e.lastIndex===t.lastIndex);if(t instanceof RegExp)return!1;if(e instanceof Map){if(!(t instanceof Map)||e.size!==t.size)return!1;if(n?.has(e))return n.get(e)===t;n??=new Map,n.set(e,t);let a=r&&Array.from(t.entries()),o=Array.from(e.entries()).every(([e,o],s)=>a?Object.is(e,a[s][0])&&Zy(o,a[s][1],n,!0,i):t.has(e)&&Zy(o,t.get(e),n,r,i));return n.delete(e),o}if(t instanceof Map)return!1;if(e instanceof Set){if(!(t instanceof Set)||e.size!==t.size)return!1;if(n?.has(e))return n.get(e)===t;n??=new Map,n.set(e,t);let a=Array.from(e),o=Array.from(t);if(r){let t=a.every((e,t)=>Zy(e,o[t],n,r,i));return n.delete(e),t}if(a.every(e=>typeof e!=`object`))return n.delete(e),a.every(e=>t.has(e));let s=(e,t,n)=>{if(e===a.length)return!0;let c=a[e];for(let[a,l]of t.entries()){let u=new Map(n);if(Zy(c,o[l],u,r,i)&&s(e+1,t.filter((e,t)=>t!==a),u))return!0}return!1},c=s(0,o.map((e,t)=>t),n);return n.delete(e),c}if(t instanceof Set)return!1;if(ArrayBuffer.isView(e)&&ArrayBuffer.isView(t)&&!(e instanceof DataView)&&!(t instanceof DataView)){let n=e,i=t;if(r&&Object.getPrototypeOf(e)!==Object.getPrototypeOf(t)||n.length!==i.length)return!1;for(let e=0;e<n.length;e++){let t=n[e],r=i[e];if(t!==r&&(t===t||r===r))return!1}return!0}if(ArrayBuffer.isView(t)&&!(t instanceof DataView)&&!ArrayBuffer.isView(e))return!1;if($y(e)&&$y(t)){let n=e[Symbol.toStringTag];if(n!==t[Symbol.toStringTag])return!1;if(n===`Temporal.Duration`){let n=e,r=t;return qy.every(e=>n[e]===r[e])}return typeof e.equals==`function`?e.equals(t):e.toString()===t.toString()}if($y(t)||Array.isArray(e)!==Array.isArray(t)||Array.isArray(e)&&e.length!==t.length)return!1;if(Array.isArray(e)&&!r){if(n?.has(e))return n.get(e)===t;n??=new Map,n.set(e,t);let a=e.every((e,a)=>Zy(e,t[a],n,r,i));return n.delete(e),a}if(typeof e==`object`){let a=Object.getPrototypeOf(e),o=Object.getPrototypeOf(t),s=Yy(a),c=Yy(o);if(a!==o&&!s&&!c)return!1;if(n?.has(e))return n.get(e)===t;let l=Xy(e),u=Xy(t);if(l.length!==u.length)return!1;if(l.length===0&&!Array.isArray(e)&&!(s&&c))return e instanceof URL&&e.href===t.href;let d=!1,f=!0;for(let a of l){let o=e[a];if(!d&&typeof o==`object`&&o&&(n??=new Map,n.set(e,t),d=!0),!Object.prototype.propertyIsEnumerable.call(t,a)||!Zy(o,t[a],n,r,i)){f=!1;break}}return d&&n.delete(e),f}return!1}var Qy=new Set([`Temporal.Duration`,`Temporal.Instant`,`Temporal.PlainDate`,`Temporal.PlainDateTime`,`Temporal.PlainMonthDay`,`Temporal.PlainTime`,`Temporal.PlainYearMonth`,`Temporal.ZonedDateTime`]);function $y(e){if(typeof e!=`object`||!e)return!1;let t=e[Symbol.toStringTag];return typeof t==`string`&&Qy.has(t)}var eb={direction:`asc`,nulls:`first`,stringSort:`locale`};function tb(e,t){if(typeof e!=`string`&&typeof e!=`number`)throw e===void 0?new Tv(t):new Ev(e,t)}function nb(){let e=new WeakMap,t,n,r,i=0,a=(e,t)=>{let n=e.get(t);return n===void 0&&(n=++i,e.set(t,n)),n};return i=>{r??=sb();let o;if(typeof i==`symbol`){let e=Symbol.keyFor(i);e===void 0?(t??=rb(),o=a(t,i)):(n??=new Map,o=a(n,e))}else o=a(e,i);return[`runtimeReference`,r,o]}}function rb(){let e=new WeakMap,t=Symbol();try{if(e.set(t,0),e.get(t)===0)return e}catch{}return new Map}var ib;function ab(e){return ib??=nb(),ib(e)}function ob(e){return e?.stringSort===`custom`?{...e,compare:ab(e.compare)}:e}function sb(){let e=new Uint32Array(4),t=Reflect.get(globalThis,`crypto`);return typeof t?.getRandomValues==`function`?(t.getRandomValues(e),Array.from(e,e=>e.toString(36)).join(`-`)):`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`}function Z(e){return typeof e==`number`&&Number.isNaN(e)||e instanceof Date&&Number.isNaN(e.getTime())}var cb=(e,t,n)=>{let{nulls:r}=n;if(e==null&&t==null)return 0;if(e==null)return r===`first`?-1:1;if(t==null)return r===`first`?1:-1;let i=Z(e),a=Z(t);if(i&&a)return 0;if(i)return 1;if(a)return-1;if(typeof e==`string`&&typeof t==`string`){if(n.stringSort===`custom`)return n.compare(e,t);if(n.stringSort===`locale`)return e.localeCompare(t,n.locale,n.localeOptions)}if(Array.isArray(e)&&Array.isArray(t)){for(let r=0;r<Math.min(e.length,t.length);r++){let i=cb(e[r],t[r],n);if(i!==0)return i}return e.length-t.length}if(e instanceof Date&&t instanceof Date)return e.getTime()-t.getTime();if($y(e)&&$y(t))return bb(e,t);let o=typeof e==`symbol`,s=typeof t==`symbol`;if(o&&s)return e===t?0:ab(e)[2]-ab(t)[2];if(o)return 1;if(s)return-1;let c=typeof e==`object`,l=typeof t==`object`;if(c||l){if(c&&l)return ab(e)[2]-ab(t)[2];if(c)return 1;if(l)return-1}return e<t?-1:+(e>t)},lb=(e,t,n)=>e==null||t==null?cb(e,t,n):cb(t,e,n);function ub(e){if(pb(e))return`Binary`;if($y(e)){let t=e[Symbol.toStringTag],n=e;return t===`Temporal.Duration`&&(n.years||n.months||n.weeks)?`Temporal.Duration.calendar`:t}return Array.isArray(e)?`Array`:`Object`}function db(e,t=`values`){let n=e.direction===`asc`?cb:lb;if(t!==`index`)return(t,r)=>n(t,r,e);let r=e.direction===`asc`?1:-1;return(t,i)=>{if(t!=null&&i!=null){t instanceof Date&&(t=t.getTime()),i instanceof Date&&(i=i.getTime());let e=typeof t,n=typeof i;if(e!==n)return(e<n?-1:1)*r;if(e===`object`){let e=ub(t),n=ub(i);if(e!==n)return(e<n?-1:1)*r;if(e===`Binary`||e===`Temporal.Duration.calendar`||e===`Temporal.PlainMonthDay`){let e=yb(t),n=yb(i);return(e<n?-1:+(e>n))*r}}}return n(t,i,e)}}var fb=db({direction:`asc`,nulls:`first`,stringSort:`locale`});function pb(e){return e instanceof Uint8Array||typeof Buffer<`u`&&e instanceof Buffer}function mb(e,t){if(e.byteLength!==t.byteLength)return!1;for(let n=0;n<e.byteLength;n++)if(e[n]!==t[n])return!1;return!0}var hb=`\0tanstack-db:`;function gb(e,t){return`${hb}${e}:${t}`}var _b=new WeakMap;function vb(e){let t=_b.get(e);if(t)return t;let n;if(e.byteLength<=8192)n=String.fromCharCode.apply(null,e);else{let t=[];for(let n=0;n<e.byteLength;n+=8192)t.push(String.fromCharCode.apply(null,e.subarray(n,n+8192)));n=t.join(``)}let r=gb(`binary`,n);return _b.set(e,r),r}function yb(e){if(typeof e==`string`)return e.startsWith(hb)?gb(`string`,e):e;if(typeof e!=`object`||!e)return e;if(e instanceof Date)return e.getTime();if($y(e)){let t=e[Symbol.toStringTag];if(t===`Temporal.Duration`){let n=e;return gb(t,qy.map(e=>n[e]).join(`,`))}return gb(t,e.toString())}return pb(e)?vb(e):e}function bb(e,t){let n=e[Symbol.toStringTag],r=t[Symbol.toStringTag];if(n!==r)throw TypeError(X(167,{aTag:n,bTag:r}));let i=e.constructor.compare;if(typeof i!=`function`)throw TypeError(X(168,{aTag:n}));return i(e,t)}function xb(e,t){return $y(e)&&$y(t)?bb(e,t):e<t?-1:+(e>t)}function Sb(e,t){return e===t?!0:pb(e)&&pb(t)?mb(e,t):!1}var Cb=Symbol(`tanstack_db_parent_context`),wb=Symbol(`tanstack_db_parent_projection_not_found`);function Tb(e,t){let n=yb(e);return typeof n==`object`&&n||typeof n==`function`||typeof n==`symbol`?t(n):n}function Eb(e,t){if(typeof e==`object`&&e||typeof e==`function`||typeof e==`symbol`)return t(e);if(typeof e==`number`){if(Object.is(e,-0))return[`number`,`-0`];if(Number.isNaN(e))return[`number`,`NaN`]}return e}function Db(){let e=nb(),t=t=>Tb(t,e);return{equality:t,exact:t=>Eb(t,e),serializeEquality:e=>mg(t(e))}}function Ob(e,t,n={}){return{[Cb]:!0,value:e,projectedBindings:n,identity:t}}function kb(e){return jb(e)?e.projectedBindings:void 0}function Ab(e,t){let n=kb(e);return n&&Object.prototype.hasOwnProperty.call(n,t)?n[t]:wb}function jb(e){return typeof e==`object`&&!!e&&Cb in e}function Mb(e){if(jb(e))return e.value;if(typeof e==`object`&&e)return e}function Nb(e){return jb(e)?e.identity:e}function Pb(e){if(typeof e!=`object`||!e)return!1;let t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}function Fb(e){return!!e&&(typeof e==`object`||typeof e==`function`)&&typeof e.then==`function`}var Ib=Symbol(`tanstack_db_routed_scalar_value`),Lb=Symbol(`tanstack_db_route_metadata`),Rb=Symbol(`includesPublicKey`),zb=Symbol(`includesRouting`),Bb=new Set([Lb,Rb]),Vb=new Set([...Bb,zb]);function Hb(e,t,n){return Object.assign(e,{[Lb]:{correlationKey:t,parentContext:n}})}function Ub(e){if(typeof e==`object`&&e&&Lb in e)return e[Lb]}function Wb(e,t){return Ub(e)??(typeof e==`object`&&e?Ub(e[t]):void 0)}function Gb(e){let t={...e};return delete t[Lb],t}function Kb(e,t,n,r){return t===void 0&&n===void 0&&r===void 0?e:Pb(e)?{...e,[Lb]:{correlationKey:t,parentContext:n},[Rb]:r}:{[Ib]:e,[Lb]:{correlationKey:t,parentContext:n},[Rb]:r}}function qb(e){if(typeof e!=`object`||!e||!(Ib in e))return;let t=e,n=t[Lb];return{value:t[Ib],correlationKey:n.correlationKey,parentContext:n.parentContext,publicKey:t[Rb]}}function Jb(e){return Xb(e,e=>e,Bb)}function Yb(e){return Xb(e,e=>e,Vb)}function Xb(e,t,n){let r=t(e);if(!Object.is(r,e))return r;if(!Zb(e))return e;let i=new WeakMap,a=new WeakMap,o=new Set,s=e=>{if(a.has(e))return;let r=new Map;a.set(e,r);for(let a of Reflect.ownKeys(e)){if(n.has(a)){o.add(e);continue}let c=Object.getOwnPropertyDescriptor(e,a);if(!c)continue;let l={descriptor:c};if(r.set(a,l),!c.enumerable||!(`value`in c))continue;let u=c.value,d=t(u);if(l.value={original:u,replacement:d},!Object.is(d,u)){o.add(e);continue}if(!Zb(u))continue;let f=i.get(u)??new Set;f.add(e),i.set(u,f),s(u)}};s(e);let c=[...o];for(let e of c)for(let t of i.get(e)??[])o.has(t)||(o.add(t),c.push(t));if(!o.has(e))return e;let l=new WeakMap,u=e=>{if(!o.has(e))return e;let t=l.get(e);if(t)return t;let n=Array.isArray(e)?[]:Object.create(Object.getPrototypeOf(e));l.set(e,n);for(let[t,r]of a.get(e)??[]){let e={...r.descriptor};if(r.value){let{original:t,replacement:n}=r.value;e.value=Object.is(n,t)?Zb(t)?u(t):t:n}Object.defineProperty(n,t,e)}return n};return u(e)}function Zb(e){return Array.isArray(e)||Pb(e)}function Qb(e){return e==null}function $b(e){return pb(e)?e:yb(e)}function ex(e,t){return Z(e)||Z(t)?Z(e)&&Z(t):Sb(e,t)}function tx(e){if(e instanceof Date)return Number.isNaN(e.getTime())?null:e;if(typeof e==`string`||typeof e==`number`){let t=new Date(e);return Number.isNaN(t.getTime())?null:t}return null}function nx(e,t){return e===`%Y-%m-%d`?t.toISOString().slice(0,10):t.toISOString()}function rx(e){return e===!0}function ix(e,t=!1){return ox(e,t)}function ax(e){return ox(e,!0)}function ox(e,t){switch(e.type){case`val`:{let t=e.value;return()=>t}case`ref`:return t?cx(e):sx(e);case`func`:return lx(e,t);default:throw new _y(e.type)}}function sx(e){let t=Vh(e),[n,...r]=e.path,i=t??n,a=t===void 0?r:Hh(e);if(!i)throw new vy;let o=e.bindingId?JSON.stringify([e.bindingId,a]):void 0,s=o?e=>Ab(Wb(e,i)?.parentContext,o):void 0;if(i===`$selected`){if(a.length===0)return e=>e.$selected;if(a.length===1){let e=a[0];return t=>t.$selected?.[e]}return e=>{let t=e.$selected;if(t===void 0)return;let n=t;for(let e of a){if(n==null)return n;n=n[e]}return n}}let c=i;if(a.length===0)return e=>{let t=s?.(e);return s&&t!==wb?t:e[c]};if(a.length===1){let e=a[0];return t=>{let n=s?.(t);return s&&n!==wb?n:t[c]?.[e]}}return e=>{let t=s?.(e);if(s&&t!==wb)return t;let n=e[c];if(n===void 0)return;let r=n;for(let e of a){if(r==null)return r;r=r[e]}return r}}function cx(e){let t=Hh(e);return e=>{let n=e;for(let e of t){if(n==null)return n;n=n[e]}return n}}function lx(e,t){let n=e.args.map(e=>ox(e,t));switch(e.name){case`array`:return e=>n.map(t=>t(e));case`eq`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n),a=typeof r;if(a===typeof i&&(a===`string`||a===`boolean`))return r===i;let o=$b(r),s=$b(i);return Qb(o)||Qb(s)?null:ex(o,s)}}case`gt`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n);return Qb(r)||Qb(i)?null:Z(r)||Z(i)?Z(r)&&!Z(i):xb(r,i)>0}}case`gte`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n);return Qb(r)||Qb(i)?null:Z(r)||Z(i)?Z(r):xb(r,i)>=0}}case`lt`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n);return Qb(r)||Qb(i)?null:Z(r)||Z(i)?Z(i)&&!Z(r):xb(r,i)<0}}case`lte`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n);return Qb(r)||Qb(i)?null:Z(r)||Z(i)?Z(i):xb(r,i)<=0}}case`and`:return e=>{let t=!1;for(let r of n){let n=r(e);if(n===!1)return!1;Qb(n)&&(t=!0)}return!t||null};case`or`:return e=>{let t=!1;for(let r of n){let n=r(e);if(n===!0)return!0;Qb(n)&&(t=!0)}return t?null:!1};case`not`:{let e=n[0];return t=>{let n=e(t);return Qb(n)?null:!n}}case`in`:{let t=n[0],r=n[1],i=e.args[1];if(i.type===`val`&&Array.isArray(i.value)){let e=i.value.filter(e=>!Qb(e)),n=e.filter(pb),r=new Set(e.filter(e=>!pb(e)).map(yb));return e=>{let i=t(e);return Qb(i)?null:pb(i)?n.some(e=>Sb(e,i)):r.has(yb(i))}}return e=>{let n=$b(t(e)),i=r(e);return Qb(n)?null:Array.isArray(i)?i.some(e=>ex($b(e),n)):!1}}case`like`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n);return Qb(r)||Qb(i)?null:dx(r,i,!1)}}case`ilike`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n);return Qb(r)||Qb(i)?null:dx(r,i,!0)}}case`upper`:{let e=n[0];return t=>{let n=e(t);return typeof n==`string`?n.toUpperCase():n}}case`lower`:{let e=n[0];return t=>{let n=e(t);return typeof n==`string`?n.toLowerCase():n}}case`length`:{let e=n[0];return t=>{let n=e(t);return typeof n==`string`||Array.isArray(n)?n.length:0}}case`concat`:return e=>n.map(t=>{let n=t(e);try{return String(n??``)}catch{try{return JSON.stringify(n)||``}catch{return`[object]`}}}).join(``);case`coalesce`:return e=>{for(let t of n){let n=t(e);if(n!=null)return n}return null};case`caseWhen`:{let e=n.length%2==1,t=Math.floor(n.length/2);if(n.length<2)throw Error(X(127));return r=>{for(let e=0;e<t;e++){let t=n[e*2];if(ux(t(r))){let t=n[e*2+1];return t(r)}}return e?n[n.length-1](r):null}}case`add`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n);return(r??0)+(i??0)}}case`subtract`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n);return(r??0)-(i??0)}}case`multiply`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n);return(r??0)*(i??0)}}case`divide`:{let e=n[0],t=n[1];return n=>{let r=e(n),i=t(n)??0;return i===0?null:(r??0)/i}}case`date`:{let e=n[0];return t=>{let n=tx(e(t));return n?n.toISOString().slice(0,10):null}}case`datetime`:{let e=n[0];return t=>{let n=tx(e(t));return n?n.toISOString():null}}case`strftime`:{let e=n[0],t=n[1];return n=>{let r=e(n);if(typeof r!=`string`)return null;let i=tx(t(n));return i?nx(r,i):null}}case`isUndefined`:{let e=n[0];return t=>e(t)===void 0}case`isNull`:{let e=n[0];return t=>e(t)===null}default:throw new yy(e.name)}}function ux(e){return e==null||e===!1?!1:e===!0?!0:typeof e==`number`?e!==0&&!Number.isNaN(e):typeof e==`bigint`?e!==0n:!!e}function dx(e,t,n){if(typeof e!=`string`||typeof t!=`string`)return!1;let r=n?e.toLowerCase():e,i=n?t.toLowerCase():t,a=0,o=0,s=-1,c=0;for(;a<r.length;){let e=o<i.length?i[o]:void 0;if(e===`%`)s=o,c=a,o++;else if(e===`_`||e===r[a])a++,o++;else if(s!==-1)c++,a=c,o=s+1;else return!1}for(;i[o]===`%`;)o++;return o===i.length}var fx=class{constructor(e,t){this.gu=t,this.bl=e}lookup(e,t){let n=e===`gt`?`lt`:e===`gte`?`lte`:e===`lt`?`gt`:e===`lte`?`gte`:e;return this.bl.lookup(n,t)}rangeQuery(e={}){return this.bl.rangeQueryReversed(e)}take(e,t,n){return this.gu===void 0?this.bl.takeReversed(e,t,n):this.read(e,n,t??null)}takeFromStart(e,t){return this.gu===void 0?this.bl.takeReversedFromEnd(e,t):this.read(e,t)}read(e,t,n){let r=new Set([...this.bl.equalityLookup(null),...this.bl.equalityLookup(void 0)]),i=e=>t?.(e)??!0,a=e=>!r.has(e)&&i(e),o=e=>e<=0?[]:n==null?this.bl.takeReversedFromEnd(e,a):this.bl.takeReversed(e,n,a),s=e=>e<=0?[]:[...r].sort(pg).filter(i).slice(0,e);if(n===null)return this.gu?o(e):[];if(this.gu&&n===void 0){let t=s(e);return[...t,...o(e-t.length)]}let c=o(e);return this.gu?c:[...c,...s(e-c.length)]}supports(e){return this.bl.supports(e)}get supportsRangeOptimization(){return this.bl.supportsRangeOptimization}get supportsOrderOptimization(){return this.bl.supportsOrderOptimization===!0}canOptimizeRangeFor(e){return this.bl.canOptimizeRangeFor?.(e)??!0}get keyCount(){return this.bl.keyCount}};function px(e,t,n,r,i){let a=e,o=a.$hasPendingWrites??r();return{...e,$hasPendingWrites:o,$origin:a.$origin??i(),$key:a.$key??t,$collectionId:a.$collectionId??n}}var mx=[`$hasPendingWrites`,`$origin`,`$key`,`$collectionId`];function hx(e){return mx.includes(e)}function gx(e){return e.some(e=>hx(e))}function _x(e){return e.supports(`gt`)&&e.supportsRangeOptimization}function vx(e){return _x(e)&&!!e.supportsOrderOptimization}function yx(e,t,n,r){if(gx(t))return;let i=n??{...eb,...e.compareOptions};for(let n of e.indexes.values())if(n.matchesField(t)&&n.matchesCompareOptions(i)){let e=n.matchesDirection(i.direction)?n:new fx(n,i.nulls===`first`);if(!r||r(e))return e}}function bx(e){if(e.length===0)return new Set;if(e.length===1)return new Set(e[0]);let t=new Set(e[0]);for(let n=1;n<e.length;n++){let r=new Set;for(let i of t)e[n].has(i)&&r.add(i);t=r}return t}function xx(e){let t=new Set;for(let n of e)for(let e of n)t.add(e);return t}function Sx(e){return e!=null}function Cx(e){return{...eb,...e.compareOptions}.stringSort!==`lexical`}function wx(e,t){switch(typeof e){case`number`:case`bigint`:case`boolean`:return!1;case`string`:return Cx(t);case`symbol`:return!0;case`object`:return e!==null&&!(e instanceof Date);default:return!1}}function Tx(e,t,n){return!wx(e,n)&&t.supportsRangeOptimization&&(t.canOptimizeRangeFor?.(e)??!0)}function Ex(e,t){return Dx(e,t)}function Dx(e,t){if(e.type===`func`)switch(e.name){case`eq`:case`gt`:case`gte`:case`lt`:case`lte`:return kx(e,t);case`and`:return Ax(e,t);case`or`:return jx(e,t);case`in`:return Mx(e,t)}return{canOptimize:!1,matchingKeys:new Set,isExact:!1}}function Ox(e,t){if(e.type!==`func`||e.args.length<2)return{canOptimize:!1,matchingKeys:new Set,isExact:!1,coveredArgIndices:new Set};let n=new Map;for(let[t,r]of e.args.entries())if(r.type===`func`&&[`gt`,`gte`,`lt`,`lte`].includes(r.name)){let e=r;if(e.args.length===2){let r=e.args[0],i=e.args[1],a=null,o=null,s=e.name;if(r.type===`ref`&&i.type===`val`)a=r,o=i;else if(r.type===`val`&&i.type===`ref`)switch(a=i,o=r,s){case`gt`:s=`lt`;break;case`gte`:s=`lte`;break;case`lt`:s=`gt`;break;case`lte`:s=`gte`}if(a&&o){let e=a.path,r=JSON.stringify(e),i=o.value;n.has(r)||n.set(r,[]),n.get(r).push({operation:s,value:i,argIndex:t})}}}for(let[e,r]of n)if(r.length>=2){let n=yx(t,JSON.parse(e));if(n&&r.some(e=>!Tx(e.value,n,t)))continue;if(n&&n.supports(`gt`)&&n.supports(`lt`)){let e=db({...eb,...t.compareOptions,direction:`asc`}),i,a,o=!1,s=!1,c=!0,l=!0,u=!1;for(let{operation:t,value:n}of r)if(!Sx(n))u=!0;else switch(t){case`gt`:case`gte`:{let r=o?e(n,i):1;r>0?(i=n,o=!0,c=t===`gte`):r===0&&t===`gt`&&(c=!1);break}case`lt`:case`lte`:{let r=s?e(n,a):-1;r<0?(a=n,s=!0,l=t===`lte`):r===0&&t===`lt`&&(l=!1);break}}let d={};return o&&(d.from=i,d.fromInclusive=c),s&&(d.to=a,d.toInclusive=l),{canOptimize:!0,matchingKeys:n.rangeQuery(d),isExact:o&&!u,coveredArgIndices:new Set(r.map(e=>e.argIndex))}}}return{canOptimize:!1,matchingKeys:new Set,isExact:!1,coveredArgIndices:new Set}}function kx(e,t){if(e.type!==`func`||e.args.length!==2)return{canOptimize:!1,matchingKeys:new Set,isExact:!1};let n=e.args[0],r=e.args[1],i=null,a=null,o=e.name;if(n.type===`ref`&&r.type===`val`)i=n,a=r;else if(n.type===`val`&&r.type===`ref`)switch(i=r,a=n,o){case`gt`:o=`lt`;break;case`gte`:o=`lte`;break;case`lt`:o=`gt`;break;case`lte`:o=`gte`}if(i&&a){let e=i.path,n=yx(t,e);if(n){let e=a.value,r=o;return!n.supports(r)||(o===`gt`||o===`gte`||o===`lt`||o===`lte`)&&!Tx(e,n,t)?{canOptimize:!1,matchingKeys:new Set,isExact:!1}:{canOptimize:!0,matchingKeys:n.lookup(r,e),isExact:o===`lt`||o===`lte`?!1:Sx(e)}}}return{canOptimize:!1,matchingKeys:new Set,isExact:!1}}function Ax(e,t){if(e.type!==`func`||e.args.length<2)return{canOptimize:!1,matchingKeys:new Set,isExact:!1};let n=Ox(e,t),r=n.canOptimize?n.coveredArgIndices:new Set,i=[];n.canOptimize&&i.push(n);let a=!n.canOptimize||n.isExact;for(let[n,o]of e.args.entries()){if(r.has(n))continue;let e=Dx(o,t);e.canOptimize?(i.push(e),e.isExact||(a=!1)):a=!1}return i.length>0?{canOptimize:!0,matchingKeys:bx(i.map(e=>e.matchingKeys)),isExact:a}:{canOptimize:!1,matchingKeys:new Set,isExact:!1}}function jx(e,t){if(e.type!==`func`||e.args.length<2)return{canOptimize:!1,matchingKeys:new Set,isExact:!1};let n=[];for(let r of e.args){let e=Dx(r,t);if(!e.canOptimize)return{canOptimize:!1,matchingKeys:new Set,isExact:!1};n.push(e)}return{canOptimize:!0,matchingKeys:xx(n.map(e=>e.matchingKeys)),isExact:n.every(e=>e.isExact)}}function Mx(e,t){if(e.type!==`func`||e.args.length!==2)return{canOptimize:!1,matchingKeys:new Set,isExact:!1};let n=e.args[0],r=e.args[1];if(n.type===`ref`&&r.type===`val`&&Array.isArray(r.value)){let e=n.path,i=r.value,a=yx(t,e),o=i.every(e=>Sx(e));if(a){if(a.supports(`in`))return{canOptimize:!0,matchingKeys:a.lookup(`in`,i),isExact:o};if(a.supports(`eq`)){let e=new Set;for(let t of i){let n=a.lookup(`eq`,t);for(let t of n)e.add(t)}return{canOptimize:!0,matchingKeys:e,isExact:o}}}}return{canOptimize:!1,matchingKeys:new Set,isExact:!1}}var Nx=new WeakMap;function Px(e,t){Nx.set(e,t)}function Fx(e){return typeof e==`object`&&e?Nx.get(e):void 0}var Ix=0;function Lx(){let e=new Map;function t(n){let r=JSON.stringify(n);if(e.has(r))return e.get(r);let i=new Proxy({},{get(e,r,i){if(r===`__refProxy`)return!0;if(r===`__path`)return n;if(r!==`__sourceAlias`&&r!==`__bindingId`&&r!==`__type`)return r===Dh?!0:typeof r==`symbol`?Reflect.get(e,r,i):t([...n,String(r)])},has(e,t){return t===`__refProxy`||t===`__path`||t===`__sourceAlias`||t===`__bindingId`||t===`__type`||Reflect.has(e,t)},ownKeys(e){return Reflect.ownKeys(e)},getOwnPropertyDescriptor(e,t){return t===`__refProxy`||t===`__path`||t===`__sourceAlias`||t===`__bindingId`||t===`__type`?{enumerable:!1,configurable:!0}:Reflect.getOwnPropertyDescriptor(e,t)}});return e.set(r,i),i}return t([])}function Rx(e,t){let n=new Map;function r(e){let n,i;return new Proxy({},{get(a,o,s){if(o===`__refProxy`)return!0;if(o===`__path`)return e;if(o===`__sourceAlias`)return e[0];if(o===`__bindingId`)return t?.get(e[0]??``);if(o===`__type`)return;if(o===Dh)return e;if(typeof o==`symbol`)return Reflect.get(a,o,s);if(o===i?.key)return i.ref;if(Object.prototype.hasOwnProperty.call(a,o))return Reflect.get(a,o,s);n??=new Map;let c=n.get(o);return c===void 0&&(c=r([...e,o]),n.set(o,c)),c},has(e,t){return t===i?.key||t===`__refProxy`||t===`__path`||t===`__sourceAlias`||t===`__bindingId`||t===`__type`||Reflect.has(e,t)},ownKeys(n){let r=++Ix,a=`__SPREAD_SENTINEL__${e.join(`.`)}__${r}`;return i={key:a,ref:new Bh(e,e[0],t?.get(e[0]??``))},[...Reflect.ownKeys(n),a]},getOwnPropertyDescriptor(e,t){return t===i?.key?{enumerable:!0,configurable:!0,value:i.ref}:t===`__refProxy`||t===`__path`||t===`__sourceAlias`||t===`__bindingId`||t===`__type`?{enumerable:!1,configurable:!0}:Reflect.getOwnPropertyDescriptor(e,t)}})}return new Proxy({},{get(t,i,a){if(i===`__refProxy`)return!0;if(i===`__path`)return[];if(i===`__sourceAlias`||i===`__bindingId`||i===`__type`)return;if(i===Dh)return!0;if(typeof i==`symbol`)return Reflect.get(t,i,a);let o=String(i);if(e.includes(o)||e.includes(`*`)){let e=n.get(o);return e===void 0&&(e=r([o]),n.set(o,e)),e}},has(t,n){return n===`__refProxy`||n===`__path`||n===`__sourceAlias`||n===`__bindingId`||n===`__type`||typeof n==`string`&&e.includes(n)?!0:Reflect.has(t,n)},ownKeys(t){return[...e,`__refProxy`,`__path`,`__sourceAlias`,`__bindingId`,`__type`]},getOwnPropertyDescriptor(t,n){if(n===`__refProxy`||n===`__path`||n===`__sourceAlias`||n===`__bindingId`||n===`__type`)return{enumerable:!1,configurable:!0};if(typeof n==`string`&&e.includes(n))return{enumerable:!0,configurable:!0}}})}function zx(e,t){let n=Rx(e,t),r=new Map;function i(e){let t=JSON.stringify(e);if(r.has(t))return r.get(t);let n=new Proxy({},{get(t,n,r){if(n===`__refProxy`)return!0;if(n===`__path`)return[`$selected`,...e];if(n===`__sourceAlias`)return`$selected`;if(n!==`__bindingId`&&n!==`__type`)return n===Dh?!0:typeof n==`symbol`?Reflect.get(t,n,r):i([...e,String(n)])},has(e,t){return t===`__refProxy`||t===`__path`||t===`__sourceAlias`||t===`__bindingId`||t===`__type`||Reflect.has(e,t)},ownKeys(e){return Reflect.ownKeys(e)},getOwnPropertyDescriptor(e,t){return t===`__refProxy`||t===`__path`||t===`__sourceAlias`||t===`__bindingId`||t===`__type`?{enumerable:!1,configurable:!0}:Reflect.getOwnPropertyDescriptor(e,t)}});return r.set(t,n),n}let a=i([]);return new Proxy(n,{get(e,t,n){return t===`$selected`?a:Reflect.get(e,t,n)},has(e,t){return t===`$selected`||Reflect.has(e,t)},ownKeys(e){return[...Reflect.ownKeys(e),`$selected`]},getOwnPropertyDescriptor(e,t){return t===`$selected`?{enumerable:!0,configurable:!0,value:a}:Reflect.getOwnPropertyDescriptor(e,t)}})}function Q(e){if(e===null||typeof e!=`object`&&typeof e!=`function`)return new Uh(e);let t=Oh(e);if(t!==void 0)return Array.isArray(t)?new Bh(t,t[0],e.__bindingId):new Bh(e.__path,e.__sourceAlias,e.__bindingId);let n=Fx(e);if(n)throw Error(X(126,{name:n}));return Yh(e)?e:new Uh(e)}function Bx(e,t){return new Wh(`eq`,[Q(e),Q(t)])}function Vx(e,t){return new Wh(`gt`,[Q(e),Q(t)])}function Hx(e,t){return new Wh(`gte`,[Q(e),Q(t)])}function Ux(e,t){return new Wh(`lt`,[Q(e),Q(t)])}function Wx(e,t,...n){return new Wh(`and`,[e,t,...n].map(e=>Q(e)))}function Gx(e,t,...n){return new Wh(`or`,[e,t,...n].map(e=>Q(e)))}function Kx(e){return new Wh(`not`,[Q(e)])}function qx(e){return new Wh(`isUndefined`,[Q(e)])}function Jx(e){return new Wh(`isNull`,[Q(e)])}function Yx(e,t){return new Wh(`in`,[Q(e),Q(t)])}var Xx=[`eq`,`gt`,`gte`,`lt`,`lte`,`in`],Zx=class{constructor(e,t){this.query=e,this.runtime=t,this.__brand=`ToArrayWrapper`,Px(this,`toArray()`)}},Qx=class{constructor(e,t){this.query=e,this.runtime=t,this.__brand=`ConcatToArrayWrapper`,Px(this,`concat(toArray())`)}},$x=class{constructor(e){this.args=e,this.__brand=`CaseWhenWrapper`,Px(this,`caseWhen()`)}},eS=class{constructor(e,t){this.query=e,this.runtime=t,this.__brand=`MaterializeWrapper`,Px(this,`materialize()`)}},tS=class{constructor(e,t){this.query=e,this.runtime=t,this.__brand=`IncludeWrapper`,Px(this,`include()`)}};function nS(){return wh()&&!1}function rS(e){return e.config.autoIndex===`eager`}function iS(e,t,n,r,i){if(gx(t))return;let a=rS(n);if(!a&&!nS())return;let o=r??{...eb,...n.compareOptions};if(!yx(n,t,o,i)){if(!a)n.id,n.size;else try{n.createIndex(e=>{let n=e;for(let e of t)n=n[e];return n},{name:`auto:${t.join(`.`)}`,options:{compareOptions:o}})}catch(e){console.warn(Eh(215,{id:n.id,value:t.join(`.`)}),e)}}}function aS(e,t){if(!rS(t)&&!nS())return;let n=oS(e);for(let{fieldName:e,fieldPath:r}of n)iS(e,r,t)}function oS(e){let t=[];function n(e){if(e.type!==`func`)return;let r=e;if(r.name===`and`){for(let e of r.args)n(e);return}if(!Xx.includes(r.name)||r.args.length<1||r.args[0].type!==`ref`)return;let i=r.args[0].path;if(i.length===0)return;let a=i.join(`_`);t.push({fieldName:a,fieldPath:i})}return n(e),t}function sS(e){let t=yb(e),n=typeof t;return n===`string`||n===`number`||n===`boolean`?`${n}:${String(t)}`:void 0}function cS(e,t){try{let n=e;for(let e of t)n=n?.[e];return n}catch{return}}function lS(e,t){if(e.type!==`func`||e.name!==`eq`)return;let n=e.args;if(n.length!==2)return;let r=n[0],i=n[1],a=r.type===`ref`?r:i,o=r.type===`val`?r:i;if(a.type!==`ref`||o.type!==`val`)return;let s=t(a);if(!s?.length||hx(s[0]))return;let c=sS(o.value);return c===void 0?void 0:{path:s,literalKey:c}}function uS(e){switch(e.type){case`ref`:{let t=Vh(e)??e.path[0];return new Set(t?[t]:[])}case`func`:{let t=new Set;for(let n of e.args)for(let e of uS(n))t.add(e);return t}default:return new Set}}function dS(e,t){let n=e.type;if(n===`val`)return new Uh(e.value);if(n===`ref`){let n=e.path,r=Vh(e);if(Array.isArray(n)){if(r===t)return new Bh(Hh(e));if(r!==void 0)return new Bh(n,r);if(n[0]===t&&n.length>1)return new Bh(n.slice(1));if(n.length===1&&n[0]!==void 0)return new Bh([n[0]])}return new Bh(Array.isArray(n)?n:[String(n)])}{let n=[];for(let r of e.args){let e=dS(r,t);n.push(e)}return new Wh(e.name,n)}}function fS(e,t){return e.map(e=>{let n=dS(e.expression,t);return{...e,expression:n}})}function pS(e,t,n,r,i,a,o,s,c,l,u){let d=n.map(e=>({compiledExpression:ix(i?i.replaceAggregatesByRefs(e.expression,r,`$selected`):e.expression),compareOptions:mS(e,a)})),f=e=>n.length>1?d.map(t=>t.compiledExpression(e)):n.length===1?d[0].compiledExpression(e):null,p=(e,t)=>{if(n.length>1){let r=e,i=t;for(let e=0;e<n.length;e++){let t=d[e],n=db(t.compareOptions)(r[e],i[e]);if(n!==0)return n}return r.length-i.length}if(n.length===1){let n=d[0];return db(n.compareOptions)(e,t)}return fb(e,t)},m,h;if(c!==void 0&&n.length>0&&!u&&e.from.type!==`unionFrom`&&e.from.type!==`unionAll`){let t,r,i=e.from.alias,s,u=n[0],d=u.expression,f=d.type===`ref`?ag(e,d,a):void 0;if(d.type===`ref`&&f){r=f.collection,s=f.sourceId;let n=f.path[0],o=mS(u,a);n&&iS(n,f.path,r,o,_x),t=yx(r,f.path,o,vx),f.path,i=d.path.length>1?String(d.path[0]):e.from.alias,s??=Qh(e).find(e=>e.alias===i&&e.collection===r)?.sourceId}if(s&&f){let r=hS(n,a.compareOptions),u=n.every(({expression:t})=>t.type===`ref`&&ag(e,t,a)?.sourceId===s),d=ix(new Bh(f.path),!0),p=db(r[0].compareOptions),g=(e,t)=>p(e&&d(e),t&&d(t)),_=e.where?.some(e=>[...uS($h(e))].some(e=>e!==i))??!1,v=_&&e.join?.length===1&&e.join[0].type===`left`&&e.join[0].from.type===`collectionRef`?e.join[0].from.sourceId:void 0,y={sourceId:s,alias:i,offset:l??0,limit:c,comparator:g,valueExtractorForRawRow:d,index:t,orderBy:r,joinedFilterSourceId:v,sourceHoldsAllRows:f.collection.config.syncMode!==`on-demand`,requiresFullSource:r.some(({compareOptions:e})=>e.stringSort===`custom`)||!u||e.from.type!==`collectionRef`||e.from.sourceId!==s||(e.join?.some(({type:e})=>e!==`left`)??!1)||(e.where?.some(tg)??!1)||_&&v===void 0||(e.fnWhere?.length??0)>0||e.groupBy!==void 0||e.having!==void 0||e.fnHaving!==void 0||e.distinct===!0};h=y,o[s]=y;let b=y.joinedFilterSourceId!==void 0&&!y.sourceHoldsAllRows;(t||b)&&(m=e=>{y.dataNeeded=t=>{let n=e(t&&(e=>g(e[i],t)<=0));return Math.max(0,y.limit-n)}})}}return u?t.pipe(tv(f,{limit:c,offset:l,comparator:p,setSizeCallback:m,groupKeyFn:u,setWindowFn:e=>{s(t=>{e(t),h&&(h.offset=t.offset??h.offset,h.limit=t.limit??h.limit)})}})):t.pipe(nv(f,{limit:c,offset:l,comparator:p,setSizeCallback:m,setWindowFn:e=>{s(t=>{e(t),h&&(h.offset=t.offset??h.offset,h.limit=t.limit??h.limit)})}}))}function mS(e,t){return gS(e,t.compareOptions)}function hS(e,t){return e.map(e=>({expression:e.expression,compareOptions:gS(e,t)}))}function gS(e,t){return e.compareOptions.stringSort===void 0?{...t,direction:e.compareOptions.direction,nulls:e.compareOptions.nulls}:e.compareOptions}function _S(e){let t=e.type===`func`&&e.name===`and`?e.args:[e];for(let e of t){let t=lS(e,Hh);if(t)return e=>sS(cS(e,t.path))===t.literalKey}}function vS(e,t={},n){let r=r=>{let i=[],a=r&&n&&t.where?_S(t.where):void 0,o=a?n(a):e.entries();for(let[e,t]of o)(r?.(t)??!0)&&i.push({type:`insert`,key:e,value:t});return i};if(t.limit!==void 0&&!t.orderBy)throw Error(X(94));if(t.orderBy){let n=t.where?yS(t.where):void 0,r=xS(e,t.orderBy,t.limit,n,t.optimizedOnly);if(r===void 0)return;let i=[];for(let t of r){let n=e.get(t);n!==void 0&&i.push({type:`insert`,key:t,value:n})}return i}if(!t.where)return r();try{let n=t.where,i=Ex(n,e);if(i.canOptimize){let t=i.isExact?void 0:yS(n),r=[];for(let n of i.matchingKeys){let i=e.get(n);i!==void 0&&(t?.(i)??!0)&&r.push({type:`insert`,key:n,value:i})}return r}return t.optimizedOnly?void 0:r(yS(n))}catch(n){console.warn(Eh(213,{id:e.id}),n);let i=yS(t.where);return t.optimizedOnly?void 0:r(i)}}function yS(e){let t=ax(e);return e=>{try{return rx(t(e))}catch{return!1}}}function bS(e,t){let n=yS(t.whereExpression);return t=>{let r=[];for(let e of t)if(e.type===`insert`)n(e.value)&&r.push(e);else if(e.type===`update`){let t=n(e.value),i=e.previousValue?n(e.previousValue):!1;t&&i?r.push(e):t&&!i?r.push({...e,type:`insert`}):!t&&i&&r.push({...e,type:`delete`,value:e.previousValue})}else n(e.value)&&r.push(e);return r.length>0||t.length===0?(e(r),!0):!1}}function xS(e,t,n,r,i){if(t.length===1){let i=t[0],a=i.expression;if(a.type===`ref`){let t=a.path,o=mS(i,e);iS(t[0],t,e,o,_x);let s=yx(e,t,o,vx);if(s)return s.takeFromStart(n??s.keyCount,t=>{let n=e.get(t);return n===void 0?!1:r?.(n)??!0})}}if(i)return;let a=[];for(let[t,n]of e.entries())(r?.(n)??!0)&&a.push({key:t,value:n});let o=t.map(t=>({expression:t.expression,compare:db(mS(t,e))}));a.sort((e,t)=>{for(let n of o){let r=SS(e.value,n.expression),i=SS(t.value,n.expression),a=n.compare(r,i);if(a!==0)return a}return 0});let s=a.map(e=>e.key);return n===void 0?s:s.slice(0,n)}function SS(e,t){if(t.type===`ref`){let n=t,r=e;for(let e of n.path)r=r?.[e];return r}return t.type===`val`?t.value:ax(t)(e)}var CS=class{constructor(e){this.bT=new Set,this.map=new Map,this.am=[],this.comparator=e}indexOf(e,t,n=this.am){let r=0,i=n.length;if(!this.comparator){for(;r<i;){let t=Math.floor((r+i)/2),a=n[t],o=pg(e,a);if(o<0)i=t;else if(o>0)r=t+1;else return t}return r}for(;r<i;){let a=Math.floor((r+i)/2),o=n[a],s=this.map.get(o),c=this.comparator(t,s);if(c<0)i=a;else if(c>0)r=a+1;else{let t=pg(e,o);if(t<0)i=a;else if(t>0)r=a+1;else return a}}return r}restoreOrder(){if(this.bT.size===0)return;let e=this.am,t=e.filter(e=>!this.bT.has(e)),n=[...this.bT].filter(e=>this.map.has(e)).sort((e,t)=>(this.comparator?.(this.map.get(e),this.map.get(t))??0)||pg(e,t));e.length=0;let r=0;for(let i of n){let n=this.indexOf(i,this.map.get(i),t);for(;r<n;)e.push(t[r++]);e.push(i)}for(;r<t.length;)e.push(t[r++]);this.bT.clear()}cz(e){let t=t=>t===e||t!==t&&e!==e,n=this.indexOf(e,this.map.get(e));t(this.am[n])||(n=this.am.findIndex(t)),this.am.splice(n,1)}set(e,t,n=!1){return!this.comparator&&this.map.has(e)?(this.map.set(e,t),this):n?(this.map.set(e,t),this.bT.add(e),this):(this.restoreOrder(),this.map.has(e)&&this.cz(e),this.am.splice(this.indexOf(e,t),0,e),this.map.set(e,t),this)}get(e){return this.map.get(e)}delete(e,t=!1){if(t){let t=this.map.delete(e);return t&&this.bT.add(e),t}return this.restoreOrder(),this.map.has(e)&&this.cz(e),this.map.delete(e)}has(e){return this.map.has(e)}clear(){this.map.clear(),this.am=[],this.bT.clear()}get size(){return this.map.size}*[Symbol.iterator](){for(let e of this.keys())yield[e,this.map.get(e)]}entries(){return this[Symbol.iterator]()}keys(){return this.restoreOrder(),this.am[Symbol.iterator]()}*values(){for(let e of this.keys())yield this.map.get(e)}};function wS(e,t){let n=e.preserveHydrationSeedKeys;return e.truncate===!0&&(!n||e.sourceTruncate===!0&&!n.has(t))}function TS(e){return e.metadata!==void 0&&e.type!==`delete`?{type:`set`,value:e.metadata}:e.type===`update`?void 0:{type:`delete`}}var ES=class{constructor(e){this.pendingSyncedTransactions=[],this.a7={states:new Map,truncated:!1,sourceKeys:new Set},this.syncedMetadata=new Map,this.syncedCollectionMetadata=new Map,this.hydrationSeedKeys=new Set,this.hydratedKeys=new Set,this.hasAppliedAdapterTruncate=!1,this.adapterTruncateKeptKeys=new Set,this.optimisticUpserts=new Map,this.optimisticDeletes=new Set,this.bf=()=>!1,this.getStagedSyncTransactions=()=>[],this.heldOptimisticRows=new Map,this.rowOrigins=new Map,this.pendingLocalChanges=new Set,this.pendingLocalOrigins=new Set,this.dE=new Map,this.size=0,this.preSyncVisibleState=new Map,this.preSyncVirtualState=new Map,this.recentlySyncedKeys=new Set,this.hasReceivedFirstCommit=!1,this.isCommittingSyncTransactions=!1,this.bU=!1,this.syncRunGeneration=0,this.isLocalOnly=!1,this.commitPendingTransactions=()=>{if(this.bU)return;this.bU=!0;let e=!1,t;try{let n;do n=this.dG(),n.failure&&!e&&(e=!0,t=n.failure.error);while(n.processed)}finally{this.bU=!1}if(e)throw t},this.config=e,this.transactions=new CS((e,t)=>e.compareCreatedAt(t)),this.syncedData=new CS(e.compare)}setDeps(e){this.collection=e.collection,this.lifecycle=e.lifecycle,this.changes=e.changes,this.indexes=e.indexes,this.a3=e.events}ak(e,t=this){let n=!this.isLocalOnly&&(t.optimisticUpserts.has(e)||t.optimisticDeletes.has(e));return{$hasPendingWrites:n,$origin:this.isLocalOnly||n?`local`:t.rowOrigins.get(e)??`remote`,$key:e,$collectionId:this.collection.id}}et(e){let t=new Map;for(let n of e){let e=this.rowOrigins.get(n);e!==void 0&&t.set(n,e)}return t}aW(e,t){let n=e,r=n.$hasPendingWrites??t.$hasPendingWrites,i=n.$origin??t.$origin,a=n.$key??t.$key,o=n.$collectionId??t.$collectionId,s=this.dE.get(a);if(s&&s.row===e&&s.hasPendingWrites===r&&s.origin===i&&s.collectionId===o)return s.enriched;let c={...e,$hasPendingWrites:r,$origin:i,$key:a,$collectionId:o};return this.dE.set(a,{row:e,hasPendingWrites:r,origin:i,collectionId:o,enriched:c}),c}dh(){this.dE.clear(),this.rowOrigins.clear(),this.pendingLocalChanges.clear(),this.pendingLocalOrigins.clear()}enrichWithVirtualProps(e,t){return this.aW(e,this.ak(t))}*entriesPassing(e){let t=this.optimisticUpserts.size===0&&this.optimisticDeletes.size===0?this.syncedData:this.entries();for(let[n,r]of t)e(r)&&(yield[n,this.enrichWithVirtualProps(r,n)])}enrichChangeMessage(e){let{__virtualProps:t}=e,n=e.previousValue?this.aW(e.previousValue,t?.previousValue??this.ak(e.key)):void 0,r=this.aW(e.value,t?.value??this.ak(e.key));return e.type===`delete`&&this.dE.delete(e.key),{key:e.key,type:e.type,value:r,previousValue:n,metadata:e.metadata}}getWithVirtualProps(e){let t=this.get(e);if(t!==void 0)return this.enrichWithVirtualProps(t,e)}get(e,t=this.optimisticUpserts,n=this.optimisticDeletes){if(!n.has(e))return t.get(e)??this.syncedData.get(e)}has(e){let{optimisticDeletes:t,optimisticUpserts:n,syncedData:r}=this;return t.has(e)?!1:n.has(e)||r.has(e)}*keys(){let{syncedData:e,optimisticDeletes:t,optimisticUpserts:n}=this;for(let n of e.keys())t.has(n)||(yield n);for(let r of n.keys())!e.has(r)&&!t.has(r)&&(yield r)}*values(){for(let e of this.keys()){let t=this.get(e);t!==void 0&&(yield t)}}*entries(){for(let e of this.keys()){let t=this.get(e);t!==void 0&&(yield[e,t])}}[Symbol.iterator](){return this.entries()}forEach(e){let t=0;for(let[n,r]of this.entries())e(r,n,t++)}map(e){let t=[],n=0;for(let[r,i]of this.entries())t.push(e(i,r,n++));return t}setDeferredSyncKeys(e,t=()=>[]){this.bf=e,this.getStagedSyncTransactions=t}recomputeOptimisticState(e=!1){if(this.isCommittingSyncTransactions&&!e)return;let t=new Map(this.optimisticUpserts),n=new Set(this.optimisticDeletes),r=this.rowOrigins,i=new Set;for(let e of this.pendingSyncedTransactions)if(e.committed)for(let t of e.operations)i.add(t.key);let a=e=>i.has(e)||this.bf(e);for(let e of this.transactions.values())if(e.state===`completed`)for(let t of e.mutations){if(t.collection!==this.collection||!a(t.key)||(this.pendingLocalOrigins.add(t.key),!t.optimistic))continue;let n=this.heldOptimisticRows.get(t.key);n&&n.owner.compareCreatedAt(e)>0||this.heldOptimisticRows.set(t.key,{owner:e,row:t.type===`delete`?void 0:t.modified})}this.optimisticUpserts.clear(),this.optimisticDeletes.clear(),this.pendingLocalChanges.clear(),this.c7(a),this.size=this.e1();let o=[];this.ey(t,n,r,o);let s=e?o:o.filter(e=>!this.recentlySyncedKeys.has(e.key));s.length>0&&this.indexes.updateIndexes(s),this.changes.emitEvents(s,e)}trackTransaction(e){let t=this.transactions.get(e.id);if(t===e)return!1;if(t&&t.state!==`completed`&&t.state!==`failed`)throw new Uv(e.id);return this.transactions.set(e.id,e),e.collections.add(this.collection),!0}c7(e){if(e){for(let t of this.heldOptimisticRows.keys())e(t)||this.heldOptimisticRows.delete(t);for(let t of this.pendingLocalOrigins)e(t)||this.pendingLocalOrigins.delete(t)}for(let[e,{row:t}]of this.heldOptimisticRows)t===void 0?this.optimisticDeletes.add(e):this.optimisticUpserts.set(e,t);this.gl()}gl(){for(let[e,t]of this.transactions)if(t.state===`completed`||t.state===`failed`)this.transactions.delete(e,!0);else if(!this.lifecycle.hasStartedCleanup())for(let e of t.mutations)e.collection===this.collection&&(this.pendingLocalChanges.add(e.key),e.optimistic&&(e.type===`delete`?(this.optimisticUpserts.delete(e.key),this.optimisticDeletes.add(e.key)):(this.optimisticUpserts.set(e.key,e.modified),this.optimisticDeletes.delete(e.key))))}e1(){let e=this.syncedData.size;for(let t of this.optimisticDeletes)this.syncedData.has(t)&&!this.optimisticUpserts.has(t)&&e--;for(let t of this.optimisticUpserts.keys())this.syncedData.has(t)||e++;return e}ey(e,t,n,r){let i=new Set([...e.keys(),...this.optimisticUpserts.keys(),...t,...this.optimisticDeletes]);for(let a of i){let i=this.get(a),o=this.get(a,e,t),s=this.ak(a,{rowOrigins:n,optimisticUpserts:e,optimisticDeletes:t}),c=this.ak(a);o!==void 0&&i===void 0?r.push({type:`delete`,key:a,value:o,__virtualProps:{value:s}}):o===void 0&&i!==void 0?r.push({type:`insert`,key:a,value:i,__virtualProps:{value:c}}):o===void 0||i===void 0||Jy(o,i)&&s.$origin===c.$origin&&s.$hasPendingWrites===c.$hasPendingWrites||r.push({type:`update`,key:a,value:i,previousValue:o,__virtualProps:{value:c,previousValue:s}})}}createSyncedKeyLookup(){if(this.pendingSyncedTransactions.length===0)return e=>this.syncedData.has(e);let e=new Map,t=!1;for(let n of this.pendingSyncedTransactions)if(n.committed){n.truncate&&(e.clear(),t=!0);for(let t of n.operations)e.set(t.key,t.type!==`delete`)}return n=>e.get(n)??(!t&&this.syncedData.has(n))}enableHydrationAuthorityTracking(){this.appliedAdapterKeys??=new Map}bj(e,t){let n=e.states.get(t);return n===void 0?e.truncated?{exists:!1,value:void 0}:{exists:this.syncedData.has(t),value:this.syncedData.get(t)}:n}getAcceptedSyncedRow(e){return this.bj(this.a7,e).value}acceptSyncTransaction(e){let t=this.pendingSyncedTransactions,n=t.indexOf(e);n!==-1&&t.splice(n,1);let r=t.findIndex(e=>!e.committed),i=r===-1?t.length:r;t.splice(i,0,e),i!==n&&this.refreshPendingSyncedProjection(),this.commitPendingTransactions()}discardOpenSyncTransactions(){let e=this.pendingSyncedTransactions.filter(e=>e.committed);e.length!==this.pendingSyncedTransactions.length&&(this.pendingSyncedTransactions=e,this.refreshPendingSyncedProjection())}hasOpenSyncTransaction(){return this.pendingSyncedTransactions.at(-1)?.committed===!1}hasHeldSyncTransaction(){return this.pendingSyncedTransactions.some(e=>e.committed)}*acceptedSyncedEntries(){let{states:e,truncated:t}=this.a7;if(!t)for(let t of this.syncedData.entries())e.has(t[0])||(yield t);for(let[t,n]of e)n.exists&&(yield[t,n.value])}dt(e,t,n){let r=this.bj(e,t);return!r.exists||this.hydrationSeedKeys.has(t)&&!e.sourceKeys.has(t)?`insert`:r.value!==void 0&&Jy(r.value,n)?`update`:`duplicate`}b_(e){return e.type===`update`&&e.originalSyncType!==`insert`&&(this.config.sync.rowUpdateMode||`partial`)===`partial`}classifyPendingSyncedInsert(e,t){return this.dt(this.a7,e,t)}c1(e,t){let n=t.key;if(t.type===`delete`)e.states.set(n,{exists:!1,value:void 0});else if(this.b_(t)){let r=this.bj(e,n);e.states.set(n,{exists:!0,value:{...r.value,...t.value}})}else e.states.set(n,{exists:!0,value:t.value})}stagePendingSyncOperation(e,t){this.c1(this.a7,e),t||this.a7.sourceKeys.add(e.key)}dJ(e){let t=e.explicitRowMetadataWrites,n=e.rowMetadataWrites;for(let t of e.operations)n.delete(t.key);for(let[e,r]of t)n.set(e,r.write);e.operations.forEach((e,r)=>{let i=e.key;if(r<(t.get(i)?.position??0))return;let a=TS(e);a&&n.set(i,a)})}bA(){let e={states:new Map,truncated:!1,sourceKeys:new Set},t=new Set;for(let n of this.pendingSyncedTransactions){if(n.invalidationError!==void 0)continue;let r=n.committed?void 0:{states:new Map(e.states),truncated:e.truncated,sourceKeys:new Set(e.sourceKeys)};n.truncate&&(e.states=new Map,e.truncated=!0);let i;for(let r of n.operations){let a=r.key;if(!n.committed&&r.originalSyncType===`insert`&&r.type!==`delete`&&!(this.hydrationSeedKeys.has(a)&&e.sourceKeys.has(a)&&!t.has(a))){let t=this.dt(e,a,r.value);if(t===`duplicate`){i=a;break}r.type=t}this.c1(e,r),n.preserveHydrationSeedKeys?.has(a)||(e.sourceKeys.add(a),n.committed&&t.add(a))}i===void 0?n.committed||this.dJ(n):(Object.assign(e,r),n.invalidationError=n.duplicateKeyError?.(i)??new My)}this.a7=e}refreshPendingSyncedProjection(){this.bA()}hasPersistingTransaction(){for(let e of this.transactions.values())if(e.state===`persisting`)return!0;return!1}dG(){let e=this.syncRunGeneration,t=this.hasPersistingTransaction(),n=[],r=[],i=!1,a=!1,o=!1;for(let e of this.pendingSyncedTransactions)e.committed?(n.push(e),o||=e.layoutChanged,e.truncate&&(i=!0,a=e.truncateMarkReady!==!1)):r.push(e);if(n.length===0)return{processed:!1};if(!t||i){let t=o?[...this.keys()]:void 0;this.pendingSyncedTransactions=r;let s=n.reduce((e,t)=>e+t.operations.length,0)>=512;for(let e of n)e.applicationStarted=!0;this.isCommittingSyncTransactions=!0;let c=new Set,l=new Map;for(let e of n){for(let t of e.operations){let e=t.key;c.add(e),l.has(e)||l.set(e,t)}for(let[t]of e.rowMetadataWrites)c.add(t)}let u=this.et(c),d=new Map(this.optimisticUpserts),f=new Set(this.optimisticDeletes),p=this.preSyncVisibleState;if(p.size===0){p=new Map;for(let e of c){let t=this.get(e);t!==void 0&&p.set(e,t)}}let m=[],h;if(i)for(let[e,t]of this.entries())m.push({type:`delete`,key:e,value:this.aW(t,this.ak(e))});for(let e of n){if(e.truncate){this.syncedData.clear();let t=e.sourceTruncate?e.preserveHydrationSeedKeys:void 0;if(!e.preserveHydrationSeedKeys||t){for(let e of[this.syncedMetadata,this.hydrationSeedKeys,this.hydratedKeys,this.appliedAdapterKeys??new Set])for(let n of e.keys())t?.has(n)||e.delete(n);this.appliedAdapterKeys&&(this.hasAppliedAdapterTruncate=!0,this.adapterTruncateKeptKeys=new Set(t))}this.dE.clear(),this.rowOrigins.clear(),this.pendingLocalOrigins.clear();for(let e of c)p.delete(e);this.a3.emit(`truncate`,{type:`truncate`,collection:this.collection})}let t=new Set;for(let n of e.operations){let r=n.key,i=this.isLocalOnly||this.pendingLocalChanges.has(r)||this.pendingLocalOrigins.has(r)||t.has(r)?`local`:`remote`;i===`local`&&t.add(r),this.dE.delete(r),n.type===`delete`?(this.syncedData.delete(r,s),this.syncedMetadata.delete(r),this.rowOrigins.delete(r)):(this.syncedData.set(r,this.b_(n)?{...this.syncedData.get(r),...n.value}:n.value,s),this.rowOrigins.set(r,i)),this.pendingLocalChanges.delete(r),this.pendingLocalOrigins.delete(r),this.bf(r)||this.heldOptimisticRows.delete(r),e.preserveHydrationSeedKeys?.has(r)||(this.hydrationSeedKeys.delete(r),this.hydratedKeys.delete(r),n.type===`delete`?this.appliedAdapterKeys?.set(r,!0):this.appliedAdapterKeys?.get(r)&&this.appliedAdapterKeys.set(r,!1))}for(let[t,n]of e.rowMetadataWrites)!e.preserveHydrationSeedKeys?.has(t)&&!this.appliedAdapterKeys?.has(t)&&this.appliedAdapterKeys?.set(t,!1),n.type===`delete`?this.syncedMetadata.delete(t):this.syncedMetadata.set(t,n.value);for(let[t,n]of e.collectionMetadataWrites)n.type===`delete`?this.syncedCollectionMetadata.delete(t):this.syncedCollectionMetadata.set(t,n.value)}if(this.syncedData.restoreOrder(),this.refreshPendingSyncedProjection(),this.optimisticUpserts.clear(),this.optimisticDeletes.clear(),this.isCommittingSyncTransactions=!1,this.c7(),i){for(let[e,t]of this.optimisticUpserts)m.push({type:`insert`,key:e,value:t});h=new Set(this.optimisticUpserts.keys())}for(let e of c){if(h?.has(e))continue;let t=l.get(e),n=t?.type===`update`&&p.get(e)===t.value?t.previousValue:void 0,r=!i&&!d.has(e)&&!f.has(e)&&n!==void 0?n:p.get(e),a=this.get(e);if(r===void 0){if(a===void 0)continue;m.push({type:`insert`,key:e,value:a});continue}let o=this.preSyncVirtualState.get(e)??this.ak(e,{rowOrigins:u,optimisticUpserts:d,optimisticDeletes:f}),s=t=>px(t,e,this.collection.id,()=>o.$hasPendingWrites,()=>o.$origin);if(a===void 0){m.push({type:`delete`,key:e,value:s(r)});continue}let c=this.ak(e);o.$hasPendingWrites===c.$hasPendingWrites&&o.$origin===c.$origin&&Jy(r,a)||m.push({type:`update`,key:e,value:a,previousValue:s(r)})}this.size=this.e1(),m.length>0&&this.indexes.updateIndexes(m);let g,_=e=>{try{e()}catch(e){g??={error:e}}},v=t!==void 0&&(t.length!==this.size||[...this.keys()].some((e,n)=>e!==t[n])),y=!1,b=()=>{y=!0,_(()=>this.changes.emitEvents(m,!0,v))};a&&this.lifecycle.status!==`ready`&&_(()=>this.lifecycle.markReady(b)),y||b(),i&&this.lifecycle.status===`ready`&&_(()=>this.lifecycle.completeReload()),this.syncRunGeneration===e&&(this.preSyncVisibleState.clear(),this.preSyncVirtualState.clear(),Promise.resolve().then(()=>{this.syncRunGeneration===e&&this.recentlySyncedKeys.clear()}),this.hasReceivedFirstCommit=!0);for(let e of n)e.applied.resolve();return{processed:!0,failure:g}}return{processed:!1}}cancelPendingSyncedTransaction(e,t=new My){if(e.committed||this.pendingSyncedTransactions.at(-1)!==e)throw new Xv(`only the open last sync transaction can be canceled`);this.pendingSyncedTransactions.pop();let n=new Set;for(let t of e.operations)n.add(t.key);e.applied.reject(t),this.bA();let r=new Set;for(let e of this.pendingSyncedTransactions)if(e.invalidationError===void 0)for(let t of e.operations)r.add(t.key);for(let e of n)r.has(e)||(this.recentlySyncedKeys.delete(e),this.preSyncVisibleState.delete(e),this.preSyncVirtualState.delete(e));this.pendingSyncedTransactions.length===0?(this.preSyncVisibleState.clear(),this.preSyncVirtualState.clear(),this.recentlySyncedKeys.clear(),this.changes.emitEvents([],!0)):this.recomputeOptimisticState(!1)}capturePreSyncVisibleState(){if(this.pendingSyncedTransactions.length===0)return;let e=new Set;for(let t of this.pendingSyncedTransactions)if(t.committed){for(let n of t.operations)e.add(n.key);for(let n of t.rowMetadataWrites.keys())e.add(n)}for(let t of e)this.recentlySyncedKeys.add(t);for(let t of e)if(!this.preSyncVisibleState.has(t)){let e=this.get(t);this.preSyncVisibleState.set(t,e),e!==void 0&&this.preSyncVirtualState.set(t,this.ak(t))}}onTransactionStateChange(){let e=this.hasPersistingTransaction();this.changes.shouldBatchEvents=this.pendingSyncedTransactions.some(t=>t.committed&&(!e||t.truncate)),this.changes.shouldBatchEvents&&this.capturePreSyncVisibleState(),this.recomputeOptimisticState(!1)}cleanup(){this.syncRunGeneration++;for(let e of this.pendingSyncedTransactions)e.applied.reject(new My);this.syncedData.clear(),this.syncedMetadata.clear(),this.syncedCollectionMetadata.clear(),this.optimisticUpserts.clear(),this.optimisticDeletes.clear(),this.heldOptimisticRows.clear(),this.hydrationSeedKeys.clear(),this.hydratedKeys.clear(),this.appliedAdapterKeys?.clear(),this.hasAppliedAdapterTruncate=!1,this.adapterTruncateKeptKeys.clear(),this.dh(),this.isLocalOnly=!1,this.localOnlyDirectWrite=void 0,this.size=0,this.pendingSyncedTransactions=[],this.refreshPendingSyncedProjection(),this.preSyncVisibleState.clear(),this.preSyncVirtualState.clear(),this.recentlySyncedKeys.clear(),this.hasReceivedFirstCommit=!1}},DS=new class{constructor(){this.fW=new Map}fg(e){let t=this.fW.get(e);return t||(t={queue:[],jobs:new Map,dependencies:new Map},this.fW.set(e,t)),t}schedule({contextId:e,jobId:t,dependencies:n,run:r}){if(e===void 0){r();return}let i=this.fg(e);if(i.jobs.has(t)||i.queue.push(t),i.jobs.set(t,r),n){let e=new Set(n);e.delete(t),i.dependencies.set(t,e)}else i.dependencies.has(t)||i.dependencies.set(t,new Set)}flush(e){let t=this.fW.get(e);if(!t)return;let{queue:n,jobs:r,dependencies:i}=t;for(;n.length>0;){let t=!1,a=n.length;for(let e=0;e<a;e++){let e=n.shift(),a=r.get(e);if(!a){i.delete(e);continue}let o=i.get(e),s=!o;if(o){s=!0;for(let t of o)if(t!==e&&r.has(t)){s=!1;break}}s?(r.delete(e),i.delete(e),a(),t=!0):n.push(e)}if(!t)throw Error(X(161,{contextId:e}))}this.fW.delete(e)}clear(e){this.fW.delete(e)}},OS,kS;function AS(){return kS}function jS(){return OS}function MS(e){if(OS===void 0)throw e;kS??={error:e}}function NS(e){if(OS!==void 0)return e();let t=Symbol(`collection-publication`);OS=t,kS=void 0;let n,r;try{n=e(),DS.flush(t),r=AS()}catch(e){try{DS.clear(t)}catch{}let n=AS();throw n?n.error:e}finally{OS=void 0,kS=void 0}if(r)throw r.error;return n}function PS(e){let t;for(let n of e)try{n()}catch(e){t??={error:e}}if(t)throw t.error}function FS(e){queueMicrotask(()=>{throw e})}var IS=class{constructor(){this.listeners=new Map,this.e4=new WeakMap}on(e,t){this.listeners.has(e)||this.listeners.set(e,new Map);let n=this.listeners.get(e),r=t,i=n.get(r);return i||(i={},n.set(r,i)),()=>{let t=this.listeners.get(e);t?.get(r)===i&&t.delete(r)}}once(e,t){let n=()=>{},r=e=>{n(),t(e)};return this.e4.set(r,t),n=this.on(e,r),n}off(e,t){let n=this.listeners.get(e);if(n)for(let e of n.keys())(e===t||this.e4.get(e)===t)&&n.delete(e)}waitFor(e,t){return new Promise((n,r)=>{let i,a=this.on(e,e=>{i&&=(clearTimeout(i),void 0),n(e),a()});t&&(i=setTimeout(()=>{i=void 0,a(),r(Error(X(98,{event:e})))},t))})}emitInner(e,t){this.emitInnerWhile(e,t,()=>!0)}emitInnerWhile(e,t,n){let r=this.listeners.get(e);if(r)for(let[i,a]of[...r]){if(!n())break;if(this.listeners.get(e)?.get(i)===a)try{i(t)}catch(e){queueMicrotask(()=>{throw e})}}}clearListeners(){this.listeners.clear()}};function LS(e){return Gx(Jx(e),qx(e))}function RS(e,t){let n=LS(e.expression);if(t==null)return e.compareOptions.nulls===`first`?Kx(n):new Uh(!1);let r=(e.compareOptions.direction===`asc`?Vx:Ux)(e.expression,new Uh(t));return e.compareOptions.nulls===`last`?Gx(r,n):r}function zS(e,t){if(t.length!==0){if(e.length===0||t.length!==1)throw Error(X(169));return RS(e[0],t[0])}}function BS(e,t){let{expression:n}=e[0]??{};if(!n||t.length===0)return;let r=t[0];if(r==null)return LS(n);if(r instanceof Date)return Number.isFinite(r.getTime())?Wx(Hx(n,new Uh(r)),Ux(n,new Uh(new Date(r.getTime()+1)))):void 0;if(typeof r!=`object`)return Bx(n,new Uh(r))}function VS(e,t){if(e.length===0||t.length!==1)return!1;let n=t[0];return n==null?!1:n instanceof Date?Number.isFinite(n.getTime()):typeof n==`string`?e[0].compareOptions.stringSort===`lexical`:typeof n==`number`&&Number.isFinite(n)||typeof n==`bigint`||typeof n==`boolean`}var HS=e=>{try{return e instanceof Error?e:Error(String(e))}catch{return Error(X(170))}};function US(){let e,t,n=!0;return{promise:new Promise((r,i)=>{e=e=>{n=!1,r(e)},t=e=>{n=!1,i(e)}}),resolve:e,reject:t,isPending:()=>n}}function WS(e){return e===`error`||e===`crashed`}function GS(){let e=US();return e.promise.catch(()=>{}),e}function KS(e){e.abortController?.abort(),e.removeRequestAbortListener?.()}function qS(e,t,n){e?.addEventListener(`abort`,n,{once:!0});let r=()=>e?.removeEventListener(`abort`,n);t.then(r,r)}var JS=class extends IS{constructor(e,t,n){super(),this.collection=e,this.callback=t,this.options=n,this.loadedInitialState=!1,this.ej=!1,this.snapshotSent=!1,this.C=[],this.d8=new WeakMap,this.aC=new Set,this.ac=new Map,this.ad=new Map,this.fk=`ready`,this.aV=0,this.aq=new Set,this.dx=new WeakMap,this.aR=!1,this.unsubscribed=!1,this.c_=n.deferAcquisition===!0,n.onUnsubscribe&&this.on(`unsubscribed`,n.onUnsubscribe),n.onLoadSubsetError&&this.on(`loadSubset:error`,n.onLoadSubsetError),n.whereExpression&&aS(n.whereExpression,this.collection);let r=e=>{this.fj(e),this.e9(e),t(e)};this.callback=r,this.dN=n.whereExpression?bS(this.callback,n):e=>(this.callback(e),!0),this.ec=this.collection.on(`truncate`,()=>this.fC()),this.dB=this.collection._onCleanupStart(()=>{this.eE()}),this.cb=this.collection.on(`status:change`,({status:e})=>{if(e!==`loading`&&e!==`ready`)return;let t=this.collection._sync.getSyncRunGeneration(),n=this.o;this.C.some(e=>e.acquisitionState===`detached`)&&this.setStatus(`loadingSubset`),queueMicrotask(()=>{this.o===n&&this.eM(t)})})}get owner(){return this.options.owner}get status(){return this.fk}get lastError(){return this.fu}isDeferringAcquisition(){return this.c_}resumeDeferredAcquisition(){if(!this.c_||this.unsubscribed)return;let e=this.options.onResumeAcquisition?.();this.unsubscribed||(this.c_=!1,e?.(),this.collection.status!==`idle`&&this.eM(this.collection._sync.getSyncRunGeneration()))}retireSyncRun(){let e=this.g3()&&this.C.length>0;this.eE(!0,e),e&&this.fC(!0)}g3(){return this.collection.config.syncMode===`on-demand`&&!this.c_}eE(e=!1,t=!1){this.bP(),this.aR=t,e||(this.ad=new Map(this.ac)),this.aq.clear();for(let t of[...this.C])if(e&&t.acquisitionState!==`starting`||t.initialResult?.reject(new Py),KS(t.acquisition),t.acquisitionState===`starting`){let e=this.C.indexOf(t);e!==-1&&this.C.splice(e,1)}else t.acquisitionState=`detached`,t.acquisition={options:t.requestOptions,syncRunGeneration:t.acquisition.syncRunGeneration};this.b9()}eM(e){if(this.unsubscribed||this.c_||!this.Z(e))return;if(WS(this.collection.status)||this.collection.config.syncMode===`on-demand`&&this.collection._sync.syncLoadSubsetFn===null){this.b9();return}let t=this.C.filter(e=>e.acquisitionState===`detached`&&!e.requestOptions.signal?.aborted);if(t.length===0){this.b9();return}if(this.collection.config.syncMode!==`on-demand`&&this.collection.status!==`ready`)return;let n=this.o,r=n?.syncRunGeneration===e,i=r?n:this.c4(e,()=>{let e=this.collection.currentStateAsChanges({optimizedOnly:!1});return new Map((e??[]).filter(e=>e.type!==`delete`).map(e=>[e.key,e.value]))});r&&(n.pendingSetups++,n.failed&&(n.completion.isPending()||(n.completion=GS()),n.currentAttempt={pendingCount:0,setupComplete:!1}));let a=i.currentAttempt;this.o=i,this.setStatus(`loadingSubset`),this.o===i&&this.cX(i,a,t)}fC(e=!1){let t=this.g3()?[...this.C]:[];if(t.length===0&&this.ad.size===0){this.dU();return}let n=this.o;n?(n.completion.isPending()||(n.completion=GS()),n.pendingSetups++,n.failures.clear(),n.unloaded.clear(),n.failed=!1,n.currentAttempt={pendingCount:0,setupComplete:!1}):(n=this.c4(this.collection._sync.getSyncRunGeneration(),()=>new Map(this.ac)),this.o=n);let r=n.currentAttempt;if(this.setStatus(`loadingSubset`),this.o===n){this.options.truncateReplayPublication&&(this.aR=!0,this.options.truncateReplayPublication.start(e));for(let e of t)e.acquisition.abortController?.abort();this.dU(),queueMicrotask(()=>{this.o===n&&(this.Z(n.syncRunGeneration)?this.cX(n,r,n.currentAttempt===r?t:[]):this.c8(n))})}}eu(e,t,n){let r=()=>this.o===e&&e.currentAttempt===t,i=()=>r()&&this.Z(e.syncRunGeneration)&&this.a4(n),a=n.initialResult,o=n.parkedParticipant;n.parkedParticipant=void 0,o&&e.pending.delete(o)&&o.attempt.pendingCount--,a&&e.completion.promise.then(a.resolve,e=>{e instanceof Py||a.reject(e)});let s=n.acquisition,c=n.acquisitionState===`active`;if(n.acquisitionState=`detached`,c&&this.releaseAcquisition(s),!i()||n.requestOptions.signal?.aborted)return;let l=this.cF(n);l.attempt=t,n.acquisition=l,n.acquisitionState=`starting`;let u=this.collection._sync.loadSubset(l.options);i()?(n.acquisitionState=`active`,this.co(u,n,l.options,!0,()=>i()&&!l.options.signal?.aborted),this.cB(e,t,n,u,l.options.signal)):(n.acquisition===l&&(n.acquisitionState=`detached`),this.releaseAcquisition(l))}ea(e,t){try{if(this.o!==e)return;if(!this.Z(e.syncRunGeneration)){this.c8(e);return}e.pending.delete(t)&&t.attempt.pendingCount--,this.bJ(e)}catch(e){queueMicrotask(()=>{throw e})}}cB(e,t,n,r,i){if(this.o!==e||e.currentAttempt!==t&&t.setupComplete&&t.pendingCount===0||!(r instanceof Promise))return;let a={demand:n,attempt:t};t.pendingCount++,e.pending.add(a);let o=()=>this.ea(e,a);return qS(i,r,()=>{e.currentAttempt===t&&e.unloaded.add(n),queueMicrotask(o)}),r.then(o,a=>{if(!i?.aborted&&this.o===e&&e.currentAttempt===t&&this.Z(e.syncRunGeneration)&&this.C.includes(n)){let t=this.cl(r,a);e.failures.set(n,t),e.failed=!0}o()}),a}dX(e){let t=this.o;if(t){t.failures.delete(e);for(let n of t.pending)n.demand===e&&(t.pending.delete(n),n.attempt.pendingCount--)}}bJ(e){if(this.o!==e||e.pendingSetups>0||e.pending.size>0)return;let t=[...e.failures].filter(([t])=>this.C.includes(t)&&!this.C.some(n=>n.replaces?.includes(t)&&!e.failures.has(n)&&!e.unloaded.has(n))).map(([,e])=>e);try{if(t.length>0)this.eP(e,t);else{if(this.gN(e,()=>this.bJ(e)))return;this.fb(e)}}finally{this.b9()}}eP(e,t){if(this.o!==e)return;let n=e.completion.isPending();if(e.completion.reject(t[0]),n&&this.options.truncateReplayPublication?.fail?.(t),!e.privateRows)return;let r=e.publicationState;this.loadedInitialState=r.loadedInitialState,this.snapshotSent=r.snapshotSent}fb(e){if(this.o===e){this.o=void 0,this.aR=!1;try{this.gy(e.privateRows)}finally{e.completion.resolve(),this.options.truncateReplayPublication?.succeed()}}}gy(e){for(let t of this.ad.keys())e?.delete(t);this.ad.clear();try{if(e){let t=this.fx(this.ac,e);t.length>0&&this.dN(t)}}finally{this.cg()}}cg(){this.aC=new Set(this.ac.keys())}eG(e){let t=this.o?.privateRows;if(!t)return!1;for(let n of e)n.type===`delete`?t.delete(n.key):t.set(n.key,n.value);return!0}fx(e,t){let n=[];for(let[r,i]of e){let e=t.get(r);e===void 0?n.push({type:`delete`,key:r,value:i}):Jy(e,i)||n.push({type:`update`,key:r,value:e,previousValue:i})}for(let[r,i]of t)e.has(r)||n.push({type:`insert`,key:r,value:i});return n}get fS(){return this.o!==void 0}b9(){this.aq.size===0&&!this.hasTruncateReplayWork&&this.setStatus(`ready`)}Z(e){return e===this.collection._sync.getSyncRunGeneration()}c8(e){this.o===e&&(this.bP(),this.ad.clear())}failReplacement(e){if(this.o)return;let t=this.c4(this.collection._sync.getSyncRunGeneration(),()=>new Map);t.pendingSetups=0,t.failed=!0,t.completion.reject(e),this.o=t,this.aR=!0}gN(e,t){let n=this.options.truncateReplayPublication?.siblingReplays();return n?.then(()=>{this.o===e&&t()}),n!==void 0}get hasTruncateReplayWork(){let e=this.o;return e!==void 0&&(e.pendingSetups>0||e.pending.size>0)}bP(){let e=this.o;e?.completion.isPending()&&e.completion.reject(new Py),this.o=void 0,this.aR=!1}dU(){this.snapshotSent=!1,this.loadedInitialState=!1}c4(e,t){return{syncRunGeneration:e,publicationState:{loadedInitialState:this.loadedInitialState,snapshotSent:this.snapshotSent},privateRows:this.options.truncateReplayPublication?void 0:t(),pending:new Set,pendingSetups:1,currentAttempt:{pendingCount:0,setupComplete:!1},failures:new Map,unloaded:new Set,failed:!1,completion:GS()}}cX(e,t,n){for(let r of n)if(this.C.includes(r)&&r.acquisition.attempt!==t&&(this.eu(e,t,r),this.o!==e||e.currentAttempt!==t))break;t.setupComplete=!0,e.pendingSetups--,this.bJ(e)}get hasPendingTruncateReplacement(){return this.aR}get hasHeldSyncTransaction(){return this.collection._hasHeldSyncTransaction()}get pendingTruncateReplacement(){let e=this.o?.completion;return e?.isPending()?e.promise:void 0}get hasFailedTruncateReplacement(){let e=this.o?.completion;return this.aR&&e!==void 0&&!e.isPending()}setOrderByIndex(e){this.orderByIndex=e}setStatus(e){if(this.unsubscribed||this.fk===e)return;let t=this.fk;this.fk=e;let n=++this.aV;if(this.emitInnerWhile(`status:change`,{type:`status:change`,subscription:this,previousStatus:t,status:e},()=>this.aV===n),this.aV!==n)return;let r=`status:${e}`;this.emitInnerWhile(r,{type:r,subscription:this,previousStatus:t,status:e},()=>this.aV===n)}co(e,t,n,r,i=()=>!0){if(!(e instanceof Promise))return;let a=this.collection._sync.getSyncRunGeneration(),o={demand:t,promise:e};r&&(this.aq.add(o),this.setStatus(`loadingSubset`));let s=()=>{r&&(this.aq.delete(o),this.Z(a)&&this.b9())};r&&qS(n.signal,e,()=>queueMicrotask(s)),e.then(s,t=>{this.Z(a)&&i()&&this.bR(n,this.cl(e,t)),s()})}cl(e,t){let n=this.dx.get(e);if(n)return n;let r=HS(t);return this.dx.set(e,r),r}cO(e){for(let t of this.aq)t.demand===e&&this.aq.delete(t);this.b9()}cF(e){if(this.collection.config.syncMode!==`on-demand`)return{options:e.requestOptions,syncRunGeneration:this.collection._sync.getSyncRunGeneration()};let t=new AbortController,n=e.requestOptions.signal,r;if(n?.aborted)t.abort(n.reason);else if(n){let e=()=>t.abort(n.reason);n.addEventListener(`abort`,e,{once:!0}),r=()=>n.removeEventListener(`abort`,e)}return{options:{...e.requestOptions,signal:t.signal},syncRunGeneration:this.collection._sync.getSyncRunGeneration(),abortController:t,removeRequestAbortListener:r}}releaseAcquisition(e){if(!e.releaseAttempted){e.releaseAttempted=!0;try{e.abortController?.abort(),this.Z(e.syncRunGeneration)&&this.collection._sync.unloadSubset(e.options)}catch(e){FS(e)}finally{e.removeRequestAbortListener?.()}}}dD(e){let t={requestOptions:e,acquisition:{options:e,syncRunGeneration:this.collection._sync.getSyncRunGeneration()},acquisitionState:`starting`},n=this.o,r=n?.currentAttempt;if(this.collection.status===`cleaned-up`||this.c_&&this.collection.config.syncMode===`on-demand`||this.collection.config.syncMode===`on-demand`&&(WS(this.collection.status)||this.collection.status!==`idle`&&this.collection._sync.syncLoadSubsetFn===null)){t.acquisitionState=`detached`,this.C.push(t);let i=US();t.initialResult=i;let a=()=>i.reject(new Py);e.signal?.addEventListener(`abort`,a,{once:!0});let o=()=>{e.signal?.removeEventListener(`abort`,a),t.initialResult=void 0};return i.promise.then(o,o),n&&r&&(t.parkedParticipant=this.cB(n,r,t,i.promise,e.signal)),{demand:t,result:i.promise,started:!1}}let i=this.cF(t);t.acquisition=i;let a=this.collection._sync.getSyncRunGeneration();this.C.push(t);let o=this.collection._sync.loadSubset(i.options);if(!this.Z(a)){let e=this.C.indexOf(t);return e!==-1&&this.C.splice(e,1),KS(i),{demand:t,result:o,started:!0}}return t.acquisitionState=`active`,this.C.includes(t)?(n&&r&&this.cB(n,r,t,o,i.options.signal),{demand:t,result:o,started:!0}):(this.releaseAcquisition(i),{demand:t,result:o,started:!0})}a4(e){return!this.unsubscribed&&this.C.includes(e)}bR(e,t,n=!1){let r=HS(t);return e.signal?.aborted&&!n||(this.fu=r,this.emitInner(`loadSubset:error`,{type:`loadSubset:error`,subscription:this,options:e,error:r})),r}emitEvents(e){if(this.unsubscribed)return!1;let t=this.d0(e);return e.length>0&&t.length===0||this.eG(t)?!1:this.dN(t)}eH(e){this.eG(e)||this.callback(e)}requestSnapshot(e){if(this.unsubscribed||e?.signal?.aborted||this.loadedInitialState)return!1;let t={where:this.options.whereExpression,optimizedOnly:e?.optimizedOnly??!1};if(e){if(`where`in e){let n=e.where;if(t.where){let e=t.where;t.where=Wx(e,n)}else t.where=n}e.boundedPrefix&&(t.orderBy=e.orderBy,t.limit=e.limit)}else this.loadedInitialState=!0;let n={...e?.refetch?{refetch:!0}:{},where:t.where,signal:e?.signal,subscription:this,orderBy:e?.orderBy,limit:e?.limit===void 0?void 0:e.limit+this.collection._optimisticOverlaySize()};e?.where&&this.d8.set(n,e.where);let{demand:r,result:i,started:a}=this.dD(n);if(!this.a4(r)||(e?.onLoadSubsetResult?.(i,r.acquisition.options,e=>this.e6(r,e)),!this.a4(r))||(a&&this.co(i,r,r.acquisition.options,e?.trackLoadSubsetPromise??!0),!this.a4(r)))return!1;let o;if(e?.onUnoptimized){if(o=this.collection.currentStateAsChanges({...t,optimizedOnly:!0}),o===void 0){if(e.onUnoptimized(),!this.a4(r))return!1;o=this.collection.currentStateAsChanges({...t,optimizedOnly:!1})}}else o=this.collection.currentStateAsChanges(t);if(!this.a4(r)||o===void 0)return!1;let s=this.o?.privateRows??this.ac,c=o.filter(e=>!this.fS&&this.ad.has(e.key)||!this.aC.has(e.key)&&!s.has(e.key));for(let e of c)this.aC.add(e.key);return this.snapshotSent=!0,this.eH(this.fS?c:this.cy(c)),!0}releaseSnapshot(...e){let t=[];for(let n of e){let e=this.C.find(e=>!t.includes(e)&&this.d7(e,n));e&&t.push(e)}t.length>0&&this.g$(t)}replaceSnapshots(e,t){let n=this.C.find(t=>this.d7(t,e));n&&(n.replaces=this.C.filter(e=>t.some(t=>this.d7(e,t))))}d7(e,t){return e.requestOptions.where===t||this.d8.get(e.requestOptions)===t}e6(e,t){try{t&&this.bR(e.acquisition.options,t.error,!0)}finally{this.C.includes(e)&&this.g$([e])}}g$(e){let t=this.o,n=[];for(let t of e){let e=t.acquisition;this.C.splice(this.C.indexOf(t),1),t.initialResult?.reject(new Py),n.push(()=>this.dX(t)),t.acquisitionState===`active`&&n.push(()=>this.releaseAcquisition(e))}PS([...n,()=>this.fm(),()=>{t&&this.bJ(t)},...e.map(e=>()=>this.cO(e))])}fm(){let e=this.o;this.C.length===0&&e&&(e.privateRows&&!e.failed?this.fb(e):this.gN(e,()=>this.fm())||(this.bP(),this.ad=new Map(this.ac),this.cg(),this.options.truncateReplayPublication?.succeed()))}readOrderedSnapshot(e){let t=[this.options.whereExpression,e.where,e.cursor?.whereFrom].filter(e=>e!==void 0),n=this.collection.currentStateAsChanges({orderBy:e.orderBy,limit:e.limit,where:t.length>0?t.reduce((e,t)=>Wx(e,t)):void 0});return Array.isArray(n)?n.filter(({key:e})=>!this.collection._hasOptimisticOverlay(e)):[]}requestLimitedSnapshot({refetch:e,orderBy:t,limit:n,minValues:r,offset:i,trackLoadSubsetPromise:a=!0,onLoadSubsetResult:o}){if(this.unsubscribed)return;if(!n)throw Error(X(96));if(!this.orderByIndex)throw Error(X(97));let s=r?zS(t,r):void 0,c=r!==void 0&&r.length>0,l=r?.[0],u=this.orderByIndex,d=this.options.whereExpression,f=d?yS(d):void 0,p=e=>{if(e!==void 0&&this.aC.has(e))return!1;let t=this.collection.get(e);return t===void 0?!1:f?.(t)??!0},m=l,h=[],g=[];if(c){let{expression:e}=t[0],r=this.collection.currentStateAsChanges({where:Bx(e,new Uh(l))});if(r){let e=r.map(e=>e.key).filter(p);g.push(...e);let t=u.take(n-g.length,l,p);g.push(...t)}else g=u.take(n,l,p)}else g=u.takeFromStart(n,p);let _=()=>Math.max(n-h.length,0),v=()=>g.length===0,y=t[0].expression,b=y.type===`ref`?ix(new Bh(Hh(y)),!0):null;for(;_()>0&&!v();){for(let e of g){let t=this.collection.get(e);h.push({type:`insert`,key:e,value:t}),m=b?b(t):t}g=u.take(_(),m,p)}for(let e of h)this.aC.add(e.key);if(this.eH(h),this.unsubscribed)return;let x;if(s&&r){let e=BS(t,r);e&&(x={whereFrom:s,whereCurrent:e})}let S=this.collection._optimisticOverlaySize(),C=i===void 0?c?void 0:n+this.aC.size+S:n+S,w={...e?{refetch:!0}:{},where:d,limit:C,orderBy:t,cursor:x,offset:i??0,subscription:this},{demand:T,result:E,started:ee}=this.dD(w);this.a4(T)&&(o?.(E,T.acquisition.options,e=>this.e6(T,e)),this.a4(T)&&(ee&&this.co(E,T,T.acquisition.options,a),this.a4(T)))}d0(e){if(e=this.cy(e),this.loadedInitialState||this.ej)return e;let t=this.fS,n=new Set,r=[];for(let i of e){let e=i;if(!(this.aC.has(i.key)||n.has(i.key))){if(i.type===`update`)e={...i,type:`insert`,previousValue:void 0},n.add(i.key);else if(i.type===`delete`){if(!t)continue}else n.add(i.key)}else if(i.type===`insert`)continue;else i.type===`delete`&&(this.aC.delete(i.key),n.delete(i.key));r.push(e)}return r}cy(e){if(this.ad.size===0)return e;let t=[];for(let n of e){let e=this.ad.get(n.key);e===void 0?t.push(n):(this.ad.delete(n.key),n.type===`delete`?t.push({...n,value:e,previousValue:void 0}):Jy(e,n.value)||t.push({...n,type:`update`,previousValue:e}))}if(this.collection.config.syncMode!==`on-demand`&&!this.fS)for(let[e,n]of this.ad)this.collection.has(e)||(this.ad.delete(e),t.push({type:`delete`,key:e,value:n}));return t}fj(e){for(let t of e)t.type===`delete`?this.ac.delete(t.key):this.ac.set(t.key,t.value)}e9(e){for(let t of e)t.type===`delete`?this.aC.delete(t.key):this.aC.add(t.key)}markAllStateAsSeen(){this.ej=!0}unsubscribe(){if(this.unsubscribed)return;this.unsubscribed=!0,this.aV++;let e=[this.ec,this.dB,this.cb];this.ec=void 0,this.dB=void 0,this.cb=void 0,PS([...e.map(e=>()=>e?.()),()=>{this.bP(),this.ad.clear();let e=this.C.filter(e=>e.acquisitionState===`active`).map(e=>e.acquisition);for(let e of this.C)e.initialResult?.reject(new Py),this.cO(e),e.acquisitionState===`starting`&&KS(e.acquisition);this.C=[];for(let t of e)this.releaseAcquisition(t)},()=>this.emitInner(`unsubscribed`,{type:`unsubscribed`,subscription:this}),()=>this.clearListeners()])}},YS=class{constructor(){this.activeSubscribersCount=0,this.acquiringSubscribersCount=0,this.changeSubscriptions=new Set,this.batchedEvents=[],this.shouldBatchEvents=!1,this.cM=new Set,this.f2=!1,this.ex=new Set,this.stateRevision=0,this.layoutRevision=0}setDeps(e){this.lifecycle=e.lifecycle,this.sync=e.sync,this.events=e.events,this.collection=e.collection,this.state=e.state}emitEmptyReadyEvent(){NS(()=>{try{PS([...this.changeSubscriptions].map(e=>()=>e.emitEvents([])))}catch(e){MS(e)}})}cK(e){return this.state.enrichChangeMessage(e)}eW(e,t){if(!e)return t;if(e.type===`insert`)return t.type===`delete`?void 0:{...t,type:`insert`,previousValue:void 0};let n=e.type===`update`?e.previousValue??e.value:e.value;return t.type===`delete`?{...t,value:n,previousValue:void 0}:{...t,type:`update`,previousValue:n}}emitEvents(e,t=!1,n=!1){if(e.length>0&&this.stateRevision++,n&&this.layoutRevision++,this.shouldBatchEvents&&!t){this.batchedEvents.push(...e.map(e=>this.cK(e)));return}let r=e;if(t){if(this.batchedEvents.length>0){let t=new Map;for(let n of[...this.batchedEvents,...e])t.set(n.key,this.eW(t.get(n.key),n));r=[...t.values()].flatMap(e=>e?[e]:[])}this.batchedEvents=[],this.shouldBatchEvents=!1}this.aN?this.aN.publications.push({changes:r,layoutChanged:n}):this.e5(r,n)}deferPublication(){let e=this.aN??={depth:0,discard:!1,stateRevision:this.stateRevision,layoutRevision:this.layoutRevision,publications:[]};e.depth++;let t=!1,n=n=>{if(t||this.aN!==e||(t=!0,e.discard||=n,--e.depth>0))return;let r=e.publications;e.publications=[],this.aN=void 0,e.discard?(this.stateRevision=e.stateRevision,this.layoutRevision=e.layoutRevision):this.e5(r.flatMap(({changes:e})=>e),r.some(({layoutChanged:e})=>e))};return{publish:()=>n(!1),discard:()=>n(!0)}}e5(e,t){if(e.length===0&&!t)return;let n=e.map(e=>this.cK(e)),r=[...this.cM],i=[...this.changeSubscriptions];NS(()=>{let t=i.map(e=>()=>e.emitEvents(n));e.length===0&&t.unshift(...r);try{PS(t)}catch(e){MS(e)}})}subscribeLayoutChanges(e){return this.cM.add(e),()=>this.cM.delete(e)}subscribeChanges(e,t={}){if(t.where&&t.whereExpression)throw Error(X(95));let{where:n,...r}=t,i=r.whereExpression;n&&(i=Q(n(Lx())));let a=r.deferAcquisition===!0;this.ei(a);let o,s={closed:!1};try{o=new JS(this.collection,e,{...r,whereExpression:i,deferAcquisition:a,onResumeAcquisition:()=>this.gA(),onUnsubscribe:()=>{s.closed=!0,this.eB(o?.isDeferringAcquisition()??!1),o&&this.changeSubscriptions.delete(o)}}),t.onStatusChange&&o.on(`status:change`,t.onStatusChange),t.includeInitialState?o.requestSnapshot({trackLoadSubsetPromise:!1,orderBy:t.orderBy,limit:t.limit,onLoadSubsetResult:t.onLoadSubsetResult}):t.includeInitialState===!1&&o.markAllStateAsSeen(),s.closed||this.changeSubscriptions.add(o)}catch(e){if(o)try{o.unsubscribe()}catch{}else this.eB(a);throw e}return o}hasSubscriberOrPreload(){return this.f2||this.acquiringSubscribersCount>0}onFirstSubscriberOrPreload(e){return this.ex.add(e),()=>this.ex.delete(e)}markSubscriberOrPreload(){if(this.f2)return;this.f2=!0;let e=[];for(let t of[...this.ex])try{t()}catch(t){e.push(t)}if(e.length)throw e[0]}gA(){return this.lifecycle.assertCanStartSync(),this.gT(),()=>this.e2(1)}gT(){let e=this.sync.getSyncRunGeneration();this.markSubscriberOrPreload(),e===this.sync.getSyncRunGeneration()&&(this.gr(),this.sync.resumeStart())}e2(e){let t=this.acquiringSubscribersCount;this.acquiringSubscribersCount+=e,this.events.emitSubscribersChange(this.acquiringSubscribersCount,t),e===1&&this.acquiringSubscribersCount>0&&this.markSubscriberOrPreload()}gr(){(this.lifecycle.status===`cleaned-up`||this.lifecycle.status===`idle`)&&this.sync.startSync()}ei(e){e||this.lifecycle.assertCanStartSync(),this.activeSubscribersCount++,this.lifecycle.cancelGCTimer();let t=!1;try{e?!this.lifecycle.isCleaningUp()&&Wy(this.collection.config)&&this.gr():this.gT(),e||(t=!0,this.e2(1))}catch(e){if(this.activeSubscribersCount--,t)try{this.e2(-1)}catch{}throw this.activeSubscribersCount===0&&this.lifecycle.startGCTimer(),e}}eB(e){if(this.activeSubscribersCount--,this.activeSubscribersCount===0)this.lifecycle.startGCTimer();else if(this.activeSubscribersCount<0)throw new Cv;e||this.e2(-1)}cleanup(){this.f2=[...this.changeSubscriptions].some(e=>!e.isDeferringAcquisition()),this.stateRevision++,this.batchedEvents=[],this.shouldBatchEvents=!1,this.aN&&(this.aN.publications.length=0),this.aN=void 0}},XS=e=>setTimeout(()=>{e({didTimeout:!0,timeRemaining:()=>50})},0),ZS=e=>{clearTimeout(e)},QS=typeof window<`u`&&`requestIdleCallback`in window?(e,t)=>window.requestIdleCallback(e,t):(e,t)=>XS(e),$S=typeof window<`u`&&`cancelIdleCallback`in window?e=>window.cancelIdleCallback(e):ZS,eC=()=>globalThis.performance?.now()??Date.now(),tC=class e{constructor(){this.tasks=new Map,this.timeoutId=null,this.dm=!1}static getInstance(){return e.fY??=new e}schedule(e,t,n){let r=eC()+t;this.tasks.set(e,{executeAt:r,callback:n}),this.dm||(this.dm=!0,Promise.resolve().then(()=>{this.dm=!1,this.fa()}))}cancel(e){this.tasks.delete(e),this.tasks.size===0&&this.timeoutId!==null&&(clearTimeout(this.timeoutId),this.timeoutId=null)}fa(){if(this.timeoutId!==null&&(clearTimeout(this.timeoutId),this.timeoutId=null),this.tasks.size===0)return;let e=1/0;for(let t of this.tasks.values())t.executeAt<e&&(e=t.executeAt);let t=Math.max(0,e-eC());this.timeoutId=setTimeout(()=>{this.timeoutId=null;let e=eC();for(let[t,n]of this.tasks.entries())if(e>=n.executeAt){this.tasks.delete(t);try{n.callback()}catch(e){console.error(X(214),e)}}this.fa()},t),typeof this.timeoutId==`object`&&this.timeoutId.unref()}};tC.fY=null;var nC=tC,rC=class{constructor(e,t,n=()=>{}){this.status=`idle`,this.hasBeenReady=!1,this.hasReceivedFirstCommit=!1,this.onFirstReadyCallbacks=[],this.aI=null,this.failureReason=null,this.a6=!1,this.dk=null,this.cc=null,this.cE=new iC,this.bw=!1,this.bI=!1,this.g2=!1,this.aP=0,this.aV=0,this.dr=!1,this.b5=null,this.bO=new Set,this.config=e,this.id=t,this.fX=n}setDeps(e){this.indexes=e.indexes,this.events=e.events,this.changes=e.changes,this.sync=e.sync,this.state=e.state}validateStatusTransition(e,t){if(e!==t&&!{idle:[`loading`,`error`,`crashed`,`cleaned-up`],loading:[`ready`,`error`,`crashed`,`cleaned-up`],ready:[`cleaned-up`,`crashed`],error:[`cleaned-up`,`idle`,`crashed`],crashed:[`cleaned-up`],"cleaned-up":[`loading`,`error`,`crashed`]}[e].includes(t)&&!(this.g2&&e===`error`&&t===`ready`))throw new xv(e,t,this.id)}setStatus(e,t=!1,n){if(e===`ready`&&!t)throw new gv(X(208));this.validateStatusTransition(this.status,e),e===`loading`&&(this.b5=null);let r=++this.aV,i=this.status;this.status=e,n?.();let a=()=>this.aV===r;this.events.emitStatusChange(e,i,a),a()&&this.events.emitHealthChange()}validateCollectionUsable(e){switch(this.status){case`error`:case`crashed`:throw new _v(e,this.id);case`cleaned-up`:this.sync.startSync()}}markReady(e){if(this.status===`crashed`||this.bI)return;if(this.b6){this.completeReload(e);return}let t=this.d_(e);if(t){if(this.gn)this.gn(t);else throw t.error}}deferReadyFailures(){let e;return this.gn=t=>{e??=t},()=>(this.gn=void 0,e)}d_(e){if(this.validateStatusTransition(this.status,`ready`),this.status===`loading`||this.status===`error`){let t=this.aV+1;if(this.setStatus(`ready`,!0,e),this.status!==`ready`||this.aV!==t)return;let n=[];this.hasBeenReady||(this.hasBeenReady=!0,this.hasReceivedFirstCommit=!0,n.push(...this.onFirstReadyCallbacks),this.onFirstReadyCallbacks=[]),n.push(()=>this.changes.emitEmptyReadyEvent());try{PS(n)}catch(e){return{error:e}}}}fail(e){if(this.status===`crashed`||this.bI)return;this.bI=!0;let t=this.b6;this.b6=void 0,this.status===`ready`?(this.failureReason=null,this.dk=aC([sC(e)]),this.events.emitHealthChange()):t&&this.status===`error`?(this.cc=aC([sC(e)]),this.events.emitHealthChange()):(this.validateStatusTransition(this.status,`error`),this.cc=aC([sC(e)]),this.setStatus(`error`)),t?.reject(e)}get stoppedThisRun(){return this.bI}get inFirstLoad(){return this.status===`loading`||this.reloading&&this.status===`error`}get reloading(){return this.b6!==void 0}beginReload(){if(this.b6)return this.b6.promise;let e=US();return e.promise.catch(()=>void 0),this.b6=e,this.a6=!1,this.bw=!1,this.bI=!1,this.events.emitHealthChange(),e.promise}completeReload(e){let t=this.b6;if(t){if(this.b6=void 0,this.a6||(this.failureReason=null),this.dk=null,this.bw||(this.cE=new iC),this.status===`ready`)this.events.emitHealthChange();else{this.cc=null,this.g2=!0;try{this.markReady(e)}catch(e){throw this.status===`ready`?t.resolve():t.reject(e),e}finally{this.g2=!1}}t.resolve()}}retireSubscriptionDemand(){for(let e of[...this.changes.changeSubscriptions])e.retireSyncRun()}abandonReload(e){this.g8(e)&&this.status!==`cleaned-up`&&this.events.emitHealthChange()}g8(e){let t=this.b6;return t?(this.b6=void 0,t.reject(e),!0):!1}crash(e){this.status!==`crashed`&&(this.validateStatusTransition(this.status,`crashed`),this.g8(e),this.cc=aC([sC(e)]),this.setStatus(`crashed`))}get problems(){let e=WS(this.status)?this.cc:this.dk??this.cE.problem;return{failureReason:e?null:this.failureReason,error:e}}get statusProblem(){return WS(this.status)?this.cc:null}reportError(e){if(this.status===`crashed`)return;this.d4(`reportError`),this.g5(`reportError`);let t=this.reloading&&!this.a6?[]:this.failureReason?.errors??[];t.some(t=>t.cause===e)||(this.failureReason=aC([...t,sC(e)]),this.a6=this.reloading,this.events.emitHealthChange())}reportHealthy(e){if(this.status===`crashed`)return;this.d4(`reportHealthy`),this.g5(`reportHealthy`);let t=this.failureReason?.errors??[],n=e===void 0?[]:t.filter(t=>t.cause!==e);n.length!==t.length&&(this.failureReason=n.length>0?aC(n):null,this.events.emitHealthChange())}reportRequestError(e,t){this.reloading&&!this.bw&&(this.cE=new iC,this.bw=!0),this.cE.fail(e,t)&&this.events.emitHealthChange()}clearRequestError(e){this.cE.settle(e)&&this.events.emitHealthChange()}d4(e){if(this.bI)throw new gv(X(259,{operation:e,id:this.id}))}g5(e){if(this.status!==`ready`)throw new gv(X(257,{operation:e,id:this.id,status:this.status}))}getSyncError(){return this.cc?.cause}hasStartedCleanup(){return this.dr||this.status===`cleaned-up`}assertCanStartSync(){if(this.dr)throw new gv(X(209,{id:this.id}))}isCleaningUp(){return this.dr}onCleanupStart(e){if(this.bO.add(e),this.dr)try{e()}catch(t){throw this.bO.delete(e),t}return()=>this.bO.delete(e)}startGCTimerIfUnsubscribed(){this.aP=eC()+50,this.startGCTimer(!0)}dA(){return!this.dr&&this.changes.activeSubscribersCount===0&&!this.sync.hasPendingPreload&&!this.state.hasPersistingTransaction()}startGCTimer(e=!1){if(e||(this.aP=0),this.status===`idle`||this.status===`cleaned-up`||(this.cancelGCTimer(),!this.dA()))return;let t=this.config.gcTime??3e5;t<=0||!Number.isFinite(t)||nC.getInstance().schedule(this,Math.max(t,this.aP-eC()),()=>{this.dA()&&this.eg()})}cancelGCTimer(){nC.getInstance().cancel(this),this.aI!==null&&($S(this.aI),this.aI=null)}eg(){this.aI!==null&&$S(this.aI),this.aI=QS(e=>{if(this.dA()){if(!(e.timeRemaining()>0||e.didTimeout)){this.eg();return}this.fe().catch(()=>void 0)}this.aI=null},{timeout:1e3})}fe(){if(this.b5)return this.b5;let e=US();this.b5=e.promise,this.dr=!0;let t=[],n,r=!0,i=e=>{try{e()}catch(e){t.push(e)}};for(let e of[...this.bO])i(e);let a=n=>{this.dr=!1,this.cc=null,i(()=>this.setStatus(`cleaned-up`)),this.changes.activeSubscribersCount===0&&i(()=>this.events.cleanup());let r=n?[n.error,...t]:t,a=r.length===0?void 0:{error:r.length===1?r[0]:AggregateError(r,X(173,{syncFailure:n!==void 0}),{cause:r[0]})};Promise.resolve().then(()=>Promise.resolve()).then(()=>{this.b5===e.promise&&(this.b5=null),a?e.reject(a.error):e.resolve()})};i(()=>this.fX());try{r=this.sync.cleanup(a)}catch(e){n={error:e}}i(()=>this.state.cleanup()),i(()=>this.changes.cleanup()),i(()=>this.indexes.cleanup()),this.hasBeenReady=!1;let o=this.problems,s=this.reloading;this.bI=!1,this.failureReason=null,this.dk=null,this.cE=new iC,this.abandonReload(new Ny);let c=this.problems;return s||o.error===c.error&&o.failureReason===c.failureReason||this.events.emitHealthChange(),this.onFirstReadyCallbacks=[],r&&a(n),e.promise}onFirstReady(e){return this.hasBeenReady?(e(),()=>{}):(this.onFirstReadyCallbacks.push(e),()=>{let t=this.onFirstReadyCallbacks.indexOf(e);t!==-1&&this.onFirstReadyCallbacks.splice(t,1)})}cleanup(){return this.cancelGCTimer(),this.fe()}},iC=class{constructor(){this.failed=new Map,this.open=new Map,this.problem=null}fail(e,t){let n=!1;for(let e of t){let t=this.open.get(e);t?t.requests++:(this.open.set(e,{failure:sC(e),requests:1}),n=!0)}return n=this.release(e)||n,this.failed.set(e,t),n&&this.hd()}settle(e){return this.release(e)&&this.hd()}release(e){let t=!1;for(let n of this.failed.get(e)??[]){let e=this.open.get(n);--e.requests===0&&(t=this.open.delete(n))}return this.failed.delete(e),t}hd(){let e=Array.from(this.open.values(),({failure:e})=>e);return this.problem=e.length>0?aC(e):null,!0}};function aC(e){let t=e[e.length-1];return oC({...t,errors:e},t.cause)}function oC(e,t){return Object.defineProperty(e,"cause",{value:t,enumerable:!1})}function sC(e){let t=`Error`,n=`Collection is in an error state`,r;try{e instanceof Error?(t=e.name,n=e.message):e!==void 0&&(n=String(e)),r=e?.code}catch{}return oC({name:t,message:n,...typeof r==`string`?{code:r}:{},at:Date.now()},e)}var cC=Symbol(`tanstack-db.sync-receipt.accepted`);function lC(e,t){return e[cC]=t,e}function uC(e){return e===!0?!0:e[cC]??e}var dC=Symbol();function fC(e,t){let n=Object.keys(e);return n.length===Object.keys(t).length&&n.every(n=>Object.is(e[n],t[n]))}var pC=class{constructor(e,t){this.preloadPromise=null,this.syncCleanupFn=null,this.syncLoadSubsetFn=null,this.syncUnloadSubsetFn=null,this.aw=new Set,this.a5=new Set,this.bb=!1,this.bM=!1,this.ab=[],this.bZ=0,this.syncRunGeneration=0,this.bg=!1,this.cL=0,this.config=e,this.id=t,this.syncMode=e.syncMode??`eager`}setDeps(e){this.collection=e.collection,this.state=e.state,this.lifecycle=e.lifecycle,this.a3=e.events}f6(e,t,n){let r=n.value,i=this.f4??=new WeakMap;try{let a=i.get(r);if(a&&t===`update`&&!(`previousValue`in n)&&!fC(a,r))throw new qv(e);i.set(r,{...r})}catch(e){if(e instanceof qv)throw e;i.delete(r)}}du(e){let t=this.config.utils?.[Hy];return new Ov(e,this.id,{hasCustomGetKey:t?.hasCustomGetKey??!1,hasJoins:t?.hasJoins??!1,hasDistinct:t?.hasDistinct??!1})}markLayoutChange(){this.aA().layoutChanged=!0}startSync(){if(this.lifecycle.assertCanStartSync(),this.lifecycle.status!==`idle`&&this.lifecycle.status!==`cleaned-up`)return;if(this.bb){this.bM=!0;return}let e=++this.bZ;if(this.lifecycle.setStatus(`loading`),e!==this.bZ)return;let t=this.g9(e);if(t)throw t.error}reload(){let e=this.lifecycle.status;if(e===`crashed`)return Promise.reject(new yv(this.id));try{this.lifecycle.assertCanStartSync()}catch(e){return Promise.reject(e)}if(this.lifecycle.reloading)return this.lifecycle.beginReload();if(e===`idle`||e===`cleaned-up`)return this.preload();if(this.bg||this.cL>0)return Promise.reject(new bv(this.id));let t=++this.bZ,n=this.lifecycle.beginReload();if(this.retireSyncRun().catch(e=>this.lifecycle.crash(e)),this.lifecycle.retireSubscriptionDemand(),t!==this.bZ)return n;try{let e=this.g9(t);e&&FS(e.error)}catch(e){this.lifecycle.abandonReload(e)}return n}g9(e){let t=()=>e===this.bZ,n=!1,r=this.lifecycle.deferReadyFailures(),i;this.bg=!0;try{let e=mC(this.config.sync.sync({collection:this.collection,begin:e=>{if(!t())return;let n=US();n.promise.catch(()=>void 0);let r=e?.snapshot===!0;this.state.pendingSyncedTransactions.push({committed:!1,applicationStarted:!1,layoutChanged:!1,operations:[],rowMetadataWrites:new Map,explicitRowMetadataWrites:new Map,collectionMetadataWrites:new Map,applied:n,duplicateKeyError:e=>this.du(e),truncate:r,truncateMarkReady:!1}),r&&this.state.refreshPendingSyncedProjection()},write:e=>{if(!t())return;let n=this.ar();if(!n)return;let r=`key`in e?e.key:this.config.getKey(e.value);tb(r,e);let i=e.type;if(e.type===`insert`){let t=this.state.classifyPendingSyncedInsert(r,e.value);if(t===`duplicate`)throw this.du(r);i=t}`value`in e;let a={...e,type:i,key:r,originalSyncType:e.type===`insert`||e[dC]?`insert`:void 0};n.operations.push(a),this.state.stagePendingSyncOperation(a,n.preserveHydrationSeedKeys?.has(r));let o=TS(a);o&&n.rowMetadataWrites.set(r,o)},commit:e=>{if(!t())return!0;let n=this.state.pendingSyncedTransactions.at(-1);if(!n)throw new Jv;if(n.committed)throw new Yv;return e?.aborted||n.invalidationError!==void 0?(this.state.cancelPendingSyncedTransaction(n,e?.aborted?void 0:n.invalidationError),n.applied.promise):(n.committed=!0,this.state.acceptSyncTransaction(n),!n.applied.isPending()||lC(n.applied.promise,!0))},markReady:()=>{t()&&this.lifecycle.markReady()},fail:e=>{t()&&this.lifecycle.fail(e)},reportError:e=>{t()&&this.lifecycle.reportError(e)},reportHealthy:e=>{t()&&this.lifecycle.reportHealthy(e)},truncate:e=>{if(!t())return;let n=this.ar();n&&(n.operations=[],n.rowMetadataWrites.clear(),n.explicitRowMetadataWrites.clear(),n.truncate=!0,n.truncateMarkReady=e?.markReady??!0,this.state.refreshPendingSyncedProjection())},invalidateLoadedSubsets:()=>{t()&&!n&&(n=!0,queueMicrotask(()=>{n=!1,t()&&this.a3.emit(`loadedSubsets:invalidated`,{type:`loadedSubsets:invalidated`,collection:this.collection})}))},metadata:this.eT(t)}));if(this.bg=!1,i=r(),!t())return e?.cleanup&&this.dW(e.cleanup),this.ck(),i;if(this.syncCleanupFn=e?.cleanup??null,this.syncLoadSubsetFn=e?.loadSubset??null,this.syncUnloadSubsetFn=e?.unloadSubset??null,this.syncMode===`on-demand`&&!this.syncLoadSubsetFn)throw new uv(X(210,{id:this.id}));this.lifecycle.startGCTimerIfUnsubscribed()}catch(e){throw this.bg=!1,this.ck(),r(),t()&&!this.lifecycle.stoppedThisRun&&this.lifecycle.crash(e),e}return i}deferStart(){return this.lifecycle.status!==`idle`&&this.lifecycle.status!==`cleaned-up`?!1:(this.bb=!0,!0)}resumeStart(){if(!this.bb)return;this.bb=!1;let e=this.bM||this.ab.length>0;this.bM=!1;let t=this.ab;this.ab=[];let n=this.syncRunGeneration;try{e&&this.startSync()}catch(e){for(let{deferred:n}of t)n.reject(e);throw e}for(let{options:e,deferred:r}of t){let t=this.syncLoadSubsetFn;try{if(n!==this.syncRunGeneration||e.signal?.aborted)throw new Py;let i=!t||this.g_(t,e);i instanceof Promise?i.then(e=>r.resolve(e),e=>r.reject(e)):r.resolve(void 0)}catch(e){r.reject(e)}}}aA(){let e=this.state.pendingSyncedTransactions.at(-1);if(!e)throw new Gv;if(e.committed)throw new Kv;return e}ar(){let e=this.aA();return e.invalidationError===void 0?e:void 0}a8(e,t){let n=this.aA();n.explicitRowMetadataWrites.set(e,{position:n.operations.length,write:t}),n.rowMetadataWrites.set(e,t)}eT(e){return{persistence:null,row:{get:t=>{if(!e())return;let n=this.state.pendingSyncedTransactions;for(let e=n.length-1;e>=0;e--){let r=n[e];if(r.invalidationError!==void 0)continue;let i=r.rowMetadataWrites.get(t);if(i)return i.type===`delete`?void 0:i.value;if(wS(r,t))return}return this.state.syncedMetadata.get(t)},set:(t,n)=>{e()&&this.a8(t,{type:`set`,value:n})},delete:t=>{e()&&this.a8(t,{type:`delete`})}},collection:{get:t=>{if(!e())return;let n=this.state.pendingSyncedTransactions;for(let e=n.length-1;e>=0;e--){let r=n[e];if(r.invalidationError!==void 0)continue;let i=r.collectionMetadataWrites.get(t);if(i)return i.type===`delete`?void 0:i.value}return this.state.syncedCollectionMetadata.get(t)},set:(t,n)=>{e()&&this.aA().collectionMetadataWrites.set(t,{type:`set`,value:n})},delete:t=>{e()&&this.aA().collectionMetadataWrites.set(t,{type:`delete`})},list:t=>{if(!e())return[];let n=new Map(this.state.syncedCollectionMetadata);for(let e of this.state.pendingSyncedTransactions)if(e.invalidationError===void 0)for(let[t,r]of e.collectionMetadataWrites)r.type===`delete`?n.delete(t):n.set(t,r.value);return Array.from(n.entries()).filter(([e])=>!t||e.startsWith(t)).map(([e,t])=>({key:e,value:t}))}}}}get hasPendingPreload(){return this.cW!==void 0}preload(){try{this.lifecycle.assertCanStartSync(),this.bb&&this.resumeStart()}catch(e){return Promise.reject(e)}if(this.lifecycle.status===`ready`&&(this.lifecycle.cancelGCTimer(),this.lifecycle.startGCTimerIfUnsubscribed()),this.preloadPromise)return this.preloadPromise;let e=new Promise((e,t)=>{if(this.lifecycle.status===`ready`){e();return}if(WS(this.lifecycle.status)){t(this.d1());return}let n=!1,r={active:!1,ready:!1},i=()=>{},a=()=>{},o=()=>{n=!0,i(),a(),this.cW===c&&(this.cW=void 0),this.lifecycle.startGCTimerIfUnsubscribed()},s=()=>{r.active?r.ready=!0:n||(o(),e())},c=e=>{n||(o(),t(e))};this.cW=c,this.lifecycle.cancelGCTimer(),a=this.lifecycle.onFirstReady(s);let l=()=>{r.active||c(this.d1())},u=this.collection.on(`status:error`,l),d=this.collection.on(`status:crashed`,l);if(i=()=>{u(),d()},this.lifecycle.status===`idle`||this.lifecycle.status===`cleaned-up`){r.active=!0;let e;try{this.startSync()}catch(t){e={error:t}}finally{r.active=!1}WS(this.collection.status)?c(this.d1()):r.ready?(e&&FS(e.error),s()):e&&c(e.error)}});return this.preloadPromise=e,e.then(void 0,()=>{this.preloadPromise===e&&(this.preloadPromise=null)}),e}d1(){let e=this.lifecycle.getSyncError();return e===void 0?new Sv:e}get isLoadingSubset(){return this.aw.size>0}beginLoadSubsetOperation(){let e=this.aa,t={pending:new Set,waiting:!1,completed:!1,hasError:!1};return this.aa=t,this.a5.add(t),{wait:()=>this.el(t),cancel:()=>{t.completed=!0,this.a5.delete(t),this.aa===t&&(this.aa=e?.completed?void 0:e)}}}el(e){return e.waiting=!0,e.pending.size===0?(this.gm(e),!e.hasError||Promise.reject(e.error)):(e.deferred=US(),e.deferred.promise)}c9(e,t,n){e.completed||(e.pending.delete(t),!n.ok&&!e.hasError&&(e.hasError=!0,e.error=n.error),!(!e.waiting||e.pending.size>0)&&queueMicrotask(()=>{e.completed||e.pending.size>0||(this.gm(e),e.hasError?e.deferred.reject(e.error):e.deferred.resolve())}))}gm(e){e.completed=!0,this.a5.delete(e),this.aa===e&&(this.aa=void 0)}gk(e){this.a3.emit(`loadingSubset:change`,{type:`loadingSubset:change`,collection:this.collection,isLoadingSubset:e,previousIsLoadingSubset:!e,loadingSubsetTransition:e?`start`:`end`})}trackLoadSubsetOperationPromise(e){let t=this.aa;t&&!t.pending.has(e)&&(t.pending.add(e),e.then(()=>this.c9(t,e,{ok:!0}),n=>this.c9(t,e,{ok:!1,error:n})))}trackLoadPromise(e){let t=this.syncRunGeneration,n=!this.isLoadingSubset;this.aw.add(e),this.trackLoadSubsetOperationPromise(e),n&&this.gk(!0);let r=()=>{if(t!==this.syncRunGeneration)return;let n=this.aw.size===1&&this.aw.has(e);this.aw.delete(e),n&&this.gk(!1)};e.then(r,r)}getSyncRunGeneration(){return this.syncRunGeneration}loadSubset(e){if(e.signal?.aborted)return Promise.reject(new Py);if(this.syncMode===`eager`)return!0;if(this.bb){this.bM=!0;let t=US();return this.ab.push({options:e,deferred:t}),this.trackLoadPromise(t.promise),t.promise}if(this.syncLoadSubsetFn){let t=this.g_(this.syncLoadSubsetFn,e);if(t instanceof Promise)return this.trackLoadPromise(t),t}return!0}g_(e,t){this.cL++;try{return e(t)}catch(e){return Promise.reject(e)}finally{this.cL--}}unloadSubset(e){this.syncMode!==`eager`&&(this.bb?this.ab=this.ab.filter(t=>t.options!==e||(t.deferred.reject(new Py),!1)):this.syncUnloadSubsetFn&&this.syncUnloadSubsetFn(e))}eC(e){let t=new jy(this.id,e);return t.cause=e,e instanceof Error&&(t.stack=e.stack),t}e3(e){if(!e)return!0;try{let t=e();return!Fb(t)||Promise.resolve(t).then(()=>void 0,e=>{throw this.eC(e)})}catch(e){throw this.eC(e)}}dW(e){let t=this.bE;if(t)try{let n=this.e3(e);n!==!0&&(t.tasks.push(n),n.catch(()=>void 0))}catch(e){t.failure??={error:e}}}ck(){let e=this.bE;if(!e)return;this.bE=void 0;let t=t=>{let n=e.failure??t;e.onSettled?.(n),n?e.completion?.reject(n.error):e.completion?.resolve()};e.tasks.length===0?t():Promise.allSettled(e.tasks).then(e=>{let n=e.find(e=>e.status===`rejected`);t(n?{error:n.reason}:void 0)})}retireSyncRun(){this.syncRunGeneration++,this.state.discardOpenSyncTransactions();let e=this.syncCleanupFn;this.syncCleanupFn=null,this.syncLoadSubsetFn=null,this.syncUnloadSubsetFn=null,this.dp();try{let t=this.e3(e);return t===!0?Promise.resolve():t}catch(e){return Promise.reject(e)}}dp(){let e=this.aw.size>0;this.aw.clear(),e&&this.gk(!1),this.aa=void 0;for(let e of this.a5)e.completed||(e.completed=!0,e.pending.clear(),e.hasError=!0,e.error=new Py,e.deferred?.reject(e.error));this.a5.clear();let t=this.ab;this.ab=[];for(let e of t)e.deferred.reject(new Py)}cleanup(e){++this.bZ,this.syncRunGeneration++,this.cW?.(new Ny);let t=this.syncCleanupFn;this.syncCleanupFn=null,this.syncLoadSubsetFn=null,this.syncUnloadSubsetFn=null;let n=!0,r;try{n=this.e3(t)}catch(e){r={error:e}}if(this.preloadPromise=null,this.bb=!1,this.bM=!1,this.dp(),this.bg){let t=e?void 0:US(),i={tasks:[],failure:r,onSettled:e,completion:t};return n!==!0&&(i.tasks.push(n),n.catch(()=>void 0)),this.bE=i,!e&&t.promise}if(r)throw r.error;return n===!0?!0:e?(n.then(()=>e(),t=>e({error:t})),!1):n}};function mC(e){if(typeof e==`function`)return{cleanup:e};if(typeof e==`object`)return e}var hC=new WeakMap,gC=1;function _C(e){if(!$y(e))return!1;let t=Object.getPrototypeOf(e);return t!==null&&t!==Object.prototype}function vC(e,t){return e===t?0:e<t?-1:1}function yC(e){let t=hC.get(e)??e.name;return{kind:`constructor`,...t?{name:t}:{}}}function bC(e){if(e==null)return e;switch(typeof e){case`string`:case`boolean`:return e;case`number`:return Number.isFinite(e)?e:null;case`bigint`:return{__type:`bigint`,value:e.toString()};case`function`:case`symbol`:return;case`undefined`:return}if(Array.isArray(e))return e.map(e=>bC(e)??null);if(_C(e))return{__type:e[Symbol.toStringTag],value:String(e)};if(e instanceof Date)return{__type:`date`,value:e.toISOString()};if(e instanceof Set)return{__type:`set`,values:Array.from(e).map(e=>bC(e)??null).sort((e,t)=>vC(xC(e),xC(t)))};if(e instanceof Map)return{__type:`map`,entries:Array.from(e.entries()).map(([e,t])=>({key:bC(e)??null,value:bC(t)??null})).sort((e,t)=>vC(xC(e.key),xC(t.key)))};if(e instanceof RegExp)return{__type:`regexp`,value:e.toString()};let t={},n=Object.entries(e).sort(([e],[t])=>vC(e,t));for(let[e,r]of n){let n=bC(r);n!==void 0&&(t[e]=n)}return Object.hasOwn(t,`__type`)?{__type:`object`,value:t}:t}function xC(e){return e===null?`null`:Array.isArray(e)?`[${e.map(xC).join(`,`)}]`:typeof e==`object`?`{${Object.keys(e).sort((e,t)=>vC(e,t)).map(t=>`${JSON.stringify(t)}:${xC(e[t])}`).join(`,`)}}`:JSON.stringify(e)}function SC(e,t,n,r,i){let a=yC(r),o=bC(t)??null,s=bC(i);return{signatureVersion:gC,signature:xC({signatureVersion:gC,expression:o,options:s??null}),indexId:e,name:n,expression:t,resolver:a,...s===void 0?{}:{options:s}}}function CC(e){if(typeof e!=`object`||!e)return e;if(Array.isArray(e))return e.map(e=>CC(e));let t={};for(let[n,r]of Object.entries(e))t[n]=CC(r);return t}function wC(e){return _C(e)?e:e instanceof Date?new Date(e.getTime()):Array.isArray(e)?e.map(wC):typeof e==`object`&&e?Object.fromEntries(Object.entries(e).map(([e,t])=>[e,wC(t)])):e}function TC(e){return wC(e)}var EC=class{constructor(){this.indexes=new Map,this.indexMetadata=new Map,this.indexCounter=0}setDeps(e){this.state=e.state,this.lifecycle=e.lifecycle,this.defaultIndexType=e.defaultIndexType,this.events=e.events}createIndex(e,t={}){this.lifecycle.validateCollectionUsable(`createIndex`);let n=++this.indexCounter,r=Q(e(Lx())),i=t.indexType??this.defaultIndexType;if(!i)throw new uv(X(207));let a=new i(n,r,t.name,t.options);a.build(this.state.entries()),this.indexes.set(n,a);let o=SC(n,r,t.name,i,t.options);return this.indexMetadata.set(n,o),this.events.emitIndexAdded(o),a}removeIndex(e){this.lifecycle.validateCollectionUsable(`removeIndex`);let t=typeof e==`number`?e:e.id,n=this.indexes.get(t);if(!n||typeof e!=`number`&&n!==e)return!1;this.indexes.delete(t);let r=this.indexMetadata.get(t);return this.indexMetadata.delete(t),r&&this.events.emitIndexRemoved(r),!0}getIndexMetadataSnapshot(){return Array.from(this.indexMetadata.values()).sort((e,t)=>e.indexId-t.indexId).map(e=>({...e,expression:TC(e.expression),resolver:{...e.resolver},...e.options===void 0?{}:{options:CC(e.options)}}))}updateIndexes(e){try{for(let t of this.indexes.values())for(let n of e)switch(n.type){case`insert`:t.add(n.key,n.value);break;case`update`:n.previousValue?t.update(n.key,n.previousValue,n.value):t.add(n.key,n.value);break;case`delete`:t.remove(n.key,n.value)}}catch(e){throw this.lifecycle.crash(e),e}}cleanup(){this.indexes.clear(),this.indexMetadata.clear()}},DC=new WeakMap;function OC(e,t,n){t===`__proto__`?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n}function kC(e){return typeof e==`object`&&e?DC.get(e)??e:e}var AC=new Set([`pop`,`push`,`shift`,`unshift`,`splice`,`sort`,`reverse`,`fill`,`copyWithin`,`set`]),jC=new Set([`entries`,`keys`,`values`,`forEach`]);function MC(e){return typeof e==`object`&&!!e&&!(e instanceof Date)&&!(e instanceof RegExp)&&!$y(e)}function NC(e,t,n,r){return function(...i){let a=e.apply(t.copy_,i);return n(t),a===t.copy_?r:a}}function PC(e,t,n,r,i){if(jC.has(e)||t===Symbol.iterator)return(...a)=>{let o=n.copy_,s=o instanceof Map;if(s&&e===`keys`)return o.keys();let c=e=>MC(e)?i(e,{tracker:n,prop:``,retainIdentity:!0}).proxy:e;if(e===`forEach`){let e=a[0];if(typeof e!=`function`)throw TypeError(X(109));return o.forEach((t,n)=>{let i=c(t);e.call(a[1],i,s?n:i,r)})}let l=o.entries(),u=e===`entries`||s&&t===Symbol.iterator;return{next(){let e=l.next();if(e.done)return e;let[t,n]=e.value,r=c(n);return{done:!1,value:u?[s?t:r,r]:r}},[Symbol.iterator](){return this}}}}function FC(e,t=new WeakMap,n=!1){if(e=kC(e),typeof e!=`object`||!e)return e;if(t.has(e))return t.get(e);if(e instanceof Date){let n=new Date(e.getTime());return t.set(e,n),n}if(e instanceof RegExp){let n=new RegExp(e.source,e.flags);return n.lastIndex=e.lastIndex,t.set(e,n),n}if(e instanceof URL){let n=new URL(e.href);return t.set(e,n),n}if(Array.isArray(e)){let r=Array(e.length);return t.set(e,r),e.forEach((e,i)=>{r[i]=FC(e,t,n)}),r}let r=Object.prototype.toString.call(e),i=r===`[object ArrayBuffer]`?ArrayBuffer:r===`[object SharedArrayBuffer]`&&typeof SharedArrayBuffer<`u`?SharedArrayBuffer:void 0;if(i){let n;try{n=Object.getOwnPropertyDescriptor(i.prototype,`byteLength`).get.call(e)}catch{}if(n!==void 0){let r=new i(n);return new Uint8Array(r).set(new Uint8Array(e)),t.set(e,r),r}}if(ArrayBuffer.isView(e)){let r=FC(e.buffer,t,n),i=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype),Symbol.toStringTag).get.call(e);if(i===void 0){let n=new DataView(r,e.byteOffset,e.byteLength);return t.set(e,n),n}let a=Object.getPrototypeOf(e).constructor,o=e.length,s=Function.prototype.toString.call(a)===Function.prototype.toString.call(globalThis[i])?new a(r,e.byteOffset,o):new a(o);return t.set(e,s),s.set(e),s}if(e instanceof Map){let r=new Map;return t.set(e,r),e.forEach((e,i)=>{r.set(i,FC(e,t,n))}),r}if(e instanceof Set){let r=new Set;return t.set(e,r),e.forEach(e=>{r.add(FC(e,t,n))}),r}if($y(e))return e;if(n){let t=Object.getPrototypeOf(e);if(t!==Object.prototype&&t!==null)return e}let a={};t.set(e,a);for(let r of Reflect.ownKeys(e))(typeof r==`symbol`||Object.prototype.propertyIsEnumerable.call(e,r))&&OC(a,r,FC(e[r],t,n));return a}function IC(e,t,n){return Zy(e,t,n,!0)}function LC(e,t){let n=new Map;function r(e,t){if(n.has(e))return n.get(e);{let r=LC(e,t);return n.set(e,r),r}}let i=t?.tracker.valueCopies??new WeakMap,a={valueCopies:i,copy_:t?i.get(e)??e:FC(e,i),originalObject:t?FC(e):e,modified:!1,assigned_:Object.create(null),parent:t,target:e};function o(e){e.modified||=!0,e.parent&&(!e.parent.retainIdentity&&e.parent.tracker.copy_[e.parent.prop]===e.copy_&&(e.parent.tracker.assigned_[e.parent.prop]=!0),o(e.parent.tracker))}function s(e){if(e.copy_ instanceof Map||e.copy_ instanceof Set)return IC(Array.from(e.copy_),Array.from(e.originalObject));for(let t in e.assigned_)if(!e.assigned_[t]||Object.hasOwn(e.copy_,t)!==Object.hasOwn(e.originalObject,t)||!IC(e.copy_[t],e.originalObject[t]))return!1;return!0}function c(e){if(s(e)){e.modified=!1,e.assigned_=Object.create(null);let t=e.parent;t&&(IC(t.tracker.copy_[t.prop],t.tracker.originalObject[t.prop])&&delete t.tracker.assigned_[t.prop],c(t.tracker))}}function l(e,t){let n=a.originalObject;return Object.hasOwn(n,e)&&IC(t,n[e])}function u(e,t){t?(delete a.assigned_[e.toString()],a.modified=!0,c(a)):(a.assigned_[e.toString()]=!0,o(a))}let d=new Proxy(a.copy_,{get(e,t,n){let s=a.copy_[t],c=Object.getOwnPropertyDescriptor(e,t);if(c?.get)return s;if(c?.configurable===!1&&!c.writable)return MC(s)&&(a.assigned_[String(t)]=!0,o(a)),s;if(typeof s==`function`){if(Object.hasOwn(e,t)||t===`constructor`)return s;let c=t.toString();if(c===`subarray`&&ArrayBuffer.isView(e))return(...t)=>r(s.apply(e,t),{tracker:a,prop:``,retainIdentity:!0}).proxy;if(AC.has(c)&&(Array.isArray(e)||ArrayBuffer.isView(e)))return NC(s,a,o,n);if(Array.isArray(e))return s.bind(n);if(e instanceof Map||e instanceof Set){let l=e=>{let t=kC(e);return typeof t==`object`&&t?i.get(t)??t:t};if(c===`has`||c===`delete`||c===`add`||c===`set`)return(...t)=>{e instanceof Set?t[0]=l(t[0]):c===`set`&&(t[1]=l(t[1]));let r=s.apply(e,t);return c!==`has`&&o(a),r===e?n:r};if(e instanceof Map&&c===`get`)return t=>{let n=e.get(t);return MC(n)?r(n,{tracker:a,prop:``,retainIdentity:!0}).proxy:n};if(c===`clear`)return NC(s,a,o,n);let u=PC(c,t,a,n,r);if(u)return u}return s.bind(e)}return MC(s)?r(s,{tracker:a,prop:String(t)}).proxy:s},set(e,t,n){if(Reflect.getOwnPropertyDescriptor(e,t)?.get)return Reflect.set(e,t,n);let r=a.copy_[t];if(!Object.hasOwn(a.copy_,t)||!IC(r,n)){let e=l(t,n);a.copy_[t]=e?FC(a.originalObject[t]):n,u(t,e)}return!0},defineProperty(e,t,n){let r=Reflect.defineProperty(e,t,n);return r&&(`value`in n||n.get||n.set)&&u(t,l(t,Reflect.get(e,t))),r},getOwnPropertyDescriptor(e,t){return Reflect.getOwnPropertyDescriptor(e,t)},preventExtensions(e){return Reflect.preventExtensions(e)},isExtensible(e){return Reflect.isExtensible(e)},deleteProperty(e,t){let n=typeof t==`symbol`?t.toString():t;if(Object.hasOwn(e,t)){let r=Object.prototype.propertyIsEnumerable.call(a.originalObject,t),i=Reflect.deleteProperty(e,t);return i&&(r?(a.assigned_[n]=!1,o(a)):(delete a.assigned_[n],a.modified=!0,c(a))),i}return!0}});return DC.set(d,a.copy_),{proxy:d,getChanges:()=>{if(!a.modified)return{};if(typeof a.copy_!=`object`||Array.isArray(a.copy_)||Object.keys(a.assigned_).length===0)return a.copy_;let e={},t=Object.keys(a.assigned_).some(e=>typeof a.copy_[e]==`object`||typeof a.originalObject[e]==`object`),n=new Map([[a.copy_,a.originalObject]]);for(let r in a.copy_){let i=a.copy_[r],o=a.originalObject[r];(a.assigned_[r]===!0||t&&!IC(i instanceof Set?Array.from(i):i,o instanceof Set?Array.from(o):o,n))&&OC(e,r,a.copy_[r])}for(let t of Object.keys(a.assigned_))a.assigned_[t]===!1&&OC(e,t,void 0);return e}}}function RC(e){let t=e.map(e=>LC(e));return{proxies:t.map(e=>e.proxy),getChanges:()=>t.map(e=>e.getChanges())}}function zC(e,t){let{proxy:n,getChanges:r}=LC(e);return t(n),FC(r(),void 0,!0)}function BC(e,t){let{proxies:n,getChanges:r}=RC(e);return t(n),FC(r(),void 0,!0)}function VC(e){let t=Object.getPrototypeOf(e);if(t!==Object.prototype&&t!==null)return!1;for(let t in e){let{value:n,get:r}=Object.getOwnPropertyDescriptor(e,t);if(r||typeof n==`object`&&n)return!1}return Object.getOwnPropertySymbols(e).length===0}function HC(e,t,n){if(!e.every(VC))return;let r=e.map(e=>({...e}));return t(n?r:r[0]),r.map((t,n)=>{let r=e[n],i={},a=!1;for(let e in t){let n=t[e],o=r[e];Object.hasOwn(r,e)&&(n===o||Object.is(n,o)||typeof o==`object`&&o&&IC(n,o))||(OC(i,e,n),typeof n==`object`&&n&&(a=!0))}for(let e in r)Object.hasOwn(t,e)||OC(i,e,void 0);return a?FC(i,void 0,!0):i})}var UC=new WeakMap;function WC(e){let t=UC.get(e);if(t)return UC.delete(e),Promise.allSettled(t).then(e=>{let t=e.find(e=>e.status===`rejected`);if(t?.status===`rejected`)throw t.reason})}var GC=new class{constructor(){this.transactions=[],this.bm=[],this.sequenceNumber=0}createTransaction(e){let t=new tw(e,this,this.sequenceNumber++);return this.transactions.push(t),t}getActiveTransaction(){return this.bm.at(-1)}getActiveTransactionForCollection(){let e=this.getActiveTransaction();if(e)return e;if(this!==GC)return GC.eJ(this)}eJ(e){let t=this.getActiveTransaction();if(!t)return;let n=JC(t);if(n===e)return t;if(n!==this)throw Error(X(162));return this.removeTransaction(t),e.transactions.push(t),e.bm.push(t),t.sequenceNumber=e.sequenceNumber++,KC.set(t,e),t}registerTransaction(e){DS.clear(e.id),this.bm.push(e)}unregisterTransaction(e,t=!1){try{DS.flush(e.id)}finally{t||this.clearTransactionContext(e)}}clearTransactionContext(e){let t=this.bm.lastIndexOf(e);t!==-1&&this.bm.splice(t,1)}removeTransaction(e){let t=this.transactions.indexOf(e);t!==-1&&this.transactions.splice(t,1)}rollbackConflictingTransactions(e,t){let n=[];for(let r of[...this.transactions])if(r!==e&&r.state===`pending`&&r.mutations.some(e=>t.has(e.globalKey)))try{r.rollback({isSecondaryRollback:!0})}catch(e){n.push(e)}if(n.length>0)throw n[0]}clear(){let e=new Set([...this.transactions.map(e=>e.id),...this.bm.map(e=>e.id)]);for(let t of e)DS.clear(t);this.transactions=[],this.bm=[]}},KC=new WeakMap,qC=new WeakMap;function JC(e){let t=KC.get(e);if(!t)throw Error(X(163));return t}function YC(e){let t=qC.get(e);if(!t)throw Error(X(164));return t}function XC(e,t){switch(t.type){case`update`:{if(e.type===`delete`)break;let n=e.type===`insert`;return{...n?e:t,original:n?{}:e.original,modified:t.modified,changes:{...e.changes,...t.changes},metadata:t.metadata??e.metadata,syncMetadata:{...e.syncMetadata,...t.syncMetadata},mutationId:t.mutationId,updatedAt:t.updatedAt}}case`delete`:return e.type===`insert`?null:t;case`insert`:{if(e.type===`insert`)return t;if(e.type!==`delete`)break;let n=e.collection._state.syncedData.get(e.key);if(n===void 0)return t;if(Jy(n,t.modified))return null;let r=t.modified,i=new Set([...Object.keys(n),...Object.keys(r)]),a={};for(let e of i)Object.hasOwn(n,e)===Object.hasOwn(r,e)&&Jy(n[e],r[e])||(a[e]=r[e]);return{...t,type:`update`,original:n,changes:a,metadata:t.metadata??e.metadata,syncMetadata:{...e.syncMetadata,...t.syncMetadata}}}}let n=`${e.type}-${t.type}`;throw Error(X(165,{combination:n}))}function ZC(e){return GC.createTransaction(e)}function QC(){return GC.getActiveTransaction()}var $C=new WeakMap;function ew(e){return $C.get(e)}var tw=class{constructor(e,t,n){if(this.collections=new Set,e.mutationFn===void 0)throw new Bv;this.id=e.id??rv(),this.mutationFn=e.mutationFn,this.state=`pending`,this.mutations=[];let r=US();$C.set(this,r),r.promise.catch(()=>void 0),this.autoCommit=e.autoCommit??!0,this.createdAt=new Date,this.sequenceNumber=n,this.metadata=e.metadata??{},KC.set(this,t),qC.set(this,t)}when(e){return ew(this).promise}completeWithoutCommit(){if(this.state!==`pending`)throw new Wv;this.setState(`completed`),ew(this).resolve(this)}setState(e){this.state=e,(e===`completed`||e===`failed`)&&JC(this).removeTransaction(this)}mutate(e){if(this.state!==`pending`)throw new Vv;let t=JC(this),n=new Set([t,YC(this)]);for(let e of n)e.registerTransaction(this);let r,i=this.gq;this.gq=()=>{i?.(),r??=[...this.mutations]};let a=!1;try{e()}catch(e){let t=r??this.mutations,i=new Set([...t,...this.mutations].map(e=>e.collection));r&&this.mutations.splice(0,this.mutations.length,...r),n.add(JC(this));for(let e of n)e.clearTransactionContext(this);a=!0;let o=[];for(let e of i)try{e._state.onTransactionStateChange()}catch(e){o.push(e)}throw o.length?AggregateError([e,...o],X(174),{cause:e}):e}finally{this.gq=i,n.add(JC(this));for(let e of n)e.unregisterTransaction(this,a)}return this.autoCommit&&this.commit().catch(()=>{}),this}applyMutations(e){this.gq?.();let t=new Map;for(let e of this.mutations)t.set(e.globalKey,e);for(let n of e){let e=n.globalKey,r=t.get(e),i=r?XC(r,n):n;i===null?t.delete(e):t.set(e,i)}this.mutations.length=0;for(let e of t.values())this.mutations.push(e)}rollback(e){let t=e?.isSecondaryRollback??!1;if(this.state===`completed`)throw new Hv;if(this.state===`failed`)return this;e?.error&&(this.error={message:e.error.message,error:e.error});let n=this.state===`persisting`;this.setState(`failed`);try{if(!t){let e=new Set(this.mutations.map(e=>e.globalKey));JC(this).rollbackConflictingTransactions(this,e)}}finally{ew(this).reject(this.error?.error),this.touchCollection(n)}return this}touchCollection(e=!1){let t=new Set(this.collections);for(let e of this.mutations)t.add(e.collection);(this.state===`completed`||this.state===`failed`)&&this.collections.clear();let n=[];for(let r of t)try{r._state.onTransactionStateChange(),e&&r._lifecycle.startGCTimer(!0),r._state.pendingSyncedTransactions.length>0&&r._state.commitPendingTransactions()}catch(e){n.push(e)}if(n.length>0)throw n[0]}async commit(){if(this.state!==`pending`)throw new Wv;if(this.setState(`persisting`),this.mutations.length>0){try{await this.mutationFn({transaction:this});let e=WC(this);e&&await e}catch(e){if(this.state!==`persisting`)return this;let t=HS(e);try{await WC(this)}catch{}this.error={message:t.message,error:t};try{this.rollback()}catch{}throw t}if(this.state!==`persisting`)return this}this.setState(`completed`);try{this.touchCollection(!0)}finally{ew(this).resolve(this)}return this}compareCreatedAt(e){let t=this.createdAt.getTime()-e.createdAt.getTime();return t===0?this.sequenceNumber-e.sequenceNumber:t}},nw,rw=0;function iw(){return nw??=rv(),`${nw}-${++rw}`}var aw=class{constructor(e,t){this.insert=(e,t)=>{this.lifecycle.validateCollectionUsable(`insert`);let n=this.state,r=this.getActiveTransaction();if(!r&&!this.config.onInsert)throw new Iv;let i=Array.isArray(e)?e:[e],a=new Date,o=[],s=new Set;i.forEach(e=>{let n=this.validateData(e,`insert`),r=this.config.getKey(n);if(s.has(r))throw new Dv(r);s.add(r);let i=this.generateGlobalKey(r,e),c={mutationId:iw(),original:{},modified:n,changes:Object.fromEntries(Object.keys(e).map(e=>[e,n[e]])),globalKey:i,key:r,metadata:t?.metadata,syncMetadata:this.config.sync.getSyncMetadata?.()||{},optimistic:t?.optimistic??!0,type:`insert`,createdAt:a,updatedAt:a,collection:this.collection};o.push(c)});let c=o.find(({key:e})=>n.has(e));if(c||(this.collection._sync.startSync(),c=o.find(({key:e})=>n.has(e)),c))throw new Dv(c.key);return r?(this.bX(r,o),r):this.cn(`insert`,e=>this.config.onInsert(e),o)},this.delete=(e,t)=>{let n=this.state;this.lifecycle.validateCollectionUsable(`delete`);let r=this.getActiveTransaction();if(!r&&!this.config.onDelete)throw new Rv;if(Array.isArray(e)&&e.length===0)throw new Nv;let i=Array.isArray(e)?e:[e];this.collection._sync.startSync();let a=new Date,o=[];for(let e of i){if(!this.state.has(e))throw new Pv(e);let r=this.generateGlobalKey(e,this.state.get(e)),i={mutationId:iw(),original:this.state.get(e),modified:this.state.get(e),changes:this.state.get(e),globalKey:r,key:e,metadata:t?.metadata,syncMetadata:n.syncedMetadata.get(e)||{},optimistic:t?.optimistic??!0,type:`delete`,createdAt:a,updatedAt:a,collection:this.collection};o.push(i)}return r?(this.bX(r,o),r):this.cn(`delete`,e=>this.config.onDelete(e),o)},this.id=t,this.config=e}setDeps(e){this.lifecycle=e.lifecycle,this.state=e.state,this.collection=e.collection}setTransactionScope(e){this.fR=e}getActiveTransaction(){return this.fR?this.fR.getActiveTransactionForCollection():QC()}createTransaction(e){return this.fR?this.fR.createTransaction(e):ZC(e)}eX(e){if(e&&`~standard`in e)return e;throw new mv}validateData(e,t,n){if(!this.config.schema)return e;let r=this.eX(this.config.schema);if(t===`update`&&n){let i=this.state.get(n);if(i&&e&&typeof e==`object`&&typeof i==`object`){let n={...i,...e},a=r[`~standard`].validate(n);if(a instanceof Promise)throw new hv;if(`issues`in a&&a.issues)throw new lv(t,a.issues.map(e=>({message:e.message,path:e.path?.map(e=>String(e))})));let o=a.value,s=Object.keys(e);return Object.fromEntries(s.map(e=>[e,o[e]]))}}let i=r[`~standard`].validate(e);if(i instanceof Promise)throw new hv;if(`issues`in i&&i.issues)throw new lv(t,i.issues.map(e=>({message:e.message,path:e.path?.map(e=>String(e))})));return i.value}generateGlobalKey(e,t){return tb(e,t),`KEY::${JSON.stringify([this.id,typeof e,String(e)])}`}f7(e,t){let n=this.state.localOnlyDirectWrite;if(!n?.types.has(t))return;for(let e of this.state.transactions.values())if(e.state===`pending`||e.state===`persisting`)return;let r=this.createTransaction({autoCommit:!1,mutationFn:()=>Promise.resolve()});r.applyMutations(e);try{n.write(e)}finally{r.completeWithoutCommit()}return r}bX(e,t){this.state.trackTransaction(e),e.applyMutations(t),this.state.recomputeOptimisticState(!0)}cn(e,t,n){let r=this.f7(n,e);if(r)return r;let i=this.createTransaction({mutationFn:async e=>await t({transaction:e.transaction,collection:this.collection})});try{this.bX(i,n)}catch(e){try{i.rollback({isSecondaryRollback:!0,error:HS(e)})}catch{}throw e}return i.commit().catch(()=>void 0),i}update(e,t,n){if(e===void 0)throw new kv;let r=this.state;this.lifecycle.validateCollectionUsable(`update`);let i=this.getActiveTransaction();if(!i&&!this.config.onUpdate)throw new Lv;let a=Array.isArray(e),o=a?e:[e];if(a&&o.length===0)throw new Av;let s=typeof t==`function`?t:n;if(typeof s!=`function`)throw TypeError();let c=typeof t==`function`?{}:t;this.collection._sync.startSync();let l=o.map(e=>{let t=this.state.get(e);if(!t)throw new jv(e);return t}),u=HC(l,s,a)??(a?BC(l,s):[zC(l[0],s)]),d=new Date,f=o.map((e,t)=>{let n=u[t];if(!n||Object.keys(n).length===0)return null;let i=l[t],a=this.validateData(n,`update`,e),o={...i,...a},s=this.config.getKey(i),f=this.config.getKey(o);if(s!==f)throw new Mv(s,f);let p=this.generateGlobalKey(f,o);return{mutationId:iw(),original:i,modified:o,changes:a===n?n:Object.fromEntries(Object.keys(n).map(e=>[e,o[e]])),globalKey:p,key:e,metadata:c.metadata,syncMetadata:r.syncedMetadata.get(e)||{},optimistic:c.optimistic??!0,type:`update`,createdAt:d,updatedAt:d,collection:this.collection}}).filter(Boolean);if(f.length===0){let e=this.createTransaction({mutationFn:async()=>{}});return e.commit().catch(()=>void 0),e}return i?(this.bX(i,f),i):this.cn(`update`,e=>this.config.onUpdate(e),f)}},ow=class extends IS{constructor(){super()}setDeps(e){this.collection=e.collection}emit(e,t){this.emitInner(e,t)}emitStatusChange(e,t,n){if(this.emitInnerWhile(`status:change`,{type:`status:change`,collection:this.collection,previousStatus:t,status:e},n),!n())return;let r=`status:${e}`;this.emitInnerWhile(r,{type:r,collection:this.collection,previousStatus:t,status:e},n)}emitHealthChange(){this.emit(`health:change`,{type:`health:change`,collection:this.collection})}emitSubscribersChange(e,t){this.emit(`subscribers:change`,{type:`subscribers:change`,collection:this.collection,previousSubscriberCount:t,subscriberCount:e})}emitIndexAdded(e){this.emit(`index:added`,{type:`index:added`,collection:this.collection,index:e})}emitIndexRemoved(e){this.emit(`index:removed`,{type:`index:removed`,collection:this.collection,index:e})}cleanup(){this.clearListeners()}},sw=new WeakMap;function cw(e,{alias:t,id:n,kind:r}={alias:`root`},i=e){let a=Ky(e),o=a?.healthSources()??[],{failureReason:s,error:c}=e._lifecycle.problems,l=o.map(t=>cw(t.collection,t,e));return lw(i,n,{alias:t,collectionId:e.id,kind:r??(a?`live-query`:`source`),status:e.status,failureReason:s,error:c,reloading:e._lifecycle.reloading,sources:l})}function lw(e,t,n){let{failureReason:r,error:i,sources:a}=n;return dw(e,t??n.alias,{...n,hasErrors:r!==null||i!==null||a.some(e=>e.hasErrors)})}function uw(e){return e.hasErrors?[...e.failureReason!==null||e.error!==null?[e]:[],...e.sources.flatMap(uw)]:[]}function dw(e,t,n){let r=sw.get(e);r||sw.set(e,r=new Map);let i=r.get(t);return i&&fw(i,n)?i:(r.set(t,n),n)}function fw(e,t){return e.collectionId===t.collectionId&&e.kind===t.kind&&e.status===t.status&&e.hasErrors===t.hasErrors&&e.failureReason===t.failureReason&&e.error===t.error&&e.reloading===t.reloading&&e.sources.length===t.sources.length&&e.sources.every((e,n)=>e===t.sources[n])}var pw=Symbol.for(`@tanstack/db.collectionSyncConfig.factory`),mw=Symbol.for(`@tanstack/db.collectionSyncConfig.cleanup`);function hw(e,t){return Object.defineProperty(e,pw,{value:t,enumerable:!0}),e}function gw(e,t,n){let r=e[pw];if(!r)return{sync:e,utilities:t};let i=Object.create(Object.getPrototypeOf(t),Object.getOwnPropertyDescriptors(t));return{sync:r(e,i,n),utilities:i}}function _w(e){let t=e[mw];t?.()}function vw(e){let t=e[ov];return yw(e,t?.())}function yw(e,t){try{return new bw(e)}catch(e){throw t?.(),e}}var bw=class{constructor(e){if(this.utils={},this.deferDataRefresh=null,this.insert=(e,t)=>this.cS.insert(e,t),this.delete=(e,t)=>this.cS.delete(e,t),!e)throw new fv;if(!e.sync)throw new pv;this.id=e.id?e.id:rv();let{sync:t,utilities:n}=gw(e.sync,e.utils??{},()=>{this._lifecycle.status===`idle`&&this._sync.startSync()});if(this.config={...e,sync:t,autoIndex:e.autoIndex??`off`,utils:n},this.utils=n,this.config.autoIndex===`eager`&&!e.defaultIndexType)throw new uv(X(206));Qg(this),this.cC=new YS,this.a3=new ow,this.dd=new EC,this._lifecycle=new rC(this.config,this.id,()=>_w(this.config.sync)),this.cS=new aw(this.config,this.id),this._state=new ES(this.config),this._sync=new pC(this.config,this.id),this.eS=xw(e),this.cC.setDeps({collection:this,lifecycle:this._lifecycle,sync:this._sync,events:this.a3,state:this._state}),this.a3.setDeps({collection:this}),this.dd.setDeps({state:this._state,lifecycle:this._lifecycle,defaultIndexType:e.defaultIndexType,events:this.a3}),this._lifecycle.setDeps({changes:this.cC,events:this.a3,indexes:this.dd,state:this._state,sync:this._sync}),this.cS.setDeps({collection:this,lifecycle:this._lifecycle,state:this._state}),this._state.setDeps({collection:this,lifecycle:this._lifecycle,changes:this.cC,indexes:this.dd,events:this.a3}),this._sync.setDeps({collection:this,state:this._state,lifecycle:this._lifecycle,events:this.a3}),e.startSync===!0&&this._sync.startSync()}get status(){return this._lifecycle.status}get health(){return cw(this)}_emitHealthChange(){this.a3.emitHealthChange()}get subscriberCount(){return this.cC.acquiringSubscribersCount}get _stateRevision(){return this.cC.stateRevision}get _layoutRevision(){return this.cC.layoutRevision}_subscribeLayoutChanges(e){return this.cC.subscribeLayoutChanges(e)}_markLayoutChange(){this._sync.markLayoutChange()}_deferPublication(){return this.cC.deferPublication()}onFirstReady(e){return this._lifecycle.onFirstReady(e)}isReady(){return this._lifecycle.status===`ready`}get isLoadingSubset(){return this._sync.isLoadingSubset}startSyncImmediate(){this._sync.startSync()}_onCleanupStart(e){return this._lifecycle.onCleanupStart(e)}_setTransactionScope(e){this.cS.setTransactionScope(e)}_hasHydratedKey(e){return this._state.hydratedKeys.has(e)}_deferSyncStart(){return this._sync.deferStart()}_resumeSyncStart(){this._sync.resumeStart()}preload(){return this.gz(()=>this._sync.preload())}gz(e){try{this._markPreload()}catch(e){return Promise.reject(e)}return e()}_markPreload(){this.cC.markSubscriberOrPreload()}_hasSubscriberOrPreload(){return this.cC.hasSubscriberOrPreload()}_onFirstSubscriberOrPreload(e){return this.cC.onFirstSubscriberOrPreload(e)}get base(){return this._state.syncedData}get(e){return this._state.getWithVirtualProps(e)}has(e){return this._state.has(e)}_optimisticOverlaySize(){return this._state.optimisticDeletes.size+this._state.optimisticUpserts.size}_hasOptimisticOverlay(e){return this._state.optimisticDeletes.has(e)||this._state.optimisticUpserts.has(e)}_hasHeldSyncTransaction(){return this._state.hasHeldSyncTransaction()}get size(){return this._state.size}*keys(){yield*this._state.keys()}*values(){for(let e of this._state.keys()){let t=this.get(e);t!==void 0&&(yield t)}}*entries(){for(let e of this._state.keys()){let t=this.get(e);t!==void 0&&(yield[e,t])}}*[Symbol.iterator](){yield*this.entries()}forEach(e){let t=0;for(let[n,r]of this.entries())e(r,n,t++)}map(e){let t=[],n=0;for(let[r,i]of this.entries())t.push(e(i,r,n++));return t}getKeyFromItem(e){return this.config.getKey(e)}createIndex(e,t={}){return this.dd.createIndex(e,t)}removeIndex(e){return this.dd.removeIndex(e)}getIndexMetadata(){return this.dd.getIndexMetadataSnapshot()}get indexes(){return this.dd.indexes}validateData(e,t,n){return this.cS.validateData(e,t,n)}get compareOptions(){return{...this.eS}}update(e,t,n){return this.cS.update(e,t,n)}get state(){let e=new Map;for(let[t,n]of this.entries())e.set(t,n);return e}stateWhenReady(){return this.preload().then(()=>this.state)}get toArray(){return Array.from(this.values())}toArrayWhenReady(){return this.preload().then(()=>this.toArray)}currentStateAsChanges(e={}){return vS(this,e,e=>this._state.entriesPassing(e))}subscribeChanges(e,t={}){return this.cC.subscribeChanges(t=>e(t),t)}on(e,t){return this.a3.on(e,t)}once(e,t){return this.a3.once(e,t)}off(e,t){this.a3.off(e,t)}waitFor(e,t){return this.a3.waitFor(e,t)}reload(){let e=Wy(this.config);return e?e.reload(this):this._sync.reload()}get subscribers(){let e=new Set;for(let t of this.cC.changeSubscriptions)e.add(t.owner??{kind:`subscription`,active:!0,end:()=>(t.unsubscribe(),Promise.resolve())});return[...e]}cleanup(e){let t=this.subscribers.filter(e=>e.kind!==`subscription`);if(!e?.dependents){let e=t.filter(e=>e.active);return e.length>0?Promise.reject(new vv(this.id,e.length)):this._lifecycle.cleanup()}let n=t.map(async e=>e.end());return Promise.allSettled([this._lifecycle.cleanup(),...n]).then(e=>{for(let t of e)if(t.status===`rejected`)throw t.reason})}};function xw(e){let t=e.defaultStringCollation;return t?t.stringSort===`lexical`?{stringSort:`lexical`}:t.stringSort===`custom`?{stringSort:`custom`,compare:t.compare}:{stringSort:`locale`,...`locale`in t&&t.locale!==void 0&&{locale:t.locale},...`localeOptions`in t&&t.localeOptions!==void 0&&{localeOptions:t.localeOptions}}:{stringSort:`locale`}}function Sw(e){return JSON.stringify(ww(e))}function Cw(e){if(e.where===void 0&&!e.orderBy?.length&&e.limit===void 0&&(e.offset===void 0||e.offset===0)&&e.cursor===void 0)return;let t=new WeakSet,n={type:`loadSubsetDemand`,query:Aw(e,`loadSubset`,t)};if(e.limit!==void 0&&(n.limit=$(e.limit,`loadSubset.limit`,t)),e.offset!==void 0&&e.offset!==0&&(n.offset=$(e.offset,`loadSubset.offset`,t)),e.cursor!==void 0){let r={whereFrom:Rw(e.cursor.whereFrom,`loadSubset.cursor.whereFrom`,t,`exact-output`),whereCurrent:Rw(e.cursor.whereCurrent,`loadSubset.cursor.whereCurrent`,t,`exact-output`)};e.cursor.lastKey!==void 0&&(r.lastKey=$(e.cursor.lastKey,`loadSubset.cursor.lastKey`,t)),n.cursor=r}return JSON.stringify(n)}function ww(e){return Dw(e,`query`,new WeakSet)}function Tw(e,t){let n=new Map,r=new Map,i=e=>{e.type===`unionFrom`?e.sources.forEach(i):e.type!==`unionAll`&&(n.has(e.alias)||n.set(e.alias,n.size),r.set(e.bindingId,n.get(e.alias)))};return i(e.from),e.join?.forEach(({from:e})=>i(e)),{bindings:n,bindingIds:r,hasUnqualifiedOutput:e.from.type===`unionAll`,parent:t}}function Ew(e,t,n){let r=e,i=0;for(;r;){let e=n===void 0?r.bindings.get(t):r.bindingIds.get(n);if(e!==void 0)return[i,e];if(r.hasUnqualifiedOutput)return;r=r.parent,i++}}function Dw(e,t,n,r){return Ow(e,t,n,Tw(e,r))}function Ow(e,t,n,r){if(e.fnSelect)throw new Vy(`${t}.fnSelect`,`function select`);if(e.fnWhere?.length)throw new Vy(`${t}.fnWhere`,`function where`);if(e.fnHaving?.length)throw new Vy(`${t}.fnHaving`,`function having`);let i={type:`query`,from:Mw(e.from,`${t}.from`,n,r)};return e.select&&(i.select=Nw(e.select,`${t}.select`,n,r)),e.select||e.from.type!==`unionFrom`&&e.join===void 0&&e.groupBy===void 0||(i.implicitOutput={type:`namespaced`,aliases:Array.from(r.bindings.keys())}),e.join&&(i.join=e.join.map((e,i)=>jw(e,`${t}.join[${i}]`,n,r))),e.where&&(i.where=kw(e.where,`${t}.where`,n,r)),e.grouping&&(i.grouping=!0),e.groupBy&&(i.groupBy=e.groupBy.map((e,i)=>Rw(e,`${t}.groupBy[${i}]`,n,`exact-output`,r))),e.having&&(i.having=kw(e.having,`${t}.having`,n,r)),e.orderBy&&(i.orderBy=e.orderBy.map((e,i)=>Iw(e,`${t}.orderBy[${i}]`,n,`ordering-operand`,r))),e.limit!==void 0&&(i.limit=$(e.limit,`${t}.limit`,n)),e.offset!==void 0&&e.offset!==0&&(i.offset=$(e.offset,`${t}.offset`,n)),e.distinct&&(i.distinct=!0),e.singleResult&&(i.singleResult=!0),i}function kw(e,t,n,r){let i=e.map((e,i)=>Fw(e,`${t}[${i}]`,n,r));return i.sort(Kw),i.filter((e,t)=>t===0||Kw(e,i[t-1])!==0)}function Aw(e,t,n){let r={type:`loadSubsetQuery`};return e.where!==void 0&&(r.where=Rw(e.where,`${t}.where`,n,`exact-output`)),e.orderBy?.length&&(r.orderBy=e.orderBy.map((e,r)=>Iw(e,`${t}.orderBy[${r}]`,n,`ordering-operand`))),r}function jw(e,t,n,r){return{type:e.type,from:Mw(e.from,`${t}.from`,n,r),on:Rw(e.on,`${t}.on`,n,`exact-output`,r)}}function Mw(e,t,n,r){return e.type===`collectionRef`||e.type===`descriptorRef`?{type:`collectionRef`,collectionId:$(e.type===`descriptorRef`?e.descriptor.id:e.collection.id,`${t}.collection.id`,n)}:e.type===`unionFrom`?{type:`unionFrom`,sources:e.sources.map((e,i)=>Mw(e,`${t}.sources[${i}]`,n,r))}:e.type===`unionAll`?{type:`unionAll`,queries:e.queries.map((e,i)=>Dw(e,`${t}.queries[${i}]`,n,r.parent))}:{type:`queryRef`,query:Dw(e.query,`${t}.query`,n,r)}}function Nw(e,t,n,r){return{type:`select`,fields:Object.keys(e).sort().map(i=>[i,Pw(e[i],`${t}.${i}`,n,r)])}}function Pw(e,t,n,r){return kh(e)?Rw(Q(e),t,n,`exact-output`,r):Xw(e)?Rw(e,t,n,`exact-output`,r):Pb(e)?Nw(e,t,n,r):Uw(e,t,n)}function Fw(e,t,n,r){if(Yw(e)){let i={type:`where`,expression:Rw(e.expression,`${t}.expression`,n,`exact-output`,r)};return e.residual===!0&&(i.residual=!0),i}return Rw(e,t,n,`exact-output`,r)}function Iw(e,t,n,r=`exact-output`,i){return{expression:Rw(e.expression,`${t}.expression`,n,r,i),compareOptions:Lw(e.compareOptions,`${t}.compareOptions`,n)}}function Lw(e,t,n){return $(ob(e),t,n)}function Rw(e,t,n,r=`exact-output`,i){if(e.type===`ref`){let r=Vh(e);if(r!==void 0){let a=Ew(i,r,e.bindingId);return a===void 0?{type:`ref`,path:e.path.map((e,r)=>$(e,`${t}.path[${r}]`,n)),sourceAlias:$(r,`${t}.sourceAlias`,n)}:{type:`ref`,path:[[`binding`,...a],...Hh(e).map((e,r)=>$(e,`${t}.path[${r+1}]`,n))]}}let a=Ew(i,e.path[0]??``,e.bindingId);return{type:`ref`,path:a===void 0?e.path.map((e,r)=>$(e,`${t}.path[${r}]`,n)):[[`binding`,...a],...e.path.slice(1).map((e,r)=>$(e,`${t}.path[${r+1}]`,n))]}}if(e.type===`val`)return{type:`val`,value:r===`equality-operand`?Ww(e.value,`${t}.value`,n,i):r===`ordering-operand`?Gw(e.value,`${t}.value`,n):Uw(e.value,`${t}.value`,n)};if(e.type===`func`){if(e.name===`in`&&e.args.length===2&&e.args[1]?.type===`val`&&Array.isArray(e.args[1].value)){let r=e.args[1].value.map((e,r)=>Ww(e,`${t}.args[1].value[${r}]`,n,i));return zw(e.name,[Rw(e.args[0],`${t}.args[0]`,n,`equality-operand`,i),{type:`val`,value:[`set`,Bw(r)]}])}let r=e.name===`eq`?`equality-operand`:e.name===`gt`||e.name===`gte`||e.name===`lt`||e.name===`lte`?`ordering-operand`:`exact-output`,a=e.args.map((e,a)=>Rw(e,`${t}.args[${a}]`,n,r,i));return zw(e.name,a)}if(e.type===`agg`)return{type:`agg`,...e.grouping?{}:{withoutOperator:!0},name:e.name,args:e.args.map((e,r)=>Rw(e,`${t}.args[${r}]`,n,`exact-output`,i))};if(e.type===`conditionalSelect`){let r={type:`conditionalSelect`,branches:e.branches.map((e,r)=>({condition:Rw(e.condition,`${t}.branches[${r}].condition`,n,`exact-output`,i),value:Pw(e.value,`${t}.branches[${r}].value`,n,i)}))};return e.defaultValue!==void 0&&(r.defaultValue=Pw(e.defaultValue,`${t}.defaultValue`,n,i)),r}let a=Tw(e.query,i),o={type:`includesSubquery`,...e.runtime?{}:{withoutOperator:!0},query:Ow(e.query,`${t}.query`,n,a),correlationField:Rw(e.correlationField,`${t}.correlationField`,n,`equality-operand`,i),childCorrelationField:Rw(e.childCorrelationField,`${t}.childCorrelationField`,n,`equality-operand`,a),fieldName:e.fieldName,materialization:e.materialization};return e.parentFilters&&(o.parentFilters=e.parentFilters.map((e,r)=>Fw(e,`${t}.parentFilters[${r}]`,n,i))),e.parentProjection&&(o.parentProjection=e.parentProjection.map((e,r)=>Rw(e,`${t}.parentProjection[${r}]`,n,`exact-output`,i))),e.scalarField!==void 0&&(o.scalarField=e.scalarField),o}function zw(e,t){return(e===`and`||e===`or`)&&t.length>0?{type:`func`,name:e,args:Bw(t.flatMap(t=>Vw(t,e)?t.args:[t]))}:e===`eq`&&t.length===2?(t.sort(Kw),{type:`func`,name:e,args:t}):(e===`gt`||e===`gte`||e===`lt`||e===`lte`)&&t.length===2&&Kw(t[0],t[1])>0?{type:`func`,name:Hw(e),args:[t[1],t[0]]}:{type:`func`,name:e,args:t}}function Bw(e){let t=e.map(e=>({key:JSON.stringify(e),value:e}));return t.sort((e,t)=>e.key<t.key?-1:+(e.key>t.key)),t.filter((e,n)=>n===0||e.key!==t[n-1].key).map(e=>e.value)}function Vw(e,t){return typeof e==`object`&&!!e&&!Array.isArray(e)&&e.type===`func`&&e.name===t&&Array.isArray(e.args)}function Hw(e){switch(e){case`gt`:return`lt`;case`gte`:return`lte`;case`lt`:return`gt`;case`lte`:return`gte`}}function $(e,t,n){if(e===null)return[`null`];if(typeof e==`string`)return[`string`,e];if(typeof e==`boolean`)return[`boolean`,e];if(typeof e==`number`)return Number.isNaN(e)?[`number`,`NaN`]:e===1/0?[`number`,`Infinity`]:e===-1/0?[`number`,`-Infinity`]:Object.is(e,-0)?[`number`,`-0`]:[`number`,e];if(e===void 0)return[`undefined`];if(typeof e==`bigint`)return[`bigint`,e.toString()];if(typeof e==`function`)throw new Vy(t,`function value`);if(typeof e==`symbol`)throw new Vy(t,`symbol value`);if(kh(e))return Rw(Q(e),t,n);if(Array.isArray(e))return Jw(e,t,n,()=>[`array`,e.map((e,r)=>$(e,`${t}[${r}]`,n))]);if(e instanceof Date){let n=e.getTime();if(Number.isNaN(n))throw new Vy(t,`invalid Date`);return[`Date`,e.toISOString()]}if(e instanceof ArrayBuffer)return[`binary`,`ArrayBuffer`,Array.from(new Uint8Array(e))];if(ArrayBuffer.isView(e))return[`binary`,e.constructor.name,Array.from(new Uint8Array(e.buffer,e.byteOffset,e.byteLength))];if(e instanceof Map)return Jw(e,t,n,()=>{let r=Array.from(e.entries(),([e,r],i)=>[$(e,`${t}.key[${i}]`,n),$(r,`${t}.value[${i}]`,n)]);return r.sort(Kw),[`Map`,r]});if(e instanceof Set)return Jw(e,t,n,()=>{let r=Array.from(e,(e,r)=>$(e,`${t}[${r}]`,n));return r.sort(Kw),[`Set`,r]});if(Pb(e))return qw(e,t,n);throw new Vy(t,`non-plain object value`)}function Uw(e,t,n){return typeof e==`object`&&e||typeof e==`function`||typeof e==`symbol`?ab(e):$(e,t,n)}function Ww(e,t,n,r){if(kh(e))return Rw(Q(e),t,n,`equality-operand`,r);if(typeof e==`number`&&Object.is(e,-0))return $(0,t,n);if(typeof Buffer<`u`&&e instanceof Buffer||e instanceof Uint8Array)return[`binary`,`Uint8Array`,Array.from(e)];let i=yb(e);return i===e?typeof e==`object`&&e||typeof e==`function`||typeof e==`symbol`?ab(e):$(e,t,n):$(i,t,n)}function Gw(e,t,n){if(typeof e==`number`&&Object.is(e,-0))return $(0,t,n);if(e instanceof Date&&Number.isNaN(e.getTime()))return $(NaN,t,n);let r=yb(e);if(r!==e&&!(e instanceof Uint8Array))return $(r,t,n);try{return $(e,t,n)}catch(t){if(t instanceof Vy&&typeof e==`object`&&e)return ab(e);throw t}}function Kw(e,t){let n=JSON.stringify(e),r=JSON.stringify(t);return n<r?-1:+(n>r)}function qw(e,t,n){return Jw(e,t,n,()=>[`object`,Object.keys(e).sort().map(r=>[r,$(e[r],`${t}.${r}`,n)])])}function Jw(e,t,n,r){if(n.has(e))throw new Vy(t,`circular value`);n.add(e);try{return r()}finally{n.delete(e)}}function Yw(e){return`expression`in e}function Xw(e){if(typeof e!=`object`||!e)return!1;let t=e.type;return t===`agg`||t===`conditionalSelect`||t===`func`||t===`ref`||t===`val`||t===`includesSubquery`}var Zw=Symbol.for(`@tanstack/db.collectionConfig.factory`);function Qw(e,t,n){return Object.defineProperty(e,Zw,{value:t,enumerable:!1}),n&&Object.defineProperty(e,ov,{value:n,enumerable:!0}),e}var $w=`@tanstack/db/sync-persistence`;function eT(e){return typeof e==`object`&&!!e}function tT(e,t,n=t){if(typeof e[t]!=`function`)throw new dv(`${n} must be a function`)}function nT(e){if(e===null)return null;if(!eT(e))throw new dv(`expected null or a complete capability object`);if(e.protocol!==`@tanstack/db/sync-persistence`)throw new dv(`protocol must be "${$w}"`);if(e.version!==1)throw new dv(`version must be 1`);if(e.managedCacheGeneration!==void 0&&typeof e.managedCacheGeneration!=`boolean`)throw new dv(`managedCacheGeneration must be a boolean`);if(e.startupCacheGenerationRotated!==void 0&&typeof e.startupCacheGenerationRotated!=`boolean`)throw new dv(`startupCacheGenerationRotated must be a boolean`);tT(e,`hydrateBaseline`),e.startScopedRecovery!==void 0&&tT(e,`startScopedRecovery`),tT(e,`reserveCommitTurn`),tT(e,`scanPersistedRows`);let t=e.resumeSnapshot;if(!eT(t))throw new dv(`resumeSnapshot must be an object`);return tT(t,`certify`,`resumeSnapshot.certify`),tT(t,`getKeySetEvidence`,`resumeSnapshot.getKeySetEvidence`),tT(t,`expectCurrentCommit`,`resumeSnapshot.expectCurrentCommit`),e}var rT=class extends cv{constructor(e){super(e),this.name=`QueryCollectionError`}},iT=class extends rT{constructor(){super(`[QueryCollection] queryKey must be provided.`),this.name=`QueryKeyRequiredError`}},aT=class extends rT{constructor(){super(`[QueryCollection] queryFn must be provided.`),this.name=`QueryFnRequiredError`}},oT=class extends rT{constructor(){super(`[QueryCollection] queryClient must be provided.`),this.name=`QueryClientRequiredError`}},sT=class extends rT{constructor(){super(`[QueryCollection] getKey must be provided.`),this.name=`GetKeyRequiredError`}},cT=class extends rT{constructor(){super(`[QueryCollection] initialData and initialDataUpdatedAt are only supported when syncMode is 'eager'. Seed or hydrate the exact Query cache key for on-demand subsets instead.`),this.name=`InitialDataInOnDemandModeError`}},lT=class extends rT{constructor(e){super(e),this.name=`InvalidQueryResultError`}},uT=class extends rT{constructor(){super(`Collection must be in 'ready' state for manual sync operations. Sync not initialized yet.`),this.name=`SyncNotInitializedError`}},dT=class extends rT{constructor(e){super(`Duplicate key '${e}' found within batch operations`),this.name=`DuplicateKeyInBatchError`}},fT=class extends rT{constructor(e){super(`Update operation: Item with key '${e}' does not exist`),this.name=`UpdateOperationItemNotFoundError`}},pT=class extends rT{constructor(e){super(`Delete operation: Item with key '${e}' does not exist`),this.name=`DeleteOperationItemNotFoundError`}},mT=new WeakMap,hT=new WeakSet;function gT(e,t){let n=Array.isArray(e)?e:[e],r=[];for(let e of n)if(e.type===`delete`){let t=Array.isArray(e.key)?e.key:[e.key];for(let e of t)r.push({type:`delete`,key:e})}else{let n=Array.isArray(e.data)?e.data:[e.data];for(let i of n){let n;if(e.type===`update`)n=t.getKey(i);else{let r=t.collection.validateData(i,e.type===`upsert`?`insert`:e.type);n=t.getKey(r)}r.push({type:e.type,key:n,data:i})}}return r}function _T(e,t){let n=new Set;for(let r of e){if(n.has(r.key))throw new dT(r.key);if(n.add(r.key),r.type===`insert`){if(t.collection._state.getAcceptedSyncedRow(r.key))throw new Ov(r.key,t.collection.id)}else if(r.type===`update`){if(!t.collection._state.getAcceptedSyncedRow(r.key))throw new fT(r.key)}else if(r.type===`delete`&&!t.collection._state.getAcceptedSyncedRow(r.key))throw new pT(r.key)}}function vT(e,t,n){let r;try{r=gT(e,t)}catch(e){return Promise.reject(e)}let i=t.reserveDirectWrite?.()??0,a=t.earlierCommits?.();if(!a)try{return yT(r,t,i)}catch(e){return Promise.reject(e)}let o=a.then(()=>{if(!n())throw new My;return yT(r,t,i)});return t.noteWaitingDirectWrite?.(o.then(()=>void 0,()=>void 0)),o}function yT(e,t,n){_T(e,t),t.claimDirectWriteKeys?.(e.map(e=>e.key),n),t.begin();for(let n of e)switch(n.type){case`insert`:{let e=t.collection.validateData(n.data,`insert`);t.write({type:`insert`,value:e});break}case`update`:{let e={...t.collection._state.getAcceptedSyncedRow(n.key),...n.data},r=t.collection.validateData(e,`update`,n.key);t.write({type:`update`,value:r});break}case`delete`:{let e=t.collection._state.getAcceptedSyncedRow(n.key);t.write({type:`delete`,value:e});break}case`upsert`:{let e=t.collection._state.getAcceptedSyncedRow(n.key)!==void 0,r=t.collection.validateData(n.data,e?`update`:`insert`,n.key);e?t.write({type:`update`,value:r}):t.write({type:`insert`,value:r});break}}let r=uC(t.commit()),i=()=>{let r=e=>e?e.map(e=>t.collection._state.getAcceptedSyncedRow(e)).filter(e=>e!==void 0):Array.from(t.collection._state.acceptedSyncedEntries(),([,e])=>e);t.updateCacheData?t.updateCacheData(r,e.map(e=>e.key),n):t.queryClient.setQueryData(t.queryKey,r())};r===!0&&i();let a=Promise.resolve(r).then(()=>{r!==!0&&i()});return a.catch(()=>void 0),a}function bT(e){function t(){let t=e();if(!t)throw new uT;return t}function n(n){let r=t(),i=mT.get(r);if(i)return i.operations.push(n),i.completion;let a=vT(n,r,()=>e()===r);return hT.add(a),a}return{writeInsert(e){return n({type:`insert`,data:e})},writeUpdate(e){return n({type:`update`,data:e})},writeDelete(e){return n({type:`delete`,key:e})},writeUpsert(e){return n({type:`upsert`,data:e})},writeBatch(n){let r=t();if(mT.get(r))throw Error(`Cannot nest writeBatch calls. Complete the current batch before starting a new one.`);let i,a,o=new Promise((e,t)=>{i=e,a=t});hT.add(o),o.catch(()=>void 0);let s={operations:[],completion:o};mT.set(r,s);try{let t=n();if(typeof t==`object`&&t&&`then`in t&&typeof t.then==`function`&&!hT.has(t))throw Promise.resolve(t).catch(()=>void 0),Error(`writeBatch does not support async callbacks. The callback must be synchronous.`);return mT.delete(r),i(s.operations.length>0?vT(s.operations,r,()=>e()===r):Promise.resolve()),o}catch(e){throw a(e),e}finally{mT.get(r)===s&&mT.delete(r)}}}}function xT(e,t){let n;try{n=e?.()}catch(e){try{t()}catch(t){throw CT(e,t)}throw e}try{t()}catch(e){if(!ST(n))throw e;return Promise.resolve(n).then(()=>{throw e},t=>{throw CT(t,e)})}return ST(n)?Promise.resolve(n):void 0}function ST(e){return!!e&&(typeof e==`object`||typeof e==`function`)&&typeof e.then==`function`}function CT(e,t){return AggregateError([e,t],`Adapter cleanup and local teardown both failed`,{cause:e})}function wT(e){return typeof e==`object`&&!!e}var TT=[`enabled`,`refetchInterval`,`retry`,`retryDelay`,`staleTime`,`gcTime`,`refetchOnWindowFocus`,`refetchOnReconnect`,`refetchOnMount`,`networkMode`];function ET(e){let t={};for(let n of TT)e[n]!==void 0&&(t[n]=e[n]);return t}var DT=`queryCollection:gc:`,OT=0,kT=new WeakMap,AT=new WeakMap,jT=new WeakMap,MT=new WeakMap,NT=new WeakMap,PT=new WeakMap,FT=new WeakMap,IT=class{constructor(e,t,n){this.state=e,this.refetch=t,this.writeInsert=n.writeInsert,this.writeUpdate=n.writeUpdate,this.writeDelete=n.writeDelete,this.writeUpsert=n.writeUpsert,this.writeBatch=n.writeBatch}get isFetching(){return Array.from(this.state.observers.values()).some(e=>e.getCurrentResult().isFetching)}get isRefetching(){return Array.from(this.state.observers.values()).some(e=>e.getCurrentResult().isRefetching)}get isLoading(){return Array.from(this.state.observers.values()).some(e=>e.getCurrentResult().isLoading)}get dataUpdatedAt(){return Math.max(0,...Array.from(this.state.observers.values()).map(e=>e.getCurrentResult().dataUpdatedAt))}get fetchStatus(){let e=`idle`;for(let t of this.state.observers.values()){let n=t.getCurrentResult().fetchStatus;if(n===`fetching`)return`fetching`;n===`paused`&&(e=`paused`)}return e}};function LT(e){let{queryKey:t,queryFn:n,select:r,queryClient:i,enabled:a,refetchInterval:o,retry:l,retryDelay:u,staleTime:d,gcTime:f,refetchOnWindowFocus:h,refetchOnReconnect:g,refetchOnMount:_,networkMode:v,initialData:y,initialDataUpdatedAt:b,persistedGcTime:x,getKey:S,onInsert:C,onUpdate:w,onDelete:T,meta:E,...ee}=e,D=ee.syncMode??`eager`;if(D===`on-demand`&&(y!==void 0||b!==void 0))throw new cT;let O=D===`eager`?{...y!==void 0&&{initialData:y},...b!==void 0&&{initialDataUpdatedAt:b},placeholderData:void 0}:{initialData:()=>void 0,initialDataUpdatedAt:void 0,placeholderData:void 0},te=typeof t==`function`?t({}):t,ne=D===`on-demand`&&typeof t!=`function`?te:void 0,re=ne&&m(ne),ie=e=>{typeof t==`function`&&(e.length>=te.length&&te.every((t,n)=>Jy(t,e[n]))||console.warn(`[QueryCollection] queryKey function must return keys that extend the base key prefix. Base: ${JSON.stringify(te)}, Got: ${JSON.stringify(e)}. This can cause stale cache issues.`))};if(!t)throw new iT;if(!n)throw new aT;if(!i)throw new oT;if(!S)throw new sT;let k={observers:new Map},ae=0,oe=new WeakMap,se=new WeakMap,A=new WeakSet,ce={},j,M=new WeakMap,le,N=0,ue=!1,de=(e,t)=>{if(j.add(e),t!==void 0){let n=M.get(e)??new Set;n.add(t),M.set(e,n)}},fe=(e,t)=>{A.add(e),de(e,t);let n=PT.get(e)??new Set;n.add(ce),PT.set(e,n)},pe=e=>M.get(e)??new Set([m(e.queryKey)]),P=(e,t,n)=>{let r=se.get(e)??new Map;se.set(e,r);let i=r.get(t)??new Map;r.set(t,i);let a=i.get(n)??{};return i.set(n,a),a},me=(e,t)=>oe.get(t)?.get(e),he=(e,t,n)=>{let r=oe.get(t)??new Map;r.set(e,n),oe.set(t,r)},ge=(e,t)=>{for(let n of pe(e)){let r=k.observers.get(n);if(!r||r.getCurrentQuery()!==e)continue;let i=r.getCurrentResult(),a=P(e,t,n);a.result=i;let o=me(n,i);o&&(a.settlement=o)}},_e=(e,t)=>{let n=se.get(e)?.get(t);if(n)for(let[e,t]of n){if(!t.result)continue;let n=me(e,t.result);n&&(t.settlement=n)}},ve=(e,t)=>{let n=se.get(e);if(n){for(let e of t)n.delete(e);n.size===0&&se.delete(e)}},ye=e=>le===void 0||(jT.get(e)??0)>le,be=new Map,F=new Map,I=new WeakSet,xe=e=>{let t=F.get(e);return t!==void 0&&!I.has(t)},L=new Map,Se=new Map,Ce=new Map,we=0,Te=new Map,Ee=new Map,De=0,Oe=new WeakSet,ke=new WeakMap,R=new Map,Ae=(e,t)=>{let n=AT.get(e)??R.get(t);e.state.fetchStatus===`fetching`&&(n??we)<we&&e.cancel({silent:!0})},je=new Map,Me=new Map,Ne,Pe=!1,Fe=new WeakMap,Ie=0,z=new Map,Le=new Map,Re=()=>{},ze=(e,t)=>!1,Be=e=>void 0,B,V=(e,t)=>{let n=L.get(e)||new Set;n.add(t),L.set(e,n);let r=F.get(t)||new Set;r.add(e),F.set(t,r)},Ve=(e,t)=>{t.size===0?L.delete(e):(L.set(e,new Set(t)),t.forEach(t=>{let n=F.get(t)||new Set;n.add(e),F.set(t,n)}))},H=(e,t)=>{let n=L.get(e);return n?.delete(t),n?.size||L.delete(e),F.get(t)?.delete(e),!n?.size},He=e=>{let t=new Map;F.get(e)?.forEach(n=>{let r=new Set(L.get(n));r.delete(e),t.set(n,r),r.size===0?L.delete(n):L.set(n,r)});let n=new Set;return I.add(n),F.set(e,n),t},Ue=e=>{let y={};B=y,je.clear(),le=void 0,ue=!1,j=new Set(i.getQueryCache().findAll({queryKey:te}));for(let e of j)e.state.fetchStatus===`fetching`&&R.set(m(e.queryKey),AT.get(e)??R.get(m(e.queryKey))??we);let{begin:b,write:C,commit:w,markReady:T,fail:ee,reportError:ae,reportHealthy:oe,invalidateLoadedSubsets:M,collection:P,metadata:I}=e,Ue=!1,We=!1,Ke=()=>{Ue||We||(Ue=!0,T())},qe=e=>!Ue&&(We=!0,ee(e),!0),Ye=new WeakMap,Xe=new Map,Ze,Qe=(e,t,n)=>{let r=e.meta?.loadSubsetOptions;if(D!==`on-demand`||!wT(r)||!r.orderBy?.length)return;let i=Ye.get(e),{where:a,orderBy:o}=r,s={readKey:i?.readKey??Cw({where:a,orderBy:o}),leadingValue:i?.leadingValue??ax(o[0].expression),compare:i?.compare??db(o[0].compareOptions),keys:JSON.stringify(n.map(e=>JSON.stringify(S(e))).sort()),last:void 0};for(let e of n){let t=s.leadingValue(e);(s.last===void 0||s.compare(t,s.last.value)>0)&&(s.last={value:t})}if(Ye.set(e,s),Ze!==void 0||Xe.has(t)||i?.last===void 0||i.keys===s.keys)return;let c=i.last.value;(s.last===void 0||s.compare(s.last.value,c)<0||[...k.observers.values()].some(e=>{let t=Ye.get(e.getCurrentQuery());return t!==void 0&&t!==s&&t.readKey===s.readKey&&(t.last===void 0||s.compare(t.last.value,c)>0)}))&&(Ze=setTimeout(()=>{Ze=void 0,B===y&&M()},0))},$e=I===void 0?null:nT(I.persistence);if($e?.startupCacheGenerationRotated===!0){le=OT;for(let e of j)e.state.fetchStatus!==`idle`&&AT.get(e)===void 0&&AT.set(e,le)}let et=!1,tt=!1,nt=new Map,rt=new Set,it=new WeakMap,U=new Map,at=e=>U.get(e)??0,ot=e=>{U.set(e,at(e)+1)},st=new Map,ct=new Map,lt=e=>{for(let t of ct.values())if(t===e)return;oe(e)},ut=(e,t)=>{let n=ct.get(e);ct.set(e,t),Ue&&(ae(t),n!==void 0&&lt(n))},W=e=>{let t=ct.get(e);ct.delete(e)&&Ue&&(ct.size===0?oe():lt(t))},dt=new WeakMap,ft=new Set,pt=new Map,mt=e=>dt.get(e),ht=(e,t)=>{dt.set(e,t)};Be=mt;let gt=new Map,_t=new Map,vt=new Map,yt=Promise.resolve(),bt=e=>{let t=gt.get(e);t?.rollback?.(),je.delete(e),st.delete(e),gt.delete(e),t?.abort()},xt=async e=>{for(;;){let t=je.get(e);if(!t)return;try{await t}catch(n){if(je.get(e)===t||st.has(e)&&st.get(e)===n)throw n}}},St=(e,t,n,r=()=>!0)=>new Promise((i,a)=>{let o=!0,s=()=>{},c=Ce.get(t)??new Set,l=e=>{o&&(o=!1,s(),c.delete(u),c.size===0&&Ce.delete(t),e())},u=()=>{l(()=>a(n()))};c.add(u),Ce.set(t,c),s=e.subscribe(e=>{queueMicrotask(()=>{(e.isSuccess&&!P.deferDataRefresh||e.isError&&!e.isFetching)&&r(e)&&l(()=>i(e))})})}),Ct=(e,t)=>{let n=pt.get(t)??new Map,r=n.get(e);if(r)return r;let i=t.then(async()=>{let t=k.observers.get(e);if(!t)throw new p;let n=await t.refetch();for(;;){if(!n.isSuccess)return n;if(await new Promise(e=>queueMicrotask(e)),P.deferDataRefresh){n=await St(t,e,()=>new p);continue}let r=mt(n);if(r?.type===`rejected`)throw r.error;if(r?.type===`pending`)return r.promise;let i=Tt(e);return i!==!0&&await i,n}});n.set(e,i),pt.set(t,n);let a=()=>{n.get(e)===i&&(n.delete(e),n.size===0&&pt.delete(t))};return i.then(a,a),i},wt=(e,t,n)=>{let r=mt(t);if(r?.type===`pending`)return r;let i,a=new Promise((e,t)=>{i=t,n.then(e,t)});a.catch(()=>{});let o={type:`pending`,promise:a,reject:i};return ht(t,o),ft.add(o),a.then(()=>{ft.delete(o)},()=>{ft.delete(o)}),o},Tt=e=>je.get(e)?xt(e):!st.has(e)||Promise.reject(st.get(e)),Et=e=>I?.row.get(e),Dt=(e,t)=>{if(!e||typeof e!=`object`)return new Set;let n=e.queryCollection;if(!n||typeof n!=`object`)return new Set;let r=n.owners;if(!r||typeof r!=`object`)return new Set;let i=new Set(Object.keys(r));return t===void 0||i.forEach(e=>{let n=F.get(e);n&&!n.has(t)&&i.delete(e)}),i},Ot=e=>Dt(Et(e),e),kt=(e,t)=>{if(!I)return;let n={...Et(e)??{}};t.size===0?(delete n.queryCollection,Object.keys(n).length===0?I.row.delete(e):I.row.set(e,n)):I.row.set(e,{...n,queryCollection:{owners:Object.fromEntries(Array.from(t.values()).map(e=>[e,!0]))}})},At=(e,t)=>{if(!e||typeof e!=`object`)return;let n=e;if(n.queryHash===t){if(n.mode===`until-revalidated`)return{queryHash:t,mode:`until-revalidated`};if(n.mode===`ttl`&&typeof n.expiresAt==`number`&&Number.isFinite(n.expiresAt))return{queryHash:t,mode:`ttl`,expiresAt:n.expiresAt}}},jt=e=>(yt=yt.then(e,e),yt),Mt=e=>{let t=vt.get(e);t&&(clearTimeout(t),vt.delete(e))},Nt=e=>{let t=F.get(e);if(t)return new Set(t);let n=new Set,r=Array.from(P._state.syncedData.keys(),e=>[e,Ot(e)]);for(let[t,i]of r)i.size!==0&&(Ve(t,i),i.has(e)&&n.add(t));return n},Pt=async(e,t=!1)=>{let n=N,r=F.get(e);if(r&&(r.size>0||t)&&Array.from(r).every(e=>P.has(e))){let e=new Map;return r.forEach(t=>{let n=P.get(t),r=L.get(t);n&&r&&e.set(t,{value:n,owners:new Set(r)})}),e}let i=$e?.scanPersistedRows;if(!i){let t=new Map;return Nt(e).forEach(e=>{let n=P.get(e),r=L.get(e);n&&r&&t.set(e,{value:n,owners:new Set(r)})}),t}let a=new Map,o=await i();if(n!==N||ue)return a;let s=o.map(e=>Dt(e.metadata,e.key));return o.forEach((t,n)=>{let r=s[n];r.size!==0&&(Ve(t.key,r),r.has(e)&&a.set(t.key,{value:t.value,owners:r}))}),a},Ft=async e=>{if(!I)return;let t=N,n=await Pt(e);if(t!==N||ue)return;let r=[];b(),n.forEach(({value:t,owners:n},i)=>{n.delete(e),kt(i,n),H(i,e)&&r.push(t)}),r.forEach(e=>{C({type:`delete`,value:e})}),I.collection.delete(`${DT}${e}`),w(),F.delete(e)},It=e=>{if(e.mode!==`ttl`)return;Mt(e.queryHash);let t=Math.max(0,e.expiresAt-Date.now()),n=setTimeout(()=>{vt.delete(e.queryHash),jt(async()=>{let t=I?.collection.get(`${DT}${e.queryHash}`),n=At(t,e.queryHash);if(n?.mode===`ttl`){if(n.expiresAt>Date.now())return It(n);await Ft(e.queryHash)}})},t);vt.set(e.queryHash,n)},Lt=async()=>{if(!I)return;let e=I.collection.list(DT),t=Date.now();for(let{key:n,value:r}of e){let e=n.slice(DT.length),i=At(r,e);i&&(i.mode===`ttl`&&i.expiresAt<=t?await Ft(i.queryHash):i.mode===`ttl`&&It(i))}},Rt=e=>{if(typeof t==`function`){let{refetch:n,...r}=e;return t(r)}if(D===`on-demand`){let n=Cw(e);return n===void 0?t:[...t,n]}return t},zt=I?.collection.list(DT),Bt=!zt||zt.length===0?(tt=!0,Promise.resolve()):jt(async()=>{try{await Lt()}finally{tt=!0}}),Vt=(e,t,n)=>St(e,t,()=>new Py,n).then(e=>{if(e.isError)throw e.error}),Ht=(e,t,n)=>Vt(e,t,n).then(()=>{let e=Tt(t);return e===!0?void 0:e}),Ut=async(e,t)=>new Promise((n,r)=>{let i=!0,a=Ce.get(t)??new Set,o=e=>{if(!i)return;i=!1;let n=Xe.get(t)-1;n===0?Xe.delete(t):Xe.set(t,n),a.delete(s),a.size===0&&Ce.delete(t),e()},s=()=>{o(()=>r(new Py))};a.add(s),Ce.set(t,a),Xe.set(t,(Xe.get(t)??0)+1),(async()=>{let n=!!P.deferDataRefresh;for(Ae(e.getCurrentQuery(),t);;){if(!i)return;try{await e.refetch({throwOnError:!0})}catch(t){let n=AT.get(e.getCurrentQuery());if(le===void 0||n===void 0||n>le)throw t;continue}if(await new Promise(e=>queueMicrotask(e)),!i)return;if(ye(e.getCurrentQuery()))break}if(n||!ye(e.getCurrentQuery())){await Ht(e,t);return}let r=Tt(t);r!==!0&&await r})().then(()=>o(n),e=>o(()=>r(e)))}),Wt=(e,t)=>{let n=e.getCurrentQuery();if(typeof a==`function`?a(n):a!==!1)return Ut(e,t);let r=n.state.dataUpdateCount;return Ht(e,t,t=>{if(t.isError)return!0;let n=e.getCurrentQuery();return n.state.dataUpdateCount>r&&NT.get(n)===n.state.dataUpdateCount&&ye(n)})},Gt=(e={},t=n)=>{if(!tt){let n={},r=nt.get(e)??new Set;return r.add(n),nt.set(e,r),Bt.then(()=>{if(!nt.get(e)?.delete(n))throw new Py;r.size===0&&nt.delete(e);let i=Gt(e,t);return i===!0?void 0:i})}let c=Rt(e),p=m(c),b=re===void 0?void 0:k.observers.get(re),C=Le.has(p);if(C&&b===void 0)throw Error(`A full-source dependent lost its Query observer`);let w=b?.getCurrentQuery(),T=b?.getCurrentResult(),ee=T!==void 0&&me(re,T)!==void 0,te=I?.collection.get(`${DT}${p}`),ae=At(te,p)!==void 0,oe=!e.refetch&&ne!==void 0&&re!==p&&(C||!ae&&!k.observers.has(p)&&(z.get(re)??0)>0&&T?.isSuccess===!0&&w?.state.fetchStatus===`idle`&&ye(w)&&!je.has(re)&&!st.has(re)&&ee),se=oe?ne:c,A=oe?re:p,{subscription:j,refetch:M,...N}=e,ue={...E};Object.defineProperty(ue,"loadSubsetOptions",{value:N,enumerable:!1,configurable:!0,writable:!0});let de=A===p?te:I?.collection.get(`${DT}${A}`);if(At(de,A)!==void 0&&rt.add(A),Mt(A),ie(se),k.observers.has(A)){z.set(A,(z.get(A)||0)+1),oe&&Le.set(p,(Le.get(p)??0)+1);let t=k.observers.get(A),n=t.getCurrentResult();if(e.refetch)return Ut(t,A);let r=t.getCurrentQuery(),i=FT.get(r);return Fe.has(r)||D===`on-demand`&&i!==void 0&&(i.owner!==ce||i.session!==y)||we>0&&r.state.dataUpdateCount>(NT.get(r)??0)||!ye(t.getCurrentQuery())?Wt(t,A):n.isSuccess?P.deferDataRefresh?Ht(t,A):Tt(A):n.isError&&!n.isFetching?Promise.reject(n.error):Ht(t,A)}let pe={...ET({enabled:a,refetchInterval:o,retry:l,retryDelay:u,staleTime:d,gcTime:f,refetchOnWindowFocus:h,refetchOnReconnect:g,refetchOnMount:_,networkMode:v}),...O,queryKey:se,queryFn:e=>{let n=m(e.queryKey),r=i.getQueryCache().find({queryKey:e.queryKey,exact:!0});R.set(n,Math.max(R.get(n)??0,we));let a=()=>{let n=Object.defineProperties({},Object.getOwnPropertyDescriptors(e));return n.meta={...e.meta,loadSubsetOptions:{...N,get signal(){return e.signal}}},t(n)};if((z.get(n)??0)>1||(r?.getObserversCount()??0)>1||A===re&&Le.size||N.signal?.aborted)return a();let o=t=>{let n=typeof t==`object`&&!!t&&`name`in t&&t.name===`AbortError`;if(!N.signal?.aborted||t!==N.signal.reason&&!n||!r||r.getObserversCount()===0||i.getQueryCache().find({queryKey:e.queryKey,exact:!0})!==r||r.state.fetchStatus!==`fetching`)throw t;return a()};try{return Promise.resolve(t(e)).catch(o)}catch(e){return o(e)}},meta:ue,structuralSharing:!0,notifyOnChangeProps:`all`},he=new s(i,pe),ge=he.getCurrentQuery();fe(ge,A);let _e=i.getQueryCache().find({queryKey:se,exact:!0})?.gcTime,ve=x??_e;be.set(A,se),k.observers.set(A,he);let F=AT.get(ge);F!==void 0&&(ge.state.fetchStatus===`fetching`||MT.get(ge)===ge.state.data)&&R.set(A,F),ve===void 0?_t.delete(A):_t.set(A,ve),z.set(A,(z.get(A)||0)+1);let xe=i.getQueryData(se);if(xe!==void 0){let t=FT.get(ge),n=D===`on-demand`&&t!==void 0&&(t.owner!==ce||t.session!==y),i=we>0&&ge.state.dataUpdateCount>(NT.get(ge)??0),a=$e?.scanPersistedRows===void 0?void 0:r?r(xe):xe,o=$e?.scanPersistedRows!==void 0&&Array.isArray(a)&&a.some(e=>{let t=S(e);return P._state.getAcceptedSyncedRow(t)!==void 0&&!Te.has(t)&&!L.has(t)});(et||P.subscriberCount>0)&&nn(he,A,n||i||o?{data:ge.state.data,version:ge.state.dataUpdateCount,fetchStart:AT.get(ge)}:void 0);let s=he.getCurrentResult();return e.refetch||Fe.has(ge)||n||i||o?e.refetch?Ut(he,A):Wt(he,A):ye(he.getCurrentQuery())?s.isError&&!s.isFetching?Promise.reject(s.error):!s.isSuccess||P.deferDataRefresh?Ht(he,A):Tt(A):Wt(he,A)}if(le!==void 0)return(et||P.subscriberCount>0)&&nn(he,A),Wt(he,A);let Se=Ht(he,A);return(et||P.subscriberCount>0)&&nn(he,A),Se},Kt=(e,t)=>{let n=t.data,i=r?r(n):n,a=r?`select()`:`queryFn`;if(!Array.isArray(i))return{error:new lT(`@tanstack/query-db-collection: ${a} must return an array of objects. Got: ${typeof i} for queryKey ${JSON.stringify(e)}`)};let o=i.findIndex(e=>typeof e!=`object`||!e);if(o!==-1){let t=i[o];return{error:new lT(`@tanstack/query-db-collection: ${a} must return an array of objects. Invalid item at index ${o}: ${t===null?`null`:typeof t} for queryKey ${JSON.stringify(e)}`)}}return{items:i}},qt=(e,t,n)=>{let r=new Map(e.map(e=>[S(e),e]));for(let[e,i]of Me){if(i<=t||D===`on-demand`&&!r.has(e)&&!F.get(n)?.has(e))continue;let a=P._state.getAcceptedSyncedRow(e);a===void 0?r.delete(e):r.set(e,a)}return Array.from(r.values())},Jt=async()=>{for(;Ne;)await Ne},Yt=(e,t)=>{let n=Kt(e,t);if(`error`in n)throw ht(t,{type:`rejected`,error:n.error}),n.error;return n.items},Xt=(e,t,n,r,a,o)=>{let s=m(e);if(P.status===`cleaned-up`||a?.aborted)throw new Py;Ge()&&n.settleRefetchAtFetchBoundary?.();let c=o??Yt(e,t),l=new Map(P._state.acceptedSyncedEntries()),u=r!==void 0,d=u?new Set(r.keys()):Nt(s),f=i.getQueryCache().find({queryKey:e,exact:!0}),p=f!==void 0&&MT.get(f)===f.state.data?jT.get(f):void 0;if(D===`eager`)Te.forEach((e,t)=>{l.has(t)&&p!==void 0&&p>e&&d.add(t)});else if(p!==void 0&&(Te.size>0||$e?.scanPersistedRows!==void 0)){let e=k.observers.get(s)?.options.meta?.loadSubsetOptions;if(wT(e)&&e.limit===void 0&&e.offset===void 0&&e.cursor===void 0){let t=e.where?ax(e.where):void 0;l.forEach((e,n)=>{let r=Te.get(n);if(!(r===void 0?!$e?.scanPersistedRows||Ot(n).size>0:p<=r)){try{if(t&&!rx(t(e)))return}catch{return}d.add(n)}})}}let h=new Map;c.forEach(e=>{let t=S(e),n=Ee.get(t);h.set(t,p!==void 0&&n!==void 0&&n>p&&l.has(t)?l.get(t):e)});let g=new Map,_=new Set,v=F.get(s),y=new Set([...d,...h.keys()]),x=new Map;y.forEach(e=>{let t=L.get(e);x.set(e,t?new Set(t):void 0)});let T=!1,E,ee=()=>{E?.applicationStarted||E===void 0&&Array.from(y).every(e=>{let t=L.get(e)??new Set,n=Dt(P._state.syncedMetadata.get(e));return t.size===n.size&&Array.from(t).every(e=>n.has(e))})||k.observers.has(s)&&gt.get(s)===n&&(v===void 0?F.delete(s):F.set(s,v),x.forEach((e,t)=>{e===void 0?L.delete(t):L.set(t,e)}))};n.rollback=ee;let O=e=>{if(ee(),T){let e=new AbortController;e.abort();try{w(e.signal)}catch{}}throw e};try{F.set(s,new Set(d)),b(),T=!0,I&&I.collection.delete(`${DT}${s}`),d.forEach(e=>{let t=u?r.get(e)?.value:l.get(e),n=h.get(e);if(n)t&&!Jy(t,n)&&C({type:`update`,value:n});else{let t=Te.get(e);t!==void 0&&g.set(e,t);let n=Ot(e);n.delete(s),kt(e,n),H(e,s)&&(C({type:`delete`,key:e}),_.add(e))}}),h.forEach((e,n)=>{let r=Te.get(n);if(!d.has(n)&&r!==void 0&&(p??0)<=r)return;r!==void 0&&p!==void 0&&p>r&&g.set(n,r);let i=Ot(n),a=!i.has(s),o=!l.has(n);a&&i.add(s),V(n,s),o?C({type:`insert`,value:e}):!d.has(n)&&(t.isFetchedAfterMount||r!==void 0&&p!==void 0&&p>r)&&!Jy(l.get(n),e)&&C({type:`update`,value:e}),(a||o)&&kt(n,i)}),E=P._state.pendingSyncedTransactions.at(-1),Ge()&&n.settleRefetchAtFetchBoundary?.();let e=w();n.rollback=void 0,T=!1,rt.delete(s),Mt(s);let i=()=>{f&&Qe(f,s,c),_.forEach(e=>{P._state.getAcceptedSyncedRow(e)===void 0&&Ee.delete(e)});let e=e=>{h.forEach((t,n)=>{P._state.getAcceptedSyncedRow(n)!==void 0&&e>(Ee.get(n)??0)&&Ee.set(n,e)}),De=Math.max(De,e)};if(p!==void 0)e(p);else if(f){let t=f.state.data;queueMicrotask(()=>{if(MT.get(f)===t){let t=jT.get(f);t!==void 0&&e(t)}})}g.forEach((e,t)=>{Te.get(t)===e&&Te.delete(t)}),a?.aborted||Ke()},o=uC(e);return o===!0?i():o.then(i,()=>void 0),e===!0||e.then(()=>void 0,O)}catch(e){return O(e)}},Zt=async(e,t,n,r,a,o)=>{let s=m(e),c=a??Yt(e,t),l=await Pt(s,c.length===0);if(P.status===`cleaned-up`||gt.get(s)!==n)throw new Py;let u=we,d=i.getQueryCache().find({queryKey:e,exact:!0}),f=d?AT.get(d):void 0,p=o!==void 0&&o<u?qt(c,o,s):c;await Xt(e,t,n,l,r,p),o!==void 0&&o<u&&R.get(s)===o&&d&&AT.get(d)===f&&R.set(s,u)},Qt=(e,t,n,r)=>{je.set(e,t);let i=()=>je.get(e)===t&&(je.delete(e),!0);t.then(()=>{i()&&(st.delete(e),!n&&r===at(e)&&W(e))},t=>{i()&&(st.set(e,t),ot(e),console.error(`[QueryCollection] Error applying query ${String(be.get(e))}:`,t),qe(t)||ut(e,t))})},$t=(e,t,n)=>{bt(e);let r=at(e),i=new AbortController,a=()=>{},o=new Promise(e=>{a=e});i.settleRefetchAtFetchBoundary=a,gt.set(e,i);let s;try{s=n(i.signal,i)}catch(e){s=Promise.reject(e)}if(s===!0){gt.get(e)===i&&(he(e,t,Promise.resolve()),gt.delete(e),st.delete(e),!t.isFetching&&r===at(e)&&W(e));return}let c=Promise.race([s,o]);c.catch(()=>void 0),he(e,t,c);let l=()=>{gt.get(e)===i&&gt.delete(e)};s.then(l,l),gt.get(e)===i&&Qt(e,s,t.isFetching,r)},en=e=>{let t=m(e),n=N,r=a=>{if(B!==y||ue||n!==N)return;let o=k.observers.get(t),s=o?.getCurrentQuery();if(o&&s&&fe(s,t),!Pe){if(s){let e=AT.get(s);if(a.isError&&le!==void 0&&e!==void 0&&e<=le)return;if(a.isSuccess){if(a.isFetching&&!P.deferDataRefresh&&xe(t)&&MT.get(s)===s.state.data)return;if(!ye(s)){queueMicrotask(()=>{let e=k.observers.get(t);e&&e===o&&ye(e.getCurrentQuery())&&r(e.getCurrentResult())});return}if((we>0||De>(AT.get(s)??De))&&s.state.dataUpdateCount>(NT.get(s)??0)){let e=s.state.dataUpdateCount;if(ke.get(s)!==e){ke.set(s,e),queueMicrotask(()=>{k.observers.get(t)===o&&s.state.data===a.data&&s.state.dataUpdateCount===e&&r(a)});return}if(we>0&&MT.get(s)!==s.state.data)return}let e=AT.get(s);if(!a.isFetching&&(Te.size>0||$e?.scanPersistedRows!==void 0)&&e!==void 0&&e!==jT.get(s)&&!Oe.has(a)){Oe.add(a),queueMicrotask(()=>{k.observers.get(t)?.getCurrentResult()===a&&r(a)});return}let n=Fe.get(s);if(n!==void 0){if(s.state.dataUpdateCount<=n)return;Fe.delete(s)}}}if(a.isSuccess&&P.deferDataRefresh){if(a.isFetching){Ct(t,P.deferDataRefresh);return}wt(t,a,Ct(t,P.deferDataRefresh))}else{if(a.isSuccess&&!a.isFetching&&(Ne!==void 0||(R.get(t)??we)<we)){let n=o?.getCurrentQuery(),i=R.get(t)??0;if(mt(a)?.type===`pending`)return;let s=Kt(e,a);if(n&&`items`in s){Ie++;let o=(async()=>{await Jt();let o=k.observers.get(t);if(o?.getCurrentQuery()!==n)throw new p;let c=qt(s.items,i,t),l=()=>{},u=new Promise(e=>{l=o.subscribe(()=>e())}),d=o.getCurrentResult();try{if(R.set(t,we),!Je(e,c)){$t(t,a,(n,r)=>rt.has(t)?Zt(e,a,r,n,c,i):Xt(e,a,r,void 0,n,c));let n=Tt(t);return n!==!0&&await n,o.getCurrentResult()}o.getCurrentResult()===d?r(d):await u}finally{l()}await new Promise(e=>queueMicrotask(e));let f=Tt(t);return f!==!0&&await f,o.getCurrentResult()})(),c=()=>{Ie--};o.then(c,c),wt(t,a,o);return}}if(a.isSuccess){if(rt.has(t)){if(i.getQueryCache().find({queryKey:e,exact:!0})?.state.dataUpdateCount===0){a.isFetching||k.observers.get(t)?.refetch().catch(()=>{});return}if(a.isFetching)return;$t(t,a,(n,r)=>Zt(e,a,r,n,void 0,R.get(t)??we))}else $t(t,a,(t,n)=>Xt(e,a,n,void 0,t))}if(s&&a.errorUpdateCount<(it.get(s)??0)&&it.delete(s),a.isError&&a.fetchStatus===`idle`){let n=!s||a.errorUpdateCount!==it.get(s);n&&(s&&it.set(s,a.errorUpdateCount),ot(t)),console.error(`[QueryCollection] Error observing query ${String(e)}:`,a.error),!qe(a.error)&&n&&ut(t,a.error)}}}};return r},tn=e=>Se.has(e);ze=(e,t)=>{if(tn(e))return!1;let n=be.get(e);return n?(en(n)(t),!0):!1};let nn=(e,t,n)=>{if(!tn(t)){D===`eager`&&e.setOptions(e.options);let r=be.get(t),i=en(r),a=t=>{if(n&&t.isSuccess){let t=e.getCurrentQuery();if(t.state.data===n.data&&t.state.dataUpdateCount===n.version&&(t.state.fetchStatus!==`idle`||AT.get(t)===n.fetchStart))return}i(t)},o=e.subscribe(a);Se.set(t,o);let s=e.getCurrentResult();(s.isSuccess||s.isError)&&a(s)}},rn=()=>{k.observers.forEach((e,t)=>nn(e,t))},an=()=>{Se.forEach(e=>{e()}),Se.clear()};Re=()=>{D===`eager`&&k.observers.forEach((e,t)=>{let n=e.getCurrentQuery();i.getQueryCache().get(n.queryHash)!==n&&nn(e,t)})},et=!0;let on=P.on(`subscribers:change`,({subscriberCount:e})=>{e>0?rn():e===0&&an()});if(D===`eager`){let e=Gt({});e instanceof Promise&&e.catch(()=>{})}else tt?Ke():Bt.then(Ke);rn(),k.observers.forEach((e,t)=>{let n=e.getCurrentQuery(),r=FT.get(n);if(D===`on-demand`&&r&&(r.owner!==ce||r.session!==y))return;let i=be.get(t);en(i)(e.getCurrentResult())});let sn=e=>{Ce.get(e)?.forEach(e=>{e()}),Ce.delete(e)},cn=e=>{let t=k.observers.get(e)?.getCurrentQuery();Se.get(e)?.(),Se.delete(e),sn(e),Mt(e),rt.delete(e),bt(e);let n=He(e),r=F.get(e),i=()=>{F.get(e)===r&&F.delete(e)},a=[];n.forEach((e,t)=>{let n=P._state.getAcceptedSyncedRow(t);e.size===0&&n&&a.push(n)});let o=I!==void 0&&n.size>0,s=`${DT}${e}`,c=I?.collection.get(s)!==void 0,l=o||a.length>0||c;l&&b(),n.forEach((e,t)=>{o&&kt(t,e)}),a.length>0&&a.forEach(e=>{C({type:`delete`,value:e})}),c&&I.collection.delete(s);let u=!l||w(),d=()=>{a.forEach(e=>{let t=S(e);P._state.getAcceptedSyncedRow(t)===void 0&&Ee.delete(t)})},f=uC(u);f===!0?d():f.then(d,()=>void 0),u===!0?i():u.then(i,()=>void 0),k.observers.delete(e),W(e),t?.state.fetchStatus!==`fetching`&&R.delete(e),be.delete(e),U.delete(e),z.delete(e),_t.delete(e)},ln=e=>{let t=z.get(e)||0,n=k.observers.get(e),r=_t.get(e);t<=0&&(Se.get(e)?.(),Se.delete(e),sn(e)),!(t>0)&&(n?.hasListeners()??!1?z.set(e,0):r!==void 0&&I&&$e?.scanPersistedRows?(bt(e),b(),I.collection.set(`${DT}${e}`,{queryHash:e,mode:r===1/0?`until-revalidated`:`ttl`,...r===1/0?{}:{expiresAt:Date.now()+r}}),w(),r!==1/0&&It({queryHash:e,mode:`ttl`,expiresAt:Date.now()+r}),Se.get(e)?.(),Se.delete(e),k.observers.delete(e),W(e),n?.getCurrentQuery().state.fetchStatus!==`fetching`&&R.delete(e),be.delete(e),U.delete(e),z.set(e,0)):cn(e))},un=e=>{cn(e)},dn=i.getQueryCache().subscribe(e=>{if(e.type===`added`&&c(e.query.queryKey,te)&&de(e.query),!j.has(e.query))return;if(e.type===`updated`){if(e.action.type===`fetch`){let t=kT.get(e.action);t===void 0&&(t=++OT,kT.set(e.action,t)),R.set(m(e.query.queryKey),t),k.observers.forEach((n,r)=>{n.getCurrentQuery()===e.query&&R.set(r,t)}),AT.set(e.query,t);let n=[...se.get(e.query)?.keys()??[]].filter(e=>e!==t);n.length>0&&queueMicrotask(()=>ve(e.query,n)),ge(e.query,t)}else if(e.action.type===`success`&&!e.action.manual){e.query.state.data===e.action.data&&FT.delete(e.query),MT.set(e.query,e.action.data),NT.set(e.query,e.query.state.dataUpdateCount);let t=AT.get(e.query);t!==void 0&&(jT.set(e.query,t),ge(e.query,t),queueMicrotask(()=>{_e(e.query,t),ve(e.query,[t])}))}else if(e.action.type===`error`){let t=AT.get(e.query);t!==void 0&&(ge(e.query,t),queueMicrotask(()=>ve(e.query,[t])))}else if(e.action.type===`setState`&&e.action.state.fetchStatus===`idle`){let t=AT.get(e.query);t!==void 0&&queueMicrotask(()=>ve(e.query,[t]))}}let t=m(e.query.queryKey);if(k.observers.has(t)||e.type!==`removed`&&e.query.state.fetchStatus===`fetching`||R.delete(t),e.type===`removed`&&(j.delete(e.query),be.has(t))){if(D===`eager`){Se.get(t)?.(),Se.delete(t),sn(t),P.subscriberCount>0&&Re();return}ln(t)}});return{loadSubset:D===`eager`?void 0:Gt,unloadSubset:D===`eager`?void 0:e=>{let t=nt.get(e);if(t){t.delete(t.values().next().value),t.size===0&&nt.delete(e);return}let n=m(Rt(e)),r=e.refetch?void 0:Le.get(n);r!==void 0&&(r===1?Le.delete(n):Le.set(n,r-1));let i=r===void 0?n:re,a=(z.get(i)||0)-1;a<=0?(z.set(i,0),ln(i)):z.set(i,a)},restartAfterScopedRecovery:D===`on-demand`?async e=>{let t=++N;ue=!0,an();for(let e of k.observers.keys())sn(e),bt(e);if(await e,B!==y)throw new p;t===N&&(F.clear(),L.clear(),rt.clear(),Me.clear(),Te.clear(),Ee.clear(),De=0,vt.forEach(e=>clearTimeout(e)),vt.clear(),le=OT,ue=!1,k.observers.forEach((e,t)=>{(z.get(t)??0)>0&&nn(e,t)}))}:void 0,cleanup:()=>{B===y&&(B=void 0),clearTimeout(Ze),Ze=void 0,nt.clear(),Le.clear(),Re=()=>{},ze=()=>!1,on(),an(),vt.forEach(e=>{clearTimeout(e)}),vt.clear(),ft.forEach(e=>{e.reject(new p)}),ft.clear(),pt.clear(),Be===mt&&(Be=()=>void 0);let e=new Set([...k.observers.keys(),...F.keys()]);for(let t of e)un(t);R.clear(),Te.clear(),Ee.clear(),De=0,dn();for(let t of[...j])[...pe(t)].some(t=>e.has(t))&&(D===`eager`||A.has(t)&&t.getObserversCount()===0)&&i.getQueryCache().remove(t);for(let e of j)PT.get(e)?.delete(ce);j.clear(),A=new WeakSet}}},We=async(e,t)=>{let n=[...be.values()];Re();let r=B,i=N,a=n.map(async n=>{if(ue)throw new p;let a=m(n),o=k.observers.get(a);if(!o)return;let s=Be,c=o.getCurrentQuery(),l,u,d;try{Ae(c,a);let t=o.refetch({throwOnError:e?.throwOnError});c=o.getCurrentQuery(),l=o.getCurrentResult();let n=AT.get(c);if(n!==void 0&&(u=P(c,n,a)),d=await t,ue||i!==N)throw new p}catch(e){if(ue||i!==N)throw new p;let t=o.getCurrentResult(),n=ze(a,t)?t:u?.result??t;throw u&&(u.result=n,u.settlement??=me(a,n)),e}let f=ze(a,d)?d:u?.result??d;u&&(u.result=f,u.settlement??=me(a,f)),await new Promise(e=>queueMicrotask(e));let h=s(f)??s(d),g=u?.settlement??me(a,d)??me(a,l);if(B!==r&&h===void 0&&g===void 0)throw new p;if(t){if(h?.type===`rejected`)throw h.error;if(h?.type===`pending`){let t=await h.promise;if(i!==N)throw new p;if(!t.isSuccess&&e?.throwOnError)throw t.error;return t}}if(t&&!Ge()&&g&&(e?.throwOnError?await g:await g.catch(()=>void 0)),i!==N)throw new p;return f});return await Promise.all(a)},Ge=()=>{if(ae>0)return!0;for(let e of et?.collection._state.transactions.values()??[])if(e.state===`persisting`)return!0;return!1},Ke=e=>We(e,!Ge()),qe=e=>{for(let t of PT.get(e)??[])if(t!==ce)return!0;return!1},Je=(e,t,n)=>{let a=i.getQueryCache().find({queryKey:e,exact:!0}),o=()=>{a&&Fe.set(a,a.state.dataUpdateCount)};if(D===`on-demand`&&a&&qe(a)||a?.state.status===`pending`&&a.state.fetchStatus!==`idle`)return o(),!1;let s=t=>{if(a)FT.set(a,{owner:ce,session:B}),a.setState(a.state.status===`pending`?{data:t,status:`success`}:{data:t}),Fe.delete(a);else{i.setQueryData(e,t);let n=i.getQueryCache().find({queryKey:e,exact:!0});n&&FT.set(n,{owner:ce,session:B})}};if(r){let e=a?.state.data;if(!e||typeof e!=`object`)return o(),!1;if(Array.isArray(e))return s(t),!0;let i=n??r(e);if(!Array.isArray(i))return o(),!1;let c=Object.keys(e).find(t=>e[t]===i);return c===void 0?(o(),!1):(s({...e,[c]:t}),!0)}{let e=a?.state.data;return e===void 0||Array.isArray(e)?(s(t),!0):!1}},Ye=()=>{we=++OT;for(let[e,t]of k.observers)t.getCurrentQuery().state.fetchStatus!==`fetching`&&!je.has(e)&&R.set(e,we);return we},Xe=(e,t)=>{let n=Ie>0||Ne!==void 0||je.size>0;if(!n){for(let e of j)if(e.state.fetchStatus===`fetching`){n=!0;break}}if(!n)Me.clear();else for(let n of e)Me.set(n,t)},Ze=e=>{let t=Promise.all([Ne,e]).then(()=>{Ne===t&&(Ne=void 0)},()=>{Ne===t&&(Ne=void 0)});Ne=t},Qe=(e,t,n)=>{Pe=!0;try{let r=e(t),i=new Map(r.map(e=>[S(e),e]));$e(e,t,i);for(let e of t)if(i.has(e))Ee.set(e,n),De=Math.max(De,n),(L.get(e)?.size??0)===0?Te.set(e,n):Te.delete(e);else{Te.delete(e),Ee.delete(e);for(let t of[...L.get(e)??[]])H(e,t)}}finally{Pe=!1}},$e=(e,t,n)=>{let a=new Set(t),o=e=>{let t=new Set,r=!1;return{patched:e.flatMap(e=>{let i=S(e);if(t.add(i),!a.has(i))return[e];r=!0;let o=n.get(i);return o===void 0?[]:[o]}),present:t,touched:r}};if(D===`on-demand`){let e=new Set(t.flatMap(e=>[...L.get(e)??[]])),n=new Set;for(let[t,i]of k.observers){let a=i.getCurrentQuery();if(n.has(a)||!e.has(t)&&xe(t)&&a.state.fetchStatus!==`fetching`&&!je.has(t))continue;n.add(a);let s=a.state.data,c=r&&s!==void 0?r(s):s;if(!Array.isArray(c))continue;let{patched:l,touched:u}=o(c);u&&Je(a.queryKey,l,c)}for(let e of[...j])n.has(e)||qe(e)||e.getObserversCount()>0||i.getQueryCache().remove(e);return}let s=[...j];if(s.length>0)for(let i of s){let a=i.state.data,s=r&&a!==void 0?r(a):a;if(!Array.isArray(s)){Je(i.queryKey,e());continue}let{patched:c,present:l}=o(s);for(let e of t){let t=n.get(e);!l.has(e)&&t!==void 0&&c.push(t)}Je(i.queryKey,c,s)}else Je(te,e())},et=null,tt=e=>{let n,r=t=>{let r=e.commit(t),i=uC(r);if(i!==!0){let e=i.then(()=>{n===e&&(n=void 0)},()=>{n===e&&(n=void 0)});n=e}return r},a={...e,commit:r},{begin:o,write:s,collection:c}=a,l=!1,u=()=>{l||=(i.mount(),!0)},d=()=>{l&&=(i.unmount(),!1)};u();let f=typeof t==`function`?t({}):t,p={collection:c,queryClient:i,queryKey:f,getKey:S,begin:o,write:s,commit:r,updateCacheData:Qe,reserveDirectWrite:Ye,claimDirectWriteKeys:Xe,noteWaitingDirectWrite:Ze,earlierCommits:()=>n};et=p;let m=Ue(a),h=typeof m==`function`?{cleanup:m}:typeof m==`object`?m:{};return{...h,cleanup:()=>(et===p&&(et=null),xT(h.cleanup,d))}},nt=bT(()=>et),rt=e=>e&&(async t=>{ae++;try{await e(t)}finally{ae--}}),it=new IT(k,Ke,nt),U=hw({sync:tt},(e,t,n)=>{let r=t;for(let e of Object.keys(nt)){let t=r[e];r[e]=(...e)=>(n(),t(...e))}return e}),at={...ee,getKey:S,syncMode:D,sync:U,onInsert:rt(C),onUpdate:rt(w),onDelete:rt(T),utils:it};return Qw(at,t=>LT({...e,queryClient:t.getDependency(`queryClient`)??e.queryClient,id:at.id}))}var RT=`_workers`,zT=[`$key`,`$origin`,`$collectionId`,`$hasPendingWrites`];function BT(e){let t={...e};for(let e of zT)delete t[e];return t}var VT=e=>Array.isArray(e)?e:Array.isArray(e?.items)?e.items:[];async function HT(e){return(await Promise.allSettled(e)).find(e=>e.status===`rejected`)?.reason}var UT=new Set;function WT(e,t){return UT.add(e),t&&e.on(`status:change`,({status:n})=>{n===`cleaned-up`&&(UT.delete(e),t())}),e}function GT(){for(let e of UT)e.cleanup({dependents:!0}).catch(()=>{})}var KT=WT(vw(LT({id:`mouls`,queryKey:[`mouls`],queryFn:()=>C.listMouls(),queryClient:u,getKey:e=>e.name,onInsert:async({transaction:e,collection:t})=>{for(let{modified:n}of e.mutations)await t.utils.writeInsert(await C.createMoul(n))},onUpdate:async({transaction:e,collection:t})=>{for(let{key:t,changes:n}of e.mutations)await C.updateMoul(t,n);await t.utils.refetch()},onDelete:async({transaction:e,collection:t})=>{for(let{key:t}of e.mutations)await C.deleteMoul(t);await t.utils.refetch()}}))),qT=WT(vw(LT({id:`feature-flags`,queryKey:[`flags`],queryFn:()=>C.listFeatureFlags(),queryClient:u,getKey:e=>e.key,onInsert:async({transaction:e,collection:t})=>{for(let{modified:n}of e.mutations)await t.utils.writeInsert(await C.createFeatureFlag(n))},onUpdate:async({transaction:e,collection:t})=>{for(let{key:n,changes:r}of e.mutations)await t.utils.writeUpdate(await C.updateFeatureFlag(n,r))},onDelete:async({transaction:e,collection:t})=>{for(let{key:n}of e.mutations)await C.deleteFeatureFlag(n),await t.utils.writeDelete(n)}})));function JT(e,t){let n=t&&m(t);u.invalidateQueries({predicate:t=>[`records`,`workerJobs`,`collectionRecordCount`].includes(t.queryKey[0])&&t.queryKey[1]===e&&t.queryHash!==n})}async function YT(e,t){try{await C.retryJobs(e,t)}catch{let n=new Date().toISOString();await Promise.all(t.map(t=>C.updateRecord(e,t,{state:`available`,scheduled_at:n,attempt:0})))}}var XT={action:`retry`},ZT=e=>e?.action===XT.action,QT=(e,t)=>[`records`,e,t];function $T(e,t,n){let r=QT(e,t);return WT(vw(LT({id:`records:${m(r)}`,queryKey:r,queryFn:()=>C.listRecords(e,t),select:VT,queryClient:u,getKey:e=>String(e.id),onInsert:async({transaction:t,collection:n})=>{let i=await HT(t.mutations.map(({modified:t})=>{let{id:n,...r}=t;return C.createRecord(e,r)}));if(await n.utils.refetch(),JT(e,r),i)throw i},onUpdate:async({transaction:t,collection:n})=>{let i=t.mutations.filter(e=>ZT(e.metadata)).map(e=>String(e.key)),a=t.mutations.filter(e=>!ZT(e.metadata)).map(t=>C.updateRecord(e,String(t.key),t.changes));i.length>0&&a.push(YT(e,i));let o=await HT(a);if(await n.utils.refetch(),JT(e,r),o)throw o},onDelete:async({transaction:t,collection:n})=>{let i=await HT(t.mutations.map(({key:t})=>C.deleteRecord(e,String(t))));if(await n.utils.refetch(),JT(e,r),i)throw i}})),n)}var eE=new Map;function tE(e,t={}){let n=m(QT(e,t)),r=eE.get(n);return r||(r=$T(e,t,()=>eE.delete(n)),eE.set(n,r)),r}function nE(e,t){let n=new Date().toISOString();return e.update(t,{metadata:XT},e=>{for(let t of e)Object.assign(t,{state:`available`,scheduled_at:n,attempt:0})})}function rE(e){let t=e;return{totalItems:typeof t?.totalItems==`number`?t.totalItems:void 0,totalPages:typeof t?.totalPages==`number`?t.totalPages:void 0}}function iE(e,t){let n=e===RT,r=[`workerJobs`,e];return WT(vw(LT({id:`worker-jobs:${e}`,queryKey:r,queryFn:()=>n?C.listWorkers({perPage:100,sort:`-createdAt`}):C.listRecords(e,{perPage:100,sort:`-createdAt`}),select:VT,queryClient:u,getKey:e=>String(e.id),refetchInterval:5e3,onUpdate:async({transaction:t,collection:i})=>{let a=await HT(t.mutations.map(({key:t,changes:r})=>n?C.updateWorkerJob(String(t),r):C.updateRecord(e,String(t),r)));if(await i.utils.refetch(),n||JT(e,r),a)throw a}})),t)}var aE=new Map;function oE(e){let t=aE.get(e);return t||(t=iE(e,()=>aE.delete(e)),aE.set(e,t)),t}var sE=class extends a{static styles=[r,t`
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }

      .screen {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        padding: var(--spacing-6);
        gap: var(--spacing-3);
        background-color: var(--color-bg-subtle);
        color: var(--color-fg-subtle);
        font-family: var(--font-family-base);
        text-align: center;
      }

      .screen-logo {
        color: var(--color-fg);
      }

      h2 {
        margin: 0;
        color: var(--color-error-500);
      }

      p {
        margin: 0 0 var(--spacing-3);
        max-width: 600px;
      }
    `];loads=new Map;loadError=null;pageRoute;pageElement;constructor(){super(),new T(this,D,rh);let e=rh.isAuthenticated;rh.addEventListener(`change`,()=>{rh.isAuthenticated!==e&&(e=rh.isAuthenticated,e||(GT(),u.clear()),D.refresh())})}connectedCallback(){super.connectedCallback(),rh.init()}ensureLoaded(e){return this.loads.get(e)||(e.load?(this.loads.set(e,`loading`),e.load().then(()=>{this.loads.set(e,`ready`),this.requestUpdate()},t=>{this.loads.set(e,`failed`),this.loadError=t,this.requestUpdate()}),`loading`):`ready`)}pageFor(e){return this.pageRoute===e&&this.pageElement||(this.pageRoute=e,this.pageElement=document.createElement(e.tag)),this.pageElement}renderPending(){return i`
      <div class="screen">
        <span class="screen-logo">${dh(32)}</span>
        <span style="font-size: 0.875rem">Loading moul console...</span>
      </div>
    `}renderError(e){return i`
      <div class="screen">
        <h2>Console Application Error</h2>
        <p>${e}</p>
        <moul-button variant="primary" @click=${o(()=>window.location.reload())}>Reload Console</moul-button>
      </div>
    `}renderNotFound(){return i`
      <div class="screen">
        <span class="screen-logo">${dh(32)}</span>
        <p>No console page lives at this address.</p>
        <moul-button variant="primary" @click=${o(()=>D.navigate(`/overview`))}>Go to Overview</moul-button>
      </div>
    `}render(){if(rh.isLoading)return this.renderPending();let{route:e}=D.location;if(!e?.tag)return this.renderNotFound();let t=this.ensureLoaded(e);if(t===`failed`){let e=this.loadError instanceof Error?this.loadError.message:``;return this.renderError(e||`An unexpected error occurred in the admin console.`)}let r=t===`ready`?this.pageFor(e):n;return e.layout===`app`?i`<admin-layout>${r}</admin-layout>`:t===`ready`?r:this.renderPending()}};customElements.define(`admin-app`,sE);var cE=()=>!b()||!x()?`/login`:void 0;function lE(e,t,n){return{path:e,tag:t,load:n,layout:`app`,guard:cE}}var uE=[{path:`/`,redirect:`/overview`},{path:`/login`,tag:`admin-login-page`,load:()=>k(()=>import(`./login-B2ps9CJw.js`),__vite__mapDeps([0,1,2,3,4])),layout:`bare`},{path:`/setup`,tag:`admin-setup-page`,load:()=>k(()=>import(`./setup-KoskL9jE.js`),__vite__mapDeps([5,1,6,2,3,4])),layout:`bare`},lE(`/overview`,`admin-overview-page`,()=>k(()=>import(`./overview-B4cPqSS6.js`),__vite__mapDeps([7,1,8,6,2,9,10,11,12]))),lE(`/collections`,`admin-collections-page`,()=>k(()=>import(`./collections-BlSdN6Pd.js`),__vite__mapDeps([13,1,2,9,10,8,11,14,3,15,16,12]))),lE(`/collections/:moulName`,`admin-collection-page`,()=>k(()=>import(`./collection-CbJ-ls2c.js`),__vite__mapDeps([17,1,2,9,11,14,10,8,3,15,16]))),lE(`/records/:moulName`,`admin-records-page`,()=>k(()=>import(`./records-Cgbv9L75.js`),__vite__mapDeps([18,1,8,6,2,9,10,19,11,3,15,16,20]))),lE(`/realtime`,`admin-realtime-page`,()=>k(()=>import(`./realtime-Dm5qGaps.js`),__vite__mapDeps([21,1,6,9,10,8,11]))),lE(`/analytics`,`admin-analytics-page`,()=>k(()=>import(`./analytics-CNqpWruM.js`),__vite__mapDeps([22,1,8,6,19,10,11]))),lE(`/workers`,`admin-workers-page`,()=>k(()=>import(`./workers-_KxrxDDf.js`),__vite__mapDeps([23,1,9,19,10,8,11,16,20]))),lE(`/flags`,`admin-flags-page`,()=>k(()=>import(`./flags-1JrrpT-X.js`),__vite__mapDeps([24,1,8,6,9,10,11,3,16]))),lE(`/settings`,`admin-settings-page`,()=>k(()=>import(`./settings-DAITSizy.js`),__vite__mapDeps([25,1,8,6,2,19,10,11,3,16]))),lE(`/docs`,`admin-docs-page`,()=>k(()=>import(`./docs-BzeMEI3R.js`),__vite__mapDeps([26,1,11])))];D.start(uE);export{Gb as $,__ as $t,$x as A,X as An,Py as At,mx as B,Vy as Bt,jS as C,Vh as Cn,wy as Ct,dS as D,tg as Dn,by as Dt,pS as E,Xh as En,ay as Et,Bx as F,Um as Fn,iy as Ft,zb as G,Sy as Gt,ux as H,dy as Ht,Yx as I,zy as It,Wb as J,rv as Jt,Hb as K,fy as Kt,Rx as L,By as Lt,tS as M,dh as Mn,Ay as Mt,eS as N,sh as Nn,Qv as Nt,fS as O,Ih as On,ry as Ot,Zx as P,rh as Pn,oy as Pt,Jb as Q,p_ as Qt,zx as R,Ry as Rt,PS as S,eg as Sn,Cy as St,NS as T,Yh as Tn,ny as Tt,rx as U,gy as Ut,ix as V,sy as Vt,Rb as W,Oy as Wt,qb as X,y_ as Xt,Ub as Y,v_ as Yt,Yb as Z,g_ as Zt,US as _,Kh as _n,py as _t,rE as a,Ph as an,Mb as at,VS as b,ag as bn,Ty as bt,nE as c,Wh as cn,Wy as ct,Sw as d,Bh as dn,Hy as dt,h_ as en,Pb as et,bw as f,Lh as fn,Iy as ft,WS as g,Qh as gn,uy as gt,QC as h,Uh as hn,ly as ht,KT as i,Gh as in,kb as it,Qx as j,wh as jn,Ly as jt,iS as k,kh as kn,my as kt,BT as l,Ah as ln,Ky as lt,uw as m,Rh as mn,cy as mt,qT as n,$g as nn,Db as nt,tE as o,Jh as on,yb as ot,vw as p,zh as pn,hy as pt,Kb as q,sv as qt,JT as r,mg as rn,Nb as rt,QT as s,Fh as sn,Jy as st,RT as t,l_ as tn,Ob as tt,oE as u,qh as un,Gy as ut,HS as v,Zh as vn,ty as vt,DS as w,$h as wn,ey as wt,FS as x,rg as xn,Ey as xt,BS as y,ng as yn,Dy as yt,Q as z,$v as zt};