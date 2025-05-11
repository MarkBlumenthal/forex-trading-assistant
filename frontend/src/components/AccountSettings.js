import React, { useState } from 'react';

const AccountSettings = ({ settings, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...settings });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      accountBalance: parseFloat(formData.accountBalance),
      monthlyTarget: parseFloat(formData.monthlyTarget)
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="account-settings">
        <h3>Account Settings</h3>
        <div className="settings-display">
          <p>Account Balance: £{settings.accountBalance}</p>
          <p>Monthly Target: £{settings.monthlyTarget}</p>
          <button onClick={() => setIsEditing(true)}>Edit Settings</button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-settings">
      <h3>Account Settings</h3>
      <form onSubmit={handleSubmit} className="settings-form">
        <div>
          <label>Account Balance (£):</label>
          <input
            type="number"
            value={formData.accountBalance}
            onChange={(e) => setFormData({ ...formData, accountBalance: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Monthly Target (£):</label>
          <input
            type="number"
            value={formData.monthlyTarget}
            onChange={(e) => setFormData({ ...formData, monthlyTarget: e.target.value })}
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;