import React, { useState, useEffect } from 'react'
import { generatePassword, calculatePasswordStrength, getStrengthLabel, copyToClipboard } from './utils/passwordGenerator'
import './App.css'

function App() {
  const [password, setPassword] = useState('')
  const [strength, setStrength] = useState({ score: 0, level: 'weak', feedback: [] })
  const [copied, setCopied] = useState(false)
  
  // 密码生成选项
  const [options, setOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  })

  // 初始化时生成密码
  useEffect(() => {
    generateNewPassword()
  }, [])

  // 当选项改变时重新生成密码
  useEffect(() => {
    generateNewPassword()
  }, [options])

  // 生成新密码
  const generateNewPassword = () => {
    try {
      const newPassword = generatePassword(options)
      setPassword(newPassword)
      const strengthInfo = calculatePasswordStrength(newPassword)
      setStrength(strengthInfo)
    } catch (error) {
      console.error('生成密码失败:', error)
    }
  }

  // 处理选项改变
  const handleOptionChange = (key, value) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // 处理长度改变
  const handleLengthChange = (e) => {
    const length = parseInt(e.target.value) || 16
    handleOptionChange('length', Math.max(4, Math.min(128, length)))
  }

  // 复制密码
  const handleCopy = async () => {
    if (!password) return
    
    const success = await copyToClipboard(password)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 获取强度颜色
  const getStrengthColor = () => {
    switch (strength.level) {
      case 'very-strong':
        return '#10b981' // green
      case 'strong':
        return '#3b82f6' // blue
      case 'medium':
        return '#f59e0b' // amber
      case 'weak':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">🔐 密码生成器</h1>
          <p className="subtitle">安全、快速、可自定义的随机密码生成工具</p>
        </header>

        <main className="main-content">
          {/* 密码显示区域 */}
          <div className="password-display">
            <div className="password-box">
              <input
                type="text"
                value={password}
                readOnly
                className="password-input"
                id="password-input"
              />
              <button
                onClick={handleCopy}
                className={`copy-button ${copied ? 'copied' : ''}`}
                aria-label="复制密码"
              >
                {copied ? '✓ 已复制' : '📋 复制'}
              </button>
            </div>

            {/* 密码强度指示器 */}
            <div className="strength-indicator">
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${strength.score}%`,
                    backgroundColor: getStrengthColor()
                  }}
                />
              </div>
              <div className="strength-info">
                <span className="strength-label">
                  强度: <strong style={{ color: getStrengthColor() }}>
                    {getStrengthLabel(strength.level)}
                  </strong>
                </span>
                <span className="strength-score">{strength.score}/100</span>
              </div>
            </div>

            {/* 安全建议 */}
            {strength.feedback.length > 0 && (
              <div className="feedback">
                <p className="feedback-title">💡 安全建议：</p>
                <ul className="feedback-list">
                  {strength.feedback.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 配置面板 */}
          <div className="config-panel">
            <h2 className="config-title">⚙️ 密码配置</h2>

            {/* 长度设置 */}
            <div className="config-item">
              <label className="config-label">
                <span>密码长度: <strong>{options.length}</strong></span>
              </label>
              <input
                type="range"
                min="4"
                max="128"
                value={options.length}
                onChange={handleLengthChange}
                className="length-slider"
              />
              <div className="length-hint">
                <span>4</span>
                <span>128</span>
              </div>
            </div>

            {/* 字符类型选择 */}
            <div className="config-item">
              <label className="config-label">字符类型：</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.includeUppercase}
                    onChange={(e) => handleOptionChange('includeUppercase', e.target.checked)}
                  />
                  <span>大写字母 (A-Z)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.includeLowercase}
                    onChange={(e) => handleOptionChange('includeLowercase', e.target.checked)}
                  />
                  <span>小写字母 (a-z)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.includeNumbers}
                    onChange={(e) => handleOptionChange('includeNumbers', e.target.checked)}
                  />
                  <span>数字 (0-9)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.includeSymbols}
                    onChange={(e) => handleOptionChange('includeSymbols', e.target.checked)}
                  />
                  <span>特殊字符 (!@#$%...)</span>
                </label>
              </div>
            </div>

            {/* 高级选项 */}
            <div className="config-item">
              <label className="config-label">高级选项：</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) => handleOptionChange('excludeSimilar', e.target.checked)}
                  />
                  <span>排除相似字符 (0/O, 1/l/I)</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={options.excludeAmbiguous}
                    onChange={(e) => handleOptionChange('excludeAmbiguous', e.target.checked)}
                  />
                  <span>排除歧义字符</span>
                </label>
              </div>
            </div>

            {/* 重新生成按钮 */}
            <button
              onClick={generateNewPassword}
              className="generate-button"
            >
              🔄 重新生成
            </button>
          </div>
        </main>

        <footer className="footer">
          <p>🔒 所有密码在您的浏览器中本地生成，不会发送到任何服务器</p>
          <p>使用 Web Crypto API 确保密码的加密安全性</p>
        </footer>
      </div>
    </div>
  )
}

export default App
