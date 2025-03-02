'use client'

import { useState, useEffect } from 'react'
import { FaPlus, FaTrash } from 'react-icons/fa'
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
    setSender('')
    setReceiver('')
    // Don't reset time to keep the current time
    setContent('')
    setIsEditing(false)
    onCancelEdit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center">
          <label htmlFor="sender" className="w-16 text-sm font-medium text-gray-700">发送者:</label>
          <input
            type="text"
            id="sender"
            className="form-control flex-1"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center">
          <label htmlFor="receiver" className="w-16 text-sm font-medium text-gray-700">接收者:</label>
          <input
            type="text"
            id="receiver"
            className="form-control flex-1"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <label htmlFor="time" className="w-16 text-sm font-medium text-gray-700">时间:</label>
        <input
          type="datetime-local"
          id="time"
          className="form-control flex-1"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>
      
      <div className="flex items-start">
        <label htmlFor="content" className="w-16 text-sm font-medium text-gray-700 pt-2">内容:</label>
        <textarea
          id="content"
          className="form-control flex-1 min-h-[80px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
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
