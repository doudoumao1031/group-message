'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaTrash, FaExchangeAlt } from 'react-icons/fa'
import { Message } from '@/types/message'

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
    }
  }, [editMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!sender || !receiver || !time || !content) {
      alert('请填写所有必填字段')
      return
    }
    
    // Create message object
    const message: Message = {
      id: editMessage?.id || Date.now().toString(),
      sender,
      receiver,
      time,
      content,
      status: 'pending'
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
  }

  const handleSwapSenderReceiver = () => {
    const tempSender = sender;
    setSender(receiver);
    setReceiver(tempSender);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-3">
        <div className="flex items-center">
          <label htmlFor="sender-desktop" className="w-16 text-sm font-medium text-gray-700">发送者:</label>
          <input
            type="text"
            id="sender-desktop"
            className="form-control flex-1"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center">
          <label htmlFor="receiver-desktop" className="w-16 text-sm font-medium text-gray-700">接收者:</label>
          <input
            type="text"
            id="receiver-desktop"
            className="form-control flex-1"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="hidden md:flex md:justify-end">
        <button
          type="button"
          onClick={handleSwapSenderReceiver}
          className="btn btn-sm btn-outline-secondary"
        >
          <FaExchangeAlt size={12} className="mr-1" />
          交换发送者/接收者
        </button>
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
        <div className="form-group">
          <label htmlFor="sender-mobile" className="block text-xs font-medium text-gray-700 mb-1">发送者:</label>
          <input
            type="text"
            id="sender-mobile"
            className="form-control text-sm"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="receiver-mobile" className="block text-xs font-medium text-gray-700 mb-1">接收者:</label>
          <input
            type="text"
            id="receiver-mobile"
            className="form-control text-sm"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSwapSenderReceiver}
            className="btn btn-sm btn-outline-secondary"
          >
            <FaExchangeAlt size={12} className="mr-1" />
            交换
          </button>
        </div>
        
        <div className="form-group">
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
        
        <div className="form-group">
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
        >
          <FaPlus size={12} className="mr-1" />
          {isEditing ? '更新' : '添加'}
        </button>
      </div>
    </form>
  )
}
