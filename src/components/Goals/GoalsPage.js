import React, { useState, useEffect } from 'react';
import { goalService } from '../../services/goalService';
import { goalApiService } from '../../services/ApiService';
import Header from '../Budget/Header/Header';
import './GoalsPage.css';

const GoalCard = ({ goal, onContribute, onDelete }) => {
  const current = goal.savedAmount || goal.currentAmount || 0;
  const target = goal.targetAmount || 0;

  const progress =
    goal.progressPercent !== undefined
      ? goal.progressPercent
      : target
      ? Math.min((current / target) * 100, 100)
      : 0;

  const daysLeft =
    goal.daysLeft !== undefined
      ? goal.daysLeft > 0
        ? `${goal.daysLeft} дней`
        : 'Завершено'
      : '—';

  const recommendPerMonth =
    goal.recommendedMonthly !== undefined ? goal.recommendedMonthly : 0;

  return (
    <div className="goal-card">
      

      <div className="goal-money">
        <strong>{current.toLocaleString('ru-RU')} ₽</strong>
        <span> из {target.toLocaleString('ru-RU')} ₽</span>
      </div>

      <div className="progress-wrapper">
        <div className="progress-line" style={{ width: `${progress}%` }} />
      </div>

      <div className="goal-meta">
        <div className="goal-meta-item">
          <span>Дедлайн</span>
          <strong>
            {goal.deadline ? new Date(goal.deadline).toLocaleDateString('ru-RU') : '—'}
          </strong>
        </div>

        <div className="goal-meta-item">
          <span>Осталось</span>
          <strong>{daysLeft}</strong>
        </div>
      </div>

      {recommendPerMonth > 0 && (
        <div className="goal-recommendation">
          Рекомендуем откладывать{' '}
          <strong>{recommendPerMonth.toLocaleString('ru-RU')} ₽ / мес</strong>
        </div>
      )}

      <div className="goal-actions">
        <button className="goal-button" onClick={() => onContribute(goal.id)}>
          Пополнить
        </button>
        <button className="goal-button goal-button--delete" onClick={() => onDelete(goal.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
};

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    deadline: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      goalApiService.setAuthToken(token);
    }
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalService.getAllGoals();
      const mergedGoals = [...(data.active || []), ...(data.completed || [])];
      setGoals(mergedGoals);
    } catch (error) {
      console.error('Ошибка загрузки целей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      if (!formData.name || !formData.targetAmount || !formData.deadline) {
        alert('Заполните все поля');
        return;
      }

      await goalService.createGoal({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        deadline: formData.deadline
      });

      setFormData({ name: '', targetAmount: '', deadline: '' });
      await loadGoals();
    } catch (error) {
      console.error('Ошибка создания цели:', error);
      alert('Не удалось создать цель');
    }
  };

  const handleContribute = async (goalId) => {
    const amount = prompt('Введите сумму пополнения');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    try {
      await goalService.contributeToGoal(goalId, Number(amount));
      await loadGoals();
    } catch (error) {
      console.error('Ошибка пополнения цели:', error);
      alert('Не удалось пополнить цель');
    }
  };

  const handleDelete = async (goalId) => {
    try {
      await goalService.deleteGoal(goalId);
      await loadGoals();
    } catch (error) {
      console.error('Ошибка удаления цели:', error);
      alert('Не удалось удалить цель');
    }
  };

  return (
    <div className="goals-page">
      <Header />

      <div className="content">
        <div className="create-goal-card">
          <h2>Создать цель</h2>

          <div className="form-grid">
            <input
              type="text"
              placeholder="Название цели"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <input
              type="number"
              placeholder="Сумма"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            />

            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <button className="create-button" onClick={handleCreateGoal}>
            Создать цель
          </button>
        </div>

        <section className="goals-section">
          <div className="section-header">
            <h2>Ваши цели</h2>
            <span>{goals.length} целей</span>
          </div>

          {loading ? (
            <div className="empty-state">Загрузка...</div>
          ) : goals.length === 0 ? (
            <div className="empty-state">У вас пока нет целей</div>
          ) : (
            <div className="goals-grid">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onContribute={handleContribute}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}