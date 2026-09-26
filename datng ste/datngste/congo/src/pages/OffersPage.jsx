import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const DATA_PLANS = [
  {
    id: '7-5gb',
    data: '7.5 GB',
    dataValue: 7.5,
    unit: 'GB',
    price: '$ 0.49',
    speed: 'VITESSE RAPIDE 4G/5G',
    validity: 'Valide 30 jours',
    cta: 'Bénéficier'
  },
  {
    id: '15gb',
    data: '15 GB',
    dataValue: 15,
    unit: 'GB',
    price: '$ 0.99',
    speed: 'VITESSE EXTRÊME',
    validity: 'Valide 30 jours',
    badge: 'LE PLUS POPULAIRE',
    hot: true,
    cta: 'Bénéficier'
  },
  {
    id: '30gb',
    data: '30 GB',
    dataValue: 30,
    unit: 'GB',
    price: '$ 1.99',
    speed: 'HAUT DÉBIT',
    validity: 'Valide 30 jours',
    cta: 'Bénéficier'
  },
  {
    id: 'unlimited',
    data: 'ILLIMITÉ',
    dataValue: 'ILLIMITÉ',
    price: '$ 3.49',
    speed: 'ILLIMITÉ VIP',
    validity: 'Valide 30 jours',
    badge: 'OFFRE VIP',
    wide: true,
    unlimited: true,
    cta: 'Bénéficier'
  }
];

export default function OffersPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const currentUserId = userId || 'bl';
  const { selectDataPlan } = useApp();

  const [animatingId, setAnimatingId] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedCardId(plan.id);
    setAnimatingId(plan.id);
    setTimeout(() => {
      selectDataPlan(plan);
      navigate(`/${currentUserId}/login`);
    }, 500);
  };

  return (
    <div className="dp-root">
      {/* Background Blobs */}
      <div className="dp-blob dp-blob-1"></div>
      <div className="dp-blob dp-blob-2"></div>
      <div className="dp-blob dp-blob-3"></div>

      {/* Header */}
      <header className="dp-header">
        <div className="dp-logo-wrap">
          <img
            src="https://cdn-webportal.airtelstream.net/website/zambia/assets/images/logo.svg"
            alt="Airtel Logo"
            className="dp-logo"
          />
        </div>

        <div className="dp-collab-center">
          <span className="dp-collab-text">EN COLLABORATION AVEC</span>
          <div className="dp-collab-brand">
            <span className="dp-starlink-wordmark">STARLINK</span>
          </div>
        </div>

        <button className="dp-menu-btn" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Main Content */}
      <main className="dp-main">
        {/* Hero Banner */}
        <section className="dp-hero">
          <span className="dp-hero-badge">OFFRE SPÉCIALE STARLINK x AIRTEL</span>
          <h1 className="dp-hero-title">
            Forfaits Internet <span className="dp-hero-accent">Ultra-Rapides</span>
          </h1>
          <p className="dp-hero-sub">
            Bénéficiez de la vitesse satellite Starlink sur le réseau 4G Airtel RDC.
          </p>
        </section>

        {/* Plans Grid */}
        <div className="dp-grid">
          {DATA_PLANS.map((plan) => {
            const isHot = plan.hot;
            const isWide = plan.wide;
            const isSelected = selectedCardId === plan.id;
            const isAnimating = animatingId === plan.id;

            let cardClass = "dp-card";
            if (isHot) cardClass += " dp-card--hot";
            if (isWide) cardClass += " dp-card--wide";
            if (isSelected) cardClass += " dp-card--selected";
            if (isAnimating) cardClass += " dp-card--animating";

            return (
              <div
                key={plan.id}
                className={cardClass}
                onClick={() => handleSelectPlan(plan)}
              >
                {plan.badge && <span className="dp-badge">{plan.badge}</span>}

                <div className="dp-card-speed">{plan.speed}</div>

                <div className="dp-card-data">
                  <span className={plan.unlimited ? "dp-card-amount dp-card-amount--infinity" : "dp-card-amount"}>
                    {plan.dataValue}
                  </span>
                  {plan.unit && <span className="dp-card-unit">{plan.unit}</span>}
                </div>

                <div className="dp-card-validity">{plan.validity}</div>

                <div className="dp-card-divider"></div>

                <div className="dp-card-price">
                  <span className="dp-card-dollars">{plan.price}</span>
                </div>

                <button type="button" className="dp-card-cta">
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="dp-trust">
          <div className="dp-trust-item">
            <span>⚡ Network Airtel RDC</span>
          </div>
          <div className="dp-trust-sep"></div>
          <div className="dp-trust-item">
            <span>💳 Airtel Money</span>
          </div>
          <div className="dp-trust-sep"></div>
          <div className="dp-trust-item">
            <span>🚀 Activation Instantanée</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="dp-footer">
        © 2026 Airtel RDC & Starlink. Tous droits réservés.
      </footer>
    </div>
  );
}
