'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaTrash, FaExchangeAlt, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa'
import { Message } from '@/types/message'
import { validateUser } from '@/app/api/actions/validateUser'

interface MessageFormProps {
  onAddMessage: (message: Message) => void
  editMessage: Message | null
  onCancelEdit: () => void
}

export default function MessageForm({ onAddMessage, editMessage, onCancelEdit }: MessageFormProps) {
  const [sender, setSender] = useState('')
  const [receiver, setReceiver] = useState('')
  const [time, setTime] = useState('')
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  
  // Validation states
  const [isSenderValid, setIsSenderValid] = useState<boolean | null>(null)
  const [isReceiverValid, setIsReceiverValid] = useState<boolean | null>(null)
  const [isValidatingSender, setIsValidatingSender] = useState(false)
  const [isValidatingReceiver, setIsValidatingReceiver] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Set default time to current time
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    
    setTime(`${year}-${month}-${day}T${hours}:${minutes}`)
  }, [])

  // Handle edit message
  useEffect(() => {
    if (editMessage) {
      setSender(editMessage.sender)
      setReceiver(editMessage.receiver)
      setTime(editMessage.time)
      setContent(editMessage.content)
      setIsEditing(true)
      
      // Reset validation states when editing
      setIsSenderValid(null)
      setIsReceiverValid(null)
    }
  }, [editMessage])
  
  // Validate sender when it changes
  const validateSender = async () => {
    if (!sender.trim()) return
    
    setIsValidatingSender(true)
    setIsSenderValid(null)
    setValidationError('')
    
    try {
      const result = await validateUser(sender)
      setIsSenderValid(result.exists)
      
      if (!result.exists) {
        setValidationError(`发送者 ${sender} 不存在`)
      }
    } catch (error) {
      setIsSenderValid(false)
      setValidationError('验证发送者时出错')
      console.error('Error validating sender:', error)
    } finally {
      setIsValidatingSender(false)
    }
  }
  
  // Validate receiver when it changes
  const validateReceiver = async () => {
    if (!receiver.trim()) return
    
    setIsValidatingReceiver(true)
    setIsReceiverValid(null)
    setValidationError('')
    
    try {
      const result = await validateUser(receiver)
      setIsReceiverValid(result.exists)
      
      if (!result.exists) {
        setValidationError(`接收者 ${receiver} 不存在`)
      }
    } catch (error) {
      setIsReceiverValid(false)
      setValidationError('验证接收者时出错')
      console.error('Error validating receiver:', error)
    } finally {
      setIsValidatingReceiver(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!sender || !receiver || !time || !content) {
      alert('请填写所有必填字段')
      return
    }
    
    // Validate sender and receiver if not already validated
    if (isSenderValid === null) {
      await validateSender()
    }
    
    if (isReceiverValid === null) {
      await validateReceiver()
    }
    
    // Check if validation failed
    if (isSenderValid === false || isReceiverValid === false) {
      return
    }
    
    // Calculate Unix timestamp on client side
    const unixTimestamp = Math.floor(new Date(time).getTime() / 1000)
    
    // Create message object
    const message: Message = {
      id: editMessage?.id || Date.now().toString(),
      sender,
      receiver,
      time,
      unixTimestamp,
      content,
      status: 'pending',
      verificationStatus: undefined,
      sentMessageId: undefined
    }
    
    // Add to list
    onAddMessage(message)
    
    // Reset form
    clearForm()
  }

  const clearForm = () => {
    // Don't reset sender and receiver anymore
    // setSender('')
    // setReceiver('')
    // Don't reset time to keep the current time
    setContent('')
    setIsEditing(false)
    onCancelEdit()
    
    // Reset validation states
    setValidationError('')
  }

  const handleSwapSenderReceiver = () => {
    const tempSender = sender;
    setSender(receiver);
    setReceiver(tempSender);
    
    // Swap validation states
    const tempSenderValid = isSenderValid;
    setIsSenderValid(isReceiverValid);
    setIsReceiverValid(tempSenderValid);
  }
  
  // Get validation icon for input
  const getValidationIcon = (isValid: boolean | null, isValidating: boolean) => {
    if (isValidating) {
      return <FaSpinner className="animate-spin text-blue-500" size={14} />;
    } else if (isValid === true) {
      return <FaCheck className="text-green-500" size={14} />;
    } else if (isValid === false) {
      return <FaTimes className="text-red-500" size={14} />;
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {validationError && (
        <div className="bg-red-100 text-red-700 p-2 rounded text-sm mb-2">
          {validationError}
        </div>
      )}
      
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-3">
        <div className="flex items-center">
          <label htmlFor="sender-desktop" className="w-16 text-sm font-medium text-gray-700">发送者:</label>
          <div className="relative flex-1">
            <input
              type="text"
              id="sender-desktop"
              className={`form-control w-full pr-8 ${
                isSenderValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                isSenderValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : ''
              }`}
              value={sender}
              onChange={(e) => {
                setSender(e.target.value)
                setIsSenderValid(null)
              }}
              onBlur={validateSender}
              required
            />
            {sender && (
              <span className="absolute right-2 top-2.5">
                {getValidationIcon(isSenderValid, isValidatingSender)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleSwapSenderReceiver}
            className="btn btn-sm btn-outline-secondary mr-2"
            title="交换发送者/接收者"
          >
            <FaExchangeAlt size={14} />
          </button>
          <label htmlFor="receiver-desktop" className="w-16 text-sm font-medium text-gray-700">接收者:</label>
          <div className="relative flex-1">
            <input
              type="text"
              id="receiver-desktop"
              className={`form-control w-full pr-8 ${
                isReceiverValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                isReceiverValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : ''
              }`}
              value={receiver}
              onChange={(e) => {
                setReceiver(e.target.value)
                setIsReceiverValid(null)
              }}
              onBlur={validateReceiver}
              required
            />
            {receiver && (
              <span className="absolute right-2 top-2.5">
                {getValidationIcon(isReceiverValid, isValidatingReceiver)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex md:items-center">
        <label htmlFor="time-desktop" className="w-16 text-sm font-medium text-gray-700">时间:</label>
        <input
          type="datetime-local"
          id="time-desktop"
          className="form-control flex-1"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>
      
      <div className="hidden md:flex md:items-start">
        <label htmlFor="content-desktop" className="w-16 text-sm font-medium text-gray-700 pt-2">内容:</label>
        <textarea
          id="content-desktop"
          className="form-control flex-1 min-h-[80px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      
      {/* Mobile layout */}
      <div className="md:hidden space-y-2">
        <div>
          <label htmlFor="sender-mobile" className="block text-xs font-medium text-gray-700 mb-1">发送者:</label>
          <div className="relative">
            <input
              type="text"
              id="sender-mobile"
              className={`form-control text-sm pr-8 ${
                isSenderValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                isSenderValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : ''
              }`}
              value={sender}
              onChange={(e) => {
                setSender(e.target.value)
                setIsSenderValid(null)
              }}
              onBlur={validateSender}
              required
            />
            {sender && (
              <span className="absolute right-2 top-2.5">
                {getValidationIcon(isSenderValid, isValidatingSender)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSwapSenderReceiver}
            className="btn btn-xs btn-outline-secondary"
            title="交换发送者/接收者"
          >
            <FaExchangeAlt size={12} />
          </button>
          
          <div className="flex-1">
            <label htmlFor="receiver-mobile" className="block text-xs font-medium text-gray-700 mb-1">接收者:</label>
            <div className="relative">
              <input
                type="text"
                id="receiver-mobile"
                className={`form-control text-sm pr-8 ${
                isReceiverValid === false ? 'border-red-300 focus:ring-red-500 focus:border-red-500' :
                isReceiverValid === true ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : ''
              }`}
                value={receiver}
                onChange={(e) => {
                  setReceiver(e.target.value)
                  setIsReceiverValid(null)
                }}
                onBlur={validateReceiver}
                required
              />
              {receiver && (
                <span className="absolute right-2 top-2.5">
                  {getValidationIcon(isReceiverValid, isValidatingReceiver)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="time-mobile" className="block text-xs font-medium text-gray-700 mb-1">时间:</label>
          <input
            type="datetime-local"
            id="time-mobile"
            className="form-control text-sm"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="content-mobile" className="block text-xs font-medium text-gray-700 mb-1">内容:</label>
          <textarea
            id="content-mobile"
            className="form-control text-sm min-h-[60px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={clearForm}
          className="btn btn-sm btn-secondary flex-1"
        >
          <FaTrash size={12} className="mr-1" />
          清空
        </button>
        
        <button
          type="submit"
          className="btn btn-sm btn-success flex-1"
          disabled={isValidatingSender || isValidatingReceiver}
        >
          {(isValidatingSender || isValidatingReceiver) ? (
            <FaSpinner size={12} className="mr-1 animate-spin" />
          ) : (
            <FaPlus size={12} className="mr-1" />
          )}
          {isEditing ? '更新' : '添加'}
        </button>
      </div>
    </form>
  )
}
