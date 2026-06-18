import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const EmailAuthForm = () => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    localStorage.setItem('tempEmail', email);
    navigate('/login/password');

    setIsLoading(false);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Введите адрес электронной почты</h1>
          <p className="auth-subtitle">Чтобы войти в аккаунт</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="auth-form">
          <div className="input-group">
            <div className={`input-wrapper ${isFocused ? 'input-focused' : ''}`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="email-input"
                placeholder="Введите ваш email"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div className="input-underline"></div>
          </div>

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Продолжить'}
          </button>
        </form>

        <p className="auth-switch">
          Нет аккаунта?{' '}
          <span className="auth-switch-link" onClick={() => navigate('/register')}>
            Зарегистрироваться
          </span>
        </p>
      </div>
    </div>
  );
};

export default EmailAuthForm;
