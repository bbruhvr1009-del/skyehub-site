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
