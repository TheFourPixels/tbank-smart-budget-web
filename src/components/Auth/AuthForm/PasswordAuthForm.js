import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './AuthForm.css';

const PasswordAuthForm = () => {
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const savedEmail = localStorage.getItem('tempEmail') || 'lb2005lba@gmail.com';
    setEmail(savedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
<<<<<<< HEAD
      localStorage.removeItem('tempEmail');
=======
+      localStorage.removeItem('tempEmail');
>>>>>>> c60e653 (авторизация)
      navigate('/', { replace: true });
    } else {
      console.error('Ошибка авторизации:', result.error);
      alert(result.error || 'Ошибка авторизации');
    }
    
    setIsLoading(false);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Введите пароль</h1>
          <p className="auth-subtitle">Для входа в ваш аккаунт</p>
          <p className="email-display">{email}</p>
        </div>

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
            <button 
              type="submit" 
              className={`submit-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordAuthForm;