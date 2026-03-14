// ═══ STATE ═══
let PL=[], CI=-1, playing=false;
let annots={}, pendAnn=null, selC='#FFFD82';
const SK='cdmk_an', PK='cdmk_pl';
let burned=false;
let artDataUrl=null;

// ═══ WINDOW MANAGEMENT ═══
let topZ=20;
const WINS=['wplayer','wlyrics','wsticky'];

function OW(id){
  const e=document.getElementById(id);
  e.style.display='flex';
  FR(id);
}
function CW(id){document.getElementById(id).style.display='none';}
function MW(id){document.getElementById(id).style.display='none';}

function FR(id){
  [...WINS,'wiz'].forEach(w=>{
    const e=document.getElementById(w);
    if(e){e.classList.remove('aw');e.classList.add('ia');}
  });
  const e=document.getElementById(id);
  if(!e)return;
  e.style.zIndex=++topZ;
  e.classList.remove('ia');e.classList.add('aw');
}
[...WINS,'wiz'].forEach(id=>{
  const e=document.getElementById(id);
  if(e)e.addEventListener('mousedown',()=>FR(id),true);
});

// ═══ DRAG ═══
let dE=null,dX=0,dY=0;
function DR(ev,id){
  dE=document.getElementById(id);
  // remove transform for centered windows before dragging
  dE.style.transform='none';
  const r=dE.getBoundingClientRect();
  dX=ev.clientX-r.left; dY=ev.clientY-r.top;
  FR(id); ev.preventDefault();
}
document.addEventListener('mousemove',ev=>{
  if(!dE)return;
  dE.style.left=Math.max(0,Math.min(ev.clientX-dX,innerWidth-80))+'px';
  dE.style.top=Math.max(0,Math.min(ev.clientY-dY,innerHeight-60))+'px';
});
document.addEventListener('mouseup',()=>dE=null);

// ═══ WIZARD STEPS ═══
let curStep=0;
function goStep(n){
  // validate step 0 → 1
  if(n===1 && PL.length<3){
    alert('Please add at least 3 songs before continuing!');return;
  }
  document.getElementById('step'+curStep).classList.remove('active');
  document.getElementById('dot'+curStep).classList.remove('active');
  document.getElementById('dot'+curStep).classList.add('done');
  curStep=n;
  document.getElementById('step'+n).classList.add('active');
  // update dot
  for(let i=0;i<3;i++){
    const d=document.getElementById('dot'+i);
    if(i<n){d.classList.add('done');d.classList.remove('active');}
    else if(i===n){d.classList.add('active');d.classList.remove('done');}
    else{d.classList.remove('done','active');}
  }
  const titles=['Step 1 of 3 — Add Songs','Step 2 of 3 — Upload CD Art','Step 3 of 3 — Burn!'];
  const ticons=['data:image/png;base64,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','data:image/png;base64,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','data:image/png;base64,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'];
  document.getElementById('wiz-title').textContent=titles[n];
}

function confirmClose(){
  if(!burned && !confirm('Exit CD Maker 2003? Your playlist will not be burned.'))return;
  CW('wiz');
}

// ═══ SEARCH ═══
function esc(s){return(s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/</g,'&lt;');}

