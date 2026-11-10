package com.yema.accounting

import android.app.Activity
import android.os.Bundle
import android.graphics.Color
import android.graphics.Typeface
import android.view.Gravity
import android.view.View
import android.widget.*
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.content.ContentValues

private val navy = Color.rgb(23,43,77)
private val gold = Color.rgb(214,168,75)
private val ink = Color.rgb(35,45,60)
private val pale = Color.rgb(245,247,250)

class StoreDb(c: android.content.Context): SQLiteOpenHelper(c,"yema.db",null,1) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE sales(id INTEGER PRIMARY KEY AUTOINCREMENT, customer TEXT, address TEXT, product TEXT, qty REAL, unit_price REAL, total REAL, paid REAL, date TEXT)")
        db.execSQL("CREATE TABLE purchases(id INTEGER PRIMARY KEY AUTOINCREMENT, supplier TEXT, product TEXT, qty_ton REAL, usd_price REAL, afn_rate REAL, total_afn REAL, date TEXT)")
        db.execSQL("CREATE TABLE expenses(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, amount REAL, date TEXT)")
        db.execSQL("CREATE TABLE customers(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, address TEXT)")
        db.execSQL("CREATE TABLE prices(product TEXT PRIMARY KEY, buy REAL DEFAULT 0, sell REAL DEFAULT 0, stock REAL DEFAULT 0)")
        listOf("پطرول ۹۲","پطرول ۸۰","دیزل شیشه‌ای","دیزل ۰۱","گاز").forEach { p ->
            val v=ContentValues(); v.put("product",p); db.insert("prices",null,v)
        }
    }
    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {}
    fun count(table:String):Int=readableDatabase.rawQuery("SELECT COUNT(*) FROM $table",null).use { if(it.moveToFirst()) it.getInt(0) else 0 }
    fun total(table:String,column:String):Double=readableDatabase.rawQuery("SELECT COALESCE(SUM($column),0) FROM $table",null).use { if(it.moveToFirst()) it.getDouble(0) else 0.0 }
    fun addSale(c:String,a:String,p:String,q:Double,price:Double,paid:Double) {
        val v=ContentValues(); v.put("customer",c);v.put("address",a);v.put("product",p);v.put("qty",q);v.put("unit_price",price);v.put("total",q*price);v.put("paid",paid);v.put("date",java.text.SimpleDateFormat("yyyy-MM-dd HH:mm",java.util.Locale.getDefault()).format(java.util.Date())); writableDatabase.insert("sales",null,v)
        writableDatabase.execSQL("UPDATE prices SET stock=stock-? WHERE product=?", arrayOf(q,p))
    }
    fun addPurchase(s:String,p:String,q:Double,usd:Double,rate:Double) {
        val v=ContentValues();v.put("supplier",s);v.put("product",p);v.put("qty_ton",q);v.put("usd_price",usd);v.put("afn_rate",rate);v.put("total_afn",q*usd*rate);v.put("date",java.text.SimpleDateFormat("yyyy-MM-dd HH:mm",java.util.Locale.getDefault()).format(java.util.Date()));writableDatabase.insert("purchases",null,v)
        writableDatabase.execSQL("UPDATE prices SET stock=stock+? WHERE product=?", arrayOf(q*1000,p))
    }
    fun addExpense(t:String,n:Double) { val v=ContentValues();v.put("title",t);v.put("amount",n);v.put("date",java.text.SimpleDateFormat("yyyy-MM-dd",java.util.Locale.getDefault()).format(java.util.Date()));writableDatabase.insert("expenses",null,v) }
}
class MainActivity : Activity() {
    private lateinit var db: StoreDb
    private lateinit var root: LinearLayout
    private val products=listOf("پطرول ۹۲","پطرول ۸۰","دیزل شیشه‌ای","دیزل ۰۱","گاز")
    override fun onCreate(savedInstanceState:Bundle?) { super.onCreate(savedInstanceState); db=StoreDb(this); dashboard() }
    private fun base(title:String) {
        root=LinearLayout(this);root.orientation=LinearLayout.VERTICAL;root.setBackgroundColor(pale)
        val bar=TextView(this);bar.text="  $title";bar.textSize=21f;bar.setTextColor(Color.WHITE);bar.setTypeface(null,Typeface.BOLD);bar.setBackgroundColor(navy);bar.setPadding(18,22,12,22);root.addView(bar)
        val scroll=ScrollView(this);val body=LinearLayout(this);body.orientation=LinearLayout.VERTICAL;body.setPadding(16,14,16,24);scroll.addView(body);root.addView(scroll,LinearLayout.LayoutParams(-1,0,1f))
        setContentView(root); current=body
        button(body,"⌂  صفحه اصلی"){dashboard()}
    }
    private lateinit var current:LinearLayout
    private fun button(parent:LinearLayout,label:String,action:()->Unit) {
        val b=Button(this);b.text=label;b.isAllCaps=false;b.textSize=16f;b.setTextColor(navy);b.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.WHITE));b.setOnClickListener{action()}
        val lp=LinearLayout.LayoutParams(-1,-2);lp.bottomMargin=8;parent.addView(b,lp)
    }
    private fun field(parent:LinearLayout,label:String,hint:String):EditText {
        val t=TextView(this);t.text=label;t.setTextColor(ink);t.textSize=14f;parent.addView(t)
        val e=EditText(this);e.hint=hint;e.textSize=16f;e.setSingleLine(true);parent.addView(e);return e
    }
    private fun pick(parent:LinearLayout,label:String):Spinner {
        val s=Spinner(this);s.adapter=ArrayAdapter(this,android.R.layout.simple_spinner_dropdown_item,products);parent.addView(TextView(this).apply{ text=label;setTextColor(ink) });parent.addView(s);return s
    }
    private fun info(parent:LinearLayout,text:String) { parent.addView(TextView(this).apply{this.text=text;textSize=16f;setTextColor(ink);setPadding(8,10,8,10)}) }
    private fun dashboard() {
        base("حسابداری یما")
        info(current,"نمایندگی تیل فروشی حاجی نواب پروانی")
        info(current,"فروش‌های ثبت‌شده: ${db.count("sales")}     خریدها: ${db.count("purchases")}")
        info(current,"مجموع فروش: ${fmt(db.total("sales","total"))} افغانی")
        info(current,"مصارف: ${fmt(db.total("expenses","amount"))} افغانی")
        button(current,"ثبت فروش"){sale()}
        button(current,"خرید عمده"){purchase()}
        button(current,"۵ محصول و موجودی"){inventory()}
        button(current,"مشتریان"){customers()}
        button(current,"مصارف"){expenses()}
        button(current,"گزارش‌ها"){reports()}
        button(current,"تنظیمات و نرخ دالر"){settings()}
    }
    private fun sale() {
        base("ثبت فروش")
        val bill=db.count("sales")+1;info(current,"نمبر بل: $bill")
        val c=field(current,"نام مشتری","نام مشتری");val a=field(current,"آدرس مشتری","آدرس در پایان توضیحات")
        val p=pick(current,"نوع محصول")
        val q=field(current,"مقدار ("+"لیتر / کیلوگرام"+")","مقدار");val price=field(current,"قیمت فی واحد (افغانی)","نرخ فروش");val paid=field(current,"پرداخت‌شده","مبلغ پرداخت")
        button(current,"ثبت بل فروش") { val qty=q.text.toString().toDoubleOrNull();val pr=price.text.toString().toDoubleOrNull();val pay=paid.text.toString().toDoubleOrNull()?:0.0
            if(c.text.isBlank()||qty==null||pr==null||qty<=0||pr<0) { toast("نام مشتری، مقدار و قیمت را درست وارد کنید") }
            else { db.addSale(c.text.toString(),a.text.toString(),p.selectedItem.toString(),qty,pr,pay);toast("فروش ثبت شد؛ نمبر بل $bill");dashboard() } }
    }
    private fun purchase() {
        base("خرید عمده")
        val s=field(current,"نام فروشنده","نام فروشنده");val p=pick(current,"محصول")
        val q=field(current,"مقدار به تن","تن");val usd=field(current,"قیمت هر تن به دالر","USD");val rate=field(current,"نرخ دالر به افغانی","مثلاً 70")
        button(current,"ثبت خرید") { val a=q.text.toString().toDoubleOrNull();val b=usd.text.toString().toDoubleOrNull();val r=rate.text.toString().toDoubleOrNull()
            if(a==null||b==null||r==null||a<=0||b<0||r<=0)toast("مقادیر خرید را بررسی کنید") else {db.addPurchase(s.text.toString(),p.selectedItem.toString(),a,b,r);toast("خرید ثبت شد");dashboard()} }
    }
    private fun inventory() {
        base("محصولات و موجودی")
        products.forEach { p -> val cur=db.readableDatabase.rawQuery("SELECT stock,buy,sell FROM prices WHERE product=?",arrayOf(p));cur.use { if(it.moveToFirst()) info(current,"$p   | موجودی: ${fmt(it.getDouble(0))}   | خرید: ${fmt(it.getDouble(1))}   | فروش: ${fmt(it.getDouble(2))}") } }
        info(current,"واحد گاز در فروش پرچون: کیلوگرام؛ واحد تیل: لیتر")
    }
    private fun customers() { base("مشتریان");info(current,"مشتریان از بل‌های ثبت‌شده قابل پیگیری‌اند.");val c= db.readableDatabase.rawQuery("SELECT customer,COUNT(*),SUM(total),SUM(total-paid) FROM sales GROUP BY customer ORDER BY customer",null);c.use{while(it.moveToNext())info(current,"${it.getString(0)} | بل: ${it.getInt(1)} | فروش: ${fmt(it.getDouble(2))} | باقی: ${fmt(it.getDouble(3))}")} }
    private fun expenses() { base("ثبت مصارف");val t=field(current,"عنوان مصرف","مثلاً کرایه");val n=field(current,"مبلغ افغانی","مبلغ");button(current,"ثبت مصرف"){val v=n.text.toString().toDoubleOrNull();if(t.text.isBlank()||v==null||v<0)toast("عنوان و مبلغ را بررسی کنید")else{db.addExpense(t.text.toString(),v);toast("مصرف ثبت شد");dashboard()}} }
    private fun reports() { base("گزارش‌ها");info(current,"تعداد بل‌ها: ${db.count("sales")}");info(current,"مجموع فروش: ${fmt(db.total("sales","total"))} افغانی");info(current,"مجموع پرداختی: ${fmt(db.total("sales","paid"))} افغانی");info(current,"باقی حساب مشتریان: ${fmt(db.total("sales","total")-db.total("sales","paid"))} افغانی");info(current,"مجموع مصارف: ${fmt(db.total("expenses","amount"))} افغانی");info(current,"مجموع خرید عمده: ${fmt(db.total("purchases","total_afn"))} افغانی") }
    private fun settings() { base("تنظیمات");info(current,"ارز پایه: افغانی | ارز خرید عمده: دالر");info(current,"نرخ دالر هنگام ثبت خرید ذخیره می‌شود.");info(current,"پشتیبان‌گیری و همگام‌سازی ابری در مرحله بعدی اضافه می‌شود.") }
    private fun fmt(v:Double)=if(v%1.0==0.0) v.toLong().toString() else String.format(java.util.Locale.US,"%.2f",v).trimEnd('0').trimEnd('.')
    private fun toast(s:String){Toast.makeText(this,s,Toast.LENGTH_LONG).show()}
}
