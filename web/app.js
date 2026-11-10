const PRODUCTS=['پطرول ۹۲','پطرول ۸۰','دیزل شیشه‌ای','دیزل ۰۱','گاز'];
const KEY='yema_v2_';
const read=k=>{try{return JSON.parse(localStorage.getItem(KEY+k)||'[]')}catch{return []}};
const write=(k,v)=>localStorage.setItem(KEY+k,JSON.stringify(v));
const el=id=>document.getElementById(id);
const fmt=n=>Number(n||0).toLocaleString('fa-IR',{maximumFractionDigits:2});
const unit=p=>p==='گاز'?'کیلوگرام':'لیتر';
const sum=(a,k)=>a.reduce((s,x)=>s+Number(x[k]||0),0);
function refresh(){
 const sales=read('sales'),expenses=read('expenses');
 el('salesCount').textContent=fmt(sales.length);
 el('salesTotal').textContent=fmt(sum(sales,'total'))+' افغانی';
 el('expenseTotal').textContent=fmt(sum(expenses,'amount'))+' افغانی';
 el('balanceTotal').textContent=fmt(sales.reduce((s,x)=>s+x.total-x.paid,0))+' افغانی';
 el('productButtons').innerHTML=PRODUCTS.map((p,i)=>'<button data-product="'+p+'"><span style="font-size:22px">'+['⛽','🛢️','⛽','🛢️','🔥'][i]+'</span><br>'+p+'<br><small>'+unit(p)+'</small></button>').join('');
 document.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>show('inventory'));
}
function field(label,name,type='text',hint=''){return '<label>'+label+'</label><input name="'+name+'" type="'+type+'" placeholder="'+hint+'" '+(type==='number'?'step="any" min="0"':'')+'>'}
function selectProduct(){return '<label>نوع محصول</label><select name="product">'+PRODUCTS.map(p=>'<option value="'+p+'">'+p+'</option>').join('')+'</select>'}
function values(body){return Object.fromEntries([...body.querySelectorAll('input,select,textarea')].map(x=>[x.name,x.value]))}
function page(name,title,html,handler){el('home').classList.add('hidden');el('page').classList.remove('hidden');el('pageTitle').textContent=title;el('pageBody').innerHTML=html;if(handler)handler(el('pageBody'))}
function show(name){
 if(name==='sale')page(name,'ثبت فروش',field('نام مشتری','customer')+selectProduct()+field('مقدار ('+'لیتر برای تیل، کیلوگرام برای گاز'+')','qty','number')+field('قیمت فی واحد (افغانی)','price','number')+field('پرداخت‌شده (افغانی)','paid','number')+field('توضیحات و آدرس مشتری','address')+'<button class="primary" id="save">ثبت بل فروش</button>',body=>{
 body.querySelector('[name=product]').onchange=e=>body.querySelector('[name=qty]').placeholder='مقدار به '+unit(e.target.value);
 el('save').onclick=()=>{const v=values(body),q=+v.qty,p=+v.price,paid=+v.paid||0;if(!v.customer||!v.qty||!Number.isFinite(q)||q<=0||!v.price||!Number.isFinite(p)||p<0)return alert('نام مشتری، مقدار و قیمت را درست وارد کنید');const a=read('sales');a.push({bill:a.length+1,customer:v.customer,address:v.address,product:v.product,qty:q,unit:unit(v.product),price:p,paid,total:q*p,date:new Date().toISOString()});write('sales',a);alert('بل شماره '+fmt(a.length)+' ثبت شد');refresh();home();};});
 else if(name==='purchase')page(name,'خرید عمده',field('نام فروشنده','supplier')+selectProduct()+field('مقدار خرید به تن','qty','number')+field('قیمت هر تن به دالر','usd','number')+field('نرخ دالر به افغانی','rate','number','نرخ روز')+'<button class="primary" id="save">ثبت خرید</button>',body=>{el('save').onclick=()=>{const v=values(body),q=+v.qty,u=+v.usd,r=+v.rate;if(!v.supplier||q<=0||u<0||r<=0||![q,u,r].every(Number.isFinite))return alert('معلومات خرید را درست وارد کنید');const a=read('purchases');a.push({supplier:v.supplier,product:v.product,qty:q,usd:u,rate:r,total:q*u*r,date:new Date().toISOString()});write('purchases',a);alert('خرید ثبت شد');refresh();home();};});
 else if(name==='expenses')page(name,'ثبت مصارف',field('عنوان مصرف','title')+field('مبلغ افغانی','amount','number')+'<button class="primary" id="save">ثبت مصرف</button>',body=>{el('save').onclick=()=>{const v=values(body),n=+v.amount;if(!v.title||!v.amount||n<0||!Number.isFinite(n))return alert('عنوان و مبلغ را وارد کنید');const a=read('expenses');a.push({title:v.title,amount:n,date:new Date().toISOString()});write('expenses',a);refresh();home();};});
 else if(name==='inventory'){const s=read('sales'),p=read('purchases');page(name,'موجودی محصولات',PRODUCTS.map(prod=>{const incoming=p.filter(x=>x.product===prod).reduce((a,x)=>a+x.qty*1000,0),out=s.filter(x=>x.product===prod).reduce((a,x)=>a+x.qty,0);return '<div class="listitem"><b>'+prod+'</b><div>خرید ثبت‌شده: '+fmt(incoming)+' کیلوگرام/لیتر پایه</div><div>فروش ثبت‌شده: '+fmt(out)+' '+unit(prod)+'</div><div>موجودی محاسباتی: '+fmt(incoming-out)+'</div></div>'}).join('')+'<p class="muted">تبدیل تن خرید به واحد فروش فعلاً بر مبنای ۱ تن = ۱۰۰۰ کیلوگرام/لیتر نمایشی است؛ برای موجودی دقیق باید چگالی و تبدیل محصولات نفتی تعیین شود.</p>');}
 else if(name==='customers'){const s=read('sales'),names=[...new Set(s.map(x=>x.customer))];page(name,'حساب مشتریان',names.map(n=>{const a=s.filter(x=>x.customer===n);return '<div class="listitem"><b>'+n+'</b><div>تعداد بل: '+fmt(a.length)+' | فروش: '+fmt(sum(a,'total'))+' | باقی: '+fmt(a.reduce((z,x)=>z+x.total-x.paid,0))+'</div></div>'}).join('')||'هنوز فروشی ثبت نشده است');}
 else if(name==='reports'){const s=read('sales'),p=read('purchases'),x=read('expenses');page(name,'گزارش‌ها','<div class="listitem">تعداد بل‌ها: '+fmt(s.length)+'</div><div class="listitem">مجموع فروش: '+fmt(sum(s,'total'))+' افغانی</div><div class="listitem">پرداختی: '+fmt(sum(s,'paid'))+' افغانی</div><div class="listitem">باقی مشتریان: '+fmt(s.reduce((a,b)=>a+b.total-b.paid,0))+' افغانی</div><div class="listitem">خرید عمده: '+fmt(sum(p,'total'))+' افغانی</div><div class="listitem">مصارف: '+fmt(sum(x,'amount'))+' افغانی</div>');}
 else if(name==='settings')page(name,'تنظیمات','<p>زبان: دری | ارز اصلی: افغانی | ارز خرید عمده: دالر</p><p>ذخیره‌سازی فعلی روی همین مرورگر و همین دستگاه است.</p><p class="muted">همگام‌سازی بین دستگاه‌ها، نرخ زنده دالر، PIN و پشتیبان‌گیری ابری پیش از استفاده عملیاتی باید فعال و آزمایش شوند.</p><button class="primary" id="export">گرفتن نسخه پشتیبان</button>',body=>{el('export').onclick=()=>{const data={sales:read('sales'),purchases:read('purchases'),expenses:read('expenses')};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='yema-backup.json';a.click();URL.revokeObjectURL(a.href);};});
}
function home(){el('page').classList.add('hidden');el('home').classList.remove('hidden');refresh()}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>show(b.dataset.page));
el('back').onclick=home;
refresh();
