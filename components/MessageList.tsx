'use client'

import { useState } from 'react'
import { FaEdit, FaTrash, FaPaperPlane, FaEllipsisV, FaCheckCircle } from 'react-icons/fa'
import { Message } from '@/types/message'
import { verifyMessageById } from '@/app/api/actions/verifyMessageById'

interface MessageListProps {
  messages: Message[]
  onEditMessage: (message: Message) => void
  onDeleteMessage: (id: string) => void
  onSendMessage: (id: string) => void
  onSendAll: () => void
  onImportMessages: (e: React.ChangeEvent<HTMLInputElement>) => void
  onExportMessages: () => void
  onVerifyMessage?: (id: string, verified: boolean) => void
}

export default function MessageList({
  messages,
  onEditMessage,
  onDeleteMessage,
  onSendMessage,
  onSendAll,
  onImportMessages,
  onExportMessages,
  onVerifyMessage
}: MessageListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  
  // Toggle selection of a message
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }
  
  // Toggle selection of all messages
  const toggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(messages.map(msg => msg.id))
    }
  }
  
  // Format datetime for display
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'sent':
        return 'message-status message-status-sent'
      case 'failed':
        return 'message-status message-status-failed'
      default:
        return 'message-status message-status-pending'
    }
  }
  
  // Get status text
  const getStatusText = (status: string) => {
    switch(status) {
      case 'sent':
        return '已发送'
      case 'failed':
        return '失败'
      default:
        return '待发送'
    }
  }
  
  // Get verification status badge class
  const getVerificationBadgeClass = (status?: string) => {
    switch(status) {
      case 'verified':
        return 'message-status message-status-verified'
      case 'unverified':
        return 'message-status message-status-unverified'
      case 'pending':
        return 'message-status message-status-pending'
      default:
        return 'message-status message-status-none'
    }
  }
  
  // Get verification status text
  const getVerificationText = (status?: string) => {
    switch(status) {
      case 'verified':
        return '已确认'
      case 'unverified':
        return '未确认'
      case 'pending':
        return '确认中'
      default:
        return '未发送'
    }
  }
  
  // Toggle dropdown menu for mobile
  const toggleDropdown = (id: string) => {
    setActiveDropdown(prev => prev === id ? null : id)
  }

  // Handle manual verification
  const handleManualVerify = async (message: Message) => {
    if (!message.sentMessageId) return;
    
    try {
      const isVerified = await verifyMessageById(message.sentMessageId);
      
      if (onVerifyMessage) {
        onVerifyMessage(message.id, isVerified);
      }
    } catch (error) {
      console.error('Failed to verify message:', error);
    }
  };

  return (
    <div>
      {messages.length > 0 ? (
        <>
          {/* Desktop view - table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === messages.length && messages.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded h-3 w-3"
                    />
                  </th>
                  <th className="px-2 py-1 text-left">发送者</th>
                  <th className="px-2 py-1 text-left">接收者</th>
                  <th className="px-2 py-1 text-left">时间</th>
                  <th className="px-2 py-1 text-left">内容</th>
                  <th className="px-2 py-1 text-left">状态</th>
                  <th className="px-2 py-1 text-left">确认状态</th>
                  <th className="px-2 py-1 text-left">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map(message => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(message.id)}
                        onChange={() => toggleSelection(message.id)}
                        className="rounded h-3 w-3"
                      />
                    </td>
                    <td className="px-2 py-1">{message.sender}</td>
                    <td className="px-2 py-1">{message.receiver}</td>
                    <td className="px-2 py-1 whitespace-nowrap">{formatDateTime(message.time)}</td>
                    <td className="px-2 py-1 max-w-[180px] truncate">{message.content}</td>
                    <td className="px-2 py-1">
                      <span className={getStatusBadgeClass(message.status)}>
                        {getStatusText(message.status)}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      <span className={getVerificationBadgeClass(message.verificationStatus)}>
                        {getVerificationText(message.verificationStatus)}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onEditMessage(message)}
                          className="text-blue-600 hover:text-blue-800"
                          title="编辑"
                          disabled={message.status === 'sent'}
                        >
                          <FaEdit size={10} />
                        </button>
                        <button
                          onClick={() => onDeleteMessage(message.id)}
                          className="text-red-600 hover:text-red-800"
                          title="删除"
                        >
                          <FaTrash size={10} />
                        </button>
                        <button
                          onClick={() => onSendMessage(message.id)}
                          className="text-green-600 hover:text-green-800"
                          title="发送"
                          disabled={message.status === 'sent'}
                        >
                          <FaPaperPlane size={10} />
                        </button>
                        {message.status === 'sent' && message.verificationStatus === 'unverified' && message.sentMessageId && (
                          <button
                            onClick={() => handleManualVerify(message)}
                            className="text-blue-600 hover:text-blue-800"
                            title="手动验证"
                          >
                            <FaCheckCircle size={10} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile view - card list */}
          <div className="md:hidden space-y-3">
            <div className="flex justify-between items-center px-2 py-1 bg-gray-100 rounded">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === messages.length && messages.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded h-3 w-3 mr-2"
                />
                <span className="text-xs font-medium">全选</span>
              </div>
              <span className="text-xs text-gray-500">共 {messages.length} 条消息</span>
            </div>
            
            {messages.map(message => (
              <div key={message.id} className="bg-white border rounded shadow-sm p-2 text-xs relative">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(message.id)}
                      onChange={() => toggleSelection(message.id)}
                      className="rounded h-3 w-3 mr-2"
                    />
                    <span className={getStatusBadgeClass(message.status)}>
                      {getStatusText(message.status)}
                    </span>
                    <span className={`ml-1 ${getVerificationBadgeClass(message.verificationStatus)}`}>
                      {getVerificationText(message.verificationStatus)}
                    </span>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => toggleDropdown(message.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <FaEllipsisV size={10} />
                    </button>
                    
                    {activeDropdown === message.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded z-10 py-1 w-24">
                        <button
                          onClick={() => {
                            onEditMessage(message);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-gray-100 flex items-center"
                          disabled={message.status === 'sent'}
                        >
                          <FaEdit size={10} className="mr-2 text-blue-600" />
                          编辑
                        </button>
                        <button
                          onClick={() => {
                            onDeleteMessage(message.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-gray-100 flex items-center"
                        >
                          <FaTrash size={10} className="mr-2 text-red-600" />
                          删除
                        </button>
                        <button
                          onClick={() => {
                            onSendMessage(message.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-3 py-1 text-xs hover:bg-gray-100 flex items-center"
                          disabled={message.status === 'sent'}
                        >
                          <FaPaperPlane size={10} className="mr-2 text-green-600" />
                          发送
                        </button>
                        {message.status === 'sent' && message.verificationStatus === 'unverified' && message.sentMessageId && (
                          <button 
                            onClick={() => {
                              handleManualVerify(message);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3 py-1 text-xs hover:bg-gray-100 flex items-center"
                          >
                            <FaCheckCircle size={10} className="mr-2 text-blue-600" />
                            手动验证
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-1">
                  <div className="flex">
                    <span className="font-medium w-14">发送者:</span>
                    <span className="truncate">{message.sender}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-14">接收者:</span>
                    <span className="truncate">{message.receiver}</span>
                  </div>
                  <div className="flex col-span-2">
                    <span className="font-medium w-14">时间:</span>
                    <span>{formatDateTime(message.time)}</span>
                  </div>
                </div>
                
                <div className="flex">
                  <span className="font-medium w-14">内容:</span>
                  <span className="truncate">{message.content}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-4 text-center text-gray-500 text-sm">
          消息列表为空，请添加消息
        </div>
      )}
    </div>
  )
}
