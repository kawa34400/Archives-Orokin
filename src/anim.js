/* ================= ANIMATIONS (moteur unique, 30 i/s, pause hors écran) ================= */
const PRIMS=["M5 1V13","M1 4H9","M1 13 5 1 9 13","M2 2 8 12","M8 2 2 12","M1 7A4 4 0 0 1 9 7","M1 7A4 4 0 0 0 9 7","M3 1H7","M1 10H9","M5 4A2 2 0 1 0 5.01 4"];
const GLYPHS=Array.from({length:40},(_,i)=>{const h=(i*2654435761)>>>0;return new Path2D(PRIMS[h%10]+" "+PRIMS[(h>>3)%10]+((h>>6)%3===0?" "+PRIMS[(h>>9)%10]:""))});
const DPR=()=>Math.min(1.5,devicePixelRatio||1);

/* réglage animations : préférence système, puis choix mémorisé */
let animOn=!REDUCED;try{const s=localStorage.getItem("ao-anim");if(s!==null)animOn=s==="1"}catch(e){}
const animBtn=$("#anim");
function paintAnim(){document.documentElement.classList.toggle("calm",!animOn);animBtn.setAttribute("aria-pressed",animOn);animBtn.querySelector("span").textContent=animOn?"Animations":"Animations coupées"}
animBtn.onclick=()=>{animOn=!animOn;try{localStorage.setItem("ao-anim",animOn?"1":"0")}catch(e){}paintAnim();sfx.tick();kick()};

/* sprites de glyphes pré-rendus (pas de shadowBlur par image) */
function sprite(i,px,color,glow){
  const c=document.createElement("canvas"),pad=glow?6:1;c.width=px+pad*2;c.height=px*1.4+pad*2;
  const g=c.getContext("2d");g.translate(pad,pad);g.scale(px/10,px*1.4/14);
  g.lineWidth=10/px;g.strokeStyle=color;if(glow){g.shadowBlur=5;g.shadowColor="#f0bd4f"}g.stroke(GLYPHS[i]);return c;
}

/* ----- fond : colonnes de glyphes ----- */
const BG=(function(){
  const c=$("#bg"),g=c.getContext("2d",{alpha:true});let w,h,d,cols=[],dim=[],hot=[],gs;
  function size(){d=DPR();w=c.width=innerWidth*d;h=c.height=innerHeight*d;gs=Math.round(11*d);
    dim=GLYPHS.map((_,i)=>sprite(i,gs,"rgba(240,189,79,1)",false));hot=GLYPHS.map((_,i)=>sprite(i,gs,"#ffe9b0",true));
    const step=58*d;cols=[];for(let x=step*.5;x<w;x+=step){if(Math.random()<.5)continue;
      cols.push({x,speed:(6+Math.random()*12)*d,off:Math.random()*h,seed:Math.random()*40|0,len:6+Math.random()*12|0})}}
  size();let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(()=>{size();draw(performance.now())},150)});
  function draw(t){
    g.clearRect(0,0,w,h);
    const vg=g.createRadialGradient(w*.72,h*.3,0,w*.72,h*.3,Math.max(w,h)*.7);
    vg.addColorStop(0,"rgba(70,48,10,.22)");vg.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=vg;g.fillRect(0,0,w,h);
    const gap=gs*1.9;
    for(let ci=0;ci<cols.length;ci++){const col=cols[ci];
      const y0=((t/1000*col.speed+col.off)%(h+col.len*gap))-col.len*gap;
      for(let k=0;k<col.len;k++){
        const y=y0+k*gap;if(y<-gap||y>h)continue;const idx=(col.seed+k*7+ci)%40;
        if(Math.sin(t*.0017+ci*3.1+k*1.3)>.985){g.globalAlpha=.9;g.drawImage(hot[idx],col.x-gs/2-6,y-6)}
        else{g.globalAlpha=.05+.11*(k/col.len);g.drawImage(dim[idx],col.x-gs/2-1,y-1)}
      }}
    g.globalAlpha=1;
  }
  return{draw,fps:20,last:0,visible:()=>true};
})();

