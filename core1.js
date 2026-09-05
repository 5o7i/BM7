function showSection(name,btn){
  document.querySelectorAll('.section-view').forEach(s=>s.classList.remove('active'));
  const target=document.getElementById('section-'+name);
  if(target) target.classList.add('active');
  document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
  if(btn) btn.classList.add('active');
  else{
    const map={home:0,explore:1,communities:2,messages:3,notifications:4,creator:5,profile:6,settings:7,reels:8,trending:9,events:10,games:11,points:12};
    const b=document.querySelectorAll('.nav button')[map[name]];
    if(b) b.classList.add('active');
  }
  window.scrollTo({top:0,behavior:'smooth'});
}
function openCreator(){showSection('creator');document.getElementById('creator')?.scrollIntoView({behavior:'smooth'})}
function pick(el){el.parentElement.querySelectorAll('.choice').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');preview()}
function selectedText(label){const f=[...document.querySelectorAll('#section-creator .field')].find(x=>x.querySelector('label')?.textContent.trim()===label);return f?.querySelector('.choice.selected')?.textContent.trim()||''}
function preview(){const name=document.getElementById('charName')?.value.trim()||'Batman';const meta=(selectedText('الهوية')||'🦇 باتمان')+' • '+(selectedText('الفئة')||'🛡️ مقاتل')+' • '+(selectedText('القوة الرئيسية')||'🦇 مهارات قتالية');if(document.getElementById('previewName'))document.getElementById('previewName').textContent=name;if(document.getElementById('previewMeta'))document.getElementById('previewMeta').textContent=meta}
function saveChar(){const data={name:document.getElementById('charName').value.trim()||'Batman',identity:selectedText('الهوية'),gender:selectedText('الجنس'),class:selectedText('الفئة'),power:selectedText('القوة الرئيسية'),color:selectedText('اللون الأساسي'),mask:selectedText('القناع'),suit:selectedText('البدلة'),gear:selectedText('الأداة'),story:document.getElementById('charStory').value};localStorage.setItem('bm7_character',JSON.stringify(data));document.getElementById('profileName').textContent=data.name;showToast('تم حفظ الشخصية '+data.name+' بنجاح 🦇')}
function like(btn){let n=parseInt(btn.textContent.replace(/\D/g,''))||0;btn.textContent='♥ '+(n+1)}
function showToast(text){let t=document.getElementById('bm7Toast');if(!t){t=document.createElement('div');t.id='bm7Toast';t.className='toast';document.body.appendChild(t)}t.textContent=text;t.style.display='block';clearTimeout(window.bm7ToastTimer);window.bm7ToastTimer=setTimeout(()=>t.style.display='none',2200)}
function globalSearch(){const q=(document.getElementById('globalSearch')?.value||'').toLowerCase();document.querySelectorAll('.searchable-post').forEach(p=>p.style.display=(!q||p.textContent.toLowerCase().includes(q))?'block':'none')}
function filterFeed(type,btn){document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('sel'));btn.classList.add('sel');showToast(type==='all'?'عرض كل المنشورات':type==='following'?'عرض منشورات المتابعين':'عرض منشورات المجتمعات')}
window.addEventListener('load',()=>{const saved=localStorage.getItem('bm7_character');if(saved){try{const d=JSON.parse(saved);if(d.name)document.getElementById('profileName').textContent=d.name}catch(e){}}preview()});
(()=>{const add=()=>{if(document.getElementById('bm7DemoBtn'))return;const b=document.createElement('button');b.id='bm7DemoBtn';b.type='button';b.textContent='👀 دخول للمعاينة';b.style.cssText='position:fixed;top:62px;left:16px;z-index:999999;background:#202830;color:#ffc400;border:1px solid #ffc400;border-radius:10px;padding:11px 16px;font-weight:900;cursor:pointer;box-shadow:0 8px 25px #0008';b.onclick=()=>{localStorage.setItem('bm7_demo_mode','1');const modal=document.getElementById('bm7AuthModal');if(modal)modal.style.display='none';const box=document.getElementById('bm7AuthBox');if(box)box.style.display='none';const login=document.getElementById('bm7LoginFallback');if(login)login.style.display='none';const mini=document.getElementById('miniUsername');if(mini)mini.textContent='زائر • معاينة';showToast('دخلت وضع المعاينة 👀 — الحساب الحقيقي لم يتغير');};document.body.appendChild(b)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add()})();