/* وكالة الدواحي — نظام حسابات محلي (بدون سيرفر)
   يدعم إنشاء حسابات جديدة (تخزين في localStorage) بالإضافة لحساب افتراضي جاهز للتجربة. */

const DEFAULT_ACCOUNT = {
  fullname: "ضيف الدواحي",
  phone: "0000000000",
  email: "guest@dawahi.com",
  password: "dawahi123"
};

const USERS_KEY = "dawahi_users";
const SESSION_KEY = "dawahi_session";

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
  email = (email || "").trim().toLowerCase();
  if (email === DEFAULT_ACCOUNT.email) return DEFAULT_ACCOUNT;
  return getUsers().find(u => u.email.toLowerCase() === email) || null;
}

/* نتيجة: { ok: true } أو { ok: false, error: "..." } */
function doRegister(fullname, phone, email, password, confirmPassword) {
  fullname = (fullname || "").trim();
  phone = (phone || "").trim();
  email = (email || "").trim().toLowerCase();

  const nameParts = fullname.split(/\s+/).filter(Boolean);
  if (nameParts.length < 3) {
    return { ok: false, error: "name" };
  }
  if (!/^[0-9+\s-]{8,15}$/.test(phone)) {
    return { ok: false, error: "phone" };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "email" };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: "passwordShort" };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "passwordMatch" };
  }
  if (findUserByEmail(email)) {
    return { ok: false, error: "exists" };
  }

  const users = getUsers();
  users.push({ fullname, phone, email, password });
  saveUsers(users);

  localStorage.setItem(SESSION_KEY, JSON.stringify({
    username: fullname,
    email: email
  }));

  return { ok: true };
}

function doLogin(email, password) {
  email = (email || "").trim().toLowerCase();
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      username: user.fullname,
      email: user.email
    }));
    return true;
  }
  return false;
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

// يوضع في بداية كل صفحة محمية: يحوّل لصفحة الدخول لو مفيش جلسة، ويملأ اسم المستخدم بالنافبار
function requireLogin() {
  const s = getSession();
  if (!s) {
    window.location.href = "login.html";
    return null;
  }
  const el = document.getElementById("navUsername");
  if (el) el.textContent = s.username;
  return s;
}

function doLogout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}
