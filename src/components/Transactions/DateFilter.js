import React from 'react';
import styles from './DateFilter.module.css';

const DateFilter = ({ onFilterChange, selectedPeriod }) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const handleDateChange = (type, value) => {
    onFilterChange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.toggleButton}
        onClick={() => setShowFilters(!showFilters)}
      >
        Фильтры {showFilters ? '▲' : '▼'}
      </button>
      
      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>С</label>
            <input
              type="date"
              className={styles.input}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.label}>По</label>
            <input
              type="date"
              className={styles.input}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;