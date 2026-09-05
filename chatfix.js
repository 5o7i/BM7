(()=>{
function getContacts(){
 return [...document.querySelectorAll('#bm7Contacts .bm7-contact')].map(row=>{
  const raw=row.getAttribute('onclick')||'';
  const m=raw.match(/bm7RealtimeChat\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/);
  return m?{id:m[2],name:m[1],row}:null;
 }).filter(Boolean);
function repair(){
 const list=document.getElementById('bm7ChatList'); if(!list)return;
 const contacts=getContacts(); if(!contacts.length)return;
 if(list.children.length && !/لا توجد محادثات بعد/.test(list.textContent||''))return;
 list.innerHTML=contacts.map(c=>`<div class="bm7-chat-person" data-id="${String(c.id).replace(/[^a-zA-Z0-9_-]/g,'')}"><div class="ava">🦇</div><div class="dot"></div><div class="meta"><b>@${String(c.name).replace(/[&<>]/g,'')}</b><div class="preview">ابدأ محادثة جديدة</div></div></div>`).join('');
 list.querySelectorAll('.bm7-chat-person').forEach(el=>el.onclick=()=>{const c=contacts.find(x=>String(x.id).replace(/[^a-zA-Z0-9_-]/g,'')===el.dataset.id);if(c&&window.openBM7Chat)window.openBM7Chat(c.name,c.id)});
}
const start=()=>{repair();const target=document.getElementById('bm7ChatList');if(target)new MutationObserver(()=>setTimeout(repair,0)).observe(target,{childList:true});};
setTimeout(start,900);setTimeout(repair,1800);setTimeout(repair,3000);
})();