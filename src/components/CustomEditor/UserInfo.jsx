import React, { useState } from 'react';
import './UserInfo.css';

function UserInfo({ username, onUsernameChange, userColor, onColorChange }) {
  const [inputValue, setInputValue] = useState(username);

  // 处理用户名提交
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onUsernameChange(inputValue.trim());
    }
  };

  // 处理颜色变更
  const handleColorChange = (e) => {
    onColorChange(e.target.value);
  };

  return (
    <div className="user-info-container">
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="username">用户名:</label>
          <input
            type="text"
            id="username"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="请输入您的用户名"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userColor">选择颜色:</label>
          <input
            type="color"
            id="userColor"
            value={userColor}
            onChange={handleColorChange}
          />
        </div>
        <button type="submit" className="submit-button">
          {username ? '更新' : '开始编辑'}
        </button>
      </form>
      {username && (
        <div className="current-user-info">
          <span>当前用户: </span>
          <span style={{ color: userColor }}>{username}</span>
        </div>
      )}
    </div>
  );
}

export default UserInfo;