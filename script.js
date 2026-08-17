// Talks to the same Worker backend your Android app uses.
const API_BASE = "https://everglow-api.bbruhvr1009.workers.dev";

const Api = {
  async signup(email, password) {
    return Api._post("/auth/signup", { email, password });
  },

  async login(email, password) {
    return Api._post("/auth/login", { email, password });
  },

  async getProfile(token) {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error((await res.json()).error || "Couldn't load profile");
    return res.json();
  },

  async _post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  },
};
const TOKEN_KEY = "everglow_token";

// ---------- Elements ----------
const authScreen = document.getElementById("auth-screen");
const appScreen = document.getElementById("app-screen");
const authForm = document.getElementById("auth-form");
const authToggle = document.getElementById("auth-toggle");
const authTagline = document.getElementById("auth-tagline");
const authSubmit = document.getElementById("auth-submit");
const authError = document.getElementById("auth-error");
const signOutBtn = document.getElementById("sign-out");

let mode = "login"; // or "signup"

// ---------- Auth screen behavior ----------
authToggle.addEventListener("click", () => {
  mode = mode === "login" ? "signup" : "login";
  const isLogin = mode === "login";
  authTagline.textContent = isLogin ? "welcome back" : "let's set you up";
  authSubmit.textContent = isLogin ? "log in" : "sign up";
  authToggle.innerHTML = isLogin
    ? `new here? <span>create an account</span>`
    : `already have one? <span>log in</span>`;
  hideError();
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  authSubmit.disabled = true;
  authSubmit.textContent = mode === "login" ? "logging in…" : "signing up…";

  try {
    const result = mode === "login"
      ? await Api.login(email, password)
      : await Api.signup(email, password);

    localStorage.setItem(TOKEN_KEY, result.token);
    await enterApp();
  } catch (err) {
    showError(err.message);
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = mode === "login" ? "log in" : "sign up";
  }
});

function showError(msg) {
  authError.textContent = msg;
  authError.hidden = false;
}
function hideError() {
  authError.hidden = true;
}

// ---------- Sign out ----------
signOutBtn.addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  appScreen.hidden = true;
  authScreen.hidden = false;
});

// ---------- Entering the app ----------
async function enterApp() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  try {
    const profile = await Api.getProfile(token);
    const name = profile.display_name || profile.username || "there";
    document.getElementById("welcome-name").textContent = `hey, ${name}`;
    document.getElementById("welcome-email").textContent = profile.username
      ? `@${profile.username}`
      : "";
    document.getElementById("avatar-initial").textContent = name.charAt(0).toUpperCase();

    authScreen.hidden = true;
    appScreen.hidden = false;
  } catch (err) {
    // token invalid/expired — bounce back to login
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ---------- Boot ----------
enterApp();
