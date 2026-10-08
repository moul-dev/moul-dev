(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=globalThis,t=e.ShadowRoot&&(e.ShadyCSS===void 0||e.ShadyCSS.nativeShadow)&&`adoptedStyleSheets`in Document.prototype&&`replace`in CSSStyleSheet.prototype,n=Symbol(),r=new WeakMap,i=class{constructor(e,t,r){if(this._$cssResult$=!0,r!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,n=this.t;if(t&&e===void 0){let t=n!==void 0&&n.length===1;t&&(e=r.get(n)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&r.set(n,e))}return e}toString(){return this.cssText}},a=e=>new i(typeof e==`string`?e:e+``,void 0,n),o=(e,...t)=>new i(e.length===1?e[0]:t.reduce((t,n,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if(typeof e==`number`)return e;throw Error(`Value passed to 'css' function must be a 'css' function result: `+e+`. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)})(n)+e[r+1],e[0]),e,n),s=(n,r)=>{if(t)n.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let t of r){let r=document.createElement(`style`),i=e.litNonce;i!==void 0&&r.setAttribute(`nonce`,i),r.textContent=t.cssText,n.appendChild(r)}},c=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t=``;for(let n of e.cssRules)t+=n.cssText;return a(t)})(e):e,{is:l,defineProperty:u,getOwnPropertyDescriptor:d,getOwnPropertyNames:ee,getOwnPropertySymbols:te,getPrototypeOf:ne}=Object,re=globalThis,ie=re.trustedTypes,ae=ie?ie.emptyScript:``,oe=re.reactiveElementPolyfillSupport,f=(e,t)=>e,se={toAttribute(e,t){switch(t){case Boolean:e=e?ae:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch{n=null}}return n}},p=(e,t)=>!l(e,t),ce={attribute:!0,type:String,converter:se,reflect:!1,useDefault:!1,hasChanged:p};Symbol.metadata??=Symbol(`metadata`),re.litPropertyMetadata??=new WeakMap;var m=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ce){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),r=this.getPropertyDescriptor(e,n,t);r!==void 0&&u(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:i}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){let a=r?.call(this);i?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ce}static _$Ei(){if(this.hasOwnProperty(f(`elementProperties`)))return;let e=ne(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f(`finalized`)))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f(`properties`))){let e=this.properties,t=[...ee(e),...te(e)];for(let n of t)this.createProperty(n,e[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let e of n)t.unshift(c(e))}else e!==void 0&&t.push(c(e));return t}static _$Eu(e,t){let n=t.attribute;return!1===n?void 0:typeof n==`string`?n:typeof e==`string`?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return s(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,n);if(r!==void 0&&!0===n.reflect){let i=(n.converter?.toAttribute===void 0?se:n.converter).toAttribute(t,n.type);this._$Em=e,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(e,t){let n=this.constructor,r=n._$Eh.get(e);if(r!==void 0&&this._$Em!==r){let e=n.getPropertyOptions(r),i=typeof e.converter==`function`?{fromAttribute:e.converter}:e.converter?.fromAttribute===void 0?se:e.converter;this._$Em=r;let a=i.fromAttribute(t,e.type);this[r]=a??this._$Ej?.get(r)??a,this._$Em=null}}requestUpdate(e,t,n,r=!1,i){if(e!==void 0){let a=this.constructor;if(!1===r&&(i=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??p)(i,t)||n.useDefault&&n.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:r,wrapped:i},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==i||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[t,n]of e){let{wrapped:e}=n,r=this[t];!0!==e||this._$AL.has(t)||r===void 0||this.C(t,void 0,n,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};m.elementStyles=[],m.shadowRootOptions={mode:`open`},m[f(`elementProperties`)]=new Map,m[f(`finalized`)]=new Map,oe?.({ReactiveElement:m}),(re.reactiveElementVersions??=[]).push(`2.1.2`);var le=globalThis,ue=e=>e,h=le.trustedTypes,de=h?h.createPolicy(`lit-html`,{createHTML:e=>e}):void 0,fe=`$lit$`,g=`lit$${Math.random().toFixed(9).slice(2)}$`,pe=`?`+g,me=`<${pe}>`,_=document,v=()=>_.createComment(``),y=e=>e===null||typeof e!=`object`&&typeof e!=`function`,he=Array.isArray,ge=e=>he(e)||typeof e?.[Symbol.iterator]==`function`,_e=`[ 	
\f\r]`,b=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ve=/-->/g,ye=/>/g,x=RegExp(`>|${_e}(?:([^\\s"'>=/]+)(${_e}*=${_e}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,`g`),be=/'/g,xe=/"/g,Se=/^(?:script|style|textarea|title)$/i,S=(e=>(t,...n)=>({_$litType$:e,strings:t,values:n}))(1),C=Symbol.for(`lit-noChange`),w=Symbol.for(`lit-nothing`),Ce=new WeakMap,T=_.createTreeWalker(_,129);function we(e,t){if(!he(e)||!e.hasOwnProperty(`raw`))throw Error(`invalid template strings array`);return de===void 0?t:de.createHTML(t)}var Te=(e,t)=>{let n=e.length-1,r=[],i,a=t===2?`<svg>`:t===3?`<math>`:``,o=b;for(let t=0;t<n;t++){let n=e[t],s,c,l=-1,u=0;for(;u<n.length&&(o.lastIndex=u,c=o.exec(n),c!==null);)u=o.lastIndex,o===b?c[1]===`!--`?o=ve:c[1]===void 0?c[2]===void 0?c[3]!==void 0&&(o=x):(Se.test(c[2])&&(i=RegExp(`</`+c[2],`g`)),o=x):o=ye:o===x?c[0]===`>`?(o=i??b,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,s=c[1],o=c[3]===void 0?x:c[3]===`"`?xe:be):o===xe||o===be?o=x:o===ve||o===ye?o=b:(o=x,i=void 0);let d=o===x&&e[t+1].startsWith(`/>`)?` `:``;a+=o===b?n+me:l>=0?(r.push(s),n.slice(0,l)+fe+n.slice(l)+g+d):n+g+(l===-2?t:d)}return[we(e,a+(e[n]||`<?>`)+(t===2?`</svg>`:t===3?`</math>`:``)),r]},Ee=class e{constructor({strings:t,_$litType$:n},r){let i;this.parts=[];let a=0,o=0,s=t.length-1,c=this.parts,[l,u]=Te(t,n);if(this.el=e.createElement(l,r),T.currentNode=this.el.content,n===2||n===3){let e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;(i=T.nextNode())!==null&&c.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let e of i.getAttributeNames())if(e.endsWith(fe)){let t=u[o++],n=i.getAttribute(e).split(g),r=/([.?@])?(.*)/.exec(t);c.push({type:1,index:a,name:r[2],strings:n,ctor:r[1]===`.`?Oe:r[1]===`?`?ke:r[1]===`@`?Ae:O}),i.removeAttribute(e)}else e.startsWith(g)&&(c.push({type:6,index:a}),i.removeAttribute(e));if(Se.test(i.tagName)){let e=i.textContent.split(g),t=e.length-1;if(t>0){i.textContent=h?h.emptyScript:``;for(let n=0;n<t;n++)i.append(e[n],v()),T.nextNode(),c.push({type:2,index:++a});i.append(e[t],v())}}}else if(i.nodeType===8){if(i.data===pe)c.push({type:2,index:a});else{let e=-1;for(;(e=i.data.indexOf(g,e+1))!==-1;)c.push({type:7,index:a}),e+=g.length-1}}a++}}static createElement(e,t){let n=_.createElement(`template`);return n.innerHTML=e,n}};function E(e,t,n=e,r){if(t===C)return t;let i=r===void 0?n._$Cl:n._$Co?.[r],a=y(t)?void 0:t._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(!1),a===void 0?i=void 0:(i=new a(e),i._$AT(e,n,r)),r===void 0?n._$Cl=i:(n._$Co??=[])[r]=i),i!==void 0&&(t=E(e,i._$AS(e,t.values),i,r)),t}var De=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,r=(e?.creationScope??_).importNode(t,!0);T.currentNode=r;let i=T.nextNode(),a=0,o=0,s=n[0];for(;s!==void 0;){if(a===s.index){let t;s.type===2?t=new D(i,i.nextSibling,this,e):s.type===1?t=new s.ctor(i,s.name,s.strings,this,e):s.type===6&&(t=new je(i,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(i=T.nextNode(),a++)}return T.currentNode=_,r}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings===void 0?n._$AI(e[t]):(n._$AI(e,n,t),t+=n.strings.length-2)),t++}},D=class e{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,r){this.type=2,this._$AH=w,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=E(this,e,t),y(e)?e===w||e==null||e===``?(this._$AH!==w&&this._$AR(),this._$AH=w):e!==this._$AH&&e!==C&&this._(e):e._$litType$===void 0?e.nodeType===void 0?ge(e)?this.k(e):this._(e):this.T(e):this.$(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==w&&y(this._$AH)?this._$AA.nextSibling.data=e:this.T(_.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,r=typeof n==`number`?this._$AC(e):(n.el===void 0&&(n.el=Ee.createElement(we(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===r)this._$AH.p(t);else{let e=new De(r,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=Ce.get(e.strings);return t===void 0&&Ce.set(e.strings,t=new Ee(e)),t}k(t){he(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,r,i=0;for(let a of t)i===n.length?n.push(r=new e(this.O(v()),this.O(v()),this,this.options)):r=n[i],r._$AI(a),i++;i<n.length&&(this._$AR(r&&r._$AB.nextSibling,i),n.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let t=ue(e).nextSibling;ue(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},O=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,r,i){this.type=1,this._$AH=w,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=i,n.length>2||n[0]!==``||n[1]!==``?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=w}_$AI(e,t=this,n,r){let i=this.strings,a=!1;if(i===void 0)e=E(this,e,t,0),a=!y(e)||e!==this._$AH&&e!==C,a&&(this._$AH=e);else{let r=e,o,s;for(e=i[0],o=0;o<i.length-1;o++)s=E(this,r[n+o],t,o),s===C&&(s=this._$AH[o]),a||=!y(s)||s!==this._$AH[o],s===w?e=w:e!==w&&(e+=(s??``)+i[o+1]),this._$AH[o]=s}a&&!r&&this.j(e)}j(e){e===w?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??``)}},Oe=class extends O{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===w?void 0:e}},ke=class extends O{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==w)}},Ae=class extends O{constructor(e,t,n,r,i){super(e,t,n,r,i),this.type=5}_$AI(e,t=this){if((e=E(this,e,t,0)??w)===C)return;let n=this._$AH,r=e===w&&n!==w||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,i=e!==w&&(n===w||r);r&&this.element.removeEventListener(this.name,this,n),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH==`function`?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},je=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){E(this,e)}},Me={M:fe,P:g,A:pe,C:1,L:Te,R:De,D:ge,V:E,I:D,H:O,N:ke,U:Ae,B:Oe,F:je},Ne=le.litHtmlPolyfillSupport;Ne?.(Ee,D),(le.litHtmlVersions??=[]).push(`3.3.3`);var Pe=(e,t,n)=>{let r=n?.renderBefore??t,i=r._$litPart$;if(i===void 0){let e=n?.renderBefore??null;r._$litPart$=i=new D(t.insertBefore(v(),e),e,void 0,n??{})}return i._$AI(e),i},Fe=globalThis,k=class extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Pe(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};k._$litElement$=!0,k.finalized=!0,Fe.litElementHydrateSupport?.({LitElement:k});var Ie=Fe.litElementPolyfillSupport;Ie?.({LitElement:k}),(Fe.litElementVersions??=[]).push(`4.2.2`);var A=e=>(t,n)=>{n===void 0?customElements.define(e,t):n.addInitializer(()=>{customElements.define(e,t)})},Le={attribute:!0,type:String,converter:se,reflect:!1,hasChanged:p},Re=(e=Le,t,n)=>{let{kind:r,metadata:i}=n,a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),r===`setter`&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),r===`accessor`){let{name:r}=n;return{set(n){let i=t.get.call(this);t.set.call(this,n),this.requestUpdate(r,i,e,!0,n)},init(t){return t!==void 0&&this.C(r,void 0,e,t),t}}}if(r===`setter`){let{name:r}=n;return function(n){let i=this[r];t.call(this,n),this.requestUpdate(r,i,e,!0,n)}}throw Error(`Unsupported decorator location: `+r)};function j(e){return(t,n)=>typeof n==`object`?Re(e,t,n):((e,t,n)=>{let r=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),r?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function M(e){return j({...e,state:!0,attribute:!1})}var ze=new WeakMap,Be=e=>{if((e=>e.pattern!==void 0)(e))return e.pattern;let t=ze.get(e);return t===void 0&&ze.set(e,t=new URLPattern({pathname:e.path})),t},Ve=class{constructor(e,t,n){this.routes=[],this.o=[],this.t={},this.i=e=>{if(e.routes===this)return;let t=e.routes;this.o.push(t),t.h=this,e.stopImmediatePropagation(),e.onDisconnect=()=>{this.o?.splice(this.o.indexOf(t)>>>0,1)};let n=He(this.t);n!==void 0&&t.goto(n)},(this.l=e).addController(this),this.routes=[...t],this.fallback=n?.fallback}link(e){if(e?.startsWith(`/`))return e;if(e?.startsWith(`.`))throw Error(`Not implemented`);return e??=this.u,(this.h?.link()??``)+e}async goto(e){let t;if(this.routes.length===0&&this.fallback===void 0)t=e,this.u=``,this.t={0:t};else{let n=this.p(e);if(n===void 0)throw Error(`No route found for `+e);let r=Be(n).exec({pathname:e})?.pathname.groups??{};if(t=He(r),typeof n.enter==`function`&&!1===await n.enter(r))return;this.v=n,this.t=r,this.u=t===void 0?e:e.substring(0,e.length-t.length)}if(t!==void 0)for(let e of this.o)e.goto(t);this.l.requestUpdate()}outlet(){return this.v?.render?.(this.t)}get params(){return this.t}p(e){let t=this.routes.find((t=>Be(t).test({pathname:e})));return t||this.fallback===void 0?t:this.fallback?{...this.fallback,path:`/*`}:void 0}hostConnected(){this.l.addEventListener(Ue.eventName,this.i);let e=new Ue(this);this.l.dispatchEvent(e),this._=e.onDisconnect}hostDisconnected(){this._?.(),this.h=void 0}},He=e=>{let t;for(let n of Object.keys(e))/\d+/.test(n)&&(t===void 0||n>t)&&(t=n);return t&&e[t]},Ue=class e extends Event{constructor(t){super(e.eventName,{bubbles:!0,composed:!0,cancelable:!1}),this.routes=t}};Ue.eventName=`lit-routes-connected`;var We=location.origin||location.protocol+`//`+location.host,Ge=class extends Ve{constructor(){super(...arguments),this.m=e=>{let t=e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey;if(e.defaultPrevented||t)return;let n=e.composedPath().find((e=>e.tagName===`A`));if(n===void 0||n.target!==``||n.hasAttribute(`download`)||n.getAttribute(`rel`)===`external`)return;let r=n.href;if(r===``||r.startsWith(`mailto:`))return;let i=window.location;n.origin===We&&(e.preventDefault(),r!==i.href&&(window.history.pushState({},``,r),this.goto(n.pathname)))},this.R=e=>{this.goto(window.location.pathname)}}hostConnected(){super.hostConnected(),window.addEventListener(`click`,this.m),window.addEventListener(`popstate`,this.R),this.goto(window.location.pathname)}hostDisconnected(){super.hostDisconnected(),window.removeEventListener(`click`,this.m),window.removeEventListener(`popstate`,this.R)}},Ke=Object.defineProperty,qe=(e,t,n)=>t in e?Ke(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,Je=(e,t,n)=>(qe(e,typeof t==`symbol`?t:t+``,n),n),Ye=(e,t,n)=>{if(!t.has(e))throw TypeError(`Cannot `+n)},Xe=(e,t)=>{if(Object(t)!==t)throw TypeError(`Cannot use the "in" operator on this value`);return e.has(t)},N=(e,t,n)=>{if(t.has(e))throw TypeError(`Cannot add the same private member more than once`);t instanceof WeakSet?t.add(e):t.set(e,n)},Ze=(e,t,n)=>(Ye(e,t,`access private method`),n);function Qe(e,t){return Object.is(e,t)}var P=null,F=!1,I=1,L=Symbol(`SIGNAL`);function R(e){let t=P;return P=e,t}function $e(){return P}function et(){return F}var tt={version:0,lastCleanEpoch:0,dirty:!1,producerNode:void 0,producerLastReadVersion:void 0,producerIndexOfThis:void 0,nextProducerIndex:0,liveConsumerNode:void 0,liveConsumerIndexOfThis:void 0,consumerAllowSignalWrites:!1,consumerIsAlwaysLive:!1,producerMustRecompute:()=>!1,producerRecomputeValue:()=>{},consumerMarkedDirty:()=>{},consumerOnSignalRead:()=>{}};function z(e){if(F)throw Error(typeof ngDevMode<`u`&&ngDevMode?`Assertion error: signal read during notification phase`:``);if(P===null)return;P.consumerOnSignalRead(e);let t=P.nextProducerIndex++;if(V(P),t<P.producerNode.length&&P.producerNode[t]!==e&&dt(P)){let e=P.producerNode[t];B(e,P.producerIndexOfThis[t])}P.producerNode[t]!==e&&(P.producerNode[t]=e,P.producerIndexOfThis[t]=dt(P)?ut(e,P,t):0),P.producerLastReadVersion[t]=e.version}function nt(){I++}function rt(e){if(e.dirty||e.lastCleanEpoch!==I){if(!e.producerMustRecompute(e)&&!lt(e)){e.dirty=!1,e.lastCleanEpoch=I;return}e.producerRecomputeValue(e),e.dirty=!1,e.lastCleanEpoch=I}}function it(e){if(e.liveConsumerNode===void 0)return;let t=F;F=!0;try{for(let t of e.liveConsumerNode)t.dirty||ot(t)}finally{F=t}}function at(){return P?.consumerAllowSignalWrites!==!1}function ot(e){var t;e.dirty=!0,it(e),(t=e.consumerMarkedDirty)==null||t.call(e.wrapper??e)}function st(e){return e&&(e.nextProducerIndex=0),R(e)}function ct(e,t){if(R(t),e&&e.producerNode!==void 0&&e.producerIndexOfThis!==void 0&&e.producerLastReadVersion!==void 0){if(dt(e))for(let t=e.nextProducerIndex;t<e.producerNode.length;t++)B(e.producerNode[t],e.producerIndexOfThis[t]);for(;e.producerNode.length>e.nextProducerIndex;)e.producerNode.pop(),e.producerLastReadVersion.pop(),e.producerIndexOfThis.pop()}}function lt(e){V(e);for(let t=0;t<e.producerNode.length;t++){let n=e.producerNode[t],r=e.producerLastReadVersion[t];if(r!==n.version||(rt(n),r!==n.version))return!0}return!1}function ut(e,t,n){var r;if(ft(e),V(e),e.liveConsumerNode.length===0){(r=e.watched)==null||r.call(e.wrapper);for(let t=0;t<e.producerNode.length;t++)e.producerIndexOfThis[t]=ut(e.producerNode[t],e,t)}return e.liveConsumerIndexOfThis.push(n),e.liveConsumerNode.push(t)-1}function B(e,t){var n;if(ft(e),V(e),typeof ngDevMode<`u`&&ngDevMode&&t>=e.liveConsumerNode.length)throw Error(`Assertion error: active consumer index ${t} is out of bounds of ${e.liveConsumerNode.length} consumers)`);if(e.liveConsumerNode.length===1){(n=e.unwatched)==null||n.call(e.wrapper);for(let t=0;t<e.producerNode.length;t++)B(e.producerNode[t],e.producerIndexOfThis[t])}let r=e.liveConsumerNode.length-1;if(e.liveConsumerNode[t]=e.liveConsumerNode[r],e.liveConsumerIndexOfThis[t]=e.liveConsumerIndexOfThis[r],e.liveConsumerNode.length--,e.liveConsumerIndexOfThis.length--,t<e.liveConsumerNode.length){let n=e.liveConsumerIndexOfThis[t],r=e.liveConsumerNode[t];V(r),r.producerIndexOfThis[n]=t}}function dt(e){return e.consumerIsAlwaysLive||(e?.liveConsumerNode?.length??0)>0}function V(e){e.producerNode??=[],e.producerIndexOfThis??=[],e.producerLastReadVersion??=[]}function ft(e){e.liveConsumerNode??=[],e.liveConsumerIndexOfThis??=[]}function pt(e){if(rt(e),z(e),e.value===_t)throw e.error;return e.value}function mt(e){let t=Object.create(vt);t.computation=e;let n=()=>pt(t);return n[L]=t,n}var ht=Symbol(`UNSET`),gt=Symbol(`COMPUTING`),_t=Symbol(`ERRORED`),vt={...tt,value:ht,dirty:!0,error:null,equal:Qe,producerMustRecompute(e){return e.value===ht||e.value===gt},producerRecomputeValue(e){if(e.value===gt)throw Error(`Detected cycle in computations.`);let t=e.value;e.value=gt;let n=st(e),r,i=!1;try{r=e.computation.call(e.wrapper),i=t!==ht&&t!==_t&&e.equal.call(e.wrapper,t,r)}catch(t){r=_t,e.error=t}finally{ct(e,n)}if(i){e.value=t;return}e.value=r,e.version++}};function yt(){throw Error()}var bt=yt;function xt(){bt()}function St(e){let t=Object.create(Tt);t.value=e;let n=()=>(z(t),t.value);return n[L]=t,n}function Ct(){return z(this),this.value}function wt(e,t){at()||xt(),e.equal.call(e.wrapper,e.value,t)||(e.value=t,Et(e))}var Tt={...tt,equal:Qe,value:void 0};function Et(e){e.version++,nt(),it(e)}var H=Symbol(`node`),U;(e=>{var t,n,r,i;class a{constructor(r,i={}){N(this,n),Je(this,t);let a=St(r)[L];if(this[H]=a,a.wrapper=this,i){let t=i.equals;t&&(a.equal=t),a.watched=i[e.subtle.watched],a.unwatched=i[e.subtle.unwatched]}}get(){if(!(0,e.isState)(this))throw TypeError(`Wrong receiver type for Signal.State.prototype.get`);return Ct.call(this[H])}set(t){if(!(0,e.isState)(this))throw TypeError(`Wrong receiver type for Signal.State.prototype.set`);if(et())throw Error(`Writes to signals not permitted during Watcher callback`);let n=this[H];wt(n,t)}}t=H,n=new WeakSet,e.isState=e=>typeof e==`object`&&Xe(n,e),e.State=a;class o{constructor(t,n){N(this,i),Je(this,r);let a=mt(t)[L];if(a.consumerAllowSignalWrites=!0,this[H]=a,a.wrapper=this,n){let t=n.equals;t&&(a.equal=t),a.watched=n[e.subtle.watched],a.unwatched=n[e.subtle.unwatched]}}get(){if(!(0,e.isComputed)(this))throw TypeError(`Wrong receiver type for Signal.Computed.prototype.get`);return pt(this[H])}}r=H,i=new WeakSet,e.isComputed=e=>typeof e==`object`&&Xe(i,e),e.Computed=o,(t=>{var n,r,i,a;function o(e){let t,n=null;try{n=R(null),t=e()}finally{R(n)}return t}t.untrack=o;function s(t){if(!(0,e.isComputed)(t)&&!(0,e.isWatcher)(t))throw TypeError(`Called introspectSources without a Computed or Watcher argument`);return t[H].producerNode?.map(e=>e.wrapper)??[]}t.introspectSources=s;function c(t){if(!(0,e.isComputed)(t)&&!(0,e.isState)(t))throw TypeError(`Called introspectSinks without a Signal argument`);return t[H].liveConsumerNode?.map(e=>e.wrapper)??[]}t.introspectSinks=c;function l(t){if(!(0,e.isComputed)(t)&&!(0,e.isState)(t))throw TypeError(`Called hasSinks without a Signal argument`);let n=t[H].liveConsumerNode;return n?n.length>0:!1}t.hasSinks=l;function u(t){if(!(0,e.isComputed)(t)&&!(0,e.isWatcher)(t))throw TypeError(`Called hasSources without a Computed or Watcher argument`);let n=t[H].producerNode;return n?n.length>0:!1}t.hasSources=u;class d{constructor(e){N(this,r),N(this,i),Je(this,n);let t=Object.create(tt);t.wrapper=this,t.consumerMarkedDirty=e,t.consumerIsAlwaysLive=!0,t.consumerAllowSignalWrites=!1,t.producerNode=[],this[H]=t}watch(...t){if(!(0,e.isWatcher)(this))throw TypeError(`Called unwatch without Watcher receiver`);Ze(this,i,a).call(this,t);let n=this[H];n.dirty=!1;let r=R(n);for(let e of t)z(e[H]);R(r)}unwatch(...t){if(!(0,e.isWatcher)(this))throw TypeError(`Called unwatch without Watcher receiver`);Ze(this,i,a).call(this,t);let n=this[H];V(n);for(let e=n.producerNode.length-1;e>=0;e--)if(t.includes(n.producerNode[e].wrapper)){B(n.producerNode[e],n.producerIndexOfThis[e]);let t=n.producerNode.length-1;if(n.producerNode[e]=n.producerNode[t],n.producerIndexOfThis[e]=n.producerIndexOfThis[t],n.producerNode.length--,n.producerIndexOfThis.length--,n.nextProducerIndex--,e<n.producerNode.length){let t=n.producerIndexOfThis[e],r=n.producerNode[e];ft(r),r.liveConsumerIndexOfThis[t]=e}}}getPending(){if(!(0,e.isWatcher)(this))throw TypeError(`Called getPending without Watcher receiver`);return this[H].producerNode.filter(e=>e.dirty).map(e=>e.wrapper)}}n=H,r=new WeakSet,i=new WeakSet,a=function(t){for(let n of t)if(!(0,e.isComputed)(n)&&!(0,e.isState)(n))throw TypeError(`Called watch/unwatch without a Computed or State argument`)},e.isWatcher=e=>Xe(r,e),t.Watcher=d;function ee(){return $e()?.wrapper}t.currentComputed=ee,t.watched=Symbol(`watched`),t.unwatched=Symbol(`unwatched`)})(e.subtle||={})})(U||={});var Dt=!1,Ot=new U.subtle.Watcher(()=>{Dt||(Dt=!0,queueMicrotask(()=>{Dt=!1;for(let e of Ot.getPending())e.get();Ot.watch()}))}),kt=Symbol(`SignalWatcherBrand`),At=new FinalizationRegistry(e=>{e.unwatch(...U.subtle.introspectSources(e))}),jt=new WeakMap;function Mt(e){return!0===e[kt]?(console.warn(`SignalWatcher should not be applied to the same class more than once.`),e):class extends e{constructor(){super(...arguments),this._$St=new Map,this._$So=new U.State(0),this._$Si=!1}_$Sl(){var e;let t=[],n=[];this._$St.forEach((e,r)=>{(e?.beforeUpdate?t:n).push(r)});let r=this.h?.getPending().filter(e=>e!==this._$Su&&!this._$St.has(e));t.forEach(e=>e.get()),(e=this._$Su)==null||e.get(),r.forEach(e=>e.get()),n.forEach(e=>e.get())}_$Sv(){this.isUpdatePending||queueMicrotask(()=>{this.isUpdatePending||this._$Sl()})}_$S_(){if(this.h!==void 0)return;this._$Su=new U.Computed(()=>{this._$So.get(),super.performUpdate()});let e=this.h=new U.subtle.Watcher(function(){let e=jt.get(this);e!==void 0&&(!1===e._$Si&&(new Set(this.getPending()).has(e._$Su)?e.requestUpdate():e._$Sv()),this.watch())});jt.set(e,this),At.register(this,e),e.watch(this._$Su),e.watch(...Array.from(this._$St).map(([e])=>e))}_$Sp(){if(this.h===void 0)return;let e=!1;this.h.unwatch(...U.subtle.introspectSources(this.h).filter(t=>{let n=!0!==this._$St.get(t)?.manualDispose;return n&&this._$St.delete(t),e||=!n,n})),e||(this._$Su=void 0,this.h=void 0,this._$St.clear())}updateEffect(e,t){var n;this._$S_();let r=new U.Computed(()=>{e()});return this.h.watch(r),this._$St.set(r,t),(n=t?.beforeUpdate)!=null&&n?U.subtle.untrack(()=>r.get()):this.updateComplete.then(()=>U.subtle.untrack(()=>r.get())),()=>{this._$St.delete(r),this.h.unwatch(r),!1===this.isConnected&&this._$Sp()}}performUpdate(){this.isUpdatePending&&(this._$S_(),this._$Si=!0,this._$So.set(this._$So.get()+1),this._$Si=!1,this._$Sl())}connectedCallback(){super.connectedCallback(),this.requestUpdate()}disconnectedCallback(){super.disconnectedCallback(),queueMicrotask(()=>{!1===this.isConnected&&this._$Sp()})}}}var Nt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},{I:Pt}=Me,Ft=(e,t)=>{let n=e._$AN;if(n===void 0)return!1;for(let e of n)e._$AO?.(t,!1),Ft(e,t);return!0},It=e=>{let t,n;do{if((t=e._$AM)===void 0)break;n=t._$AN,n.delete(e),e=t}while(n?.size===0)},Lt=e=>{for(let t;t=e._$AM;e=t){let n=t._$AN;if(n===void 0)t._$AN=n=new Set;else if(n.has(e))break;n.add(e),Bt(t)}};function Rt(e){this._$AN===void 0?this._$AM=e:(It(this),this._$AM=e,Lt(this))}function zt(e,t=!1,n=0){let r=this._$AH,i=this._$AN;if(i!==void 0&&i.size!==0){if(t){if(Array.isArray(r))for(let e=n;e<r.length;e++)Ft(r[e],!1),It(r[e]);else r!=null&&(Ft(r,!1),It(r))}else Ft(this,e)}}var Bt=e=>{e.type==Nt.CHILD&&(e._$AP??=zt,e._$AQ??=Rt)},Vt=!1,Ht=new U.subtle.Watcher(async()=>{Vt||(Vt=!0,queueMicrotask(()=>{Vt=!1;for(let e of Ht.getPending())e.get();Ht.watch()}))});U.State,U.Computed;var Ut=(e,t)=>new U.State(e,t),Wt=`moul_admin_token`,Gt=`mould_admin_token`,Kt=`moul_admin_key`,qt=`mould_admin_key`;function W(){return localStorage.getItem(Wt)||localStorage.getItem(Gt)}function Jt(e){localStorage.setItem(Wt,e)}function Yt(){localStorage.removeItem(Wt),localStorage.removeItem(Gt)}function G(){return localStorage.getItem(Kt)||localStorage.getItem(qt)}function Xt(e){localStorage.setItem(Kt,e)}function Zt(){localStorage.removeItem(Kt),localStorage.removeItem(qt)}var Qt=e=>e;async function $t(e,t={}){let n=Qt(e),r=new Headers(t.headers||{}),i=W(),a=G();i&&!r.has(`Authorization`)&&r.set(`Authorization`,`Bearer ${i}`),a&&!r.has(`X-Admin-Key`)&&r.set(`X-Admin-Key`,a),!r.has(`Content-Type`)&&!(t.body instanceof FormData)&&r.set(`Content-Type`,`application/json`);let o=await fetch(n,{...t,headers:r}),s,c=o.headers.get(`content-type`);if(s=c&&c.includes(`application/json`)?await o.json():await o.text(),!o.ok)throw Error(s?.message||s?.error||`Request failed with status ${o.status}`);return s}var K={getSetupStatus:()=>$t(`/api/setup`),setupRootUser:e=>$t(`/api/setup`,{method:`POST`,body:JSON.stringify(e)}),adminLogin:(e,t)=>$t(`/api/admin/login`,{method:`POST`,body:JSON.stringify({identity:e,password:t})}),verifyAdminKeyWithKey:async e=>{let t=Qt(`/api/setup`),n=new Headers;n.set(`X-Admin-Key`,e),n.set(`Content-Type`,`application/json`);let r=await fetch(t,{method:`GET`,headers:n}),i,a=r.headers.get(`content-type`);if(i=a&&a.includes(`application/json`)?await r.json():await r.text(),!r.ok)throw Error(i?.message||i?.error||`Request failed with status ${r.status}`);return i},getRootAccount:()=>$t(`/api/admin/account`)},q=`moul_user_info`,en=`mould_user_info`;function tn(){try{let e=localStorage.getItem(q)||localStorage.getItem(en);if(e)return JSON.parse(e);let t=W();if(t&&t.includes(`.`)){let e=JSON.parse(atob(t.split(`.`)[1]));return{id:e.id||e.sub,username:e.username||e.identity||`admin`,name:e.name||e.username||`admin`,email:e.email||``,role:e.role||`Admin`}}}catch{}return null}var nn=W(),rn=G(),J=Ut({token:nn,adminKey:rn,user:tn()||(nn&&rn?{username:`admin`,name:`admin`,email:``,role:`Admin`}:null),needsSetup:!1,isLoading:!0,isAuthenticated:!!(nn&&rn)}),Y={async init(){J.set({...J.get(),isLoading:!0});let e=G(),t=W(),n=!1;if(e)try{n=(await K.getSetupStatus()).needsSetup,t&&await this.refreshUser()}catch{this.clearAdminKey()}let r=W(),i=G();J.set({...J.get(),needsSetup:n,isLoading:!1,isAuthenticated:!!(r&&i)})},async verifyAndSetAdminKey(e){let t=e.trim();if(!t)throw Error(`Master Admin Key is required`);let n=await K.verifyAdminKeyWithKey(t);return Xt(t),J.set({...J.get(),adminKey:t,needsSetup:n.needsSetup,isAuthenticated:!!(J.get().token&&t)}),{needsSetup:n.needsSetup}},clearAdminKey(){Zt(),Yt(),localStorage.removeItem(q),localStorage.removeItem(en),J.set({token:null,adminKey:null,user:null,needsSetup:!1,isLoading:!1,isAuthenticated:!1})},async adminLogin(e,t){let n=e.trim(),r=J.get().adminKey||G();if(!r)throw Error(`Master Admin Key is required`);if(!n||!t)throw Error(`Username/Email and Password are required`);try{let e=await K.adminLogin(n,t);if(!e.token)throw Error(`Authentication succeeded but no token was returned`);let r=e.record||{username:n.includes(`@`)?n.split(`@`)[0]:n,name:n.includes(`@`)?n.split(`@`)[0]:n,email:n.includes(`@`)?n:``,role:`Admin`};e.record?.name&&(r.name=e.record.name),localStorage.setItem(q,JSON.stringify(r)),Jt(e.token),J.set({...J.get(),token:e.token,user:r,isAuthenticated:!0})}catch(e){throw this.clearAdminKey(),r&&(Xt(r),J.set({...J.get(),adminKey:r})),Error(e.message||`Invalid root credentials`)}},async refreshUser(){if(W()&&G())try{let e=await K.getRootAccount();if(e){let t={id:e.id,username:e.username||`admin`,name:e.name||e.username||`admin`,email:e.email||``,role:`Admin`};localStorage.setItem(q,JSON.stringify(t)),J.set({...J.get(),user:t,isAuthenticated:!0})}}catch{}},logout(){this.clearAdminKey()}},an=Symbol(),on=class{get taskComplete(){return this.t||=this.i===1?new Promise(((e,t)=>{this.o=e,this.h=t})):this.i===3?Promise.reject(this.l):Promise.resolve(this.u),this.t}constructor(e,t,n){this.p=0,this.i=0,(this._=e).addController(this);let r=typeof t==`object`?t:{task:t,args:n};this.v=r.task,this.j=r.args,this.m=r.argsEqual??sn,this.k=r.onComplete,this.A=r.onError,this.autoRun=r.autoRun??!0,`initialValue`in r&&(this.u=r.initialValue,this.i=2,this.O=this.T?.())}hostUpdate(){!0===this.autoRun&&this.S()}hostUpdated(){this.autoRun===`afterUpdate`&&this.S()}T(){if(this.j===void 0)return;let e=this.j();if(!Array.isArray(e))throw Error(`The args function must return an array`);return e}async S(){let e=this.T(),t=this.O;this.O=e,e===t||e===void 0||t!==void 0&&this.m(t,e)||await this.run(e)}async run(e){let t,n;e??=this.T(),this.O=e,this.i===1?this.q?.abort():(this.t=void 0,this.o=void 0,this.h=void 0),this.i=1,this.autoRun===`afterUpdate`?queueMicrotask((()=>this._.requestUpdate())):this._.requestUpdate();let r=++this.p;this.q=new AbortController;let i=!1;try{t=await this.v(e,{signal:this.q.signal})}catch(e){i=!0,n=e}if(this.p===r){if(t===an)this.i=0;else{if(!1===i){try{this.k?.(t)}catch{}this.i=2,this.o?.(t)}else{try{this.A?.(n)}catch{}this.i=3,this.h?.(n)}this.u=t,this.l=n}this._.requestUpdate()}}abort(e){this.i===1&&this.q?.abort(e)}get value(){return this.u}get error(){return this.l}get status(){return this.i}render(e){switch(this.i){case 0:return e.initial?.();case 1:return e.pending?.();case 2:return e.complete?.(this.value);case 3:return e.error?.(this.error);default:throw Error(`Unexpected status: `+this.i)}}},sn=(e,t)=>e===t||e.length===t.length&&e.every(((e,n)=>!p(e,t[n])));function X(e,t,n,r){var i=arguments.length,a=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,o;if(typeof Reflect==`object`&&typeof Reflect.decorate==`function`)a=Reflect.decorate(e,t,n,r);else for(var s=e.length-1;s>=0;s--)(o=e[s])&&(a=(i<3?o(a):i>3?o(t,n,a):o(t,n))||a);return i>3&&a&&Object.defineProperty(t,n,a),a}var cn=class extends k{static{this.styles=o`
    :host {
      display: block;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .header {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .body {
      padding: 1.5rem;
    }

    .footer {
      padding: 1.5rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
  `}render(){return S`
      <div class="card">
        <div class="header"><slot name="header"></slot></div>
        <div class="body"><slot></slot></div>
        <div class="footer"><slot name="footer"></slot></div>
      </div>
    `}};cn=X([A(`moul-card`)],cn);var Z=class extends k{constructor(...e){super(...e),this.label=``,this.type=`text`,this.placeholder=``,this.value=``,this.isRequired=!1,this.description=``}static{this.styles=o`
    :host {
      display: block;
      margin-bottom: 1rem;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      box-sizing: border-box;
      font-size: 1rem;
    }
    
    input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 1px #3b82f6;
    }

    .description {
      margin-top: 0.25rem;
      font-size: 0.75rem;
      color: #6b7280;
    }
  `}_onInput(e){let t=e.target;this.value=t.value,this.dispatchEvent(new CustomEvent(`input-change`,{detail:this.value}))}render(){return S`
      <div>
        ${this.label?S`<label>${this.label} ${this.isRequired?`*`:``}</label>`:``}
        <input
          type="${this.type}"
          placeholder="${this.placeholder}"
          .value="${this.value}"
          ?required="${this.isRequired}"
          @input="${this._onInput}"
        />
        ${this.description?S`<p class="description">${this.description}</p>`:``}
      </div>
    `}};X([j({type:String})],Z.prototype,`label`,void 0),X([j({type:String})],Z.prototype,`type`,void 0),X([j({type:String})],Z.prototype,`placeholder`,void 0),X([j({type:String})],Z.prototype,`value`,void 0),X([j({type:Boolean})],Z.prototype,`isRequired`,void 0),X([j({type:String})],Z.prototype,`description`,void 0),Z=X([A(`moul-textfield`)],Z);var ln=class extends k{constructor(...e){super(...e),this.variant=`primary`,this.isDisabled=!1}static{this.styles=o`
    :host {
      display: block;
    }

    button {
      width: 100%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem 1rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
      font-weight: 500;
      color: white;
      background-color: #4f46e5;
      cursor: pointer;
      font-size: 1rem;
    }

    button:hover {
      background-color: #4338ca;
    }
    
    button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    button.ghost {
      background-color: transparent;
      color: #4f46e5;
    }

    button.ghost:hover {
      background-color: #f3f4f6;
    }
  `}render(){return S`
      <button 
        ?disabled="${this.isDisabled}" 
        class="${this.variant}"
        @click="${e=>{if(this.getAttribute(`type`)===`submit`){let t=this.closest(`form`);t&&(e.preventDefault(),t.requestSubmit())}else e.preventDefault()}}"
       >
        <slot></slot>
      </button>
    `}};X([j({type:String})],ln.prototype,`variant`,void 0),X([j({type:Boolean})],ln.prototype,`isDisabled`,void 0),ln=X([A(`moul-button`)],ln);var un=class extends k{constructor(...e){super(...e),this.variant=`info`,this.description=``}static{this.styles=o`
    :host {
      display: block;
      padding: 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }

    :host([variant="error"]) {
      background-color: #fef2f2;
      color: #991b1b;
      border: 1px solid #f87171;
    }

    :host([variant="warning"]) {
      background-color: #fffbeb;
      color: #92400e;
      border: 1px solid #fcd34d;
    }
    
    :host([variant="info"]) {
      background-color: #eff6ff;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }
  `}render(){return S`<div>${this.description}</div>`}};X([j({type:String,reflect:!0})],un.prototype,`variant`,void 0),X([j({type:String})],un.prototype,`description`,void 0),un=X([A(`moul-alert`)],un);var dn=class extends k{constructor(...e){super(...e),this.variant=`success`,this.dot=!1}static{this.styles=o`
    :host {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    :host([variant="success"]) {
      background-color: #d1fae5;
      color: #065f46;
    }

    .dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      margin-right: 0.375rem;
      background-color: currentColor;
    }
  `}render(){return S`
      ${this.dot?S`<div class="dot"></div>`:``}
      <slot></slot>
    `}};X([j({type:String,reflect:!0})],dn.prototype,`variant`,void 0),X([j({type:Boolean})],dn.prototype,`dot`,void 0),dn=X([A(`moul-badge`)],dn);var Q=class extends Mt(k){constructor(...e){super(...e),this._masterKeyInput=``,this._identity=``,this._password=``,this._error=null,this._verifyTask=new on(this,{task:async([e])=>{this._error=null;try{(await Y.verifyAndSetAdminKey(e)).needsSetup&&window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/setup`}))}catch(e){throw this._error=e.message||`Invalid Master Admin Key (Unauthorized)`,e}},args:()=>[this._masterKeyInput],autoRun:!1}),this._loginTask=new on(this,{task:async([e,t])=>{this._error=null;try{await Y.adminLogin(e,t),window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/`}))}catch(e){throw this._error=e.message||`Authentication failed. Please verify your credentials.`,e}},args:()=>[this._identity,this._password],autoRun:!1})}static{this.styles=o`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f3f4f6;
      font-family: sans-serif;
    }
    
    .card-wrapper {
      width: 100%;
      maxWidth: 460px;
    }
    
    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.5rem;
    }
    
    .title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
    }
    
    .subtitle {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
    }
    
    .form-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .key-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      background-color: #f9fafb;
      border-radius: 0.375rem;
      border: 1px solid #e5e7eb;
    }
    
    .footer-text {
        text-align: center;
        font-size: 0.8125rem;
        color: #6b7280;
    }
    
    .link {
        color: #4f46e5;
        text-decoration: none;
        cursor: pointer;
    }
    .link:hover {
        text-decoration: underline;
    }
  `}_handleVerifySubmit(e){if(e.preventDefault(),!this._masterKeyInput.trim()){this._error=`Master Admin Key is required`;return}this._verifyTask.run()}_handleLoginSubmit(e){if(e.preventDefault(),!this._identity.trim()||!this._password){this._error=`Username/Email and Password are required`;return}this._loginTask.run()}_handleClearKey(){Y.clearAdminKey(),this._masterKeyInput=``,this._error=null}render(){let e=J.get(),t=!!e.adminKey;return S`
      <div class="card-wrapper">
        <moul-card>
          <div slot="header" class="header">
            <h1 class="title">
              ${t?`moul console`:`Connect to moul`}
            </h1>
            <p class="subtitle">
              ${t?`Sign in with your administrator credentials`:`Enter your Master Admin Key to access the administration console`}
            </p>
          </div>

          <div class="form-col">
            ${this._error?S`<moul-alert variant="error" description="${this._error}"></moul-alert>`:``}

            ${t?e.needsSetup?S`
              <!-- Prompt to Setup Root User -->
              <div class="form-col">
                <div class="key-status-row">
                  <moul-badge variant="success" dot>Admin key verified</moul-badge>
                  <moul-button variant="ghost" @click="${this._handleClearKey}">Change Key</moul-button>
                </div>
                <moul-alert
                  variant="warning"
                  description="Initial setup required. Create the root administrator account to proceed."
                ></moul-alert>
                <moul-button
                  variant="primary"
                  @click="${()=>window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/setup`}))}"
                >
                  Create Root Admin
                </moul-button>
              </div>
            `:S`
              <!-- Context 2: Root Credentials Login -->
              <form @submit="${this._handleLoginSubmit}" class="form-col">
                <div class="key-status-row">
                  <moul-badge variant="success" dot>Admin key verified</moul-badge>
                  <moul-button variant="ghost" @click="${this._handleClearKey}">Change Key</moul-button>
                </div>

                <moul-textfield
                  label="Username or Email"
                  placeholder="admin@example.com"
                  .value="${this._identity}"
                  @input-change="${e=>this._identity=e.detail}"
                  isRequired
                ></moul-textfield>

                <moul-textfield
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  .value="${this._password}"
                  @input-change="${e=>this._password=e.detail}"
                  isRequired
                ></moul-textfield>

                <moul-button type="submit" variant="primary" ?isDisabled="${this._loginTask.status===1}">
                  ${this._loginTask.status===1?`Signing in...`:`Sign In`}
                </moul-button>
              </form>
            `:S`
              <!-- Context 1: Master Admin Key Entry -->
              <form @submit="${this._handleVerifySubmit}" class="form-col">
                <moul-textfield
                  label="Master Admin Key"
                  type="password"
                  placeholder="Enter MOUL_ADMIN_KEY"
                  .value="${this._masterKeyInput}"
                  @input-change="${e=>this._masterKeyInput=e.detail}"
                  isRequired
                  description="Configured via MOUL_ADMIN_KEY"
                ></moul-textfield>

                <moul-button type="submit" variant="primary" ?isDisabled="${this._verifyTask.status===1}">
                  ${this._verifyTask.status===1?`Verifying...`:`Continue`}
                </moul-button>
              </form>
            `}
          </div>

          ${t&&e.needsSetup?S`
            <div slot="footer" class="footer-text">
              First time running moul? 
              <a class="link" @click="${e=>{e.preventDefault(),window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/setup`}))}}">Set up root administrator</a>
            </div>
          `:``}
        </moul-card>
      </div>
    `}};X([M()],Q.prototype,`_masterKeyInput`,void 0),X([M()],Q.prototype,`_identity`,void 0),X([M()],Q.prototype,`_password`,void 0),X([M()],Q.prototype,`_error`,void 0),Q=X([A(`login-page`)],Q);var $=class extends Mt(k){constructor(...e){super(...e),this._masterKeyInput=``,this._username=``,this._email=``,this._password=``,this._passwordConfirm=``,this._error=null,this._verifyTask=new on(this,{task:async([e])=>{this._error=null;try{(await Y.verifyAndSetAdminKey(e)).needsSetup||window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/login`}))}catch(e){throw this._error=e.message||`Invalid Master Admin Key (Unauthorized)`,e}},args:()=>[this._masterKeyInput],autoRun:!1}),this._setupTask=new on(this,{task:async([e,t,n,r])=>{if(this._error=null,n!==r)throw Error(`Passwords do not match`);if(n.length<8)throw Error(`Password must be at least 8 characters long`);try{await K.setupRootUser({username:e.trim(),email:t.trim(),password:n});try{await Y.adminLogin(e.trim(),n),window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/`}))}catch{window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/login`}))}}catch(e){throw this._error=e.message||`Failed to setup root user`,e}},args:()=>[this._username,this._email,this._password,this._passwordConfirm],autoRun:!1})}static{this.styles=o`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f3f4f6;
      font-family: sans-serif;
    }
    
    .card-wrapper {
      width: 100%;
      maxWidth: 460px;
    }
    
    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.5rem;
    }
    
    .title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
    }
    
    .subtitle {
        font-size: 0.875rem;
        color: #6b7280;
        margin: 0;
    }
    
    .form-col {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .key-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0.75rem;
      background-color: #f9fafb;
      border-radius: 0.375rem;
      border: 1px solid #e5e7eb;
    }
    
    .footer-text {
        text-align: center;
        font-size: 0.8125rem;
        color: #6b7280;
    }
    
    .link {
        color: #4f46e5;
        text-decoration: none;
        cursor: pointer;
    }
    .link:hover {
        text-decoration: underline;
    }
  `}_handleVerifySubmit(e){if(e.preventDefault(),!this._masterKeyInput.trim()){this._error=`Master Admin Key is required`;return}this._verifyTask.run()}_handleSetupSubmit(e){e.preventDefault(),this._setupTask.run()}_handleClearKey(){Y.clearAdminKey(),this._masterKeyInput=``,this._error=null}render(){let e=J.get(),t=!!e.adminKey;return S`
      <div class="card-wrapper">
        <moul-card>
          <div slot="header" class="header">
            <h1 class="title">
              ${t?`Welcome to moul`:`Connect to moul`}
            </h1>
            <p class="subtitle">
              ${t?`Set up your root administrator account.`:`Enter your Master Admin Key to continue.`}
            </p>
          </div>

          <div class="form-col">
            ${this._error||this._setupTask.error?S`
              <moul-alert variant="error" description="${this._error||this._setupTask.error.message}"></moul-alert>
            `:``}

            ${t?e.needsSetup?S`
              <!-- Context 2: Root User Account Creation -->
              <form @submit="${this._handleSetupSubmit}" class="form-col">
                <div class="key-status-row">
                  <moul-badge variant="success" dot>Admin key verified</moul-badge>
                  <moul-button variant="ghost" @click="${this._handleClearKey}">Change Key</moul-button>
                </div>

                <moul-textfield
                  label="Username"
                  placeholder="admin"
                  .value="${this._username}"
                  @input-change="${e=>this._username=e.detail}"
                  isRequired
                ></moul-textfield>

                <moul-textfield
                  label="Email"
                  type="email"
                  placeholder="admin@example.com"
                  .value="${this._email}"
                  @input-change="${e=>this._email=e.detail}"
                  isRequired
                ></moul-textfield>

                <moul-textfield
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  .value="${this._password}"
                  @input-change="${e=>this._password=e.detail}"
                  isRequired
                  description="Minimum 8 characters"
                ></moul-textfield>

                <moul-textfield
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  .value="${this._passwordConfirm}"
                  @input-change="${e=>this._passwordConfirm=e.detail}"
                  isRequired
                ></moul-textfield>

                <moul-button type="submit" variant="primary" ?isDisabled="${this._setupTask.status===1}">
                  ${this._setupTask.status===1?`Creating account...`:`Create Account`}
                </moul-button>
              </form>
            `:S`
              <!-- Setup already complete, redirect -->
              <div class="form-col">
                <div class="key-status-row">
                  <moul-badge variant="success" dot>Admin key verified</moul-badge>
                  <moul-button variant="ghost" @click="${this._handleClearKey}">Change Key</moul-button>
                </div>
                <moul-alert
                  variant="info"
                  description="Root administrator already created. Please sign in with your credentials."
                ></moul-alert>
                <moul-button
                  variant="primary"
                  @click="${()=>window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/login`}))}"
                >
                  Go to Sign In
                </moul-button>
              </div>
            `:S`
              <!-- Context 1: Master Admin Key Entry -->
              <form @submit="${this._handleVerifySubmit}" class="form-col">
                <moul-textfield
                  label="Master Admin Key"
                  type="password"
                  placeholder="Enter MOUL_ADMIN_KEY"
                  .value="${this._masterKeyInput}"
                  @input-change="${e=>this._masterKeyInput=e.detail}"
                  isRequired
                  description="Configured via MOUL_ADMIN_KEY"
                ></moul-textfield>

                <moul-button type="submit" variant="primary" ?isDisabled="${this._verifyTask.status===1}">
                  ${this._verifyTask.status===1?`Verifying...`:`Continue`}
                </moul-button>
              </form>
            `}
          </div>

          ${t?S`
            <div slot="footer" class="footer-text">
              Already set up? 
              <a class="link" @click="${e=>{e.preventDefault(),window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/login`}))}}">Sign In</a>
            </div>
          `:``}
        </moul-card>
      </div>
    `}};X([M()],$.prototype,`_masterKeyInput`,void 0),X([M()],$.prototype,`_username`,void 0),X([M()],$.prototype,`_email`,void 0),X([M()],$.prototype,`_password`,void 0),X([M()],$.prototype,`_passwordConfirm`,void 0),X([M()],$.prototype,`_error`,void 0),$=X([A(`setup-page`)],$);var fn=class extends k{static{this.styles=o`
    :host {
      display: block;
      padding: 2rem;
    }
    h1 {
      color: #111827;
      margin-top: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .logout-btn {
      padding: 0.5rem 1rem;
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    .logout-btn:hover {
      background-color: #e5e7eb;
    }
    .content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }
  `}_handleLogout(){Y.logout(),window.dispatchEvent(new CustomEvent(`navigate`,{detail:`/_moul_/login`}))}render(){return S`
      <div class="header">
        <h1>Moul Admin Dashboard (Lit)</h1>
        <button class="logout-btn" @click=${this._handleLogout}>Logout</button>
      </div>
      <div class="content">
        <p>Welcome to the new Lit-based Admin Console.</p>
        <p>This is a placeholder for the dashboard content.</p>
      </div>
    `}};fn=X([A(`dashboard-page`)],fn);var pn=class extends Mt(k){static{this.styles=o`
    :host {
      display: block;
      min-height: 100vh;
      font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    }
  `}constructor(){super(),this._isReady=!1,this._router=new Ge(this,[{path:`/_moul_/`,render:()=>J.get().isAuthenticated?S`<dashboard-page></dashboard-page>`:(setTimeout(()=>this._router.goto(`/_moul_/login`),0),S`<login-page></login-page>`)},{path:`/_moul_/login`,render:()=>J.get().isAuthenticated?(setTimeout(()=>this._router.goto(`/_moul_/`),0),S`<dashboard-page></dashboard-page>`):S`<login-page></login-page>`},{path:`/_moul_/setup`,render:()=>J.get().isAuthenticated?(setTimeout(()=>this._router.goto(`/_moul_/`),0),S`<dashboard-page></dashboard-page>`):S`<setup-page></setup-page>`},{path:`/*`,render:()=>(setTimeout(()=>this._router.goto(`/_moul_/`),0),S`<div>Redirecting...</div>`)}]),this._handleNavigate=e=>{let t=e.detail;this._router.goto(t)},Y.init().then(()=>{this._isReady=!0})}connectedCallback(){super.connectedCallback(),window.addEventListener(`navigate`,this._handleNavigate)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener(`navigate`,this._handleNavigate)}render(){return this._isReady?S`${this._router.outlet()}`:S`<div>Loading...</div>`}};X([M()],pn.prototype,`_isReady`,void 0),pn=X([A(`moul-app`)],pn);