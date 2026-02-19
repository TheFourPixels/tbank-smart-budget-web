import React from 'react';
import './Transaction.css';

const Transaction = ({ title, subtitle, amount, type, icon }) => {
  const amountClass = type === 'positive' ? 'transaction__amount--positive' : 'transaction__amount--negative';
  const sign = type === 'positive' ? '+' : '-';
  
  return (
    <div className="transaction">
      <div className="transaction__left">
        <img
          src={`${process.env.PUBLIC_URL}/assets/${icon}.svg`}
          alt={title}
          className="transaction__icon"
        />
        <div className="transaction__info">
          <div className="transaction__title">{title}</div>
          <div className="transaction__subtitle">{subtitle}</div>
        </div>
      </div>
      <div className={`transaction__amount ${amountClass}`}>
        {sign+amount + " Р"}
      </div>
    </div>
  );
};

export default Transaction;