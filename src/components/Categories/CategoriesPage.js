import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Budget/Header/Header';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleNavigateToMain = () => {
    navigate('/');
  };

  const handleNavigateToCreateCategory = () => {
    navigate('/categories/create');
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const categories = [
    { name: "Транспорт", twoLines: false, icon: "🚗" },
    { name: "Музыкальные инструменты", twoLines: true, icon: "🎸" },
    { name: "Продукты", twoLines: false, icon: "🍎" },
    { name: "Рестораны", twoLines: false, icon: "🍽️" },
    { name: "Развлечения", twoLines: false, icon: "🎭" },
    { name: "Одежда", twoLines: false, icon: "👕" },
    { name: "Здоровье", twoLines: false, icon: "🏥" },
    { name: "Образование", twoLines: false, icon: "📚" },
    { name: "Путешествия", twoLines: false, icon: "✈️" },
    { name: "Коммунальные услуги", twoLines: true, icon: "🏠" },
    { name: "Техника", twoLines: false, icon: "💻" },
    { name: "Подарки", twoLines: false, icon: "🎁" },
  ];

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="categories-page">
      <Header />
      
      <main className="categories-main">
        <div className="categories-main__header">
          <button onClick={handleNavigateToMain} className="back-button">
            <svg className="back-button__icon" width="9" height="12" viewBox="0 0 9 12" fill="none">
              <path d="M1.67066 4.22857L3.66467 2.66094L7.38323 0L9 0.203795L1.67066 6.08951L9 11.6324L7.38323 12L2.85629 9.00379L0 6.08951L1.67066 4.22857Z" fill="black" fillOpacity="0.5"/>
            </svg>
            <span className="back-button__text">Назад</span>
          </button>
        </div>
                  <h1 className="categories-main__title">Категории вашего бюджета</h1>

        <div className="categories-main__content">
          <div className="search-section">
            <div className="search-bar">
              <svg className="search-bar__icon" width="18" height="19" viewBox="0 0 18 19" fill="none">
                <path d="M11.5 12L16.75 17.5M7.125 13.8333C3.74226 13.8333 1 10.9605 1 7.41667C1 3.87284 3.74226 1 7.125 1C10.5077 1 13.25 3.87284 13.25 7.41667C13.25 10.9605 10.5077 13.8333 7.125 13.8333Z" stroke="#969CA4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text" 
                className="search-bar__input" 
                placeholder="Название категории"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="search-results">
              Найдено: {filteredCategories.length} категорий
              {selectedCategories.length > 0 && ` • Выбрано: ${selectedCategories.length}`}
            </div>
          </div>
          
          <div className="categories-grid">
            {filteredCategories.map((category, index) => (
              <div 
                key={index} 
                className={`category-item ${selectedCategories.includes(category.name) ? 'category-item--selected' : ''}`}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="category-item__content">
                  <span className={`category-item__name ${category.twoLines ? 'category-item__name--two-lines' : ''}`}>
                    {category.name}
                  </span>
                  <div className="category-item__icon">
                    <div className="icon-wrapper">
                      <div className="icon-content">
                        {category.icon}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="create-category-container">
            <button onClick={handleNavigateToCreateCategory} className="create-category-btn">
              <span className="create-category-btn__plus">+</span>
              Создать свою категорию
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CategoriesPage;