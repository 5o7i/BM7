/* ===== BM7 AUTH - Supabase ===== */
const SUPABASE_URL = "https://aqotdmnqncgrlgupyre.supabase.co";
const SUPABASE_KEY = "sb_publishable_t4IaSUMBPVwCkEtrtAxoYA_d9UHF8-7";
/* Legacy BM7 project: kept only as a login fallback for accounts created before BM7-2. */
const LEGACY_SUPABASE_URL = "https://rutbrdmnntffjsvbktm.supabase.co";
const LEGACY_SUPABASE_KEY = "sb_publishable_63uTdxSKL2g5_yE5Q-pfFA_AUDMNc22";

const authStyle = document.createElement('style');
authStyle.textContent = `
#bm7AuthBox{position:fixed;top:18px;left:18px;z-index:9999;background:#0b0f13;border:1px solid #ffc400;border-radius:12px;padding:10px;box-shadow:0 10px 30px #0008;direction:rtl;font-family:Arial,Tahoma,sans-serif}
#bm7AuthBox button{border:0;border-radius:8px;padding:9px 14px;margin:3px;cursor:pointer;font-weight:bold}
.bm7Gold{background:#ffc400;color:#111}.bm7Dark{background:#202830;color:#fff}
#bm7AuthModal{display:none;position:fixed;inset:0;background:#000b;z-index:10000;align-items:center;justify-content:center;direction:rtl}
#bm7AuthCard{width:min(420px,90%);background:#0b0f13;border:1px solid #ffc400;border-radius:16px;padding:25px;color:#fff}
#bm7AuthCard h2{color:#ffc400;margin-top:0}
#bm7AuthCard input{width:100%;box-sizing:border-box;margin:7px 0;padding:12px;border-radius:8px;border:1px solid #282f38;background:#171e26;color:#fff}
#bm7AuthMsg{margin-top:10px;color:#bbb;font-size:14px;line-height:1.6}
`;
document.head.appendChild(authStyle);

