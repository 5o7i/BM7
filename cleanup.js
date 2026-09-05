(()=>{
const hide=(el)=>{if(el){el.style.display='none';el.setAttribute('data-bm7-demo-hidden','1')}};
function clean(){
  document.querySelectorAll('.message-row').forEach(hide);
  document.querySelectorAll('.notif-row').forEach(hide);
  document.querySelectorAll('.story').forEach((x,i)=>{if(i>0)hide(x)});
  document.querySelectorAll('.searchable-post').forEach(hide);
  const mockTexts=['Batman','Shadow','Speed','HeroX','Flash','Joker','Dark Knight','Flashpoint',"Joker's Den"];
  document.querySelectorAll('.card,.community-card,.explore-card').forEach(el=>{
    const t=(el.textContent||'').trim();
    if(mockTexts.some(x=>t.includes(x)) && !el.closest('#section-creator')) hide(el);
  });
  document.querySelectorAll('.nav-badge').forEach(hide);
  const notif=document.querySelector('#section-notifications');
  if(notif && !notif.querySelector('[data-bm7-empty]')){
    const box=document.createElement('div');box.className='card';box.dataset.bm7Empty='1';box.innerHTML='<div style="text-align:center;padding:38px;color:#888">🔔 لا توجد إشعارات بعد</div>';notif.appendChild(box)
  }
  const msg=document.querySelector('#section-messages');
  if(msg && !msg.querySelector('[data-bm7-empty]')){
    const rows=msg.querySelectorAll('.message-row'); if(!rows.length){const box=document.createElement('div');box.className='card';box.dataset.bm7Empty='1';box.innerHTML='<div style="text-align:center;padding:38px;color:#888">💬 لا توجد محادثات بعد</div>';msg.appendChild(box)}
  }
  addAvatar();
  wireButtons();
}
function addAvatar(){
  const profile=document.getElementById('section-profile');
  if(!profile || document.getElementById('bm7AvatarPicker')) return;
  const target=profile.querySelector('.avatar') || profile;
  const wrap=document.createElement('div');wrap.style.cssText='margin:14px 0;display:flex;gap:10px;align-items:center;flex-wrap:wrap';
  const input=document.createElement('input');input.type='file';input.accept='image/*';input.id='bm7AvatarPicker';input.style.display='none';
  const btn=document.createElement('button');btn.className='btn gold';btn.type='button';btn.textContent='🖼️ اختر افتارك';btn.onclick=()=>input.click();
  input.onchange=()=>{const f=input.files?.[0];if(!f)return;if(!f.type.startsWith('image/'))return showToast('اختر صورة فقط');const r=new FileReader();r.onload=()=>{localStorage.setItem('bm7_avatar',r.result);applyAvatar(r.result);showToast('تم حفظ الافتار ✨')};r.readAsDataURL(f)};
  wrap.append(btn,input);profile.insertBefore(wrap,profile.firstChild);const saved=localStorage.getItem('bm7_avatar');if(saved)applyAvatar(saved);
}
function applyAvatar(src){document.querySelectorAll('.avatar,.story-avatar').forEach(el=>{if(el.id==='bm7AvatarPicker')return;el.style.backgroundImage=`url(${src})`;el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.textContent=''})}
function wireButtons(){
  window.toast=window.toast||window.showToast;
  window.bm7Share=window.bm7Share||(()=>showToast('تم تجهيز المشاركة ✨'));
  window.bm7Comment=window.bm7Comment||(()=>showToast('التعليقات جاهزة 💬'));
  window.bm7Message=window.bm7Message||((name)=>showToast('ابدأ محادثة مع '+name+' 💬'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(clean,50));else setTimeout(clean,50);
setTimeout(clean,700);setTimeout(clean,1800);
})();