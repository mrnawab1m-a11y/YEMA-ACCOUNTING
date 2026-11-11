(() => {
  const status = document.getElementById('cloudStatus');
  const detail = document.getElementById('cloudDetail');
  const loginBox = document.getElementById('cloudLogin');
  const signedBox = document.getElementById('cloudSignedIn');
  const account = document.getElementById('cloudAccount');
  const signIn = document.getElementById('cloudSignIn');
  const signOut = document.getElementById('cloudSignOut');

  const setStatus = (message, kind='') => {
    status.textContent = message;
    status.className = 'cloud-status' + (kind ? ' ' + kind : '');
  };

  if (!window.supabase || !window.supabase.createClient) {
    setStatus('کتابخانه اتصال بارگذاری نشد', 'bad');
    detail.textContent = 'اتصال اینترنت یا بارگذاری کتابخانه Supabase را بررسی کنید. اطلاعات محلی تغییر نکرده است.';
    return;
  }

  const client = window.supabase.createClient(
    'https://pxjsplptibleojdhhjil.supabase.co',
    'sb_publishable_g938wz8aF2mVHDGhXdT24A_AJXRzSVH',
    { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
  );
  window.yemaCloud = { client };

  async function verifyCloud(session) {
    if (!session) {
      loginBox.classList.remove('hidden');
      signedBox.classList.add('hidden');
      setStatus('وارد حساب ابری نشده‌اید');
      return;
    }
    loginBox.classList.add('hidden');
    signedBox.classList.remove('hidden');
    account.textContent = 'حساب فعال: ' + (session.user.email || 'کاربر یما');
    setStatus('در حال آزمایش دسترسی دیتابیس…');
    const { data, error } = await client.from('products')
      .select('id,name,sale_unit')
      .order('name');
    if (error) {
      setStatus('ورود انجام شد؛ دسترسی دیتابیس ناموفق', 'bad');
      detail.textContent = 'خطای دسترسی: ' + error.message + ' — اطلاعات محلی دست‌نخورده باقی است.';
      return;
    }
    setStatus('اتصال ابری موفق است', 'ok');
    detail.textContent = 'دیتابیس پاسخ داد؛ ' + data.length + ' محصول در حساب ابری دیده شد. همگام‌سازی سوابق آغاز می‌شود.';
    window.dispatchEvent(new CustomEvent('yema-cloud-session', { detail: { client, session } }));
  }

  signIn.addEventListener('click', async () => {
    const email = document.getElementById('cloudEmail').value.trim();
    const password = document.getElementById('cloudPassword').value;
    if (!email || !password) {
      setStatus('ایمیل و رمز عبور را وارد کنید', 'bad');
      return;
    }
    signIn.disabled = true;
    signIn.textContent = 'در حال ورود…';
    setStatus('در حال بررسی حساب…');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    signIn.disabled = false;
    signIn.textContent = 'ورود و آزمایش اتصال';
    if (error) {
      setStatus('ورود ناموفق بود', 'bad');
      detail.textContent = 'ایمیل یا رمز را بررسی کنید. جزئیات: ' + error.message;
      return;
    }
    document.getElementById('cloudPassword').value = '';
    await verifyCloud(data.session);
  });

  signOut.addEventListener('click', async () => {
    const { error } = await client.auth.signOut();
    if (error) {
      setStatus('خروج ناموفق بود', 'bad');
      detail.textContent = error.message;
      return;
    }
    await verifyCloud(null);
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error) {
      setStatus('بررسی نشست ناموفق بود', 'bad');
      detail.textContent = error.message;
      return;
    }
    verifyCloud(data.session);
  });

  client.auth.onAuthStateChange((_event, session) => {
    if (session) verifyCloud(session);
  });
})();