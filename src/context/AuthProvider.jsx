import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const AuthContext = createContext();
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [step, setStep] = useState("auth");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  // ✅ Check token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const storeUserSession = (data) => {
    const token = data.access_token || data.token;
    if (token) {
      localStorage.setItem("token", token);
      sessionStorage.setItem("token", token);
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      sessionStorage.setItem("user_id", data.user.id);
      sessionStorage.setItem("user_name", data.user.name);
    }
  };

  const login = async (payload) => {
    try {
      const loginPayload = { ...payload, role: "user" };
      const res = await fetch(`${BASE_URL}/api/authentication/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginPayload),
      });
      const data = await res.json();

      if (res.ok && data.message === "Login successful") {
        toast.success("Login successful");
        storeUserSession(data);
        setSuccess(true);
        setTimeout(() => navigate("/", { replace: true }), 2000);
      } else {
        const msg = (data.message || data.detail || "").toLowerCase();
        if (msg.includes("password")) toast.error("Incorrect password");
        else if (msg.includes("email")) toast.error("Invalid email not found");
        else toast.error(data.message || data.detail || "Login failed");
      }
    } catch (err) {
      toast.error("Server error during login");
    }
  };

  const register = async (payload) => {
    try {
      const registerPayload = { ...payload, role: "user" };
      const res = await fetch(`${BASE_URL}/api/authentication/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerPayload),
      });

      const data = await res.json();

      if (res.ok) {
        setRegisteredEmail(payload.email);
        setStep("otp");
        toast.success(data.message || "OTP sent to your email!");
      } else {
        if (
          data?.detail &&
          data.detail.includes("User already registered but not verified")
        ) {
          setRegisteredEmail(payload.email);
          setStep("otp");
          toast.info("OTP re-sent. Please verify your email.");
        } else {
          toast.error(data.detail || data.message || "Registration failed");
        }
      }
    } catch (err) {
      toast.error("Server error during registration");
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const res = await fetch(`${BASE_URL}/api/authentication/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail, otp }),
      });
      const data = await res.json();

      if (res.ok && data.message === "Email verified successfully") {
        toast.success("Email verified successfully!");
        storeUserSession(data);
        setSuccess(true);
        setTimeout(() => navigate("/", { replace: true }), 2000);
      } else {
        toast.error(data.detail || data.message || "OTP verification failed");
      }
    } catch (err) {
      toast.error("Server error during OTP verification");
    }
  };

  const resendOtp = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/authentication/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("OTP resent successfully");
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Server error during resend OTP");
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/authentication/forgot-password`,
        { email }
      );

      toast.success(response.data?.message || "OTP sent!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      throw error.response?.data || { message: "Something went wrong" };
    }
  };

  const resetPassword = async ({ email, otp, newPassword }) => {
    console.log("📤 Reset API Payload", { email, otp, new_password: newPassword });

    try {
      const response = await axios.post(
        `${BASE_URL}/api/authentication/reset-password`,
        {
          email,
          otp,
          new_password: newPassword,
        }
      );

      toast.success(response.data?.message || "Password reset successful");
      return response.data;
    } catch (error) {
      console.error("❌ Reset Password Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong");
      throw error.response?.data || { message: "Something went wrong" };
    }
  };

  // ✅ Logout helper
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        step,
        setStep,
        success,
        registeredEmail,
        login,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
