import React, { useEffect,useState } from "react";
import { requestOTP, verifyOTP } from "@/services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  const handleRequestOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await requestOTP({ phone });
      setStep("verify");
    } catch (err) {
    console.log(":here",err);
      setError("Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await verifyOTP({ phone, code });
      navigate("/profile");
    } catch (err) {
      setError("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", paddingTop: "50px" }}>
      {step === "request" ? (
        <>
          <h2>Request OTP</h2>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            style={{ width: "100%", marginBottom: 10 }}
          />
          <button onClick={handleRequestOTP} disabled={loading}>
            {loading ? "Sending..." : "Request OTP"}
          </button>
        </>
      ) : (
        <>
          <h2>Verify OTP</h2>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter OTP"
            style={{ width: "100%", marginBottom: 10 }}
          />
          <button onClick={handleVerifyOTP} disabled={loading}>
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </>
      )}
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
    </div>
  );
};

export default Login;
