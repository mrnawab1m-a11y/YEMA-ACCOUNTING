(() => {
  const PREFIX = 'yema_v2_';
  const TYPES = ['sales', 'purchases', 'expenses'];
  const status = () => document.getElementById('cloudStatus');
  const detail = () => document.getElementById('cloudDetail');
  let client = null;
  let syncing = false;
  let pending = false;

  const localRead = type => {
    try { return JSON.parse(localStorage.getItem(PREFIX + type) || '[]'); }
    catch { return []; }
  };
  const localWrite = (type, rows) => localStorage.setItem(PREFIX + type, JSON.stringify(rows));
  const stamp = row => Number(new Date(row._yemaUpdatedAt || row.updatedAt || row.date || row.created_at || 0).getTime()) || 0;
  const makeId = () => {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'yema-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  };
  const setMessage = message => { if (detail()) detail().textContent = message; };

  async function syncNow() {
    if (!client || syncing) { pending = true; return; }
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError || !authData.user) return;
    syncing = true;
    pending = false;
    try {
      let uploaded = 0;
      let downloaded = 0;
      for (const type of TYPES) {
        const local = localRead(type).map(row => {
          if (!row._yemaId) row._yemaId = String(row.id || makeId());
          if (!row._yemaUpdatedAt) row._yemaUpdatedAt = new Date().toISOString();
          return row;
        });
        const { data: remoteRows, error: readError } = await client
          .from('yema_cloud_records')
          .select('record_id,payload,updated_at')
          .eq('owner_id', authData.user.id)
          .eq('record_type', type);
        if (readError) throw readError;

        const merged = new Map(local.map(row => [String(row._yemaId), row]));
        for (const item of (remoteRows || [])) {
          const remote = item.payload || {};
          remote._yemaId = String(remote._yemaId || item.record_id);
          remote._yemaUpdatedAt = remote._yemaUpdatedAt || item.updated_at;
          const existing = merged.get(remote._yemaId);
          if (!existing || stamp(remote) > stamp(existing)) {
            merged.set(remote._yemaId, remote);
            downloaded++;
          }
        }
        const rows = [...merged.values()];
        localWrite(type, rows);
        if (rows.length) {
          const records = rows.map(row => ({
            owner_id: authData.user.id,
            record_type: type,
            record_id: String(row._yemaId),
            payload: row,
            updated_at: row._yemaUpdatedAt || new Date().toISOString()
          }));
          const { error: upsertError } = await client
            .from('yema_cloud_records')
            .upsert(records, { onConflict: 'owner_id,record_type,record_id' });
          if (upsertError) throw upsertError;
          uploaded += records.length;
        }
      }
      window.dispatchEvent(new CustomEvent('yema-cloud-sync-complete'));
      setMessage('همگام‌سازی ابری موفق شد. ارسال/بررسی ' + uploaded + ' رکورد؛ دریافت ' + downloaded + ' رکورد.');
    } catch (error) {
      setMessage('همگام‌سازی کامل نشد: ' + (error.message || String(error)) + '. اطلاعات محلی محفوظ است.');
      if (status()) status().textContent = 'خطا در همگام‌سازی';
    } finally {
      syncing = false;
      if (pending) syncNow();
    }
  }

  window.addEventListener('yema-cloud-session', event => {
    client = event.detail && event.detail.client;
    if (event.detail && event.detail.session && client) syncNow();
  });
  window.addEventListener('yema-local-change', () => {
    if (client) syncNow();
  });
  window.addEventListener('online', () => { if (client) syncNow(); });
})();