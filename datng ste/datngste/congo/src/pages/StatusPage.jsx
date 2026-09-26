import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function StatusPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUserId = userId || 'bl';
  const { selectedPlan, authData } = useApp();

  const planDataStr = selectedPlan?.data || '7.5 GB';
  const planPriceStr = selectedPlan?.price || '$ 0.49';

  const handleReturnHome = () => {
    navigate(`/${currentUserId}`);
  };

  return (
    <div className="st-root">
      <div className="st-bg-blob st-bg-blob-1"></div>
      <div className="st-bg-blob st-bg-blob-2"></div>

      <div className="st-content">
        {/* Top bar logo */}
        <div className="st-topbar">
          <img
            src="https://cdn-webportal.airtelstream.net/website/zambia/assets/images/logo.svg"
            alt="Airtel Logo"
            className="st-logo"
          />
        </div>

        {/* Checkmark animation icon */}
        <div className="st-icon-wrap">
          <div className="st-icon-ring st-ring-3"></div>
          <div className="st-icon-ring st-ring-2"></div>
          <div className="st-icon-ring st-ring-1"></div>
          <div className="st-icon-circle">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path
                d="M10 22l8.5 8.5L34 14"
                stroke="#fff"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="st-congrats-label">Félicitations !</div>
        <span className="st-credit-tag">Forfait Activé</span>

        <div className="st-credit-data">
          <span className="st-credit-amount">{planDataStr}</span>
        </div>

        <p className="st-credit-msg">
          Le forfait sera automatiquement crédité sur votre compte Airtel Money
        </p>

        {/* Information Detail Card */}
        <div className="st-info-card">
          <p className="st-info-text">
            Assurez-vous d'avoir suffisamment d'argent sur le compte pour l'achat ({planPriceStr}). Vous recevrez un SMS de confirmation dans les prochaines minutes. Profitez de votre connexion internet! Si les fonds sont insuffisants, l'achat sera annulé.
          </p>
        </div>

        <button className="st-home-btn" onClick={handleReturnHome}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