async function DS(){
  const song=document.getElementById('qs').value.trim();
  const art=document.getElementById('qa').value.trim();
  if(!song&&!art)return;
  const rl=document.getElementById('rl');
  rl.style.display='block';
  rl.innerHTML='<div class="ri">🔍 Searching...</div>';
  setSt('Searching...');

  // 1. MusicBrainz
  try{
    const q=song&&art?("recording:'"+song+"' AND artist:'"+art+"'"):song?("recording:'"+song+"'"):("artist:'"+art+"'");
    const r=await fetch(`https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(q)}&limit=12&fmt=json`,
      {headers:{'User-Agent':'CDMaker2003/1.0'}});
    if(r.ok){
      const d=await r.json();
      const h=(d.recordings||[]).filter(x=>x['artist-credit']?.length);
      if(h.length){
        showR(h.slice(0,10).map(x=>({
          title:x.title,
          artist:x['artist-credit'].map(c=>c.artist?.name||c.name).filter(Boolean).join(', ')
        })));setSt('Results from MusicBrainz');return;
      }
    }
  }catch(e){}

  // 2. iTunes
  try{
    const t=encodeURIComponent((art?art+' ':'')+song);
    const r=await fetch(`https://itunes.apple.com/search?term=${t}&media=music&entity=song&limit=12`);
    if(r.ok){
      const d=await r.json();
      if(d.results?.length){
        showR(d.results.slice(0,10).map(x=>({title:x.trackName,artist:x.artistName,preview:x.previewUrl})));
        setSt('Results from iTunes');return;
      }
    }
  }catch(e){}

  // 3. lyrics.ovh
  try{
    const q=encodeURIComponent((art?art+' ':'')+song);
    const r=await fetch(`https://api.lyrics.ovh/suggest/${q}`);
    if(r.ok){
      const d=await r.json();
      if(d.data?.length){
        showR(d.data.slice(0,10).map(x=>({title:x.title,artist:x.artist.name})));
        setSt('Results from lyrics.ovh');return;
      }
    }
  }catch(e){}

  rl.innerHTML='<div class="ri" style="color:#888;">No results. Try different search terms.</div>';
  setSt('No results found.');
}

function showR(arr){
  document.getElementById('rl').innerHTML=arr.map(t=>
    `<div class="ri" onclick="addT('${esc(t.title)}','${esc(t.artist)}','${t.preview||''}')">
      🎵 <b>${t.title}</b> — <span class="ri-art">${t.artist}</span>
    </div>`
  ).join('');
}

document.addEventListener('click',e=>{
  if(!e.target.closest('#rl')&&!e.target.closest('.sr'))
    document.getElementById('rl').style.display='none';
});

// ═══ PLAYLIST ═══
function addT(title,artist,preview){
  if(PL.length>=5){alert('Max 5 tracks!');return;}
  if(PL.find(t=>t.title===title&&t.artist===artist))return;
  PL.push({title,artist,preview:preview||null,lyrics:null,loaded:false});
  document.getElementById('rl').style.display='none';
  document.getElementById('qs').value='';
  document.getElementById('qa').value='';
  renderPL();savePL();setSt('Added: '+title);
}
function removeT(i){
  PL.splice(i,1);
  if(CI>=PL.length)CI=PL.length-1;
  renderPL();savePL();
  if(PL.length&&CI>=0)selT(CI);
  else{CI=-1;stopPlay();}
}
function renderPL(){
  const el=document.getElementById('pl');
  const cnt=PL.length;
  document.getElementById('plc').textContent=`(${cnt} / 5 songs)`;
  document.getElementById('st1').textContent=cnt+'/5 tracks';
  document.getElementById('btn-next1').disabled=cnt<3;
  if(!cnt){
    el.innerHTML='<div style="padding:10px;color:#AAA;font-style:italic;text-align:center;">No songs yet — search above!</div>';
    return;
  }
  el.innerHTML=PL.map((t,i)=>`
    <div class="pi ${i===CI?'a':''}" onclick="selT(${i})">
      <span class="pn">${i+1}</span>
      <span class="pt">
        <div class="pt-t">${t.title}</div>
        <div class="pt-a">${t.artist}</div>
      </span>
      <span class="px" onclick="event.stopPropagation();removeT(${i})">×</span>
    </div>`).join('');
}
function savePL(){
  try{localStorage.setItem(PK,JSON.stringify(PL.map(t=>({title:t.title,artist:t.artist,preview:t.preview}))));}catch(e){}
}
function loadPL(){
  try{
    const d=JSON.parse(localStorage.getItem(PK)||'[]');
    d.forEach(t=>PL.push({...t,lyrics:null,loaded:false}));renderPL();
  }catch(e){}
}

