(function(){
const POSTS='bm7_posts_v5', FOLLOWS='bm7_follows_v5', READ='bm7_read_v5';
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
window.toggleComposer=function(){
const x=document.getElementById('bm7Composer'); if(x)x.classList.toggle('open');
};
window.publishPost=function(){
const t=document.getElementById('bm7PostText'); if(!t||!t.value.trim()){showToast('اكتب شيئًا قبل النشر ✍️');return}
const arr=get(POSTS,[]);
const user=localStorage.getItem('bm7_username')||'عضو جديد';
arr.unshift({id:'u'+Date.now(),user,text:t.value.trim(),time:'الآن',likes:0});
put(POSTS,arr);t.value='';document.getElementById('bm7PostCount').textContent='0';
renderUserPosts();showToast('تم نشر منشورك بنجاح 🚀');if(typeof addXP==='function')addXP(25,'نشر منشور');
};
window.renderUserPosts=function(){
const old=document.getElementById('bm7UserPosts'); if(old)old.remove();
const posts=get(POSTS,[]); if(!posts.length)return;
const anchor=document.querySelector('#section-home .searchable-post');
if(!anchor)return;
const wrap=document.createElement('div');wrap.id='bm7UserPosts';
posts.forEach(p=>{
const a=document.createElement('article');a.className='card searchable-post';
a.innerHTML='<div class="post-head"><div class="avatar">👤</div><div><div class="name">'+esc(p.user)+'</div><div class="muted">'+esc(p.time)+'</div></div></div><p>'+esc(p.text)+'</p><div class="actions"><button onclick="bm7UserLike(this,\''+p.id+'\')">♡ '+p.likes+'</button><button onclick="bm7Comment(\''+p.id+'\')">💬 تعليق</button><button onclick="bm7Share()">↗ مشاركة</button></div>';
wrap.appendChild(a);
});
anchor.parentNode.insertBefore(wrap,anchor);
};
window.bm7UserLike=function(btn,id){
const arr=get(POSTS,[]),p=arr.find(x=>x.id===id);if(!p)return;p.likes++;put(POSTS,arr);btn.textContent='♥ '+p.likes;
if(typeof addXP==='function')addXP(2,'إعجاب');
};
window.bm7MarkAllRead=function(){
const r=get(READ,{});for(let i=1;i<=5;i++)r['n'+i]=true;put(READ,r);
document.querySelectorAll('#section-notifications .notif-row').forEach(x=>x.style.opacity='.55');
showToast('تم تعليم كل الإشعارات كمقروءة ✓');
};
window.bm7Follow=function(name,btn){
const f=get(FOLLOWS,{});f[name]=!f[name];put(FOLLOWS,f);
btn.textContent=f[name]?'✓ متابَع':'متابعة';
showToast(f[name]?'تمت المتابعة 👤':'تم إلغاء المتابعة');
};
window.bm7Achievements=function(){
const s=typeof bm7Stats!=='undefined'?bm7Stats:{xp:0,wins:0,streak:0};
const list=[
[s.xp>=100,'⚡ أول 100 XP','الوصول إلى 100 XP'],
[s.xp>=500,'🏆 جامع النقاط','الوصول إلى 500 XP'],
[s.wins>=3,'🥇 منافس','تحقيق 3 انتصارات'],
[s.streak>=7,'🔥 سلسلة أسبوع','الحفاظ على سلسلة 7 أيام']
];
const el=document.getElementById('bm7Achievements');if(!el)return;
el.innerHTML=list.map(x=>'<div class="bm7-achievement"><span>'+(x[0]?'🏅':'🔒')+'</span><div><b>'+x[1]+'</b><div class="muted">'+x[2]+'</div></div></div>').join('');
};
const oldUpdate=window.updateStatsUI;
window.updateStatsUI=function(){if(typeof oldUpdate==='function')oldUpdate();bm7Achievements()};
window.addEventListener('load',()=>{
const t=document.getElementById('bm7PostText');
if(t)t.addEventListener('input',()=>{document.getElementById('bm7PostCount').textContent=t.value.length});
renderUserPosts();bm7Achievements();
document.querySelector('#section-notifications .section-title .btn')?.setAttribute('onclick','bm7MarkAllRead()');
});
})();