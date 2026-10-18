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