function UCN(){
  document.getElementById('cdNameLbl').textContent=document.getElementById('cdn').value||'My Mix';
}

// ═══ CD ART ═══
function handleArt(e){
  const f=e.target.files[0];if(!f)return;
  if(f.type!=='image/png'&&!f.name.endsWith('.png')){alert('PNG files only!');return;}
  const reader=new FileReader();
  reader.onload=ev=>{
    artDataUrl=ev.target.result;
    // Update wizard preview
    const prev=document.getElementById('artPreview');
    prev.src=artDataUrl;prev.style.display='block';
    document.getElementById('artZoneText').style.display='none';
    document.getElementById('artName').textContent='✅ '+f.name;
    // Apply to CD disc - force display with explicit inline styles
    applyArtToDisc();
  };
  reader.readAsDataURL(f);
}

function applyArtToDisc(){
  if(!artDataUrl)return;
  const cda=document.getElementById('cdArtImg');
  // Force all styles inline to guarantee visibility
  cda.src=artDataUrl;
  cda.style.cssText='position:absolute;inset:0;width:180px;height:180px;border-radius:50%;object-fit:cover;display:block;z-index:1;transform-origin:center center;';
  // Hide rainbow base
  const cdr=document.getElementById('cdr');
  cdr.style.display='none';
}
// drag & drop on art zone
const az=document.getElementById('artZone');
az.addEventListener('dragover',e=>{e.preventDefault();az.style.borderColor='#316AC5';});
az.addEventListener('dragleave',()=>az.style.borderColor='');
az.addEventListener('drop',e=>{
  e.preventDefault();az.style.borderColor='';
  const f=e.dataTransfer.files[0];
  if(f){
    const inp=document.getElementById('artInput');
    const dt=new DataTransfer();dt.items.add(f);
    inp.files=dt.files;handleArt({target:inp});
  }
});

// ═══ BURN SEQUENCE ═══
const BM=[
  {t:'Initializing burn sequence...'},
  {t:'Calibrating laser...'},
  {t:'Writing track data...'},
  {t:'Encoding audio...'},
  {t:'Verifying sectors...'},
  {t:'Writing TOC...'},
  {t:'Finalizing disc...'},
  {t:'Almost done...'},
];
let bInt=null, bSt=0;

function startBurn(){
  burnGo();
}
function burnGo(){
  bSt=0;
  document.getElementById('bbar-wrap').style.display='block';
  document.getElementById('burn-nav').style.display='none';
  document.getElementById('burnTitle').textContent='Burning...';
  document.getElementById('burnIcon').textContent='';
  document.getElementById('burnDesc').style.display='none';
  bInt=setInterval(()=>{
    if(bSt>=BM.length){
      clearInterval(bInt);
      setTimeout(()=>showBD('bddone'),200);
      return;
    }
    const m=BM[bSt];
    document.getElementById('bdt').textContent=m.t;
    document.getElementById('blbl').textContent=m.t;
    document.getElementById('bi').style.width=Math.round((bSt+1)/BM.length*100)+'%';
    document.getElementById('bi').style.background='linear-gradient(90deg,#1A7A1A,#5EB85E)';
    bSt++;
  },550);
}
function cancelBurn(){
  clearInterval(bInt);
  document.getElementById('bbar-wrap').style.display='none';
  document.getElementById('burn-nav').style.display='flex';
  document.getElementById('burnTitle').textContent='Ready to Burn!';
  document.getElementById('burnIcon').textContent='';
  document.getElementById('burnDesc').style.display='';
  document.getElementById('bi').style.width='0%';
}
function burnDone(){
  hideBD('bddone');
  burned=true;
  CW('wiz');
  document.body.style.backgroundImage='url(background.jpg)';
  document.body.style.backgroundSize='cover';
  document.body.style.backgroundPosition='center';
  ['di-player','di-lyrics','di-sticky'].forEach((id,i)=>{
    setTimeout(()=>{
      const el=document.getElementById(id);
      if(el)el.classList.add('vis');
    },i*200);
  });
  renderStickyList();
  setTimeout(()=>openPostBurn(),400);
}
function openPostBurn(){
  const wp=document.getElementById('wplayer');
  const wl=document.getElementById('wlyrics');
  const ws=document.getElementById('wsticky');
  wp.style.top='50px'; wp.style.left='120px';
  wl.style.top='50px'; wl.style.left='460px';
  ws.style.top='390px'; ws.style.left='120px';
  OW('wplayer');
  setTimeout(()=>OW('wlyrics'),300);
  setTimeout(()=>OW('wsticky'),600);
  applyArtToDisc();
  if(PL.length>0)selT(0);
  // Spawn a heart window for each uploaded photo
  photos.forEach((p,i)=>{
    if(p)setTimeout(()=>spawnHeartWindow(i),900+i*300);
  });
}
function showBD(id){document.getElementById(id).classList.add('show');}
function hideBD(id){document.getElementById(id).classList.remove('show');}

