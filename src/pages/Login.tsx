import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "@/services/authService";
import toast from "react-hot-toast";
import "@/styles/Login.css"; // Import the custom CSS file

const Login = () => {
  const [email, setemail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (localStorage.getItem("token")) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  const handleRequestOTP = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    try {
      await requestOTP({ email });
      setStep("verify");
      toast.success("OTP sent successfully!");
    } catch (err) {
      toast.error("Failed to request OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    try {
      await verifyOTP({ email, code });
      toast.success("Login successful!");
      navigate("/profile");
    } catch (err) {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {step === "request" ? (
          <form onSubmit={handleRequestOTP} className="login-form">
            <h2>Enter Your Email</h2>
            <p>We'll send a verification code to your email.</p>
            <input
              type="tel"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              placeholder="e.g., abcd@gmail.com"
              className="form-input"
              required
            />
            <button type="submit" className="form-button" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="login-form">
            <h2>Verify Your email</h2>
            <p>Enter the code we sent to {email}.</p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter OTP"
              className="form-input"
              required
            />
            <button type="submit" className="form-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => setStep("request")}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;