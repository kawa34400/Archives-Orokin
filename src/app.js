/* ================= OUTILS ================= */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=s=>String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
const entById=id=>ENT.find(e=>e.id===id);
const evById=id=>EVENTS.find(e=>e.id===id);
const arById=id=>ARCH.find(e=>e.id===id);
const wfById=id=>WARFRAMES.find(e=>e.id===id);
const plById=id=>PLACES.find(e=>e.id===id);
const eraOf=v=>ERAS.find(e=>e.id===v.era);
const REDUCED=matchMedia("(prefers-reduced-motion:reduce)").matches;
const ARTIFACT_URL="https://claude.ai/artifact/Ln2WgZrf9o26MT6rLmREc1";
let readSet=new Set();try{readSet=new Set(JSON.parse(localStorage.getItem("ao-read")||"[]"))}catch(e){}
function saveRead(){try{localStorage.setItem("ao-read",JSON.stringify([...readSet]))}catch(e){}}

/* ================= SON (synthèse WebAudio) ================= */
let ac=null,soundOn=false;
try{soundOn=localStorage.getItem("ao-sound")==="1"}catch(e){}
function ctx(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(ac.state==="suspended")ac.resume();return ac}
function tone(f1,f2,dur,type="sine",vol=.05,delay=0){
  if(!soundOn)return;const a=ctx();if(!a)return;const t=a.currentTime+delay;
  const o=a.createOscillator(),g=a.createGain(),flt=a.createBiquadFilter();
  flt.type="lowpass";flt.frequency.value=3200;o.type=type;
  o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(flt);flt.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.02);
}
const sfx={
  tick:()=>tone(2400,1800,.04,"sine",.018),
  nav:()=>{tone(520,880,.14,"triangle",.04);tone(1320,1760,.12,"sine",.02,.05)},
  open:()=>{tone(330,660,.35,"sine",.035);tone(495,990,.35,"sine",.025,.06);tone(742,1480,.4,"sine",.018,.12)},
  close:()=>tone(880,330,.2,"triangle",.03),
  decrypt:()=>{for(let i=0;i<6;i++)tone(900+Math.random()*1600,600+Math.random()*900,.03,"square",.008,i*.05)},
  planet:()=>{tone(180,360,.4,"sine",.04);tone(1080,1440,.25,"sine",.015,.08)}
};
const sb=$("#sound");
function paintSound(){sb.setAttribute("aria-pressed",soundOn);sb.querySelector("span").textContent=soundOn?"Son actif":"Son coupé"}
paintSound();
sb.onclick=()=>{soundOn=!soundOn;try{localStorage.setItem("ao-sound",soundOn?"1":"0")}catch(e){}paintSound();if(soundOn){ctx();sfx.open()}};

/* ================= GLYPHES / EMBLÈMES ================= */
function glyphSVG(text){
  const prims=["M5 1V13","M1 4H9","M1 13 5 1 9 13","M2 2 8 12","M8 2 2 12","M1 7A4 4 0 0 1 9 7","M1 7A4 4 0 0 0 9 7","M3 1H7","M1 10H9","M5 4A2 2 0 1 0 5.01 4"];
  let x=0,out="";
  for(const ch of String(text).toLowerCase()){
    if(ch===" "){x+=8;continue}
    let h=0;for(const c of ch.normalize("NFD"))h=(h*31+c.charCodeAt(0))>>>0;
    const a=prims[h%prims.length],b=prims[(h>>3)%prims.length],c=(h>>6)%3===0?prims[(h>>9)%prims.length]:"";
    out+=`<g class="gl" style="animation-delay:${((h%97)/97*6).toFixed(2)}s" transform="translate(${x} 0)"><path d="${a} ${b} ${c}"/></g>`;x+=12;
  }
  return `<svg viewBox="0 0 ${Math.max(x,1)} 14" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="square" aria-hidden="true">${out}</svg>`;
}
document.querySelectorAll("[data-glyph]").forEach(el=>el.innerHTML=glyphSVG(el.dataset.glyph));
const hashOf=s=>{let h=0;for(const c of s)h=(h*131+c.charCodeAt(0))>>>0;return h};
function sigil(id,extra=""){
  const h=hashOf(id),n=3+(h%4),r1=14+(h>>4)%6,rot=(h>>8)%90;let pts=[];
  for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+rot*Math.PI/180;pts.push((22+r1*Math.cos(a)).toFixed(1)+","+(22+r1*Math.sin(a)).toFixed(1))}
  return `<svg class="sig" ${extra} viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><circle cx="22" cy="22" r="20" opacity=".5"/><polygon points="${pts.join(" ")}"/><circle cx="22" cy="22" r="${3+(h>>12)%4}" ${h%2?'fill="currentColor"':''}/></svg>`;
}
/* casque stylisé de Warframe, symétrique, généré depuis l'identifiant */
function helm(id){
  const h=hashOf(id),R=k=>((h>>k)&15)/15;
  const top=8+R(0)*14,cw=10+R(4)*14,sw=22+R(8)*10,jaw=14+R(12)*12,chin=96-R(16)*10,eyeY=48+R(20)*10;
  const L=[[50-cw,top+10],[50-sw,40],[50-sw+4,70],[50-jaw,chin-10],[50,chin]];
  const P=L.map(p=>p.join(" ")).concat(L.slice(0,-1).reverse().map(([x,y])=>[100-x,y].join(" ")));
  const crest=R(24)>.4?`<path d="M50 ${top-6}V${top+26}"/><path d="M44 ${top}L50 ${top-8}L56 ${top}" />`:`<path d="M${50-cw/2} ${top+4}Q50 ${top-14} ${50+cw/2} ${top+4}"/>`;
  const fins=R(28)>.5?`<path d="M${50-sw} 40L${50-sw-12} ${28+R(2)*10}"/><path d="M${50+sw} 40L${50+sw+12} ${28+R(2)*10}"/>`:"";
  return `<svg viewBox="0 -10 100 115" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true">
    <path d="M50 ${top}L${P.join("L")}Z"/>${crest}${fins}
    <path d="M${50-sw+8} ${eyeY}Q50 ${eyeY+8} ${50+sw-8} ${eyeY}" stroke-width="2.4" style="filter:drop-shadow(0 0 3px #fff0c4)"/>
    <path d="M50 ${eyeY+12}V${chin-6}" opacity=".5"/></svg>`;
}

