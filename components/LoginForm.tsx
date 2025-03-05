'use client'

import { useState } from 'react'
import { FaUser, FaLock, FaSignInAlt, FaShieldAlt } from 'react-icons/fa'
import { authenticate } from '@/app/api/actions/authenticate'

interface LoginFormProps {
  onLoginSuccess: () => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const isDevelopment = process.env.NODE_ENV === 'development'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset messages
    setError('')
    setSuccess('')
    setIsLoading(true)
    
    try {
      // Call server-side authentication
      const result = await authenticate({ username, password, totpCode })
      
      if (!result.success) {
        setError(result.error || '登录失败')
        setIsLoading(false)
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
    } catch (err) {
      setError('登录过程中发生错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">登录系统</h2>
        
        {isDevelopment && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 text-center">
            <p className="mb-2">开发环境模式</p>
            <button 
              onClick={onLoginSuccess}
              className="btn btn-warning w-full"
            >
              <FaSignInAlt className="mr-2" />
              跳过登录
            </button>
          </div>
        )}
        
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="totp" className="form-label">验证码</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">
                <FaShieldAlt />
              </span>
              <input
                type="text"
                id="totp"
                className="form-control pl-10"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="请输入6位验证码"
                maxLength={6}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            <FaSignInAlt className="mr-2" />
            {isLoading ? '登录中...' : '登录'}
          </button>
          
          <div className="text-center mt-4 text-gray-500 text-xs">
            v{process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1'}
          </div>
        </form>
      </div>
    </div>
  )
}
