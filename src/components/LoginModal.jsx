import { useEffect, useRef } from "react";
import "./LoginModal.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Helper to decode JWT without external library
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function LoginModal({ onClose, onLogin }) {
  const googleBtnRef = useRef(null);

  useEffect(() => {
    // 1. Load the Google GIS script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        // 2. Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            const userData = parseJwt(response.credential);
            if (userData) {
              // Pass the full profile data back to the parent
              onLogin({
                id: userData.sub,
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                provider: "google"
              });
            }
          },
        });

        // 3. Render the standard Google button
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_black",
            size: "large",
            shape: "pill",
            width: 280,
            text: "signin_with",
          });
        }

        // 4. Optionally show One Tap prompt
        window.google.accounts.id.prompt();
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onLogin]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="modal-header">
          <div className="modal-icon-container">
            <span className="modal-icon">👤</span>
          </div>
          <h2>Welcome to NyayBot</h2>
          <p>Sign in with Google to save your legal case history and access advanced analysis.</p>
        </div>

        <div className="auth-container">
          {/* Google will render its button exactly here */}
          <div ref={googleBtnRef} id="googleBtn" className="google-btn-wrapper"></div>

          <p className="auth-note" style={{ marginTop: "24px" }}>
            Signing in ensures your case data is <span>encrypted</span> and accessible only by you.
          </p>
        </div>

        <div className="modal-footer">
          <p>
            By signing in, you agree to our <span>Terms & Conditions</span>
          </p>
        </div>
      </div>
    </div>
  );
}