/* ================= TOAST & PARTAGE ================= */
let toastT;
function toast(msg){const t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
function linkFor(token){
  let framed=false;try{framed=window.self!==window.top}catch(e){framed=true}
  return (framed?ARTIFACT_URL:location.href.split("#")[0])+"#"+token;
}
function share(token){
  const url=linkFor(token);
  const done=()=>toast("Lien copié : "+url);
  try{navigator.clipboard.writeText(url).then(done,()=>toast(url))}catch(e){toast(url)}
  sfx.tick();
}
function setHash(token){try{history.replaceState(null,"","#"+token)}catch(e){}}


/* ================= TEXTES LONGS & RÉVÉLATIONS ================= */
let spoilOn=false;try{spoilOn=localStorage.getItem("ao-spoil")==="1"}catch(e){}
const paras=b=>[].concat(b||[]).map(p=>`<p>${esc(p)}</p>`).join("");
function spoilBlock(keys){
  if(!keys||!keys.length)return"";
  return `<div class="reveal ${spoilOn?"open":""}"><p class="lab">Révélations</p>
    <ul class="keys">${keys.map(k=>`<li>${esc(k)}</li>`).join("")}</ul>
    <button class="unveil pg" type="button">◇ Afficher les révélations</button></div>`;
}
function bindReveal(scope){scope.querySelectorAll(".reveal .unveil").forEach(b=>b.onclick=()=>{b.closest(".reveal").classList.add("open");sfx.decrypt()})}
const spBtn=$("#spoil");
function paintSpoil(){spBtn.setAttribute("aria-pressed",spoilOn);spBtn.querySelector("span").textContent=spoilOn?"Révélations visibles":"Révélations masquées";document.querySelectorAll(".reveal").forEach(r=>r.classList.toggle("open",spoilOn))}
spBtn.onclick=()=>{spoilOn=!spoilOn;try{localStorage.setItem("ao-spoil",spoilOn?"1":"0")}catch(e){}paintSpoil();sfx.tick()};
paintSpoil();

/* ================= NAVIGATION ================= */
const ROOMS=["chronologie","carte","archives","index","warframes"];
let room="chronologie";
function go(r,silent){
  if(!ROOMS.includes(r))r="chronologie";
  if(r!=="chronologie")stopGuide();
  room=r;
  ROOMS.forEach(x=>{const el=$("#room-"+x),was=el.hidden;el.hidden=x!==r;if(x===r&&was)fadeIn(el);$("#tab-"+x).setAttribute("aria-selected",x===r)});
  if(!silent){setHash(r);sfx.nav()}
}
document.querySelectorAll("nav.rooms button").forEach(b=>b.onclick=()=>go(b.dataset.room));
const PREFIX={ev:"chronologie",pl:"carte",ar:"archives",en:"index",wf:"warframes"};
function openToken(tok,fromLoad){
  const m=/^(ev|pl|ar|en|wf)-(.+)$/.exec(tok||"");
  if(!m){go(tok,fromLoad);return}
  const [,p,id]=m;closeDz(true);closeFind();
  if(p==="ev"){const k=EVENTS.findIndex(v=>v.id===id);if(k<0)return go("chronologie");go("chronologie",true);show(k,fromLoad);setHash(tok);if(!fromLoad)$("#room-chronologie").scrollIntoView({behavior:REDUCED?"auto":"smooth"})}
  else if(p==="pl"){if(!plById(id))return go("carte");go("carte",true);selectPlace(id,fromLoad);setHash(tok);if(!fromLoad)$("#room-carte").scrollIntoView({behavior:REDUCED?"auto":"smooth"})}
  else{go(PREFIX[p],true);({ar:openFile,en:openEnt,wf:openWf})[p](id)}
}
addEventListener("hashchange",()=>{const t=location.hash.slice(1);if(t)openToken(t,true)});

/* compteurs */
function count(el,n){if(REDUCED){el.textContent=n;return}let i=0;const step=()=>{i=Math.min(n,i+1);el.textContent=i;if(i<n)setTimeout(step,24)};el.textContent=0;step()}
count($("#n-ev"),EVENTS.length);count($("#n-ar"),ARCH.length);count($("#n-en"),ENT.length);count($("#n-wf"),WARFRAMES.length);

/* ================= CHRONOLOGIE ================= */
const TLW=Math.max(1500,EVENTS.length*70),tl=$("#tl");let cur=0;
tl.style.minWidth=TLW+"px";tl.style.setProperty("--tlw",TLW+"px");
(function buildTL(){
  const per=ERAS.map(e=>EVENTS.filter(v=>v.era===e.id).length),tot=per.reduce((a,b)=>a+b,0);
  let x=0,html="";
  ERAS.forEach((e,i)=>{
    const w=TLW*per[i]/tot;
    html+=`<div class="eraband" style="left:${x}px;width:${w}px"><span>${esc(e.label)}</span><small>${esc(e.sub)}</small></div>`;
    EVENTS.filter(v=>v.era===e.id).forEach((v,j,arr)=>{
      const nx=x+w*(j+.5)/arr.length,k=EVENTS.indexOf(v);
      html+=`<button class="node ${k%2?"dn":"up"}" style="left:${nx}px" data-k="${k}" aria-label="${esc(v.title)}"><span class="lbl">${esc(v.title)}</span></button>`;
    });
    x+=w;
  });
  tl.innerHTML=`<div class="axis"></div>`+html;
  tl.querySelectorAll(".node").forEach(n=>{n.onclick=()=>{stopGuide();show(+n.dataset.k)};n.onmouseenter=sfx.tick});
  $("#era-chips").innerHTML=ERAS.map(e=>`<button class="chip pg" data-era="${e.id}" aria-pressed="false">${esc(e.label)}</button>`).join("");
  $("#era-chips").querySelectorAll(".chip").forEach(c=>c.onclick=()=>{stopGuide();show(EVENTS.findIndex(v=>v.era===c.dataset.era))});
})();
function show(k,quiet){
  cur=Math.max(0,Math.min(EVENTS.length-1,k));const v=EVENTS[cur],era=eraOf(v);
  tl.querySelectorAll(".node").forEach(n=>n.setAttribute("aria-current",+n.dataset.k===cur));
  $("#era-chips").querySelectorAll(".chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.era===v.era));
  const node=tl.querySelector(`.node[data-k="${cur}"]`),sc=$("#tl-scroll");
  sc.scrollTo({left:node.offsetLeft-sc.clientWidth/2,behavior:quiet||REDUCED?"auto":"smooth"});
  const links=v.links.map(entById).filter(Boolean),files=ARCH.filter(a=>a.rev.includes(v.id)),
        places=(v.place||[]).map(plById).filter(Boolean),wfs=WARFRAMES.filter(w=>w.ev.includes(v.id));
  $("#detail").innerHTML=`
   <div class="main">
     <div class="when">${esc(era.label)} · ${esc(v.when)}</div>
     <h3>${esc(v.title)}</h3>
     <p class="sum">${esc(v.sum)}</p>
     ${paras(v.body)}
     ${spoilBlock(v.keys)}
     <div class="stepper">
       <button class="pg" id="prev" ${cur===0?"disabled":""}>◁ Précédent</button>
       <button class="pg" id="next" ${cur===EVENTS.length-1?"disabled":""}>Suivant ▷</button>
       <span style="font-family:var(--f-mono);font-size:12px;color:var(--mute);align-self:center;margin-left:6px">${String(cur+1).padStart(2,"0")} / ${EVENTS.length}</span>
       <button class="share pg" data-share="ev-${v.id}">⧉ Copier le lien</button>
     </div>
   </div>
   <aside>
     <p class="lab">Sources</p>
     <ul class="srcs">${v.src.map(s=>`<li><b>${esc(s[0])}</b><span>${esc(s[1])}</span></li>`).join("")}</ul>
     ${links.length?`<p class="lab">Entités liées</p><div class="links" style="margin-bottom:18px">${links.map(e=>`<button class="link pg" data-go="en-${e.id}">${esc(e.name)}</button>`).join("")}</div>`:""}
     ${places.length?`<p class="lab">Lieux</p><div class="links" style="margin-bottom:18px">${places.map(p=>`<button class="link pg" data-go="pl-${p.id}">◎ ${esc(p.name)}</button>`).join("")}</div>`:""}
     ${wfs.length?`<p class="lab">Warframes</p><div class="links" style="margin-bottom:18px">${wfs.map(w=>`<button class="link pg" data-go="wf-${w.id}">${esc(w.name)}</button>`).join("")}</div>`:""}
     ${files.length?`<p class="lab">Dossiers d'archives</p><div class="links">${files.map(a=>`<button class="link pg" data-go="ar-${a.id}">${esc(a.title)}</button>`).join("")}</div>`:""}
   </aside>`;
  fadeIn($("#detail"));
  $("#prev").onclick=()=>{stopGuide();show(cur-1)};$("#next").onclick=()=>{stopGuide();show(cur+1)};
  bindGo($("#detail"));
  if(room==="chronologie"&&!quiet)setHash("ev-"+v.id);
  if(!quiet)sfx.tick();
}
function fadeIn(el){if(REDUCED)return;el.classList.remove("fade");void el.offsetWidth;el.classList.add("fade")}
function bindGo(scope){
  bindReveal(scope);
  scope.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{stopGuide();openToken(b.dataset.go);sfx.nav()});
  scope.querySelectorAll("[data-share]").forEach(b=>b.onclick=()=>share(b.dataset.share));
}

/* ---------- lecture guidée ---------- */
const G={on:false,raf:0,t0:0,dur:0};
const canSpeak="speechSynthesis" in window;
if(!canSpeak)$(".g-voice").hidden=true;
function guideText(v){return v.title+". "+v.sum+" "+[].concat(v.body).join(" ")+(spoilOn&&v.keys&&v.keys.length?" Révélations. "+v.keys.join(" "):"")}
function stopGuide(){
  if(!G.on)return;G.on=false;cancelAnimationFrame(G.raf);
  try{canSpeak&&speechSynthesis.cancel()}catch(e){}
  $("#g-play").setAttribute("aria-pressed","false");$("#g-play").textContent="▶ Lecture guidée";
  $("#g-fill").style.width="0";$("#g-txt").textContent="Lecture interrompue à l'événement "+(cur+1)+".";
}
function guideStep(){
  if(!G.on)return;const v=EVENTS[cur];
  $("#g-txt").textContent=`${cur+1} / ${EVENTS.length} · ${v.title}`;
  const next=()=>{if(!G.on)return;if(cur>=EVENTS.length-1){stopGuide();$("#g-txt").textContent="Fin de la chronologie.";return}show(cur+1);guideStep()};
  if($("#g-voice").checked&&canSpeak){
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(guideText(v));u.lang="fr-FR";u.rate=1;u.pitch=.9;
      const fr=speechSynthesis.getVoices().find(x=>/^fr/i.test(x.lang));if(fr)u.voice=fr;
      const est=guideText(v).length*62;G.t0=performance.now();G.dur=est;
      u.onend=()=>{cancelAnimationFrame(G.raf);setTimeout(next,500)};
      speechSynthesis.speak(u);
      const fill=()=>{if(!G.on)return;$("#g-fill").style.width=Math.min(100,(performance.now()-G.t0)/G.dur*100)+"%";G.raf=requestAnimationFrame(fill)};fill();
      return;
    }catch(e){}
  }
  G.t0=performance.now();G.dur=Math.max(7000,guideText(v).length*45);
  const loop=()=>{if(!G.on)return;const p=(performance.now()-G.t0)/G.dur;$("#g-fill").style.width=Math.min(100,p*100)+"%";if(p>=1)next();else G.raf=requestAnimationFrame(loop)};
  loop();
}
$("#g-play").onclick=()=>{
  if(G.on){stopGuide();return}
  G.on=true;$("#g-play").setAttribute("aria-pressed","true");$("#g-play").textContent="❚❚ Pause";sfx.open();
  show(cur);guideStep();
};

document.addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openFind();return}
  if(!$("#finder").hidden){findKeys(e);return}
  if(!$("#veil").hidden){if(e.key==="Escape")closeDz();return}
  if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;
  if(e.key==="/"){e.preventDefault();openFind();return}
  if(room!=="chronologie")return;
  if(e.key==="ArrowRight"){stopGuide();show(cur+1)}if(e.key==="ArrowLeft"){stopGuide();show(cur-1)}
});

/* ================= CARTE ================= */
let curPlace=null;
const evAt=id=>EVENTS.filter(v=>(v.place||[]).includes(id));
function polar(r,a){const rad=a*Math.PI/180;return[500+Math.cos(rad)*r*440,300+Math.sin(rad)*r*250]}
(function buildMap(){
  const orb=PLACES.filter(p=>!p.off&&!p.moon),rings=[...new Set(orb.map(p=>p.r))];
  let s=`<svg viewBox="0 0 1000 600" role="group" aria-label="Carte du système Origine">
   <defs><radialGradient id="sunG"><stop offset="0" stop-color="#fff6d8"/><stop offset=".25" stop-color="#ffd27a"/><stop offset=".6" stop-color="rgba(240,170,50,.35)"/><stop offset="1" stop-color="rgba(240,170,50,0)"/></radialGradient></defs>
   <g class="spin2" opacity=".35" fill="none" stroke="#f0bd4f"><circle cx="500" cy="300" r="62" stroke-dasharray="1 9"/><path d="M500 228A72 72 0 0 1 572 300" /></g>
   <g class="spin" opacity=".5" fill="none" stroke="#f0bd4f" stroke-width=".8"><circle cx="500" cy="300" r="48" stroke-dasharray="30 8 2 8"/></g>
   <circle class="sun" cx="500" cy="300" r="60"/>`;
  rings.forEach(r=>{s+=`<ellipse class="orbit" data-r="${r}" cx="500" cy="300" rx="${r*440}" ry="${r*250}"/>`});
  PLACES.filter(p=>!p.off).forEach(p=>{
    let [x,y]=polar(p.r,p.a);const [px,py]=[x,y];if(p.moon){const [ox,oy]=polar(p.r+.09,p.a-14);x=ox;y=oy}
    const n=evAt(p.id).length,rad=p.moon?5:(n>2?10:8);
    const lx=p.moon?x+12:x,ly=p.moon?y-8:y+rad+16,anchor=p.moon?"start":"middle";
    s+=`<g class="pl" tabindex="0" role="button" aria-pressed="false" data-pl="${p.id}" aria-label="${esc(p.name)}, ${n} événement${n>1?"s":""}">
      ${p.moon?`<line x1="${px}" y1="${py}" x2="${x}" y2="${y}" stroke="rgba(240,189,79,.35)" stroke-dasharray="2 3"/>`:""}
      <circle class="halo" cx="${x}" cy="${y}" r="${rad+8}" stroke-dasharray="3 4"/>
      <circle class="core" cx="${x}" cy="${y}" r="${rad}"/>
      <text x="${lx}" y="${ly}" text-anchor="${anchor}">${esc(p.name)}${n?` <tspan class="cnt">·${n}</tspan>`:""}</text></g>`;
  });
  s+=`</svg><div class="offrow"><p class="lab">Hors orbite</p>${PLACES.filter(p=>p.off).map(p=>`<button class="off pg" data-pl="${p.id}" aria-pressed="false">${esc(p.name)} <span style="color:var(--gold);font-family:var(--f-mono);font-size:11px">·${evAt(p.id).length}</span></button>`).join("")}</div>`;
  $("#map").innerHTML=s;
  $("#map").querySelectorAll("[data-pl]").forEach(g=>{
    g.onclick=()=>{selectPlace(g.dataset.pl);setHash("pl-"+g.dataset.pl)};
    g.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();g.onclick()}};
    g.onmouseenter=sfx.tick;
  });
})();
function selectPlace(id,quiet){
  const p=plById(id);if(!p)return;curPlace=id;
  $("#map").querySelectorAll("[data-pl]").forEach(g=>g.setAttribute("aria-pressed",g.dataset.pl===id));
  $("#map").querySelectorAll(".orbit").forEach(o=>o.classList.toggle("hot",!p.off&&+o.dataset.r===p.r));
  const evs=evAt(id);
  $("#place").innerHTML=`
    <div class="ctrl">${p.off?"Hors orbite":"Orbite"} · ${esc(p.ctrl)}</div>
    <h3>${esc(p.name)}</h3><span class="glyphs">${glyphSVG(p.name)}</span>
    <p>${esc(p.sum)}</p>
    <p class="lab" style="margin-top:18px">${evs.length?`Dans la chronologie (${evs.length})`:"Aucun événement de la frise ici pour l'instant"}</p>
    <ul class="evlist">${evs.map(v=>`<li><button data-go="ev-${v.id}">${esc(v.title)}<small>${esc(eraOf(v).label)} · ${esc(v.when)}</small></button></li>`).join("")}</ul>
    <div class="dz-tools"><button class="share pg" data-share="pl-${p.id}">⧉ Copier le lien</button></div>`;
  fadeIn($("#place"));bindGo($("#place"));
  if(!quiet)sfx.planet();
}

/* ================= ARCHIVES ================= */
const TYPES=[...new Set(ARCH.map(a=>a.type))];let arType=null;
$("#ar-chips").innerHTML=TYPES.map(t=>`<button class="chip pg" data-t="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("");
$("#ar-chips").querySelectorAll(".chip").forEach(c=>c.onclick=()=>{arType=arType===c.dataset.t?null:c.dataset.t;$("#ar-chips").querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x.dataset.t===arType));renderFiles();sfx.tick()});
$("#ar-q").oninput=renderFiles;
function renderFiles(){
  const q=norm($("#ar-q").value.trim());
  const list=ARCH.filter(a=>(!arType||a.type===arType)&&(!q||norm(a.title+" "+a.teaser+" "+a.body.join(" ")+" "+a.where).includes(q)));
  $("#files").innerHTML=list.length?list.map(a=>`
    <button class="file bv ${readSet.has(a.id)?"read":""}" data-file="${a.id}">
      <div class="meta"><span>${esc(a.type)}</span><span>DOS-${String(ARCH.indexOf(a)+1).padStart(3,"0")}</span></div>
      <h4>${esc(a.title)}</h4><p>${esc(a.teaser)}</p>
      <div class="lvl">${[1,2,3,4].map(i=>`<i class="${i<=a.lvl?"on":""}"></i>`).join("")}<span>Niveau ${a.lvl} · ${esc(a.canon)}</span></div>
    </button>`).join(""):`<p class="empty">Aucun dossier ne correspond. Essayez un autre terme.</p>`;
  $("#files").querySelectorAll(".file").forEach(f=>{f.onclick=()=>openFile(f.dataset.file);f.onmouseenter=sfx.tick});
}
renderFiles();

/* ================= INDEX ================= */
let enType=null;const ETYPES=[["Personnage","Personnages"],["Faction","Factions"],["Syndicat","Syndicats"]];
$("#en-chips").innerHTML=ETYPES.map(([t,l])=>`<button class="chip pg" data-t="${t}" aria-pressed="false">${l}</button>`).join("");
$("#en-chips").querySelectorAll(".chip").forEach(c=>c.onclick=()=>{enType=enType===c.dataset.t?null:c.dataset.t;$("#en-chips").querySelectorAll(".chip").forEach(x=>x.setAttribute("aria-pressed",x.dataset.t===enType));renderIdx();sfx.tick()});
$("#en-q").oninput=renderIdx;
function renderIdx(){
  const q=norm($("#en-q").value.trim());
  const list=ENT.filter(e=>(!enType||e.type===enType)&&(!q||norm(e.name+" "+e.aff+" "+e.sum).includes(q)));
  $("#idx").innerHTML=list.length?list.map(e=>`
   <button class="ent bv" data-ent="${e.id}">${sigil(e.id)}<div><h4>${esc(e.name)}</h4><small>${esc(e.type)} · ${esc(e.aff)}</small><p>${esc(e.sum)}</p></div></button>`).join(""):`<p class="empty">Aucune entité ne correspond.</p>`;
  $("#idx").querySelectorAll(".ent").forEach(f=>{f.onclick=()=>openEnt(f.dataset.ent);f.onmouseenter=sfx.tick});
}
renderIdx();

/* ================= WARFRAMES ================= */
$("#wf-q").oninput=renderWf;
function renderWf(){
  const q=norm($("#wf-q").value.trim());
  const list=WARFRAMES.filter(w=>!q||norm(w.name+" "+w.role+" "+w.q+" "+w.sum).includes(q));
  $("#wfs").innerHTML=list.length?list.map(w=>`
   <button class="wf bv" data-wf="${w.id}">
     <div class="plate"><span class="no">WF-${String(WARFRAMES.indexOf(w)+1).padStart(2,"0")}</span>${helm(w.id)}</div>
     <div class="txt"><h4>${esc(w.name)}</h4><small>${esc(w.role)}</small><p>${esc(w.q==="—"?"Récit hors quête":"Quête : "+w.q)}</p></div>
   </button>`).join(""):`<p class="empty">Aucune Warframe ne correspond.</p>`;
  $("#wfs").querySelectorAll(".wf").forEach(f=>{f.onclick=()=>openWf(f.dataset.wf);f.onmouseenter=sfx.tick});
}
renderWf();

/* ================= DOSSIER (modal) ================= */
const audioClips={};let curAudio=null,lastFocus=null,dzRoom=null;
function openDz(html,token){
  stopGuide();lastFocus=document.activeElement;dzRoom=room;
  $("#dossier").innerHTML=`<button class="x pg" id="dz-x">Fermer ✕</button>`+html+
    `<div class="dz-tools"><button class="share pg" data-share="${token}">⧉ Copier le lien</button></div>`;
  $("#veil").hidden=false;$("#dz-x").onclick=()=>closeDz();$("#dz-x").focus();
  bindGo($("#dossier"));setHash(token);sfx.open();
}
function closeDz(silent){
  if($("#veil").hidden)return;$("#veil").hidden=true;
  if(curAudio){curAudio.pause();curAudio=null}
  if(!silent){sfx.close();setHash(room);lastFocus&&lastFocus.focus()}
}
$("#veil").addEventListener("click",e=>{if(e.target.id==="veil")closeDz()});

function scramble(el,text){
  if(!el)return;if(REDUCED||document.documentElement.classList.contains("calm")){el.textContent=text;return}
  const chars="◇◆△▽○●□■⟁⌬⏃⏁⏂";let f=0;const total=18;
  const tick=()=>{f++;const n=Math.floor(text.length*f/total);
    el.textContent=text.slice(0,n)+text.slice(n).replace(/\S/g,()=>chars[Math.random()*chars.length|0]);
    if(f<total)requestAnimationFrame(tick);else el.textContent=text};
  tick();
}
const evButtons=evs=>evs.map(v=>`<button class="link pg" data-go="ev-${v.id}">${esc(v.title)}</button>`).join("");
function openFile(id){
  const a=arById(id);if(!a)return;
  readSet.add(id);saveRead();
  const evs=a.rev.map(evById).filter(Boolean),wf=a.wf&&wfById(a.wf);
  openDz(`
   <span class="stamp">Classifié · Niveau ${a.lvl}</span>
   <h3 id="dz-title">${esc(a.title)}</h3>
   <span class="glyphs">${glyphSVG(a.title)}</span>
   <div class="kv"><div class="holo"><span>Type</span><b>${esc(a.type)}</b></div><div class="holo"><span>Où le trouver</span><b>${esc(a.where)}</b></div><div class="holo"><span>Statut canonique</span><b>${esc(a.canon)}</b></div></div>
   <div class="body">${a.body.map((p,i)=>`<p data-p="${i}"></p>`).join("")}</div>
   <p class="lab" style="margin-top:22px">Événements éclairés</p>
   <div class="links">${evButtons(evs)}${wf?`<button class="link pg" data-go="wf-${wf.id}">Warframe : ${esc(wf.name)}</button>`:""}</div>`,"ar-"+id);
  sfx.decrypt();
  a.body.forEach((p,i)=>setTimeout(()=>scramble($(`#dossier [data-p="${i}"]`),p),i*160));
  renderFiles();
}
function openEnt(id){
  const e=entById(id);if(!e)return;
  const evs=EVENTS.filter(v=>v.links.includes(id)),wf=WARFRAMES.find(w=>w.ent===id);
  openDz(`
   <span class="stamp">${esc(e.type)}</span>
   <div style="display:flex;gap:16px;align-items:center;margin-top:8px">${sigil(e.id,'style="width:64px;height:64px;color:var(--gold);flex:none;filter:drop-shadow(0 0 4px rgba(255,200,90,.8))"')}<h3 id="dz-title" style="margin:0">${esc(e.name)}</h3></div>
   <span class="glyphs">${glyphSVG(e.name)}</span>
   <div class="kv"><div class="holo"><span>Allégeance</span><b>${esc(e.aff)}</b></div><div class="holo"><span>Statut</span><b>${esc(e.st)}</b></div><div class="holo"><span>Apparitions</span><b>${evs.length} événement${evs.length>1?"s":""}</b></div></div>
   <div class="body"><p data-p="0" class="lead"></p>${(e.bio||[]).map(p=>`<p>${esc(p)}</p>`).join("")}</div>
   ${evs.length||wf?`<p class="lab" style="margin-top:22px">Dans la chronologie</p><div class="links">${evButtons(evs)}${wf?`<button class="link pg" data-go="wf-${wf.id}">Fiche Warframe</button>`:""}</div>`:""}
   ${e.type==="Personnage"?`
   <div class="audio bv">
     <button class="play" id="ap" ${audioClips[id]?"":"disabled"} aria-label="Écouter l'extrait">▶</button>
     <div class="txt"><b>Transmission de ${esc(e.name)}</b><span id="ap-s">${audioClips[id]?esc(audioClips[id].name):"Aucun extrait chargé. Ajoutez un fichier audio (enregistrement personnel, extrait sous licence)."}</span></div>
     <div class="wave" id="wave">${"<i></i>".repeat(16)}</div>
     <label for="ap-f">Charger un extrait</label><input id="ap-f" type="file" accept="audio/*">
   </div>`:""}`,"en-"+id);
  scramble($('#dossier [data-p="0"]'),e.sum);
  if(e.type==="Personnage")bindAudio(id);
}
function openWf(id){
  const w=wfById(id);if(!w)return;
  const evs=w.ev.map(evById).filter(Boolean),a=w.arch&&arById(w.arch),en=w.ent&&entById(w.ent);
  openDz(`
   <span class="stamp">Warframe · WF-${String(WARFRAMES.indexOf(w)+1).padStart(2,"0")}</span>
   <div style="display:grid;grid-template-columns:110px minmax(0,1fr);gap:20px;align-items:center;margin-top:10px">
     <div style="color:var(--gold);filter:drop-shadow(0 0 6px rgba(255,200,90,.7))">${helm(w.id)}</div>
     <div><h3 id="dz-title" style="margin:0">${esc(w.name)}</h3><span class="glyphs" style="margin-bottom:0">${glyphSVG(w.name)}</span></div>
   </div>
   <div class="kv"><div class="holo"><span>Archétype</span><b>${esc(w.role)}</b></div><div class="holo"><span>Quête</span><b>${esc(w.q==="—"?"Aucune quête dédiée":w.q)}</b></div></div>
   <div class="body"><p data-p="0"></p></div>
   <p class="lab" style="margin-top:20px">Sources</p>
   <ul class="srcs">${w.src.map(s=>`<li><b>${esc(s[0])}</b><span>${esc(s[1])}</span></li>`).join("")}</ul>
   <p class="lab">Liens</p>
   <div class="links">${evButtons(evs)}${a?`<button class="link pg" data-go="ar-${a.id}">Dossier : ${esc(a.title)}</button>`:""}${en?`<button class="link pg" data-go="en-${en.id}">Fiche : ${esc(en.name)}</button>`:""}</div>`,"wf-"+id);
  scramble($('#dossier [data-p="0"]'),w.sum);
}
function bindAudio(id){
  const btn=$("#ap"),inp=$("#ap-f"),bars=[...$("#wave").children];let raf;
  inp.onchange=()=>{const f=inp.files[0];if(!f)return;if(audioClips[id])URL.revokeObjectURL(audioClips[id].url);audioClips[id]={url:URL.createObjectURL(f),name:f.name};btn.disabled=false;$("#ap-s").textContent=f.name+" · prêt"};
  btn.onclick=()=>{
    if(curAudio&&!curAudio.paused){curAudio.pause();return}
    const a=ctx();curAudio=new Audio(audioClips[id].url);
    let an=null;try{if(a){const s=a.createMediaElementSource(curAudio);an=a.createAnalyser();an.fftSize=64;s.connect(an);an.connect(a.destination)}}catch(e){an=null}
    const d=an?new Uint8Array(an.frequencyBinCount):null;
    const draw=()=>{if(an){an.getByteFrequencyData(d);bars.forEach((b,i)=>b.style.height=(15+d[i+1]/255*85)+"%")}else bars.forEach(b=>b.style.height=(20+Math.random()*70)+"%");raf=requestAnimationFrame(draw)};
    curAudio.onplay=()=>{btn.textContent="❚❚";draw()};
    curAudio.onpause=curAudio.onended=()=>{btn.textContent="▶";cancelAnimationFrame(raf);bars.forEach(b=>b.style.height="20%")};
    curAudio.play().catch(()=>{$("#ap-s").textContent="Lecture impossible pour ce fichier."});
  };
}

/* ================= RECHERCHE GLOBALE ================= */
const INDEX=[
  ...EVENTS.map(v=>({tok:"ev-"+v.id,g:"Événements",t:v.title,s:eraOf(v).label+" · "+v.when,txt:v.title+" "+v.sum+" "+[].concat(v.body).join(" ")+" "+v.src.map(s=>s[1]).join(" ")})),
  ...PLACES.map(p=>({tok:"pl-"+p.id,g:"Lieux",t:p.name,s:p.ctrl,txt:p.name+" "+p.ctrl+" "+p.sum})),
  ...ENT.map(e=>({tok:"en-"+e.id,g:"Index",t:e.name,s:e.type+" · "+e.aff,txt:e.name+" "+e.aff+" "+e.sum+" "+(e.bio||[]).join(" ")})),
  ...WARFRAMES.map(w=>({tok:"wf-"+w.id,g:"Warframes",t:w.name,s:w.role,txt:w.name+" "+w.role+" "+w.q+" "+w.sum})),
  ...ARCH.map(a=>({tok:"ar-"+a.id,g:"Archives",t:a.title,s:a.type+" · "+a.where,txt:a.title+" "+a.teaser+" "+a.body.join(" ")+" "+a.where}))
].map(x=>({...x,nt:norm(x.t),ntxt:norm(x.txt)}));
let findSel=0,findList=[];
function openFind(){stopGuide();$("#finder").hidden=false;$("#find-q").value="";runFind();$("#find-q").focus();sfx.open()}
function closeFind(){if($("#finder").hidden)return;$("#finder").hidden=true}
$("#find").onclick=openFind;
$("#finder").addEventListener("click",e=>{if(e.target.id==="finder")closeFind()});
$("#find-q").oninput=runFind;
function runFind(){
  const q=norm($("#find-q").value.trim()),words=q.split(/\s+/).filter(Boolean);
  if(!words.length){findList=INDEX.filter(x=>x.g==="Événements").slice(0,0).concat(["ev-zariman","en-ballas","pl-lune","wf-umbra-wf","ar-leverian"].map(t=>INDEX.find(x=>x.tok===t)).filter(Boolean))}
  else findList=INDEX.map(x=>{let sc=0;for(const w of words){if(x.nt.includes(w))sc+=x.nt.startsWith(w)?6:4;else if(x.ntxt.includes(w))sc+=1;else return null}return{...x,sc}}).filter(Boolean).sort((a,b)=>b.sc-a.sc).slice(0,24);
  findSel=0;
  const groups={};findList.forEach((x,i)=>{(groups[x.g]=groups[x.g]||[]).push([x,i])});
  $("#find-res").innerHTML=findList.length?(words.length?"":`<div class="grp">Suggestions</div>`)+Object.entries(groups).map(([g,arr])=>(words.length?`<div class="grp">${esc(g)}</div>`:"")+arr.map(([x,i])=>`<button role="option" data-i="${i}" aria-selected="${i===0}"><span>${esc(x.t)}<small>${esc(x.s)}</small></span></button>`).join("")).join(""):`<p class="none">Rien dans le registre pour « ${esc($("#find-q").value)} ».</p>`;
  $("#find-res").querySelectorAll("button").forEach(b=>{b.onclick=()=>pickFind(+b.dataset.i);b.onmouseenter=()=>{findSel=+b.dataset.i;paintSel()}});
}
function paintSel(){$("#find-res").querySelectorAll("button").forEach(b=>{const on=+b.dataset.i===findSel;b.setAttribute("aria-selected",on);if(on)b.scrollIntoView({block:"nearest"})})}
function pickFind(i){const x=findList[i];if(!x)return;closeFind();openToken(x.tok);sfx.nav()}
function findKeys(e){
  if(e.key==="Escape"){closeFind();sfx.close()}
  else if(e.key==="ArrowDown"){e.preventDefault();findSel=Math.min(findList.length-1,findSel+1);paintSel()}
  else if(e.key==="ArrowUp"){e.preventDefault();findSel=Math.max(0,findSel-1);paintSel()}
  else if(e.key==="Enter"){e.preventDefault();pickFind(findSel)}
}

