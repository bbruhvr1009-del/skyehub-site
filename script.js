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

const authScreen = document.getElementById("auth-screen");
const appShell = document.getElementById("app-shell");
const authForm = document.getElementById("auth-form");
const authToggle = document.getElementById("auth-toggle");
const authTagline = document.getElementById("auth-tagline");
const authSubmit = document.getElementById("auth-submit");
const authError = document.getElementById("auth-error");
const signOutBtn = document.getElementById("sign-out");
const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((el) => el.classList.remove("active"));
    item.classList.add("active");

    document.querySelectorAll(".view").forEach((v) => (v.hidden = true));
    document.getElementById(`view-${item.dataset.view}`).hidden = false;
  });
});

let mode = "login";

authToggle.addEventListener("click", () => {
  mode = mode === "login" ? "signup" : "login";
  const isLogin = mode === "login";
  authTagline.textContent = isLogin ? "welcome back" : "let's set you up";
  authSubmit.textContent = isLogin ? "Log In" : "Sign Up";
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
  authSubmit.textContent = mode === "login" ? "Logging in…" : "Signing up…";

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
    authSubmit.textContent = mode === "login" ? "Log In" : "Sign Up";
  }
});

function showError(msg) {
  authError.textContent = msg;
  authError.hidden = false;
}
function hideError() {
  authError.hidden = true;
}

signOutBtn.addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  appShell.hidden = true;
  authScreen.hidden = false;
});

async function enterApp() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;

  try {
    const profile = await Api.getProfile(token);
    const name = profile.display_name || profile.username || "there";
    const handle = profile.username ? `@${profile.username}` : "";
    const initial = name.charAt(0).toUpperCase();

    document.getElementById("welcome-name").textContent = name;
    document.getElementById("welcome-email").textContent = handle;
    document.getElementById("avatar-initial").textContent = initial;
    document.getElementById("mini-name").textContent = name;
    document.getElementById("mini-handle").textContent = handle;
    document.getElementById("mini-avatar").textContent = initial;

    authScreen.hidden = true;
    appShell.hidden = false;
  } catch (err) {
    localStorage.removeItem(TOKEN_KEY);
  }
}

enterApp();