// ═══ PLAYBACK ═══
async function selT(idx){
  CI=idx;renderPL();
  const t=PL[idx];
  document.getElementById('npa').textContent=t.artist;
  document.getElementById('nps').textContent=t.title;
  document.getElementById('wpt').textContent='💿 '+t.title;
  loadLyrics(t,idx);

  const aud=document.getElementById('aud');
  aud.pause();

  let purl=t.preview;
  if(!purl){
    try{
      const q=encodeURIComponent(t.title+' '+t.artist);
      const r=await fetch(`https://itunes.apple.com/search?term=${q}&media=music&entity=song&limit=5`);
      const d=await r.json();
      if(d.results?.length){
        const m=d.results.find(x=>x.previewUrl)||d.results[0];
        purl=m.previewUrl; t.preview=purl;
        if(m.artworkUrl100&&!artDataUrl){/* could show album art */}
        savePL();
      }
    }catch(e){}
  }

  if(purl){
    aud.src=purl;
    aud.load();
    aud.play().catch(()=>{});
    setP(true);
  } else {
    setP(true);
  }
}
function setP(v){
  playing=v;
  // Spin only the art image (or the rainbow disc if no art)
  const artImg=document.getElementById('cdArtImg');
  const discRainbow=document.getElementById('cdr');
  const target=artImg&&artImg.style.display!=='none'?artImg:discRainbow;
  if(target)target.classList.toggle('sp',v);
  document.getElementById('playBtn').textContent=v?'⏸':'▶';
}
function TP(){
  const a=document.getElementById('aud');
  if(!a.src){if(CI>=0)selT(CI);return;}
  if(playing){a.pause();setP(false);}
  else{a.play();setP(true);}
}
function stopPlay(){
  const a=document.getElementById('aud');a.pause();a.src='';
  setP(false);
}
function prevT(){if(PL.length&&CI>0)selT(CI-1);}
function nextT(){if(PL.length&&CI<PL.length-1)selT(CI+1);}
function TU(){
  const a=document.getElementById('aud');
  if(a.duration)document.getElementById('skf').style.width=(a.currentTime/a.duration*100)+'%';
}

