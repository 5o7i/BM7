(function(){
const K='bm7_ux_v4';
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
window.closeBM7Modal=()=>document.getElementById('bm7ActionModal')?.classList.remove('open');
function modal(title,body){const m=document.getElementById('bm7ActionModal'),b=document.getElementById('bm7ModalBody');if(!m||!b)return;b.innerHTML='<h3>'+title+'</h3>'+body;m.classList.add('open')}
window.bm7Comment=function(id){
const all=get('bm7_comments_v4',{}),a=all[id]||[];
modal('💬 التعليقات','<div>'+(a.length?a.map(x=>'<div class="bm7-comment"><b>'+esc(x.user)+'</b><div>'+esc(x.text)+'</div><span class="bm7-muted">'+esc(x.time)+'</span></div>').join(''):'<div class="bm7-muted">لا توجد تعليقات بعد.</div>')+'</div><textarea id="bm7CommentText" class="bm7-textarea" placeholder="اكتب تعليقك..."></textarea><button class="btn gold" onclick="bm7SaveComment(\''+id+'\')">نشر التعليق</button>');
};
window.bm7SaveComment=function(id){const t=document.getElementById('bm7CommentText');if(!t||!t.value.trim())return;const all=get('bm7_comments_v4',{});all[id]=all[id]||[];all[id].push({user:localStorage.getItem('bm7_username')||'عضو BM7',text:t.value.trim(),time:new Date().toLocaleString('ar-SA')});put('bm7_comments_v4',all);if(typeof addXP==='function')addXP(5,'تعليق');bm7Comment(id)};
window.bm7Share=function(){if(navigator.clipboard)navigator.clipboard.writeText(location.href).catch(()=>{});showToast('تم نسخ رابط BM7 للمشاركة 🔗');if(typeof addXP==='function')addXP(1,'مشاركة')};
window.bm7Join=function(id,btn){const j=get('bm7_joins_v4',{});j[id]=!j[id];put('bm7_joins_v4',j);btn.textContent=j[id]?'✓ عضو':'انضمام';showToast(j[id]?'تم الانضمام للمجتمع 👥':'تم مغادرة المجتمع');if(j[id]&&typeof addXP==='function')addXP(10,'انضمام لمجتمع')};
window.bm7Message=function(name){const a=get('bm7_chat_'+name,[]);modal('💬 محادثة مع '+esc(name),'<div style="min-height:150px">'+(a.length?a.map(x=>'<div class="bm7-comment">'+esc(x)+'</div>').join(''):'<div class="bm7-muted">ابدأ المحادثة الآن.</div>')+'</div><textarea id="bm7Msg" class="bm7-textarea" placeholder="اكتب رسالتك..."></textarea><button class="btn gold" onclick="bm7SendMessage(\''+encodeURIComponent(name)+'\')">إرسال</button>')};
window.bm7SendMessage=function(n){const name=decodeURIComponent(n),t=document.getElementById('bm7Msg');if(!t||!t.value.trim())return;const k='bm7_chat_'+name,a=get(k,[]);a.push(t.value.trim());put(k,a);if(typeof addXP==='function')addXP(3,'رسالة');bm7Message(name)};
window.bm7SaveSettings=function(){const s={display:document.getElementById('bm7DisplayName')?.value||'',bio:document.getElementById('bm7Bio')?.value||'',notify:document.getElementById('bm7Notify')?.checked!==false};put(K,s);if(s.display){localStorage.setItem('bm7_display_name',s.display);const p=document.getElementById('profileName');if(p)p.textContent=s.display}showToast('تم حفظ الإعدادات ✓')};
window.addEventListener('load',()=>{const s=get(K,{}),d=document.getElementById('bm7DisplayName'),b=document.getElementById('bm7Bio'),n=document.getElementById('bm7Notify');if(d)d.value=s.display||localStorage.getItem('bm7_display_name')||'';if(b)b.value=s.bio||'';if(n)n.checked=s.notify!==false;const j=get('bm7_joins_v4',{});document.querySelectorAll('[data-community]').forEach(x=>{if(j[x.dataset.community])x.textContent='✓ عضو'})});
})();