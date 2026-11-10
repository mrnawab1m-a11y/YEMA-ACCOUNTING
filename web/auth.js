import { createClient } from "https://esm.sh/@neondatabase/neon-js";
const client = createClient({
  auth: { url: "https://ep-young-cherry-b3x184tp.neonauth.c-4.ap-southeast-1.aws.neon.tech/yema_accounting/auth" },
  dataApi: { url: "https://ep-young-cherry-b3x184tp.apirest.c-4.ap-southeast-1.aws.neon.tech/yema_accounting/rest/v1" }
});
const auth = client.auth;
const $ = (id) => document.getElementById(id);
let mode = "login";
function setMode(next) {
  mode = next;
  $("nameWrap").hidden = mode !== "signup";
  $("password").autocomplete = mode === "signup" ? "new-password" : "current-password";
  $("submit").textContent = mode === "signup" ? "ساخت حساب" : "ورود";
  $("loginTab").className = mode === "login" ? "active" : "secondary";
  $("signupTab").className = mode === "signup" ? "active" : "secondary";
  $("message").textContent = mode === "signup" ? "ایمیل و رمز عبور قوی وارد کنید. تأیید ایمیل لازم است." : "برای ورود ایمیل و رمز عبور خود را وارد کنید.";
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
      ? await auth.signUp.email({ name, email, password })
      : await auth.signIn.email({ email, password });
    if (result?.error) throw new Error(result.error.message || "عملیات ورود ناموفق بود");
    if (mode === "signup") {
      $("message").textContent = "درخواست ثبت‌نام ارسال شد. ایمیل خود را برای کد تأیید بررسی کنید؛ سپس وارد شوید.";
    } else {
      const session = await auth.getSession();
      if (!session?.data?.session) throw new Error("نشست ورود تأیید نشد. دوباره تلاش کنید.");
      $("message").textContent = "ورود موفق شد. اکنون نشست امن برقرار است؛ همگام‌سازی اطلاعات حسابداری هنوز در حال تکمیل است.";
    }
  } catch (error) {
    $("message").textContent = "خطا: " + (error?.message || "ارتباط برقرار نشد");
  } finally {
    $("submit").disabled = false;
  }
});
try {
  const current = await auth.getSession();
  if (current?.data?.session) $("message").textContent = "نشست ورود موجود است. همگام‌سازی اطلاعات حسابداری هنوز تکمیل نشده است.";
} catch {}
