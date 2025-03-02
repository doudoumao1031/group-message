'use client'

import { useState, useEffect, useTransition } from 'react'
import LoginForm from '@/components/LoginForm'
import MessageForm from '@/components/MessageForm'
import MessageList from '@/components/MessageList'
import ClientComponent from '@/components/ClientComponent'
import { Message } from '@/types/message'
import { FaSignOutAlt, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa'
import { sendMessage } from './api/actions/sendMessage'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [editMessage, setEditMessage] = useState<Message | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 })
  // React 19 useTransition hook for smoother UI updates
  const [isPending, startTransition] = useTransition()
  // Modal state for clear confirmation
  const [showClearModal, setShowClearModal] = useState(false)
  
  // Check login status on mount
  useEffect(() => {
    const loginStatus = sessionStorage.getItem('isLoggedIn')
    if (loginStatus === 'true') {
      setIsLoggedIn(true)
    }
    
    // Load messages from localStorage
    const savedMessages = localStorage.getItem('messages')
    if (savedMessages) {
      try {
        startTransition(() => {
          setMessages(JSON.parse(savedMessages))
        })
      } catch (error) {
        console.error('Failed to parse saved messages:', error)
      }
    }
  }, [])
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('messages', JSON.stringify(messages))
    } else {
      localStorage.removeItem('messages') // Remove item when empty
    }
  }, [messages])
  
  // Handle login success
  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }
  
  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn')
    setIsLoggedIn(false)
  }
  
  // Add or update message
  const handleAddMessage = (message: Message) => {
    startTransition(() => {
      setMessages(prev => {
        // Check if message already exists (edit mode)
        const exists = prev.some(msg => msg.id === message.id)
        
        if (exists) {
          // Update existing message
          return prev.map(msg => 
            msg.id === message.id ? message : msg
          )
        } else {
          // Add new message
          return [...prev, message]
        }
      })
    })
    
    // Reset edit mode
    setEditMessage(null)
  }
  
  // Edit message
  const handleEditMessage = (message: Message) => {
    setEditMessage(message)
  }
  
  // Cancel edit
  const handleCancelEdit = () => {
    setEditMessage(null)
  }
  
  // Delete message
  const handleDeleteMessage = (id: string) => {
    if (confirm('确定要删除这条消息吗？')) {
      startTransition(() => {
        setMessages(prev => prev.filter(msg => msg.id !== id))
      })
    }
  }
  
  // Show clear confirmation modal
  const handleShowClearModal = () => {
    if (messages.length === 0) {
      return;
    }
    setShowClearModal(true);
  }
  
  // Clear all messages
  const handleClearAll = () => {
    startTransition(() => {
      setMessages([]);
    });
    setShowClearModal(false);
  }
  
  // Cancel clear operation
  const handleCancelClear = () => {
    setShowClearModal(false);
  }
  
  // Send a specific message
  const handleSendMessage = async (id: string) => {
    const message = messages.find(msg => msg.id === id)
    if (!message) return
    
    // Update status to pending
    startTransition(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: 'pending' } : msg
      ))
    })
    
    // Send message using server action
    const success = await sendMessage(message)
    
    // Update status based on result
    startTransition(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: success ? 'sent' : 'failed' } : msg
      ))
    })
  }
  
  // Send all messages
  const handleSendAll = async () => {
    // Filter messages that are not already sent
    const pendingMessages = messages.filter(msg => msg.status !== 'sent')
    
    if (pendingMessages.length === 0) {
      alert('没有待发送的消息')
      return
    }
    
    if (!confirm(`确定要发送全部 ${pendingMessages.length} 条消息吗？`)) {
      return
    }
    
    // Set sending state
    setIsSending(true)
    setSendProgress({ current: 0, total: pendingMessages.length })
    
    // Send messages one by one
    for (let i = 0; i < pendingMessages.length; i++) {
      const message = pendingMessages[i]
      
      // Update progress
      setSendProgress({ current: i + 1, total: pendingMessages.length })
      
      // Send message using server action
      const success = await sendMessage(message)
      
      // Update status
      startTransition(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: success ? 'sent' : 'failed' } : msg
        ))
      })
      
      // Add a small delay between requests to avoid rate limiting
      if (i < pendingMessages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    // Reset sending state
    setIsSending(false)
  }
  
  // Import messages from JSON file
  const handleImportMessages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedMessages = JSON.parse(event.target?.result as string)
        
        if (Array.isArray(importedMessages)) {
          // Validate imported messages
          const validMessages = importedMessages.filter(msg => 
            msg.id && msg.sender && msg.receiver && msg.time && msg.content
          )
          
          if (validMessages.length > 0) {
            startTransition(() => {
              setMessages(validMessages)
            })
            alert(`成功导入 ${validMessages.length} 条消息`)
          } else {
            alert('导入的文件不包含有效的消息数据')
          }
        } else {
          alert('导入的文件格式不正确')
        }
      } catch (error) {
        alert('导入失败：文件格式错误')
        console.error('Import error:', error)
      }
    }
    
    reader.readAsText(file)
    
    // Reset file input
    e.target.value = ''
  }
  
  // Export messages to JSON file
  const handleExportMessages = () => {
    if (messages.length === 0) {
      alert('没有消息可导出')
      return
    }
    
    const dataStr = JSON.stringify(messages, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`
    
    const exportFileName = `messages_${new Date().toISOString().slice(0, 10)}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileName)
    linkElement.click()
  }

  // Update a message (for ClientComponent demo)
  const handleUpdateMessage = (message: Message) => {
    startTransition(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? message : msg
      ))
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="container mx-auto px-2 py-3 max-w-5xl">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold text-gray-800">消息发送系统</h1>
            
            <button
              onClick={handleLogout}
              className="btn btn-xs btn-outline-danger"
            >
              <FaSignOutAlt className="mr-1" size={10} />
              退出
            </button>
          </div>
          
          {isSending && (
            <div className="bg-blue-50 text-blue-700 p-2 rounded mb-2 text-sm">
              <div className="flex justify-between mb-1">
                <span>正在发送消息...</span>
                <span>{sendProgress.current} / {sendProgress.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Message Form Section */}
          <div className="bg-white rounded shadow-sm p-3 mb-2">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-semibold">创建消息</h2>
              {editMessage && (
                <span className="text-xs text-blue-600">编辑模式</span>
              )}
            </div>
            <MessageForm 
              onAddMessage={handleAddMessage}
              editMessage={editMessage}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          
          {/* Message List Section */}
          <div className="bg-white rounded shadow-sm p-3">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-base font-semibold">消息列表</h2>
              <div className="flex gap-1">
                <label className="btn btn-xs btn-secondary">
                  导入JSON
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportMessages} 
                    className="hidden" 
                  />
                </label>
                <button 
                  onClick={handleExportMessages}
                  className="btn btn-xs btn-secondary"
                  disabled={messages.length === 0}
                >
                  导出JSON
                </button>
                <button 
                  onClick={handleShowClearModal}
                  className="btn btn-xs btn-outline-danger"
                  disabled={messages.length === 0}
                >
                  <FaTrashAlt className="mr-1" size={10} />
                  清空
                </button>
                <button 
                  onClick={handleSendAll}
                  className="btn btn-xs btn-primary"
                  disabled={isSending || messages.length === 0}
                >
                  发送全部
                </button>
              </div>
            </div>
            
            <MessageList 
              messages={messages}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onSendMessage={handleSendMessage}
              onSendAll={handleSendAll}
              onImportMessages={handleImportMessages}
              onExportMessages={handleExportMessages}
            />
            
            {/* Show loading indicator when transitions are pending */}
            {isPending && (
              <div className="mt-2 p-1 bg-blue-50 text-blue-700 rounded text-center text-xs">
                数据更新中...
              </div>
            )}
          </div>
          
          {/* Clear Confirmation Modal */}
          {showClearModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <div className="flex items-center text-red-500 mb-4">
                  <FaExclamationTriangle className="text-2xl mr-2" />
                  <h3 className="text-xl font-bold">确认清空所有消息</h3>
                </div>
                
                <p className="mb-6">
                  您确定要清空所有 <span className="font-semibold">{messages.length}</span> 条消息吗？此操作不可撤销。
                </p>
                
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={handleCancelClear}
                    className="btn btn-secondary"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleClearAll}
                    className="btn btn-danger"
                  >
                    确认清空
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
