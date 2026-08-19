const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/esp32c2-BJI_CLlc.js","assets/esp32c3-Co0EDtN5.js","assets/esp32-pkAVpfDq.js","assets/esp32c6-CxMbXyuu.js","assets/esp32c61-CdZo4A-c.js","assets/esp32c5-BUnhzoVN.js","assets/esp32h2-DmqmY04U.js","assets/esp32s3-CLWHO3JV.js","assets/esp32s2-DSm1_e4W.js","assets/esp32p4-DmQlY5Nr.js"])))=>i.map(i=>d[i]);
(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const s of l.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(i){if(i.ep)return;i.ep=!0;const l=n(i);fetch(i.href,l)}})();function ef(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var tf={exports:{}},Tl={},nf={exports:{}},z={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ai=Symbol.for("react.element"),qh=Symbol.for("react.portal"),Xh=Symbol.for("react.fragment"),Jh=Symbol.for("react.strict_mode"),ep=Symbol.for("react.profiler"),tp=Symbol.for("react.provider"),np=Symbol.for("react.context"),rp=Symbol.for("react.forward_ref"),ip=Symbol.for("react.suspense"),lp=Symbol.for("react.memo"),sp=Symbol.for("react.lazy"),Ga=Symbol.iterator;function op(e){return e===null||typeof e!="object"?null:(e=Ga&&e[Ga]||e["@@iterator"],typeof e=="function"?e:null)}var rf={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},lf=Object.assign,sf={};function ir(e,t,n){this.props=e,this.context=t,this.refs=sf,this.updater=n||rf}ir.prototype.isReactComponent={};ir.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};ir.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function of(){}of.prototype=ir.prototype;function jo(e,t,n){this.props=e,this.context=t,this.refs=sf,this.updater=n||rf}var $o=jo.prototype=new of;$o.constructor=jo;lf($o,ir.prototype);$o.isPureReactComponent=!0;var Za=Array.isArray,af=Object.prototype.hasOwnProperty,Wo={current:null},uf={key:!0,ref:!0,__self:!0,__source:!0};function cf(e,t,n){var r,i={},l=null,s=null;if(t!=null)for(r in t.ref!==void 0&&(s=t.ref),t.key!==void 0&&(l=""+t.key),t)af.call(t,r)&&!uf.hasOwnProperty(r)&&(i[r]=t[r]);var o=arguments.length-2;if(o===1)i.children=n;else if(1<o){for(var a=Array(o),u=0;u<o;u++)a[u]=arguments[u+2];i.children=a}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)i[r]===void 0&&(i[r]=o[r]);return{$$typeof:ai,type:e,key:l,ref:s,props:i,_owner:Wo.current}}function ap(e,t){return{$$typeof:ai,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function Vo(e){return typeof e=="object"&&e!==null&&e.$$typeof===ai}function up(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Ka=/\/+/g;function Ql(e,t){return typeof e=="object"&&e!==null&&e.key!=null?up(""+e.key):t.toString(36)}function Bi(e,t,n,r,i){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var s=!1;if(e===null)s=!0;else switch(l){case"string":case"number":s=!0;break;case"object":switch(e.$$typeof){case ai:case qh:s=!0}}if(s)return s=e,i=i(s),e=r===""?"."+Ql(s,0):r,Za(i)?(n="",e!=null&&(n=e.replace(Ka,"$&/")+"/"),Bi(i,t,n,"",function(u){return u})):i!=null&&(Vo(i)&&(i=ap(i,n+(!i.key||s&&s.key===i.key?"":(""+i.key).replace(Ka,"$&/")+"/")+e)),t.push(i)),1;if(s=0,r=r===""?".":r+":",Za(e))for(var o=0;o<e.length;o++){l=e[o];var a=r+Ql(l,o);s+=Bi(l,t,n,a,i)}else if(a=op(e),typeof a=="function")for(e=a.call(e),o=0;!(l=e.next()).done;)l=l.value,a=r+Ql(l,o++),s+=Bi(l,t,n,a,i);else if(l==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return s}function gi(e,t,n){if(e==null)return e;var r=[],i=0;return Bi(e,r,"","",function(l){return t.call(n,l,i++)}),r}function cp(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var ke={current:null},Hi={transition:null},fp={ReactCurrentDispatcher:ke,ReactCurrentBatchConfig:Hi,ReactCurrentOwner:Wo};function ff(){throw Error("act(...) is not supported in production builds of React.")}z.Children={map:gi,forEach:function(e,t,n){gi(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return gi(e,function(){t++}),t},toArray:function(e){return gi(e,function(t){return t})||[]},only:function(e){if(!Vo(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};z.Component=ir;z.Fragment=Xh;z.Profiler=ep;z.PureComponent=jo;z.StrictMode=Jh;z.Suspense=ip;z.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=fp;z.act=ff;z.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=lf({},e.props),i=e.key,l=e.ref,s=e._owner;if(t!=null){if(t.ref!==void 0&&(l=t.ref,s=Wo.current),t.key!==void 0&&(i=""+t.key),e.type&&e.type.defaultProps)var o=e.type.defaultProps;for(a in t)af.call(t,a)&&!uf.hasOwnProperty(a)&&(r[a]=t[a]===void 0&&o!==void 0?o[a]:t[a])}var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){o=Array(a);for(var u=0;u<a;u++)o[u]=arguments[u+2];r.children=o}return{$$typeof:ai,type:e.type,key:i,ref:l,props:r,_owner:s}};z.createContext=function(e){return e={$$typeof:np,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:tp,_context:e},e.Consumer=e};z.createElement=cf;z.createFactory=function(e){var t=cf.bind(null,e);return t.type=e,t};z.createRef=function(){return{current:null}};z.forwardRef=function(e){return{$$typeof:rp,render:e}};z.isValidElement=Vo;z.lazy=function(e){return{$$typeof:sp,_payload:{_status:-1,_result:e},_init:cp}};z.memo=function(e,t){return{$$typeof:lp,type:e,compare:t===void 0?null:t}};z.startTransition=function(e){var t=Hi.transition;Hi.transition={};try{e()}finally{Hi.transition=t}};z.unstable_act=ff;z.useCallback=function(e,t){return ke.current.useCallback(e,t)};z.useContext=function(e){return ke.current.useContext(e)};z.useDebugValue=function(){};z.useDeferredValue=function(e){return ke.current.useDeferredValue(e)};z.useEffect=function(e,t){return ke.current.useEffect(e,t)};z.useId=function(){return ke.current.useId()};z.useImperativeHandle=function(e,t,n){return ke.current.useImperativeHandle(e,t,n)};z.useInsertionEffect=function(e,t){return ke.current.useInsertionEffect(e,t)};z.useLayoutEffect=function(e,t){return ke.current.useLayoutEffect(e,t)};z.useMemo=function(e,t){return ke.current.useMemo(e,t)};z.useReducer=function(e,t,n){return ke.current.useReducer(e,t,n)};z.useRef=function(e){return ke.current.useRef(e)};z.useState=function(e){return ke.current.useState(e)};z.useSyncExternalStore=function(e,t,n){return ke.current.useSyncExternalStore(e,t,n)};z.useTransition=function(){return ke.current.useTransition()};z.version="18.3.1";nf.exports=z;var U=nf.exports;const dp=ef(U);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var hp=U,pp=Symbol.for("react.element"),_p=Symbol.for("react.fragment"),mp=Object.prototype.hasOwnProperty,gp=hp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,vp={key:!0,ref:!0,__self:!0,__source:!0};function df(e,t,n){var r,i={},l=null,s=null;n!==void 0&&(l=""+n),t.key!==void 0&&(l=""+t.key),t.ref!==void 0&&(s=t.ref);for(r in t)mp.call(t,r)&&!vp.hasOwnProperty(r)&&(i[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)i[r]===void 0&&(i[r]=t[r]);return{$$typeof:pp,type:e,key:l,ref:s,props:i,_owner:gp.current}}Tl.Fragment=_p;Tl.jsx=df;Tl.jsxs=df;tf.exports=Tl;var w=tf.exports,Fs={},hf={exports:{}},Be={},pf={exports:{}},_f={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function t(C,P){var M=C.length;C.push(P);e:for(;0<M;){var D=M-1>>>1,K=C[D];if(0<i(K,P))C[D]=P,C[M]=K,M=D;else break e}}function n(C){return C.length===0?null:C[0]}function r(C){if(C.length===0)return null;var P=C[0],M=C.pop();if(M!==P){C[0]=M;e:for(var D=0,K=C.length,Te=K>>>1;D<Te;){var Oe=2*(D+1)-1,ht=C[Oe],Jt=Oe+1,mi=C[Jt];if(0>i(ht,M))Jt<K&&0>i(mi,ht)?(C[D]=mi,C[Jt]=M,D=Jt):(C[D]=ht,C[Oe]=M,D=Oe);else if(Jt<K&&0>i(mi,M))C[D]=mi,C[Jt]=M,D=Jt;else break e}}return P}function i(C,P){var M=C.sortIndex-P.sortIndex;return M!==0?M:C.id-P.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;e.unstable_now=function(){return l.now()}}else{var s=Date,o=s.now();e.unstable_now=function(){return s.now()-o}}var a=[],u=[],c=1,_=null,h=3,m=!1,v=!1,S=!1,E=typeof setTimeout=="function"?setTimeout:null,d=typeof clearTimeout=="function"?clearTimeout:null,f=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function p(C){for(var P=n(u);P!==null;){if(P.callback===null)r(u);else if(P.startTime<=C)r(u),P.sortIndex=P.expirationTime,t(a,P);else break;P=n(u)}}function g(C){if(S=!1,p(C),!v)if(n(a)!==null)v=!0,B(x);else{var P=n(u);P!==null&&j(g,P.startTime-C)}}function x(C,P){v=!1,S&&(S=!1,d(T),T=-1),m=!0;var M=h;try{for(p(P),_=n(a);_!==null&&(!(_.expirationTime>P)||C&&!L());){var D=_.callback;if(typeof D=="function"){_.callback=null,h=_.priorityLevel;var K=D(_.expirationTime<=P);P=e.unstable_now(),typeof K=="function"?_.callback=K:_===n(a)&&r(a),p(P)}else r(a);_=n(a)}if(_!==null)var Te=!0;else{var Oe=n(u);Oe!==null&&j(g,Oe.startTime-P),Te=!1}return Te}finally{_=null,h=M,m=!1}}var R=!1,y=null,T=-1,I=5,A=-1;function L(){return!(e.unstable_now()-A<I)}function O(){if(y!==null){var C=e.unstable_now();A=C;var P=!0;try{P=y(!0,C)}finally{P?b():(R=!1,y=null)}}else R=!1}var b;if(typeof f=="function")b=function(){f(O)};else if(typeof MessageChannel<"u"){var F=new MessageChannel,H=F.port2;F.port1.onmessage=O,b=function(){H.postMessage(null)}}else b=function(){E(O,0)};function B(C){y=C,R||(R=!0,b())}function j(C,P){T=E(function(){C(e.unstable_now())},P)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(C){C.callback=null},e.unstable_continueExecution=function(){v||m||(v=!0,B(x))},e.unstable_forceFrameRate=function(C){0>C||125<C?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):I=0<C?Math.floor(1e3/C):5},e.unstable_getCurrentPriorityLevel=function(){return h},e.unstable_getFirstCallbackNode=function(){return n(a)},e.unstable_next=function(C){switch(h){case 1:case 2:case 3:var P=3;break;default:P=h}var M=h;h=P;try{return C()}finally{h=M}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(C,P){switch(C){case 1:case 2:case 3:case 4:case 5:break;default:C=3}var M=h;h=C;try{return P()}finally{h=M}},e.unstable_scheduleCallback=function(C,P,M){var D=e.unstable_now();switch(typeof M=="object"&&M!==null?(M=M.delay,M=typeof M=="number"&&0<M?D+M:D):M=D,C){case 1:var K=-1;break;case 2:K=250;break;case 5:K=1073741823;break;case 4:K=1e4;break;default:K=5e3}return K=M+K,C={id:c++,callback:P,priorityLevel:C,startTime:M,expirationTime:K,sortIndex:-1},M>D?(C.sortIndex=M,t(u,C),n(a)===null&&C===n(u)&&(S?(d(T),T=-1):S=!0,j(g,M-D))):(C.sortIndex=K,t(a,C),v||m||(v=!0,B(x))),C},e.unstable_shouldYield=L,e.unstable_wrapCallback=function(C){var P=h;return function(){var M=h;h=P;try{return C.apply(this,arguments)}finally{h=M}}}})(_f);pf.exports=_f;var wp=pf.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var yp=U,ze=wp;function k(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var mf=new Set,Ur={};function Sn(e,t){Zn(e,t),Zn(e+"Capture",t)}function Zn(e,t){for(Ur[e]=t,e=0;e<t.length;e++)mf.add(t[e])}var xt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Us=Object.prototype.hasOwnProperty,Sp=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Qa={},Ya={};function xp(e){return Us.call(Ya,e)?!0:Us.call(Qa,e)?!1:Sp.test(e)?Ya[e]=!0:(Qa[e]=!0,!1)}function Ep(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function kp(e,t,n,r){if(t===null||typeof t>"u"||Ep(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function Re(e,t,n,r,i,l,s){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=i,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=l,this.removeEmptyString=s}var _e={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){_e[e]=new Re(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];_e[t]=new Re(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){_e[e]=new Re(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){_e[e]=new Re(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){_e[e]=new Re(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){_e[e]=new Re(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){_e[e]=new Re(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){_e[e]=new Re(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){_e[e]=new Re(e,5,!1,e.toLowerCase(),null,!1,!1)});var Go=/[\-:]([a-z])/g;function Zo(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Go,Zo);_e[t]=new Re(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Go,Zo);_e[t]=new Re(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Go,Zo);_e[t]=new Re(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){_e[e]=new Re(e,1,!1,e.toLowerCase(),null,!1,!1)});_e.xlinkHref=new Re("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){_e[e]=new Re(e,1,!1,e.toLowerCase(),null,!0,!0)});function Ko(e,t,n,r){var i=_e.hasOwnProperty(t)?_e[t]:null;(i!==null?i.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(kp(t,n,i,r)&&(n=null),r||i===null?xp(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):i.mustUseProperty?e[i.propertyName]=n===null?i.type===3?!1:"":n:(t=i.attributeName,r=i.attributeNamespace,n===null?e.removeAttribute(t):(i=i.type,n=i===3||i===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var Tt=yp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,vi=Symbol.for("react.element"),An=Symbol.for("react.portal"),Cn=Symbol.for("react.fragment"),Qo=Symbol.for("react.strict_mode"),zs=Symbol.for("react.profiler"),gf=Symbol.for("react.provider"),vf=Symbol.for("react.context"),Yo=Symbol.for("react.forward_ref"),Bs=Symbol.for("react.suspense"),Hs=Symbol.for("react.suspense_list"),qo=Symbol.for("react.memo"),Ct=Symbol.for("react.lazy"),wf=Symbol.for("react.offscreen"),qa=Symbol.iterator;function cr(e){return e===null||typeof e!="object"?null:(e=qa&&e[qa]||e["@@iterator"],typeof e=="function"?e:null)}var re=Object.assign,Yl;function wr(e){if(Yl===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);Yl=t&&t[1]||""}return`
`+Yl+e}var ql=!1;function Xl(e,t){if(!e||ql)return"";ql=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(u){var r=u}Reflect.construct(e,[],t)}else{try{t.call()}catch(u){r=u}e.call(t.prototype)}else{try{throw Error()}catch(u){r=u}e()}}catch(u){if(u&&r&&typeof u.stack=="string"){for(var i=u.stack.split(`
`),l=r.stack.split(`
`),s=i.length-1,o=l.length-1;1<=s&&0<=o&&i[s]!==l[o];)o--;for(;1<=s&&0<=o;s--,o--)if(i[s]!==l[o]){if(s!==1||o!==1)do if(s--,o--,0>o||i[s]!==l[o]){var a=`
`+i[s].replace(" at new "," at ");return e.displayName&&a.includes("<anonymous>")&&(a=a.replace("<anonymous>",e.displayName)),a}while(1<=s&&0<=o);break}}}finally{ql=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?wr(e):""}function Rp(e){switch(e.tag){case 5:return wr(e.type);case 16:return wr("Lazy");case 13:return wr("Suspense");case 19:return wr("SuspenseList");case 0:case 2:case 15:return e=Xl(e.type,!1),e;case 11:return e=Xl(e.type.render,!1),e;case 1:return e=Xl(e.type,!0),e;default:return""}}function js(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Cn:return"Fragment";case An:return"Portal";case zs:return"Profiler";case Qo:return"StrictMode";case Bs:return"Suspense";case Hs:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case vf:return(e.displayName||"Context")+".Consumer";case gf:return(e._context.displayName||"Context")+".Provider";case Yo:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case qo:return t=e.displayName||null,t!==null?t:js(e.type)||"Memo";case Ct:t=e._payload,e=e._init;try{return js(e(t))}catch{}}return null}function Tp(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return js(t);case 8:return t===Qo?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function Zt(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function yf(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Ap(e){var t=yf(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var i=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return i.call(this)},set:function(s){r=""+s,l.call(this,s)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(s){r=""+s},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function wi(e){e._valueTracker||(e._valueTracker=Ap(e))}function Sf(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=yf(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function Ji(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function $s(e,t){var n=t.checked;return re({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function Xa(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=Zt(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function xf(e,t){t=t.checked,t!=null&&Ko(e,"checked",t,!1)}function Ws(e,t){xf(e,t);var n=Zt(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?Vs(e,t.type,n):t.hasOwnProperty("defaultValue")&&Vs(e,t.type,Zt(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function Ja(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function Vs(e,t,n){(t!=="number"||Ji(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var yr=Array.isArray;function zn(e,t,n,r){if(e=e.options,t){t={};for(var i=0;i<n.length;i++)t["$"+n[i]]=!0;for(n=0;n<e.length;n++)i=t.hasOwnProperty("$"+e[n].value),e[n].selected!==i&&(e[n].selected=i),i&&r&&(e[n].defaultSelected=!0)}else{for(n=""+Zt(n),t=null,i=0;i<e.length;i++){if(e[i].value===n){e[i].selected=!0,r&&(e[i].defaultSelected=!0);return}t!==null||e[i].disabled||(t=e[i])}t!==null&&(t.selected=!0)}}function Gs(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(k(91));return re({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function eu(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(k(92));if(yr(n)){if(1<n.length)throw Error(k(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:Zt(n)}}function Ef(e,t){var n=Zt(t.value),r=Zt(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function tu(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function kf(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Zs(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?kf(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var yi,Rf=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,i){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,i)})}:e}(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(yi=yi||document.createElement("div"),yi.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=yi.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function zr(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Rr={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Cp=["Webkit","ms","Moz","O"];Object.keys(Rr).forEach(function(e){Cp.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Rr[t]=Rr[e]})});function Tf(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Rr.hasOwnProperty(e)&&Rr[e]?(""+t).trim():t+"px"}function Af(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,i=Tf(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,i):e[n]=i}}var Ip=re({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Ks(e,t){if(t){if(Ip[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(k(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(k(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(k(61))}if(t.style!=null&&typeof t.style!="object")throw Error(k(62))}}function Qs(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Ys=null;function Xo(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var qs=null,Bn=null,Hn=null;function nu(e){if(e=fi(e)){if(typeof qs!="function")throw Error(k(280));var t=e.stateNode;t&&(t=Pl(t),qs(e.stateNode,e.type,t))}}function Cf(e){Bn?Hn?Hn.push(e):Hn=[e]:Bn=e}function If(){if(Bn){var e=Bn,t=Hn;if(Hn=Bn=null,nu(e),t)for(e=0;e<t.length;e++)nu(t[e])}}function Nf(e,t){return e(t)}function Pf(){}var Jl=!1;function Mf(e,t,n){if(Jl)return e(t,n);Jl=!0;try{return Nf(e,t,n)}finally{Jl=!1,(Bn!==null||Hn!==null)&&(Pf(),If())}}function Br(e,t){var n=e.stateNode;if(n===null)return null;var r=Pl(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(k(231,t,typeof n));return n}var Xs=!1;if(xt)try{var fr={};Object.defineProperty(fr,"passive",{get:function(){Xs=!0}}),window.addEventListener("test",fr,fr),window.removeEventListener("test",fr,fr)}catch{Xs=!1}function Np(e,t,n,r,i,l,s,o,a){var u=Array.prototype.slice.call(arguments,3);try{t.apply(n,u)}catch(c){this.onError(c)}}var Tr=!1,el=null,tl=!1,Js=null,Pp={onError:function(e){Tr=!0,el=e}};function Mp(e,t,n,r,i,l,s,o,a){Tr=!1,el=null,Np.apply(Pp,arguments)}function Op(e,t,n,r,i,l,s,o,a){if(Mp.apply(this,arguments),Tr){if(Tr){var u=el;Tr=!1,el=null}else throw Error(k(198));tl||(tl=!0,Js=u)}}function xn(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function Of(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function ru(e){if(xn(e)!==e)throw Error(k(188))}function Lp(e){var t=e.alternate;if(!t){if(t=xn(e),t===null)throw Error(k(188));return t!==e?null:e}for(var n=e,r=t;;){var i=n.return;if(i===null)break;var l=i.alternate;if(l===null){if(r=i.return,r!==null){n=r;continue}break}if(i.child===l.child){for(l=i.child;l;){if(l===n)return ru(i),e;if(l===r)return ru(i),t;l=l.sibling}throw Error(k(188))}if(n.return!==r.return)n=i,r=l;else{for(var s=!1,o=i.child;o;){if(o===n){s=!0,n=i,r=l;break}if(o===r){s=!0,r=i,n=l;break}o=o.sibling}if(!s){for(o=l.child;o;){if(o===n){s=!0,n=l,r=i;break}if(o===r){s=!0,r=l,n=i;break}o=o.sibling}if(!s)throw Error(k(189))}}if(n.alternate!==r)throw Error(k(190))}if(n.tag!==3)throw Error(k(188));return n.stateNode.current===n?e:t}function Lf(e){return e=Lp(e),e!==null?Df(e):null}function Df(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=Df(e);if(t!==null)return t;e=e.sibling}return null}var bf=ze.unstable_scheduleCallback,iu=ze.unstable_cancelCallback,Dp=ze.unstable_shouldYield,bp=ze.unstable_requestPaint,le=ze.unstable_now,Fp=ze.unstable_getCurrentPriorityLevel,Jo=ze.unstable_ImmediatePriority,Ff=ze.unstable_UserBlockingPriority,nl=ze.unstable_NormalPriority,Up=ze.unstable_LowPriority,Uf=ze.unstable_IdlePriority,Al=null,ut=null;function zp(e){if(ut&&typeof ut.onCommitFiberRoot=="function")try{ut.onCommitFiberRoot(Al,e,void 0,(e.current.flags&128)===128)}catch{}}var et=Math.clz32?Math.clz32:jp,Bp=Math.log,Hp=Math.LN2;function jp(e){return e>>>=0,e===0?32:31-(Bp(e)/Hp|0)|0}var Si=64,xi=4194304;function Sr(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function rl(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,i=e.suspendedLanes,l=e.pingedLanes,s=n&268435455;if(s!==0){var o=s&~i;o!==0?r=Sr(o):(l&=s,l!==0&&(r=Sr(l)))}else s=n&~i,s!==0?r=Sr(s):l!==0&&(r=Sr(l));if(r===0)return 0;if(t!==0&&t!==r&&!(t&i)&&(i=r&-r,l=t&-t,i>=l||i===16&&(l&4194240)!==0))return t;if(r&4&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-et(t),i=1<<n,r|=e[n],t&=~i;return r}function $p(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Wp(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,i=e.expirationTimes,l=e.pendingLanes;0<l;){var s=31-et(l),o=1<<s,a=i[s];a===-1?(!(o&n)||o&r)&&(i[s]=$p(o,t)):a<=t&&(e.expiredLanes|=o),l&=~o}}function eo(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function zf(){var e=Si;return Si<<=1,!(Si&4194240)&&(Si=64),e}function es(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function ui(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-et(t),e[t]=n}function Vp(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var i=31-et(n),l=1<<i;t[i]=0,r[i]=-1,e[i]=-1,n&=~l}}function ea(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-et(n),i=1<<r;i&t|e[r]&t&&(e[r]|=t),n&=~i}}var Z=0;function Bf(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var Hf,ta,jf,$f,Wf,to=!1,Ei=[],bt=null,Ft=null,Ut=null,Hr=new Map,jr=new Map,Nt=[],Gp="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function lu(e,t){switch(e){case"focusin":case"focusout":bt=null;break;case"dragenter":case"dragleave":Ft=null;break;case"mouseover":case"mouseout":Ut=null;break;case"pointerover":case"pointerout":Hr.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":jr.delete(t.pointerId)}}function dr(e,t,n,r,i,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:l,targetContainers:[i]},t!==null&&(t=fi(t),t!==null&&ta(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,i!==null&&t.indexOf(i)===-1&&t.push(i),e)}function Zp(e,t,n,r,i){switch(t){case"focusin":return bt=dr(bt,e,t,n,r,i),!0;case"dragenter":return Ft=dr(Ft,e,t,n,r,i),!0;case"mouseover":return Ut=dr(Ut,e,t,n,r,i),!0;case"pointerover":var l=i.pointerId;return Hr.set(l,dr(Hr.get(l)||null,e,t,n,r,i)),!0;case"gotpointercapture":return l=i.pointerId,jr.set(l,dr(jr.get(l)||null,e,t,n,r,i)),!0}return!1}function Vf(e){var t=rn(e.target);if(t!==null){var n=xn(t);if(n!==null){if(t=n.tag,t===13){if(t=Of(n),t!==null){e.blockedOn=t,Wf(e.priority,function(){jf(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function ji(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=no(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);Ys=r,n.target.dispatchEvent(r),Ys=null}else return t=fi(n),t!==null&&ta(t),e.blockedOn=n,!1;t.shift()}return!0}function su(e,t,n){ji(e)&&n.delete(t)}function Kp(){to=!1,bt!==null&&ji(bt)&&(bt=null),Ft!==null&&ji(Ft)&&(Ft=null),Ut!==null&&ji(Ut)&&(Ut=null),Hr.forEach(su),jr.forEach(su)}function hr(e,t){e.blockedOn===t&&(e.blockedOn=null,to||(to=!0,ze.unstable_scheduleCallback(ze.unstable_NormalPriority,Kp)))}function $r(e){function t(i){return hr(i,e)}if(0<Ei.length){hr(Ei[0],e);for(var n=1;n<Ei.length;n++){var r=Ei[n];r.blockedOn===e&&(r.blockedOn=null)}}for(bt!==null&&hr(bt,e),Ft!==null&&hr(Ft,e),Ut!==null&&hr(Ut,e),Hr.forEach(t),jr.forEach(t),n=0;n<Nt.length;n++)r=Nt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<Nt.length&&(n=Nt[0],n.blockedOn===null);)Vf(n),n.blockedOn===null&&Nt.shift()}var jn=Tt.ReactCurrentBatchConfig,il=!0;function Qp(e,t,n,r){var i=Z,l=jn.transition;jn.transition=null;try{Z=1,na(e,t,n,r)}finally{Z=i,jn.transition=l}}function Yp(e,t,n,r){var i=Z,l=jn.transition;jn.transition=null;try{Z=4,na(e,t,n,r)}finally{Z=i,jn.transition=l}}function na(e,t,n,r){if(il){var i=no(e,t,n,r);if(i===null)cs(e,t,r,ll,n),lu(e,r);else if(Zp(i,e,t,n,r))r.stopPropagation();else if(lu(e,r),t&4&&-1<Gp.indexOf(e)){for(;i!==null;){var l=fi(i);if(l!==null&&Hf(l),l=no(e,t,n,r),l===null&&cs(e,t,r,ll,n),l===i)break;i=l}i!==null&&r.stopPropagation()}else cs(e,t,r,null,n)}}var ll=null;function no(e,t,n,r){if(ll=null,e=Xo(r),e=rn(e),e!==null)if(t=xn(e),t===null)e=null;else if(n=t.tag,n===13){if(e=Of(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return ll=e,null}function Gf(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Fp()){case Jo:return 1;case Ff:return 4;case nl:case Up:return 16;case Uf:return 536870912;default:return 16}default:return 16}}var Ot=null,ra=null,$i=null;function Zf(){if($i)return $i;var e,t=ra,n=t.length,r,i="value"in Ot?Ot.value:Ot.textContent,l=i.length;for(e=0;e<n&&t[e]===i[e];e++);var s=n-e;for(r=1;r<=s&&t[n-r]===i[l-r];r++);return $i=i.slice(e,1<r?1-r:void 0)}function Wi(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function ki(){return!0}function ou(){return!1}function He(e){function t(n,r,i,l,s){this._reactName=n,this._targetInst=i,this.type=r,this.nativeEvent=l,this.target=s,this.currentTarget=null;for(var o in e)e.hasOwnProperty(o)&&(n=e[o],this[o]=n?n(l):l[o]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?ki:ou,this.isPropagationStopped=ou,this}return re(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=ki)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=ki)},persist:function(){},isPersistent:ki}),t}var lr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ia=He(lr),ci=re({},lr,{view:0,detail:0}),qp=He(ci),ts,ns,pr,Cl=re({},ci,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:la,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==pr&&(pr&&e.type==="mousemove"?(ts=e.screenX-pr.screenX,ns=e.screenY-pr.screenY):ns=ts=0,pr=e),ts)},movementY:function(e){return"movementY"in e?e.movementY:ns}}),au=He(Cl),Xp=re({},Cl,{dataTransfer:0}),Jp=He(Xp),e0=re({},ci,{relatedTarget:0}),rs=He(e0),t0=re({},lr,{animationName:0,elapsedTime:0,pseudoElement:0}),n0=He(t0),r0=re({},lr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),i0=He(r0),l0=re({},lr,{data:0}),uu=He(l0),s0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},o0={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},a0={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function u0(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=a0[e])?!!t[e]:!1}function la(){return u0}var c0=re({},ci,{key:function(e){if(e.key){var t=s0[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Wi(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?o0[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:la,charCode:function(e){return e.type==="keypress"?Wi(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Wi(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),f0=He(c0),d0=re({},Cl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),cu=He(d0),h0=re({},ci,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:la}),p0=He(h0),_0=re({},lr,{propertyName:0,elapsedTime:0,pseudoElement:0}),m0=He(_0),g0=re({},Cl,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),v0=He(g0),w0=[9,13,27,32],sa=xt&&"CompositionEvent"in window,Ar=null;xt&&"documentMode"in document&&(Ar=document.documentMode);var y0=xt&&"TextEvent"in window&&!Ar,Kf=xt&&(!sa||Ar&&8<Ar&&11>=Ar),fu=" ",du=!1;function Qf(e,t){switch(e){case"keyup":return w0.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Yf(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var In=!1;function S0(e,t){switch(e){case"compositionend":return Yf(t);case"keypress":return t.which!==32?null:(du=!0,fu);case"textInput":return e=t.data,e===fu&&du?null:e;default:return null}}function x0(e,t){if(In)return e==="compositionend"||!sa&&Qf(e,t)?(e=Zf(),$i=ra=Ot=null,In=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Kf&&t.locale!=="ko"?null:t.data;default:return null}}var E0={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function hu(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!E0[e.type]:t==="textarea"}function qf(e,t,n,r){Cf(r),t=sl(t,"onChange"),0<t.length&&(n=new ia("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var Cr=null,Wr=null;function k0(e){ad(e,0)}function Il(e){var t=Mn(e);if(Sf(t))return e}function R0(e,t){if(e==="change")return t}var Xf=!1;if(xt){var is;if(xt){var ls="oninput"in document;if(!ls){var pu=document.createElement("div");pu.setAttribute("oninput","return;"),ls=typeof pu.oninput=="function"}is=ls}else is=!1;Xf=is&&(!document.documentMode||9<document.documentMode)}function _u(){Cr&&(Cr.detachEvent("onpropertychange",Jf),Wr=Cr=null)}function Jf(e){if(e.propertyName==="value"&&Il(Wr)){var t=[];qf(t,Wr,e,Xo(e)),Mf(k0,t)}}function T0(e,t,n){e==="focusin"?(_u(),Cr=t,Wr=n,Cr.attachEvent("onpropertychange",Jf)):e==="focusout"&&_u()}function A0(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Il(Wr)}function C0(e,t){if(e==="click")return Il(t)}function I0(e,t){if(e==="input"||e==="change")return Il(t)}function N0(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var nt=typeof Object.is=="function"?Object.is:N0;function Vr(e,t){if(nt(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var i=n[r];if(!Us.call(t,i)||!nt(e[i],t[i]))return!1}return!0}function mu(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function gu(e,t){var n=mu(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=mu(n)}}function ed(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?ed(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function td(){for(var e=window,t=Ji();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=Ji(e.document)}return t}function oa(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function P0(e){var t=td(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&ed(n.ownerDocument.documentElement,n)){if(r!==null&&oa(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var i=n.textContent.length,l=Math.min(r.start,i);r=r.end===void 0?l:Math.min(r.end,i),!e.extend&&l>r&&(i=r,r=l,l=i),i=gu(n,l);var s=gu(n,r);i&&s&&(e.rangeCount!==1||e.anchorNode!==i.node||e.anchorOffset!==i.offset||e.focusNode!==s.node||e.focusOffset!==s.offset)&&(t=t.createRange(),t.setStart(i.node,i.offset),e.removeAllRanges(),l>r?(e.addRange(t),e.extend(s.node,s.offset)):(t.setEnd(s.node,s.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var M0=xt&&"documentMode"in document&&11>=document.documentMode,Nn=null,ro=null,Ir=null,io=!1;function vu(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;io||Nn==null||Nn!==Ji(r)||(r=Nn,"selectionStart"in r&&oa(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Ir&&Vr(Ir,r)||(Ir=r,r=sl(ro,"onSelect"),0<r.length&&(t=new ia("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Nn)))}function Ri(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Pn={animationend:Ri("Animation","AnimationEnd"),animationiteration:Ri("Animation","AnimationIteration"),animationstart:Ri("Animation","AnimationStart"),transitionend:Ri("Transition","TransitionEnd")},ss={},nd={};xt&&(nd=document.createElement("div").style,"AnimationEvent"in window||(delete Pn.animationend.animation,delete Pn.animationiteration.animation,delete Pn.animationstart.animation),"TransitionEvent"in window||delete Pn.transitionend.transition);function Nl(e){if(ss[e])return ss[e];if(!Pn[e])return e;var t=Pn[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in nd)return ss[e]=t[n];return e}var rd=Nl("animationend"),id=Nl("animationiteration"),ld=Nl("animationstart"),sd=Nl("transitionend"),od=new Map,wu="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Qt(e,t){od.set(e,t),Sn(t,[e])}for(var os=0;os<wu.length;os++){var as=wu[os],O0=as.toLowerCase(),L0=as[0].toUpperCase()+as.slice(1);Qt(O0,"on"+L0)}Qt(rd,"onAnimationEnd");Qt(id,"onAnimationIteration");Qt(ld,"onAnimationStart");Qt("dblclick","onDoubleClick");Qt("focusin","onFocus");Qt("focusout","onBlur");Qt(sd,"onTransitionEnd");Zn("onMouseEnter",["mouseout","mouseover"]);Zn("onMouseLeave",["mouseout","mouseover"]);Zn("onPointerEnter",["pointerout","pointerover"]);Zn("onPointerLeave",["pointerout","pointerover"]);Sn("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Sn("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Sn("onBeforeInput",["compositionend","keypress","textInput","paste"]);Sn("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Sn("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Sn("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var xr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),D0=new Set("cancel close invalid load scroll toggle".split(" ").concat(xr));function yu(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,Op(r,t,void 0,e),e.currentTarget=null}function ad(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],i=r.event;r=r.listeners;e:{var l=void 0;if(t)for(var s=r.length-1;0<=s;s--){var o=r[s],a=o.instance,u=o.currentTarget;if(o=o.listener,a!==l&&i.isPropagationStopped())break e;yu(i,o,u),l=a}else for(s=0;s<r.length;s++){if(o=r[s],a=o.instance,u=o.currentTarget,o=o.listener,a!==l&&i.isPropagationStopped())break e;yu(i,o,u),l=a}}}if(tl)throw e=Js,tl=!1,Js=null,e}function Y(e,t){var n=t[uo];n===void 0&&(n=t[uo]=new Set);var r=e+"__bubble";n.has(r)||(ud(t,e,2,!1),n.add(r))}function us(e,t,n){var r=0;t&&(r|=4),ud(n,e,r,t)}var Ti="_reactListening"+Math.random().toString(36).slice(2);function Gr(e){if(!e[Ti]){e[Ti]=!0,mf.forEach(function(n){n!=="selectionchange"&&(D0.has(n)||us(n,!1,e),us(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Ti]||(t[Ti]=!0,us("selectionchange",!1,t))}}function ud(e,t,n,r){switch(Gf(t)){case 1:var i=Qp;break;case 4:i=Yp;break;default:i=na}n=i.bind(null,t,n,e),i=void 0,!Xs||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(i=!0),r?i!==void 0?e.addEventListener(t,n,{capture:!0,passive:i}):e.addEventListener(t,n,!0):i!==void 0?e.addEventListener(t,n,{passive:i}):e.addEventListener(t,n,!1)}function cs(e,t,n,r,i){var l=r;if(!(t&1)&&!(t&2)&&r!==null)e:for(;;){if(r===null)return;var s=r.tag;if(s===3||s===4){var o=r.stateNode.containerInfo;if(o===i||o.nodeType===8&&o.parentNode===i)break;if(s===4)for(s=r.return;s!==null;){var a=s.tag;if((a===3||a===4)&&(a=s.stateNode.containerInfo,a===i||a.nodeType===8&&a.parentNode===i))return;s=s.return}for(;o!==null;){if(s=rn(o),s===null)return;if(a=s.tag,a===5||a===6){r=l=s;continue e}o=o.parentNode}}r=r.return}Mf(function(){var u=l,c=Xo(n),_=[];e:{var h=od.get(e);if(h!==void 0){var m=ia,v=e;switch(e){case"keypress":if(Wi(n)===0)break e;case"keydown":case"keyup":m=f0;break;case"focusin":v="focus",m=rs;break;case"focusout":v="blur",m=rs;break;case"beforeblur":case"afterblur":m=rs;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":m=au;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":m=Jp;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":m=p0;break;case rd:case id:case ld:m=n0;break;case sd:m=m0;break;case"scroll":m=qp;break;case"wheel":m=v0;break;case"copy":case"cut":case"paste":m=i0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":m=cu}var S=(t&4)!==0,E=!S&&e==="scroll",d=S?h!==null?h+"Capture":null:h;S=[];for(var f=u,p;f!==null;){p=f;var g=p.stateNode;if(p.tag===5&&g!==null&&(p=g,d!==null&&(g=Br(f,d),g!=null&&S.push(Zr(f,g,p)))),E)break;f=f.return}0<S.length&&(h=new m(h,v,null,n,c),_.push({event:h,listeners:S}))}}if(!(t&7)){e:{if(h=e==="mouseover"||e==="pointerover",m=e==="mouseout"||e==="pointerout",h&&n!==Ys&&(v=n.relatedTarget||n.fromElement)&&(rn(v)||v[Et]))break e;if((m||h)&&(h=c.window===c?c:(h=c.ownerDocument)?h.defaultView||h.parentWindow:window,m?(v=n.relatedTarget||n.toElement,m=u,v=v?rn(v):null,v!==null&&(E=xn(v),v!==E||v.tag!==5&&v.tag!==6)&&(v=null)):(m=null,v=u),m!==v)){if(S=au,g="onMouseLeave",d="onMouseEnter",f="mouse",(e==="pointerout"||e==="pointerover")&&(S=cu,g="onPointerLeave",d="onPointerEnter",f="pointer"),E=m==null?h:Mn(m),p=v==null?h:Mn(v),h=new S(g,f+"leave",m,n,c),h.target=E,h.relatedTarget=p,g=null,rn(c)===u&&(S=new S(d,f+"enter",v,n,c),S.target=p,S.relatedTarget=E,g=S),E=g,m&&v)t:{for(S=m,d=v,f=0,p=S;p;p=kn(p))f++;for(p=0,g=d;g;g=kn(g))p++;for(;0<f-p;)S=kn(S),f--;for(;0<p-f;)d=kn(d),p--;for(;f--;){if(S===d||d!==null&&S===d.alternate)break t;S=kn(S),d=kn(d)}S=null}else S=null;m!==null&&Su(_,h,m,S,!1),v!==null&&E!==null&&Su(_,E,v,S,!0)}}e:{if(h=u?Mn(u):window,m=h.nodeName&&h.nodeName.toLowerCase(),m==="select"||m==="input"&&h.type==="file")var x=R0;else if(hu(h))if(Xf)x=I0;else{x=A0;var R=T0}else(m=h.nodeName)&&m.toLowerCase()==="input"&&(h.type==="checkbox"||h.type==="radio")&&(x=C0);if(x&&(x=x(e,u))){qf(_,x,n,c);break e}R&&R(e,h,u),e==="focusout"&&(R=h._wrapperState)&&R.controlled&&h.type==="number"&&Vs(h,"number",h.value)}switch(R=u?Mn(u):window,e){case"focusin":(hu(R)||R.contentEditable==="true")&&(Nn=R,ro=u,Ir=null);break;case"focusout":Ir=ro=Nn=null;break;case"mousedown":io=!0;break;case"contextmenu":case"mouseup":case"dragend":io=!1,vu(_,n,c);break;case"selectionchange":if(M0)break;case"keydown":case"keyup":vu(_,n,c)}var y;if(sa)e:{switch(e){case"compositionstart":var T="onCompositionStart";break e;case"compositionend":T="onCompositionEnd";break e;case"compositionupdate":T="onCompositionUpdate";break e}T=void 0}else In?Qf(e,n)&&(T="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(T="onCompositionStart");T&&(Kf&&n.locale!=="ko"&&(In||T!=="onCompositionStart"?T==="onCompositionEnd"&&In&&(y=Zf()):(Ot=c,ra="value"in Ot?Ot.value:Ot.textContent,In=!0)),R=sl(u,T),0<R.length&&(T=new uu(T,e,null,n,c),_.push({event:T,listeners:R}),y?T.data=y:(y=Yf(n),y!==null&&(T.data=y)))),(y=y0?S0(e,n):x0(e,n))&&(u=sl(u,"onBeforeInput"),0<u.length&&(c=new uu("onBeforeInput","beforeinput",null,n,c),_.push({event:c,listeners:u}),c.data=y))}ad(_,t)})}function Zr(e,t,n){return{instance:e,listener:t,currentTarget:n}}function sl(e,t){for(var n=t+"Capture",r=[];e!==null;){var i=e,l=i.stateNode;i.tag===5&&l!==null&&(i=l,l=Br(e,n),l!=null&&r.unshift(Zr(e,l,i)),l=Br(e,t),l!=null&&r.push(Zr(e,l,i))),e=e.return}return r}function kn(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function Su(e,t,n,r,i){for(var l=t._reactName,s=[];n!==null&&n!==r;){var o=n,a=o.alternate,u=o.stateNode;if(a!==null&&a===r)break;o.tag===5&&u!==null&&(o=u,i?(a=Br(n,l),a!=null&&s.unshift(Zr(n,a,o))):i||(a=Br(n,l),a!=null&&s.push(Zr(n,a,o)))),n=n.return}s.length!==0&&e.push({event:t,listeners:s})}var b0=/\r\n?/g,F0=/\u0000|\uFFFD/g;function xu(e){return(typeof e=="string"?e:""+e).replace(b0,`
`).replace(F0,"")}function Ai(e,t,n){if(t=xu(t),xu(e)!==t&&n)throw Error(k(425))}function ol(){}var lo=null,so=null;function oo(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var ao=typeof setTimeout=="function"?setTimeout:void 0,U0=typeof clearTimeout=="function"?clearTimeout:void 0,Eu=typeof Promise=="function"?Promise:void 0,z0=typeof queueMicrotask=="function"?queueMicrotask:typeof Eu<"u"?function(e){return Eu.resolve(null).then(e).catch(B0)}:ao;function B0(e){setTimeout(function(){throw e})}function fs(e,t){var n=t,r=0;do{var i=n.nextSibling;if(e.removeChild(n),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(r===0){e.removeChild(i),$r(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=i}while(n);$r(t)}function zt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function ku(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var sr=Math.random().toString(36).slice(2),ot="__reactFiber$"+sr,Kr="__reactProps$"+sr,Et="__reactContainer$"+sr,uo="__reactEvents$"+sr,H0="__reactListeners$"+sr,j0="__reactHandles$"+sr;function rn(e){var t=e[ot];if(t)return t;for(var n=e.parentNode;n;){if(t=n[Et]||n[ot]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=ku(e);e!==null;){if(n=e[ot])return n;e=ku(e)}return t}e=n,n=e.parentNode}return null}function fi(e){return e=e[ot]||e[Et],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Mn(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(k(33))}function Pl(e){return e[Kr]||null}var co=[],On=-1;function Yt(e){return{current:e}}function q(e){0>On||(e.current=co[On],co[On]=null,On--)}function Q(e,t){On++,co[On]=e.current,e.current=t}var Kt={},we=Yt(Kt),Ne=Yt(!1),dn=Kt;function Kn(e,t){var n=e.type.contextTypes;if(!n)return Kt;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var i={},l;for(l in n)i[l]=t[l];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=i),i}function Pe(e){return e=e.childContextTypes,e!=null}function al(){q(Ne),q(we)}function Ru(e,t,n){if(we.current!==Kt)throw Error(k(168));Q(we,t),Q(Ne,n)}function cd(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var i in r)if(!(i in t))throw Error(k(108,Tp(e)||"Unknown",i));return re({},n,r)}function ul(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Kt,dn=we.current,Q(we,e),Q(Ne,Ne.current),!0}function Tu(e,t,n){var r=e.stateNode;if(!r)throw Error(k(169));n?(e=cd(e,t,dn),r.__reactInternalMemoizedMergedChildContext=e,q(Ne),q(we),Q(we,e)):q(Ne),Q(Ne,n)}var mt=null,Ml=!1,ds=!1;function fd(e){mt===null?mt=[e]:mt.push(e)}function $0(e){Ml=!0,fd(e)}function qt(){if(!ds&&mt!==null){ds=!0;var e=0,t=Z;try{var n=mt;for(Z=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}mt=null,Ml=!1}catch(i){throw mt!==null&&(mt=mt.slice(e+1)),bf(Jo,qt),i}finally{Z=t,ds=!1}}return null}var Ln=[],Dn=0,cl=null,fl=0,je=[],$e=0,hn=null,vt=1,wt="";function en(e,t){Ln[Dn++]=fl,Ln[Dn++]=cl,cl=e,fl=t}function dd(e,t,n){je[$e++]=vt,je[$e++]=wt,je[$e++]=hn,hn=e;var r=vt;e=wt;var i=32-et(r)-1;r&=~(1<<i),n+=1;var l=32-et(t)+i;if(30<l){var s=i-i%5;l=(r&(1<<s)-1).toString(32),r>>=s,i-=s,vt=1<<32-et(t)+i|n<<i|r,wt=l+e}else vt=1<<l|n<<i|r,wt=e}function aa(e){e.return!==null&&(en(e,1),dd(e,1,0))}function ua(e){for(;e===cl;)cl=Ln[--Dn],Ln[Dn]=null,fl=Ln[--Dn],Ln[Dn]=null;for(;e===hn;)hn=je[--$e],je[$e]=null,wt=je[--$e],je[$e]=null,vt=je[--$e],je[$e]=null}var Ue=null,be=null,J=!1,Je=null;function hd(e,t){var n=Ve(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function Au(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,Ue=e,be=zt(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,Ue=e,be=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=hn!==null?{id:vt,overflow:wt}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=Ve(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,Ue=e,be=null,!0):!1;default:return!1}}function fo(e){return(e.mode&1)!==0&&(e.flags&128)===0}function ho(e){if(J){var t=be;if(t){var n=t;if(!Au(e,t)){if(fo(e))throw Error(k(418));t=zt(n.nextSibling);var r=Ue;t&&Au(e,t)?hd(r,n):(e.flags=e.flags&-4097|2,J=!1,Ue=e)}}else{if(fo(e))throw Error(k(418));e.flags=e.flags&-4097|2,J=!1,Ue=e}}}function Cu(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;Ue=e}function Ci(e){if(e!==Ue)return!1;if(!J)return Cu(e),J=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!oo(e.type,e.memoizedProps)),t&&(t=be)){if(fo(e))throw pd(),Error(k(418));for(;t;)hd(e,t),t=zt(t.nextSibling)}if(Cu(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(k(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){be=zt(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}be=null}}else be=Ue?zt(e.stateNode.nextSibling):null;return!0}function pd(){for(var e=be;e;)e=zt(e.nextSibling)}function Qn(){be=Ue=null,J=!1}function ca(e){Je===null?Je=[e]:Je.push(e)}var W0=Tt.ReactCurrentBatchConfig;function _r(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(k(309));var r=n.stateNode}if(!r)throw Error(k(147,e));var i=r,l=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===l?t.ref:(t=function(s){var o=i.refs;s===null?delete o[l]:o[l]=s},t._stringRef=l,t)}if(typeof e!="string")throw Error(k(284));if(!n._owner)throw Error(k(290,e))}return e}function Ii(e,t){throw e=Object.prototype.toString.call(t),Error(k(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function Iu(e){var t=e._init;return t(e._payload)}function _d(e){function t(d,f){if(e){var p=d.deletions;p===null?(d.deletions=[f],d.flags|=16):p.push(f)}}function n(d,f){if(!e)return null;for(;f!==null;)t(d,f),f=f.sibling;return null}function r(d,f){for(d=new Map;f!==null;)f.key!==null?d.set(f.key,f):d.set(f.index,f),f=f.sibling;return d}function i(d,f){return d=$t(d,f),d.index=0,d.sibling=null,d}function l(d,f,p){return d.index=p,e?(p=d.alternate,p!==null?(p=p.index,p<f?(d.flags|=2,f):p):(d.flags|=2,f)):(d.flags|=1048576,f)}function s(d){return e&&d.alternate===null&&(d.flags|=2),d}function o(d,f,p,g){return f===null||f.tag!==6?(f=ws(p,d.mode,g),f.return=d,f):(f=i(f,p),f.return=d,f)}function a(d,f,p,g){var x=p.type;return x===Cn?c(d,f,p.props.children,g,p.key):f!==null&&(f.elementType===x||typeof x=="object"&&x!==null&&x.$$typeof===Ct&&Iu(x)===f.type)?(g=i(f,p.props),g.ref=_r(d,f,p),g.return=d,g):(g=qi(p.type,p.key,p.props,null,d.mode,g),g.ref=_r(d,f,p),g.return=d,g)}function u(d,f,p,g){return f===null||f.tag!==4||f.stateNode.containerInfo!==p.containerInfo||f.stateNode.implementation!==p.implementation?(f=ys(p,d.mode,g),f.return=d,f):(f=i(f,p.children||[]),f.return=d,f)}function c(d,f,p,g,x){return f===null||f.tag!==7?(f=fn(p,d.mode,g,x),f.return=d,f):(f=i(f,p),f.return=d,f)}function _(d,f,p){if(typeof f=="string"&&f!==""||typeof f=="number")return f=ws(""+f,d.mode,p),f.return=d,f;if(typeof f=="object"&&f!==null){switch(f.$$typeof){case vi:return p=qi(f.type,f.key,f.props,null,d.mode,p),p.ref=_r(d,null,f),p.return=d,p;case An:return f=ys(f,d.mode,p),f.return=d,f;case Ct:var g=f._init;return _(d,g(f._payload),p)}if(yr(f)||cr(f))return f=fn(f,d.mode,p,null),f.return=d,f;Ii(d,f)}return null}function h(d,f,p,g){var x=f!==null?f.key:null;if(typeof p=="string"&&p!==""||typeof p=="number")return x!==null?null:o(d,f,""+p,g);if(typeof p=="object"&&p!==null){switch(p.$$typeof){case vi:return p.key===x?a(d,f,p,g):null;case An:return p.key===x?u(d,f,p,g):null;case Ct:return x=p._init,h(d,f,x(p._payload),g)}if(yr(p)||cr(p))return x!==null?null:c(d,f,p,g,null);Ii(d,p)}return null}function m(d,f,p,g,x){if(typeof g=="string"&&g!==""||typeof g=="number")return d=d.get(p)||null,o(f,d,""+g,x);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case vi:return d=d.get(g.key===null?p:g.key)||null,a(f,d,g,x);case An:return d=d.get(g.key===null?p:g.key)||null,u(f,d,g,x);case Ct:var R=g._init;return m(d,f,p,R(g._payload),x)}if(yr(g)||cr(g))return d=d.get(p)||null,c(f,d,g,x,null);Ii(f,g)}return null}function v(d,f,p,g){for(var x=null,R=null,y=f,T=f=0,I=null;y!==null&&T<p.length;T++){y.index>T?(I=y,y=null):I=y.sibling;var A=h(d,y,p[T],g);if(A===null){y===null&&(y=I);break}e&&y&&A.alternate===null&&t(d,y),f=l(A,f,T),R===null?x=A:R.sibling=A,R=A,y=I}if(T===p.length)return n(d,y),J&&en(d,T),x;if(y===null){for(;T<p.length;T++)y=_(d,p[T],g),y!==null&&(f=l(y,f,T),R===null?x=y:R.sibling=y,R=y);return J&&en(d,T),x}for(y=r(d,y);T<p.length;T++)I=m(y,d,T,p[T],g),I!==null&&(e&&I.alternate!==null&&y.delete(I.key===null?T:I.key),f=l(I,f,T),R===null?x=I:R.sibling=I,R=I);return e&&y.forEach(function(L){return t(d,L)}),J&&en(d,T),x}function S(d,f,p,g){var x=cr(p);if(typeof x!="function")throw Error(k(150));if(p=x.call(p),p==null)throw Error(k(151));for(var R=x=null,y=f,T=f=0,I=null,A=p.next();y!==null&&!A.done;T++,A=p.next()){y.index>T?(I=y,y=null):I=y.sibling;var L=h(d,y,A.value,g);if(L===null){y===null&&(y=I);break}e&&y&&L.alternate===null&&t(d,y),f=l(L,f,T),R===null?x=L:R.sibling=L,R=L,y=I}if(A.done)return n(d,y),J&&en(d,T),x;if(y===null){for(;!A.done;T++,A=p.next())A=_(d,A.value,g),A!==null&&(f=l(A,f,T),R===null?x=A:R.sibling=A,R=A);return J&&en(d,T),x}for(y=r(d,y);!A.done;T++,A=p.next())A=m(y,d,T,A.value,g),A!==null&&(e&&A.alternate!==null&&y.delete(A.key===null?T:A.key),f=l(A,f,T),R===null?x=A:R.sibling=A,R=A);return e&&y.forEach(function(O){return t(d,O)}),J&&en(d,T),x}function E(d,f,p,g){if(typeof p=="object"&&p!==null&&p.type===Cn&&p.key===null&&(p=p.props.children),typeof p=="object"&&p!==null){switch(p.$$typeof){case vi:e:{for(var x=p.key,R=f;R!==null;){if(R.key===x){if(x=p.type,x===Cn){if(R.tag===7){n(d,R.sibling),f=i(R,p.props.children),f.return=d,d=f;break e}}else if(R.elementType===x||typeof x=="object"&&x!==null&&x.$$typeof===Ct&&Iu(x)===R.type){n(d,R.sibling),f=i(R,p.props),f.ref=_r(d,R,p),f.return=d,d=f;break e}n(d,R);break}else t(d,R);R=R.sibling}p.type===Cn?(f=fn(p.props.children,d.mode,g,p.key),f.return=d,d=f):(g=qi(p.type,p.key,p.props,null,d.mode,g),g.ref=_r(d,f,p),g.return=d,d=g)}return s(d);case An:e:{for(R=p.key;f!==null;){if(f.key===R)if(f.tag===4&&f.stateNode.containerInfo===p.containerInfo&&f.stateNode.implementation===p.implementation){n(d,f.sibling),f=i(f,p.children||[]),f.return=d,d=f;break e}else{n(d,f);break}else t(d,f);f=f.sibling}f=ys(p,d.mode,g),f.return=d,d=f}return s(d);case Ct:return R=p._init,E(d,f,R(p._payload),g)}if(yr(p))return v(d,f,p,g);if(cr(p))return S(d,f,p,g);Ii(d,p)}return typeof p=="string"&&p!==""||typeof p=="number"?(p=""+p,f!==null&&f.tag===6?(n(d,f.sibling),f=i(f,p),f.return=d,d=f):(n(d,f),f=ws(p,d.mode,g),f.return=d,d=f),s(d)):n(d,f)}return E}var Yn=_d(!0),md=_d(!1),dl=Yt(null),hl=null,bn=null,fa=null;function da(){fa=bn=hl=null}function ha(e){var t=dl.current;q(dl),e._currentValue=t}function po(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function $n(e,t){hl=e,fa=bn=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&t&&(Ce=!0),e.firstContext=null)}function Ze(e){var t=e._currentValue;if(fa!==e)if(e={context:e,memoizedValue:t,next:null},bn===null){if(hl===null)throw Error(k(308));bn=e,hl.dependencies={lanes:0,firstContext:e}}else bn=bn.next=e;return t}var ln=null;function pa(e){ln===null?ln=[e]:ln.push(e)}function gd(e,t,n,r){var i=t.interleaved;return i===null?(n.next=n,pa(t)):(n.next=i.next,i.next=n),t.interleaved=n,kt(e,r)}function kt(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var It=!1;function _a(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function vd(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function yt(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function Bt(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,$&2){var i=r.pending;return i===null?t.next=t:(t.next=i.next,i.next=t),r.pending=t,kt(e,n)}return i=r.interleaved,i===null?(t.next=t,pa(r)):(t.next=i.next,i.next=t),r.interleaved=t,kt(e,n)}function Vi(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ea(e,n)}}function Nu(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var i=null,l=null;if(n=n.firstBaseUpdate,n!==null){do{var s={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};l===null?i=l=s:l=l.next=s,n=n.next}while(n!==null);l===null?i=l=t:l=l.next=t}else i=l=t;n={baseState:r.baseState,firstBaseUpdate:i,lastBaseUpdate:l,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function pl(e,t,n,r){var i=e.updateQueue;It=!1;var l=i.firstBaseUpdate,s=i.lastBaseUpdate,o=i.shared.pending;if(o!==null){i.shared.pending=null;var a=o,u=a.next;a.next=null,s===null?l=u:s.next=u,s=a;var c=e.alternate;c!==null&&(c=c.updateQueue,o=c.lastBaseUpdate,o!==s&&(o===null?c.firstBaseUpdate=u:o.next=u,c.lastBaseUpdate=a))}if(l!==null){var _=i.baseState;s=0,c=u=a=null,o=l;do{var h=o.lane,m=o.eventTime;if((r&h)===h){c!==null&&(c=c.next={eventTime:m,lane:0,tag:o.tag,payload:o.payload,callback:o.callback,next:null});e:{var v=e,S=o;switch(h=t,m=n,S.tag){case 1:if(v=S.payload,typeof v=="function"){_=v.call(m,_,h);break e}_=v;break e;case 3:v.flags=v.flags&-65537|128;case 0:if(v=S.payload,h=typeof v=="function"?v.call(m,_,h):v,h==null)break e;_=re({},_,h);break e;case 2:It=!0}}o.callback!==null&&o.lane!==0&&(e.flags|=64,h=i.effects,h===null?i.effects=[o]:h.push(o))}else m={eventTime:m,lane:h,tag:o.tag,payload:o.payload,callback:o.callback,next:null},c===null?(u=c=m,a=_):c=c.next=m,s|=h;if(o=o.next,o===null){if(o=i.shared.pending,o===null)break;h=o,o=h.next,h.next=null,i.lastBaseUpdate=h,i.shared.pending=null}}while(!0);if(c===null&&(a=_),i.baseState=a,i.firstBaseUpdate=u,i.lastBaseUpdate=c,t=i.shared.interleaved,t!==null){i=t;do s|=i.lane,i=i.next;while(i!==t)}else l===null&&(i.shared.lanes=0);_n|=s,e.lanes=s,e.memoizedState=_}}function Pu(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],i=r.callback;if(i!==null){if(r.callback=null,r=n,typeof i!="function")throw Error(k(191,i));i.call(r)}}}var di={},ct=Yt(di),Qr=Yt(di),Yr=Yt(di);function sn(e){if(e===di)throw Error(k(174));return e}function ma(e,t){switch(Q(Yr,t),Q(Qr,e),Q(ct,di),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:Zs(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=Zs(t,e)}q(ct),Q(ct,t)}function qn(){q(ct),q(Qr),q(Yr)}function wd(e){sn(Yr.current);var t=sn(ct.current),n=Zs(t,e.type);t!==n&&(Q(Qr,e),Q(ct,n))}function ga(e){Qr.current===e&&(q(ct),q(Qr))}var te=Yt(0);function _l(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var hs=[];function va(){for(var e=0;e<hs.length;e++)hs[e]._workInProgressVersionPrimary=null;hs.length=0}var Gi=Tt.ReactCurrentDispatcher,ps=Tt.ReactCurrentBatchConfig,pn=0,ne=null,oe=null,ce=null,ml=!1,Nr=!1,qr=0,V0=0;function me(){throw Error(k(321))}function wa(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!nt(e[n],t[n]))return!1;return!0}function ya(e,t,n,r,i,l){if(pn=l,ne=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Gi.current=e===null||e.memoizedState===null?Q0:Y0,e=n(r,i),Nr){l=0;do{if(Nr=!1,qr=0,25<=l)throw Error(k(301));l+=1,ce=oe=null,t.updateQueue=null,Gi.current=q0,e=n(r,i)}while(Nr)}if(Gi.current=gl,t=oe!==null&&oe.next!==null,pn=0,ce=oe=ne=null,ml=!1,t)throw Error(k(300));return e}function Sa(){var e=qr!==0;return qr=0,e}function lt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ce===null?ne.memoizedState=ce=e:ce=ce.next=e,ce}function Ke(){if(oe===null){var e=ne.alternate;e=e!==null?e.memoizedState:null}else e=oe.next;var t=ce===null?ne.memoizedState:ce.next;if(t!==null)ce=t,oe=e;else{if(e===null)throw Error(k(310));oe=e,e={memoizedState:oe.memoizedState,baseState:oe.baseState,baseQueue:oe.baseQueue,queue:oe.queue,next:null},ce===null?ne.memoizedState=ce=e:ce=ce.next=e}return ce}function Xr(e,t){return typeof t=="function"?t(e):t}function _s(e){var t=Ke(),n=t.queue;if(n===null)throw Error(k(311));n.lastRenderedReducer=e;var r=oe,i=r.baseQueue,l=n.pending;if(l!==null){if(i!==null){var s=i.next;i.next=l.next,l.next=s}r.baseQueue=i=l,n.pending=null}if(i!==null){l=i.next,r=r.baseState;var o=s=null,a=null,u=l;do{var c=u.lane;if((pn&c)===c)a!==null&&(a=a.next={lane:0,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null}),r=u.hasEagerState?u.eagerState:e(r,u.action);else{var _={lane:c,action:u.action,hasEagerState:u.hasEagerState,eagerState:u.eagerState,next:null};a===null?(o=a=_,s=r):a=a.next=_,ne.lanes|=c,_n|=c}u=u.next}while(u!==null&&u!==l);a===null?s=r:a.next=o,nt(r,t.memoizedState)||(Ce=!0),t.memoizedState=r,t.baseState=s,t.baseQueue=a,n.lastRenderedState=r}if(e=n.interleaved,e!==null){i=e;do l=i.lane,ne.lanes|=l,_n|=l,i=i.next;while(i!==e)}else i===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function ms(e){var t=Ke(),n=t.queue;if(n===null)throw Error(k(311));n.lastRenderedReducer=e;var r=n.dispatch,i=n.pending,l=t.memoizedState;if(i!==null){n.pending=null;var s=i=i.next;do l=e(l,s.action),s=s.next;while(s!==i);nt(l,t.memoizedState)||(Ce=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),n.lastRenderedState=l}return[l,r]}function yd(){}function Sd(e,t){var n=ne,r=Ke(),i=t(),l=!nt(r.memoizedState,i);if(l&&(r.memoizedState=i,Ce=!0),r=r.queue,xa(kd.bind(null,n,r,e),[e]),r.getSnapshot!==t||l||ce!==null&&ce.memoizedState.tag&1){if(n.flags|=2048,Jr(9,Ed.bind(null,n,r,i,t),void 0,null),fe===null)throw Error(k(349));pn&30||xd(n,t,i)}return i}function xd(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=ne.updateQueue,t===null?(t={lastEffect:null,stores:null},ne.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Ed(e,t,n,r){t.value=n,t.getSnapshot=r,Rd(t)&&Td(e)}function kd(e,t,n){return n(function(){Rd(t)&&Td(e)})}function Rd(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!nt(e,n)}catch{return!0}}function Td(e){var t=kt(e,1);t!==null&&tt(t,e,1,-1)}function Mu(e){var t=lt();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Xr,lastRenderedState:e},t.queue=e,e=e.dispatch=K0.bind(null,ne,e),[t.memoizedState,e]}function Jr(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=ne.updateQueue,t===null?(t={lastEffect:null,stores:null},ne.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function Ad(){return Ke().memoizedState}function Zi(e,t,n,r){var i=lt();ne.flags|=e,i.memoizedState=Jr(1|t,n,void 0,r===void 0?null:r)}function Ol(e,t,n,r){var i=Ke();r=r===void 0?null:r;var l=void 0;if(oe!==null){var s=oe.memoizedState;if(l=s.destroy,r!==null&&wa(r,s.deps)){i.memoizedState=Jr(t,n,l,r);return}}ne.flags|=e,i.memoizedState=Jr(1|t,n,l,r)}function Ou(e,t){return Zi(8390656,8,e,t)}function xa(e,t){return Ol(2048,8,e,t)}function Cd(e,t){return Ol(4,2,e,t)}function Id(e,t){return Ol(4,4,e,t)}function Nd(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Pd(e,t,n){return n=n!=null?n.concat([e]):null,Ol(4,4,Nd.bind(null,t,e),n)}function Ea(){}function Md(e,t){var n=Ke();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&wa(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Od(e,t){var n=Ke();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&wa(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function Ld(e,t,n){return pn&21?(nt(n,t)||(n=zf(),ne.lanes|=n,_n|=n,e.baseState=!0),t):(e.baseState&&(e.baseState=!1,Ce=!0),e.memoizedState=n)}function G0(e,t){var n=Z;Z=n!==0&&4>n?n:4,e(!0);var r=ps.transition;ps.transition={};try{e(!1),t()}finally{Z=n,ps.transition=r}}function Dd(){return Ke().memoizedState}function Z0(e,t,n){var r=jt(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},bd(e))Fd(t,n);else if(n=gd(e,t,n,r),n!==null){var i=Ee();tt(n,e,r,i),Ud(n,t,r)}}function K0(e,t,n){var r=jt(e),i={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(bd(e))Fd(t,i);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var s=t.lastRenderedState,o=l(s,n);if(i.hasEagerState=!0,i.eagerState=o,nt(o,s)){var a=t.interleaved;a===null?(i.next=i,pa(t)):(i.next=a.next,a.next=i),t.interleaved=i;return}}catch{}finally{}n=gd(e,t,i,r),n!==null&&(i=Ee(),tt(n,e,r,i),Ud(n,t,r))}}function bd(e){var t=e.alternate;return e===ne||t!==null&&t===ne}function Fd(e,t){Nr=ml=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Ud(e,t,n){if(n&4194240){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,ea(e,n)}}var gl={readContext:Ze,useCallback:me,useContext:me,useEffect:me,useImperativeHandle:me,useInsertionEffect:me,useLayoutEffect:me,useMemo:me,useReducer:me,useRef:me,useState:me,useDebugValue:me,useDeferredValue:me,useTransition:me,useMutableSource:me,useSyncExternalStore:me,useId:me,unstable_isNewReconciler:!1},Q0={readContext:Ze,useCallback:function(e,t){return lt().memoizedState=[e,t===void 0?null:t],e},useContext:Ze,useEffect:Ou,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Zi(4194308,4,Nd.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Zi(4194308,4,e,t)},useInsertionEffect:function(e,t){return Zi(4,2,e,t)},useMemo:function(e,t){var n=lt();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=lt();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=Z0.bind(null,ne,e),[r.memoizedState,e]},useRef:function(e){var t=lt();return e={current:e},t.memoizedState=e},useState:Mu,useDebugValue:Ea,useDeferredValue:function(e){return lt().memoizedState=e},useTransition:function(){var e=Mu(!1),t=e[0];return e=G0.bind(null,e[1]),lt().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=ne,i=lt();if(J){if(n===void 0)throw Error(k(407));n=n()}else{if(n=t(),fe===null)throw Error(k(349));pn&30||xd(r,t,n)}i.memoizedState=n;var l={value:n,getSnapshot:t};return i.queue=l,Ou(kd.bind(null,r,l,e),[e]),r.flags|=2048,Jr(9,Ed.bind(null,r,l,n,t),void 0,null),n},useId:function(){var e=lt(),t=fe.identifierPrefix;if(J){var n=wt,r=vt;n=(r&~(1<<32-et(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=qr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=V0++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Y0={readContext:Ze,useCallback:Md,useContext:Ze,useEffect:xa,useImperativeHandle:Pd,useInsertionEffect:Cd,useLayoutEffect:Id,useMemo:Od,useReducer:_s,useRef:Ad,useState:function(){return _s(Xr)},useDebugValue:Ea,useDeferredValue:function(e){var t=Ke();return Ld(t,oe.memoizedState,e)},useTransition:function(){var e=_s(Xr)[0],t=Ke().memoizedState;return[e,t]},useMutableSource:yd,useSyncExternalStore:Sd,useId:Dd,unstable_isNewReconciler:!1},q0={readContext:Ze,useCallback:Md,useContext:Ze,useEffect:xa,useImperativeHandle:Pd,useInsertionEffect:Cd,useLayoutEffect:Id,useMemo:Od,useReducer:ms,useRef:Ad,useState:function(){return ms(Xr)},useDebugValue:Ea,useDeferredValue:function(e){var t=Ke();return oe===null?t.memoizedState=e:Ld(t,oe.memoizedState,e)},useTransition:function(){var e=ms(Xr)[0],t=Ke().memoizedState;return[e,t]},useMutableSource:yd,useSyncExternalStore:Sd,useId:Dd,unstable_isNewReconciler:!1};function qe(e,t){if(e&&e.defaultProps){t=re({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function _o(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:re({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Ll={isMounted:function(e){return(e=e._reactInternals)?xn(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=Ee(),i=jt(e),l=yt(r,i);l.payload=t,n!=null&&(l.callback=n),t=Bt(e,l,i),t!==null&&(tt(t,e,i,r),Vi(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=Ee(),i=jt(e),l=yt(r,i);l.tag=1,l.payload=t,n!=null&&(l.callback=n),t=Bt(e,l,i),t!==null&&(tt(t,e,i,r),Vi(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=Ee(),r=jt(e),i=yt(n,r);i.tag=2,t!=null&&(i.callback=t),t=Bt(e,i,r),t!==null&&(tt(t,e,r,n),Vi(t,e,r))}};function Lu(e,t,n,r,i,l,s){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,l,s):t.prototype&&t.prototype.isPureReactComponent?!Vr(n,r)||!Vr(i,l):!0}function zd(e,t,n){var r=!1,i=Kt,l=t.contextType;return typeof l=="object"&&l!==null?l=Ze(l):(i=Pe(t)?dn:we.current,r=t.contextTypes,l=(r=r!=null)?Kn(e,i):Kt),t=new t(n,l),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Ll,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=i,e.__reactInternalMemoizedMaskedChildContext=l),t}function Du(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Ll.enqueueReplaceState(t,t.state,null)}function mo(e,t,n,r){var i=e.stateNode;i.props=n,i.state=e.memoizedState,i.refs={},_a(e);var l=t.contextType;typeof l=="object"&&l!==null?i.context=Ze(l):(l=Pe(t)?dn:we.current,i.context=Kn(e,l)),i.state=e.memoizedState,l=t.getDerivedStateFromProps,typeof l=="function"&&(_o(e,t,l,n),i.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof i.getSnapshotBeforeUpdate=="function"||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(t=i.state,typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount(),t!==i.state&&Ll.enqueueReplaceState(i,i.state,null),pl(e,n,i,r),i.state=e.memoizedState),typeof i.componentDidMount=="function"&&(e.flags|=4194308)}function Xn(e,t){try{var n="",r=t;do n+=Rp(r),r=r.return;while(r);var i=n}catch(l){i=`
Error generating stack: `+l.message+`
`+l.stack}return{value:e,source:t,stack:i,digest:null}}function gs(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function go(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var X0=typeof WeakMap=="function"?WeakMap:Map;function Bd(e,t,n){n=yt(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){wl||(wl=!0,Ao=r),go(e,t)},n}function Hd(e,t,n){n=yt(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var i=t.value;n.payload=function(){return r(i)},n.callback=function(){go(e,t)}}var l=e.stateNode;return l!==null&&typeof l.componentDidCatch=="function"&&(n.callback=function(){go(e,t),typeof r!="function"&&(Ht===null?Ht=new Set([this]):Ht.add(this));var s=t.stack;this.componentDidCatch(t.value,{componentStack:s!==null?s:""})}),n}function bu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new X0;var i=new Set;r.set(t,i)}else i=r.get(t),i===void 0&&(i=new Set,r.set(t,i));i.has(n)||(i.add(n),e=d_.bind(null,e,t,n),t.then(e,e))}function Fu(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function Uu(e,t,n,r,i){return e.mode&1?(e.flags|=65536,e.lanes=i,e):(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=yt(-1,1),t.tag=2,Bt(n,t,1))),n.lanes|=1),e)}var J0=Tt.ReactCurrentOwner,Ce=!1;function Se(e,t,n,r){t.child=e===null?md(t,null,n,r):Yn(t,e.child,n,r)}function zu(e,t,n,r,i){n=n.render;var l=t.ref;return $n(t,i),r=ya(e,t,n,r,l,i),n=Sa(),e!==null&&!Ce?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~i,Rt(e,t,i)):(J&&n&&aa(t),t.flags|=1,Se(e,t,r,i),t.child)}function Bu(e,t,n,r,i){if(e===null){var l=n.type;return typeof l=="function"&&!Pa(l)&&l.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=l,jd(e,t,l,r,i)):(e=qi(n.type,null,r,t,t.mode,i),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,!(e.lanes&i)){var s=l.memoizedProps;if(n=n.compare,n=n!==null?n:Vr,n(s,r)&&e.ref===t.ref)return Rt(e,t,i)}return t.flags|=1,e=$t(l,r),e.ref=t.ref,e.return=t,t.child=e}function jd(e,t,n,r,i){if(e!==null){var l=e.memoizedProps;if(Vr(l,r)&&e.ref===t.ref)if(Ce=!1,t.pendingProps=r=l,(e.lanes&i)!==0)e.flags&131072&&(Ce=!0);else return t.lanes=e.lanes,Rt(e,t,i)}return vo(e,t,n,r,i)}function $d(e,t,n){var r=t.pendingProps,i=r.children,l=e!==null?e.memoizedState:null;if(r.mode==="hidden")if(!(t.mode&1))t.memoizedState={baseLanes:0,cachePool:null,transitions:null},Q(Un,De),De|=n;else{if(!(n&1073741824))return e=l!==null?l.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,Q(Un,De),De|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=l!==null?l.baseLanes:n,Q(Un,De),De|=r}else l!==null?(r=l.baseLanes|n,t.memoizedState=null):r=n,Q(Un,De),De|=r;return Se(e,t,i,n),t.child}function Wd(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function vo(e,t,n,r,i){var l=Pe(n)?dn:we.current;return l=Kn(t,l),$n(t,i),n=ya(e,t,n,r,l,i),r=Sa(),e!==null&&!Ce?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~i,Rt(e,t,i)):(J&&r&&aa(t),t.flags|=1,Se(e,t,n,i),t.child)}function Hu(e,t,n,r,i){if(Pe(n)){var l=!0;ul(t)}else l=!1;if($n(t,i),t.stateNode===null)Ki(e,t),zd(t,n,r),mo(t,n,r,i),r=!0;else if(e===null){var s=t.stateNode,o=t.memoizedProps;s.props=o;var a=s.context,u=n.contextType;typeof u=="object"&&u!==null?u=Ze(u):(u=Pe(n)?dn:we.current,u=Kn(t,u));var c=n.getDerivedStateFromProps,_=typeof c=="function"||typeof s.getSnapshotBeforeUpdate=="function";_||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(o!==r||a!==u)&&Du(t,s,r,u),It=!1;var h=t.memoizedState;s.state=h,pl(t,r,s,i),a=t.memoizedState,o!==r||h!==a||Ne.current||It?(typeof c=="function"&&(_o(t,n,c,r),a=t.memoizedState),(o=It||Lu(t,n,o,r,h,a,u))?(_||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=a),s.props=r,s.state=a,s.context=u,r=o):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{s=t.stateNode,vd(e,t),o=t.memoizedProps,u=t.type===t.elementType?o:qe(t.type,o),s.props=u,_=t.pendingProps,h=s.context,a=n.contextType,typeof a=="object"&&a!==null?a=Ze(a):(a=Pe(n)?dn:we.current,a=Kn(t,a));var m=n.getDerivedStateFromProps;(c=typeof m=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(o!==_||h!==a)&&Du(t,s,r,a),It=!1,h=t.memoizedState,s.state=h,pl(t,r,s,i);var v=t.memoizedState;o!==_||h!==v||Ne.current||It?(typeof m=="function"&&(_o(t,n,m,r),v=t.memoizedState),(u=It||Lu(t,n,u,r,h,v,a)||!1)?(c||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(r,v,a),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(r,v,a)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||o===e.memoizedProps&&h===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||o===e.memoizedProps&&h===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=v),s.props=r,s.state=v,s.context=a,r=u):(typeof s.componentDidUpdate!="function"||o===e.memoizedProps&&h===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||o===e.memoizedProps&&h===e.memoizedState||(t.flags|=1024),r=!1)}return wo(e,t,n,r,l,i)}function wo(e,t,n,r,i,l){Wd(e,t);var s=(t.flags&128)!==0;if(!r&&!s)return i&&Tu(t,n,!1),Rt(e,t,l);r=t.stateNode,J0.current=t;var o=s&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&s?(t.child=Yn(t,e.child,null,l),t.child=Yn(t,null,o,l)):Se(e,t,o,l),t.memoizedState=r.state,i&&Tu(t,n,!0),t.child}function Vd(e){var t=e.stateNode;t.pendingContext?Ru(e,t.pendingContext,t.pendingContext!==t.context):t.context&&Ru(e,t.context,!1),ma(e,t.containerInfo)}function ju(e,t,n,r,i){return Qn(),ca(i),t.flags|=256,Se(e,t,n,r),t.child}var yo={dehydrated:null,treeContext:null,retryLane:0};function So(e){return{baseLanes:e,cachePool:null,transitions:null}}function Gd(e,t,n){var r=t.pendingProps,i=te.current,l=!1,s=(t.flags&128)!==0,o;if((o=s)||(o=e!==null&&e.memoizedState===null?!1:(i&2)!==0),o?(l=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(i|=1),Q(te,i&1),e===null)return ho(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(t.mode&1?e.data==="$!"?t.lanes=8:t.lanes=1073741824:t.lanes=1,null):(s=r.children,e=r.fallback,l?(r=t.mode,l=t.child,s={mode:"hidden",children:s},!(r&1)&&l!==null?(l.childLanes=0,l.pendingProps=s):l=Fl(s,r,0,null),e=fn(e,r,n,null),l.return=t,e.return=t,l.sibling=e,t.child=l,t.child.memoizedState=So(n),t.memoizedState=yo,e):ka(t,s));if(i=e.memoizedState,i!==null&&(o=i.dehydrated,o!==null))return e_(e,t,s,r,o,i,n);if(l){l=r.fallback,s=t.mode,i=e.child,o=i.sibling;var a={mode:"hidden",children:r.children};return!(s&1)&&t.child!==i?(r=t.child,r.childLanes=0,r.pendingProps=a,t.deletions=null):(r=$t(i,a),r.subtreeFlags=i.subtreeFlags&14680064),o!==null?l=$t(o,l):(l=fn(l,s,n,null),l.flags|=2),l.return=t,r.return=t,r.sibling=l,t.child=r,r=l,l=t.child,s=e.child.memoizedState,s=s===null?So(n):{baseLanes:s.baseLanes|n,cachePool:null,transitions:s.transitions},l.memoizedState=s,l.childLanes=e.childLanes&~n,t.memoizedState=yo,r}return l=e.child,e=l.sibling,r=$t(l,{mode:"visible",children:r.children}),!(t.mode&1)&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function ka(e,t){return t=Fl({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Ni(e,t,n,r){return r!==null&&ca(r),Yn(t,e.child,null,n),e=ka(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function e_(e,t,n,r,i,l,s){if(n)return t.flags&256?(t.flags&=-257,r=gs(Error(k(422))),Ni(e,t,s,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(l=r.fallback,i=t.mode,r=Fl({mode:"visible",children:r.children},i,0,null),l=fn(l,i,s,null),l.flags|=2,r.return=t,l.return=t,r.sibling=l,t.child=r,t.mode&1&&Yn(t,e.child,null,s),t.child.memoizedState=So(s),t.memoizedState=yo,l);if(!(t.mode&1))return Ni(e,t,s,null);if(i.data==="$!"){if(r=i.nextSibling&&i.nextSibling.dataset,r)var o=r.dgst;return r=o,l=Error(k(419)),r=gs(l,r,void 0),Ni(e,t,s,r)}if(o=(s&e.childLanes)!==0,Ce||o){if(r=fe,r!==null){switch(s&-s){case 4:i=2;break;case 16:i=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:i=32;break;case 536870912:i=268435456;break;default:i=0}i=i&(r.suspendedLanes|s)?0:i,i!==0&&i!==l.retryLane&&(l.retryLane=i,kt(e,i),tt(r,e,i,-1))}return Na(),r=gs(Error(k(421))),Ni(e,t,s,r)}return i.data==="$?"?(t.flags|=128,t.child=e.child,t=h_.bind(null,e),i._reactRetry=t,null):(e=l.treeContext,be=zt(i.nextSibling),Ue=t,J=!0,Je=null,e!==null&&(je[$e++]=vt,je[$e++]=wt,je[$e++]=hn,vt=e.id,wt=e.overflow,hn=t),t=ka(t,r.children),t.flags|=4096,t)}function $u(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),po(e.return,t,n)}function vs(e,t,n,r,i){var l=e.memoizedState;l===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:i}:(l.isBackwards=t,l.rendering=null,l.renderingStartTime=0,l.last=r,l.tail=n,l.tailMode=i)}function Zd(e,t,n){var r=t.pendingProps,i=r.revealOrder,l=r.tail;if(Se(e,t,r.children,n),r=te.current,r&2)r=r&1|2,t.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&$u(e,n,t);else if(e.tag===19)$u(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(Q(te,r),!(t.mode&1))t.memoizedState=null;else switch(i){case"forwards":for(n=t.child,i=null;n!==null;)e=n.alternate,e!==null&&_l(e)===null&&(i=n),n=n.sibling;n=i,n===null?(i=t.child,t.child=null):(i=n.sibling,n.sibling=null),vs(t,!1,i,n,l);break;case"backwards":for(n=null,i=t.child,t.child=null;i!==null;){if(e=i.alternate,e!==null&&_l(e)===null){t.child=i;break}e=i.sibling,i.sibling=n,n=i,i=e}vs(t,!0,n,null,l);break;case"together":vs(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Ki(e,t){!(t.mode&1)&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function Rt(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),_n|=t.lanes,!(n&t.childLanes))return null;if(e!==null&&t.child!==e.child)throw Error(k(153));if(t.child!==null){for(e=t.child,n=$t(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=$t(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function t_(e,t,n){switch(t.tag){case 3:Vd(t),Qn();break;case 5:wd(t);break;case 1:Pe(t.type)&&ul(t);break;case 4:ma(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,i=t.memoizedProps.value;Q(dl,r._currentValue),r._currentValue=i;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(Q(te,te.current&1),t.flags|=128,null):n&t.child.childLanes?Gd(e,t,n):(Q(te,te.current&1),e=Rt(e,t,n),e!==null?e.sibling:null);Q(te,te.current&1);break;case 19:if(r=(n&t.childLanes)!==0,e.flags&128){if(r)return Zd(e,t,n);t.flags|=128}if(i=t.memoizedState,i!==null&&(i.rendering=null,i.tail=null,i.lastEffect=null),Q(te,te.current),r)break;return null;case 22:case 23:return t.lanes=0,$d(e,t,n)}return Rt(e,t,n)}var Kd,xo,Qd,Yd;Kd=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};xo=function(){};Qd=function(e,t,n,r){var i=e.memoizedProps;if(i!==r){e=t.stateNode,sn(ct.current);var l=null;switch(n){case"input":i=$s(e,i),r=$s(e,r),l=[];break;case"select":i=re({},i,{value:void 0}),r=re({},r,{value:void 0}),l=[];break;case"textarea":i=Gs(e,i),r=Gs(e,r),l=[];break;default:typeof i.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=ol)}Ks(n,r);var s;n=null;for(u in i)if(!r.hasOwnProperty(u)&&i.hasOwnProperty(u)&&i[u]!=null)if(u==="style"){var o=i[u];for(s in o)o.hasOwnProperty(s)&&(n||(n={}),n[s]="")}else u!=="dangerouslySetInnerHTML"&&u!=="children"&&u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&u!=="autoFocus"&&(Ur.hasOwnProperty(u)?l||(l=[]):(l=l||[]).push(u,null));for(u in r){var a=r[u];if(o=i!=null?i[u]:void 0,r.hasOwnProperty(u)&&a!==o&&(a!=null||o!=null))if(u==="style")if(o){for(s in o)!o.hasOwnProperty(s)||a&&a.hasOwnProperty(s)||(n||(n={}),n[s]="");for(s in a)a.hasOwnProperty(s)&&o[s]!==a[s]&&(n||(n={}),n[s]=a[s])}else n||(l||(l=[]),l.push(u,n)),n=a;else u==="dangerouslySetInnerHTML"?(a=a?a.__html:void 0,o=o?o.__html:void 0,a!=null&&o!==a&&(l=l||[]).push(u,a)):u==="children"?typeof a!="string"&&typeof a!="number"||(l=l||[]).push(u,""+a):u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&(Ur.hasOwnProperty(u)?(a!=null&&u==="onScroll"&&Y("scroll",e),l||o===a||(l=[])):(l=l||[]).push(u,a))}n&&(l=l||[]).push("style",n);var u=l;(t.updateQueue=u)&&(t.flags|=4)}};Yd=function(e,t,n,r){n!==r&&(t.flags|=4)};function mr(e,t){if(!J)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function ge(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags&14680064,r|=i.flags&14680064,i.return=e,i=i.sibling;else for(i=e.child;i!==null;)n|=i.lanes|i.childLanes,r|=i.subtreeFlags,r|=i.flags,i.return=e,i=i.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function n_(e,t,n){var r=t.pendingProps;switch(ua(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return ge(t),null;case 1:return Pe(t.type)&&al(),ge(t),null;case 3:return r=t.stateNode,qn(),q(Ne),q(we),va(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(Ci(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Je!==null&&(No(Je),Je=null))),xo(e,t),ge(t),null;case 5:ga(t);var i=sn(Yr.current);if(n=t.type,e!==null&&t.stateNode!=null)Qd(e,t,n,r,i),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(k(166));return ge(t),null}if(e=sn(ct.current),Ci(t)){r=t.stateNode,n=t.type;var l=t.memoizedProps;switch(r[ot]=t,r[Kr]=l,e=(t.mode&1)!==0,n){case"dialog":Y("cancel",r),Y("close",r);break;case"iframe":case"object":case"embed":Y("load",r);break;case"video":case"audio":for(i=0;i<xr.length;i++)Y(xr[i],r);break;case"source":Y("error",r);break;case"img":case"image":case"link":Y("error",r),Y("load",r);break;case"details":Y("toggle",r);break;case"input":Xa(r,l),Y("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!l.multiple},Y("invalid",r);break;case"textarea":eu(r,l),Y("invalid",r)}Ks(n,l),i=null;for(var s in l)if(l.hasOwnProperty(s)){var o=l[s];s==="children"?typeof o=="string"?r.textContent!==o&&(l.suppressHydrationWarning!==!0&&Ai(r.textContent,o,e),i=["children",o]):typeof o=="number"&&r.textContent!==""+o&&(l.suppressHydrationWarning!==!0&&Ai(r.textContent,o,e),i=["children",""+o]):Ur.hasOwnProperty(s)&&o!=null&&s==="onScroll"&&Y("scroll",r)}switch(n){case"input":wi(r),Ja(r,l,!0);break;case"textarea":wi(r),tu(r);break;case"select":case"option":break;default:typeof l.onClick=="function"&&(r.onclick=ol)}r=i,t.updateQueue=r,r!==null&&(t.flags|=4)}else{s=i.nodeType===9?i:i.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=kf(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=s.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=s.createElement(n,{is:r.is}):(e=s.createElement(n),n==="select"&&(s=e,r.multiple?s.multiple=!0:r.size&&(s.size=r.size))):e=s.createElementNS(e,n),e[ot]=t,e[Kr]=r,Kd(e,t,!1,!1),t.stateNode=e;e:{switch(s=Qs(n,r),n){case"dialog":Y("cancel",e),Y("close",e),i=r;break;case"iframe":case"object":case"embed":Y("load",e),i=r;break;case"video":case"audio":for(i=0;i<xr.length;i++)Y(xr[i],e);i=r;break;case"source":Y("error",e),i=r;break;case"img":case"image":case"link":Y("error",e),Y("load",e),i=r;break;case"details":Y("toggle",e),i=r;break;case"input":Xa(e,r),i=$s(e,r),Y("invalid",e);break;case"option":i=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},i=re({},r,{value:void 0}),Y("invalid",e);break;case"textarea":eu(e,r),i=Gs(e,r),Y("invalid",e);break;default:i=r}Ks(n,i),o=i;for(l in o)if(o.hasOwnProperty(l)){var a=o[l];l==="style"?Af(e,a):l==="dangerouslySetInnerHTML"?(a=a?a.__html:void 0,a!=null&&Rf(e,a)):l==="children"?typeof a=="string"?(n!=="textarea"||a!=="")&&zr(e,a):typeof a=="number"&&zr(e,""+a):l!=="suppressContentEditableWarning"&&l!=="suppressHydrationWarning"&&l!=="autoFocus"&&(Ur.hasOwnProperty(l)?a!=null&&l==="onScroll"&&Y("scroll",e):a!=null&&Ko(e,l,a,s))}switch(n){case"input":wi(e),Ja(e,r,!1);break;case"textarea":wi(e),tu(e);break;case"option":r.value!=null&&e.setAttribute("value",""+Zt(r.value));break;case"select":e.multiple=!!r.multiple,l=r.value,l!=null?zn(e,!!r.multiple,l,!1):r.defaultValue!=null&&zn(e,!!r.multiple,r.defaultValue,!0);break;default:typeof i.onClick=="function"&&(e.onclick=ol)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return ge(t),null;case 6:if(e&&t.stateNode!=null)Yd(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(k(166));if(n=sn(Yr.current),sn(ct.current),Ci(t)){if(r=t.stateNode,n=t.memoizedProps,r[ot]=t,(l=r.nodeValue!==n)&&(e=Ue,e!==null))switch(e.tag){case 3:Ai(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Ai(r.nodeValue,n,(e.mode&1)!==0)}l&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[ot]=t,t.stateNode=r}return ge(t),null;case 13:if(q(te),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(J&&be!==null&&t.mode&1&&!(t.flags&128))pd(),Qn(),t.flags|=98560,l=!1;else if(l=Ci(t),r!==null&&r.dehydrated!==null){if(e===null){if(!l)throw Error(k(318));if(l=t.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(k(317));l[ot]=t}else Qn(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;ge(t),l=!1}else Je!==null&&(No(Je),Je=null),l=!0;if(!l)return t.flags&65536?t:null}return t.flags&128?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,t.mode&1&&(e===null||te.current&1?ae===0&&(ae=3):Na())),t.updateQueue!==null&&(t.flags|=4),ge(t),null);case 4:return qn(),xo(e,t),e===null&&Gr(t.stateNode.containerInfo),ge(t),null;case 10:return ha(t.type._context),ge(t),null;case 17:return Pe(t.type)&&al(),ge(t),null;case 19:if(q(te),l=t.memoizedState,l===null)return ge(t),null;if(r=(t.flags&128)!==0,s=l.rendering,s===null)if(r)mr(l,!1);else{if(ae!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(s=_l(e),s!==null){for(t.flags|=128,mr(l,!1),r=s.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)l=n,e=r,l.flags&=14680066,s=l.alternate,s===null?(l.childLanes=0,l.lanes=e,l.child=null,l.subtreeFlags=0,l.memoizedProps=null,l.memoizedState=null,l.updateQueue=null,l.dependencies=null,l.stateNode=null):(l.childLanes=s.childLanes,l.lanes=s.lanes,l.child=s.child,l.subtreeFlags=0,l.deletions=null,l.memoizedProps=s.memoizedProps,l.memoizedState=s.memoizedState,l.updateQueue=s.updateQueue,l.type=s.type,e=s.dependencies,l.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return Q(te,te.current&1|2),t.child}e=e.sibling}l.tail!==null&&le()>Jn&&(t.flags|=128,r=!0,mr(l,!1),t.lanes=4194304)}else{if(!r)if(e=_l(s),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),mr(l,!0),l.tail===null&&l.tailMode==="hidden"&&!s.alternate&&!J)return ge(t),null}else 2*le()-l.renderingStartTime>Jn&&n!==1073741824&&(t.flags|=128,r=!0,mr(l,!1),t.lanes=4194304);l.isBackwards?(s.sibling=t.child,t.child=s):(n=l.last,n!==null?n.sibling=s:t.child=s,l.last=s)}return l.tail!==null?(t=l.tail,l.rendering=t,l.tail=t.sibling,l.renderingStartTime=le(),t.sibling=null,n=te.current,Q(te,r?n&1|2:n&1),t):(ge(t),null);case 22:case 23:return Ia(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&t.mode&1?De&1073741824&&(ge(t),t.subtreeFlags&6&&(t.flags|=8192)):ge(t),null;case 24:return null;case 25:return null}throw Error(k(156,t.tag))}function r_(e,t){switch(ua(t),t.tag){case 1:return Pe(t.type)&&al(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return qn(),q(Ne),q(we),va(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return ga(t),null;case 13:if(q(te),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(k(340));Qn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return q(te),null;case 4:return qn(),null;case 10:return ha(t.type._context),null;case 22:case 23:return Ia(),null;case 24:return null;default:return null}}var Pi=!1,ve=!1,i_=typeof WeakSet=="function"?WeakSet:Set,N=null;function Fn(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){ie(e,t,r)}else n.current=null}function Eo(e,t,n){try{n()}catch(r){ie(e,t,r)}}var Wu=!1;function l_(e,t){if(lo=il,e=td(),oa(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var i=r.anchorOffset,l=r.focusNode;r=r.focusOffset;try{n.nodeType,l.nodeType}catch{n=null;break e}var s=0,o=-1,a=-1,u=0,c=0,_=e,h=null;t:for(;;){for(var m;_!==n||i!==0&&_.nodeType!==3||(o=s+i),_!==l||r!==0&&_.nodeType!==3||(a=s+r),_.nodeType===3&&(s+=_.nodeValue.length),(m=_.firstChild)!==null;)h=_,_=m;for(;;){if(_===e)break t;if(h===n&&++u===i&&(o=s),h===l&&++c===r&&(a=s),(m=_.nextSibling)!==null)break;_=h,h=_.parentNode}_=m}n=o===-1||a===-1?null:{start:o,end:a}}else n=null}n=n||{start:0,end:0}}else n=null;for(so={focusedElem:e,selectionRange:n},il=!1,N=t;N!==null;)if(t=N,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,N=e;else for(;N!==null;){t=N;try{var v=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(v!==null){var S=v.memoizedProps,E=v.memoizedState,d=t.stateNode,f=d.getSnapshotBeforeUpdate(t.elementType===t.type?S:qe(t.type,S),E);d.__reactInternalSnapshotBeforeUpdate=f}break;case 3:var p=t.stateNode.containerInfo;p.nodeType===1?p.textContent="":p.nodeType===9&&p.documentElement&&p.removeChild(p.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(k(163))}}catch(g){ie(t,t.return,g)}if(e=t.sibling,e!==null){e.return=t.return,N=e;break}N=t.return}return v=Wu,Wu=!1,v}function Pr(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var i=r=r.next;do{if((i.tag&e)===e){var l=i.destroy;i.destroy=void 0,l!==void 0&&Eo(t,n,l)}i=i.next}while(i!==r)}}function Dl(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function ko(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function qd(e){var t=e.alternate;t!==null&&(e.alternate=null,qd(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[ot],delete t[Kr],delete t[uo],delete t[H0],delete t[j0])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Xd(e){return e.tag===5||e.tag===3||e.tag===4}function Vu(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Xd(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Ro(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=ol));else if(r!==4&&(e=e.child,e!==null))for(Ro(e,t,n),e=e.sibling;e!==null;)Ro(e,t,n),e=e.sibling}function To(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(To(e,t,n),e=e.sibling;e!==null;)To(e,t,n),e=e.sibling}var de=null,Xe=!1;function At(e,t,n){for(n=n.child;n!==null;)Jd(e,t,n),n=n.sibling}function Jd(e,t,n){if(ut&&typeof ut.onCommitFiberUnmount=="function")try{ut.onCommitFiberUnmount(Al,n)}catch{}switch(n.tag){case 5:ve||Fn(n,t);case 6:var r=de,i=Xe;de=null,At(e,t,n),de=r,Xe=i,de!==null&&(Xe?(e=de,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):de.removeChild(n.stateNode));break;case 18:de!==null&&(Xe?(e=de,n=n.stateNode,e.nodeType===8?fs(e.parentNode,n):e.nodeType===1&&fs(e,n),$r(e)):fs(de,n.stateNode));break;case 4:r=de,i=Xe,de=n.stateNode.containerInfo,Xe=!0,At(e,t,n),de=r,Xe=i;break;case 0:case 11:case 14:case 15:if(!ve&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){i=r=r.next;do{var l=i,s=l.destroy;l=l.tag,s!==void 0&&(l&2||l&4)&&Eo(n,t,s),i=i.next}while(i!==r)}At(e,t,n);break;case 1:if(!ve&&(Fn(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(o){ie(n,t,o)}At(e,t,n);break;case 21:At(e,t,n);break;case 22:n.mode&1?(ve=(r=ve)||n.memoizedState!==null,At(e,t,n),ve=r):At(e,t,n);break;default:At(e,t,n)}}function Gu(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new i_),t.forEach(function(r){var i=p_.bind(null,e,r);n.has(r)||(n.add(r),r.then(i,i))})}}function Ye(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var i=n[r];try{var l=e,s=t,o=s;e:for(;o!==null;){switch(o.tag){case 5:de=o.stateNode,Xe=!1;break e;case 3:de=o.stateNode.containerInfo,Xe=!0;break e;case 4:de=o.stateNode.containerInfo,Xe=!0;break e}o=o.return}if(de===null)throw Error(k(160));Jd(l,s,i),de=null,Xe=!1;var a=i.alternate;a!==null&&(a.return=null),i.return=null}catch(u){ie(i,t,u)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)eh(t,e),t=t.sibling}function eh(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Ye(t,e),rt(e),r&4){try{Pr(3,e,e.return),Dl(3,e)}catch(S){ie(e,e.return,S)}try{Pr(5,e,e.return)}catch(S){ie(e,e.return,S)}}break;case 1:Ye(t,e),rt(e),r&512&&n!==null&&Fn(n,n.return);break;case 5:if(Ye(t,e),rt(e),r&512&&n!==null&&Fn(n,n.return),e.flags&32){var i=e.stateNode;try{zr(i,"")}catch(S){ie(e,e.return,S)}}if(r&4&&(i=e.stateNode,i!=null)){var l=e.memoizedProps,s=n!==null?n.memoizedProps:l,o=e.type,a=e.updateQueue;if(e.updateQueue=null,a!==null)try{o==="input"&&l.type==="radio"&&l.name!=null&&xf(i,l),Qs(o,s);var u=Qs(o,l);for(s=0;s<a.length;s+=2){var c=a[s],_=a[s+1];c==="style"?Af(i,_):c==="dangerouslySetInnerHTML"?Rf(i,_):c==="children"?zr(i,_):Ko(i,c,_,u)}switch(o){case"input":Ws(i,l);break;case"textarea":Ef(i,l);break;case"select":var h=i._wrapperState.wasMultiple;i._wrapperState.wasMultiple=!!l.multiple;var m=l.value;m!=null?zn(i,!!l.multiple,m,!1):h!==!!l.multiple&&(l.defaultValue!=null?zn(i,!!l.multiple,l.defaultValue,!0):zn(i,!!l.multiple,l.multiple?[]:"",!1))}i[Kr]=l}catch(S){ie(e,e.return,S)}}break;case 6:if(Ye(t,e),rt(e),r&4){if(e.stateNode===null)throw Error(k(162));i=e.stateNode,l=e.memoizedProps;try{i.nodeValue=l}catch(S){ie(e,e.return,S)}}break;case 3:if(Ye(t,e),rt(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{$r(t.containerInfo)}catch(S){ie(e,e.return,S)}break;case 4:Ye(t,e),rt(e);break;case 13:Ye(t,e),rt(e),i=e.child,i.flags&8192&&(l=i.memoizedState!==null,i.stateNode.isHidden=l,!l||i.alternate!==null&&i.alternate.memoizedState!==null||(Aa=le())),r&4&&Gu(e);break;case 22:if(c=n!==null&&n.memoizedState!==null,e.mode&1?(ve=(u=ve)||c,Ye(t,e),ve=u):Ye(t,e),rt(e),r&8192){if(u=e.memoizedState!==null,(e.stateNode.isHidden=u)&&!c&&e.mode&1)for(N=e,c=e.child;c!==null;){for(_=N=c;N!==null;){switch(h=N,m=h.child,h.tag){case 0:case 11:case 14:case 15:Pr(4,h,h.return);break;case 1:Fn(h,h.return);var v=h.stateNode;if(typeof v.componentWillUnmount=="function"){r=h,n=h.return;try{t=r,v.props=t.memoizedProps,v.state=t.memoizedState,v.componentWillUnmount()}catch(S){ie(r,n,S)}}break;case 5:Fn(h,h.return);break;case 22:if(h.memoizedState!==null){Ku(_);continue}}m!==null?(m.return=h,N=m):Ku(_)}c=c.sibling}e:for(c=null,_=e;;){if(_.tag===5){if(c===null){c=_;try{i=_.stateNode,u?(l=i.style,typeof l.setProperty=="function"?l.setProperty("display","none","important"):l.display="none"):(o=_.stateNode,a=_.memoizedProps.style,s=a!=null&&a.hasOwnProperty("display")?a.display:null,o.style.display=Tf("display",s))}catch(S){ie(e,e.return,S)}}}else if(_.tag===6){if(c===null)try{_.stateNode.nodeValue=u?"":_.memoizedProps}catch(S){ie(e,e.return,S)}}else if((_.tag!==22&&_.tag!==23||_.memoizedState===null||_===e)&&_.child!==null){_.child.return=_,_=_.child;continue}if(_===e)break e;for(;_.sibling===null;){if(_.return===null||_.return===e)break e;c===_&&(c=null),_=_.return}c===_&&(c=null),_.sibling.return=_.return,_=_.sibling}}break;case 19:Ye(t,e),rt(e),r&4&&Gu(e);break;case 21:break;default:Ye(t,e),rt(e)}}function rt(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(Xd(n)){var r=n;break e}n=n.return}throw Error(k(160))}switch(r.tag){case 5:var i=r.stateNode;r.flags&32&&(zr(i,""),r.flags&=-33);var l=Vu(e);To(e,l,i);break;case 3:case 4:var s=r.stateNode.containerInfo,o=Vu(e);Ro(e,o,s);break;default:throw Error(k(161))}}catch(a){ie(e,e.return,a)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function s_(e,t,n){N=e,th(e)}function th(e,t,n){for(var r=(e.mode&1)!==0;N!==null;){var i=N,l=i.child;if(i.tag===22&&r){var s=i.memoizedState!==null||Pi;if(!s){var o=i.alternate,a=o!==null&&o.memoizedState!==null||ve;o=Pi;var u=ve;if(Pi=s,(ve=a)&&!u)for(N=i;N!==null;)s=N,a=s.child,s.tag===22&&s.memoizedState!==null?Qu(i):a!==null?(a.return=s,N=a):Qu(i);for(;l!==null;)N=l,th(l),l=l.sibling;N=i,Pi=o,ve=u}Zu(e)}else i.subtreeFlags&8772&&l!==null?(l.return=i,N=l):Zu(e)}}function Zu(e){for(;N!==null;){var t=N;if(t.flags&8772){var n=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:ve||Dl(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!ve)if(n===null)r.componentDidMount();else{var i=t.elementType===t.type?n.memoizedProps:qe(t.type,n.memoizedProps);r.componentDidUpdate(i,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var l=t.updateQueue;l!==null&&Pu(t,l,r);break;case 3:var s=t.updateQueue;if(s!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}Pu(t,s,n)}break;case 5:var o=t.stateNode;if(n===null&&t.flags&4){n=o;var a=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break;case"img":a.src&&(n.src=a.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var u=t.alternate;if(u!==null){var c=u.memoizedState;if(c!==null){var _=c.dehydrated;_!==null&&$r(_)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(k(163))}ve||t.flags&512&&ko(t)}catch(h){ie(t,t.return,h)}}if(t===e){N=null;break}if(n=t.sibling,n!==null){n.return=t.return,N=n;break}N=t.return}}function Ku(e){for(;N!==null;){var t=N;if(t===e){N=null;break}var n=t.sibling;if(n!==null){n.return=t.return,N=n;break}N=t.return}}function Qu(e){for(;N!==null;){var t=N;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Dl(4,t)}catch(a){ie(t,n,a)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var i=t.return;try{r.componentDidMount()}catch(a){ie(t,i,a)}}var l=t.return;try{ko(t)}catch(a){ie(t,l,a)}break;case 5:var s=t.return;try{ko(t)}catch(a){ie(t,s,a)}}}catch(a){ie(t,t.return,a)}if(t===e){N=null;break}var o=t.sibling;if(o!==null){o.return=t.return,N=o;break}N=t.return}}var o_=Math.ceil,vl=Tt.ReactCurrentDispatcher,Ra=Tt.ReactCurrentOwner,Ge=Tt.ReactCurrentBatchConfig,$=0,fe=null,se=null,pe=0,De=0,Un=Yt(0),ae=0,ei=null,_n=0,bl=0,Ta=0,Mr=null,Ae=null,Aa=0,Jn=1/0,_t=null,wl=!1,Ao=null,Ht=null,Mi=!1,Lt=null,yl=0,Or=0,Co=null,Qi=-1,Yi=0;function Ee(){return $&6?le():Qi!==-1?Qi:Qi=le()}function jt(e){return e.mode&1?$&2&&pe!==0?pe&-pe:W0.transition!==null?(Yi===0&&(Yi=zf()),Yi):(e=Z,e!==0||(e=window.event,e=e===void 0?16:Gf(e.type)),e):1}function tt(e,t,n,r){if(50<Or)throw Or=0,Co=null,Error(k(185));ui(e,n,r),(!($&2)||e!==fe)&&(e===fe&&(!($&2)&&(bl|=n),ae===4&&Pt(e,pe)),Me(e,r),n===1&&$===0&&!(t.mode&1)&&(Jn=le()+500,Ml&&qt()))}function Me(e,t){var n=e.callbackNode;Wp(e,t);var r=rl(e,e===fe?pe:0);if(r===0)n!==null&&iu(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&iu(n),t===1)e.tag===0?$0(Yu.bind(null,e)):fd(Yu.bind(null,e)),z0(function(){!($&6)&&qt()}),n=null;else{switch(Bf(r)){case 1:n=Jo;break;case 4:n=Ff;break;case 16:n=nl;break;case 536870912:n=Uf;break;default:n=nl}n=uh(n,nh.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function nh(e,t){if(Qi=-1,Yi=0,$&6)throw Error(k(327));var n=e.callbackNode;if(Wn()&&e.callbackNode!==n)return null;var r=rl(e,e===fe?pe:0);if(r===0)return null;if(r&30||r&e.expiredLanes||t)t=Sl(e,r);else{t=r;var i=$;$|=2;var l=ih();(fe!==e||pe!==t)&&(_t=null,Jn=le()+500,cn(e,t));do try{c_();break}catch(o){rh(e,o)}while(!0);da(),vl.current=l,$=i,se!==null?t=0:(fe=null,pe=0,t=ae)}if(t!==0){if(t===2&&(i=eo(e),i!==0&&(r=i,t=Io(e,i))),t===1)throw n=ei,cn(e,0),Pt(e,r),Me(e,le()),n;if(t===6)Pt(e,r);else{if(i=e.current.alternate,!(r&30)&&!a_(i)&&(t=Sl(e,r),t===2&&(l=eo(e),l!==0&&(r=l,t=Io(e,l))),t===1))throw n=ei,cn(e,0),Pt(e,r),Me(e,le()),n;switch(e.finishedWork=i,e.finishedLanes=r,t){case 0:case 1:throw Error(k(345));case 2:tn(e,Ae,_t);break;case 3:if(Pt(e,r),(r&130023424)===r&&(t=Aa+500-le(),10<t)){if(rl(e,0)!==0)break;if(i=e.suspendedLanes,(i&r)!==r){Ee(),e.pingedLanes|=e.suspendedLanes&i;break}e.timeoutHandle=ao(tn.bind(null,e,Ae,_t),t);break}tn(e,Ae,_t);break;case 4:if(Pt(e,r),(r&4194240)===r)break;for(t=e.eventTimes,i=-1;0<r;){var s=31-et(r);l=1<<s,s=t[s],s>i&&(i=s),r&=~l}if(r=i,r=le()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*o_(r/1960))-r,10<r){e.timeoutHandle=ao(tn.bind(null,e,Ae,_t),r);break}tn(e,Ae,_t);break;case 5:tn(e,Ae,_t);break;default:throw Error(k(329))}}}return Me(e,le()),e.callbackNode===n?nh.bind(null,e):null}function Io(e,t){var n=Mr;return e.current.memoizedState.isDehydrated&&(cn(e,t).flags|=256),e=Sl(e,t),e!==2&&(t=Ae,Ae=n,t!==null&&No(t)),e}function No(e){Ae===null?Ae=e:Ae.push.apply(Ae,e)}function a_(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var i=n[r],l=i.getSnapshot;i=i.value;try{if(!nt(l(),i))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Pt(e,t){for(t&=~Ta,t&=~bl,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-et(t),r=1<<n;e[n]=-1,t&=~r}}function Yu(e){if($&6)throw Error(k(327));Wn();var t=rl(e,0);if(!(t&1))return Me(e,le()),null;var n=Sl(e,t);if(e.tag!==0&&n===2){var r=eo(e);r!==0&&(t=r,n=Io(e,r))}if(n===1)throw n=ei,cn(e,0),Pt(e,t),Me(e,le()),n;if(n===6)throw Error(k(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,tn(e,Ae,_t),Me(e,le()),null}function Ca(e,t){var n=$;$|=1;try{return e(t)}finally{$=n,$===0&&(Jn=le()+500,Ml&&qt())}}function mn(e){Lt!==null&&Lt.tag===0&&!($&6)&&Wn();var t=$;$|=1;var n=Ge.transition,r=Z;try{if(Ge.transition=null,Z=1,e)return e()}finally{Z=r,Ge.transition=n,$=t,!($&6)&&qt()}}function Ia(){De=Un.current,q(Un)}function cn(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,U0(n)),se!==null)for(n=se.return;n!==null;){var r=n;switch(ua(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&al();break;case 3:qn(),q(Ne),q(we),va();break;case 5:ga(r);break;case 4:qn();break;case 13:q(te);break;case 19:q(te);break;case 10:ha(r.type._context);break;case 22:case 23:Ia()}n=n.return}if(fe=e,se=e=$t(e.current,null),pe=De=t,ae=0,ei=null,Ta=bl=_n=0,Ae=Mr=null,ln!==null){for(t=0;t<ln.length;t++)if(n=ln[t],r=n.interleaved,r!==null){n.interleaved=null;var i=r.next,l=n.pending;if(l!==null){var s=l.next;l.next=i,r.next=s}n.pending=r}ln=null}return e}function rh(e,t){do{var n=se;try{if(da(),Gi.current=gl,ml){for(var r=ne.memoizedState;r!==null;){var i=r.queue;i!==null&&(i.pending=null),r=r.next}ml=!1}if(pn=0,ce=oe=ne=null,Nr=!1,qr=0,Ra.current=null,n===null||n.return===null){ae=1,ei=t,se=null;break}e:{var l=e,s=n.return,o=n,a=t;if(t=pe,o.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){var u=a,c=o,_=c.tag;if(!(c.mode&1)&&(_===0||_===11||_===15)){var h=c.alternate;h?(c.updateQueue=h.updateQueue,c.memoizedState=h.memoizedState,c.lanes=h.lanes):(c.updateQueue=null,c.memoizedState=null)}var m=Fu(s);if(m!==null){m.flags&=-257,Uu(m,s,o,l,t),m.mode&1&&bu(l,u,t),t=m,a=u;var v=t.updateQueue;if(v===null){var S=new Set;S.add(a),t.updateQueue=S}else v.add(a);break e}else{if(!(t&1)){bu(l,u,t),Na();break e}a=Error(k(426))}}else if(J&&o.mode&1){var E=Fu(s);if(E!==null){!(E.flags&65536)&&(E.flags|=256),Uu(E,s,o,l,t),ca(Xn(a,o));break e}}l=a=Xn(a,o),ae!==4&&(ae=2),Mr===null?Mr=[l]:Mr.push(l),l=s;do{switch(l.tag){case 3:l.flags|=65536,t&=-t,l.lanes|=t;var d=Bd(l,a,t);Nu(l,d);break e;case 1:o=a;var f=l.type,p=l.stateNode;if(!(l.flags&128)&&(typeof f.getDerivedStateFromError=="function"||p!==null&&typeof p.componentDidCatch=="function"&&(Ht===null||!Ht.has(p)))){l.flags|=65536,t&=-t,l.lanes|=t;var g=Hd(l,o,t);Nu(l,g);break e}}l=l.return}while(l!==null)}sh(n)}catch(x){t=x,se===n&&n!==null&&(se=n=n.return);continue}break}while(!0)}function ih(){var e=vl.current;return vl.current=gl,e===null?gl:e}function Na(){(ae===0||ae===3||ae===2)&&(ae=4),fe===null||!(_n&268435455)&&!(bl&268435455)||Pt(fe,pe)}function Sl(e,t){var n=$;$|=2;var r=ih();(fe!==e||pe!==t)&&(_t=null,cn(e,t));do try{u_();break}catch(i){rh(e,i)}while(!0);if(da(),$=n,vl.current=r,se!==null)throw Error(k(261));return fe=null,pe=0,ae}function u_(){for(;se!==null;)lh(se)}function c_(){for(;se!==null&&!Dp();)lh(se)}function lh(e){var t=ah(e.alternate,e,De);e.memoizedProps=e.pendingProps,t===null?sh(e):se=t,Ra.current=null}function sh(e){var t=e;do{var n=t.alternate;if(e=t.return,t.flags&32768){if(n=r_(n,t),n!==null){n.flags&=32767,se=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{ae=6,se=null;return}}else if(n=n_(n,t,De),n!==null){se=n;return}if(t=t.sibling,t!==null){se=t;return}se=t=e}while(t!==null);ae===0&&(ae=5)}function tn(e,t,n){var r=Z,i=Ge.transition;try{Ge.transition=null,Z=1,f_(e,t,n,r)}finally{Ge.transition=i,Z=r}return null}function f_(e,t,n,r){do Wn();while(Lt!==null);if($&6)throw Error(k(327));n=e.finishedWork;var i=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(k(177));e.callbackNode=null,e.callbackPriority=0;var l=n.lanes|n.childLanes;if(Vp(e,l),e===fe&&(se=fe=null,pe=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Mi||(Mi=!0,uh(nl,function(){return Wn(),null})),l=(n.flags&15990)!==0,n.subtreeFlags&15990||l){l=Ge.transition,Ge.transition=null;var s=Z;Z=1;var o=$;$|=4,Ra.current=null,l_(e,n),eh(n,e),P0(so),il=!!lo,so=lo=null,e.current=n,s_(n),bp(),$=o,Z=s,Ge.transition=l}else e.current=n;if(Mi&&(Mi=!1,Lt=e,yl=i),l=e.pendingLanes,l===0&&(Ht=null),zp(n.stateNode),Me(e,le()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)i=t[n],r(i.value,{componentStack:i.stack,digest:i.digest});if(wl)throw wl=!1,e=Ao,Ao=null,e;return yl&1&&e.tag!==0&&Wn(),l=e.pendingLanes,l&1?e===Co?Or++:(Or=0,Co=e):Or=0,qt(),null}function Wn(){if(Lt!==null){var e=Bf(yl),t=Ge.transition,n=Z;try{if(Ge.transition=null,Z=16>e?16:e,Lt===null)var r=!1;else{if(e=Lt,Lt=null,yl=0,$&6)throw Error(k(331));var i=$;for($|=4,N=e.current;N!==null;){var l=N,s=l.child;if(N.flags&16){var o=l.deletions;if(o!==null){for(var a=0;a<o.length;a++){var u=o[a];for(N=u;N!==null;){var c=N;switch(c.tag){case 0:case 11:case 15:Pr(8,c,l)}var _=c.child;if(_!==null)_.return=c,N=_;else for(;N!==null;){c=N;var h=c.sibling,m=c.return;if(qd(c),c===u){N=null;break}if(h!==null){h.return=m,N=h;break}N=m}}}var v=l.alternate;if(v!==null){var S=v.child;if(S!==null){v.child=null;do{var E=S.sibling;S.sibling=null,S=E}while(S!==null)}}N=l}}if(l.subtreeFlags&2064&&s!==null)s.return=l,N=s;else e:for(;N!==null;){if(l=N,l.flags&2048)switch(l.tag){case 0:case 11:case 15:Pr(9,l,l.return)}var d=l.sibling;if(d!==null){d.return=l.return,N=d;break e}N=l.return}}var f=e.current;for(N=f;N!==null;){s=N;var p=s.child;if(s.subtreeFlags&2064&&p!==null)p.return=s,N=p;else e:for(s=f;N!==null;){if(o=N,o.flags&2048)try{switch(o.tag){case 0:case 11:case 15:Dl(9,o)}}catch(x){ie(o,o.return,x)}if(o===s){N=null;break e}var g=o.sibling;if(g!==null){g.return=o.return,N=g;break e}N=o.return}}if($=i,qt(),ut&&typeof ut.onPostCommitFiberRoot=="function")try{ut.onPostCommitFiberRoot(Al,e)}catch{}r=!0}return r}finally{Z=n,Ge.transition=t}}return!1}function qu(e,t,n){t=Xn(n,t),t=Bd(e,t,1),e=Bt(e,t,1),t=Ee(),e!==null&&(ui(e,1,t),Me(e,t))}function ie(e,t,n){if(e.tag===3)qu(e,e,n);else for(;t!==null;){if(t.tag===3){qu(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Ht===null||!Ht.has(r))){e=Xn(n,e),e=Hd(t,e,1),t=Bt(t,e,1),e=Ee(),t!==null&&(ui(t,1,e),Me(t,e));break}}t=t.return}}function d_(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=Ee(),e.pingedLanes|=e.suspendedLanes&n,fe===e&&(pe&n)===n&&(ae===4||ae===3&&(pe&130023424)===pe&&500>le()-Aa?cn(e,0):Ta|=n),Me(e,t)}function oh(e,t){t===0&&(e.mode&1?(t=xi,xi<<=1,!(xi&130023424)&&(xi=4194304)):t=1);var n=Ee();e=kt(e,t),e!==null&&(ui(e,t,n),Me(e,n))}function h_(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),oh(e,n)}function p_(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,i=e.memoizedState;i!==null&&(n=i.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(k(314))}r!==null&&r.delete(t),oh(e,n)}var ah;ah=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||Ne.current)Ce=!0;else{if(!(e.lanes&n)&&!(t.flags&128))return Ce=!1,t_(e,t,n);Ce=!!(e.flags&131072)}else Ce=!1,J&&t.flags&1048576&&dd(t,fl,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Ki(e,t),e=t.pendingProps;var i=Kn(t,we.current);$n(t,n),i=ya(null,t,r,e,i,n);var l=Sa();return t.flags|=1,typeof i=="object"&&i!==null&&typeof i.render=="function"&&i.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Pe(r)?(l=!0,ul(t)):l=!1,t.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,_a(t),i.updater=Ll,t.stateNode=i,i._reactInternals=t,mo(t,r,e,n),t=wo(null,t,r,!0,l,n)):(t.tag=0,J&&l&&aa(t),Se(null,t,i,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Ki(e,t),e=t.pendingProps,i=r._init,r=i(r._payload),t.type=r,i=t.tag=m_(r),e=qe(r,e),i){case 0:t=vo(null,t,r,e,n);break e;case 1:t=Hu(null,t,r,e,n);break e;case 11:t=zu(null,t,r,e,n);break e;case 14:t=Bu(null,t,r,qe(r.type,e),n);break e}throw Error(k(306,r,""))}return t;case 0:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:qe(r,i),vo(e,t,r,i,n);case 1:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:qe(r,i),Hu(e,t,r,i,n);case 3:e:{if(Vd(t),e===null)throw Error(k(387));r=t.pendingProps,l=t.memoizedState,i=l.element,vd(e,t),pl(t,r,null,n);var s=t.memoizedState;if(r=s.element,l.isDehydrated)if(l={element:r,isDehydrated:!1,cache:s.cache,pendingSuspenseBoundaries:s.pendingSuspenseBoundaries,transitions:s.transitions},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){i=Xn(Error(k(423)),t),t=ju(e,t,r,n,i);break e}else if(r!==i){i=Xn(Error(k(424)),t),t=ju(e,t,r,n,i);break e}else for(be=zt(t.stateNode.containerInfo.firstChild),Ue=t,J=!0,Je=null,n=md(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Qn(),r===i){t=Rt(e,t,n);break e}Se(e,t,r,n)}t=t.child}return t;case 5:return wd(t),e===null&&ho(t),r=t.type,i=t.pendingProps,l=e!==null?e.memoizedProps:null,s=i.children,oo(r,i)?s=null:l!==null&&oo(r,l)&&(t.flags|=32),Wd(e,t),Se(e,t,s,n),t.child;case 6:return e===null&&ho(t),null;case 13:return Gd(e,t,n);case 4:return ma(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Yn(t,null,r,n):Se(e,t,r,n),t.child;case 11:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:qe(r,i),zu(e,t,r,i,n);case 7:return Se(e,t,t.pendingProps,n),t.child;case 8:return Se(e,t,t.pendingProps.children,n),t.child;case 12:return Se(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,i=t.pendingProps,l=t.memoizedProps,s=i.value,Q(dl,r._currentValue),r._currentValue=s,l!==null)if(nt(l.value,s)){if(l.children===i.children&&!Ne.current){t=Rt(e,t,n);break e}}else for(l=t.child,l!==null&&(l.return=t);l!==null;){var o=l.dependencies;if(o!==null){s=l.child;for(var a=o.firstContext;a!==null;){if(a.context===r){if(l.tag===1){a=yt(-1,n&-n),a.tag=2;var u=l.updateQueue;if(u!==null){u=u.shared;var c=u.pending;c===null?a.next=a:(a.next=c.next,c.next=a),u.pending=a}}l.lanes|=n,a=l.alternate,a!==null&&(a.lanes|=n),po(l.return,n,t),o.lanes|=n;break}a=a.next}}else if(l.tag===10)s=l.type===t.type?null:l.child;else if(l.tag===18){if(s=l.return,s===null)throw Error(k(341));s.lanes|=n,o=s.alternate,o!==null&&(o.lanes|=n),po(s,n,t),s=l.sibling}else s=l.child;if(s!==null)s.return=l;else for(s=l;s!==null;){if(s===t){s=null;break}if(l=s.sibling,l!==null){l.return=s.return,s=l;break}s=s.return}l=s}Se(e,t,i.children,n),t=t.child}return t;case 9:return i=t.type,r=t.pendingProps.children,$n(t,n),i=Ze(i),r=r(i),t.flags|=1,Se(e,t,r,n),t.child;case 14:return r=t.type,i=qe(r,t.pendingProps),i=qe(r.type,i),Bu(e,t,r,i,n);case 15:return jd(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,i=t.pendingProps,i=t.elementType===r?i:qe(r,i),Ki(e,t),t.tag=1,Pe(r)?(e=!0,ul(t)):e=!1,$n(t,n),zd(t,r,i),mo(t,r,i,n),wo(null,t,r,!0,e,n);case 19:return Zd(e,t,n);case 22:return $d(e,t,n)}throw Error(k(156,t.tag))};function uh(e,t){return bf(e,t)}function __(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ve(e,t,n,r){return new __(e,t,n,r)}function Pa(e){return e=e.prototype,!(!e||!e.isReactComponent)}function m_(e){if(typeof e=="function")return Pa(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Yo)return 11;if(e===qo)return 14}return 2}function $t(e,t){var n=e.alternate;return n===null?(n=Ve(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function qi(e,t,n,r,i,l){var s=2;if(r=e,typeof e=="function")Pa(e)&&(s=1);else if(typeof e=="string")s=5;else e:switch(e){case Cn:return fn(n.children,i,l,t);case Qo:s=8,i|=8;break;case zs:return e=Ve(12,n,t,i|2),e.elementType=zs,e.lanes=l,e;case Bs:return e=Ve(13,n,t,i),e.elementType=Bs,e.lanes=l,e;case Hs:return e=Ve(19,n,t,i),e.elementType=Hs,e.lanes=l,e;case wf:return Fl(n,i,l,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case gf:s=10;break e;case vf:s=9;break e;case Yo:s=11;break e;case qo:s=14;break e;case Ct:s=16,r=null;break e}throw Error(k(130,e==null?e:typeof e,""))}return t=Ve(s,n,t,i),t.elementType=e,t.type=r,t.lanes=l,t}function fn(e,t,n,r){return e=Ve(7,e,r,t),e.lanes=n,e}function Fl(e,t,n,r){return e=Ve(22,e,r,t),e.elementType=wf,e.lanes=n,e.stateNode={isHidden:!1},e}function ws(e,t,n){return e=Ve(6,e,null,t),e.lanes=n,e}function ys(e,t,n){return t=Ve(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function g_(e,t,n,r,i){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=es(0),this.expirationTimes=es(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=es(0),this.identifierPrefix=r,this.onRecoverableError=i,this.mutableSourceEagerHydrationData=null}function Ma(e,t,n,r,i,l,s,o,a){return e=new g_(e,t,n,o,a),t===1?(t=1,l===!0&&(t|=8)):t=0,l=Ve(3,null,null,t),e.current=l,l.stateNode=e,l.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},_a(l),e}function v_(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:An,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function ch(e){if(!e)return Kt;e=e._reactInternals;e:{if(xn(e)!==e||e.tag!==1)throw Error(k(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Pe(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(k(171))}if(e.tag===1){var n=e.type;if(Pe(n))return cd(e,n,t)}return t}function fh(e,t,n,r,i,l,s,o,a){return e=Ma(n,r,!0,e,i,l,s,o,a),e.context=ch(null),n=e.current,r=Ee(),i=jt(n),l=yt(r,i),l.callback=t??null,Bt(n,l,i),e.current.lanes=i,ui(e,i,r),Me(e,r),e}function Ul(e,t,n,r){var i=t.current,l=Ee(),s=jt(i);return n=ch(n),t.context===null?t.context=n:t.pendingContext=n,t=yt(l,s),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=Bt(i,t,s),e!==null&&(tt(e,i,s,l),Vi(e,i,s)),s}function xl(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Xu(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function Oa(e,t){Xu(e,t),(e=e.alternate)&&Xu(e,t)}function w_(){return null}var dh=typeof reportError=="function"?reportError:function(e){console.error(e)};function La(e){this._internalRoot=e}zl.prototype.render=La.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(k(409));Ul(e,t,null,null)};zl.prototype.unmount=La.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;mn(function(){Ul(null,e,null,null)}),t[Et]=null}};function zl(e){this._internalRoot=e}zl.prototype.unstable_scheduleHydration=function(e){if(e){var t=$f();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Nt.length&&t!==0&&t<Nt[n].priority;n++);Nt.splice(n,0,e),n===0&&Vf(e)}};function Da(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Bl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Ju(){}function y_(e,t,n,r,i){if(i){if(typeof r=="function"){var l=r;r=function(){var u=xl(s);l.call(u)}}var s=fh(t,r,e,0,null,!1,!1,"",Ju);return e._reactRootContainer=s,e[Et]=s.current,Gr(e.nodeType===8?e.parentNode:e),mn(),s}for(;i=e.lastChild;)e.removeChild(i);if(typeof r=="function"){var o=r;r=function(){var u=xl(a);o.call(u)}}var a=Ma(e,0,!1,null,null,!1,!1,"",Ju);return e._reactRootContainer=a,e[Et]=a.current,Gr(e.nodeType===8?e.parentNode:e),mn(function(){Ul(t,a,n,r)}),a}function Hl(e,t,n,r,i){var l=n._reactRootContainer;if(l){var s=l;if(typeof i=="function"){var o=i;i=function(){var a=xl(s);o.call(a)}}Ul(t,s,e,i)}else s=y_(n,t,e,i,r);return xl(s)}Hf=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=Sr(t.pendingLanes);n!==0&&(ea(t,n|1),Me(t,le()),!($&6)&&(Jn=le()+500,qt()))}break;case 13:mn(function(){var r=kt(e,1);if(r!==null){var i=Ee();tt(r,e,1,i)}}),Oa(e,1)}};ta=function(e){if(e.tag===13){var t=kt(e,134217728);if(t!==null){var n=Ee();tt(t,e,134217728,n)}Oa(e,134217728)}};jf=function(e){if(e.tag===13){var t=jt(e),n=kt(e,t);if(n!==null){var r=Ee();tt(n,e,t,r)}Oa(e,t)}};$f=function(){return Z};Wf=function(e,t){var n=Z;try{return Z=e,t()}finally{Z=n}};qs=function(e,t,n){switch(t){case"input":if(Ws(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var i=Pl(r);if(!i)throw Error(k(90));Sf(r),Ws(r,i)}}}break;case"textarea":Ef(e,n);break;case"select":t=n.value,t!=null&&zn(e,!!n.multiple,t,!1)}};Nf=Ca;Pf=mn;var S_={usingClientEntryPoint:!1,Events:[fi,Mn,Pl,Cf,If,Ca]},gr={findFiberByHostInstance:rn,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},x_={bundleType:gr.bundleType,version:gr.version,rendererPackageName:gr.rendererPackageName,rendererConfig:gr.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Tt.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Lf(e),e===null?null:e.stateNode},findFiberByHostInstance:gr.findFiberByHostInstance||w_,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Oi=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Oi.isDisabled&&Oi.supportsFiber)try{Al=Oi.inject(x_),ut=Oi}catch{}}Be.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=S_;Be.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Da(t))throw Error(k(200));return v_(e,t,null,n)};Be.createRoot=function(e,t){if(!Da(e))throw Error(k(299));var n=!1,r="",i=dh;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(i=t.onRecoverableError)),t=Ma(e,1,!1,null,null,n,!1,r,i),e[Et]=t.current,Gr(e.nodeType===8?e.parentNode:e),new La(t)};Be.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(k(188)):(e=Object.keys(e).join(","),Error(k(268,e)));return e=Lf(t),e=e===null?null:e.stateNode,e};Be.flushSync=function(e){return mn(e)};Be.hydrate=function(e,t,n){if(!Bl(t))throw Error(k(200));return Hl(null,e,t,!0,n)};Be.hydrateRoot=function(e,t,n){if(!Da(e))throw Error(k(405));var r=n!=null&&n.hydratedSources||null,i=!1,l="",s=dh;if(n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(l=n.identifierPrefix),n.onRecoverableError!==void 0&&(s=n.onRecoverableError)),t=fh(t,null,e,1,n??null,i,!1,l,s),e[Et]=t.current,Gr(e),r)for(e=0;e<r.length;e++)n=r[e],i=n._getVersion,i=i(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,i]:t.mutableSourceEagerHydrationData.push(n,i);return new zl(t)};Be.render=function(e,t,n){if(!Bl(t))throw Error(k(200));return Hl(null,e,t,!1,n)};Be.unmountComponentAtNode=function(e){if(!Bl(e))throw Error(k(40));return e._reactRootContainer?(mn(function(){Hl(null,null,e,!1,function(){e._reactRootContainer=null,e[Et]=null})}),!0):!1};Be.unstable_batchedUpdates=Ca;Be.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!Bl(n))throw Error(k(200));if(e==null||e._reactInternals===void 0)throw Error(k(38));return Hl(e,t,n,!1,r)};Be.version="18.3.1-next-f1338f8080-20240426";function hh(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(hh)}catch(e){console.error(e)}}hh(),hf.exports=Be;var E_=hf.exports,ec=E_;Fs.createRoot=ec.createRoot,Fs.hydrateRoot=ec.hydrateRoot;/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ph=(...e)=>e.filter((t,n,r)=>!!t&&t.trim()!==""&&r.indexOf(t)===n).join(" ").trim();/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k_=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R_=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,n,r)=>r?r.toUpperCase():n.toLowerCase());/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const tc=e=>{const t=R_(e);return t.charAt(0).toUpperCase()+t.slice(1)};/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var Ss={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T_=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0;return!1},A_=U.createContext({}),C_=()=>U.useContext(A_),I_=U.forwardRef(({color:e,size:t,strokeWidth:n,absoluteStrokeWidth:r,className:i="",children:l,iconNode:s,...o},a)=>{const{size:u=24,strokeWidth:c=2,absoluteStrokeWidth:_=!1,color:h="currentColor",className:m=""}=C_()??{},v=r??_?Number(n??c)*24/Number(t??u):n??c;return U.createElement("svg",{ref:a,...Ss,width:t??u??Ss.width,height:t??u??Ss.height,stroke:e??h,strokeWidth:v,className:ph("lucide",m,i),...!l&&!T_(o)&&{"aria-hidden":"true"},...o},[...s.map(([S,E])=>U.createElement(S,E)),...Array.isArray(l)?l:[l]])});/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye=(e,t)=>{const n=U.forwardRef(({className:r,...i},l)=>U.createElement(I_,{ref:l,iconNode:t,className:ph(`lucide-${k_(tc(e))}`,`lucide-${e}`,r),...i}));return n.displayName=tc(e),n};/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N_=[["path",{d:"m7 7 10 10-5 5V2l5 5L7 17",key:"1q5490"}]],P_=ye("bluetooth",N_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M_=[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]],O_=ye("bot",M_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L_=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],nc=ye("circle-check",L_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D_=[["path",{d:"m16 18 6-6-6-6",key:"eg8j8"}],["path",{d:"m8 6-6 6 6 6",key:"ppft3o"}]],b_=ye("code",D_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F_=[["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M17 20v2",key:"1rnc9c"}],["path",{d:"M17 2v2",key:"11trls"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M2 17h2",key:"7oei6x"}],["path",{d:"M2 7h2",key:"asdhe0"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"M20 17h2",key:"1fpfkl"}],["path",{d:"M20 7h2",key:"1o8tra"}],["path",{d:"M7 20v2",key:"4gnj0m"}],["path",{d:"M7 2v2",key:"1i4yhu"}],["rect",{x:"4",y:"4",width:"16",height:"16",rx:"2",key:"1vbyd7"}],["rect",{x:"8",y:"8",width:"8",height:"8",rx:"1",key:"z9xiuo"}]],Po=ye("cpu",F_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U_=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],rc=ye("loader-circle",U_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z_=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],ic=ye("play",z_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B_=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],H_=ye("rotate-ccw",B_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j_=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]],$_=ye("square",j_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W_=[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]],V_=ye("terminal",W_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const G_=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],Z_=ye("trash-2",G_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const K_=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],Q_=ye("triangle-alert",K_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y_=[["path",{d:"M12 3v12",key:"1x0j5s"}],["path",{d:"m17 8-5-5-5 5",key:"7q97r8"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}]],q_=ye("upload",Y_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X_=[["circle",{cx:"10",cy:"7",r:"1",key:"dypaad"}],["circle",{cx:"4",cy:"20",r:"1",key:"22iqad"}],["path",{d:"M4.7 19.3 19 5",key:"1enqfc"}],["path",{d:"m21 3-3 1 2 2Z",key:"d3ov82"}],["path",{d:"M9.26 7.68 5 12l2 5",key:"1esawj"}],["path",{d:"m10 14 5 2 3.5-3.5",key:"v8oal5"}],["path",{d:"m18 12 1-1 1 1-1 1Z",key:"1bh22v"}]],J_=ye("usb",X_);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const em=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],tm=ye("x",em);/**
 * @license lucide-react v1.31.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const nm=[["path",{d:"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",key:"1v7up4"}]],rm=ye("zap",nm),im="modulepreload",lm=function(e){return"/"+e},lc={},ee=function(t,n,r){let i=Promise.resolve();if(n&&n.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),o=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));i=Promise.allSettled(n.map(a=>{if(a=lm(a),a in lc)return;lc[a]=!0;const u=a.endsWith(".css"),c=u?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${a}"]${c}`))return;const _=document.createElement("link");if(_.rel=u?"stylesheet":im,u||(_.as="script"),_.crossOrigin="",_.href=a,o&&_.setAttribute("nonce",o),document.head.appendChild(_),u)return new Promise((h,m)=>{_.addEventListener("load",h),_.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${a}`)))})}))}function l(s){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=s,window.dispatchEvent(o),!o.defaultPrevented)throw s}return i.then(s=>{for(const o of s||[])o.status==="rejected"&&l(o.reason);return t().catch(l)})};class G extends Error{}/*! pako 2.2.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */const sm=4,sc=0,oc=1,om=2;function or(e){let t=e.length;for(;--t>=0;)e[t]=0}const am=0,_h=1,um=2,cm=3,fm=258,ba=29,hi=256,ti=hi+1+ba,Vn=30,Fa=19,mh=2*ti+1,on=15,xs=16,dm=7,Ua=256,gh=16,vh=17,wh=18,Mo=new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]),Xi=new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),hm=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]),yh=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),pm=512,gt=new Array((ti+2)*2);or(gt);const Lr=new Array(Vn*2);or(Lr);const ni=new Array(pm);or(ni);const ri=new Array(fm-cm+1);or(ri);const za=new Array(ba);or(za);const El=new Array(Vn);or(El);function Es(e,t,n,r,i){this.static_tree=e,this.extra_bits=t,this.extra_base=n,this.elems=r,this.max_length=i,this.has_stree=e&&e.length}let Sh,xh,Eh;function ks(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}const kh=e=>e<256?ni[e]:ni[256+(e>>>7)],ii=(e,t)=>{e.pending_buf[e.pending++]=t&255,e.pending_buf[e.pending++]=t>>>8&255},Ie=(e,t,n)=>{e.bi_valid>xs-n?(e.bi_buf|=t<<e.bi_valid&65535,ii(e,e.bi_buf),e.bi_buf=t>>xs-e.bi_valid,e.bi_valid+=n-xs):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=n)},at=(e,t,n)=>{Ie(e,n[t*2],n[t*2+1])},Rh=(e,t)=>{let n=0;do n|=e&1,e>>>=1,n<<=1;while(--t>0);return n>>>1},_m=e=>{e.bi_valid===16?(ii(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=e.bi_buf&255,e.bi_buf>>=8,e.bi_valid-=8)},mm=(e,t)=>{const n=t.dyn_tree,r=t.max_code,i=t.stat_desc.static_tree,l=t.stat_desc.has_stree,s=t.stat_desc.extra_bits,o=t.stat_desc.extra_base,a=t.stat_desc.max_length;let u,c,_,h,m,v,S=0;for(h=0;h<=on;h++)e.bl_count[h]=0;for(n[e.heap[e.heap_max]*2+1]=0,u=e.heap_max+1;u<mh;u++)c=e.heap[u],h=n[n[c*2+1]*2+1]+1,h>a&&(h=a,S++),n[c*2+1]=h,!(c>r)&&(e.bl_count[h]++,m=0,c>=o&&(m=s[c-o]),v=n[c*2],e.opt_len+=v*(h+m),l&&(e.static_len+=v*(i[c*2+1]+m)));if(S!==0){do{for(h=a-1;e.bl_count[h]===0;)h--;e.bl_count[h]--,e.bl_count[h+1]+=2,e.bl_count[a]--,S-=2}while(S>0);for(h=a;h!==0;h--)for(c=e.bl_count[h];c!==0;)_=e.heap[--u],!(_>r)&&(n[_*2+1]!==h&&(e.opt_len+=(h-n[_*2+1])*n[_*2],n[_*2+1]=h),c--)}},Th=(e,t,n)=>{const r=new Array(on+1);let i=0,l,s;for(l=1;l<=on;l++)i=i+n[l-1]<<1,r[l]=i;for(s=0;s<=t;s++){let o=e[s*2+1];o!==0&&(e[s*2]=Rh(r[o]++,o))}},gm=()=>{let e,t,n,r,i;const l=new Array(on+1);for(n=0,r=0;r<ba-1;r++)for(za[r]=n,e=0;e<1<<Mo[r];e++)ri[n++]=r;for(ri[n-1]=r,i=0,r=0;r<16;r++)for(El[r]=i,e=0;e<1<<Xi[r];e++)ni[i++]=r;for(i>>=7;r<Vn;r++)for(El[r]=i<<7,e=0;e<1<<Xi[r]-7;e++)ni[256+i++]=r;for(t=0;t<=on;t++)l[t]=0;for(e=0;e<=143;)gt[e*2+1]=8,e++,l[8]++;for(;e<=255;)gt[e*2+1]=9,e++,l[9]++;for(;e<=279;)gt[e*2+1]=7,e++,l[7]++;for(;e<=287;)gt[e*2+1]=8,e++,l[8]++;for(Th(gt,ti+1,l),e=0;e<Vn;e++)Lr[e*2+1]=5,Lr[e*2]=Rh(e,5);Sh=new Es(gt,Mo,hi+1,ti,on),xh=new Es(Lr,Xi,0,Vn,on),Eh=new Es(new Array(0),hm,0,Fa,dm)},Ah=e=>{let t;for(t=0;t<ti;t++)e.dyn_ltree[t*2]=0;for(t=0;t<Vn;t++)e.dyn_dtree[t*2]=0;for(t=0;t<Fa;t++)e.bl_tree[t*2]=0;e.dyn_ltree[Ua*2]=1,e.opt_len=e.static_len=0,e.sym_next=e.matches=0},Ch=e=>{e.bi_valid>8?ii(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0},ac=(e,t,n,r)=>{const i=t*2,l=n*2;return e[i]<e[l]||e[i]===e[l]&&r[t]<=r[n]},Rs=(e,t,n)=>{const r=e.heap[n];let i=n<<1;for(;i<=e.heap_len&&(i<e.heap_len&&ac(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!ac(t,r,e.heap[i],e.depth));)e.heap[n]=e.heap[i],n=i,i<<=1;e.heap[n]=r},uc=(e,t,n)=>{let r,i,l=0,s,o;if(e.sym_next!==0)do r=e.pending_buf[e.sym_buf+l++]&255,r+=(e.pending_buf[e.sym_buf+l++]&255)<<8,i=e.pending_buf[e.sym_buf+l++],r===0?at(e,i,t):(s=ri[i],at(e,s+hi+1,t),o=Mo[s],o!==0&&(i-=za[s],Ie(e,i,o)),r--,s=kh(r),at(e,s,n),o=Xi[s],o!==0&&(r-=El[s],Ie(e,r,o)));while(l<e.sym_next);at(e,Ua,t)},Oo=(e,t)=>{const n=t.dyn_tree,r=t.stat_desc.static_tree,i=t.stat_desc.has_stree,l=t.stat_desc.elems;let s,o,a=-1,u;for(e.heap_len=0,e.heap_max=mh,s=0;s<l;s++)n[s*2]!==0?(e.heap[++e.heap_len]=a=s,e.depth[s]=0):n[s*2+1]=0;for(;e.heap_len<2;)u=e.heap[++e.heap_len]=a<2?++a:0,n[u*2]=1,e.depth[u]=0,e.opt_len--,i&&(e.static_len-=r[u*2+1]);for(t.max_code=a,s=e.heap_len>>1;s>=1;s--)Rs(e,n,s);u=l;do s=e.heap[1],e.heap[1]=e.heap[e.heap_len--],Rs(e,n,1),o=e.heap[1],e.heap[--e.heap_max]=s,e.heap[--e.heap_max]=o,n[u*2]=n[s*2]+n[o*2],e.depth[u]=(e.depth[s]>=e.depth[o]?e.depth[s]:e.depth[o])+1,n[s*2+1]=n[o*2+1]=u,e.heap[1]=u++,Rs(e,n,1);while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],mm(e,t),Th(n,a,e.bl_count)},cc=(e,t,n)=>{let r,i=-1,l,s=t[0*2+1],o=0,a=7,u=4;for(s===0&&(a=138,u=3),t[(n+1)*2+1]=65535,r=0;r<=n;r++)l=s,s=t[(r+1)*2+1],!(++o<a&&l===s)&&(o<u?e.bl_tree[l*2]+=o:l!==0?(l!==i&&e.bl_tree[l*2]++,e.bl_tree[gh*2]++):o<=10?e.bl_tree[vh*2]++:e.bl_tree[wh*2]++,o=0,i=l,s===0?(a=138,u=3):l===s?(a=6,u=3):(a=7,u=4))},fc=(e,t,n)=>{let r,i=-1,l,s=t[0*2+1],o=0,a=7,u=4;for(s===0&&(a=138,u=3),r=0;r<=n;r++)if(l=s,s=t[(r+1)*2+1],!(++o<a&&l===s)){if(o<u)do at(e,l,e.bl_tree);while(--o!==0);else l!==0?(l!==i&&(at(e,l,e.bl_tree),o--),at(e,gh,e.bl_tree),Ie(e,o-3,2)):o<=10?(at(e,vh,e.bl_tree),Ie(e,o-3,3)):(at(e,wh,e.bl_tree),Ie(e,o-11,7));o=0,i=l,s===0?(a=138,u=3):l===s?(a=6,u=3):(a=7,u=4)}},vm=e=>{let t;for(cc(e,e.dyn_ltree,e.l_desc.max_code),cc(e,e.dyn_dtree,e.d_desc.max_code),Oo(e,e.bl_desc),t=Fa-1;t>=3&&e.bl_tree[yh[t]*2+1]===0;t--);return e.opt_len+=3*(t+1)+5+5+4,t},wm=(e,t,n,r)=>{let i;for(Ie(e,t-257,5),Ie(e,n-1,5),Ie(e,r-4,4),i=0;i<r;i++)Ie(e,e.bl_tree[yh[i]*2+1],3);fc(e,e.dyn_ltree,t-1),fc(e,e.dyn_dtree,n-1)},ym=e=>{let t=4093624447,n;for(n=0;n<=31;n++,t>>>=1)if(t&1&&e.dyn_ltree[n*2]!==0)return sc;if(e.dyn_ltree[9*2]!==0||e.dyn_ltree[10*2]!==0||e.dyn_ltree[13*2]!==0)return oc;for(n=32;n<hi;n++)if(e.dyn_ltree[n*2]!==0)return oc;return sc};let dc=!1;const Sm=e=>{dc||(gm(),dc=!0),e.l_desc=new ks(e.dyn_ltree,Sh),e.d_desc=new ks(e.dyn_dtree,xh),e.bl_desc=new ks(e.bl_tree,Eh),e.bi_buf=0,e.bi_valid=0,Ah(e)},Ih=(e,t,n,r)=>{Ie(e,(am<<1)+(r?1:0),3),Ch(e),ii(e,n),ii(e,~n),n&&e.pending_buf.set(e.window.subarray(t,t+n),e.pending),e.pending+=n},xm=e=>{Ie(e,_h<<1,3),at(e,Ua,gt),_m(e)},Em=(e,t,n,r)=>{let i,l,s=0;e.level>0?(e.strm.data_type===om&&(e.strm.data_type=ym(e)),Oo(e,e.l_desc),Oo(e,e.d_desc),s=vm(e),i=e.opt_len+3+7>>>3,l=e.static_len+3+7>>>3,l<=i&&(i=l)):i=l=n+5,n+4<=i&&t!==-1?Ih(e,t,n,r):e.strategy===sm||l===i?(Ie(e,(_h<<1)+(r?1:0),3),uc(e,gt,Lr)):(Ie(e,(um<<1)+(r?1:0),3),wm(e,e.l_desc.max_code+1,e.d_desc.max_code+1,s+1),uc(e,e.dyn_ltree,e.dyn_dtree)),Ah(e),r&&Ch(e)},km=(e,t,n)=>(e.pending_buf[e.sym_buf+e.sym_next++]=t,e.pending_buf[e.sym_buf+e.sym_next++]=t>>8,e.pending_buf[e.sym_buf+e.sym_next++]=n,t===0?e.dyn_ltree[n*2]++:(e.matches++,t--,e.dyn_ltree[(ri[n]+hi+1)*2]++,e.dyn_dtree[kh(t)*2]++),e.sym_next===e.sym_end);var Rm=Sm,Tm=Ih,Am=Em,Cm=km,Im=xm,Nm={_tr_init:Rm,_tr_stored_block:Tm,_tr_flush_block:Am,_tr_tally:Cm,_tr_align:Im};const Pm=(e,t,n,r)=>{let i=e&65535|0,l=e>>>16&65535|0,s=0;for(;n!==0;){s=n>2e3?2e3:n,n-=s;do i=i+t[r++]|0,l=l+i|0;while(--s);i%=65521,l%=65521}return i|l<<16|0};var li=Pm;const Mm=()=>{let e,t=[];for(var n=0;n<256;n++){e=n;for(var r=0;r<8;r++)e=e&1?3988292384^e>>>1:e>>>1;t[n]=e}return t},Om=new Uint32Array(Mm()),Lm=(e,t,n,r)=>{const i=Om,l=r+n;e^=-1;for(let s=r;s<l;s++)e=e>>>8^i[(e^t[s])&255];return e^-1};var ue=Lm,er={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},jl={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_UNKNOWN:2,Z_DEFLATED:8};const{_tr_init:Dm,_tr_stored_block:Lo,_tr_flush_block:bm,_tr_tally:Wt,_tr_align:Fm}=Nm,{Z_NO_FLUSH:Vt,Z_PARTIAL_FLUSH:Um,Z_FULL_FLUSH:zm,Z_FINISH:We,Z_BLOCK:hc,Z_OK:he,Z_STREAM_END:pc,Z_STREAM_ERROR:ft,Z_DATA_ERROR:Bm,Z_BUF_ERROR:Ts,Z_DEFAULT_COMPRESSION:Hm,Z_FILTERED:jm,Z_HUFFMAN_ONLY:Li,Z_RLE:$m,Z_FIXED:Wm,Z_DEFAULT_STRATEGY:Vm,Z_UNKNOWN:Gm,Z_DEFLATED:$l}=jl,Zm=9,Km=15,Qm=8,Ym=29,qm=256,Do=qm+1+Ym,Xm=30,Jm=19,eg=2*Do+1,tg=15,W=3,Dt=258,dt=Dt+W+1,ng=32,tr=42,Ba=57,bo=69,Fo=73,Uo=91,zo=103,an=113,Er=666,xe=1,ar=2,gn=3,ur=4,rg=3,un=(e,t)=>(e.msg=er[t],t),_c=e=>e*2-(e>4?9:0),Mt=e=>{let t=e.length;for(;--t>=0;)e[t]=0},ig=e=>{let t,n,r,i=e.w_size;t=e.hash_size,r=t;do n=e.head[--r],e.head[r]=n>=i?n-i:0;while(--t);t=i,r=t;do n=e.prev[--r],e.prev[r]=n>=i?n-i:0;while(--t)};let Ha=(e,t,n)=>(t<<e.hash_shift^n)&e.hash_mask;const vn=(e,t)=>{let n;if(e.legacy_hash)n=e.ins_h=Ha(e,e.ins_h,e.window[t+W-1]);else{const i=e.window,l=i[t]|i[t+1]<<8|i[t+2]<<16|i[t+3]<<24;n=e.ins_h=Math.imul(l,66521)+66521>>>16&e.hash_mask}const r=e.prev[t&e.w_mask]=e.head[n];return e.head[n]=t,r},Le=e=>{const t=e.state;let n=t.pending;n>e.avail_out&&(n=e.avail_out),n!==0&&(e.output.set(t.pending_buf.subarray(t.pending_out,t.pending_out+n),e.next_out),e.next_out+=n,t.pending_out+=n,e.total_out+=n,e.avail_out-=n,t.pending-=n,t.pending===0&&(t.pending_out=0))},Fe=(e,t)=>{bm(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,Le(e.strm)},V=(e,t)=>{e.pending_buf[e.pending++]=t},vr=(e,t)=>{e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=t&255},Bo=(e,t,n,r)=>{let i=e.avail_in;return i>r&&(i=r),i===0?0:(e.avail_in-=i,t.set(e.input.subarray(e.next_in,e.next_in+i),n),e.state.wrap===1?e.adler=li(e.adler,t,i,n):e.state.wrap===2&&(e.adler=ue(e.adler,t,i,n)),e.next_in+=i,e.total_in+=i,i)},Nh=(e,t)=>{let n=e.max_chain_length,r=e.strstart,i,l,s=e.prev_length,o=e.nice_match;const a=e.strstart>e.w_size-dt?e.strstart-(e.w_size-dt):0,u=e.window,c=e.w_mask,_=e.prev,h=e.strstart+Dt;let m=u[r+s-1],v=u[r+s];e.prev_length>=e.good_match&&(n>>=2),o>e.lookahead&&(o=e.lookahead);do if(i=t,!(u[i+s]!==v||u[i+s-1]!==m||u[i]!==u[r]||u[++i]!==u[r+1])){r+=2,i++;do;while(u[++r]===u[++i]&&u[++r]===u[++i]&&u[++r]===u[++i]&&u[++r]===u[++i]&&u[++r]===u[++i]&&u[++r]===u[++i]&&u[++r]===u[++i]&&u[++r]===u[++i]&&r<h);if(l=Dt-(h-r),r=h-Dt,l>s){if(e.match_start=t,s=l,l>=o)break;m=u[r+s-1],v=u[r+s]}}while((t=_[t&c])>a&&--n!==0);return s<=e.lookahead?s:e.lookahead},nr=e=>{const t=e.w_size;let n,r,i;do{if(r=e.window_size-e.lookahead-e.strstart,e.strstart>=t+(t-dt)&&(e.window.set(e.window.subarray(t,t+t-r),0),e.match_start-=t,e.strstart-=t,e.block_start-=t,e.insert>e.strstart&&(e.insert=e.strstart),ig(e),r+=t),e.strm.avail_in===0)break;if(n=Bo(e.strm,e.window,e.strstart+e.lookahead,r),e.lookahead+=n,e.legacy_hash){if(e.lookahead+e.insert>=W)for(i=e.strstart-e.insert,e.ins_h=e.window[i],e.ins_h=Ha(e,e.ins_h,e.window[i+1]);e.insert&&(vn(e,i),i++,e.insert--,!(e.lookahead+e.insert<W)););}else if(e.lookahead+e.insert>W)for(i=e.strstart-e.insert;e.insert&&(vn(e,i),i++,e.insert--,!(e.lookahead+e.insert<=W)););}while(e.lookahead<dt&&e.strm.avail_in!==0)},Ph=(e,t)=>{let n=e.pending_buf_size-5>e.w_size?e.w_size:e.pending_buf_size-5,r,i,l,s=0,o=e.strm.avail_in;do{if(r=65535,l=e.bi_valid+42>>3,e.strm.avail_out<l||(l=e.strm.avail_out-l,i=e.strstart-e.block_start,r>i+e.strm.avail_in&&(r=i+e.strm.avail_in),r>l&&(r=l),r<n&&(r===0&&t!==We||t===Vt||r!==i+e.strm.avail_in)))break;s=t===We&&r===i+e.strm.avail_in?1:0,Lo(e,0,0,s),e.pending_buf[e.pending-4]=r,e.pending_buf[e.pending-3]=r>>8,e.pending_buf[e.pending-2]=~r,e.pending_buf[e.pending-1]=~r>>8,Le(e.strm),i&&(i>r&&(i=r),e.strm.output.set(e.window.subarray(e.block_start,e.block_start+i),e.strm.next_out),e.strm.next_out+=i,e.strm.avail_out-=i,e.strm.total_out+=i,e.block_start+=i,r-=i),r&&(Bo(e.strm,e.strm.output,e.strm.next_out,r),e.strm.next_out+=r,e.strm.avail_out-=r,e.strm.total_out+=r)}while(s===0);return o-=e.strm.avail_in,o&&(o>=e.w_size?(e.matches=2,e.window.set(e.strm.input.subarray(e.strm.next_in-e.w_size,e.strm.next_in),0),e.strstart=e.w_size,e.insert=e.strstart):(e.window_size-e.strstart<=o&&(e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,e.insert>e.strstart&&(e.insert=e.strstart)),e.window.set(e.strm.input.subarray(e.strm.next_in-o,e.strm.next_in),e.strstart),e.strstart+=o,e.insert+=o>e.w_size-e.insert?e.w_size-e.insert:o),e.block_start=e.strstart),e.high_water<e.strstart&&(e.high_water=e.strstart),s?ur:t!==Vt&&t!==We&&e.strm.avail_in===0&&e.strstart===e.block_start?ar:(l=e.window_size-e.strstart,e.strm.avail_in>l&&e.block_start>=e.w_size&&(e.block_start-=e.w_size,e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,l+=e.w_size,e.insert>e.strstart&&(e.insert=e.strstart)),l>e.strm.avail_in&&(l=e.strm.avail_in),l&&(Bo(e.strm,e.window,e.strstart,l),e.strstart+=l,e.insert+=l>e.w_size-e.insert?e.w_size-e.insert:l),e.high_water<e.strstart&&(e.high_water=e.strstart),l=e.bi_valid+42>>3,l=e.pending_buf_size-l>65535?65535:e.pending_buf_size-l,n=l>e.w_size?e.w_size:l,i=e.strstart-e.block_start,(i>=n||(i||t===We)&&t!==Vt&&e.strm.avail_in===0&&i<=l)&&(r=i>l?l:i,s=t===We&&e.strm.avail_in===0&&r===i?1:0,Lo(e,e.block_start,r,s),e.block_start+=r,Le(e.strm)),s?gn:xe)},As=(e,t)=>{let n,r;for(;;){if(e.lookahead<dt){if(nr(e),e.lookahead<dt&&t===Vt)return xe;if(e.lookahead===0)break}if(n=0,e.lookahead>=W&&(n=vn(e,e.strstart)),n!==0&&e.strstart-n<=e.w_size-dt&&(e.match_length=Nh(e,n)),e.match_length>=W)if(r=Wt(e,e.strstart-e.match_start,e.match_length-W),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=W){e.match_length--;do e.strstart++,n=vn(e,e.strstart);while(--e.match_length!==0);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.legacy_hash&&(e.ins_h=e.window[e.strstart],e.ins_h=Ha(e,e.ins_h,e.window[e.strstart+1]));else r=Wt(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(r&&(Fe(e,!1),e.strm.avail_out===0))return xe}return e.insert=e.strstart<W-1?e.strstart:W-1,t===We?(Fe(e,!0),e.strm.avail_out===0?gn:ur):e.sym_next&&(Fe(e,!1),e.strm.avail_out===0)?xe:ar},Rn=(e,t)=>{let n,r,i;for(;;){if(e.lookahead<dt){if(nr(e),e.lookahead<dt&&t===Vt)return xe;if(e.lookahead===0)break}if(n=0,e.lookahead>=W&&(n=vn(e,e.strstart)),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=W-1,n!==0&&e.prev_length<e.max_lazy_match&&e.strstart-n<=e.w_size-dt&&(e.match_length=Nh(e,n),e.match_length<=5&&(e.strategy===jm||e.match_length===W&&e.strstart-e.match_start>4096)&&(e.match_length=W-1)),e.prev_length>=W&&e.match_length<=e.prev_length){i=e.strstart+e.lookahead-W,r=Wt(e,e.strstart-1-e.prev_match,e.prev_length-W),e.lookahead-=e.prev_length-1,e.prev_length-=2;do++e.strstart<=i&&(n=vn(e,e.strstart));while(--e.prev_length!==0);if(e.match_available=0,e.match_length=W-1,e.strstart++,r&&(Fe(e,!1),e.strm.avail_out===0))return xe}else if(e.match_available){if(r=Wt(e,0,e.window[e.strstart-1]),r&&Fe(e,!1),e.strstart++,e.lookahead--,e.strm.avail_out===0)return xe}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(r=Wt(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<W-1?e.strstart:W-1,t===We?(Fe(e,!0),e.strm.avail_out===0?gn:ur):e.sym_next&&(Fe(e,!1),e.strm.avail_out===0)?xe:ar},lg=(e,t)=>{let n,r,i,l;const s=e.window;for(;;){if(e.lookahead<=Dt){if(nr(e),e.lookahead<=Dt&&t===Vt)return xe;if(e.lookahead===0)break}if(e.match_length=0,e.lookahead>=W&&e.strstart>0&&(i=e.strstart-1,r=s[i],r===s[++i]&&r===s[++i]&&r===s[++i])){l=e.strstart+Dt;do;while(r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&i<l);e.match_length=Dt-(l-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=W?(n=Wt(e,1,e.match_length-W),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(n=Wt(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),n&&(Fe(e,!1),e.strm.avail_out===0))return xe}return e.insert=0,t===We?(Fe(e,!0),e.strm.avail_out===0?gn:ur):e.sym_next&&(Fe(e,!1),e.strm.avail_out===0)?xe:ar},sg=(e,t)=>{let n;for(;;){if(e.lookahead===0&&(nr(e),e.lookahead===0)){if(t===Vt)return xe;break}if(e.match_length=0,n=Wt(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,n&&(Fe(e,!1),e.strm.avail_out===0))return xe}return e.insert=0,t===We?(Fe(e,!0),e.strm.avail_out===0?gn:ur):e.sym_next&&(Fe(e,!1),e.strm.avail_out===0)?xe:ar};function it(e,t,n,r,i){this.good_length=e,this.max_lazy=t,this.nice_length=n,this.max_chain=r,this.func=i}const kr=[new it(0,0,0,0,Ph),new it(4,4,8,4,As),new it(4,5,16,8,As),new it(4,6,32,32,As),new it(4,4,16,16,Rn),new it(8,16,32,32,Rn),new it(8,16,128,128,Rn),new it(8,32,128,256,Rn),new it(32,128,258,1024,Rn),new it(32,258,258,4096,Rn)],og=e=>{e.window_size=2*e.w_size,Mt(e.head),e.max_lazy_match=kr[e.level].max_lazy,e.good_match=kr[e.level].good_length,e.nice_match=kr[e.level].nice_length,e.max_chain_length=kr[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=W-1,e.match_available=0,e.ins_h=0};function ag(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=$l,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.legacy_hash=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Uint16Array(eg*2),this.dyn_dtree=new Uint16Array((2*Xm+1)*2),this.bl_tree=new Uint16Array((2*Jm+1)*2),Mt(this.dyn_ltree),Mt(this.dyn_dtree),Mt(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Uint16Array(tg+1),this.heap=new Uint16Array(2*Do+1),Mt(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Uint16Array(2*Do+1),Mt(this.depth),this.sym_buf=0,this.lit_bufsize=0,this.sym_next=0,this.sym_end=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}const pi=e=>{if(!e)return 1;const t=e.state;return!t||t.strm!==e||t.status!==tr&&t.status!==Ba&&t.status!==bo&&t.status!==Fo&&t.status!==Uo&&t.status!==zo&&t.status!==an&&t.status!==Er?1:0},Mh=e=>{if(pi(e))return un(e,ft);e.total_in=e.total_out=0,e.data_type=Gm;const t=e.state;return t.pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap===2?Ba:t.wrap?tr:an,e.adler=t.wrap===2?0:1,t.last_flush=-2,Dm(t),he},Oh=e=>{const t=Mh(e);return t===he&&og(e.state),t},ug=(e,t)=>pi(e)||e.state.wrap!==2?ft:(e.state.gzhead=t,he),Lh=(e,t,n,r,i,l,s)=>{if(!e)return ft;let o=1;if(t===Hm&&(t=6),r<0?(o=0,r=-r):r>15&&(o=2,r-=16),i<1||i>Zm||n!==$l||r<8||r>15||t<0||t>9||l<0||l>Wm||r===8&&o!==1)return un(e,ft);r===8&&(r=9);const a=new ag;return e.state=a,a.strm=e,a.status=tr,a.wrap=o,a.gzhead=null,a.w_bits=r,a.w_size=1<<a.w_bits,a.w_mask=a.w_size-1,a.legacy_hash=s?1:0,a.hash_bits=i+7,!a.legacy_hash&&a.hash_bits<15&&(a.hash_bits=15),a.hash_size=1<<a.hash_bits,a.hash_mask=a.hash_size-1,a.hash_shift=~~((a.hash_bits+W-1)/W),a.window=new Uint8Array(a.w_size*2),a.head=new Uint16Array(a.hash_size),a.prev=new Uint16Array(a.w_size),a.lit_bufsize=1<<i+6,a.pending_buf_size=a.lit_bufsize*4,a.pending_buf=new Uint8Array(a.pending_buf_size),a.sym_buf=a.lit_bufsize,a.sym_end=(a.lit_bufsize-1)*3,a.level=t,a.strategy=l,a.method=n,Oh(e)},cg=(e,t)=>Lh(e,t,$l,Km,Qm,Vm),fg=(e,t)=>{if(pi(e)||t>hc||t<0)return e?un(e,ft):ft;const n=e.state;if(!e.output||e.avail_in!==0&&!e.input||n.status===Er&&t!==We)return un(e,e.avail_out===0?Ts:ft);const r=n.last_flush;if(n.last_flush=t,n.pending!==0){if(Le(e),e.avail_out===0)return n.last_flush=-1,he}else if(e.avail_in===0&&_c(t)<=_c(r)&&t!==We)return un(e,Ts);if(n.status===Er&&e.avail_in!==0)return un(e,Ts);if(n.status===tr&&n.wrap===0&&(n.status=an),n.status===tr){let i=$l+(n.w_bits-8<<4)<<8,l=-1;if(n.strategy>=Li||n.level<2?l=0:n.level<6?l=1:n.level===6?l=2:l=3,i|=l<<6,n.strstart!==0&&(i|=ng),i+=31-i%31,vr(n,i),n.strstart!==0&&(vr(n,e.adler>>>16),vr(n,e.adler&65535)),e.adler=1,n.status=an,Le(e),n.pending!==0)return n.last_flush=-1,he}if(n.status===Ba){if(e.adler=0,V(n,31),V(n,139),V(n,8),n.gzhead)V(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),V(n,n.gzhead.time&255),V(n,n.gzhead.time>>8&255),V(n,n.gzhead.time>>16&255),V(n,n.gzhead.time>>24&255),V(n,n.level===9?2:n.strategy>=Li||n.level<2?4:0),V(n,n.gzhead.os&255),n.gzhead.extra&&n.gzhead.extra.length&&(V(n,n.gzhead.extra.length&255),V(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(e.adler=ue(e.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=bo;else if(V(n,0),V(n,0),V(n,0),V(n,0),V(n,0),V(n,n.level===9?2:n.strategy>=Li||n.level<2?4:0),V(n,rg),n.status=an,Le(e),n.pending!==0)return n.last_flush=-1,he}if(n.status===bo){if(n.gzhead.extra){let i=n.pending,l=(n.gzhead.extra.length&65535)-n.gzindex;for(;n.pending+l>n.pending_buf_size;){let o=n.pending_buf_size-n.pending;if(n.pending_buf.set(n.gzhead.extra.subarray(n.gzindex,n.gzindex+o),n.pending),n.pending=n.pending_buf_size,n.gzhead.hcrc&&n.pending>i&&(e.adler=ue(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex+=o,Le(e),n.pending!==0)return n.last_flush=-1,he;i=0,l-=o}let s=new Uint8Array(n.gzhead.extra);n.pending_buf.set(s.subarray(n.gzindex,n.gzindex+l),n.pending),n.pending+=l,n.gzhead.hcrc&&n.pending>i&&(e.adler=ue(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex=0}n.status=Fo}if(n.status===Fo){if(n.gzhead.name){let i=n.pending,l;do{if(n.pending===n.pending_buf_size){if(n.gzhead.hcrc&&n.pending>i&&(e.adler=ue(e.adler,n.pending_buf,n.pending-i,i)),Le(e),n.pending!==0)return n.last_flush=-1,he;i=0}n.gzindex<n.gzhead.name.length?l=n.gzhead.name.charCodeAt(n.gzindex++)&255:l=0,V(n,l)}while(l!==0);n.gzhead.hcrc&&n.pending>i&&(e.adler=ue(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex=0}n.status=Uo}if(n.status===Uo){if(n.gzhead.comment){let i=n.pending,l;do{if(n.pending===n.pending_buf_size){if(n.gzhead.hcrc&&n.pending>i&&(e.adler=ue(e.adler,n.pending_buf,n.pending-i,i)),Le(e),n.pending!==0)return n.last_flush=-1,he;i=0}n.gzindex<n.gzhead.comment.length?l=n.gzhead.comment.charCodeAt(n.gzindex++)&255:l=0,V(n,l)}while(l!==0);n.gzhead.hcrc&&n.pending>i&&(e.adler=ue(e.adler,n.pending_buf,n.pending-i,i))}n.status=zo}if(n.status===zo){if(n.gzhead.hcrc){if(n.pending+2>n.pending_buf_size&&(Le(e),n.pending!==0))return n.last_flush=-1,he;V(n,e.adler&255),V(n,e.adler>>8&255),e.adler=0}if(n.status=an,Le(e),n.pending!==0)return n.last_flush=-1,he}if(e.avail_in!==0||n.lookahead!==0||t!==Vt&&n.status!==Er){let i=n.level===0?Ph(n,t):n.strategy===Li?sg(n,t):n.strategy===$m?lg(n,t):kr[n.level].func(n,t);if((i===gn||i===ur)&&(n.status=Er),i===xe||i===gn)return e.avail_out===0&&(n.last_flush=-1),he;if(i===ar&&(t===Um?Fm(n):t!==hc&&(Lo(n,0,0,!1),t===zm&&(Mt(n.head),n.lookahead===0&&(n.strstart=0,n.block_start=0,n.insert=0))),Le(e),e.avail_out===0))return n.last_flush=-1,he}return t!==We?he:n.wrap<=0?pc:(n.wrap===2?(V(n,e.adler&255),V(n,e.adler>>8&255),V(n,e.adler>>16&255),V(n,e.adler>>24&255),V(n,e.total_in&255),V(n,e.total_in>>8&255),V(n,e.total_in>>16&255),V(n,e.total_in>>24&255)):(vr(n,e.adler>>>16),vr(n,e.adler&65535)),Le(e),n.wrap>0&&(n.wrap=-n.wrap),n.pending!==0?he:pc)},dg=e=>{if(pi(e))return ft;const t=e.state.status;return e.state=null,t===an?un(e,Bm):he},hg=(e,t)=>{let n=t.length;if(pi(e))return ft;const r=e.state,i=r.wrap;if(i===2||i===1&&r.status!==tr||r.lookahead)return ft;if(i===1&&(e.adler=li(e.adler,t,n,0)),r.wrap=0,n>=r.w_size){i===0&&(Mt(r.head),r.strstart=0,r.block_start=0,r.insert=0);let a=new Uint8Array(r.w_size);a.set(t.subarray(n-r.w_size,n),0),t=a,n=r.w_size}const l=e.avail_in,s=e.next_in,o=e.input;for(e.avail_in=n,e.next_in=0,e.input=t,nr(r);r.lookahead>=W;){let a=r.strstart,u=r.lookahead-(W-1);do vn(r,a),a++;while(--u);r.strstart=a,r.lookahead=W-1,nr(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=W-1,r.match_available=0,e.next_in=s,e.input=o,e.avail_in=l,r.wrap=i,he};var pg=cg,_g=Lh,mg=Oh,gg=Mh,vg=ug,wg=fg,yg=dg,Sg=hg,xg="pako deflate (from Nodeca project)",Dr={deflateInit:pg,deflateInit2:_g,deflateReset:mg,deflateResetKeep:gg,deflateSetHeader:vg,deflate:wg,deflateEnd:yg,deflateSetDictionary:Sg,deflateInfo:xg};const Eg=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var kg=function(e){const t=Array.prototype.slice.call(arguments,1);for(;t.length;){const n=t.shift();if(n){if(typeof n!="object")throw new TypeError(n+"must be non-object");for(const r in n)Eg(n,r)&&(e[r]=n[r])}}return e},Rg=e=>{let t=0;for(let r=0,i=e.length;r<i;r++)t+=e[r].length;const n=new Uint8Array(t);for(let r=0,i=0,l=e.length;r<l;r++){let s=e[r];n.set(s,i),i+=s.length}return n},Wl={assign:kg,flattenChunks:Rg};let Dh=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{Dh=!1}const si=new Uint8Array(256);for(let e=0;e<256;e++)si[e]=e>=252?6:e>=248?5:e>=240?4:e>=224?3:e>=192?2:1;si[254]=si[255]=1;var Tg=e=>{if(typeof TextEncoder=="function"&&TextEncoder.prototype.encode)return new TextEncoder().encode(e);let t,n,r,i,l,s=e.length,o=0;for(i=0;i<s;i++)n=e.charCodeAt(i),(n&64512)===55296&&i+1<s&&(r=e.charCodeAt(i+1),(r&64512)===56320&&(n=65536+(n-55296<<10)+(r-56320),i++)),o+=n<128?1:n<2048?2:n<65536?3:4;for(t=new Uint8Array(o),l=0,i=0;l<o;i++)n=e.charCodeAt(i),(n&64512)===55296&&i+1<s&&(r=e.charCodeAt(i+1),(r&64512)===56320&&(n=65536+(n-55296<<10)+(r-56320),i++)),n<128?t[l++]=n:n<2048?(t[l++]=192|n>>>6,t[l++]=128|n&63):n<65536?(t[l++]=224|n>>>12,t[l++]=128|n>>>6&63,t[l++]=128|n&63):(t[l++]=240|n>>>18,t[l++]=128|n>>>12&63,t[l++]=128|n>>>6&63,t[l++]=128|n&63);return t};const Ag=(e,t)=>{if(t<65534&&e.subarray&&Dh)return String.fromCharCode.apply(null,e.length===t?e:e.subarray(0,t));let n="";for(let r=0;r<t;r++)n+=String.fromCharCode(e[r]);return n};var Cg=(e,t)=>{const n=t||e.length;if(typeof TextDecoder=="function"&&TextDecoder.prototype.decode)return new TextDecoder().decode(e.subarray(0,t));let r,i;const l=new Array(n*2);for(i=0,r=0;r<n;){let s=e[r++];if(s<128){l[i++]=s;continue}let o=si[s];if(o>4){l[i++]=65533,r+=o-1;continue}for(s&=o===2?31:o===3?15:7;o>1&&r<n;)s=s<<6|e[r++]&63,o--;if(o>1){l[i++]=65533;continue}s<65536?l[i++]=s:(s-=65536,l[i++]=55296|s>>10&1023,l[i++]=56320|s&1023)}return Ag(l,i)},Ig=(e,t)=>{t=t||e.length,t>e.length&&(t=e.length);let n=t-1;for(;n>=0&&(e[n]&192)===128;)n--;return n<0||n===0?t:n+si[e[n]]>t?n:t},oi={string2buf:Tg,buf2string:Cg,utf8border:Ig};function Ng(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}var bh=Ng;const Fh=Object.prototype.toString,{Z_NO_FLUSH:Pg,Z_SYNC_FLUSH:Mg,Z_FULL_FLUSH:Og,Z_FINISH:Lg,Z_OK:kl,Z_STREAM_END:Dg,Z_DEFAULT_COMPRESSION:bg,Z_DEFAULT_STRATEGY:Fg,Z_DEFLATED:Ug}=jl,zg={level:bg,method:Ug,chunkSize:16384,windowBits:15,memLevel:8,strategy:Fg,legacyHash:!0};function Vl(e){this.options=Wl.assign({},zg,e||{});let t=this.options;t.raw&&t.windowBits>0?t.windowBits=-t.windowBits:t.gzip&&t.windowBits>0&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new bh,this.strm.avail_out=0;let n=Dr.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy,t.legacyHash);if(n!==kl)throw new Error(er[n]);if(t.header&&Dr.deflateSetHeader(this.strm,t.header),t.dictionary){let r;if(typeof t.dictionary=="string"?r=oi.string2buf(t.dictionary):Fh.call(t.dictionary)==="[object ArrayBuffer]"?r=new Uint8Array(t.dictionary):r=t.dictionary,n=Dr.deflateSetDictionary(this.strm,r),n!==kl)throw new Error(er[n]);this._dict_set=!0}}Vl.prototype.push=function(e,t){const n=this.strm,r=this.options.chunkSize;let i,l;if(this.ended)return!1;for(t===~~t?l=t:l=t===!0?Lg:Pg,typeof e=="string"?n.input=oi.string2buf(e):Fh.call(e)==="[object ArrayBuffer]"?n.input=new Uint8Array(e):n.input=e,n.next_in=0,n.avail_in=n.input.length;;){if(n.avail_out===0&&(n.output=new Uint8Array(r),n.next_out=0,n.avail_out=r),(l===Mg||l===Og)&&n.avail_out<=6){this.onData(n.output.subarray(0,n.next_out)),n.avail_out=0;continue}if(i=Dr.deflate(n,l),i===Dg)return n.next_out>0&&this.onData(n.output.subarray(0,n.next_out)),i=Dr.deflateEnd(this.strm),this.onEnd(i),this.ended=!0,i===kl;if(n.avail_out===0){this.onData(n.output);continue}if(l>0&&n.next_out>0){this.onData(n.output.subarray(0,n.next_out)),n.avail_out=0;continue}if(n.avail_in===0)break}return!0};Vl.prototype.onData=function(e){this.chunks.push(e)};Vl.prototype.onEnd=function(e){e===kl&&(this.result=Wl.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};function Bg(e,t){const n=new Vl(t);if(n.push(e,!0),n.err)throw n.msg||er[n.err];return n.result}var Hg=Bg,jg={deflate:Hg};const Di=16209,$g=16191;var Wg=function(t,n){let r,i,l,s,o,a,u,c,_,h,m,v,S,E,d,f,p,g,x,R,y,T,I,A;const L=t.state;r=t.next_in,I=t.input,i=r+(t.avail_in-5),l=t.next_out,A=t.output,s=l-(n-t.avail_out),o=l+(t.avail_out-257),a=L.dmax,u=L.wsize,c=L.whave,_=L.wnext,h=L.window,m=L.hold,v=L.bits,S=L.lencode,E=L.distcode,d=(1<<L.lenbits)-1,f=(1<<L.distbits)-1;e:do{v<15&&(m+=I[r++]<<v,v+=8,m+=I[r++]<<v,v+=8),p=S[m&d];t:for(;;){if(g=p>>>24,m>>>=g,v-=g,g=p>>>16&255,g===0)A[l++]=p&65535;else if(g&16){x=p&65535,g&=15,g&&(v<g&&(m+=I[r++]<<v,v+=8),x+=m&(1<<g)-1,m>>>=g,v-=g),v<15&&(m+=I[r++]<<v,v+=8,m+=I[r++]<<v,v+=8),p=E[m&f];n:for(;;){if(g=p>>>24,m>>>=g,v-=g,g=p>>>16&255,g&16){if(R=p&65535,g&=15,v<g&&(m+=I[r++]<<v,v+=8,v<g&&(m+=I[r++]<<v,v+=8)),R+=m&(1<<g)-1,R>a){t.msg="invalid distance too far back",L.mode=Di;break e}if(m>>>=g,v-=g,g=l-s,R>g){if(g=R-g,g>c&&L.sane){t.msg="invalid distance too far back",L.mode=Di;break e}if(y=0,T=h,_===0){if(y+=u-g,g<x){x-=g;do A[l++]=h[y++];while(--g);y=l-R,T=A}}else if(_<g){if(y+=u+_-g,g-=_,g<x){x-=g;do A[l++]=h[y++];while(--g);if(y=0,_<x){g=_,x-=g;do A[l++]=h[y++];while(--g);y=l-R,T=A}}}else if(y+=_-g,g<x){x-=g;do A[l++]=h[y++];while(--g);y=l-R,T=A}for(;x>2;)A[l++]=T[y++],A[l++]=T[y++],A[l++]=T[y++],x-=3;x&&(A[l++]=T[y++],x>1&&(A[l++]=T[y++]))}else{y=l-R;do A[l++]=A[y++],A[l++]=A[y++],A[l++]=A[y++],x-=3;while(x>2);x&&(A[l++]=A[y++],x>1&&(A[l++]=A[y++]))}}else if(g&64){t.msg="invalid distance code",L.mode=Di;break e}else{p=E[(p&65535)+(m&(1<<g)-1)];continue n}break}}else if(g&64)if(g&32){L.mode=$g;break e}else{t.msg="invalid literal/length code",L.mode=Di;break e}else{p=S[(p&65535)+(m&(1<<g)-1)];continue t}break}}while(r<i&&l<o);x=v>>3,r-=x,v-=x<<3,m&=(1<<v)-1,t.next_in=r,t.next_out=l,t.avail_in=r<i?5+(i-r):5-(r-i),t.avail_out=l<o?257+(o-l):257-(l-o),L.hold=m,L.bits=v};const Tn=15,mc=852,gc=592,vc=0,Cs=1,wc=2,Vg=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),Gg=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,199,75]),Zg=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),Kg=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]),Qg=(e,t,n,r,i,l,s,o)=>{const a=o.bits;let u=0,c=0,_=0,h=0,m=0,v=0,S=0,E=0,d=0,f=0,p,g,x,R,y,T=null,I;const A=new Uint16Array(Tn+1),L=new Uint16Array(Tn+1);let O=null,b,F,H;for(u=0;u<=Tn;u++)A[u]=0;for(c=0;c<r;c++)A[t[n+c]]++;for(m=a,h=Tn;h>=1&&A[h]===0;h--);if(m>h&&(m=h),h===0)return i[l++]=1<<24|64<<16|0,i[l++]=1<<24|64<<16|0,o.bits=1,0;for(_=1;_<h&&A[_]===0;_++);for(m<_&&(m=_),E=1,u=1;u<=Tn;u++)if(E<<=1,E-=A[u],E<0)return-1;if(E>0&&(e===vc||h!==1))return-1;for(L[1]=0,u=1;u<Tn;u++)L[u+1]=L[u]+A[u];for(c=0;c<r;c++)t[n+c]!==0&&(s[L[t[n+c]]++]=c);if(e===vc?(T=O=s,I=20):e===Cs?(T=Vg,O=Gg,I=257):(T=Zg,O=Kg,I=0),f=0,c=0,u=_,y=l,v=m,S=0,x=-1,d=1<<m,R=d-1,e===Cs&&d>mc||e===wc&&d>gc)return 1;for(;;){b=u-S,s[c]+1<I?(F=0,H=s[c]):s[c]>=I?(F=O[s[c]-I],H=T[s[c]-I]):(F=96,H=0),p=1<<u-S,g=1<<v,_=g;do g-=p,i[y+(f>>S)+g]=b<<24|F<<16|H|0;while(g!==0);for(p=1<<u-1;f&p;)p>>=1;if(p!==0?(f&=p-1,f+=p):f=0,c++,--A[u]===0){if(u===h)break;u=t[n+s[c]]}if(u>m&&(f&R)!==x){for(S===0&&(S=m),y+=_,v=u-S,E=1<<v;v+S<h&&(E-=A[v+S],!(E<=0));)v++,E<<=1;if(d+=1<<v,e===Cs&&d>mc||e===wc&&d>gc)return 1;x=f&R,i[x]=m<<24|v<<16|y-l|0}}return f!==0&&(i[y+f]=u-S<<24|64<<16|0),o.bits=m,0};var br=Qg;const Yg=0,Uh=1,zh=2,{Z_FINISH:yc,Z_BLOCK:qg,Z_TREES:bi,Z_OK:wn,Z_STREAM_END:Xg,Z_NEED_DICT:Jg,Z_STREAM_ERROR:Qe,Z_DATA_ERROR:Bh,Z_MEM_ERROR:Hh,Z_BUF_ERROR:e1,Z_DEFLATED:Sc}=jl,Gl=16180,xc=16181,Ec=16182,kc=16183,Rc=16184,Tc=16185,Ac=16186,Cc=16187,Ic=16188,Nc=16189,Rl=16190,pt=16191,Is=16192,Pc=16193,Ns=16194,Mc=16195,Oc=16196,Lc=16197,Dc=16198,Fi=16199,Ui=16200,bc=16201,Fc=16202,Uc=16203,zc=16204,Bc=16205,Ps=16206,Hc=16207,jc=16208,X=16209,jh=16210,$h=16211,t1=852,n1=592,r1=15,i1=r1,$c=e=>(e>>>24&255)+(e>>>8&65280)+((e&65280)<<8)+((e&255)<<24);function l1(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const En=e=>{if(!e)return 1;const t=e.state;return!t||t.strm!==e||t.mode<Gl||t.mode>$h?1:0},Wh=e=>{if(En(e))return Qe;const t=e.state;return e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=t.wrap&1),t.mode=Gl,t.last=0,t.havedict=0,t.flags=-1,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new Int32Array(t1),t.distcode=t.distdyn=new Int32Array(n1),t.sane=1,t.back=-1,wn},Vh=e=>{if(En(e))return Qe;const t=e.state;return t.wsize=0,t.whave=0,t.wnext=0,Wh(e)},Gh=(e,t)=>{let n;if(En(e))return Qe;const r=e.state;return t<0?(n=0,t=-t):(n=(t>>4)+5,t<48&&(t&=15)),t&&(t<8||t>15)?Qe:(r.window!==null&&r.wbits!==t&&(r.window=null),r.wrap=n,r.wbits=t,Vh(e))},Zh=(e,t)=>{if(!e)return Qe;const n=new l1;e.state=n,n.strm=e,n.window=null,n.mode=Gl;const r=Gh(e,t);return r!==wn&&(e.state=null),r},s1=e=>Zh(e,i1);let Wc=!0,Ms,Os;const o1=e=>{if(Wc){Ms=new Int32Array(512),Os=new Int32Array(32);let t=0;for(;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(br(Uh,e.lens,0,288,Ms,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;br(zh,e.lens,0,32,Os,0,e.work,{bits:5}),Wc=!1}e.lencode=Ms,e.lenbits=9,e.distcode=Os,e.distbits=5},Kh=(e,t,n,r)=>{let i;const l=e.state;return l.window===null&&(l.window=new Uint8Array(1<<l.wbits)),l.wsize===0&&(l.wsize=1<<l.wbits,l.wnext=0,l.whave=0),r>=l.wsize?(l.window.set(t.subarray(n-l.wsize,n),0),l.wnext=0,l.whave=l.wsize):(i=l.wsize-l.wnext,i>r&&(i=r),l.window.set(t.subarray(n-r,n-r+i),l.wnext),r-=i,r?(l.window.set(t.subarray(n-r,n),0),l.wnext=r,l.whave=l.wsize):(l.wnext+=i,l.wnext===l.wsize&&(l.wnext=0),l.whave<l.wsize&&(l.whave+=i))),0},a1=(e,t)=>{let n,r,i,l,s,o,a,u,c,_,h,m,v,S,E=0,d,f,p,g,x,R,y,T;const I=new Uint8Array(4);let A,L;const O=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(En(e)||!e.output||!e.input&&e.avail_in!==0)return Qe;n=e.state,n.mode===pt&&(n.mode=Is),s=e.next_out,i=e.output,a=e.avail_out,l=e.next_in,r=e.input,o=e.avail_in,u=n.hold,c=n.bits,_=o,h=a,T=wn;e:for(;;)switch(n.mode){case Gl:if(n.wrap===0){n.mode=Is;break}for(;c<16;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if(n.wrap&2&&u===35615){n.wbits===0&&(n.wbits=15),n.check=0,I[0]=u&255,I[1]=u>>>8&255,n.check=ue(n.check,I,2,0),u=0,c=0,n.mode=xc;break}if(n.head&&(n.head.done=!1),!(n.wrap&1)||(((u&255)<<8)+(u>>8))%31){e.msg="incorrect header check",n.mode=X;break}if((u&15)!==Sc){e.msg="unknown compression method",n.mode=X;break}if(u>>>=4,c-=4,y=(u&15)+8,n.wbits===0&&(n.wbits=y),y>15||y>n.wbits){e.msg="invalid window size",n.mode=X;break}n.dmax=1<<n.wbits,n.flags=0,e.adler=n.check=1,n.mode=u&512?Nc:pt,u=0,c=0;break;case xc:for(;c<16;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if(n.flags=u,(n.flags&255)!==Sc){e.msg="unknown compression method",n.mode=X;break}if(n.flags&57344){e.msg="unknown header flags set",n.mode=X;break}n.head&&(n.head.text=u>>8&1),n.flags&512&&n.wrap&4&&(I[0]=u&255,I[1]=u>>>8&255,n.check=ue(n.check,I,2,0)),u=0,c=0,n.mode=Ec;case Ec:for(;c<32;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}n.head&&(n.head.time=u),n.flags&512&&n.wrap&4&&(I[0]=u&255,I[1]=u>>>8&255,I[2]=u>>>16&255,I[3]=u>>>24&255,n.check=ue(n.check,I,4,0)),u=0,c=0,n.mode=kc;case kc:for(;c<16;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}n.head&&(n.head.xflags=u&255,n.head.os=u>>8),n.flags&512&&n.wrap&4&&(I[0]=u&255,I[1]=u>>>8&255,n.check=ue(n.check,I,2,0)),u=0,c=0,n.mode=Rc;case Rc:if(n.flags&1024){for(;c<16;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}n.length=u,n.head&&(n.head.extra_len=u),n.flags&512&&n.wrap&4&&(I[0]=u&255,I[1]=u>>>8&255,n.check=ue(n.check,I,2,0)),u=0,c=0}else n.head&&(n.head.extra=null);n.mode=Tc;case Tc:if(n.flags&1024&&(m=n.length,m>o&&(m=o),m&&(n.head&&(y=n.head.extra_len-n.length,n.head.extra||(n.head.extra=new Uint8Array(n.head.extra_len)),n.head.extra.set(r.subarray(l,l+m),y)),n.flags&512&&n.wrap&4&&(n.check=ue(n.check,r,m,l)),o-=m,l+=m,n.length-=m),n.length))break e;n.length=0,n.mode=Ac;case Ac:if(n.flags&2048){if(o===0)break e;m=0;do y=r[l+m++],n.head&&y&&n.length<65536&&(n.head.name+=String.fromCharCode(y));while(y&&m<o);if(n.flags&512&&n.wrap&4&&(n.check=ue(n.check,r,m,l)),o-=m,l+=m,y)break e}else n.head&&(n.head.name=null);n.length=0,n.mode=Cc;case Cc:if(n.flags&4096){if(o===0)break e;m=0;do y=r[l+m++],n.head&&y&&n.length<65536&&(n.head.comment+=String.fromCharCode(y));while(y&&m<o);if(n.flags&512&&n.wrap&4&&(n.check=ue(n.check,r,m,l)),o-=m,l+=m,y)break e}else n.head&&(n.head.comment=null);n.mode=Ic;case Ic:if(n.flags&512){for(;c<16;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if(n.wrap&4&&u!==(n.check&65535)){e.msg="header crc mismatch",n.mode=X;break}u=0,c=0}n.head&&(n.head.hcrc=n.flags>>9&1,n.head.done=!0),e.adler=n.check=0,n.mode=pt;break;case Nc:for(;c<32;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}e.adler=n.check=$c(u),u=0,c=0,n.mode=Rl;case Rl:if(n.havedict===0)return e.next_out=s,e.avail_out=a,e.next_in=l,e.avail_in=o,n.hold=u,n.bits=c,Jg;e.adler=n.check=1,n.mode=pt;case pt:if(t===qg||t===bi)break e;case Is:if(n.last){u>>>=c&7,c-=c&7,n.mode=Ps;break}for(;c<3;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}switch(n.last=u&1,u>>>=1,c-=1,u&3){case 0:n.mode=Pc;break;case 1:if(o1(n),n.mode=Fi,t===bi){u>>>=2,c-=2;break e}break;case 2:n.mode=Oc;break;case 3:e.msg="invalid block type",n.mode=X}u>>>=2,c-=2;break;case Pc:for(u>>>=c&7,c-=c&7;c<32;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if((u&65535)!==(u>>>16^65535)){e.msg="invalid stored block lengths",n.mode=X;break}if(n.length=u&65535,u=0,c=0,n.mode=Ns,t===bi)break e;case Ns:n.mode=Mc;case Mc:if(m=n.length,m){if(m>o&&(m=o),m>a&&(m=a),m===0)break e;i.set(r.subarray(l,l+m),s),o-=m,l+=m,a-=m,s+=m,n.length-=m;break}n.mode=pt;break;case Oc:for(;c<14;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if(n.nlen=(u&31)+257,u>>>=5,c-=5,n.ndist=(u&31)+1,u>>>=5,c-=5,n.ncode=(u&15)+4,u>>>=4,c-=4,n.nlen>286||n.ndist>30){e.msg="too many length or distance symbols",n.mode=X;break}n.have=0,n.mode=Lc;case Lc:for(;n.have<n.ncode;){for(;c<3;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}n.lens[O[n.have++]]=u&7,u>>>=3,c-=3}for(;n.have<19;)n.lens[O[n.have++]]=0;if(n.lencode=n.lendyn,n.lenbits=7,A={bits:n.lenbits},T=br(Yg,n.lens,0,19,n.lencode,0,n.work,A),n.lenbits=A.bits,T){e.msg="invalid code lengths set",n.mode=X;break}n.have=0,n.mode=Dc;case Dc:for(;n.have<n.nlen+n.ndist;){for(;E=n.lencode[u&(1<<n.lenbits)-1],d=E>>>24,f=E>>>16&255,p=E&65535,!(d<=c);){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if(p<16)u>>>=d,c-=d,n.lens[n.have++]=p;else{if(p===16){for(L=d+2;c<L;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if(u>>>=d,c-=d,n.have===0){e.msg="invalid bit length repeat",n.mode=X;break}y=n.lens[n.have-1],m=3+(u&3),u>>>=2,c-=2}else if(p===17){for(L=d+3;c<L;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}u>>>=d,c-=d,y=0,m=3+(u&7),u>>>=3,c-=3}else{for(L=d+7;c<L;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}u>>>=d,c-=d,y=0,m=11+(u&127),u>>>=7,c-=7}if(n.have+m>n.nlen+n.ndist){e.msg="invalid bit length repeat",n.mode=X;break}for(;m--;)n.lens[n.have++]=y}}if(n.mode===X)break;if(n.lens[256]===0){e.msg="invalid code -- missing end-of-block",n.mode=X;break}if(n.lenbits=9,A={bits:n.lenbits},T=br(Uh,n.lens,0,n.nlen,n.lencode,0,n.work,A),n.lenbits=A.bits,T){e.msg="invalid literal/lengths set",n.mode=X;break}if(n.distbits=6,n.distcode=n.distdyn,A={bits:n.distbits},T=br(zh,n.lens,n.nlen,n.ndist,n.distcode,0,n.work,A),n.distbits=A.bits,T){e.msg="invalid distances set",n.mode=X;break}if(n.mode=Fi,t===bi)break e;case Fi:n.mode=Ui;case Ui:if(o>=6&&a>=258){e.next_out=s,e.avail_out=a,e.next_in=l,e.avail_in=o,n.hold=u,n.bits=c,Wg(e,h),s=e.next_out,i=e.output,a=e.avail_out,l=e.next_in,r=e.input,o=e.avail_in,u=n.hold,c=n.bits,n.mode===pt&&(n.back=-1);break}for(n.back=0;E=n.lencode[u&(1<<n.lenbits)-1],d=E>>>24,f=E>>>16&255,p=E&65535,!(d<=c);){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if(f&&!(f&240)){for(g=d,x=f,R=p;E=n.lencode[R+((u&(1<<g+x)-1)>>g)],d=E>>>24,f=E>>>16&255,p=E&65535,!(g+d<=c);){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}u>>>=g,c-=g,n.back+=g}if(u>>>=d,c-=d,n.back+=d,n.length=p,f===0){n.mode=Bc;break}if(f&32){n.back=-1,n.mode=pt;break}if(f&64){e.msg="invalid literal/length code",n.mode=X;break}n.extra=f&15,n.mode=bc;case bc:if(n.extra){for(L=n.extra;c<L;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}n.length+=u&(1<<n.extra)-1,u>>>=n.extra,c-=n.extra,n.back+=n.extra}n.was=n.length,n.mode=Fc;case Fc:for(;E=n.distcode[u&(1<<n.distbits)-1],d=E>>>24,f=E>>>16&255,p=E&65535,!(d<=c);){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if(!(f&240)){for(g=d,x=f,R=p;E=n.distcode[R+((u&(1<<g+x)-1)>>g)],d=E>>>24,f=E>>>16&255,p=E&65535,!(g+d<=c);){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}u>>>=g,c-=g,n.back+=g}if(u>>>=d,c-=d,n.back+=d,f&64){e.msg="invalid distance code",n.mode=X;break}n.offset=p,n.extra=f&15,n.mode=Uc;case Uc:if(n.extra){for(L=n.extra;c<L;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}n.offset+=u&(1<<n.extra)-1,u>>>=n.extra,c-=n.extra,n.back+=n.extra}if(n.offset>n.dmax){e.msg="invalid distance too far back",n.mode=X;break}n.mode=zc;case zc:if(a===0)break e;if(m=h-a,n.offset>m){if(m=n.offset-m,m>n.whave&&n.sane){e.msg="invalid distance too far back",n.mode=X;break}m>n.wnext?(m-=n.wnext,v=n.wsize-m):v=n.wnext-m,m>n.length&&(m=n.length),S=n.window}else S=i,v=s-n.offset,m=n.length;m>a&&(m=a),a-=m,n.length-=m;do i[s++]=S[v++];while(--m);n.length===0&&(n.mode=Ui);break;case Bc:if(a===0)break e;i[s++]=n.length,a--,n.mode=Ui;break;case Ps:if(n.wrap){for(;c<32;){if(o===0)break e;o--,u|=r[l++]<<c,c+=8}if(h-=a,e.total_out+=h,n.total+=h,n.wrap&4&&h&&(e.adler=n.check=n.flags?ue(n.check,i,h,s-h):li(n.check,i,h,s-h)),h=a,n.wrap&4&&(n.flags?u:$c(u))!==n.check){e.msg="incorrect data check",n.mode=X;break}u=0,c=0}n.mode=Hc;case Hc:if(n.wrap&&n.flags){for(;c<32;){if(o===0)break e;o--,u+=r[l++]<<c,c+=8}if(n.wrap&4&&u!==(n.total&4294967295)){e.msg="incorrect length check",n.mode=X;break}u=0,c=0}n.mode=jc;case jc:T=Xg;break e;case X:T=Bh;break e;case jh:return Hh;case $h:default:return Qe}return e.next_out=s,e.avail_out=a,e.next_in=l,e.avail_in=o,n.hold=u,n.bits=c,(n.wsize||h!==e.avail_out&&n.mode<X&&(n.mode<Ps||t!==yc))&&Kh(e,e.output,e.next_out,h-e.avail_out),_-=e.avail_in,h-=e.avail_out,e.total_in+=_,e.total_out+=h,n.total+=h,n.wrap&4&&h&&(e.adler=n.check=n.flags?ue(n.check,i,h,e.next_out-h):li(n.check,i,h,e.next_out-h)),e.data_type=n.bits+(n.last?64:0)+(n.mode===pt?128:0)+(n.mode===Fi||n.mode===Ns?256:0),(_===0&&h===0||t===yc)&&T===wn&&(T=e1),T},u1=e=>{if(En(e))return Qe;let t=e.state;return t.window&&(t.window=null),e.state=null,wn},c1=(e,t)=>{if(En(e))return Qe;const n=e.state;return n.wrap&2?(n.head=t,t.done=!1,wn):Qe},f1=(e,t)=>{const n=t.length;let r,i,l;return En(e)||(r=e.state,r.wrap!==0&&r.mode!==Rl)?Qe:r.mode===Rl&&(i=1,i=li(i,t,n,0),i!==r.check)?Bh:(l=Kh(e,t,n,n),l?(r.mode=jh,Hh):(r.havedict=1,wn))};var d1=Vh,h1=Gh,p1=Wh,_1=s1,m1=Zh,g1=a1,v1=u1,w1=c1,y1=f1,S1="pako inflate (from Nodeca project)",st={inflateReset:d1,inflateReset2:h1,inflateResetKeep:p1,inflateInit:_1,inflateInit2:m1,inflate:g1,inflateEnd:v1,inflateGetHeader:w1,inflateSetDictionary:y1,inflateInfo:S1};function x1(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}var E1=x1;const Qh=Object.prototype.toString,{Z_NO_FLUSH:k1,Z_FINISH:Vc,Z_OK:Gn,Z_STREAM_END:Ls,Z_NEED_DICT:Ds,Z_STREAM_ERROR:R1,Z_DATA_ERROR:Gc,Z_MEM_ERROR:T1,Z_BUF_ERROR:Zc}=jl,A1={chunkSize:1024*64,windowBits:15,to:""};function Zl(e){this.options=Wl.assign({},A1,e||{});const t=this.options;t.raw&&t.windowBits>=0&&t.windowBits<16&&(t.windowBits=-t.windowBits,t.windowBits===0&&(t.windowBits=-15)),t.windowBits>=0&&t.windowBits<16&&!(e&&e.windowBits)&&(t.windowBits+=32),t.windowBits>15&&t.windowBits<48&&(t.windowBits&15||(t.windowBits|=15)),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new bh,this.strm.avail_out=0;let n=st.inflateInit2(this.strm,t.windowBits);if(n!==Gn)throw new Error(er[n]);if(this.header=new E1,st.inflateGetHeader(this.strm,this.header),t.dictionary&&(typeof t.dictionary=="string"?t.dictionary=oi.string2buf(t.dictionary):Qh.call(t.dictionary)==="[object ArrayBuffer]"&&(t.dictionary=new Uint8Array(t.dictionary)),t.raw&&(n=st.inflateSetDictionary(this.strm,t.dictionary),n!==Gn)))throw new Error(er[n])}Zl.prototype.push=function(e,t){const n=this.strm,r=this.options.chunkSize,i=this.options.dictionary;let l,s,o;if(this.ended)return!1;for(t===~~t?s=t:s=t===!0?Vc:k1,Qh.call(e)==="[object ArrayBuffer]"?n.input=new Uint8Array(e):n.input=e,n.next_in=0,n.avail_in=n.input.length;;){for(n.avail_out===0&&(n.output=new Uint8Array(r),n.next_out=0,n.avail_out=r),l=st.inflate(n,s),l===Ds&&i&&(l=st.inflateSetDictionary(n,i),l===Gn?l=st.inflate(n,s):l===Gc&&(l=Ds));n.avail_in>0&&l===Ls&&n.state.wrap&2&&n.state.flags!==0&&n.input[n.next_in]!==0;)st.inflateReset(n),l=st.inflate(n,s);switch(l){case R1:case Gc:case Ds:case T1:return this.onEnd(l),this.ended=!0,!1}if(o=n.avail_out,n.next_out&&(n.avail_out===0||l===Ls||s>0))if(this.options.to==="string"){let a=oi.utf8border(n.output,n.next_out),u=n.next_out-a,c=oi.buf2string(n.output,a);n.next_out=u,n.avail_out=r-u,u&&n.output.set(n.output.subarray(a,a+u),0),this.onData(c)}else this.onData(n.output.length===n.next_out?n.output:n.output.subarray(0,n.next_out)),n.avail_out=0,n.next_out=0;if(!((l===Gn||l===Zc)&&o===0)){if(l===Ls)return l=st.inflateEnd(this.strm),this.onEnd(l),this.ended=!0,!0;if(n.avail_in===0){if(s===Vc)return l=st.inflateEnd(this.strm),this.onEnd(l===Gn?Zc:l),this.ended=!0,!1;break}}}return!0};Zl.prototype.onData=function(e){this.chunks.push(e)};Zl.prototype.onEnd=function(e){e===Gn&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=Wl.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};var C1=Zl,I1={Inflate:C1};const{deflate:N1}=jg,{Inflate:P1}=I1;var M1=N1,O1=P1;function Ho(e,t,n=255){const r=e.length%t;if(r!==0){const i=new Uint8Array(t-r).fill(n),l=new Uint8Array(e.length+i.length);return l.set(e),l.set(i,e.length),l}return e}const ja=239;function Kc(e,t=ja){for(let n=0;n<e.length;n++)t^=e[n];return t}function Kl(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}function nn(e){return new Promise(t=>setTimeout(t,e))}class $a{constructor(t,n=!1,r=!0){this.device=t,this.tracing=n,this.slipReaderEnabled=!1,this.baudrate=0,this.traceLog="",this.lastTraceTime=Date.now(),this.buffer=new Uint8Array(0),this.onDeviceLostCallback=null,this.SLIP_END=192,this.SLIP_ESC=219,this.SLIP_ESC_END=220,this.SLIP_ESC_ESC=221,this._DTR_state=!1,this.slipReaderEnabled=r}setDeviceLostCallback(t){this.onDeviceLostCallback=t}updateDevice(t){this.device=t,this.trace("Device reference updated")}getInfo(){const t=this.device.getInfo();return t.usbVendorId&&t.usbProductId?`WebSerial VendorID 0x${t.usbVendorId.toString(16)} ProductID 0x${t.usbProductId.toString(16)}`:""}getPid(){return this.device.getInfo().usbProductId}trace(t){const i=`${`TRACE ${(Date.now()-this.lastTraceTime).toFixed(3)}`} ${t}`;console.log(i),this.traceLog+=i+`
`}async returnTrace(){try{await navigator.clipboard.writeText(this.traceLog),console.log("Text copied to clipboard!")}catch(t){console.error("Failed to copy text:",t)}}hexify(t){return Array.from(t).map(n=>n.toString(16).padStart(2,"0")).join("").padEnd(16," ")}hexConvert(t,n=!0){if(n&&t.length>16){let r="",i=t;for(;i.length>0;){const l=i.slice(0,16),s=String.fromCharCode(...l).split("").map(o=>o===" "||o>=" "&&o<="~"&&o!=="  "?o:".").join("");i=i.slice(16),r+=`
    ${this.hexify(l.slice(0,8))} ${this.hexify(l.slice(8))} | ${s}`}return r}else return this.hexify(t)}slipWriter(t){const n=[];n.push(192);for(let r=0;r<t.length;r++)t[r]===219?n.push(219,221):t[r]===192?n.push(219,220):n.push(t[r]);return n.push(192),new Uint8Array(n)}async write(t){const n=this.slipWriter(t);if(this.device.writable){const r=this.device.writable.getWriter();this.tracing&&this.trace(`Write ${n.length} bytes: ${this.hexConvert(n)}`),await r.write(n),r.releaseLock()}}appendArray(t,n){const r=new Uint8Array(t.length+n.length);return r.set(t),r.set(n,t.length),r}async readLoop(){for(var t;this.device.readable;){this.reader=(t=this.device.readable)===null||t===void 0?void 0:t.getReader();try{const{value:n,done:r}=await this.reader.read();if(r){this.trace("Serial port done");break}if(n&&n.length){const i=Uint8Array.from(n);this.buffer=this.appendArray(this.buffer,i)}}catch(n){if(n instanceof Error){if(["BufferOverrunError","FramingError","BreakError","ParityError"].includes(n.name)){this.trace(`Recoverable serial port error: ${n.message}`);continue}this.trace(`Unrecoverable serial port error: ${n.message}`);break}if(n instanceof DOMException){this.onDeviceLostCallback?this.onDeviceLostCallback():this.trace(`Unrecoverable serial port error: ${n.message}`);break}this.trace(`Unrecoverable serial port error: ${n}`);break}finally{this.reader.releaseLock()}}this.trace("readLoop exited")}flushInput(){this.buffer=new Uint8Array(0)}async flushOutput(){try{if(this.device.writable){const t=this.device.writable.getWriter();await t.close(),t.releaseLock()}}catch(t){this.trace(`Error while flushing output: ${t}`)}}inWaiting(){return this.buffer.length}peek(){return this.buffer}detectPanicHandler(t){const n=/G?uru Meditation Error: (?:Core \d panic'ed \(([a-zA-Z ]*)\))?/,r=/F?atal exception \(\d+\): (?:([a-zA-Z ]*)?.*epc)?/,i=new TextDecoder("utf-8").decode(t),l=i.match(n)||i.match(r);if(l){const s=l[1]||l[2],o=`Guru Meditation Error detected${s?` (${s})`:""}`;throw new Error(o)}}async read(t){let n=null,r=!1,i=null;for(;;){const l=Date.now();for(i=new Uint8Array(0);Date.now()-l<t;)if(this.buffer.length>0){i=this.buffer,this.buffer=new Uint8Array(0);break}else await nn(1);if(!i||i.length===0){const s=n===null?"Serial data stream stopped: Possible serial noise or corruption.":"No serial data received.";throw this.tracing&&this.trace(s),new Error(s)}this.tracing&&this.trace(`Read ${i.length} bytes: ${this.hexConvert(i)}`);for(let s=0;s<i.length;s++){const o=i[s];if(n===null)if(o===this.SLIP_END)n=new Uint8Array(0);else{this.tracing&&this.trace(`Read invalid data: ${this.hexConvert(i)}`);const a=this.buffer;throw this.tracing&&this.trace(`Remaining data in serial buffer: ${this.hexConvert(a)}`),this.detectPanicHandler(new Uint8Array([...i,...a||[]])),new Error(`Invalid head of packet (0x${o.toString(16)}): Possible serial noise or corruption.`)}else if(r)if(r=!1,o===this.SLIP_ESC_END)n=this.appendArray(n,new Uint8Array([this.SLIP_END]));else if(o===this.SLIP_ESC_ESC)n=this.appendArray(n,new Uint8Array([this.SLIP_ESC]));else{this.tracing&&this.trace(`Read invalid data: ${this.hexConvert(i)}`);const a=this.buffer;throw this.tracing&&this.trace(`Remaining data in serial buffer: ${this.hexConvert(a)}`),this.detectPanicHandler(new Uint8Array([...i,...a||[]])),new Error(`Invalid SLIP escape (0xdb, 0x${o.toString(16)})`)}else if(o===this.SLIP_ESC)r=!0;else if(o===this.SLIP_END){if(this.tracing&&this.trace(`Received full packet: ${this.hexConvert(n)}`),s+1<i.length){const a=i.slice(s+1);this.buffer=this.appendArray(a,this.buffer)}return n}else n=this.appendArray(n,new Uint8Array([o]))}}}async rawRead(t,n){let r;try{if(!this.device.readable)return;for(r=this.device.readable.getReader(),this.reader=r;!n();){const{value:i,done:l}=await r.read();if(l||!i)break;this.tracing&&this.trace(`Read ${i.length} bytes: ${this.hexConvert(i)}`),t(i)}}catch(i){this.trace(`Error reading from serial port: ${i}`),i instanceof Error&&i.name==="NetworkError"&&i.message.includes("device has been lost")&&(this.trace("Device lost detected (NetworkError)"),this.onDeviceLostCallback&&this.onDeviceLostCallback())}finally{r==null||r.releaseLock(),this.reader===r&&(this.reader=void 0)}}async setRTS(t){await this.device.setSignals({requestToSend:t}),await this.setDTR(this._DTR_state)}async setDTR(t){this._DTR_state=t,await this.device.setSignals({dataTerminalReady:t})}async connect(t=115200,n={}){await this.device.open({baudRate:t,dataBits:n==null?void 0:n.dataBits,stopBits:n==null?void 0:n.stopBits,bufferSize:n==null?void 0:n.bufferSize,parity:n==null?void 0:n.parity,flowControl:n==null?void 0:n.flowControl}),this.baudrate=t}async waitForUnlock(t){for(;this.device.readable&&this.device.readable.locked||this.device.writable&&this.device.writable.locked;)await nn(t)}async disconnect(){var t,n;!((t=this.device.readable)===null||t===void 0)&&t.locked&&await((n=this.reader)===null||n===void 0?void 0:n.cancel()),await this.waitForUnlock(400),await this.device.close(),this.reader=void 0}}function St(e){return new Promise(t=>setTimeout(t,e))}class L1{constructor(t,n){this.resetDelay=n,this.transport=t}async reset(){await this.transport.setDTR(!1),await this.transport.setRTS(!0),await St(100),await this.transport.setDTR(!0),await this.transport.setRTS(!1),await St(this.resetDelay),await this.transport.setDTR(!1)}}class D1{constructor(t){this.transport=t}async reset(){await this.transport.setRTS(!1),await this.transport.setDTR(!1),await St(100),await this.transport.setDTR(!0),await this.transport.setRTS(!1),await St(100),await this.transport.setRTS(!0),await this.transport.setDTR(!1),await this.transport.setRTS(!0),await St(100),await this.transport.setRTS(!1),await this.transport.setDTR(!1)}}class b1{constructor(t,n=!1){this.transport=t,this.usingUsbOtg=n,this.transport=t}async reset(){this.usingUsbOtg?(await St(200),await this.transport.setRTS(!1),await St(200)):(await St(100),await this.transport.setRTS(!1))}}function F1(e){const t=["D","R","W"],n=e.split("|");for(const r of n){const i=r[0],l=r.slice(1);if(!t.includes(i))return!1;if(i==="D"||i==="R"){if(l!=="0"&&l!=="1")return!1}else if(i==="W"){const s=parseInt(l);if(isNaN(s)||s<=0)return!1}}return!0}class U1{constructor(t,n){this.transport=t,this.sequenceString=n,this.transport=t}async reset(){const t={D:async n=>await this.transport.setDTR(n),R:async n=>await this.transport.setRTS(n),W:async n=>await St(n)};try{if(!F1(this.sequenceString))return;const r=this.sequenceString.split("|");for(const i of r){const l=i[0],s=i.slice(1);l==="W"?await t.W(Number(s)):(l==="D"||l==="R")&&await t[l](s==="1")}}catch{throw new Error("Invalid custom reset sequence")}}}var z1=function(t){return atob(t)};const B1=ef(z1);async function Qc(e,t){let n;switch(e){case"ESP32":n=await ee(()=>import("./stub_flasher_32-DIlGCCSz.js"),[]);break;case"ESP32-C2":n=await ee(()=>import("./stub_flasher_32c2-B8dsLG7-.js"),[]);break;case"ESP32-C3":n=await ee(()=>import("./stub_flasher_32c3-LInKOK0z.js"),[]);break;case"ESP32-C5":n=await ee(()=>import("./stub_flasher_32c5-DfY6_UTr.js"),[]);break;case"ESP32-C6":n=await ee(()=>import("./stub_flasher_32c6-BMffPMCp.js"),[]);break;case"ESP32-C61":n=await ee(()=>import("./stub_flasher_32c61-Dm89Jp02.js"),[]);break;case"ESP32-H2":n=await ee(()=>import("./stub_flasher_32h2-DKTWdQO2.js"),[]);break;case"ESP32-P4":t&&t<300?n=await ee(()=>import("./stub_flasher_32p4rc1-_ns1H9Hd.js"),[]):n=await ee(()=>import("./stub_flasher_32p4-BYTMSBQf.js"),[]);break;case"ESP32-S2":n=await ee(()=>import("./stub_flasher_32s2-DLJQYVPj.js"),[]);break;case"ESP32-S3":n=await ee(()=>import("./stub_flasher_32s3-B0-qH3ON.js"),[]);break;case"ESP8266":n=await ee(()=>import("./stub_flasher_8266-Bxnk_IeY.js"),[]);break}if(n)return{bss_start:n.bss_start,data:n.data,data_start:n.data_start,entry:n.entry,text:n.text,text_start:n.text_start,decodedData:Yc(n.data),decodedText:Yc(n.text)}}function Yc(e){const n=B1(e).split("").map(function(r){return r.charCodeAt(0)});return new Uint8Array(n)}class H1{constructor(){this.FLASH_SIZES={"1MB":0,"2MB":16,"4MB":32,"8MB":48,"16MB":64,"32MB":80,"64MB":96,"128MB":112},this.FLASH_FREQUENCY={"80m":15,"40m":0,"26m":1,"20m":2}}getEraseSize(t,n){return n}}class rr extends H1{constructor(){super(...arguments),this.CHIP_NAME="ESP8266",this.CHIP_DETECT_MAGIC_VALUE=[4293968129],this.EFUSE_RD_REG_BASE=1072693328,this.UART_CLKDIV_REG=1610612756,this.UART_CLKDIV_MASK=1048575,this.XTAL_CLK_DIVIDER=2,this.FLASH_WRITE_SIZE=16384,this.BOOTLOADER_FLASH_OFFSET=0,this.UART_DATE_REG_ADDR=0,this.FLASH_SIZES={"512KB":0,"256KB":16,"1MB":32,"2MB":48,"4MB":64,"2MB-c1":80,"4MB-c1":96,"8MB":128,"16MB":144},this.FLASH_FREQUENCY={"80m":15,"40m":0,"26m":1,"20m":2},this.MEMORY_MAP=[[1072693248,1072693264,"DPORT"],[1073643520,1073741824,"DRAM"],[1074790400,1074823168,"IRAM"],[1075843088,1076760592,"IROM"]],this.SPI_REG_BASE=1610613248,this.SPI_USR_OFFS=28,this.SPI_USR1_OFFS=32,this.SPI_USR2_OFFS=36,this.SPI_MOSI_DLEN_OFFS=0,this.SPI_MISO_DLEN_OFFS=0,this.SPI_W0_OFFS=64,this.getChipFeatures=async t=>{const n=["WiFi"];return await this.getChipDescription(t)=="ESP8285"&&n.push("Embedded Flash"),n}}async readEfuse(t,n){const r=this.EFUSE_RD_REG_BASE+4*n;return t.debug("Read efuse "+r),await t.readReg(r)}async getChipDescription(t){const n=await this.readEfuse(t,2);return(await this.readEfuse(t,0)&16|n&65536)!=0?"ESP8285":"ESP8266EX"}async getCrystalFreq(t){const n=await t.readReg(this.UART_CLKDIV_REG)&this.UART_CLKDIV_MASK,r=t.transport.baudrate*n/1e6/this.XTAL_CLK_DIVIDER;let i;return r>33?i=40:i=26,Math.abs(i-r)>1&&t.info("WARNING: Detected crystal freq "+r+"MHz is quite different to normalized freq "+i+"MHz. Unsupported crystal in use?"),i}_d2h(t){const n=(+t).toString(16);return n.length===1?"0"+n:n}async readMac(t){let n=await this.readEfuse(t,0);n=n>>>0;let r=await this.readEfuse(t,1);r=r>>>0;let i=await this.readEfuse(t,3);i=i>>>0;const l=new Uint8Array(6);return i!=0?(l[0]=i>>16&255,l[1]=i>>8&255,l[2]=i&255):r>>16&255?(r>>16&255)==1?(l[0]=172,l[1]=208,l[2]=116):t.error("Unknown OUI"):(l[0]=24,l[1]=254,l[2]=52),l[3]=r>>8&255,l[4]=r&255,l[5]=n>>24&255,this._d2h(l[0])+":"+this._d2h(l[1])+":"+this._d2h(l[2])+":"+this._d2h(l[3])+":"+this._d2h(l[4])+":"+this._d2h(l[5])}getEraseSize(t,n){return n}}rr.IROM_MAP_START=1075838976;rr.IROM_MAP_END=1076887552;const j1=Object.freeze(Object.defineProperty({__proto__:null,ESP8266ROM:rr},Symbol.toStringTag,{value:"Module"})),_i=233;function Fr(e,t){const n=t-1-e%t;return e+n}function bs(e,t){return e[t]|e[t+1]<<8|e[t+2]<<16|e[t+3]<<24}class Gt{constructor(t,n,r=null,i=0){this.addr=t,this.data=n,this.fileOffs=r,this.flags=i,this.includeInChecksum=!0,this.addr!==0&&this.padToAlignment(4)}copyWithNewAddr(t){return new Gt(t,this.data,0)}splitImage(t){const n=new Gt(this.addr,this.data.slice(0,t),0);return this.data=this.data.slice(t),this.addr+=t,this.fileOffs=null,n}toString(){let t=`len 0x${this.data.length.toString(16).padStart(5,"0")} load 0x${this.addr.toString(16).padStart(8,"0")}`;return this.fileOffs!==null&&(t+=` file_offs 0x${this.fileOffs.toString(16).padStart(8,"0")}`),t}getMemoryType(t){return t.ROM_LOADER.MEMORY_MAP.filter(n=>n[0]<=this.addr&&this.addr<n[1]).map(n=>n[2])}padToAlignment(t){this.data=Ho(this.data,t,0)}}class qc extends Gt{constructor(t,n,r,i){super(n,r,null,i),this.name=t}toString(){return`${this.name} ${super.toString()}`}}class Wa{constructor(t){this.SEG_HEADER_LEN=8,this.SHA256_DIGEST_LEN=32,this.ELF_FLAG_WRITE=1,this.ELF_FLAG_READ=2,this.ELF_FLAG_EXEC=4,this.segments=[],this.entrypoint=0,this.elfSha256=null,this.elfSha256Offset=0,this.padToSize=0,this.flashMode=0,this.flashSizeFreq=0,this.checksum=0,this.datalength=0,this.IROM_ALIGN=0,this.MMU_PAGE_SIZE_CONF=[],this.ROM_LOADER=t}loadCommonHeader(t,n,r){const i=t[n],l=t[n+1];if(this.flashMode=t[n+2],this.flashSizeFreq=t[n+3],this.entrypoint=bs(t,n+4),i!==r)throw new G(`Invalid firmware image magic=0x${i.toString(16)}`);return l}verify(){if(this.segments.length>16)throw new G(`Invalid segment count ${this.segments.length} (max 16). Usually this indicates a linker script problem.`)}loadSegment(t,n,r=!1){const i=n,l=bs(t,n),s=bs(t,n+4);this.warnIfUnusualSegment(l,s,r);const o=t.slice(n+8,n+8+s);if(o.length<s)throw new G(`End of file reading segment 0x${l.toString(16)}, length ${s} (actual length ${o.length})`);const a=new Gt(l,o,i);return this.segments.push(a),a}warnIfUnusualSegment(t,n,r){r||(t>1075838976||t<1073610752||n>65536)&&console.warn(`WARNING: Suspicious segment 0x${t.toString(16)}, length ${n}`)}maybePatchSegmentData(t,n){const r=t.length;if(this.elfSha256Offset>=n&&this.elfSha256Offset<n+r){const i=this.elfSha256Offset-n;if(i<this.SEG_HEADER_LEN||i+this.SHA256_DIGEST_LEN>r)throw new G(`Cannot place SHA256 digest on segment boundary(elf_sha256_offset=${this.elfSha256Offset}, file_pos=${n}, segment_size=${r})`);const l=i-this.SEG_HEADER_LEN;if(!t.slice(l,l+this.SHA256_DIGEST_LEN).every(h=>h===0))throw new G(`Contents of segment at SHA256 digest offset 0x${this.elfSha256Offset.toString(16)} are not all zero. Refusing to overwrite.`);if(!this.elfSha256||this.elfSha256.length!==this.SHA256_DIGEST_LEN)throw new G("ELF SHA256 digest is not properly initialized");const a=t.slice(0,l),u=t.slice(l+this.SHA256_DIGEST_LEN),c=a.length+this.elfSha256.length+u.length,_=new Uint8Array(c);return _.set(a,0),_.set(this.elfSha256,a.length),_.set(u,a.length+this.elfSha256.length),_}return t}saveSegment(t,n,r,i=null){const l=this.maybePatchSegmentData(r.data,n),s=new DataView(t.buffer,n);return s.setUint32(0,r.addr,!0),s.setUint32(4,l.length,!0),t.set(l,n+8),i!==null?Kc(l,i):0}saveFlashSegment(t,n,r,i=null){if(this.ROM_LOADER.CHIP_NAME==="ESP32"){const s=(n+r.data.length+this.SEG_HEADER_LEN)%this.IROM_ALIGN;if(s<36){const o=new Uint8Array(r.data.length+(36-s));o.set(r.data),o.fill(0,r.data.length),r.data=o}}return this.saveSegment(t,n,r,i)}readChecksum(t,n){const r=Fr(n,16);return t[r]}calculateChecksum(){let t=ja;for(const n of this.segments)n.includeInChecksum&&(t=Kc(n.data,t));return t}appendChecksum(t,n,r){const i=Fr(n,16);t[i]=r}writeCommonHeader(t,n,r){t[n]=_i,t[n+1]=r,t[n+2]=this.flashMode,t[n+3]=this.flashSizeFreq,new DataView(t.buffer,n+4).setUint32(0,this.entrypoint,!0)}isIromAddr(t){return rr.IROM_MAP_START<=t&&t<rr.IROM_MAP_END}getIromSegment(){const t=this.segments.filter(n=>this.isIromAddr(n.addr));if(t.length>0){if(t.length!==1)throw new G(`Found ${t.length} segments that could be irom0. Bad ELF file?`);return t[0]}return null}getNonIromSegments(){const t=this.getIromSegment();return this.segments.filter(n=>n!==t)}sortSegments(){this.segments.length&&this.segments.sort((t,n)=>t.addr-n.addr)}mergeAdjacentSegments(){if(!this.segments.length)return;const t=[];for(let n=this.segments.length-1;n>0;n--){const r=this.segments[n-1],i=this.segments[n];if(r.getMemoryType(this).join(",")===i.getMemoryType(this).join(",")&&r.includeInChecksum===i.includeInChecksum&&i.addr===r.addr+r.data.length&&(i.flags&this.ELF_FLAG_EXEC)===(r.flags&this.ELF_FLAG_EXEC)){const l=new Uint8Array(r.data.length+i.data.length);l.set(r.data),l.set(i.data,r.data.length),r.data=l}else t.unshift(i)}t.unshift(this.segments[0]),this.segments=t}setMmuPageSize(t){if(!this.MMU_PAGE_SIZE_CONF&&t!==this.IROM_ALIGN)console.warn(`WARNING: Changing MMU page size is not supported on ${this.ROM_LOADER.CHIP_NAME}! `+(this.IROM_ALIGN!==0?`Defaulting to ${this.IROM_ALIGN/1024}KB.`:""));else if(this.MMU_PAGE_SIZE_CONF&&!this.MMU_PAGE_SIZE_CONF.includes(t)){const n=this.MMU_PAGE_SIZE_CONF.map(r=>`${r/1024}KB`).join(", ");throw new G(`${t} bytes is not a valid ${this.ROM_LOADER.CHIP_NAME} page size, select from ${n}.`)}else this.IROM_ALIGN=t}}class Xt extends Wa{constructor(t,n=null,r=!0,i=!1){super(t),this.securePad=null,this.flashMode=0,this.flashSizeFreq=0,this.version=1,this.WP_PIN_DISABLED=238,this.wpPin=this.WP_PIN_DISABLED,this.clkDrv=0,this.qDrv=0,this.dDrv=0,this.csDrv=0,this.hdDrv=0,this.wpDrv=0,this.chipId=0,this.minRev=0,this.minRevFull=0,this.maxRevFull=0,this.storedDigest=null,this.calcDigest=null,this.dataLength=0,this.IROM_ALIGN=65536,this.ROM_LOADER=t,this.appendDigest=r,this.ramOnlyHeader=i,n!==null&&this.loadFromFile(n)}async loadFromFile(t){const r=t instanceof Uint8Array?t:Kl(t);let i=0;const l=this.loadCommonHeader(r,i,_i);i+=8,this.loadExtendedHeader(r,i),i+=16;for(let s=0;s<l;s++){const o=this.loadSegment(r,i);i+=8+o.data.length}if(this.checksum=this.readChecksum(r,i),i=Fr(i,16),this.appendDigest){const s=i;this.storedDigest=r.slice(i,i+this.SHA256_DIGEST_LEN);const o=await crypto.subtle.digest("SHA-256",r.slice(0,s));this.calcDigest=new Uint8Array(o),this.dataLength=s-0}this.verify()}isFlashAddr(t){return this.ROM_LOADER.IROM_MAP_START<=t&&t<this.ROM_LOADER.IROM_MAP_END||this.ROM_LOADER.DROM_MAP_START<=t&&t<this.ROM_LOADER.DROM_MAP_END}async save(){let t=0;const n=new Uint8Array(1024*1024);let r=0;this.writeCommonHeader(n,r,this.segments.length),r+=8,this.saveExtendedHeader(n,r),r+=16;let i=ja;const l=this.segments.filter(a=>this.isFlashAddr(a.addr)).sort((a,u)=>a.addr-u.addr),s=this.segments.filter(a=>!this.isFlashAddr(a.addr)).sort((a,u)=>a.addr-u.addr);for(let a=0;a<l.length;a++){const u=l[a];if(u instanceof qc&&u.name===".flash.appdesc"){l.splice(a,1),l.unshift(u);break}}for(let a=0;a<s.length;a++){const u=s[a];if(u instanceof qc&&u.name===".dram0.bootdesc"){s.splice(a,1),s.unshift(u);break}}if(l.length>0){let a=l[0].addr;for(const u of l.slice(1)){if(Math.floor(u.addr/this.IROM_ALIGN)===Math.floor(a/this.IROM_ALIGN))throw new G(`Segment loaded at 0x${u.addr.toString(16)} lands in same 64KB flash mapping as segment loaded at 0x${a.toString(16)}. Can't generate binary. Suggest changing linker script or ELF to merge sections.`);a=u.addr}}if(this.ramOnlyHeader){for(const a of s)i=this.saveSegment(n,r,a,i),r+=8+a.data.length,t++;this.appendChecksum(n,r,i),r=Fr(r,16);for(const a of l.reverse()){let u=this.getAlignmentDataNeeded(a,r);if(u>0){const c=this.ROM_LOADER.BOOTLOADER_FLASH_OFFSET-this.SEG_HEADER_LEN;u<c&&(u+=this.IROM_ALIGN),u-=this.ROM_LOADER.BOOTLOADER_FLASH_OFFSET;const _=new Gt(0,new Uint8Array(u).fill(0),r);i=this.saveSegment(n,r,_,i),r+=8+u,t++}this.saveFlashSegment(n,r,a),r+=8+a.data.length,t++}}else{for(;l.length>0;){const a=l[0],u=this.getAlignmentDataNeeded(a,r);if(u>0){if(s.length>0&&u>this.SEG_HEADER_LEN){const c=s[0].splitImage(u);s[0].data.length===0&&s.shift(),i=this.saveSegment(n,r,c,i)}else{const c=new Gt(0,new Uint8Array(u).fill(0),r);i=this.saveSegment(n,r,c,i)}r+=8+u,t++}else{if((r+8)%this.IROM_ALIGN!==a.addr%this.IROM_ALIGN)throw new Error("Flash segment alignment mismatch");i=this.saveFlashSegment(n,r,a,i),l.shift(),r+=8+a.data.length,t++}}for(const a of s)i=this.saveSegment(n,r,a,i),r+=8+a.data.length,t++}if(this.securePad){if(!this.appendDigest)throw new Error("secure_pad only applies if a SHA-256 digest is also appended to the image");const a=(r+this.SEG_HEADER_LEN)%this.IROM_ALIGN,u=16;let c=0;this.securePad==="1"?c=112:this.securePad==="2"&&(c=32);const _=(this.IROM_ALIGN-a-u-c)%this.IROM_ALIGN,h=new Gt(0,new Uint8Array(_).fill(0),r);i=this.saveSegment(n,r,h,i),r+=8+_,t++}this.ramOnlyHeader||(this.appendChecksum(n,r,i),r=Fr(r,16));const o=r;if(this.ramOnlyHeader?n[1]=s.length:n[1]=t,this.appendDigest){const a=await crypto.subtle.digest("SHA-256",n.slice(0,o)),u=new Uint8Array(a);n.set(u,o),r+=32}if(this.padToSize&&r%this.padToSize!==0){const a=this.padToSize-r%this.padToSize,u=new Uint8Array(a);u.fill(255),n.set(u,r),r+=a}return n}loadExtendedHeader(t,n){const r=new DataView(t.buffer,n);this.wpPin=r.getUint8(0);const i=r.getUint8(1);[this.clkDrv,this.qDrv]=this.splitByte(i);const l=r.getUint8(2);[this.dDrv,this.csDrv]=this.splitByte(l);const s=r.getUint8(3);[this.hdDrv,this.wpDrv]=this.splitByte(s),this.chipId=r.getUint8(4),this.chipId!==this.ROM_LOADER.IMAGE_CHIP_ID&&console.warn(`Unexpected chip id in image. Expected ${this.ROM_LOADER.IMAGE_CHIP_ID} but value was ${this.chipId}. Is this image for a different chip model?`),this.minRev=r.getUint8(5),this.minRevFull=r.getUint16(6,!0),this.maxRevFull=r.getUint16(8,!0);const o=r.getUint8(15);if(o===0||o===1)this.appendDigest=o===1;else throw new Error(`Invalid value for append_digest field (0x${o.toString(16)}). Should be 0 or 1.`)}saveExtendedHeader(t,n){const r=new ArrayBuffer(16),i=new DataView(r);i.setUint8(0,this.wpPin),i.setUint8(1,this.joinByte(this.clkDrv,this.qDrv)),i.setUint8(2,this.joinByte(this.dDrv,this.csDrv)),i.setUint8(3,this.joinByte(this.hdDrv,this.wpDrv)),i.setUint8(4,this.ROM_LOADER.IMAGE_CHIP_ID),i.setUint8(5,this.minRev),i.setUint16(6,this.minRevFull,!0),i.setUint16(8,this.maxRevFull,!0);for(let l=9;l<15;l++)i.setUint8(l,0);i.setUint8(15,this.appendDigest?1:0),t.set(new Uint8Array(r),n)}splitByte(t){return[t&15,t>>4&15]}joinByte(t,n){return t&15|(n&15)<<4}getAlignmentDataNeeded(t,n){const r=t.addr%this.IROM_ALIGN-this.SEG_HEADER_LEN;let i=this.IROM_ALIGN-n%this.IROM_ALIGN+r;return i===0||i===this.IROM_ALIGN?0:(i-=this.SEG_HEADER_LEN,i<0&&(i+=this.IROM_ALIGN),i)}}class $1 extends Wa{constructor(t,n=null){super(t),this.version=1,this.ROM_LOADER=t,this.flashMode=0,this.flashSizeFreq=0,n!==null&&this.loadFromFile(n)}loadFromFile(t){const n=t instanceof Uint8Array?t:Kl(t);let r=0;const i=this.loadCommonHeader(n,r,_i);r+=8;for(let l=0;l<i;l++){const s=this.loadSegment(n,r);r+=8+s.data.length}this.checksum=this.readChecksum(n,r),this.verify()}defaultOutputName(t){return t+"-"}}class yn extends Wa{constructor(t,n=null){super(t),this.version=2,this.ROM_LOADER=t,this.flashMode=0,this.flashSizeFreq=0,n!==null&&this.loadFromFile(n)}async loadFromFile(t){const n=t instanceof Uint8Array?t:Kl(t);let r=0;const i=this.loadCommonHeader(n,r,yn.IMAGE_V2_MAGIC);r+=8,i!==yn.IMAGE_V2_SEGMENT&&console.warn(`Warning: V2 header has unexpected "segment" count ${i} (usually 4)`);const l=this.flashMode,s=this.flashSizeFreq,o=this.entrypoint,a=this.loadSegment(n,r,!0);a.addr=0,a.includeInChecksum=!1,r+=8+a.data.length;const u=this.loadCommonHeader(n,r,_i);r+=8,l!==this.flashMode&&console.warn(`WARNING: Flash mode value in first header (0x${l.toString(16)}) disagrees with second (0x${this.flashMode.toString(16)}). Using second value.`),s!==this.flashSizeFreq&&console.warn(`WARNING: Flash size/freq value in first header (0x${s.toString(16)}) disagrees with second (0x${this.flashSizeFreq.toString(16)}). Using second value.`),o!==this.entrypoint&&console.warn(`WARNING: Entrypoint address in first header (0x${o.toString(16)}) disagrees with second header (0x${this.entrypoint.toString(16)}). Using second value.`);for(let c=0;c<u;c++){const _=this.loadSegment(n,r);r+=8+_.data.length}this.checksum=this.readChecksum(n,r),this.verify()}defaultOutputName(t){const n=this.getIromSegment();let r=0;n!==null&&(r=n.addr-rr.IROM_MAP_START);const i=t.replace(/\.[^/.]+$/,""),l=r&-4096;return`${i}-0x${l.toString(16).padStart(5,"0")}.bin`}}yn.IMAGE_V2_MAGIC=234;yn.IMAGE_V2_SEGMENT=4;class W1 extends Xt{constructor(t,n=null,r=!0,i=!1){super(t,n,r,i),this.ROM_LOADER=t}}class V1 extends Xt{constructor(t,n=null,r=!0,i=!1){super(t,n,r,i),this.ROM_LOADER=t}}class G1 extends Xt{constructor(t,n=null,r=!0,i=!1){super(t,n,r,i),this.ROM_LOADER=t}}class Z1 extends Xt{constructor(t,n=null,r=!0,i=!1){super(t,n,r,i),this.MMU_PAGE_SIZE_CONF=[16384,32768,65536],this.ROM_LOADER=t}}class Va extends Xt{constructor(t,n=null,r=!0,i=!1){super(t,n,r,i),this.MMU_PAGE_SIZE_CONF=[8192,16384,32768,65536],this.ROM_LOADER=t}}class K1 extends Va{constructor(t,n=null,r=!0,i=!1){super(t,n,r,i),this.ROM_LOADER=t}}class Q1 extends Xt{constructor(t,n=null,r=!0,i=!1){super(t,n,r,i),this.ROM_LOADER=t}}class Y1 extends Xt{constructor(t,n=null,r=!0,i=!1){super(t,n,r,i),this.ROM_LOADER=t}}class q1 extends Va{constructor(t,n=null,r=!0,i=!1){super(t,n,r,i),this.ROM_LOADER=t}}async function Xc(e,t){const n=t instanceof Uint8Array?t:Kl(t),r=e.CHIP_NAME.toLowerCase().replace(/[-()]/g,"");let i;if(r!=="esp8266")switch(r){case"esp32":i=Xt;break;case"esp32s2":i=W1;break;case"esp32s3":i=V1;break;case"esp32c3":i=G1;break;case"esp32c2":i=Z1;break;case"esp32c6":i=Va;break;case"esp32c61":i=K1;break;case"esp32c5":i=Q1;break;case"esp32h2":i=q1;break;case"esp32p4":i=Y1;break;default:throw new G(`Unsupported chip name: ${r}`)}else{const o=n[0];if(o===_i)i=$1;else if(o===yn.IMAGE_V2_MAGIC)i=yn;else throw new G(`Invalid image magic number: ${o}`)}const l=new i(e),s=l;if(typeof s.loadFromFile=="function"){const o=s.loadFromFile(n);o instanceof Promise&&await o}return l}async function X1(e){switch(e){case 15736195:{const{ESP32ROM:t}=await ee(async()=>{const{ESP32ROM:n}=await import("./esp32-pkAVpfDq.js");return{ESP32ROM:n}},[]);return new t}case 203546735:case 1867591791:case 2084675695:{const{ESP32C2ROM:t}=await ee(async()=>{const{ESP32C2ROM:n}=await import("./esp32c2-BJI_CLlc.js");return{ESP32C2ROM:n}},__vite__mapDeps([0,1,2]));return new t}case 1763790959:case 456216687:case 1216438383:case 1130455151:{const{ESP32C3ROM:t}=await ee(async()=>{const{ESP32C3ROM:n}=await import("./esp32c3-Co0EDtN5.js");return{ESP32C3ROM:n}},__vite__mapDeps([1,2]));return new t}case 752910447:{const{ESP32C6ROM:t}=await ee(async()=>{const{ESP32C6ROM:n}=await import("./esp32c6-CxMbXyuu.js");return{ESP32C6ROM:n}},__vite__mapDeps([3,1,2]));return new t}case 606167151:case 871374959:case 1333878895:{const{ESP32C61ROM:t}=await ee(async()=>{const{ESP32C61ROM:n}=await import("./esp32c61-CdZo4A-c.js");return{ESP32C61ROM:n}},__vite__mapDeps([4,3,1,2]));return new t}case 285294703:case 1675706479:case 1607549039:{const{ESP32C5ROM:t}=await ee(async()=>{const{ESP32C5ROM:n}=await import("./esp32c5-BUnhzoVN.js");return{ESP32C5ROM:n}},__vite__mapDeps([5,3,1,2]));return new t}case 3619110528:case 2548236392:{const{ESP32H2ROM:t}=await ee(async()=>{const{ESP32H2ROM:n}=await import("./esp32h2-DmqmY04U.js");return{ESP32H2ROM:n}},__vite__mapDeps([6,3,1,2]));return new t}case 9:{const{ESP32S3ROM:t}=await ee(async()=>{const{ESP32S3ROM:n}=await import("./esp32s3-CLWHO3JV.js");return{ESP32S3ROM:n}},__vite__mapDeps([7,2]));return new t}case 1990:{const{ESP32S2ROM:t}=await ee(async()=>{const{ESP32S2ROM:n}=await import("./esp32s2-DSm1_e4W.js");return{ESP32S2ROM:n}},__vite__mapDeps([8,2]));return new t}case 4293968129:{const{ESP8266ROM:t}=await ee(async()=>{const{ESP8266ROM:n}=await Promise.resolve().then(()=>j1);return{ESP8266ROM:n}},void 0);return new t}case 0:case 182303440:case 117676761:{const{ESP32P4ROM:t}=await ee(async()=>{const{ESP32P4ROM:n}=await import("./esp32p4-DmQlY5Nr.js");return{ESP32P4ROM:n}},__vite__mapDeps([9,2]));return new t}default:return null}}class Yh{constructor(t){var n,r,i,l,s,o,a,u;this.ESP_RAM_BLOCK=6144,this.ESP_FLASH_BEGIN=2,this.ESP_FLASH_DATA=3,this.ESP_FLASH_END=4,this.ESP_MEM_BEGIN=5,this.ESP_MEM_END=6,this.ESP_MEM_DATA=7,this.ESP_WRITE_REG=9,this.ESP_READ_REG=10,this.ESP_SPI_ATTACH=13,this.ESP_CHANGE_BAUDRATE=15,this.ESP_FLASH_DEFL_BEGIN=16,this.ESP_FLASH_DEFL_DATA=17,this.ESP_FLASH_DEFL_END=18,this.ESP_SPI_FLASH_MD5=19,this.ESP_ERASE_FLASH=208,this.ESP_ERASE_REGION=209,this.ESP_READ_FLASH=210,this.ESP_RUN_USER_CODE=211,this.ESP_IMAGE_MAGIC=233,this.ESP_CHECKSUM_MAGIC=239,this.ROM_INVALID_RECV_MSG=5,this.DEFAULT_TIMEOUT=3e3,this.ERASE_REGION_TIMEOUT_PER_MB=3e4,this.ERASE_WRITE_TIMEOUT_PER_MB=4e4,this.MD5_TIMEOUT_PER_MB=8e3,this.CHIP_ERASE_TIMEOUT=12e4,this.FLASH_READ_TIMEOUT=1e5,this.MAX_TIMEOUT=this.CHIP_ERASE_TIMEOUT*2,this.WRITE_BLOCK_ATTEMPTS=3,this.WRITE_BLOCK_RETRY_DELAY_MS=150,this.SPI_ADDR_REG_MSB=!0,this.CHIP_DETECT_MAGIC_REG_ADDR=1073745920,this.DETECTED_FLASH_SIZES={18:"256KB",19:"512KB",20:"1MB",21:"2MB",22:"4MB",23:"8MB",24:"16MB",25:"32MB",26:"64MB",27:"128MB",28:"256MB",32:"64MB",33:"128MB",34:"256MB",50:"256KB",51:"512KB",52:"1MB",53:"2MB",54:"4MB",55:"8MB",56:"16MB",57:"32MB",58:"64MB"},this.USB_JTAG_SERIAL_PID=4097,this.romBaudrate=115200,this.debugLogging=!1,this.syncStubDetected=!1,this.IS_STUB=!1,this.FLASH_WRITE_SIZE=16384,this.transport=t.transport,this.baudrate=t.baudrate,this.resetConstructors={classicReset:(c,_)=>new L1(c,_),customReset:(c,_)=>new U1(c,_),hardReset:(c,_)=>new b1(c,_),usbJTAGSerialReset:c=>new D1(c)},t.serialOptions&&(this.serialOptions=t.serialOptions),t.terminal&&(this.terminal=t.terminal,this.terminal.clean()),typeof t.debugLogging<"u"&&(this.debugLogging=t.debugLogging),t.port&&(this.transport=new $a(t.port)),typeof t.enableTracing<"u"&&(this.transport.tracing=t.enableTracing),!((n=t.resetConstructors)===null||n===void 0)&&n.classicReset&&(this.resetConstructors.classicReset=(r=t.resetConstructors)===null||r===void 0?void 0:r.classicReset),!((i=t.resetConstructors)===null||i===void 0)&&i.customReset&&(this.resetConstructors.customReset=(l=t.resetConstructors)===null||l===void 0?void 0:l.customReset),!((s=t.resetConstructors)===null||s===void 0)&&s.hardReset&&(this.resetConstructors.hardReset=(o=t.resetConstructors)===null||o===void 0?void 0:o.hardReset),!((a=t.resetConstructors)===null||a===void 0)&&a.usbJTAGSerialReset&&(this.resetConstructors.usbJTAGSerialReset=(u=t.resetConstructors)===null||u===void 0?void 0:u.usbJTAGSerialReset),this.info("esptool.js"),this.info("Serial port "+this.transport.getInfo())}write(t,n=!0){this.terminal?n?this.terminal.writeLine(t):this.terminal.write(t):console.log(t)}error(t,n=!0){this.write(`Error: ${t}`,n)}info(t,n=!0){this.write(t,n)}debug(t,n=!0){this.debugLogging&&this.write(`Debug: ${t}`,n)}_shortToBytearray(t){return new Uint8Array([t&255,t>>8&255])}_intToByteArray(t){return new Uint8Array([t&255,t>>8&255,t>>16&255,t>>24&255])}_byteArrayToShort(t,n){return t|n>>8}_byteArrayToInt(t,n,r,i){return t|n<<8|r<<16|i<<24}_appendBuffer(t,n){const r=new Uint8Array(t.byteLength+n.byteLength);return r.set(new Uint8Array(t),0),r.set(new Uint8Array(n),t.byteLength),r.buffer}_appendArray(t,n){const r=new Uint8Array(t.length+n.length);return r.set(t,0),r.set(n,t.length),r}ui8ToBstr(t){let n="";for(let r=0;r<t.length;r++)n+=String.fromCharCode(t[r]);return n}bstrToUi8(t){const n=new Uint8Array(t.length);for(let r=0;r<t.length;r++)n[r]=t.charCodeAt(r);return n}async readPacket(t=null,n=this.DEFAULT_TIMEOUT){for(let r=0;r<100;r++){const i=await this.transport.read(n);if(!i||i.length<8)continue;const l=i[0];if(l!==1)continue;const s=i[1],o=this._byteArrayToInt(i[4],i[5],i[6],i[7]),a=i.slice(8);if(l==1){if(t==null||s==t)return[o,a];if(a[0]!=0&&a[1]==this.ROM_INVALID_RECV_MSG)throw this.transport.flushInput(),new G("unsupported command error")}}throw new G("invalid response")}async command(t=null,n=new Uint8Array(0),r=0,i=!0,l=this.DEFAULT_TIMEOUT){if(t!=null){this.transport.tracing&&this.transport.trace(`command op:0x${t.toString(16).padStart(2,"0")} data len=${n.length} wait_response=${i?1:0} timeout=${(l/1e3).toFixed(3)} data=${this.transport.hexConvert(n)}`);const s=new Uint8Array(8+n.length);s[0]=0,s[1]=t,s[2]=this._shortToBytearray(n.length)[0],s[3]=this._shortToBytearray(n.length)[1],s[4]=this._intToByteArray(r)[0],s[5]=this._intToByteArray(r)[1],s[6]=this._intToByteArray(r)[2],s[7]=this._intToByteArray(r)[3];let o;for(o=0;o<n.length;o++)s[8+o]=n[o];await this.transport.write(s)}return i?this.readPacket(t,l):[0,new Uint8Array(0)]}async readReg(t,n=this.DEFAULT_TIMEOUT){this.debug(`Read Register:${this.toHex(t)}`);const r=this._intToByteArray(t),i=await this.command(this.ESP_READ_REG,r,void 0,void 0,n);return this.debug(`Read Register Value:${i[0]}`),i[0]}async writeReg(t,n,r=4294967295,i=0,l=0){let s=this._appendArray(this._intToByteArray(t),this._intToByteArray(n));s=this._appendArray(s,this._intToByteArray(r)),s=this._appendArray(s,this._intToByteArray(i)),l>0&&(s=this._appendArray(s,this._intToByteArray(this.chip.UART_DATE_REG_ADDR)),s=this._appendArray(s,this._intToByteArray(0)),s=this._appendArray(s,this._intToByteArray(0)),s=this._appendArray(s,this._intToByteArray(l))),await this.checkCommand("write target memory",this.ESP_WRITE_REG,s)}async sync(){this.debug("Sync");const t=new Uint8Array(36);let n;for(t[0]=7,t[1]=7,t[2]=18,t[3]=32,n=0;n<32;n++)t[4+n]=85;try{let r=await this.command(8,t,void 0,void 0,100);this.syncStubDetected=r[0]===0;for(let i=0;i<7;i++)r=await this.readPacket(8,100),this.syncStubDetected=this.syncStubDetected&&r[0]===0;return r}catch(r){throw this.debug("Sync err "+r),r}}async _connectAttempt(t="default_reset",n){this.debug("_connect_attempt "+t),n&&await n.reset();const r=this.transport.peek(),i=Array.from(r,_=>String.fromCharCode(_)).join(""),l=/boot:(0x[0-9a-fA-F]+)([\s\S]*?waiting for download)?/,s=i.match(l);let o=!1,a="",u=!1;s&&(o=!0,a=s[1],u=!!s[2]),this.debug(`bootMode:${a} downloadMode:${u}`);let c="";for(let _=0;_<5;_++)try{this.debug(`Sync connect attempt ${_}`),this.transport.flushInput();const h=await this.sync();return this.debug(h[0].toString()),"success"}catch(h){this.debug(`Error at sync ${h}`),h instanceof Error?c=h.message:typeof h=="string"?c=h:c=JSON.stringify(h)}return o&&(c=`Wrong boot mode detected (${a}).
        This chip needs to be in download mode.`,u&&(c=`Download mode successfully detected, but getting no sync reply:
           The serial TX path seems to be down.`)),c}constructResetSequence(t){if(t!=="no_reset"){if(t==="usb_reset"||this.transport.getPid()===this.USB_JTAG_SERIAL_PID){if(this.resetConstructors.usbJTAGSerialReset)return this.debug("using USB JTAG Serial Reset"),[this.resetConstructors.usbJTAGSerialReset(this.transport)]}else if(this.resetConstructors.classicReset)return this.debug("using Classic Serial Reset"),[this.resetConstructors.classicReset(this.transport,50),this.resetConstructors.classicReset(this.transport,550)]}return[]}async connect(t="default_reset",n=7,r=!0){let i;this.info("Connecting...",!1),await this.transport.connect(this.romBaudrate,this.serialOptions),this.transport.readLoop();const l=this.constructResetSequence(t);for(let s=0;s<n;s++){const o=l.length>0?l[s%l.length]:null;if(i=await this._connectAttempt(t,o),i==="success")break}if(i!=="success")throw new G("Failed to connect with the device");if(this.debug("Connect attempt successful."),this.info(`
\r`,!1),r){const s=await this.readReg(this.CHIP_DETECT_MAGIC_REG_ADDR)>>>0;this.debug("Chip Magic "+s.toString(16));const o=await X1(s);if(o===null)throw new G(`Unexpected CHIP magic value 0x${s.toString(16)}. Failed to autodetect chip type.`);this.chip=o}}async detectChip(t="default_reset"){await this.connect(t),this.info("Detecting chip type... ",!1),this.chip!=null?this.info(this.chip.CHIP_NAME):this.info("unknown!")}async checkCommand(t="",n=null,r=new Uint8Array(0),i=0,l=0,s=this.DEFAULT_TIMEOUT){this.debug("check_command "+t);const o=2,a=await this.command(n,r,i,void 0,s);if(a&&a[1]&&a[1].length<l+o){const c=a[1].slice(0,2);throw c[0]!==0?new G(`Failed to ${t} failed with status ${c}`):new G(`Failed to ${t}.
 Only got ${a[1].length} bytes of data.`)}const u=a[1].slice(l,l+o);if(u[0]!==0)throw new G(`Failed to ${t} failed with status ${u}`);return l>0?a[1].slice(0,l):a[0]}async memBegin(t,n,r,i){if(this.IS_STUB){const s=i,o=i+t,a=this.chip.getChipRevision?await this.chip.getChipRevision(this):void 0,u=await Qc(this.chip.CHIP_NAME,a);if(u){const c=[[u.bss_start||u.data_start,u.data_start+u.decodedData.length],[u.text_start,u.text_start+u.decodedText.length]];for(const[_,h]of c)if(s<h&&o>_)throw new G(`Software loader is resident at 0x${_.toString(16).padStart(8,"0")}-0x${h.toString(16).padStart(8,"0")}.
            Can't load binary at overlapping address range 0x${s.toString(16).padStart(8,"0")}-0x${o.toString(16).padStart(8,"0")}.
            Either change binary loading address, or use the no-stub option to disable the software loader.`)}}this.debug("mem_begin "+t+" "+n+" "+r+" "+i.toString(16));let l=this._appendArray(this._intToByteArray(t),this._intToByteArray(n));l=this._appendArray(l,this._intToByteArray(r)),l=this._appendArray(l,this._intToByteArray(i)),await this.checkCommand("enter RAM download mode",this.ESP_MEM_BEGIN,l)}checksum(t,n=this.ESP_CHECKSUM_MAGIC){for(let r=0;r<t.length;r++)n^=t[r];return n}async memBlock(t,n){let r=this._appendArray(this._intToByteArray(t.length),this._intToByteArray(n));r=this._appendArray(r,this._intToByteArray(0)),r=this._appendArray(r,this._intToByteArray(0)),r=this._appendArray(r,t);const i=this.checksum(t);await this.checkCommand("write to target RAM",this.ESP_MEM_DATA,r,i)}async memFinish(t){const n=t===0?1:0,r=this._appendArray(this._intToByteArray(n),this._intToByteArray(t));await this.checkCommand("leave RAM download mode",this.ESP_MEM_END,r,void 0,void 0,200)}async flashSpiAttach(t){const n=this._intToByteArray(t);await this.checkCommand("configure SPI flash pins",this.ESP_SPI_ATTACH,n)}timeoutPerMb(t,n){const r=t*(n/1e6);return r<3e3?3e3:r}async flashBegin(t,n){const r=Math.floor((t+this.FLASH_WRITE_SIZE-1)/this.FLASH_WRITE_SIZE),i=this.chip.getEraseSize(n,t),l=new Date,s=l.getTime();let o=3e3;this.IS_STUB==!1&&(o=this.timeoutPerMb(this.ERASE_REGION_TIMEOUT_PER_MB,t)),this.debug("flash begin "+i+" "+r+" "+this.FLASH_WRITE_SIZE+" "+n+" "+t);let a=this._appendArray(this._intToByteArray(i),this._intToByteArray(r));a=this._appendArray(a,this._intToByteArray(this.FLASH_WRITE_SIZE)),a=this._appendArray(a,this._intToByteArray(n)),this.IS_STUB==!1&&(a=this._appendArray(a,this._intToByteArray(0))),await this.checkCommand("enter Flash download mode",this.ESP_FLASH_BEGIN,a,void 0,void 0,o);const u=l.getTime();return t!=0&&this.IS_STUB==!1&&this.info("Took "+(u-s)/1e3+"."+(u-s)%1e3+"s to erase flash block"),r}async flashDeflBegin(t,n,r){const i=Math.floor((n+this.FLASH_WRITE_SIZE-1)/this.FLASH_WRITE_SIZE),l=Math.floor((t+this.FLASH_WRITE_SIZE-1)/this.FLASH_WRITE_SIZE),s=new Date,o=s.getTime();let a,u;this.IS_STUB?(a=t,u=this.DEFAULT_TIMEOUT):(a=l*this.FLASH_WRITE_SIZE,u=this.timeoutPerMb(this.ERASE_REGION_TIMEOUT_PER_MB,a)),this.info("Compressed "+t+" bytes to "+n+"...");let c=this._appendArray(this._intToByteArray(a),this._intToByteArray(i));c=this._appendArray(c,this._intToByteArray(this.FLASH_WRITE_SIZE)),c=this._appendArray(c,this._intToByteArray(r)),(this.chip.CHIP_NAME==="ESP32-S2"||this.chip.CHIP_NAME==="ESP32-S3"||this.chip.CHIP_NAME==="ESP32-C3"||this.chip.CHIP_NAME==="ESP32-C2")&&this.IS_STUB===!1&&(c=this._appendArray(c,this._intToByteArray(0))),await this.checkCommand("enter compressed flash mode",this.ESP_FLASH_DEFL_BEGIN,c,void 0,void 0,u);const _=s.getTime();return t!=0&&this.IS_STUB===!1&&this.info("Took "+(_-o)/1e3+"."+(_-o)%1e3+"s to erase flash block"),i}async flashBlock(t,n,r){let i=this._appendArray(this._intToByteArray(t.length),this._intToByteArray(n));i=this._appendArray(i,this._intToByteArray(0)),i=this._appendArray(i,this._intToByteArray(0)),i=this._appendArray(i,t);const l=this.checksum(t);for(let s=this.WRITE_BLOCK_ATTEMPTS-1;s>=0;s--)try{await this.checkCommand("write to target Flash after seq "+n,this.ESP_FLASH_DATA,i,l,void 0,r);return}catch(o){if(s===0)throw o;this.debug(`Block ${n} write failed (${o}), retrying with ${s} attempts left...`),await nn(this.WRITE_BLOCK_RETRY_DELAY_MS)}}async flashDeflBlock(t,n,r){let i=this._appendArray(this._intToByteArray(t.length),this._intToByteArray(n));i=this._appendArray(i,this._intToByteArray(0)),i=this._appendArray(i,this._intToByteArray(0)),i=this._appendArray(i,t);const l=this.checksum(t);this.debug(`flash_defl_block ${Array.from(t.slice(0,2)).map(s=>s.toString(16)).join(" ")}`);for(let s=this.WRITE_BLOCK_ATTEMPTS-1;s>=0;s--)try{await this.checkCommand("write compressed data to flash after seq "+n,this.ESP_FLASH_DEFL_DATA,i,l,void 0,r);return}catch(o){if(s===0)throw o;this.debug(`Compressed block ${n} write failed (${o}), retrying with ${s} attempts left...`),await nn(this.WRITE_BLOCK_RETRY_DELAY_MS)}}async flashFinish(t=!1,n=this.DEFAULT_TIMEOUT){const r=t?0:1,i=this._intToByteArray(r);await this.checkCommand("leave Flash mode",this.ESP_FLASH_END,i,void 0,void 0,n)}async flashDeflFinish(t=!1,n=this.DEFAULT_TIMEOUT){const r=t?0:1,i=this._intToByteArray(r);await this.checkCommand("leave compressed flash mode",this.ESP_FLASH_DEFL_END,i,void 0,void 0,n)}async runSpiflashCommand(t,n,r,i=null,l=0,s=0){const h=this.chip.SPI_REG_BASE,m=h+0,v=h+4,S=h+this.chip.SPI_USR_OFFS,E=h+this.chip.SPI_USR1_OFFS,d=h+this.chip.SPI_USR2_OFFS,f=h+this.chip.SPI_W0_OFFS;let p;this.chip.SPI_MOSI_DLEN_OFFS!=null?p=async(F,H)=>{const B=h+this.chip.SPI_MOSI_DLEN_OFFS,j=h+this.chip.SPI_MISO_DLEN_OFFS;F>0&&await this.writeReg(B,F-1),H>0&&await this.writeReg(j,H-1);let C=0;s>0&&(C|=s-1),l>0&&(C|=l-1<<R),C&&await this.writeReg(E,C)}:p=async(F,H)=>{const B=E,j=17,C=8,P=F===0?0:F-1;let D=(H===0?0:H-1)<<C|P<<j;s>0&&(D|=s-1),l>0&&(D|=l-1<<R),await this.writeReg(B,D)};const g=1<<18,x=28,R=26;if(r>32)throw new G("Reading more than 32 bits back from a SPI flash operation is unsupported");if(n.length>64)throw new G("Writing more than 64 bytes of data with one SPI command is unsupported");const y=n.length*8,T=await this.readReg(S),I=await this.readReg(d);let A=-2147483648;r>0&&(A|=268435456),y>0&&(A|=134217728),l>0&&(A|=1073741824),s>0&&(A|=536870912),await p(y,r),await this.writeReg(S,A);let L=7<<x|t;if(await this.writeReg(d,L),i&&l>0&&(this.SPI_ADDR_REG_MSB&&(i=i<<32-l),await this.writeReg(v,i)),y==0)await this.writeReg(f,0);else{n=Ho(n,4,0);const F=[];for(let B=0;B<n.length;B+=4)F.push((n[B]|n[B+1]<<8|n[B+2]<<16|n[B+3]<<24)>>>0);let H=f;for(const B of F)await this.writeReg(H,B),H+=4}await this.writeReg(m,g);let O;for(O=0;O<10&&(L=await this.readReg(m)&g,L!=0);O++);if(O===10)throw new G("SPI command did not complete in time");const b=await this.readReg(f);return await this.writeReg(S,T),await this.writeReg(d,I),b}async readFlashId(){const n=new Uint8Array(0);return await this.runSpiflashCommand(159,n,24)}async eraseFlash(){this.info("Erasing flash (this may take a while)...");let t=new Date;const n=t.getTime(),r=await this.checkCommand("erase flash",this.ESP_ERASE_FLASH,void 0,void 0,void 0,this.CHIP_ERASE_TIMEOUT);t=new Date;const i=t.getTime();return this.info("Chip erase completed successfully in "+(i-n)/1e3+"s"),r}toHex(t){return Array.prototype.map.call(t,n=>("00"+n.toString(16)).slice(-2)).join("")}async flashMd5sum(t,n){const r=this.timeoutPerMb(this.MD5_TIMEOUT_PER_MB,n);let i=this._appendArray(this._intToByteArray(t),this._intToByteArray(n));i=this._appendArray(i,this._intToByteArray(0)),i=this._appendArray(i,this._intToByteArray(0));const o=this.IS_STUB?16:32,a=await this.checkCommand("calculate md5sum",this.ESP_SPI_FLASH_MD5,i,void 0,o,r);return this.toHex(a)}async readFlash(t,n,r=null){let i=this._appendArray(this._intToByteArray(t),this._intToByteArray(n));i=this._appendArray(i,this._intToByteArray(4096)),i=this._appendArray(i,this._intToByteArray(1024));const l=await this.checkCommand("read flash",this.ESP_READ_FLASH,i);if(l!=0)throw new G("Failed to read memory: "+l);let s=new Uint8Array(0);for(;s.length<n;){const o=await this.transport.read(this.FLASH_READ_TIMEOUT);if(o instanceof Uint8Array)o.length>0&&(s=this._appendArray(s,o),await this.transport.write(this._intToByteArray(s.length)),r&&r(o,s.length,n));else throw new G("Failed to read memory: "+o)}return s}async runStub(){if(this.syncStubDetected)return this.info("Stub is already running. No upload is necessary."),this.chip;this.info("Uploading stub...");const t=this.chip.getChipRevision?await this.chip.getChipRevision(this):void 0,n=await Qc(this.chip.CHIP_NAME,t);if(n===void 0)throw this.debug("Error loading Stub json"),new Error("Error loading Stub json");const r=[n.decodedText,n.decodedData];for(let s=0;s<r.length;s++)if(r[s]){const o=s===0?n.text_start:n.data_start,a=r[s].length,u=Math.floor((a+this.ESP_RAM_BLOCK-1)/this.ESP_RAM_BLOCK);await this.memBegin(a,u,this.ESP_RAM_BLOCK,o);for(let c=0;c<u;c++){const _=c*this.ESP_RAM_BLOCK,h=_+this.ESP_RAM_BLOCK;await this.memBlock(r[s].slice(_,h),c)}}this.info("Running stub..."),await this.memFinish(n.entry);const i=await this.transport.read(this.DEFAULT_TIMEOUT),l=String.fromCharCode(...i);if(l!=="OHAI")throw new G(`Failed to start stub. Unexpected response ${l}`);return this.info("Stub running..."),this.IS_STUB=!0,this.chip}async changeBaud(){this.info("Changing baudrate to "+this.baudrate);const t=this.IS_STUB?this.romBaudrate:0,n=this._appendArray(this._intToByteArray(this.baudrate),this._intToByteArray(t));await this.command(this.ESP_CHANGE_BAUDRATE,n),this.info("Changed"),this.info("If the chip does not respond to any further commands, consider using a lower baud rate."),await nn(50),await this.transport.disconnect(),await nn(50),await this.transport.connect(this.baudrate,this.serialOptions),await nn(50),this.transport.readLoop()}async main(t="default_reset"){await this.detectChip(t);const n=await this.chip.getChipDescription(this);if(this.chip.getChipRevision){const r=await this.chip.getChipRevision(this);this.info("Chip Revision: "+r)}this.info("Chip is "+n),this.info("Features: "+await this.chip.getChipFeatures(this)),this.info("Crystal is "+await this.chip.getCrystalFreq(this)+"MHz"),this.info("MAC: "+await this.chip.readMac(this)),await this.chip.readMac(this),typeof this.chip.postConnect<"u"&&await this.chip.postConnect(this),await this.runStub(),this.romBaudrate!==this.baudrate&&await this.changeBaud();try{const r=await this.readFlashId();this.info("Flash ID: "+r.toString(16)),(r===16777215||r===0)&&this.info(`WARNING: Failed to communicate with the flash chip,
read/write operations will fail.
Try checking the chip connections or removing
any other hardware connected to IOs.`)}catch(r){throw new G("Unable to verify flash chip connection "+r)}return n}flashSizeBytes(t){let n=-1;return this.transport.trace(`Flash size string ${t}`),t.toString().indexOf("KB")!==-1?n=parseInt(t.toString().slice(0,t.toString().indexOf("KB")))*1024:t.toString().indexOf("MB")!==-1&&(n=parseInt(t.toString().slice(0,t.toString().indexOf("MB")))*1024*1024),this.transport.trace(`Flash size in bytes ${n}`),n}parseFlashSizeArg(t){if(typeof this.chip.FLASH_SIZES[t]>"u")throw new G("Flash size "+t+" is not supported by this chip type. Supported sizes: "+this.chip.FLASH_SIZES);return this.chip.FLASH_SIZES[t]}async _updateImageFlashParams(t,n,r="keep",i="keep",l="keep"){if(this.debug(`_update_image_flash_params ${l} ${r} ${i}`),t.length<8||n!=this.chip.BOOTLOADER_FLASH_OFFSET)return t;if(l==="keep"&&r==="keep"&&i==="keep")return this.info("Not changing the image"),t;const s=t[0];let o=t[2];const a=t[3];if(s!==this.ESP_IMAGE_MAGIC)return this.info("Warning: Image file at 0x"+n.toString(16)+" doesn't look like an image file, so not changing any flash settings."),t;try{(await Xc(this.chip,t)).verify()}catch{return this.debug(`Warning: Image file at 0x${n.toString(16)} is not a valid ${this.chip.CHIP_NAME} image, so not changing any flash settings.`),t}const u=this.chip.CHIP_NAME!=="ESP8266"&&t[23]===49;r!=="keep"&&(o={qio:0,qout:1,dio:2,dout:3}[r]);let c=a&15;i!=="keep"&&(c={"40m":0,"26m":1,"20m":2,"80m":15}[i]);let _=a&240;if(l!=="keep")if(l==="detect"){this.info("Configuring flash size...");const v=await this.detectFlashSize();this.info("Detected flash size set to "+v),_=this.parseFlashSizeArg(v)}else _=this.parseFlashSizeArg(l);const h=o<<8|c+_;this.info("Flash params set to "+h.toString(16));const m=new Uint8Array(t);if(t[2]!==o&&(m[2]=o),t[3]!==c+_&&(m[3]=c+_),u){const v=await Xc(this.chip,m),S=m.slice(0,v.datalength),E=m.slice(v.datalength+v.SHA256_DIGEST_LEN),d=await crypto.subtle.digest("SHA-256",E),f=new Uint8Array(d),p=new Uint8Array(S.length+f.length+E.length);p.set(S,0),p.set(f,S.length),p.set(E,S.length+f.length);const g=p.slice(v.datalength,v.datalength+v.SHA256_DIGEST_LEN);return this.transport.hexify(f)===this.transport.hexify(g)?this.info("SHA digest in image updated"):this.info(`WARNING: SHA recalculation for binary failed!
	Expected calculated SHA: ${this.transport.hexify(f)}
	SHA stored in binary:    ${this.transport.hexify(g)}`),p}return m}async writeFlash(t){if(this.debug("EspLoader program"),t.flashSize!=="keep"){const i=this.flashSizeBytes(t.flashSize);for(let l=0;l<t.fileArray.length;l++)if(t.fileArray[l].data.length+t.fileArray[l].address>i)throw new G(`File ${l+1} doesn't fit in the available flash`)}this.IS_STUB===!0&&t.eraseAll===!0&&await this.eraseFlash();let n,r;for(let i=0;i<t.fileArray.length;i++){if(this.debug("Data Length "+t.fileArray[i].data.length),n=t.fileArray[i].data,this.debug("Image Length "+n.length),n.length===0){this.debug("Warning: File is empty");continue}n=Ho(n,4),r=t.fileArray[i].address,n=await this._updateImageFlashParams(n,r,t.flashMode,t.flashFreq,t.flashSize);let l=null;t.calculateMD5Hash&&(l=t.calculateMD5Hash(n),this.debug("Image MD5 "+l));const s=n.length;let o;t.compress?(n=M1(n,{level:9}),o=await this.flashDeflBegin(s,n.length,r)):o=await this.flashBegin(s,r);let a=0,u=0;const c=n.length;t.reportProgress&&t.reportProgress(i,0,c);let _=new Date;const h=_.getTime();let m=5e3;const v=new O1({chunkSize:1});let S=0;v.onData=function(f){S+=f.byteLength};let E=0;for(;E<n.length;){this.debug("Write loop "+r+" "+a+" "+o),this.info("Writing at 0x"+(r+(t.compress?S:u)).toString(16)+"... ("+Math.floor(100*(a+1)/o)+"%)");const f=Math.min(this.FLASH_WRITE_SIZE,n.length-E),p=n.slice(E,E+f),g=E+f>=n.length;if(t.compress){const x=S;v.push(p,g);const R=S-x;let y=3e3;this.timeoutPerMb(this.ERASE_WRITE_TIMEOUT_PER_MB,R)>3e3&&(y=this.timeoutPerMb(this.ERASE_WRITE_TIMEOUT_PER_MB,R)),this.IS_STUB===!1&&(m=y),await this.flashDeflBlock(p,a,m),this.IS_STUB&&(m=y)}else{let x=p;p.length<this.FLASH_WRITE_SIZE&&(x=new Uint8Array(this.FLASH_WRITE_SIZE).fill(255),x.set(p));let R=3e3;this.timeoutPerMb(this.ERASE_WRITE_TIMEOUT_PER_MB,x.length)>3e3&&(R=this.timeoutPerMb(this.ERASE_WRITE_TIMEOUT_PER_MB,x.length)),this.IS_STUB===!1&&(m=R),await this.flashBlock(x,a,m),this.IS_STUB&&(m=R)}u+=p.length,E+=f,a++,t.reportProgress&&t.reportProgress(i,u,c)}this.IS_STUB&&(t.compress?await this.flashDeflFinish(!1,m):await this.flashFinish(!1,m)),_=new Date;const d=_.getTime()-h;if(t.compress?this.info("Wrote "+s+" bytes ("+u+" compressed) at 0x"+r.toString(16)+" in "+d/1e3+" seconds."):this.info("Wrote "+u+" bytes at 0x"+r.toString(16)+" in "+d/1e3+" seconds."),l){this.info("File  md5: "+l);const f=await this.flashMd5sum(r,s);if(this.info("Flash md5: "+f),new String(f).valueOf()!=new String(l).valueOf())throw new G("MD5 of file does not match data in flash!");this.info("Hash of data verified.")}}this.info("Leaving...")}async flashId(){this.debug("flash_id");const t=await this.readFlashId();this.info("Manufacturer: "+(t&255).toString(16));const n=t>>16&255;this.info("Device: "+(t>>8&255).toString(16)+n.toString(16)),this.info("Detected flash size: "+this.DETECTED_FLASH_SIZES[n])}async detectFlashSize(){this.debug("detectFlashSize");const n=await this.readFlashId()>>16&255;let r=this.DETECTED_FLASH_SIZES[n];return r?this.info("Auto-detected Flash size: "+r):(r="4MB",this.info("Could not auto-detect Flash size. defaulting to 4MB")),r}async softReset(t){if(this.IS_STUB){if(this.chip.CHIP_NAME!="ESP8266")throw new G("Soft resetting is currently only supported on ESP8266");t?(await this.flashBegin(0,0),await this.flashFinish(!0)):await this.command(this.ESP_RUN_USER_CODE,void 0,void 0,!1)}else{if(t)return;await this.flashBegin(0,0),await this.flashFinish(!1)}}async after(t="hard_reset",n,r){switch(t){case"hard_reset":this.resetConstructors.hardReset&&(this.info("Hard resetting via RTS pin..."),await this.resetConstructors.hardReset(this.transport,n).reset());break;case"soft_reset":this.info("Soft resetting..."),await this.softReset(!1);break;case"no_reset_stub":this.info("Staying in flasher stub.");break;case"custom_reset":r||this.info("Custom reset sequence not provided, doing nothing."),this.resetConstructors.customReset||this.info("Custom reset constructor not available, doing nothing."),this.resetConstructors.customReset&&r&&(this.info("Custom resetting using sequence "+r),await this.resetConstructors.customReset(this.transport,r).reset());break;default:this.info("Staying in bootloader."),this.IS_STUB&&this.softReset(!0);break}}}const Jc="4c4f4600-7469-7461-6e00-000000000001",J1="4c4f4601-7469-7461-6e00-000000000001",ev="4c4f4602-7469-7461-6e00-000000000001",tv="4c4f4603-7469-7461-6e00-000000000001",nv="4c4f4604-7469-7461-6e00-000000000001",rv="4c4f4605-7469-7461-6e00-000000000001";function iv(){const[e,t]=U.useState("none"),[n,r]=U.useState(null),[i,l]=U.useState(""),[s,o]=U.useState(!1),[a,u]=U.useState("DISCONNECTED"),[c,_]=U.useState(""),[h,m]=U.useState(null),v=U.useRef({}),S=U.useRef(null),E=U.useRef(null),d=U.useRef(null),f=U.useRef(null),p=async()=>{try{if(!navigator.bluetooth)throw new Error("Web Bluetooth API is not supported in this browser.");const O=await navigator.bluetooth.requestDevice({filters:[{namePrefix:"LOF_TITAN"}],optionalServices:[Jc]});O.addEventListener("gattserverdisconnected",y);const b=await O.gatt.connect();S.current=b;const F=await b.getPrimaryService(Jc);v.current.control=await F.getCharacteristic(J1),v.current.progData=await F.getCharacteristic(ev);const H=await F.getCharacteristic(tv);v.current.status=H,await H.startNotifications(),H.addEventListener("characteristicvaluechanged",j=>{const C=new TextDecoder().decode(j.target.value);try{const P=JSON.parse(C);P.status&&u(P.status)}catch{}});const B=await F.getCharacteristic(nv);v.current.console=B,await B.startNotifications(),B.addEventListener("characteristicvaluechanged",j=>{const C=new TextDecoder().decode(j.target.value);_(P=>P+C)});try{const C=await(await F.getCharacteristic(rv)).readValue(),P=new TextDecoder().decode(C);m(JSON.parse(P))}catch{}r(O),l(O.name||"LOF_TITAN (BLE)"),t("ble"),o(!0),u("CONNECTED_IDLE");try{const j=JSON.stringify({cmd:"CONNECT"});await v.current.control.writeValue(new TextEncoder().encode(j))}catch{}}catch(O){console.error("BLE connection error:",O),alert("BLE Connection failed: "+O.message)}},g=async()=>{try{if(!("serial"in navigator))throw new Error("Web Serial API is not supported in this browser. Please use Chrome or Edge.");const O=await navigator.serial.requestPort();await O.open({baudRate:115200}),E.current=O;const b=O.writable.getWriter();d.current=b,r(O),l("ESP32-S3 (COM Port)"),t("serial"),o(!0),u("CONNECTED_IDLE"),x(O);try{await b.write(new TextEncoder().encode(JSON.stringify({cmd:"CONNECT"})+`
`))}catch{}}catch(O){console.error("Serial connection error:",O),alert("Serial Connection failed: "+O.message)}},x=async O=>{try{const b=new TextDecoderStream;O.readable.pipeTo(b.writable).catch(()=>{});const F=b.readable.getReader();for(f.current=F;;){const{value:H,done:B}=await F.read();if(B){F.releaseLock();break}H&&_(j=>j+H)}}catch(b){console.error("Serial read loop error:",b)}},R=async()=>{try{await T("DISCONNECT")}catch{}if(e==="ble"&&n&&n.gatt&&n.gatt.connected)n.gatt.disconnect();else if(e==="serial"&&E.current)try{f.current&&await f.current.cancel(),d.current&&d.current.releaseLock(),await E.current.close()}catch{}y()},y=()=>{r(null),l(""),o(!1),t("none"),u("DISCONNECTED"),S.current=null,v.current={},E.current=null,d.current=null,f.current=null},T=async(O,b={})=>{const F=JSON.stringify({cmd:O,...b});if(e==="ble"&&v.current.control){const H=new TextEncoder().encode(F),B=20;for(let j=0;j<H.length;j+=B){const C=H.slice(j,j+B);await v.current.control.writeValueWithResponse(C)}}else e==="serial"&&d.current&&await d.current.write(new TextEncoder().encode(F+`
`))};return{connectBLE:p,connectSerial:g,disconnect:R,connected:s,connectionType:e,device:n,deviceName:i,status:a,consoleOutput:c,deviceInfo:h,sendCommand:T,uploadProgram:async(O,b,F)=>{_("");const H=new TextEncoder().encode(b),B=H.length,j=H.reduce((C,P)=>C+P,0);if(await T("PROGRAM",{filename:O,size:B,checksum:j}),await new Promise(C=>setTimeout(C,400)),e==="ble"&&v.current.progData){const P=Math.ceil(B/18);for(let M=0;M<B;M+=18){const D=H.slice(M,M+18),K=Math.floor(M/18),Te=new Uint8Array(2+D.length);Te[0]=K>>8&255,Te[1]=K&255,Te.set(D,2),await v.current.progData.writeValueWithResponse(Te),F&&F(Math.round((K+1)/P*100)),await new Promise(Oe=>setTimeout(Oe,10))}await new Promise(M=>setTimeout(M,500)),await T("RUN")}else if(e==="serial"&&d.current){const P=Math.ceil(B/128);for(let M=0;M<B;M+=128){const D=H.slice(M,M+128),K=Math.floor(M/128);let Te="";for(let ht=0;ht<D.length;ht++)Te+=String.fromCharCode(D[ht]);const Oe=btoa(Te);await T("CHUNK",{seq:K,data:Oe}),F&&F(Math.round((K+1)/P*100)),await new Promise(ht=>setTimeout(ht,20))}await new Promise(M=>setTimeout(M,500)),await T("RUN")}},clearConsole:()=>_(""),flashFirmware:async O=>{try{if(!("serial"in navigator))throw new Error("Web Serial API is not supported in this browser.");s&&await R(),O({state:"Fetching firmware files...",percent:0});const[b,F,H]=await Promise.all([fetch("/firmware/bootloader.bin").then(D=>D.arrayBuffer()),fetch("/firmware/partitions.bin").then(D=>D.arrayBuffer()),fetch("/firmware/micropython.bin").then(D=>D.arrayBuffer())]);O({state:"Select COM port to flash...",percent:0});const B=await navigator.serial.requestPort(),j=new $a(B,!0),C=new Yh({transport:j,baudrate:460800,terminal:{clean:()=>{},writeLine:D=>console.log(D),write:D=>console.log(D)}});O({state:"Connecting to ESP32...",percent:5}),await C.main(),O({state:"Flashing...",percent:10});const M={fileArray:[{data:new Uint8Array(b),address:0},{data:new Uint8Array(F),address:32768},{data:new Uint8Array(H),address:65536}],flashSize:"keep",flashMode:"dio",flashFreq:"80m",eraseAll:!1,compress:!0,reportProgress:(D,K,Te)=>{const Oe=Math.round(K/Te*100);O({state:`Flashing file ${D+1} of 3...`,percent:Oe})}};await C.writeFlash(M),O({state:"Resetting device...",percent:100}),await j.setDTR(!1),await j.setRTS(!0),await new Promise(D=>setTimeout(D,100)),await j.setDTR(!1),await j.setRTS(!1),await j.disconnect(),alert("Firmware Flashed Successfully! Please reconnect to the COM port."),O(null)}catch(b){console.error(b),alert("Flashing failed: "+b.message),O(null)}}}}const zi=[{id:"cosmic-pulse",name:"Cosmic Pulse Tracker",description:"Track celestial patterns using IMU and light data.",code:`# Cosmic Pulse Tracker (Dummy Code)
import time
from supervisor.led_buzzer import hw
print("Initializing Cosmic Pulse Tracker...")
for i in range(5):
    hw.set_leds_connected()
    time.sleep(0.5)
    hw.set_leds_disconnected()
    time.sleep(0.5)
print("Tracking complete.")
`},{id:"heat-seeker",name:"Heat-Seeker Rover",description:"Autonomous rover seeking thermal signatures.",code:`# Heat-Seeker Rover (Dummy Code)
import time
print("Starting Heat-Seeker engines...")
for i in range(1, 4):
    print(f"Scanning sector {i}...")
    time.sleep(1)
print("Target acquired.")
`},{id:"heartbeat-dj",name:"Heartbeat DJ Bot",description:"Synchronizes music beats with biometric heart rate.",code:`# Heartbeat DJ Bot (Dummy Code)
import time
from supervisor.led_buzzer import hw
print("DJ Bot Online! Dropping the beat...")
hw.play_startup_tone()
time.sleep(0.5)
hw.play_run_tone()
print("Beat dropped!")
`},{id:"invisible-line",name:"Invisible Line Patrol Rover",description:"Detect a UV light signal and follow it autonomously.",lesson:{title:"Mission: Invisible Line Patrol",intro:"In the Invisible Line Patrol Rover, you will upgrade your walking rover so it can detect a UV light signal and follow it autonomously.\\nBy the end of this mission, your rover will:",bullets:["Read UV intensity using three UV sensors","Compare front, left vs right signal strength","Move forward when the signal is centred or front-facing","Turn toward the stronger signal","Stop safely when no UV is detected"],conclusion:"This mission shows how robots sense, decide, and correct their movement in real time.",images:["/assets/invisible-line/image (12).png","/assets/invisible-line/image (13).png","/assets/invisible-line/image (14).png"]},code:`"""
ESP32-S3 3 UV Rover - Invisible Line Patrol
Exact MicroPython Carbon-Copy of invisible_linepatrol.ino for LOF TITAN Firmware

Features:
- WiFi SoftAP: SSID="ESP32S3_3UV_ROVER", Password="12345678", IP=192.168.4.1
- Embedded Non-Blocking Web Server (Port 80) with full interactive web dashboard
- 3 UV Sensor Autonomous Line Tracking (120ms cycle)
- Manual Touch D-Pad Web Control
- Live Speed & UV Threshold adjustment
"""

import time
import socket
import select
import network
import gc
from machine import Pin, PWM, ADC
from supervisor.led_buzzer import hw

# ================= MOTOR PINS =================
# Left Motor M1
L_IN1 = 15
L_IN2 = 16

# Right Motor M2
R_IN1 = 13
R_IN2 = 14

# ================= UV SENSOR PINS =================
UV_FRONT_PIN = 1   # GPIO 1 (S2)
UV_LEFT_PIN  = 2   # GPIO 2 (S1)
UV_RIGHT_PIN = 3   # GPIO 3 (S3)

# ================= PWM SETTINGS =================
PWM_FREQ = 5000

# ================= HTML WEB PAGE (Exact Carbon Copy) =================
HTML_PAGE = """<!DOCTYPE html>
<html>
<head>
  <title>ESP32-S3 3 UV Rover</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: #101820;
      color: white;
      text-align: center;
    }
    h1 {
      margin-top: 20px;
      font-size: 26px;
      color: #00e5ff;
    }
    .box {
      background: #1b263b;
      width: 88%;
      max-width: 430px;
      margin: 15px auto;
      padding: 15px;
      border-radius: 18px;
      font-size: 18px;
    }
    .value {
      font-size: 22px;
      color: #ffd166;
      font-weight: bold;
    }
    .action {
      font-size: 24px;
      color: #90ee90;
      font-weight: bold;
      margin-top: 10px;
    }
    .modeBtn {
      width: 160px;
      height: 55px;
      border: none;
      border-radius: 15px;
      margin: 8px;
      font-size: 17px;
      font-weight: bold;
      color: white;
      cursor: pointer;
    }
    .auto {
      background: #2a9d8f;
    }
    .manual {
      background: #6c63ff;
    }
    .controller {
      display: grid;
      grid-template-columns: 95px 95px 95px;
      grid-template-rows: 95px 95px 95px;
      gap: 14px;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
    }
    .btn {
      width: 95px;
      height: 95px;
      border: none;
      border-radius: 25px;
      background: linear-gradient(145deg, #00b4d8, #0077b6);
      color: white;
      font-size: 34px;
      font-weight: bold;
      box-shadow: 0 7px 0 #023e8a;
      user-select: none;
      touch-action: none;
      cursor: pointer;
    }
    .btn:active {
      transform: translateY(5px);
      box-shadow: 0 2px 0 #023e8a;
    }
    .stop {
      background: linear-gradient(145deg, #ff4d4d, #c9184a);
      box-shadow: 0 7px 0 #800f2f;
      font-size: 20px;
    }
    .sliderBox {
      background: #1b263b;
      width: 85%;
      max-width: 400px;
      margin: 18px auto;
      padding: 15px;
      border-radius: 18px;
    }
    input[type=range] {
      width: 90%;
    }
    .footer {
      margin-top: 22px;
      font-size: 14px;
      color: #aaa;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <h1>ESP32-S3 3 UV Rover</h1>

  <div class="box">
    <div>Front UV: <span class="value" id="frontUV">0</span></div>
    <div>Left UV: <span class="value" id="leftUV">0</span></div>
    <div>Right UV: <span class="value" id="rightUV">0</span></div>
    <div class="action" id="actionText">STOP</div>
    <div>Mode: <span id="modeText">AUTO UV</span></div>
  </div>

  <button class="modeBtn auto" onclick="setMode('auto')">AUTO UV</button>
  <button class="modeBtn manual" onclick="setMode('manual')">MANUAL</button>

  <div class="controller">
    <div></div>
    <button class="btn"
      onpointerdown="sendCmd('forward')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9650;</button>
    <div></div>

    <button class="btn"
      onpointerdown="sendCmd('left')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9664;</button>
    <button class="btn stop" onclick="sendCmd('stop')">STOP</button>
    <button class="btn"
      onpointerdown="sendCmd('right')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9654;</button>

    <div></div>
    <button class="btn"
      onpointerdown="sendCmd('backward')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9660;</button>
    <div></div>
  </div>

  <div class="sliderBox">
    <h2>Motor Speed</h2>
    <input type="range" min="0" max="255" value="170" id="speedSlider" oninput="updateSpeed(this.value)">
    <div>Speed: <span id="speedValue">170</span></div>
  </div>

  <div class="sliderBox">
    <h2>UV Threshold</h2>
    <input type="range" min="0" max="4095" value="300" id="uvSlider" oninput="updateThreshold(this.value)">
    <div>Threshold: <span id="thresholdValue">300</span></div>
  </div>

  <div class="footer">
    WiFi: ESP32S3_3UV_ROVER<br>
    Password: 12345678<br>
    Open: 192.168.4.1
  </div>

<script>
  function sendCmd(cmd) {
    fetch('/cmd?move=' + cmd);
  }
  function setMode(mode) {
    fetch('/mode?value=' + mode);
  }
  function updateSpeed(value) {
    document.getElementById('speedValue').innerHTML = value;
    fetch('/speed?value=' + value);
  }
  function updateThreshold(value) {
    document.getElementById('thresholdValue').innerHTML = value;
    fetch('/threshold?value=' + value);
  }
  function updateStatus() {
    fetch('/status')
      .then(response => response.json())
      .then(data => {
        document.getElementById('frontUV').innerHTML = data.front;
        document.getElementById('leftUV').innerHTML = data.left;
        document.getElementById('rightUV').innerHTML = data.right;
        document.getElementById('actionText').innerHTML = data.action;
        document.getElementById('modeText').innerHTML = data.mode;
      })
      .catch(err => console.log(err));
  }
  setInterval(updateStatus, 500);
  updateStatus();
<\/script>
</body>
</html>
"""

class InvisibleLinePatrolRover:
    def __init__(self):
        self.motor_speed = 170
        self.uv_threshold = 300
        self.uv_margin = 80
        self.auto_uv_mode = True
        self.current_action = "STOP"

        self.front_uv = 0
        self.left_uv = 0
        self.right_uv = 0

        # Deinit existing PWM
        for p in (L_IN1, L_IN2, R_IN1, R_IN2):
            try:
                PWM(Pin(p)).deinit()
            except Exception:
                pass

        # Motor PWMs
        self.pwm_l1 = PWM(Pin(L_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_l2 = PWM(Pin(L_IN2), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r1 = PWM(Pin(R_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r2 = PWM(Pin(R_IN2), freq=PWM_FREQ, duty_u16=0)

        # UV Sensors (12-bit: 0..4095)
        self.adc_front = ADC(Pin(UV_FRONT_PIN))
        self.adc_left  = ADC(Pin(UV_LEFT_PIN))
        self.adc_right = ADC(Pin(UV_RIGHT_PIN))
        self.adc_front.atten(ADC.ATTN_11DB)
        self.adc_left.atten(ADC.ATTN_11DB)
        self.adc_right.atten(ADC.ATTN_11DB)

        self.stop_motors()

        # WiFi SoftAP Setup
        self.ap = network.WLAN(network.AP_IF)
        self.ap.active(True)
        self.ap.config(essid="ESP32S3_3UV_ROVER", password="12345678")
        time.sleep_ms(200)

        # Web Server Socket (Non-blocking)
        self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_sock.bind(('0.0.0.0', 80))
        self.server_sock.listen(5)
        self.server_sock.setblocking(False)

        self.poller = select.poll()
        self.poller.register(self.server_sock, select.POLLIN)

    def _pwm_write_pin(self, pwm_pin, value):
        val = max(0, min(255, int(value)))
        duty = int((val / 255.0) * 65535)
        pwm_pin.duty_u16(duty)

    def left_motor_forward(self, spd):
        self._pwm_write_pin(self.pwm_l1, spd)
        self._pwm_write_pin(self.pwm_l2, 0)

    def left_motor_backward(self, spd):
        self._pwm_write_pin(self.pwm_l1, 0)
        self._pwm_write_pin(self.pwm_l2, spd)

    def right_motor_forward(self, spd):
        self._pwm_write_pin(self.pwm_r1, spd)
        self._pwm_write_pin(self.pwm_r2, 0)

    def right_motor_backward(self, spd):
        self._pwm_write_pin(self.pwm_r1, 0)
        self._pwm_write_pin(self.pwm_r2, spd)

    def stop_motors(self):
        self._pwm_write_pin(self.pwm_l1, 0)
        self._pwm_write_pin(self.pwm_l2, 0)
        self._pwm_write_pin(self.pwm_r1, 0)
        self._pwm_write_pin(self.pwm_r2, 0)
        self.current_action = "STOP"

    def forward(self):
        self.left_motor_forward(self.motor_speed)
        self.right_motor_forward(self.motor_speed)
        self.current_action = "FORWARD"

    def backward(self):
        self.left_motor_backward(self.motor_speed)
        self.right_motor_backward(self.motor_speed)
        self.current_action = "BACKWARD"

    def left_turn(self):
        self.left_motor_backward(self.motor_speed)
        self.right_motor_forward(self.motor_speed)
        self.current_action = "LEFT"

    def right_turn(self):
        self.left_motor_forward(self.motor_speed)
        self.right_motor_backward(self.motor_speed)
        self.current_action = "RIGHT"

    def read_average_uv(self, adc):
        total = 0
        for _ in range(10):
            total += (adc.read_u16() >> 4)
            time.sleep_ms(2)
        return total // 10

    def auto_uv_control(self):
        self.front_uv = self.read_average_uv(self.adc_front)
        self.left_uv  = self.read_average_uv(self.adc_left)
        self.right_uv = self.read_average_uv(self.adc_right)

        front_detected = self.front_uv > self.uv_threshold
        left_detected  = self.left_uv > self.uv_threshold
        right_detected = self.right_uv > self.uv_threshold

        act_log = ""
        if not front_detected and not left_detected and not right_detected:
            self.stop_motors()
            act_log = "NO UV -> STOP"
        elif self.front_uv >= (self.left_uv + self.uv_margin) and self.front_uv >= (self.right_uv + self.uv_margin):
            self.forward()
            act_log = "FRONT UV -> FORWARD"
        elif self.left_uv > (self.right_uv + self.uv_margin):
            self.left_turn()
            act_log = "LEFT UV -> LEFT"
        elif self.right_uv > (self.left_uv + self.uv_margin):
            self.right_turn()
            act_log = "RIGHT UV -> RIGHT"
        else:
            self.forward()
            act_log = "BALANCED UV -> FORWARD"

        print(f"F={self.front_uv} | L={self.left_uv} | R={self.right_uv} | TH={self.uv_threshold} | ACT={act_log}")

    def handle_client(self):
        events = self.poller.poll(0)
        if not events:
            return

        for sock, evt in events:
            if evt & select.POLLIN:
                try:
                    client, _ = self.server_sock.accept()
                    client.settimeout(1.0)
                    request = client.recv(1024).decode('utf-8')
                    if not request:
                        client.close()
                        continue

                    req_line = request.split('\\r\\n')[0]
                    parts = req_line.split(' ')
                    if len(parts) < 2:
                        client.close()
                        continue

                    path = parts[1]

                    if path == '/' or path == '/index.html':
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/html; charset=utf-8\\r\\nConnection: close\\r\\n\\r\\n" + HTML_PAGE
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/cmd'):
                        self.auto_uv_mode = False
                        move_cmd = "stop"
                        if 'move=' in path:
                            move_cmd = path.split('move=')[1].split('&')[0].split(' ')[0]

                        if move_cmd == 'forward':
                            self.forward()
                        elif move_cmd == 'backward':
                            self.backward()
                        elif move_cmd == 'left':
                            self.left_turn()
                        elif move_cmd == 'right':
                            self.right_turn()
                        elif move_cmd == 'stop':
                            self.stop_motors()

                        print(f"Manual Command: {move_cmd}")
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nOK"
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/mode'):
                        if 'value=' in path:
                            mode_val = path.split('value=')[1].split('&')[0].split(' ')[0]
                            if mode_val == 'auto':
                                self.auto_uv_mode = True
                                print("Mode: AUTO UV")
                            elif mode_val == 'manual':
                                self.auto_uv_mode = False
                                self.stop_motors()
                                print("Mode: MANUAL")

                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nMode OK"
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/speed'):
                        if 'value=' in path:
                            val_str = path.split('value=')[1].split('&')[0].split(' ')[0]
                            try:
                                self.motor_speed = max(0, min(255, int(val_str)))
                                print(f"Motor Speed: {self.motor_speed}")
                            except Exception:
                                pass

                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nSpeed OK"
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/threshold'):
                        if 'value=' in path:
                            val_str = path.split('value=')[1].split('&')[0].split(' ')[0]
                            try:
                                self.uv_threshold = max(0, min(4095, int(val_str)))
                                print(f"UV Threshold: {self.uv_threshold}")
                            except Exception:
                                pass

                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nThreshold OK"
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/status'):
                        self.front_uv = self.read_average_uv(self.adc_front)
                        self.left_uv  = self.read_average_uv(self.adc_left)
                        self.right_uv = self.read_average_uv(self.adc_right)
                        mode_name = "AUTO UV" if self.auto_uv_mode else "MANUAL"

                        json_data = f'{{"front":{self.front_uv},"left":{self.left_uv},"right":{self.right_uv},"action":"{self.current_action}","mode":"{mode_name}"}}'
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nConnection: close\\r\\n\\r\\n" + json_data
                        client.sendall(resp.encode('utf-8'))

                    else:
                        resp = "HTTP/1.1 404 Not Found\\r\\nConnection: close\\r\\n\\r\\nNot Found"
                        client.sendall(resp.encode('utf-8'))

                    client.close()
                except Exception:
                    try:
                        client.close()
                    except Exception:
                        pass

    def cleanup(self):
        self.stop_motors()
        try:
            self.server_sock.close()
        except Exception:
            pass


def main():
    print()
    print("ESP32-S3 3 UV Rover Started")
    print("WiFi Name: ESP32S3_3UV_ROVER")
    print("Password: 12345678")
    print("Open IP: 192.168.4.1")

    hw.play_startup_tone()
    hw.set_leds_connected()

    rover = InvisibleLinePatrolRover()
    print("Web Server Started")
    print("AUTO UV MODE STARTED")

    last_uv_check = time.ticks_ms()

    try:
        while True:
            rover.handle_client()

            if rover.auto_uv_mode:
                now = time.ticks_ms()
                if time.ticks_diff(now, last_uv_check) >= 120:
                    last_uv_check = now
                    rover.auto_uv_control()

            time.sleep_ms(10)
            gc.collect()

    except KeyboardInterrupt:
        print("\\nStopping Invisible Line Patrol Rover...")
    finally:
        rover.cleanup()
        hw.set_leds_disconnected()
        print("Rover stopped safely.")


if __name__ == "__main__":
    main()
`},{id:"aquanova",name:"AquaNova Alert Rover",description:"Environmental monitoring with water leak detection and PIR motion sensing.",code:`"""
AquaNova - Environmental Water & Motion Alert Rover
Exact MicroPython Carbon-Copy of Aqua_nova.ino for LOF TITAN Firmware
"""
import time
import socket
import select
import network
import gc
from machine import Pin, PWM, I2C
from supervisor.led_buzzer import hw

# Motor Pins
L_IN1 = 11
L_IN2 = 12
R_IN1 = 9
R_IN2 = 10

# Sensor Pins
PIR_PIN = 2     # GPIO 2
WATER_PIN = 4   # GPIO 4

# OLED Pins
OLED_SDA = 7
OLED_SCL = 8

PWM_FREQ = 5000
MOTOR_SPEED = 100

HTML_PAGE = """<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"
>

<title>
LoF Titan Alert Rover
</title>


<style>

* {
  box-sizing: border-box;
}

body {

  margin: 0;

  font-family:
  Arial,
  Helvetica,
  sans-serif;

  background:
  linear-gradient(
    135deg,
    #061526,
    #0d3152
  );

  color: white;

  text-align: center;
}


/* =========================================
   HEADER
   ========================================= */

.header {

  background: #06101d;

  padding: 22px;

  font-size: 27px;

  font-weight: bold;

  letter-spacing: 1px;

  box-shadow:
  0px 4px 15px rgba(0,0,0,0.5);
}


/* =========================================
   MAIN CONTAINER
   ========================================= */

.container {

  max-width: 700px;

  margin: auto;

  padding: 20px;
}


/* =========================================
   SECTION TITLE
   ========================================= */

.section-title {

  font-size: 21px;

  font-weight: bold;

  margin-top: 15px;

  margin-bottom: 20px;
}


/* =========================================
   SENSOR CARDS
   ========================================= */

.sensor-container {

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 20px;

  flex-wrap: wrap;
}


.sensor-card {

  width: 270px;

  padding: 22px;

  background: #112d48;

  border-radius: 18px;

  box-shadow:
  0px 6px 20px rgba(0,0,0,0.4);
}


.sensor-name {

  font-size: 20px;

  font-weight: bold;

  margin-bottom: 15px;
}


.status {

  padding: 18px;

  border-radius: 12px;

  font-size: 18px;

  font-weight: bold;

  transition: 0.3s;
}


/* =========================================
   SAFE STATUS
   ========================================= */

.safe {

  background: #16834a;

  box-shadow:
  0px 0px 12px rgba(22,131,74,0.7);
}


/* =========================================
   ALERT STATUS
   ========================================= */

.alert {

  background: #d52d35;

  box-shadow:
  0px 0px 18px rgba(255,0,0,0.8);

  animation:
  alertPulse 0.7s infinite alternate;
}


@keyframes alertPulse {

  from {

    transform: scale(1);
  }

  to {

    transform: scale(1.05);
  }
}


/* =========================================
   MOTOR CONTROL PANEL
   ========================================= */

.control-panel {

  margin-top: 30px;

  padding: 25px;

  background: #112d48;

  border-radius: 18px;

  box-shadow:
  0px 6px 20px rgba(0,0,0,0.4);
}


/* =========================================
   CONTROL GRID
   ========================================= */

.control-grid {

  display: grid;

  grid-template-columns:
  100px
  100px
  100px;

  gap: 15px;

  justify-content: center;

  margin-top: 20px;
}


/* =========================================
   CONTROL BUTTONS
   ========================================= */

button {

  width: 100px;

  height: 65px;

  border: none;

  border-radius: 14px;

  background: #178ce5;

  color: white;

  font-size: 15px;

  font-weight: bold;

  cursor: pointer;

  box-shadow:
  0px 5px 12px rgba(0,0,0,0.5);

  touch-action: none;

  user-select: none;
}


button:hover {

  background: #0d75c4;
}


button:active {

  transform: scale(0.92);
}


/* =========================================
   STOP BUTTON
   ========================================= */

.stop-button {

  background: #e02e38;
}


.stop-button:hover {

  background: #bb2029;
}


/* =========================================
   EMPTY GRID
   ========================================= */

.blank {

  visibility: hidden;
}


/* =========================================
   CONNECTION
   ========================================= */

.connection {

  margin-top: 25px;

  padding: 10px;

  font-size: 14px;

  color: #a6cce8;
}


.online-dot {

  display: inline-block;

  width: 10px;

  height: 10px;

  background: #24d264;

  border-radius: 50%;

  margin-right: 6px;
}


/* =========================================
   MOBILE
   ========================================= */

@media(max-width: 420px) {

  .header {

    font-size: 21px;
  }


  .control-grid {

    grid-template-columns:
    85px
    85px
    85px;
  }


  button {

    width: 85px;

    font-size: 13px;
  }
}

</style>

</head>


<body>


<!-- =====================================
     HEADER
     ===================================== -->

<div class="header">

LOF TITAN ALERT ROVER

</div>


<div class="container">


<!-- =====================================
     SENSOR STATUS
     ===================================== -->

<div class="section-title">

LIVE SENSOR STATUS

</div>


<div class="sensor-container">


<!-- =====================================
     MOTION SENSOR
     ===================================== -->

<div class="sensor-card">

<div class="sensor-name">

MOTION SENSOR

</div>


<div
id="motion"
class="status safe"
>

NO MOTION

</div>

</div>


<!-- =====================================
     WATER SENSOR
     ===================================== -->

<div class="sensor-card">

<div class="sensor-name">

WATER SENSOR

</div>


<div
id="water"
class="status safe"
>

NO WATER

</div>

</div>


</div>


<!-- =====================================
     ROVER CONTROL
     ===================================== -->

<div class="control-panel">


<div class="section-title">

ROVER CONTROL

</div>


<div class="control-grid">


<!-- ROW 1 -->

<div class="blank"></div>


<button

onpointerdown="
startMove('/forward')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

FORWARD

</button>


<div class="blank"></div>


<!-- ROW 2 -->

<button

onpointerdown="
startMove('/left')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

LEFT

</button>


<button

class="stop-button"

onclick="
sendCommand('/stop')
"

>

STOP

</button>


<button

onpointerdown="
startMove('/right')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

RIGHT

</button>


<!-- ROW 3 -->

<div class="blank"></div>


<button

onpointerdown="
startMove('/backward')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

BACKWARD

</button>


<div class="blank"></div>


</div>

</div>


<!-- =====================================
     CONNECTION
     ===================================== -->

<div class="connection">

<span class="online-dot"></span>

ESP32-S3 Direct Wi-Fi Dashboard

<br><br>

Connect to: LOF_TITAN_ROVER<br><br>Open: 192.168.4.1

</div>


</div>


<script>

// ==========================================
// MOTOR CONTROL
// ==========================================

let moving = false;


function sendCommand(command) {

  fetch(
    command,
    {
      cache: "no-store"
    }
  )

  .catch(error => {

    console.log(
      "Command Error",
      error
    );

  });
}


// ==========================================
// START MOVEMENT
// ==========================================

function startMove(command) {

  moving = true;

  sendCommand(command);
}


// ==========================================
// STOP MOVEMENT
// ==========================================

function stopMove() {

  if(moving) {

    moving = false;

    sendCommand('/stop');
  }
}


// ==========================================
// SENSOR UPDATE
// ==========================================

function updateSensors() {

  fetch(
    '/status',
    {
      cache: 'no-store'
    }
  )

  .then(response => response.json())

  .then(data => {


    // ======================================
    // MOTION
    // ======================================

    let motion =
    document.getElementById(
      "motion"
    );


    if(data.motion === true) {

      motion.innerHTML =
      "MOTION DETECTED";

      motion.className =
      "status alert";
    }

    else {

      motion.innerHTML =
      "NO MOTION";

      motion.className =
      "status safe";
    }


    // ======================================
    // WATER
    // ======================================

    let water =
    document.getElementById(
      "water"
    );


    if(data.water === true) {

      water.innerHTML =
      "WATER DETECTED";

      water.className =
      "status alert";
    }

    else {

      water.innerHTML =
      "NO WATER";

      water.className =
      "status safe";
    }

  })

  .catch(error => {

    console.log(
      "Dashboard connection error"
    );

  });
}


// Update every 500 ms

setInterval(
  updateSensors,
  500
);


// First update immediately

updateSensors();


// Stop rover if browser loses focus

window.addEventListener(
  "blur",
  function() {

    sendCommand('/stop');

    moving = false;
  }
);


// Stop rover before page closes

window.addEventListener(
  "beforeunload",
  function() {

    sendCommand('/stop');
  }
);

<\/script>


</body>

</html>"""

class AquaNovaRover:
    def __init__(self):
        self.motion_detected = False
        self.water_detected = False
        self.prev_motion = False
        self.prev_water = False

        # Deinit existing PWM
        for p in (L_IN1, L_IN2, R_IN1, R_IN2):
            try:
                PWM(Pin(p)).deinit()
            except Exception:
                pass

        # Motor PWMs
        self.pwm_l1 = PWM(Pin(L_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_l2 = PWM(Pin(L_IN2), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r1 = PWM(Pin(R_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r2 = PWM(Pin(R_IN2), freq=PWM_FREQ, duty_u16=0)

        self.pir = Pin(PIR_PIN, Pin.IN)
        self.water = Pin(WATER_PIN, Pin.IN)

        self.oled = None
        try:
            from ssd1306 import SSD1306_I2C
            i2c = I2C(0, scl=Pin(OLED_SCL), sda=Pin(OLED_SDA), freq=400000)
            self.oled = SSD1306_I2C(128, 64, i2c)
        except Exception:
            self.oled = None

        self.stop_motors()
        self.update_oled()

        # WiFi SoftAP Setup
        self.ap = network.WLAN(network.AP_IF)
        self.ap.active(True)
        self.ap.config(essid="LOF_TITAN_ROVER", password="12345678")
        self.ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '8.8.8.8'))
        time.sleep_ms(200)

        # Web Server Socket
        self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_sock.bind(('0.0.0.0', 80))
        self.server_sock.listen(5)
        self.server_sock.setblocking(False)

        self.poller = select.poll()
        self.poller.register(self.server_sock, select.POLLIN)

    def _pwm_write(self, pwm_pin, val):
        val = max(0, min(255, val))
        pwm_pin.duty_u16(int((val / 255.0) * 65535))

    def leftMotorForward(self):
        self._pwm_write(self.pwm_l1, MOTOR_SPEED)
        self._pwm_write(self.pwm_l2, 0)

    def leftMotorBackward(self):
        self._pwm_write(self.pwm_l1, 0)
        self._pwm_write(self.pwm_l2, MOTOR_SPEED)

    def rightMotorForward(self):
        self._pwm_write(self.pwm_r1, MOTOR_SPEED)
        self._pwm_write(self.pwm_r2, 0)

    def rightMotorBackward(self):
        self._pwm_write(self.pwm_r1, 0)
        self._pwm_write(self.pwm_r2, MOTOR_SPEED)

    def stop_motors(self):
        self._pwm_write(self.pwm_l1, 0)
        self._pwm_write(self.pwm_l2, 0)
        self._pwm_write(self.pwm_r1, 0)
        self._pwm_write(self.pwm_r2, 0)

    def forward(self):
        self.leftMotorForward()
        self.rightMotorForward()
        print("ROVER -> FORWARD")

    def backward(self):
        self.leftMotorBackward()
        self.rightMotorBackward()
        print("ROVER -> BACKWARD")

    def left(self):
        self.leftMotorBackward()
        self.rightMotorForward()
        print("ROVER -> LEFT")

    def right(self):
        self.leftMotorForward()
        self.rightMotorBackward()
        print("ROVER -> RIGHT")

    def update_oled(self):
        if not self.oled: return
        try:
            self.oled.fill(0)
            if self.motion_detected and self.water_detected:
                self.oled.text("Motion Detected!", 0, 20)
                self.oled.text("Water Detected!", 0, 45)
            elif self.motion_detected:
                self.oled.text("ALERT!", 35, 18)
                self.oled.text("Motion Detected!", 0, 43)
            elif self.water_detected:
                self.oled.text("ALERT!", 35, 18)
                self.oled.text("Water Detected!", 0, 43)
            else:
                self.oled.text("SYSTEM SAFE", 20, 25)
                self.oled.text("No Alert", 25, 48)
            self.oled.show()
        except Exception:
            pass

    def check_sensors(self):
        self.motion_detected = (self.pir.value() == 1)
        self.water_detected = (self.water.value() == 1)

        if self.motion_detected != self.prev_motion:
            if self.motion_detected:
                print("ALERT: MOTION DETECTED")
            else:
                print("MOTION: CLEAR")
            self.prev_motion = self.motion_detected

        if self.water_detected != self.prev_water:
            if self.water_detected:
                print("ALERT: WATER DETECTED")
            else:
                print("WATER: CLEAR")
            self.prev_water = self.water_detected

        self.update_oled()

    def handle_client(self):
        events = self.poller.poll(0)
        if not events: return

        for sock, evt in events:
            if evt & select.POLLIN:
                try:
                    client, _ = self.server_sock.accept()
                    client.settimeout(1.0)
                    request = client.recv(1024).decode('utf-8')
                    if not request:
                        client.close()
                        continue

                    req_line = request.split('\r
')[0]
                    parts = req_line.split(' ')
                    if len(parts) < 2:
                        client.close()
                        continue

                    path = parts[1]

                    if path == '/' or path == '/index.html':
                        resp = "HTTP/1.1 200 OK\r
Content-Type: text/html; charset=utf-8\r
Connection: close\r
\r
" + HTML_PAGE
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/status':
                        motion_str = "true" if self.motion_detected else "false"
                        water_str = "true" if self.water_detected else "false"
                        json_data = f'{"motion":{motion_str},"water":{water_str}}'
                        resp = "HTTP/1.1 200 OK\r
Content-Type: application/json\r
Connection: close\r
\r
" + json_data
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/forward':
                        self.forward()
                        resp = "HTTP/1.1 200 OK\r
Content-Type: text/plain\r
Connection: close\r
\r
FORWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/backward':
                        self.backward()
                        resp = "HTTP/1.1 200 OK\r
Content-Type: text/plain\r
Connection: close\r
\r
BACKWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/left':
                        self.left()
                        resp = "HTTP/1.1 200 OK\r
Content-Type: text/plain\r
Connection: close\r
\r
LEFT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/right':
                        self.right()
                        resp = "HTTP/1.1 200 OK\r
Content-Type: text/plain\r
Connection: close\r
\r
RIGHT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/stop':
                        self.stop_motors()
                        resp = "HTTP/1.1 200 OK\r
Content-Type: text/plain\r
Connection: close\r
\r
STOP"
                        client.sendall(resp.encode('utf-8'))

                    else:
                        resp = "HTTP/1.1 404 Not Found\r
Connection: close\r
\r
Not Found"
                        client.sendall(resp.encode('utf-8'))

                    client.close()
                except Exception:
                    try:
                        client.close()
                    except Exception:
                        pass

    def cleanup(self):
        self.stop_motors()
        try:
            self.server_sock.close()
        except Exception:
            pass

def main():
    print("==================================")
    print("      LOF TITAN ALERT ROVER")
    print("      DIRECT ESP32 WI-FI MODE")
    print("==================================")

    hw.play_startup_tone()
    hw.set_leds_connected()

    rover = AquaNovaRover()

    print("==================================")
    print("SYSTEM READY")
    print("CONNECT TO WIFI : LOF_TITAN_ROVER")
    print("PASSWORD        : 12345678")
    print("OPEN BROWSER    : http://192.168.4.1")
    print("==================================")

    last_sensor_check = time.ticks_ms()

    try:
        while True:
            rover.handle_client()

            now = time.ticks_ms()
            if time.ticks_diff(now, last_sensor_check) >= 300:
                last_sensor_check = now
                rover.check_sensors()

            time.sleep_ms(10)
            gc.collect()

    except KeyboardInterrupt:
        print("
Stopping AquaNova Alert Rover...")
    finally:
        rover.cleanup()
        hw.set_leds_disconnected()
        print("Rover stopped safely.")

if __name__ == "__main__":
    main()
`},{id:"axes-3",name:"Axes 3",description:"3-Axis robotic arm controller.",code:`# Axes 3 (Dummy Code)
import time
print("Homing X, Y, Z axes...")
time.sleep(2)
print("Axes homed successfully.")
`}];function lv({isOpen:e,onClose:t,onDisconnectCurrent:n}){const[r,i]=U.useState(!1),[l,s]=U.useState("IDLE"),[o,a]=U.useState(""),[u,c]=U.useState(0),[_,h]=U.useState(!0),[m,v]=U.useState([]),S=U.useRef(null);if(U.useEffect(()=>{S.current&&(S.current.scrollTop=S.current.scrollHeight)},[m]),!e)return null;const E=f=>{f&&v(p=>[...p.slice(-300),f])},d=async()=>{if(!r){i(!0),v([]),c(0),s("FETCHING"),a("Preparing firmware binaries...");try{n&&(E("[FLASHER] Closing active dashboard serial connection..."),await n(),await new Promise(b=>setTimeout(b,400))),E("[FLASHER] Downloading bootloader, partitions, and micropython binaries...");const[f,p,g]=await Promise.all([fetch("/firmware/bootloader.bin"),fetch("/firmware/partitions.bin"),fetch("/firmware/micropython.bin")]);if(!f.ok||!p.ok||!g.ok)throw new Error("Failed to load firmware binary files from server.");const[x,R,y]=await Promise.all([f.arrayBuffer(),p.arrayBuffer(),g.arrayBuffer()]);if(E(`[FLASHER] Loaded: Bootloader (${x.byteLength} B), Partitions (${R.byteLength} B), MicroPython (${y.byteLength} B)`),!("serial"in navigator))throw new Error("Web Serial API is not supported in this browser. Please use Chrome or Edge.");s("CONNECTING"),a("Please select your ESP32-S3 COM Port in the browser dialog..."),E("[FLASHER] Requesting Serial Port from user...");const T=await navigator.serial.requestPort();E("[FLASHER] Port selected. Initializing ROM bootloader transport...");const I=new $a(T,!0),A=new Yh({transport:I,baudrate:460800,terminal:{clean:()=>{},writeLine:b=>E(b),write:b=>E(b)}});E("[FLASHER] Handshaking with ESP32-S3 ROM bootloader..."),await A.main(),E(`[FLASHER] Connected to ${A.chip?A.chip.CHIP_NAME:"ESP32-S3"} successfully!`),_&&(s("ERASING"),a("Erasing flash chip (16MB)..."),c(5),E("[FLASHER] Erasing entire flash memory (please wait ~10s)..."),await A.eraseFlash(),E("[FLASHER] Flash erased successfully.")),s("FLASHING"),a("Writing Firmware Binaries..."),c(15);const O={fileArray:[{data:new Uint8Array(x),address:0},{data:new Uint8Array(R),address:32768},{data:new Uint8Array(y),address:65536}],flashSize:"keep",flashMode:"dio",flashFreq:"80m",eraseAll:!1,compress:!0,reportProgress:(b,F,H)=>{const B=Math.round(F/H*100),j=Math.round((b*100+B)/3);c(Math.min(99,Math.max(15,j))),a(`Flashing ${["bootloader.bin (0x0)","partitions.bin (0x8000)","micropython.bin (0x10000)"][b]||`file ${b+1}`} (${B}%)...`)}};await A.writeFlash(O),s("RESETTING"),a("Resetting device into normal MicroPython mode..."),E("[FLASHER] Flashing finished. Resetting chip via DTR/RTS...");try{await I.setDTR(!1),await I.setRTS(!0),await new Promise(b=>setTimeout(b,150)),await I.setDTR(!1),await I.setRTS(!1)}catch{}await I.disconnect(),E("[FLASHER] ✅ Firmware Flashed and Verified Successfully!"),s("SUCCESS"),a("Firmware flashed successfully! Your LOF TITAN is ready."),c(100)}catch(f){console.error("Flasher error:",f),E(`[ERROR] ${f.message}`),s("ERROR"),a(`Flashing Failed: ${f.message}`)}finally{i(!1)}}};return w.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn",children:w.jsxs("div",{className:"bg-[#111827] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]",children:[w.jsxs("div",{className:"p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-surface/40",children:[w.jsxs("div",{className:"flex items-center gap-3",children:[w.jsx("div",{className:"p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg",children:w.jsx(Po,{size:24})}),w.jsx("div",{children:w.jsxs("h2",{className:"text-xl font-heading font-bold text-white flex items-center gap-2",children:["LOF TITAN Firmware Flasher",w.jsx("span",{className:"text-xs font-mono font-normal bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30",children:"ESP32-S3 N16R8"})]})})]}),w.jsx("button",{disabled:r,onClick:t,className:"p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30",children:w.jsx(tm,{size:20})})]}),w.jsxs("div",{className:"p-6 overflow-y-auto flex-1 flex flex-col gap-6",children:[w.jsxs("div",{className:"bg-surface/60 p-5 rounded-2xl border border-white/10 flex flex-col gap-3",children:[w.jsxs("div",{className:"flex items-center justify-between",children:[w.jsxs("div",{className:"flex items-center gap-2",children:[r?w.jsx(rc,{size:18,className:"text-cyan-400 animate-spin"}):l==="SUCCESS"?w.jsx(nc,{size:18,className:"text-green-400"}):l==="ERROR"?w.jsx(Q_,{size:18,className:"text-red-400"}):w.jsx("div",{className:"h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse"}),w.jsx("span",{className:"text-sm font-semibold text-white",children:o||"Ready to flash firmware bundle."})]}),w.jsxs("span",{className:"text-sm font-bold font-mono text-cyan-400",children:[u,"%"]})]}),w.jsx("div",{className:"w-full bg-black/50 h-3 rounded-full overflow-hidden border border-white/10 p-0.5",children:w.jsx("div",{className:`h-full rounded-full transition-all duration-300 ${l==="ERROR"?"bg-red-500":l==="SUCCESS"?"bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]":"bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_12px_rgba(6,182,212,0.8)]"}`,style:{width:`${u}%`}})})]}),!r&&l!=="SUCCESS"&&w.jsx("div",{className:"flex items-center justify-between px-2",children:w.jsxs("label",{className:"flex items-center gap-2 text-xs text-gray-300 select-none cursor-pointer hover:text-white",children:[w.jsx("input",{type:"checkbox",checked:_,onChange:f=>h(f.target.checked),className:"w-4 h-4 accent-purple-500 rounded cursor-pointer"}),w.jsx("span",{children:"Erase entire flash before writing (Recommended clean install)"})]})}),w.jsxs("div",{className:"flex flex-col gap-2",children:[w.jsxs("div",{className:"text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between",children:[w.jsx("span",{children:"Flasher Log"}),m.length>0&&w.jsxs("span",{className:"font-mono text-[10px] text-gray-500",children:[m.length," lines"]})]}),w.jsx("div",{ref:S,className:"h-48 bg-black/60 font-mono text-xs text-emerald-400 p-3 rounded-xl border border-white/5 overflow-y-auto break-all whitespace-pre-wrap select-text",children:m.length===0?w.jsx("span",{className:"text-gray-600 italic",children:"Logs will appear here once flashing begins..."}):m.join(`
`)})]})]}),w.jsxs("div",{className:"p-5 border-t border-white/10 bg-surface/30 flex items-center justify-between",children:[w.jsx("button",{disabled:r,onClick:t,className:"px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/10 text-gray-300 hover:text-white transition-colors disabled:opacity-30",children:l==="SUCCESS"?"Close Window":"Cancel"}),l==="SUCCESS"?w.jsxs("button",{onClick:t,className:"px-8 py-2.5 rounded-full text-sm font-bold bg-green-500 hover:bg-green-400 text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center gap-2",children:[w.jsx(nc,{size:16}),"Done & Return to Dashboard"]}):w.jsx("button",{disabled:r,onClick:d,className:"px-8 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg hover:shadow-purple-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",children:r?w.jsxs(w.Fragment,{children:[w.jsx(rc,{size:16,className:"animate-spin"}),"Flashing in Progress..."]}):w.jsxs(w.Fragment,{children:[w.jsx(rm,{size:16}),"Connect & Flash Firmware"]})})]})]})})}function sv(){const e=iv(),[t,n]=U.useState(zi[0]),[r,i]=U.useState(zi[0].code),[l,s]=U.useState(!zi[0].lesson),[o,a]=U.useState(!1),[u,c]=U.useState(null),[_,h]=U.useState(!0),m=U.useRef(null);U.useEffect(()=>{_&&m.current&&(m.current.scrollTop=m.current.scrollHeight)},[e.consoleOutput,_]);const v=d=>{n(d),i(d.code),s(!d.lesson)},S=async()=>{c(0);try{await e.uploadProgram("main.py",r,c)}catch(d){console.error(d),alert("Upload failed: "+d.message)}setTimeout(()=>c(null),1e3)},E=async()=>{e.connected&&await e.disconnect(),a(!0)};return w.jsxs("div",{className:"min-h-screen flex flex-col font-sans bg-[#0B0F19] text-white",children:[w.jsxs("nav",{className:"glass-panel mx-4 mt-4 px-6 py-4 flex items-center justify-between rounded-full sticky top-4 z-50",children:[w.jsxs("div",{className:"flex items-center gap-4",children:[w.jsx("img",{src:"/logo.webp",alt:"Lab of Future",className:"h-10 w-auto object-contain"}),w.jsx("h1",{className:"text-xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-white",children:"LOF TITAN Dashboard"})]}),w.jsxs("div",{className:"flex items-center gap-4",children:[w.jsxs("div",{className:"flex flex-col text-right",children:[w.jsx("span",{className:"text-xs text-gray-400 font-medium tracking-wider uppercase",children:e.deviceName||"Device Status"}),w.jsx("span",{className:`text-sm font-bold ${e.status==="CONNECTED_IDLE"?"text-green-400":"text-primary-start"}`,children:e.status})]}),w.jsxs("div",{className:"flex items-center gap-2",children:[w.jsxs("button",{onClick:E,className:"flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-300 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]",title:"Open Dedicated Firmware Flasher",children:[w.jsx(Po,{size:18,className:"text-purple-400"}),w.jsx("span",{children:"Flash Firmware"})]}),e.connected?w.jsx("button",{onClick:e.disconnect,className:"flex items-center gap-2 px-5 py-2 rounded-full font-medium bg-surface border border-white/10 hover:bg-red-500/20 text-red-400 transition-all duration-300",children:"Disconnect"}):w.jsxs(w.Fragment,{children:[w.jsxs("button",{onClick:e.connectSerial,className:"flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-glow text-white",title:"Connect via USB Serial COM Port",children:[w.jsx(J_,{size:18}),"Connect COM Port"]}),w.jsxs("button",{onClick:e.connectBLE,className:"flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-primary-start to-primary-end hover:shadow-glow text-white",title:"Connect via Bluetooth LE",children:[w.jsx(P_,{size:18}),"Connect BLE"]})]})]})]})]}),w.jsxs("main",{className:"flex-1 p-4 grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto w-full",children:[w.jsxs("div",{className:"col-span-12 lg:col-span-8 flex flex-col gap-6",children:[w.jsxs("section",{className:"glass-panel p-6",children:[w.jsxs("div",{className:"flex items-center gap-3 mb-6",children:[w.jsx(Po,{className:"text-primary-start"}),w.jsx("h2",{className:"text-2xl font-heading font-semibold",children:"Project Store"})]}),w.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-4",children:zi.map(d=>w.jsxs("div",{onClick:()=>v(d),className:`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${t.id===d.id?"bg-primary-start/20 border-primary-start shadow-glow":"bg-surface/50 border-white/5 hover:border-white/20"}`,children:[w.jsx("h3",{className:"font-semibold mb-1 text-sm",children:d.name}),w.jsx("p",{className:"text-xs text-gray-400 line-clamp-2",children:d.description})]},d.id))})]}),w.jsxs("section",{className:"glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]",children:[w.jsxs("div",{className:"p-4 border-b border-white/10 flex items-center justify-between bg-surface/30",children:[w.jsxs("div",{className:"flex items-center gap-3",children:[w.jsx(b_,{className:"text-primary-start"}),w.jsxs("h2",{className:"font-heading font-semibold",children:["Code Editor: ",t.name]})]}),w.jsx("div",{className:"flex gap-2",children:w.jsxs("button",{disabled:!e.connected,onClick:S,className:"btn-primary flex items-center gap-2 text-sm px-4",children:[w.jsx(q_,{size:16})," Upload & Run"]})})]}),t!=null&&t.lesson&&!l?w.jsx("div",{className:"flex-1 p-6 overflow-y-auto bg-surface/30 rounded-b-xl flex flex-col gap-6",children:w.jsxs("div",{className:"max-w-4xl mx-auto w-full text-center",children:[w.jsx("h2",{className:"text-3xl font-heading font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-white",children:t.lesson.title||"Mission Guide"}),t.lesson.intro&&w.jsx("p",{className:"text-lg text-gray-300 mb-8 whitespace-pre-line leading-relaxed",children:t.lesson.intro}),Array.isArray(t.lesson.bullets)&&t.lesson.bullets.length>0&&w.jsx("div",{className:"bg-surface/60 p-8 rounded-3xl border border-white/10 mb-8 text-left inline-block shadow-2xl backdrop-blur-md",children:w.jsx("ul",{className:"space-y-4",children:t.lesson.bullets.map((d,f)=>w.jsxs("li",{className:"flex items-center gap-4 text-gray-100 font-medium text-lg",children:[w.jsx("div",{className:"h-3 w-3 rounded-full bg-primary-start shadow-[0_0_10px_rgba(0,229,255,0.8)]"}),d]},f))})}),t.lesson.conclusion&&w.jsx("p",{className:"text-gray-400 italic mb-8 text-lg",children:t.lesson.conclusion}),Array.isArray(t.lesson.images)&&t.lesson.images.length>0&&w.jsx("div",{className:"flex gap-6 overflow-x-auto pb-6 snap-x justify-center scrollbar-hide",children:t.lesson.images.map((d,f)=>w.jsx("img",{src:d,alt:`Lesson ${f}`,className:"h-56 w-auto object-cover rounded-2xl border border-white/10 snap-center shadow-xl hover:scale-105 transition-transform duration-300"},f))}),w.jsx("div",{children:w.jsx("button",{onClick:()=>s(!0),className:"mt-8 px-10 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-primary-start to-primary-end hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] text-white transition-all transform hover:-translate-y-1",children:"Proceed to Mission Code"})})]})}):w.jsxs("div",{className:"flex-1 p-4 flex gap-4",children:[w.jsxs("div",{className:"w-1/2 bg-surface/50 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden group",children:[w.jsx("div",{className:"absolute inset-0 bg-[url('https://developers.google.com/static/blockly/images/sample.png')] bg-cover opacity-20 group-hover:opacity-30 transition-opacity"}),w.jsxs("div",{className:"z-10 text-center",children:[w.jsx("h3",{className:"font-heading text-xl mb-2",children:"Blockly Workspace"}),w.jsx("p",{className:"text-sm text-gray-400",children:"Visual block coding coming soon."})]})]}),w.jsx("textarea",{value:r,onChange:d=>i(d.target.value),className:"w-1/2 bg-[#0d1117] text-[#e6edf3] font-mono p-4 rounded-xl border border-white/5 focus:outline-none focus:border-primary-start/50 resize-none",spellCheck:"false"})]})]})]}),w.jsxs("div",{className:"col-span-12 lg:col-span-4 flex flex-col gap-6 min-h-0",children:[w.jsxs("section",{className:"glass-panel flex flex-col overflow-hidden h-[360px] max-h-[360px] min-h-[360px] shrink-0",children:[w.jsxs("div",{className:"p-4 border-b border-white/10 flex items-center justify-between bg-surface/30 shrink-0",children:[w.jsxs("div",{className:"flex items-center gap-3",children:[w.jsx(V_,{className:"text-primary-start"}),w.jsx("h2",{className:"font-heading font-semibold",children:"Serial Monitor"})]}),w.jsxs("div",{className:"flex items-center gap-2",children:[w.jsxs("label",{className:"flex items-center gap-1.5 text-xs text-gray-300 select-none cursor-pointer hover:text-white mr-1 bg-surface/60 px-2.5 py-1 rounded-full border border-white/10 transition-colors",children:[w.jsx("input",{type:"checkbox",checked:_,onChange:d=>h(d.target.checked),className:"w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer"}),w.jsx("span",{children:"Auto-scroll"})]}),w.jsx("button",{onClick:()=>e.sendCommand("RUN"),className:"btn-icon text-green-400 hover:text-green-300",title:"Run",children:w.jsx(ic,{size:18})}),w.jsx("button",{onClick:()=>e.sendCommand("STOP"),className:"btn-icon text-red-400 hover:text-red-300",title:"Stop",children:w.jsx($_,{size:18})}),w.jsx("button",{onClick:()=>e.sendCommand("RESET"),className:"btn-icon text-yellow-400 hover:text-yellow-300",title:"Reset",children:w.jsx(H_,{size:18})}),w.jsx("button",{onClick:e.clearConsole,className:"btn-icon text-gray-400 hover:text-white",title:"Clear Log",children:w.jsx(Z_,{size:18})})]})]}),w.jsx("div",{ref:m,className:"flex-1 min-h-0 p-4 bg-black/40 font-mono text-sm text-green-400 overflow-y-auto break-all whitespace-pre-wrap select-text",style:{height:"295px",maxHeight:"295px"},children:e.consoleOutput||w.jsx("span",{className:"text-gray-500 italic",children:"Waiting for serial data (COM Port only)..."})})]}),w.jsxs("section",{className:"glass-panel h-[400px] flex flex-col",children:[w.jsxs("div",{className:"p-4 border-b border-white/10 flex items-center justify-between bg-surface/30",children:[w.jsxs("div",{className:"flex items-center gap-3",children:[w.jsx(O_,{className:"text-primary-start"}),w.jsx("h2",{className:"font-heading font-semibold",children:"Local AI Agent"})]}),w.jsx("span",{className:"text-xs bg-primary-start/20 text-primary-start px-2 py-1 rounded-full",children:"Offline Model"})]}),w.jsxs("div",{className:"flex-1 p-4 flex flex-col justify-end gap-4",children:[w.jsx("div",{className:"bg-surface/50 p-3 rounded-2xl rounded-tl-sm border border-white/5 w-10/12",children:w.jsx("p",{className:"text-sm",children:"Hello! I'm your local coding assistant. Select a project and I'll generate MicroPython code for you automatically."})}),w.jsxs("div",{className:"relative mt-2",children:[w.jsx("input",{type:"text",placeholder:"Ask AI to generate code...",className:"w-full bg-surface border border-white/10 rounded-full py-3 px-5 text-sm focus:outline-none focus:border-primary-start transition-colors pr-12"}),w.jsx("button",{className:"absolute right-2 top-1.5 p-1.5 bg-primary-start rounded-full hover:bg-primary-end transition-colors",children:w.jsx(ic,{size:16,fill:"currentColor"})})]})]})]})]})]}),w.jsx(lv,{isOpen:o,onClose:()=>a(!1),onDisconnectCurrent:e.disconnect}),u!==null&&w.jsx("div",{className:"fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm",children:w.jsxs("div",{className:"bg-surface p-8 rounded-2xl border border-white/10 max-w-md w-full text-center shadow-2xl",children:[w.jsx("h2",{className:"text-2xl font-bold mb-6 text-white",children:"Uploading Code to Rover"}),w.jsx("div",{className:"h-3 w-full bg-black rounded-full overflow-hidden mb-3",children:w.jsx("div",{className:"h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.8)]",style:{width:`${u}%`}})}),w.jsxs("p",{className:"text-sm font-mono text-green-400 font-bold",children:[u,"%"]})]})})]})}Fs.createRoot(document.getElementById("root")).render(w.jsx(dp.StrictMode,{children:w.jsx(sv,{})}));export{H1 as R};