// ═══ LYRICS ═══
async function loadLyrics(track,ti){
  const el=document.getElementById('lyb');
  document.getElementById('lytTitle').textContent='📝 '+track.title+' — '+track.artist;
  if(track.loaded){renderLyrics(track.lyrics,ti);return;}
  el.innerHTML='<div class="ly-empty">Loading lyrics...</div>';
  try{
    // Try lrclib.net (free, no auth required)
    const r=await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(track.title)}&artist_name=${encodeURIComponent(track.artist)}`);
    if(r.ok){
      const d=await r.json();
      if(d&&d.length&&(d[0].plainLyrics||d[0].syncedLyrics)){
        track.loaded=true;
        // Prefer plain lyrics; strip timestamps from synced if needed
        let lyr=d[0].plainLyrics||d[0].syncedLyrics.replace(/\[\d+:\d+\.\d+\]/g,'').trim();
        track.lyrics=lyr||null;
        renderLyrics(track.lyrics,ti);return;
      }
    }
  }catch(e){}
  // Fallback: try lyrics.ovh
  try{
    const r=await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(track.artist)}/${encodeURIComponent(track.title)}`);
    const d=await r.json();
    track.loaded=true;track.lyrics=d.lyrics||null;
    renderLyrics(track.lyrics,ti);return;
  }catch(e){}
  track.loaded=true;track.lyrics=null;renderLyrics(null,ti);
}
function renderLyrics(lyrics,ti){
  const el=document.getElementById('lyb');
  if(!lyrics){el.innerHTML='<div class="ly-empty">😔 Lyrics not found for this track.</div>';return;}
  el.innerHTML=lyrics.split('\n').map((line,i)=>{
    const key=ti+'_'+i,has=!!annots[key];
    return `<span class="ll ${has?'hn':''}" data-key="${key}" onclick="openAnn(${ti},${i},this)"
      >${line||'&nbsp;'}<span class="ph">📌 add note</span></span>`;
  }).join('');
}

// ═══ ANNOTATIONS ═══
function openAnn(ti,li,el){
  pendAnn={ti,li};
  const key=ti+'_'+li,ex=annots[key];
  const lt=el.textContent.replace('📌 add note','').trim();
  document.getElementById('annPrev').textContent='"'+(lt.substring(0,80))+(lt.length>80?'…':'')+'"';
  document.getElementById('annText').value=ex?ex.text:'';
  if(ex)pickCV(ex.color);else pickCV('#FFFD82');
  document.getElementById('annModal').classList.add('show');
  setTimeout(()=>document.getElementById('annText').focus(),80);
}
function CA(){document.getElementById('annModal').classList.remove('show');pendAnn=null;}
function PC(el){document.querySelectorAll('.csw').forEach(s=>s.classList.remove('pk'));el.classList.add('pk');selC=el.dataset.c;}
function pickCV(c){document.querySelectorAll('.csw').forEach(s=>{s.classList.remove('pk');if(s.dataset.c===c)s.classList.add('pk');});selC=c;}
function SA(){
  if(!pendAnn)return;
  const txt=document.getElementById('annText').value.trim();if(!txt){CA();return;}
  const {ti,li}=pendAnn,key=ti+'_'+li,t=PL[ti];
  const lel=document.querySelector(`[data-key="${key}"]`);
  const lt=lel?lel.textContent.replace('📌 add note','').trim():'';
  annots[key]={text:txt,color:selC,song:t.title,artist:t.artist,line:lt};
  if(lel)lel.classList.add('hn');
  saveAnn();
  CA();
  spawnStickyWindow(key,annots[key]);
  renderStickyList();
}

