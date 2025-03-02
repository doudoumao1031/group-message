export interface Message {
  id: string
  sender: string
  receiver: string
  time: string
  content: string
  status: 'pending' | 'sent' | 'failed'
}
