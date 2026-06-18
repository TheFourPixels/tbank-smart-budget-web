import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './AuthForm.css';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов');
      return;
    }

    setIsLoading(true);
    const result = await register(email, password, name);

    if (result.success) {
      if (result.requiresLogin) {
        localStorage.setItem('tempEmail', email);
        navigate('/login/password', { replace: true });
      } else {
        navigate('/create', { replace: true });
      }
    } else {
      setError(result.error || 'Ошибка регистрации');
    }

    setIsLoading(false);
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Регистрация</h1>
          <p className="auth-subtitle">Создайте аккаунт, чтобы начать вести бюджет</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <div className={`input-wrapper ${focusedField === 'name' ? 'input-focused' : ''}`}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                className="email-input"
                placeholder="Введите ваше имя"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div className="input-underline"></div>
          </div>

          <div className="input-group">
            <div className={`input-wrapper ${focusedField === 'email' ? 'input-focused' : ''}`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="email-input"
                placeholder="Введите ваш email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="input-underline"></div>
          </div>

          <div className="input-group">
            <div className={`input-wrapper ${focusedField === 'password' ? 'input-focused' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="email-input"
                placeholder="Придумайте пароль"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            <div className="input-underline"></div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт?{' '}
          <span className="auth-switch-link" onClick={() => navigate('/login')}>
            Войти
          </span>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
