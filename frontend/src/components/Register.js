import React, { useState, useEffect } from 'react'; 
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth'; 
import { app } from '../firebase';  
import "../register.css";  

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    driversLicense: "",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneConfirmed, setIsPhoneConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false); // Track reCAPTCHA readiness

  // Initialize reCAPTCHA only once and clean up when component unmounts
  useEffect(() => {
    const auth = getAuth(app);

    // Initialize reCAPTCHA only if not already rendered
    if (!window.recaptchaVerifier) {
      const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible', // 'invisible' is used to make the reCAPTCHA invisible
        callback: (response) => {
          console.log('reCAPTCHA solved:', response);
          setIsRecaptchaReady(true); // reCAPTCHA solved and ready to use
        }
      }, auth);

      // Render the reCAPTCHA widget
      recaptchaVerifier.render().then((recaptchaInstance) => {
        window.recaptchaVerifier = recaptchaInstance; // Store the reCAPTCHA instance globally
      }).catch((error) => {
        setError("Error initializing reCAPTCHA: " + error.message);
      });
    } else {
      setIsRecaptchaReady(true); // reCAPTCHA already initialized
    }

    // Clean up reCAPTCHA when component unmounts
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();  // Clear the reCAPTCHA instance
      }
    };
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
  
    // Validate the phone number format
    if (!formData.phone || formData.phone.length < 9) {
      setError("Phone number should be at least 9 digits.");
      return;
    }
  
    let formattedPhone = formData.phone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = formattedPhone.slice(1);  // Remove the leading 0
    }
  
    const phoneNumber = `+94${formattedPhone}`;  // For Sri Lanka
    console.log("Formatted Phone Number:", phoneNumber);
  
    // Ensure reCAPTCHA is ready before sending OTP
    if (!isRecaptchaReady) {
      setError("reCAPTCHA is not ready. Please wait a moment and try again.");
      return;
    }
  
    try {
      const auth = getAuth(app);
  
      // Ensure the reCAPTCHA verifier is initialized and rendered
      const recaptchaVerifier = window.recaptchaVerifier;
  
      // Send OTP using Firebase Authentication
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  
      // Store the confirmation result for OTP verification
      setConfirmationResult(result);
      setIsOtpSent(true); // Indicate OTP sent
      setIsPhoneConfirmed(false); // Reset phone confirmation state
      setError("");  // Clear any previous errors
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(`Error sending OTP: ${error.message}`);
    }
  };
  
  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!confirmationResult) {
      setError("No OTP sent. Please send an OTP first.");
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      console.log("Phone number verified successfully!");
      setIsPhoneConfirmed(true);
      setError("");  // Clear any previous errors
    } catch (error) {
      setError(`Error verifying OTP: ${error.message}`);
      console.error("Error verifying OTP:", error);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>

      {/* Registration Form (Step 1) */}
      {!isOtpSent && !isPhoneConfirmed && (
        <form onSubmit={(e) => e.preventDefault()}>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            placeholder="Full Name" 
            required 
          />
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            placeholder="Email" 
            required 
          />
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            placeholder="Password" 
            required 
          />
          <input 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
            placeholder="Address" 
            required 
          />
          <input 
            type="date" 
            name="dateOfBirth" 
            value={formData.dateOfBirth} 
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} 
            placeholder="Date of Birth" 
            required 
          />
          <input 
            type="text" 
            name="driversLicense" 
            value={formData.driversLicense} 
            onChange={(e) => setFormData({ ...formData, driversLicense: e.target.value })} 
            placeholder="Driver's License" 
            required 
          />
          <button type="button" onClick={() => setIsOtpSent(true)}>Next</button>
        </form>
      )}

      {/* Step 2: Phone Number Input */}
      {isOtpSent && !isPhoneConfirmed && (
        <div>
          <input 
            type="text" 
            name="phone" 
            value={formData.phone} 
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
            placeholder="Phone Number" 
            required 
          />
          <button type="button" onClick={handleSendOtp}>Send OTP</button>
        </div>
      )}

      {/* Step 3: OTP Verification */}
      {isOtpSent && !isPhoneConfirmed && (
        <form onSubmit={handleVerifyOtp}>
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            placeholder="Enter OTP" 
            required 
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Register;
