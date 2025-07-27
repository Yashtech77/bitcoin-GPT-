const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  login: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/authentication/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  register: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/authentication/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  verifyOtp: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/authentication/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  resendOtp: async (payload) => {
    const res = await fetch(`${BASE_URL}/api/authentication/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
