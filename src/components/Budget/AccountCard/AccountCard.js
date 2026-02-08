import React, { useState, useEffect } from 'react';
import './AccountCard.css';

function AccountCard() {
  const [accountData, setAccountData] = useState({
    accountName: 'Black',
    amount: '35 600',
    accountType: 'Привязана к счету'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedAccount = localStorage.getItem('accountData');
    if (savedAccount) {
      setAccountData(JSON.parse(savedAccount));
    } else {
      const defaultData = {
        accountName: 'Black',
        amount: '35 600',
        accountType: 'Привязана к счету'
      };
      setAccountData(defaultData);
      localStorage.setItem('accountData', JSON.stringify(defaultData));
    }
  }, []);

  const handleChangeAccount = () => {
    console.log('Изменение счета...');
  };

  if (loading) {
    return (
      <div className="account-card">
        <div className="loading-placeholder">
          <div className="loading-line"></div>
          <div className="loading-line"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-card">
      <div className="account-header">
        <span className="title">{accountData.accountType}</span>
        <button 
          className="change-link"
          onClick={handleChangeAccount}
          type="button"
        >
          Изменить
        </button>
      </div>
      <div className="account-details">
        <div className="account-icon">
          💳
        </div>
        <div className="account-info">
          <span className="amount">{accountData.amount} Р</span>
          <span className="account-name">{accountData.accountName}</span>
        </div>
      </div>
    </div>
  );
}

export default AccountCard;