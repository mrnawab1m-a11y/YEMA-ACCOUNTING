const PRODUCTS=['پطرول ۹۲','پطرول ۸۰','دیزل شیشه‌ای','دیزل ۰۱','گاز'];
const KEY='yema_v2_';
function yemaRequestId(action){const key='yema_pending_'+action;let id=sessionStorage.getItem(key);if(!id){id=crypto.randomUUID();sessionStorage.setItem(key,id);}return id;}
function clearYemaRequestId(action){sessionStorage.removeItem('yema_pending_'+action);}
let homeCart=[];
let pageBackTarget='home';
const read=k=>{try{return JSON.parse(localStorage.getItem(KEY+k)||'[]')}catch{return []}};
const write=(k,v)=>localStorage.setItem(KEY+k,JSON.stringify(v));
const el=id=>document.getElementById(id);
const fmt=n=>Number(n||0).toLocaleString('fa-IR',{maximumFractionDigits:2});
const unit=p=>p==='گاز'?'کیلوگرام':'لیتر';
const sum=(a,k)=>a.reduce((s,x)=>s+Number(x[k]||0),0);
function updateKabulClock(){const node=el('kabulClock');if(!node)return;const now=new Date();try{const date=formatAfghanDate(now);const time=new Intl.DateTimeFormat('fa-AF-u-nu-arab',{timeZone:'Asia/Kabul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);node.innerHTML='<span class="home-info-card date-card"><b class="info-icon">▦</b><strong>تاریخ</strong><em>'+date+'</em></span><span class="home-info-card time-card"><b class="info-icon">◷</b><strong>ساعت</strong><em>'+time+'</em></span>';}catch{node.textContent=new Intl.DateTimeFormat('fa-AF-u-ca-persian',{timeZone:'Asia/Kabul',dateStyle:'long',timeStyle:'short'}).format(now);}}
setInterval(updateKabulClock,30000);
function updateHomeCart(){const node=el('homeCartSummary');if(!node)return;node.textContent=homeCart.length?'محصول انتخاب‌شده: '+homeCart[0]:'سبد فروش خالی است';const clear=el('clearHomeCart');if(clear)clear.disabled=homeCart.length===0;document.querySelectorAll('#productButtons [data-product]').forEach(b=>b.classList.toggle('selected',homeCart[0]===b.dataset.product));}
async function updateTopRate(){const node=el('usdRateTop');if(!node)return;try{const rate=await fetchKabulRate();node.innerHTML='<span class="home-info-card rate-card"><b class="info-icon">$</b><strong>نرخ دالر</strong><em>'+fmt(rate.sell)+' افغانی</em></span>';}catch{node.innerHTML='<span class="home-info-card rate-card"><b class="info-icon">$</b><strong>نرخ دالر</strong><em>ناموجود</em></span>';}}

function updateHomeDashboard(){
 const sales=read('sales'),expenses=read('expenses');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kabul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const todays=sales.filter(x=>String(x.date||'').slice(0,10)===today);
 const todaysExpenses=expenses.filter(x=>String(x.date||x.expenseDate||'').slice(0,10)===today);
 const salesTotal=sum(todays,'total'),profitTotal=sum(todays,'profit'),expenseTotal=sum(todaysExpenses,'amount');
 const set=(id,value)=>{const node=el(id);if(node)node.textContent=fmt(value);};
 set('dashSalesToday',salesTotal);set('dashProfitToday',profitTotal-expenseTotal);set('dashExpensesToday',expenseTotal);set('dashBillsToday',todays.length);
  set('menuSalesToday',salesTotal);set('menuProfitToday',profitTotal);set('menuExpensesToday',expenseTotal);
 const dateNode=el('dashToday');if(dateNode)dateNode.textContent=formatAfghanDate(new Date(),true);
}
function triggerHomeShake(node){
 if(!node)return;
 node.classList.remove('yema-shake');
 void node.offsetWidth;
 node.classList.add('yema-shake');
}
function refresh(){
 updateKabulClock();updateHomeCart();updateTopRate();updateHomeDashboard();
 document.querySelectorAll('#productButtons [data-product]').forEach(b=>b.onclick=()=>{
  homeCart=[b.dataset.product];updateHomeCart();
  triggerHomeShake(b);
  triggerHomeShake(el('homeCartBar'));
 });
}
async function fetchKabulRate(){const response=await fetch('https://pxjsplptibleojdhhjil.supabase.co/functions/v1/usd-rate',{method:'GET',headers:{'Accept':'application/json'},cache:'no-store'});const data=await response.json();if(!response.ok||!Number.isFinite(Number(data.buy))||!Number.isFinite(Number(data.sell)))throw new Error(data.error||'نرخ معتبر از کانال دریافت نشد');return data;}
function jalaliDateToGregorianISO(input){const raw=String(input||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim();const m=raw.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);if(!m)return null;let jy=+m[1],jm=+m[2],jd=+m[3];if(jm<1||jm>12||jd<1||jd>(jm<=6?31:jm<=11?30:30))return null;jy+=1595;let days=-355668+365*jy+Math.floor(jy/33)*8+Math.floor((jy%33+3)/4)+jd+(jm<7?(jm-1)*31:(jm-7)*30+186);let gy=400*Math.floor(days/146097);days%=146097;if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++;}gy+=4*Math.floor(days/1461);days%=1461;if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365;}let gd=days+1;const leap=(gy%4===0&&gy%100!==0)||gy%400===0;const months=[0,31,leap?29:28,31,30,31,30,31,31,30,31,30,31];let gm=1;while(gm<=12&&gd>months[gm]){gd-=months[gm];gm++;}return String(gy).padStart(4,'0')+'-'+String(gm).padStart(2,'0')+'-'+String(gd).padStart(2,'0')}

function formatAfghanDate(value,weekday=false){if(!value)return '—';const raw=String(value);const date=/^\d{4}-\d{2}-\d{2}$/.test(raw)?new Date(raw+'T12:00:00+04:30'):new Date(raw);if(Number.isNaN(date.getTime()))return raw;const locale='fa-AF-u-ca-persian-nu-arab',zone='Asia/Kabul';const parts=new Intl.DateTimeFormat(locale,{timeZone:zone,year:'numeric',month:'long',day:'numeric',...(weekday?{weekday:'long'}:{})}).formatToParts(date);const monthNumber=new Intl.DateTimeFormat(locale,{timeZone:zone,month:'numeric'}).format(date);return parts.map(part=>part.type==='month'?part.value+' ('+monthNumber+')':part.value).join('')}
function normalizeAfghanDate(value){const raw=String(value||'').trim();if(!raw)return '';if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw;return jalaliDateToGregorianISO(raw)||''}
function field(label,name,type='text',hint=''){return '<label>'+label+'</label><input name="'+name+'" type="'+type+'" placeholder="'+hint+'" '+(type==='number'?'step="any" min="0"':'')+'>'}
function selectProduct(){return '<label>نوع محصول</label><select name="product">'+PRODUCTS.map(p=>'<option value="'+p+'">'+p+'</option>').join('')+'</select>'}
function values(body){return Object.fromEntries([...body.querySelectorAll('input,select,textarea')].map(x=>[x.name,x.value]))}
async function fetchAllRows(query){let rows=[],from=0;while(true){const {data,error}=await query.range(from,from+999);if(error)return {data:null,error};rows=rows.concat(data||[]);if(!data||data.length<1000)break;from+=1000;}return {data:rows,error:null};}
function page(name,title,html,handler){el('homeCartBar')?.classList.add('hidden');const host=el('cloudPanelHost');if(host&&el('cloudPanel')&&!host.contains(el('cloudPanel')))host.appendChild(el('cloudPanel'));el('home').classList.add('hidden');el('page').classList.remove('hidden');el('pageTitle').textContent=title;el('pageBody').innerHTML=html;if(handler)handler(el('pageBody'))}
function show(name,selectedProduct){
 if(name==='sale')page(name,'ثبت فروش و صدور بل',`
 <div class="sale-intro"><span class="sale-kicker">YEMA PETROLEUM</span><b>ثبت فروش جدید</b><small>اقلام را به سبد اضافه کنید؛ مجموع و باقی‌داری خودکار محاسبه می‌شود.</small></div>
 <div class="sale-datetime" id="saleDateTime" aria-live="off"></div>
 <section class="sale-section"><h4>مشخصات مشتری</h4>
 <label>نام مشتری</label><input name="customer" type="text" placeholder="نام کامل مشتری" autocomplete="off">
 <label for="salePhone">شماره تماس مشتری</label>
 <div class="sale-phone-row"><input id="salePhone" name="customerPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="شماره تماس مشتری"><button type="button" id="pickCustomerContact" class="sale-contact-btn">＋ انتخاب مخاطب از فایل گوشی</button></div>
 <input id="customerVcardFile" type="file" accept=".vcf,text/vcard" hidden>
 <small class="sale-contact-hint">در مخاطبین گوشی: اشتراک‌گذاری مخاطب ← ذخیره در فایل‌ها؛ سپس فایل VCF را اینجا انتخاب کنید.</small>
 </section>
 <section class="sale-section"><div class="sale-section-head"><h4>نوع تیل و مقدار</h4><span class="sale-count" id="saleCount">۱ قلم</span></div>
 <div id="saleItems"></div><button type="button" id="addSaleItem" class="sale-add">＋ افزودن محصول دیگر</button>
 </section>
 <section class="sale-total-card">
 <div><span>خرید جدید</span><b id="saleGrandTotal">۰ افغانی</b></div>
 <div><span>باقی‌داری قبلی مشتری</span><b id="salePreviousBalance">۰ افغانی</b></div>
 <div><span>مجموع بدهکاری</span><b id="saleTotalDue">۰ افغانی</b></div>
 <label>مبلغ پرداخت‌شده فعلی (افغانی)</label><input name="paid" id="salePaid" type="number" inputmode="decimal" min="0" step="any" placeholder="۰">
 <div class="sale-balance"><span>باقی‌مانده نهایی مشتری</span><b id="saleRemaining">۰ افغانی</b></div></section>
 <section class="sale-section"><h4>آدرس مشتری</h4><input name="address" type="text" placeholder="آدرس مشتری (اختیاری)"></section>
 <button class="primary sale-submit" id="save" type="button">ثبت بل فروش</button>
 <p class="sale-footnote">شماره بل به‌صورت خودکار از سیستم دریافت می‌شود.</p>
 <p class="sale-thanks">با تشکر و سپاس از خرید شما؛ به امید دیدار مجدد</p>
 `,body=>{
 const host=body.querySelector('#saleItems'),paidField=body.querySelector('#salePaid'),phoneField=body.querySelector('#salePhone'),customerField=body.querySelector('[name=customer]');
  let previousBalance=0, balanceLookupToken=0;
  const refreshPreviousBalance=async()=>{
   const token=++balanceLookupToken, customerName=customerField.value.trim(), cloud=window.yemaCloud?.client;
   previousBalance=0;
   if(!customerName||!cloud){updateTotals();return;}
   const {data:customers,error}=await cloud.from('customers').select('id').eq('name',customerName).limit(1);
   if(error||!customers?.length){updateTotals();return;}
   const {data:rows,error:salesError}=await cloud.from('sales').select('remaining').eq('customer_id',customers[0].id).gt('remaining',0);
   if(token!==balanceLookupToken)return;
   if(!salesError)previousBalance=(rows||[]).reduce((n,x)=>n+Number(x.remaining||0),0);
   updateTotals();
  };
  customerField.addEventListener('blur',refreshPreviousBalance);
 const addSaleItemButton=body.querySelector('#addSaleItem');
 const saleDateTime=body.querySelector('#saleDateTime');
 const updateSaleDateTime=()=>{const now=new Date();const d=formatAfghanDate(now,true);const t=new Intl.DateTimeFormat('fa-AF-u-nu-arab',{timeZone:'Asia/Kabul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);saleDateTime.textContent='تاریخ: '+d+'　 |　 ساعت: '+t;};
 updateSaleDateTime();
 const vcardInput=body.querySelector('#customerVcardFile');
 body.querySelector('#pickCustomerContact').onclick=()=>vcardInput.click();
 vcardInput.onchange=async()=>{
  const file=vcardInput.files&&vcardInput.files[0];if(!file)return;
  try{
   let raw=await file.text();
   raw=raw.replace(/\\r?\\n[ \\t]/g,'');
   const cards=raw.split(/BEGIN:VCARD/i).filter(x=>/END:VCARD/i.test(x));
   if(!cards.length)throw new Error('فایل مخاطب معتبر نیست');
   const card=cards[0].split(/END:VCARD/i)[0];
   const lines=card.split(/\\r?\\n/);
   const getValue=prefix=>{const line=lines.find(x=>new RegExp('^'+prefix+'(?:;[^:]*)?:','i').test(x));return line?line.slice(line.indexOf(':')+1).trim().replace(/\\\\n/gi,' ').replace(/\\\\,/g,',').replace(/\\\\;/g,';').replace(/\\\\\\\\/g,'\\\\'):'';};
   let contactName=getValue('FN');
   if(!contactName){const n=getValue('N');if(n)contactName=n.split(';').filter(Boolean).reverse().join(' ');}
   const telLine=lines.find(x=>/^(?:item\\d+\\.)?TEL(?:;[^:]*)?:/i.test(x));
   const tel=telLine?telLine.slice(telLine.indexOf(':')+1).trim().replace(/[() .-]/g,''): '';
   if(!tel)throw new Error('در فایل انتخاب‌شده شماره تلفن پیدا نشد');
   phoneField.value=tel;
   const nameField=body.querySelector('[name=customer]');
   if(contactName&&!nameField.value.trim())nameField.value=contactName;
   alert('مخاطب وارد شد'+(contactName?'： '+contactName:''));
  }catch(e){alert(e.message||'خواندن فایل مخاطب ناموفق بود');}
  finally{vcardInput.value='';}
 };
 const productOptions=PRODUCTS.concat(['فروش پرچون']).map(p=>'<option value="'+p+'">'+p+'</option>').join('');
 const addRow=(initialProduct='')=>{
  const card=document.createElement('div');
  card.className='sale-item-card';
  card.innerHTML=`
   <div class="sale-item-head"><strong>قلم فروش</strong><button type="button" class="sale-remove" aria-label="حذف این قلم">حذف</button></div>
   <label>نوع محصول</label>
   <select class="sale-product">${productOptions}</select>
   <div class="sale-fields">
    <div><label class="sale-qty-label">مقدار (لیتر)</label><input class="sale-qty" type="number" min="0" step="any" inputmode="decimal" placeholder="مقدار"></div>
    <div><label class="sale-price-label">قیمت فی لیتر (افغانی)</label><input class="sale-price" type="number" min="0" step="any" inputmode="decimal" placeholder="قیمت"></div>
   </div>
   <div class="sale-line-total"><span>جمع این قلم</span><b>۰ افغانی</b></div>
  `;
  const productSelect=card.querySelector('.sale-product');
  if(initialProduct && [...productSelect.options].some(option=>option.value===initialProduct))productSelect.value=initialProduct;
  const syncUnitLabels=()=>{
   const isGas=productSelect.value==='گاز';
   card.querySelector('.sale-qty-label').textContent=isGas?'مقدار (کیلوگرام)':'مقدار (لیتر)';
   card.querySelector('.sale-price-label').textContent=isGas?'قیمت فی کیلوگرام (افغانی)':'قیمت فی لیتر (افغانی)';
   card.querySelector('.sale-qty').placeholder=isGas?'کیلوگرام':'لیتر';
  };
  productSelect.addEventListener('change',()=>{syncUnitLabels();updateTotals();});
  card.querySelector('.sale-remove').addEventListener('click',()=>{card.remove();updateTotals();});
  syncUnitLabels();
  host.appendChild(card);
  updateTotals();
 };
 let updateTotals=()=>{
  let total=0;
  host.querySelectorAll('.sale-item-card').forEach(card=>{
   const q=Number(card.querySelector('.sale-qty').value||0),p=Number(card.querySelector('.sale-price').value||0);
   const line=Number.isFinite(q)&&Number.isFinite(p)&&q>0&&p>=0?q*p:0;
   total+=line;
   const lineNode=card.querySelector('.sale-line-total b');
   if(lineNode)lineNode.textContent=fmt(line)+' افغانی';
  });
  const count=host.querySelectorAll('.sale-item-card').length;
  const paid=Number(paidField.value||0),totalDue=previousBalance+total;
  body.querySelector('#saleGrandTotal').textContent=fmt(total)+' افغانی';
  body.querySelector('#salePreviousBalance').textContent=fmt(previousBalance)+' افغانی';
  body.querySelector('#saleTotalDue').textContent=fmt(totalDue)+' افغانی';
  body.querySelector('#saleRemaining').textContent=fmt(Math.max(0,totalDue-paid))+' افغانی';
  body.querySelector('#saleCount').textContent=fmt(count)+' قلم';
 };
 addRow(typeof selectedProduct==='string'?selectedProduct:'');
 addSaleItemButton.onclick=()=>addRow();
 ['input','change','keyup'].forEach(type=>host.addEventListener(type,event=>{
  if(event.target.matches('.sale-qty,.sale-price,.sale-product'))updateTotals();
 }));
 paidField.addEventListener('input',updateTotals);
 paidField.addEventListener('change',updateTotals);
 updateTotals();

 let saleSubmitting=false;
 const saleSaveButton=body.querySelector('#save');
 body.querySelector('#save').onclick=async()=>{
  if(saleSubmitting)return;
  const customer=body.querySelector('[name=customer]').value.trim(),phone=phoneField.value.trim(),paid=Number(paidField.value||0),address=body.querySelector('[name=address]').value.trim();
  const items=[...host.querySelectorAll('.sale-item-card')].map(card=>({
   product:card.querySelector('.sale-product').value,
   quantity:Number(card.querySelector('.sale-qty').value),
   unit_price:Number(card.querySelector('.sale-price').value)
  }));
  if(!customer)return alert('نام مشتری را وارد کنید');
  if(!items.length||items.some(x=>!Number.isFinite(x.quantity)||x.quantity<=0||!Number.isFinite(x.unit_price)||x.unit_price<0||cardValueMissing(x)))return alert('مقدار و قیمت هر محصول را بررسی کنید');
  const total=items.reduce((s,x)=>s+x.quantity*x.unit_price,0);
  if(!Number.isFinite(paid)||paid<0)return alert('مبلغ پرداخت‌شده را بررسی کنید');
  saleSubmitting=true;saleSaveButton.disabled=true;saleSaveButton.textContent='در حال جلوگیری از ثبت تکراری...';
  const cloud=window.yemaCloud?.client;if(!cloud){saleSubmitting=false;saleSaveButton.disabled=false;saleSaveButton.textContent='ثبت بل فروش';return alert('اتصال ابری آماده نیست؛ فروش ثبت نشد');}
  const {data:sessionData,error:sessionError}=await cloud.auth.getSession();if(sessionError||!sessionData.session){saleSubmitting=false;saleSaveButton.disabled=false;saleSaveButton.textContent='ثبت بل فروش';return alert('ابتدا وارد حساب ابری شوید؛ فروش ثبت نشد');}
  const now=new Date();
  const saleGregorian=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kabul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const saleDate=now.toISOString();
  const {data:cashAccounts,error:cashAccountsError}=await cloud.from('cash_accounts').select('id').eq('active',true).eq('currency','AFN').order('account_type').order('name').limit(1);
  if(cashAccountsError||!cashAccounts?.length){saleSubmitting=false;saleSaveButton.disabled=false;saleSaveButton.textContent='ثبت بل فروش';return alert('برای ثبت فروش، حداقل یک حساب افغانی فعال در بخش حساب‌ها لازم است.');}
  const cashAccountId=cashAccounts[0].id;
  saleSaveButton.textContent='در حال ثبت بل...';
  const requestId=yemaRequestId('sale_with_balance');
  const rpcArgs={p_request_id:requestId,p_customer_name:customer,p_items:items,p_paid:paid,p_sale_date:saleDate,p_notes:address||null,p_cash_account_id:cashAccountId};
  const {data:remote,error:remoteError}=await cloud.rpc('create_yema_sale_with_balance_once',rpcArgs);
  if(remoteError){console.error(remoteError);saleSubmitting=false;saleSaveButton.disabled=false;saleSaveButton.textContent='ثبت بل فروش';return alert('ثبت فروش ناموفق یا نامشخص است؛ برای جلوگیری از بل تکراری، همین ثبت را دوباره امتحان کنید. خطا: '+remoteError.message);}
  clearYemaRequestId('sale_with_balance');
  let phoneSaveWarning='';
  if(phone){const {error:customerPhoneError}=await cloud.from('customers').update({phone}).eq('id',remote.customer_id);if(customerPhoneError){console.error(customerPhoneError);phoneSaveWarning='\nهشدار: بل ثبت شد، اما ذخیره شماره تماس در حساب مشتری ناموفق بود.';}}
  const a=read('sales'),localItems=items.map(x=>({...x,unit:unit(x.product),line_total:x.quantity*x.unit_price}));
  a.push({id:remote.sale_id,bill:Number(remote.bill_number),customer,phone,address,product:items.length===1?items[0].product:'چند محصول',items:remote.items||localItems,qty:items.length===1?items[0].quantity:null,unit:items.length===1?unit(items[0].product):'—',price:items.length===1?items[0].unit_price:null,paid:Number(remote.received_now??paid),total:Number(remote.total),previousBalance:Number(remote.previous_balance||0),totalDue:Number(remote.total_due??(Number(remote.total)+Number(remote.previous_balance||0))),remainingAfterPayment:Number(remote.remaining_after_payment??remote.remaining??0),date:saleGregorian,cost:Number(remote.cost_total||0),profit:Number(remote.gross_profit||0),cloudSynced:true});write('sales',a);homeCart=[];alert('بل شماره '+fmt(remote.bill_number)+' با موفقیت ثبت شد'+phoneSaveWarning);refresh();show('history');
 };
 function cardValueMissing(item){return !Number.isFinite(item.quantity)||!Number.isFinite(item.unit_price)||item.quantity<=0;}
 });
 else if(name==='purchase')page(name,'خرید عمده',
    field('نام تأمین‌کننده','supplier')+
    field('شماره تماس تأمین‌کننده','supplierPhone','tel')+
    selectProduct()+
    field('مقدار خرید (تن)','qty','number')+
    field('قیمت فی تن (دالر)','usd','number')+
    field('مجموع خرید (دالر)','totalUsd','number')+
    field('پرداخت‌شده (دالر)','paidUsd','number')+
    field('باقی‌مانده (دالر)','remainingUsd','number')+
    field('تبدیل یک تن به لیتر / کیلوگرام','conversionFactor','number')+
    field('کرایه انتقال (افغانی)','freightAfn','number')+
    '<label>وضعیت پرداخت کرایه</label><select name="freightPaid"><option value="true">پرداخت شده</option><option value="false">پرداخت نشده</option></select>'+
    '<label>پرداخت کرایه از حساب افغانی</label><select name="freightCashAccountId"><option value="">انتخاب حساب افغانی</option></select>'+
    '<div class="listitem" id="stockPreview">موجودی قابل فروش پس از خرید: ۰</div>'+
    '<div class="listitem" id="costPreview">بهای تمام‌شده: ۰ افغانی | قیمت هر واحد: ۰ افغانی</div>'+
    field('نرخ دالر به افغانی (برای محاسبه بهای موجودی)','rate','number','نرخ روز')+
    '<button type="button" id="loadRate">دریافت نرخ آنلاین کابل</button><small id="rateStatus">کرایه در بهای تمام‌شده موجودی محاسبه می‌شود؛ رسید مشتری شامل این اطلاعات نیست.</small>'+
    '<label>پرداخت از حساب دالری (اختیاری)</label><select name="cashAccountId"><option value="">بدون ثبت پرداخت فعلی</option></select>'+
    field('تاریخ خرید (هجری شمسی افغانستان)','purchaseDate','text','مثلاً ۱۴۰۵/۰۸/۲۱')+
    field('توضیحات','notes')+
    '<button class="primary" id="save">ثبت خرید و صدور رسید</button>'+
    '<h3>تاریخچه خریدها و بهای تمام‌شده</h3><div id="purchaseInlineHistory">در حال دریافت خریدها...</div>',
    body=>{
      const product=body.querySelector('[name=product]'),qty=body.querySelector('[name=qty]'),usd=body.querySelector('[name=usd]'),total=body.querySelector('[name=totalUsd]'),paid=body.querySelector('[name=paidUsd]'),remaining=body.querySelector('[name=remainingUsd]'),factor=body.querySelector('[name=conversionFactor]'),rateField=body.querySelector('[name=rate]'),account=body.querySelector('[name=cashAccountId]'),freight=body.querySelector('[name=freightAfn]'),freightPaid=body.querySelector('[name=freightPaid]'),freightAccount=body.querySelector('[name=freightCashAccountId]'),preview=body.querySelector('#stockPreview'),costPreview=body.querySelector('#costPreview');
      const update=()=>{
        const q=Number(qty.value)||0,u=Number(usd.value)||0,p=Number(paid.value)||0,f=Number(factor.value)||0,r=Number(rateField.value)||0,fr=Number(freight.value)||0;
        total.value=qty.value&&usd.value?(q*u).toFixed(2):'';
        remaining.value=qty.value&&usd.value?Math.max(0,q*u-p).toFixed(2):'';
        const stock=q*f,landed=q*u*r+fr,unitCost=stock>0?landed/stock:0;
        preview.textContent='موجودی قابل فروش پس از خرید: '+fmt(stock)+' '+unit(product.value);
        costPreview.textContent='بهای تمام‌شده کل: '+fmt(landed)+' افغانی | قیمت تمام‌شده هر '+(product.value==='گاز'?'کیلوگرام':'لیتر')+': '+fmt(unitCost)+' افغانی';
        freightAccount.disabled=!(fr>0&&freightPaid.value==='true');
      };
      const loadProductFactor=async()=>{
        const cloud=window.yemaCloud?.client;if(!cloud)return;
        const {data,error}=await cloud.from('products').select('purchase_conversion_factor,sale_unit').eq('name',product.value).maybeSingle();
        if(!error&&data){factor.value=data.purchase_conversion_factor||1000;update();}
      };
      product.onchange=loadProductFactor;
      [qty,usd,paid,factor,freight,freightPaid,rateField].forEach(x=>x.addEventListener('input',update));
      freightPaid.onchange=update;
      const cloud=window.yemaCloud?.client;
      (async()=>{
        if(!cloud){account.innerHTML='<option value="">اتصال ابری موجود نیست</option>';freightAccount.innerHTML=account.innerHTML;return;}
        const [usdAccounts,afnAccounts]=await Promise.all([
          cloud.from('cash_accounts').select('id,name,account_type,currency').eq('active',true).eq('currency','USD').order('account_type').order('name'),
          cloud.from('cash_accounts').select('id,name,account_type,currency').eq('active',true).eq('currency','AFN').order('account_type').order('name')
        ]);
        if(usdAccounts.error)account.innerHTML='<option value="">خطا در دریافت حساب‌های دالری</option>';
        else account.innerHTML='<option value="">بدون ثبت پرداخت فعلی</option>'+(usdAccounts.data||[]).map(a=>'<option value="'+escapeHtml(a.id)+'">'+(a.account_type==='cash'?'صندوق نقدی':'حساب بانکی')+' — '+escapeHtml(a.name)+'</option>').join('');
        if(afnAccounts.error)freightAccount.innerHTML='<option value="">خطا در دریافت حساب‌های افغانی</option>';
        else freightAccount.innerHTML='<option value="">انتخاب حساب افغانی</option>'+(afnAccounts.data||[]).map(a=>'<option value="'+escapeHtml(a.id)+'">'+(a.account_type==='cash'?'صندوق نقدی':'حساب بانکی')+' — '+escapeHtml(a.name)+'</option>').join('');
      })();
      const loadRate=async()=>{
        const status=body.querySelector('#rateStatus');status.textContent='در حال دریافت نرخ دالر...';
        try{const x=await fetchKabulRate();rateField.value=x.sell;status.textContent='نرخ دالر: '+fmt(x.sell)+' افغانی؛ برای محاسبه بهای تمام‌شده';update();}
        catch(e){status.textContent='نرخ آنلاین موجود نیست؛ نرخ را دستی وارد کنید.';}
      };
      body.querySelector('#loadRate').onclick=loadRate;
      fetchKabulRate().then(x=>{rateField.value=x.sell;body.querySelector('#rateStatus').textContent='نرخ دالر: '+fmt(x.sell)+' افغانی؛ برای محاسبه بهای تمام‌شده';update();}).catch(()=>{body.querySelector('#rateStatus').textContent='نرخ را دستی وارد کنید.';});
      loadProductFactor();
      const renderInlineHistory=async()=>{
        const host=body.querySelector('#purchaseInlineHistory');
        if(!cloud){host.textContent='اتصال ابری موجود نیست.';return;}
        const {data:rows,error}=await fetchAllRows(cloud.from('purchases').select('id,supplier_name,purchase_date,total_usd,exchange_rate,freight_afn,freight_paid,purchase_items(entered_quantity,entered_unit,stock_quantity,stock_unit,unit_cost,line_total,products(name))').order('purchase_date',{ascending:false}));
        if(error){host.textContent='خطا در دریافت تاریخچه: '+error.message;return;}
        host.innerHTML=(rows||[]).map(x=>(x.purchase_items||[]).map(it=>{
          const productName=it.products?.name||'محصول',stockUnit=it.stock_unit==='kg'?'کیلوگرام':'لیتر';
          const landed=Number(it.line_total??(Number(it.unit_cost||0)*Number(it.stock_quantity||0)));
          return '<div class="listitem"><b>'+escapeHtml(productName)+' — خرید مورخ '+escapeHtml((x.purchase_date||'').slice(0,10))+'</b>'+
            '<div>تأمین‌کننده: '+escapeHtml(x.supplier_name||'—')+'</div>'+
            '<div>مقدار عمده: '+fmt(it.entered_quantity)+' تن | مقدار دقیق موجودی: '+fmt(it.stock_quantity)+' '+stockUnit+'</div>'+
            '<div>قیمت خرید: '+fmt(x.total_usd)+' دالر | نرخ تبدیل: '+fmt(x.exchange_rate)+'</div>'+
            '<div>کرایه انتقال: '+fmt(x.freight_afn||0)+' افغانی ('+(x.freight_paid?'پرداخت شده':'پرداخت نشده')+')</div>'+
            '<div>بهای تمام‌شده کل: '+fmt(landed)+' افغانی</div>'+
            '<div><b>بهای تمام‌شده هر '+stockUnit+': '+fmt(it.unit_cost)+' افغانی</b></div></div>';
        }).join('')).join('')||'هنوز خریدی ثبت نشده است';
      };
      renderInlineHistory();
      let purchaseSubmitting=false;
      el('save').onclick=async()=>{
        if(purchaseSubmitting)return;
        const v=values(body),q=Number(v.qty),u=Number(v.usd),p=Number(v.paidUsd||0),f=Number(v.conversionFactor),r=Number(v.rate),fr=Number(v.freightAfn||0),freightIsPaid=v.freightPaid==='true';
        if(!v.supplier||!Number.isFinite(q)||q<=0||!Number.isFinite(u)||u<=0||!Number.isFinite(p)||p<0||p>q*u||!Number.isFinite(f)||f<=0||!Number.isFinite(r)||r<=0||!Number.isFinite(fr)||fr<0)return alert('نام تأمین‌کننده، مقدار، قیمت، ضریب تبدیل، نرخ دالر و کرایه را بررسی کنید.');
        if(p>0&&!v.cashAccountId)return alert('برای ثبت پرداخت، حساب دالری را انتخاب کنید.');
        if(fr>0&&freightIsPaid&&!v.freightCashAccountId)return alert('برای کرایه پرداخت‌شده، حساب افغانی را انتخاب کنید.');
        if((fr===0||!freightIsPaid)&&v.freightCashAccountId)return alert('برای کرایه پرداخت‌نشده حساب پرداخت انتخاب نکنید.');
        purchaseSubmitting=true;
        const cloud=window.yemaCloud?.client;if(!cloud){purchaseSubmitting=false;return alert('اتصال ابری آماده نیست؛ خرید ثبت نشد.');}
        const {data:auth,error:authError}=await cloud.auth.getSession();if(authError||!auth.session){purchaseSubmitting=false;return alert('ابتدا وارد حساب ابری شوید؛ خرید ثبت نشد.');}
        const purchaseISO=normalizeAfghanDate(v.purchaseDate);if(v.purchaseDate&&!purchaseISO){purchaseSubmitting=false;return alert('تاریخ خرید را به شکل سال/ماه/روز هجری شمسی وارد کنید');}
        const date=purchaseISO?new Date(purchaseISO+'T12:00:00+04:30').toISOString():new Date().toISOString();
        const requestId=yemaRequestId('purchase');
        const {data:remote,error}=await cloud.rpc('create_yema_purchase_once',{p_request_id:requestId,p_supplier_name:v.supplier,p_supplier_phone:v.supplierPhone||null,p_product_name:v.product,p_entered_quantity:q,p_usd_per_ton:u,p_exchange_rate:r,p_conversion_factor:f,p_paid_usd:p,p_purchase_date:date,p_notes:v.notes||null,p_cash_account_id:v.cashAccountId||null,p_freight_afn:fr,p_freight_paid:freightIsPaid,p_freight_cash_account_id:freightIsPaid&&fr>0?v.freightCashAccountId:null});
        if(error){console.error(error);purchaseSubmitting=false;return alert('ثبت خرید ناموفق یا نامشخص است؛ اگر خطای شبکه بود، همین ثبت را دوباره امتحان کنید. خطا: '+error.message);}
        clearYemaRequestId('purchase');
        const rows=read('purchases');rows.push({id:remote.purchase_id,supplier:v.supplier,supplierPhone:v.supplierPhone,product:v.product,qty:q,enteredUnit:'تن',stockQty:Number(remote.stock_quantity),unit:remote.stock_unit==='kg'?'کیلوگرام':'لیتر',conversionFactor:f,usd:u,totalUsd:Number(remote.total_usd),paidUsd:Number(remote.paid_usd),remainingUsd:Number(remote.remaining_usd),rate:r,total:Number(remote.total_afn),paid:Number(remote.paid_afn),freightAfn:Number(remote.freight_afn||0),freightPaid:!!remote.freight_paid,acquisitionTotalAfn:Number(remote.acquisition_total_afn||0),unitCostAfn:Number(remote.unit_cost_afn||0),date:purchaseISO||new Date().toISOString().slice(0,10),cloudSynced:true});
        write('purchases',rows);
        alert('خرید ثبت شد. مجموع خرید: '+fmt(remote.total_usd)+' دالر؛ کرایه: '+fmt(remote.freight_afn||0)+' افغانی؛ بهای تمام‌شده کل: '+fmt(remote.acquisition_total_afn)+' افغانی؛ بهای هر '+(remote.stock_unit==='kg'?'کیلوگرام':'لیتر')+': '+fmt(remote.unit_cost_afn)+' افغانی.');
        refresh();home();
      };
    });
 else if(name==='expenses')page(name,'ثبت مصارف','<label>دسته‌بندی مصرف</label><select name="title" required><option value="">انتخاب نوع مصرف</option><option value="خرید نان">خرید نان</option><option value="خرجی روزانه">خرجی روزانه</option><option value="صبحانه">غذای صبحانه</option><option value="غذای چاشت">غذای نهار / چاشت</option><option value="غذای شام">غذای شام</option><option value="چای و خوراکی">چای و خوراکی</option><option value="مصارف روزمره">مصارف روزمره</option><option value="معاش کارمندان">معاش کارمندان</option><option value="پول آب و برق">پول آب و برق</option><option value="مصارف اضافی یما پطرولیم">مصارف اضافی یما پطرولیم</option><option value="سایر">سایر مصارف</option></select>'+field('شرح مصرف (اختیاری)','notes')+'<label>واحد پول</label><select name="currency"><option value="AFN">افغانی</option><option value="USD">دالر</option></select>'+field('مبلغ مصرف','amount','number')+field('نرخ دالر به افغانی (برای مصرف دالری)','rate','number')+'<label>پرداخت از حساب</label><select name="cashAccountId"><option value="">در حال دریافت حساب‌ها...</option></select>'+'<button type="button" id="loadRate">دریافت نرخ آنلاین کابل</button><small id="rateStatus">منبع: کانال تلگرام کابل نرخ دالر</small>'+field('تاریخ مصرف (هجری شمسی افغانستان)','expenseDate','text','مثلاً ۱۴۰۵/۰۸/۲۱')+field('توضیحات','notes')+'<button class="primary" id="save">ثبت مصرف</button>',body=>{const currency=body.querySelector('[name=currency]'),rateField=body.querySelector('[name=rate]');const accountSelect=body.querySelector('[name=cashAccountId]');let availableAccounts=[];const loadAccounts=async()=>{const cloud=window.yemaCloud?.client;if(!cloud){accountSelect.innerHTML='<option value="">اتصال ابری موجود نیست</option>';return;}const {data,error}=await cloud.from('cash_accounts').select('id,name,currency').eq('active',true).order('name');if(error){accountSelect.innerHTML='<option value="">خطا در دریافت حساب‌ها</option>';return;}availableAccounts=data||[];renderAccounts();};const renderAccounts=()=>{const list=availableAccounts.filter(a=>a.currency===currency.value);accountSelect.innerHTML='<option value="">انتخاب حساب '+(currency.value==='USD'?'دالری':'افغانی')+'</option>'+list.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('');};const toggle=()=>{rateField.disabled=currency.value!=='USD';rateField.placeholder=currency.value==='USD'?'نرخ ضروری':'برای مصرف دالری';renderAccounts();};currency.onchange=toggle;toggle();loadAccounts();const loadRate=async()=>{const status=body.querySelector('#rateStatus');status.textContent='در حال دریافت نرخ...';try{const rate=await fetchKabulRate();rateField.value=rate.sell;status.textContent='نرخ فروش آنلاین: '+fmt(rate.sell)+' | کابل نرخ دالر';}catch(e){status.textContent='نرخ آنلاین در دسترس نیست؛ دستی وارد کنید.';}};body.querySelector('#loadRate').onclick=loadRate;loadRate();let expenseSubmitting=false;el('save').onclick=async()=>{if(expenseSubmitting)return;const v=values(body),n=Number(v.amount),rate=Number(v.rate);if(!v.title||v.amount===''||!Number.isFinite(n)||n<=0)return alert('عنوان و مبلغ مصرف را درست وارد کنید');if(v.currency==='USD'&&(!Number.isFinite(rate)||rate<=0))return alert('برای مصرف دالری نرخ تبدیل را وارد کنید');const cloud=window.yemaCloud?.client;if(!cloud)return alert('اتصال ابری موجود نیست؛ مصرف ثبت نشد');const {data:auth,error:authError}=await cloud.auth.getSession();if(authError||!auth.session){expenseSubmitting=false;return alert('ابتدا وارد حساب ابری شوید؛ مصرف ثبت نشد');}if(!v.cashAccountId)return alert('حساب پرداخت را انتخاب کنید');expenseSubmitting=true;const expenseISO=normalizeAfghanDate(v.expenseDate);if(v.expenseDate&&!expenseISO){expenseSubmitting=false;return alert('تاریخ مصرف را به شکل سال/ماه/روز هجری شمسی وارد کنید');}const date=expenseISO?new Date(expenseISO+'T12:00:00+04:30').toISOString():new Date().toISOString();const amountAFN=v.currency==='AFN'?n:n*rate;const requestId=yemaRequestId('expense');const {data:remote,error}=await cloud.rpc('create_yema_expense_once',{p_request_id:requestId,p_title:v.title,p_amount:n,p_currency:v.currency,p_exchange_rate:v.currency==='USD'?rate:null,p_amount_afn:amountAFN,p_expense_date:date,p_notes:v.notes||null,p_cash_account_id:v.cashAccountId});if(error){console.error(error);expenseSubmitting=false;return alert('ثبت مصرف ناموفق یا نامشخص است؛ اگر خطای شبکه بود، همین ثبت را دوباره امتحان کنید. خطا: '+error.message)}clearYemaRequestId('expense');const arr=read('expenses');arr.push({id:remote.expense_id,title:remote.title,amount:Number(remote.amount),currency:remote.currency,exchangeRate:v.currency==='USD'?rate:null,amountAFN:Number(remote.amount_afn),cashAccountId:remote.cash_account_id,date:expenseISO||date.slice(0,10),cloudSynced:true});write('expenses',arr);alert('مصرف در دیتابیس ابری ثبت شد');refresh();home();};});

 else if(name==='retailControl')page(name,'کنترل موجودی فروش پرچون',
 '<p>مقدار برداشت از هر مخزن را جداگانه وارد کنید. سیستم بهای هر لیتر را از خریدهای ثبت‌شده و به روش FIFO محاسبه می‌کند.</p>'+
 '<div class="listitem" id="retailSourceBalances">در حال دریافت موجودی مخزن‌ها...</div>'+
 '<section class="sale-section"><h4>برداشت از پطرول ۹۲</h4>'+
 '<label>مقدار انتقال (لیتر)</label><input id="rc92liters" type="number" min="0" step="any" inputmode="decimal" placeholder="لیتر ۹۲">'+
 '<div class="listitem" id="rc92weight">وزن محاسبه‌شده: —</div>'+
 '<div class="listitem" id="rc92cost">بهای FIFO: —</div></section>'+
 '<section class="sale-section"><h4>برداشت از پطرول ۸۰</h4>'+
 '<label>مقدار انتقال (لیتر)</label><input id="rc80liters" type="number" min="0" step="any" inputmode="decimal" placeholder="لیتر ۸۰">'+
 '<div class="listitem" id="rc80weight">وزن محاسبه‌شده: —</div>'+
 '<div class="listitem" id="rc80cost">بهای FIFO: —</div></section>'+
 '<section class="sale-total-card"><div class="listitem">مجموع مقدار انتقال: <b id="rcTotalLiters">۰ لیتر</b></div>'+
 '<div class="listitem">مجموع بهای تمام‌شده: <b id="rcTotalCost">۰ افغانی</b></div>'+
 '<div class="listitem">قیمت میانگین هر لیتر فروش پرچون: <b id="rcAverageCost">۰ افغانی</b></div></section>'+
 '<button type="button" class="primary" id="rcTransfer">تأیید و انتقال به موجودی فروش پرچون</button>'+
 '<div id="rcResult" aria-live="polite"></div>',
 async body=>{
  const cloud=window.yemaCloud?.client;
  if(!cloud){body.innerHTML='اتصال ابری موجود نیست؛ انتقال موجودی انجام نمی‌شود.';return;}
  const {data:auth,error:authError}=await cloud.auth.getSession();
  if(authError||!auth.session){body.innerHTML='ابتدا وارد حساب ابری شوید.';return;}
  const fields={l92:body.querySelector('#rc92liters'),l80:body.querySelector('#rc80liters')};
  const button=body.querySelector('#rcTransfer');
  let products={},batches={92:[],80:[]},available={92:0,80:0},loading=false;
  const fifoCost=(rows,qty)=>{
   let left=qty,cost=0;
   for(const batch of rows){if(left<=0)break;const take=Math.min(left,Number(batch.remaining_quantity||0));cost+=take*Number(batch.unit_cost||0);left-=take;}
   return {cost,left,available:rows.reduce((n,x)=>n+Number(x.remaining_quantity||0),0)};
  };
  const refreshSource=async()=>{
   const {data:ps,error:pe}=await cloud.from('products').select('id,name').in('name',['پطرول ۹۲','پطرول ۸۰','فروش پرچون']);
   if(pe)throw pe;
   for(const p of ps||[])products[p.name]=p.id;
   if(!products['پطرول ۹۲']||!products['پطرول ۸۰']||!products['فروش پرچون'])throw new Error('محصولات پطرول ۹۲، پطرول ۸۰ و فروش پرچون باید در سیستم موجود باشند.');
   for(const [grade,name] of [['92','پطرول ۹۲'],['80','پطرول ۸۰']]){
    const {data,error}=await cloud.from('stock_batches').select('remaining_quantity,unit_cost,batch_date,created_at,purchase_item_id,purchase_items(entered_quantity,entered_unit,stock_quantity,stock_unit)').eq('product_id',products[name]).eq('unit','liter').gt('remaining_quantity',0).order('batch_date',{ascending:true}).order('created_at',{ascending:true});
    if(error)throw error;
    batches[grade]=data||[];
    available[grade]=batches[grade].reduce((n,x)=>n+Number(x.remaining_quantity||0),0);
   }
   const {data:retailRows,error:re}=await cloud.from('stock_batches').select('remaining_quantity').eq('product_id',products['فروش پرچون']).eq('unit','liter').gt('remaining_quantity',0);
   if(re)throw re;
   const retailQty=(retailRows||[]).reduce((n,x)=>n+Number(x.remaining_quantity||0),0);
   body.querySelector('#retailSourceBalances').textContent='موجودی فعلی — ۹۲: '+fmt(available['92'])+' لیتر | ۸۰: '+fmt(available['80'])+' لیتر | فروش پرچون: '+fmt(retailQty)+' لیتر';
   renderPreview();
  };
  const fifoDetails=(rows,qty)=>{
   let left=qty,cost=0,weightKg=0,weightKnown=true;
   for(const batch of rows){
    if(left<=0)break;
    const availableQty=Number(batch.remaining_quantity||0),take=Math.min(left,availableQty);
    cost+=take*Number(batch.unit_cost||0);
    const item=batch.purchase_items;
    const entered=Number(item?.entered_quantity||0),stock=Number(item?.stock_quantity||0);
    if(!item||item.stock_unit!=='liter'||stock<=0||entered<=0){weightKnown=false;}
    else weightKg+=take*(entered*(item.entered_unit==='ton'?1000:1)/stock);
    left-=take;
   }
   return {cost,left,weightKg,weightKnown};
  };
  const renderPreview=()=>{
   const q92=Number(fields.l92.value||0),q80=Number(fields.l80.value||0),total=q92+q80;
   const c92=fifoDetails(batches['92'],q92),c80=fifoDetails(batches['80'],q80),cost=c92.cost+c80.cost;
   const enough=c92.left<=0.0000001&&c80.left<=0.0000001;
   const weightKnown=(q92<=0||c92.weightKnown)&&(q80<=0||c80.weightKnown);
   body.querySelector('#rc92weight').textContent='وزن محاسبه‌شده از خرید FIFO: '+(q92>0&&c92.weightKnown?fmt(c92.weightKg)+' کیلوگرام':'—');
   body.querySelector('#rc80weight').textContent='وزن محاسبه‌شده از خرید FIFO: '+(q80>0&&c80.weightKnown?fmt(c80.weightKg)+' کیلوگرام':'—');
   body.querySelector('#rc92cost').textContent='بهای ۹۲ بر اساس FIFO: '+fmt(c92.cost)+' افغانی | نرخ فی لیتر: '+(q92>0?fmt(c92.cost/q92):'—')+' افغانی';
   body.querySelector('#rc80cost').textContent='بهای ۸۰ بر اساس FIFO: '+fmt(c80.cost)+' افغانی | نرخ فی لیتر: '+(q80>0?fmt(c80.cost/q80):'—')+' افغانی';
   body.querySelector('#rcTotalLiters').textContent=fmt(total)+' لیتر';
   body.querySelector('#rcTotalCost').textContent=fmt(cost)+' افغانی';
   body.querySelector('#rcAverageCost').textContent=total>0?fmt(cost/total)+' افغانی':'۰ افغانی';
   button.disabled=loading||total<=0||!enough||!weightKnown;
   return {c92,c80,weightKnown};
  };
  Object.values(fields).forEach(input=>input.addEventListener('input',renderPreview));
  try{await refreshSource();}catch(e){body.querySelector('#retailSourceBalances').textContent='دریافت موجودی ناموفق شد: '+e.message;button.disabled=true;return;}
  button.onclick=async()=>{
   if(loading)return;
   const q92=Number(fields.l92.value||0),q80=Number(fields.l80.value||0),total=q92+q80;
   if(total<=0)return alert('مقدار لیتر را وارد کنید.');
   const details=renderPreview(),c92=details.c92,c80=details.c80;
   if(c92.left>0.0000001||c80.left>0.0000001)return alert('موجودی یکی از مخزن‌ها کافی نیست؛ مقدار انتقال اصلاح شود.');
   if(!details.weightKnown)return alert('برای یکی از محموله‌های موجود، اطلاعات وزن خرید ثبت نشده است؛ انتقال انجام نمی‌شود.');
   const kg92=c92.weightKg,kg80=c80.weightKg;
   const avg=(c92.cost+c80.cost)/total;
   const confirmText='انتقال داخلی تأیید شود؟\nپطرول ۹۲: '+fmt(q92)+' لیتر\nپطرول ۸۰: '+fmt(q80)+' لیتر\nمجموع: '+fmt(total)+' لیتر\nبهای میانگین FIFO: '+fmt(avg)+' افغانی فی لیتر\n\nپس از تأیید، از موجودی اصلی هر محصول کم و به موجودی فروش پرچون اضافه می‌شود.';
   if(!confirm(confirmText))return;
   loading=true;button.disabled=true;button.textContent='در حال انتقال...';
   const requestId=yemaRequestId('retail_batch');
   const {data:result,error}=await cloud.rpc('record_yema_retail_batch_once',{
    p_request_id:requestId,p_92_kg:kg92,p_92_liters:q92,p_80_kg:kg80,p_80_liters:q80,
    p_batch_date:new Date().toISOString(),p_notes:'انتقال داخلی از مخزن‌های ۹۲ و ۸۰ به موجودی فروش پرچون'
   });
   if(error){
    console.error(error);loading=false;button.disabled=false;button.textContent='تأیید و انتقال به موجودی فروش پرچون';
    return alert('انتقال انجام نشد و موجودی تغییر نکرد: '+error.message);
   }
   clearYemaRequestId('retail_batch');
   const rate92=q92>0?Number(result.petrol_92_cost_afn||0)/q92:0;
   const rate80=q80>0?Number(result.petrol_80_cost_afn||0)/q80:0;
   body.querySelector('#rcResult').innerHTML='<div class="listitem"><b>انتقال با موفقیت ثبت شد</b><br>موجودی باقی‌ماندهٔ ۹۲: '+fmt(result.petrol_92_stock_after)+' لیتر<br>موجودی باقی‌ماندهٔ ۸۰: '+fmt(result.petrol_80_stock_after)+' لیتر<br>مقدار افزوده‌شده به فروش پرچون: '+fmt(result.retail_stock_added)+' لیتر<br>نرخ FIFO تیل ۹۲: '+fmt(rate92)+' افغانی فی لیتر<br>نرخ FIFO تیل ۸۰: '+fmt(rate80)+' افغانی فی لیتر<br>قیمت میانگین فروش پرچون: '+fmt(result.unit_cost_afn)+' افغانی فی لیتر</div>';
   for(const input of Object.values(fields))input.value='';
   loading=false;button.textContent='تأیید و انتقال به موجودی فروش پرچون';
   try{await refreshSource();}catch(e){console.error(e);body.querySelector('#retailSourceBalances').textContent='انتقال ثبت شد؛ تازه‌سازی موجودی ناموفق بود.';}
  };
 });

 else if(name==='inventory'){page(name,'موجودی محصولات','<p>در حال دریافت موجودی از دیتابیس ابری...</p>',async body=>{const cloud=window.yemaCloud?.client;if(!cloud){body.innerHTML='اتصال ابری موجود نیست؛ موجودی ابری قابل دریافت نیست.';return;}const {data:sessionData,error:sessionError}=await cloud.auth.getSession();if(sessionError||!sessionData.session){body.innerHTML='ابتدا وارد حساب ابری شوید.';return;}const {data:batches,error}=await cloud.from('stock_batches').select('product_id,remaining_quantity,unit,products(name)').gt('remaining_quantity',0);if(error){console.error(error);body.innerHTML='دریافت موجودی ناموفق شد: '+error.message;return;}const totals={};for(const b of batches||[]){const name=b.products?.name||'محصول';totals[name]=(totals[name]||0)+Number(b.remaining_quantity||0);}body.innerHTML=PRODUCTS.concat(['فروش پرچون']).map(prod=>'<div class="listitem"><b>'+prod+'</b><div>موجودی قابل فروش: '+fmt(totals[prod]||0)+' '+unit(prod)+'</div></div>').join('')||'موجودی ثبت نشده است';});}
 else if(name==='customers'){page(name,'گزارش و حساب جداگانه مشتریان','<p>در حال دریافت حساب مشتریان...</p>',async body=>{const cloud=window.yemaCloud?.client;if(!cloud){body.innerHTML='اتصال ابری موجود نیست.';return;}const {data:auth}=await cloud.auth.getSession();if(!auth.session){body.innerHTML='ابتدا وارد حساب ابری شوید.';return;}const {data:sales,error}=await fetchAllRows(cloud.from('sales').select('id,bill_number,customer_id,customer_name,sale_date,total,paid,remaining,previous_balance,received_now,remaining_after_payment').order('sale_date',{ascending:false}));if(error){body.innerHTML='خطا در دریافت مشتریان: '+error.message;return;}const ids=(sales||[]).map(x=>x.id);let items=[];if(ids.length){const ir=await fetchAllRows(cloud.from('sale_items').select('sale_id,quantity,unit,unit_price,line_total,product_id').in('sale_id',ids));if(ir.error){body.innerHTML='خطا در دریافت اقلام فاکتورها: '+ir.error.message;return;}items=ir.data||[];}const pids=[...new Set(items.map(x=>x.product_id).filter(Boolean))];let products=[];if(pids.length){const pr=await cloud.from('products').select('id,name').in('id',pids);if(pr.error){body.innerHTML='خطا در دریافت نام محصولات: '+pr.error.message;return;}products=pr.data||[];}const cids=[...new Set((sales||[]).map(x=>x.customer_id).filter(Boolean))];let customerRows=[];if(cids.length){const cr=await cloud.from('customers').select('id,address,phone').in('id',cids);if(cr.error){body.innerHTML='خطا در دریافت مشخصات مشتریان: '+cr.error.message;return;}customerRows=cr.data||[];}let payments=[];if(cids.length){const pr=await fetchAllRows(cloud.from('customer_payments').select('id,customer_id,amount,payment_date,notes').in('customer_id',cids).order('payment_date',{ascending:false}));if(pr.error){body.innerHTML='خطا در دریافت پرداخت‌های مشتریان: '+pr.error.message;return;}payments=pr.data||[];}const mapped=(sales||[]).map(x=>({...x,bill:Number(x.bill_number),total:Number(x.total||0),paid:Number(x.paid||0),receivedNow:Number(x.received_now??x.paid??0),remaining:Number(x.remaining||0),previousBalance:Number(x.previous_balance||0),totalDue:Number(x.previous_balance||0)+Number(x.total||0),remainingAfterPayment:Number(x.remaining_after_payment??x.remaining??0),date:x.sale_date,lines:items.filter(it=>it.sale_id===x.id).map(it=>({product:products.find(p=>p.id===it.product_id)?.name||'محصول',qty:Number(it.quantity||0),unit:it.unit==='kg'?'کیلوگرام':'لیتر',price:Number(it.unit_price||0),sum:Number(it.line_total||0)})),customerInfo:customerRows.find(c=>c.id===x.customer_id)||{}}));const groups=new Map();mapped.forEach(x=>{const key=x.customer_id||('name:'+x.customer_name);if(!groups.has(key))groups.set(key,{key,id:x.customer_id,name:x.customer_name||'بدون نام',phone:x.customerInfo.phone||'',address:x.customerInfo.address||'',invoices:[],payments:[],total:0,paid:0,remaining:0});const g=groups.get(key);g.invoices.push(x);g.total+=x.total;g.paid+=x.paid;g.remaining+=x.remaining;});payments.forEach(p=>{const g=groups.get(p.customer_id);if(g)g.payments.push(p);});const list=[...groups.values()].sort((a,b)=>a.name.localeCompare(b.name,'fa'));let currentCustomer=null;const renderList=()=>{currentCustomer=null;body.innerHTML='<p class="muted">برای دیدن حساب، خریدها و پرداخت‌های هر مشتری، نام همان مشتری را انتخاب کنید.</p>'+list.map((g,i)=>'<button type="button" class="listitem" data-customer-index="'+i+'" style="display:block;width:100%;text-align:right"><b>'+escapeHtml(g.name)+'</b><div>تعداد فاکتور: '+fmt(g.invoices.length)+' | مجموع خرید: '+fmt(g.total)+' افغانی</div><div>پرداخت‌شده: '+fmt(g.paid)+' | باقی: '+fmt(g.remaining)+' افغانی</div></button>').join('')||'هنوز مشتری ثبت نشده است';};const openCustomer=g=>{currentCustomer=g;const accountOptions='<option value="">انتخاب صندوق / حساب افغانی</option>';body.innerHTML='<button type="button" id="backCustomers">← برگشت به فهرست مشتریان</button><h3>'+escapeHtml(g.name)+'</h3>'+(g.phone?'<div class="listitem">شماره تماس: '+escapeHtml(g.phone)+'</div>':'')+(g.address?'<div class="listitem">آدرس: '+escapeHtml(g.address)+'</div>':'')+'<div class="listitem"><b>حساب اختصاصی همین مشتری</b><div>مجموع خرید: '+fmt(g.total)+' افغانی</div><div>مجموع پرداخت: '+fmt(g.paid)+' افغانی</div><div><b>باقی‌داری فعلی: '+fmt(g.remaining)+' افغانی</b></div></div><section class="listitem" style="margin:12px 0"><h4>دریافت باقی‌داری همین مشتری</h4><label>مبلغ دریافتی (افغانی)</label><input id="customerPaymentAmount" type="number" min="0.01" step="0.01" value="'+(g.remaining>0?g.remaining:'')+'" placeholder="مبلغ پرداختی"><label>واریز به حساب</label><select id="customerPaymentAccount">'+accountOptions+'</select><label>توضیحات (اختیاری)</label><input id="customerPaymentNotes" type="text" placeholder="توضیحات پرداخت"><button type="button" class="primary" id="saveCustomerPayment" '+(g.remaining<=0?'disabled':'')+'>ثبت دریافت پول و تسویه</button><small>پرداخت فقط به همین مشتری ثبت می‌شود و به ترتیب قدیمی‌ترین بل‌های باز او تسویه می‌گردد.</small></section><h4>فاکتورهای همین مشتری</h4>'+g.invoices.map((x,i)=>'<button type="button" class="listitem" data-invoice-index="'+i+'" style="display:block;width:100%;text-align:right"><b>فاکتور شماره '+fmt(x.bill)+'</b><div>تاریخ: '+formatAfghanDate(x.date)+'</div><div>مجموع: '+fmt(x.total)+' افغانی | باقی: '+fmt(x.remaining)+' افغانی</div></button>').join('')+'<h4>سابقه دریافت پول از همین مشتری</h4>'+g.payments.map(p=>'<div class="listitem"><b>'+fmt(p.amount)+' افغانی</b><div>تاریخ: '+formatAfghanDate(p.payment_date)+'</div>'+(p.notes?'<div>'+escapeHtml(p.notes)+'</div>':'')+'</div>').join('')+(g.payments.length?'':'<p class="muted">هنوز پرداخت جداگانه‌ای ثبت نشده است.</p>');const accountSelect=body.querySelector('#customerPaymentAccount');(async()=>{const {data,error}=await cloud.from('cash_accounts').select('id,name,account_type,currency').eq('active',true).eq('currency','AFN').order('account_type').order('name');if(error){accountSelect.innerHTML='<option value="">خطا در دریافت حساب‌ها</option>';return;}accountSelect.innerHTML=accountOptions+(data||[]).map(a=>'<option value="'+a.id+'">'+(a.account_type==='cash'?'صندوق نقدی':'حساب بانکی')+' — '+escapeHtml(a.name)+'</option>').join('');})();};const openInvoice=x=>{const invoiceLines=isRetailMixSale({items:x.lines})?[{product:'فروش پرچون',qty:x.lines.reduce((n,it)=>n+Number(it.qty||0),0),unit:'لیتر',price:Number(x.lines[0]?.price||0),sum:Number(x.total)}]:x.lines;const lines=invoiceLines.map(it=>'<tr><td>'+escapeHtml(it.product)+'</td><td>'+fmt(it.qty)+' '+it.unit+'</td><td>'+fmt(it.price)+' افغانی</td><td>'+fmt(it.sum) +' افغانی</td></tr>').join('');body.innerHTML='<button type="button" id="backCustomerInvoices">← برگشت به حساب مشتری</button><h3>فاکتور شماره '+fmt(x.bill)+'</h3><div class="listitem">مشتری: '+escapeHtml(currentCustomer.name)+'</div><div class="listitem">تاریخ: '+formatAfghanDate(x.date)+'</div><div class="listitem"><b>اقلام خریداری‌شده</b><table style="width:100%;border-collapse:collapse"><thead><tr><th>نوع محصول</th><th>مقدار</th><th>قیمت واحد</th><th>مجموع</th></tr></thead><tbody>'+lines+'</tbody></table></div><div class="listitem">خرید جدید: '+fmt(x.total)+' افغانی</div><div class="listitem">باقی‌داری قبلی: '+fmt(x.previousBalance||0)+' افغانی</div><div class="listitem">مجموع بدهکاری: '+fmt(x.totalDue??(x.total+(x.previousBalance||0)))+' افغانی</div><div class="listitem">پرداخت فعلی: '+fmt(x.receivedNow??x.paid)+' افغانی</div><div class="listitem"><b>باقی‌مانده نهایی: '+fmt(x.remainingAfterPayment??x.remaining)+' افغانی</b></div>';};body.onclick=async e=>{const customerBtn=e.target.closest('[data-customer-index]');if(customerBtn){openCustomer(list[Number(customerBtn.dataset.customerIndex)]);return;}if(e.target.closest('#backCustomers')){renderList();return;}const invoiceBtn=e.target.closest('[data-invoice-index]');if(invoiceBtn&&currentCustomer){openInvoice(currentCustomer.invoices[Number(invoiceBtn.dataset.invoiceIndex)]);return;}if(e.target.closest('#backCustomerInvoices')&&currentCustomer){openCustomer(currentCustomer);return;}if(e.target.closest('#saveCustomerPayment')&&currentCustomer){const btn=e.target.closest('#saveCustomerPayment');if(btn.dataset.busy==='1')return;const amount=Number(body.querySelector('#customerPaymentAmount').value),accountId=body.querySelector('#customerPaymentAccount').value,notes=body.querySelector('#customerPaymentNotes').value.trim();if(!currentCustomer.id)return alert('شناسه مشتری معتبر نیست؛ پرداخت ثبت نشد.');if(!Number.isFinite(amount)||amount<=0||amount>currentCustomer.remaining)return alert('مبلغ را بررسی کنید؛ نباید بیشتر از باقی‌داری همین مشتری باشد.');if(!accountId)return alert('حساب افغانی دریافت پول را انتخاب کنید.');btn.dataset.busy='1';btn.disabled=true;btn.textContent='در حال ثبت دریافت...';const requestId=yemaRequestId('customer_payment');const {data,error}=await cloud.rpc('record_yema_customer_payment_once',{p_request_id:requestId,p_customer_id:currentCustomer.id,p_amount:amount,p_cash_account_id:accountId,p_payment_date:new Date().toISOString(),p_notes:notes||null});if(error){console.error(error);btn.dataset.busy='0';btn.disabled=false;btn.textContent='ثبت دریافت پول و تسویه';return alert('دریافت پول ثبت نشد: '+error.message);}clearYemaRequestId('customer_payment');alert('دریافت '+fmt(amount)+' افغانی برای '+currentCustomer.name+' ثبت شد.');show('customers');}};renderList();});}else if(name==='history'){page(name,'بل‌های فروش','<p>در حال دریافت بل‌ها...</p>',async body=>{const cloud=window.yemaCloud?.client;if(!cloud){body.innerHTML='اتصال ابری موجود نیست.';return;}const {data:auth}=await cloud.auth.getSession();if(!auth.session){body.innerHTML='ابتدا وارد حساب ابری شوید.';return;}const {data:sales,error}=await fetchAllRows(cloud.from('sales').select('id,bill_number,customer_id,customer_name,sale_date,total,paid,remaining,previous_balance,received_now,remaining_after_payment,notes').order('bill_number',{ascending:false}));if(error){body.innerHTML='خطا در دریافت بل‌ها: '+error.message;return;}const customerIds=[...new Set((sales||[]).map(x=>x.customer_id).filter(Boolean))];let customers=[];if(customerIds.length){const cr=await cloud.from('customers').select('id,address,phone').in('id',customerIds);if(cr.error){body.innerHTML='خطا در دریافت آدرس مشتریان: '+cr.error.message;return;}customers=cr.data||[];}const ids=(sales||[]).map(x=>x.id);let items=[];if(ids.length){const r=await cloud.from('sale_items').select('sale_id,quantity,unit,unit_price,line_total,product_id').in('sale_id',ids);if(r.error){body.innerHTML='خطا در دریافت اقلام بل: '+r.error.message;return;}items=r.data||[];}const pids=[...new Set(items.map(x=>x.product_id))];let products=[];if(pids.length){const r=await cloud.from('products').select('id,name').in('id',pids);if(r.error){body.innerHTML='خطا در دریافت نام محصولات: '+r.error.message;return;}products=r.data||[];}const mapped=(sales||[]).map(x=>{const lines=items.filter(y=>y.sale_id===x.id).map(it=>({product:products.find(y=>y.id===it.product_id)?.name||'—',qty:Number(it.quantity||0),unit:it.unit==='kg'?'کیلوگرام':'لیتر',price:Number(it.unit_price||0),line_total:Number(it.line_total||0)}));const first=lines[0]||{};return {id:x.id,bill:Number(x.bill_number),customer:x.customer_name,product:isRetailMixSale({items:lines})?'فروش پرچون':(lines.length>1?'چند محصول':(first.product||'—')),saleType:isRetailMixSale({items:lines})?'retail':null,items:lines,qty:first.qty||0,unit:first.unit||'—',price:first.price||0,total:Number(x.total||0),paid:Number(x.received_now??x.paid??0),previousBalance:Number(x.previous_balance||0),totalDue:Number(x.previous_balance||0)+Number(x.total||0),remainingAfterPayment:Number(x.remaining_after_payment??x.remaining??0),date:(x.sale_date||'').slice(0,10),address:customers.find(c=>c.id===x.customer_id)?.address||x.notes||'',phone:customers.find(c=>c.id===x.customer_id)?.phone||''};});const merged=[...mapped];for(const local of read('sales'))if(!merged.some(x=>x.id===local.id||x.bill===local.bill))merged.push(local);write('sales',merged);body.innerHTML=mapped.map(x=>'<div class="listitem"><b>بل شماره '+fmt(x.bill)+'</b><div>مشتری: '+escapeHtml(x.customer)+'</div>'+(x.phone?'<div>شماره تماس: '+escapeHtml(x.phone)+'</div>':'')+'<div>'+(isRetailMixSale(x)?'فروش پرچون — '+fmt((x.items||[]).reduce((n,it)=>n+Number(it.qty??it.quantity??0),0))+' لیتر × '+fmt(x.items?.[0]?.price??x.items?.[0]?.unit_price??0):(x.items||[]).map(it=>escapeHtml(it.product)+' — '+fmt(it.qty??it.quantity)+' '+escapeHtml(it.unit)+' × '+fmt(it.price??it.unit_price)).join('<br>'))+'</div><div>مجموع: '+fmt(x.totalDue??(x.total+(x.previousBalance||0)))+' افغانی | پرداخت فعلی: '+fmt(x.paid)+' | باقی: '+fmt(x.remainingAfterPayment??x.remaining??(x.total-x.paid))+' افغانی</div><button data-receipt="'+x.bill+'">چاپ رسید</button></div>').join('')||'هنوز فروشی ثبت نشده است';body.querySelectorAll('[data-receipt]').forEach(btn=>btn.onclick=()=>printReceipt(Number(btn.dataset.receipt)));});}

  else if(name==='purchaseHistory'){page(name,'حساب و رسید خرید هر محصول','<label>انتخاب محصول</label><select id="purchaseProductFilter"><option value="">تمام محصولات</option>'+PRODUCTS.map(p=>'<option value="'+p+'">'+p+'</option>').join('')+'</select><div id="purchaseHistoryList">در حال دریافت خریدها...</div>',async body=>{
  const cloud=window.yemaCloud?.client;if(!cloud){body.innerHTML='اتصال ابری موجود نیست.';return;}
  const {data:auth}=await cloud.auth.getSession();if(!auth.session){body.innerHTML='ابتدا وارد حساب ابری شوید.';return;}
  const {data:rows,error}=await fetchAllRows(cloud.from('purchases').select('id,supplier_name,supplier_phone,purchase_date,total_usd,exchange_rate,freight_afn,freight_paid,purchase_items(entered_quantity,entered_unit,stock_quantity,stock_unit,unit_cost,line_total,products(name))').order('purchase_date',{ascending:false}));
  if(error){body.innerHTML='خطا در دریافت خریدها: '+escapeHtml(error.message);return;}
  const render=()=>{
    const chosen=body.querySelector('#purchaseProductFilter').value;
    const filtered=(rows||[]).filter(x=>!chosen||(x.purchase_items||[]).some(it=>it.products?.name===chosen));
    body.querySelector('#purchaseHistoryList').innerHTML=filtered.map(x=>(x.purchase_items||[]).map(it=>{
      const productName=it.products?.name||'محصول',stockUnit=it.stock_unit==='kg'?'کیلوگرام':'لیتر';
      const landed=Number(it.line_total??(Number(it.unit_cost||0)*Number(it.stock_quantity||0)));
      return '<div class="listitem"><b>رسید خرید — '+escapeHtml(productName)+'</b>'+
        '<div>تأمین‌کننده: '+escapeHtml(x.supplier_name||'—')+(x.supplier_phone?' | تماس: '+escapeHtml(x.supplier_phone):'')+'</div>'+
        '<div>خرید عمده: '+fmt(it.entered_quantity)+' تن | موجودی دقیق: '+fmt(it.stock_quantity)+' '+stockUnit+'</div>'+
        '<div>مجموع خرید: '+fmt(x.total_usd)+' دالر | نرخ تبدیل: '+fmt(x.exchange_rate)+'</div>'+
        '<div>کرایه انتقال: '+fmt(x.freight_afn||0)+' افغانی ('+(x.freight_paid?'پرداخت شده':'پرداخت نشده')+')</div>'+
        '<div>بهای تمام‌شده کل: '+fmt(landed)+' افغانی</div>'+
        '<div><b>بهای تمام‌شده هر '+stockUnit+': '+fmt(it.unit_cost)+' افغانی</b></div>'+
        '<div>تاریخ: '+escapeHtml((x.purchase_date||'').slice(0,10))+'</div></div>';
    }).join('')).join('')||'برای این محصول هنوز خریدی ثبت نشده است';
  };
  body.querySelector('#purchaseProductFilter').onchange=render;render();
});}
 else if(name==='expenseHistory'){page(name,'تاریخچه مصارف','<p>در حال دریافت مصارف...</p>',async body=>{const cloud=window.yemaCloud?.client;if(!cloud){body.innerHTML='اتصال ابری موجود نیست.';return;}const {data:auth}=await cloud.auth.getSession();if(!auth.session){body.innerHTML='ابتدا وارد حساب ابری شوید.';return;}const {data:rows,error}=await fetchAllRows(cloud.from('expenses').select('title,amount,currency,expense_date,notes').order('expense_date',{ascending:false}));if(error){body.innerHTML='خطا در دریافت مصارف: '+error.message;return;}body.innerHTML=(rows||[]).map(x=>'<div class="listitem"><b>'+escapeHtml(x.title)+'</b><div>مبلغ: '+fmt(x.amount)+' '+(x.currency==='USD'?'دالر':'افغانی')+'</div><div>تاریخ: '+(x.expense_date||'').slice(0,10)+'</div></div>').join('')||'هنوز مصرفی ثبت نشده است';});}
 else if(name==='cashbook'){page(name,'صندوق‌ها و گردش حساب','<p>در حال دریافت گردش حساب‌ها...</p>',async body=>{const cloud=window.yemaCloud?.client;if(!cloud){body.innerHTML='اتصال ابری موجود نیست';return;}const {data:auth,error:authError}=await cloud.auth.getSession();if(authError||!auth.session){body.innerHTML='ابتدا وارد حساب ابری شوید';return;}const fetchAll=async query=>{let out=[],from=0;while(true){const {data,error}=await query.range(from,from+999);if(error)return {data:null,error};out=out.concat(data||[]);if(!data||data.length<1000)break;from+=1000;}return {data:out,error:null};};const [ar,tr]=await Promise.all([cloud.from('cash_accounts').select('id,name,account_type,currency,opening_balance,active').order('currency').order('name'),fetchAll(cloud.from('cash_transactions').select('id,cash_account_id,transaction_type,amount,currency,reference_type,transaction_date,notes').order('transaction_date',{ascending:false}))]);if(ar.error||tr.error){body.innerHTML='خطا در دریافت گردش حساب: '+(ar.error||tr.error).message;return;}const rows=ar.data||[],tx=tr.data||[];const totals={AFN:{cash:0,bank:0},USD:{cash:0,bank:0}};rows.forEach(a=>{const own=tx.filter(t=>t.cash_account_id===a.id),inc=own.filter(t=>t.transaction_type==='income').reduce((v,t)=>v+Number(t.amount||0),0),out=own.filter(t=>t.transaction_type==='expense').reduce((v,t)=>v+Number(t.amount||0),0),bal=Number(a.opening_balance||0)+inc-out,cur=totals[a.currency]||(totals[a.currency]={cash:0,bank:0});cur[a.account_type==='bank'?'bank':'cash']+=bal;});const totalCards='<div class="listitem"><b>صندوق کل — مجموع حساب‌ها</b><div>مجموع نقدی: '+fmt(totals.AFN.cash)+' افغانی | مجموع بانکی: '+fmt(totals.AFN.bank)+' افغانی</div><div><b>مجموع کل افغانی: '+fmt(totals.AFN.cash+totals.AFN.bank)+' افغانی</b></div><hr><div>مجموع نقدی: '+fmt(totals.USD.cash)+' دالر | مجموع بانکی: '+fmt(totals.USD.bank)+' دالر</div><div><b>مجموع کل دالر: '+fmt(totals.USD.cash+totals.USD.bank)+' دالر</b></div></div>';body.innerHTML=totalCards+rows.map(a=>{const own=tx.filter(t=>t.cash_account_id===a.id),income=own.filter(t=>t.transaction_type==='income').reduce((v,t)=>v+Number(t.amount||0),0),out=own.filter(t=>t.transaction_type==='expense').reduce((v,t)=>v+Number(t.amount||0),0),balance=Number(a.opening_balance||0)+income-out;return '<div class="listitem"><b>'+escapeHtml(a.name)+'</b><div>نوع: '+(a.account_type==='bank'?'بانک':'صندوق نقدی')+' | ارز: '+a.currency+'</div><div>افتتاحیه: '+fmt(a.opening_balance)+' | دریافت: '+fmt(income)+' | پرداخت: '+fmt(out)+'</div><div><b>موجودی فعلی: '+fmt(balance)+' '+a.currency+'</b></div></div>';}).join('')+'<h4>آخرین گردش‌ها</h4>'+tx.map(t=>{const a=rows.find(x=>x.id===t.cash_account_id);return '<div class="listitem">'+(t.transaction_type==='income'?'دریافت':'پرداخت')+' | '+escapeHtml(a?.name||'حساب')+' | '+fmt(t.amount)+' '+t.currency+'<div class="muted">'+formatAfghanDate(t.transaction_date)+' | '+new Intl.DateTimeFormat('fa-AF-u-nu-arab',{timeZone:'Asia/Kabul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(t.transaction_date))+' | '+escapeHtml(t.notes||t.reference_type)+'</div></div>';}).join('')||'هنوز گردش حساب ثبت نشده است';});}
 else if(name==='reports'){page(name,'گزارش‌های روزانه و ماهانه','<label>دوره گزارش</label><select id="period"><option value="day">امروز</option><option value="month">این ماه</option><option value="all">تمام دوره</option></select><div id="reportBody">در حال دریافت گزارش...</div>',async body=>{const cloud=window.yemaCloud?.client;if(!cloud){body.querySelector('#reportBody').textContent='اتصال ابری موجود نیست';return;}const {data:auth}=await cloud.auth.getSession();if(!auth.session){body.querySelector('#reportBody').textContent='ابتدا وارد حساب ابری شوید';return;}const fetchAll=async query=>{let rows=[],from=0;while(true){const {data,error}=await query.range(from,from+999);if(error)return {data:null,error};rows=rows.concat(data||[]);if(!data||data.length<1000)break;from+=1000;}return {data:rows,error:null};};const [sr,pr,er,mr]=await Promise.all([fetchAll(cloud.from('sales').select('id,bill_number,customer_name,total,paid,remaining,sale_date')),fetchAll(cloud.from('purchases').select('total,paid,remaining,purchase_date')),fetchAll(cloud.from('expenses').select('amount,currency,exchange_rate,amount_afn,expense_date')),fetchAll(cloud.from('inventory_movements').select('quantity_out,unit_cost,reference_id').eq('movement_type','sale'))]);const error=sr.error||pr.error||er.error||mr.error;if(error){body.querySelector('#reportBody').textContent='خطا در گزارش: '+error.message;return;}const sales=sr.data||[],purchases=pr.data||[],expenses=er.data||[],movements=mr.data||[];const kabulParts=date=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kabul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(date));const o={};for(const p of parts)o[p.type]=p.value;return o;};const now=kabulParts(new Date());const key=x=>{const p=kabulParts(x);return p.year+'-'+p.month+'-'+p.day;};const month=now.year+'-'+now.month;const period=body.querySelector('#period');const filter=(arr,field)=>arr.filter(x=>{if(period.value==='all')return true;const k=key(x[field]);return period.value==='day'?k===now.year+'-'+now.month+'-'+now.day:k.startsWith(month);});const render=()=>{const ss=filter(sales,'sale_date'),pp=filter(purchases,'purchase_date'),ee=filter(expenses,'expense_date'),ids=new Set(ss.map(x=>x.id));const revenue=ss.reduce((a,x)=>a+Number(x.total||0),0),paid=ss.reduce((a,x)=>a+Number(x.paid||0),0),remaining=ss.reduce((a,x)=>a+Number(x.remaining||0),0),cost=movements.filter(x=>ids.has(x.reference_id)).reduce((a,x)=>a+Number(x.quantity_out||0)*Number(x.unit_cost||0),0),expenseAFN=ee.reduce((a,x)=>a+Number((x.amount_afn??(x.currency==='AFN'?x.amount:(Number(x.amount||0)*Number(x.exchange_rate||0))))||0),0),expenseUSD=ee.filter(x=>x.currency==='USD'&&x.amount_afn==null).reduce((a,x)=>a+Number(x.amount||0),0),gross=revenue-cost,net=gross-expenseAFN;const billRows=ss.map(x=>{const billCost=movements.filter(m=>m.reference_id===x.id).reduce((a,m)=>a+Number(m.quantity_out||0)*Number(m.unit_cost||0),0);const billProfit=Number(x.total||0)-billCost;return '<div class="listitem"><b>بل شماره '+fmt(x.bill_number)+'</b><div>مشتری: '+escapeHtml(x.customer_name||'—')+'</div><div>مجموع بل: '+fmt(x.total)+' افغانی</div><div>بهای تمام‌شده FIFO: '+fmt(billCost)+' افغانی</div><div><b>مفاد این بل: '+fmt(billProfit)+' افغانی</b></div></div>';}).join('')||'<div class="listitem">در این دوره بل فروشی ثبت نشده است.</div>';body.querySelector('#reportBody').innerHTML='<div class="listitem">تعداد بل‌ها: '+fmt(ss.length)+'</div><div class="listitem">مجموع فروش: '+fmt(revenue)+' افغانی</div><div class="listitem">پرداخت مشتریان: '+fmt(paid)+' افغانی</div><div class="listitem">باقی مشتریان: '+fmt(remaining)+' افغانی</div><div class="listitem">بهای تمام‌شده FIFO: '+fmt(cost)+' افغانی</div><div class="listitem">مفاد ناخالص: '+fmt(gross)+' افغانی</div><div class="listitem">مصارف افغانی: '+fmt(expenseAFN)+' افغانی</div><div class="listitem">مصارف دالری بدون نرخ تبدیل: '+fmt(expenseUSD)+' دالر</div><div class="listitem"><b>مفاد خالص پس از کسر مصارف: '+fmt(net)+' افغانی</b></div><div class="listitem">مجموع خرید: '+fmt(pp.reduce((a,x)=>a+Number(x.total||0),0))+' افغانی</div><h3>مفاد جداگانهٔ هر بل</h3>'+billRows;};period.onchange=render;render();});}
 else if(name==='menu')page(name,'بخش‌های برنامه','<div class="menu-today-stats"><article><small>فروش امروز</small><b id="menuSalesToday">۰</b><em>افغانی</em></article><article><small>مفاد امروز</small><b id="menuProfitToday">۰</b><em>افغانی</em></article><article><small>مصارف امروز</small><b id="menuExpensesToday">۰</b><em>افغانی</em></article></div><div class="menu-grid">'+[['sale','ثبت فروش جدید'],['purchase','خرید عمده'],['purchaseHistory','تاریخچه خرید'],['customers','حساب مشتریان'],['history','بل‌های فروش'],['inventory','موجودی محصولات'],['retailControl','کنترل موجودی فروش پرچون'],['expenses','ثبت مصارف'],['expenseHistory','تاریخچه مصارف'],['reports','گزارش‌ها'],['cashbook','صندوق‌ها و گردش حساب'],['settings','تنظیمات و پشتیبان'],['cloud','اتصال حساب ابری']].map(([key,label])=>'<button type="button" class="menu-link" data-menu-page="'+key+'">'+label+'</button>').join('')+'</div>',body=>{updateHomeDashboard();body.querySelectorAll('[data-menu-page]').forEach(b=>b.onclick=()=>{pageBackTarget='menu';show(b.dataset.menuPage)})});
 else if(name==='cloud')page(name,'اتصال حساب ابری','',body=>body.appendChild(el('cloudPanel')));
 else if(name==='settings')page(name,'تنظیمات و نرخ ارز','<p>نمایندگی تیل فروشی حاجی نواب پروانی</p><p>ارز اصلی: افغانی | ارز دوم: دالر | منطقه زمانی: افغانستان</p><div id="rates">در حال دریافت نرخ‌های ذخیره‌شده...</div><button type="button" id="refreshOnlineRates">دریافت نرخ آنلاین کابل</button><div id="onlineRateStatus">منبع اصلی: کانال تلگرام کابل نرخ دالر</div>'+field('نرخ خرید دالر (افغانی)','buyRate','number')+field('نرخ فروش دالر (افغانی)','sellRate','number')+'<button class="primary" id="saveRates">ذخیره نرخ‌ها</button><hr><button id="export">گرفتن پشتیبان کامل اطلاعات محلی</button><button type="button" id="cloudExport">گرفتن پشتیبان دیتابیس ابری</button><button type="button" id="restore">بازیابی از فایل پشتیبان</button><input id="backupFile" type="file" accept="application/json,.json" hidden><div class="listitem"><b>انتقال به گوشی جدید</b><ol><li>در گوشی جدید همین برنامه را باز کنید.</li><li>با همان ایمیل و رمز حساب قبلی وارد شوید.</li><li>یک کد امنیتی شش‌رقمی تازه برای همان گوشی بسازید.</li><li>فروش‌ها، خریدها، مشتریان، موجودی و حساب‌ها از دیتابیس ابری بارگذاری می‌شوند.</li><li>برای نگهداری یک فایل پشتیبان، در گوشی قبلی «گرفتن پشتیبان دیتابیس ابری» را بزنید و فایل را در Files یا iCloud Drive نگه دارید.</li></ol><small>کد امنیتی به فایل پشتیبان منتقل نمی‌شود. بازیابی فایل، فقط اطلاعات محلی را ادغام می‌کند؛ اطلاعات ابری با ورود به همان حساب در دسترس است.</small></div>',body=>{const cloud=window.yemaCloud?.client;if(!cloud){body.querySelector('#rates').textContent='اتصال ابری موجود نیست';return;} (async()=>{const {data:auth}=await cloud.auth.getSession();if(!auth.session){body.querySelector('#rates').textContent='ابتدا وارد حساب ابری شوید';return;}const {data:row,error}=await cloud.from('business_settings').select('id,business_name,usd_buy_rate,usd_sell_rate,timezone').maybeSingle();if(error){body.querySelector('#rates').textContent='خطا: '+error.message;return;}body.querySelector('#rates').textContent='نام تجارت: '+(row?.business_name||'—')+' | منطقه زمانی: '+(row?.timezone||'Asia/Kabul');body.querySelector('[name=buyRate]').value=row?.usd_buy_rate??'';body.querySelector('[name=sellRate]').value=row?.usd_sell_rate??'';const refreshOnline=async()=>{const status=body.querySelector('#onlineRateStatus');status.textContent='در حال دریافت نرخ از کانال کابل...';try{const rate=await fetchKabulRate();body.querySelector('[name=buyRate]').value=rate.buy;body.querySelector('[name=sellRate]').value=rate.sell;status.textContent='خرید: '+fmt(rate.buy)+' افغانی | فروش: '+fmt(rate.sell)+' افغانی | منبع: کابل نرخ دالر | '+(rate.updatedAt||rate.fetchedAt);}catch(e){status.textContent='دریافت خودکار ناکام شد؛ نرخ را دستی وارد کنید.';}};body.querySelector('#refreshOnlineRates').onclick=refreshOnline;refreshOnline();body.querySelector('#saveRates').onclick=async()=>{const buy=Number(body.querySelector('[name=buyRate]').value),sell=Number(body.querySelector('[name=sellRate]').value);if(!Number.isFinite(buy)||buy<=0||!Number.isFinite(sell)||sell<=0)return alert('هر دو نرخ را درست وارد کنید');const {error:e}=await cloud.from('business_settings').update({usd_buy_rate:buy,usd_sell_rate:sell,updated_at:new Date().toISOString()}).eq('id',row.id);if(e)return alert('ذخیره نرخ ناموفق شد: '+e.message);alert('نرخ خرید و فروش دالر ذخیره شد');};})();const backupKeys=()=>Object.keys(localStorage).filter(k=>k.startsWith('yema_v2_')).sort();
const makeBackup=()=>{const local={};for(const k of backupKeys())local[k]=localStorage.getItem(k);return {app:'YEMA_ACCOUNTING',formatVersion:1,backupType:'browser-local',createdAt:new Date().toISOString(),localStorage:local};};
body.querySelector('#cloudExport').onclick=async()=>{const cloud=window.yemaCloud?.client;if(!cloud)return alert('اتصال ابری موجود نیست');const {data:auth,error:authError}=await cloud.auth.getSession();if(authError||!auth.session)return alert('ابتدا وارد حساب ابری شوید');const tables=['products','business_settings','cash_accounts','customers','exchange_rates','sales','sale_items','purchases','purchase_items','expenses','stock_batches','inventory_movements','cash_transactions','customer_payments','customer_payment_allocations','bill_counters','yema_cloud_records'];const snapshot={};const counts={};const button=body.querySelector('#cloudExport');button.disabled=true;button.textContent='در حال تهیه پشتیبان ابری...';try{for(const table of tables){let rows=[],from=0;while(true){const {data,error}=await cloud.from(table).select('*').range(from,from+999);if(error)throw new Error(table+': '+error.message);rows=rows.concat(data||[]);if(!data||data.length<1000)break;from+=1000;}snapshot[table]=rows;counts[table]=rows.length;}const data={app:'YEMA_ACCOUNTING',formatVersion:1,backupType:'cloud-snapshot',createdAt:new Date().toISOString(),account:auth.session.user.email||null,deviceTransfer:{sameAccountRequired:true,cloudDataAvailableAfterSignIn:true,localRestoreMode:'merge-only',securityPinIncluded:false},counts,cloud:snapshot,localStorage:makeBackup().localStorage};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='yema-full-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);const total=Object.values(counts).reduce((n,v)=>n+v,0);alert('پشتیبان ابری ساخته شد. تعداد رکوردهای ابری: '+fmt(total)+'\nاطلاعات محلی نیز در همان فایل قرار گرفت. فایل را در جای امن نگه دارید.');}catch(e){alert('ساخت پشتیبان ابری ناکام شد: '+e.message);}finally{button.disabled=false;button.textContent='گرفتن پشتیبان دیتابیس ابری';}};el('export').onclick=()=>{try{const data=makeBackup();const count=Object.keys(data.localStorage).length;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='yema-local-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);alert('نسخه پشتیبان ساخته شد. تعداد بخش‌های ذخیره‌شده: '+fmt(count)+'. فایل را در جای امن نگه دارید.');}catch(e){alert('ساخت نسخه پشتیبان ناکام شد: '+e.message);}};
const backupFile=body.querySelector('#backupFile');
body.querySelector('#restore').onclick=()=>backupFile.click();
backupFile.onchange=async()=>{const file=backupFile.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(parsed.app!=='YEMA_ACCOUNTING'||parsed.formatVersion!==1||!['browser-local','cloud-snapshot'].includes(parsed.backupType)||!parsed.localStorage||typeof parsed.localStorage!=='object'||Array.isArray(parsed.localStorage))throw new Error('ساختار فایل پشتیبان معتبر نیست');if(parsed.backupType==='cloud-snapshot'){const cloud=window.yemaCloud?.client;if(!cloud)throw new Error('برای بررسی مالک فایل، ابتدا به حساب ابری وارد شوید.');const {data:auth,error:authError}=await cloud.auth.getSession();if(authError||!auth.session?.user?.email)throw new Error('ابتدا با همان حساب ابری وارد شوید.');if(!parsed.account||String(parsed.account).toLowerCase()!==String(auth.session.user.email).toLowerCase())throw new Error('این فایل پشتیبان متعلق به حساب دیگری است؛ برای جلوگیری از مخلوط‌شدن اطلاعات، بازیابی انجام نشد.');}const entries=Object.entries(parsed.localStorage);if(!entries.length)throw new Error('فایل پشتیبان خالی است');for(const [key,value] of entries){if(!key.startsWith('yema_v2_')||typeof value!=='string')throw new Error('محتوای فایل پشتیبان معتبر نیست');JSON.parse(value);}const incomingCount=entries.reduce((n,[,v])=>{const x=JSON.parse(v);return n+(Array.isArray(x)?x.length:1);},0);if(!confirm('فایل پشتیبان مورخ '+(parsed.createdAt||'نامشخص')+' شناسایی شد. '+(parsed.backupType==='cloud-snapshot'?'این فایل متعلق به حساب ابری فعلی است؛ اطلاعات اصلی با ورود به همان حساب در سرور موجود است و این مرحله فقط حافظه محلی را ادغام می‌کند. ':'')+' تعداد بخش‌ها: '+fmt(entries.length)+'، تعداد تقریبی رکوردها: '+fmt(incomingCount)+'.\n\nبازیابی فقط اطلاعات موجود را حفظ و موارد تازه را اضافه می‌کند؛ چیزی حذف یا جایگزین نمی‌شود. ادامه می‌دهید؟'))return;let added=0,kept=0;for(const [key,raw] of entries){const incoming=JSON.parse(raw),existingRaw=localStorage.getItem(key);if(existingRaw===null){localStorage.setItem(key,raw);added++;continue;}let existing;try{existing=JSON.parse(existingRaw);}catch{kept++;continue;}if(Array.isArray(existing)&&Array.isArray(incoming)){const seen=new Set(existing.map(x=>x&&typeof x==='object'?(x.id?'id:'+x.id:(x.bill!==undefined?'bill:'+x.bill:'json:'+JSON.stringify(x))):'value:'+String(x)));for(const item of incoming){const identity=item&&typeof item==='object'?(item.id?'id:'+item.id:(item.bill!==undefined?'bill:'+item.bill:'json:'+JSON.stringify(item))):'value:'+String(item);if(!seen.has(identity)){existing.push(item);seen.add(identity);added++;}else kept++;}localStorage.setItem(key,JSON.stringify(existing));}else{kept++;}}alert('بازیابی محلی انجام شد. موارد افزوده‌شده: '+fmt(added)+' | موارد موجود و حفظ‌شده: '+fmt(kept)+'.\n\nبرای دیدن اطلاعات تازه، صفحه را یک‌بار تازه‌سازی کنید. این عملیات اطلاعات ابری را تغییر نداده است.');}catch(e){alert('بازیابی انجام نشد: '+e.message);}finally{backupFile.value='';}};});
}

let yemaRestoreRunning=false;
async function restoreCloudDataToLocal(){
 if(yemaRestoreRunning)return;
 const cloud=window.yemaCloud?.client;
 if(!cloud)return;
 yemaRestoreRunning=true;
 try{
  const {data:sessionData,error:sessionError}=await cloud.auth.getSession();
  if(sessionError)throw sessionError;
  const user=sessionData?.session?.user;
  if(!user?.id)throw new Error('حساب ابری وارد نشده است.');
  const ownerKey=KEY+'sync_owner_id';
  const previousOwner=localStorage.getItem(ownerKey);
  if(previousOwner&&previousOwner!==user.id)throw new Error('این حافظه قبلاً با حساب دیگری استفاده شده است؛ برای جلوگیری از مخلوط‌شدن اطلاعات، هیچ داده‌ای تغییر نکرد.');
  const queries=await Promise.all([
   fetchAllRows(cloud.from('sales').select('id,bill_number,customer_id,customer_name,sale_date,total,paid,remaining,notes').order('sale_date',{ascending:false})),
   fetchAllRows(cloud.from('sale_items').select('sale_id,product_id,quantity,unit,unit_price,line_total')),
   fetchAllRows(cloud.from('products').select('id,name')),
   fetchAllRows(cloud.from('customers').select('id,phone,address')),
   fetchAllRows(cloud.from('inventory_movements').select('reference_id,quantity_out,unit_cost,movement_type').eq('movement_type','sale')),
   fetchAllRows(cloud.from('purchases').select('id,supplier_name,supplier_phone,purchase_date,total,paid,remaining,total_usd,paid_usd,remaining_usd,exchange_rate,notes').order('purchase_date',{ascending:false})),
   fetchAllRows(cloud.from('purchase_items').select('purchase_id,product_id,entered_quantity,entered_unit,stock_quantity,stock_unit,unit_cost,line_total')),
   fetchAllRows(cloud.from('expenses').select('id,title,amount,currency,exchange_rate,amount_afn,cash_account_id,expense_date,notes').order('expense_date',{ascending:false}))
  ]);
  const failed=queries.find(x=>x.error);
  if(failed)throw failed.error;
  const [salesR,saleItemsR,productsR,customersR,movementsR,purchasesR,purchaseItemsR,expensesR]=queries;
  const products=productsR.data||[],customers=customersR.data||[];
  const saleItems=saleItemsR.data||[],movements=movementsR.data||[];
  const dateKabul=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kabul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
  const restoredSales=(salesR.data||[]).map(s=>{
   const lines=saleItems.filter(it=>it.sale_id===s.id).map(it=>{
    const product=products.find(p=>p.id===it.product_id)?.name||'محصول';
    return {product,quantity:Number(it.quantity||0),qty:Number(it.quantity||0),unit:it.unit==='kg'?'کیلوگرام':'لیتر',price:Number(it.unit_price||0),unit_price:Number(it.unit_price||0),line_total:Number(it.line_total||0)};
   });
   const first=lines[0]||{};
   const customer=customers.find(c=>c.id===s.customer_id)||{};
   const cost=movements.filter(m=>m.reference_id===s.id).reduce((n,m)=>n+Number(m.quantity_out||0)*Number(m.unit_cost||0),0);
   return {id:s.id,bill:Number(s.bill_number),customer:s.customer_name,phone:customer.phone||'',address:customer.address||s.notes||'',product:isRetailMixSale({items:lines})?'فروش پرچون':(lines.length>1?'چند محصول':(first.product||'—')),saleType:isRetailMixSale({items:lines})?'retail':null,items:lines,qty:lines.length===1?first.quantity:null,unit:lines.length===1?first.unit:'—',price:lines.length===1?first.unit_price:null,total:Number(s.total||0),paid:Number(s.paid||0),date:dateKabul(s.sale_date),cost,profit:Number(s.total||0)-cost,cloudSynced:true};
  });
  const restoredPurchases=(purchasesR.data||[]).map(p=>{
   const lines=(purchaseItemsR.data||[]).filter(it=>it.purchase_id===p.id);
   const first=lines[0]||{};
   const product=products.find(x=>x.id===first.product_id)?.name||'محصول';
   return {id:p.id,supplier:p.supplier_name,supplierPhone:p.supplier_phone||'',product,qty:Number(first.entered_quantity||0),enteredUnit:first.entered_unit==='ton'?'تن':(first.entered_unit||'تن'),stockQty:Number(first.stock_quantity||0),unit:first.stock_unit==='kg'?'کیلوگرام':'لیتر',conversionFactor:Number(first.entered_quantity?Number(first.stock_quantity||0)/Number(first.entered_quantity):0),usd:Number(p.total_usd||0)/(Number(first.entered_quantity)||1),totalUsd:Number(p.total_usd??p.total??0),paidUsd:Number(p.paid_usd??p.paid??0),remainingUsd:Number(p.remaining_usd??p.remaining??0),rate:Number(p.exchange_rate||0),total:Number(p.total||0),paid:Number(p.paid||0),date:dateKabul(p.purchase_date),cloudSynced:true};
  });
  const restoredExpenses=(expensesR.data||[]).map(x=>({id:x.id,title:x.title,amount:Number(x.amount||0),currency:x.currency,exchangeRate:x.exchange_rate==null?null:Number(x.exchange_rate),amountAFN:Number(x.amount_afn??(x.currency==='AFN'?x.amount:0)),cashAccountId:x.cash_account_id||null,date:dateKabul(x.expense_date),notes:x.notes||'',cloudSynced:true}));
  // Cloud data is authoritative: replace local lists so deleted/test records cannot reappear after reset.
  write('sales',restoredSales);
  write('purchases',restoredPurchases);
  write('expenses',restoredExpenses);
  localStorage.setItem(ownerKey,user.id);
  refresh();
  window.dispatchEvent(new CustomEvent('yema:cloud-restored',{detail:{sales:restoredSales.length,purchases:restoredPurchases.length,expenses:restoredExpenses.length}}));
 }catch(error){
  console.error('YEMA cloud restore failed:',error);
  window.dispatchEvent(new CustomEvent('yema:cloud-restore-error',{detail:{message:error?.message||'خطا در بازیابی اطلاعات ابری'}}));
 }finally{yemaRestoreRunning=false;}
}
window.addEventListener('yema:app-unlocked',()=>{restoreCloudDataToLocal();});

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function isRetailMixSale(sale){if(sale?.saleType==='retail')return true;const lines=Array.isArray(sale?.items)?sale.items:[];const p92=lines.find(x=>x.product==='پطرول ۹۲'),p80=lines.find(x=>x.product==='پطرول ۸۰');return !!(p92&&p80&&Number(p92.price??p92.unit_price)===Number(p80.price??p80.unit_price)&&lines.length===2);}
function printReceipt(bill){
 const x=read('sales').find(z=>z.bill===bill);if(!x)return;
 const receiptDate=new Date((x.date||new Date().toISOString().slice(0,10))+'T12:00:00+04:30');
 const jalaliDate=formatAfghanDate(receiptDate);
 const rawLines=Array.isArray(x.items)&&x.items.length?x.items:[{product:x.product,qty:x.qty,unit:x.unit,price:x.price,line_total:x.qty*x.price}];
 const lines=isRetailMixSale(x)?[{product:'فروش پرچون',qty:Number(x.qty??rawLines.reduce((n,it)=>n+Number(it.qty??it.quantity??0),0)),unit:'لیتر',price:Number(x.price??rawLines[0]?.price??rawLines[0]?.unit_price??0),line_total:Number(x.total)}]:rawLines;
 const allGas=lines.every(it=>String(it.product||'').includes('گاز'));const allFuel=lines.every(it=>!String(it.product||'').includes('گاز'));const priceHeading=allGas?'قیمت فی کیلوگرام':allFuel?'قیمت فی لیتر':'قیمت فی لیتر/کیلوگرام';
 const rows=lines.map(it=>'<tr><td>'+escapeHtml(it.product)+'</td><td>'+escapeHtml(fmt(it.qty))+' '+escapeHtml(it.unit)+'</td><td>'+escapeHtml(fmt(it.price))+'</td><td>'+escapeHtml(fmt(it.line_total??it.qty*it.price))+'</td></tr>').join('');
 const w=window.open('','_blank');if(!w)return alert('مرورگر اجازه بازکردن رسید را نداد');
 const customer=escapeHtml(x.customer),phone=escapeHtml(x.phone||'—'),address=escapeHtml(x.address||'—'),date=escapeHtml(x.date||'—');
 w.document.write('<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><title>رسید فروش</title><style>body{font-family:Tahoma,Arial;padding:24px;max-width:600px;margin:auto;color:#172b4d}h2{text-align:center}hr{border:0;border-top:1px solid #aaa}p{padding:6px 0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #bbb;padding:8px;text-align:right}th{background:#eee}</style><h2>نمایندگی تیل فروشی حاجی نواب پروانی</h2><h3>رسید فروش شماره '+escapeHtml(fmt(x.bill))+'</h3><hr><p>مشتری: '+customer+'</p><p>شماره تماس: '+phone+'</p><table><thead><tr><th>محصول</th><th>مقدار</th><th>'+priceHeading+'</th><th>مجموع</th></tr></thead><tbody>'+rows+'</tbody></table><p>خرید جدید: '+escapeHtml(fmt(x.total))+' افغانی</p><p>باقی‌داری قبلی: '+escapeHtml(fmt(x.previousBalance||0))+' افغانی</p><p>مجموع بدهکاری: '+escapeHtml(fmt(x.totalDue??(x.total+(x.previousBalance||0))))+' افغانی</p><p>پرداخت فعلی: '+escapeHtml(fmt(x.receivedNow??x.paid))+' افغانی</p><p>باقی‌مانده نهایی: '+escapeHtml(fmt(x.remainingAfterPayment??(x.total-x.paid)))+' افغانی</p><p>تاریخ شمسی: '+escapeHtml(jalaliDate)+'</p><p>تاریخ میلادی: '+date+'</p><p>آدرس/توضیحات: '+address+'</p><hr><center>با تشکر از خرید شما</center><script>window.onload=()=>window.print()<\\/script></html>');
 w.document.close();
}
function home(){const host=el('cloudPanelHost');if(host&&el('cloudPanel')&&!host.contains(el('cloudPanel')))host.appendChild(el('cloudPanel'));el('page').classList.add('hidden');el('home').classList.remove('hidden');el('homeCartBar').classList.remove('hidden');refresh()}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>show(b.dataset.page));
el('openMenu')?.addEventListener('click',()=>{pageBackTarget='home';show('menu')});
el('quickSale')?.addEventListener('click',()=>show('sale'));
el('openHomeCart').onclick=()=>{const selected=homeCart[0]||null;show('sale',selected||undefined);};
el('clearHomeCart')?.addEventListener('click',()=>{if(!homeCart.length)return;homeCart=[];updateHomeCart();triggerHomeShake(el('homeCartBar'));});
el('back').onclick=()=>{if(pageBackTarget==='menu'){pageBackTarget='home';show('menu')}else home()};
refresh();