// ─── FLOATING STICKY WINDOWS ───
let stickyZ=200;
function spawnStickyWindow(key,ann,x,y){
  // Remove existing window for this key if any
  const old=document.getElementById('sw_'+key);
  if(old)old.remove();

  const w=document.createElement('div');
  w.id='sw_'+key;
  w.className='sticky-win';
  w.style.cssText=`
    position:fixed;
    left:${x||Math.random()*40+30}%;
    top:${y||Math.random()*30+20}%;
    width:200px;min-height:140px;
    background:${ann.color};
    border:2px solid ${dk(ann.color,40)};
    border-radius:2px;
    box-shadow:4px 4px 10px rgba(0,0,0,0.35);
    z-index:${++stickyZ};
    display:flex;flex-direction:column;
    resize:both;overflow:auto;
    font-family:'Press Start 2P',monospace;
  `;

  w.innerHTML=`
    <div class="sw-tb" style="background:${dk(ann.color,35)};padding:4px 6px;display:flex;align-items:center;justify-content:space-between;cursor:move;flex-shrink:0;border-bottom:1px solid ${dk(ann.color,60)};">
      <span style="font-size:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:130px;color:#333;">${ann.song}</span>
      <span style="cursor:pointer;font-size:14px;color:#555;line-height:1;" onclick="closeStickyWin('${key}')">×</span>
    </div>
    <div style="padding:7px;flex:1;font-size:7px;color:#333;line-height:1.8;word-break:break-word;">${ann.text}</div>
    <div style="padding:3px 7px 5px;font-size:6px;color:#666;font-style:italic;border-top:1px solid ${dk(ann.color,30)};word-break:break-word;">"${(ann.line||'').substring(0,50)}${(ann.line||'').length>50?'…':''}"</div>
    <div style="padding:3px 5px;display:flex;justify-content:flex-end;gap:4px;flex-shrink:0;">
      <span style="font-size:9px;cursor:pointer;color:#800000;" title="Delete note" onclick="delAnn('${key}')">🗑</span>
    </div>
  `;

  // Drag logic on the title bar
  const tb=w.querySelector('.sw-tb');
  let dx=0,dy=0,dragging=false;
  tb.addEventListener('mousedown',ev=>{
    dragging=true;
    w.style.zIndex=++stickyZ;
    dx=ev.clientX-w.getBoundingClientRect().left;
    dy=ev.clientY-w.getBoundingClientRect().top;
    ev.preventDefault();
  });
  document.addEventListener('mousemove',ev=>{
    if(!dragging)return;
    w.style.left=Math.max(0,ev.clientX-dx)+'px';
    w.style.top=Math.max(0,ev.clientY-dy)+'px';
  });
  document.addEventListener('mouseup',()=>{dragging=false;});
  w.addEventListener('mousedown',()=>w.style.zIndex=++stickyZ);

  document.body.appendChild(w);
}

function closeStickyWin(key){
  const el=document.getElementById('sw_'+key);
  if(el)el.remove();
}

function renderStickyList(){
  // Update the sticky notes window list (compact summary)
  const el=document.getElementById('stb');
  const ks=Object.keys(annots);
  if(!ks.length){
    el.innerHTML='<div class="ste">📌 No sticky notes yet.<br>Click a lyric line to annotate!</div>';
    // Add share button if burned
    if(burned)appendShareBtn(el);
    return;
  }
  el.innerHTML=ks.map(k=>{
    const a=annots[k];
    return `<div class="sc" style="background:${a.color};cursor:pointer;" onclick="spawnStickyWindow('${k}',annots['${k}'])">
      <div class="sch" style="background:${dk(a.color,30)};">
        <span class="scs">${a.song} — ${a.artist}</span>
        <span class="scd" onclick="event.stopPropagation();delAnn('${k}')">×</span>
      </div>
      <div class="scb">${a.text.substring(0,60)}${a.text.length>60?'…':''}</div>
    </div>`;
  }).join('');
  if(burned)appendShareBtn(el);
}

function appendShareBtn(container){
  const d=document.createElement('div');
  d.style.cssText='padding:8px;border-top:1px solid #C8C4B8;margin-top:4px;';
  d.innerHTML=`<button class="share-btn" style="width:100%;" onclick="openShareModal()">🔗 Share My Annotated Mix</button>`;
  container.appendChild(d);
}
function delAnn(key){
  delete annots[key];saveAnn();
  closeStickyWin(key);
  renderStickyList();
  const el=document.querySelector(`[data-key="${key}"]`);
  if(el)el.classList.remove('hn');
}
function saveAnn(){try{localStorage.setItem(SK,JSON.stringify(annots));}catch(e){}}
function loadAnn(){try{const d=localStorage.getItem(SK);if(d)annots=JSON.parse(d);}catch(e){}}
function dk(h,a){
  const n=parseInt(h.replace('#',''),16);
  return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,v-a).toString(16).padStart(2,'0')).join('');
}
// ═══ STATUS ═══
function setSt(m){document.getElementById('st2').textContent=m;}

// ═══ PHOTO VIEWER ═══
let photos=[null,null,null];
let photoWinZ=300;

function triggerPhoto(slot){
  document.getElementById('photoInput'+slot).click();
}

