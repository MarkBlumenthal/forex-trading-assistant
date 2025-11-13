import React, { useState } from 'react';

const AccountSettings = ({ settings, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...settings });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      accountBalance: parseFloat(formData.accountBalance),
      targetProfit: parseFloat(formData.targetProfit)
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="account-settings">
        <h3>Account Settings</h3>
        <div className="settings-display">
          <p>Account Balance: £{settings.accountBalance}</p>
          <p>Target Profit per Trade: £{settings.targetProfit}</p>
          <button
  className="edit-settings-button"
  onClick={() => setIsEditing(true)}
>
  Edit Settings
</button>

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
          <label>Target Profit per Trade (£):</label>
          <input
            type="number"
            value={formData.targetProfit}
            onChange={(e) => setFormData({ ...formData, targetProfit: e.target.value })}
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