const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
supabaseScript.onload = () => {
  const { createClient } = window.supabase;
  window.bm7Supabase = createClient(SUPABASE_URL, SUPABASE_KEY); const bm7Supabase = window.bm7Supabase;
  let legacySupabase = null;
  try { legacySupabase = createClient(LEGACY_SUPABASE_URL, LEGACY_SUPABASE_KEY); } catch(e) { console.warn('Legacy auth unavailable',e); }

  const box = document.createElement('div');
  box.id = 'bm7AuthBox';
  document.body.appendChild(box);

  const modal = document.createElement('div');
  modal.id = 'bm7AuthModal';
  modal.innerHTML = `
    <div id="bm7AuthCard">
      <h2>🦇 BM7</h2>
      <input id="bm7Username" type="text" placeholder="اسم المستخدم (4 أحرف على الأقل)" maxlength="20" autocomplete="username">
      <input id="bm7Email" type="email" placeholder="البريد الإلكتروني" autocomplete="email">
      <input id="bm7Password" type="password" placeholder="كلمة المرور" autocomplete="current-password">
      <button class="bm7Gold" onclick="bm7Login()">تسجيل الدخول</button>
      <button class="bm7Dark" onclick="bm7Signup()">إنشاء حساب</button>
      <button class="bm7Dark" onclick="bm7Reset()">نسيت كلمة المرور؟</button>
      <button class="bm7Dark" onclick="bm7CloseAuth()">إغلاق</button>
      <div id="bm7AuthMsg"></div>
    </div>`;
  document.body.appendChild(modal);

  window.bm7OpenAuth = () => document.getElementById('bm7AuthModal').style.display='flex';
  window.bm7CloseAuth = () => document.getElementById('bm7AuthModal').style.display='none';
  window.bm7Msg = (text) => document.getElementById('bm7AuthMsg').textContent=text;

  const renderAuth = (session) => {
    if(session?.user){
      box.innerHTML=`<span style="color:#ffc400;margin:5px">👤 ${session.user.email}</span><button class="bm7Dark" onclick="bm7Logout()">تسجيل الخروج</button>`;
    }else{
      box.innerHTML='<button class="bm7Gold" onclick="bm7OpenAuth()">تسجيل الدخول</button>';
    }
  };

  const afterLogin = (client, session) => {
    window.bm7Supabase = client;
    renderAuth(session);
    try {
      const u=session?.user?.user_metadata?.username;
      if(u) localStorage.setItem('bm7_username',u);
    } catch(e){}
    setTimeout(()=>{
      try { if(typeof loadMyProfile==='function') loadMyProfile(); } catch(e){}
      try { if(typeof loadRealPosts==='function') loadRealPosts(); } catch(e){}
      try { if(typeof loadBM7Contacts==='function') loadBM7Contacts(); } catch(e){}
      try { if(typeof loadRealNotifications==='function') loadRealNotifications(); } catch(e){}
    },300);
  };

  window.bm7Login = async () => {
    const email=document.getElementById('bm7Email').value.trim().toLowerCase();
    const password=document.getElementById('bm7Password').value;
    if(!email||!password){bm7Msg('اكتب البريد الإلكتروني وكلمة المرور.');return;}
    bm7Msg('جاري تسجيل الدخول...');

    const primary = await bm7Supabase.auth.signInWithPassword({email,password});
    if(!primary.error){
      afterLogin(bm7Supabase, primary.data.session);
      bm7Msg('تم تسجيل الدخول بنجاح ✅');
      setTimeout(bm7CloseAuth,700);
      return;
    }

    /* If the account was created in the original BM7 project, authenticate there too. */
    if(legacySupabase){
      bm7Msg('الحساب غير موجود في النسخة الجديدة — جاري تجربة حساب BM7 القديم...');
      const legacy = await legacySupabase.auth.signInWithPassword({email,password});
      if(!legacy.error){
        afterLogin(legacySupabase, legacy.data.session);
        bm7Msg('تم تسجيل الدخول بحسابك القديم بنجاح ✅');
        setTimeout(bm7CloseAuth,700);
        return;
      }
    }

    bm7Msg('تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور، وإذا كان حسابك قديماً جرّب إنشاء الحساب من جديد في BM7.');
    console.error('BM7 login failed',primary.error);
  };

  window.bm7Signup = async () => {
    const username=document.getElementById('bm7Username').value.trim();
    const email=document.getElementById('bm7Email').value.trim().toLowerCase();
    const password=document.getElementById('bm7Password').value;

    if(!username||!email||!password){
      bm7Msg('اكتب اسم المستخدم والبريد وكلمة المرور.');
      return;
    }
    if(username==='1' && email!=='amk507x@gmail.com'){
      bm7Msg('اسم المستخدم 1 محجوز للإدارة.');
      return;
    }
    if(username!=='1' && username.length<4){
      bm7Msg('اسم المستخدم يجب أن يكون 4 أحرف على الأقل.');
      return;
    }
    if(!/^[A-Za-z0-9_\u0600-\u06FF.-]+$/.test(username)){
      bm7Msg('اسم المستخدم يحتوي على رموز غير مسموحة.');
      return;
    }
    if(password.length<6){
      bm7Msg('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    bm7Msg('جاري التحقق من اسم المستخدم...');
    const taken=await bm7Supabase.from('profiles').select('id').eq('username',username).maybeSingle();
    if(taken.data){
      bm7Msg('اسم المستخدم مستخدم بالفعل، اختر اسماً آخر.');
      return;
    }

    bm7Msg('جاري إنشاء الحساب...');
    const {data,error}=await bm7Supabase.auth.signUp({
      email,
      password,
      options:{data:{username}}
    });
    if(error){
      bm7Msg('خطأ: '+error.message);
      return;
    }

    if(data.session && data.user){
      const r=await bm7Supabase.from('profiles').upsert(
        {id:data.user.id,username},
        {onConflict:'id'}
      );
      if(r.error){
        bm7Msg('تم الحساب لكن تعذر حفظ اسم المستخدم: '+r.error.message);
        return;
      }
      localStorage.setItem('bm7_username',username);
      bm7Msg('تم إنشاء الحساب وتسجيل الدخول ✅');
      setTimeout(bm7CloseAuth,700);
    }else{
      localStorage.setItem('bm7_pending_username',username);
      bm7Msg('تم إنشاء الحساب ✅ تحقق من بريدك الإلكتروني لتأكيد الحساب، ثم سجّل الدخول.');
    }
  };

  window.bm7Reset = async () => {
    const email=document.getElementById('bm7Email').value.trim();
    if(!email){bm7Msg('اكتب بريدك الإلكتروني أولاً.');return;}
    const {error}=await bm7Supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+window.location.pathname});
    if(error){bm7Msg('خطأ: '+error.message);return;}
    bm7Msg('تم إرسال رابط استعادة كلمة المرور إلى بريدك ✅');
  };

  window.bm7Logout = async () => {
    try { await window.bm7Supabase.auth.signOut(); } catch(e) { console.error(e); }
    window.bm7Supabase=bm7Supabase;
    renderAuth(null);
  };

  bm7Supabase.auth.getSession().then(({data})=>renderAuth(data.session));
  bm7Supabase.auth.onAuthStateChange(async (_event,session)=>{
    renderAuth(session);
    if(session?.user){
      let {data:profile}=await bm7Supabase
        .from('profiles')
        .select('username')
        .eq('id',session.user.id)
        .maybeSingle();

      let u=profile?.username || session.user.user_metadata?.username || localStorage.getItem('bm7_pending_username');

      if(u){
        const r=await bm7Supabase.from('profiles').upsert(
          {id:session.user.id,username:u},
          {onConflict:'id'}
        );
        if(!r.error){
          localStorage.setItem('bm7_username',u);
          localStorage.removeItem('bm7_pending_username');
          loadProfileData();
        }
      }
      showToast('مرحباً بك في BM7 🦇');
    }
  });

  if(legacySupabase){
    legacySupabase.auth.onAuthStateChange((_event,session)=>{
      if(session?.user && window.bm7Supabase===legacySupabase){
        renderAuth(session);
        setTimeout(()=>{
          try { if(typeof loadMyProfile==='function') loadMyProfile(); } catch(e){}
          try { if(typeof loadRealPosts==='function') loadRealPosts(); } catch(e){}
          try { if(typeof loadBM7Contacts==='function') loadBM7Contacts(); } catch(e){}
        },300);
      }
    });
  }
};
document.head.appendChild(supabaseScript);
