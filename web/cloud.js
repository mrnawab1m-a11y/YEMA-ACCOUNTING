(() => {
  const $ = id => document.getElementById(id);
  const client = window.supabase.createClient(
    'https://pxjsplptibleojdhhjil.supabase.co',
    'sb_publishable_g938wz8aF2mVHDGhXdT24A_AJXRzSVH',
    {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}
  );
  window.yemaCloud={client};
  const gate=$('authGate'),emailBox=$('authEmailBox'),pinBox=$('authPinBox');
  const status=$('authStatus'),message=$('authMessage');
  const setStatus=t=>{status.textContent=t;};
  const lock=()=>{document.body.classList.add('auth-locked');gate.style.display='';if($('authPin'))$('authPin').value='';};
  const unlock=()=>{document.body.classList.remove('auth-locked');gate.style.display='none';};
  const pinKey=user=>'yema_security_pin_'+user.id;
  const hash=async pin=>{
    const bytes=new TextEncoder().encode(pin);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
  };
  let activeUser=null;
  async function verifiedSession(session){
    lock();
    if(!session?.user){activeUser=null;emailBox.classList.remove('hidden');pinBox.classList.add('hidden');message.textContent='برای باز کردن برنامه، ابتدا با ایمیل تأییدشده وارد شوید.';return;}
    const user=session.user;
    if(!user.email_confirmed_at){await client.auth.signOut();emailBox.classList.remove('hidden');pinBox.classList.add('hidden');setStatus('ایمیل هنوز تأیید نشده است. ایمیل تأیید را باز کنید و لینک آن را بزنید.');return;}
    activeUser=user;
    emailBox.classList.add('hidden');
    pinBox.classList.remove('hidden');
    const saved=localStorage.getItem(pinKey(user));
    if(!saved){
      message.textContent='ایمیل تأیید شد. اکنون یک کد امنیتی ۶ رقمی بسازید.';
      $('authPin').placeholder='کد جدید ۶ رقمی';
      $('authPinSubmit').textContent='ثبت کد امنیتی';
      setStatus('کد را فقط خودتان انتخاب کنید و به کسی ندهید.');
    }else{
      message.textContent='ایمیل تأییدشده است. برای باز کردن برنامه کد امنیتی را وارد کنید.';
      $('authPin').placeholder='کد امنیتی ۶ رقمی';
      $('authPinSubmit').textContent='تأیید کد و باز کردن برنامه';
      setStatus('حساب: '+(user.email||''));
    }
  }
  $('authLogin').onclick=async()=>{
    const email=$('authEmail').value.trim(),password=$('authPassword').value;
    if(!email||!password){setStatus('ایمیل و رمز عبور را وارد کنید.');return;}
    $('authLogin').disabled=true;setStatus('در حال بررسی حساب...');
    const {data,error}=await client.auth.signInWithPassword({email,password});
    $('authLogin').disabled=false;
    if(error){setStatus(error.message.includes('Email not confirmed')?'ایمیل شما هنوز تأیید نشده است؛ ایمیل تأیید را ارسال کنید.':'ورود ناموفق: '+error.message);return;}
    $('authPassword').value='';await verifiedSession(data.session);
  };
  $('authResend').onclick=async()=>{
    const email=$('authEmail').value.trim();
    if(!email){setStatus('ابتدا ایمیل جیمیل خود را وارد کنید.');return;}
    const {error}=await client.auth.resend({type:'signup',email,options:{emailRedirectTo:location.href}});
    setStatus(error?'ارسال ایمیل ناموفق: '+error.message:'درخواست ارسال ایمیل تأیید شد. صندوق ورودی و پوشه Spam را بررسی کنید.');
  };
  $('authPinSubmit').onclick=async()=>{
    if(!activeUser){setStatus('ابتدا ایمیل تأییدشده را وارد کنید.');return;}
    const pin=$('authPin').value.trim().replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    if(!/^[0-9]{6}$/.test(pin)){setStatus('کد امنیتی باید دقیقاً ۶ رقم باشد.');return;}
    const key=pinKey(activeUser),saved=localStorage.getItem(key),digest=await hash(pin);
    if(!saved){localStorage.setItem(key,digest);$('authPin').value='';setStatus('کد امنیتی ثبت شد.');unlock();return;}
    if(digest!==saved){setStatus('کد امنیتی نادرست است.');return;}
    $('authPin').value='';unlock();
  };
  $('authLogout').onclick=async()=>{await client.auth.signOut();await verifiedSession(null);};
  client.auth.onAuthStateChange((event,session)=>{if(event==='INITIAL_SESSION'||event==='SIGNED_IN'||event==='SIGNED_OUT')setTimeout(()=>verifiedSession(session),0);});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&activeUser)lock();});
  window.addEventListener('pagehide',()=>{if(activeUser)lock();});
  client.auth.getSession().then(({data,error})=>{
    if(error){setStatus('بررسی حساب ناموفق: '+error.message);return;}
    verifiedSession(data.session);
  });

  const cloudStatus=$('cloudStatus'),cloudDetail=$('cloudDetail');
  const cloudLogin=$('cloudLogin'),cloudSignedIn=$('cloudSignedIn');
  const cloudAccount=$('cloudAccount');
  const cloudSignIn=$('cloudSignIn'),cloudSignOut=$('cloudSignOut');
  const cloudEmail=$('cloudEmail'),cloudPassword=$('cloudPassword');
  const cloudState=(ok,title,detail)=>{
    cloudStatus.textContent=title;
    cloudStatus.classList.toggle('ok',!!ok);
    cloudStatus.classList.toggle('bad',!ok);
    cloudDetail.textContent=detail||'';
  };
  const showCloudUser=user=>{
    cloudLogin.classList.add('hidden');
    cloudSignedIn.classList.remove('hidden');
    cloudAccount.textContent='حساب متصل: '+(user.email||'ایمیل تأییدشده');
    cloudState(true,'اتصال ابری برقرار است','ورود به حساب ابری موفق شد. اطلاعات ابری با همین حساب قابل دسترسی است.');
  };
  async function testCloudConnection(){
    cloudState(false,'در حال آزمایش اتصال...','در حال ارتباط با سرور حساب ابری.');
    const {data,error}=await client.auth.getUser();
    if(error)throw error;
    if(!data?.user)throw new Error('نشست معتبر پیدا نشد؛ ابتدا از بخش ورود امن برنامه وارد شوید.');
    if(!data.user.email_confirmed_at)throw new Error('ایمیل حساب هنوز تأیید نشده است.');
    showCloudUser(data.user);
  }
  cloudSignIn?.addEventListener('click',async()=>{
    if(cloudSignIn.disabled)return;
    cloudSignIn.disabled=true;
    cloudSignIn.textContent='در حال اتصال...';
    try{
      const {data:sessionData,error:sessionError}=await client.auth.getSession();
      if(sessionError)throw sessionError;
      if(sessionData?.session){
        await testCloudConnection();
      }else{
        const email=cloudEmail.value.trim(),password=cloudPassword.value;
        if(!email||!password)throw new Error('ایمیل و رمز عبور را وارد کنید.');
        const {data,error}=await client.auth.signInWithPassword({email,password});
        if(error)throw error;
        if(!data?.session)throw new Error('ورود انجام شد اما نشست حساب دریافت نشد.');
        cloudPassword.value='';
        await verifiedSession(data.session);
        await testCloudConnection();
      }
    }catch(error){
      cloudState(false,'اتصال ابری تأیید نشد',error?.message||'خطای ناشناخته در اتصال.');
    }finally{
      cloudSignIn.disabled=false;
      cloudSignIn.textContent='ورود و آزمایش اتصال';
    }
  });
  cloudSignOut?.addEventListener('click',async()=>{
    cloudSignOut.disabled=true;
    try{
      const {error}=await client.auth.signOut();
      if(error)throw error;
      cloudLogin.classList.remove('hidden');
      cloudSignedIn.classList.add('hidden');
      cloudAccount.textContent='';
      cloudState(false,'از حساب ابری خارج شدید','برای استفاده دوباره، از ورود امن برنامه وارد شوید.');
      await verifiedSession(null);
    }catch(error){
      cloudState(false,'خروج ناموفق بود',error?.message||'خطای ناشناخته');
    }finally{cloudSignOut.disabled=false;}
  });
  (async()=>{
    try{
      const {data,error}=await client.auth.getSession();
      if(error)throw error;
      if(data?.session)await testCloudConnection();
      else cloudState(false,'هنوز به حساب ابری وصل نیستید','ایمیل و رمز حساب ابری را وارد کنید.');
    }catch(error){
      cloudState(false,'بررسی اتصال ناموفق شد',error?.message||'سرور پاسخ نداد.');
    }
  })();

  lock();
})();