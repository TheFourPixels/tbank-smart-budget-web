import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Budget/Header/Header';
import './CreateCategoryPage.css';

const CreateCategoryPage = () => {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/categories');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const categoryData = {
      name: formData.get('name'),
      description: formData.get('description'),
      limit: formData.get('limit')
    };
    console.log('Создаем категорию:', categoryData);
    navigate('/categories');
  };

  return (
    <div className="create-category-page">
      <Header />
      
      <main className="create-category-main">
        <div className="create-category-main__header">
          <button onClick={handleNavigateBack} className="back-button">
            <svg className="back-button__icon" width="9" height="12" viewBox="0 0 9 12" fill="none">
              <path d="M1.67066 4.22857L3.66467 2.66094L7.38323 0L9 0.203795L1.67066 6.08951L9 11.6324L7.38323 12L2.85629 9.00379L0 6.08951L1.67066 4.22857Z" fill="black" fillOpacity="0.5"/>
            </svg>
            <span className="back-button__text">Назад</span>
          </button>
        </div>
        
        <div className="create-category-card">
          <h2 className="create-category-card__title">Создать категорию</h2>
          
          <form className="create-category-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                className="input-field input-field--full"
                placeholder="Название категории"
                required
              />
            </div>
            
            <div className="form-group">
              <textarea
                name="description"
                className="input-field input-field--full input-field--textarea"
                placeholder="Описание категории"
                rows={4}
                required
              />
            </div>
        {/* 
            <div className="form-group">
              <input
                type="number"
                name="limit"
                className="input-field input-field--half"
                placeholder="Лимит расходов"
                required
              />
            </div>
        */} 
            <div className="form-actions">
              <button type="submit" className="create-button">
                Создать
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateCategoryPage;