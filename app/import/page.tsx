'use client'

import { useState, useEffect, useTransition } from 'react'
import LoginForm from '@/components/LoginForm'
import MessageForm from '@/components/MessageForm'
import MessageList from '@/components/MessageList'
import ClientComponent from '@/components/ClientComponent'
import { Message } from '@/types/message'
import { FaSignOutAlt, FaTrashAlt, FaExclamationTriangle, FaPaperPlane, FaQuestion, FaFileImport, FaFileExport } from 'react-icons/fa'
import { sendMessage } from '@/app/api/actions/sendMessage'

// Modal types
type ModalType = 'none' | 'clear' | 'delete' | 'sendAll';

// Modal props interface
interface ConfirmModalProps {
  type: ModalType;
  message: string;
  itemCount?: number;
  itemId?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Confirmation Modal Component
const ConfirmModal = ({ type, message, itemCount, onConfirm, onCancel }: ConfirmModalProps) => {
  let icon = <FaQuestion className="text-2xl mr-2" />;
  let title = "确认操作";
  let confirmButtonClass = "btn btn-primary";
  let confirmText = "确认";
  let headerClass = "text-blue-600";
  
  switch (type) {
    case 'clear':
      icon = <FaTrashAlt className="text-2xl mr-2" />;
      title = "确认清空所有消息";
      confirmButtonClass = "btn btn-danger";
      confirmText = "确认清空";
      headerClass = "text-red-600";
      break;
    case 'delete':
      icon = <FaTrashAlt className="text-2xl mr-2" />;
      title = "确认删除消息";
      confirmButtonClass = "btn btn-danger";
      confirmText = "确认删除";
      headerClass = "text-red-600";
      break;
    case 'sendAll':
      icon = <FaPaperPlane className="text-2xl mr-2" />;
      title = "确认发送所有消息";
      confirmButtonClass = "btn btn-primary";
      confirmText = "确认发送";
      headerClass = "text-blue-600";
      break;
  }
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className={`modal-header ${headerClass}`}>
          {icon}
          <h3 className="modal-title">{title}</h3>
        </div>
        
        <div className="modal-body">
          {message}
          {itemCount && <span className="font-semibold"> {itemCount} </span>}
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onCancel}
            className="btn btn-secondary"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className={confirmButtonClass}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  // Automatically set isLoggedIn to true in development mode
  const [isLoggedIn, setIsLoggedIn] = useState(process.env.NODE_ENV === 'development' ? true : false)
  const [messages, setMessages] = useState<Message[]>([])
  const [editMessage, setEditMessage] = useState<Message | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 })
  // React 19 useTransition hook for smoother UI updates
  const [isPending, startTransition] = useTransition()
  // Modal state
  const [modalState, setModalState] = useState<{
    show: boolean;
    type: ModalType;
    message: string;
    itemId?: string;
    itemCount?: number;
  }>({
    show: false,
    type: 'none',
    message: '',
  });
  
  // Check login status on mount
  useEffect(() => {
    // In development mode, always set isLoggedIn to true
    if (process.env.NODE_ENV === 'development') {
      setIsLoggedIn(true)
      sessionStorage.setItem('isLoggedIn', 'true')
    } else {
      const loginStatus = sessionStorage.getItem('isLoggedIn')
      if (loginStatus === 'true') {
        setIsLoggedIn(true)
      }
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
          // Add new message and sort by timestamp for the same sender-receiver pair
          const newMessages = [...prev, message]
          
          // Group messages by sender-receiver pairs
          const messageGroups: Record<string, Message[]> = {}
          
          newMessages.forEach(msg => {
            const key = `${msg.sender}-${msg.receiver}`
            if (!messageGroups[key]) {
              messageGroups[key] = []
            }
            messageGroups[key].push(msg)
          })
          
          // Sort each group by timestamp (ascending order)
          Object.keys(messageGroups).forEach(key => {
            messageGroups[key].sort((a, b) => a.unixTimestamp - b.unixTimestamp)
          })
          
          // Flatten the groups back into a single array, preserving the original order
          // but ensuring chronological order within each sender-receiver group
          const sortedMessages: Message[] = []
          const processedGroups = new Set<string>()
          
          newMessages.forEach(msg => {
            const key = `${msg.sender}-${msg.receiver}`
            if (!processedGroups.has(key)) {
              sortedMessages.push(...messageGroups[key])
              processedGroups.add(key)
            }
          })
          
          return sortedMessages
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
  
  // Show delete confirmation modal
  const handleShowDeleteModal = (id: string) => {
    setModalState({
      show: true,
      type: 'delete',
      message: '确定要删除这条消息吗？',
      itemId: id
    });
  }
  
  // Delete message
  const handleDeleteMessage = (id: string) => {
    // If called directly from a component
    if (!modalState.show) {
      handleShowDeleteModal(id);
      return;
    }
    
    // If confirmed from modal
    startTransition(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    });
    
    // Close modal
    setModalState({
      show: false,
      type: 'none',
      message: ''
    });
  }
  
  // Show clear confirmation modal
  const handleShowClearModal = () => {
    if (messages.length === 0) {
      return;
    }
    
    setModalState({
      show: true,
      type: 'clear',
      message: '您确定要清空所有消息吗？此操作不可撤销。',
      itemCount: messages.length
    });
  }
  
  // Clear all messages
  const handleClearAll = () => {
    startTransition(() => {
      setMessages([]);
    });
    
    // Close modal
    setModalState({
      show: false,
      type: 'none',
      message: ''
    });
  }
  
  // Show send all confirmation modal
  const handleShowSendAllModal = () => {
    // Filter messages that are not already sent
    const pendingMessages = messages.filter(msg => msg.status !== 'sent');
    
    if (pendingMessages.length === 0) {
      alert('没有待发送的消息');
      return;
    }
    
    setModalState({
      show: true,
      type: 'sendAll',
      message: '确定要发送所有待发送的消息吗？',
      itemCount: pendingMessages.length
    });
  }
  
  // Cancel modal
  const handleCancelModal = () => {
    setModalState({
      show: false,
      type: 'none',
      message: ''
    });
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
    const result = await sendMessage(message)
    
    // Update status
    startTransition(() => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === id) {
          return { 
            ...msg, 
            status: result.success ? 'sent' : 'failed',
            sentMessageId: result.sentMessageId
          }
        }
        return msg
      }))
    })
  }
  
  // Send all messages
  const handleSendAll = async () => {
    // Filter messages that are not already sent
    const pendingMessages = messages.filter(msg => msg.status !== 'sent')
    
    // Close modal first
    setModalState({
      show: false,
      type: 'none',
      message: ''
    });
    
    // Group messages by sender-receiver pairs
    const messageGroups: Record<string, Message[]> = {}
    
    pendingMessages.forEach(message => {
      const key = `${message.sender}-${message.receiver}`
      if (!messageGroups[key]) {
        messageGroups[key] = []
      }
      messageGroups[key].push(message)
    })
    
    // Sort each group by timestamp (ascending order)
    Object.keys(messageGroups).forEach(key => {
      messageGroups[key].sort((a, b) => {
        // Sort by Unix timestamp (earlier messages first)
        return a.unixTimestamp - b.unixTimestamp
      })
    })
    
    // Flatten the groups back into a single array
    const sortedMessages = Object.values(messageGroups).flat()
    
    // Set sending state
    setIsSending(true)
    setSendProgress({ current: 0, total: sortedMessages.length })
    
    // Send messages one by one
    for (let i = 0; i < sortedMessages.length; i++) {
      const message = sortedMessages[i]
      
      // Update progress
      setSendProgress({ current: i + 1, total: sortedMessages.length })
      
      // Update status to pending
      startTransition(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'pending' } : msg
        ))
      })
      
      // Send message using server action
      const result = await sendMessage(message)
      
      // Update status
      startTransition(() => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === message.id) {
            return { 
              ...msg, 
              status: result.success ? 'sent' : 'failed',
              sentMessageId: result.sentMessageId,
              errorMessage: result.errorMessage
            }
          }
          return msg
        }))
      })
      
      // If sending failed with a time error, stop sending more messages to this recipient
      if (!result.success && result.errorCode === 'TIME_ERROR') {
        const currentKey = `${message.sender}-${message.receiver}`
        
        // Mark remaining messages in this group as failed
        const remainingMessages = sortedMessages.slice(i + 1)
          .filter(msg => `${msg.sender}-${msg.receiver}` === currentKey)
        
        if (remainingMessages.length > 0) {
          startTransition(() => {
            setMessages(prev => prev.map(msg => {
              if (remainingMessages.some(rm => rm.id === msg.id)) {
                return {
                  ...msg,
                  status: 'failed',
                  errorMessage: '前序消息发送失败，时间顺序错误'
                }
              }
              return msg
            }))
          })
          
          // Skip the remaining messages for this sender-receiver pair
          i += remainingMessages.length
          setSendProgress({ current: i + 1, total: sortedMessages.length })
        }
      }
      
      // Add a small delay between requests to avoid rate limiting
      if (i < sortedMessages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    // Reset sending state
    setIsSending(false)
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
        <div className="container mx-auto px-1 md:px-2 py-2 md:py-3 max-w-5xl">
          <div className="flex justify-between items-center mb-1 md:mb-2">
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl font-bold text-gray-800">消息发送系统</h1>
              {process.env.NODE_ENV === 'development' && (
                <span className="ml-1 md:ml-2 px-1 md:px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] md:text-xs rounded-full">
                  开发环境
                </span>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="btn btn-xs btn-outline-danger py-0.5 px-1.5 md:py-1 md:px-2"
            >
              <FaSignOutAlt className="mr-0.5 md:mr-1" size={10} />
              退出
            </button>
          </div>
          
          {isSending && (
            <div className="bg-blue-50 text-blue-700 p-1 md:p-2 rounded mb-1 md:mb-2 text-xs md:text-sm">
              <div className="flex justify-between mb-0.5 md:mb-1">
                <span>正在发送消息...</span>
                <span>{sendProgress.current} / {sendProgress.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1 md:h-1.5">
                <div 
                  className="bg-blue-600 h-1 md:h-1.5 rounded-full" 
                  style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Message Form Section */}
          <div className="bg-white rounded shadow-sm p-2 md:p-3 mb-1 md:mb-2">
            <div className="flex justify-between items-center mb-1 md:mb-2">
              <h2 className="text-sm md:text-base font-semibold">创建消息</h2>
              {editMessage && (
                <span className="text-[10px] md:text-xs text-blue-600">编辑模式</span>
              )}
            </div>
            <MessageForm 
              onAddMessage={handleAddMessage}
              editMessage={editMessage}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          
          {/* Message List Section */}
          <div className="bg-white rounded shadow-sm p-2 md:p-3">
            <div className="flex flex-wrap justify-between items-center mb-1 md:mb-2 gap-1 md:gap-2">
              <h2 className="text-sm md:text-base font-semibold">消息列表</h2>
              <div className="flex flex-wrap gap-1">
                <label className="btn btn-xs btn-secondary flex items-center py-0.5 px-1.5">
                  <FaFileImport className="mr-0.25" size={8} />
                  导入JSON
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={(e) => {
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
                    }}
                    className="hidden" 
                  />
                </label>
                <button 
                  onClick={() => {
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
                  }}
                  className="btn btn-xs btn-secondary py-0.5 px-1.5"
                  disabled={messages.length === 0}
                >
                  <FaFileExport className="mr-0.25" size={8} />
                  导出JSON
                </button>
                <button 
                  onClick={handleShowClearModal}
                  className="btn btn-xs btn-outline-danger py-0.5 px-1.5"
                  disabled={messages.length === 0}
                >
                  <FaTrashAlt className="mr-0.25" size={8} />
                  清空
                </button>
                <button 
                  onClick={handleShowSendAllModal}
                  className="btn btn-xs btn-primary py-0.5 px-1.5"
                  disabled={isSending || messages.length === 0}
                >
                  <FaPaperPlane className="mr-0.25" size={8} />
                  发送全部
                </button>
              </div>
            </div>
            
            <MessageList 
              messages={messages}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleShowDeleteModal}
              onSendMessage={handleSendMessage}
              onSendAll={handleShowSendAllModal}
              onImportMessages={(e) => {
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
              }} 
              onExportMessages={() => {
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
              }}
            />
            
            {/* Show loading indicator when transitions are pending */}
            {isPending && (
              <div className="mt-2 p-1 bg-blue-50 text-blue-700 rounded text-center text-xs">
                数据更新中...
              </div>
            )}
          </div>
          
          {/* Confirmation Modal */}
          {modalState.show && (
            <ConfirmModal
              type={modalState.type}
              message={modalState.message}
              itemCount={modalState.itemCount}
              onConfirm={() => {
                switch (modalState.type) {
                  case 'clear':
                    handleClearAll();
                    break;
                  case 'delete':
                    if (modalState.itemId) {
                      handleDeleteMessage(modalState.itemId);
                    }
                    break;
                  case 'sendAll':
                    handleSendAll();
                    break;
                }
              }}
              onCancel={handleCancelModal}
            />
          )}
        </div>
      )}
    </main>
  )
}