function loadPhoto(slot,e){
  const f=e.target.files[0];if(!f)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    photos[slot]={dataUrl:ev.target.result,rotation:0};
    // Update slot preview in burn dialog
    const img=document.getElementById('pimg'+slot);
    const slot_el=document.getElementById('pslot'+slot);
    if(img){img.src=ev.target.result;slot_el.classList.add('has-img');}
  };
  reader.readAsDataURL(f);
}

function spawnHeartWindow(slot){
  if(!photos[slot])return;
  // Remove existing heart window for this slot
  const old=document.getElementById('hw_'+slot);
  if(old)old.remove();

  const p=photos[slot];
  const offsets=[[120,80],[360,120],[600,80]];
  const [lx,ly]=offsets[slot];
  const labels=['Photo 1','Photo 2','Photo 3'];

  const hw=document.createElement('div');
  hw.id='hw_'+slot;
  hw.className='heart-win';
  hw.style.cssText=`left:${lx}px;top:${ly}px;z-index:${++photoWinZ};`;

  hw.innerHTML=`
    <svg class="heart-svg" viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="hclip${slot}">
          <path d="M110,175 C110,175 10,110 10,60 C10,30 30,10 60,10 C80,10 100,25 110,40 C120,25 140,10 160,10 C190,10 210,30 210,60 C210,110 110,175 110,175 Z"/>
        </clipPath>
        <filter id="hshadow${slot}">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(180,0,80,0.5)"/>
        </filter>
      </defs>
      <!-- Heart outline/bg -->
      <path d="M110,175 C110,175 10,110 10,60 C10,30 30,10 60,10 C80,10 100,25 110,40 C120,25 140,10 160,10 C190,10 210,30 210,60 C210,110 110,175 110,175 Z"
        fill="#ffb6c1" stroke="#e75480" stroke-width="3" filter="url(#hshadow${slot})"/>
      <!-- Photo clipped to heart -->
      <image href="${p.dataUrl}" x="10" y="10" width="200" height="165"
        clip-path="url(#hclip${slot})" preserveAspectRatio="xMidYMid slice"
        id="himg${slot}"
        transform="rotate(${p.rotation},110,92)"/>
      <!-- Sheen overlay -->
      <path d="M110,175 C110,175 10,110 10,60 C10,30 30,10 60,10 C80,10 100,25 110,40 C120,25 140,10 160,10 C190,10 210,30 210,60 C210,110 110,175 110,175 Z"
        fill="url(#hshine${slot})" opacity="0.18"/>
      <defs>
        <linearGradient id="hshine${slot}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="white" stop-opacity="0.7"/>
          <stop offset="50%" stop-color="white" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
    <!-- Controls bar -->
    <div class="hw-bar">
      <span class="hw-title">${labels[slot]}</span>
      <div class="hw-btns">
        <button class="hw-btn" onclick="heartRotate(${slot},-1)" title="Rotate left">↺</button>
        <button class="hw-btn" onclick="heartRotate(${slot},1)" title="Rotate right">↻</button>
        <button class="hw-btn hw-del" onclick="deleteHeartWin(${slot})" title="Delete">×</button>
      </div>
    </div>
  `;

  // Drag on the SVG heart
  const svg=hw.querySelector('.heart-svg');
  let dragging=false,dx=0,dy=0;
  svg.addEventListener('mousedown',ev=>{
    dragging=true;
    hw.style.zIndex=++photoWinZ;
    dx=ev.clientX-hw.getBoundingClientRect().left;
    dy=ev.clientY-hw.getBoundingClientRect().top;
    ev.preventDefault();
  });
  document.addEventListener('mousemove',ev=>{
    if(!dragging)return;
    hw.style.left=Math.max(0,ev.clientX-dx)+'px';
    hw.style.top=Math.max(0,ev.clientY-dy)+'px';
  });
  document.addEventListener('mouseup',()=>{dragging=false;});
  hw.addEventListener('mousedown',()=>hw.style.zIndex=++photoWinZ);

  document.body.appendChild(hw);
}

