'use client'

import { useState } from 'react'
import { FaUser, FaLock, FaSignInAlt, FaShieldAlt } from 'react-icons/fa'
import { authenticator } from 'otplib'

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Hardcoded credentials (in a real app, this would be validated on the server)
  const validUsername = 'admin7346'
  const validPassword = "hs$@1k^da34&%>sf"
  const totpSecret = "ZT5L4LKRJNWBQCPA2TCP5D4EPC7XGQLR"

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset messages
    setError('')
    setSuccess('')
    
    // Validate username
    if (username !== validUsername) {
      setError('用户名错误')
      return
    }
    
    // Validate password
    if (password !== validPassword) {
      setError('密码错误')
      return
    }
    
    // Validate TOTP code
    try {
      const isValid = authenticator.verify({ 
        token: totpCode, 
        secret: totpSecret 
      })
      
      if (!isValid) {
        setError('验证码错误或已过期')
        return
      }
    } catch (err) {
      setError('验证码格式错误')
      return
    }
    
    // Login successful
    setSuccess('登录成功，正在跳转...')
    
    // Store login state in session storage
    sessionStorage.setItem('isLoggedIn', 'true')
    
    // Notify parent component
    setTimeout(() => {
      onLoginSuccess()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">登录系统</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
            {success}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="form-label">用户名</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">
                <FaUser />
              </span>
              <input
                type="text"
                id="username"
                className="form-control pl-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="form-label">密码</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">
                <FaLock />
              </span>
              <input
                type="password"
                id="password"
                className="form-control pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="totpCode" className="form-label">验证码</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">
                <FaShieldAlt />
              </span>
              <input
                type="text"
                id="totpCode"
                className="form-control pl-10"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="请输入6位验证码"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              请输入您的身份验证器应用中显示的6位验证码
            </p>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full"
          >
            <FaSignInAlt />
            登录
          </button>
        </form>
      </div>
    </div>
  )
}
