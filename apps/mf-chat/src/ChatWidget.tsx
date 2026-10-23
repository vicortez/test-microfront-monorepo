import * as React from 'react'
import { Badge, Button } from '@albert-fe/ui-kit'
import { MessageSquare, Send } from 'lucide-react'
import './widget.css'

export interface ChatMessage {
  id: string
  sender: string
  text: string
  timestamp: string
  isSelf?: boolean
}

export default function ChatWidget() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Alice (Ops)',
      text: 'Case #1042 has been verified and processed.',
      timestamp: '10:41 AM',
    },
    {
      id: '2',
      sender: 'Bob (Lead)',
      text: 'Thanks! Updating regulatory review queue now.',
      timestamp: '10:43 AM',
    },
  ])

  const [inputVal, setInputVal] = React.useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim()) return

    const newMessage: ChatMessage = {
      id: String(Date.now()),
      sender: 'Current User',
      text: inputVal.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isSelf: true,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputVal('')
  }

  return (
    <section
      id="mfe-chat"
      data-testid="mfe-chat-root"
      // className="rounded-xl border border-border bg-card p-6"
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight text-card-foreground">
            Live Chat
          </h2>
        </div>
        <Badge variant="outline">Remote 2 (MF)</Badge>
      </div>

      <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            data-testid="chat-message-bubble"
            className={`rounded-lg p-3 text-sm transition-all border ${
              msg.isSelf
                ? 'ml-auto max-w-[80%] bg-primary text-primary-foreground border-primary'
                : 'mr-auto max-w-[80%] bg-secondary text-secondary-foreground border-border'
            }`}
          >
            <div className="flex justify-between text-xs opacity-75 mb-1 space-x-2">
              <span className="font-semibold">{msg.sender}</span>
              <span>{msg.timestamp}</span>
            </div>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type an operational update..."
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        <Button type="submit" size="default">
          <Send className="h-4 w-4 mr-1" /> Send
        </Button>
      </form>
    </section>
  )
}
