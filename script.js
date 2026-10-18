'use strict';
/* ================= CORE ================= */
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
let W=200,H=300,S=2,horizonY=120,dockY=200,dockEnd=80,portrait=true;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash(a,b){let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263);h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296}
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}
function hx(h){return[parseInt(h.substr(1,2),16),parseInt(h.substr(3,2),16),parseInt(h.substr(5,2),16)]}
function mixc(a,b,t){return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
function css(c,a){return a===undefined?'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')':'rgba('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+','+a+')'}
const WHITE=[255,255,255],BLACK=[0,0,0];

/* ================= PIXEL FONT 3x5 ================= */
const FD={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101110100110101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101010010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
'0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110',
'.':'000000000000010',':':'000010000010000','!':'010010010000010','?':'110001010000010','-':'000000111000000','+':'000010111010000','/':'001001010100100','%':'101001010100101',"'":'010010000000000','(':'001010010010001',')':'100010010010100',',':'000000000010100','<':'001010100010001','>':'100010001010100','*':'000101010101000','=':'000111000111000',' ':'000000000000000','#':'101111101111101','&':'010101010101011','$':'011110010011110'};
const tcache=new Map();
function tw(s,sc=1){return s.length?(s.length*4-1)*sc:0}
function textCanvas(s,col,sc,sh){
  const key=s+'|'+col+'|'+sc+'|'+sh;let c=tcache.get(key);if(c)return c;
  if(tcache.size>400)tcache.clear();
  const w=tw(s,sc)+sc,h=6*sc;const[cc,x]=mk(w,h);
  const pass=(color,oy)=>{x.fillStyle=color;for(let i=0;i<s.length;i++){const g=FD[s[i]]||FD['?'];for(let k=0;k<15;k++)if(g.charCodeAt(k)===49)x.fillRect(i*4*sc+(k%3)*sc,((k/3)|0)*sc+oy,sc,sc)}};
  if(sh)pass(sh,sc);pass(col,0);tcache.set(key,cc);return cc;
}
/* al: 0 left,1 center,2 right */
function txt(s,x,y,col='#fff4d6',sc=1,al=0,sh='#1a1024'){
  s=String(s).toUpperCase();const c=textCanvas(s,col,sc,sh);
  const w=tw(s,sc);if(al===1)x-=(w/2)|0;else if(al===2)x-=w;
  ctx.drawImage(c,x|0,y|0);return w;
}
function wrap(s,maxW){const words=s.toUpperCase().split(' ');const lines=[];let cur='';
  for(const w of words){const t=cur?cur+' '+w:w;if(tw(t)>maxW&&cur){lines.push(cur);cur=w}else cur=t}if(cur)lines.push(cur);return lines}

/* ================= DAY PALETTE ================= */
const PKRAW=[
[0.00,{top:'#060922',mid:'#121847',bot:'#28295c',mtF:'#1f2552',mtN:'#161b3d',tree:'#0c112b',wat:'#0b1535',deep:'#060b20',tint:'#0a0f36',sun:'#fff0c0',tA:.52,star:1,glow:1}],
[0.19,{top:'#10164a',mid:'#34357a',bot:'#7d5690',mtF:'#3a386c',mtN:'#29274f',tree:'#171833',wat:'#1f2656',deep:'#0f1238',tint:'#1d1a4a',sun:'#ff9a60',tA:.40,star:.55,glow:.85}],
[0.27,{top:'#4d6fb8',mid:'#e59d92',bot:'#ffd494',mtF:'#a081a6',mtN:'#6e5b88',tree:'#3a3a5c',wat:'#6c78ad',deep:'#2f3b72',tint:'#ff9a6a',sun:'#ffc27a',tA:.12,star:0,glow:.15}],
[0.37,{top:'#3a8ce0',mid:'#7cc2f3',bot:'#d2f0ff',mtF:'#91b8d8',mtN:'#6891b3',tree:'#2e5a4b',wat:'#3786c2',deep:'#1b4e88',tint:'#000000',sun:'#fff8dc',tA:0,star:0,glow:0}],
[0.60,{top:'#4692de',mid:'#88c6ee',bot:'#e4f1e2',mtF:'#98b6d0',mtN:'#6d8fae',tree:'#325a48',wat:'#3f86bb',deep:'#1f4f84',tint:'#000000',sun:'#fff4d0',tA:0,star:0,glow:0}],
[0.70,{top:'#5876c6',mid:'#f0aa7a',bot:'#ffd98c',mtF:'#b28c9c',mtN:'#7f6686',tree:'#3b3349',wat:'#ae7f8e',deep:'#4a3b6c',tint:'#ff8a40',sun:'#ffb060',tA:.12,star:0,glow:.25}],
[0.77,{top:'#2a2361',mid:'#b3527c',bot:'#ff8c5a',mtF:'#6d3f70',mtN:'#482c5a',tree:'#25183b',wat:'#5b3b6c',deep:'#251c47',tint:'#3a1a5a',sun:'#ff7040',tA:.30,star:.3,glow:.7}],
[0.85,{top:'#090c2d',mid:'#1c1e54',bot:'#3b2e69',mtF:'#252a57',mtN:'#191d41',tree:'#0e1330',wat:'#101a40',deep:'#070d26',tint:'#0a0f36',sun:'#fff0c0',tA:.50,star:.9,glow:1}],
[1.00,null]];
PKRAW[PKRAW.length-1][1]=PKRAW[0][1];
const PK=PKRAW.map(([t,o])=>{const r={};for(const k in o)r[k]=typeof o[k]==='string'?hx(o[k]):o[k];return[t,r]});
function palAt(p){p=((p%1)+1)%1;let i=0;while(i<PK.length-2&&PK[i+1][0]<=p)i++;
  const a=PK[i],b=PK[i+1];let t=(p-a[0])/(b[0]-a[0]);t=t*t*(3-2*t);const r={};
  for(const k in a[1]){const va=a[1][k],vb=b[1][k];r[k]=typeof va==='number'?lerp(va,vb,t):mixc(va,vb,t)}return r}
function nightF(p){p=((p%1)+1)%1;if(p<.2)return 1;if(p<.28)return 1-(p-.2)/.08;if(p<.74)return 0;if(p<.84)return(p-.74)/.1;return 1}
function period(p){p=((p%1)+1)%1;if(p<.2||p>=.84)return'night';if(p<.32)return'dawn';if(p<.7)return'day';return'dusk'}

/* ================= WORLD GEN ================= */
let mtFar=[],mtNear=[],treeT=[],stars=[],cloudM=[],clouds=[],sparkles=[],lilies=[],reeds=[],grass=[];
function ridge(r,len,oct){const L=[];for(const[per,amp]of oct){const n=Math.ceil(len/per)+3,a=[];for(let i=0;i<n;i++)a.push(r());L.push([per,amp,a])}
  const out=[];for(let x=0;x<len;x++){let v=0;for(const[per,amp,a]of L){const f=x/per,i=f|0,t=f-i,s=t*t*(3-2*t);v+=amp*(a[i]+(a[i+1]-a[i])*s)}out.push(v)}return out}
function genWorld(){
  const r=mulberry(7771);
  const f=ridge(r,W,[[70,.62],[26,.28],[8,.10]]);
  mtFar=f.map(v=>Math.round(horizonY*(.14+.52*Math.pow(clamp(v,0,1),1.7))));
  const n=ridge(r,W,[[44,.7],[14,.24],[5,.06]]);
  mtNear=n.map(v=>Math.round(horizonY*(.06+.2*v)));
  treeT=new Array(W).fill(2);
  let x=-4;while(x<W+4){const h=3+Math.floor(r()*7)+(r()<.15?4:0),w=Math.max(2,(h/2.4)|0);
    for(let dx=-w;dx<=w;dx++){const xx=x+dx;if(xx<0||xx>=W)continue;let th=h-Math.abs(dx)*2.2;if(Math.abs(dx)>0&&((h-Math.abs(dx))%3===0))th-=1;th=Math.round(th);if(th>treeT[xx])treeT[xx]=th}
    x+=2+Math.floor(r()*4)}
  stars=[];for(let i=0;i<70;i++)stars.push({x:(r()*W)|0,y:(r()*horizonY*.85)|0,p:r()*6.28,s:.6+r()*2.4,b:r()<.12});
  cloudM=[];for(let i=0;i<6;i++){const w=22+((r()*30)|0),h=8+((r()*6)|0);const m=[];for(let y=0;y<h;y++)m.push(new Array(w).fill(0));
    const nC=4+((r()*4)|0);for(let k=0;k<nC;k++){const cx=4+r()*(w-8),rad=2.5+r()*(h*.55),cy=h-1-rad*.7;
      for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++){const dx=xx-cx,dy=(y-cy)*1.35;if(dx*dx+dy*dy<=rad*rad)m[y][xx]=1}}
    for(let xx=0;xx<w;xx++)m[h-1][xx]=m[h-2][xx];cloudM.push({w,h,m,c:null})}
  clouds=[];const nc=Math.max(3,(W/60)|0);for(let i=0;i<nc;i++)clouds.push({i:i%cloudM.length,x:r()*W,y:4+r()*horizonY*.4,sp:1.2+r()*2.2});
  sparkles=[];const wh=H-horizonY;for(let i=0;i<Math.max(40,(W*wh/300)|0);i++){const y=(r()*wh)|0;sparkles.push({x:(r()*W)|0,y,l:1+((r()*(2+y/14))|0),p:r()*6.28,s:.8+r()*2})}
  lilies=[];const nl=portrait?4:5;for(let i=0;i<nl;i++){lilies.push({x:dockEnd+14+r()*(W-dockEnd-28),y:dockY+10+r()*(H-dockY-16),s:r()<.5?1:0,f:r()<.5,p:r()*6})}
  lilies.push({x:W-18,y:horizonY+(H-horizonY)*.35,s:0,f:false,p:1});
  reeds=[];const addReed=(x0,x1,base)=>{for(let x=x0;x<x1;x+=1+((r()*3)|0))reeds.push({x,h:6+((r()*16)|0),base,p:r()*6,cat:r()<.28,c:r()})};
  addReed(W-Math.max(16,W*.12),W+2,H);addReed(-2,Math.max(10,W*.06),H);
  grass=[];for(let x=0;x<W;x+=1)if(x<W*.08||x>W*.86)grass.push({x,h:1+((r()*4)|0),p:r()*6});
}

/* ================= ENVIRONMENT ================= */
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
let T=0,dayP=0.30,DAYLEN=420,pal=null,rainI=0,rainT=0,rainNext=90,lastCacheP=-1,lastRain=-1;
let skyC,skyX,landC,landX,watC,watX,reflC,reflX,fgC,fgX;
let ripples=[],parts=[],jumpers=[],birds=[],flies=[],drops=[],shoot=null,dfly=null,floatTexts=[];
let jumpTimer=4,birdTimer=8,shootTimer=12;

function allocCaches(){
  [skyC,skyX]=mk(W,horizonY);[landC,landX]=mk(W,horizonY);[watC,watX]=mk(W,H-horizonY);
  [reflC,reflX]=mk(W,horizonY);[fgC,fgX]=mk(W,H);lastCacheP=-1;
}
function sunPos(p){const a=(p-0.215)/0.59;if(a<0||a>1)return null;return{a,x:W*(0.1+0.8*a),y:horizonY+4-Math.sin(Math.PI*a)*(horizonY*0.82)}}
function moonPos(p){const a=(((p-0.765)%1)+1)%1/0.5;if(a>1)return null;return{a,x:W*(0.12+0.76*a),y:horizonY+4-Math.sin(Math.PI*a)*(horizonY*0.78)}}

function renderCaches(){
  const P=pal,rg=rainI*0.55,gray=[120,128,140];
  const top=mixc(P.top,mixc(gray,P.top,.5),rg),mid=mixc(P.mid,gray,rg),bot=mixc(P.bot,gray,rg*.9);
  const N=16,cols=[];
  for(let i=0;i<=N;i++){const t=i/N;cols.push(t<.55?mixc(top,mid,t/.55):mixc(mid,bot,(t-.55)/.45))}
  // sky
  let id=skyX.createImageData(W,horizonY),d=id.data;
  const sp=sunPos(dayP),glowC=P.sun,gl=P.glow*(1-rainI*.8);
  for(let y=0;y<horizonY;y++){const t=y/Math.max(1,horizonY-1)*N,i=t|0,fr=t-i;
    for(let x=0;x<W;x++){const th=(BAYER[(y&3)*4+(x&3)]+.5)/16;let c=cols[Math.min(N,fr>th?i+1:i)];
      if(sp&&gl>0.01){const dx=(x-sp.x)/(W*.55),dy=(y-sp.y)/(horizonY*.9);let g=1-Math.sqrt(dx*dx+dy*dy);if(g>0){g=g*g*gl*.75;const q=Math.floor(g*6+th)/6;if(q>0)c=mixc(c,glowC,Math.min(.8,q))}}
      const o=(y*W+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}}
  skyX.putImageData(id,0,0);
  // land
  id=landX.createImageData(W,horizonY);d=id.data;
  const put=(x,y,c)=>{if(y<0||y>=horizonY)return;const o=(y*W+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255};
  const mf=mixc(P.mtF,bot,rg*.6),mn=mixc(P.mtN,bot,rg*.5),tr=mixc(P.tree,bot,rg*.35);
  const snow=mixc(mixc(WHITE,P.mtF,.25),bot,.15+rg*.4),mfL=mixc(mf,glowC,.18+P.glow*.1),mfD=mixc(mf,BLACK,.12);
  for(let x=0;x<W;x++){
    const h=mtFar[x],tp=horizonY-h,hl=x>0?mtFar[x-1]:h,hr=x<W-1?mtFar[x+1]:h;
    for(let y=tp;y<horizonY;y++){const dd=y-tp,th=(BAYER[(y&3)*4+(x&3)]+.5)/16;
      let c=mf;if(hr>h&&dd<3)c=mfD;else if(hl<h+1&&hr<=h&&dd<2)c=mfL;
      const sn=h>horizonY*.4?(h-horizonY*.4)*.55+1:0;if(dd<sn&&hash(x,y)>.2+dd/sn*.5)c=snow;
      const hz=clamp((y-tp)/Math.max(8,h),0,1)*.55;if(hz>th*.9)c=mixc(c,bot,.35);
      put(x,y,c)}}
  const mnL=mixc(mn,glowC,.12),mnD=mixc(mn,BLACK,.18);
  for(let x=0;x<W;x++){const h=mtNear[x],tp=horizonY-h;
    for(let y=tp;y<horizonY;y++){let c=mn;const dd=y-tp;if(dd===0)c=mnL;else if(hash(x*3,y*7)>.86)c=mnD;
      if(y>horizonY-5&&((BAYER[(y&3)*4+(x&3)])/16)<(y-(horizonY-5))/6)c=mixc(c,bot,.18);put(x,y,c)}}
  const trL=mixc(tr,mn,.45),trD=mixc(tr,BLACK,.3);
  for(let x=0;x<W;x++){const h=treeT[x],tp=horizonY-h;
    for(let y=tp;y<horizonY-1;y++){let c=tr;if(y===tp&&treeT[x]>=(treeT[x-1]||0))c=trL;else if(hash(x,y*13)>.78)c=trD;put(x,y,c)}
    put(x,horizonY-1,mixc(tr,bot,.25))}
  landX.putImageData(id,0,0);
  // water base
  const wh=H-horizonY;id=watX.createImageData(W,wh);d=id.data;
  const wTop=mixc(mixc(P.wat,bot,.38),gray,rg*.5),wBot=mixc(P.deep,gray,rg*.3);const WC=[];
  for(let i=0;i<=12;i++)WC.push(mixc(wTop,wBot,Math.pow(i/12,.8)));
  for(let y=0;y<wh;y++){const t=y/Math.max(1,wh-1)*12,i=t|0,fr=t-i;
    for(let x=0;x<W;x++){const th=(BAYER[(y&3)*4+(x&3)]+.5)/16;const c=WC[Math.min(12,fr>th?i+1:i)];const o=(y*W+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}}
  watX.putImageData(id,0,0);
  reflX.clearRect(0,0,W,horizonY);reflX.drawImage(skyC,0,0);reflX.drawImage(landC,0,0);
  // clouds
  const lit=mixc(mixc(mixc(WHITE,P.bot,.3),P.top,nightF(dayP)*.72),gray,rg),shd=mixc(lit,mixc(P.mid,gray,rg),.5),rim=mixc(lit,glowC,P.glow*.5);
  for(const cm of cloudM){if(!cm.c)cm.c=mk(cm.w,cm.h);const[cc,cx]=cm.c;cx.clearRect(0,0,cm.w,cm.h);
    for(let y=0;y<cm.h;y++)for(let x=0;x<cm.w;x++){if(!cm.m[y][x])continue;let c=lit;
      const up=y>0&&cm.m[y-1][x];if(!up)c=rim;else if(y>cm.h*.55&&(BAYER[(y&3)*4+(x&3)]/16)<(y-cm.h*.55)/(cm.h*.45)+.2)c=shd;
      cx.fillStyle=css(c);cx.fillRect(x,y,1,1)}}
}

function circ(x,y,r,col){x=Math.round(x);y=Math.round(y);ctx.fillStyle=col;for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy)+.35);ctx.fillRect(x-w,y+dy,w*2+1,1)}}
function drawSunMoon(){
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,horizonY);ctx.clip();
  const sp=sunPos(dayP),vis=1-rainI*.85;
  if(sp){const r=Math.max(4,Math.round(Math.min(W,H)*.03));
    ctx.globalAlpha=.18*vis;circ(sp.x,sp.y,r+5,css(pal.sun));ctx.globalAlpha=.3*vis;circ(sp.x,sp.y,r+2,css(pal.sun));
    ctx.globalAlpha=vis;circ(sp.x,sp.y,r,css(pal.sun));circ(sp.x-1,sp.y-1,r-2,css(mixc(pal.sun,WHITE,.55)));ctx.globalAlpha=1}
  const mp=moonPos(dayP);
  if(mp){const r=Math.max(3,Math.round(Math.min(W,H)*.024)),mx=Math.round(mp.x),my=Math.round(mp.y);
    ctx.globalAlpha=.12*vis;circ(mx,my,r+4,'#cfd8ff');ctx.globalAlpha=vis;circ(mx,my,r,'#e9ecf7');
    ctx.fillStyle='#b9bfd6';ctx.fillRect(mx-1,my-1,2,2);ctx.fillRect(mx+1,my+1,1,1);ctx.fillRect(mx-2,my+1,1,1);ctx.fillRect(mx+1,my-2,1,1);
    ctx.fillStyle='#fbfcff';ctx.fillRect(mx-r+1,my-1,1,2);ctx.globalAlpha=1}
  ctx.restore();
}
function drawStars(){
  const a=pal.star*(1-rainI);if(a<.02)return;
  for(const s of stars){let b=.55+.45*Math.sin(T*s.s+s.p);b*=a;if(b<.05)continue;
    ctx.globalAlpha=b;ctx.fillStyle=s.b?'#fff2c8':'#dfe6ff';ctx.fillRect(s.x,s.y,1,1);
    if(s.b&&b>.5){ctx.globalAlpha=b*.45;ctx.fillRect(s.x-1,s.y,1,1);ctx.fillRect(s.x+1,s.y,1,1);ctx.fillRect(s.x,s.y-1,1,1);ctx.fillRect(s.x,s.y+1,1,1)}}
  ctx.globalAlpha=1;
  if(shoot){const k=shoot.t/shoot.d;ctx.fillStyle='#fff';for(let i=0;i<8;i++){ctx.globalAlpha=a*(1-i/8)*(1-k);ctx.fillRect(Math.round(shoot.x-i*shoot.vx*.012),Math.round(shoot.y-i*shoot.vy*.012),1,1)}ctx.globalAlpha=1}
}
function drawClouds(){const a=1;for(const c of clouds){const cm=cloudM[c.i];if(!cm.c)continue;const x=Math.round(c.x),y=Math.round(c.y);ctx.globalAlpha=a*(.85+rainI*.15);ctx.drawImage(cm.c[0],x,y);ctx.globalAlpha=1}}
function drawBirds(){const nf=nightF(dayP);if(nf>.6)return;ctx.fillStyle=css(mixc(pal.tree,BLACK,.2));
  for(const b of birds){const x=Math.round(b.x),y=Math.round(b.y+Math.sin(T*2+b.p)*1.5),f=Math.sin(T*10+b.p)>0;
    ctx.fillRect(x,y,1,1);if(f){ctx.fillRect(x-1,y-1,1,1);ctx.fillRect(x+1,y-1,1,1);ctx.fillRect(x-2,y-1,1,1);ctx.fillRect(x+2,y-1,1,1)}else{ctx.fillRect(x-1,y,1,1);ctx.fillRect(x+1,y,1,1);ctx.fillRect(x-2,y+1,1,1);ctx.fillRect(x+2,y+1,1,1)}}}

function drawWater(){
  ctx.drawImage(watC,0,horizonY);
  const wh=H-horizonY,rsh=.9;
  for(let dy=0;dy<wh;dy++){const sy=horizonY-1-Math.floor(dy*rsh);if(sy<0)break;const y=horizonY+dy;
    const amp=.4+dy*.035+rainI*.8,off=Math.round(Math.sin(T*1.7+dy*.62)*amp+Math.sin(T*.9-dy*.21)*amp*.6);
    let a=.62-dy/wh*.5;if(hash(dy,Math.floor(T*7))<.08+rainI*.1)a*=.55;ctx.globalAlpha=a;
    ctx.drawImage(reflC,0,sy,W,1,off,y,W,1);}
  ctx.globalAlpha=1;
  // glitter
  const sp=sunPos(dayP),mp=moonPos(dayP);
  const g=(p,col,str)=>{if(!p||p.y>horizonY-1)return;const tb=Math.floor(T*7);ctx.fillStyle=col;
    for(let dy=1;dy<wh;dy+=1){const w=1.5+dy*.16;const n=1+((dy/45)|0);for(let k=0;k<n;k++){const hh=hash(dy*7+k,tb+(dy>>3));if(hh>str)continue;const xx=Math.round(p.x+(hash(dy*3+k,tb+1)-.5)*w*2);const l=1+((hash(k,dy+tb)*(1.5+dy/30))|0);ctx.globalAlpha=(.3+.7*(1-dy/wh))*(1-hh/str*.5);ctx.fillRect(xx,horizonY+dy,l,1)}}ctx.globalAlpha=1};
  g(sp,css(mixc(pal.sun,WHITE,.45)),.34-rainI*.3);g(mp,'#dfe7ff',.3-rainI*.28);
  // sparkles/wave lines
  const lc=css(mixc(mixc(pal.bot,WHITE,.35),pal.top,nightF(dayP)*.5));ctx.fillStyle=lc;
  for(const s of sparkles){const b=Math.sin(T*s.s+s.p);if(b<.2)continue;const y=horizonY+s.y;if(y>=H)continue;
    const x=Math.round((s.x+T*(1.5+s.y*.02))%(W+10))-5;ctx.globalAlpha=(b-.2)*.55*(.4+s.y/(H-horizonY));ctx.fillRect(x,y,s.l,1)}
  ctx.globalAlpha=1;
  // mist
  const pp=dayP,mist=pp>.2&&pp<.36?Math.sin((pp-.2)/.16*Math.PI):0;const mf=Math.max(mist*.6,rainI*.35);
  if(mf>.02){ctx.fillStyle=css(mixc(pal.bot,WHITE,.4));for(let i=0;i<10;i++){const y=horizonY-6+i*2;ctx.globalAlpha=mf*.22*(1-Math.abs(i-4)/6);
    for(let x=-20;x<W;x+=26){const xx=Math.round(x+((T*2+i*13)%26));ctx.fillRect(xx,y,14+((hash(i,x)*10)|0),1)}}ctx.globalAlpha=1}
}
function ellipsePix(x,y,rx,ry,col,a){if(rx<.5)return;ctx.globalAlpha=a;ctx.fillStyle=col;const n=Math.max(8,Math.round(rx*5));let lx=1e9,ly=1e9;
  for(let i=0;i<n;i++){const t=i/n*6.2832,px=Math.round(x+Math.cos(t)*rx),py=Math.round(y+Math.sin(t)*ry);if(px===lx&&py===ly)continue;lx=px;ly=py;ctx.fillRect(px,py,1,1)}ctx.globalAlpha=1}
function addRipple(x,y,max,sp,a){ripples.push({x,y,r:0,max:max||8,sp:sp||9,a:a||.8})}
function drawRipples(){const col=css(mixc(mixc(pal.bot,WHITE,.55),pal.top,nightF(dayP)*.35));
  for(const r of ripples){const k=r.r/r.max;const s=.6+(r.y-horizonY)/(H-horizonY)*.7;ellipsePix(r.x,r.y,r.r*s,r.r*.32*s,col,r.a*(1-k))}}
function splash(x,y,n,col,pw){for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*1.9;const v=(pw||40)*(.4+Math.random()*.8);parts.push({x,y,vx:Math.cos(a)*v*.7,vy:Math.sin(a)*v,l:.5+Math.random()*.5,t:0,c:col||'#e8f6ff',g:140,wy:y})}}
function drawParts(c){for(const p of parts){const k=p.t/p.l;c.globalAlpha=1-k*k;c.fillStyle=p.c;c.fillRect(Math.round(p.x),Math.round(p.y),1,1)}c.globalAlpha=1}
function drawJumpers(){for(const j of jumpers){const k=j.t/j.d;const x=j.x+j.dir*k*j.w,y=j.y-Math.sin(k*Math.PI)*j.h;const col=css(mixc(pal.deep,BLACK,.3));
  ctx.fillStyle=col;const ang=Math.cos(k*Math.PI);const xi=Math.round(x),yi=Math.round(y);
  for(let i=-2;i<=2;i++){ctx.fillRect(xi+i*j.dir,yi+Math.round(-i*ang*.6),1,i===0||i===1?2:1)}ctx.fillStyle='#e9f3ff';ctx.globalAlpha=.6;ctx.fillRect(xi+j.dir*2,yi-1+Math.round(-2*ang*.6),1,1);ctx.globalAlpha=1}}

function drawFireflies(){const nf=nightF(dayP);if(nf<.3)return;ctx.globalCompositeOperation='lighter';
  for(const f of flies){const x=Math.round(f.x+Math.sin(T*f.s+f.p)*f.rx),y=Math.round(f.y+Math.cos(T*f.s*.7+f.p)*f.ry);
    const b=Math.max(0,Math.sin(T*f.b+f.p*3))*nf*(1-rainI);if(b<.05)continue;
    ctx.globalAlpha=b*.25;ctx.fillStyle='#c8ff6a';ctx.fillRect(x-1,y-1,3,3);ctx.globalAlpha=b;ctx.fillStyle='#f4ffb0';ctx.fillRect(x,y,1,1)}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
function drawRain(){if(rainI<.03)return;for(const d of drops){const x=Math.round(d.x),y=Math.round(d.y);ctx.globalAlpha=.35*rainI;ctx.fillStyle='#dfe9ff';ctx.fillRect(x+1,y-2,1,2);ctx.globalAlpha=.7*rainI;ctx.fillRect(x,y,1,3);ctx.fillRect(x-1,y+3,1,2)}ctx.globalAlpha=1}

function updateEnv(dt){
  dayP=(dayP+dt/DAYLEN)%1;
  rainT+=dt;if(rainT>rainNext){rainT=0;rainNext=70+Math.random()*120;wantRain=Math.random()<.32&&wantRain===0?1:0}
  rainI=clamp(rainI+(wantRain-rainI)*dt*.12,0,1);
  for(const c of clouds){c.x+=c.sp*dt*(1+rainI);const w=cloudM[c.i].w;if(c.x>W+4)c.x=-w-4-Math.random()*30}
  for(let i=ripples.length-1;i>=0;i--){const r=ripples[i];r.r+=r.sp*dt*(1-r.r/r.max*.6);if(r.r>=r.max)ripples.splice(i,1)}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.t>p.l||(p.vy>0&&p.y>p.wy+2)){parts.splice(i,1)}}
  for(let i=floatTexts.length-1;i>=0;i--){const f=floatTexts[i];f.t+=dt;if(f.t>f.d)floatTexts.splice(i,1)}
  jumpTimer-=dt;if(jumpTimer<0){jumpTimer=5+Math.random()*10;const x=dockEnd+20+Math.random()*(W-dockEnd-30),y=horizonY+8+Math.random()*(H-horizonY-20);
    const s=.5+(y-horizonY)/(H-horizonY);jumpers.push({x,y,dir:Math.random()<.5?-1:1,w:6*s+3,h:5*s+3,t:0,d:.55+s*.2});splash(x,y,4,undefined,25);addRipple(x,y,6*s+3)}
  for(let i=jumpers.length-1;i>=0;i--){const j=jumpers[i];j.t+=dt;if(j.t>=j.d){const x=j.x+j.dir*j.w;splash(x,j.y,6,undefined,30);addRipple(x,j.y,9,10);addRipple(x,j.y,5,7);jumpers.splice(i,1);sfx('plopS')}}
  birdTimer-=dt;if(birdTimer<0){birdTimer=14+Math.random()*20;if(nightF(dayP)<.4&&rainI<.4){const n=2+((Math.random()*3)|0),y=6+Math.random()*horizonY*.35,dir=Math.random()<.5?1:-1;
    for(let i=0;i<n;i++)birds.push({x:dir>0?-8-i*7:W+8+i*7,y:y+i*3*(i%2?1:-1)+i,vx:dir*(14+Math.random()*3),p:Math.random()*6})}}
  for(let i=birds.length-1;i>=0;i--){const b=birds[i];b.x+=b.vx*dt;if(b.x<-30||b.x>W+30)birds.splice(i,1)}
  shootTimer-=dt;if(shootTimer<0){shootTimer=8+Math.random()*16;if(pal.star>.6&&!shoot)shoot={x:Math.random()*W*.8+W*.1,y:Math.random()*horizonY*.4+4,vx:(Math.random()<.5?-1:1)*(90+Math.random()*40),vy:40,t:0,d:.7}}
  if(shoot){shoot.t+=dt;shoot.x+=shoot.vx*dt;shoot.y+=shoot.vy*dt;if(shoot.t>shoot.d)shoot=null}
  const target=Math.round(rainI*W*.6);while(drops.length<target)drops.push({x:Math.random()*(W+40),y:-Math.random()*H,ty:horizonY+Math.random()*(H-horizonY),v:160+Math.random()*60});
  if(drops.length>target)drops.length=target;
  for(const d of drops){d.y+=d.v*dt;d.x-=d.v*.18*dt;if(d.y>=d.ty){if(Math.random()<.5)addRipple(d.x,d.ty,2+Math.random()*2,6,.6);d.y=-4-Math.random()*20;d.x=Math.random()*(W+40);d.ty=horizonY+Math.random()*(H-horizonY)}}
  if(Math.abs(dayP-lastCacheP)>.0012||Math.abs(rainI-lastRain)>.02){pal=palAt(dayP);renderCaches();lastCacheP=dayP;lastRain=rainI}else pal=palAt(dayP);
}
let wantRain=0;
function genFlies(){flies=[];for(let i=0;i<12;i++){const side=i<8?(W-Math.random()*W*.25):(Math.random()*W*.25);flies.push({x:side,y:dockY-20+Math.random()*(H-dockY+10),rx:3+Math.random()*8,ry:2+Math.random()*5,s:.3+Math.random()*.6,b:1+Math.random()*2,p:Math.random()*6})}}

/* ================= FISH DATA ================= */
// pull: tarikan dasar, stam: stamina, burst: frekuensi sentakan, bp: kekuatan sentakan, jump: peluang lompat, win: jendela gigitan (detik)
const FISH=[
{id:0,name:'MINNOW',L:14,Hh:2.6,tail:'fork',pat:'none',c:['#9fb4c2','#dfe9ef','#f8fbff','#7f95a8'],fin:'#b9c9d4',w:[.02,.08],price:4,rar:30,pull:.14,stam:.6,burst:.08,bp:1.4,jump:0,win:1.1,speed:.8,time:'any',stars:1,abil:'TIDAK ADA',desc:'IKAN KECIL YANG SELALU LAPAR. COCOK UNTUK PEMULA.'},
{id:1,name:'BLUEGILL',L:17,Hh:5.2,tail:'round',pat:'bars',c:['#3f6c9a','#6fa0c8','#f2a55a','#2a4a70'],fin:'#5a86b0',w:[.1,.4],price:9,rar:24,pull:.22,stam:.8,burst:.15,bp:1.6,jump:0,win:.8,speed:1,time:'day',stars:1,abil:'PENCURI UMPAN: GIGITANNYA CEPAT',desc:'BADAN BULAT, PIPI BIRU. SUKA BERMAIN DI DEKAT TERATAI.'},
{id:2,name:'PERCH',L:19,Hh:4.2,tail:'fork',pat:'perch',c:['#6b8a2e','#c9c24a','#f4f0c0','#3f5a1a'],fin:'#e07a3a',w:[.2,.9],price:15,rar:18,pull:.3,stam:1,burst:.22,bp:1.7,jump:0,win:.75,speed:1.1,time:'any',stars:2,abil:'SIRIP DURI: SENTAKAN TIBA-TIBA',desc:'BERGARIS GELAP DAN BERSIRIP ORANYE. BERBURU BERKELOMPOK.'},
{id:3,name:'RAINBOW TROUT',L:23,Hh:4,tail:'fork',pat:'trout',c:['#5e7b5a','#b8c7a4','#f1efe2','#3b5238'],fin:'#9fae8a',w:[.5,2.5],price:28,rar:12,pull:.4,stam:1.2,burst:.25,bp:1.8,jump:.35,win:.7,speed:1.3,time:'dawn',stars:2,abil:'PELOMPAT: SERING MELOMPAT KELUAR AIR',desc:'GARIS PELANGI DI SISINYA. PALING AKTIF SAAT FAJAR DAN SENJA.'},
{id:4,name:'BASS',L:24,Hh:5,tail:'round',pat:'bass',c:['#4f7a36','#94b35a','#e8ecc4','#2e4a1e'],fin:'#6f9447',w:[1,4.5],price:45,rar:10,pull:.52,stam:1.4,burst:.35,bp:2,jump:.15,win:.65,speed:1.2,time:'any',stars:3,abil:'MULUT BESAR: SENTAKAN KUAT BERUNTUN',desc:'PREDATOR BERMULUT LEBAR. MENYERANG APA SAJA YANG BERGERAK.'},
{id:5,name:'CATFISH',L:27,Hh:4.2,tail:'round',pat:'cat',c:['#5a5048','#8a7d6e','#d8cbb4','#342c26'],fin:'#6e6258',w:[2,12],price:70,rar:8,pull:.6,stam:2,burst:.12,bp:1.5,jump:0,win:.8,speed:.7,time:'night',stars:3,abil:'PENARIK BERAT: TARIKAN STABIL, STAMINA TINGGI',desc:'BERKUMIS PANJANG. KELUAR SAAT MALAM ATAU HUJAN.'},
{id:6,name:'PIKE',L:31,Hh:3.4,tail:'fork',pat:'pike',c:['#3f6a3a','#86a860','#e6eecb','#223d20'],fin:'#9b8a3a',w:[2,10],price:95,rar:6,pull:.62,stam:1.5,burst:.5,bp:2.4,jump:.1,win:.55,speed:1.8,time:'any',stars:4,abil:'PELESAT: LARI SANGAT CEPAT & MENDADAK',desc:'MONCONG PANJANG, GIGI TAJAM. SUKA CUACA HUJAN.'},
{id:7,name:'KOI',L:25,Hh:5,tail:'flow',pat:'koi',c:['#f4efe6','#fbf8f2','#ffffff','#b8a894'],fin:'#f6e7da',w:[1.5,6],price:160,rar:3,pull:.58,stam:1.5,burst:.4,bp:2.2,jump:.1,win:.42,speed:1.4,time:'day',stars:4,abil:'LICIN: JENDELA GIGITAN SANGAT SINGKAT',desc:'IKAN HIAS BERUNTUNG. KATANYA MEMBAWA REZEKI.'},
{id:8,name:'STURGEON',L:36,Hh:3.6,tail:'hetero',pat:'sturg',c:['#5b6570','#8c96a0','#d6dadf','#353c44'],fin:'#6f7882',w:[15,60],price:300,rar:2,pull:.78,stam:3.2,burst:.22,bp:1.9,jump:.05,win:.6,speed:.8,time:'any',stars:5,abil:'RAKSASA PURBA: STAMINA LUAR BIASA',desc:'FOSIL HIDUP DENGAN SISIK BERLAPIS BAJA. SANGAT BERAT.'},
{id:9,name:'MOONFIN',L:28,Hh:5.4,tail:'flow',pat:'moon',c:['#5e7bd8','#9ec4ff','#eaf4ff','#2e3f8a'],fin:'#b8d8ff',w:[3,9],price:600,rar:.7,pull:.76,stam:1.9,burst:.5,bp:2.1,jump:.3,win:.4,speed:2,time:'night',stars:5,abil:'LEGENDA: BERKILAU, GERAK LIAR TAK TERDUGA',desc:'IKAN LEGENDA YANG HANYA MUNCUL DI BAWAH SINAR BULAN.'}
];
const TIMEN={any:'KAPAN SAJA',day:'SIANG',night:'MALAM',dawn:'FAJAR / SENJA',midday:'TENGAH HARI',rain:'SAAT HUJAN',nightrain:'MALAM HUJAN',sea:'LAUT LEPAS'};
const CATN={umum:'UMUM',langka:'LANGKA',misteri:'MISTERI',mistik:'MISTIK',legendaris:'LEGENDARIS'};
const CATC={umum:'#8a8f98',langka:'#3f8ad8',misteri:'#a070e0',mistik:'#20c0a0',legendaris:'#e0a020'};

function makeFishSprite(f,sil){
  const L=f.L,tl=f.tail==='hetero'?9:f.tail==='flow'?9:Math.max(4,Math.round(L*.22)),Wd=L+tl+2,Hd=Math.ceil(f.Hh*2+10+(f.tail==='flow'?4:0));
  const cy=Math.floor(Hd/2),M=[];for(let y=0;y<Hd;y++)M.push(new Array(Wd).fill(null));
  const back=hx(f.c[0]),side=hx(f.c[1]),belly=hx(f.c[2]),dark=hx(f.c[3]),fin=hx(f.fin);
  const bx0=tl;// body from bx0 to bx0+L (head at right)
  const prof=[];
  for(let i=0;i<L;i++){const t=(i+.5)/L;let s=Math.pow(Math.sin(Math.PI*Math.pow(t,.72)),.8);
    if(f.pat==='pike'||f.pat==='sturg')s=Math.pow(Math.sin(Math.PI*Math.pow(t,.6)),.55)*(t>.85?1-(t-.85)*2.6:1);
    if(f.pat==='cat')s=Math.pow(Math.sin(Math.PI*Math.pow(t,.55)),.6);
    const h=Math.max(1,f.Hh*s+.6*(t<.15?t/.15:1));
    const up=f.pat==='cat'?.8:1.05,dn=f.pat==='cat'?1.05:.95;
    prof.push([Math.round(cy-h*up),Math.round(cy+h*dn)]);}
  const set=(x,y,c,k)=>{if(x<0||y<0||x>=Wd||y>=Hd)return;M[y][x]={c,k}};
  // fins first (under body)
  const fp=(x,y)=>set(x,y,((x+y)%3===0)?mixc(fin,dark,.35):fin,'fin');
  // dorsal
  let d0=.36,d1=.66,dh=Math.max(2,Math.round(f.Hh*.7));if(f.pat==='pike'){d0=.1;d1=.3;dh=3}if(f.pat==='sturg'){d0=.28;d1=.4;dh=3}if(f.pat==='cat'){d0=.55;d1=.68;dh=3}if(f.pat==='moon'){d0=.25;d1=.75;dh=5}if(f.pat==='perch'){d0=.3;d1=.7;dh=4}
  for(let i=Math.floor(L*d0);i<Math.ceil(L*d1);i++){const k=(i-L*d0)/(L*(d1-L*0+0)-L*d0+1e-9);const u=(i-L*d0)/(L*(d1-d0));let hh=Math.round(dh*Math.sin(Math.PI*Math.pow(u,.6))*(f.pat==='perch'&&u>.5?.7:1));
    for(let j=1;j<=hh;j++)fp(bx0+i,prof[i][0]-j+1-0)}
  // anal/pelvic
  const pv=(a,b,h)=>{for(let i=Math.floor(L*a);i<Math.ceil(L*b);i++){const u=(i-L*a)/(L*(b-a));const hh=Math.round(h*Math.sin(Math.PI*Math.pow(u,.7)));for(let j=1;j<=hh;j++)fp(bx0+i,prof[i][1]+j-1)}};
  pv(.22,.38,f.pat==='moon'?4:2);pv(.52,.62,2);
  // tail
  const tx=bx0+1,ty=Math.round((prof[0][0]+prof[0][1])/2);
  for(let i=0;i<tl;i++){const u=(tl-i)/tl;let a,b;
    if(f.tail==='fork'){const sp=Math.round(1+u*f.Hh*1.25);a=ty-sp;b=ty+sp;for(let y=a;y<=b;y++){const dd=Math.abs(y-ty);if(u>.55&&dd<(u-.55)*f.Hh*2.4)continue;fp(tx-i-1,y)}}
    else if(f.tail==='round'){const sp=Math.round(1+Math.sin(u*Math.PI*.55)*f.Hh*1.1);for(let y=ty-sp;y<=ty+sp;y++)fp(tx-i-1,y)}
    else if(f.tail==='hetero'){const top=Math.round(u*5.5),bot=Math.round(u*2.2);for(let y=ty-top-Math.round(u*u*2);y<=ty+bot;y++)fp(tx-i-1,y)}
    else{const sp=Math.round(1+u*f.Hh*1.2+Math.sin(u*5)*1);for(let y=ty-sp;y<=ty+sp+1;y++){if(u>.7&&Math.abs(y-ty)<(u-.7)*6)continue;fp(tx-i-1,y)}}}
  // body
  for(let i=0;i<L;i++){const[a,b]=prof[i],x=bx0+i,t=(i+.5)/L;
    for(let y=a;y<=b;y++){const v=(y-a)/Math.max(1,b-a);const th=(BAYER[(y&3)*4+(x&3)]+.5)/16;
      let c=v<.32?(v/.32>th*1.2?side:back):v<.62?side:((v-.62)/.38>th?belly:side);
      // patterns
      const P=f.pat;
      if(P==='bars'&&v<.75&&((i+1)%4<2)&&t>.2&&t<.8)c=mixc(c,dark,.45);
      if(P==='bars'&&v>.7&&t>.3&&t<.8)c=mixc(belly,hx('#f08a3a'),.6);
      if(P==='perch'&&v<.72&&(i%4===0||i%4===1&&v<.5)&&t>.15&&t<.85)c=mixc(c,dark,.6);
      if(P==='trout'){if(Math.abs(v-.5)<.14&&t>.08&&t<.9)c=mixc(hx('#e8708a'),hx('#f5a0b0'),th);if(v<.5&&hash(x*3,y*5)>.8)c=mixc(c,dark,.7)}
      if(P==='bass'&&Math.abs(v-.5)<.13&&t>.05&&t<.85&&hash(x,y*2)>.25)c=mixc(c,dark,.55);
      if(P==='cat'&&v<.6&&hash(x*7,y*3)>.86)c=mixc(c,dark,.6);
      if(P==='pike'&&v<.7&&((x*3+y*5)%7===0||hash(x,y)>.9))c=mixc(c,hx('#f0f0b0'),.7);
      if(P==='koi'){const n=hash((x/4|0)+7,(y/3|0)+3)+Math.sin(x*.5)*.2;if(n>.52)c=mixc(hx('#ee5a24'),hx('#ff8a3a'),v);if(hash((x/3|0)+40,(y/3|0))>.88&&v<.6)c=hx('#1a1a22')}
      if(P==='sturg'){if((v<.12||Math.abs(v-.55)<.08)&&i%3===0)c=mixc(belly,WHITE,.3)}
      if(P==='moon'){c=mixc(c,hx('#cfe6ff'),hash(x,y)>.8?.6:0);if(hash(x*5,y*9)>.94)c=WHITE}
      set(x,y,c,'body')}}
  // gill & highlight
  const gx=bx0+Math.round(L*(f.pat==='pike'?.72:.76));if(prof[gx-bx0])for(let y=prof[gx-bx0][0]+1;y<prof[gx-bx0][1];y++)if(M[y][gx])M[y][gx]={c:mixc(M[y][gx].c,dark,.45),k:'body'};
  for(let i=2;i<L-2;i++){const y=prof[i][0]+1;if(M[y]&&M[y][bx0+i]&&M[y][bx0+i].k==='body')M[y][bx0+i]={c:mixc(M[y][bx0+i].c,WHITE,.35),k:'body'}}
  // eye
  const ei=Math.round(L*(f.pat==='pike'?.86:f.pat==='sturg'?.83:.84)),ex=bx0+ei,ey=prof[ei][0]+Math.max(1,Math.round((prof[ei][1]-prof[ei][0])*.3));
  if(f.L>=22){set(ex,ey,hx('#f4f4ea'),'eye');set(ex+1,ey,hx('#f4f4ea'),'eye');set(ex,ey+1,hx('#f4f4ea'),'eye');set(ex+1,ey+1,hx('#101018'),'eye')}else{set(ex,ey,hx('#101018'),'eye');set(ex-1,ey,mixc(side,WHITE,.4),'eye')}
  // mouth
  const my=Math.round((prof[L-1][0]+prof[L-1][1])/2)+(f.pat==='cat'?1:0);set(bx0+L-1,my,dark,'body');
  // whiskers
  if(f.pat==='cat'){const wx=bx0+L;for(let k=0;k<5;k++){set(wx+Math.min(k,2),my+1+k,hx('#4a403a'),'fin');}for(let k=0;k<4;k++)set(wx+k,my-1-(k>>1),hx('#4a403a'),'fin');}
  if(f.pat==='sturg'){for(let k=1;k<4;k++)set(bx0+L-3,prof[L-4][1]+k,hx('#9a9088'),'fin')}
  // outline
  const out=[];for(let y=0;y<Hd;y++)for(let x=0;x<Wd;x++){if(M[y][x])continue;let n=null;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const q=M[y+dy]&&M[y+dy][x+dx];if(q&&q.k!=='ol'){n=q;break}}if(n)out.push([x,y,n])}
  for(const[x,y,n]of out)M[y][x]={c:mixc(n.k==='fin'?fin:n.c,dark,.72),k:'ol'};
  const[c,g]=mk(Wd,Hd);const id=g.createImageData(Wd,Hd),d=id.data;
  for(let y=0;y<Hd;y++)for(let x=0;x<Wd;x++){const q=M[y][x];if(!q)continue;const o=(y*Wd+x)*4;let cc=q.c;if(sil)cc=[10,18,40];d[o]=cc[0];d[o+1]=cc[1];d[o+2]=cc[2];d[o+3]=q.k==='fin'&&!sil&&f.pat==='moon'?200:255}
  g.putImageData(id,0,0);return c;
}
let FSPR=[],FSIL=[];
function buildFish(){FSPR=FISH.map(f=>makeFishSprite(f,false));FSIL=FISH.map(f=>makeFishSprite(f,true))}
// animated fish draw: head faces right when dir=1
function drawFishAnim(g,i,x,y,sc,dir,t,amp,sil,alpha){
  const spr=(sil?FSIL:FSPR)[i],w=spr.width,h=spr.height;g.save();g.globalAlpha=alpha===undefined?1:alpha;
  for(let cx=0;cx<w;cx++){const u=1-cx/w;const off=Math.round(Math.sin(t*9-cx*.35)*amp*u*u);
    const dx=dir>0?x+cx*sc:x+(w-1-cx)*sc;
    if(dir>0)g.drawImage(spr,cx,0,1,h,dx,y+off*sc,sc,h*sc);else{g.save();g.translate(dx+sc,0);g.scale(-1,1);g.drawImage(spr,cx,0,1,h,0,y+off*sc,sc,h*sc);g.restore()}}
  g.restore();
}

/* ================= STORE DATA ================= */
const ITEMS={
rod:[
{n:'BAMBOO ROD',p:0,line:1,c:['#c9a25a','#8a6a2e','#e8d08a'],d:'JORAN BAMBU SEDERHANA.'},
{n:'FIBER ROD',p:120,line:1.3,c:['#e8e8e0','#c43c3c','#ffffff'],d:'SERAT KACA, LEBIH LENTUR.'},
{n:'CARBON ROD',p:450,line:1.65,c:['#2c2c38','#d8a83a','#5a5a70'],d:'KARBON RINGAN & KUAT.'},
{n:'TITAN ROD',p:1200,line:2.05,c:['#9ab4c8','#3a5a8a','#e0f0ff'],d:'TITANIUM, TAHAN RAKSASA.'},
{n:'GOLD CLAW',p:3000,line:2.6,c:['#f0c040','#d97757','#fff2a0'],d:'JORAN LEGENDA BERCAKAR.'}],
reel:[
{n:'BASIC REEL',p:0,spd:1,c:['#8a8a90','#5a5a60']},
{n:'SPIN REEL',p:90,spd:1.25,c:['#3a7ac0','#1e4a80']},
{n:'TURBO REEL',p:380,spd:1.55,c:['#c0403a','#80201e']},
{n:'STORM REEL',p:1000,spd:1.9,c:['#40c0a0','#1e7a60']}],
bait:[
{n:'WORM',p:0,luck:0,bite:1,c:['#d88a8a','#a85a5a'],d:'CACING BIASA.'},
{n:'CRICKET',p:80,luck:.35,bite:1.2,c:['#6a8a3a','#3a5a1a'],d:'JANGKRIK. IKAN LEBIH CEPAT MAKAN.'},
{n:'SHINY LURE',p:350,luck:.8,bite:1.35,c:['#e0e8f0','#e0a030'],d:'UMPAN KILAT. MENARIK IKAN BESAR.'},
{n:'MOON BAIT',p:1100,luck:1.5,bite:1.5,c:['#9ec4ff','#5e7bd8'],d:'UMPAN BULAN. IKAN LANGKA MENDEKAT.'}]};
const TABN={rod:'ROD',reel:'REEL',bait:'BAIT'};
function drawItemIcon(g,cat,i,x,y){
  const it=ITEMS[cat][i],c0=it.c[0],c1=it.c[1];const P=(xx,yy,c,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x+xx,y+yy,w,h)};
  if(cat==='rod'){for(let k=0;k<14;k++){P(1+k,14-k,k%4===0?c1:c0)}P(0,15,'#3a2a1a');P(1,15,'#3a2a1a');P(2,14,'#5a3a1a');P(15,0,it.c[2]);P(4,13,c1,2,1);P(3,12,'#888',2,2);
    if(i===4){P(14,1,'#d97757');P(15,1,'#d97757');P(15,2,'#fff2a0')}
    for(let k=4;k<15;k+=2)P(16,k,'rgba(230,240,255,.6)');P(16,15,'#e44');P(16,14,'#fff')}
  else if(cat==='reel'){P(4,5,'#2a2a30',9,8);P(5,4,'#2a2a30',7,10);P(5,5,c0,7,7);P(6,6,c1,5,5);P(7,7,'#dfe4ea',3,3);P(8,8,c1);P(12,8,'#2a2a30',3,1);P(14,6,'#2a2a30',1,3);P(14,5,c0);P(6,4,'#ffffff',2,1);P(3,13,'#3a3a40',11,2)}
  else{if(i===0){const pts=[[3,10],[4,9],[5,9],[6,10],[7,11],[8,11],[9,10],[10,9],[11,8],[12,8],[13,9]];for(const[a,b]of pts){P(a,b,c0,1,2)}P(13,9,c1);P(5,9,'#f0b0b0')}
    else if(i===1){P(5,7,c0,7,4);P(11,6,c1,3,4);P(12,7,'#111');P(4,11,c1,1,3);P(7,11,c1,1,3);P(10,11,c1,1,3);P(3,6,c1,2,1);P(13,4,c1,1,2);P(6,7,'#9ab86a',4,1)}
    else if(i===2){P(4,6,c0,8,5);P(5,5,c0,6,7);P(6,7,'#ffffff',3,2);P(11,7,'#111');P(2,8,c1,2,1);P(1,7,c1,1,3);P(8,12,'#888',1,2);P(7,14,'#888',3,1);P(6,6,'#fff8d0')}
    else{P(5,5,c0,7,7);P(4,6,c0,9,5);P(6,6,'#ffffff',2,2);P(9,8,c1,2,2);P(7,10,c1,1,1);P(13,4,'#fff');P(2,3,'#fff');P(14,12,'#cfe0ff')}}
}

/* ================= LAYOUT ================= */
let DPR=1;
function resize(){
  DPR=window.devicePixelRatio||1;const vw=window.innerWidth,vh=window.innerHeight;
  portrait=vh>=vw*1.05;
  S=Math.max(1,Math.floor(Math.min(vw*DPR/140,vh*DPR/180)));
  W=Math.ceil(vw*DPR/S);H=Math.ceil(vh*DPR/S);
  cv.width=W;cv.height=H;cv.style.width=(W*S/DPR)+'px';cv.style.height=(H*S/DPR)+'px';
  ctx.imageSmoothingEnabled=false;
  horizonY=Math.round(H*(portrait?.40:.42));
  dockY=Math.round(portrait?H*.75:H*.70);
  dockEnd=Math.round(portrait?Math.max(60,W*.44):Math.min(W*.32,130));
  genWorld();genFlies();allocCaches();pal=palAt(dayP);renderCaches();
  if(fish.state==='wait'||fish.state==='nibble'||fish.state==='bite')placeBobberOnWater();
}
function charX(){return dockEnd-27}
function charFeet(){return dockY+2}

/* ================= DOCK & FOREGROUND ================= */
function drawDock(g){
  const y=dockY,e=dockEnd;
  const top='#b98a55',topL='#d6a86c',topD='#8a6238',face='#6e4a2a',faceD='#4f331c',post='#5a3c22',postD='#3c2714',seam='#6a4626';
  // posts (behind)
  const wl=y+11,wc=pal?pal.deep:[20,40,80];
  for(let px=e-4;px>-6;px-=16){g.fillStyle=postD;g.fillRect(px,y+5,4,wl-y-5);g.fillStyle=post;g.fillRect(px,y+5,3,wl-y-5);g.fillStyle='#7a5432';g.fillRect(px,y+5,1,wl-y-5);
    g.fillStyle=css(mixc(hx('#3c2714'),wc,.55));g.fillRect(px,wl,4,1);
    for(let k=1;k<14;k++){const a=.55*(1-k/14);if(a<.04)break;const off=Math.round(Math.sin(T*2+k*.8+px)*(.3+k*.08));g.fillStyle=css(mixc(hx('#3c2714'),wc,.35),a);g.fillRect(px+off,wl+k,4,1)}
    g.fillStyle=css(mixc(WHITE,wc,.4),.5);const wv=Math.round(Math.sin(T*2.4+px)*1);g.fillRect(px-1+wv,wl,1,1);g.fillRect(px+4-wv,wl,1,1)}
  g.fillStyle='rgba(0,0,20,.28)';g.fillRect(-2,y+7,e+2,4);g.fillStyle='rgba(0,0,20,.14)';g.fillRect(-2,y+11,e+2,3);
  // deck surface
  g.fillStyle=top;g.fillRect(-2,y,e+2,4);g.fillStyle=topL;g.fillRect(-2,y,e+2,1);
  for(let x=e-1;x>-2;x-=5){g.fillStyle=seam;g.fillRect(x,y+1,1,3);g.fillStyle=topD;if(hash(x,3)>.5)g.fillRect(x-2,y+2,1,1)}
  for(let x=0;x<e;x+=5){g.fillStyle=hash(x,9)>.5?'#c49660':'#a97c4a';g.fillRect(x+1,y+1,2,1)}
  // front beam
  g.fillStyle=face;g.fillRect(-2,y+4,e+2,3);g.fillStyle=faceD;g.fillRect(-2,y+6,e+2,1);
  for(let x=e-4;x>-6;x-=16){g.fillStyle='#2e1e10';g.fillRect(x+1,y+5,1,1)}
  // end post w/ lantern
  const lx=Math.max(4,e-40);g.fillStyle=postD;g.fillRect(lx-1,y-14,4,15);g.fillStyle=post;g.fillRect(lx-1,y-14,3,15);g.fillStyle='#7a5432';g.fillRect(lx-1,y-14,1,15);
  g.fillStyle='#2b2b30';g.fillRect(lx-2,y-15,6,1);
  // hanging lantern
  const ax=lx+3;g.fillStyle='#2b2b30';g.fillRect(lx+2,y-14,3,1);g.fillRect(ax+1,y-13,1,2);
  g.fillStyle='#2b2b30';g.fillRect(ax-1,y-11,5,1);g.fillRect(ax-1,y-5,5,1);g.fillRect(ax-1,y-10,1,5);g.fillRect(ax+3,y-10,1,5);
  const nf=nightF(dayP);const fl=.85+.15*Math.sin(T*13)*Math.sin(T*7.3);
  g.fillStyle=css(mixc(hx('#8a7a60'),hx('#ffd27a'),Math.max(.2,nf*fl)));g.fillRect(ax,y-10,3,5);
  g.fillStyle=css(mixc(hx('#b0a080'),hx('#fff6c8'),Math.max(.2,nf*fl)));g.fillRect(ax+1,y-9,1,2);
  // near shore: rocks + grass bottom-left
}
function drawShoreFG(g){
  // bottom left rocks
  const by=H;const rk=(x,y,w,h,c1,c2,c3)=>{g.fillStyle='#2a2630';g.fillRect(x-1,y-1,w+2,h+1);g.fillStyle=c1;g.fillRect(x,y,w,h);g.fillStyle=c2;g.fillRect(x,y,w-1,1);g.fillRect(x,y,1,h-1);g.fillStyle=c3;g.fillRect(x+1,y+h-1,w-1,1);g.fillRect(x+w-1,y+1,1,h-1)};
  rk(-2,by-7,12,8,'#6c6878','#8e8a9a','#4e4a5a');rk(8,by-4,8,5,'#76727f','#9a96a4','#555160');rk(W-30,by-5,9,6,'#6c6878','#8e8a9a','#4e4a5a');
  // grass
  for(const gr of grass){const sw=Math.round(Math.sin(T*1.6+gr.p+gr.x*.1)*(.6+rainI*.8));const h=gr.h+2;const col=hash(gr.x,1)>.5?'#3f7a3a':'#2f6030';
    g.fillStyle=col;g.fillRect(gr.x,by-h,1,h);g.fillStyle='#6aa84a';g.fillRect(gr.x+sw,by-h-1,1,1)}
  // reeds
  for(const r of reeds){const sw=Math.sin(T*1.3+r.p)*(1+rainI*1.2);const hb=r.h;
    for(let i=0;i<hb;i++){const k=i/hb;const xx=Math.round(r.x+sw*k*k);g.fillStyle=i>hb-3?'#8fba5a':(r.c>.5?'#4d8a3c':'#3b7236');g.fillRect(xx,r.base-i,1,1)}
    if(r.cat){const xx=Math.round(r.x+sw);g.fillStyle='#5a3620';g.fillRect(xx,r.base-hb-3,2,4);g.fillStyle='#7a4c2c';g.fillRect(xx,r.base-hb-3,1,3);g.fillStyle='#8fba5a';g.fillRect(xx,r.base-hb-5,1,2)}}
}
function drawLilies(g){
  for(const l of lilies){const s=.6+(l.y-horizonY)/(H-horizonY)*.6;const w=Math.round((l.s?7:5)*s+2),h=Math.max(2,Math.round(w*.38));const x=Math.round(l.x),y=Math.round(l.y+Math.sin(T+l.p)*.5);
    g.fillStyle='#1f4a2a';g.fillRect(x-w,y-h+1,w*2+1,h*2-1);g.fillRect(x-w+1,y-h,w*2-1,h*2+1);
    g.fillStyle='#3f8a3e';g.fillRect(x-w+1,y-h+1,w*2-1,h*2-1);g.fillStyle='#62ae4e';g.fillRect(x-w+2,y-h+1,w*2-4,1);
    // notch
    g.fillStyle='#1f4a2a';g.fillRect(x,y-h+1,1,h);g.fillStyle='#2e6a34';g.fillRect(x-w+2,y+h-1,w*2-3,1);
    if(l.f){g.fillStyle='#fff';g.fillRect(x-2,y-2,1,2);g.fillRect(x+1,y-2,1,2);g.fillStyle='#ffc4d8';g.fillRect(x-1,y-3,2,3);g.fillStyle='#ffe066';g.fillRect(x-1,y-1,2,1)}}
}
function lanternPos(){return{x:Math.max(4,dockEnd-40)+4,y:dockY-8}}
let glowCv=null;
function buildGlow(){const r0=24,[c,g]=mk(r0*2+1,r0*2+1);for(let yy=-r0;yy<=r0;yy++)for(let xx=-r0;xx<=r0;xx++){const d=Math.sqrt(xx*xx+yy*yy)/r0;if(d>1)continue;const v=(1-d)*(1-d);const th=(BAYER[((yy+64)&3)*4+((xx+64)&3)]+.5)/16;const q=Math.floor(v*5+th)/5;if(q<=0)continue;g.fillStyle=css([255,180,80],q*.4);g.fillRect(xx+r0,yy+r0,1,1)}glowCv=c}
function drawGlow(){
  const nf=nightF(dayP);if(nf<.05)return;if(!glowCv)buildGlow();const L=lanternPos();const fl=.85+.15*Math.sin(T*13)*Math.sin(T*7.3);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=nf*fl;ctx.drawImage(glowCv,L.x-24,L.y-24);ctx.globalAlpha=1;
  const ry=dockY+12;for(let i=0;i<16;i++){const w=2+i*.4;const a=nf*fl*(1-i/16)*.5;if(hash(i,Math.floor(T*6))<.3)continue;ctx.fillStyle=css([255,200,110],a);ctx.fillRect(Math.round(L.x-w/2+Math.sin(T*2+i*.7)*1.2),ry+i,Math.max(1,Math.round(w)),1)}
  ctx.globalCompositeOperation='source-over';
}

/* ================= CLAWD (maskot) 16x10 body ================= */
const CO={o:'#d97757',l:'#e8906f',h:'#f4b596',d:'#b95c3e',dd:'#933f27',k:'#1d1310',ol:'#3d1a10'};
function drawClawd(g,x,y,p){
  x=Math.round(x);y=Math.round(y);const P=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(x+a,y+b,w,h)};
  const sq=p.sq||0,by=sq,bh=10-sq,lean=p.lean||0;
  const aL=p.armL||[0,0],aR=p.armR||[0,0],legs=p.legs||[0,0,0,0];
  // shadow on dock
  g.fillStyle='rgba(40,20,10,.35)';g.fillRect(x-1,y+12,18,1);g.fillRect(x+1,y+13,14,1);
  // legs (behind body): 4 legs at x=1,4,11,14 each 2 wide
  const LX=[1,4,10,13];
  for(let i=0;i<4;i++){const up=legs[i];P(LX[i]-1,by+bh-1,4,3-up+1,CO.ol);}
  for(let i=0;i<4;i++){const up=legs[i];P(LX[i],by+bh,2,2-up,i===1||i===2?CO.dd:CO.d);P(LX[i],by+bh,1,2-up,i===1||i===2?CO.d:CO.o)}
  // arm outlines + arms
  const arm=(ax,ay,c1,c2)=>{P(ax-1,ay-1,5,4,CO.ol);P(ax,ay,3,2,c1);P(ax,ay,3,1,c2)};
  // body outline
  P(-1+lean,by-1,18,bh+2,CO.ol);
  arm(-3+aL[0]+lean,4+by+aL[1],CO.d,CO.o);
  arm(16+aR[0]+lean,4+by+aR[1],CO.d,CO.l);
  // body fill w/ shading
  const bx=lean;
  P(bx,by,16,bh,CO.o);
  P(bx,by,16,1,CO.h);P(bx+1,by+1,14,1,CO.l);P(bx,by+1,1,bh-2,CO.l);
  P(bx+15,by+1,1,bh-1,CO.d);P(bx,by+bh-1,16,1,CO.d);P(bx+1,by+bh-2,14,1,'#c96a4b');
  P(bx+14,by+2,1,bh-4,'#c96a4b');
  // subtle pixel texture/specular
  P(bx+2,by+1,3,1,CO.h);P(bx+5,by+6,1,1,CO.l);P(bx+11,by+5,1,1,'#c96a4b');P(bx+8,by+3,1,1,CO.l);
  // re-draw arms in front? (arms at sides overlap outline) -> fill connection
  P(-1+lean,4+by+aL[1],1,2,CO.d);P(16+lean,4+by+aR[1],1,2,CO.d);
  // face
  const lx=(p.lookX||0)+bx,ey=by+2+(p.lookY||0);
  if(p.blink){P(3+lx,ey+2,2,1,CO.k);P(11+lx,ey+2,2,1,CO.k)}
  else if(p.happy){P(2+lx,ey+2,1,1,CO.k);P(3+lx,ey+1,2,1,CO.k);P(5+lx,ey+2,1,1,CO.k);P(10+lx,ey+2,1,1,CO.k);P(11+lx,ey+1,2,1,CO.k);P(13+lx,ey+2,1,1,CO.k)}
  else if(p.sad){P(3+lx,ey+1,2,1,CO.k);P(2+lx,ey,1,1,CO.k);P(11+lx,ey+1,2,1,CO.k);P(13+lx,ey,1,1,CO.k);P(3+lx,ey+2,1,1,CO.k);P(12+lx,ey+2,1,1,CO.k)}
  else if(p.wide){P(3+lx,ey-1,2,4,CO.k);P(11+lx,ey-1,2,4,CO.k);P(3+lx,ey-1,1,1,'#fff');P(11+lx,ey-1,1,1,'#fff')}
  else if(p.focus){P(3+lx,ey+1,2,2,CO.k);P(11+lx,ey+1,2,2,CO.k);P(2+lx,ey,3,1,CO.dd);P(11+lx,ey,3,1,CO.dd)}
  else{P(3+lx,ey,2,3,CO.k);P(11+lx,ey,2,3,CO.k);P(3+lx,ey,1,1,'#5a3a30');P(11+lx,ey,1,1,'#5a3a30')}
  if(p.blush){g.globalAlpha=.6;P(1+lx,ey+4,2,1,'#ff8f86');P(13+lx,ey+4,2,1,'#ff8f86');g.globalAlpha=1}
  if(p.sweat){P(16+bx,by-1,1,2,'#9fd8ff');P(17+bx,by,1,1,'#dff4ff')}
}

/* ================= SAVE ================= */
const SAVE_KEY='lake_clawd_v1';
let save={coins:0,own:{rod:[0],reel:[0],bait:[0]},eq:{rod:0,reel:0,bait:0},book:{},total:0,snd:1,best:0};
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s&&typeof s.coins==='number'){save=Object.assign(save,s);for(const k of['rod','reel','bait'])if(!save.own[k]||!save.own[k].includes(0))save.own[k]=[0].concat(save.own[k]||[])}}catch(e){}}
function writeSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}}

/* ================= FISHING STATE ================= */
const fish={state:'idle',t:0,power:0,pdir:1,bx:0,by:0,sx:0,sy:0,cast:0,castT:0,flyD:.7,wait:0,nib:0,nibT:0,dip:0,
  id:0,wt:0,d:1,ten:0,stam:1,stamMax:1,rush:0,rushT:0,jumpT:0,jumpD:0,over:0,res:null,msg:'',fx:0,fy:0,fdir:1,fphase:0,hook:0,near:0,catchT:0,landT:0};
let rodA=-1.05,rodV=0,rodBend=0,clawdY=0,clawdVy=0,blinkT=2,blinkOn=0,combo=0;
function rod(){return ITEMS.rod[save.eq.rod]}function reel(){return ITEMS.reel[save.eq.reel]}function bait(){return ITEMS.bait[save.eq.bait]}
function handPos(){const cx=charX(),cy=charFeet()-12+Math.round(clawdY);return{x:cx+18,y:cy+5}}
const ROD_LEN=28;
function rodTip(){const h=handPos();const a=rodA;const b=rodBend;
  // tip bends toward line (down-right)
  return{x:h.x+Math.cos(a)*ROD_LEN+b*.55,y:h.y+Math.sin(a)*ROD_LEN+b}}
function waterEntry(){return{x:dockEnd+6,y:dockY+14}}
function placeBobberOnWater(){fish.bx=clamp(fish.bx,dockEnd+8,W-12);fish.by=clamp(fish.by,horizonY+6,H-6)}
function castTarget(pw){
  const minX=dockEnd+14,maxX=W-(portrait?20:30);
  const x=lerp(minX,maxX,.15+pw*.85);
  const y=lerp(Math.min(H-10,dockY+Math.max(14,(H-dockY)*.45)),horizonY+Math.max(8,(dockY-horizonY)*.12),pw);
  return{x,y}}
function pickFish(){
  const per=period(dayP),b=bait(),dist=fish.cast;let tot=0;const ws=[];
  for(const f of FISH){let w=f.rar;
    if(f.time==='night')w*=per==='night'?3:(f.id===9?0:.12);
    if(f.time==='day')w*=per==='day'?2:.35;
    if(f.time==='dawn')w*=(per==='dawn'||per==='dusk')?3.5:.5;
    if(rainI>.4&&(f.id===5||f.id===6))w*=2.6;
    if(f.id===9&&rainI>.6)w*=.2;
    w*=Math.pow(1+b.luck,(f.stars-1)*.65);
    w*=1+dist*(f.stars-1)*.35;
    if(f.stars>=4&&b.luck<.3)w*=.35;
    ws.push(w);tot+=w}
  let r=Math.random()*tot;for(let i=0;i<ws.length;i++){r-=ws[i];if(r<=0)return i}return 0}
function setState(s){fish.state=s;fish.t=0}
function startCharge(){if(fish.state!=='idle')return;setState('charge');fish.power=0;fish.pdir=1;sfx('click')}
function releaseCast(){if(fish.state!=='charge')return;const pw=clamp(fish.power,0,1);fish.cast=pw;const tg=castTarget(pw);
  const tp=rodTip();fish.sx=tp.x;fish.sy=tp.y;fish.tx=tg.x;fish.ty=tg.y;fish.flyD=.55+pw*.45;setState('cast');rodV-=9;sfx('whoosh')}
function hookFish(){
  const f=FISH[fish.id];setState('reel');fish.d=1;fish.ten=.2;fish.stamMax=4+f.stam*5;fish.stam=fish.stamMax;fish.rush=0;fish.rushT=1+Math.random()*2;fish.jumpT=0;fish.over=0;
  fish.fx=fish.bx;fish.fy=fish.by;fish.fdir=Math.random()<.5?1:-1;splash(fish.bx,fish.by,10,undefined,45);addRipple(fish.bx,fish.by,12,12);sfx('hook');shake(1.5);
}
function loseFish(msg){setState('lost');fish.msg=msg;combo=0;sfx('snap');shake(2)}
let holding=false,shakeT=0,shakeA=0;
function shake(a){shakeA=Math.max(shakeA,a);shakeT=.25}

function updateFishing(dt){
  const F=fish;F.t+=dt;
  // rod spring
  let target=-1.05;
  if(F.state==='charge')target=-1.05-F.power*1.05;
  else if(F.state==='cast')target=-.55;
  else if(F.state==='wait'||F.state==='nibble'||F.state==='bite')target=-.62;
  else if(F.state==='reel')target=-.9-(holding?.25:0)+Math.sin(T*18)*F.ten*.04;
  else if(F.state==='caught')target=-1.3;
  rodV+=(target-rodA)*140*dt;rodV*=Math.pow(.0009,dt);rodA+=rodV*dt;
  let bt=0;if(F.state==='reel')bt=4+F.ten*10+(F.rush?2:0);else if(F.state==='bite')bt=4;else if(F.state==='nibble')bt=F.dip*2.5;else if(F.state==='wait'||F.state==='cast')bt=1;
  rodBend+=(bt-rodBend)*Math.min(1,dt*10);
  // clawd hop physics
  clawdVy+=260*dt;clawdY+=clawdVy*dt;if(clawdY>0){clawdY=0;clawdVy=0}
  blinkT-=dt;if(blinkT<0){blinkOn=.12;blinkT=1.8+Math.random()*3.5}if(blinkOn>0)blinkOn-=dt;
  if(shakeT>0){shakeT-=dt;if(shakeT<=0)shakeA=0}
  switch(F.state){
  case'charge':F.power+=F.pdir*dt*1.05;if(F.power>1){F.power=1;F.pdir=-1}if(F.power<0){F.power=0;F.pdir=1}break;
  case'cast':{const k=Math.min(1,F.t/F.flyD);const e=k;F.bx=lerp(F.sx,F.tx,e);F.by=lerp(F.sy,F.ty,e)-Math.sin(k*Math.PI)*(18+F.cast*28);
    if(k>=1){F.bx=F.tx;F.by=F.ty;splash(F.bx,F.by,8,undefined,35);addRipple(F.bx,F.by,9,10);addRipple(F.bx,F.by,5,6);sfx('plop');setState('wait');F.wait=(2.2+Math.random()*6)/bait().bite;F.id=pickFish();F.nib=Math.random()<.8?1+((Math.random()*3)|0):0}break}
  case'wait':F.wait-=dt;F.dip=Math.max(0,F.dip-dt*4);
    if(F.wait<=0){if(F.nib>0){setState('nibble');F.dip=1;F.nib--;addRipple(F.bx,F.by,5,8,.7);sfx('nib')}else{setState('bite');F.dip=0;addRipple(F.bx,F.by,11,14,1);addRipple(F.bx,F.by,6,9,1);splash(F.bx,F.by,6,undefined,28);sfx('bite');clawdVy=-40}}
    break;
  case'nibble':F.dip=Math.max(0,1-F.t*3.5);if(F.t>.45){setState('wait');F.wait=.5+Math.random()*1.4}break;
  case'bite':{const f=FISH[F.id];if(F.t>f.win+.25){setState('miss');F.msg='TERLALU LAMBAT!';sfx('miss')}break}
  case'reel':updateReel(dt);break;
  case'caught':case'lost':case'miss':case'early':break;
  case'landing':{const k=Math.min(1,F.t/.75);const h=handPos();
    F.fx=lerp(F.lsx,h.x-6,k);F.fy=lerp(F.lsy,h.y-18,k)-Math.sin(k*Math.PI)*26;if(k>=1){setState('caught');finishCatch()}break}
  }
  if((F.state==='lost'||F.state==='miss'||F.state==='early')&&F.t>1.6)setState('idle');
}
function updateReel(dt){
  const F=fish,f=FISH[F.id],r=rod(),rl=reel();
  const sR=F.stam/F.stamMax;
  F.rushT-=dt;if(F.rush>0){F.rush-=dt;if(F.rush<=0){F.rushT=(1.2+Math.random()*2.4)/(.5+f.burst*2)}}
  else if(F.rushT<=0){F.rush=.6+Math.random()*.9*(.5+f.burst);sfx('rush');addRipple(F.fx,F.fy,10,14);splash(F.fx,F.fy,6,undefined,30);
    if(Math.random()<f.jump&&F.jumpT<=0&&F.d>.2){F.jumpT=.01;F.jumpD=.8}}
  if(F.jumpT>0){F.jumpT+=dt;if(F.jumpT>=F.jumpD){F.jumpT=0;splash(F.fx,F.fy,14,undefined,50);addRipple(F.fx,F.fy,14,14);addRipple(F.fx,F.fy,7,9);sfx('splash');shake(1.5)}}
  const jumping=F.jumpT>0;
  let pull=f.pull*(F.rush>0?f.bp:1)*(.35+.65*sR)*(jumping?1.6:1);
  if(f.pat==='moon')pull*=1+.35*Math.sin(T*5.3)*Math.sin(T*2.1);
  // tegangan: naik saat menggulung (tergantung tarikan ikan & kekuatan senar), turun saat dilepas
  const lineK=1/r.line;
  if(holding)F.ten+=(.22+pull*.95)*lineK*dt*.95;else F.ten-=(.55+.25*(1-pull))*dt;
  if(F.rush>0)F.ten+=pull*.45*lineK*dt;
  F.ten=clamp(F.ten,0,1.02);
  if(F.ten>=1){F.over+=dt;if(F.over>.4){loseFish('SENAR PUTUS!');return}}else F.over=Math.max(0,F.over-dt*2);
  if(holding){F.d-=rl.spd*.2*dt*(1-Math.min(.6,pull*.5))*(F.rush>0?.4:1);if(Math.random()<dt*14)sfx('reelTick')}
  else F.d+=pull*pull*.2*dt*(.4+.6*sR)/r.line;
  if(F.rush>0)F.d+=pull*pull*.14*dt/r.line;
  const eff=F.ten>.25&&F.ten<.92?1.5:.5;F.stam=Math.max(0,F.stam-dt*(holding?1:.35)*eff);
  if(F.d>=1.22){loseFish('IKAN KABUR!');return}
  if(F.d<=0){F.d=0;setState('landing');F.lsx=F.fx;F.lsy=F.fy;splash(F.fx,F.fy,16,undefined,55);addRipple(F.fx,F.fy,12,12);sfx('splash');return}
  // fish position (hook) : from water entry to bobber pos
  const we=waterEntry();const hxp=lerp(we.x,F.bx,clamp(F.d,0,1.2)),hyp=lerp(we.y,F.by,clamp(F.d,0,1.2));
  const wig=(F.rush>0?7:3)*(.4+sR*.6);F.fphase+=dt*(F.rush>0?6:2.4)*f.speed;
  const tx=hxp+Math.sin(F.fphase)*wig,ty=hyp+Math.cos(F.fphase*.7)*wig*.35;
  const odx=F.fx;F.fx+=(tx-F.fx)*Math.min(1,dt*6);F.fy+=(ty-F.fy)*Math.min(1,dt*6);
  const vx=F.fx-odx;if(Math.abs(vx)>.02)F.fdir=vx>0?1:-1;
  F.fy=Math.max(F.fy,horizonY+4);
  if(Math.random()<dt*(F.rush>0?10:2.5))addRipple(F.fx+(Math.random()-.5)*4,F.fy,3+Math.random()*3,7,.5);
}
function finishCatch(){
  const f=FISH[fish.id];const r=Math.pow(Math.random(),1.6-bait().luck*.25);const wt=+(f.w[0]+(f.w[1]-f.w[0])*r).toFixed(2);
  const price=Math.max(1,Math.round(f.price*(.75+r*.6)*(1+Math.min(combo,5)*.05)));
  const rec=save.book[f.id];const isNew=!rec;const isBest=!rec||wt>rec.b;
  save.book[f.id]={n:(rec?rec.n:0)+1,b:Math.max(rec?rec.b:0,wt)};save.coins+=price;save.total++;combo++;writeSave();
  fish.res={id:f.id,wt,price,isNew,isBest};fish.catchT=0;clawdVy=-70;sfx(isNew?'fanfare':'coin');
  for(let i=0;i<14;i++)parts.push({x:handPos().x-6,y:handPos().y-14,vx:(Math.random()-.5)*80,vy:-40-Math.random()*60,l:.8+Math.random()*.6,t:0,c:['#ffe066','#fff4d6','#ff9d6a','#9fe3ff'][i%4],g:120,wy:9999})
}

/* ================= AUDIO (synth, offline) ================= */
let AC=null,master=null,ambG=null,musG=null,noiseBuf=null,musT=0;
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return}
  try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}
  master=AC.createGain();master.gain.value=save.snd?.8:0;master.connect(AC.destination);
  noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=noiseBuf.getChannelData(0);let b=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;b=(b+.02*w)/1.02;d[i]=b*3.5}
  // ambient lake: brown noise lowpassed
  const src=AC.createBufferSource();src.buffer=noiseBuf;src.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;
  ambG=AC.createGain();ambG.gain.value=.10;src.connect(lp);lp.connect(ambG);ambG.connect(master);src.start();
  musG=AC.createGain();musG.gain.value=.12;musG.connect(master);
}
function setSound(on){save.snd=on?1:0;writeSave();if(master)master.gain.setTargetAtTime(on?.8:0,AC.currentTime,.05)}
function tone(f,d,type,vol,slide,delay,dest){if(!AC||!save.snd)return;const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.1,t+.008);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(dest||master);o.start(t);o.stop(t+d+.02)}
function noise(d,f,vol,type,delay,q){if(!AC||!save.snd)return;const t=AC.currentTime+(delay||0);const s=AC.createBufferSource();s.buffer=noiseBuf;const fl=AC.createBiquadFilter();fl.type=type||'bandpass';fl.frequency.setValueAtTime(f,t);if(q)fl.Q.value=q;const g=AC.createGain();
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(master);s.start(t,Math.random()*1.5);s.stop(t+d+.05)}
let lastTick=0;
function sfx(n){if(!AC||!save.snd)return;switch(n){
  case'click':tone(880,.05,'square',.05);break;
  case'tab':tone(660,.04,'square',.04);tone(990,.05,'square',.03,0,.03);break;
  case'whoosh':noise(.35,900,.5,'bandpass',0,.8);break;
  case'plop':tone(420,.12,'sine',.18,140);noise(.12,1200,.25);break;
  case'plopS':tone(620,.07,'sine',.05,260);break;
  case'nib':tone(700,.05,'sine',.08,500);break;
  case'bite':tone(300,.16,'sine',.22,110);noise(.18,900,.35);tone(1320,.08,'square',.05,0,.02);break;
  case'hook':tone(220,.1,'square',.08,440);tone(660,.1,'square',.06,0,.06);break;
  case'rush':noise(.25,500,.3,'bandpass',0,1.5);break;
  case'splash':noise(.45,1400,.5);tone(260,.2,'sine',.12,90);break;
  case'reelTick':{const now=AC.currentTime;if(now-lastTick<.05)break;lastTick=now;tone(2400+Math.random()*300,.018,'square',.025);break}
  case'snap':tone(1800,.05,'sawtooth',.08,300);noise(.2,2500,.25,'highpass');tone(200,.3,'triangle',.1,80,.05);break;
  case'miss':tone(440,.12,'triangle',.08,330);tone(330,.18,'triangle',.08,247,.1);break;
  case'coin':tone(988,.08,'square',.06);tone(1319,.22,'square',.06,0,.07);break;
  case'fanfare':[523,659,784,1047].forEach((f,i)=>tone(f,.18,'square',.05,0,i*.09));tone(1319,.4,'triangle',.07,0,.36);break;
  case'buy':tone(784,.07,'square',.05);tone(1047,.07,'square',.05,0,.06);tone(1568,.2,'square',.05,0,.12);break;
  case'err':tone(160,.18,'square',.06,120);break;
  case'page':noise(.12,3000,.15,'highpass');break;
}}
// gentle generative music (pentatonic plucks), mood by time of day
const SCALE=[0,2,4,7,9,12,14,16,19,21];
function updateMusic(dt){if(!AC||!save.snd||AC.state!=='running')return;musT-=dt;if(musT>0)return;
  const per=period(dayP);const root=per==='night'?196:per==='dusk'?220:per==='dawn'?233:262;
  musT=.55+Math.random()*1.3;if(Math.random()<.25){musT+=1.5;return}
  const n=SCALE[(Math.random()*SCALE.length)|0];const f=root*Math.pow(2,n/12);
  tone(f,1.6,'triangle',.05*(1-rainI*.5),0,0,musG);if(Math.random()<.3)tone(f*1.5,1.2,'sine',.025,0,.18,musG);
  if(Math.random()<.18)tone(root/2,2.2,'sine',.05,0,0,musG);
  if(ambG)ambG.gain.setTargetAtTime(.1+rainI*.18,AC.currentTime,.5);
  if(rainI>.2&&Math.random()<rainI)noise(.08,4000,.04*rainI,'highpass',Math.random()*.3);
}

/* ================= SCENE DRAW ================= */
let FSPRf=[],FSILf=[];
function flipC(c){const[o,g]=mk(c.width,c.height);g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return o}
function buildFishAll(){buildFish();FSPRf=FSPR.map(flipC);FSILf=FSIL.map(flipC)}
// x,y = top-left ; dir 1 = facing right
function drawFish(g,i,x,y,sc,dir,t,amp,sil,alpha){
  const spr=(sil?(dir>0?FSIL:FSILf):(dir>0?FSPR:FSPRf))[i],w=spr.width,h=spr.height;
  const pa=g.globalAlpha;g.globalAlpha=pa*(alpha===undefined?1:alpha);x=Math.round(x);y=Math.round(y);
  for(let cx=0;cx<w;cx++){const u=dir>0?1-cx/w:cx/w;const off=Math.round(Math.sin(t*8-(dir>0?-cx:cx)*.32)*amp*u*u);g.drawImage(spr,cx,0,1,h,x+cx*sc,y+off*sc,sc,h*sc)}
  g.globalAlpha=pa}
function plot(g,x,y,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1)}
function qcurve(g,x0,y0,cx,cy,x1,y1,col,alpha){const len=Math.hypot(x1-x0,y1-y0)+Math.abs(cy-(y0+y1)/2);const n=Math.max(4,Math.ceil(len*1.4));g.globalAlpha=alpha;g.fillStyle=col;let lx=-99,ly=-99;
  for(let i=0;i<=n;i++){const t=i/n,a=(1-t)*(1-t),b=2*(1-t)*t,c=t*t;const x=Math.round(a*x0+b*cx+c*x1),y=Math.round(a*y0+b*cy+c*y1);if(x===lx&&y===ly)continue;lx=x;ly=y;g.fillRect(x,y,1,1)}g.globalAlpha=1}

function clawdPose(){
  const F=fish,st=F.state;const br=Math.sin(T*2.6);const p={sq:br>.55?1:0,lookX:0,lookY:0,blink:blinkOn>0,armR:[0,0],armL:[0,0],legs:[0,0,0,0],lean:0};
  if(scene!=='play'){p.lookX=0;if(Math.sin(T*.5)>.7)p.lookX=1;return p}
  switch(st){
  case'idle':p.lookX=Math.sin(T*.4)>.6?1:0;break;
  case'charge':p.sq=1+(F.power>.5?1:0);p.lean=-1;p.focus=!p.blink;p.armR=[-1,-2];p.lookX=1;break;
  case'cast':p.lookX=1;p.wide=F.t<.3;p.armR=[1,-1];p.lean=F.t<.25?1:0;break;
  case'wait':p.lookX=1;if(Math.sin(T*3.1)>.93)p.legs=[1,0,0,0];break;
  case'nibble':p.lookX=1;p.wide=true;break;
  case'bite':p.lookX=1;p.wide=true;p.sq=0;break;
  case'reel':{p.lookX=1;p.focus=!p.blink;const tg=holding&&Math.sin(T*16)>0;p.lean=holding?-1:1;p.legs=tg?[1,0,1,0]:[0,1,0,1];if(!holding)p.legs=[0,0,0,0];p.armR=[holding?-1:1,holding?-1:0];p.sweat=F.ten>.72;p.sq=F.rush>0?1:0;break}
  case'landing':p.wide=true;p.armL=[0,-3];p.armR=[0,-3];break;
  case'caught':p.happy=true;p.blush=true;p.armL=[1,-4];p.armR=[-1,-4];p.legs=Math.sin(T*8)>0?[1,0,0,1]:[0,1,1,0];break;
  case'lost':case'miss':case'early':p.sad=true;p.lookX=1;p.sq=1;break}
  return p}

function drawBobber(g){
  const F=fish;const st=F.state;if(!(st==='cast'||st==='wait'||st==='nibble'||st==='bite'))return;
  let x=Math.round(F.bx),y=Math.round(F.by);let sink=0,air=st==='cast';
  if(!air){y+=Math.round(Math.sin(T*2.3)*.6);sink=st==='bite'?3:Math.round(F.dip*2)}
  const top=y-4+sink;
  const px=(dx,dy,c)=>{const yy=top+dy;if(!air&&yy>y){g.globalAlpha=.35}g.fillStyle=c;g.fillRect(x+dx,yy,1,1);g.globalAlpha=1};
  // outline
  const ol='#2a1018';
  px(0,-1,ol);px(-1,0,ol);px(1,0,ol);px(-2,1,ol);px(2,1,ol);px(-2,2,ol);px(2,2,ol);px(-2,3,ol);px(2,3,ol);px(-1,4,ol);px(1,4,ol);px(0,5,ol);
  px(0,0,'#ffffff');px(-1,1,'#ff5a4a');px(0,1,'#ff8a70');px(1,1,'#d8302a');px(-1,2,'#e8402e');px(0,2,'#e8402e');px(1,2,'#b82220');
  px(-1,3,'#f4f4f0');px(0,3,'#ffffff');px(1,3,'#cfcfd8');px(0,4,'#e0e0e8');
  if(!air){g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x-3,y+1,2,1);g.fillRect(x+2,y+1,2,1)}
  if(st==='bite'){const b=Math.sin(T*20)>0;txtG(g,'!',x-1,top-10+(b?0:-1),'#ffe066',1)}
}
function txtG(g,s,x,y,col,sc){const c=textCanvas(String(s).toUpperCase(),col,sc,'#1a1024');g.drawImage(c,Math.round(x),Math.round(y))}

function drawRodAndLine(g){
  const F=fish,h=handPos(),r=rod();
  const a=rodA,tp=rodTip();const cx=h.x+Math.cos(a)*ROD_LEN*.55,cy=h.y+Math.sin(a)*ROD_LEN*.55;
  // line first (behind rod tip)
  let lx=null,ly=null,sag=0,taut=0;
  const st=F.state;
  if(st==='cast'){lx=F.bx;ly=F.by-4;sag=4}
  else if(st==='wait'||st==='nibble'||st==='bite'){lx=F.bx;ly=F.by-3+(st==='bite'?3:Math.round(F.dip*2));sag=Math.max(4,(ly-tp.y)*.18)+(st==='bite'?-6:0)}
  else if(st==='reel'){if(F.jumpT>0){lx=F.jx;ly=F.jy}else{lx=F.fx;ly=F.fy}sag=(1-F.ten)*10;taut=F.ten}
  else if(st==='landing'){lx=F.fx;ly=F.fy;sag=2}
  else{lx=tp.x+1;ly=tp.y+10+Math.sin(T*2)*1;sag=0}
  if(lx!==null){const col=taut>.72?css(mixc([236,240,255],[255,90,70],clamp((taut-.72)/.28,0,1))):'#ecf0ff';
    qcurve(g,tp.x,tp.y,(tp.x+lx)/2,(tp.y+ly)/2+sag,lx,ly,col,.8);
    if(st==='idle'||st==='caught'||st==='lost'||st==='miss'||st==='early'){// hook+bait hanging
      g.fillStyle='#9aa0aa';g.fillRect(Math.round(lx),Math.round(ly),1,2);g.fillRect(Math.round(lx)-1,Math.round(ly)+2,1,1);const b=bait();g.fillStyle=b.c[0];g.fillRect(Math.round(lx),Math.round(ly)+2,1,1)}}
  // rod
  const n=Math.ceil(ROD_LEN*1.6);let px=-99,py=-99;
  for(let i=0;i<=n;i++){const t=i/n;const X=(1-t)*(1-t)*h.x+2*(1-t)*t*cx+t*t*tp.x,Y=(1-t)*(1-t)*h.y+2*(1-t)*t*cy+t*t*tp.y;const xi=Math.round(X),yi=Math.round(Y);if(xi===px&&yi===py)continue;px=xi;py=yi;
    let c=t<.22?'#4a2e1a':t>.93?r.c[2]:r.c[0];if(t>.22&&t<.26)c=r.c[1];if(Math.abs(t-.5)<.02||Math.abs(t-.75)<.02)c=r.c[1];
    g.fillStyle=c;g.fillRect(xi,yi,1,1);if(t<.2){g.fillStyle='#2e1c10';g.fillRect(xi+1,yi,1,1)}else if(t<.55){g.fillStyle=css(mixc(hx(r.c[0].length===7?r.c[0]:'#888888'),BLACK,.35));g.fillRect(xi+1,yi,1,1)}}
  // reel
  const rl=reel();const rx=Math.round(h.x+Math.cos(a)*5),ry=Math.round(h.y+Math.sin(a)*5)+2;
  g.fillStyle='#1d1420';g.fillRect(rx-2,ry-1,5,5);g.fillStyle=rl.c[0];g.fillRect(rx-1,ry,3,3);g.fillStyle=rl.c[1];g.fillRect(rx,ry+1,1,1);
  const sp=(st==='reel'&&holding)?T*18:0;const hx2=Math.round(Math.cos(sp)*2),hy2=Math.round(Math.sin(sp)*2);g.fillStyle='#e8e8ea';g.fillRect(rx+hx2,ry+1+hy2,1,1);
  if(r===ITEMS.rod[4]){g.fillStyle='#fff6b0';if(Math.sin(T*3)>.6)g.fillRect(Math.round(tp.x),Math.round(tp.y)-1,1,1)}
}
function drawUnderFish(g){
  const F=fish,st=F.state;
  if(st==='wait'&&F.wait<1.6&&F.nib===0||st==='nibble'||st==='bite'||(st==='wait'&&F.wait<1.2)){const f=FISH[F.id];const spr=FSIL[F.id];const k=st==='wait'?clamp(F.wait/1.6,0,1):0;
    const ox=F.bx+(k*18+2)*(F.id%2?1:-1)-(F.id%2?0:spr.width-6);const dir=F.id%2?-1:1;
    const x=dir>0?F.bx-spr.width+4-k*18:F.bx-4+k*18;const y=F.by+3-spr.height/2+2;g.save();g.beginPath();g.rect(0,horizonY,W,H-horizonY);g.clip();drawFish(g,F.id,x,y,1,dir,T,st==='bite'?2:1,true,.32*(1-k*.6));g.restore()}
  if(st==='reel'){const f=FISH[F.id],spr=FSPR[F.id];
    if(F.jumpT>0){const k=F.jumpT/F.jumpD;const x=F.fx-spr.width/2,y=F.fy-spr.height/2-Math.sin(k*Math.PI)*(12+f.L*.3);F.jx=F.fx+F.fdir*spr.width*.3;F.jy=y+spr.height/2;
      drawFish(g,F.id,x,y,1,F.fdir,T*2,3,false,1);if(Math.random()<.3)parts.push({x:F.fx+(Math.random()-.5)*8,y:y+spr.height,vx:0,vy:10,l:.4,t:0,c:'#dff2ff',g:150,wy:F.fy})}
    else{g.save();g.beginPath();g.rect(0,horizonY,W,H-horizonY);g.clip();drawFish(g,F.id,F.fx-spr.width/2,F.fy-spr.height/2+2,1,F.fdir,T*(F.rush>0?2.2:1),F.rush>0?3:1.5,true,.5);g.restore()}}
  if(st==='landing'){const spr=FSPR[F.id];drawFish(g,F.id,F.fx-spr.width/2,F.fy-spr.height/2,1,-1,T*3,3,false,1)}
}
function drawHeldFish(g){if(fish.state!=='caught'||!fish.res)return;const spr=FSPR[fish.res.id];const cx=charX()+8,top=charFeet()-12+Math.round(clawdY);
  const bob=Math.round(Math.sin(T*6)*1);drawFish(g,fish.res.id,cx-spr.width/2,top-spr.height-2+bob,1,-1,T*3,2,false,1);
  if(Math.sin(T*5)>.3){g.fillStyle='#fff8c0';const sx=cx+spr.width/2-2,sy=top-spr.height-3;g.fillRect(sx,sy-1,1,3);g.fillRect(sx-1,sy,3,1)}}

function drawScene(){
  // sky
  ctx.drawImage(skyC,0,0);drawStars();drawSunMoon();drawClouds();drawBirds();
  ctx.drawImage(landC,0,0);
  drawWater();drawRipples();drawJumpers();
  // FG layer (tinted)
  fgX.clearRect(0,0,W,H);
  drawLilies(fgX);drawUnderFish(fgX);drawBobber(fgX);
  drawDock(fgX);
  const p=clawdPose();const cx=charX()+(shakeA&&fish.state==='reel'?Math.round((Math.random()-.5)*shakeA):0),cy=charFeet()-12+Math.round(clawdY);
  drawClawd(fgX,cx,cy,p);
  if(scene==='play')drawRodAndLine(fgX);else drawRodAndLine(fgX);
  drawHeldFish(fgX);
  if(scene==='play'&&fish.state==='bite'){const b=Math.sin(T*18)>0;const bx=cx+6,by=cy-12+(b?0:-1);fgX.fillStyle='#1a1024';fgX.fillRect(bx-1,by-1,7,9);fgX.fillStyle='#fff4d6';fgX.fillRect(bx,by,5,7);fgX.fillStyle='#e0402e';fgX.fillRect(bx+2,by+1,1,3);fgX.fillRect(bx+2,by+5,1,1);fgX.fillStyle='#fff4d6';fgX.fillRect(bx+1,by+7,1,2);fgX.fillStyle='#1a1024';fgX.fillRect(bx+1,by+9,1,1)}
  drawShoreFG(fgX);
  const ta=pal.tA+rainI*.12;if(ta>.01){fgX.globalCompositeOperation='source-atop';fgX.fillStyle=css(pal.tint.map((v,i)=>v*(1-rainI)+[70,80,100][i]*rainI),ta);fgX.fillRect(0,0,W,H);fgX.globalCompositeOperation='source-over'}
  ctx.drawImage(fgC,0,0);
  drawGlow();drawParts(ctx);drawFireflies();drawRain();
  // vignette
  if(vigC)ctx.drawImage(vigC,0,0);
}
let vigC=null;
function buildVignette(){const[c,g]=mk(W,H);const cx=W/2,cy=H/2,R=Math.hypot(cx,cy);for(let y=0;y<H;y+=1)for(let x=0;x<W;x+=1){const d=Math.hypot((x-cx)/cx*.9,(y-cy)/cy*.9);if(d<.8)continue;const th=(BAYER[(y&3)*4+(x&3)]+.5)/16;const v=(d-.8)/.5;if(v*1.2>th){g.fillStyle='rgba(10,6,24,'+Math.min(.35,v*.3).toFixed(3)+')';g.fillRect(x,y,1,1)}}vigC=c}

/* ================= UI ================= */
let scene='menu',btns=[],pressBtn=null,storeTab='rod',bookSel=-1,toast=null,fadeA=1,fadeTo=null,panelT=0,menuT=0;
const UI={ink:'#1a1024',paper:'#fff4d6',cream:'#f3e2b8',wood:'#8a5a34',woodL:'#b07a48',woodD:'#5a3620',accent:'#d97757',gold:'#ffd35a',green:'#6ac46a',red:'#e0503e',blue:'#5aa8e0'};
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x|0,y|0,w|0,h|0)}
function panel(x,y,w,h,kind){x|=0;y|=0;w|=0;h|=0;
  R(x+2,y+h,w-2,2,'rgba(10,6,24,.45)');R(x+w,y+2,2,h,'rgba(10,6,24,.45)');
  R(x+1,y,w-2,h,UI.ink);R(x,y+1,w,h-2,UI.ink);
  if(kind==='wood'){R(x+1,y+1,w-2,h-2,UI.woodD);R(x+2,y+2,w-4,h-4,UI.wood);R(x+2,y+2,w-4,1,UI.woodL);for(let yy=y+6;yy<y+h-3;yy+=6)R(x+2,yy,w-4,1,'#7a4c2a');
    R(x+4,y+4,w-8,h-8,UI.ink);R(x+5,y+5,w-10,h-10,UI.paper);R(x+5,y+5,w-10,1,'#fffbe9');R(x+5,y+h-6,w-10,1,UI.cream);
    for(const[a,b]of[[x+2,y+2],[x+w-4,y+2],[x+2,y+h-4],[x+w-4,y+h-4]]){R(a,b,2,2,'#e8c070');R(a,b,1,1,'#fff2c0')}}
  else if(kind==='dark'){R(x+1,y+1,w-2,h-2,'#2a2240');R(x+1,y+1,w-2,1,'#3e3460')}
  else{R(x+1,y+1,w-2,h-2,UI.paper);R(x+1,y+1,w-2,1,'#fffbe9');R(x+1,y+h-2,w-2,1,UI.cream)}}
function button(id,x,y,w,h,label,fn,style){x|=0;y|=0;const pr=pressBtn===id;const oy=pr?1:0;
  const base=style==='green'?['#4e9e4e','#7ad07a','#2e6a32']:style==='gray'?['#8a8494','#aaa4b4','#5a5464']:style==='blue'?['#3a78b8','#6aa8e0','#22508a']:['#c8603f','#ea8a64','#8e3f28'];
  if(!pr)R(x+1,y+h,w-2,1,UI.ink),R(x+1,y+h+1,w-2,1,'rgba(10,6,24,.4)');
  R(x+1,y+oy,w-2,h,UI.ink);R(x,y+1+oy,w,h-2,UI.ink);R(x+1,y+1+oy,w-2,h-2,base[0]);R(x+1,y+1+oy,w-2,1,base[1]);R(x+1,y+h-2+oy,w-2,1,base[2]);
  if(typeof label==='string')txt(label,x+w/2,y+((h-5)/2|0)+oy,UI.paper,1,1,base[2]);else if(label)label(x,y+oy);
  btns.push({id,x,y,w,h,fn})}
function iconCoin(x,y){R(x+1,y,4,6,UI.ink);R(x,y+1,6,4,UI.ink);R(x+1,y+1,4,4,UI.gold);R(x+1,y+1,2,1,'#fff6b0');R(x+2,y+2,1,2,'#c8962a');R(x+4,y+3,1,2,'#c8962a')}
function iconBook(x,y){R(x,y,9,8,UI.ink);R(x+1,y+1,3,6,'#5aa8e0');R(x+5,y+1,3,6,'#5aa8e0');R(x+4,y+1,1,7,UI.ink);R(x+1,y+1,3,1,'#9ad0ff');R(x+5,y+1,3,1,'#9ad0ff');R(x+2,y+3,2,1,'#fff');R(x+5,y+3,2,1,'#fff')}
function iconHome(x,y){R(x+3,y,3,1,UI.ink);R(x+2,y+1,5,1,UI.ink);R(x+1,y+2,7,1,UI.ink);R(x,y+3,9,1,UI.ink);R(x+1,y+4,7,4,UI.ink);R(x+2,y+2,5,1,'#e0503e');R(x+2,y+4,5,3,UI.paper);R(x+4,y+5,1,2,UI.wood)}
function iconSnd(x,y,on){R(x,y+2,2,4,UI.ink);R(x+2,y+1,1,6,UI.ink);R(x+3,y,1,8,UI.ink);R(x+1,y+3,1,2,UI.paper);R(x+2,y+2,1,4,UI.paper);
  if(on){R(x+5,y+2,1,4,UI.ink);R(x+7,y+1,1,6,UI.ink)}else{R(x+5,y+2,1,1,UI.red);R(x+6,y+3,1,1,UI.red);R(x+7,y+4,1,1,UI.red);R(x+7,y+2,1,1,UI.red);R(x+5,y+4,1,1,UI.red)}}
function iconBag(x,y){R(x+2,y,5,2,UI.ink);R(x+3,y+1,3,1,UI.gold);R(x,y+2,9,6,UI.ink);R(x+1,y+3,7,4,'#d97757');R(x+1,y+3,7,1,'#ea9a7a');R(x+4,y+4,1,2,UI.gold)}
function starsR(x,y,n,max){for(let i=0;i<max;i++){const c=i<n?UI.gold:'#c8b890';const xx=x+i*6;R(xx+2,y,1,1,c);R(xx+1,y+1,3,1,c);R(xx,y+2,5,1,c);R(xx+1,y+3,3,1,c);R(xx+1,y+4,1,1,c);R(xx+3,y+4,1,1,c)}}
function bar(x,y,w,h,v,col,bg){R(x,y,w,h,UI.ink);R(x+1,y+1,w-2,h-2,bg||'#3a3050');const f=Math.round((w-2)*clamp(v,0,1));if(f>0){R(x+1,y+1,f,h-2,col);R(x+1,y+1,f,1,'rgba(255,255,255,.35)')}}
function clockStr(){const m=Math.floor(dayP*1440);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.floor(m%60/10)*10).padStart(2,'0')}
function showToast(s,col){toast={s,c:col||UI.paper,t:0}}
function go(s){if(fadeTo)return;fadeTo=s;sfx('page')}

function drawHUD(){
  // top bar
  const pad=4;panel(pad,pad,Math.max(52,tw(String(save.coins))+22),13,'dark');iconCoin(pad+4,pad+3);txt(save.coins,pad+13,pad+4,UI.gold);
  // clock
  const ct=clockStr(),per=period(dayP),cw=tw(ct)+18,cx=pad,cy=pad+16;panel(cx,cy,cw,13,'dark');
  if(per==='night'){R(cx+5,cy+3,3,7,'#e9ecf7');R(cx+4,cy+4,5,5,'#e9ecf7');R(cx+7,cy+3,3,5,'#2a2240');R(cx+6,cy+4,3,4,'#2a2240');R(cx+9,cy+4,1,5,'#2a2240')}else{R(cx+4,cy+4,5,5,per==='day'?'#ffe066':'#ff9a50');R(cx+5,cy+3,3,7,per==='day'?'#ffe066':'#ff9a50');R(cx+3,cy+5,7,3,per==='day'?'#ffe066':'#ff9a50')}
  txt(ct,cx+13,cy+4,UI.paper);
  if(rainI>.3){R(cx+cw+3,cy+2,9,5,'#c9d4e4');R(cx+cw+4,cy+1,6,1,'#c9d4e4');R(cx+cw+4,cy+8,1,2,'#9fc8ff');R(cx+cw+7,cy+9,1,2,'#9fc8ff');R(cx+cw+10,cy+8,1,2,'#9fc8ff')}
  // right buttons
  const bs=15;let bx=W-pad-bs;
  button('home',bx,pad,bs,bs,(x,y)=>iconHome(x+3,y+3),()=>{if(fish.state==='reel')return;resetFish();go('menu')},'gray');bx-=bs+3;
  button('book',bx,pad,bs,bs,(x,y)=>iconBook(x+3,y+3),()=>{if(fish.state==='reel')return;resetFish();bookSel=-1;go('book')},'blue');bx-=bs+3;
  button('snd',bx,pad,bs,bs,(x,y)=>iconSnd(x+3,y+3,save.snd),()=>{setSound(!save.snd);if(save.snd)initAudio()},'gray');
  if(combo>=2){txt('COMBO X'+combo,W-pad,pad+19,UI.gold,1,2)}
  // equipment mini
  const eqs=[['rod',save.eq.rod],['reel',save.eq.reel],['bait',save.eq.bait]];
  // bottom hint
  const st=fish.state,by=H-24;
  const hint=(lines,col,sc)=>{sc=sc||1;const mw=Math.max(...lines.map(l=>tw(l,sc)))+12,hh=lines.length*7*sc+6,x=(W-mw)/2|0,y=H-10-hh;ctx.globalAlpha=.85;panel(x,y,mw,hh,'dark');ctx.globalAlpha=1;lines.forEach((l,i)=>txt(l,W/2,y+4+i*7*sc,col,sc,1))};
  if(st==='idle'){hint(tw('TAHAN LALU LEPAS UNTUK MELEMPAR')<W-24?['TAHAN LALU LEPAS UNTUK MELEMPAR']:['TAHAN LALU LEPAS','UNTUK MELEMPAR'],Math.sin(T*4)>-.3?UI.paper:UI.gold)}
  if(st==='charge'){const w=Math.min(110,W-40),x=(W-w)/2|0,y=H-22;panel(x-5,y-13,w+10,26,'dark');txt('KEKUATAN',W/2,y-8,UI.paper,1,1);
    R(x,y,w,8,UI.ink);for(let i=0;i<w-2;i++){const t=i/(w-2);R(x+1+i,y+1,1,6,css(mixc(hx('#5ad06a'),hx(t>.85?'#ff5a3a':'#ffd35a'),Math.min(1,t*1.4))))}
    const pw=Math.round((w-2)*fish.power);R(x+1+pw,y+1,w-2-pw,6,'#2a2240');R(x+pw,y-2,2,12,UI.paper);R(x+pw,y-2,2,1,UI.ink)}
  if(st==='wait'||st==='nibble'){hint(['TUNGGU GIGITAN'+['.  ','.. ','...'][Math.floor(T*2)%3]],UI.paper)}
  if(st==='bite'){hint(['TAP SEKARANG!'],Math.sin(T*20)>0?UI.gold:UI.paper,2)}
  if(st==='reel')drawReelHUD();
  if(st==='lost'||st==='miss'||st==='early'){const k=Math.min(1,fish.t*4);txt(fish.msg,W/2,H*.3-(1-k)*6|0,UI.red,2,1)}
  if(st==='caught'&&fish.res)drawCatchCard();
}
function drawReelHUD(){
  const F=fish,f=FISH[F.id];const w=Math.min(140,W-24),x=(W-w)/2|0,y=H-40;panel(x-5,y-6,w+10,39,'dark');
  txt('TEGANGAN',x,y-2,UI.paper);
  const ty=y+5;R(x,ty,w,9,UI.ink);R(x+1,ty+1,w-2,7,'#2a2240');
  const z0=Math.round((w-2)*.25),z1=Math.round((w-2)*.92);R(x+1+z0,ty+1,z1-z0,7,'#2e5a3a');R(x+1+z1,ty+1,w-2-z1,7,'#6a2a2a');
  const tv=clamp(F.ten,0,1),tx=Math.round((w-2)*tv);const tc=tv>.92?UI.red:tv>.72?'#ffb040':UI.green;R(x+1,ty+2,tx,5,tc);R(x+1,ty+2,tx,1,'rgba(255,255,255,.4)');
  const shk=tv>.92?Math.round((Math.random()-.5)*2):0;R(x+tx+shk,ty-1,2,11,UI.paper);
  // distance + stamina
  const dy=ty+12;txt('JARAK',x,dy,UI.paper);const dw=w-26;bar(x+24,dy-1,dw,6,1-clamp(F.d,0,1),UI.blue);
  // fish icon marker
  const fm=x+24+Math.round(dw*(1-clamp(F.d,0,1)));R(fm-1,dy-2,3,8,UI.gold);
  const sy=dy+8;txt('IKAN',x,sy,UI.paper);bar(x+24,sy-1,dw,6,F.stam/F.stamMax,'#e07a3a');
  if(F.rush>0){const b=Math.sin(T*25)>0;txt('MELAWAN!',W/2,y-16,b?UI.red:UI.gold,1,1)}
  else if(F.ten>.92){txt('LEPAS!',W/2,y-16,Math.sin(T*25)>0?UI.red:UI.paper,1,1)}
  else txt(holding?'GULUNG...':'TAHAN UNTUK GULUNG',W/2,y-16,UI.paper,1,1);
}
function drawCatchCard(){
  const r=fish.res,f=FISH[r.id];fish.catchT+=DT;const k=ease(clamp(fish.catchT*2.5,0,1));
  const spr=FSPR[r.id];const sc=spr.width*2<=Math.min(W-40,120)?2:1;
  const w=Math.min(W-16,168),h=108,x=(W-w)/2|0;const yMax=charFeet()-12-spr.height-20-h;const y=(clamp(Math.round(H*.24),Math.min(34,yMax),Math.max(34,yMax))+(1-k)*-40)|0;ctx.globalAlpha=k;
  panel(x,y,w,h,'wood');
  // ribbon
  const rw=Math.min(w-10,tw(f.name,1)+34);R(x+(w-rw)/2-1,y-5,rw+2,12,UI.ink);R(x+(w-rw)/2,y-4,rw,10,UI.accent);R(x+(w-rw)/2,y-4,rw,1,'#f0a080');
  txt(f.name,W/2,y-2,UI.paper,1,1,'#8e3f28');
  // rays
  const cx=W/2,cy=y+30;for(let i=0;i<12;i++){const a=i/12*6.283+T*.4;for(let d=12;d<36;d+=2){if((d+i)%4)continue;R(cx+Math.cos(a)*d*1.3,cy+Math.sin(a)*d*.55,1,1,'#f3d9a0')}}
  const sw=spr.width*sc,sh=spr.height*sc;drawFish(ctx,r.id,cx-sw/2,cy-sh/2,sc,1,T,1.5,false,k);
  starsR(cx-15,y+48,f.stars,5);
  txt('BERAT',x+12,y+60,UI.wood);txt(r.wt.toFixed(2)+' KG',x+w-12,y+60,UI.ink,1,2);
  txt('HARGA',x+12,y+69,UI.wood);iconCoin(x+w-12-tw('+'+r.price)-8,y+68);txt('+'+r.price,x+w-12,y+69,'#b0781a',1,2);
  txt(f.abil.split(':')[0],W/2,y+80,UI.accent,1,1);if(f.cat&&f.cat!=='umum')txt(CATN[f.cat],W/2,y+98,CATC[f.cat],1,1);if(combo>1)txt('COMBO X'+combo,W/2,y+89,'#b0781a',1,1);
  if(r.isNew){const b=Math.sin(T*6)>0?0:1;R(x+w-24,y-9+b,26,11,UI.ink);R(x+w-23,y-8+b,24,9,UI.red);txt('BARU!',x+w-11,y-6+b,UI.paper,1,1,'#8a2020')}
  else if(r.isBest){R(x-2,y-9,32,11,UI.ink);R(x-1,y-8,30,9,UI.green);txt('REKOR',x+14,y-6,UI.paper,1,1,'#2e6a32')}
  if(fish.catchT>.7){ctx.globalAlpha=k*(.5+.5*Math.sin(T*5));txt('TAP UNTUK LANJUT',W/2,y+h+6,UI.paper,1,1);}
  ctx.globalAlpha=1;
}

function drawMenu(){
  menuT+=1/60;
  const TG={L:['11000','11000','11000','11000','11000','11111','11111'],A:['01110','11011','11011','11111','11011','11011','11011'],K:['11011','11011','11110','11100','11110','11011','11011'],E:['11111','11000','11110','11110','11000','11111','11111']};
  const sc=Math.max(3,Math.min(8,Math.floor((W-24)/23),Math.floor(H*.2/7)));const tws=23*sc,x0=(W-tws)/2|0,y0=Math.round(H*.12);
  const rowC=['#fffaf0','#fff4d6','#ffe7bf','#ffd6a0','#f7b884','#eb9a6c','#d97757'];
  'LAKE'.split('').forEach((ch,i)=>{const G=TG[ch],oy=Math.round(Math.sin(T*2.2+i*.8)*1.5),x=x0+i*6*sc,y=y0+oy;
    const cell=(fn)=>{for(let r=0;r<7;r++)for(let c=0;c<5;c++)if(G[r][c]==='1')fn(x+c*sc,y+r*sc,r,c)};
    cell((px,py)=>R(px-2,py-2+sc,sc+4,sc+4,'#5a2a1a'));
    cell((px,py)=>R(px-2,py-2,sc+4,sc+4,UI.ink));
    cell((px,py,r)=>R(px,py,sc,sc,rowC[r]));
    cell((px,py,r,c)=>{if(r===0||G[r-1][c]!=='1')R(px,py,sc,1,'#ffffff');if(c===4||G[r][c+1]!=='1')R(px+sc-1,py,1,sc,'rgba(142,63,40,.35)')});
    if(((T*1.2+i*.61)%3.5)<.2){const sx=x+sc*1,sy=y+sc;R(sx,sy-3,1,7,'#fff');R(sx-3,sy,7,1,'#fff');R(sx-1,sy-1,3,3,'#fff')}});
  const tbot=y0+7*sc+4;
  txt('A QUIET FISHING DAY',W/2,tbot+4,UI.paper,1,1);
  const bw=Math.min(96,W-60),bh=18,bx=(W-bw)/2|0;let by=Math.round(Math.max(tbot+18,H*.42));
  if(by+bh*2+10>dockY-18)by=Math.max(tbot+14,dockY-18-bh*2-10);
  button('play',bx,by,bw,bh,'PLAY',()=>{initAudio();resetFish();go('play')},'green');
  button('store',bx,by+bh+6,bw,bh,'STORE',()=>{initAudio();go('store')});
  const s2=15;button('msnd',W-4-s2,4,s2,s2,(x,y)=>iconSnd(x+3,y+3,save.snd),()=>{setSound(!save.snd);if(save.snd)initAudio()},'gray');
  button('mbook',W-4-s2*2-3,4,s2,s2,(x,y)=>iconBook(x+3,y+3),()=>{initAudio();bookSel=-1;go('book')},'blue');
  panel(4,4,Math.max(52,tw(String(save.coins))+22),13,'dark');iconCoin(8,7);txt(save.coins,17,8,UI.gold);
  const n=Object.keys(save.book).length;txt('BUKU '+n+'/'+FISH.length,W/2,H-10,UI.paper,1,1);
}

function drawStore(){
  ctx.fillStyle='rgba(10,6,24,.45)';ctx.fillRect(0,0,W,H);
  const k=ease(clamp(panelT*3,0,1));const w=Math.min(W-10,230),h=Math.min(H-16,34+5*24+16),x=(W-w)/2|0,y=((H-h)/2+(1-k)*30)|0;
  panel(x,y,w,h,'wood');
  txt('STORE',x+12,y+10,UI.ink,2,0,UI.cream);
  iconCoin(x+w-14-tw(String(save.coins))-8,y+11);txt(save.coins,x+w-12,y+12,'#b0781a',1,2,UI.cream);
  // tabs
  const tabs=['rod','reel','bait'],tbw=((w-22)/3)|0;
  tabs.forEach((t,i)=>{const tx=x+11+i*(tbw+0),ty=y+24,on=storeTab===t;R(tx,ty,tbw-1,13,UI.ink);R(tx+1,ty+1,tbw-3,on?12:11,on?UI.accent:'#c8b48a');if(on)R(tx+1,ty+1,tbw-3,1,'#f0a080');
    txt(TABN[t],tx+tbw/2,ty+4,on?UI.paper:UI.woodD,1,1,on?'#8e3f28':null);btns.push({id:'tab'+t,x:tx,y:ty,w:tbw,h:13,fn:()=>{storeTab=t;sfx('tab')}})});
  const list=ITEMS[storeTab],ly=y+39,rh=Math.min(24,((h-50)/5)|0);R(x+6,ly-1,w-12,1,UI.ink);
  list.forEach((it,i)=>{const ry=ly+i*rh;const own=save.own[storeTab].includes(i),eq=save.eq[storeTab]===i;
    if(i%2===0)R(x+6,ry,w-12,rh,'rgba(200,170,110,.18)');
    R(x+9,ry+2,19,18,UI.ink);R(x+10,ry+3,17,16,eq?'#ffe8b0':'#e9d6aa');drawItemIcon(ctx,storeTab,i,x+10,ry+3);
    txt(it.n,x+32,ry+4,UI.ink);
    const st=storeTab==='rod'?'SENAR X'+it.line.toFixed(1):storeTab==='reel'?'GULUNG X'+it.spd.toFixed(1):'HOKI +'+Math.round(it.luck*100)+'%';
    txt(st,x+32,ry+12,UI.wood);
    const bw2=36,bx2=x+w-9-bw2,by2=ry+4;
    if(eq)txt('DIPAKAI',bx2+bw2/2,by2+4,'#2e6a32',1,1);
    else if(own)button('eq'+i,bx2,by2,bw2,13,'PAKAI',()=>{save.eq[storeTab]=i;writeSave();sfx('tab')},'blue');
    else{const can=save.coins>=it.p;button('buy'+i,bx2,by2,bw2,13,(bx,byy)=>{iconCoin(bx+4,byy+3);txt(it.p,bx+bw2-4,byy+4,can?UI.paper:'#d8d0e0',1,2,can?'#2e6a32':'#5a5464')},()=>{if(save.coins>=it.p){save.coins-=it.p;save.own[storeTab].push(i);save.eq[storeTab]=i;writeSave();sfx('buy');showToast(it.n+' DIBELI!',UI.gold)}else{sfx('err');showToast('KOIN TIDAK CUKUP',UI.red)}},can?'green':'gray')}
  });
  const cb=14;button('close',x+w-cb-4,y-4,cb,cb,(bx,byy)=>{R(bx+4,byy+4,1,1,UI.paper);R(bx+5,byy+5,1,1,UI.paper);R(bx+6,byy+6,1,1,UI.paper);R(bx+7,byy+7,1,1,UI.paper);R(bx+8,byy+8,1,1,UI.paper);R(bx+8,byy+4,1,1,UI.paper);R(bx+7,byy+5,1,1,UI.paper);R(bx+5,byy+7,1,1,UI.paper);R(bx+4,byy+8,1,1,UI.paper)},()=>go(prevScene||'menu'),'red');
}
let prevScene='menu';
function drawBook(){
  ctx.fillStyle='rgba(10,6,24,.45)';ctx.fillRect(0,0,W,H);
  const k=ease(clamp(panelT*3,0,1));const w=Math.min(W-10,220),h=Math.min(H-16,portrait?196:H-16),x=(W-w)/2|0,y=((H-h)/2+(1-k)*30)|0;
  panel(x,y,w,h,'wood');
  const cnt=Object.keys(save.book).length;
  txt('BUKU IKAN',x+12,y+10,UI.ink,2,0,UI.cream);txt(cnt+'/10',x+w-10,y+13,UI.wood,1,2);
  const cb=14;
  if(bookSel<0){
    const gx=x+9,gy=y+26,cols=2,cw=((w-18)/cols)|0,ch=Math.min(30,((h-34)/5)|0);
    for(let i=0;i<10;i++){const c=i%cols,r=(i/cols)|0,cx=gx+c*cw,cy=gy+r*ch;const got=save.book[i];
      R(cx+1,cy+1,cw-2,ch-2,UI.ink);R(cx+2,cy+2,cw-4,ch-4,got?'#fbeccc':'#d8c8a4');R(cx+2,cy+2,cw-4,1,got?'#fff8e4':'#e4d6b4');
      txt(String(i+1),cx+4,cy+4,UI.wood);
      const spr=FSPR[i];const aw=cw-8,ah=ch-14;const sc=1;const sx=cx+2+((cw-4-spr.width)/2|0),sy=cy+ch-3-spr.height+Math.max(0,(ah-spr.height)/2|0)-2;
      ctx.save();ctx.beginPath();ctx.rect(cx+2,cy+10,cw-4,ch-12);ctx.clip();drawFish(ctx,i,sx,sy+2,1,1,T+i,got?1:0,!got,got?1:.55);ctx.restore();
      if(got){txt(FISH[i].name.split(' ').pop(),cx+cw-4,cy+4,UI.ink,1,2)}else txt('???',cx+cw-4,cy+4,'#8a7a60',1,2);
      btns.push({id:'fish'+i,x:cx,y:cy,w:cw,h:ch,fn:()=>{bookSel=i;sfx('page')}})}
  }else{
    const f=FISH[bookSel],got=save.book[bookSel];const spr=FSPR[bookSel];const sc=spr.width*2<=w-30?2:1;
    R(x+9,y+26,w-18,44,'#e9d6aa');R(x+9,y+26,w-18,1,UI.ink);R(x+9,y+69,w-18,1,UI.ink);
    for(let i=0;i<6;i++)R(x+10+((i*37+T*6)%(w-22)),y+36+i*5,6,1,'#dcc596');
    ctx.save();ctx.beginPath();ctx.rect(x+9,y+27,w-18,42);ctx.clip();drawFish(ctx,bookSel,W/2-spr.width*sc/2,y+48-spr.height*sc/2,sc,1,T,got?1.5:0,!got,got?1:.5);ctx.restore();
    let yy=y+75;txt(got?f.name:'???',x+12,yy,UI.ink,1);starsR(x+w-44,yy,f.stars,5);yy+=10;
    const stat=(lbl,v,col)=>{txt(lbl,x+12,yy,UI.wood);bar(x+62,yy-1,w-76,6,v,col,'#c8b48a');yy+=9};
    stat('KEKUATAN',f.pull,'#e0503e');stat('STAMINA',f.stam/3.2,'#e0a030');stat('KECEPATAN',f.speed/2,UI.blue);stat('LICIN',1-(f.win-.4)/.8,'#9a6ad0');
    txt('WAKTU: '+TIMEN[f.time],x+12,yy,UI.wood);yy+=9;
    if(got){const lines=wrap('KEMAMPUAN: '+f.abil,w-24);for(const l of lines){txt(l,x+12,yy,UI.accent);yy+=7}yy+=2;
      const dl=wrap(f.desc,w-24);for(const l of dl){if(yy>y+h-24)break;txt(l,x+12,yy,UI.ink);yy+=7}yy+=2;
      if(yy<y+h-20){txt('TERTANGKAP: '+got.n+'X',x+12,yy,UI.wood);yy+=8;txt('REKOR: '+got.b.toFixed(2)+' KG',x+12,yy,UI.wood)}}
    else{const lines=wrap('BELUM TERTANGKAP. COBA UMPAN YANG LEBIH BAIK ATAU WAKTU YANG BERBEDA.',w-24);for(const l of lines){txt(l,x+12,yy,'#8a7a60');yy+=7}}
    button('back',x+8,y-4,30,14,'<',()=>{bookSel=-1;sfx('page')},'blue');
  }
  button('close',x+w-cb-4,y-4,cb,cb,(bx,byy)=>{for(let i=0;i<5;i++){R(bx+4+i,byy+4+i,1,1,UI.paper);R(bx+8-i,byy+4+i,1,1,UI.paper)}},()=>go(prevScene||'menu'),'red');
}
function drawToast(){if(!toast)return;toast.t+=DT;if(toast.t>1.8){toast=null;return}const a=Math.min(1,(1.8-toast.t)*4);ctx.globalAlpha=a;const w=tw(toast.s)+14,x=(W-w)/2|0,y=Math.round(H*.12);panel(x,y,w,13,'dark');txt(toast.s,W/2,y+4,toast.c,1,1);ctx.globalAlpha=1}
function drawFade(){if(fadeA<=0)return;const n=Math.round(fadeA*16);if(n<=0)return;ctx.fillStyle='#0b0a1a';
  if(n>=16){ctx.fillRect(0,0,W,H);return}const s=4;for(let y=0;y<H;y+=s)for(let x=0;x<W;x+=s){const b=BAYER[((y/s)&3)*4+((x/s)&3)];if(b<n)ctx.fillRect(x,y,s,s)}}
function resetFish(){setState('idle');holding=false;fish.res=null}

/* ================= INPUT ================= */
function toGame(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}}
function hitBtn(p){for(let i=btns.length-1;i>=0;i--){const b=btns[i];if(p.x>=b.x&&p.x<b.x+b.w&&p.y>=b.y&&p.y<b.y+b.h+1)return b}return null}
let activePtr=null;
function onDown(p){
  initAudio();
  const b=hitBtn(p);if(b){pressBtn=b.id;return}
  if(fadeTo)return;
  if(scene==='play')fishDown();
}
function fishDown(){const st=fish.state;
  if(st==='idle')startCharge(),holding=true;
  else if(st==='bite'){holding=true;hookFish()}
  else if(st==='wait'||st==='nibble'){setState('early');fish.msg='TERLALU CEPAT!';sfx('miss');combo=0}
  else if(st==='reel')holding=true;
  else if(st==='caught'&&fish.catchT>.7){resetFish();sfx('click')}
}
function onUp(p){
  if(pressBtn){const b=btns.find(q=>q.id===pressBtn);const id=pressBtn;pressBtn=null;if(b&&p&&p.x>=b.x-2&&p.x<b.x+b.w+2&&p.y>=b.y-2&&p.y<b.y+b.h+3){sfx('click');b.fn()}return}
  holding=false;if(fish.state==='charge')releaseCast();
}
cv.addEventListener('pointerdown',e=>{e.preventDefault();if(activePtr!==null)return;activePtr=e.pointerId;try{cv.setPointerCapture(e.pointerId)}catch(_){}onDown(toGame(e))},{passive:false});
cv.addEventListener('pointerup',e=>{e.preventDefault();if(e.pointerId!==activePtr)return;activePtr=null;onUp(toGame(e))},{passive:false});
cv.addEventListener('pointercancel',e=>{if(e.pointerId!==activePtr)return;activePtr=null;pressBtn=null;holding=false;if(fish.state==='charge')releaseCast()});
cv.addEventListener('contextmenu',e=>e.preventDefault());
let keyDown=false;
window.addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(keyDown)return;keyDown=true;initAudio();if(scene==='play')fishDown();else if(scene==='menu'&&!fadeTo){resetFish();go('play')}}
  if(e.code==='Escape'){if(scene==='store'||scene==='book')go(prevScene);else if(scene==='play'&&fish.state!=='reel'){resetFish();go('menu')}}});
window.addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter'){keyDown=false;holding=false;if(fish.state==='charge')releaseCast()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){holding=false;if(fish.state==='charge')releaseCast();if(AC)AC.suspend()}else if(AC)AC.resume();last=performance.now()});

/* ================= LOOP ================= */
let last=performance.now(),acc=0,DT=1/60;
function frame(now){
  let dt=(now-last)/1000;last=now;if(dt>.1)dt=.1;if(dt<0)dt=0;
  DT=dt;T+=dt;updateEnv(dt);updateMusic(dt);
  if(scene==='play')updateFishing(dt);else{updateFishing(dt)}
  panelT+=dt;
  if(fadeTo){fadeA=Math.min(1,fadeA+dt*4);if(fadeA>=1){if(fadeTo==='store'||fadeTo==='book'){if(scene==='menu'||scene==='play')prevScene=scene}scene=fadeTo;fadeTo=null;panelT=0;btns=[]}}
  else if(fadeA>0)fadeA=Math.max(0,fadeA-dt*3);
  btns=[];
  ctx.save();if(shakeA>0&&scene==='play'){ctx.translate(Math.round((Math.random()-.5)*shakeA),Math.round((Math.random()-.5)*shakeA))}
  drawScene();ctx.restore();
  if(scene==='menu')drawMenu();
  else if(scene==='play')drawHUD();
  else if(scene==='store')drawStore();
  else if(scene==='book')drawBook();
  drawToast();drawFade();
  requestAnimationFrame(frame);
}
/* ================= BOOT ================= */
let rsT=null;
function doResize(){resize();buildVignette()}
window.addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(doResize,120)});
loadSave();buildFishAll();doResize();
if(window.__TEST_T!==undefined)dayP=window.__TEST_T;
requestAnimationFrame(t=>{last=t;frame(t)});

'use strict';
(function(){
save.ach   = save.ach   || {};
save.quest = save.quest || null;
save.playT = save.playT || 0;
save.best  = save.best  || 0;

const XACH = [
 {id:'a01', n:'IKAN PERTAMA',      d:'TANGKAP IKAN PERTAMAMU',            c:()=>save.total>=1},
 {id:'a02', n:'PEMULA',            d:'TANGKAP 5 IKAN',                    c:()=>save.total>=5},
 {id:'a03', n:'HANDAL',            d:'TANGKAP 20 IKAN',                   c:()=>save.total>=20},
 {id:'a04', n:'KAYA',              d:'KUMPULKAN 500 KOIN',                c:()=>save.coins>=500},
 {id:'a05', n:'JUTAWAN DANAU',     d:'KUMPULKAN 2500 KOIN',               c:()=>save.coins>=2500},
 {id:'a06', n:'PEMALAM',           d:'TANGKAP IKAN DI MALAM HARI',        c:()=>!!save._n},
 {id:'a07', n:'BASAH KUYUP',        d:'TANGKAP IKAN SAAT HUJAN',           c:()=>!!save._r},
 {id:'a08', n:'KOMBO X5',          d:'RAIH KOMBO 5 BERUNTUN',             c:()=>save.best>=5},
 {id:'a09', n:'LEGENDA BULAN',     d:'TANGKAP MOONFIN',                   c:()=>!!save.book[9]},
 {id:'a10', n:'FOSIL HIDUP',       d:'TANGKAP STURGEON',                  c:()=>!!save.book[8]},
 {id:'a11', n:'BUKU LENGKAP',      d:'LENGKAPI SELURUH BUKU IKAN',            c:()=>Object.keys(save.book).length>=FISH.length},
 {id:'a12', n:'RAKSIASA',          d:'TANGKAP IKAN 25+ KG',               c:()=>Object.values(save.book).some(r=>r.b>=25)},
 {id:'b01', n:'PELAUT',            d:'BERLAYAR PERTAMA KALI',             c:()=>!!(save.boat&&save.boat.trips>=1)},
 {id:'b02', n:'JELAJAH LAUT',      d:'KUNJUNGI 3 LOKASI PELAYARAN',       c:()=>!!(save.boat&&save.boat.vis&&save.boat.vis.length>=3)},
 {id:'b03', n:'RAJA LAUT',         d:'KUNJUNGI SEMUA 5 LOKASI',           c:()=>!!(save.boat&&save.boat.vis&&save.boat.vis.length>=5)},
 {id:'b04', n:'PEMBURU RAKSASA',   d:'TANGKAP IKAN 20+ KG DARI PERAHU',   c:()=>!!(save.boat&&save.boat.big>=1)},
 {id:'b05', n:'SELAMAT TIPIS',     d:'PULANG DENGAN HD DI BAWAH 25 PERSEN', c:()=>!!(save.boat&&save.boat.close)},
 {id:'b06', n:'PELAUT SEJATI',     d:'TANGKAP 10 IKAN DARI PERAHU',       c:()=>!!(save.boat&&save.boat.fishN>=10)},
 {id:'c01', n:'PENGUMPUL',         d:'KUMPULKAN 20 JENIS IKAN',           c:()=>Object.keys(save.book).length>=20},
 {id:'c02', n:'SAKSI MISTERI',     d:'TANGKAP 3 JENIS IKAN MISTERI',      c:()=>XcatN('misteri')>=3},
 {id:'c03', n:'PENYIHIR AIR',      d:'TANGKAP 3 JENIS IKAN MISTIK',       c:()=>XcatN('mistik')>=3},
 {id:'c04', n:'PEMBURU LEGENDA',   d:'TANGKAP 1 IKAN LEGENDARIS',         c:()=>XcatN('legendaris')>=1},
 {id:'c05', n:'RAJA LEGENDA',      d:'TANGKAP 3 JENIS IKAN LEGENDARIS',   c:()=>XcatN('legendaris')>=3},
 {id:'c06', n:'KOLEKTOR SKIN',     d:'MILIKI 8 SKIN',                     c:()=>!!(save.skin&&Object.keys(save.skin.own.c).length+Object.keys(save.skin.own.b).length>=8)}
];
function XcatN(c){return Object.keys(save.book).filter(k=>FISH[k]&&FISH[k].cat===c).length;}

const XDF = [];
for (let i=0;i<3;i++) XDF.push({x:Math.random()*W, y:horizonY+10+Math.random()*(H-horizonY-24), p:Math.random()*6, s:.5+Math.random()*.7});
const Xowl = {t:0, fly:0, ox:0, oy:0};
let Xflash = 0, Xphoto = false, Xpg = 0, Xchk = 1.5;

function XqKey(){const d=new Date();return d.getFullYear()*372+d.getMonth()*31+d.getDate();}
function XqInit(){
  const k=XqKey();
  if (save.quest && save.quest.k===k) return;
  const r=mulberry((k%2147483647)|0||1), t=(r()*3)|0;
  save.quest={k:k,t:t,n:t===0?3+((r()*3)|0):t===1?100+((r()*5)|0)*50:1,prog:0,done:0};
  writeSave();
}
function XqLabel(){const q=save.quest;return['TANGKAP '+q.n+' IKAN','HASILKAN '+q.n+' KOIN','TANGKAP IKAN 4 BINTANG'][q.t];}
function XqProg(){const q=save.quest;return q.t===1?q.prog+'/'+q.n+' K':Math.min(q.prog,q.n)+'/'+q.n;}
function XquestCatch(res){
  XqInit(); const q=save.quest; if(q.done)return;
  if(q.t===0)q.prog++;
  else if(q.t===1)q.prog+=res.price;
  else if(FISH[res.id].stars>=4)q.prog++;
  if(q.prog>=q.n){q.done=1;const rw=[60,80,120][q.t];save.coins+=rw;
    showToast('MISI HARIAN SELESAI! +'+rw+' KOIN',UI.gold);sfx('fanfare');}
  writeSave();
}

function XcheckAch(){
  let ch=0;
  for(const a of XACH){
    if(!save.ach[a.id]&&a.c()){
      save.ach[a.id]=1;ch=1;
      showToast('ACHIEVEMENT: '+a.n,UI.gold);
      sfx('fanfare');
    }
  }
  if(ch)writeSave();
}

function XiconTrophy(x,y){
  R(x+2,y,5,1,UI.ink);R(x+1,y+1,7,2,UI.ink);R(x+2,y+3,5,1,UI.ink);R(x+3,y+4,3,1,UI.ink);R(x+2,y+5,5,1,UI.ink);
  R(x+1,y+1,7,1,UI.gold);R(x+2,y+2,5,1,UI.gold);R(x+3,y+4,3,1,UI.gold);R(x+2,y+5,5,1,UI.gold);}
function XiconLock(x,y){
  R(x+4,y+5,1,7,'#8a7a60');R(x+10,y+5,1,7,'#8a7a60');R(x+4,y+5,7,4,'#8a7a60');R(x+6,y+9,3,2,'#8a7a60');R(x+7,y+7,1,1,'#d8c8a4');}
function XiconWeather(x,y){
  if(wantRain){R(x+1,y+1,7,3,UI.ink);R(x+2,y,5,1,UI.ink);R(x+1,y+1,7,2,'#c9d4e4');R(x+2,y,5,1,'#e4ecf8');
    R(x+2,y+5,1,2,'#9fc8ff');R(x+5,y+6,1,2,'#9fc8ff');}
  else{R(x,y+2,3,3,'#ffe066');R(x+4,y+3,5,2,UI.ink);R(x+5,y+2,3,1,UI.ink);R(x+4,y+3,5,1,'#e4ecf8');R(x+5,y+2,3,1,'#f4f8ff');}}
function XiconSleep(x,y){txt('Z',x+4,y+1,UI.paper,1);txt('z',x+8,y+6,UI.paper,1);}
function XiconCam(x,y){R(x,y+2,9,6,UI.ink);R(x+1,y+3,7,4,'#5a6472');R(x+2,y+1,3,1,UI.ink);R(x+3,y+2,1,1,'#5a6472');
  R(x+3,y+4,3,3,UI.ink);R(x+4,y+5,1,1,'#9ad0ff');R(x+1,y+3,2,1,'#8a94a2');}

function XopenAch(){Xpg=0;prevScene=(scene==='ach')?'play':scene;go('ach');}
function Xsleep(){
  if(scene!=='play'||fish.state==='reel'){showToast('TIDAK BISA TIDUR SAAT MELAWAN IKAN!',UI.red);sfx('err');return;}
  wantRain=0;rainI=0;rainT=0;rainNext=999;dayP=0.25;Xflash=1;
  resetFish();showToast('KAMU BANGUN DI WAKTU FAJAR...');sfx('page');
}
function Xsnap(){
  if(Xphoto)return;Xphoto=true;showToast('MEMOTRET...');
  let n=0;const step=()=>{if(++n>=3){
    try{const a=document.createElement('a');a.download='lake-clawd-'+Date.now()+'.png';
      a.href=cv.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();
      showToast('FOTO TERSIMPAN!',UI.gold);}
    catch(e){showToast('GAGAL MENYIMPAN FOTO',UI.red);}
    Xphoto=false;return;}
    requestAnimationFrame(step);};
  requestAnimationFrame(step);
}

function Xamb(dt){
  save.playT=(save.playT||0)+dt;
  Xchk-=dt;if(Xchk<=0){Xchk=1.5;XcheckAch();}
  if(Xflash>0)Xflash=Math.max(0,Xflash-dt*1.4);
  XqInit();
  for(const f of XDF){f.p+=dt*f.s;f.x+=Math.sin(T*.3+f.p)*.35;}
  Xowl.t+=dt;
  if(nightF(dayP)>.5&&Xowl.fly<=0&&Xowl.t>16+hash((T|0),7)*12){
    Xowl.fly=.001;Xowl.ox=lanternPos().x-9;Xowl.oy=lanternPos().y-8;}
  if(Xowl.fly>0){Xowl.fly+=dt/4.2;if(Xowl.fly>=1){Xowl.fly=0;Xowl.t=0;}}
}

function XdrawDF(){
  if(period(dayP)!=='day'||rainI>.3)return;
  for(const f of XDF){
    const x=Math.round((f.x+Math.sin(T*f.s+f.p)*12+W)%(W+8))-4;
    const y=Math.round(f.y+Math.cos(T*f.s*.8+f.p)*6);
    const w=Math.sin(T*40+f.p)>0;
    ctx.fillStyle='#7fd8e8';ctx.fillRect(x,y,3,1);
    ctx.fillStyle='#c8f4ff';
    if(w){ctx.fillRect(x,y-2,1,2);ctx.fillRect(x+2,y-2,1,2);}
    else{ctx.fillRect(x-1,y-1,1,1);ctx.fillRect(x+3,y-1,1,1);}
  }
}
function XdrawOwl(){
  if(nightF(dayP)<.45)return;
  const L=lanternPos();
  if(Xowl.fly>0){
    const k=Xowl.fly;
    const x=Math.round(Xowl.ox+Math.sin(k*6.283)*34);
    const y=Math.round(Xowl.oy-16-Math.sin(k*3.1416)*22);
    ctx.fillStyle='#6a523a';ctx.fillRect(x-2,y-1,5,3);ctx.fillRect(x-1,y-3,3,2);
    ctx.fillStyle='#f4e8c8';ctx.fillRect(x-1,y-3,1,1);ctx.fillRect(x+1,y-3,1,1);
    if(Math.sin(T*30)>0){ctx.fillStyle='#8a6a4a';ctx.fillRect(x-4,y-2,2,1);ctx.fillRect(x+3,y-2,2,1);}
    return;
  }
  const x=Math.round(L.x-9),y=Math.round(L.y-9);
  ctx.fillStyle='#3a2a1c';ctx.fillRect(x,y+7,7,1);
  ctx.fillStyle='#6a523a';ctx.fillRect(x+1,y+1,5,6);ctx.fillRect(x+1,y,1,1);ctx.fillRect(x+5,y,1,1);
  ctx.fillStyle='#8a6a4a';ctx.fillRect(x+2,y+2,3,3);
  const bl=Math.sin(T*.9)>.96;
  ctx.fillStyle=bl?'#6a523a':'#fff4d6';ctx.fillRect(x+2,y+2,1,1);ctx.fillRect(x+4,y+2,1,1);
  if(!bl){ctx.fillStyle='#1a1024';ctx.fillRect(x+2,y+2,1,1);ctx.fillRect(x+4,y+2,1,1);}
  ctx.fillStyle='#d8a84a';ctx.fillRect(x+3,y+3,1,1);
}
function XdrawAch(){
  ctx.fillStyle='rgba(10,6,24,.45)';ctx.fillRect(0,0,W,H);
  const k=ease(clamp(panelT*3,0,1));
  const w=Math.min(W-10,210),h=Math.min(H-14,152),x=(W-w)/2|0,y=((H-h)/2+(1-k)*30)|0;
  panel(x,y,w,h,'wood');
  txt('ACHIEVEMENT',x+12,y+10,UI.ink,2,0,UI.cream);
  const un=XACH.filter(a=>save.ach[a.id]).length;
  txt(un+'/'+XACH.length,x+w-10,y+13,UI.wood,1,2,UI.cream);
  const gx=x+9,gy=y+26,cols=3,cw=((w-18)/cols)|0,ch=Math.min(26,((h-52)/4)|0);
  const per=12,pages=Math.ceil(XACH.length/per);
  XACH.slice(Xpg*per,Xpg*per+per).forEach((a,i)=>{
    const c=i%cols,r=(i/cols)|0,cx=gx+c*cw,cy=gy+r*ch,got=!!save.ach[a.id];
    R(cx+1,cy+1,cw-2,ch-2,UI.ink);R(cx+2,cy+2,cw-4,ch-4,got?'#fbeccc':'#d8c8a4');
    if(got)XiconTrophy(cx+4,cy+4);else XiconLock(cx+1,cy+2);
    const nm=wrap(a.n,cw-20).slice(0,2);
    nm.forEach((l,j)=>txt(l,cx+16,cy+4+j*7,got?UI.ink:'#8a7a60'));
  });
  const fy=y+h-17;R(x+6,fy-2,w-12,1,UI.ink);
  const mm=Math.floor((save.playT||0)/60);
  txt('MAIN '+mm+' MNT',x+10,fy+1,UI.wood);
  txt('KOMBO X'+(save.best||0),x+w-10,fy+1,UI.wood,1,2);
  if(pages>1)button('xpg',x+((w-38)/2|0),fy-2,38,13,'HAL '+(Xpg+1)+'/'+pages,()=>{Xpg=(Xpg+1)%pages;sfx('tab');},'gray');
  const cb=14;
  button('xclose',x+w-cb-4,y-4,cb,cb,(bx,byy)=>{for(let i=0;i<5;i++){R(bx+4+i,byy+4+i,1,1,UI.paper);R(bx+8-i,byy+4+i,1,1,UI.paper)}},()=>go(prevScene||'play'),'red');
}
function XdrawQuestHUD(){
  const q=save.quest;if(!q)return;
  const s=q.done?'MISI SELESAI!':XqLabel()+' '+XqProg();
  const w2=Math.min(W-8,tw(s)+12);
  panel(4,34,w2,12,'dark');txt(s,10,37,q.done?UI.gold:UI.paper);
}

const _updateEnv   = updateEnv;
updateEnv = function(dt){ _updateEnv(dt); Xamb(dt); };

const _finishCatch = finishCatch;
finishCatch = function(){
  _finishCatch();
  const res=fish.res; if(!res)return;
  if(period(dayP)==='night')save._n=1;
  if(rainI>.25)save._r=1;
  save.best=Math.max(save.best||0,combo);
  XquestCatch(res);
  XcheckAch();
};

const _drawScene = drawScene;
drawScene = function(){
  _drawScene();
  XdrawDF(); XdrawOwl();
  if(Xflash>0){ctx.globalAlpha=Math.min(1,Xflash);ctx.fillStyle='#fff4d6';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
};

const _drawHUD = drawHUD;
drawHUD = function(){
  if(Xphoto)return;
  _drawHUD();
  if(scene!=='play')return;
  const bs=15,pad=4;
  button('xach',W-pad-bs-3*(bs+3),pad,bs,bs,(x,y)=>XiconTrophy(x+3,y+4),()=>XopenAch(),'blue');
  let ly=34+12+4;
  button('xwea',4,ly,bs,bs,(x,y)=>XiconWeather(x+2,y+2),()=>{wantRain=wantRain?0:1;rainNext=999;rainT=0;showToast(wantRain?'MEMAKSA HUJAN...':'HUJAN DIHENTIKAN');sfx('tab');},'gray');ly+=bs+3;
  button('xslp',4,ly,bs,bs,(x,y)=>XiconSleep(x,y),()=>Xsleep(),'gray');ly+=bs+3;
  button('xpht',4,ly,bs,bs,(x,y)=>XiconCam(x+3,y+3),()=>Xsnap(),'gray');
  XdrawQuestHUD();
};

const _drawMenu = drawMenu;
drawMenu = function(){
  if(Xphoto)return;
  _drawMenu();
  txt('v1.1 PLUS',4,20,'#8fd0ff');
  button('mAch',4,H-22,50,16,'TROFI',()=>XopenAch(),'blue');
};

const _drawStore = drawStore;
drawStore = function(){ if(Xphoto)return; _drawStore(); };
const _drawBook  = drawBook;
drawBook  = function(){ if(Xphoto)return; _drawBook();  };
const _drawToast = drawToast;
drawToast = function(){ if(Xphoto)return; _drawToast(); };

const _frame = frame;
frame = function(now){
  _frame(now);
  if(scene==='ach')XdrawAch();
};

window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&scene==='ach')go(prevScene||'play');
  if(e.code==='KeyC'&&scene==='play'&&!fadeTo)Xsnap();
});

XqInit();
})();

'use strict';
(function(){
const X2G = {next:55, on:0, t:0, x:0, y:0, dir:1, spr:null, sprF:null};
try{
  X2G.spr = makeFishSprite(Object.assign({},FISH[0],{name:'GOLDFISH',pat:'none',
    c:['#c8901a','#ffd35a','#fff2a0','#8a6410'],fin:'#ffdf70'}),false);
  X2G.sprF = flipC(X2G.spr);
}catch(e){}

const X2BF=[{p:0,x:.07,c:'#f4a4d8'},{p:2.1,x:.9,c:'#ffd35a'}];

const X2T={fish:[],bub:[]};
function X2geom(){const w=Math.min(W-8,236),h=Math.min(H-10,Math.round(H*.8)),x=(W-w)/2|0,y=((H-h)/2)|0;
  return{x:x,y:y,w:w,h:h,ix:x+6,iy:y+22,iw:w-12,ih:h-44};}
function X2reset(){
  X2T.fish.length=0;X2T.bub.length=0;
  const got=FISH.map(f=>f.id).filter(id=>save.book[id]).sort((a,b)=>FISH[b].stars-FISH[a].stars||b-a).slice(0,16);
  const miss=FISH.map(f=>f.id).filter(id=>!save.book[id]&&!FISH[id].sea).sort(()=>Math.random()-.5).slice(0,3);
  for(const id of got.concat(miss))X2T.fish.push({id:id,has:!!save.book[id],x:Math.random(),yb:.15+Math.random()*.7,
    dir:Math.random()<.5?1:-1,sp:.5+Math.random()*1.1,p:Math.random()*6});
  for(let i=0;i<14;i++)X2T.bub.push({x:Math.random(),y:Math.random(),s:.4+Math.random()*.8});
}
function X2open(){X2reset();prevScene=(scene==='tank')?'play':scene;go('tank');}
function X2tankIcon(x,y){R(x+1,y+2,7,5,UI.ink);R(x+8,y+3,3,3,UI.ink);R(x+2,y+3,5,3,'#5aa8e0');
  R(x+8,y+3,3,3,'#5aa8e0');R(x+8,y+3,1,1,'#2e5a8a');R(x+3,y+4,1,1,UI.paper);R(x+5,y+5,2,1,'#9ad0ff');}

function X2key(){const d=new Date();return d.getFullYear()*372+d.getMonth()*31+d.getDate();}
(function(){
  const t=X2key();let st=save.streak;
  if(!st||st.last!==t){
    st={n:(st&&st.last===t-1)?(st.n||0)+1:1,last:t};
    save.streak=st;
    const rw=Math.min(120,10+10*st.n);save.coins+=rw;writeSave();
    setTimeout(()=>{showToast(st.n>1?('STREAK HARIAN x'+st.n+'! +'+rw+' KOIN'):('SELAMAT DATANG! +'+rw+' KOIN'),UI.gold);sfx('coin');},900);
  }
})();

function X2amb(dt){
  if(scene==='play'){
    if(X2G.on>0){
      X2G.t+=dt;const k=X2G.t/2.6;
      X2G.x+=X2G.dir*((W+50)/2.6)*dt;
      X2G.y=horizonY+(H-horizonY)*.38-Math.abs(Math.sin(k*Math.PI*3))*16;
      if(k>=1){X2G.on=0;X2G.next=50+Math.random()*50;if(nightF(dayP)<.7)showToast('IKAN EMAS KABUR!');}
    }else{
      X2G.next-=dt;
      if(X2G.next<=0&&nightF(dayP)<.7&&fish.state!=='reel'){
        X2G.on=.001;X2G.t=0;X2G.dir=Math.random()<.5?1:-1;
        X2G.x=X2G.dir>0?-24:W+24;sfx('plopS');}
    }
  }else if(X2G.on>0)X2G.on=0;

  if(scene==='tank'){
    for(const f of X2T.fish){f.x+=f.dir*f.sp*dt*.06;
      if(f.x<.02){f.x=.02;f.dir=1}if(f.x>.98){f.x=.98;f.dir=-1}}
    for(const b of X2T.bub){b.y-=dt*b.s*.12;if(b.y<0){b.y=1;b.x=Math.random();}}
  }
}

function X2bfDraw(){
  if(period(dayP)!=='day'||rainI>.3)return;
  for(const b of X2BF){
    const bx=Math.round(W*b.x+Math.sin(T*.8+b.p)*10),by=Math.round(H-30+Math.sin(T*1.4+b.p)*7);
    ctx.fillStyle=b.c;const up=Math.sin(T*22+b.p)>0;
    ctx.fillRect(bx,by,1,2);
    if(up){ctx.fillRect(bx-1,by-1,1,1);ctx.fillRect(bx+1,by-1,1,1);}
    else{ctx.fillRect(bx-2,by,1,1);ctx.fillRect(bx+2,by,1,1);}
  }
}
function X2goldDraw(){
  if(X2G.on<=0||!X2G.spr)return;
  const s=X2G.spr,bob=Math.round(Math.sin(T*10));
  ctx.drawImage(X2G.dir>0?s:X2G.sprF,Math.round(X2G.x),Math.round(X2G.y+bob));
  ctx.fillStyle='#fff6b0';
  for(let i=0;i<5;i++){const a=T*6+i*1.3;ctx.globalAlpha=.4+.6*Math.abs(Math.sin(a*2));
    ctx.fillRect(Math.round(X2G.x+s.width/2+Math.cos(a)*9),Math.round(X2G.y+bob+Math.sin(a)*5),1,1);}
  ctx.globalAlpha=1;
}

function X2tankDraw(){
  ctx.fillStyle='rgba(10,6,24,.5)';ctx.fillRect(0,0,W,H);
  const k=ease(clamp(panelT*3,0,1)),g=X2geom();
  const x=g.x,y=g.y+(1-k)*24|0,w=g.w,h=g.h,iy=g.iy+(y-g.y);
  panel(x,y,w,h,'wood');
  txt('AKUARIUM',x+12,y+9,UI.ink,2,0,UI.cream);
  const n=Object.keys(save.book).length;
  txt(n+'/'+FISH.length+' IKAN',x+w-10,y+12,UI.wood,1,2,UI.cream);
  const wf=nightF(dayP);
  R(g.ix-1,iy-1,g.iw+2,g.ih+2,UI.ink);
  for(let i=0;i<g.ih;i++){const t=i/g.ih;
    ctx.fillStyle=css(mixc(mixc(hx('#2a6ab0'),hx('#0d2b52'),t),hx('#070d22'),wf*.65));
    ctx.fillRect(g.ix,iy+i,g.iw,1);}
  ctx.save();ctx.beginPath();ctx.rect(g.ix,iy,g.iw,g.ih);ctx.clip();
  ctx.globalAlpha=.12*(1-wf*.7);ctx.fillStyle='#bfe8ff';
  for(let i=0;i<4;i++){const rx=g.ix+((i*47+T*4)%(g.iw+30))-15;
    for(let j=0;j<g.ih;j+=2)ctx.fillRect(rx+j*.25|0,iy+j,2,1);}
  ctx.globalAlpha=1;
  ctx.fillStyle='#c8b070';ctx.fillRect(g.ix,iy+g.ih-6,g.iw,6);
  ctx.fillStyle='#e0cc90';ctx.fillRect(g.ix,iy+g.ih-6,g.iw,1);
  for(let i=0;i<g.iw;i+=7){ctx.fillStyle='#a8945c';ctx.fillRect(g.ix+i+((i*13)%5),iy+g.ih-4+((i*7)%3),1,1);}
  for(let i=0;i<4;i++){const sx=g.ix+8+i*(g.iw/4)+((i*17)%9),sh=10+((i*11)%10);
    for(let j=0;j<sh;j++){ctx.fillStyle=j%3?'#3f8a3e':'#2e6a34';
      ctx.fillRect(Math.round(sx+Math.sin(T*1.4+i+j*.4)*(j*.25)),iy+g.ih-7-j,1,1);}}
  for(const b of X2T.bub){const bx=g.ix+Math.round(b.x*g.iw),by=iy+Math.round(b.y*g.ih);
    ctx.globalAlpha=.5;ctx.fillStyle='#cfe8ff';ctx.fillRect(bx,by,1,1);
    if(b.s>.9)ctx.fillRect(bx+1,by+1,1,1);ctx.globalAlpha=1;}
  for(const f of X2T.fish){const spr=FSPR[f.id],fw=spr.width;
    const px=g.ix+Math.round(f.x*Math.max(1,g.iw-fw));
    const py=Math.round(iy+8+f.yb*(g.ih-30))+Math.round(Math.sin(T*1.5+f.p)*2);
    drawFish(ctx,f.id,px,py,1,f.dir,T+f.p,1.4,!f.has,f.has?1:.22);}
  ctx.restore();
  txt('TAP AIR UNTUK MEMBERI MAKAN',W/2,iy+g.ih+4,UI.wood,1,1);
  const cb=14;
  button('tclose',x+w-cb-4,y-4,cb,cb,(bx,byy)=>{for(let i=0;i<5;i++){R(bx+4+i,byy+4+i,1,1,UI.paper);R(bx+8-i,byy+4+i,1,1,UI.paper)}},()=>go(prevScene||'play'),'red');
}

const _u2=updateEnv; updateEnv=function(dt){_u2(dt);X2amb(dt);};
const _d2=drawScene; drawScene=function(){_d2();X2bfDraw();X2goldDraw();};
const _f2=frame;     frame=function(now){_f2(now);if(scene==='tank')X2tankDraw();};
const _h2=drawHUD;   drawHUD=function(){_h2();if(scene!=='play')return;
  if(toast&&toast.s==='MEMOTRET...')return;
  button('xtank',W-4-15-4*18,4,15,15,(x,y)=>X2tankIcon(x,y),()=>X2open(),'blue');};
const _m2=drawMenu;  drawMenu=function(){_m2();txt('+v1.2 AKUARIUM',4,29,'#7fd8a8');};

window.addEventListener('pointerdown',e=>{
  if(scene==='tank'){
    const p=toGame(e),g=X2geom();
    if(p.x>g.ix&&p.x<g.ix+g.iw&&p.y>g.iy&&p.y<g.iy+g.ih){
      splash(p.x,p.y,6,undefined,25);addRipple(p.x,p.y,5,8,.6);sfx('plopS');
      for(const f of X2T.fish){const fx=g.ix+f.x*g.iw;if(Math.abs(fx-p.x)<28)f.dir=fx<p.x?1:-1;}
    }
    return;
  }
  if(scene==='play'&&X2G.on>0){
    const p=toGame(e),s=X2G.spr;
    if(Math.abs(p.x-(X2G.x+s.width/2))<12&&Math.abs(p.y-X2G.y)<12){
      e.stopPropagation();
      const rw=15+((Math.random()*20)|0);save.coins+=rw;writeSave();
      splash(X2G.x+s.width/2,X2G.y+6,14,'#ffe066',50);
      addRipple(X2G.x+s.width/2,X2G.y+8,10,12);
      sfx('fanfare');showToast('IKAN EMAS! +'+rw+' KOIN',UI.gold);
      X2G.on=0;X2G.next=60+Math.random()*60;
    }
  }
},true);

window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&scene==='tank')go(prevScene||'play');
  if(e.code==='KeyT'&&!fadeTo){if(scene==='play')X2open();else if(scene==='tank')go(prevScene||'play');}
});
})();

'use strict';
(function(){
const X3XP=[0,50,120,220,360,560,820,1150,1550,2050];
const X3TN=['NEMO','PEMULA','NELAYAN','HANDAL','AHLI','MASTER','LEGENDA','DUKUN DANAU'];
function X3lv(xp){let l=0;while(l<X3XP.length-1&&xp>=X3XP[l+1])l++;return l+1;}
function X3info(){const xp=save.xp||0,l=X3lv(xp);
  return{l:l,cur:xp-(X3XP[l-1]||0),need:(X3XP[l]||99999)-(X3XP[l-1]||0),title:X3TN[Math.min(l-1,X3TN.length-1)]};}

const X3HS={x:0,y:0,r:9,on:0,ph:0,hit:0,cd:0};
function X3hsPlace(){X3HS.x=dockEnd+22+Math.random()*Math.max(10,W-dockEnd-44);
  X3HS.y=horizonY+12+Math.random()*Math.max(8,H-horizonY-26);
  X3HS.r=8+((Math.random()*4)|0);X3HS.on=1;X3HS.ph=Math.random()*6;}
function X3hsDraw(){
  if(scene!=='play'||!X3HS.on)return;
  if(!(fish.state==='idle'||fish.state==='charge'))return;
  const pu=.55+.45*Math.sin(T*4+X3HS.ph);
  const cx=X3HS.x+Math.sin(T*.7+X3HS.ph)*4,cy=X3HS.y+Math.cos(T*.5+X3HS.ph)*2;
  ellipsePix(cx,cy,X3HS.r,X3HS.r*.45,'#ffd35a',pu*.9);
  ellipsePix(cx,cy,X3HS.r-2,(X3HS.r-2)*.45,'#fff2a0',pu*.5);
  ctx.fillStyle='#fff6b0';ctx.fillRect(Math.round(cx),Math.round(cy),1,1);
  ctx.fillRect(Math.round(cx-X3HS.r),Math.round(cy),1,1);ctx.fillRect(Math.round(cx+X3HS.r),Math.round(cy),1,1);
}

let X3biteT=-9, X3ss=0, X3flash=0, X3boltN=6+Math.random()*8, X3boltPts=null;

function X3thunder(){
  X3flash=1;shake(2.2);
  noise(1.3,85,.42,'lowpass');noise(1.9,48,.3,'lowpass',.2);
  const r=mulberry((Math.random()*1e9)|0),x0=r()*W,x1=x0+(r()-.5)*40;
  X3boltPts=[];for(let i=0;i<=14;i++){const t=i/14;
    X3boltPts.push([Math.round(x0+(x1-x0)*t+(r()-.5)*14*(1-t)),Math.round(2+t*(horizonY-6))]);}
}
function X3boltDraw(){
  if(X3flash<=.35||!X3boltPts)return;
  ctx.globalAlpha=Math.min(1,X3flash);
  ctx.fillStyle='#fff8d0';
  for(let i=1;i<X3boltPts.length;i++){const a=X3boltPts[i-1],b=X3boltPts[i];
    const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));
    for(let k=0;k<=n;k++)ctx.fillRect(Math.round(a[0]+(b[0]-a[0])*k/n),Math.round(a[1]+(b[1]-a[1])*k/n),1,1);}
  ctx.globalAlpha=1;
}

let X3prev='idle';
function X3upd(dt){
  if(fish.state!==X3prev){
    if(fish.state==='bite')X3biteT=T;
    if(fish.state==='wait'&&X3prev==='cast'&&X3HS.on){
      const d=Math.hypot(fish.bx-X3HS.x,fish.by-X3HS.y);
      if(d<X3HS.r){X3HS.hit=2;fish.wait*=.5;showToast('PRESISI PENUH! GIGITAN LEBIH CEPAT',UI.gold);sfx('fanfare');}
      else if(d<X3HS.r*2){X3HS.hit=1;showToast('HAMPIR TEPAT!',UI.paper);sfx('coin');}
      else X3HS.hit=0;
      X3HS.on=0;X3HS.cd=1;
    }
    X3prev=fish.state;
  }
  if(X3HS.cd>0)X3HS.cd-=dt;
  if(scene==='play'&&(fish.state==='idle'||fish.state==='charge')){if(!X3HS.on&&X3HS.cd<=0)X3hsPlace();}
  else if(fish.state==='wait'||fish.state==='reel'){X3HS.on=0;}
  if(scene==='play'&&fish.state==='reel'&&holding&&fish.ten>=.25&&fish.ten<=.92){
    X3ss+=dt;
    if(X3ss>=2.5){X3ss=0;const b=4+X3info().l;save.coins+=b;writeSave();
      showToast('STABIL! +'+b+' KOIN',UI.gold);sfx('coin');}
  }else X3ss=Math.max(0,X3ss-dt*1.5);
  if(rainI>.7){X3boltN-=dt;if(X3boltN<=0){X3thunder();X3boltN=6+Math.random()*9;}}
  if(X3flash>0)X3flash=Math.max(0,X3flash-dt*2.1);
}

const _u3=updateEnv;updateEnv=function(dt){_u3(dt);X3upd(dt);};
const _d3=drawScene;drawScene=function(){_d3();X3hsDraw();X3boltDraw();};
const _f3=updateFishing;updateFishing=function(dt){_f3(dt);};

const _hk=hookFish;
hookFish=function(){
  _hk();
  const react=T-X3biteT;
  if(react<=.18){fish._perf=1;fish.stamMax*=.85;fish.stam=fish.stamMax;
    showToast('PERFECT! STAMINA IKAN -15%',UI.gold);sfx('fanfare');}
  else fish._perf=0;
};

const _fc=finishCatch;
finishCatch=function(){
  _fc();
  const res=fish.res;if(!res)return;
  const info=X3info(),gain=res.price+FISH[res.id].stars*5+(fish._perf?3:0)+(X3HS.hit===2?4:0);
  const parts=[];
  if(fish._perf){const b=10+info.l;save.coins+=b;parts.push('PERFECT +'+b);}
  if(X3HS.hit===2){const b=Math.max(1,Math.round(res.price*.25));save.coins+=b;parts.push('PRESISI +'+b);}
  else if(X3HS.hit===1){const b=Math.max(1,Math.round(res.price*.1));save.coins+=b;parts.push('HAMPIR +'+b);}
  const lb=Math.max(1,Math.round(res.price*.02*Math.min(info.l,10)));
  save.coins+=lb;parts.push('LV +'+lb);
  save.xp=(save.xp||0)+gain;
  const ni=X3info();
  if(ni.l>info.l){clawdVy=-80;sfx('fanfare');
    showToast('LEVEL '+ni.l+' - '+ni.title+'!',UI.gold);}
  else if(parts.length)showToast('+'+res.price+' KOIN  ('+parts.join(' + ')+')',UI.paper);
  X3HS.hit=0;writeSave();
};

const _h3=drawHUD;
drawHUD=function(){
  _h3();
  if(scene!=='play')return;
  if(toast&&toast.s==='MEMOTRET...')return;
  const info=X3info(),s='LV'+info.l;
  const ax=Math.max(60,4+Math.max(52,tw(String(save.coins))+22)+5);
  if(ax+tw(s)+22<W-4-15-4*18-2){
    txt(s,ax,8,UI.gold);
    R(ax+tw(s)+3,7,16,6,UI.ink);R(ax+tw(s)+4,8,14,4,'#2a2240');
    R(ax+tw(s)+4,8,Math.max(1,Math.round(14*info.cur/info.need)),4,UI.green);
  }
};
const _m3=drawMenu;drawMenu=function(){_m3();txt('+v1.3 PRESISI',4,38,'#ffd35a');};
})();

'use strict';
(function(){
/* ============================================================================
   v1.5  KOLEKSI IKAN BARU + SKIN
   - 30 ikan baru: UMUM, LANGKA, MISTERI, MISTIK, LEGENDARIS (+ ikan khusus laut/perahu)
   - efek sprite per ikan (cahaya, hantu, petir, kristal, naga, lampu anglerfish, dst.)
   - aturan kemunculan: waktu, hujan, jarak lempar, umpan, lokasi pelayaran
   - buku koleksi berhalaman + kategori; skin karakter & perahu (bagian B)
   ============================================================================ */
window.LAKE=window.LAKE||{};

/* kategori ikan asli (id 0-9) */
const CAT0=['umum','umum','umum','umum','langka','langka','langka','langka','langka','legendaris'];
FISH.forEach((f,i)=>{if(!f.cat)f.cat=CAT0[i]||'umum';});

function addF(o){o.id=FISH.length;FISH.push(Object.assign({pat:'none',tail:'round',jump:0,burst:.3,bp:1.8,win:.6,speed:1,time:'any',cat:'umum'},o));}
/* need(ctx) -> pengali peluang tambahan; ctx={per,rain,dist,luck,nf}  (0 = tidak muncul) */

/* ---------- UMUM ---------- */
addF({name:'ROACH',L:16,Hh:3.4,tail:'fork',c:['#8a9aa8','#c4d0da','#f0f4f8','#5a6a78'],fin:'#e8604a',w:[.05,.3],price:6,rar:22,pull:.16,stam:.65,burst:.1,bp:1.4,win:1,speed:.9,stars:1,abil:'KAWANAN: SERING DATANG BERSAMA',desc:'IKAN PERAK BERSIRIP MERAH. UMPAN FAVORIT PEMANCING PEMULA.'});
addF({name:'GUPPY',L:11,Hh:2.8,tail:'fork',c:['#d94a8c','#5ac8e8','#f8e7a0','#7a2a5a'],fin:'#ffd35a',w:[.005,.03],price:3,rar:18,pull:.1,stam:.5,burst:.06,bp:1.3,win:1.2,speed:1,time:'day',stars:1,fx:'sparkle',abil:'WARNA-WARNI: HAMPIR TANPA PERLAWANAN',desc:'MUNGIL DAN BERWARNA CERAH. SERING TERSESAT DI TEPI DANAU.'});
addF({name:'CARP',L:27,Hh:5.8,c:['#8a6a2a','#c8a050','#f0e0b0','#4a3814'],fin:'#b88a40',w:[1.5,8],price:22,rar:14,pull:.38,stam:1.6,burst:.15,bp:1.6,jump:.05,win:.8,speed:.8,stars:2,abil:'LAMBAT TAPI KUAT: STAMINA BESAR',desc:'IKAN GEMUK PENGHUNI DASAR DANAU. TARIKANNYA STABIL.'});
addF({name:'TENCH',L:22,Hh:4.8,c:['#4a6a3a','#7a9a4a','#d0d8a0','#2a3a1e'],fin:'#6a8a40',w:[.6,3],price:18,rar:13,pull:.3,stam:1.2,burst:.12,bp:1.5,win:.85,speed:.75,time:'dawn',stars:2,abil:'TABIB DANAU: LENDIRNYA LICIN',desc:'DIJULUKI IKAN TABIB. KONON LENDIR TUBUHNYA MENYEMBUHKAN LUKA.'});

/* ---------- LANGKA ---------- */
addF({name:'GRAYLING',L:26,Hh:4.4,tail:'fork',c:['#6a7a8a','#a8b8c8','#eef2f6','#3a4654'],fin:'#8aa0c0',w:[.6,2.5],price:52,rar:9,pull:.42,stam:1.2,burst:.3,bp:1.8,jump:.3,win:.65,speed:1.3,time:'dawn',stars:3,cat:'langka',fx:'sailfin',abil:'LAYAR PUNGGUNG: MELOMPAT ANGGUN',desc:'SIRIP PUNGGUNGNYA BESAR SEPERTI LAYAR. PENYUKA AIR JERNIH.'});
addF({name:'EEL',L:40,Hh:1.7,c:['#2a3a2a','#4a6a40','#c8d4a0','#141e14'],fin:'#3a4a30',w:[.8,4],price:60,rar:8,pull:.45,stam:1.4,burst:.5,bp:2.1,win:.5,speed:1.6,time:'night',stars:3,cat:'langka',abil:'LICIN & LIAR: SENTAKAN BERUNTUN',desc:'IKAN PANJANG SEPERTI ULAR. BERBURU DI KEGELAPAN DASAR DANAU.',hint:'MALAM HARI'});
addF({name:'ZANDER',L:30,Hh:3.6,tail:'fork',pat:'pike',c:['#6a7a5a','#a8b88a','#e8ecd0','#3a4630'],fin:'#8a9a6a',w:[1.5,7],price:110,rar:5,pull:.55,stam:1.5,burst:.35,bp:2,jump:.05,win:.55,speed:1.4,time:'dawn',stars:4,cat:'langka',abil:'MATA TAJAM: MENYERANG SENJA',desc:'PEMBURU BERMATA TAJAM. PALING AKTIF SAAT LANGIT MULAI GELAP.'});
addF({name:'BARRAMUNDI',L:30,Hh:5.2,tail:'fork',pat:'bass',c:['#5a6a7a','#9aaaba','#e8eef4','#2e3a46'],fin:'#7a8a9a',w:[2,10],price:95,rar:5,pull:.6,stam:1.6,burst:.4,bp:2.1,jump:.3,win:.55,speed:1.3,time:'day',stars:4,cat:'langka',abil:'PELOMPAT PERKASA: LOMPATAN TINGGI',desc:'IKAN PERAK BERTUBUH TEBAL. MELOMPAT KERAS SAAT TERKAIT.'});
addF({name:'GOLDEN CARP',L:26,Hh:5.6,c:['#d49a1a','#ffd35a','#fff2b0','#8a5a0a'],fin:'#ffe070',w:[2,9],price:190,rar:2.2,pull:.5,stam:1.8,burst:.3,bp:1.9,jump:.15,win:.45,speed:1.2,time:'midday',stars:4,cat:'langka',fx:'sparkle',abil:'KILAU EMAS: JENDELA GIGITAN SINGKAT',desc:'SISIKNYA BERKILAU EMAS SAAT MATAHARI TEPAT DI ATAS KEPALA.',hint:'TENGAH HARI'});
addF({name:'ARAPAIMA',L:38,Hh:4.6,c:['#3a4a50','#7a8a8a','#e8d0b8','#1e262a'],fin:'#c04a3a',w:[12,45],price:320,rar:1.6,pull:.8,stam:3,burst:.25,bp:2,jump:.08,win:.55,speed:.9,stars:5,cat:'langka',abil:'RAKSASA SISIK BAJA: TARIKAN BERAT',desc:'IKAN AIR TAWAR TERBESAR. SISIKNYA KERAS SEPERTI ZIRAH.',hint:'UMPAN KILAT ATAU LEBIH BAIK',need:c=>c.luck>=.8?1:0});

/* ---------- MISTERI ---------- */
addF({name:'SHADOWFIN',L:27,Hh:4.4,tail:'fork',c:['#1a1630','#2e2a50','#5a5280','#0a0818'],fin:'#3a3466',w:[2,7],price:140,rar:3,pull:.6,stam:1.5,burst:.45,bp:2.2,jump:.1,win:.35,speed:1.7,time:'night',stars:4,cat:'misteri',fx:'ghost,eye:#ff3a5a',abil:'BAYANGAN: MENGHILANG DI KEGELAPAN',desc:'SIRIPNYA MENYERAP CAHAYA. HANYA TERLIHAT SAAT MENYAMBAR UMPAN.',hint:'MALAM + LEMPARAN JAUH',clue:'KEGELAPAN DAN JARAK JAUH',need:c=>c.dist>.6?1:.1});
addF({name:'GLASSFISH',L:18,Hh:3.6,tail:'fork',c:['#9ad0e0','#c8ecf4','#f0fbff','#5a9ab0'],fin:'#d8f4ff',w:[.05,.4],price:110,rar:4,pull:.2,stam:.8,burst:.3,bp:1.5,jump:.2,win:.4,speed:1.5,time:'rain',stars:3,cat:'misteri',fx:'glass',abil:'TEMBUS PANDANG: SULIT DILIHAT',desc:'TUBUHNYA BENING SEPERTI KACA. MUNCUL SAAT BUTIR HUJAN MENARI.',hint:'SAAT HUJAN',clue:'AIR YANG MENARI'});
addF({name:'BLINDFISH',L:20,Hh:4.2,c:['#e8d8d0','#f4e8e0','#fff8f4','#b8a098'],fin:'#f0e0d8',w:[.3,1.2],price:120,rar:3,pull:.38,stam:1.1,burst:.35,bp:1.7,win:.5,speed:1.1,time:'night',stars:3,cat:'misteri',fx:'noeye',abil:'TANPA MATA: GERAKNYA TAK TERDUGA',desc:'IKAN PUCAT TANPA MATA. MENCARI MANGSA LEWAT GETARAN AIR.',hint:'MALAM HARI',clue:'KEGELAPAN TOTAL'});
addF({name:'PUZZLEFISH',L:21,Hh:4.6,c:['#2a2a3a','#e8e8f0','#ffffff','#101018'],fin:'#9a9ab0',w:[.5,2],price:130,rar:3,pull:.4,stam:1.2,burst:.3,bp:1.8,win:.5,speed:1.2,stars:3,cat:'misteri',fx:'checker',abil:'TEKA-TEKI: SULIT DITEBAK',desc:'POLA KOTAK-KOTAK DI TUBUHNYA TAK PERNAH SAMA. ASALNYA TAK DIKETAHUI.',hint:'LEMPARAN DEKAT',clue:'SANGAT DEKAT DERMAGA',need:c=>c.dist<.45?1.8:.15});
addF({name:'MASKFISH',L:24,Hh:4.6,tail:'fork',c:['#c8b878','#e8dca8','#fff8d8','#6a5a2a'],fin:'#a89858',w:[1,4],price:190,rar:2.4,pull:.5,stam:1.3,burst:.4,bp:2,jump:.15,win:.4,speed:1.4,time:'dawn',stars:4,cat:'misteri',fx:'mask',abil:'BERTOPENG: MENYAMAR SEBAGAI IKAN LAIN',desc:'PITA GELAP DI MATANYA MENYEMBUNYIKAN IDENTITAS. MUNCUL SAAT SENJA.',hint:'SENJA HARI',clue:'LANGIT YANG MEMERAH',need:c=>c.per==='dusk'?3:.05});

/* ---------- MISTIK ---------- */
addF({name:'LANTERNFISH',L:20,Hh:4.2,c:['#1e3a5a','#2e6a8a','#8ad0e0','#0e1e30'],fin:'#2e6a8a',w:[.2,1],price:160,rar:5,pull:.35,stam:1,burst:.2,bp:1.6,jump:.1,win:.6,speed:1,time:'night',stars:3,cat:'mistik',fx:'photo,glow:#9aff6a',abil:'LENTERA HIDUP: BERKILAU DI MALAM',desc:'TITIK-TITIK CAHAYA DI PERUTNYA SEPERTI LENTERA KECIL.',hint:'MALAM HARI',clue:'CAHAYA DI KEGELAPAN'});
addF({name:'THUNDER EEL',L:38,Hh:2.3,c:['#2a3a6a','#4a6ac8','#e8f0ff','#101a3a'],fin:'#ffe45a',w:[3,14],price:260,rar:2.4,pull:.7,stam:2,burst:.55,bp:2.5,win:.4,speed:1.9,time:'nightrain',stars:4,cat:'mistik',fx:'electric,glow:#ffe45a',abil:'SETRUM: TARIKAN BERUBAH-UBAH',desc:'BERBURU DI BAWAH PETIR. TUBUHNYA BERPENDAR LISTRIK BIRU.',hint:'MALAM HUJAN',clue:'LANGIT YANG MENGGELEGAR'});
addF({name:'AURORA TROUT',L:24,Hh:4,tail:'fork',pat:'trout',c:['#3ad8b0','#8a7af0','#f0f8ff','#2a3a8a'],fin:'#a0f0d8',w:[.8,3],price:230,rar:2.6,pull:.5,stam:1.3,burst:.3,bp:1.9,jump:.35,win:.5,speed:1.4,time:'dawn',stars:4,cat:'mistik',fx:'aurora',abil:'WARNA FAJAR: MELOMPAT BERKILAU',desc:'SISIKNYA BERGANTI WARNA SEPERTI CAHAYA KUTUB DI LANGIT FAJAR.',hint:'FAJAR CERAH',clue:'FAJAR YANG JERNIH',need:c=>c.rain<.25?1:0});
addF({name:'GHOSTFISH',L:26,Hh:4.4,tail:'flow',c:['#cfe0f0','#e8f2fa','#ffffff','#8aa0b8'],fin:'#f0f8ff',w:[1,5],price:300,rar:1.5,pull:.5,stam:1.4,burst:.5,bp:2,jump:.25,win:.4,speed:1.6,time:'night',stars:4,cat:'mistik',fx:'ghost,glow:#bfe0ff',abil:'ARWAH DANAU: MUNCUL DAN HILANG',desc:'ROH IKAN YANG TENGGELAM DI MASA LALU. TEMBUS PANDANG.',hint:'MALAM + LEMPARAN JAUH',clue:'ARWAH DI KEGELAPAN JAUH',need:c=>c.dist>.5?1:.15});
addF({name:'CRYSTAL KOI',L:25,Hh:5,tail:'flow',c:['#7ae0f0','#b8f4ff','#ffffff','#3aa0c0'],fin:'#d8fbff',w:[2,7],price:340,rar:1.2,pull:.62,stam:1.6,burst:.45,bp:2.1,jump:.2,win:.38,speed:1.4,time:'day',stars:5,cat:'mistik',fx:'crystal,glow:#9ae8ff',abil:'TUBUH KRISTAL: LICIN & BERKILAU',desc:'KOI LANGKA DARI BATU KRISTAL DASAR DANAU. KILAUNYA MENYILAUKAN.',hint:'SIANG + UMPAN KILAT',clue:'SIANG DAN UMPAN BERKILAU',need:c=>c.luck>=.8?1:0});

/* ---------- LEGENDARIS ---------- */
addF({name:'NAGA AIR',L:44,Hh:4.2,tail:'flow',c:['#c02a2a','#f06a3a','#ffe8a0','#6a0e0e'],fin:'#ffd35a',w:[40,120],price:1800,rar:.15,pull:.9,stam:4.5,burst:.6,bp:2.7,jump:.3,win:.3,speed:1.7,time:'nightrain',stars:5,cat:'legendaris',fx:'dragon,glow:#ffb040',abil:'RAJA AIR: MUNCUL SAAT BADAI',desc:'NAGA PENJAGA DANAU. KONON HANYA MENAMPAKKAN DIRI SAAT BADAI.',hint:'MALAM HUJAN + UMPAN BULAN + LEMPAR JAUH',clue:'BADAI, UMPAN TERBAIK, JARAK JAUH',need:c=>(c.luck>=1.4&&c.dist>.6)?1:0});
addF({name:'SOLARFISH',L:30,Hh:6,tail:'flow',c:['#ff9a2a','#ffd35a','#fff6b0','#c05a0a'],fin:'#ffe070',w:[8,30],price:1500,rar:.18,pull:.8,stam:3.6,burst:.5,bp:2.4,jump:.35,win:.32,speed:1.5,time:'midday',stars:5,cat:'legendaris',fx:'sun,glow:#ffd060',abil:'IKAN MATAHARI: PANAS MEMBARA',desc:'BERKILAU SEPERTI MATAHARI MINI. MUNCUL SAAT SINAR TEPAT DI ATAS.',hint:'TENGAH HARI + UMPAN BULAN',clue:'MATAHARI TEPAT DI ATAS',need:c=>c.luck>=1.4?1:0});

/* ---------- KHUSUS LAUT (hanya dari perahu) ---------- */
addF({name:'CLOWNFISH',L:12,Hh:3.8,c:['#ff7a1a','#ff9a3a','#ffd08a','#a03a00'],fin:'#ff7a1a',w:[.05,.2],price:60,rar:10,pull:.25,stam:.8,burst:.3,bp:1.6,jump:.1,win:.6,speed:1.3,time:'sea',stars:3,cat:'langka',fx:'bars',sea:1,locs:[1],hint:'PERAHU: TELUK KARANG',abil:'BERANI: SELALU BERGERAK LINCAH',desc:'IKAN BELANG ORANYE PENGHUNI KARANG. LINCAH DAN BERANI.'});
addF({name:'BUTTERFLYFISH',L:14,Hh:5.6,c:['#ffe34a','#fff08a','#ffffff','#8a6a0a'],fin:'#ffe34a',w:[.05,.25],price:75,rar:10,pull:.28,stam:.9,burst:.3,bp:1.6,jump:.1,win:.55,speed:1.2,time:'sea',stars:3,cat:'langka',fx:'eyespot',sea:1,locs:[1],hint:'PERAHU: TELUK KARANG',abil:'MATA PALSU: MENGECOH PEMANCING',desc:'BERCAK MATA DI EKORNYA MEMBINGUNGKAN PEMANGSA DAN PEMANCING.'});
addF({name:'PUFFER',L:13,Hh:6.2,c:['#c8b068','#e8d898','#fff4d0','#6a5a28'],fin:'#d8c888',w:[.3,1.5],price:90,rar:8,pull:.35,stam:1.1,burst:.2,bp:1.8,win:.7,speed:.8,time:'sea',stars:3,cat:'langka',fx:'spikes',sea:1,locs:[1,3],hint:'PERAHU: TELUK KARANG / KARANG PURBA',abil:'MENGEMBUNG: DURI BERBISA',desc:'MENGEMBUNG SAAT TERANCAM. JANGAN DISENTUH DENGAN TANGAN KOSONG.'});
addF({name:'FOGFISH',L:22,Hh:4,tail:'flow',c:['#aab8c8','#c8d4e0','#f0f4f8','#6a7a8a'],fin:'#dfe8f0',w:[1,4],price:200,rar:6,pull:.45,stam:1.3,burst:.4,bp:1.9,jump:.1,win:.45,speed:1.5,time:'sea',stars:4,cat:'misteri',fx:'ghost,glow:#e8f0f8',sea:1,locs:[2],hint:'PERAHU: PULAU KABUT',clue:'PULAU YANG BERKABUT',abil:'KABUT HIDUP: TUBUH SETIPIS ASAP',desc:'TUBUHNYA SETIPIS KABUT. HANYA MENAMPAKKAN DIRI DI PULAU BERKABUT.'});
addF({name:'COELACANTH',L:30,Hh:5.6,c:['#3a5a7a','#5a82a8','#c8d8e8','#1e3048'],fin:'#4a6a8a',w:[15,60],price:420,rar:3,pull:.75,stam:3,burst:.3,bp:2.1,jump:0,win:.5,speed:.9,time:'sea',stars:5,cat:'misteri',fx:'lobefins',sea:1,locs:[3],sw:10,hint:'PERAHU: KARANG PURBA',clue:'KARANG KUNO DI TENGAH LAUT',abil:'FOSIL HIDUP: TARIKAN SANGAT BERAT',desc:'DIKIRA PUNAH JUTAAN TAHUN LALU. SIRIPNYA BERLENGAN SEPERTI KAKI.'});
addF({name:'OARFISH',L:46,Hh:2.3,tail:'flow',c:['#c8d0d8','#e8eef4','#ffffff','#7a8a98'],fin:'#e8403a',w:[20,70],price:380,rar:3,pull:.6,stam:3,burst:.35,bp:2,win:.45,speed:1.2,time:'sea',stars:5,cat:'misteri',fx:'crest',sea:1,locs:[4],hint:'PERAHU: LAUTAN DALAM',clue:'LAUT PALING DALAM',abil:'ULAR LAUT: SANGAT PANJANG',desc:'IKAN PERAK SEPANJANG PERAHU. PELAUT MENGIRA INI ULAR LAUT.'});
addF({name:'LEVIATAN KECIL',L:50,Hh:8,c:['#1a2a5a','#2e4a8a','#8ab0e0','#0a1230'],fin:'#2e4a8a',w:[120,300],price:3200,rar:0,pull:.95,stam:5,burst:.6,bp:2.9,jump:.15,win:.3,speed:1.2,time:'sea',stars:5,cat:'legendaris',fx:'glow:#5a8aff,eye:#7ad0ff',sea:1,locs:[4],sw:3,hint:'PERAHU: LAUTAN DALAM',clue:'BAYANGAN BESAR DI LAUT DALAM',abil:'PENGUASA SAMUDRA: TAK TERKALAHKAN',desc:'ANAK MAKHLUK LEGENDA LAUT DALAM. BAYANGANNYA MENELAN PERAHU.'});
addF({name:'RAJA JURANG',L:28,Hh:7,c:['#2a1a3a','#4a2a5a','#8a6aa0','#120a1e'],fin:'#3a2a4a',w:[30,90],price:2400,rar:0,pull:.9,stam:4.2,burst:.55,bp:2.6,jump:0,win:.3,speed:1.3,time:'sea',stars:5,cat:'legendaris',fx:'lure,eye:#ffe86a',sea:1,locs:[3,4],sw:2,hint:'PERAHU: KARANG PURBA / LAUTAN DALAM',clue:'LENTERA DI DASAR JURANG',abil:'PEMANCING JURANG: UMPAN CAHAYA',desc:'MENGGANTUNG LENTERA DI KEPALANYA UNTUK MEMIKAT PEMANCING.'});

FISH[9].clue='MALAM DAN UMPAN TERBAIK';

/* ============================== EFEK SPRITE ============================== */
const PX=8,PT=9,PB=5;
function parseFx(s){const o={};if(!s)return o;for(const p of s.split(',')){const i=p.indexOf(':');if(i<0)o[p]=1;else o[p.slice(0,i)]=p.slice(i+1);}return o;}
function fxSprite(src,f,sil){
  const o=parseFx(f.fx);if(!Object.keys(o).length)return src;
  const sw=src.width,sh=src.height,Wn=sw+PX*2,Hn=sh+PT+PB,S=!!sil;
  const[c,g]=mk(Wn,Hn);g.drawImage(src,PX,PT);
  const id=g.getImageData(0,0,Wn,Hn),d=id.data;
  const A=(x,y)=>(x<0||y<0||x>=Wn||y>=Hn)?0:d[(y*Wn+x)*4+3];
  const put=(x,y,col,a)=>{x|=0;y|=0;if(x<0||y<0||x>=Wn||y>=Hn)return;const i=(y*Wn+x)*4;d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=a===undefined?255:a;};
  const pb=(x,y,col)=>{if(A(x,y)>0)put(x,y,col,d[(y*Wn+x)*4+3]);};
  const each=fn=>{for(let y=0;y<Hn;y++)for(let x=0;x<Wn;x++){const i=(y*Wn+x)*4;if(d[i+3]>0)fn(x,y,i);}};
  const rgb=i=>[d[i],d[i+1],d[i+2]];
  const setc=(i,cc)=>{d[i]=Math.round(cc[0]);d[i+1]=Math.round(cc[1]);d[i+2]=Math.round(cc[2]);};
  let x0=Wn,x1=-1,y0=Hn,y1=-1;
  each((x,y)=>{if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;});
  const top=x=>{for(let y=0;y<Hn;y++)if(A(x,y)>0)return y;return -1;};
  const bot=x=>{for(let y=Hn-1;y>=0;y--)if(A(x,y)>0)return y;return -1;};
  const mid=Math.round((y0+y1)/2);
  let ex=-1,ey=-1;                                   /* posisi mata dari warna piksel mata asli */
  each((x,y,i)=>{if(ex<0&&d[i]===244&&d[i+1]===244&&d[i+2]===234){ex=x;ey=y;}});
  if(ex<0)each((x,y,i)=>{if(ex<0&&d[i]===16&&d[i+1]===16&&d[i+2]===24){ex=x;ey=y;}});

  if(o.noeye)each((x,y,i)=>{const r=d[i],gg=d[i+1],b=d[i+2];
    if((r===244&&gg===244&&b===234)||(r===16&&gg===16&&b===24)){const j=(y*Wn+(x-3))*4;if(d[j+3]>0)setc(i,[d[j],d[j+1],d[j+2]]);}});
  if(o.eye&&!S){const ec=hx(o.eye);each((x,y,i)=>{if(d[i]===16&&d[i+1]===16&&d[i+2]===24)setc(i,ec);});}
  if(o.sparkle&&!S)each((x,y,i)=>{if(hash(x*13+3,y*7+1)>.93)setc(i,[255,250,210]);});
  if(o.aurora&&!S){const G=[hx('#3ad8b0'),hx('#8a7af0'),hx('#ff7ad0')];
    each((x,y,i)=>{const t=clamp((x-x0)/Math.max(1,x1-x0),0,1);
      const base=t<.5?mixc(G[0],G[1],t*2):mixc(G[1],G[2],(t-.5)*2);const lum=(d[i]+d[i+1]+d[i+2])/765,k=.5+.8*lum;
      setc(i,[clamp(base[0]*k,0,255),clamp(base[1]*k,0,255),clamp(base[2]*k,0,255)]);});}
  if(o.crystal&&!S)each((x,y,i)=>{const h=hash((x/3)|0,(y/3)|0),lum=(d[i]+d[i+1]+d[i+2])/765;if(lum<.25)return;
    if(h>.74)setc(i,mixc(rgb(i),[255,255,255],.45));else if(h<.2)setc(i,mixc(rgb(i),[30,110,150],.3));});
  if(o.checker&&!S)each((x,y,i)=>{const lum=(d[i]+d[i+1]+d[i+2])/765;if(lum<.12)return;setc(i,(((x>>1)+(y>>1))&1)?[245,245,250]:[34,34,52]);});
  if(o.mask&&!S&&ex>=0)each((x,y,i)=>{if(x>=ex-4&&x<=x1&&y>=ey-1&&y<=ey+2&&!(x===ex&&y===ey)){
    const lum=(d[i]+d[i+1]+d[i+2])/765;if(lum>.2)setc(i,mixc(rgb(i),[16,12,8],.82));}});
  if(o.bars)for(const t of [.26,.52,.78]){const bx=Math.round(x0+(x1-x0)*t),a=top(bx),b=bot(bx);
    for(let y=a;y>=0&&y<=b;y++){pb(bx-1,y,[40,16,0]);pb(bx,y,[255,255,255]);pb(bx+1,y,[255,255,255]);pb(bx+2,y,[40,16,0]);}}
  if(o.eyespot&&ex>=0){for(let y=top(ex);y<=bot(ex);y++){if(y===ey)continue;pb(ex-1,y,[24,20,30]);pb(ex,y,[24,20,30]);}
    const tx=Math.round(x0+(x1-x0)*.18);for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)pb(tx+dx,mid+dy,(dx===0&&dy===0)?[255,255,255]:[24,20,30]);}
  if(o.spikes){const add=[];for(let y=0;y<Hn;y++)for(let x=0;x<Wn;x++){if(A(x,y)>0)continue;
    if(A(x,y+1)>0&&(x+y)%3===0)add.push([x,y]);else if(A(x,y-1)>0&&(x+y)%3===1)add.push([x,y]);}
    for(const p of add)put(p[0],p[1],[250,238,190]);}
  if(o.lobefins){const fc=hx(f.fin);for(const t of [.36,.62]){const bx=Math.round(x0+(x1-x0)*t),by=bot(bx);
      for(let dx=-1;dx<=1;dx++)put(bx+dx,by+1,fc);put(bx,by+2,fc);put(bx-1,by+2,fc);}
    if(!S)each((x,y,i)=>{if(hash(x*5+1,y*9+2)>.95)setc(i,[240,246,255]);});}
  if(o.crest){const rc=[232,64,58];for(let x=x1-3;x>=Math.max(x0,x1-16);x--){const t=top(x);if(t<0)continue;put(x,t-1,rc);if((x&1)===0)put(x,t-2,rc);}}
  if(o.sailfin){const fc=mixc(hx(f.fin),[255,255,255],.2),dk=mixc(hx(f.fin),[0,0,0],.4),a=Math.round(x0+(x1-x0)*.28),b=Math.round(x0+(x1-x0)*.64);
    for(let x=a;x<=b;x++){const u=(x-a)/Math.max(1,b-a),hh=Math.round(6*Math.sin(Math.PI*Math.pow(u,.7))),t=top(x);
      for(let j=1;j<=hh;j++)put(x,t-j,((j+x)%3===0?dk:fc).map(Math.round));if(hh>0)put(x,t-hh-1,dk.map(Math.round));}}
  if(o.dragon){const gd=[255,211,90],hn=[255,232,160];
    for(let k=1;k<=8;k++){put(x1+k,mid-1+Math.round(Math.sin(k*.8)*1.6),gd);put(x1+k,mid+2+Math.round(Math.sin(k*.8+1.2)*1.6),gd);}
    const hxp=x1-7,t=top(hxp);if(t>0)for(let j=1;j<=3;j++){put(hxp,t-j,hn);put(hxp+3,t-j,hn);}}
  if(o.lure){const sx=x1-6,sy=top(sx),dk=[40,28,60];
    if(sy>0){for(const p of [[0,-1],[1,-2],[2,-3],[3,-4],[4,-4],[5,-4]])put(sx+p[0],sy+p[1],dk);
      const bx=sx+7,by=sy-4;for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)put(bx+dx,by+dy,(dx===0&&dy===0)?[255,255,230]:[255,226,90]);}
    for(let k=0;k<4;k++){put(x1-1-k*2,mid-1,[250,250,250]);put(x1-1-k*2,mid+2,[250,250,250]);}}
  if(o.photo&&!S)for(let x=x0+4;x<x1-3;x+=3){const b=bot(x);if(b>0)put(x,b-2,[216,255,106]);}
  if(o.electric&&!S)for(let x=x0+4;x<x1-2;x++){const y=mid+(((x>>1)&1)?-1:1);if(A(x,y)>0)put(x,y,[255,228,90]);}
  if(o.ghost&&!S)each((x,y,i)=>{d[i+3]=Math.round(d[i+3]*.64);});
  if(o.glass&&!S){each((x,y,i)=>{d[i+3]=Math.round(d[i+3]*.5);});for(let x=x0+6;x<x1-3;x++)put(x,mid,[70,120,140],200);}
  if(o.glow&&!S){const gc=hx(o.glow),R=3,add=[];
    for(let y=0;y<Hn;y++)for(let x=0;x<Wn;x++){if(d[(y*Wn+x)*4+3]>0)continue;let m=9;
      for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++)if(A(x+dx,y+dy)>=90){const dd=Math.max(Math.abs(dx),Math.abs(dy));if(dd<m)m=dd;}
      if(m<=R)add.push([x,y,Math.round(105*(1-(m-1)/R))]);}
    for(const p of add)put(p[0],p[1],gc,Math.max(10,p[2]));}
  if(S){for(let i=0;i<d.length;i+=4){if(d[i+3]>=128){d[i]=10;d[i+1]=18;d[i+2]=40;d[i+3]=255;}else d[i+3]=0;}}
  g.putImageData(id,0,0);return c;
}
const _mfs=makeFishSprite;
makeFishSprite=function(f,sil){const c=_mfs(f,sil);if(!f.fx)return c;try{return fxSprite(c,f,sil);}catch(e){return c;}};
buildFishAll();

/* ============================== KEMUNCULAN ============================== */
/* pengganti pickFish: aturan asli untuk ikan 0-9 + syarat khusus ikan baru. Ikan 'sea' hanya dari perahu. */
pickFish=function(){
  const per=period(dayP),b=bait(),dist=fish.cast,nf=nightF(dayP);let tot=0;const ws=[];
  const ctxc={per,rain:rainI,dist,luck:b.luck,nf};
  for(const f of FISH){
    if(f.sea){ws.push(0);continue;}
    let w=f.rar;
    if(f.time==='night')w*=per==='night'?3:(f.id===9?0:.12);
    else if(f.time==='day')w*=per==='day'?2:.35;
    else if(f.time==='dawn')w*=(per==='dawn'||per==='dusk')?3.5:.5;
    else if(f.time==='midday')w*=(Math.abs(((dayP%1)+1)%1-.5)<.09&&rainI<.4)?5:0;
    else if(f.time==='rain')w*=rainI>.4?3:0;
    else if(f.time==='nightrain')w*=(per==='night'&&rainI>.4)?4:0;
    if(rainI>.4&&(f.id===5||f.id===6))w*=2.6;
    if(f.id===9&&rainI>.6)w*=.2;
    w*=Math.pow(1+b.luck,(f.stars-1)*.65);
    w*=1+dist*(f.stars-1)*.35;
    if(f.stars>=4&&b.luck<.3)w*=.35;
    if(f.need)w*=f.need(ctxc);
    ws.push(w);tot+=w;}
  let r=Math.random()*tot;for(let i=0;i<ws.length;i++){r-=ws[i];if(r<=0)return i;}return 0;
};
/* ikan khusus laut untuk titik misterius (dipakai mode Adventure) */
LAKE.seaFish=function(loc){return FISH.filter(f=>f.sea&&f.locs&&f.locs.includes(loc)).map(f=>[f.id,f.sw||14]);};

/* efek dramatis saat ikan istimewa tersangkut / tertangkap */
let LFL=0;
const _hk5=hookFish;
hookFish=function(){_hk5();const f=FISH[fish.id];if(!f)return;
  const say=(s,col)=>{const run=()=>showToast(s,col);if(fish._perf)setTimeout(run,1100);else run();};
  if(f.cat==='legendaris'){LFL=1.3;shake(2.5);sfx('fanfare');say('IKAN LEGENDARIS TERSANGKUT!',CATC.legendaris);}
  else if(f.cat==='mistik'){sfx('whoosh');say('AURA MISTIK MENGALIR DI AIR...',CATC.mistik);}
  else if(f.cat==='misteri'){say('SESUATU YANG ANEH TERSANGKUT...',CATC.misteri);}
};
const _fc5=finishCatch;
finishCatch=function(){_fc5();const r=fish.res;if(!r)return;const f=FISH[r.id];
  if(f.cat==='legendaris'){LFL=.8;shake(2);clawdVy=-95;setTimeout(()=>sfx('fanfare'),350);}};
const _ds5=drawScene;
drawScene=function(){_ds5();if(LFL>0){ctx.globalAlpha=Math.min(.5,LFL*.45);ctx.fillStyle='#fff0b0';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;LFL-=DT;}};

/* ============================== BUKU KOLEKSI ============================== */
const BKPER=10;let BKpage=0,BKORD=[];
(function(){const rank={umum:0,langka:1,misteri:2,mistik:3,legendaris:4};
  BKORD=FISH.map(f=>f.id).sort((a,b)=>(rank[FISH[a].cat]-rank[FISH[b].cat])||(a-b));})();
const CATS=['umum','langka','misteri','mistik','legendaris'];
function bkReq(f,got){
  if(got||f.cat==='umum'||f.cat==='langka')return f.hint||TIMEN[f.time];
  return f.clue?('PETUNJUK: '+f.clue):'???';
}
drawBook=function(){
  ctx.fillStyle='rgba(10,6,24,.45)';ctx.fillRect(0,0,W,H);
  const k=ease(clamp(panelT*3,0,1)),w=Math.min(W-10,220),h=Math.min(H-16,portrait?214:H-16),x=(W-w)/2|0,y=((H-h)/2+(1-k)*30)|0;
  panel(x,y,w,h,'wood');
  const N=FISH.length,cnt=Object.keys(save.book).length,cb=14;
  txt('BUKU IKAN',x+12,y+10,UI.ink,2,0,UI.cream);txt(cnt+'/'+N,x+w-10,y+13,UI.wood,1,2);
  if(bookSel<0){
    const pages=Math.ceil(N/BKPER);BKpage=clamp(BKpage,0,pages-1);
    const gx=x+9,gy=y+26,cols=2,cw=((w-18)/cols)|0,ch=Math.min(30,((h-64)/5)|0);
    for(let n=0;n<BKPER;n++){const oi=BKpage*BKPER+n;if(oi>=N)break;
      const i=BKORD[oi],f=FISH[i],got=save.book[i],c=n%cols,r=(n/cols)|0,cx=gx+c*cw,cy=gy+r*ch;
      R(cx+1,cy+1,cw-2,ch-2,UI.ink);R(cx+2,cy+2,cw-4,ch-4,got?'#fbeccc':'#d8c8a4');R(cx+2,cy+2,cw-4,1,got?'#fff8e4':'#e4d6b4');
      R(cx+2,cy+2,2,ch-4,CATC[f.cat]);
      txt(String(oi+1),cx+6,cy+4,UI.wood);
      const spr=FSPR[i],sc=(spr.width>cw-10||spr.height>ch-13)?.5:1,sw=spr.width*sc,sh=spr.height*sc;
      const sx=cx+4+((cw-6-sw)/2|0),sy=cy+ch-3-sh;
      ctx.save();ctx.beginPath();ctx.rect(cx+4,cy+10,cw-6,ch-12);ctx.clip();
      drawFish(ctx,i,sx,sy,sc,1,T+i,got?1:0,!got,got?1:.55);ctx.restore();
      if(got)txt(tw(f.name)<=cw-20?f.name:f.name.split(' ').pop(),cx+cw-4,cy+4,UI.ink,1,2);else txt('???',cx+cw-4,cy+4,'#8a7a60',1,2);
      btns.push({id:'fish'+i,x:cx,y:cy,w:cw,h:ch,fn:()=>{bookSel=i;sfx('page');}});}
    /* legenda kategori (mengalir ke baris berikutnya bila sempit) */
    const mk2=(withCnt)=>CATS.map(cat=>{const tot=FISH.filter(f=>f.cat===cat).length,g=FISH.filter(f=>f.cat===cat&&save.book[f.id]).length;
      const lbl=CATN[cat]+(withCnt?' '+g+'/'+tot:'');return{cat,lbl,w:tw(lbl)+8};});
    const flow=(items)=>{let px=0,line=0;const pos=[];for(const it of items){if(px>0&&px+it.w>w-18){line++;px=0;}pos.push({it,px,line});px+=it.w+3;}return{pos,lines:line+1};};
    let fl=flow(mk2(true));if(fl.lines>2)fl=flow(mk2(false));
    const ly=y+h-33;
    for(const p of fl.pos){const lx=x+9+p.px,yy=ly+p.line*8;R(lx,yy,5,5,UI.ink);R(lx+1,yy+1,3,3,CATC[p.it.cat]);txt(p.it.lbl,lx+7,yy,UI.wood);}
    const py=y+h-17;
    button('bkp',x+10,py,18,12,'<',()=>{BKpage=(BKpage+pages-1)%pages;sfx('page');},'blue');
    button('bkn',x+w-28,py,18,12,'>',()=>{BKpage=(BKpage+1)%pages;sfx('page');},'blue');
    txt('HAL '+(BKpage+1)+'/'+pages,W/2,py+3,UI.ink,1,1);
  }else{
    const f=FISH[bookSel],got=save.book[bookSel],spr=FSPR[bookSel];
    const sc=(spr.width*2<=w-30&&spr.height*2<=44)?2:1;
    R(x+9,y+26,w-18,48,'#e9d6aa');R(x+9,y+26,w-18,1,UI.ink);R(x+9,y+73,w-18,1,UI.ink);
    for(let i=0;i<6;i++)R(x+10+((i*37+T*6)%(w-22)),y+38+i*5,6,1,'#dcc596');
    ctx.save();ctx.beginPath();ctx.rect(x+9,y+27,w-18,46);ctx.clip();
    drawFish(ctx,bookSel,W/2-spr.width*sc/2,y+50-spr.height*sc/2,sc,1,T,got?1.5:0,!got,got?1:.5);ctx.restore();
    let yy=y+79;
    txt(got?f.name:'???',x+12,yy,UI.ink,1);starsR(x+w-44,yy,f.stars,5);yy+=10;
    R(x+12,yy,5,5,UI.ink);R(x+13,yy+1,3,3,CATC[f.cat]);txt(CATN[f.cat],x+20,yy,CATC[f.cat]);yy+=9;
    const stat=(lbl,v,col)=>{txt(lbl,x+12,yy,UI.wood);bar(x+62,yy-1,w-76,6,v,col,'#c8b48a');yy+=8;};
    stat('KEKUATAN',f.pull,'#e0503e');stat('STAMINA',f.stam/3.2,'#e0a030');stat('KECEPATAN',f.speed/2,UI.blue);stat('LICIN',1-(f.win-.4)/.8,'#9a6ad0');
    for(const l of wrap('SYARAT: '+bkReq(f,got),w-24).slice(0,2)){txt(l,x+12,yy,UI.wood);yy+=7;}yy+=2;
    if(got){
      for(const l of wrap('KEMAMPUAN: '+f.abil,w-24)){if(yy>y+h-40)break;txt(l,x+12,yy,UI.accent);yy+=7;}yy+=2;
      for(const l of wrap(f.desc,w-24)){if(yy>y+h-30)break;txt(l,x+12,yy,UI.ink);yy+=7;}yy+=2;
      if(yy<y+h-18){txt('TERTANGKAP: '+got.n+'X   REKOR: '+got.b.toFixed(2)+' KG',x+12,yy,UI.wood);}
    }else{
      for(const l of wrap('BELUM TERTANGKAP. COBA UMPAN, WAKTU, ATAU CUACA YANG BERBEDA.',w-24)){if(yy>y+h-12)break;txt(l,x+12,yy,'#8a7a60');yy+=7;}
    }
    button('back',x+8,y-4,30,14,'<',()=>{bookSel=-1;sfx('page');},'blue');
  }
  button('close',x+w-cb-4,y-4,cb,cb,(bx,byy)=>{for(let i=0;i<5;i++){R(bx+4+i,byy+4+i,1,1,UI.paper);R(bx+8-i,byy+4+i,1,1,UI.paper);}},()=>go(prevScene||'menu'),'red');
};

/* ============================================================================
   SKIN KARAKTER & PERAHU
   ============================================================================ */
save.skin=save.skin||{};
save.skin.c=save.skin.c||'klasik';save.skin.b=save.skin.b||'kayu';
save.skin.own=save.skin.own||{};save.skin.own.c=save.skin.own.c||{klasik:1};save.skin.own.b=save.skin.own.b||{kayu:1};
save.skin.own.c.klasik=1;save.skin.own.b.kayu=1;

function catN(c){return Object.keys(save.book).filter(k=>FISH[k]&&FISH[k].cat===c).length;}

/* ---------- skin karakter: palet (dipetakan dari warna asli Clawd) + aksesori (piksel relatif ke tubuh) ---------- */
const ORIG={o:'#d97757',l:'#e8906f',h:'#f4b596',d:'#b95c3e',dd:'#933f27',sh:'#c96a4b',ol:'#3d1a10',k:'#1d1310'};
const pkey=c=>(c[0]<<16)|(c[1]<<8)|c[2];
function makeMap(base,eye){
  const B=hx(base),Wh=[255,255,255],K=[0,0,0],m=new Map();
  const set=(orig,col)=>m.set(pkey(hx(orig)),col.map(v=>Math.round(clamp(v,0,255))));
  set(ORIG.o,B);set(ORIG.l,mixc(B,Wh,.2));set(ORIG.h,mixc(B,Wh,.42));set(ORIG.d,mixc(B,K,.2));
  set(ORIG.dd,mixc(B,K,.38));set(ORIG.sh,mixc(B,K,.1));set(ORIG.ol,mixc(B,K,.74));
  if(eye)set(ORIG.k,hx(eye));
  return m;}
const RAR=['UMUM','LANGKA','EPIK','LEGENDARIS'],RARC=[CATC.umum,CATC.langka,CATC.misteri,CATC.legendaris];
const CS=[
 {id:'klasik',n:'KLASIK',d:'WARNA ASLI CLAWD. SELALU SIAP MANCING.',price:0,rar:0},
 {id:'nelayan',n:'NELAYAN',d:'JAS KUNING DAN TOPI PELAUT BIRU. TAHAN BADAI!',price:120,rar:0,base:'#eeb23a',
  acc:P=>{P(3,-4,10,1,'#2c5a9a');P(2,-3,12,2,'#2c5a9a');P(4,-3,4,1,'#4a7ac0');P(-1,-1,18,1,'#1e4272');P(-2,0,1,1,'#1e4272');P(17,0,1,1,'#1e4272');}},
 {id:'sakura',n:'SAKURA',d:'WARNA MERAH MUDA DENGAN BUNGA DI KEPALA.',price:200,rar:0,base:'#f08ab0',
  acc:P=>{P(11,-3,3,1,'#fff0f6');P(10,-2,5,1,'#fff0f6');P(11,-1,3,1,'#fff0f6');P(12,-2,1,1,'#f0507a');P(2,-2,2,1,'#ffd0e0');}},
 {id:'mint',n:'MINT',d:'HIJAU SEGAR DENGAN TUNAS DAUN DI KEPALA.',price:200,rar:0,base:'#58c890',
  acc:P=>{P(7,-3,1,3,'#2e7d32');P(8,-4,3,1,'#43a047');P(8,-3,2,1,'#66bb6a');P(5,-4,2,1,'#43a047');}},
 {id:'bajak',n:'BAJAK LAUT',d:'BANDANA MERAH DAN PENUTUP MATA. ARRR!',price:450,rar:1,
  acc:(P,ex)=>{P(-1,-1,18,1,'#7a1f18');P(0,0,16,2,'#c0392b');P(3,0,1,1,'#fff');P(8,1,1,1,'#fff');P(12,0,1,1,'#fff');P(16,-1,3,2,'#c0392b');P(18,1,2,2,'#9a2a20');P(2+ex,1,5,4,'#12121a');P(0,2,2,1,'#12121a');}},
 {id:'penyihir',n:'PENYIHIR',d:'TOPI RUNCING BERBINTANG. KATANYA BISA MEMANGGIL IKAN.',price:800,rar:2,base:'#8a5ad0',
  acc:P=>{P(7,-9,2,1,'#5a2a9a');P(6,-8,4,1,'#5a2a9a');P(5,-7,6,2,'#5a2a9a');P(4,-5,8,2,'#5a2a9a');P(3,-3,10,2,'#5a2a9a');P(-1,-1,18,1,'#3a1a6a');P(7,-6,2,1,'#ffe066');P(8,-5,1,1,'#ffe066');P(5,-3,1,1,'#7a4ac0');}},
 {id:'kosmik',n:'KOSMIK',d:'JAS ANGKASA PUTIH DENGAN KACA HELM. UNTUK MANCING DI LANGIT.',price:0,rar:2,base:'#dfe6f0',
  cond:()=>!!(save.boat&&save.boat.vis&&save.boat.vis.includes(4)),condTxt:'KUNJUNGI LAUTAN DALAM',
  acc:P=>{P(-1,-2,18,1,'#9fb4cc');P(-2,-1,1,8,'#9fb4cc');P(16,-1,1,8,'#9fb4cc');P(2,0,3,1,'rgba(255,255,255,.7)');P(2,1,1,1,'rgba(255,255,255,.5)');P(8,-5,1,3,'#9fb4cc');P(7,-6,3,1,'#ff5a5a');}},
 {id:'emas',n:'EMAS',d:'KULIT BERLAPIS EMAS DAN MAHKOTA. UNTUK RAJA PEMANCING.',price:2000,rar:3,base:'#e8b838',
  acc:P=>{P(3,-2,10,2,'#ffd35a');P(3,-4,2,2,'#ffd35a');P(7,-5,2,3,'#ffd35a');P(11,-4,2,2,'#ffd35a');P(7,-3,2,1,'#e0302a');P(4,-2,1,1,'#3a8ae0');P(11,-2,1,1,'#3a8ae0');P(3,-1,10,1,'#c8962a');}},
 {id:'hantu',n:'HANTU',d:'TEMBUS PANDANG DAN BERKILAU DINGIN. PENGHUNI DANAU ANGKER.',price:0,rar:2,base:'#bcd8ee',eye:'#3a6aa0',alpha:.8,
  cond:()=>catN('mistik')>=1,condTxt:'TANGKAP 1 IKAN MISTIK',
  acc:P=>{P(2,-3,1,2,'#e8f4ff');P(13,-4,1,3,'#e8f4ff');P(8,-2,1,2,'#e8f4ff');}},
 {id:'naga',n:'NAGA',d:'SISIK HIJAU DAN TANDUK EMAS. KEKUATAN RAJA AIR.',price:0,rar:3,base:'#2f8a4a',eye:'#ff3a2a',
  cond:()=>catN('legendaris')>=1,condTxt:'TANGKAP 1 IKAN LEGENDARIS',
  acc:P=>{P(2,-4,2,3,'#f0e0a0');P(1,-5,1,2,'#f0e0a0');P(12,-4,2,3,'#f0e0a0');P(14,-5,1,2,'#f0e0a0');P(6,-1,4,1,'#1f6a38');}}
];
const CSK={};CS.forEach(s=>{CSK[s.id]=s;if(s.base)s.map=makeMap(s.base,s.eye);});

/* ---------- skin perahu ---------- */
const BS=[
 {id:'kayu',n:'KAYU',d:'PERAHU KAYU SEDERHANA. SETIA MENEMANI PEMANCING.',price:0,rar:0,hull:['#a06a3c','#8a5a34'],sail:['#f3e2b8','#e8d4a8'],cabin:'#3a2416'},
 {id:'biru',n:'BIRU LAUT',d:'LAMBUNG BIRU DENGAN LAYAR PUTIH BERGARIS MERAH.',price:150,rar:0,hull:['#3a78c2','#2c5fa0'],sail:['#ffffff','#e6eef8'],cabin:'#1a2a48',
  decor:(g,cx,y)=>{g.fillStyle='#d94a3a';for(const j of [2,3])g.fillRect(cx-11+j,y-14+j,9-j,1);}},
 {id:'sakura',n:'SAKURA',d:'LAMBUNG MERAH MUDA DENGAN LAYAR BERTABUR KELOPAK.',price:250,rar:0,hull:['#e88aa8','#cc6a8a'],sail:['#ffe6ee','#f6cddb'],cabin:'#5a2a3a',
  decor:(g,cx,y)=>{g.fillStyle='#f08aa8';g.fillRect(cx-9,y-12,1,1);g.fillRect(cx-6,y-10,1,1);g.fillRect(cx-8,y-8,1,1);g.fillRect(cx-5,y-12,1,1);}},
 {id:'bajak',n:'BAJAK LAUT',d:'LAMBUNG HITAM DENGAN LAYAR BERGAMBAR TENGKORAK.',price:500,rar:1,hull:['#3a3440','#2a2430'],sail:['#2e2e38','#222230'],cabin:'#100c14',
  decor:(g,cx,y)=>{g.fillStyle='#ececec';g.fillRect(cx-8,y-13,4,3);g.fillStyle='#14141c';g.fillRect(cx-8,y-12,1,1);g.fillRect(cx-5,y-12,1,1);g.fillRect(cx-7,y-11,1,1);g.fillRect(cx-5,y-11,1,1);}},
 {id:'kristal',n:'KRISTAL',d:'LAMBUNG KRISTAL BIRU ES YANG BERKILAU.',price:1200,rar:2,hull:['#6fe0f0','#3fb8d8'],sail:['#e8fbff','#c8f0ff'],cabin:'#134a5a',
  decor:(g,cx,y,t)=>{const a=(Math.sin(t*5)+1)/2,a0=g.globalAlpha;g.fillStyle='#fff';g.globalAlpha=a0*(.4+.6*a);g.fillRect(cx-6,y+2,1,1);g.fillRect(cx+4,y+4,1,1);g.fillRect(cx-8,y-10,1,1);g.globalAlpha=a0;}},
 {id:'emas',n:'EMAS',d:'LAMBUNG DAN LAYAR EMAS MURNI. MEWAH DI ATAS AIR.',price:2500,rar:3,hull:['#e8b838','#c8962a'],sail:['#fff1b8','#f3d870'],cabin:'#5a3a0a',
  decor:(g,cx,y,t)=>{g.fillStyle='#fff6b0';g.fillRect(cx-16,y+1,33,1);if(Math.sin(t*4)>.6){g.fillStyle='#fff';g.fillRect(cx+6,y+3,1,1);g.fillRect(cx-4,y-9,1,1);}}},
 {id:'bulan',n:'BULAN',d:'LAMBUNG BIRU MALAM DENGAN LAYAR BERSINAR BULAN SABIT.',price:0,rar:2,hull:['#2e3f8a','#222f6a'],sail:['#cfe0ff','#aec6f5'],cabin:'#0e1230',
  cond:()=>!!save.book[9],condTxt:'TANGKAP MOONFIN',
  decor:(g,cx,y)=>{g.fillStyle='#fff2a0';g.fillRect(cx-7,y-13,2,1);g.fillRect(cx-8,y-12,1,2);g.fillRect(cx-7,y-10,2,1);g.fillStyle='#fff';g.fillRect(cx-5,y-11,1,1);}},
 {id:'hantu',n:'KAPAL HANTU',d:'KAPAL TEMBUS PANDANG DENGAN LENTERA ARWAH BIRU.',price:0,rar:2,alpha:.78,hull:['#7fb8c8','#5a95a8'],sail:['#dff3ff','#bfe0f0'],cabin:'#143040',
  cond:()=>catN('misteri')>=2,condTxt:'TANGKAP 2 IKAN MISTERI',
  decor:(g,cx,y,t)=>{const a0=g.globalAlpha;g.globalAlpha=1;g.fillStyle='#9ae8ff';g.fillRect(cx-4,y-18,3,3);g.fillStyle='#e8fbff';g.fillRect(cx-3,y-17,1,1);
    g.globalAlpha=.22+.12*Math.sin(t*4);g.fillStyle='#9ae8ff';g.fillRect(cx-6,y-20,7,7);g.globalAlpha=a0;}},
 {id:'naga',n:'NAGA',d:'HIJAU ZAMRUD DENGAN KEPALA NAGA DI HALUAN.',price:0,rar:3,hull:['#2f8a4a','#226a38'],sail:['#d94a3a','#b83a2e'],cabin:'#0e2a14',
  cond:()=>catN('legendaris')>=1,condTxt:'TANGKAP 1 IKAN LEGENDARIS',
  decor:(g,cx,y)=>{g.fillStyle='#2f8a4a';g.fillRect(cx+17,y-5,4,5);g.fillStyle='#1f6a38';g.fillRect(cx+17,y-5,1,5);g.fillStyle='#f0e0a0';g.fillRect(cx+18,y-8,1,3);g.fillRect(cx+20,y-7,1,2);
    g.fillStyle='#ffeb3b';g.fillRect(cx+19,y-3,1,1);g.fillStyle='#e04a3a';g.fillRect(cx+20,y-1,3,1);}}
];
const BSK={};BS.forEach(s=>BSK[s.id]=s);

const SK={tab:0,sel:[0,0],prevC:null,prevB:null};
LAKE.boatSkin=function(){return BSK[SK.prevB||save.skin.b]||BSK.kayu;};

/* ---------- gambar Clawd bersekin: gambar asli ke kanvas sementara -> petakan palet -> aksesori ---------- */
const TW=36,TH=34,OX=10,OY=14,TMP=document.createElement('canvas');TMP.width=TW;TMP.height=TH;
const TG=TMP.getContext('2d',{willReadFrequently:true});TG.imageSmoothingEnabled=false;
const _dc5=drawClawd;
drawClawd=function(g,x,y,p){
  const S=CSK[SK.prevC||save.skin.c];
  if(!S||(!S.map&&!S.acc&&!S.alpha)){_dc5(g,x,y,p);return;}
  x=Math.round(x);y=Math.round(y);
  TG.clearRect(0,0,TW,TH);
  _dc5(TG,OX,OY,p);
  if(S.map){const id=TG.getImageData(0,0,TW,TH),d=id.data;
    for(let i=0;i<d.length;i+=4){if(d[i+3]!==255)continue;const m=S.map.get((d[i]<<16)|(d[i+1]<<8)|d[i+2]);if(m){d[i]=m[0];d[i+1]=m[1];d[i+2]=m[2];}}
    TG.putImageData(id,0,0);}
  if(S.acc){const lean=p.lean||0,sq=p.sq||0,ex=p.lookX||0;
    S.acc((a,b,w,h,c)=>{TG.fillStyle=c;TG.fillRect(OX+lean+a,OY+sq+b,w,h);},ex,p);}
  const pa=g.globalAlpha;if(S.alpha)g.globalAlpha=pa*S.alpha;
  g.drawImage(TMP,x-OX,y-OY);g.globalAlpha=pa;
};

/* ---------- membuka skin otomatis saat syarat terpenuhi ---------- */
function unlockCheck(){for(const t of ['c','b']){const L=t==='c'?CS:BS,o=save.skin.own[t];
  for(const S of L)if(!o[S.id]&&S.cond&&S.cond()){o[S.id]=1;writeSave();showToast('SKIN TERBUKA: '+S.n,UI.gold);sfx('fanfare');}}}
let UCt=1;
const _u5=updateEnv;updateEnv=function(dt){_u5(dt);UCt-=dt;if(UCt<=0){UCt=1.5;unlockCheck();}};

/* ---------- panel skin ---------- */
function openSkin(){prevScene=(scene==='skin')?'play':scene;go('skin');}
function iconSkin(x,y){R(x+1,y+1,7,6,UI.ink);R(x+2,y+2,5,4,'#f0c060');R(x+3,y+3,1,1,'#e0503e');R(x+5,y+3,1,1,'#3f8ad8');R(x+4,y+5,1,1,'#6ac46a');R(x+6,y+5,1,1,UI.ink);}
function drawSkinPanel(){
  ctx.fillStyle='rgba(10,6,24,.45)';ctx.fillRect(0,0,W,H);
  const k=ease(clamp(panelT*3,0,1)),w=Math.min(W-10,210),h=Math.min(H-14,176),x=(W-w)/2|0,y=((H-h)/2+(1-k)*30)|0;
  panel(x,y,w,h,'wood');
  txt('SKIN',x+12,y+10,UI.ink,2,0,UI.cream);
  const cs=String(save.coins);iconCoin(x+w-10-tw(cs)-8,y+11);txt(cs,x+w-10,y+12,'#b0781a',1,2,UI.cream);
  const t2=((w-26)/2)|0,tb=SK.tab===0?'c':'b';
  button('sktab0',x+10,y+28,t2,13,'KARAKTER',()=>{SK.tab=0;sfx('tab');},SK.tab===0?'blue':'gray');
  button('sktab1',x+16+t2,y+28,t2,13,'PERAHU',()=>{SK.tab=1;sfx('tab');},SK.tab===1?'blue':'gray');
  const L=SK.tab===0?CS:BS,n=L.length;SK.sel[SK.tab]=clamp(SK.sel[SK.tab],0,n-1);
  const S=L[SK.sel[SK.tab]],own=!!save.skin.own[tb][S.id],eq=save.skin[tb]===S.id;
  /* kotak pratinjau 2x */
  const bx=x+10,by=y+46,bw=w-20,bh=58;
  R(bx-1,by-1,bw+2,bh+2,UI.ink);
  for(let i=0;i<bh;i++){ctx.fillStyle=css(mixc(hx('#a8d8f4'),hx('#4a86c0'),i/bh));ctx.fillRect(bx,by+i,bw,1);}
  ctx.save();ctx.beginPath();ctx.rect(bx,by,bw,bh);ctx.clip();
  ctx.fillStyle='rgba(30,70,130,.35)';ctx.fillRect(bx,by+Math.round(bh*.62),bw,bh);
  ctx.translate(bx+(bw>>1),by+Math.round(bh*.66));ctx.scale(2,2);
  if(SK.tab===0){SK.prevC=S.id;drawClawd(ctx,-8,-9,{lookX:1,blink:Math.sin(T*.9)>.96,legs:[0,0,0,0],armL:[0,0],armR:[0,0]});SK.prevC=null;}
  else{SK.prevB=S.id;if(LAKE.drawBoat)LAKE.drawBoat(0,0,true);SK.prevB=null;}
  ctx.restore();
  if(!own&&S.cond){ctx.fillStyle='rgba(10,6,24,.55)';ctx.fillRect(bx,by,bw,bh);
    const lx=bx+(bw>>1)-4,ly=by+(bh>>1)-5;R(lx+1,ly,6,1,UI.paper);R(lx,ly+1,1,3,UI.paper);R(lx+7,ly+1,1,3,UI.paper);R(lx-1,ly+4,10,7,UI.paper);R(lx+3,ly+6,2,3,UI.ink);}
  button('skprev',bx+2,by+(bh>>1)-7,14,14,'<',()=>{SK.sel[SK.tab]=(SK.sel[SK.tab]+n-1)%n;sfx('tab');},'blue');
  button('sknext',bx+bw-16,by+(bh>>1)-7,14,14,'>',()=>{SK.sel[SK.tab]=(SK.sel[SK.tab]+1)%n;sfx('tab');},'blue');
  /* info */
  const ry=y+110;
  txt(S.n,x+12,ry,UI.ink);txt(RAR[S.rar||0],x+w-12,ry,RARC[S.rar||0],1,2);
  let dy=ry+10;for(const l of wrap(S.d,w-24).slice(0,2)){txt(l,x+12,dy,UI.wood);dy+=7;}
  txt((SK.sel[SK.tab]+1)+'/'+n,x+w-12,y+h-37,UI.wood,1,2);
  if(!own&&S.cond){let cy=y+h-48;for(const l of wrap('SYARAT: '+S.condTxt,w-60).slice(0,2)){txt(l,x+12,cy,UI.red);cy+=7;}}
  /* aksi */
  const by2=y+h-25,bw2=Math.min(104,w-24),bx2=(W-bw2)/2|0;
  if(eq)button('skact',bx2,by2,bw2,16,'DIPAKAI',()=>{},'gray');
  else if(own)button('skact',bx2,by2,bw2,16,'PAKAI',()=>{save.skin[tb]=S.id;writeSave();showToast('SKIN DIPAKAI: '+S.n,UI.gold);sfx('coin');},'green');
  else if(S.cond)button('skact',bx2,by2,bw2,16,'TERKUNCI',()=>{showToast(S.condTxt,UI.red);sfx('err');},'gray');
  else{const can=save.coins>=S.price;
    button('skact',bx2,by2,bw2,16,(bx3,by3)=>{iconCoin(bx3+12,by3+5);txt('BELI '+S.price,bx3+23,by3+5,UI.paper,1,0,'#22508a');},
      ()=>{if(save.coins>=S.price){save.coins-=S.price;save.skin.own[tb][S.id]=1;save.skin[tb]=S.id;writeSave();showToast('DIBELI: '+S.n,UI.gold);sfx('fanfare');}
        else{showToast('KOIN KURANG!',UI.red);sfx('err');}},can?'blue':'gray');}
  const cb=14;
  button('skclose',x+w-cb-4,y-4,cb,cb,(b1,b2)=>{for(let i=0;i<5;i++){R(b1+4+i,b2+4+i,1,1,UI.paper);R(b1+8-i,b2+4+i,1,1,UI.paper);}},()=>go(prevScene||'play'),'red');
}
const _f5=frame;frame=function(now){_f5(now);if(scene==='skin')drawSkinPanel();};

/* ---------- tombol akses: menu (kanan bawah) & HUD mancing (kolom kiri) ---------- */
const _m5=drawMenu;
drawMenu=function(){_m5();button('mskin',W-54,H-22,50,16,'SKIN',()=>{initAudio();openSkin();},'blue');};
const _h5=drawHUD;
drawHUD=function(){_h5();if(scene!=='play')return;if(toast&&toast.s==='MEMOTRET...')return;
  button('xskin',4,104,15,15,(x,y)=>iconSkin(x+3,y+3),()=>openSkin(),'gray');};
window.addEventListener('keydown',e=>{if(e.code==='Escape'&&scene==='skin')go(prevScene||'play');});
LAKE.skinList=()=>({c:CS.map(x=>({id:x.id,n:x.n})),b:BS.map(x=>({id:x.id,n:x.n}))});
})();

'use strict';
(function(){
/* ============================================================================
   v1.6  AKUN ONLINE + PANEL ADMIN (Supabase)
   - Opsional: bila config.js kosong, game tetap 100% offline seperti sebelumnya
   - Pemain: login, cloud save, menerima hadiah dari admin
   - Admin : lihat pemain, kirim hadiah (spawn ikan legendaris, joran, koin, skin, ...)
   - KEAMANAN: semua izin ditegakkan di SERVER (RLS + fungsi SQL). Klien hanya menampilkan.
   ============================================================================ */
const CFG=window.LAKE_CONFIG||{};
const URLB=String(CFG.url||'').replace(/\/+$/,''),KEY=String(CFG.key||'');
const ON=!!(URLB&&KEY);
window.LAKE=window.LAKE||{};LAKE.cloudOn=ON;

/* antrean spawn dari admin: ikan berikutnya yang tersangkut = ikan hadiah (dihabiskan saat ikan benar-benar tersangkut) */
const _pf6=pickFish;
pickFish=function(){const q=save.spawnQ;if(q&&q.length&&FISH[q[0]])return q[0];return _pf6();};
const _hk6=hookFish;
hookFish=function(){_hk6();const q=save.spawnQ;if(q&&q.length&&q[0]===fish.id){q.shift();writeSave();}};
if(!ON)return;

const C={role:null,name:'',err:'',msg:'',busy:false,lastSync:0,sel:null,users:[],q:'',log:[],kind:'spawn'};
const SKEY='lake_sb_session';
let S=null;try{S=JSON.parse(localStorage.getItem(SKEY)||'null');}catch(e){S=null;}
const saveSess=()=>{try{S?localStorage.setItem(SKEY,JSON.stringify(S)):localStorage.removeItem(SKEY);}catch(e){}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------------- jaringan (fetch langsung ke GoTrue & PostgREST, tanpa pustaka) ---------------- */
async function http(path,opt){
  const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),CFG.timeout||12000);
  try{
    const r=await fetch(URLB+path,Object.assign({},opt,{signal:ctl.signal}));
    const t=await r.text();let j=null;try{j=t?JSON.parse(t):null;}catch(e){j=t;}
    if(!r.ok){const m=(j&&typeof j==='object'&&(j.msg||j.message||j.error_description||j.error))||('HTTP '+r.status);const er=new Error(String(m));er.status=r.status;throw er;}
    return j;
  }catch(e){
    if(e.name==='AbortError'){const er=new Error('KONEKSI LAMBAT / TIDAK ADA INTERNET');er.status=0;throw er;}
    if(e instanceof TypeError){const er=new Error('TIDAK ADA KONEKSI');er.status=0;throw er;}
    throw e;
  }finally{clearTimeout(to);}
}
const hdr=auth=>({'apikey':KEY,'Content-Type':'application/json','Authorization':'Bearer '+(auth&&S?S.access:KEY)});
function setSess(j){S={access:j.access_token,refresh:j.refresh_token,exp:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),email:(j.user&&j.user.email)||(S&&S.email)||''};saveSess();}
async function refresh(){if(!S||!S.refresh)throw new Error('SESI HABIS');
  const j=await http('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:hdr(false),body:JSON.stringify({refresh_token:S.refresh})});setSess(j);}
async function rpc(fn,args){
  if(!S)throw new Error('BELUM LOGIN');
  if(S.exp&&Date.now()/1000>S.exp-60)await refresh();
  const go1=()=>http('/rest/v1/rpc/'+fn,{method:'POST',headers:hdr(true),body:JSON.stringify(args||{})});
  try{return await go1();}catch(e){if(e.status===401){await refresh();return go1();}throw e;}
}

/* ---------------- akun ---------------- */
async function doLogin(email,pw){
  const j=await http('/auth/v1/token?grant_type=password',{method:'POST',headers:hdr(false),body:JSON.stringify({email,password:pw})});
  setSess(j);await afterLogin();}
async function doSignup(email,pw,name){
  const j=await http('/auth/v1/signup',{method:'POST',headers:hdr(false),body:JSON.stringify({email,password:pw,data:name?{username:name}:{}})});
  if(j&&j.access_token){setSess(j);await afterLogin();return true;}return false;}
async function afterLogin(){
  const p=await rpc('my_profile');const row=Array.isArray(p)?p[0]:p;
  C.role=row?row.role:'player';C.name=row?row.username:'';C.err='';await poll(true);}
function doLogout(){S=null;saveSess();C.role=null;C.name='';C.users=[];C.sel=null;}

/* ---------------- hadiah dari admin (diterapkan ke save lokal; klaim di server hanya SEKALI) ---------------- */
const GL=()=>{save.giftLog=save.giftLog||[];return save.giftLog;};
function applyGift(g){
  const p=g.payload||{};let txt=null;
  if(g.kind==='fish'){const f=FISH[p.id];if(!f)return false;
    const wt=+clamp(p.wt>0?p.wt:(f.w[0]+f.w[1])/2,.01,10000).toFixed(2),r=save.book[p.id];
    save.book[p.id]={n:(r?r.n:0)+1,b:Math.max(r?r.b:0,wt)};save.total=(save.total||0)+1;txt=f.name+' '+wt+' KG';}
  else if(g.kind==='spawn'){const f=FISH[p.id];if(!f)return false;const n=clamp((p.n|0)||1,1,50);
    save.spawnQ=save.spawnQ||[];for(let i=0;i<n&&save.spawnQ.length<200;i++)save.spawnQ.push(p.id);txt='SPAWN '+f.name+' X'+n;}
  else if(g.kind==='item'){const it=ITEMS[p.cat]&&ITEMS[p.cat][p.idx];if(!it)return false;
    if(!save.own[p.cat].includes(p.idx))save.own[p.cat].push(p.idx);
    if(p.idx>save.eq[p.cat])save.eq[p.cat]=p.idx;txt=it.n;}
  else if(g.kind==='coins'){const n=clamp(p.n|0,0,1000000);save.coins+=n;txt='+'+n+' KOIN';}
  else if(g.kind==='skin'){const t=p.t==='b'?'b':'c';save.skin.own[t][String(p.id)]=1;txt='SKIN '+String(p.id).toUpperCase();}
  else return false;
  const log=GL();log.unshift({t:Date.now(),s:txt,n:String(g.note||'').slice(0,40)});log.length=Math.min(log.length,12);
  writeSave();return true;
}
async function poll(force){
  if(!S||C.busy)return;C.busy=true;
  try{
    const gs=await rpc('claim_gifts');let n=0;
    if(Array.isArray(gs))for(const g of gs)if(applyGift(g))n++;
    if(n){showToast(n+' HADIAH DARI ADMIN!',UI.gold);sfx('fanfare');if(OV&&OV.style.display==='block'&&view==='acct')render();}
    if(force||Date.now()-C.lastSync>(CFG.syncMs||60000)){await rpc('save_cloud',{p_data:JSON.parse(JSON.stringify(save))});C.lastSync=Date.now();}
    C.err='';
  }catch(e){C.err=e.message||'ERROR';if(e.status===401||(e.status===400&&/refresh|token|session/i.test(C.err)))doLogout();}
  finally{C.busy=false;}
}
setInterval(()=>{if(S&&document.visibilityState==='visible')poll(false);},CFG.pollMs||25000);
if(S)afterLogin().catch(e=>{C.err=e.message;if(e.status===401||e.status===400)doLogout();});

/* ---------------- overlay HTML (login & panel admin) ---------------- */
const CSS=`#lk-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:50;display:none;background:rgba(8,6,20,.88);color:#f3e6c8;font:13px/1.4 "Courier New",monospace;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;user-select:text;-webkit-user-select:text;padding:max(10px,env(safe-area-inset-top)) 10px max(16px,env(safe-area-inset-bottom))}
#lk-ov .bx{max-width:440px;margin:0 auto;background:#3b2a1e;border:3px solid #1a1024;box-shadow:inset 0 0 0 3px #8a5a34;padding:14px}
#lk-ov h2{margin:0 0 8px;font-size:18px;color:#ffd35a;letter-spacing:1px}
#lk-ov label{display:block;margin:9px 0 3px;color:#d8c8a4;font-size:12px}
#lk-ov input,#lk-ov select{width:100%;box-sizing:border-box;font:16px "Courier New",monospace;padding:7px;background:#1a1024;color:#f3e6c8;border:2px solid #8a5a34;border-radius:0}
#lk-ov button{font:bold 13px "Courier New",monospace;padding:9px 11px;margin:9px 6px 0 0;background:#3f8ad8;color:#fff;border:2px solid #1a1024;box-shadow:inset 0 -3px 0 rgba(0,0,0,.3);cursor:pointer}
#lk-ov button.g{background:#3f9a48}#lk-ov button.r{background:#c0503e}#lk-ov button.x{background:#6a5a4a}
#lk-ov .row{padding:7px;border:2px solid transparent;border-bottom:1px dashed #6a4a2e;cursor:pointer}
#lk-ov .row.sel{border-color:#ffd35a;background:#4a3322}
#lk-ov .lst{max-height:190px;overflow-y:auto;border:2px solid #1a1024;background:#2a1c14;margin-top:6px}
#lk-ov .lst.small{max-height:110px}
#lk-ov .gl{padding:4px 7px;border-bottom:1px dashed #6a4a2e}
#lk-ov .adm{color:#ffd35a}#lk-ov small{color:#a8987a}
#lk-ov .st{margin-top:10px;min-height:18px;color:#9fe3ff;word-break:break-word}#lk-ov .st.er{color:#ff8a7a}`;
let OV=null,prevOv='menu',view='acct',netBusy=false;
const gv=id=>{const e=document.getElementById(id);return e?e.value:'';};
const setHtml=(id,h)=>{const e=document.getElementById(id);if(e)e.innerHTML=h;};
function setStatus(m,err){C.msg=m||'';const e=document.getElementById('lk-st');if(e){e.textContent=m||'';e.className='st'+(err?' er':'');}}
function mkOv(){
  if(OV)return OV;
  const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  OV=document.createElement('div');OV.id='lk-ov';document.body.appendChild(OV);
  OV.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')closeOv();else if(e.key==='Enter'&&view==='acct'&&!S&&e.target.tagName==='INPUT')act('login');});
  OV.addEventListener('keyup',e=>e.stopPropagation());
  OV.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(el)act(el.dataset.act,el);});
  OV.addEventListener('change',e=>{if(e.target.id==='lk-kind')onKind();});
  return OV;}
function openOv(v){mkOv();if(scene!=='acct')prevOv=scene;scene='acct';panelT=0;btns=[];OV.style.display='block';view=v||'acct';C.msg='';render();}
function closeOv(){if(!OV)return;OV.style.display='none';if(scene==='acct'){scene=prevOv||'menu';btns=[];}}
function render(){OV.innerHTML=view==='admin'&&C.role==='admin'?vAdmin():vAcct();if(view==='admin')onKind(true);}

function vAcct(){
  const st=`<div class="st${C.err&&!C.msg?' er':''}" id="lk-st">${esc(C.msg||C.err||'')}</div>`;
  if(!S)return `<div class="bx"><h2>AKUN LAKE</h2><small>Masuk untuk menyimpan progres di cloud dan menerima hadiah dari admin. Game tetap bisa dimainkan offline tanpa akun.</small>
   <label>EMAIL</label><input id="lk-email" type="email" autocomplete="username" autocapitalize="off">
   <label>KATA SANDI (min. 6 karakter)</label><input id="lk-pw" type="password" autocomplete="current-password">
   <label>NAMA PEMANCING (khusus daftar, opsional)</label><input id="lk-name" maxlength="24">
   <div><button class="g" data-act="login">MASUK</button><button data-act="signup">DAFTAR</button><button class="x" data-act="close">TUTUP</button></div>${st}</div>`;
  const gl=GL();
  return `<div class="bx"><h2>AKUN LAKE</h2>
   <div>Halo, <b>${esc(C.name||S.email)}</b> ${C.role==='admin'?'<span class="adm">[ADMIN]</span>':''}</div><small>${esc(S.email)}</small>
   <div><button class="g" data-act="up">SIMPAN KE CLOUD</button><button data-act="down">MUAT DARI CLOUD</button></div>
   ${C.role==='admin'?'<div><button class="r" data-act="admin">PANEL ADMIN</button></div>':''}
   <label>HADIAH TERAKHIR DARI ADMIN</label>${gl.length?gl.map(x=>`<div class="gl">${esc(x.s)}${x.n?` <small>"${esc(x.n)}"</small>`:''}</div>`).join(''):'<small>Belum ada.</small>'}
   <div><button class="x" data-act="logout">KELUAR</button><button class="x" data-act="close">TUTUP</button></div>${st}</div>`;
}
const KINDS=[['spawn','SPAWN IKAN (gigitan berikutnya)'],['fish','IKAN KE KOLEKSI'],['rod','JORAN'],['reel','REEL'],['bait','UMPAN'],['coins','KOIN'],['skinc','SKIN KARAKTER'],['skinb','SKIN PERAHU']];
function selOpts(kind){
  if(kind==='spawn'||kind==='fish')return FISH.map(f=>`<option value="${f.id}">${f.id} ${esc(f.name)} (${esc(CATN[f.cat])})</option>`).join('');
  if(kind==='rod'||kind==='reel'||kind==='bait')return ITEMS[kind].map((it,i)=>`<option value="${i}">${esc(it.n)}</option>`).join('');
  const l=(LAKE.skinList?LAKE.skinList():{c:[],b:[]})[kind==='skinb'?'b':'c'];return l.map(s=>`<option value="${esc(s.id)}">${esc(s.n)}</option>`).join('');}
function vAdmin(){
  return `<div class="bx"><h2>PANEL ADMIN</h2>
   <label>CARI PENGGUNA (nama / email)</label><input id="lk-q" value="${esc(C.q)}"><div><button data-act="search">CARI / MUAT</button></div>
   <div class="lst" id="lk-list"></div>
   <div style="margin-top:6px">Terpilih: <b id="lk-selname">${C.sel?esc(C.sel.username):'-'}</b></div>
   <label>JENIS HADIAH</label><select id="lk-kind">${KINDS.map(k=>`<option value="${k[0]}"${C.kind===k[0]?' selected':''}>${k[1]}</option>`).join('')}</select>
   <label>PILIHAN</label><select id="lk-sel"></select>
   <label id="lk-amtl">JUMLAH</label><input id="lk-amt" type="number" min="0" step="any" value="3">
   <label>CATATAN UNTUK PEMAIN (opsional)</label><input id="lk-note" maxlength="60">
   <div><button class="g" data-act="give">KIRIM KE TERPILIH</button><button class="r" data-act="giveall">KIRIM KE SEMUA</button></div>
   <label>RIWAYAT ADMIN</label><div class="lst small" id="lk-log"></div>
   <div><button class="x" data-act="back">KEMBALI</button><button class="x" data-act="close">TUTUP</button></div>
   <div class="st" id="lk-st">${esc(C.msg||'')}</div></div>`;
}
function fillList(){
  setHtml('lk-list',C.users.map(u=>`<div class="row${C.sel&&C.sel.id===u.id?' sel':''}" data-act="pick" data-id="${esc(u.id)}"><b>${esc(u.username)}</b> ${u.role==='admin'?'<span class="adm">[ADMIN]</span>':''}<br><small>${esc(u.email)} | koin ${esc(Math.round(Number(u.coins)||0))} | ikan ${esc(u.fish_count||0)}</small></div>`).join('')||'<div class="gl"><small>Tekan CARI / MUAT.</small></div>');
  setHtml('lk-selname',C.sel?esc(C.sel.username):'-');}
function fillLog(){setHtml('lk-log',C.log.map(l=>`<div class="gl"><small>${esc(String(l.created_at).slice(5,16).replace('T',' '))} ${esc(l.admin)}: ${esc(l.action)} &rarr; ${esc(l.target)}</small></div>`).join('')||'<div class="gl"><small>-</small></div>');}
function onKind(initial){
  const k=gv('lk-kind')||C.kind;C.kind=k;
  setHtml('lk-sel',selOpts(k));
  const a=document.getElementById('lk-amt'),l=document.getElementById('lk-amtl');if(!a||!l)return;
  const m={spawn:['JUMLAH SPAWN (1-50 gigitan berikutnya)',3,false],fish:['BERAT kg (0 = otomatis)',0,false],coins:['JUMLAH KOIN (1-1000000)',500,false]}[k];
  if(m){l.textContent=m[0];a.value=m[1];a.disabled=m[2];}else{l.textContent='(tidak perlu jumlah)';a.value=1;a.disabled=true;}
  if(initial){fillList();fillLog();}
}
async function act(a,el){
  if(netBusy&&a!=='close'&&a!=='pick'&&a!=='back')return;
  try{
    if(a==='close'){closeOv();return;}
    if(a==='pick'){C.sel=C.users.find(u=>u.id===el.dataset.id)||null;fillList();return;}
    if(a==='back'){view='acct';render();return;}
    netBusy=true;
    if(a==='login'||a==='signup'){
      const email=gv('lk-email').trim(),pw=gv('lk-pw');if(!email||pw.length<6){setStatus('Isi email dan sandi (min. 6 karakter)',true);return;}
      setStatus('Menghubungi server...');
      if(a==='login'){await doLogin(email,pw);C.msg='Berhasil masuk!';render();showToast('SELAMAT DATANG, '+(C.name||'PEMANCING').toUpperCase(),UI.gold);}
      else{const ok=await doSignup(email,pw,gv('lk-name').trim());if(ok){C.msg='Akun dibuat!';render();}else setStatus('Akun dibuat. Cek email untuk konfirmasi, lalu tekan MASUK.');}
    }else if(a==='logout'){doLogout();C.msg='Sudah keluar.';render();}
    else if(a==='up'){setStatus('Menyimpan...');await rpc('save_cloud',{p_data:JSON.parse(JSON.stringify(save))});C.lastSync=Date.now();setStatus('Tersimpan di cloud.');}
    else if(a==='down'){setStatus('Mengunduh...');const d=await rpc('load_cloud');
      if(!d||typeof d!=='object'||!Object.keys(d).length){setStatus('Belum ada data di cloud.',true);return;}
      if(!confirm('Timpa data di perangkat ini dengan data cloud?')){setStatus('');return;}
      Object.keys(save).forEach(k=>delete save[k]);Object.assign(save,d);writeSave();location.reload();}
    else if(a==='admin'){if(C.role!=='admin')return;view='admin';render();await search();}
    else if(a==='search')await search();
    else if(a==='give')await give(false);
    else if(a==='giveall')await give(true);
  }catch(e){setStatus(e.message||'Gagal',true);}
  finally{netBusy=false;}
}
async function search(){
  C.q=gv('lk-q').trim();setStatus('Memuat...');
  C.users=(await rpc('admin_list_users',{p_q:C.q,p_limit:40}))||[];
  try{C.log=(await rpc('admin_recent',{p_limit:12}))||[];}catch(e){}
  fillList();fillLog();setStatus(C.users.length+' pengguna');
}
async function give(all){
  const kind=gv('lk-kind'),sel=gv('lk-sel'),amt=+gv('lk-amt')||0,note=gv('lk-note').trim();
  let k,p;
  if(kind==='spawn'){if(!(amt>=1&&amt<=50)){setStatus('Jumlah spawn harus 1-50.',true);return;}k='spawn';p={id:+sel,n:Math.round(amt)};}
  else if(kind==='fish'){if(amt<0||amt>10000){setStatus('Berat 0 - 10000 kg.',true);return;}k='fish';p={id:+sel};if(amt>0)p.wt=amt;}
  else if(kind==='rod'||kind==='reel'||kind==='bait'){k='item';p={cat:kind,idx:+sel};}
  else if(kind==='coins'){if(!(amt>=1&&amt<=1000000)){setStatus('Jumlah koin harus 1 - 1.000.000.',true);return;}k='coins';p={n:Math.round(amt)};}
  else{k='skin';p={t:kind==='skinb'?'b':'c',id:sel};}
  if(all){if(!confirm('Kirim hadiah ini ke SEMUA pemain?'))return;
    const n=await rpc('admin_give_all',{p_kind:k,p_payload:p,p_note:note});setStatus('Terkirim ke '+n+' pemain.');}
  else{if(!C.sel){setStatus('Pilih pengguna dulu.',true);return;}
    await rpc('admin_give',{p_to:C.sel.id,p_kind:k,p_payload:p,p_note:note});setStatus('Terkirim ke '+C.sel.username+'.');}
  try{C.log=(await rpc('admin_recent',{p_limit:12}))||[];fillLog();}catch(e){}
}

/* ---------------- tombol akun di menu (slot ke-3 kanan atas) ---------------- */
function iconUser(x,y,on,adm){R(x+3,y,3,3,UI.ink);R(x+4,y+1,1,1,on?'#9fe3ff':UI.paper);R(x+1,y+4,7,4,UI.ink);R(x+2,y+5,5,2,on?'#6ac46a':UI.paper);if(adm)R(x+7,y-1,3,3,'#ffd35a');}
const _m6=drawMenu;
drawMenu=function(){_m6();const s2=15;
  button('macc',W-4-s2*3-6,4,s2,s2,(x,y)=>iconUser(x+3,y+3,!!S,C.role==='admin'),()=>{initAudio();openOv('acct');},'blue');};
window.addEventListener('keydown',e=>{if(e.code==='Escape'&&scene==='acct')closeOv();});
})();

'use strict';
(function(){
/* ============================================================================
   ADVENTURE MODE v2 (PRAHU)
   - Naik perahu dari dermaga (scene 'board'), lalu berlayar (scene 'sail')
   - 5 lokasi berbeda di sepanjang rute, tiap lokasi punya suasana & ikan sendiri
   - Ikan besar merusak perahu: menabrak lambung, menarik terlalu berat, tali putus
   - Bobot ikan diundi saat tersangkut dan SAMA dengan bobot saat berhasil ditangkap
   ============================================================================ */
const OL='#241418';

/* lokasi: d=jarak mulai (m), tint/ta=warna perairan, fog=kabut, rock=pengali batu karang,
   rw=hadiah koin kedatangan pertama, fish=[id ikan, bobot peluang] untuk titik misterius */
const LOC=[
 {d:0,  n:'PERAIRAN DERMAGA',tint:[0,0,0],     ta:0,   fog:0,   rock:1,   rw:0,  fish:[[4,24],[5,22],[6,12]]},
 {d:80, n:'TELUK KARANG',    tint:[30,190,185],ta:.22, fog:0,   rock:1.15,rw:30, fish:[[4,14],[5,16],[6,22],[7,14]]},
 {d:180,n:'PULAU KABUT',     tint:[175,185,205],ta:.30,fog:.55, rock:1,   rw:60, fish:[[6,16],[7,20],[8,12]]},
 {d:320,n:'KARANG PURBA',    tint:[115,55,145],ta:.28, fog:.12, rock:1.7, rw:100,fish:[[7,16],[8,24]]},
 {d:500,n:'LAUTAN DALAM',    tint:[10,25,80],  ta:.42, fog:0,   rock:1.3, rw:200,fish:[[8,22]]}];

/* jadwal animasi naik perahu (detik): tiba, jalan, lompat, menetap, berangkat */
const BD1=1.1, BD2=BD1+.6, BD3=BD2+.42, BD4=BD3+.28, BD5=BD4+1.1;
/* jadwal animasi sandar (pulang): perahu tiba, menyentuh dermaga, Clawd melompat ke dermaga, berjalan ke tempat mancing */
const DK1=1.0, DK2=DK1+.3, DK3=DK2+.42, DK4=DK3+.6, DK5=DK4+.25;

const X4={st:0,dist:0,t:0,spd:26,hp:100,en:100,water:0,leak:0,lkx:0,lkt:0,
  obs:[],pk:[],spot:null,nextSpot:60,prevJump:0,prevRush:0,prevState:'idle',
  py:0,ty:0,steer:0,sinkT:0,spawnT:0,endCd:0,
  loc:0,banT:0,banR:0,banL:'',fwt:0,heft:0,ramCd:0,strainT:0,strainS:0,hitT:0,rr:null,
  bdT:0,bdDX:0,hopped:false,landed:false,bdGo:false,bdStep:0,walkLegs:null,
  dkT:0,dkShow:false,dkGo:false,dkBump:false,dkDX:0,dkStep:0,tripFish:0,tripVal:0};
save.boat=save.boat||{hp:100};
if(!Array.isArray(save.boat.vis))save.boat.vis=[0];
if(typeof save.boat.far!=='number')save.boat.far=0;

function X4bx(){return Math.round(W*.3);}
function X4hz(){return Math.round(H*.36);}
function X4locAt(d){let i=0;for(let k=0;k<LOC.length;k++)if(d>=LOC[k].d)i=k;return i;}
/* "beban" ikan 0..1 dari bobot (kg), skala logaritmik: 1kg vs 60kg terasa jelas berbeda */
function X4heft(wt){return clamp(Math.log2(1+wt)/Math.log2(61),0,1);}
/* kerusakan = dasar x faktor bobot: ikan ringan ~35%, ikan raksasa ~200% dari dasar */
function X4dmg(base,h){return Math.max(1,Math.round(base*(.35+1.65*h)));}
function X4rare(){const q=save.spawnQ;if(q&&q.length&&FISH[q[0]])return q[0];const w=LOC[X4.loc].fish.slice().concat(window.LAKE?LAKE.seaFish(X4.loc):[]);if(nightF(dayP)>.5)w.push([9,24]);
  let t=0;for(const e of w)t+=e[1];let r=Math.random()*t;
  for(const e of w){r-=e[1];if(r<=0)return e[0];}return w[0][0];}
/* undi bobot dengan rumus yang SAMA PERSIS dengan finishCatch(); u disimpan agar bobot saat naik identik */
function X4rollWeight(id){const f=FISH[id],u=Math.random();X4.rr=u;
  const r=Math.pow(u,1.6-bait().luck*.25);return +(f.w[0]+(f.w[1]-f.w[0])*r).toFixed(2);}
function X4hit(dm,msg,col){X4.hp-=dm;X4.hitT=.3;
  floatTexts.push({x:X4bx(),y:Math.round(X4.py)-24,s:'-'+dm,c:col||UI.red,t:0,d:1.1});
  if(msg)showToast(msg,UI.red);}
function X4newLeak(){if(X4.leak)return;X4.leak=1;X4.lkt=0;X4.lkx=((Math.random()*20)|0)-8;
  showToast('PRAHU BOCOR! TAP LUBANG 5X',UI.red);sfx('snap');}

function X4start(){
  if(fadeTo)return;
  resetFish();holding=false;
  let hp=save.boat.hp||100;
  if(hp<100){const c=Math.round(100-hp);
    if(save.coins>=c){save.coins-=c;hp=100;setTimeout(()=>showToast('PRAHU DIPERBAIKI -'+c+' KOIN'),700);}
    else setTimeout(()=>showToast('KOIN KURANG! PRAHU HD '+Math.round(hp)+'%',UI.red),700);}
  save.boat.hp=hp;save.boat.trips=(save.boat.trips||0)+1;writeSave();
  Object.assign(X4,{st:0,dist:0,t:0,en:100,water:0,leak:0,lkt:0,obs:[],pk:[],spot:null,
    nextSpot:60+Math.random()*30,prevJump:0,prevRush:0,prevState:'idle',sinkT:0,spawnT:0,endCd:0,
    loc:0,banT:3.4,banR:0,banL:'BERANGKAT DARI',fwt:0,heft:0,ramCd:0,strainT:0,strainS:0,hitT:0,rr:null,
    bdT:0,bdDX:0,hopped:false,landed:false,bdGo:false,bdStep:0,walkLegs:null,
    dkT:0,dkShow:false,dkGo:false,dkBump:false,dkDX:0,dkStep:0,tripFish:0,tripVal:0});
  X4.hp=hp;
  X4.py=X4.ty=Math.round((X4hz()+H)/2);
  prevScene=(scene==='menu')?'menu':'play';
  go('board');
}
function X4end(){save.boat.hp=Math.max(5,Math.round(X4.hp));save.boat.far=Math.max(save.boat.far,Math.round(X4.dist));
  if(Math.round(X4.hp)<25)save.boat.close=1;
  writeSave();X4.st=0;X4.steer=0;X4.rr=null;X4.endCd=1;holding=false;resetFish();
  Object.assign(X4,{dkT:0,dkShow:false,dkGo:false,dkBump:false,dkDX:0,dkStep:0,walkLegs:null});
  go('dock');}
/* selesai sandar: kembali ke adegan asal + ringkasan pelayaran */
function X4dkFinish(){if(X4.dkGo)return;X4.dkGo=true;X4.dkShow=true;X4.dkDX=0;X4.walkLegs=null;go(prevScene||'play');
  showToast(X4.tripFish>0?('PELAYARAN: '+Math.round(X4.dist)+' M, '+X4.tripFish+' IKAN, +'+X4.tripVal+' KOIN'):('KEMBALI DENGAN SELAMAT! '+Math.round(X4.dist)+' M'),X4.tripFish>0?UI.gold:UI.paper);}
function X4arrive(i){
  X4.banT=3.4;X4.banR=0;X4.banL='TIBA DI';sfx('fanfare');
  if(!save.boat.vis.includes(i)){save.boat.vis.push(i);save.coins+=LOC[i].rw;X4.banR=LOC[i].rw;writeSave();}
}

/* update: adegan naik perahu */
function X4bdUpd(dt){
  X4.bdT+=dt;const t=X4.bdT;
  if(t<BD1){X4.bdDX=0;X4.walkLegs=null;}
  else if(t<BD2){const k=(t-BD1)/(BD2-BD1);X4.bdDX=Math.round(13*ease(k));
    X4.walkLegs=Math.sin(t*22)>0?[1,0,1,0]:[0,1,0,1];
    const s=Math.floor((t-BD1)*7);if(s!==X4.bdStep){X4.bdStep=s;tone(150,.04,'square',.035);}}
  else{X4.bdDX=13;X4.walkLegs=null;}
  if(!X4.hopped&&t>=BD2){X4.hopped=true;sfx('whoosh');}
  if(!X4.landed&&t>=BD3){X4.landed=true;sfx('plop');splash(dockEnd+14,dockY+10,8,undefined,35);addRipple(dockEnd+14,dockY+12,12,10);}
  if(!X4.bdGo&&t>=BD5-.28){X4.bdGo=true;go('sail');}
}

/* update: adegan sandar */
function X4dkUpd(dt){
  X4.dkT+=dt;const t=X4.dkT;
  if(!X4.dkBump&&t>=DK1){X4.dkBump=true;sfx('plopS');}
  if(!X4.dkShow&&t>=DK3){X4.dkShow=true;X4.dkDX=13;tone(150,.05,'square',.04);}
  if(X4.dkShow){
    if(t<DK4){const k=(t-DK3)/(DK4-DK3);X4.dkDX=Math.round(13*(1-ease(k)));
      X4.walkLegs=Math.sin(t*22)>0?[1,0,1,0]:[0,1,0,1];
      const s=Math.floor((t-DK3)*7);if(s!==X4.dkStep){X4.dkStep=s;tone(150,.04,'square',.035);}}
    else{X4.dkDX=0;X4.walkLegs=null;}}
  if(t>=DK5)X4dkFinish();
}

/* update: berlayar */
function X4upd(dt){
  X4.t+=dt;
  if(X4.hitT>0)X4.hitT-=dt;
  if(X4.banT>0)X4.banT-=dt;
  if(X4.ramCd>0)X4.ramCd-=dt;
  if(X4.strainT>0)X4.strainT-=dt;
  if(X4.endCd>0){X4.endCd-=dt;return;}
  if(X4.st===2){
    X4.sinkT+=dt;
    if(Math.random()<.4)splash(X4bx()+((Math.random()*32)|0)-16,X4.py+8,2,undefined,20);
    if(X4.sinkT>2.6){
      const d=Math.min(30,save.coins);save.coins-=d;save.boat.hp=40;save.boat.far=Math.max(save.boat.far,Math.round(X4.dist));writeSave();
      showToast('PRAHU TENGGELAM! -'+d+' KOIN',UI.red);
      X4.st=0;X4.hp=40;X4.water=0;X4.leak=0;X4.steer=0;X4.rr=null;X4.endCd=1;holding=false;resetFish();go(prevScene||'play');}
    return;}
  const fs=fish.state,fight=fs==='reel',busy=fight||fs==='landing'||fs==='caught';
  X4.hp=clamp(X4.hp,0,100);X4.en=clamp(X4.en,0,100);X4.water=clamp(X4.water,0,100);
  if(X4.en<=0){showToast('ENERGI HABIS! KEMBALI KE DERMAGA');X4end();return;}
  if(X4.hp<=0||X4.water>=100){X4.st=2;X4.sinkT=0;sfx('splash');shake(3);return;}
  X4.en-=dt*(fight?.9:busy?.3:1.5);
  X4.py+=(X4.ty-X4.py)*Math.min(1,dt*5);
  X4.py=clamp(X4.py,X4hz()+16,H-22);
  X4.spd=Math.min(48,24+X4.dist*.02);
  const sp=busy?0:X4.spd;                     /* saat melawan ikan perahu "berhenti": dunia tidak bergeser */
  if(!busy){
    X4.dist+=sp*dt*.06;
    const nl=X4locAt(X4.dist);if(nl>X4.loc){X4.loc=nl;X4arrive(nl);}
    X4.spawnT-=dt;
    if(X4.spawnT<=0){X4.spawnT=.7+Math.random()*.7;
      const y=X4hz()+14+Math.random()*Math.max(10,H-X4hz()-30);
      const pr=Math.min(.85,.5*LOC[X4.loc].rock),r=Math.random();
      if(r<pr)X4.obs.push({x:W+16,y});
      else{const q=(r-pr)/(1-pr);X4.pk.push({x:W+16,y,t:q<.5?'wood':(q<.8?'coin':'en')});}}
    if(!X4.spot&&X4.dist>X4.nextSpot)
      X4.spot={x:W+26,y:X4hz()+18+Math.random()*Math.max(8,H-X4hz()-36),ph:Math.random()*6};
  }
  const bx=X4bx(),by=X4.py;
  for(let i=X4.obs.length-1;i>=0;i--){const o=X4.obs[i];o.x-=sp*dt;
    if(o.x<-20){X4.obs.splice(i,1);continue;}
    if(Math.abs(o.x-bx)<13&&Math.abs(o.y-by)<9){
      X4.obs.splice(i,1);X4hit(12,'TABRAKAN! HD -12');shake(2.5);sfx('splash');splash(o.x,o.y,10,undefined,40);
      if(Math.random()<.45)X4newLeak();
      if(X4.hp<=0)return;}}
  for(let i=X4.pk.length-1;i>=0;i--){const p=X4.pk[i];p.x-=sp*dt;
    if(p.x<-14){X4.pk.splice(i,1);continue;}
    if(Math.abs(p.x-bx)<13&&Math.abs(p.y-by)<10){
      X4.pk.splice(i,1);sfx('coin');
      if(p.t==='wood'){X4.hp=clamp(X4.hp+8,0,100);X4.water=clamp(X4.water-20,0,100);showToast('KAYU TERAPUNG! +8 HD, AIR -20%');}
      else if(p.t==='coin'){save.coins+=15;writeSave();showToast('+15 KOIN',UI.gold);}
      else{X4.en=clamp(X4.en+30,0,100);showToast('DRUM ENERGI! +30');}}}
  if(X4.spot){X4.spot.x-=sp*dt;
    if(X4.spot.x<-30){X4.spot=null;X4.nextSpot=X4.dist+70+Math.random()*60;}
    else if(Math.abs(X4.spot.x-bx)<16&&Math.abs(X4.spot.y-by)<14){
      const id=X4rare();X4.spot=null;X4.nextSpot=X4.dist+80+Math.random()*60;
      fish.id=id;fish.bx=bx+46;fish.by=by;
      X4.fwt=X4rollWeight(id);X4.heft=X4heft(X4.fwt);
      hookFish();fish.stamMax*=1.15;fish.stam=fish.stamMax;
      X4.prevRush=0;X4.prevJump=0;X4.ramCd=1.2;X4.strainT=0;X4.strainS=0;
      showToast('IKAN LANGKA: '+FISH[id].name+'!',UI.gold);}}
  if(fight){fish.bx=bx+46;fish.by=clamp(by+2,X4hz()+10,H-10);
    const h=X4.heft;
    /* 1) ikan melompat lalu mendarat di dekat lambung */
    if(X4.prevJump>0&&fish.jumpT===0){const dm=X4dmg(3,h);X4hit(dm,'HEMBUSAN IKAN! HD -'+dm);shake(1+h*1.5);splash(bx+22,by-4,6,undefined,30);}
    /* 2) ikan besar menabrak lambung tepat saat memulai sentakan (rush) */
    if(X4.prevRush<=0&&fish.rush>0&&h>.22&&X4.ramCd<=0&&Math.random()<.10+.55*h){
      const dm=X4dmg(7,h);X4hit(dm,'IKAN BESAR MENABRAK! HD -'+dm);X4.ramCd=1.4;
      shake(1.5+2*h);sfx('snap');noise(.25,200,.35,'lowpass');splash(bx+20,by+2,8+((h*10)|0),undefined,45);addRipple(bx+20,by+6,12,12);
      if(h>.6&&Math.random()<.4)X4newLeak();}
    /* 3) beban berat: tegangan tali tinggi membuat lambung terus tertekan */
    if(h>.35&&fish.ten>.75){const k=(fish.ten-.75)/.25;X4.hp-=dt*h*k*1.8;X4.strainT=.25;X4.strainS-=dt;
      if(X4.strainS<=0){X4.strainS=.9;noise(.18,260,.14,'bandpass');}}
  }
  X4.prevJump=fight?fish.jumpT:0;X4.prevRush=fight?fish.rush:0;
  if(X4.leak){X4.water+=dt*3.4;
    if(Math.random()<dt*6)splash(bx+X4.lkx,by+6,1,'#bfe4ff',15);}
  /* 4) tali putus menyentak balik; ikan kabur biasa tidak merusak perahu */
  if(X4.prevState==='reel'&&fs==='lost'&&fish.msg==='SENAR PUTUS!'){const dm=X4dmg(12,X4.heft);X4hit(dm,'SENAR PUTUS! HD -'+dm);shake(2);}
  if(X4.prevState==='reel'&&fs!=='reel'&&fs!=='landing')X4.rr=null;
  X4.prevState=fs;
}

/* gambar: objek laut */
function X4rockDraw(o){const x=Math.round(o.x),y=Math.round(o.y+Math.sin(T*2+o.x*.1)*1.5);
  ctx.fillStyle=OL;ctx.fillRect(x-5,y-3,11,6);ctx.fillStyle='#6c6878';ctx.fillRect(x-4,y-2,9,4);
  ctx.fillStyle='#8e8a9a';ctx.fillRect(x-3,y-2,5,1);ctx.fillStyle='#4e4a5a';ctx.fillRect(x-2,y+1,6,1);}
function X4pkDraw(p){const x=Math.round(p.x),y=Math.round(p.y+Math.sin(T*3+p.x)*1.5);
  if(p.t==='wood'){ctx.fillStyle=OL;ctx.fillRect(x-4,y-2,9,4);ctx.fillStyle='#8a5a34';ctx.fillRect(x-3,y-1,7,2);ctx.fillStyle='#b07a48';ctx.fillRect(x-3,y-1,7,1);}
  else if(p.t==='coin'){circ(x,y,3,UI.ink);circ(x,y,2,UI.gold);ctx.fillStyle='#fff6b0';ctx.fillRect(x-1,y-1,1,1);}
  else{ctx.fillStyle=OL;ctx.fillRect(x-3,y-3,7,7);ctx.fillStyle='#c0403a';ctx.fillRect(x-2,y-2,5,5);ctx.fillStyle='#f3e2b8';ctx.fillRect(x-2,y,5,1);}}
function X4spotDraw(s){const x=Math.round(s.x),y=Math.round(s.y),pu=.5+.5*Math.sin(T*5+s.ph);
  ellipsePix(x,y,12,5,'#9fe3ff',.4+.5*pu);ellipsePix(x,y,8,3.5,'#eaf8ff',.3+.4*pu);
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.12+.1*pu;ctx.fillStyle='#9fe3ff';
  for(let j=0;j<26;j+=2)ctx.fillRect(x-1+Math.round(Math.sin(T+j)),y-26+j,2,1);
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  ctx.fillStyle='#fff';ctx.fillRect(x,y-2,1,2);}

/* gambar: perahu (ox/oy opsional untuk adegan berlabuh) */
function X4pose(){
  const st=fish.state,p={lookX:1,lean:Math.round(Math.sin(T*2.1)),sq:0,legs:[0,0,0,0],armL:[0,0],armR:[0,0]};
  if(X4.st===2){p.wide=true;return p;}
  if(scene==='dock'){p.happy=true;p.armR=[0,Math.sin(T*10)>0?-3:-2];return p;}
  if(st==='reel'){p.focus=true;p.lean=holding?-1:1;const tg=holding&&Math.sin(T*16)>0;
    p.legs=holding?(tg?[1,0,1,0]:[0,1,0,1]):[0,0,0,0];p.armR=[holding?-1:1,holding?-1:0];
    p.sweat=fish.ten>.72||X4.leak===1;p.sq=fish.rush>0?1:0;}
  else if(st==='landing'){p.wide=true;p.armL=[0,-3];p.armR=[0,-3];}
  else if(st==='caught'){p.happy=true;p.blush=true;p.armL=[1,-4];p.armR=[-1,-4];p.legs=Math.sin(T*8)>0?[1,0,0,1]:[0,1,1,0];}
  else if(st==='lost'||st==='miss'||st==='early'){p.sad=true;p.sq=1;}
  else if(X4.leak)p.sweat=true;
  return p;}
function X4boatDraw(ox,oy,withClawd,wake){
  const S=(window.LAKE&&LAKE.boatSkin)?LAKE.boatSkin():{hull:['#a06a3c','#8a5a34'],sail:['#f3e2b8','#e8d4a8'],cabin:'#3a2416'};
  const cx=ox!==undefined?Math.round(ox):X4bx();
  const rock=Math.round(Math.sin(T*2.1)*(1+rainI*2));
  const y=oy!==undefined?Math.round(oy):Math.round(X4.py)+(X4.st===2?Math.round(X4.sinkT*X4.sinkT*22):rock);
  if(wake!==false){ctx.fillStyle=css(mixc(WHITE,pal.deep,.3));ctx.globalAlpha=.5;
    for(let i=0;i<5;i++)ctx.fillRect(cx-22-i*4,y+6+((i+((T*6)|0))%2),3,1);
    ctx.globalAlpha=1;}
  const fl=Math.round(Math.sin(T*3));
  if(S.alpha)ctx.globalAlpha=S.alpha;
  ctx.fillStyle=OL;ctx.fillRect(cx-2,y-15,2,15);
  for(let j=0;j<9;j++){ctx.fillStyle=j%2?S.sail[0]:S.sail[1];ctx.fillRect(cx-11+j,y-14+j,9-j+fl,1);}
  ctx.fillStyle='rgba(0,0,20,.25)';ctx.fillRect(cx-17,y-5,35,1);
  ctx.fillStyle=OL;ctx.fillRect(cx-17,y,35,1);
  for(let i=0;i<8;i++){const w2=33-i*2;ctx.fillStyle=i%2?S.hull[1]:S.hull[0];ctx.fillRect(cx-16+i,y+1+i,w2,1);}
  ctx.fillStyle=OL;ctx.fillRect(cx-17,y+1,1,8);ctx.fillRect(cx+17,y+1,1,8);
  ctx.fillStyle=OL;ctx.fillRect(cx+17,y-2,3,3);ctx.fillStyle=S.hull[0];ctx.fillRect(cx+17,y-1,2,2);
  ctx.fillStyle=S.cabin;ctx.fillRect(cx-10,y+1,16,4);
  if(S.decor)S.decor(ctx,cx,y,T,fl);
  if(X4.water>0&&oy===undefined){const h2=Math.max(1,Math.round(X4.water/100*4));
    ctx.globalAlpha=.85;ctx.fillStyle='#3f86c2';ctx.fillRect(cx-10,y+5-h2,16,h2);ctx.globalAlpha=1;}
  if(X4.leak&&oy===undefined){const lx=cx+X4.lkx;
    ctx.fillStyle='#1a1024';ctx.fillRect(lx,y+3,3,2);
    ctx.fillStyle='#bfe4ff';ctx.fillRect(lx+1,y+1-((T*20)|0)%4,1,2);
    if(Math.sin(T*8)>0){ctx.fillStyle='#fff';ctx.fillRect(lx-2,y-3,1,1);ctx.fillRect(lx+4,y-4,1,1);}}
  if(S.alpha)ctx.globalAlpha=1;
  if(X4.hitT>0&&((T*30)|0)%2===0){ctx.globalAlpha=.55;ctx.fillStyle='#fff';ctx.fillRect(cx-17,y,35,9);ctx.globalAlpha=1;}
  if(withClawd!==false)drawClawd(ctx,cx+1,y-14+Math.round(clawdY),X4pose());
  if(nightF(dayP)>.3){if(!glowCv)buildGlow();
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=nightF(dayP);
    ctx.drawImage(glowCv,cx-26,y-40);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    ctx.fillStyle='#ffd27a';ctx.fillRect(cx-2,y-16,2,2);}
}

/* gambar: adegan naik perahu dari dermaga */
function X4bdDraw(){
  const t=X4.bdT,moor=dockEnd+14,deckY=dockY+6;
  let bx,wake=false;
  if(t<BD1){const k=clamp(t/BD1,0,1);bx=lerp(W+44,moor,1-(1-k)*(1-k));wake=k<.92;}
  else if(t<=BD4)bx=moor;
  else{const k=clamp((t-BD4)/(BD5-BD4),0,1);bx=moor+(W+70-moor)*k*k;wake=true;}
  let by=deckY+Math.round(Math.sin(T*2.1+1));
  if(t>=BD3&&t<BD3+.4)by+=Math.round(Math.sin((t-BD3)/.4*Math.PI)*2);
  X4boatDraw(bx,by,t>=BD3,wake);
  if(t>=BD2&&t<BD3){const k=(t-BD2)/(BD3-BD2);
    const x0=dockEnd-14,y0=dockY-10,x1=bx+1,y1=by-14;
    drawClawd(ctx,lerp(x0,x1,k),lerp(y0,y1,k)-Math.sin(k*Math.PI)*9,{lookX:1,sq:k<.15?1:0,armL:[0,-3],armR:[0,-3],legs:[1,1,1,1]});}
  if(t>=BD3&&t<BD5-.1){const a=clamp(Math.min((t-BD3)*4,(BD5-.1-t)*4),0,1);
    ctx.globalAlpha=a;txt('BERANGKAT!',W/2,Math.round(H*.2),UI.gold,2,1);ctx.globalAlpha=1;}
}

/* gambar: adegan sandar di dermaga */
function X4dkDraw(){
  const t=X4.dkT,moor=dockEnd+14,deckY=dockY+6;
  let bx,wake=false;
  if(t<DK1){const k=clamp(t/DK1,0,1);bx=lerp(W+44,moor,1-(1-k)*(1-k));wake=k<.92;}
  else if(t<DK3)bx=moor;
  else{const k=clamp((t-DK3)/1.0,0,1);bx=moor+(W+70-moor)*k*k;wake=true;}
  let by=deckY+Math.round(Math.sin(T*2.1+1));
  if(t>=DK1&&t<DK1+.35)by+=Math.round(Math.sin((t-DK1)/.35*Math.PI)*2);
  X4boatDraw(bx,by,t<DK2,wake);
  if(t>=DK2&&t<DK3){const k=(t-DK2)/(DK3-DK2);
    const x0=bx+1,y0=by-14,x1=dockEnd-14,y1=dockY-10;
    drawClawd(ctx,lerp(x0,x1,k),lerp(y0,y1,k)-Math.sin(k*Math.PI)*9,{lookX:-1,sq:k>.85?1:0,happy:true,armL:[0,-3],armR:[0,-3],legs:[1,1,1,1]});}
  if(t>=DK1&&t<DK3+.3){const a=clamp(Math.min((t-DK1)*4,(DK3+.3-t)*4),0,1);
    ctx.globalAlpha=a;txt('SAMPAI!',W/2,Math.round(H*.2),UI.gold,2,1);ctx.globalAlpha=1;}
}

/* gambar: horizon & suasana tiap lokasi */
function X4env(){
  const i=X4.loc,L=LOC[i],pv=LOC[Math.max(0,i-1)];
  const f=i===0?1:clamp((X4.dist-L.d)/30,0,1);
  return{f,i,tint:mixc(pv.tint,L.tint,f),ta:lerp(pv.ta,L.ta,f),fog:lerp(pv.fog,L.fog,f)};}
function X4px(k,sp,m){return((((k*97+20)-X4.dist*sp)%(W+m))+(W+m))%(W+m)-m/2;}
function X4feat(i,al,hz){
  if(al<=.02||i===0)return;
  ctx.globalAlpha=al;
  if(i===1){
    for(let k=0;k<3;k++){const px=X4px(k,.55,90),w2=18+((k*7)%10);
      ctx.fillStyle='#d8c08a';ctx.fillRect((px-w2/2)|0,hz-3,w2,3);
      ctx.fillStyle='#4f8a3e';ctx.fillRect((px-w2/2+2)|0,hz-5,w2-4,2);
      const tx=px|0;ctx.fillStyle='#5a3620';ctx.fillRect(tx,hz-11,1,8);
      ctx.fillStyle='#3f8a3e';ctx.fillRect(tx-3,hz-12,7,1);ctx.fillRect(tx-2,hz-13,5,1);ctx.fillRect(tx-4,hz-11,2,1);ctx.fillRect(tx+3,hz-11,2,1);}
  }else if(i===2){
    ctx.fillStyle=css(mixc(pal.mtF,[200,205,215],.5));
    for(let k=0;k<4;k++){const px=X4px(k,.45,120),w2=26+((k*11)%16),h2=5+((k*5)%6);
      for(let j=0;j<h2;j++){const ww=Math.max(2,(w2-j*(w2/h2)*.9)|0);ctx.fillRect((px-ww/2)|0,hz-1-j,ww,1);}}
  }else if(i===3){
    ctx.fillStyle=css(mixc(pal.mtN,[40,25,60],.55));
    for(let k=0;k<6;k++){const px=X4px(k,.6,100),h2=8+((k*13)%14);
      for(let j=0;j<h2;j++){const ww=Math.max(1,5-((j*5/h2)|0)+((k+j)%2));ctx.fillRect((px-ww/2)|0,hz-1-j,ww,1);}}
  }else if(i===4){
    for(let b=0;b<3;b++){ctx.globalAlpha=al*(.10+.05*Math.sin(T*.6+b));
      ctx.fillStyle=b%2?'#7ff2c0':'#a08bff';const yy=hz*(.12+b*.14)+Math.sin(T*.4+b)*3;
      for(let x=0;x<W;x+=2)ctx.fillRect(x,(yy+Math.sin(x*.05+T*.8+b)*4)|0,2,3);}
  }
  ctx.globalAlpha=1;
}

/* gambar: dunia berlayar */
function X4world(){
  const hz=X4hz(),wf=nightF(dayP),e=X4env();
  for(let y=0;y<hz;y++){const t=y/hz;
    ctx.fillStyle=css(mixc(mixc(pal.top,pal.mid,Math.min(1,t*1.6)),pal.bot,Math.max(0,t-.5)*1.6));
    ctx.fillRect(0,y,W,1);}
  if(pal.star>.1){ctx.fillStyle='#dfe6ff';
    for(let i=0;i<24;i++){const sx=(hash(i,3)*W)|0,sy=(hash(i,9)*hz*.8)|0;
      if(Math.sin(T*2+i)>0)continue;ctx.globalAlpha=pal.star*.7;ctx.fillRect(sx,sy,1,1);}ctx.globalAlpha=1;}
  const sa=(dayP-.215)/.59;
  if(sa>0&&sa<1)circ(W*(.1+.8*sa),hz+4-Math.sin(Math.PI*sa)*hz*.8,4,css(pal.sun));
  else{const ma=(((dayP-.765)%1)+1)%1/.5;if(ma<=1)circ(W*(.12+.76*ma),hz+4-Math.sin(Math.PI*ma)*hz*.75,3,'#e9ecf7');}
  for(let k=0;k<4;k++){const px=(((k*97-X4.dist*.35)%(W+80))+(W+80))%(W+80)-40,ph2=10+((k*13)%12);
    ctx.fillStyle=css(pal.mtF);
    for(let j=0;j<ph2;j++)ctx.fillRect(px-j,hz-1-j,2+j*2,1);
    ctx.fillStyle=css(pal.mtN);ctx.fillRect(px-4,hz-1,9,1);}
  if(e.i>0)X4feat(e.i-1,1-e.f,hz);X4feat(e.i,e.f,hz);
  for(let y=hz;y<H;y++){const t=(y-hz)/Math.max(1,H-hz);
    ctx.fillStyle=css(mixc(pal.wat,pal.deep,Math.pow(t,.8)));ctx.fillRect(0,y,W,1);}
  ctx.fillStyle=css(mixc(mixc(pal.bot,WHITE,.4),pal.top,wf*.5));
  for(let i=0;i<26;i++){const wy=hz+4+hash(i,5)*(H-hz-8);
    const wx=(((hash(i,7)*200-X4.dist*2+T*8)%(W+12))+(W+12))%(W+12)-6;
    ctx.globalAlpha=.25;ctx.fillRect(wx|0,wy|0,3+((hash(i,2)*4)|0),1);}
  ctx.globalAlpha=1;
  if(rainI>.3){ctx.fillStyle='#dfe9ff';
    for(let i=0;i<30;i++){const rx=(hash(i,11)*W)|0,ry=(hash(i,13)*H+T*300)%H;
      ctx.globalAlpha=.5*rainI;ctx.fillRect(rx,ry,1,3);}ctx.globalAlpha=1;}
  if(pal.tA>.02){ctx.globalAlpha=pal.tA;ctx.fillStyle=css(pal.tint);ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
  if(e.ta>.01){ctx.globalAlpha=e.ta;ctx.fillStyle=css(e.tint);ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
  if(wf>.05){ctx.globalAlpha=wf*.22;ctx.fillStyle='#04060f';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
  if(e.fog>.02){ctx.fillStyle='#dfe6ee';
    for(let b=0;b<8;b++){const yy=(hz-6+b*((H-hz)/10))|0;ctx.globalAlpha=e.fog*.16*(1-b/9);ctx.fillRect(0,yy,W,6+b);}
    ctx.globalAlpha=e.fog*.2;for(let i=0;i<8;i++){const fx=(((hash(i,21)*W*2-T*6-X4.dist)%(W+60))+(W+60))%(W+60)-30;ctx.fillRect(fx|0,(hz+8+hash(i,22)*(H-hz-20))|0,34,2);}
    ctx.globalAlpha=1;}
  for(const p of X4.pk)X4pkDraw(p);
  for(const o of X4.obs)X4rockDraw(o);
  if(X4.spot)X4spotDraw(X4.spot);
  X4boatDraw();
  /* ikan yang melawan + joran & senar: memakai gambar yang sama dengan di dermaga */
  const fs=fish.state,hy=horizonY;horizonY=hz;
  try{
    if(fs==='reel'||fs==='landing')drawUnderFish(ctx);
    if(fs==='reel'||fs==='landing'||fs==='caught')drawRodAndLine(ctx);
    if(fs==='caught'&&fish.res){const spr=FSPR[fish.res.id],cx=X4bx()+9,top=Math.round(X4.py)-14+Math.round(clawdY),bob=Math.round(Math.sin(T*6));
      drawFish(ctx,fish.res.id,cx-spr.width/2,top-spr.height-2+bob,1,-1,T*3,2,false,1);
      if(Math.sin(T*5)>.3){ctx.fillStyle='#fff8c0';const sx=cx+spr.width/2-2,sy=top-spr.height-3;ctx.fillRect(sx,sy-1,1,3);ctx.fillRect(sx-1,sy,3,1);}}
    drawRipples();
  }finally{horizonY=hy;}
  drawParts(ctx);
  for(const f of floatTexts){const k=f.t/f.d;ctx.globalAlpha=Math.max(0,1-k*k);txt(f.s,f.x,f.y-k*14,f.c||UI.red,1,1);ctx.globalAlpha=1;}
  if(X4.st===2){ctx.globalAlpha=.7;ctx.fillStyle='#cfe8ff';
    for(let i=0;i<10;i++)ctx.fillRect(X4bx()-14+((hash(i,(T*10)|0)*30)|0),X4.py-((hash(i+3,(T*8)|0)*20)|0),2,2);
    ctx.globalAlpha=1;}
}

/* gambar: HUD berlayar */
function X4toast(){if(!toast)return;const a=Math.min(1,(1.8-toast.t)*4);if(a<=0)return;
  ctx.globalAlpha=a;const w=tw(toast.s)+14,x=(W-w)/2|0,y=Math.round(H*.12);panel(x,y,w,13,'dark');txt(toast.s,W/2,y+4,toast.c,1,1);ctx.globalAlpha=1;}
function X4hud(){
  panel(4,4,66,40,'dark');
  txt('HD',8,8,UI.paper);bar(24,7,40,6,X4.hp/100,X4.hp>30?'#6ac46a':UI.red);
  txt('EN',8,18,UI.paper);bar(24,17,40,6,X4.en/100,UI.blue);
  txt('AIR',8,28,UI.paper);bar(24,27,40,6,X4.water/100,'#5ad0e0');
  const ln=LOC[X4.loc].n;panel(4,62,tw(ln)+10,12,'dark');txt(ln,9,65,'#9fe3ff');
  txt(Math.round(X4.dist)+' M',W-6,10,UI.paper,1,2);
  if(X4.spot)txt('TITIK MISTERIUS '+Math.max(0,Math.round((X4.spot.x-X4bx())/8))+' M',W-6,20,'#9fe3ff',1,2);
  button('x4ret',W-40,30,34,12,'PULANG',()=>{showToast('KEMBALI KE DERMAGA');X4end();},'red');
  const fs=fish.state;
  if(fs==='reel'||fs==='landing'||fs==='caught'){
    const f=FISH[fish.id],s=f.name+' '+X4.fwt.toFixed(1)+' KG';
    panel(4,77,Math.min(W-8,tw(s)+10),12,'dark');txt(s,9,80,UI.gold);
    txt('BEBAN',8,93,UI.paper);bar(34,92,40,6,X4.heft,X4.heft>.65?UI.red:X4.heft>.35?'#ffb040':UI.green);}
  if(X4.strainT>0&&Math.sin(T*14)>0)txt('LAMBUNG BERDERIT!',W/2,Math.round(H*.28),UI.red,1,1);
  if(fs==='idle'||fs==='lost'||fs==='miss'||fs==='early'){
    const w=Math.min(W-16,150),x=(W-w)/2|0,y=H-22,mx=LOC[LOC.length-1].d+70;
    R(x,y,w,5,UI.ink);R(x+1,y+1,w-2,3,'#2a2240');
    const fx=Math.round((w-2)*clamp(X4.dist/mx,0,1));R(x+1,y+1,fx,3,UI.blue);
    for(let i=1;i<LOC.length;i++){const tx=x+1+Math.round((w-2)*LOC[i].d/mx);R(tx,y-2,1,9,i<=X4.loc?UI.gold:UI.paper);}
    R(x+fx,y-4,3,2,UI.paper);R(x+fx+1,y-5,1,1,UI.paper);
    const nx=LOC[X4.loc+1];
    if(X4.leak)txt('PRAHU BOCOR! TAP LUBANG 5X!',W/2,H-10,Math.sin(T*10)>0?UI.red:UI.paper,1,1);
    else if(X4.t<8)txt('SERET LAYAR UNTUK MENGEMUDI',W/2,H-10,UI.paper,1,1);
    else txt(nx?('TUJUAN: '+nx.n+' '+Math.max(0,Math.round(nx.d-X4.dist))+' M'):'KAMU DI PERAIRAN TERJAUH!',W/2,H-10,UI.paper,1,1);}
  if(fs==='reel')drawReelHUD();
  if(fs==='caught'&&fish.res)drawCatchCard();
  if(fs==='lost'||fs==='miss')txt(fish.msg,W/2,H*.3,UI.red,2,1);
  if(X4.banT>0){const L=LOC[X4.loc],a=clamp(Math.min(X4.banT,3.4-X4.banT)*3,0,1);ctx.globalAlpha=a;
    const big=tw(L.n)*2+8<=W-12,w=Math.min(W-12,Math.max((big?tw(L.n)*2:tw(L.n))+16,90)),x=(W-w)/2|0,y=Math.round(H*.3),hh=30+(X4.banR?9:0);
    panel(x,y,w,hh,'wood');
    txt(X4.banL,W/2,y+7,UI.wood,1,1,UI.cream);
    txt(L.n,W/2,y+17,UI.ink,big?2:1,1,UI.cream);
    if(X4.banR)txt('+'+X4.banR+' KOIN PERTAMA KALI',W/2,y+hh-9,'#b0781a',1,1,UI.cream);
    ctx.globalAlpha=1;}
  if(X4.st===2){ctx.globalAlpha=Math.min(1,X4.sinkT);txt('PRAHU TENGGELAM!',W/2,H*.4,UI.red,2,1);ctx.globalAlpha=1;}
}
function X4draw(){
  const sh=shakeA>0?[Math.round((Math.random()-.5)*shakeA),Math.round((Math.random()-.5)*shakeA)]:[0,0];
  ctx.save();ctx.translate(sh[0],sh[1]);X4world();ctx.restore();
  X4hud();X4toast();drawFade();
}

/* WRAPPER: menyambung ke rantai v1.3 -> v1.2 -> v1.1 -> kode asli */
const _u4=updateEnv;
updateEnv=function(dt){_u4(dt);if(scene==='sail')X4upd(dt);else if(scene==='board')X4bdUpd(dt);else if(scene==='dock')X4dkUpd(dt);};

/* saat berlayar dunia dermaga tidak terlihat: lewati gambarnya (hemat CPU/baterai) */
const _d4=drawScene;
drawScene=function(){if(scene==='sail')return;_d4();if(scene==='board')X4bdDraw();else if(scene==='dock')X4dkDraw();};

const _f4=frame;
frame=function(now){_f4(now);if(scene==='sail')X4draw();};

/* selama berlayar: "dermaga" ikan = sisi perahu, "tangan" = tangan Clawd di perahu */
const _we4=waterEntry;
waterEntry=function(){return scene==='sail'?{x:X4bx()+18,y:Math.round(X4.py)+6}:_we4();};
const _hp4=handPos;
handPos=function(){return scene==='sail'?{x:X4bx()+19,y:Math.round(X4.py)-9+Math.round(clawdY)}:_hp4();};
const _uf4=updateFishing;
updateFishing=function(dt){
  if(scene==='sail'){const hy=horizonY;horizonY=X4hz();try{_uf4(dt);}finally{horizonY=hy;}}
  else _uf4(dt);};

/* adegan naik perahu: Clawd berjalan di dermaga (offset), disembunyikan saat melompat ke perahu */
const _cx4=charX;
charX=function(){return scene==='board'?(X4.hopped?-999:_cx4()+X4.bdDX):scene==='dock'?(X4.dkShow?_cx4()+X4.dkDX:-999):_cx4();};
const _cp4=clawdPose;
clawdPose=function(){const p=_cp4();
  if(scene==='board'){p.lookX=1;p.lean=0;p.sq=0;p.blink=false;
    if(X4.walkLegs)p.legs=X4.walkLegs;
    if(X4.bdT>.3&&X4.bdT<BD1)p.armR=[0,Math.sin(T*12)>0?-3:-2];}
  else if(scene==='dock'){p.lean=0;p.sq=0;p.blink=false;
    if(X4.dkShow&&X4.dkT<DK4){p.lookX=-1;if(X4.walkLegs)p.legs=X4.walkLegs;}}
  return p;};

/* bobot yang diumumkan saat ikan tersangkut = bobot di kartu tangkapan */
const _fc4=finishCatch;
finishCatch=function(){
  if(scene==='sail'&&X4.rr!==null){
    const R0=Math.random,u=X4.rr;let first=true;
    Math.random=function(){if(first){first=false;return u;}return R0();};
    try{_fc4();}finally{Math.random=R0;}
    X4.rr=null;
  }else _fc4();
  if(scene==='sail'&&fish.res){X4.tripFish++;X4.tripVal+=fish.res.price;
    save.boat.fishN=(save.boat.fishN||0)+1;if(fish.res.wt>=20)save.boat.big=(save.boat.big||0)+1;writeSave();}
};

/* tombol BERLAYAR di HUD mancing: pilih lempar kail ATAU naik perahu */
function X4iconBoat(x,y){R(x+5,y,1,6,UI.ink);R(x+1,y+1,4,4,UI.paper);R(x+2,y+2,2,2,'#f3e2b8');
  R(x,y+6,11,1,UI.ink);R(x+1,y+7,9,2,'#a06a3c');R(x+1,y+7,9,1,'#c8885a');}
const _h4=drawHUD;
drawHUD=function(){
  _h4();
  if(scene!=='play'||fish.state!=='idle'||fadeTo)return;
  if(toast&&toast.s==='MEMOTRET...')return;
  const bw=84,bh=15,hh=(tw('TAHAN LALU LEPAS UNTUK MELEMPAR')<W-24?1:2)*7+6;
  button('xsail',((W-bw)/2)|0,H-10-hh-5-bh,bw,bh,(x,y)=>{X4iconBoat(x+5,y+3);txt('BERLAYAR',x+21,y+5,UI.paper,1,0,'#22508a');},()=>{initAudio();X4start();},'blue');
};

const _m4=drawMenu;
drawMenu=function(){
  _m4();
  const bh=18,bw=Math.min(96,W-60),bx=(W-bw)/2|0;
  const sc=Math.max(3,Math.min(8,Math.floor((W-24)/23),Math.floor(H*.2/7)));
  const tbot=Math.round(H*.12)+7*sc+4;
  let by=Math.round(Math.max(tbot+18,H*.42));
  if(by+bh*2+10>dockY-18)by=Math.max(tbot+14,dockY-18-bh*2-10);
  let y4=by+2*(bh+6);
  if(y4+bh>dockY-14)y4=dockY-14-bh;
  if(y4>by+bh+4)button('adv',bx,y4,bw,bh,'ADVENTURE',()=>{initAudio();X4start();},'blue');
  const hp=Math.round(save.boat?save.boat.hp:100);
  txt('KONDISI PRAHU: '+hp+'%',4,H-38,hp<50?UI.red:UI.paper);
};

/* input */
window.addEventListener('pointerdown',e=>{
  if(scene==='dock'){X4dkFinish();return;}
  if(scene==='board'){
    if(!X4.bdGo){X4.bdGo=true;X4.hopped=true;X4.bdT=Math.max(X4.bdT,BD5);go('sail');}
    return;}
  if(scene!=='sail')return;
  const p=toGame(e);
  if(hitBtn(p))return;
  if(fish.state==='caught'&&fish.catchT>.7){resetFish();showToast('LANJUT BERPETUALANG!');return;}
  const bx=X4bx(),by=X4.py;
  if(X4.leak&&Math.abs(p.x-(bx+X4.lkx))<11&&Math.abs(p.y-(by+4))<12){
    X4.lkt++;sfx('plopS');splash(bx+X4.lkx,by+4,3,'#bfe4ff',20);
    if(X4.lkt>=5){X4.leak=0;X4.water=Math.max(0,X4.water-15);showToast('KEBOCORAN DITAMBAL!',UI.gold);}
    return;}
  if(fish.state==='reel'){holding=true;return;}
  X4.steer=1;X4.ty=p.y;
},true);
window.addEventListener('pointermove',e=>{if(scene==='sail'&&X4.steer)X4.ty=toGame(e).y;});
window.addEventListener('pointerup',()=>{if(scene==='sail'){X4.steer=0;holding=false;}});
window.addEventListener('pointercancel',()=>{if(scene==='sail'){X4.steer=0;holding=false;}});
window.addEventListener('keydown',e=>{
  if(scene!=='sail')return;
  if(e.code==='ArrowUp'||e.code==='KeyW')X4.ty=clamp(X4.ty-14,X4hz()+16,H-22);
  if(e.code==='ArrowDown'||e.code==='KeyS')X4.ty=clamp(X4.ty+14,X4hz()+16,H-22);
  if(e.code==='Escape')X4end();
});
if(window.LAKE)LAKE.drawBoat=(cx,y,clawd)=>X4boatDraw(cx,y,clawd,false);
})();
'use strict';
(function(){
/* ============================================================================
   v1.7  UPDATE BESAR  -  TEMPEL DI PALING BAWAH script.js (setelah blok Adventure).
   Kode lama TIDAK diubah; semua dikaitkan lewat pembungkus (wrapper) seperti v1.1-v1.6.
   1 tata letak HP | 2 sinkron cloud-first (data admin tidak hilang) | 3 ikan langka baru + notif
   4 sirip hiu | 5 gerbang login / offline | 6 peringkat & profil & follow & centang biru
   7 skin khusus admin | 8 nama admin di notif | 9 joran/pelampung/kail/senar + efek | 10 skin rahasia
   ============================================================================ */
window.LAKE=window.LAKE||{};
const CFG=window.LAKE_CONFIG||{},URLB=String(CFG.url||'').replace(/\/+$/,''),KEY=String(CFG.key||''),ON=!!(URLB&&KEY);
const SKEY='lake_sb_session',_fetch=window.fetch.bind(window);
const sess=()=>{try{return JSON.parse(localStorage.getItem(SKEY)||'null')}catch(e){return null}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const fit=(s,mw)=>{s=String(s==null?'':s).toUpperCase();while(s.length>1&&tw(s)>mw)s=s.slice(0,-1);return s};
const isAdm=()=>LAKE.role==='admin';
const cN=c=>Object.keys(save.book).filter(k=>FISH[k]&&FISH[k].cat===c).length;
const xIcon=(a,b)=>{for(let i=0;i<5;i++){R(a+4+i,b+4+i,1,1,UI.paper);R(a+8-i,b+4+i,1,1,UI.paper)}};
let PF=0,OFFL=false;

/* ---------- struktur save aman (dipakai juga saat memuat data cloud) ---------- */
function fixSave(){
  save.ach=save.ach||{};save.book=save.book||{};save.coins=+save.coins||0;save.total=+save.total||0;save.playT=save.playT||0;save.best=save.best||0;
  const k=save.skin=save.skin||{};k.c=k.c||'klasik';k.b=k.b||'kayu';k.own=k.own||{};k.own.c=k.own.c||{};k.own.b=k.own.b||{};k.own.c.klasik=1;k.own.b.kayu=1;
  save.boat=save.boat||{hp:100};if(!Array.isArray(save.boat.vis))save.boat.vis=[0];if(typeof save.boat.far!=='number')save.boat.far=0;
  save.own=save.own||{};for(const t of['rod','reel','bait']){save.own[t]=save.own[t]||[0];if(!save.own[t].includes(0))save.own[t].unshift(0)}
  save.eq=Object.assign({rod:0,reel:0,bait:0},save.eq);
  const g=save.gear=save.gear||{};g.own=g.own||{};for(const t of['rod','fl','hk','ln'])g.own[t]=g.own[t]||{};
  g.eq=Object.assign({rod:null,fl:null,hk:null,ln:null},g.eq);if(g.base===undefined)g.base=save.eq.rod;
}
fixSave();
const G=()=>save.gear;

/* ============================================================================
   1. TATA LETAK HP: tombol kanan jadi satu kolom (tidak bertabrakan lagi)
   ============================================================================ */
const RP={snd:0,book:1,home:2,xach:3,xtank:4,xskin:5,xrank:6,xgear:7};
const _btn=button;
button=function(id,x,y,w,h,l,f,s){
  if(scene==='play'&&RP[id]!==undefined){x=W-19;y=4+RP[id]*18}
  return _btn(id,x,y,w,h,l,f,s)};
const _txt=txt;
txt=function(s,x,y,col,sc,al,sh){
  if(scene==='play'&&al===2&&y===23&&String(s).indexOf('COMBO X')===0)x=W-23;
  return _txt(s,x,y,col,sc,al,sh)};

/* ============================================================================
   2. SKIN EKSTRA (khusus admin 'adm_' + rahasia)  - dipakai panel GEAR tab SKIN
   ============================================================================ */
const XS=[
{id:'adm_royal',n:'RAJA ADMIN',d:'KHUSUS ADMIN. MAHKOTA EMAS DAN JUBAH KERAJAAN.',base:'#e0a820',eye:'#2a6aff',adm:1,aur:'crown',
 acc:P=>{P(3,-4,10,3,'#ffd35a');P(3,-6,2,2,'#ffd35a');P(7,-7,2,3,'#ffd35a');P(11,-6,2,2,'#ffd35a');P(7,-5,2,1,'#e0302a');P(4,-3,1,1,'#3a8ae0');P(11,-3,1,1,'#3a8ae0');P(3,-2,10,1,'#c8962a');P(-2,3,2,7,'#a01830');P(16,3,2,7,'#a01830')}},
{id:'adm_halo',n:'MALAIKAT ADMIN',d:'KHUSUS ADMIN. HALO BERSINAR DAN SAYAP SURGAWI.',base:'#e8f0ff',eye:'#3a7aff',adm:1,aur:'halo',
 acc:P=>{P(5,-7,6,1,'#fff6b0');P(4,-6,1,2,'#fff6b0');P(11,-6,1,2,'#fff6b0');P(5,-4,6,1,'#ffd35a');P(-4,2,4,5,'#ffffff');P(16,2,4,5,'#ffffff');P(-5,3,1,3,'#dfe8ff');P(20,3,1,3,'#dfe8ff')}},
{id:'iblis',n:'IBLIS',sec:1,d:'TANDUK TULANG DAN API NERAKA. PENAKLUK 150 IKAN.',hint:'API NERAKA MEMANGGIL PEMANCING YANG TEKUN.',base:'#b01818',eye:'#ffe45a',aur:'fire',
 cond:()=>save.total>=150,acc:P=>{P(2,-1,2,1,'#e8d8b0');P(1,-3,2,2,'#e8d8b0');P(1,-4,1,1,'#ffffff');P(12,-1,2,1,'#e8d8b0');P(13,-3,2,2,'#e8d8b0');P(14,-4,1,1,'#ffffff');P(3,1,3,1,'#2a0000');P(10,1,3,1,'#2a0000')}},
{id:'arwah',n:'RAJA ARWAH',sec:1,d:'TENGKORAK ARWAH DAN JIWA MELAYANG. TUNDUKKAN 4 IKAN MISTERI.',hint:'ARWAH PENASARAN MENGIKUTI PEMBURU MISTERI.',base:'#9ab0c8',eye:'#7affd0',alpha:.82,aur:'soul',
 cond:()=>cN('misteri')>=4,acc:P=>{P(5,-6,6,5,'#e8ecf0');P(6,-5,1,2,'#0a1018');P(9,-5,1,2,'#0a1018');P(7,-3,2,1,'#0a1018');P(4,-1,8,1,'#7affd0')}},
{id:'petir',n:'DEWA PETIR',sec:1,d:'RAMBUT PETIR DAN SETRUM LIAR. KOLEKSI 25 JENIS IKAN.',hint:'KOLEKTOR SEJATI DIPILIH OLEH PETIR.',base:'#3050c0',eye:'#fff060',aur:'bolt',
 cond:()=>Object.keys(save.book).length>=25,acc:P=>{P(3,-2,1,2,'#ffe45a');P(5,-4,1,4,'#ffe45a');P(8,-3,1,3,'#ffe45a');P(10,-5,1,5,'#ffe45a');P(12,-2,1,2,'#ffe45a')}},
{id:'vampir',n:'VAMPIR',sec:1,d:'JUBAH DARAH DAN TARING TAJAM. KOMBO 8 BERUNTUN.',hint:'RAIH KOMBO BESAR TANPA MELESET.',base:'#6a0f22',eye:'#ff2a3a',aur:'blood',
 cond:()=>(save.best||0)>=8,acc:P=>{P(-3,2,3,8,'#2a0610');P(16,2,3,8,'#2a0610');P(-3,2,3,1,'#a01830');P(16,2,3,1,'#a01830');P(5,5,1,2,'#ffffff');P(10,5,1,2,'#ffffff')}},
{id:'reaper',n:'GRIM REAPER',sec:1,d:'JUBAH HITAM, SABIT, DAN KABUT KEMATIAN. CAPAI LEVEL 9.',hint:'HANYA NELAYAN LEVEL TINGGI YANG DIKUNJUNGI.',base:'#1c1c28',eye:'#ff3a3a',aur:'reap',
 cond:()=>(save.xp||0)>=1550,acc:P=>{P(2,-5,12,1,'#0c0c14');P(1,-4,14,2,'#0c0c14');P(0,-2,16,1,'#0c0c14');P(18,-8,1,17,'#6a4a2a');P(13,-8,5,1,'#d8e0f0');P(12,-7,2,1,'#d8e0f0')}}
];
const XSK={};XS.forEach(s=>XSK[s.id]=s);
const ORIGC={o:'#d97757',l:'#e8906f',h:'#f4b596',d:'#b95c3e',dd:'#933f27',sh:'#c96a4b',ol:'#3d1a10',k:'#1d1310'};
const pk=c=>(c[0]<<16)|(c[1]<<8)|c[2];
function mkMap(base,eye){const B=hx(base),m=new Map(),set=(o,c)=>m.set(pk(hx(o)),c.map(v=>Math.round(clamp(v,0,255))));
  set(ORIGC.o,B);set(ORIGC.l,mixc(B,WHITE,.2));set(ORIGC.h,mixc(B,WHITE,.42));set(ORIGC.d,mixc(B,BLACK,.2));set(ORIGC.dd,mixc(B,BLACK,.38));
  set(ORIGC.sh,mixc(B,BLACK,.1));set(ORIGC.ol,mixc(B,BLACK,.74));if(eye)set(ORIGC.k,hx(eye));return m}
XS.forEach(s=>s.map=mkMap(s.base,s.eye));
function aura(g,k,x,y){
  const pa=g.globalAlpha,A=(px,py,c,a)=>{g.globalAlpha=pa*a;g.fillStyle=c;g.fillRect(px|0,py|0,1,1)};
  const N={fire:12,soul:8,blood:6,reap:10,crown:6,halo:6}[k]||0;
  for(let i=0;i<N;i++){const u=(T*(k==='blood'?.8:k==='reap'?.6:1.3)+i/N)%1,r=hash(i,k.length*7),px=x+8+(r-.5)*18+Math.sin(T*3+i)*1.5;
    if(k==='fire')A(px,y+8-u*18,['#ffe066','#ff9a2a','#e8402a','#7a1010'][Math.min(3,(u*4)|0)],1-u*.8);
    else if(k==='soul'){A(px,y+6-u*20,'#9affd8',.8*(1-u));A(px,y+7-u*20,'#4ac8a0',.5*(1-u))}
    else if(k==='blood'){const dx=x+1+((i*3)%14);A(dx,y+10+u*9,'#c01828',1-u*.6);A(dx,y+11+u*9,'#7a0c18',1-u*.6)}
    else if(k==='reap'){A(px,y+10-u*16,'#22222e',.7*(1-u));if(i%3===0)A(px,y+4-u*10,'#ff3a3a',1-u)}
    else A(x+8+Math.cos(T*2+i*1.05)*10,y-4+Math.sin(T*2+i*1.05)*4,k==='crown'?'#fff6b0':'#ffffff',.5+.5*Math.sin(T*6+i))}
  if(k==='bolt'){const s=Math.floor(T*9);if(hash(s,3)>.45){let px=x+8+(hash(s,5)-.5)*20,py=y-4;g.fillStyle='#fff6a0';g.globalAlpha=pa;for(let j=0;j<8;j++){g.fillRect(px|0,py|0,1,2);px+=(hash(s+j,9)-.5)*4;py+=2.4}}}
  g.globalAlpha=pa}
const T2=document.createElement('canvas');T2.width=36;T2.height=34;
const X2c=T2.getContext('2d',{willReadFrequently:true});X2c.imageSmoothingEnabled=false;
const _dc7=drawClawd;
drawClawd=function(g,x,y,p){
  const S2=XSK[save.skin.c];
  if(!S2||(S2.adm&&!PF&&!isAdm()))return _dc7(g,x,y,p);
  x=Math.round(x);y=Math.round(y);
  X2c.clearRect(0,0,36,34);_dc7(X2c,10,14,p);
  const id=X2c.getImageData(0,0,36,34),d=id.data;
  for(let i=0;i<d.length;i+=4){if(d[i+3]!==255)continue;const m=S2.map.get((d[i]<<16)|(d[i+1]<<8)|d[i+2]);if(m){d[i]=m[0];d[i+1]=m[1];d[i+2]=m[2]}}
  X2c.putImageData(id,0,0);
  if(S2.acc){const lean=p.lean||0,sq=p.sq||0;S2.acc((a,b,w,h,c)=>{X2c.fillStyle=c;X2c.fillRect(10+lean+a,14+sq+b,w,h)},p.lookX||0,p)}
  const pa=g.globalAlpha;if(S2.alpha)g.globalAlpha=pa*S2.alpha;g.drawImage(T2,x-10,y-14);g.globalAlpha=pa;
  if(S2.aur)aura(g,S2.aur,x,y);
};
{const _sl=LAKE.skinList;LAKE.skinList=function(){const b=_sl?_sl():{c:[],b:[]};return{c:b.c.concat(XS.map(s=>({id:s.id,n:s.n}))),b:b.b}}}
function portrait(cx,cy,sc,id,clip){
  const old=save.skin.c;save.skin.c=id||'klasik';PF=1;ctx.save();
  if(clip){ctx.beginPath();ctx.rect(clip[0],clip[1],clip[2],clip[3]);ctx.clip()}
  ctx.translate(cx,cy);ctx.scale(sc,sc);
  try{drawClawd(ctx,-8,-9,{lookX:1,blink:false,legs:[0,0,0,0],armL:[0,0],armR:[0,0]})}finally{ctx.restore();PF=0;save.skin.c=old}}
function skinTick(){
  const o=save.skin.own.c;
  if(LAKE.role&&!isAdm())for(const s of XS)if(s.adm){delete o[s.id];if(save.skin.c===s.id)save.skin.c='klasik'}
  if(isAdm())for(const s of XS)if(s.adm&&!o[s.id]){o[s.id]=1;writeSave();showToast('SKIN ADMIN TERBUKA: '+s.n,UI.gold)}
  for(const s of XS)if(s.sec&&!o[s.id]&&s.cond()){o[s.id]=1;writeSave();showToast('SKIN RAHASIA TERBUKA: '+s.n,UI.gold);sfx('fanfare')}}

/* ============================================================================
   3. IKAN LANGKA BARU (10) + BUKU IKAN yang mencakup semua ikan
   ============================================================================ */
function addF(o){o.id=FISH.length;FISH.push(Object.assign({pat:'none',tail:'round',jump:0,burst:.3,bp:1.8,win:.6,speed:1,time:'any',cat:'umum'},o))}
addF({name:'ARROWANA',L:34,Hh:4.2,tail:'fork',c:['#8a98a8','#c8d4e0','#f0f4f8','#4a5664'],fin:'#e8c860',w:[3,12],price:150,rar:3.2,pull:.55,stam:1.6,burst:.4,bp:2,jump:.3,win:.5,speed:1.5,time:'day',stars:4,cat:'langka',fx:'sparkle',abil:'LOMPAT TINGGI: MENYAMBAR PERMUKAAN',desc:'IKAN NAGA PERAK. KONON PEMBAWA KEBERUNTUNGAN.',hint:'SIANG HARI'});
addF({name:'RUBY BETTA',L:12,Hh:4,tail:'flow',c:['#a01030','#e0304a','#ffc0c8','#600818'],fin:'#ff5a70',w:[.01,.05],price:90,rar:6,pull:.22,stam:.8,burst:.4,bp:1.7,win:.45,speed:1.6,time:'dawn',stars:3,cat:'langka',fx:'sparkle',abil:'PETARUNG MUNGIL: GERAK CEPAT',desc:'SIRIPNYA MENGALIR SEPERTI SUTRA MERAH.',hint:'FAJAR / SENJA'});
addF({name:'JADE GAR',L:36,Hh:2.6,tail:'fork',pat:'pike',c:['#2e6a4a','#58a078','#d8ecd0','#143a28'],fin:'#7ac090',w:[3,14],price:170,rar:3,pull:.6,stam:1.6,burst:.5,bp:2.2,win:.5,speed:1.7,time:'night',stars:4,cat:'langka',abil:'MONCONG GIOK: SERANGAN CEPAT',desc:'MONCONG PANJANG BERKILAU HIJAU GIOK.',hint:'MALAM HARI'});
addF({name:'PEARL CARP',L:27,Hh:5.8,c:['#d8d0e8','#f0ecf8','#ffffff','#9890b0'],fin:'#f8f0ff',w:[3,11],price:210,rar:2,pull:.5,stam:1.8,burst:.3,bp:1.9,jump:.15,win:.42,speed:1.2,time:'midday',stars:4,cat:'langka',fx:'sparkle',abil:'MUTIARA: KILAU MEMBUTAKAN',desc:'SISIKNYA SEPERTI MUTIARA SAAT MATAHARI TEPAT DI ATAS.',hint:'TENGAH HARI'});
addF({name:'MIRAGE FISH',L:24,Hh:4.4,tail:'flow',c:['#e0c880','#f4e4b0','#fff8e0','#a08840'],fin:'#fff0c0',w:[1,5],price:230,rar:2.2,pull:.5,stam:1.3,burst:.5,bp:2,jump:.2,win:.36,speed:1.7,time:'dawn',stars:4,cat:'misteri',fx:'ghost',abil:'FATAMORGANA: MUNCUL DAN LENYAP',desc:'IKAN FATAMORGANA. HANYA TERLIHAT SAAT LANGIT MEMERAH.',hint:'SENJA HARI',clue:'FATAMORGANA DI LANGIT MERAH',need:c=>c.per==='dusk'?3:.05});
addF({name:'ECLIPSE EEL',L:42,Hh:2.2,c:['#1a1030','#3a2a60','#8a70c0','#0a0818'],fin:'#6a4aa8',w:[4,16],price:280,rar:1.8,pull:.65,stam:1.8,burst:.55,bp:2.3,win:.34,speed:1.8,time:'night',stars:4,cat:'misteri',fx:'glow:#a070ff,eye:#ff4a8a',abil:'GERHANA: MENYERANG DARI KEGELAPAN',desc:'BELUT GERHANA BERPENDAR UNGU DI KEDALAMAN.',hint:'MALAM + LEMPARAN JAUH',clue:'GERHANA DI KEGELAPAN JAUH',need:c=>c.dist>.55?1:.1});
addF({name:'EMBER KOI',L:26,Hh:5,tail:'flow',pat:'koi',c:['#f4efe6','#fbf8f2','#ffffff','#b8a894'],fin:'#ffb060',w:[2,8],price:380,rar:1.2,pull:.65,stam:1.7,burst:.5,bp:2.2,jump:.2,win:.36,speed:1.5,time:'day',stars:5,cat:'mistik',fx:'glow:#ff7a3a',abil:'BARA HIDUP: BERPENDAR JINGGA',desc:'KOI YANG MEMBAWA BARA MATAHARI DI SISIKNYA.',hint:'SIANG + UMPAN KILAT',clue:'BARA DI BAWAH MATAHARI',need:c=>c.luck>=.8?1:0});
addF({name:'TEMPEST PIKE',L:36,Hh:3.4,tail:'fork',pat:'pike',c:['#2a4a7a','#5a8ac8','#e8f0ff','#101e3a'],fin:'#ffe45a',w:[6,22],price:420,rar:1,pull:.8,stam:2.4,burst:.6,bp:2.6,win:.34,speed:2,time:'nightrain',stars:5,cat:'mistik',fx:'electric,glow:#7ab0ff',abil:'BADAI: SENTAKAN BERUNTUN',desc:'PEMBURU BADAI. BERPENDAR BIRU DI BAWAH PETIR.',hint:'MALAM HUJAN',clue:'BADAI DI TENGAH MALAM'});
addF({name:'PHOENIX KOI',L:30,Hh:5.2,tail:'flow',pat:'koi',c:['#ffe8c0','#fff4dc','#ffffff','#d08a3a'],fin:'#ff6a2a',w:[12,40],price:2200,rar:.12,pull:.88,stam:4,burst:.55,bp:2.6,jump:.3,win:.3,speed:1.7,time:'midday',stars:5,cat:'legendaris',fx:'dragon,glow:#ff7a2a',abil:'BURUNG API: MENYALA SAAT TERIK',desc:'KOI LEGENDA YANG BERENANG DI ATAS API MATAHARI.',hint:'TENGAH HARI + UMPAN BULAN',clue:'API YANG BERENANG DI TERIK MATAHARI',need:c=>c.luck>=1.4?1:0});
addF({name:'ABYSS KING',L:46,Hh:6.5,tail:'hetero',c:['#0a1a30','#1a3a60','#5a90c0','#040a18'],fin:'#2a5a90',w:[60,150],price:2800,rar:.1,pull:.92,stam:4.6,burst:.6,bp:2.8,jump:.1,win:.3,speed:1.4,time:'night',stars:5,cat:'legendaris',fx:'lure,glow:#4a90ff,eye:#7ad0ff',abil:'RAJA KEDALAMAN: LENTERA BIRU',desc:'PENGUASA DASAR DANAU. LENTERANYA MEMIKAT PEMANCING.',hint:'MALAM + UMPAN BULAN + LEMPAR JAUH',clue:'LENTERA DI KEDALAMAN DANAU',need:c=>(c.luck>=1.4&&c.dist>.6)?1:0});
buildFishAll();
/* buku ikan: salinan versi v1.5 yang memakai urutan dinamis agar ikan baru ikut tampil */
const BKP=10,CATS=['umum','langka','misteri','mistik','legendaris'];let bkP=0,bkO=[];
function bkOrd(){if(bkO.length!==FISH.length){const r={umum:0,langka:1,misteri:2,mistik:3,legendaris:4};bkO=FISH.map(f=>f.id).sort((a,b)=>(r[FISH[a].cat]-r[FISH[b].cat])||(a-b))}return bkO}
function bkReq(f,got){if(got||f.cat==='umum'||f.cat==='langka')return f.hint||TIMEN[f.time];return f.clue?('PETUNJUK: '+f.clue):'???'}
drawBook=function(){
  ctx.fillStyle='rgba(10,6,24,.45)';ctx.fillRect(0,0,W,H);
  const k=ease(clamp(panelT*3,0,1)),w=Math.min(W-10,220),h=Math.min(H-16,portrait?214:H-16),x=(W-w)/2|0,y=((H-h)/2+(1-k)*30)|0;
  panel(x,y,w,h,'wood');
  const N=FISH.length,cnt=Object.keys(save.book).length,cb=14,ORD=bkOrd();
  txt('BUKU IKAN',x+12,y+10,UI.ink,2,0,UI.cream);txt(cnt+'/'+N,x+w-10,y+13,UI.wood,1,2);
  if(bookSel<0){
    const pages=Math.ceil(N/BKP);bkP=clamp(bkP,0,pages-1);
    const gx=x+9,gy=y+26,cols=2,cw=((w-18)/cols)|0,ch=Math.min(30,((h-64)/5)|0);
    for(let n=0;n<BKP;n++){const oi=bkP*BKP+n;if(oi>=N)break;
      const i=ORD[oi],f=FISH[i],got=save.book[i],c=n%cols,r=(n/cols)|0,cx=gx+c*cw,cy=gy+r*ch;
      R(cx+1,cy+1,cw-2,ch-2,UI.ink);R(cx+2,cy+2,cw-4,ch-4,got?'#fbeccc':'#d8c8a4');R(cx+2,cy+2,cw-4,1,got?'#fff8e4':'#e4d6b4');
      R(cx+2,cy+2,2,ch-4,CATC[f.cat]);txt(String(oi+1),cx+6,cy+4,UI.wood);
      const spr=FSPR[i],sc=(spr.width>cw-10||spr.height>ch-13)?.5:1,sw=spr.width*sc,sh=spr.height*sc;
      const sx=cx+4+((cw-6-sw)/2|0),sy=cy+ch-3-sh;
      ctx.save();ctx.beginPath();ctx.rect(cx+4,cy+10,cw-6,ch-12);ctx.clip();
      drawFish(ctx,i,sx,sy,sc,1,T+i,got?1:0,!got,got?1:.55);ctx.restore();
      if(got)txt(tw(f.name)<=cw-20?f.name:f.name.split(' ').pop(),cx+cw-4,cy+4,UI.ink,1,2);else txt('???',cx+cw-4,cy+4,'#8a7a60',1,2);
      btns.push({id:'fish'+i,x:cx,y:cy,w:cw,h:ch,fn:()=>{bookSel=i;sfx('page')}})}
    const mk2=wc=>CATS.map(cat=>{const tot=FISH.filter(f=>f.cat===cat).length,g=FISH.filter(f=>f.cat===cat&&save.book[f.id]).length;const lbl=CATN[cat]+(wc?' '+g+'/'+tot:'');return{cat,lbl,w:tw(lbl)+8}});
    const flow=items=>{let px=0,line=0;const pos=[];for(const it of items){if(px>0&&px+it.w>w-18){line++;px=0}pos.push({it,px,line});px+=it.w+3}return{pos,lines:line+1}};
    let fl=flow(mk2(true));if(fl.lines>2)fl=flow(mk2(false));
    const ly=y+h-33;
    for(const p of fl.pos){const lx=x+9+p.px,yy=ly+p.line*8;R(lx,yy,5,5,UI.ink);R(lx+1,yy+1,3,3,CATC[p.it.cat]);txt(p.it.lbl,lx+7,yy,UI.wood)}
    const py=y+h-17;
    button('bkp',x+10,py,18,12,'<',()=>{bkP=(bkP+pages-1)%pages;sfx('page')},'blue');
    button('bkn',x+w-28,py,18,12,'>',()=>{bkP=(bkP+1)%pages;sfx('page')},'blue');
    txt('HAL '+(bkP+1)+'/'+pages,W/2,py+3,UI.ink,1,1);
  }else{
    const f=FISH[bookSel],got=save.book[bookSel],spr=FSPR[bookSel];
    const sc=(spr.width*2<=w-30&&spr.height*2<=44)?2:1;
    R(x+9,y+26,w-18,48,'#e9d6aa');R(x+9,y+26,w-18,1,UI.ink);R(x+9,y+73,w-18,1,UI.ink);
    for(let i=0;i<6;i++)R(x+10+((i*37+T*6)%(w-22)),y+38+i*5,6,1,'#dcc596');
    ctx.save();ctx.beginPath();ctx.rect(x+9,y+27,w-18,46);ctx.clip();
    drawFish(ctx,bookSel,W/2-spr.width*sc/2,y+50-spr.height*sc/2,sc,1,T,got?1.5:0,!got,got?1:.5);ctx.restore();
    let yy=y+79;
    txt(got?f.name:'???',x+12,yy,UI.ink,1);starsR(x+w-44,yy,f.stars,5);yy+=10;
    R(x+12,yy,5,5,UI.ink);R(x+13,yy+1,3,3,CATC[f.cat]);txt(CATN[f.cat],x+20,yy,CATC[f.cat]);yy+=9;
    const stat=(lbl,v,col)=>{txt(lbl,x+12,yy,UI.wood);bar(x+62,yy-1,w-76,6,v,col,'#c8b48a');yy+=8};
    stat('KEKUATAN',f.pull,'#e0503e');stat('STAMINA',f.stam/3.2,'#e0a030');stat('KECEPATAN',f.speed/2,UI.blue);stat('LICIN',1-(f.win-.4)/.8,'#9a6ad0');
    for(const l of wrap('SYARAT: '+bkReq(f,got),w-24).slice(0,2)){txt(l,x+12,yy,UI.wood);yy+=7}yy+=2;
    if(got){
      for(const l of wrap('KEMAMPUAN: '+f.abil,w-24)){if(yy>y+h-40)break;txt(l,x+12,yy,UI.accent);yy+=7}yy+=2;
      for(const l of wrap(f.desc,w-24)){if(yy>y+h-30)break;txt(l,x+12,yy,UI.ink);yy+=7}yy+=2;
      if(yy<y+h-18)txt('TERTANGKAP: '+got.n+'X   REKOR: '+got.b.toFixed(2)+' KG',x+12,yy,UI.wood);
    }else{
      for(const l of wrap('BELUM TERTANGKAP. COBA UMPAN, WAKTU, ATAU CUACA YANG BERBEDA.',w-24)){if(yy>y+h-12)break;txt(l,x+12,yy,'#8a7a60');yy+=7}}
    button('back',x+8,y-4,30,14,'<',()=>{bookSel=-1;sfx('page')},'blue');
  }
  button('close',x+w-cb-4,y-4,cb,cb,xIcon,()=>go(prevScene||'menu'),'red');
};

/* ============================================================================
   4. PERLENGKAPAN: joran, pelampung, kail, senar (+ efek)  - panel GEAR
   ============================================================================ */
const GR={
rod:[
{id:'sak',n:'SAKURA ROD',p:1800,line:2.2,c:['#f08ab0','#fff0f6','#ffd0e0'],fx:'petal'},
{id:'fla',n:'FLAME ROD',p:3200,line:2.45,c:['#c0392b','#ff9a2a','#ffe066'],fx:'fire'},
{id:'thu',n:'THUNDER ROD',p:4500,line:2.7,c:['#2a3a6a','#ffe45a','#ffffff'],fx:'bolt'},
{id:'cry',n:'CRYSTAL ROD',p:6500,line:2.9,c:['#7ae0f0','#ffffff','#b8f4ff'],fx:'gem'},
{id:'sha',n:'SHADOW ROD',p:9000,line:3.1,c:['#2a1a3a','#8a4ad0','#c8a0ff'],fx:'mist'},
{id:'aur',n:'AURORA ROD',p:12000,line:3.3,c:['#3ad8b0','#8a7af0','#ff7ad0'],fx:'rainbow'},
{id:'sol',n:'SOLAR ROD',p:16000,line:3.6,c:['#ff9a2a','#ffd35a','#fff6b0'],fx:'ray'},
{id:'drg',n:'DRAGON ROD',p:24000,line:4,c:['#7a0e0e','#ffd35a','#ff5a2a'],fx:'ember'}],
fl:[
{id:'kor',n:'KORK',p:200,qk:.06,c:['#d8b070','#fff4d0'],fx:''},
{id:'neo',n:'NEON',p:700,qk:.12,c:['#3aff9a','#eaffd0'],fx:'glow'},
{id:'bln',n:'BULAN',p:1500,qk:.18,c:['#9ec4ff','#ffffff'],fx:'moon'},
{id:'api',n:'API',p:2600,qk:.24,c:['#ff5a2a','#ffe066'],fx:'fire'},
{id:'kri',n:'KRISTAL',p:4200,qk:.3,c:['#7ae0f0','#ffffff'],fx:'gem'},
{id:'han',n:'HANTU',p:6000,qk:.34,c:['#cfe0f0','#ffffff'],fx:'ghost'},
{id:'ngm',n:'NAGA',p:9000,qk:.4,c:['#2f8a4a','#ffd35a'],fx:'ember'}],
hk:[
{id:'taj',n:'KAIL TAJAM',p:300,win:.12,rr:0,val:0,c:'#c8d0d8'},
{id:'prk',n:'KAIL PERAK',p:900,win:.2,rr:.1,val:.05,c:'#e8f0f8'},
{id:'ems',n:'KAIL EMAS',p:2200,win:.2,rr:.15,val:.15,c:'#ffd35a',fx:'spark'},
{id:'bln',n:'KAIL BULAN',p:4500,win:.28,rr:.3,val:.1,c:'#9ec4ff',fx:'spark'},
{id:'drh',n:'KAIL DARAH',p:7000,win:.3,rr:.35,val:.2,c:'#ff3a4a',fx:'spark'},
{id:'rja',n:'KAIL RAJA',p:12000,win:.4,rr:.5,val:.25,c:'#fff0a0',fx:'spark'}],
ln:[
{id:'nil',n:'NILON',p:150,mul:1.15,col:'#e0e8ff'},
{id:'kev',n:'KEVLAR',p:600,mul:1.35,col:'#e8c840'},
{id:'ttn',n:'TITANIUM',p:1800,mul:1.6,col:'#c8d0d8'},
{id:'nag',n:'SENAR NAGA',p:4500,mul:1.9,col:'#2f8a4a'},
{id:'aur',n:'SENAR AURORA',p:9000,mul:2.3,col:'#8a7af0'}]};
const eqItem=t=>{const id=G().eq[t];return id?(GR[t].find(x=>x.id===id)||null):null};
const RCACHE={};
const _rod=rod;
rod=function(){
  const b=_rod(),r=eqItem('rod'),l=eqItem('ln');if(!r&&!l)return b;
  const key=(r?r.id:'b'+save.eq.rod)+'|'+(l?l.id:'');let o=RCACHE[key];
  if(!o){const src=r||b;o=Object.assign({},src,{line:src.line*(l?l.mul:1),fx:r?r.fx:(b===ITEMS.rod[4]?'gold':undefined)});RCACHE[key]=o}
  return o};
function rodFx(g,f,tp){
  const tx=Math.round(tp.x),ty=Math.round(tp.y),P=(x,y,c,a)=>{g.globalAlpha=a===undefined?1:a;g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1)};
  if(f==='petal')for(let i=0;i<5;i++){const u=(T*.7+i*.2)%1;P(tx+(hash(i,3)-.5)*14+Math.sin(T*2+i)*2,ty+u*16,i%2?'#ffd0e0':'#f08ab0',1-u)}
  else if(f==='fire')for(let i=0;i<6;i++){const u=(T*2+i/6)%1;P(tx+Math.sin(T*9+i*2)*1.2,ty-u*8,['#ffe066','#ff9a2a','#e8402a'][Math.min(2,(u*3)|0)],1-u*.7)}
  else if(f==='bolt'){const s=Math.floor(T*10);if(hash(s,1)>.5){let px=tx,py=ty;for(let j=0;j<7;j++){P(px,py,'#fff8a0');px+=(hash(s+j,2)-.5)*5;py+=(hash(s+j,4)-.3)*3}}}
  else if(f==='gem'){const a=.5+.5*Math.sin(T*5);P(tx,ty,'#ffffff',a);P(tx-1,ty,'#9ae8ff',a);P(tx+1,ty,'#9ae8ff',a);P(tx,ty-1,'#9ae8ff',a);P(tx,ty+1,'#9ae8ff',a)}
  else if(f==='mist')for(let i=0;i<7;i++){const u=(T*.8+i/7)%1;P(tx+(hash(i,5)-.5)*10,ty+4-u*14,i%2?'#8a4ad0':'#c8a0ff',.6*(1-u))}
  else if(f==='rainbow'){const hp=handPos();for(let i=0;i<8;i++){const u=.45+i/8*.55,c=css([Math.round(127+127*Math.sin(T*3+i)),Math.round(127+127*Math.sin(T*3+i+2.1)),Math.round(127+127*Math.sin(T*3+i+4.2))]);P(lerp(hp.x,tx,u),lerp(hp.y,ty,u)-1,c,.9)}}
  else if(f==='ray'){for(let i=0;i<8;i++){const a=i*.785+T,l=1+(i%2)*2+Math.sin(T*6+i);P(tx+Math.cos(a)*(2+l),ty+Math.sin(a)*(2+l),'#fff0a0',.9)}P(tx,ty,'#ffffff')}
  else if(f==='ember')for(let i=0;i<6;i++){const u=(T*1.2+i/6)%1;P(tx+(hash(i,8)-.5)*8+Math.sin(T*4+i),ty-u*12,i%2?'#ff9a2a':'#ff4a2a',1-u)}
  else if(f==='gold'){if(Math.sin(T*3)>.6)P(tx,ty-1,'#fff6b0')}
  g.globalAlpha=1}
const _drl=drawRodAndLine;
drawRodAndLine=function(g){
  _drl(g);const r=rod();if(r&&r.fx)rodFx(g,r.fx,rodTip());
  const hk=eqItem('hk');if(hk&&['idle','caught','lost','miss','early'].includes(fish.state)){const tp=rodTip();g.fillStyle=hk.c;g.fillRect(Math.round(tp.x+1),Math.round(tp.y+10+Math.sin(T*2)*1),1,2)}};
function drawFl(g,fl){
  const F=fish,st=F.state;if(!(st==='cast'||st==='wait'||st==='nibble'||st==='bite'))return;
  const x=Math.round(F.bx);let y=Math.round(F.by),sink=0;const air=st==='cast';
  if(!air){y+=Math.round(Math.sin(T*2.3)*.6);sink=st==='bite'?3:Math.round(F.dip*2)}
  const top=y-4+sink,c0=hx(fl.c[0]),c1=hx(fl.c[1]);
  const px=(dx,dy,c)=>{const yy=top+dy;g.globalAlpha=(!air&&yy>y)?.35:1;g.fillStyle=typeof c==='string'?c:css(c);g.fillRect(x+dx,yy,1,1);g.globalAlpha=1};
  [[0,-1],[-1,0],[1,0],[-2,1],[2,1],[-2,2],[2,2],[-2,3],[2,3],[-1,4],[1,4],[0,5]].forEach(a=>px(a[0],a[1],'#2a1018'));
  px(0,0,mixc(c1,WHITE,.4));px(-1,1,c0);px(0,1,mixc(c0,WHITE,.3));px(1,1,mixc(c0,BLACK,.25));px(-1,2,c0);px(0,2,c0);px(1,2,mixc(c0,BLACK,.3));
  px(-1,3,c1);px(0,3,'#ffffff');px(1,3,mixc(c1,BLACK,.2));px(0,4,mixc(c1,BLACK,.15));
  const A=(dx,dy,c,a)=>{g.globalAlpha=a;g.fillStyle=c;g.fillRect(x+dx,top+dy,1,1);g.globalAlpha=1},f=fl.fx;
  if(f==='glow')for(let i=0;i<10;i++){const a=i*.628;A(Math.round(Math.cos(a)*5),2+Math.round(Math.sin(a)*4),fl.c[0],.3+.35*Math.sin(T*4+i))}
  else if(f==='moon'){A(-1,-3,'#fff2a0',1);A(0,-4,'#fff2a0',1);A(-1,-5,'#fff2a0',1);A(1,-4,'#fff2a0',.6)}
  else if(f==='fire')for(let i=0;i<4;i++){const u=(T*2+i/4)%1;A(Math.round(Math.sin(T*8+i)),-2-Math.round(u*6),i%2?'#ff9a2a':'#ffe066',1-u)}
  else if(f==='gem'){const a=.4+.6*Math.abs(Math.sin(T*5));A(-4,0,'#fff',a);A(4,3,'#9ae8ff',a);A(0,-3,'#fff',a)}
  else if(f==='ghost')for(let i=1;i<5;i++)A(0,5+i,'#cfe0f0',.35*(1-i/5));
  else if(f==='ember')for(let i=0;i<5;i++){const u=(T*1.4+i/5)%1;A(Math.round(Math.sin(T*3+i)*3),-1-Math.round(u*9),i%2?'#ff9a2a':'#ffd35a',1-u)}
  if(st==='bite'){const b=Math.sin(T*20)>0;txtG(g,'!',x-1,top-10+(b?0:-1),'#ffe066',1)}}
function hkFx(g){
  const hk=eqItem('hk');if(!hk||hk.fx!=='spark')return;const st=fish.state;if(!(st==='wait'||st==='nibble'||st==='bite'))return;
  const x=Math.round(fish.bx),y=Math.round(fish.by),a=.4+.6*Math.abs(Math.sin(T*6));
  g.globalAlpha=a;g.fillStyle=hk.c;g.fillRect(x-3,y+6,1,1);g.fillRect(x+3,y+7,1,1);g.fillRect(x,y+9,1,1);g.globalAlpha=1}
const _db7=drawBobber;
drawBobber=function(g){const fl=eqItem('fl');if(fl)drawFl(g,fl);else _db7(g);hkFx(g)};
const FIN={w0:3};
const _pf7=pickFish;
pickFish=function(){let a=_pf7();const h=eqItem('hk');if(h&&h.rr&&Math.random()<h.rr){const b=_pf7();if(FISH[b]&&FISH[a]&&FISH[b].stars>FISH[a].stars)a=b}return a};
const _uf7=updateFishing;
updateFishing=function(dt){
  const h=eqItem('hk');if(fish.state==='bite'&&h&&h.win)fish.t-=dt*h.win;
  const ps=fish.state;_uf7(dt);
  if(ps==='cast'&&fish.state==='wait'){const f=eqItem('fl');if(f)fish.wait*=1-f.qk;FIN.w0=fish.wait}};
function gearTick(){if(G().eq.rod&&save.eq.rod!==G().base)G().eq.rod=null}
const GS={tab:0,pg:0,sk:0};
function gIcon(t,it,x,y){
  if(t==='rod'){for(let i=0;i<13;i++)R(x+1+i,y+13-i,1,1,i%4===0?it.c[1]:it.c[0]);R(x,y+14,2,2,'#3a2a1a');R(x+13,y,2,2,it.c[2])}
  else if(t==='fl'){R(x+7,y,1,2,UI.ink);R(x+4,y+2,7,10,UI.ink);R(x+5,y+3,5,4,it.c[0]);R(x+5,y+7,5,4,it.c[1]);R(x+6,y+4,1,1,'#fff')}
  else if(t==='hk'){R(x+8,y+1,1,10,it.c);R(x+5,y+11,4,1,it.c);R(x+4,y+9,1,3,it.c);R(x+3,y+8,1,1,it.c);R(x+7,y,3,1,it.c)}
  else{R(x+3,y+3,10,10,UI.ink);R(x+4,y+4,8,8,'#c8b48a');for(let i=0;i<4;i++)R(x+5,y+5+i*2,6,1,it.col)}}
function gStat(t,it){
  if(t==='rod')return 'SENAR X'+it.line.toFixed(1);
  if(t==='fl')return 'GIGIT +'+Math.round(it.qk*100)+'%';
  if(t==='hk')return 'WKT+'+Math.round(it.win*100)+'% HOKI+'+Math.round(it.rr*100);
  return 'SENAR X'+it.mul.toFixed(2)}
function drawSkinTab(x,y,w,h){
  const L=XS.filter(s=>!s.adm||isAdm()),n=L.length;GS.sk=clamp(GS.sk,0,n-1);
  const S2=L[GS.sk],own=!!save.skin.own.c[S2.id],eq=save.skin.c===S2.id,hid=S2.sec&&!own;
  const bx=x+10,by=y+42,bw=w-20,bh=56;
  R(bx-1,by-1,bw+2,bh+2,UI.ink);
  for(let i=0;i<bh;i++){ctx.fillStyle=css(mixc(hx('#a8d8f4'),hx('#4a86c0'),i/bh));ctx.fillRect(bx,by+i,bw,1)}
  ctx.save();ctx.beginPath();ctx.rect(bx,by,bw,bh);ctx.clip();ctx.translate(bx+(bw>>1),by+Math.round(bh*.68));ctx.scale(2,2);
  const old=save.skin.c;save.skin.c=S2.id;PF=1;
  try{drawClawd(ctx,-8,-9,{lookX:1,blink:Math.sin(T*.9)>.96,legs:[0,0,0,0],armL:[0,0],armR:[0,0]})}finally{PF=0;save.skin.c=old}
  ctx.restore();
  if(hid){ctx.fillStyle='rgba(10,6,24,.6)';ctx.fillRect(bx,by,bw,bh);const lx=bx+(bw>>1)-4,ly=by+(bh>>1)-5;R(lx+1,ly,6,1,UI.paper);R(lx,ly+1,1,3,UI.paper);R(lx+7,ly+1,1,3,UI.paper);R(lx-1,ly+4,10,7,UI.paper);R(lx+3,ly+6,2,3,UI.ink)}
  button('gsp',bx+2,by+(bh>>1)-7,14,14,'<',()=>{GS.sk=(GS.sk+n-1)%n;sfx('tab')},'blue');
  button('gsn',bx+bw-16,by+(bh>>1)-7,14,14,'>',()=>{GS.sk=(GS.sk+1)%n;sfx('tab')},'blue');
  const ry=y+102;txt(hid?'???':S2.n,x+12,ry,UI.ink);txt(S2.adm?'ADMIN':'RAHASIA',x+w-12,ry,S2.adm?UI.accent:'#9a6ad0',1,2);
  let dy=ry+10;for(const l of wrap(hid?S2.hint:S2.d,w-24).slice(0,3)){txt(l,x+12,dy,UI.wood);dy+=7}
  txt((GS.sk+1)+'/'+n,x+w-12,y+h-37,UI.wood,1,2);
  const by2=y+h-25,bw2=Math.min(104,w-24),bx2=(W-bw2)/2|0;
  if(eq)button('gsa',bx2,by2,bw2,16,'DIPAKAI',()=>{},'gray');
  else if(own)button('gsa',bx2,by2,bw2,16,'PAKAI',()=>{save.skin.c=S2.id;writeSave();showToast('SKIN DIPAKAI: '+S2.n,UI.gold);sfx('coin')},'green');
  else button('gsa',bx2,by2,bw2,16,'TERKUNCI',()=>{showToast('SKIN RAHASIA TERKUNCI',UI.red);sfx('err')},'gray')}
function drawGear(){
  ctx.fillStyle='rgba(10,6,24,.5)';ctx.fillRect(0,0,W,H);
  const k=ease(clamp(panelT*3,0,1)),w=Math.min(W-10,230),h=Math.min(H-14,186),x=(W-w)/2|0,y=((H-h)/2+(1-k)*30)|0;
  panel(x,y,w,h,'wood');txt('GEAR',x+12,y+10,UI.ink,2,0,UI.cream);
  const cs=String(save.coins);iconCoin(x+w-12-tw(cs)-8,y+11);txt(cs,x+w-12,y+12,'#b0781a',1,2,UI.cream);
  button('gcl',x+w-18,y-4,14,14,xIcon,()=>go(prevScene||'menu'),'red');
  const tn=['ROD','FLOAT','HOOK','LINE','SKIN'],tbw=((w-22)/5)|0;
  tn.forEach((nm,i)=>{const tx=x+11+i*tbw,ty=y+25,on=GS.tab===i;R(tx,ty,tbw-1,13,UI.ink);R(tx+1,ty+1,tbw-3,on?12:11,on?UI.accent:'#c8b48a');txt(nm,tx+tbw/2-1,ty+4,on?UI.paper:UI.woodD,1,1,on?'#8e3f28':null);btns.push({id:'gt'+i,x:tx,y:ty,w:tbw,h:13,fn:()=>{GS.tab=i;GS.pg=0;sfx('tab')}})});
  if(GS.tab===4){drawSkinTab(x,y,w,h);return}
  const t=['rod','fl','hk','ln'][GS.tab],list=GR[t],per=4,pages=Math.ceil(list.length/per),rh=Math.min(24,((h-66)/4)|0);GS.pg=clamp(GS.pg,0,pages-1);
  list.slice(GS.pg*per,GS.pg*per+per).forEach((it,n)=>{
    const ry=y+40+n*rh,own=!!G().own[t][it.id],eq=G().eq[t]===it.id;
    if(n%2===0)R(x+6,ry,w-12,rh,'rgba(200,170,110,.18)');
    R(x+9,ry+2,19,rh-4,UI.ink);R(x+10,ry+3,17,rh-6,eq?'#ffe8b0':'#e9d6aa');gIcon(t,it,x+10,ry+3+((rh-6-16)/2|0));
    txt(it.n,x+32,ry+4,UI.ink);txt(gStat(t,it),x+32,ry+12,UI.wood);
    const bw=36,bx=x+w-9-bw,by=ry+3;
    if(eq)button('ge'+n,bx,by,bw,13,'LEPAS',()=>{G().eq[t]=null;writeSave();sfx('tab')},'gray');
    else if(own)button('ge'+n,bx,by,bw,13,'PAKAI',()=>{G().eq[t]=it.id;if(t==='rod')G().base=save.eq.rod;writeSave();sfx('buy')},'blue');
    else{const can=save.coins>=it.p;button('ge'+n,bx,by,bw,13,(a,b)=>{iconCoin(a+3,b+3);txt(it.p,a+bw-3,b+4,can?UI.paper:'#d8d0e0',1,2,can?'#2e6a32':'#5a5464')},
      ()=>{if(save.coins>=it.p){save.coins-=it.p;G().own[t][it.id]=1;G().eq[t]=it.id;if(t==='rod')G().base=save.eq.rod;writeSave();sfx('buy');showToast(it.n+' DIBELI!',UI.gold)}else{sfx('err');showToast('KOIN TIDAK CUKUP',UI.red)}},can?'green':'gray')}});
  const py=y+h-20;
  button('gpp',x+10,py,18,12,'<',()=>{GS.pg=(GS.pg+pages-1)%pages;sfx('page')},'blue');
  button('gpn',x+w-28,py,18,12,'>',()=>{GS.pg=(GS.pg+1)%pages;sfx('page')},'blue');
  txt('HAL '+(GS.pg+1)+'/'+pages,W/2,py+3,UI.ink,1,1)}
function openGear(){prevScene=(scene==='gear')?'menu':scene;go('gear')}

/* ============================================================================
   5. CLOUD-FIRST: data akun tidak lagi tertimpa saat login di perangkat lain
   ============================================================================ */
const SY={ok:false,busy:false,skip:false,bid:0,next:0,bnext:0,ann:false,cn:0,t0:0};
const score=d=>(+d.xp||0)+(+d.total||0)*10+(d.book&&typeof d.book==='object'?Object.keys(d.book).length:0)*50;
function adopt(d){const snd=save.snd;Object.keys(save).forEach(k=>delete save[k]);Object.assign(save,d);if(save.snd===undefined)save.snd=snd;fixSave();writeSave()}
async function api(path,opt){
  const r=await _fetch(URLB+path,opt),t=await r.text();let j=null;try{j=t?JSON.parse(t):null}catch(e){j=t}
  if(!r.ok){const e=new Error((j&&typeof j==='object'&&(j.msg||j.message||j.error_description||j.error))||('HTTP '+r.status));e.status=r.status;throw e}return j}
async function rpc7(fn,args){
  for(let i=0;;i++){const s=sess();if(!s)throw new Error('BELUM LOGIN');
    try{return await api('/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json',Authorization:'Bearer '+s.access},body:JSON.stringify(args||{})})}
    catch(e){if(e.status===401&&i<4){await wait(3000);continue}throw e}}}
if(ON){
  /* menahan unggah & klaim hadiah sampai data cloud dimuat (mencegah data kosong menimpa cloud) */
  window.fetch=function(u,o){
    const url=String((u&&u.url)||u);
    if(url.indexOf(URLB)===0){
      if(/\/auth\/v1\/(signup|token\?grant_type=password)/.test(url)){SY.ok=false;SY.skip=false}
      if(!SY.ok&&/\/rpc\/(save_cloud|claim_gifts)/.test(url))
        return Promise.resolve(new Response(/claim_gifts/.test(url)?'[]':'null',{status:200,headers:{'Content-Type':'application/json'}}))}
    return _fetch(u,o)};
}
async function cloudFirst(){
  SY.busy=true;
  try{
    const p=await rpc7('my_profile'),row=Array.isArray(p)?p[0]:p;
    if(row){LAKE.role=row.role;LAKE.uid=row.id;LAKE.name=row.username}
    const d=await rpc7('load_cloud');
    if(d&&typeof d==='object'&&Object.keys(d).length&&score(d)>score(save)){adopt(d);showToast('DATA CLOUD DIMUAT',UI.gold)}
    SY.ok=true;
    if(isAdm()&&!SY.ann){SY.ann=true;pushN({k:'admin',name:LAKE.name||'ADMIN'});rpc7('announce_admin_login').catch(()=>{})}
  }catch(e){SY.next=Date.now()+5000}
  finally{SY.busy=false}}
async function pollB(){
  SY.bnext=Date.now()+12000;
  try{const rows=await rpc7('get_broadcasts',{p_since:SY.bid});
    if(Array.isArray(rows))for(const b of rows){SY.bid=Math.max(SY.bid,+b.id);
      if(b.kind==='admin_login')pushN({k:'admin',name:b.actor_name});
      else if(b.kind==='catch'){const p=b.payload||{},f=FISH[p.id];if(f)pushN({k:'catch',name:b.actor_name,fish:f.name,cat:f.cat,wt:p.wt})}}}
  catch(e){}}
let W1=0;
const _ue7=updateEnv;
updateEnv=function(dt){_ue7(dt);
  W1-=dt;if(W1>0)return;W1=1;
  if(ON){const s=sess();
    if(!s){if(SY.ok||LAKE.role){SY.ok=false;SY.skip=false;LAKE.role=null;LAKE.uid=null;LAKE.name=null;SY.ann=false;SY.bid=0}
      if(scene==='play'&&!fadeTo&&!OFFL){resetFish();go('menu')}}
    else{OFFL=false;
      if(!SY.ok&&!SY.busy&&Date.now()>=SY.next)cloudFirst();
      else if(SY.ok&&!SY.busy&&document.visibilityState==='visible'&&Date.now()>=SY.bnext)pollB()}}
  skinTick();gearTick()};

/* ============================================================================
   6. GERBANG LOGIN (wajib login atau mode offline) + form login sederhana
   ============================================================================ */
function gate(){if(!ON||OFFL||scene!=='menu')return 0;if(!sess())return 1;if(!SY.ok&&!SY.skip)return 2;return 0}
function drawGate(){
  const st=gate();if(!st)return;ctx.fillStyle='rgba(10,6,24,.74)';ctx.fillRect(0,0,W,H);
  const w=Math.min(W-14,170),h=st===1?112:78,x=(W-w)/2|0,y=Math.round(H*.3);panel(x,y,w,h,'wood');
  const bw=w-24,bx=x+12;
  if(st===1){
    txt('MASUK DULU',W/2,y+9,UI.ink,1,1,UI.cream);
    button('g1',bx,y+22,bw,17,'MASUK / DAFTAR',()=>openLogin(),'green');
    button('g2',bx,y+44,bw,17,'MAIN OFFLINE',()=>{OFFL=true;showToast('MODE OFFLINE: TANPA HADIAH ADMIN',UI.red)},'gray');
    wrap('OFFLINE TIDAK DAPAT HADIAH ADMIN, CLOUD DAN PERINGKAT',w-20).forEach((l,i)=>txt(l,W/2,y+68+i*7,UI.wood,1,1));
  }else{
    if(!SY.t0)SY.t0=T;
    txt('MEMUAT DATA AKUN'+['.','..','...'][Math.floor(T*2)%3],W/2,y+14,UI.ink,1,1,UI.cream);
    wrap('JANGAN TUTUP GAME. DATA CLOUD SEDANG DISINKRONKAN.',w-20).forEach((l,i)=>txt(l,W/2,y+28+i*7,UI.wood,1,1));
    if(T-SY.t0>6)button('g3',bx,y+h-24,bw,16,'LANJUT TANPA SYNC',()=>{SY.skip=true},'gray')}}
let LO=null,lmode=0,lbusy=false,lv={e:'',p:'',n:''};
const trErr=m=>{m=String(m||'');
  if(/rate limit/i.test(m))return 'Batas email Supabase tercapai. Matikan "Confirm email" di Authentication > Sign In / Providers > Email, atau tunggu 1 jam.';
  if(/invalid login/i.test(m))return 'Email atau sandi salah.';if(/already registered|already been registered/i.test(m))return 'Email sudah terdaftar. Coba MASUK.';
  if(/not confirmed/i.test(m))return 'Email belum dikonfirmasi. Cek kotak masuk emailmu.';if(/password/i.test(m)&&/6/.test(m))return 'Sandi minimal 6 karakter.';
  if(/fetch|network|TypeError/i.test(m))return 'Tidak ada koneksi internet.';return m};
function mkLO(){
  if(LO)return;
  const st=document.createElement('style');
  st.textContent='#lk7{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;background:rgba(8,6,20,.92);color:#f3e6c8;font:14px/1.4 "Courier New",monospace;overflow-y:auto;padding:max(12px,env(safe-area-inset-top)) 12px 20px}'+
  '#lk7 .bx{max-width:420px;margin:0 auto;background:#3b2a1e;border:3px solid #1a1024;box-shadow:inset 0 0 0 3px #8a5a34;padding:16px}#lk7 h2{margin:0 0 10px;font-size:20px;color:#ffd35a}'+
  '#lk7 .tb{display:flex;gap:6px;margin-bottom:6px}#lk7 .tb button{flex:1;margin:0;background:#6a5a4a}#lk7 .tb button.on{background:#d97757}'+
  '#lk7 label{display:block;margin:10px 0 3px;color:#d8c8a4;font-size:12px}#lk7 input[type=text],#lk7 input[type=email],#lk7 input[type=password]{width:100%;box-sizing:border-box;font:16px "Courier New",monospace;padding:10px;background:#1a1024;color:#f3e6c8;border:2px solid #8a5a34;border-radius:0}'+
  '#lk7 button{font:bold 14px "Courier New",monospace;padding:12px;margin:10px 0 0;width:100%;background:#3f9a48;color:#fff;border:2px solid #1a1024;box-shadow:inset 0 -3px 0 rgba(0,0,0,.3)}#lk7 button.x{background:#6a5a4a}'+
  '#lk7 .sh{display:flex;align-items:center;gap:6px;margin-top:8px;font-size:12px}#lk7 .sh input{width:auto}#lk7 .st{margin-top:10px;min-height:20px;color:#9fe3ff;word-break:break-word}#lk7 .st.er{color:#ff8a7a}';
  document.head.appendChild(st);LO=document.createElement('div');LO.id='lk7';document.body.appendChild(LO);
  LO.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&e.target.tagName==='INPUT')doLog()});
  LO.addEventListener('keyup',e=>e.stopPropagation());
  LO.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;
    if(a==='m0'||a==='m1'){lmode=+a[1];rLO()}else if(a==='go')doLog();else if(a==='x')LO.style.display='none';
    else if(a==='off'){OFFL=true;LO.style.display='none';showToast('MODE OFFLINE: TANPA HADIAH ADMIN',UI.red)}});
  LO.addEventListener('change',e=>{if(e.target.id==='l7s'){const p=document.getElementById('l7p');if(p)p.type=e.target.checked?'text':'password'}})}
const gv7=id=>{const e=document.getElementById(id);return e?e.value:''};
function st7(m,er){const e=document.getElementById('l7st');if(e){e.textContent=m||'';e.className='st'+(er?' er':'')}}
function rLO(){
  lv={e:gv7('l7e')||lv.e,p:gv7('l7p')||lv.p,n:gv7('l7n')||lv.n};const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
  LO.innerHTML='<div class="bx"><h2>AKUN LAKE</h2><div class="tb"><button data-a="m0" class="'+(lmode===0?'on':'')+'">MASUK</button><button data-a="m1" class="'+(lmode===1?'on':'')+'">DAFTAR</button></div>'+
  '<label>EMAIL</label><input id="l7e" type="email" autocomplete="username" autocapitalize="off" value="'+esc(lv.e)+'">'+
  '<label>KATA SANDI (min. 6 karakter)</label><input id="l7p" type="password" autocomplete="'+(lmode?'new-password':'current-password')+'" value="'+esc(lv.p)+'">'+
  '<div class="sh"><input type="checkbox" id="l7s"><label for="l7s" style="margin:0">Tampilkan sandi</label></div>'+
  (lmode?'<label>NAMA PEMANCING (opsional)</label><input id="l7n" type="text" maxlength="24" value="'+esc(lv.n)+'">':'')+
  '<button data-a="go">'+(lmode?'DAFTAR SEKARANG':'MASUK')+'</button><button class="x" data-a="off">MAIN OFFLINE (TANPA HADIAH ADMIN)</button><button class="x" data-a="x">TUTUP</button><div class="st" id="l7st"></div></div>'}
function openLogin(){mkLO();LO.style.display='block';rLO()}
async function doLog(){
  if(lbusy)return;const em=gv7('l7e').trim(),pw=gv7('l7p'),nm=gv7('l7n').trim();
  if(!em||pw.length<6){st7('Isi email dan sandi (minimal 6 karakter).',1);return}
  lbusy=true;st7('Menghubungi server...');
  try{
    const hd={apikey:KEY,'Content-Type':'application/json'};let j;
    if(lmode===0)j=await api('/auth/v1/token?grant_type=password',{method:'POST',headers:hd,body:JSON.stringify({email:em,password:pw})});
    else j=await api('/auth/v1/signup',{method:'POST',headers:hd,body:JSON.stringify({email:em,password:pw,data:nm?{username:nm}:{}})});
    if(j&&j.access_token){
      localStorage.setItem(SKEY,JSON.stringify({access:j.access_token,refresh:j.refresh_token,exp:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),email:(j.user&&j.user.email)||em}));
      st7('Berhasil! Memuat game...');setTimeout(()=>location.reload(),300)}
    else st7('Akun dibuat. Cek email untuk konfirmasi, lalu tekan MASUK.')
  }catch(e){st7(trErr(e.message),1)}finally{lbusy=false}}

/* ============================================================================
   7. NOTIFIKASI (admin online, ikan langka s/d legendaris) dengan hiasan berbeda
   ============================================================================ */
const NQ=[];let NC=null;
function pushN(n){if(NQ.length<5)NQ.push(n)}
function iconCrown(x,y){R(x+1,y+5,9,3,UI.ink);R(x+2,y+5,7,2,'#ffd35a');R(x+1,y+1,1,4,'#ffd35a');R(x+5,y,1,5,'#ffd35a');R(x+9,y+1,1,4,'#ffd35a');R(x+3,y+3,1,2,'#ffd35a');R(x+7,y+3,1,2,'#ffd35a');R(x+5,y+5,1,1,'#e0302a');R(x+3,y+6,1,1,'#3a8ae0');R(x+7,y+6,1,1,'#3a8ae0');R(x+1,y,1,1,'#fff6b0');R(x+9,y,1,1,'#fff6b0')}
function iconGem(x,y,c){R(x+2,y,3,1,c);R(x+1,y+1,5,1,c);R(x,y+2,7,1,c);R(x+1,y+3,5,1,c);R(x+2,y+4,3,1,c);R(x+3,y+5,1,1,c);R(x+2,y+1,1,1,'#fff')}
function iconEye(x,y,c){R(x+1,y+2,9,3,c);R(x+3,y+1,5,1,c);R(x+3,y+5,5,1,c);R(x+4,y+2,3,3,'#fff');R(x+5,y+2,1,3,UI.ink)}
function iconOrb(x,y,c){R(x+2,y,5,1,c);R(x+1,y+1,7,5,c);R(x+2,y+6,5,1,c);R(x+3,y+2,2,1,'#fff');R(x+4,y+3,2,2,'#0a2a28')}
function iconFlame(x,y){R(x+4,y,1,2,'#ffd35a');R(x+3,y+2,3,2,'#ff9a2a');R(x+2,y+4,5,3,'#e8402a');R(x+3,y+5,3,2,'#ffd35a');R(x+4,y+6,1,1,'#fff')}
function iconCheck(x,y){R(x+2,y,3,7,'#2a8af0');R(x+1,y+1,5,5,'#2a8af0');R(x,y+2,7,3,'#2a8af0');R(x+1,y+3,1,1,'#fff');R(x+2,y+4,1,1,'#fff');R(x+3,y+3,1,1,'#fff');R(x+4,y+2,1,1,'#fff');R(x+5,y+1,1,1,'#fff')}
function drawNotif(){
  if(!NC){NC=NQ.shift();if(!NC)return;NC.t=0;NC.d=4.4;sfx(NC.k==='admin'||NC.cat==='legendaris'?'fanfare':NC.cat==='langka'?'coin':'whoosh')}
  const n=NC;n.t+=DT;if(n.t>n.d){NC=null;return}
  const k=ease(clamp(n.t*3,0,1))*ease(clamp((n.d-n.t)*3,0,1)),adm=n.k==='admin',cat=adm?'admin':n.cat,col=adm?'#ffd35a':CATC[cat];
  const w=Math.min(W-44,172),h=28,x=(W-w)/2|0,yb=scene==='sail'?Math.round(H*.45):Math.max(50,Math.round(H*.16)),y=Math.round(yb-(1-k)*34),pu=.5+.5*Math.sin(T*8);
  ctx.globalAlpha=k;
  R(x-1,y-1,w+2,h+2,UI.ink);R(x,y,w,h,(adm||cat==='legendaris')?css(mixc(hx(col),hx('#fff6b0'),pu*.6)):col);R(x+2,y+2,w-4,h-4,'#1c1636');R(x+2,y+2,w-4,1,'#2e2652');
  const ix=x+6,iy=y+10;
  if(adm)iconCrown(ix,iy-1);else if(cat==='langka')iconGem(ix+2,iy,col);else if(cat==='misteri')iconEye(ix-1,iy,col);else if(cat==='mistik')iconOrb(ix+1,iy,col);else iconFlame(ix+2,iy-2);
  const tx=x+22,tm=w-28,title=adm?'ADMIN ONLINE!':({langka:'IKAN LANGKA!',misteri:'IKAN MISTERI!',mistik:'IKAN MISTIK!',legendaris:'LEGENDARIS!!'})[cat];
  txt(fit(title,tm),tx,y+6,col,1,0,'#0a0618');
  if(adm){const nm=fit(n.name,tm-10);txt(nm,tx,y+16,UI.paper,1,0,'#0a0618');iconCheck(tx+tw(nm)+3,y+15)}
  else txt(fit(n.name+' '+n.fish,tm),tx,y+16,UI.paper,1,0,'#0a0618');
  const sp=(px,py,c)=>{R(px,py-1,1,3,c);R(px-1,py,3,1,c)};
  if(adm){iconCrown(((W-11)/2)|0,y-8);if(Math.sin(T*6)>0)sp(x-2,y-2,'#fff6b0');else sp(x+w+1,y+h+1,'#fff6b0');sp(x+w-3,y+2,'#fff6b0')}
  else if(cat==='langka'){const sx=x+((T*40)%(w+20))-10;if(sx>x&&sx<x+w-4)R(sx,y+3,2,h-6,'rgba(255,255,255,.25)');sp(x-2,y-2,col);sp(x+w+1,y+h+1,col)}
  else if(cat==='misteri'){txt('?',x-4,y+1,col,1);txt('?',x+w+1,y+h-6,col,1)}
  else if(cat==='mistik'){for(let i=0;i<4;i++){const q=T*3+i*1.57;R(x+w/2+Math.cos(q)*(w/2+3),y+h/2+Math.sin(q)*(h/2+3),2,2,col)}}
  else{for(let i=0;i<8;i++){const u=(T*1.6+i/8)%1;R(x+4+i*((w-8)/8),y-2-u*8,1,1,i%2?'#ff9a2a':'#ffd35a')}}
  ctx.globalAlpha=1}
const _fc7=finishCatch;
finishCatch=function(){
  _fc7();const r=fish.res;if(!r)return;const f=FISH[r.id],hk=eqItem('hk');
  if(hk&&hk.val){const b=Math.max(1,Math.round(r.price*hk.val));r.price+=b;save.coins+=b;writeSave()}
  if(f&&f.cat&&f.cat!=='umum'){
    pushN({k:'catch',name:'KAMU',fish:f.name,cat:f.cat,wt:r.wt});
    if(ON&&SY.ok&&Date.now()>SY.cn){SY.cn=Date.now()+10000;rpc7('announce_catch',{p_fish:r.id,p_wt:r.wt,p_cat:f.cat}).catch(()=>{})}}};

/* ============================================================================
   8. SIRIP HIU: ikan langka+ berenang mengitari umpan dan terlihat sirip di air
   ============================================================================ */
function drawFin(){
  const F=fish,st=F.state;if(!(st==='wait'||st==='nibble'||st==='bite'||st==='reel'))return;
  const f=FISH[F.id];if(!f||!f.cat||f.cat==='umum')return;
  let x,y,dir;
  if(st==='reel'){if(F.jumpT>0)return;x=F.fx;y=F.fy;dir=F.fdir}
  else{const r=st==='wait'?5+Math.min(26,F.wait/Math.max(.5,FIN.w0)*26):4,a=T*(1.1+f.speed*.35)+F.id;x=F.bx+Math.cos(a)*r*1.3;y=F.by+Math.sin(a)*r*.42;dir=Math.sin(a)<0?1:-1}
  x=Math.round(Math.max(x,dockEnd+6));y=Math.round(clamp(y,horizonY+4,H-4));
  const col=CATC[f.cat],leg=f.cat==='legendaris',hgt=6+(f.stars>=5?2:0),body=leg?'#8a6418':'#3c4a62',edge=leg?'#ffe070':'#8a9cb8';
  ellipsePix(x,y+1,6,1.8,'#dfeeff',.5);
  for(let k=1;k<8;k++){const a=.55*(1-k/8);ctx.globalAlpha=a;ctx.fillStyle='#e8f4ff';ctx.fillRect(x-dir*(3+k*2),Math.round(y+1-k*.35),1,1);ctx.fillRect(x-dir*(3+k*2),Math.round(y+1+k*.45),1,1)}
  ctx.globalAlpha=.96;
  for(let j=0;j<hgt;j++){const a=-4+((j*.55)|0),b=3-((j*1.05)|0);if(a>b)break;
    for(let dx=a;dx<=b;dx++){ctx.fillStyle=dx===b?edge:(dx===a?'#1a2030':body);ctx.fillRect(dir>0?x+dx:x-dx,y-j,1,1)}}
  ctx.fillStyle=col;ctx.fillRect(dir>0?x-3:x+3,y-hgt+1,1,1);
  if(Math.sin(T*7+F.id)>.4){ctx.globalAlpha=.9;ctx.fillRect(x-dir*3,y-hgt-1,1,1);ctx.fillRect(x-dir*3-1,y-hgt-1,3,1)}
  ctx.globalAlpha=1}
const _ds7=drawScene;
drawScene=function(){_ds7();if(scene==='play')drawFin()};

/* ============================================================================
   9. PERINGKAT & PROFIL (follow, centang biru admin, bingkai karakter)
   ============================================================================ */
const XPT=[0,50,120,220,360,560,820,1150,1550,2050],TTL=['NEMO','PEMULA','NELAYAN','HANDAL','AHLI','MASTER','LEGENDA','DUKUN DANAU'];
const lvOf=xp=>{let l=0;while(l<XPT.length-1&&xp>=XPT[l+1])l++;return l+1};
const RK={rows:[],pg:0,sel:-1,ld:0,err:''};
async function loadRank(){
  if(!ON||!sess()||!SY.ok)return;RK.ld=1;RK.err='';
  try{RK.rows=(await rpc7('get_leaderboard',{p_limit:60}))||[]}catch(e){RK.err=trErr(e.message)}RK.ld=0}
function openRank(){RK.sel=-1;RK.pg=0;prevScene=(scene==='rank')?'menu':scene;go('rank');loadRank()}
function iconRank(x,y){R(x,y+4,3,5,UI.ink);R(x+3,y,3,9,UI.ink);R(x+6,y+2,3,7,UI.ink);R(x+1,y+5,1,3,'#c8c8d0');R(x+4,y+1,1,7,'#ffd35a');R(x+7,y+3,1,5,'#c8804a')}
function iconGear(x,y){R(x,y+3,9,6,UI.ink);R(x+1,y+4,7,4,'#d97757');R(x+3,y+1,3,2,UI.ink);R(x+4,y+6,1,1,UI.gold)}
function pFrame(x,y,w,h,adm){
  R(x-1,y-1,w+2,h+2,UI.ink);R(x,y,w,h,adm?(Math.sin(T*4)>0?'#ffd35a':'#fff2a0'):'#b07a48');R(x+2,y+2,w-4,h-4,UI.ink);
  for(let i=0;i<h-6;i++){ctx.fillStyle=css(mixc(hx('#a8d8f4'),hx('#4a86c0'),i/(h-6)));ctx.fillRect(x+3,y+3+i,w-6,1)}
  for(const[a,b]of[[x,y],[x+w-3,y],[x,y+h-3],[x+w-3,y+h-3]])R(a,b,3,3,adm?'#fff6b0':'#e8c070')}
function drawProfile(x,y,w,h){
  const r=RK.rows[RK.sel];if(!r){RK.sel=-1;return}
  const adm=r.role==='admin',me=r.id===LAKE.uid,lv=lvOf(+r.xp||0);
  const fw=60,fh=58,fx=(W-fw)/2|0,fy=y+26;
  pFrame(fx,fy,fw,fh,adm);portrait(fx+fw/2,fy+40,2,r.skin_c,[fx+3,fy+3,fw-6,fh-6]);
  if(adm)iconCrown(((W-11)/2)|0,fy-8);
  const nm=fit(r.username,w-40),nw=tw(nm)+(adm?10:0),nx=(W-nw)/2|0;
  txt(nm,nx,fy+fh+5,UI.ink);if(adm)iconCheck(nx+tw(nm)+3,fy+fh+4);
  txt(adm?'ADMIN':TTL[Math.min(lv-1,TTL.length-1)],W/2,fy+fh+14,adm?'#b0781a':UI.wood,1,1);
  let yy=fy+fh+26;const row=(a,b)=>{txt(a,x+14,yy,UI.wood);txt(b,x+w-14,yy,UI.ink,1,2);yy+=8};
  row('LEVEL',String(lv));row('IKAN',String(Math.round(+r.total||0)));row('SPESIES',(r.species|0)+'/'+FISH.length);row('REKOR',(+r.best_w||0).toFixed(2)+' KG');row('PENGIKUT',String(r.followers|0));
  const by=y+h-22,bw=Math.min(120,w-24),bx=(W-bw)/2|0;
  if(me)txt('PROFIL KAMU',W/2,by+4,UI.wood,1,1);
  else if(adm){R(bx,by,bw,15,UI.ink);R(bx+1,by+1,bw-2,13,'#8a8494');txt('DIIKUTI (WAJIB)',W/2-3,by+5,UI.paper,1,1);iconCheck(bx+bw-11,by+4)}
  else button('rf',bx,by,bw,15,r.following?'BERHENTI IKUTI':'IKUTI',async()=>{
    try{await rpc7(r.following?'unfollow_user':'follow_user',{p_target:r.id});r.followers=(r.followers|0)+(r.following?-1:1);r.following=!r.following;sfx('coin')}
    catch(e){showToast(trErr(e.message).slice(0,28),UI.red);sfx('err')}},r.following?'gray':'green');
  button('rb',x+8,y-4,30,14,'<',()=>{RK.sel=-1;sfx('page')},'blue')}
function drawRank(){
  ctx.fillStyle='rgba(10,6,24,.5)';ctx.fillRect(0,0,W,H);
  const k=ease(clamp(panelT*3,0,1)),w=Math.min(W-10,226),h=Math.min(H-14,204),x=(W-w)/2|0,y=((H-h)/2+(1-k)*30)|0;
  panel(x,y,w,h,'wood');button('rcl',x+w-18,y-4,14,14,xIcon,()=>go(prevScene||'menu'),'red');
  txt(RK.sel>=0?'PROFIL':'PERINGKAT',x+12,y+10,UI.ink,2,0,UI.cream);
  if(RK.sel>=0){drawProfile(x,y,w,h);return}
  const msg=(s,c)=>wrap(s,w-24).forEach((l,i)=>txt(l,W/2,y+50+i*8,c||UI.wood,1,1));
  if(!ON||!sess()||!SY.ok){msg('LOGIN DULU UNTUK MELIHAT PERINGKAT DAN PROFIL PEMAIN');return}
  if(RK.ld){msg('MEMUAT'+['.','..','...'][Math.floor(T*2)%3]);return}
  if(RK.err){msg(RK.err,UI.red);button('rrt',(W-60)/2|0,y+100,60,14,'ULANGI',loadRank,'blue');return}
  const per=5,pages=Math.max(1,Math.ceil(RK.rows.length/per));RK.pg=clamp(RK.pg,0,pages-1);
  const rh=Math.min(27,((h-58)/per)|0),ly=y+27;
  RK.rows.slice(RK.pg*per,RK.pg*per+per).forEach((r,n)=>{
    const ry=ly+n*rh,rank=RK.pg*per+n+1,adm=r.role==='admin',me=r.id===LAKE.uid,lv=lvOf(+r.xp||0);
    R(x+7,ry+1,w-14,rh-2,UI.ink);R(x+8,ry+2,w-16,rh-4,me?'#ffe8b0':adm?'#fbeccc':'#e9d6aa');if(adm)R(x+8,ry+2,2,rh-4,'#ffd35a');
    txt(String(rank),x+12,ry+((rh-5)/2|0),UI.wood);
    R(x+24,ry+3,24,rh-6,'#4a86c0');portrait(x+36,ry+((rh/2)|0)+4,1,r.skin_c,[x+24,ry+3,24,rh-6]);
    const nm=fit(r.username,w-92);txt(nm,x+52,ry+4,UI.ink);if(adm)iconCheck(x+52+tw(nm)+3,ry+3);
    txt('LV'+lv+' '+Math.round(+r.total||0)+' IKAN',x+52,ry+13,UI.wood);
    if(adm)iconCrown(x+w-22,ry+((rh/2)|0)-4);
    btns.push({id:'rr'+n,x:x+7,y:ry,w:w-14,h:rh,fn:()=>{RK.sel=RK.pg*per+n;sfx('page')}})});
  const py=y+h-18;
  button('rpp',x+10,py,18,12,'<',()=>{RK.pg=(RK.pg+pages-1)%pages;sfx('page')},'blue');
  button('rpn',x+w-28,py,18,12,'>',()=>{RK.pg=(RK.pg+1)%pages;sfx('page')},'blue');
  txt('HAL '+(RK.pg+1)+'/'+pages,W/2,py+3,UI.ink,1,1)}

/* ============================================================================
   10. TOMBOL AKSES + PENGGAMBARAN
   ============================================================================ */
const _fr7=frame;
frame=function(now){
  _fr7(now);
  if(!fadeTo){if(scene==='rank')drawRank();else if(scene==='gear')drawGear()}
  if(gate()){btns.length=0;drawGate()}
  drawNotif()};
const _h7=drawHUD;
drawHUD=function(){
  _h7();if(scene!=='play')return;if(toast&&toast.s==='MEMOTRET...')return;
  if(ON)button('xrank',W-19,112,15,15,(a,b)=>iconRank(a+3,b+3),()=>openRank(),'blue');
  button('xgear',W-19,130,15,15,(a,b)=>iconGear(a+3,b+3),()=>openGear(),'gray')};
const _m7=drawMenu;
drawMenu=function(){
  _m7();
  if(ON)button('mrank',W-73,4,15,15,(a,b)=>iconRank(a+3,b+3),()=>{initAudio();openRank()},'blue');
  button('mgear',W-54,H-40,50,16,'GEAR',()=>{initAudio();openGear()},'blue')};
window.addEventListener('keydown',e=>{
  if(gate()){e.stopImmediatePropagation();e.preventDefault();return}
  if(e.code==='Escape'&&(scene==='rank'||scene==='gear'))go(prevScene||'menu')},true);
LAKE.v17=true;
})();

