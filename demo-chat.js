(()=>{
  const demo=[
    {id:'demo-shouq',name:'شوق',status:'نشطة الآن',avatar:'🦇',msgs:[
      {me:false,text:'هلااا 👀',time:'7:01 م'},
      {me:true,text:'هلا شوق 🤍 كيف صار شكل الشات؟',time:'7:02 م'},
      {me:false,text:'فخممم 😭🔥 بس أبيه نفس الإنستا بالضبط',time:'7:02 م'},
      {me:true,text:'تم! شوفي المحادثة كاملة 👌',time:'7:03 م'},
      {me:false,text:'أحلى شيء إن الرسائل مرتبة كذا ✨',time:'7:03 م'}
    ]},
    {id:'demo-batman',name:'البطل_07',status:'متصل الآن',avatar:'🦇',msgs:[
      {me:false,text:'جاهز للمهمة؟ 🦇',time:'6:48 م'},
      {me:true,text:'دقيقة وأدخل 😎',time:'6:49 م'}
    ]},
    {id:'demo-night',name:'Night7',status:'نشطة قبل 5 د',avatar:'🌙',msgs:[]}
  ];
  function wait(){const list=document.getElementById('bm7ChatList');if(!list||!window.openBM7Chat)return setTimeout(wait,500);render(list);}
  function render(list){
    if(list.dataset.demoReady)return; list.dataset.demoReady='1';
    list.innerHTML=demo.map((c,i)=>`<div class="bm7-chat-person ${i===0?'sel':''}" data-demo="${c.id}"><div class="ava">${c.avatar}</div><div class="dot"></div><div class="meta"><b>@${c.name}</b><div class="preview">${c.msgs.at(-1)?.text||'ابدأ محادثة جديدة'}</div></div></div>`).join('');
    list.querySelectorAll('[data-demo]').forEach(el=>el.onclick=()=>openDemo(el.dataset.demo));
    if(location.hash==='#demo-chat')setTimeout(()=>openDemo(demo[0].id),150);
  }
  function openDemo(id){
    const c=demo.find(x=>x.id===id);if(!c)return;
    window.openBM7Chat(c.name,c.id);
    setTimeout(()=>{
      const box=document.getElementById('bm7ChatMessages'); if(!box)return;
      box.innerHTML=c.msgs.length?c.msgs.map(m=>`<div class="bm7-bubble ${m.me?'me':'them'}">${m.text}<span class="time">${m.time}</span></div>`).join(''):'<div class="bm7-chat-empty"><strong>ابدأ المحادثة 👋</strong><span>هذه معاينة تجريبية</span></div>';
      box.scrollTop=box.scrollHeight;
      const st=document.getElementById('bm7ChatStatus');if(st)st.textContent=c.status+' • معاينة';
      const av=document.getElementById('bm7ChatAvatar');if(av){av.style.backgroundImage='';av.textContent=c.avatar}
    },80);
  }
  window.BM7DemoChat={open:openDemo,contacts:demo};
  setTimeout(wait,1000);
})();