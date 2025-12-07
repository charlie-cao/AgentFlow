import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// 简化的登录组件
const SimpleLogin = () => (
  <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
    <h1 style={{ color: '#3b82f6', marginBottom: '20px' }}>AgentFlow 登录</h1>
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>邮箱:</label>
      <input
        type="email"
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        placeholder="请输入邮箱"
      />
    </div>
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>密码:</label>
      <input
        type="password"
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        placeholder="请输入密码"
      />
    </div>
    <button
      style={{
        width: '100%',
        padding: '10px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      登录
    </button>
    <p style={{ marginTop: '15px', textAlign: 'center' }}>
      还没有账户？ <a href="/register" style={{ color: '#3b82f6' }}>立即注册</a>
    </p>
  </div>
)

// 简化的注册组件
const SimpleRegister = () => (
  <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
    <h1 style={{ color: '#3b82f6', marginBottom: '20px' }}>AgentFlow 注册</h1>
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>用户名:</label>
      <input
        type="text"
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        placeholder="请输入用户名"
      />
    </div>
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>邮箱:</label>
      <input
        type="email"
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        placeholder="请输入邮箱"
      />
    </div>
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '5px' }}>密码:</label>
      <input
        type="password"
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        placeholder="请输入密码"
      />
    </div>
    <button
      style={{
        width: '100%',
        padding: '10px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      注册
    </button>
    <p style={{ marginTop: '15px', textAlign: 'center' }}>
      已有账户？ <a href="/login" style={{ color: '#3b82f6' }}>立即登录</a>
    </p>
  </div>
)

function App() {
  return (
    <Routes>
      <Route path="/login" element={<SimpleLogin />} />
      <Route path="/register" element={<SimpleRegister />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App