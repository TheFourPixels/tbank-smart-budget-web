import React from 'react';
import './AccountCard.css';

function AccountCard() {
  return (
    <div className="account-card">
      <div className="account-header">
        <span className="title">Привязана к счету</span>
        <span className="change-link">Изменить</span>
      </div>
      <div className="account-details">
        <div className="account-icon"></div>
        <div className="account-info">
          <span className="amount">35 600 Р</span>
          <span className="account-name">Black</span>
        </div>
      </div>
    </div>
  );
}

export default AccountCard;