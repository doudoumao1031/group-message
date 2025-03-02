'use server'

import { Message } from '@/types/message'

// Convert datetime to Unix timestamp
const getUnixTimestamp = (dateTimeStr: string) => {
  return Math.floor(new Date(dateTimeStr).getTime() / 1000)
}

export async function sendMessage(message: Message): Promise<boolean> {
  try {
    const apiUrl = 'https://api.rct2008.com:8443/10450935:3jZ73ZfO8Zgj85AAS9VzU5WP/sendTextMessage'
    
    // Prepare message data
    const unixTimestamp = getUnixTimestamp(message.time)
    const messageText = `#sendmessage\nfrom:${message.sender}\nto:${message.receiver}\ndateunix:${unixTimestamp}\nmsg:${message.content}`
    
    const requestData = {
      chat_id: 777000,
      chat_type: 1,
      text: messageText
    }
    
    // Send API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData),
      // Next.js 15 fetch options
      cache: 'no-store',
      next: { 
        tags: ['message-send'] 
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return true
  } catch (error) {
    console.error('Failed to send message:', error)
    return false
  }
}
