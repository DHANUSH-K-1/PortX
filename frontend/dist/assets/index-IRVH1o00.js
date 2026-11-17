import{r as c,b as kt,P as Et,T as Pt,M as _t,j as e,S as Oe,A as Dt,C as At,U as Ge,d as Xe,e as Ye,f as Le,L as De,E as Ae,g as Fe,h as he,i as Ft,k as Lt,K as Mt,l as lt,m as we,n as ke,o as Ue,I as zt,p as nt,B as Ut,q as it,z as ne,s as Bt,t as It,v as Ot,w as Gt,x as Xt}from"./vendor-C2LHBDPt.js";import{u as st,D as Yt,R as Be,F as Ie,S as Vt,O as Ht,V as at,B as Wt,a as $t,b as qt,c as Jt,A as Zt,N as Ee,C as Qt}from"./vendor-three-fx7qBuLF.js";import{m as Pe}from"./vendor-motion-xVvXI7Vc.js";(function(){const f=document.createElement("link").relList;if(f&&f.supports&&f.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))m(d);new MutationObserver(d=>{for(const h of d)if(h.type==="childList")for(const k of h.addedNodes)k.tagName==="LINK"&&k.rel==="modulepreload"&&m(k)}).observe(document,{childList:!0,subtree:!0});function n(d){const h={};return d.integrity&&(h.integrity=d.integrity),d.referrerPolicy&&(h.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?h.credentials="include":d.crossOrigin==="anonymous"?h.credentials="omit":h.credentials="same-origin",h}function m(d){if(d.ep)return;d.ep=!0;const h=n(d);fetch(d.href,h)}})();const _e=8,Kt=u=>{const f=u.replace("#","").padEnd(6,"0"),n=parseInt(f.slice(0,2),16)/255,m=parseInt(f.slice(2,4),16)/255,d=parseInt(f.slice(4,6),16)/255;return[n,m,d]},er=u=>{const f=(u&&u.length?u:["#FF9FFC","#5227FF"]).slice(0,_e);for(f.length===1&&f.push(f[0]);f.length<_e;)f.push(f[f.length-1]);const n=[];for(let d=0;d<_e;d++)n.push(Kt(f[d]));const m=Math.max(2,Math.min(_e,u?.length??2));return{arr:n,count:m}},tr=({className:u,dpr:f,paused:n=!1,gradientColors:m,angle:d=0,noise:h=.3,blindCount:k=16,blindMinWidth:j=60,mouseDampening:L=.15,mirrorGradient:F=!1,spotlightRadius:V=.5,spotlightSoftness:G=1,spotlightOpacity:M=1,distortAmount:C=0,shineDirection:N="left",mixBlendMode:P="lighten"})=>{const A=c.useRef(null),z=c.useRef(null),S=c.useRef(null),R=c.useRef(null),B=c.useRef(null),T=c.useRef(null),ee=c.useRef([0,0]),r=c.useRef(0),b=c.useRef(!0);return c.useEffect(()=>{const $=A.current;if(!$)return;const U=new kt({dpr:f??(typeof window<"u"&&window.devicePixelRatio||1),alpha:!0,antialias:!0});T.current=U;const Q=U.gl,te=Q.canvas;te.style.width="100%",te.style.height="100%",te.style.display="block",$.appendChild(te);const re=`
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`,se=`
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);

  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv0 = fragCoord.xy / iResolution.xy;

    float aspect = iResolution.x / iResolution.y;
    vec2 p = uv0 * 2.0 - 1.0;
    p.x *= aspect;
    vec2 pr = rotate2D(p, uAngle);
    pr.x /= aspect;
    vec2 uv = pr * 0.5 + 0.5;

    vec2 uvMod = uv;
    if (uDistort > 0.0) {
      float a = uvMod.y * 6.0;
      float b = uvMod.x * 6.0;
      float w = 0.01 * uDistort;
      uvMod.x += sin(a) * w;
      uvMod.y += cos(b) * w;
    }
    float t = uvMod.x;
    if (uMirror > 0.5) {
      t = 1.0 - abs(1.0 - 2.0 * fract(t));
    }
    vec3 base = getGradientColor(t);

    vec2 offset = vec2(iMouse.x/iResolution.x, iMouse.y/iResolution.y);
  float d = length(uv0 - offset);
  float r = max(uSpotlightRadius, 1e-4);
  float dn = d / r;
  float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
  vec3 cir = vec3(spot);
  float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
  if (uShineFlip > 0.5) stripe = 1.0 - stripe;
    vec3 ran = vec3(stripe);

    vec3 col = cir + base - ran;
    col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

    fragColor = vec4(col, 1.0);
}

void main() {
    vec4 color;
    mainImage(color, vUv * iResolution.xy);
    gl_FragColor = color;
}
`,{arr:q,count:W}=er(m),ae={iResolution:{value:[Q.drawingBufferWidth,Q.drawingBufferHeight,1]},iMouse:{value:[0,0]},iTime:{value:0},uAngle:{value:d*Math.PI/180},uNoise:{value:h},uBlindCount:{value:Math.max(1,k)},uSpotlightRadius:{value:V},uSpotlightSoftness:{value:G},uSpotlightOpacity:{value:M},uMirror:{value:F?1:0},uDistort:{value:C},uShineFlip:{value:N==="right"?1:0},uColor0:{value:q[0]},uColor1:{value:q[1]},uColor2:{value:q[2]},uColor3:{value:q[3]},uColor4:{value:q[4]},uColor5:{value:q[5]},uColor6:{value:q[6]},uColor7:{value:q[7]},uColorCount:{value:W}},Z=new Et(Q,{vertex:re,fragment:se,uniforms:ae});S.current=Z;const ge=new Pt(Q);B.current=ge;const pe=new _t(Q,{geometry:ge,program:Z});R.current=pe;const ve=()=>{const I=$.getBoundingClientRect();if(U.setSize(I.width,I.height),ae.iResolution.value=[Q.drawingBufferWidth,Q.drawingBufferHeight,1],j&&j>0){const O=Math.max(1,Math.floor(I.width/j)),J=k?Math.min(k,O):O;ae.uBlindCount.value=Math.max(1,J)}else ae.uBlindCount.value=Math.max(1,k);if(b.current){b.current=!1;const O=Q.drawingBufferWidth/2,J=Q.drawingBufferHeight/2;ae.iMouse.value=[O,J],ee.current=[O,J]}};ve();const de=new ResizeObserver(ve);de.observe($);const be=I=>{const O=te.getBoundingClientRect(),J=U.dpr||1,le=(I.clientX-O.left)*J,_=(O.height-(I.clientY-O.top))*J;ee.current=[le,_],L<=0&&(ae.iMouse.value=[le,_])};window.addEventListener("pointermove",be);const me=I=>{if(z.current=requestAnimationFrame(me),ae.iTime.value=I*.001,L>0){r.current||(r.current=I);const O=(I-r.current)/1e3;r.current=I;const J=Math.max(1e-4,L);let le=1-Math.exp(-O/J);le>1&&(le=1);const _=ee.current,D=ae.iMouse.value;D[0]+=(_[0]-D[0])*le,D[1]+=(_[1]-D[1])*le}else r.current=I;if(!n&&S.current&&R.current)try{U.render({scene:R.current})}catch(O){console.error(O)}};return z.current=requestAnimationFrame(me),()=>{z.current&&cancelAnimationFrame(z.current),window.removeEventListener("pointermove",be),de.disconnect(),te.parentElement===$&&$.removeChild(te);const I=(O,J)=>{O&&typeof O[J]=="function"&&O[J].call(O)};I(S.current,"remove"),I(B.current,"remove"),I(R.current,"remove"),I(T.current,"destroy"),S.current=null,B.current=null,R.current=null,T.current=null}},[f,n,m,d,h,k,j,L,F,V,G,M,C,N]),e.jsx("div",{ref:A,className:`w-full h-full overflow-hidden relative ${u}`,style:{...P&&{mixBlendMode:P}}})};function rr({onLoginClick:u,onRegisterClick:f}){return e.jsxs("div",{className:"min-h-screen bg-black text-white selection:bg-purple-500/30",children:[e.jsxs("nav",{className:"absolute top-0 w-full p-6 flex justify-between items-center z-10",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Oe,{className:"w-6 h-6 text-purple-400"}),e.jsx("span",{className:"font-bold text-xl tracking-tight",children:"PortX"})]}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx("button",{onClick:u,className:"px-6 py-2 rounded-full font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all",children:"Log In"}),e.jsx("button",{onClick:f,className:"px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95",children:"Sign Up"})]})]}),e.jsxs("div",{className:" mx-auto  py-20 flex flex-col items-center justify-center min-h-screen relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"}),e.jsx("div",{className:"absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-700"}),e.jsx("div",{className:"absolute inset-0 z-0 pointer-events-none opacity-40",children:e.jsx(tr,{gradientColors:["#FF9FFC","#5227FF"],angle:1,noise:0,blindCount:36,blindMinWidth:50,spotlightRadius:.5,spotlightSoftness:1,spotlightOpacity:1,mouseDampening:.3,distortAmount:27,shineDirection:"left",mixBlendMode:"lighten"})}),e.jsxs("div",{className:"text-center space-y-8 max-w-4xl relative z-10",children:[e.jsxs("div",{className:"inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-full mb-4 animate-fade-in-up",children:[e.jsx(Oe,{className:"w-4 h-4 text-purple-400"}),e.jsx("span",{className:"text-sm font-medium text-purple-200",children:"AI-Powered Portfolio Builder"})]}),e.jsxs("h1",{className:"text-5xl md:text-7xl font-bold tracking-tight",children:[e.jsx("span",{className:"text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient-x",children:"Build Your Legacy"}),e.jsx("br",{}),e.jsx("span",{className:"text-white mt-2 block",children:"In Minutes"})]}),e.jsx("p",{className:"text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed",children:"Transform your resume into a stunning, professional portfolio website. No coding required. Just upload and shine."}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-6 justify-center mt-12",children:[e.jsxs("button",{onClick:f,className:"group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xl font-bold transition-all transform hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] active:scale-95 flex items-center justify-center gap-2 overflow-hidden",children:[e.jsx("span",{className:"relative z-10",children:"Get Started Free"}),e.jsx(Dt,{className:"w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10"}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"})]}),e.jsxs("button",{onClick:u,className:"group px-8 py-4 bg-white/5 backdrop-blur-sm border border-purple-500/30 rounded-full text-xl font-semibold transition-all hover:bg-white/10 hover:border-purple-500/50 flex items-center justify-center gap-2",children:[e.jsx(At,{className:"w-5 h-5 text-purple-400"}),e.jsx("span",{children:"Member Login"})]})]})]}),e.jsxs("div",{className:"mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full relative z-10",children:[e.jsxs("div",{className:"group p-8 bg-purple-900/10 border border-purple-500/10 rounded-2xl backdrop-blur-sm hover:bg-purple-900/20 hover:border-purple-500/30 transition-all hover:-translate-y-1",children:[e.jsx("div",{className:"w-14 h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors",children:e.jsx(Ge,{className:"w-7 h-7 text-purple-400"})}),e.jsx("h3",{className:"text-xl font-bold mb-3 text-white",children:"Upload Resume"}),e.jsx("p",{className:"text-gray-400 leading-relaxed",children:"Simply upload your PDF or DOCX resume. Our AI extracts your details instantly."})]}),e.jsxs("div",{className:"group p-8 bg-purple-900/10 border border-purple-500/10 rounded-2xl backdrop-blur-sm hover:bg-purple-900/20 hover:border-purple-500/30 transition-all hover:-translate-y-1 delay-100",children:[e.jsx("div",{className:"w-14 h-14 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition-colors",children:e.jsx(Xe,{className:"w-7 h-7 text-pink-400"})}),e.jsx("h3",{className:"text-xl font-bold mb-3 text-white",children:"AI Enhancement"}),e.jsx("p",{className:"text-gray-400 leading-relaxed",children:"Our advanced AI polishes your content and structures it for maximum impact."})]}),e.jsxs("div",{className:"group p-8 bg-purple-900/10 border border-purple-500/10 rounded-2xl backdrop-blur-sm hover:bg-purple-900/20 hover:border-purple-500/30 transition-all hover:-translate-y-1 delay-200",children:[e.jsx("div",{className:"w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors",children:e.jsx(Ye,{className:"w-7 h-7 text-blue-400"})}),e.jsx("h3",{className:"text-xl font-bold mb-3 text-white",children:"Premium Layouts"}),e.jsx("p",{className:"text-gray-400 leading-relaxed",children:"Choose from our collection of stunning, responsive designs tailored for professionals."})]})]})]})]})}function or({onLoginSuccess:u,onSwitchToRegister:f,onForgotPassword:n}){const[m,d]=c.useState(""),[h,k]=c.useState(""),[j,L]=c.useState(!1),[F,V]=c.useState(!1),[G,M]=c.useState(null),C=async N=>{N.preventDefault(),V(!0),M(null);try{const P=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:m,password:h})}),A=await P.json();if(!P.ok)throw new Error(A.error||"Invalid email or password");u(A.user)}catch(P){M(P.message)}finally{V(!1)}};return e.jsx("div",{className:"min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white flex items-center justify-center px-4",children:e.jsxs("div",{className:"w-full max-w-md bg-purple-900/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30",children:[e.jsx("h2",{className:"text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400",children:"Welcome Back"}),G&&e.jsx("div",{className:"mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center animate-shake",children:G}),e.jsxs("form",{onSubmit:C,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Email"}),e.jsxs("div",{className:"relative",children:[e.jsx(Le,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"}),e.jsx("input",{type:"email",value:m,onChange:N=>d(N.target.value),required:!0,className:"w-full pl-10 pr-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 text-white",placeholder:"you@example.com"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(De,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"}),e.jsx("input",{type:j?"text":"password",value:h,onChange:N=>k(N.target.value),required:!0,className:"w-full pl-10 pr-12 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 text-white",placeholder:"••••••••"}),e.jsx("button",{type:"button",onClick:()=>L(!j),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none",children:j?e.jsx(Ae,{className:"w-5 h-5"}):e.jsx(Fe,{className:"w-5 h-5"})})]})]}),e.jsx("div",{className:"flex items-center justify-end",children:e.jsx("button",{type:"button",onClick:()=>n(),className:"text-sm text-purple-400 hover:text-purple-300",children:"Forgot Password?"})}),e.jsx("button",{type:"submit",disabled:F,className:"w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all flex items-center justify-center disabled:opacity-50",children:F?e.jsx(he,{className:"animate-spin w-5 h-5"}):"Log In"})]}),e.jsxs("p",{className:"mt-6 text-center text-gray-400",children:["Don't have an account?"," ",e.jsx("button",{onClick:f,className:"text-purple-400 hover:text-purple-300 underline",children:"Sign Up"})]})]})})}function sr({onLoginSuccess:u,onSwitchToLogin:f}){const[n,m]=c.useState(""),[d,h]=c.useState(""),[k,j]=c.useState(""),[L,F]=c.useState(""),[V,G]=c.useState(!1),[M,C]=c.useState(!1),[N,P]=c.useState(!1),[A,z]=c.useState(null),S=async R=>{if(R.preventDefault(),P(!0),z(null),k!==L){z("Passwords do not match"),P(!1);return}try{const B=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:n,email:d,password:k})}),T=await B.json();if(!B.ok)throw new Error(T.error||"Registration failed");u(T.user)}catch(B){z(B.message)}finally{P(!1)}};return e.jsx("div",{className:"min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white flex items-center justify-center px-4",children:e.jsxs("div",{className:"w-full max-w-md bg-purple-900/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30",children:[e.jsx("h2",{className:"text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400",children:"Create Account"}),A&&e.jsx("div",{className:"mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center animate-shake",children:A}),e.jsxs("form",{onSubmit:S,className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Full Name"}),e.jsxs("div",{className:"relative",children:[e.jsx(Le,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"}),e.jsx("input",{type:"text",value:n,onChange:R=>m(R.target.value),required:!0,className:"w-full pl-10 pr-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 text-white",placeholder:"John Doe"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Email"}),e.jsxs("div",{className:"relative",children:[e.jsx(Ft,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"}),e.jsx("input",{type:"email",value:d,onChange:R=>h(R.target.value),required:!0,className:"w-full pl-10 pr-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 text-white",placeholder:"you@example.com"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(De,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"}),e.jsx("input",{type:V?"text":"password",value:k,onChange:R=>j(R.target.value),required:!0,minLength:6,className:"w-full pl-10 pr-12 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 text-white",placeholder:"••••••••"}),e.jsx("button",{type:"button",onClick:()=>G(!V),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none",children:V?e.jsx(Ae,{className:"w-5 h-5"}):e.jsx(Fe,{className:"w-5 h-5"})})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Confirm Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(De,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"}),e.jsx("input",{type:M?"text":"password",value:L,onChange:R=>F(R.target.value),required:!0,minLength:6,className:"w-full pl-10 pr-12 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 text-white",placeholder:"••••••••"}),e.jsx("button",{type:"button",onClick:()=>C(!M),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none",children:M?e.jsx(Ae,{className:"w-5 h-5"}):e.jsx(Fe,{className:"w-5 h-5"})})]})]}),e.jsx("button",{type:"submit",disabled:N,className:"w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all flex items-center justify-center disabled:opacity-50",children:N?e.jsx(he,{className:"animate-spin w-5 h-5"}):"Sign Up"})]}),e.jsxs("p",{className:"mt-6 text-center text-gray-400",children:["Already have an account?"," ",e.jsx("button",{onClick:f,className:"text-purple-400 hover:text-purple-300 underline",children:"Log In"})]})]})})}function ar({onBackToLogin:u}){const[f,n]=c.useState(1),[m,d]=c.useState(""),[h,k]=c.useState(""),[j,L]=c.useState(""),[F,V]=c.useState(!1),[G,M]=c.useState(!1),[C,N]=c.useState(null),[P,A]=c.useState(null),z=async R=>{R.preventDefault(),M(!0),N(null),A(null);try{const B=await fetch("/api/auth/forgot-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:m})}),T=await B.json();if(!B.ok)throw new Error(T.error||"Failed to request OTP");A(T.message||"OTP sent successfully!"),n(2)}catch(B){N(B.message)}finally{M(!1)}},S=async R=>{R.preventDefault(),M(!0),N(null),A(null);try{const B=await fetch("/api/auth/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:m,otp:h,new_password:j})}),T=await B.json();if(!B.ok)throw new Error(T.error||"Invalid OTP or failed to reset password");A("Password reset successfully! You can now login."),setTimeout(()=>{u()},3e3)}catch(B){N(B.message)}finally{M(!1)}};return e.jsx("div",{className:"min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white flex items-center justify-center px-4",children:e.jsxs("div",{className:"w-full max-w-md bg-purple-900/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30",children:[e.jsxs("button",{onClick:u,className:"mb-6 flex items-center text-sm text-gray-400 hover:text-white transition-colors",children:[e.jsx(Lt,{className:"w-4 h-4 mr-2"})," Back to Login"]}),e.jsx("h2",{className:"text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400",children:"Reset Password"}),C&&e.jsx("div",{className:"mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center animate-shake",children:C}),P&&e.jsx("div",{className:"mb-6 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm text-center",children:P}),f===1?e.jsxs("form",{onSubmit:z,className:"space-y-6",children:[e.jsx("p",{className:"text-sm text-gray-300 text-center mb-4",children:"Enter your email address and we'll send you an OTP to reset your password."}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"Email"}),e.jsxs("div",{className:"relative",children:[e.jsx(Le,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"}),e.jsx("input",{type:"email",value:m,onChange:R=>d(R.target.value),required:!0,className:"w-full pl-10 pr-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 text-white",placeholder:"you@example.com"})]})]}),e.jsx("button",{type:"submit",disabled:G||!m,className:"w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all flex items-center justify-center disabled:opacity-50",children:G?e.jsx(he,{className:"animate-spin w-5 h-5"}):"Send OTP"})]}):e.jsxs("form",{onSubmit:S,className:"space-y-6",children:[e.jsxs("p",{className:"text-sm text-gray-300 text-center mb-4",children:["Enter the 6-digit OTP sent to ",e.jsx("span",{className:"font-semibold text-purple-300",children:m})," and your new password."]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"6-Digit OTP"}),e.jsxs("div",{className:"relative",children:[e.jsx(Mt,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"}),e.jsx("input",{type:"text",maxLength:6,value:h,onChange:R=>k(R.target.value),required:!0,className:"w-full pl-10 pr-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 text-white tracking-widest font-mono text-center",placeholder:"000000"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-300 mb-2",children:"New Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(De,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"}),e.jsx("input",{type:F?"text":"password",value:j,onChange:R=>L(R.target.value),required:!0,minLength:6,className:"w-full pl-10 pr-12 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 text-white",placeholder:"••••••••"}),e.jsx("button",{type:"button",onClick:()=>V(!F),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none",children:F?e.jsx(Ae,{className:"w-5 h-5"}):e.jsx(Fe,{className:"w-5 h-5"})})]})]}),e.jsx("button",{type:"submit",disabled:G||!h||!j,className:"w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition-all flex items-center justify-center disabled:opacity-50",children:G?e.jsx(he,{className:"animate-spin w-5 h-5"}):"Reset Password"})]})]})})}const K=256,lr=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,nr=`
uniform sampler2D positions;
uniform float uTime;
uniform vec3 uMouse;
varying vec2 vUv;

// Curl noise functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 snoiseVec3(vec3 x){
  float s  = snoise(vec3(x));
  float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  vec3 c = vec3(s, s1, s2);
  return c;
}

vec3 curlNoise(vec3 p){
  const float e = .1;
  vec3 dx = vec3(e   , 0.0 , 0.0);
  vec3 dy = vec3(0.0 , e   , 0.0);
  vec3 dz = vec3(0.0 , 0.0 , e  );
  vec3 p_x0 = snoiseVec3(p - dx);
  vec3 p_x1 = snoiseVec3(p + dx);
  vec3 p_y0 = snoiseVec3(p - dy);
  vec3 p_y1 = snoiseVec3(p + dy);
  vec3 p_z0 = snoiseVec3(p - dz);
  vec3 p_z1 = snoiseVec3(p + dz);
  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}

void main() {
  vec3 pos = texture2D(positions, vUv).rgb;
  
  vec3 target = pos;
  
  float len = length(pos);
  if(len > 0.0) {
      vec3 dir = pos / len;
      target = dir * 2.0; 
  }
  
  float distToMouse = length(pos - uMouse);
  float force = smoothstep(1.5, 0.0, distToMouse);
  if(force > 0.0) {
      vec3 repelDir = normalize(pos - uMouse);
      target += repelDir * force * 1.5;
  }
  
  vec3 curl = curlNoise(pos * 0.8 + uTime * 0.2);
  target += curl * 0.5;

  pos = mix(pos, target, 0.05);
  
  gl_FragColor = vec4(pos, 1.0);
}
`,ir=`
uniform sampler2D uPositions;
uniform float uTime;
varying vec3 vColor;
void main() {
  vec3 pos = texture2D(uPositions, position.xy).xyz;
  
  float noise = length(pos) * 0.5;
  vec3 color1 = vec3(0.1, 0.4, 1.0); // Bright Blue
  vec3 color2 = vec3(0.5, 0.2, 1.0); // Purple
  vColor = mix(color1, color2, sin(noise + uTime) * 0.5 + 0.5);
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (30.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`,cr=`
varying vec3 vColor;
void main() {
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;
  
  float alpha = smoothstep(0.5, 0.1, dist);
  gl_FragColor = vec4(vColor, alpha * 0.8);
}
`,ur=u=>{const f=u*u*4,n=new Float32Array(f);for(let m=0;m<u*u;m++){const d=m*4,h=Math.random(),k=Math.random(),j=h*2*Math.PI,L=Math.acos(2*k-1),F=2;n[d]=F*Math.sin(L)*Math.cos(j),n[d+1]=F*Math.sin(L)*Math.sin(j),n[d+2]=F*Math.cos(L),n[d+3]=1}return n};function dr(){const u=st(K,K,{minFilter:Ee,magFilter:Ee,format:Be,type:Ie}),f=st(K,K,{minFilter:Ee,magFilter:Ee,format:Be,type:Ie}),n=c.useRef(u),m=c.useMemo(()=>{const C=ur(K),N=new Yt(C,K,K,Be,Ie);return N.needsUpdate=!0,N},[]),d=c.useRef(null),h=c.useRef(null),k=c.useRef(null),j=c.useMemo(()=>new Vt,[]),L=c.useMemo(()=>new Ht(-1,1,1,-1,-1,1),[]),F=c.useRef(new at(0,0,0)),V=c.useMemo(()=>{const C=new Wt,N=new Float32Array(K*K*3);for(let P=0;P<K;P++)for(let A=0;A<K;A++){const z=(P*K+A)*3;N[z]=A/K,N[z+1]=P/K,N[z+2]=0}return C.setAttribute("position",new $t(N,3)),C},[]),G=c.useRef(!1),M=c.useRef(null);return qt(C=>{k.current&&(F.current.x=C.pointer.x*C.viewport.width/2,F.current.y=C.pointer.y*C.viewport.height/2,F.current.z=0),M.current&&(M.current.rotation.y=C.clock.elapsedTime*.05,M.current.rotation.x=Math.sin(C.clock.elapsedTime*.02)*.1);const N=n.current,P=n.current===u?f:u;d.current&&(G.current?d.current.uniforms.positions.value=N.texture:(d.current.uniforms.positions.value=m,G.current=!0),d.current.uniforms.uTime.value=C.clock.elapsedTime,d.current.uniforms.uMouse.value.lerp(F.current,.1)),C.gl.setRenderTarget(P),C.gl.render(j,L),C.gl.setRenderTarget(null),n.current=P,h.current&&(h.current.uniforms.uPositions.value=P.texture,h.current.uniforms.uTime.value=C.clock.elapsedTime)}),e.jsxs(e.Fragment,{children:[Jt(e.jsxs("mesh",{children:[e.jsx("planeGeometry",{args:[2,2]}),e.jsx("shaderMaterial",{ref:d,vertexShader:lr,fragmentShader:nr,uniforms:{positions:{value:m},uTime:{value:0},uMouse:{value:new at}}})]}),j),e.jsxs("points",{ref:M,children:[e.jsx("bufferGeometry",{attach:"geometry",...V}),e.jsx("shaderMaterial",{ref:h,vertexShader:ir,fragmentShader:cr,uniforms:{uPositions:{value:null},uTime:{value:0}},transparent:!0,depthWrite:!1,blending:Zt})]}),e.jsxs("mesh",{ref:k,visible:!1,children:[e.jsx("planeGeometry",{args:[100,100]}),e.jsx("meshBasicMaterial",{})]})]})}function pr({SIM_RESOLUTION:u=128,DYE_RESOLUTION:f=1440,CAPTURE_RESOLUTION:n=512,DENSITY_DISSIPATION:m=3.5,VELOCITY_DISSIPATION:d=2,PRESSURE:h=.1,PRESSURE_ITERATIONS:k=20,CURL:j=3,SPLAT_RADIUS:L=.2,SPLAT_FORCE:F=6e3,SHADING:V=!0,COLOR_UPDATE_SPEED:G=10,BACK_COLOR:M={r:.5,g:0,b:0},TRANSPARENT:C=!0,RAINBOW_MODE:N=!0,COLOR:P="#ff0000"}){const A=c.useRef(null),z=c.useRef(null);return c.useEffect(()=>{const S=A.current;if(!S)return;let R=!0;function B(){this.id=-1,this.texcoordX=0,this.texcoordY=0,this.prevTexcoordX=0,this.prevTexcoordY=0,this.deltaX=0,this.deltaY=0,this.down=!1,this.moved=!1,this.color=[0,0,0]}let T={SIM_RESOLUTION:u,DYE_RESOLUTION:f,DENSITY_DISSIPATION:m,VELOCITY_DISSIPATION:d,PRESSURE:h,PRESSURE_ITERATIONS:k,CURL:j,SPLAT_RADIUS:L,SPLAT_FORCE:F,SHADING:V,COLOR_UPDATE_SPEED:G,RAINBOW_MODE:N,COLOR:P},ee=[new B];const{gl:r,ext:b}=$(S);b.supportLinearFiltering||(T.DYE_RESOLUTION=256,T.SHADING=!1);function $(t){const o={alpha:!0,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1};let a=t.getContext("webgl2",o);const l=!!a;l||(a=t.getContext("webgl",o)||t.getContext("experimental-webgl",o));let x,y;l?(a.getExtension("EXT_color_buffer_float"),y=a.getExtension("OES_texture_float_linear")):(x=a.getExtension("OES_texture_half_float"),y=a.getExtension("OES_texture_half_float_linear")),a.clearColor(0,0,0,1);const w=l?a.HALF_FLOAT:x&&x.HALF_FLOAT_OES;let H,Y,ue;return l?(H=U(a,a.RGBA16F,a.RGBA,w),Y=U(a,a.RG16F,a.RG,w),ue=U(a,a.R16F,a.RED,w)):(H=U(a,a.RGBA,a.RGBA,w),Y=U(a,a.RGBA,a.RGBA,w),ue=U(a,a.RGBA,a.RGBA,w)),{gl:a,ext:{formatRGBA:H,formatRG:Y,formatR:ue,halfFloatTexType:w,supportLinearFiltering:y}}}function U(t,o,a,l){if(!Q(t,o,a,l))switch(o){case t.R16F:return U(t,t.RG16F,t.RG,l);case t.RG16F:return U(t,t.RGBA16F,t.RGBA,l);default:return null}return{internalFormat:o,format:a}}function Q(t,o,a,l){const x=t.createTexture();t.bindTexture(t.TEXTURE_2D,x),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,o,4,4,0,a,l,null);const y=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,y),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,x,0),t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE}class te{constructor(o,a){this.vertexShader=o,this.fragmentShaderSource=a,this.programs=[],this.activeProgram=null,this.uniforms=[]}setKeywords(o){let a=0;for(let x=0;x<o.length;x++)a+=Ct(o[x]);let l=this.programs[a];if(l==null){let x=W(r.FRAGMENT_SHADER,this.fragmentShaderSource,o);l=se(this.vertexShader,x),this.programs[a]=l}l!==this.activeProgram&&(this.uniforms=q(l),this.activeProgram=l)}bind(){r.useProgram(this.activeProgram)}}class re{constructor(o,a){this.uniforms={},this.program=se(o,a),this.uniforms=q(this.program)}bind(){r.useProgram(this.program)}}function se(t,o){let a=r.createProgram();return r.attachShader(a,t),r.attachShader(a,o),r.linkProgram(a),r.getProgramParameter(a,r.LINK_STATUS)||console.trace(r.getProgramInfoLog(a)),a}function q(t){let o=[],a=r.getProgramParameter(t,r.ACTIVE_UNIFORMS);for(let l=0;l<a;l++){let x=r.getActiveUniform(t,l).name;o[x]=r.getUniformLocation(t,x)}return o}function W(t,o,a){o=ae(o,a);const l=r.createShader(t);return r.shaderSource(l,o),r.compileShader(l),r.getShaderParameter(l,r.COMPILE_STATUS)||console.trace(r.getShaderInfoLog(l)),l}function ae(t,o){if(!o)return t;let a="";return o.forEach(l=>{a+="#define "+l+`
`}),a+t}const Z=W(r.VERTEX_SHADER,`
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `),ge=W(r.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `),pe=W(r.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
      `),ve=`
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uTexture;
      uniform sampler2D uDithering;
      uniform vec2 ditherScale;
      uniform vec2 texelSize;

      vec3 linearToGamma (vec3 color) {
          color = max(color, vec3(0));
          return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
      }

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          #ifdef SHADING
              vec3 lc = texture2D(uTexture, vL).rgb;
              vec3 rc = texture2D(uTexture, vR).rgb;
              vec3 tc = texture2D(uTexture, vT).rgb;
              vec3 bc = texture2D(uTexture, vB).rgb;

              float dx = length(rc) - length(lc);
              float dy = length(tc) - length(bc);

              vec3 n = normalize(vec3(dx, dy, length(texelSize)));
              vec3 l = vec3(0.0, 0.0, 1.0);

              float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
              c *= diffuse;
          #endif

          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
      }
    `,de=W(r.FRAGMENT_SHADER,`
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `),be=W(r.FRAGMENT_SHADER,`
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);

            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
            #ifdef MANUAL_FILTERING
                vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                vec4 result = bilerp(uSource, coord, dyeTexelSize);
            #else
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
            #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }
      `,b.supportLinearFiltering?null:["MANUAL_FILTERING"]),me=W(r.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;

            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }

            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `),I=W(r.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `),O=W(r.FRAGMENT_SHADER,`
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;

            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `),J=W(r.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `),le=W(r.FRAGMENT_SHADER,`
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `),_=(r.bindBuffer(r.ARRAY_BUFFER,r.createBuffer()),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),r.STATIC_DRAW),r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,r.createBuffer()),r.bufferData(r.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),r.STATIC_DRAW),r.vertexAttribPointer(0,2,r.FLOAT,!1,0,0),r.enableVertexAttribArray(0),(t,o=!1)=>{t==null?(r.viewport(0,0,r.drawingBufferWidth,r.drawingBufferHeight),r.bindFramebuffer(r.FRAMEBUFFER,null)):(r.viewport(0,0,t.width,t.height),r.bindFramebuffer(r.FRAMEBUFFER,t.fbo)),o&&(r.clearColor(0,0,0,1),r.clear(r.COLOR_BUFFER_BIT)),r.drawElements(r.TRIANGLES,6,r.UNSIGNED_SHORT,0)});let D,v,xe,je,s;const i=new re(Z,ge),p=new re(Z,pe),g=new re(Z,de),E=new re(Z,be),X=new re(Z,me),oe=new re(Z,I),ie=new re(Z,O),Ne=new re(Z,J),Se=new re(Z,le),Re=new te(Z,ve);function Ve(){let t=Ze(T.SIM_RESOLUTION),o=Ze(T.DYE_RESOLUTION);const a=b.halfFloatTexType,l=b.formatRGBA,x=b.formatRG,y=b.formatR,w=b.supportLinearFiltering?r.LINEAR:r.NEAREST;r.disable(r.BLEND),D?D=He(D,o.width,o.height,l.internalFormat,l.format,a,w):D=Me(o.width,o.height,l.internalFormat,l.format,a,w),v?v=He(v,t.width,t.height,x.internalFormat,x.format,a,w):v=Me(t.width,t.height,x.internalFormat,x.format,a,w),xe=ye(t.width,t.height,y.internalFormat,y.format,a,r.NEAREST),je=ye(t.width,t.height,y.internalFormat,y.format,a,r.NEAREST),s=Me(t.width,t.height,y.internalFormat,y.format,a,r.NEAREST)}function ye(t,o,a,l,x,y){r.activeTexture(r.TEXTURE0);let w=r.createTexture();r.bindTexture(r.TEXTURE_2D,w),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,y),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,y),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.texImage2D(r.TEXTURE_2D,0,a,t,o,0,l,x,null);let H=r.createFramebuffer();r.bindFramebuffer(r.FRAMEBUFFER,H),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,w,0),r.viewport(0,0,t,o),r.clear(r.COLOR_BUFFER_BIT);let Y=1/t,ue=1/o;return{texture:w,fbo:H,width:t,height:o,texelSizeX:Y,texelSizeY:ue,attach(fe){return r.activeTexture(r.TEXTURE0+fe),r.bindTexture(r.TEXTURE_2D,w),fe}}}function Me(t,o,a,l,x,y){let w=ye(t,o,a,l,x,y),H=ye(t,o,a,l,x,y);return{width:t,height:o,texelSizeX:w.texelSizeX,texelSizeY:w.texelSizeY,get read(){return w},set read(Y){w=Y},get write(){return H},set write(Y){H=Y},swap(){let Y=w;w=H,H=Y}}}function ct(t,o,a,l,x,y,w){let H=ye(o,a,l,x,y,w);return i.bind(),r.uniform1i(i.uniforms.uTexture,t.attach(0)),_(H),H}function He(t,o,a,l,x,y,w){return t.width===o&&t.height===a||(t.read=ct(t.read,o,a,l,x,y,w),t.write=ye(o,a,l,x,y,w),t.width=o,t.height=a,t.texelSizeX=1/o,t.texelSizeY=1/a),t}function ut(){let t=[];T.SHADING&&t.push("SHADING"),Re.setKeywords(t)}ut(),Ve();let We=Date.now(),Te=0;function $e(){if(!R)return;const t=dt();pt()&&Ve(),mt(t),xt(),ft(t),ht(null),z.current=requestAnimationFrame($e)}function dt(){let t=Date.now(),o=(t-We)/1e3;return o=Math.min(o,.016666),We=t,o}function pt(){let t=ce(S.clientWidth),o=ce(S.clientHeight);return S.width!==t||S.height!==o?(S.width=t,S.height=o,!0):!1}function mt(t){Te+=t*T.COLOR_UPDATE_SPEED,Te>=1&&(Te=Tt(Te,0,1),ee.forEach(o=>{o.color=Ce()}))}function xt(){ee.forEach(t=>{t.moved&&(t.moved=!1,vt(t))})}function ft(t){r.disable(r.BLEND),oe.bind(),r.uniform2f(oe.uniforms.texelSize,v.texelSizeX,v.texelSizeY),r.uniform1i(oe.uniforms.uVelocity,v.read.attach(0)),_(je),ie.bind(),r.uniform2f(ie.uniforms.texelSize,v.texelSizeX,v.texelSizeY),r.uniform1i(ie.uniforms.uVelocity,v.read.attach(0)),r.uniform1i(ie.uniforms.uCurl,je.attach(1)),r.uniform1f(ie.uniforms.curl,T.CURL),r.uniform1f(ie.uniforms.dt,t),_(v.write),v.swap(),X.bind(),r.uniform2f(X.uniforms.texelSize,v.texelSizeX,v.texelSizeY),r.uniform1i(X.uniforms.uVelocity,v.read.attach(0)),_(xe),p.bind(),r.uniform1i(p.uniforms.uTexture,s.read.attach(0)),r.uniform1f(p.uniforms.value,T.PRESSURE),_(s.write),s.swap(),Ne.bind(),r.uniform2f(Ne.uniforms.texelSize,v.texelSizeX,v.texelSizeY),r.uniform1i(Ne.uniforms.uDivergence,xe.attach(0));for(let a=0;a<T.PRESSURE_ITERATIONS;a++)r.uniform1i(Ne.uniforms.uPressure,s.read.attach(1)),_(s.write),s.swap();Se.bind(),r.uniform2f(Se.uniforms.texelSize,v.texelSizeX,v.texelSizeY),r.uniform1i(Se.uniforms.uPressure,s.read.attach(0)),r.uniform1i(Se.uniforms.uVelocity,v.read.attach(1)),_(v.write),v.swap(),E.bind(),r.uniform2f(E.uniforms.texelSize,v.texelSizeX,v.texelSizeY),b.supportLinearFiltering||r.uniform2f(E.uniforms.dyeTexelSize,v.texelSizeX,v.texelSizeY);let o=v.read.attach(0);r.uniform1i(E.uniforms.uVelocity,o),r.uniform1i(E.uniforms.uSource,o),r.uniform1f(E.uniforms.dt,t),r.uniform1f(E.uniforms.dissipation,T.VELOCITY_DISSIPATION),_(v.write),v.swap(),b.supportLinearFiltering||r.uniform2f(E.uniforms.dyeTexelSize,D.texelSizeX,D.texelSizeY),r.uniform1i(E.uniforms.uVelocity,v.read.attach(0)),r.uniform1i(E.uniforms.uSource,D.read.attach(1)),r.uniform1f(E.uniforms.dissipation,T.DENSITY_DISSIPATION),_(D.write),D.swap()}function ht(t){r.blendFunc(r.ONE,r.ONE_MINUS_SRC_ALPHA),r.enable(r.BLEND),gt(t)}function gt(t){let o=r.drawingBufferWidth,a=r.drawingBufferHeight;Re.bind(),T.SHADING&&r.uniform2f(Re.uniforms.texelSize,1/o,1/a),r.uniform1i(Re.uniforms.uTexture,D.read.attach(0)),_(t)}function vt(t){let o=t.deltaX*T.SPLAT_FORCE,a=t.deltaY*T.SPLAT_FORCE;qe(t.texcoordX,t.texcoordY,o,a,t.color)}function bt(t){const o=Ce();o.r*=10,o.g*=10,o.b*=10;let a=10*(Math.random()-.5),l=30*(Math.random()-.5);qe(t.texcoordX,t.texcoordY,a,l,o)}function qe(t,o,a,l,x){g.bind(),r.uniform1i(g.uniforms.uTarget,v.read.attach(0)),r.uniform1f(g.uniforms.aspectRatio,S.width/S.height),r.uniform2f(g.uniforms.point,t,o),r.uniform3f(g.uniforms.color,a,l,0),r.uniform1f(g.uniforms.radius,yt(T.SPLAT_RADIUS/100)),_(v.write),v.swap(),r.uniform1i(g.uniforms.uTarget,D.read.attach(0)),r.uniform3f(g.uniforms.color,x.r,x.g,x.b),_(D.write),D.swap()}function yt(t){let o=S.width/S.height;return o>1&&(t*=o),t}function Je(t,o,a,l){t.id=o,t.down=!0,t.moved=!1,t.texcoordX=a/S.width,t.texcoordY=1-l/S.height,t.prevTexcoordX=t.texcoordX,t.prevTexcoordY=t.texcoordY,t.deltaX=0,t.deltaY=0,t.color=Ce()}function ze(t,o,a,l){t.prevTexcoordX=t.texcoordX,t.prevTexcoordY=t.texcoordY,t.texcoordX=o/S.width,t.texcoordY=1-a/S.height,t.deltaX=jt(t.texcoordX-t.prevTexcoordX),t.deltaY=Nt(t.texcoordY-t.prevTexcoordY),t.moved=Math.abs(t.deltaX)>0||Math.abs(t.deltaY)>0,t.color=l}function wt(t){t.down=!1}function jt(t){let o=S.width/S.height;return o<1&&(t*=o),t}function Nt(t){let o=S.width/S.height;return o>1&&(t/=o),t}function St(t){let o=t.replace("#","");o.length===3&&(o=o[0]+o[0]+o[1]+o[1]+o[2]+o[2]);const a=parseInt(o.slice(0,2),16)/255,l=parseInt(o.slice(2,4),16)/255,x=parseInt(o.slice(4,6),16)/255;return{r:a*.15,g:l*.15,b:x*.15}}function Ce(){if(!T.RAINBOW_MODE)return St(T.COLOR);let t=.7+Math.random()*.25,o=Rt(t,1,1);return o.r*=.15,o.g*=.15,o.b*=.15,o}function Rt(t,o,a){let l,x,y,w,H,Y,ue,fe;switch(w=Math.floor(t*6),H=t*6-w,Y=a*(1-o),ue=a*(1-H*o),fe=a*(1-(1-H)*o),w%6){case 0:l=a,x=fe,y=Y;break;case 1:l=ue,x=a,y=Y;break;case 2:l=Y,x=a,y=fe;break;case 3:l=Y,x=ue,y=a;break;case 4:l=fe,x=Y,y=a;break;case 5:l=a,x=Y,y=ue;break}return{r:l,g:x,b:y}}function Tt(t,o,a){const l=a-o;return(t-o)%l+o}function Ze(t){let o=r.drawingBufferWidth/r.drawingBufferHeight;o<1&&(o=1/o);const a=Math.round(t),l=Math.round(t*o);return r.drawingBufferWidth>r.drawingBufferHeight?{width:l,height:a}:{width:a,height:l}}function ce(t){const o=window.devicePixelRatio||1;return Math.floor(t*o)}function Ct(t){if(t.length===0)return 0;let o=0;for(let a=0;a<t.length;a++)o=(o<<5)-o+t.charCodeAt(a),o|=0;return o}function Qe(t){let o=ee[0],a=ce(t.clientX),l=ce(t.clientY);Je(o,-1,a,l),bt(o)}let Ke=!1;function et(t){let o=ee[0],a=ce(t.clientX),l=ce(t.clientY);if(Ke)ze(o,a,l,o.color);else{let x=Ce();ze(o,a,l,x),Ke=!0}}function tt(t){const o=t.targetTouches;let a=ee[0];for(let l=0;l<o.length;l++){let x=ce(o[l].clientX),y=ce(o[l].clientY);Je(a,o[l].identifier,x,y)}}function rt(t){const o=t.targetTouches;let a=ee[0];for(let l=0;l<o.length;l++){let x=ce(o[l].clientX),y=ce(o[l].clientY);ze(a,x,y,a.color)}}function ot(t){const o=t.changedTouches;let a=ee[0];for(let l=0;l<o.length;l++)wt(a)}return window.addEventListener("mousedown",Qe),window.addEventListener("mousemove",et),window.addEventListener("touchstart",tt),window.addEventListener("touchmove",rt,!1),window.addEventListener("touchend",ot),$e(),()=>{R=!1,z.current&&(cancelAnimationFrame(z.current),z.current=null),window.removeEventListener("mousedown",Qe),window.removeEventListener("mousemove",et),window.removeEventListener("touchstart",tt),window.removeEventListener("touchmove",rt),window.removeEventListener("touchend",ot)}},[]),e.jsx("div",{style:{position:"fixed",top:0,left:0,zIndex:50,pointerEvents:"none",width:"100%",height:"100%"},children:e.jsx("canvas",{ref:A,id:"fluid",style:{width:"100vw",height:"100vh",display:"block"}})})}function mr(){return e.jsxs("div",{className:"fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden",children:[e.jsx(pr,{SIM_RESOLUTION:128,DYE_RESOLUTION:768,DENSITY_DISSIPATION:2.5,VELOCITY_DISSIPATION:1,PRESSURE:.1,CURL:3,SPLAT_RADIUS:.2,SPLAT_FORCE:6e3,COLOR_UPDATE_SPEED:10}),e.jsx("div",{className:"absolute inset-0 z-0",children:e.jsx(Qt,{camera:{position:[0,0,6],fov:60},gl:{alpha:!0},children:e.jsx(dr,{})})}),e.jsxs("div",{className:"z-10 text-center pointer-events-none mt-[40vh]",children:[e.jsx("h2",{className:"text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent mb-4 tracking-wider animate-pulse",children:"Parsing Resume"}),e.jsxs("p",{className:"text-gray-300 text-lg flex items-center justify-center gap-3",children:[e.jsxs("span",{className:"relative flex h-3 w-3",children:[e.jsx("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"}),e.jsx("span",{className:"relative inline-flex rounded-full h-3 w-3 bg-purple-500"})]}),"Extracting and structuring your professional journey..."]})]})]})}const xr=({data:u,layout:f})=>e.jsxs("div",{"data-layout":f,className:"p-8 bg-gray-800/50 text-white rounded-lg shadow-lg backdrop-blur-sm border border-purple-500/30",children:[e.jsxs("header",{className:"flex flex-col items-center mb-8",children:[u.profile_photo&&e.jsx("img",{src:u.profile_photo,alt:u.name,className:"w-24 h-24 rounded-full object-cover mb-4 border-2 border-purple-400 shadow-lg"}),e.jsx("h1",{className:"text-4xl font-bold text-purple-300",children:u.name||"Your Name"}),e.jsxs("p",{className:"text-lg text-gray-300",children:[u.email||"your.email@example.com"," | ",u.mobile||"Your Phone"]})]}),u.portfolio_summary&&e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-4",children:"Summary"}),e.jsx("p",{className:"text-gray-300",children:u.portfolio_summary})]}),Array.isArray(u.skills)&&u.skills.length>0&&e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-4",children:"Skills"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:u.skills.map((n,m)=>e.jsx("span",{className:"bg-purple-600/50 text-white px-3 py-1 rounded-full text-sm",children:typeof n=="string"?n:n.name||"Skill"},m))})]}),Array.isArray(u.experience)&&u.experience.length>0&&e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-4",children:"Experience"}),u.experience.map((n,m)=>e.jsxs("div",{className:"mb-4 bg-black/20 p-4 rounded-lg",children:[e.jsxs("h3",{className:"text-xl font-bold text-purple-300",children:[n.title," at ",n.company]}),n.dates&&e.jsx("p",{className:"text-sm text-gray-400",children:n.dates}),n.description&&e.jsx("p",{className:"text-gray-300 mt-2",children:n.description})]},m))]}),Array.isArray(u.projects)&&u.projects.length>0&&e.jsxs("section",{className:"mb-8",children:[e.jsx("h2",{className:"text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-4",children:"Projects"}),u.projects.map((n,m)=>e.jsxs("div",{className:"mb-4 bg-black/20 p-4 rounded-lg",children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsx("h3",{className:"text-xl font-bold text-purple-300",children:n.name}),n.link&&e.jsx("a",{href:n.link,target:"_blank",rel:"noopener noreferrer",className:"text-purple-400 hover:text-purple-300 transition-colors",children:e.jsx("span",{className:"text-xs",children:"Go to link ↗"})})]}),n.description&&e.jsx("p",{className:"text-gray-300 mt-2",children:n.description}),n.tech&&e.jsx("div",{className:"flex flex-wrap gap-2 mt-2",children:(Array.isArray(n.tech)?n.tech:n.tech.split(",")).map((d,h)=>e.jsx("span",{className:"text-xs bg-purple-900/40 text-purple-200 px-2 py-0.5 rounded border border-purple-500/20",children:typeof d=="string"?d.trim():d},h))})]},m))]}),Array.isArray(u.education)&&u.education.length>0&&e.jsxs("section",{children:[e.jsx("h2",{className:"text-2xl font-semibold border-b-2 border-purple-500/50 pb-2 mb-4",children:"Education"}),u.education.map((n,m)=>e.jsxs("div",{className:"mb-4",children:[e.jsx("h3",{className:"text-xl font-bold",children:n.name}),(n.institution||n.dates)&&e.jsxs("p",{className:"text-sm text-gray-400",children:[n.institution," | ",n.dates]})]},m))]})]}),fr=()=>e.jsxs("div",{className:"bg-purple-900/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden animate-pulse",children:[e.jsxs("div",{className:"h-40 bg-gradient-to-br from-purple-900/30 to-black/50 p-6 flex flex-col justify-end",children:[e.jsx("div",{className:"h-5 w-24 bg-purple-500/20 rounded-full mb-3"}),e.jsx("div",{className:"h-6 w-48 bg-white/10 rounded-md"})]}),e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"space-y-2 mb-6",children:[e.jsx("div",{className:"h-4 w-full bg-white/5 rounded-md"}),e.jsx("div",{className:"h-4 w-5/6 bg-white/5 rounded-md"}),e.jsx("div",{className:"h-4 w-4/6 bg-white/5 rounded-md"})]}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx("div",{className:"flex-1 h-9 bg-purple-600/10 rounded-lg"}),e.jsx("div",{className:"w-16 h-9 bg-white/5 rounded-lg"}),e.jsx("div",{className:"w-9 h-9 bg-red-500/10 rounded-lg"})]})]})]}),hr=u=>{switch(u){case"developer":case"terminal":case"cyberpunk":return e.jsx(it,{className:"w-10 h-10 text-purple-400 opacity-20 absolute top-4 right-4"});case"creative":case"designer":case"glass":return e.jsx(It,{className:"w-10 h-10 text-pink-400 opacity-20 absolute top-4 right-4"});case"photographer":case"nature":return e.jsx(nt,{className:"w-10 h-10 text-purple-300 opacity-20 absolute top-4 right-4"});default:return e.jsx(Bt,{className:"w-10 h-10 text-purple-400 opacity-20 absolute top-4 right-4"})}};function gr(){const[u,f]=c.useState("dashboard"),[n,m]=c.useState(null),[d,h]=c.useState(""),[k,j]=c.useState(""),[L,F]=c.useState(!1),[V,G]=c.useState(!1),[M,C]=c.useState([]),[N,P]=c.useState(!1),[A,z]=c.useState(null),[S,R]=c.useState(null),B=()=>{try{const s=new(window.AudioContext||window.webkitAudioContext),i=s.sampleRate*.2,p=s.createBuffer(1,i,s.sampleRate),g=p.getChannelData(0);for(let ie=0;ie<i;ie++)g[ie]=Math.random()*2-1;const E=s.createBufferSource();E.buffer=p;const X=s.createBiquadFilter();X.type="highpass",X.frequency.value=1200;const oe=s.createGain();oe.gain.setValueAtTime(.6,s.currentTime),oe.gain.exponentialRampToValueAtTime(.01,s.currentTime+.15),E.connect(X),X.connect(oe),oe.connect(s.destination),E.start()}catch(s){console.warn("AudioContext not supported",s)}},T=async()=>{if(!A)return;const{id:s}=A;R(s),z(null),B(),await new Promise(i=>setTimeout(i,800));try{(await fetch(`/api/portfolio/${s}.json/delete`,{method:"DELETE"})).ok?(C(p=>p.filter(g=>g.id!==s)),ne.success("Portfolio deleted successfully")):ne.error("Failed to delete portfolio")}catch{ne.error("Error deleting portfolio")}finally{R(null)}};lt.useEffect(()=>{u==="dashboard"&&ee()},[u]);const ee=async()=>{P(!0);try{const s=await fetch("/api/portfolios");if(s.ok){const i=await s.json();C(i.portfolios||[])}}catch(s){console.error("Failed to fetch portfolios",s)}finally{P(!1)}},r=async(s,i)=>{h(`${s}.json`);try{const p=await fetch(`/api/portfolio/${s}.json`);if(p.ok){const g=await p.json();$(g),f("edit")}else ne.error("Failed to load portfolio data")}catch{ne.error("Error loading portfolio")}},[b,$]=c.useState({name:"",email:"",mobile:"",profile_photo:"",portfolio_summary:"",experience:[],education:[],skills:[],projects:[]}),[U,Q]=c.useState(""),[te,re]=c.useState(!1),[se,q]=c.useState(1),[W,ae]=c.useState(!1),Z=[{id:"developer",name:"Software Engineer",category:"Developer"},{id:"terminal",name:"Hacker Terminal",category:"Developer"},{id:"cyberpunk",name:"Cyberpunk",category:"Developer"},{id:"dark",name:"Dark Mode",category:"Developer"},{id:"modern",name:"Modern",category:"Developer"},{id:"3d",name:"3D Interactive",category:"Developer"},{id:"space",name:"Galaxy",category:"Developer"},{id:"creative",name:"Creative Agency",category:"Creative"},{id:"designer",name:"UI/UX Designer",category:"Creative"},{id:"glass",name:"Glassmorphism",category:"Creative"},{id:"glass2",name:"Glassmorphism 2.0",category:"Creative"},{id:"playful",name:"Playful UI",category:"Creative"},{id:"brand",name:"Brand Story",category:"Creative"},{id:"story_v2",name:"Visual Storyteller",category:"Creative"},{id:"professional",name:"Corporate Executive",category:"Professional"},{id:"resume",name:"Digital Resume",category:"Professional"},{id:"cards",name:"Bento Grid",category:"Professional"},{id:"minimal",name:"Ultra Minimal",category:"Professional"},{id:"impact",name:"High Impact",category:"Professional"},{id:"dashboard",name:"Dashboard Portfolio",category:"Professional"},{id:"portfolio",name:"Portfolio Standard",category:"Professional"},{id:"portfolio_1",name:"Portfolio Template 1",category:"Professional"},{id:"portfolio_2",name:"Portfolio Template 2",category:"Professional"},{id:"portfolio_standalone",name:"Portfolio Standalone",category:"Professional"},{id:"photographer",name:"Lens Master",category:"Media"},{id:"magazine",name:"Editorial",category:"Media"},{id:"nature",name:"Organic",category:"Media"},{id:"neon",name:"Neon Lights",category:"Media"}],ge=["All","Developer","Creative","Professional","Media"],[pe,ve]=c.useState("All"),[de,be]=c.useState(""),me=Z.filter(s=>{const i=pe==="All"||s.category===pe,p=s.name.toLowerCase().includes(de.toLowerCase())||s.category.toLowerCase().includes(de.toLowerCase());return i&&p}),I=te?me:me.slice(0,4),O=s=>{const i=s.target.files?.[0];i&&m(i)},J=async s=>{const i=s.target.files?.[0];if(i){G(!0);try{const p=new FormData;p.append("photo",i);const g=await fetch("/api/upload-photo",{method:"POST",body:p});if(!g.ok){const X=await g.json();ne.error(X.error||"Photo upload failed");return}const E=await g.json();_("profile_photo",E.url)}catch{ne.error("Photo upload error. Please try again.")}finally{G(!1),s.target.value=""}}},le=async()=>{if(!n)return;F(!0);const s=new FormData;s.append("resume",n);try{const i=await fetch("/api/process-resume",{method:"POST",body:s});if(!i.ok){const g=await i.text();try{const E=JSON.parse(g);throw new Error(E.error||E.message||"Failed to process resume.")}catch{throw new Error(`Server returned a non - JSON error(status ${i.status}): 
${g} `)}}const p=await i.json();$(p.data),h(p.filename),f("edit")}catch(i){console.error("Error uploading file:",i),ne.error(i.message)}finally{F(!1)}},_=(s,i)=>{$(p=>({...p,[s]:i}))},D=(s,i,p,g)=>{$(E=>({...E,[s]:E[s].map((X,oe)=>oe===i?{...X,[p]:g}:X)}))},v=s=>{const i=s==="experience"?{title:"",company:"",dates:"",description:""}:s==="education"?{name:"",institution:"",dates:""}:{name:"",description:"",tech:"",link:""};$(p=>({...p,[s]:[...p[s],i]}))},xe=(s,i)=>{$(p=>({...p,[s]:p[s].filter((g,E)=>E!==i)}))},je=async()=>{if(!U){ne.error("Please select a layout");return}if(!d){ne.error("Something went wrong, no filename to save to.");return}try{const s=await fetch(`/api/portfolio/${d}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)});if(!s.ok){const g=await s.json();throw new Error(g.error||"Failed to save portfolio.")}const i=await fetch(`/api/generate-html/${d}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({layout:U})});if(!i.ok){const g=await i.json();throw new Error(g.error||"Failed to generate HTML file.")}const p=await i.json();j(p.generated_file),f("preview")}catch(s){console.error("Error in final step:",s),ne.error(s.message)}};if(u==="dashboard")return e.jsx(Pe.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5,ease:"easeOut"},className:"min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white p-8",children:e.jsxs("div",{className:"container mx-auto max-w-6xl",children:[e.jsxs("div",{className:"flex justify-between items-center mb-12",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2",children:"My Portfolios"}),e.jsx("p",{className:"text-gray-400",children:"Manage and edit your generated portfolios"})]}),e.jsxs("button",{onClick:()=>f("upload"),className:"px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20",children:[e.jsx("div",{className:"w-5 h-5 border-2 border-white rounded-full flex items-center justify-center text-xs",children:"+"}),"Create New"]})]}),N?e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:[1,2,3].map(s=>e.jsx(fr,{},s))}):e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:[e.jsxs("div",{onClick:()=>f("upload"),className:"group cursor-pointer bg-white/5 border-2 border-dashed border-purple-500/30 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[250px] hover:border-purple-400 hover:bg-white/10 transition-all",children:[e.jsx("div",{className:"w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors",children:e.jsx(Ge,{className:"w-8 h-8 text-purple-400"})}),e.jsx("h3",{className:"text-xl font-semibold text-gray-200",children:"Create New"}),e.jsx("p",{className:"text-sm text-gray-500 mt-2",children:"Upload a resume to start"})]}),M.map(s=>e.jsxs("div",{className:`group bg-purple-900/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] ${S===s.id?"sand-wash-out":""}`,children:[e.jsxs("div",{className:"relative h-40 bg-gradient-to-br from-purple-900/50 to-black p-6 flex flex-col justify-end overflow-hidden",children:[hr(s.preview_data.layout),e.jsx("span",{className:"inline-block px-3 py-1 bg-black/40 rounded-full text-xs text-purple-300 w-fit mb-2 z-10 relative",children:new Date(s.created_at).toLocaleDateString()}),e.jsx("h3",{className:"text-xl font-bold text-white truncate z-10 relative",children:s.name})]}),e.jsxs("div",{className:"p-6",children:[e.jsx("p",{className:"text-gray-400 text-sm line-clamp-3 mb-6 transition-all duration-300",children:s.preview_data.title||"No summary available."}),e.jsxs("div",{className:"flex gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300",children:[e.jsx("button",{onClick:()=>r(s.id),className:"flex-1 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm font-medium transition-colors border border-purple-500/30",children:"Edit"}),e.jsx("a",{href:`/p/${s.id}.html`,target:"_blank",rel:"noreferrer",className:"px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-medium transition-colors border border-white/10",children:"View"}),e.jsx("button",{onClick:i=>{i.stopPropagation(),z({id:s.id,name:s.name})},className:"p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors border border-red-500/30",title:"Delete Portfolio",children:e.jsx(we,{className:"w-4 h-4"})})]})]})]},s.id))]}),!N&&M.length===0&&e.jsxs("div",{className:"text-center py-24 px-4 bg-purple-900/5 border border-purple-500/10 rounded-2xl flex flex-col items-center animate-fade-in-up",children:[e.jsxs("div",{className:"relative w-24 h-24 mb-6",children:[e.jsx("div",{className:"absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse"}),e.jsx("div",{className:"relative bg-gradient-to-br from-purple-800 to-black w-full h-full rounded-full flex items-center justify-center border border-purple-500/30",children:e.jsx(Oe,{className:"w-10 h-10 text-purple-300"})})]}),e.jsx("h3",{className:"text-2xl font-bold text-white mb-2",children:"No Portfolios Yet"}),e.jsx("p",{className:"text-gray-400 mb-8 max-w-md",children:"You haven't created any portfolios yet. Upload your resume and let AI generate a stunning professional website in seconds."}),e.jsxs("button",{onClick:()=>f("upload"),className:"px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-1 flex items-center gap-2",children:[e.jsx(ke,{className:"w-5 h-5"}),"Create First Portfolio"]})]}),A&&e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in",children:e.jsxs("div",{className:"bg-purple-950/80 border border-purple-500/40 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-900/20 animate-fade-in-up",children:[e.jsxs("h3",{className:"text-2xl font-bold text-white mb-2 flex items-center gap-2",children:[e.jsx(we,{className:"w-6 h-6 text-red-500"}),"Delete Portfolio?"]}),e.jsxs("p",{className:"text-gray-300 mb-6",children:["Are you sure you want to delete ",e.jsx("span",{className:"font-semibold text-purple-300",children:A.name}),"? This action cannot be undone and the portfolio will be permanently removed."]}),e.jsxs("div",{className:"flex gap-4 justify-end",children:[e.jsx("button",{onClick:()=>z(null),className:"px-5 py-2.5 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors",children:"Cancel"}),e.jsxs("button",{onClick:T,className:"px-5 py-2.5 rounded-xl font-medium bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-all flex items-center gap-2",children:[e.jsx(we,{className:"w-4 h-4"})," Delete"]})]})]})})]})});if(u==="upload")return e.jsx(Pe.div,{initial:{opacity:0,scale:.98},animate:{opacity:1,scale:1},transition:{duration:.5,ease:"easeOut"},className:"min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white",children:e.jsx("div",{className:"container mx-auto px-4 py-16",children:e.jsxs("div",{className:"max-w-2xl mx-auto",children:[e.jsxs("button",{onClick:()=>f("dashboard"),className:"mb-8 text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2",children:[e.jsx("span",{children:"←"})," Back to Dashboard"]}),e.jsxs("div",{className:"bg-purple-900/20 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-purple-500/30 text-center mb-8",children:[e.jsx(Ge,{className:"w-16 h-16 mx-auto mb-4 text-purple-400"}),e.jsx("h2",{className:"text-3xl md:text-4xl font-bold mb-4",children:"Upload Your Resume"}),e.jsx("p",{className:"text-gray-400",children:"Support for PDF, DOC, DOCX formats"})]}),e.jsxs("div",{className:"border-2 border-dashed border-purple-500/50 rounded-xl p-12 text-center hover:border-purple-400 transition-colors cursor-pointer",children:[e.jsx("input",{type:"file",id:"resume-upload",className:"hidden",accept:".pdf,.doc,.docx",onChange:O}),e.jsxs("label",{htmlFor:"resume-upload",className:"cursor-pointer",children:[e.jsx(Xe,{className:"w-16 h-16 mx-auto mb-4 text-purple-400"}),e.jsx("p",{className:"text-lg mb-2",children:"Click to browse or drag and drop"}),e.jsx("p",{className:"text-sm text-gray-400",children:"Maximum file size: 10MB"})]})]}),n&&e.jsxs("div",{className:"mt-6 p-4 bg-purple-800/30 rounded-lg flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(Ue,{className:"w-6 h-6 text-green-400"}),e.jsx("span",{children:n.name})]}),e.jsx("button",{onClick:()=>m(null),className:"text-red-400 hover:text-red-300",children:"Remove"})]}),e.jsx("button",{onClick:le,disabled:!n||L,className:"w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2",children:L?e.jsxs(e.Fragment,{children:[e.jsx(he,{className:"w-5 h-5 animate-spin"}),"Processing..."]}):"Process Resume"}),L&&e.jsx(mr,{})]})})});if(u==="edit")return e.jsx(Pe.div,{initial:{opacity:0,y:40,filter:"blur(10px)"},animate:{opacity:1,y:0,filter:"blur(0px)"},transition:{duration:.7,ease:[.16,1,.3,1]},className:"min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white",children:e.jsxs("div",{className:"container mx-auto px-4 py-8",children:[e.jsx("button",{onClick:()=>f("upload"),className:"mb-6 text-purple-400 hover:text-purple-300 transition-colors",children:"← Back to Upload"}),e.jsx("h2",{className:"text-3xl md:text-4xl font-bold mb-8 text-center",children:"Review & Customize"}),e.jsxs("div",{className:"max-w-3xl mx-auto mb-12 flex items-center justify-center space-x-12 relative",children:[e.jsxs("div",{className:`flex flex-col items-center z-10 ${se===1?"text-purple-400":"text-purple-500/50 cursor-pointer"}`,onClick:()=>q(1),children:[e.jsx("div",{className:`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 transition-all duration-300 ${se===1?"bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-110":"bg-purple-900/40 text-purple-400 border border-purple-500/30"}`,children:"1"}),e.jsx("span",{className:"text-sm font-semibold tracking-wider uppercase",children:"Content"})]}),e.jsx("div",{className:"absolute top-6 left-[50%] -translate-x-[50%] -translate-y-1/2 w-32 md:w-48 h-1 bg-purple-900/40 -z-0",children:e.jsx("div",{className:`h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ${se===2?"w-full":"w-0"}`})}),e.jsxs("div",{className:`flex flex-col items-center z-10 ${se===2?"text-purple-400 cursor-pointer":"text-purple-500/50 cursor-pointer"}`,onClick:()=>{b.name,q(2)},children:[e.jsx("div",{className:`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-2 transition-all duration-300 ${se===2?"bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-110":"bg-purple-900/40 text-purple-400 border border-purple-500/30"}`,children:"2"}),e.jsx("span",{className:"text-sm font-semibold tracking-wider uppercase",children:"Design"})]})]}),e.jsxs("div",{className:"max-w-5xl mx-auto",children:[se===1&&e.jsxs("div",{className:"space-y-6 animate-fade-in-up",children:[e.jsxs("div",{className:"bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30",children:[e.jsxs("h3",{className:"text-xl font-semibold mb-4 flex items-center",children:[e.jsx(Le,{className:"w-5 h-5 mr-2 text-purple-400"}),"Personal Information"]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("input",{type:"text",value:b.name,onChange:s=>_("name",s.target.value),placeholder:"Full Name",className:"w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"}),e.jsx("input",{type:"email",value:b.email,onChange:s=>_("email",s.target.value),placeholder:"Email",className:"w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"}),e.jsx("input",{type:"tel",value:b.mobile,onChange:s=>_("mobile",s.target.value),placeholder:"Phone",className:"w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"}),e.jsxs("div",{className:"flex items-center gap-4 p-3 bg-black/30 border border-purple-500/20 rounded-lg",children:[e.jsx("div",{className:"relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500/40 bg-black/50 flex items-center justify-center",children:b.profile_photo?e.jsx("img",{src:b.profile_photo,alt:"Profile preview",className:"w-full h-full object-cover",onError:s=>{s.target.style.display="none"}}):e.jsx(zt,{className:"w-6 h-6 text-purple-500/50"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-sm font-medium text-purple-300 mb-1",children:"Profile Photo"}),e.jsxs("label",{className:"cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-sm text-purple-300 transition-colors",children:[V?e.jsxs(e.Fragment,{children:[e.jsx(he,{className:"w-4 h-4 animate-spin"})," Uploading..."]}):e.jsxs(e.Fragment,{children:[e.jsx(nt,{className:"w-4 h-4"})," ",b.profile_photo?"Change Photo":"Upload Photo"]}),e.jsx("input",{type:"file",accept:"image/png,image/jpeg,image/jpg,image/gif,image/webp",className:"hidden",onChange:J,disabled:V})]}),b.profile_photo&&e.jsx("button",{onClick:()=>_("profile_photo",""),className:"ml-2 text-xs text-red-400 hover:text-red-300 transition-colors",children:"Remove"}),e.jsx("p",{className:"text-xs text-purple-500/60 mt-1",children:"PNG, JPG, WEBP up to any size"})]})]})]})]}),e.jsxs("div",{className:"bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30",children:[e.jsx("h3",{className:"text-xl font-semibold mb-4",children:"Summary"}),e.jsx("textarea",{value:b.portfolio_summary,onChange:s=>_("portfolio_summary",s.target.value),placeholder:"Professional summary",rows:4,className:"w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"})]}),e.jsxs("div",{className:"bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30",children:[e.jsxs("div",{className:"flex justify-between items-center mb-4",children:[e.jsxs("h3",{className:"text-xl font-semibold flex items-center",children:[e.jsx(Ut,{className:"w-5 h-5 mr-2 text-purple-400"}),"Experience"]}),e.jsxs("button",{onClick:()=>v("experience"),className:"p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30 flex items-center gap-1 text-sm",children:[e.jsx(ke,{className:"w-4 h-4"})," Add"]})]}),Array.isArray(b.experience)&&b.experience.map((s,i)=>e.jsxs("div",{className:"space-y-3 mb-4 p-4 bg-black/30 rounded-lg relative group",children:[e.jsx("button",{onClick:()=>xe("experience",i),className:"absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity",children:e.jsx(we,{className:"w-4 h-4"})}),e.jsx("input",{type:"text",value:s.title,onChange:p=>D("experience",i,"title",p.target.value),placeholder:"Job Title",className:"w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"}),e.jsx("input",{type:"text",value:s.company,onChange:p=>D("experience",i,"company",p.target.value),placeholder:"Company",className:"w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"})]},i))]}),e.jsxs("div",{className:"bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30",children:[e.jsxs("div",{className:"flex justify-between items-center mb-4",children:[e.jsxs("h3",{className:"text-xl font-semibold flex items-center",children:[e.jsx(Xe,{className:"w-5 h-5 mr-2 text-purple-400"}),"Education"]}),e.jsxs("button",{onClick:()=>v("education"),className:"p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30 flex items-center gap-1 text-sm",children:[e.jsx(ke,{className:"w-4 h-4"})," Add"]})]}),Array.isArray(b.education)&&b.education.map((s,i)=>e.jsxs("div",{className:"space-y-3 mb-4 p-4 bg-black/30 rounded-lg relative group",children:[e.jsx("button",{onClick:()=>xe("education",i),className:"absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity",children:e.jsx(we,{className:"w-4 h-4"})}),e.jsx("input",{type:"text",value:s.name,onChange:p=>D("education",i,"name",p.target.value),placeholder:"Degree/Certificate",className:"w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"}),e.jsx("input",{type:"text",value:s.institution,onChange:p=>D("education",i,"institution",p.target.value),placeholder:"Institution",className:"w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"})]},i))]}),e.jsxs("div",{className:"bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30",children:[e.jsxs("div",{className:"flex justify-between items-center mb-4",children:[e.jsxs("h3",{className:"text-xl font-semibold flex items-center",children:[e.jsx(it,{className:"w-5 h-5 mr-2 text-purple-400"}),"Projects"]}),e.jsxs("button",{onClick:()=>v("projects"),className:"p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30 flex items-center gap-1 text-sm",children:[e.jsx(ke,{className:"w-4 h-4"})," Add"]})]}),Array.isArray(b.projects)&&b.projects.map((s,i)=>e.jsxs("div",{className:"space-y-3 mb-4 p-4 bg-black/30 rounded-lg relative group",children:[e.jsx("button",{onClick:()=>xe("projects",i),className:"absolute top-2 right-2 p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity",children:e.jsx(we,{className:"w-4 h-4"})}),e.jsx("input",{type:"text",value:s.name,onChange:p=>D("projects",i,"name",p.target.value),placeholder:"Project Name",className:"w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"}),e.jsx("textarea",{value:s.description,onChange:p=>D("projects",i,"description",p.target.value),placeholder:"Project Description",rows:2,className:"w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"}),e.jsx("input",{type:"text",value:s.tech,onChange:p=>D("projects",i,"tech",p.target.value),placeholder:"Technologies (e.g. React, Node.js)",className:"w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"}),e.jsx("input",{type:"text",value:s.link||"",onChange:p=>D("projects",i,"link",p.target.value),placeholder:"Project Link (Optional)",className:"w-full px-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-sm"})]},i))]}),e.jsxs("div",{className:"bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2",children:[e.jsxs("h3",{className:"text-xl font-semibold flex items-center",children:[e.jsx(Ye,{className:"w-5 h-5 mr-2 text-purple-400"}),"Skills"]}),e.jsxs("label",{className:"flex items-center space-x-2 text-sm text-purple-300 cursor-pointer hover:text-purple-200 transition-colors",children:[e.jsx("input",{type:"checkbox",checked:W,onChange:s=>ae(s.target.checked),className:"rounded border-purple-500/30 text-purple-600 bg-black/50 focus:ring-purple-500 focus:ring-offset-0 focus:ring-offset-transparent"}),e.jsx("span",{children:"Adjust skill levels (optional)"})]})]}),e.jsx("input",{type:"text",value:b.skills.map(s=>typeof s=="string"?s:s.name).join(", "),onChange:s=>{const p=s.target.value.split(",").map(g=>g.trimStart()).map(g=>b.skills.find(X=>(typeof X=="string"?X:X.name).trim()===g.trim())||g);_("skills",p.filter(g=>typeof g=="string"?g!=="":g.name!==""))},placeholder:"JavaScript, React, Node.js...",className:`w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg focus:outline-none focus:border-purple-400 transition-colors ${W?"mb-4":""}`}),W&&b.skills.length>0&&e.jsx("div",{className:"space-y-4 pt-4 border-t border-purple-500/30 mt-4",children:b.skills.map((s,i)=>{const p=typeof s=="string"?s:s.name,g=typeof s=="string"?80:s.level;return e.jsxs("div",{className:"flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-colors",children:[e.jsx("span",{className:"w-1/3 truncate text-sm font-medium text-gray-200",children:p}),e.jsxs("div",{className:"flex-1 flex items-center gap-3",children:[e.jsx("input",{type:"range",min:"10",max:"100",step:"5",value:g,onChange:E=>{const X=parseInt(E.target.value),oe=[...b.skills];oe[i]={name:p,level:X},_("skills",oe)},className:"w-full h-1.5 bg-purple-900/60 rounded-lg appearance-none cursor-pointer accent-purple-400"}),e.jsxs("span",{className:"text-xs font-semibold text-purple-300 w-10 text-right",children:[g,"%"]})]})]},i)})})]}),e.jsx("div",{className:"pt-8 flex justify-end",children:e.jsx("button",{onClick:()=>q(2),className:"px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)]",children:"Next: Choose Design →"})})]}),se===2&&e.jsx("div",{className:"animate-fade-in-up",children:e.jsxs("div",{className:"bg-purple-900/20 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30 min-h-[600px] flex flex-col",children:[e.jsxs("h3",{className:"text-2xl md:text-3xl font-semibold mb-8 flex items-center justify-center",children:[e.jsx(Ye,{className:"w-8 h-8 mr-3 text-purple-400"}),"Choose Your Layout"]}),e.jsxs("div",{className:"flex flex-col xl:flex-row items-center justify-between gap-4 mb-8 bg-black/20 p-4 rounded-xl border border-purple-500/20",children:[e.jsxs("div",{className:"w-full xl:w-1/3 relative",children:[e.jsx("input",{type:"text",placeholder:"Search templates...",value:de,onChange:s=>be(s.target.value),className:"w-full px-4 py-3 pl-11 bg-black/50 border border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-400 transition-colors text-sm"}),e.jsx("svg",{className:"w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})})]}),e.jsx("div",{className:"flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide snap-x",children:ge.map(s=>e.jsx("button",{onClick:()=>ve(s),className:`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border snap-center ${pe===s?"bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]":"bg-purple-900/30 text-gray-300 border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-800/40"}`,children:s},s))})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 flex-1",children:[I.map(s=>e.jsxs("button",{onClick:()=>Q(s.id),className:`p-4 rounded-xl border-2 transition-all group text-left flex flex-col ${U===s.id?"border-purple-400 bg-purple-600/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-[1.02]":"border-purple-500/20 bg-black/20 hover:border-purple-400/50 hover:bg-purple-900/20 hover:-translate-y-1"}`,children:[e.jsxs("div",{className:"w-full aspect-video bg-gradient-to-br from-purple-900/50 to-black rounded-lg mb-4 relative overflow-hidden ring-1 ring-white/10 group-hover:ring-purple-400/50 transition-all",children:[e.jsx("img",{src:`/thumbnails/${s.id}.jpg`,alt:`${s.name} Preview`,className:"w-full h-full object-cover object-top",onError:i=>{i.target.src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzYjA3NjQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iI2Q4YjRmZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5QcmV2aWV3IHVucmVhZHk8L3RleHQ+PC9zdmc+"}}),e.jsx("div",{className:`absolute inset-0 bg-purple-600/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${U===s.id?"opacity-0":"opacity-0 group-hover:opacity-100"}`,children:e.jsx("span",{className:"text-white font-semibold flex items-center justify-center gap-2",children:"Select Template"})})]}),e.jsxs("div",{className:"w-full",children:[e.jsx("h4",{className:"text-base font-bold text-white mb-1 truncate w-full",children:s.name}),e.jsx("span",{className:"text-xs px-2 py-0.5 rounded border bg-purple-500/10 text-purple-300 border-purple-500/20 whitespace-nowrap",children:s.category})]})]},s.id)),I.length===0&&e.jsxs("div",{className:"col-span-full py-12 flex flex-col items-center justify-center text-center bg-black/20 rounded-xl border border-dashed border-purple-500/30",children:[e.jsx("svg",{className:"w-12 h-12 text-gray-600 mb-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"})}),e.jsx("h4",{className:"text-lg font-medium text-gray-400",children:"No templates found"}),e.jsx("p",{className:"text-sm text-gray-500 mt-1",children:"Try adjusting your search or category filters."})]})]}),e.jsx("button",{onClick:()=>re(!te),className:"w-full max-w-sm mx-auto block py-3 mb-8 text-sm text-purple-300 hover:text-white transition-colors flex items-center justify-center gap-2 border border-dashed border-purple-500/30 rounded-lg hover:bg-purple-500/10",children:te?"Show Less Styles":"Show More Styles"}),U&&e.jsxs("div",{className:"p-4 bg-purple-800/20 rounded-lg mb-8 max-w-md mx-auto text-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]",children:[e.jsx(Ue,{className:"w-5 h-5 text-green-400 inline mr-2"}),e.jsxs("span",{className:"text-sm tracking-wide",children:["Layout selected: ",e.jsx("span",{className:"font-semibold capitalize text-green-300",children:U})]})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pt-8 border-t border-purple-500/30",children:[e.jsx("button",{onClick:()=>q(1),className:"w-full sm:w-auto px-8 py-4 bg-purple-900/40 hover:bg-purple-900/60 rounded-xl text-lg font-semibold transition-all border border-purple-500/30",children:"← Back to Content"}),e.jsx("button",{onClick:je,className:"w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.3)]",children:"Create Website"})]})]})})]})]})});if(u==="preview")return e.jsx(Pe.div,{initial:{opacity:0,scale:.98},animate:{opacity:1,scale:1},transition:{duration:.5,ease:"easeOut"},className:"min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white",children:e.jsxs("div",{className:"container mx-auto px-4 py-16",children:[e.jsxs("button",{onClick:()=>f("dashboard"),className:"mb-8 text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2",children:[e.jsx("span",{children:"←"})," Back to Dashboard"]}),e.jsxs("div",{className:"max-w-4xl mx-auto text-center",children:[e.jsx("div",{className:"inline-block p-4 bg-green-600/20 rounded-full mb-6",children:e.jsx(Ue,{className:"w-20 h-20 text-green-400"})}),e.jsx("h2",{className:"text-4xl md:text-5xl font-bold mb-6",children:"Your Portfolio is Ready!"}),e.jsxs("p",{className:"text-xl text-gray-300 mb-8",children:["Your portfolio website has been created successfully with the ",U," layout."]}),e.jsx("div",{className:"text-left mb-8",children:e.jsx(xr,{data:b,layout:U})}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4 justify-center",children:[e.jsx("a",{href:`/p/${k}`,target:"_blank",rel:"noopener noreferrer",className:"px-8 py-4 bg-purple-900/40 hover:bg-purple-900/60 rounded-xl font-semibold transition-all border border-purple-500/30",children:"View Website Link"}),e.jsx("a",{href:`/download/${k}`,className:"px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold transition-all",children:"Download Website"}),e.jsx("button",{onClick:()=>{f("dashboard"),m(null),j(""),h(""),$({name:"",email:"",mobile:"",profile_photo:"",portfolio_summary:"",experience:[],education:[],skills:[],projects:[]})},className:"px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-all",children:"Back to Dashboard"})]})]})]})})}function vr(){const[u,f]=c.useState(!0),[n,m]=c.useState("landing");c.useEffect(()=>{d()},[]);const d=async()=>{try{const j=await fetch("/api/auth/me");j.ok&&(await j.json()).user&&m("app")}catch(j){console.error("Failed to check user session",j)}finally{f(!1)}},h=()=>{m("app")},k=async()=>{try{await fetch("/api/auth/logout",{method:"POST"}),m("landing")}catch(j){console.error("Logout failed",j)}};return u?e.jsx("div",{className:"min-h-screen bg-black flex items-center justify-center text-white",children:e.jsx(he,{className:"animate-spin w-10 h-10 text-purple-500"})}):n==="app"?e.jsxs("div",{className:"relative",children:[e.jsx(gr,{}),e.jsx("button",{onClick:k,className:"fixed top-4 right-4 z-50 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors border border-red-500/30",title:"Logout",children:e.jsx(Ot,{className:"w-5 h-5"})})]}):n==="register"?e.jsx(sr,{onLoginSuccess:h,onSwitchToLogin:()=>m("login")}):n==="forgot-password"?e.jsx(ar,{onBackToLogin:()=>m("login")}):n==="login"?e.jsx(or,{onLoginSuccess:h,onSwitchToRegister:()=>m("register"),onForgotPassword:()=>m("forgot-password")}):e.jsx(rr,{onLoginClick:()=>m("login"),onRegisterClick:()=>m("register")})}Gt.createRoot(document.getElementById("root")).render(e.jsxs(lt.StrictMode,{children:[e.jsx(Xt,{position:"bottom-center",toastOptions:{style:{background:"#3b0764",color:"#fff",border:"1px solid rgba(168, 85, 247, 0.4)"}}}),e.jsx(vr,{})]}));
