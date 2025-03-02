export interface Message {
  id: string
  sender: string
  receiver: string
  time: string
  unixTimestamp: number
  content: string
  status: 'pending' | 'sent' | 'failed'
}