function heartRotate(slot,dir){
  if(!photos[slot])return;
  photos[slot].rotation=(photos[slot].rotation+dir*90+360)%360;
  // Update the SVG image transform
  const himg=document.getElementById('himg'+slot);
  if(himg)himg.setAttribute('transform',`rotate(${photos[slot].rotation},110,92)`);
}

function deleteHeartWin(slot){
  photos[slot]=null;
  const hw=document.getElementById('hw_'+slot);
  if(hw)hw.remove();
  // clear slot in burn dialog
  const img=document.getElementById('pimg'+slot);
  const slot_el=document.getElementById('pslot'+slot);
  if(img){img.src='';slot_el&&slot_el.classList.remove('has-img');}
}

// ═══ INIT ═══
loadAnn();loadPL();renderStickyList();
FR('wiz');

// ═══ SHARE VIA LINK ═══
function buildShareURL(){
  const cdName=document.getElementById('cdn').value||'My Awesome Mix';
  // Only share playlist + name + annotations — NO art/photos (base64 makes URL too long)
  const data={
    cdName,
    playlist:PL.map(t=>({title:t.title,artist:t.artist,preview:t.preview||''})),
    annotations:annots
  };
  const json=JSON.stringify(data);
  const b64=btoa(unescape(encodeURIComponent(json)));
  // Use # hash — never sent to server, avoids URI_TOO_LONG on Vercel
  const base=window.location.href.split('#')[0].split('?')[0];
  return base+'#share='+b64;
}

function openShareModal(){
  if(PL.length<1){alert('Add at least 1 song to share!');return;}
  const url=buildShareURL();
  const inp=document.getElementById('shareUrlBox');
  inp.value=url;
  document.getElementById('shareModal').classList.add('show');
  document.getElementById('shareCopied').style.display='none';
  setTimeout(()=>{inp.focus();inp.select();},80);
}

function copyShareURL(){
  const inp=document.getElementById('shareUrlBox');
  inp.select();
  navigator.clipboard.writeText(inp.value).then(()=>{
    const lbl=document.getElementById('shareCopied');
    lbl.style.display='block';
    setTimeout(()=>lbl.style.display='none',2500);
  }).catch(()=>{
    document.execCommand('copy');
    const lbl=document.getElementById('shareCopied');
    lbl.style.display='block';
    setTimeout(()=>lbl.style.display='none',2500);
  });
}

function closeShareModal(){
  document.getElementById('shareModal').classList.remove('show');
}

// Load shared data from URL hash on page load
function loadFromURL(){
  try{
    const hash=window.location.hash; // e.g. #share=xxxxx
    if(!hash.startsWith('#share='))return;
    const b64=hash.slice(7); // strip '#share='
    const json=decodeURIComponent(escape(atob(b64)));
    const data=JSON.parse(json);
    if(data.cdName){
      document.getElementById('cdn').value=data.cdName;
      document.getElementById('cdNameLbl').textContent=data.cdName;
    }
    if(data.playlist&&Array.isArray(data.playlist)){
      PL=[];
      data.playlist.forEach(t=>PL.push({title:t.title,artist:t.artist,preview:t.preview||null,lyrics:null,loaded:false}));
      renderPL();savePL();
    }
    if(data.annotations&&typeof data.annotations==='object'){
      annots=data.annotations;saveAnn();renderStickyList();
    }
    setSt('Shared mix loaded!');
    const toast=document.createElement('div');
    toast.style.cssText='position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#0A246A;color:white;padding:10px 18px;border-radius:4px;font-family:"Press Start 2P",monospace;font-size:7px;z-index:99999;border:2px solid #90D0FF;box-shadow:3px 3px 10px rgba(0,0,0,0.5);text-align:center;line-height:2;';
    toast.textContent='Shared mix loaded! Check your playlist.';
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(),4000);
  }catch(e){console.log('Share load error:',e);}
}
loadFromURL();