/* ----- héros : diagramme holographique, lueur en une seule passe ----- */
const HOLO=(function(){
  const c=$("#holo"),g=c.getContext("2d"),sharp=document.createElement("canvas"),s=sharp.getContext("2d"),
        half=document.createElement("canvas"),hf=half.getContext("2d");
  let S=0,d=1,vis=true;
  function size(){d=DPR();const r=c.getBoundingClientRect();S=Math.max(10,Math.round(r.width*d));c.width=c.height=sharp.width=sharp.height=S;half.width=half.height=Math.max(1,S>>1)}
  size();try{new ResizeObserver(()=>{size();draw(performance.now())}).observe(c)}catch(e){addEventListener("resize",size)}
  try{new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)kick()}).observe(c)}catch(e){}
  const filterOK=typeof g.filter==="string";
  function scene(t){
    const x=s;x.clearRect(0,0,S,S);x.lineCap="round";
    const cx=S*.55,cy=S*.46,R=S*.44,L=d;
    x.setLineDash([2*L,7*L]);x.lineDashOffset=-t*.02*L;x.lineWidth=L;
    for(let i=0;i<5;i++){const y=S*(.18+i*.13);x.strokeStyle=`rgba(240,189,79,${.3+i*.06})`;
      x.beginPath();x.moveTo(0,y);x.bezierCurveTo(S*.22,y,S*.3,cy+(y-cy)*.25,cx-R*.36,cy+(y-cy)*.18);x.stroke()}
    x.setLineDash([]);
    const a0=t*.00005;
    x.lineWidth=1.5*L;x.strokeStyle="rgba(255,222,140,1)";x.beginPath();x.arc(cx,cy,R*.62,a0+.5,a0+.5+Math.PI*1.55);x.stroke();
    x.lineWidth=L;x.strokeStyle="rgba(240,189,79,.6)";x.beginPath();x.arc(cx,cy,R*.58,a0+2.6,a0+2.6+Math.PI*.9);x.stroke();
    x.save();x.translate(cx+R*.13,cy-R*.06);x.rotate(-.42+Math.sin(t*.0003)*.04);
    x.strokeStyle="rgba(255,226,160,.8)";x.beginPath();x.ellipse(0,0,R*.46,R*.31,0,0,Math.PI*2);x.stroke();
    x.strokeStyle="rgba(240,189,79,.4)";x.beginPath();x.ellipse(-R*.05,0,R*.3,R*.2,0,0,Math.PI*2);x.stroke();x.restore();
    const n=30,rr=R*.8,rot=t*.00008,gsz=R*.055;
    for(let i=0;i<n;i++){
      const a=rot+i/n*Math.PI*2;if(((i*7)%11)===3)continue;const on=Math.sin(t*.002+i*2.3)>.93;
      x.save();x.translate(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);x.rotate(a+Math.PI/2);x.scale(gsz/10,gsz/14);x.translate(-5,-7);
      x.lineWidth=1.1*L*14/gsz;x.strokeStyle=on?"#fff4d6":"rgba(240,189,79,.7)";x.stroke(GLYPHS[(i*13)%40]);x.restore();
    }
    x.lineWidth=L;x.beginPath();
    const tickA=-rot*1.6+Math.PI*.2;
    for(let i=0;i<=90;i++){const a=tickA+i/90*Math.PI*1.5,len=i%10===0?R*.06:i%5===0?R*.035:R*.018,ca=Math.cos(a),sa=Math.sin(a);
      x.moveTo(cx+ca*R*.69,cy+sa*R*.69);x.lineTo(cx+ca*(R*.69-len),cy+sa*(R*.69-len))}
    x.strokeStyle="rgba(240,189,79,.45)";x.stroke();
    /* hélice : deux brins, segments regroupés par profondeur (peu d'appels de dessin) */
    const P=u=>{const m=1-u;return[m*m*S*.06+2*m*u*S*.36+u*u*S*.98,m*m*S*.95+2*m*u*S*.38+u*u*S*.06]};
    const steps=110,A=R*.09,ph=t*.0016,pts=[];
    for(let i=0;i<=steps;i++){const u=i/steps,[px,py]=P(u),[qx,qy]=P(Math.min(1,u+.001)),l=Math.hypot(qx-px,qy-py)||1;pts.push([px,py,-(qy-py)/l,(qx-px)/l,u])}
    for(const sg of[1,-1])for(let b=0;b<3;b++){
      x.beginPath();
      for(let i=0;i<steps;i++){const[px,py,nx,ny,u]=pts[i],[px2,py2,nx2,ny2,u2]=pts[i+1];
        const depth=(Math.cos(u*26+ph)*sg+1)/2;if(Math.min(2,depth*3|0)!==b)continue;
        const e=Math.sin(Math.PI*u),e2=Math.sin(Math.PI*u2),s1=Math.sin(u*26+ph)*sg,s2=Math.sin(u2*26+ph)*sg;
        x.moveTo(px+nx*A*s1*e,py+ny*A*s1*e);x.lineTo(px2+nx2*A*s2*e2,py2+ny2*A*s2*e2)}
      x.lineWidth=(.8+b*.5)*L;x.strokeStyle=`rgba(255,${205+b*20},${100+b*60},${.25+b*.33})`;x.stroke();
    }
    x.beginPath();for(let i=0;i<steps;i+=6){const[px,py,nx,ny,u]=pts[i],sv=Math.sin(u*26+ph)*A*Math.sin(Math.PI*u);x.moveTo(px+nx*sv,py+ny*sv);x.lineTo(px-nx*sv,py-ny*sv)}
    x.lineWidth=.7*L;x.strokeStyle="rgba(240,189,79,.3)";x.stroke();
    x.lineWidth=1.2*L;x.strokeStyle="rgba(255,220,140,.95)";x.beginPath();
    for(let i=0;i<=120;i++){const u=i/120,px=S*.12+u*S*.8,env=Math.pow(Math.sin(Math.PI*u),2),
      amp=(Math.sin(u*40+t*.006)*.6+Math.sin(u*97-t*.011)*.4)*Math.abs(Math.sin(t*.0009+u*3))*R*.07*env;i?x.lineTo(px,S*.93+amp):x.moveTo(px,S*.93+amp)}
    x.stroke();
    const ox=cx-R*.42,oy=cy+R*.36,orr=R*.12;x.strokeStyle="rgba(255,226,160,.85)";x.lineWidth=L;
    x.beginPath();x.arc(ox,oy,orr,0,Math.PI*2);x.stroke();
    x.beginPath();x.arc(ox,oy,orr*.55,t*.001,t*.001+Math.PI*1.2);x.stroke();
    x.beginPath();x.moveTo(ox-orr*1.5,oy);x.lineTo(ox-orr*.7,oy);x.moveTo(ox+orr*.7,oy);x.lineTo(ox+orr*1.5,oy);x.moveTo(ox+orr*.7,oy-orr*.7);x.lineTo(cx-R*.15,cy+R*.1);x.stroke();
    const pulse=.75+Math.sin(t*.002)*.25,rg=x.createRadialGradient(cx,cy,0,cx,cy,R*.22);
    rg.addColorStop(0,`rgba(255,244,210,${.95*pulse})`);rg.addColorStop(.12,`rgba(255,210,110,${.55*pulse})`);rg.addColorStop(1,"rgba(240,170,50,0)");
    x.fillStyle=rg;x.beginPath();x.arc(cx,cy,R*.22,0,Math.PI*2);x.fill();
    x.save();x.translate(cx,cy);x.rotate(Math.PI/4+rot*2);x.strokeStyle="#fff4d6";x.lineWidth=1.2*L;x.strokeRect(-R*.045,-R*.045,R*.09,R*.09);x.restore();
  }
  function draw(t){
    scene(t);g.clearRect(0,0,S,S);
    /* bloom : copie demi-résolution floutée, ajoutée sous le tracé net */
    hf.clearRect(0,0,half.width,half.height);hf.drawImage(sharp,0,0,half.width,half.height);
    g.globalCompositeOperation="lighter";
    if(filterOK){g.filter=`blur(${Math.round(5*d)}px)`;g.drawImage(half,0,0,S,S);g.filter="none"}
    else{g.globalAlpha=.5;g.drawImage(half,-2,-2,S+4,S+4);g.globalAlpha=1}
    g.drawImage(sharp,0,0);g.globalCompositeOperation="source-over";
  }
  return{draw,fps:30,last:0,visible:()=>vis};
})();

/* ----- boucle unique ----- */
let raf=0;
function loop(t){
  raf=0;if(document.hidden||!animOn)return;
  for(const L of [BG,HOLO]){if(!L.visible())continue;if(t-L.last>=1000/L.fps-2){L.last=t;L.draw(t)}}
  raf=requestAnimationFrame(loop);
}
function kick(){if(!raf){if(animOn)raf=requestAnimationFrame(loop);else{BG.draw(12000);HOLO.draw(12000)}}}
document.addEventListener("visibilitychange",()=>{if(!document.hidden)kick()});
paintAnim();BG.draw(12000);HOLO.draw(12000);kick();

