import { createAuthClient } from "https://esm.sh/@neondatabase/neon-js/auth";
const auth = createAuthClient("https://ep-young-cherry-b3x184tp.neonauth.c-4.ap-southeast-1.aws.neon.tech/yema_accounting/auth");
const $ = (id) => document.getElementById(id);
let mode = "login";
function setMode(next) {
  mode = next;
  $("nameWrap").hidden = mode !== "signup";
  $("password").autocomplete = mode === "signup" ? "new-password" : "current-password";
  $("submit").textContent = mode === "signup" ? "ساخت حساب" : "ورود";
  $("loginTab").className = mode === "login" ? "active" : "secondary";
  $("signupTab").className = mode === "signup" ? "active" : "secondary";
  $("message").textContent = mode === "signup" ? "ایمیل و رمز عبور قوی وارد کنید. ممکن است تأیید ایمیل لازم باشد." : "برای ورود ایمیل و رمز عبور خود را وارد کنید.";
}
$("loginTab").addEventListener("click", () => setMode("login"));
$("signupTab").addEventListener("click", () => setMode("signup"));
$("authForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = $("email").value.trim();
  const password = $("password").value;
  const name = $("name").value.trim() || "صاحب حساب یما";
  $("submit").disabled = true;
  $("message").textContent = "در حال ارتباط امن...";
  try {
    const result = mode === "signup"
      ? await auth.auth.signUp.email({ name, email, password })
      : await auth.auth.signIn.email({ email, password });
    if (result?.error) throw new Error(result.error.message || "ورود انجام نشد");
    $("message").textContent = mode === "signup"
      ? "درخواست ثبت‌نام ارسال شد. اگر پیام تأیید ایمیل دریافت کردید، آن را تکمیل کنید؛ سپس وارد شوید."
      : "ورود موفق بود. نشست شما ایجاد شد. بخش همگام‌سازی حسابداری هنوز در حال تکمیل است.";
    if (mode === "login") {
      const session = await auth.auth.getSession();
      if (!session?.data?.session) $("message").textContent = "پاسخ ورود دریافت شد، اما نشست قابل تأیید نیست. دوباره تلاش کنید.";
    }
  } catch (error) {
    $("message").textContent = "خطا: " + (error?.message || "ارتباط برقرار نشد");
  } finally {
    $("submit").disabled = false;
  }
});
try {
  const current = await auth.auth.getSession();
  if (current?.data?.session) $("message").textContent = "نشست ورود موجود است. اتصال ثبت و همگام‌سازی داده‌ها هنوز تکمیل نشده است.";
} catch {}
