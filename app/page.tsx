'use client';

import { useState, useEffect } from 'react';

interface Person {
  id: string;
  name: string;
  cardLastFour: string;
  billingDate: number;
  amount: number;
  isPaid: boolean;
}

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    cardLastFour: '',
    billingDate: '',
    amount: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('creditCardReminders');
    if (saved) {
      setPeople(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('creditCardReminders', JSON.stringify(people));
  }, [people]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cardLastFour || !formData.billingDate || !formData.amount) {
      alert('Please fill all fields');
      return;
    }

    const newPerson: Person = {
      id: Date.now().toString(),
      name: formData.name,
      cardLastFour: formData.cardLastFour,
      billingDate: parseInt(formData.billingDate),
      amount: parseFloat(formData.amount),
      isPaid: false
    };

    setPeople([...people, newPerson]);
    setFormData({ name: '', cardLastFour: '', billingDate: '', amount: '' });
  };

  const deletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const togglePaid = (id: string) => {
    setPeople(people.map(p =>
      p.id === id ? { ...p, isPaid: !p.isPaid } : p
    ));
  };

  const getDaysUntilDue = (billingDate: number): number => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let dueDate = new Date(currentYear, currentMonth, billingDate);

    if (currentDay > billingDate) {
      dueDate = new Date(currentYear, currentMonth + 1, billingDate);
    }

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getStatus = (person: Person) => {
    if (person.isPaid) return 'paid';
    const days = getDaysUntilDue(person.billingDate);
    if (days < 0) return 'overdue';
    if (days <= 5) return 'due-soon';
    return 'ok';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return '✓ Paid';
      case 'overdue': return '⚠ Overdue';
      case 'due-soon': return '⏰ Due Soon';
      default: return '✓ OK';
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>💳 Credit Card Bill Reminder</h1>
        <p>Track payment deadlines for multiple people</p>
      </div>

      <div className="add-person-form">
        <h2>Add New Person</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Card Last 4 Digits</label>
              <input
                type="text"
                value={formData.cardLastFour}
                onChange={(e) => setFormData({ ...formData, cardLastFour: e.target.value.slice(0, 4) })}
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div className="form-group">
              <label>Billing Date (Day of Month)</label>
              <select
                value={formData.billingDate}
                onChange={(e) => setFormData({ ...formData, billingDate: e.target.value })}
              >
                <option value="">Select date</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount Due</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Add Person</button>
        </form>
      </div>

      {people.length === 0 ? (
        <div className="empty-state">
          <h3>No people added yet</h3>
          <p>Add someone above to start tracking their credit card payments</p>
        </div>
      ) : (
        <div className="people-grid">
          {people.map(person => {
            const status = getStatus(person);
            const daysUntil = getDaysUntilDue(person.billingDate);

            return (
              <div key={person.id} className={`person-card ${status}`}>
                <div className="person-header">
                  <div className="person-name">{person.name}</div>
                  <button className="delete-btn" onClick={() => deletePerson(person.id)}>✕</button>
                </div>

                <div className="person-info">
                  <div className="info-row">
                    <span className="info-label">Card:</span>
                    <span className="info-value">•••• {person.cardLastFour}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Due Date:</span>
                    <span className="info-value">Day {person.billingDate} of month</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Amount:</span>
                    <span className="info-value amount">${person.amount.toFixed(2)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className={`status-badge ${status}`}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                </div>

                {!person.isPaid && (
                  <div className="days-remaining">
                    {daysUntil < 0
                      ? `${Math.abs(daysUntil)} days overdue!`
                      : daysUntil === 0
                      ? 'Due today!'
                      : `${daysUntil} days remaining`
                    }
                  </div>
                )}

                <button
                  className={`toggle-paid ${person.isPaid ? '' : 'unpaid'}`}
                  onClick={() => togglePaid(person.id)}
                >
                  {person.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
