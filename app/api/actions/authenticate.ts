'use server'

import { authenticator } from 'otplib'

// Hardcoded credentials (in a real app, these would be stored securely in a database)
const validUsername = 'admin7346'
const validPassword = "hs$@1k^da34&%>sf"
const totpSecret = "ZT5L4LKRJNWBQCPA2TCP5D4EPC7XGQLR"

interface AuthenticateParams {
  username: string
  password: string
  totpCode: string
}

export async function authenticate({ username, password, totpCode }: AuthenticateParams) {
  // Validate username
  if (username !== validUsername) {
    return { success: false, error: '用户名错误' }
  }
  
  // Validate password
  if (password !== validPassword) {
    return { success: false, error: '密码错误' }
  }
  
  // Validate TOTP code
  try {
    const isValid = authenticator.verify({ 
      token: totpCode, 
      secret: totpSecret 
    })
    
    if (!isValid) {
      return { success: false, error: '验证码错误或已过期' }
    }
  } catch (err) {
    return { success: false, error: '验证码格式错误' }
  }
  
  // If we get here, authentication was successful
  return { success: true }
}
