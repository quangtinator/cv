import{r as m,j as e,V as _,c as Q}from"./VersionSwitcher-DiBIK_zr.js";const X=`
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`,J=`
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;   // smoothed, 0..1, y up - drives parallax only
uniform vec2  uCursor;  // exact pointer position, 0..1, y up
uniform float uVel;     // smoothed pointer speed, 0..1

const float RS = 0.150; // event-horizon radius in screen units

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float softNoise(vec2 p) {
  float n = 0.0;
  n += 0.42 * sin(dot(p, vec2(1.73, 2.41)) + uTime * 0.012);
  n += 0.31 * sin(dot(p, vec2(-2.67, 1.36)) + 1.9 - uTime * 0.008);
  n += 0.20 * cos(dot(p, vec2(4.12, -2.18)) + 0.7);
  n += 0.12 * sin(length(p + vec2(1.8, -0.9)) * 4.2 - uTime * 0.01);
  return 0.5 + 0.5 * n;
}

float nebulaField(vec2 p) {
  vec2 w = p + 0.08 * vec2(sin(p.y * 2.2 + 0.6), cos(p.x * 1.8 - 0.4));
  float a = softNoise(w * 1.25);
  float b = softNoise(w * 2.35 + vec2(2.4, -1.7));
  float c = softNoise(w * 4.0 + vec2(-3.1, 2.2));
  return clamp(a * 0.58 + b * 0.30 + c * 0.12, 0.0, 1.0);
}

float starLayer(vec2 uv, float density, float thresh) {
  vec2 g = uv * density;
  vec2 cell = floor(g);
  vec2 f = fract(g);
  float h = hash21(cell);
  if (h < thresh) return 0.0;
  vec2 pos = vec2(hash21(cell + 7.31), hash21(cell + 3.17)) * 0.6 + 0.2;
  float d = length(f - pos);
  float tw = 0.55 + 0.45 * sin(uTime * (0.8 + h * 2.5) + h * 61.0);
  // tight falloff = pinpoint-sharp stars at native resolution
  float star = smoothstep(0.12, 0.0, d);
  return star * star * star * tw * (0.5 + 0.7 * h);
}

// distant galaxy: anisotropic glowing core with two faint spiral arms
vec3 galaxy(vec2 q, vec2 pos, float ang, float squash, vec3 tint) {
  vec2 d = q - pos;
  float ca = cos(ang);
  float sa = sin(ang);
  d = mat2(ca, -sa, sa, ca) * d;
  d.y *= squash;
  float r = length(d);
  float a = atan(d.y, d.x);
  float arms = 1.0 + 0.45 * cos(a * 2.0 - r * 22.0);
  // sharp gaussian nucleus + core glow + faint spiral arms
  float glow = exp(-r * r * 2600.0) * 2.6 + exp(-r * 30.0) * 1.6 + exp(-r * 9.0) * 0.35 * arms;
  return tint * glow;
}

vec3 cluster(vec2 q, vec2 pos, float size, vec3 tint) {
  vec2 d = q - pos;
  float r = length(d);
  float core = exp(-r * size) * 0.75 + exp(-r * r * 3200.0) * 0.8;
  float halo = exp(-r * size * 0.22) * 0.12;
  float sparkle = starLayer(q * 1.5 + pos * 17.0, 38.0, 0.72) * smoothstep(0.24, 0.03, r);
  return tint * (core + halo) + vec3(0.8, 0.9, 1.0) * sparkle * 0.65;
}

// a packet of hot gas orbiting the disk at a given radius and speed
float hotspot(float ang, float rd, float orbitR, float width, float phase, float speed) {
  float a = ang + phase - uTime * speed;
  a = mod(a + 3.14159265, 6.2831853) - 3.14159265;
  float arc = exp(-a * a * 10.0);
  float radial = exp(-pow((rd - orbitR) / width, 2.0));
  return arc * radial;
}

// "detail" fades the point stars out where the lens stretches space hardest,
// so they never smear into broken hairlines near the hole
vec3 sky(vec2 q, float detail) {
  float n1 = nebulaField(q + vec2(uTime * 0.004, 0.0));
  float n2 = nebulaField(q * 1.65 + vec2(-1.6, 1.25) - vec2(0.0, uTime * 0.003));

  float s = 0.0;
  s += starLayer(q * 0.7 + vec2(5.2, 17.9), 8.0, 0.93) * 1.5; // rare bright beacons
  s += starLayer(q + vec2(12.4, 33.2), 14.0, 0.76);
  s += starLayer(q * 1.8 + vec2(41.1, 7.7), 20.0, 0.80) * 0.7;
  s += starLayer(q * 2.6 + vec2(9.3, 54.2), 30.0, 0.80) * 0.5; // fine field
  s += starLayer(q * 3.4 + vec2(27.9, 3.4), 44.0, 0.82) * 0.35; // star dust
  // star clusters: a dense sprinkle gated to the bright nebula knots
  float clump = smoothstep(0.70, 0.90, n1);
  s += starLayer(q * 2.7 + vec2(57.7, 21.3), 34.0, 0.72) * clump * 0.8;
  s *= detail;

  // layered nebula: continuous wave fields, no cell boundaries or hard cuts
  vec3 col = vec3(0.011, 0.017, 0.043);
  float mist = smoothstep(0.24, 0.98, n1);
  float violet = smoothstep(0.42, 0.95, n2);
  float lane = exp(-pow((q.y + q.x * 0.28 + 0.08 + sin(q.x * 3.6) * 0.018) * 2.65, 2.0));
  col += vec3(0.022, 0.033, 0.090) * mist;
  col += vec3(0.055, 0.032, 0.125) * violet * 0.62;
  col += vec3(0.024, 0.085, 0.130) * n1 * n2 * 0.36;
  col += vec3(0.060, 0.075, 0.170) * lane * (0.28 + n2 * 0.42);

  // colourful nebula clouds: the hue drifts across the sky, so different
  // regions glow pink, violet, cyan or amber
  float cloud = smoothstep(0.50, 0.95, nebulaField(q * 0.85 + vec2(4.5, -3.2)));
  vec3 hue = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + q.x * 1.1 + q.y * 0.7 + n2 * 2.6);
  col += hue * vec3(0.105, 0.080, 0.135) * cloud * (0.5 + n1 * 0.8);
  // second, finer cloud layer with its own palette phase
  float cloud2 = smoothstep(0.55, 0.95, nebulaField(q * 1.7 + vec2(-6.2, 2.9)));
  vec3 hue2 = 0.5 + 0.5 * cos(vec3(1.6, 3.7, 5.8) + q.y * 1.3 - q.x * 0.8 + n1 * 2.2);
  col += hue2 * vec3(0.070, 0.055, 0.095) * cloud2 * (0.4 + n2 * 0.7);

  col += vec3(0.75, 0.85, 1.0) * s;

  // distant galaxies — they warp with the lens like everything else
  col += galaxy(q, vec2(-0.62, 0.33), 0.6, 2.6, vec3(0.55, 0.62, 0.95)) * 0.34;
  col += galaxy(q, vec2(0.68, -0.26), -0.9, 3.2, vec3(0.85, 0.65, 0.95)) * 0.28;
  col += galaxy(q, vec2(0.16, 0.43), 1.9, 2.2, vec3(0.55, 0.85, 0.95)) * 0.22;
  col += galaxy(q, vec2(-0.85, -0.32), 2.3, 2.9, vec3(0.95, 0.75, 0.55)) * 0.26;
  col += galaxy(q, vec2(0.88, 0.35), -1.6, 2.4, vec3(0.60, 0.90, 1.00)) * 0.22;
  col += galaxy(q, vec2(-0.20, -0.44), 0.3, 3.6, vec3(0.75, 0.60, 1.00)) * 0.18;
  col += cluster(q, vec2(-0.42, -0.08), 16.0, vec3(0.55, 0.72, 1.0)) * 0.36;
  col += cluster(q, vec2(0.48, 0.24), 20.0, vec3(0.75, 0.55, 1.0)) * 0.28;
  col += cluster(q, vec2(0.05, -0.30), 22.0, vec3(0.95, 0.80, 0.60)) * 0.22;

  return col;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec2 mc = (uCursor - 0.5) * vec2(uRes.x / uRes.y, 1.0);

  // hole sits slightly above centre and parallaxes gently against the cursor
  vec2 bh = vec2(0.0, 0.06) - m * 0.055;
  vec2 d = p - bh;
  float r = length(d);

  // gravitational lensing: beta = theta * (1 - thetaE^2 / r^2)
  float te = RS * 2.08;
  float lensK = 1.0 - (te * te) / max(r * r, 1e-5);
  vec2 q = bh + d * lensK;

  // frame-drag swirl near the horizon
  float sw = 0.24 * exp(-r * 5.2);
  float cs = cos(sw);
  float sn = sin(sw);
  q = bh + mat2(cs, -sn, sn, cs) * (q - bh);

  // A compact cursor lens bends the surrounding sky without moving the ship
  // or deforming the event horizon and accretion disk.
  vec2 dm = p - mc;
  float rm = max(length(dm), 1e-4);
  float cursorFalloff = 1.0 - smoothstep(0.02, 0.34, rm);
  float cursorStrength = (0.0006 + uVel * 0.0030) / (rm * rm * 14.0 + 0.072);
  q -= (dm / rm) * cursorStrength * cursorFalloff;

  // The event horizon stays geometrically stable as the pointer moves.
  vec2 dh = d;
  float rh = r;

  // soft-cap the total warp so sampling never stretches to infinity
  vec2 disp = q - p;
  float dmag = max(length(disp), 1e-6);
  float capped = 0.38 * dmag / (0.38 + dmag);
  q = p + disp * (capped / dmag);

  // fade point stars out of the extreme-stretch zone around the hole
  float starFade = smoothstep(RS * 1.15, RS * 2.7, r);

  vec3 col = sky(q, starFade);

  // event-horizon shadow: pure black core with a pixel-sharp round edge,
  // anti-aliased over roughly one rendered pixel
  float aa = 1.0 / uRes.y;
  float shadow = smoothstep(RS - aa, RS + aa, rh);
  float well = exp(-max(rh - RS, 0.0) * 9.5);
  col *= 1.0 - well * 0.14;
  col *= shadow;

  // Thin, structured accretion disk with crisp radial bands and a controlled
  // outer falloff. Integer angular harmonics keep the texture seam-free.
  vec2 dd = vec2(dh.x, dh.y * 4.4);
  float ca = cos(-0.26);
  float sa = sin(-0.26);
  dd = mat2(ca, -sa, sa, ca) * dd;
  float rd = length(dd);
  float innerDisk = smoothstep(RS * 1.02, RS * 1.15, rd);
  float outerDisk = 1.0 - smoothstep(RS * 3.45, RS * 4.05, rd);
  float dmask = innerDisk * outerDisk;

  if (dmask > 0.002) {
    float ang = atan(dd.y, dd.x);
    float radialBands = 0.5 + 0.5 * sin(rd * 78.0 - uTime * 0.22 + sin(ang * 4.0) * 0.7);
    float spiral = 0.5 + 0.5 * sin(ang * 4.0 + 11.0 / (rd + 0.05) + rd * 22.0 + uTime * 0.15);
    spiral = smoothstep(0.18, 0.88, spiral);
    float fine = 0.72 + 0.28 * smoothstep(0.20, 0.82, radialBands);
    float doppler = 1.0 + 0.48 * sin(ang + 0.9);
    float hot = 1.0 - smoothstep(RS * 1.18, RS * 3.55, rd);
    vec3 diskCol = mix(vec3(0.14, 0.34, 0.92), vec3(1.15, 0.94, 0.72), hot);
    float texture = (0.46 + 1.08 * spiral) * fine;
    col += diskCol * dmask * texture * doppler * shadow;

    float hs = 0.0;
    hs += hotspot(ang, rd, RS * 1.38, RS * 0.13, 0.0, 0.55);
    hs += hotspot(ang, rd, RS * 1.95, RS * 0.18, 2.4, 0.38) * 0.72;
    hs += hotspot(ang, rd, RS * 2.65, RS * 0.22, 4.4, 0.26) * 0.48;
    hs *= max(0.0, 0.48 + 0.64 * sin(ang + 0.9));
    col += vec3(1.08, 1.04, 0.92) * hs * dmask * shadow * 0.92;
  }

  // photon ring and restrained ambient glow
  float ringW = max(RS * 0.014, 1.25 / uRes.y);
  float ring = exp(-pow((rh - RS * 1.035) / ringW, 2.0));
  float halo = exp(-pow((rh - RS * 1.30) / (RS * 0.19), 2.0));
  col += vec3(1.28, 1.40, 1.70) * ring * 1.95;
  col += vec3(0.22, 0.48, 1.00) * halo * 0.24 * shadow;
  col += vec3(0.18, 0.32, 0.72) * exp(-rh * 4.8) * 0.12 * shadow;


  // vignette + animated dither against banding
  float vig = 1.0 - 0.30 * dot(p * vec2(0.75, 1.0), p * vec2(0.75, 1.0));
  col *= vig;
  // keep the horizon rim grain-free: dither only well outside the edge
  col += (hash21(gl_FragCoord.xy + vec2(uTime)) - 0.5) * (3.5 / 255.0) *
    smoothstep(RS * 1.02, RS * 1.3, rh);

  gl_FragColor = vec4(col, 1.0);
}
`;function H(t,s,a){const n=t.createShader(s);return t.shaderSource(n,a),t.compileShader(n),t.getShaderParameter(n,t.COMPILE_STATUS)?n:(console.error("BlackHole shader error:",t.getShaderInfoLog(n)),t.deleteShader(n),null)}function K(){const t=m.useRef(null);return m.useEffect(()=>{const s=t.current,a=s.getContext("webgl",{antialias:!1,alpha:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!a){document.documentElement.classList.add("no-webgl");return}const n=window.matchMedia("(prefers-reduced-motion: reduce)").matches;let o=null,i={},r=0,d=!1,c=!1;const f=()=>{const l=window.devicePixelRatio||1;return window.innerWidth<=640?Math.min(l,.82):window.innerWidth<=960?Math.min(l,1):Math.min(l,1.08)},p=()=>window.innerWidth<=768?32:24;let h=1,j=f(),k=p(),N=0,C=performance.now(),b=0;const x={x:.5,y:.5,tx:.5,ty:.5},A={x:.5,y:.5};let E=null,F=0,M=0;function u(){const l=H(a,a.VERTEX_SHADER,X),w=H(a,a.FRAGMENT_SHADER,J);if(!l||!w)return document.documentElement.classList.add("no-webgl"),!1;if(o=a.createProgram(),a.attachShader(o,l),a.attachShader(o,w),a.linkProgram(o),!a.getProgramParameter(o,a.LINK_STATUS))return console.error("BlackHole link error:",a.getProgramInfoLog(o)),document.documentElement.classList.add("no-webgl"),!1;a.useProgram(o);const S=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,S),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),a.STATIC_DRAW);const R=a.getAttribLocation(o,"aPos");return a.enableVertexAttribArray(R),a.vertexAttribPointer(R,2,a.FLOAT,!1,0,0),i={res:a.getUniformLocation(o,"uRes"),time:a.getUniformLocation(o,"uTime"),mouse:a.getUniformLocation(o,"uMouse"),cursor:a.getUniformLocation(o,"uCursor"),velocity:a.getUniformLocation(o,"uVel")},!0}function v(){const l=Math.max(1,Math.round(window.innerWidth*j)),w=Math.max(1,Math.round(window.innerHeight*j));(s.width!==l||s.height!==w)&&(s.width=l,s.height=w,a.viewport(0,0,l,w))}function L(l){a.uniform2f(i.res,s.width,s.height),a.uniform1f(i.time,l*.001),a.uniform2f(i.mouse,x.x,x.y),a.uniform2f(i.cursor,A.x,A.y),a.uniform1f(i.velocity,F),a.drawArrays(a.TRIANGLES,0,3)}function q(l){if(d||c)return;const w=Math.min(64,l-C);C=l;const S=1-Math.pow(.94,w/16.67);if(x.x+=(x.tx-x.x)*S,x.y+=(x.ty-x.y)*S,F+=(M-F)*S,M*=Math.pow(.88,w/16.67),b===0||l-b>=k){const R=b===0?16.7:l-b;b=l;const Z=Math.max(k,16.7)+10;R>Z&&R<220?N++:N=Math.max(0,N-1),N>20&&(N=0,h>.6?(h*=.8,j=f()*h,v()):k<31&&(k=31)),L(l)}r=requestAnimationFrame(q)}function B(){d||c||!o||(v(),L(performance.now()))}function I(){cancelAnimationFrame(r),C=performance.now(),b=0,n?B():r=requestAnimationFrame(q)}if(!u())return;v(),I();const T=l=>{const w=l.clientX/window.innerWidth,S=1-l.clientY/window.innerHeight;if(x.tx=w,x.ty=S,A.x=w,A.y=S,E){const R=Math.hypot(l.clientX-E.x,l.clientY-E.y);M=Math.min(1,Math.max(M,R/46))}E={x:l.clientX,y:l.clientY}},D=()=>{k=p(),j=f()*h,v(),n&&B()},P=()=>{document.hidden?cancelAnimationFrame(r):I()},W=l=>{l.preventDefault(),c=!0,cancelAnimationFrame(r)},O=()=>{c=!1,u()&&(v(),I())};return window.addEventListener("pointermove",T,{passive:!0}),window.addEventListener("resize",D),document.addEventListener("visibilitychange",P),s.addEventListener("webglcontextlost",W),s.addEventListener("webglcontextrestored",O),()=>{d=!0,cancelAnimationFrame(r),window.removeEventListener("pointermove",T),window.removeEventListener("resize",D),document.removeEventListener("visibilitychange",P),s.removeEventListener("webglcontextlost",W),s.removeEventListener("webglcontextrestored",O)}},[]),e.jsx("canvas",{ref:t,className:"blackhole","aria-hidden":"true"})}const $=14,z='a, button, input, textarea, select, [role="button"], label';function ee(t,s){return(s-t+540)%360-180}function te(){const t=m.useRef(null),s=m.useRef(null);return m.useEffect(()=>{if(!window.matchMedia("(pointer: fine)").matches||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const a=t.current,n=s.current;document.body.classList.add("ship-cursor-active");const o=[];for(let u=0;u<$;u++){const v=document.createElement("span");v.className="trail-p",n.appendChild(v),o.push(v)}let i=0,r=0,d=0,c=!1,f=performance.now(),p=0;const h={x:-100,y:-100},j={x:-100,y:-100},k=()=>{const u=(r-90)*Math.PI/180,v=h.x-Math.cos(u)*16,L=h.y-Math.sin(u)*16,q=o[i];i=(i+1)%$,q.animate([{opacity:.8,transform:"translate("+v+"px, "+L+"px) scale(1)"},{opacity:0,transform:"translate("+v+"px, "+L+"px) scale(0.15)"}],{duration:550,easing:"ease-out",fill:"forwards"})},N=u=>{j.x=u.clientX,j.y=u.clientY,a.classList.add("on"),c||(c=!0,h.x=j.x,h.y=j.y)},C=()=>a.classList.remove("on"),b=()=>{c&&a.classList.add("on")},x=()=>a.classList.add("down"),A=()=>a.classList.remove("down"),E=u=>{u.target.closest?.(z)&&a.classList.add("on-link")},F=u=>{u.target.closest?.(z)&&a.classList.remove("on-link")},M=u=>{const v=Math.min(64,u-f),L=Math.max(.25,v/16.67);f=u;const q=h.x,B=h.y,I=1-Math.pow(.78,L);h.x+=(j.x-h.x)*I,h.y+=(j.y-h.y)*I;const T=h.x-q,D=h.y-B,P=Math.hypot(T,D);if(P>.35){const W=Math.atan2(D,T)*180/Math.PI+90;r+=ee(r,W)*(1-Math.pow(.82,L))}a.style.transform="translate("+h.x+"px, "+h.y+"px) translate(-50%, -50%) rotate("+r+"deg)",P>1.6&&c&&u-p>34&&(k(),p=u),d=requestAnimationFrame(M)};return d=requestAnimationFrame(M),window.addEventListener("pointermove",N,{passive:!0}),document.documentElement.addEventListener("mouseleave",C),document.documentElement.addEventListener("mouseenter",b),window.addEventListener("pointerdown",x),window.addEventListener("pointerup",A),document.addEventListener("mouseover",E),document.addEventListener("mouseout",F),()=>{cancelAnimationFrame(d),document.body.classList.remove("ship-cursor-active"),window.removeEventListener("pointermove",N),document.documentElement.removeEventListener("mouseleave",C),document.documentElement.removeEventListener("mouseenter",b),window.removeEventListener("pointerdown",x),window.removeEventListener("pointerup",A),document.removeEventListener("mouseover",E),document.removeEventListener("mouseout",F),o.forEach(u=>u.remove())}},[]),e.jsxs("div",{className:"ship-cursor","aria-hidden":"true",children:[e.jsx("div",{ref:s,className:"ship-trail"}),e.jsx("div",{ref:t,className:"ship-el",children:e.jsxs("svg",{viewBox:"0 0 36 36",width:"34",height:"34",className:"ship-svg",children:[e.jsx("defs",{children:e.jsxs("linearGradient",{id:"shipGrad",x1:"0",y1:"0",x2:"0",y2:"1",children:[e.jsx("stop",{offset:"0",stopColor:"#dcebff"}),e.jsx("stop",{offset:"1",stopColor:"#5e8bff"})]})}),e.jsx("path",{className:"ship-flame",d:"M18 24 L21 31.5 L18 28.8 L15 31.5 Z",fill:"#8fd8ff"}),e.jsx("path",{d:"M18 2.5 C21.2 8.5 24 16 25 25.5 L18 21.8 L11 25.5 C12 16 14.8 8.5 18 2.5 Z",fill:"url(#shipGrad)",stroke:"rgba(200, 224, 255, 0.9)",strokeWidth:"1"}),e.jsx("circle",{cx:"18",cy:"12.5",r:"2.3",fill:"#0b1225",opacity:"0.85"})]})})]})}const ae=70,se=7;function ne(){const[t,s]=m.useState(!1),[a,n]=m.useState(!1),o=m.useRef(null),i=m.useRef(!1);m.useEffect(()=>{let d=!1;const c=()=>{d||(d=!0,requestAnimationFrame(()=>{s(window.scrollY>600),d=!1}))};return c(),window.addEventListener("scroll",c,{passive:!0}),()=>window.removeEventListener("scroll",c)},[]);const r=()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){window.scrollTo({top:0,behavior:"smooth"});return}if(i.current)return;i.current=!0,n(!0);const d=o.current,c=document.createDocumentFragment();for(let f=0;f<se;f++){const p=document.createElement("span");p.className="beam-column",p.style.left=`${6+Math.random()*88}%`,p.style.animationDelay=`${Math.random()*220}ms`,p.style.animationDuration=`${800+Math.random()*400}ms`,c.appendChild(p)}for(let f=0;f<ae;f++){const p=document.createElement("span");p.className=`sparkle ${Math.random()<.5?"gold":"cyan"}`;const h=2+Math.random()*3.5;p.style.width=`${h}px`,p.style.height=`${h}px`,p.style.left=`${Math.random()*100}%`,p.style.top=`${30+Math.random()*68}%`,p.style.setProperty("--sx",`${(Math.random()*80-40).toFixed(0)}px`),p.style.animationDelay=`${Math.random()*350}ms`,p.style.animationDuration=`${600+Math.random()*500}ms`,c.appendChild(p)}d.appendChild(c),document.body.classList.add("beaming"),setTimeout(()=>window.scrollTo({top:0,behavior:"smooth"}),350),setTimeout(()=>{d.textContent="",document.body.classList.remove("beaming"),i.current=!1,n(!1)},1450)};return e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",className:`beam-btn glass${t?" show":""}${a?" beaming":""}`,onClick:r,"aria-label":"Beam me up, Scotty — scroll back to top",tabIndex:t?0:-1,children:[e.jsxs("svg",{viewBox:"0 0 24 24",width:"18",height:"18","aria-hidden":"true",className:"beam-icon",children:[e.jsx("path",{d:"M12 2 L13.2 6.8 L18 8 L13.2 9.2 L12 14 L10.8 9.2 L6 8 L10.8 6.8 Z",fill:"currentColor"}),e.jsx("path",{d:"M5 19 L12 15.5 L19 19",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round"}),e.jsx("path",{d:"M7 22 L12 19.5 L17 22",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",opacity:"0.55"})]}),e.jsx("span",{children:"Beam me up, Scotty"})]}),e.jsx("div",{ref:o,className:"beam-overlay","aria-hidden":"true"})]})}const re={name:"Vu Nhat Quang Phung",role:"Senior Software Engineer",tagline:"I design and operate production-grade full-stack, cloud, and AI systems from customer requirements to continuous improvement.",email:"quang.phung@rwth-aachen.de",phone:"+49 176 45297897",location:"Aachen, Germany",socials:[{label:"LinkedIn",url:"https://linkedin.com/in/vu-nhat-quang-phung-77144b162",icon:"linkedin"}]},oe=[{value:"4+",label:"Years in software"},{value:"2",label:"Academic degrees"},{value:"1",label:"Peer-reviewed publication"}],ie={paragraphs:["I'm a senior software engineer focused on full-stack, backend, cloud, and AI solution engineering. I work across TypeScript / Node.js and Python, with hands-on ownership of solution architecture, Azure deployments, CI/CD, infrastructure as code, and production operations.","From customer requirements and MVPs through testing, staging, production, and continuous improvement, I build maintainable systems that are secure, observable, and ready to evolve. My current focus includes LLM and agent systems, evaluation harnesses, and workflow automation."],highlights:["End-to-end delivery from customer requirements to production operations","LLM, agent, and AI harness engineering with repeatable evaluation","Azure, Docker, OpenTofu, CI/CD, monitoring, and infrastructure ownership"]},le=[{icon:"✦",title:"Flashcard Widget",description:"Master's thesis at RWTH Aachen University: conception and development of a flashcard widget for learning workflows.",tags:["M.Sc. thesis","Data Science","Learning technology"]},{icon:"◇",title:"OER Learning Platform",description:"A modular web-based learning platform created for a Bachelor's thesis to practice the OER cycle in online workshops.",tags:["React","Node.js / Express","Docker"]},{icon:"◌",title:"Digital Educational Game",description:"Research project published at CELDA 2022, describing a digital educational game for practicing OER in online workshops.",tags:["Research","CELDA 2022","OER"]},{icon:"⌁",title:"AI & Agent Systems",description:"Production-oriented LLM and agent applications with repeatable evaluation, testing, quality checks, and workflow hardening.",tags:["LangChain","LangGraph","Qdrant"]}],ce=[{category:"Application Engineering",icon:"✦",items:["TypeScript","JavaScript","Python","Node.js","NestJS","FastAPI","Angular","React","Vue","Next.js","REST APIs","OpenAPI"]},{category:"AI & Automation",icon:"⌁",items:["LangChain","LangGraph","Qdrant","AI Agents","AI Harness Engineering","Evaluation & Hardening","Copilot Studio","Power Automate"]},{category:"Cloud & Delivery",icon:"◇",items:["Azure","AWS","Docker","OpenTofu","GitLab CI/CD","Linux","Monitoring","DNS / Server Management","Dokploy"]},{category:"Data & Security",icon:"◌",items:["PostgreSQL","Prisma","MongoDB","Microsoft SQL Server","JWT","SSO","Application Security"]},{category:"Engineering Practice",icon:"◎",items:["Git","GitHub","GitLab","GitHub Copilot","Kanban","Agile / Scrum","Husky / Git Hooks"]},{category:"Additional Knowledge",icon:"+",items:["Java","Spring Boot","JPA / Hibernate","Gradle","Flyway"]}],de=[{name:"Full-stack & backend systems",detail:"TypeScript, Node.js, Python, REST APIs"},{name:"AI solution engineering",detail:"LLMs, agents, evaluation, workflow automation"},{name:"Cloud & platform delivery",detail:"Azure, AWS, Docker, OpenTofu, CI/CD"},{name:"Data & application security",detail:"PostgreSQL, Prisma, JWT, SSO"}],he=[{period:"Apr 2026 - Present",role:"Senior Software Engineer - AI Solution Engineering",company:"INC Innovation Center GmbH",description:"Work with customers and stakeholders to turn business requirements into user-centered digital solutions. Build and operate TypeScript and PostgreSQL services on Azure with Docker, OpenTofu, GitLab CI/CD, monitoring, and production support, while developing LLM and agent applications with evaluation and hardening workflows.",tags:["TypeScript","Azure","LLM / Agents","OpenTofu","GitLab CI/CD"]},{period:"Aug 2023 - Mar 2026",role:"Software Engineer",company:"Fraunhofer FIT",description:"Developed and operated production web platforms and backend services across React, Angular, Vue, Node.js, NestJS, and FastAPI. Built data-processing and ingestion pipelines, worked across Linux and Docker infrastructure, and coordinated two working students through a Kanban-based delivery workflow.",tags:["React","Angular","Node.js","NestJS","FastAPI","AWS S3"]},{period:"May 2022 - Dec 2022",role:"Working Student - Data Engineering",company:"Vygon GmbH",description:"Automated data-processing and reporting workflows with SQL, VBA, and Microsoft SQL Server. Improved data quality through validation and standardized structures, and supported software-validation activities with structured technical documentation.",tags:["SQL","VBA","Microsoft SQL Server","Data quality"]}],ue=[{period:"Apr 2022 - Apr 2024",degree:"Master of Science (M.Sc.) in Data Science",institution:"RWTH Aachen University",details:"Dean's List 2023-2024. Master's thesis: Conception and Development of a Flashcard Widget."},{period:"Apr 2018 - Dec 2021",degree:"Bachelor of Science (B.Sc.) in Computer Science",institution:"RWTH Aachen University",details:"Bachelor's thesis: Developing a Framework to Practice OER Cycle in Online Workshops based on a Digital Learning Game."}],me=[{name:"AWS Certified Cloud Practitioner",issuer:"Amazon Web Services",year:"2026"},{name:"Certified Data Scientist",issuer:"Fraunhofer IAIS",year:"2024"}],pe={authors:"Ali, L., Phung, Q., Roepke, R., & Schroeder, U.",year:"2022",title:"A Digital Educational Game for Practicing OER",venue:"Proceedings of the 19th International Conference on Cognition and Exploratory Learning in the Digital Age (CELDA), Lisbon, Portugal."},fe=[{name:"German",level:"C1"},{name:"English",level:"C1"},{name:"Vietnamese",level:"Native"}],ge=[{label:"About",href:"#about"},{label:"Work",href:"#work"},{label:"Skills",href:"#skills"},{label:"Experience",href:"#experience"},{label:"Credentials",href:"#credentials"},{label:"Contact",href:"#contact"}],y={site:re,stats:oe,about:ie,projects:le,skillGroups:ce,coreFocus:de,experience:he,education:ue,certifications:me,publication:pe,languages:fe,navLinks:ge},g=y.site,ve=y.stats,V=y.about,xe=y.projects,we=y.skillGroups,ye=y.coreFocus,je=y.experience,be=y.education,Ne=y.certifications,G=y.publication,Le=y.languages,U=y.navLinks;function Se(){const[t,s]=m.useState(!1),[a,n]=m.useState(!1),[o,i]=m.useState("");return m.useEffect(()=>{const r=()=>s(window.scrollY>24);return r(),window.addEventListener("scroll",r,{passive:!0}),()=>window.removeEventListener("scroll",r)},[]),m.useEffect(()=>{const r=U.map(c=>document.querySelector(c.href)).filter(Boolean),d=new IntersectionObserver(c=>{c.forEach(f=>{f.isIntersecting&&i("#"+f.target.id)})},{rootMargin:"-40% 0px -55% 0px"});return r.forEach(c=>d.observe(c)),()=>d.disconnect()},[]),e.jsx("header",{className:"nav"+(t?" scrolled":"")+(a?" open":""),children:e.jsxs("nav",{className:"nav-inner","aria-label":"Main navigation",children:[e.jsxs("a",{href:"#top",className:"nav-logo","aria-label":g.name+" - Home",onClick:()=>n(!1),children:[e.jsxs("span",{className:"logo-blackhole","aria-hidden":"true",children:[e.jsx("span",{className:"logo-blackhole-disk"}),e.jsx("span",{className:"logo-blackhole-core"})]}),e.jsx("span",{className:"logo-name",children:g.name})]}),e.jsx("ul",{id:"nav-menu",className:"nav-links",children:U.map(r=>e.jsx("li",{children:e.jsx("a",{href:r.href,className:o===r.href?"active":"",onClick:()=>n(!1),children:r.label})},r.href))}),e.jsx("div",{className:"nav-actions",children:e.jsxs("button",{type:"button",className:"nav-burger",onClick:()=>n(r=>!r),"aria-label":a?"Close menu":"Open menu","aria-expanded":a,"aria-controls":"nav-menu",children:[e.jsx("span",{}),e.jsx("span",{}),e.jsx("span",{})]})})]})})}function ke(){return e.jsxs("section",{id:"top",className:"hero",children:[e.jsxs("div",{className:"container hero-inner",children:[e.jsxs("div",{className:"orbit","aria-hidden":"true",children:[e.jsx("span",{className:"orbit-ring r1"}),e.jsx("span",{className:"orbit-ring r2"}),e.jsx("span",{className:"orbit-dot"})]}),e.jsx("p",{className:"eyebrow reveal",children:"Welcome aboard"}),e.jsxs("h1",{className:"hero-title reveal",children:["Hi, I'm ",e.jsx("span",{className:"grad-text",children:g.name}),e.jsx("br",{}),g.role]}),e.jsx("p",{className:"hero-tagline reveal",children:g.tagline}),e.jsxs("div",{className:"hero-ctas reveal",children:[e.jsxs("a",{href:"#work",className:"btn btn-primary",children:["View my work",e.jsx("svg",{viewBox:"0 0 24 24",width:"16",height:"16","aria-hidden":"true",children:e.jsx("path",{d:"M5 12h13M13 6l6 6-6 6",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})]}),e.jsx("a",{href:"#contact",className:"btn btn-ghost",children:"Get in touch"})]}),e.jsx("dl",{className:"hero-stats reveal","data-stagger":!0,children:ve.map(t=>e.jsxs("div",{className:"stat glass",children:[e.jsx("dt",{children:t.label}),e.jsx("dd",{children:t.value})]},t.label))})]}),e.jsxs("a",{href:"#about",className:"scroll-hint","aria-label":"Scroll to the About section",children:[e.jsx("span",{className:"scroll-hint-track",children:e.jsx("span",{className:"scroll-hint-dot"})}),e.jsx("span",{className:"scroll-hint-label",children:"scroll"})]})]})}function Ae(){return e.jsx("section",{id:"about",className:"section",children:e.jsxs("div",{className:"container",children:[e.jsxs("header",{className:"section-head reveal",children:[e.jsx("p",{className:"eyebrow",children:"About"}),e.jsx("h2",{children:"Mission briefing"})]}),e.jsx("div",{className:"about-grid about-grid-copy",children:e.jsxs("div",{className:"about-copy reveal",children:[V.paragraphs.map(t=>e.jsx("p",{children:t},t.slice(0,24))),e.jsx("ul",{className:"about-highlights","data-stagger":!0,children:V.highlights.map(t=>e.jsxs("li",{className:"reveal",children:[e.jsx("svg",{viewBox:"0 0 24 24",width:"16",height:"16","aria-hidden":"true",children:e.jsx("path",{d:"M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8Z",fill:"currentColor"})}),t]},t))})]})})]})})}const Y=typeof window<"u"&&window.matchMedia("(pointer: fine)").matches&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches;function Ee({project:t}){const s=m.useRef(null),a=m.useRef(0),n=m.useCallback(i=>{if(!Y)return;const r=s.current;cancelAnimationFrame(a.current),a.current=requestAnimationFrame(()=>{const d=r.getBoundingClientRect(),c=(i.clientX-d.left)/d.width-.5,f=(i.clientY-d.top)/d.height-.5;r.style.setProperty("--rx",String((-f*6).toFixed(2))+"deg"),r.style.setProperty("--ry",String((c*8).toFixed(2))+"deg")})},[]),o=m.useCallback(()=>{if(!Y)return;cancelAnimationFrame(a.current);const i=s.current;i.style.setProperty("--rx","0deg"),i.style.setProperty("--ry","0deg")},[]);return e.jsxs("article",{ref:s,className:"project-card glass tilt reveal",onMouseMove:n,onMouseLeave:o,children:[e.jsx("span",{className:"project-icon","aria-hidden":"true",children:t.icon}),e.jsx("h3",{children:t.title}),e.jsx("p",{children:t.description}),e.jsx("ul",{className:"tag-list","aria-label":"Technologies and context",children:t.tags.map(i=>e.jsx("li",{className:"chip",children:i},i))})]})}function Me(){return e.jsx("section",{id:"work",className:"section",children:e.jsxs("div",{className:"container",children:[e.jsxs("header",{className:"section-head reveal",children:[e.jsx("p",{className:"eyebrow",children:"Selected work"}),e.jsx("h2",{children:"Research and applied systems"}),e.jsx("p",{className:"section-sub",children:"A selection of academic work and applied engineering themes from my experience."})]}),e.jsx("div",{className:"work-grid","data-stagger":!0,children:xe.map(t=>e.jsx(Ee,{project:t},t.title))})]})})}function Re(){return e.jsx("section",{id:"skills",className:"section",children:e.jsxs("div",{className:"container",children:[e.jsxs("header",{className:"section-head reveal",children:[e.jsx("p",{className:"eyebrow",children:"Skills"}),e.jsx("h2",{children:"Instrument panel"}),e.jsx("p",{className:"section-sub",children:"A practical toolkit spanning application engineering, AI automation, cloud delivery, data, security, and team practice."})]}),e.jsx("div",{className:"skills-grid","data-stagger":!0,children:we.map(t=>e.jsxs("div",{className:"skill-card glass reveal",children:[e.jsxs("h3",{children:[e.jsx("span",{className:"skill-icon","aria-hidden":"true",children:t.icon}),t.category]}),e.jsx("ul",{className:"tag-list",children:t.items.map(s=>e.jsx("li",{className:"chip",children:s},s))})]},t.category))}),e.jsxs("div",{className:"levels glass reveal",children:[e.jsx("h3",{children:"Core focus"}),e.jsx("ul",{className:"focus-list",children:ye.map(t=>e.jsxs("li",{className:"focus-row",children:[e.jsx("span",{className:"focus-name",children:t.name}),e.jsx("span",{className:"focus-detail",children:t.detail})]},t.name))})]})]})})}function Ce(){return e.jsx("section",{id:"experience",className:"section",children:e.jsxs("div",{className:"container",children:[e.jsxs("header",{className:"section-head reveal",children:[e.jsx("p",{className:"eyebrow",children:"Experience"}),e.jsx("h2",{children:"Flight log"})]}),e.jsx("ol",{className:"timeline",children:je.map(t=>e.jsxs("li",{className:"timeline-item reveal",children:[e.jsx("span",{className:"timeline-node","aria-hidden":"true"}),e.jsxs("div",{className:"timeline-card glass",children:[e.jsx("p",{className:"timeline-period",children:t.period}),e.jsxs("h3",{children:[t.role," ",e.jsxs("span",{className:"timeline-company",children:["· ",t.company]})]}),e.jsx("p",{children:t.description}),e.jsx("ul",{className:"tag-list",children:t.tags.map(s=>e.jsx("li",{className:"chip",children:s},s))})]})]},t.period))})]})})}function Fe(){return e.jsx("section",{id:"credentials",className:"section",children:e.jsxs("div",{className:"container",children:[e.jsxs("header",{className:"section-head reveal",children:[e.jsx("p",{className:"eyebrow",children:"Credentials"}),e.jsx("h2",{children:"Beyond the code"}),e.jsx("p",{className:"section-sub",children:"Academic foundations, certifications, research, and the languages I bring to a team."})]}),e.jsxs("div",{className:"credentials-grid",children:[e.jsxs("section",{className:"credential-panel glass reveal",children:[e.jsx("h3",{children:"Education"}),e.jsx("ol",{className:"credential-list",children:be.map(t=>e.jsxs("li",{children:[e.jsx("p",{className:"credential-period",children:t.period}),e.jsx("h4",{children:t.degree}),e.jsx("p",{className:"credential-institution",children:t.institution}),e.jsx("p",{children:t.details})]},t.degree))})]}),e.jsxs("section",{className:"credential-panel glass reveal",children:[e.jsx("h3",{children:"Certifications"}),e.jsx("ul",{className:"certification-list",children:Ne.map(t=>e.jsxs("li",{children:[e.jsx("span",{className:"credential-mark","aria-hidden":"true",children:"+"}),e.jsxs("div",{children:[e.jsx("h4",{children:t.name}),e.jsxs("p",{children:[t.issuer," - ",t.year]})]})]},t.name))}),e.jsx("h3",{className:"credential-subhead",children:"Languages"}),e.jsx("ul",{className:"language-list",children:Le.map(t=>e.jsxs("li",{children:[e.jsx("span",{children:t.name}),e.jsx("span",{children:t.level})]},t.name))})]})]}),e.jsxs("article",{className:"publication-panel glass reveal",children:[e.jsx("p",{className:"eyebrow",children:"Publication"}),e.jsx("h3",{children:G.title}),e.jsxs("p",{children:[G.authors," (",G.year,"). ",G.venue]})]})]})})}const qe={linkedin:e.jsx("path",{d:"M4.98 3.5A2.49 2.49 0 1 1 5 8.48a2.49 2.49 0 0 1-.02-4.98ZM3 9.75h4v11.5H3ZM9.5 9.75h3.83v1.57h.05c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.79 2.66 4.79 6.12v5.88h-4v-5.21c0-1.24-.02-2.85-1.74-2.85-1.74 0-2 1.36-2 2.76v5.3h-3.99Z",fill:"currentColor"})};function Ie(){const[t,s]=m.useState(""),a=n=>{n.preventDefault();const o=new FormData(n.currentTarget),i=o.get("name")?.toString().trim(),r=o.get("email")?.toString().trim(),d=o.get("message")?.toString().trim();if(!i||!r||!d)return;const c=encodeURIComponent("Portfolio contact from "+i),f=encodeURIComponent(d+`

- `+i+" ("+r+")");window.location.href="mailto:"+g.email+"?subject="+c+"&body="+f,s("Your email app is opening with the message ready to send.")};return e.jsx("section",{id:"contact",className:"section",children:e.jsxs("div",{className:"container",children:[e.jsxs("header",{className:"section-head reveal",children:[e.jsx("p",{className:"eyebrow",children:"Contact"}),e.jsx("h2",{children:"Open a channel"}),e.jsx("p",{className:"section-sub",children:"Have a project in mind, a role to fill, or just want to talk shop? My inbox is always open."})]}),e.jsxs("div",{className:"contact-grid",children:[e.jsxs("div",{className:"contact-info glass reveal",children:[e.jsx("h3",{children:"Hailing frequencies"}),e.jsxs("a",{className:"contact-mail",href:"mailto:"+g.email,children:[e.jsx("svg",{viewBox:"0 0 24 24",width:"18",height:"18","aria-hidden":"true",children:e.jsx("path",{d:"M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.4 2L12 12.6 19.6 7Z",fill:"currentColor"})}),g.email]}),e.jsxs("a",{className:"contact-phone",href:"tel:"+g.phone,children:[e.jsx("svg",{viewBox:"0 0 24 24",width:"18",height:"18","aria-hidden":"true",children:e.jsx("path",{d:"M6.6 3.5 9.1 3c.6-.1 1.1.2 1.3.8l1.1 3.1c.2.5 0 1.1-.4 1.4l-1.5 1.2a13.5 13.5 0 0 0 5 5l1.2-1.5c.3-.4.9-.6 1.4-.4l3.1 1.1c.6.2.9.7.8 1.3l-.5 2.5c-.1.6-.6 1-1.2 1C10.2 18.5 5.5 13.8 5.5 6.6c0-.5.4-1 1.1-1.1Z",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})}),g.phone]}),e.jsxs("p",{className:"contact-location",children:[e.jsx("svg",{viewBox:"0 0 24 24",width:"18",height:"18","aria-hidden":"true",children:e.jsx("path",{d:"M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Zm0 4.5A2.5 2.5 0 1 0 12 11.5 2.5 2.5 0 0 0 12 6.5Z",fill:"currentColor"})}),g.location]}),e.jsx("ul",{className:"socials","aria-label":"Professional profiles",children:g.socials.map(n=>e.jsx("li",{children:e.jsx("a",{href:n.url,"aria-label":n.label,title:n.label,target:"_blank",rel:"noreferrer",children:e.jsx("svg",{viewBox:"0 0 24 24",width:"20",height:"20","aria-hidden":"true",children:qe[n.icon]})})},n.label))})]}),e.jsxs("form",{className:"contact-form glass reveal",onSubmit:a,children:[e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"cf-name",children:"Name"}),e.jsx("input",{id:"cf-name",name:"name",type:"text",autoComplete:"name",required:!0,placeholder:"Your name"})]}),e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"cf-email",children:"Email"}),e.jsx("input",{id:"cf-email",name:"email",type:"email",autoComplete:"email",required:!0,placeholder:"you@example.com"})]}),e.jsxs("div",{className:"field",children:[e.jsx("label",{htmlFor:"cf-message",children:"Message"}),e.jsx("textarea",{id:"cf-message",name:"message",rows:"5",required:!0,placeholder:"Tell me about your project..."})]}),e.jsxs("button",{type:"submit",className:"btn btn-primary",children:["Transmit message",e.jsx("svg",{viewBox:"0 0 24 24",width:"16",height:"16","aria-hidden":"true",children:e.jsx("path",{d:"M3 11.5 21 3l-6.5 18-3.2-7.3ZM21 3 11.3 13.7",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinejoin:"round",strokeLinecap:"round"})})]}),e.jsx("p",{className:"form-status",role:"status","aria-live":"polite",children:t||"Submitting opens your email app - nothing is stored on this site."})]})]})]})})}function Te(){return e.jsx("footer",{className:"footer",children:e.jsxs("div",{className:"container footer-inner",children:[e.jsxs("p",{children:["© ",new Date().getFullYear()," ",g.name," · Crafted among the stars"]}),e.jsx("p",{className:"footer-note",children:"Live long and prosper 🖖"})]})})}function De(){m.useEffect(()=>{const t=Array.from(document.querySelectorAll(".reveal"));if(document.querySelectorAll("[data-stagger]").forEach(a=>{Array.from(a.children).forEach((n,o)=>{n.style.transitionDelay=`${Math.min(o*90,540)}ms`})}),window.matchMedia("(prefers-reduced-motion: reduce)").matches){t.forEach(a=>a.classList.add("in"));return}const s=new IntersectionObserver(a=>{a.forEach(n=>{n.isIntersecting&&(n.target.classList.add("in"),s.unobserve(n.target))})},{threshold:.12,rootMargin:"0px 0px -8% 0px"});return t.forEach(a=>s.observe(a)),()=>s.disconnect()},[])}function Pe(){return De(),m.useEffect(()=>{document.title=g.name+" - "+g.role},[]),e.jsxs(e.Fragment,{children:[e.jsx(K,{}),e.jsx(te,{}),e.jsx(Se,{}),e.jsxs("main",{id:"main",children:[e.jsx(ke,{}),e.jsx(Ae,{}),e.jsx(Me,{}),e.jsx(Re,{}),e.jsx(Ce,{}),e.jsx(Fe,{}),e.jsx(Ie,{})]}),e.jsx(Te,{}),e.jsx(ne,{}),e.jsx(_,{current:"v3"})]})}Q.createRoot(document.getElementById("root")).render(e.jsx(Pe,{}));
