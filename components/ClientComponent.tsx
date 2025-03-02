'use client';

import { useState, useEffect, useOptimistic } from 'react';
import { Message } from '@/types/message';

interface ClientComponentProps {
  initialMessages: Message[];
  onUpdateMessage: (message: Message) => void;
}

export default function ClientComponent({ initialMessages, onUpdateMessage }: ClientComponentProps) {
  // Using React 19's useOptimistic hook for optimistic updates
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    initialMessages,
    (state, newMessage: Message) => {
      return state.map(msg => 
        msg.id === newMessage.id ? newMessage : msg
      );
    }
  );

  const handleOptimisticUpdate = (message: Message) => {
    // Create an optimistic version of the message
    const optimisticMessage = {
      ...message,
      status: 'pending' as const
    };
    
    // Apply optimistic update
    addOptimisticMessage(optimisticMessage);
    
    // Then perform the actual update
    onUpdateMessage(message);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">React 19 Optimistic Updates Demo</h3>
      <div className="space-y-2">
        {optimisticMessages.map(message => (
          <div 
            key={message.id}
            className={`p-3 rounded ${
              message.status === 'pending' ? 'bg-yellow-50' : 
              message.status === 'sent' ? 'bg-green-50' : 
              message.status === 'failed' ? 'bg-red-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex justify-between">
              <span>{message.sender} → {message.receiver}</span>
              <span className="text-sm">
                {message.status === 'pending' ? '处理中...' : 
                 message.status === 'sent' ? '已发送' : 
                 message.status === 'failed' ? '发送失败' : '未发送'}
              </span>
            </div>
            <p className="mt-1">{message.content}</p>
            <button
              onClick={() => handleOptimisticUpdate(message)}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
              disabled={message.status === 'pending'}
            >
              更新状态
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
