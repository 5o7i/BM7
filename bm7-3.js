(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const sb=()=>window.bm7Supabase;
const me=()=>window.BM7Live?.user||null;
const toast=t=>window.showToast?showToast(t):console.log(t);
const timeAgo=d=>{const x=Math.max(0,Date.now()-new Date(d).getTime())/1000;if(x<60)return 'الآن';if(x<3600)return 'منذ '+Math.floor(x/60)+' د';if(x<86400)return 'منذ '+Math.floor(x/3600)+' س';return 'منذ '+Math.floor(x/86400)+' يوم'};
async function session(){const S=sb();if(!S)return null;const {data}=await S.auth.getSession();if(data?.session?.user){window.BM7Live=window.BM7Live||{};window.BM7Live.user=data.session.user;return data.session.user}return null}
function ensure(id,parent){let e=document.getElementById(id);if(!e){e=document.createElement('div');e.id=id;parent.appendChild(e)}return e}
async function loadRealPosts(targetId='bm7RealFeed',limit=50){
const S=sb(), box=document.getElementById(targetId); if(!S||!box)return;
box.innerHTML='<div class="bm7-real-empty">جاري تحميل المنشورات الحقيقية…</div>';
const {data:posts,error}=await S.from('posts').select('id,author_id,body,media_url,media_type,created_at,profiles:author_id(username,display_name,avatar_url)').order('created_at',{ascending:false}).limit(limit);
if(error){box.innerHTML='<div class="bm7-real-empty">تعذر تحميل المنشورات: '+esc(error.message)+'</div>';return}
if(!posts?.length){box.innerHTML='<div class="bm7-real-empty">لا توجد منشورات حقيقية بعد. كن أول من ينشر 🦇</div>';return}
const uid=me()?.id;
const ids=posts.map(p=>p.id);
let likes=[];
if(ids.length){const q=await S.from('likes').select('post_id,user_id').in('post_id',ids);likes=q.data||[]}
box.innerHTML=posts.map(p=>{
const profile=p.profiles||{};const mine=likes.some(x=>x.post_id===p.id&&x.user_id===uid);const count=likes.filter(x=>x.post_id===p.id).length;
let media=''; if(p.media_url){media=p.media_type==='video'?`<video class="post-media" src="${esc(p.media_url)}" controls playsinline></video>`:`<img class="post-media" src="${esc(p.media_url)}" loading="lazy" alt="BM7">`}
return `<article class="bm7-real-post" data-real-post="${p.id}"><div class="post-head"><div class="avatar">🦇</div><div><div class="name">@${esc(profile.username||'user')}</div><div class="muted">${esc(profile.display_name||'عضو BM7')} • ${timeAgo(p.created_at)}</div></div></div><p>${esc(p.body||'')}</p>${media}<div class="bm7-real-actions"><button onclick="bm7RealLike('${p.id}',this)">${mine?'♥':'♡'} ${count}</button><button onclick="bm7RealComments('${p.id}')">💬 تعليقات</button><button onclick="bm7Share()">↗ مشاركة</button></div></article>`;
}).join('');
}
window.bm7RealLoadPosts=loadRealPosts;
async function likePost(postId,btn){
const S=sb(),u=await session();if(!S||!u){toast('سجّل دخولك أولاً');return}
const existing=await S.from('likes').select('post_id,user_id').eq('post_id',postId).eq('user_id',u.id).maybeSingle();
if(existing.data){const {error}=await S.from('likes').delete().eq('post_id',postId).eq('user_id',u.id);if(error){toast('تعذر إلغاء الإعجاب');return}toast('تم إلغاء الإعجاب');}
else{const {error}=await S.from('likes').insert({post_id:postId,user_id:u.id});if(error){toast('تعذر تسجيل الإعجاب: '+error.message);return}const post=await S.from('posts').select('author_id').eq('id',postId).maybeSingle();if(post.data?.author_id&&post.data.author_id!==u.id) await S.from('notifications').insert({user_id:post.data.author_id,actor_id:u.id,kind:'like',body:'أعجب بمنشورك'});toast('❤️ تم الإعجاب');}
loadRealPosts();
}
window.bm7RealLike=likePost;
async function comments(postId){
const S=sb();if(!S)return;const u=await session();
const r=await S.from('comments').select('id,author_id,body,created_at,profiles:author_id(username)').eq('post_id',postId).order('created_at',{ascending:true}).limit(100);
const rows=r.data||[];
openBM7Modal('💬 التعليقات',`<div>${rows.length?rows.map(x=>`<div class="bm7-comment"><b>@${esc(x.profiles?.username||'user')}</b><div>${esc(x.body)}</div><span class="bm7-muted">${timeAgo(x.created_at)}</span></div>`).join(''):'<div class="bm7-muted">لا توجد تعليقات بعد.</div>'}</div><textarea id="bm7RealCommentText" class="bm7-textarea" placeholder="اكتب تعليقك..."></textarea><button class="btn gold" onclick="bm7RealAddComment('${postId}')">نشر التعليق</button>`);
}
window.bm7RealComments=comments;
window.bm7RealAddComment=async function(postId){
const S=sb(),u=await session(),t=document.getElementById('bm7RealCommentText');if(!S||!u){toast('سجّل دخولك أولاً');return}if(!t?.value.trim()){toast('اكتب تعليقك أولاً');return}
const body=t.value.trim();const r=await S.from('comments').insert({post_id:postId,author_id:u.id,body});if(r.error){toast('تعذر نشر التعليق: '+r.error.message);return}
const post=await S.from('posts').select('author_id').eq('id',postId).maybeSingle();if(post.data?.author_id&&post.data.author_id!==u.id)await S.from('notifications').insert({user_id:post.data.author_id,actor_id:u.id,kind:'comment',body:'علّق على منشورك'});
toast('💬 تم نشر التعليق');comments(postId);
};
async function publishRealPost(){
const S=sb(),u=await session(),t=document.getElementById('bm7PostText');if(!S||!u){toast('سجّل دخولك أولاً');return}if(!t?.value.trim()){toast('اكتب شيئاً قبل النشر ✍️');return}
const r=await S.from('posts').insert({author_id:u.id,body:t.value.trim(),media_url:null,media_type:null});if(r.error){toast('تعذر النشر: '+r.error.message);return}
t.value='';const c=document.getElementById('bm7PostCount');if(c)c.textContent='0';toast('🚀 تم نشر منشورك');try{addXP(25,'نشر منشور')}catch(e){};loadRealPosts();
}
window.publishPost=publishRealPost;
window.uploadBM7Media=async function(){
const S=sb(),u=await session(),input=document.getElementById('bm7MediaInput'),caption=document.getElementById('bm7MediaCaption')?.value.trim()||'',f=input?.files?.[0];
if(!S||!u){toast('سجّل دخولك أولاً');return}if(!f){toast('اختر صورة أو فيديو أولاً');return}if(f.size>50*1024*1024){toast('الملف أكبر من 50MB');return}
const ext=(f.name.split('.').pop()||'bin').toLowerCase(),path=`${u.id}/${crypto.randomUUID()}.${ext}`,bar=document.getElementById('bm7UploadBar'),prog=document.getElementById('bm7UploadProgress');if(prog)prog.style.display='block';if(bar)bar.style.width='20%';
const up=await S.storage.from('bm7-media').upload(path,f,{contentType:f.type,upsert:false});if(up.error){toast('فشل الرفع: '+up.error.message);if(prog)prog.style.display='none';return}if(bar)bar.style.width='65%';const pub=S.storage.from('bm7-media').getPublicUrl(path).data.publicUrl,isVideo=f.type.startsWith('video/');
let r;
if(isVideo){r=await S.from('reels').insert({author_id:u.id,video_url:pub,caption});}
else{r=await S.from('posts').insert({author_id:u.id,body:caption||'صورة جديدة من BM7',media_url:pub,media_type:'image'});}
if(r.error){await S.storage.from('bm7-media').remove([path]);toast('تعذر حفظ المحتوى: '+r.error.message);if(prog)prog.style.display='none';return}
if(bar)bar.style.width='100%';toast(isVideo?'🎬 تم نشر الريلز':'🔥 تم نشر الصورة');if(input)input.value='';if(document.getElementById('bm7MediaPreview'))document.getElementById('bm7MediaPreview').style.display='none';if(document.getElementById('bm7VideoPreview'))document.getElementById('bm7VideoPreview').style.display='none';if(document.getElementById('bm7MediaCaption'))document.getElementById('bm7MediaCaption').value='';setTimeout(()=>{if(prog)prog.style.display='none';if(bar)bar.style.width='0%'},700);loadRealPosts();loadRealReels();
};
async function loadRealReels(){
const S=sb(),box=document.getElementById('bm7Reels');if(!S||!box)return;const r=await S.from('reels').select('id,author_id,video_url,caption,created_at,profiles:author_id(username)').order('created_at',{ascending:false}).limit(30);if(r.error){box.innerHTML='<div class="bm7-real-empty">تعذر تحميل الريلز.</div>';return}if(!r.data?.length){box.innerHTML='<div class="bm7-real-empty">لا توجد Reels حقيقية بعد 🎬<br><span class="muted">ارفع أول فيديو من الصفحة الرئيسية.</span></div>';return}box.innerHTML=r.data.map(x=>`<div class="reel-card" style="padding:8px;min-width:220px;height:auto"><video class="bm7-reel-video" src="${esc(x.video_url)}" controls playsinline></video><div class="reel-info"><b>@${esc(x.profiles?.username||'user')}</b><br><small>${esc(x.caption||'ريلز BM7')} • ${timeAgo(x.created_at)}</small></div></div>`).join('');
}
window.bm7RealLoadReels=loadRealReels;
async function loadUsers(){
const S=sb(),box=document.getElementById('bm7RealUsers');if(!S||!box)return;const u=await session();if(!u){box.innerHTML='<div class="bm7-real-empty">سجّل الدخول لاكتشاف المستخدمين.</div>';return}
const r=await S.from('profiles').select('id,username,display_name,bio,avatar_url').neq('id',u.id).order('created_at',{ascending:false}).limit(30);if(r.error){box.innerHTML='<div class="bm7-real-empty">تعذر تحميل المستخدمين.</div>';return}if(!r.data?.length){box.innerHTML='<div class="bm7-real-empty">أنت أول بطل هنا 🦇</div>';return}
const fr=await S.from('follows').select('following_id').eq('follower_id',u.id);const followed=new Set((fr.data||[]).map(x=>x.following_id));
box.innerHTML=r.data.map(x=>`<div class="bm7-user-card"><div class="avatar">🦇</div><div class="user-main"><b>@${esc(x.username)}</b><div class="muted">${esc(x.display_name||'عضو BM7')}</div><div class="muted">${esc(x.bio||'')}</div></div><button class="btn bm7-follow" onclick="bm7ToggleRealFollow('${x.id}',this)">${followed.has(x.id)?'✓ متابَع':'＋ متابعة'}</button></div>`).join('');
}
window.bm7ToggleRealFollow=async function(id,btn){
const S=sb(),u=await session();if(!S||!u){toast('سجّل دخولك أولاً');return}const q=await S.from('follows').select('follower_id,following_id').eq('follower_id',u.id).eq('following_id',id).maybeSingle();if(q.data){const r=await S.from('follows').delete().eq('follower_id',u.id).eq('following_id',id);if(r.error){toast('تعذر إلغاء المتابعة');return}btn.textContent='＋ متابعة';toast('تم إلغاء المتابعة')}else{const r=await S.from('follows').insert({follower_id:u.id,following_id:id});if(r.error){toast('تعذر المتابعة: '+r.error.message);return}btn.textContent='✓ متابَع';await S.from('notifications').insert({user_id:id,actor_id:u.id,kind:'follow',body:'بدأ بمتابعتك'});toast('👤 تمت المتابعة');}
};
async function loadRealNotifications(){
const S=sb(),box=document.getElementById('bm7RealNotifications');if(!S||!box)return;const u=await session();if(!u){box.innerHTML='<div class="bm7-real-empty">سجّل الدخول لعرض إشعاراتك.</div>';return}const r=await S.from('notifications').select('id,actor_id,kind,body,read,created_at,profiles:actor_id(username)').eq('user_id',u.id).order('created_at',{ascending:false}).limit(50);if(r.error){box.innerHTML='<div class="bm7-real-empty">تعذر تحميل الإشعارات.</div>';return}if(!r.data?.length){box.innerHTML='<div class="bm7-real-empty">لا توجد إشعارات جديدة 🔔</div>';return}box.innerHTML=r.data.map(x=>`<div class="notif-row" style="opacity:${x.read?.55:1}">${x.kind==='like'?'❤️':x.kind==='comment'?'💬':x.kind==='follow'?'👤':'🔔'} <b>@${esc(x.profiles?.username||'user')}</b> ${esc(x.body)} <span class="muted" style="margin-right:auto">${timeAgo(x.created_at)}</span></div>`).join('');
}
window.bm7MarkRealNotifications=async function(){const S=sb(),u=await session();if(!S||!u)return;await S.from('notifications').update({read:true}).eq('user_id',u.id).eq('read',false);toast('تم تعليم الإشعارات كمقروءة ✓');loadRealNotifications()};
async function loadMyProfile(){
const S=sb(),u=await session();if(!S||!u)return;const p=await S.from('profiles').select('username,display_name,bio,avatar_url').eq('id',u.id).maybeSingle();if(p.data){const name=p.data.display_name||p.data.username||'عضو جديد';const e=document.getElementById('profileName');if(e)e.textContent=name;const m=document.getElementById('miniUsername');if(m)m.textContent=p.data.username?'@'+p.data.username:'زائر';const d=document.getElementById('bm7DisplayName');if(d)d.value=p.data.display_name||'';const b=document.getElementById('bm7Bio');if(b)b.value=p.data.bio||''}
const r=await S.from('posts').select('id').eq('author_id',u.id);const count=r.data?.length||0;const stat=document.querySelector('#section-profile .stat-grid .stat:nth-child(3) strong');if(stat)stat.textContent=count;
}
async function loadRealExplore(){
const ex=document.getElementById('section-explore');if(!ex)return;const box=ensure('bm7RealExplore',ex);box.innerHTML='<div class="card"><div class="section-title"><h3>🌐 منشورات المجتمع</h3><button class="btn" onclick="bm7RealLoadPosts(\'bm7RealExploreFeed\')">تحديث</button></div><div id="bm7RealExploreFeed" class="bm7-real-grid"></div></div><div class="card"><h3>👥 اكتشف أبطالاً</h3><div id="bm7RealUsers" class="bm7-real-grid"></div></div>';await loadRealPosts('bm7RealExploreFeed');await loadUsers();
}
async function boot(){
const S=sb();if(!S)return;await session();
const home=document.getElementById('section-home');if(home)ensure('bm7RealFeed',home).className='bm7-real-grid';
if(home&&!document.getElementById('bm7RealFeed').innerHTML)loadRealPosts();
const notif=document.getElementById('section-notifications');if(notif)ensure('bm7RealNotifications',notif).className='bm7-real-grid';
const explore=document.getElementById('section-explore');if(explore&&!document.getElementById('bm7RealExplore'))loadRealExplore();
loadRealReels();loadRealNotifications();loadMyProfile();
}
const oldShow=window.showSection;window.showSection=function(name,btn){if(oldShow)oldShow(name,btn);if(name==='messages')setTimeout(loadBM7Contacts,100);if(name==='explore')setTimeout(loadRealExplore,100);if(name==='reels')setTimeout(loadRealReels,100);if(name==='notifications')setTimeout(loadRealNotifications,100);if(name==='profile')setTimeout(loadMyProfile,100)};
const oldSave=window.bm7SaveSettings;window.bm7SaveSettings=async function(){if(oldSave)oldSave();const S=sb(),u=await session();if(!S||!u)return;const display=document.getElementById('bm7DisplayName')?.value.trim()||'',bio=document.getElementById('bm7Bio')?.value.trim()||'';const r=await S.from('profiles').update({display_name:display,bio}).eq('id',u.id);if(r.error)toast('تعذر حفظ الملف: '+r.error.message);else toast('✓ تم حفظ الملف على حسابك')};
document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));
if(window.bm7Supabase)window.bm7Supabase.auth.onAuthStateChange(()=>setTimeout(boot,500));
})();