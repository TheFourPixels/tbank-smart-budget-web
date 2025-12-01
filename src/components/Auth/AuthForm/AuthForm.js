import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForm.css';

const AuthForm = ({ mode = 'login' }) => {
  const [email, setEmail] = useState('lb2005lba@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState('email'); 
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    localStorage.setItem('tempEmail', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStep('password');
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const currentEmail = localStorage.getItem('tempEmail') || email;
    
    try {
      let result;
      
      if (mode === 'login') {
        result = await login(currentEmail, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Пароли не совпадают');
        }
        result = await register(currentEmail, password);
      }
      
      if (result.success) {
        localStorage.removeItem('tempEmail');
        navigate('/', { replace: true });
      } else {
        alert(result.error || 'Ошибка авторизации');
      }
    } catch (error) {
      alert(error.message || 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleBack = () => {
    if (step === 'password') {
      setStep('email');
    } else {
      navigate('/login');
    }
  };

  const renderEmailStep = () => (
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
  );

  const renderPasswordStep = () => {
    const currentEmail = localStorage.getItem('tempEmail') || email;

    return (
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <div className={`input-wrapper ${isFocused ? 'input-focused' : ''}`}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="email-input"
              placeholder="Введите ваш пароль"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Скрыть" : "Показать"}
            </button>
          </div>
          <div className="input-underline"></div>
        </div>

        {mode === 'register' && (
          <div className="input-group">
            <div className={`input-wrapper ${isFocused ? 'input-focused' : ''}`}>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="email-input"
                placeholder="Подтвердите пароль"
                required
                disabled={isLoading}
              />
            </div>
            <div className="input-underline"></div>
          </div>
        )}

        <button 
          type="submit" 
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading 
            ? (mode === 'login' ? 'Вход...' : 'Регистрация...') 
            : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}
        </button>
      </form>
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <button 
            type="button" 
            className="back-button"
            onClick={handleBack}
          >
            ← Назад
          </button>
          
          <h1 className="auth-title">
            {step === 'email' 
              ? 'Введите адрес электронной почты'
              : mode === 'login'
                ? 'Введите пароль'
                : 'Создайте пароль'}
          </h1>
          
          <p className="auth-subtitle">
            {step === 'email' 
              ? 'Чтобы войти или зарегистрироваться'
              : mode === 'login'
                ? 'Для входа в ваш аккаунт'
                : 'Для создания нового аккаунта'}
          </p>
          
          {step === 'password' && (
            <p className="email-display">
              {localStorage.getItem('tempEmail') || email}
            </p>
          )}
        </div>

        {step === 'email' ? renderEmailStep() : renderPasswordStep()}
        
        <div className="auth-footer">
          {mode === 'login' ? (
            <p className="switch-mode">
              Нет аккаунта?{' '}
              <button 
                type="button"
                className="link-button"
                onClick={() => navigate('/register')}
              >
                Зарегистрироваться
              </button>
            </p>
          ) : (
            <p className="switch-mode">
              Уже есть аккаунт?{' '}
              <button 
                type="button"
                className="link-button"
                onClick={() => navigate('/login')}
              >
                Войти
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;