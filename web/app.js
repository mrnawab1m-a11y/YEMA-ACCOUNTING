const PRODUCTS=['پطرول ۹۲','پطرول ۸۰','دیزل شیشه‌ای','دیزل ۰۱','گاز'];
const read=k=>JSON.parse(localStorage.getItem('yema_'+k)||'[]');
const write=(k,v)=>localStorage.setItem('yema_'+k,JSON.stringify(v));
const fmt=n=>Number(n||0).toLocaleString('fa-IR',{maximumFractionDigits:2});
const el=id=>document.getElementById(id);
let selectedProduct=PRODUCTS[0];
function refresh(){
 const sales=read('sales'),expenses=read('expenses');
 el('salesCount').textContent=fmt(sales.length);
 el('salesTotal').textContent=fmt(sales.reduce((s,x)=>s+x.total,0))+' افغانی';
 el('expenseTotal').textContent=fmt(expenses.reduce((s,x)=>s+x.amount,0))+' افغانی';
 el('balanceTotal').textContent=fmt(sales.reduce((s,x)=>s+x.total-x.paid,0))+' افغانی';
 el('productButtons').innerHTML=PRODUCTS.map(p=>'<button data-product="'+p+'">'+p+'</button>').join('');
 document.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>{selectedProduct=b.dataset.product;show('inventory')});
}
function field(label,name,type='text',hint=''){return '<label>'+label+'</label><input name="'+name+'" type="'+type+'" placeholder="'+hint+'" required>'}
function productSelect(){return '<label>نوع محصول</label><select name="product">'+PRODUCTS.map(p=>'<option>'+p+'</option>').join('')+'</select>'}
function show(name){
 el('home').classList.add('hidden');el('page').classList.remove('hidden');const body=el('pageBody');let title='';
 if(name==='sale'){title='ثبت فروش';body.innerHTML=field('نام مشتری','customer')+productSelect()+field('مقدار (تیل: لیتر، گاز: کیلوگرام)','qty','number','مقدار')+field('قیمت فی واحد به افغانی','price','number')+field('پرداخت‌شده','paid','number')+field('توضیحات و آدرس مشتری','address')+'<button class="primary" id="save">ثبت بل فروش</button>';wrapSale(body);}
 else if(name==='purchase'){title='خرید عمده';body.innerHTML=field('نام فروشنده','supplier')+productSelect()+field('مقدار به تن','qty','number')+field('قیمت هر تن به دالر','usd','number')+field('نرخ دالر به افغانی','rate','number','نرخ روز')+'<button class="primary" id="save">ثبت خرید</button>';el('save').onclick=()=>{const v=Object.fromEntries([...body.querySelectorAll('input,select')].map(x=>[x.name,x.value]));if(!v.qty||!v.usd||!v.rate)return alert('همه مقدارها را وارد کنید');const arr=read('purchases');arr.push({...v,qty:+v.qty,usd:+v.usd,rate:+v.rate,total:+v.qty*+v.usd*+v.rate});write('purchases',arr);alert('خرید ثبت شد');refresh();home();};}
 else if(name==='expenses'){title='ثبت مصارف';body.innerHTML=field('عنوان مصرف','title')+field('مبلغ افغانی','amount','number')+'<button class="primary" id="save">ثبت مصرف</button>';el('save').onclick=()=>{const v=Object.fromEntries([...body.querySelectorAll('input')].map(x=>[x.name,x.value]));if(!v.title||!v.amount)return alert('معلومات را وارد کنید');const a=read('expenses');a.push({title:v.title,amount:+v.amount});write('expenses',a);refresh();home();};}
 else if(name==='inventory'){title='موجودی پنج محصول';const sales=read('sales'),purchases=read('purchases');body.innerHTML=PRODUCTS.map(p=>{const bought=purchases.filter(x=>x.product===p).reduce((s,x)=>s+x.qty*1000,0),sold=sales.filter(x=>x.product===p).reduce((s,x)=>s+x.qty,0);return '<div class="listitem">'+p+' — '+fmt(bought-sold)+' واحد پایه</div>'}).join('');}
 else if(name==='customers'){title='حساب مشتریان';const sales=read('sales');const names=[...new Set(sales.map(x=>x.customer))];body.innerHTML=names.map(n=>{const a=sales.filter(x=>x.customer===n);return '<div class="listitem">'+n+' — فروش '+fmt(a.reduce((s,x)=>s+x.total,0))+' — باقی '+fmt(a.reduce((s,x)=>s+x.total-x.paid,0))+'</div>'}).join('')||'هنوز فروشی ثبت نشده است';}
 else if(name==='reports'){title='گزارش‌ها';const s=read('sales'),p=read('purchases'),x=read('expenses');body.innerHTML='<p>تعداد بل‌ها: '+fmt(s.length)+'</p><p>مجموع فروش: '+fmt(s.reduce((a,b)=>a+b.total,0))+'</p><p>خرید عمده: '+fmt(p.reduce((a,b)=>a+b.total,0))+'</p><p>مصارف: '+fmt(x.reduce((a,b)=>a+b.amount,0))+'</p>';}
 else {title='تنظیمات';body.innerHTML='<p>اطلاعات این نسخه فعلاً در همین مرورگر ذخیره می‌شود.</p><p>همگام‌سازی ابری و ورود امن باید پیش از استفاده چنددستگاهی به سرور متصل شود.</p>';}
 el('pageTitle').textContent=title;
}
function wrapForm(body){const f=document.createElement('form');while(body.firstChild)f.append(body.firstChild);body.append(f);return f}
function wrapSale(body){
 const save=el('save');save.onclick=()=>{const v=Object.fromEntries([...body.querySelectorAll('input,select')].map(x=>[x.name,x.value]));const q=+v.qty,price=+v.price,paid=+v.paid||0;if(!v.customer||!q||!price||q<=0||price<0)return alert('معلومات فروش را درست وارد کنید');const a=read('sales');a.push({bill:a.length+1,customer:v.customer,address:v.address,product:v.product,qty:q,price,paid,total:q*price,date:new Date().toISOString()});write('sales',a);alert('بل شماره '+a.length+' ثبت شد');refresh();home();};
}
function home(){el('page').classList.add('hidden');el('home').classList.remove('hidden');}
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>show(b.dataset.page));
el('back').onclick=home;
refresh();
