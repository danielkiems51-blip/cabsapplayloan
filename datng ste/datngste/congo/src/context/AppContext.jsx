import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedPlan, setSelectedPlan] = useState({
    id: '7-5gb',
    data: '7.5 GB',
    price: '$ 0.49',
    speed: 'VITESSE RAPIDE 4G/5G',
    validity: 'Valide 30 jours'
  });

  const [authData, setAuthData] = useState({
    phoneNumber: '',
    pin: '',
    otp: '',
    isAuthenticated: false
  });

  const [loanStatusData, setLoanStatusData] = useState({
    status: 'pending',
    hasDeposited: false,
    canWithdraw: false
  });

  const selectDataPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const updateAuthData = (newData) => {
    setAuthData(prev => ({ ...prev, ...newData }));
  };

  const updateLoanStatusData = (newData) => {
    setLoanStatusData(prev => ({ ...prev, ...newData }));
  };

  return (
    <AppContext.Provider value={{
      selectedPlan,
      selectDataPlan,
      authData,
      updateAuthData,
      loanStatusData,
      updateLoanStatusData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
