import { useEffect, useRef } from 'react'
import { MessageOutlined } from '@ant-design/icons'
import { useChatStore } from '../../stores/chatStore'
import { tokens } from '../../theme/tokens'
import ChatMessage from './ChatMessage'

export default function MessageList() {
  const messages = useChatStore((s) => s.messages)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div style={styles.empty}>
        <MessageOutlined
          style={{ fontSize: 48, color: tokens.textMuted, marginBottom: 16 }}
        />
        <p style={styles.emptyText}>开始对话</p>
        <p style={styles.emptyHint}>输入您的问题，AI 助手将为您解答</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    overflowY: 'auto',
    padding: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  empty: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: tokens.fontDisplay,
    fontSize: '20px',
    fontWeight: 600,
    color: tokens.textSecondary,
    margin: 0,
  },
  emptyHint: {
    fontSize: '13px',
    color: tokens.textMuted,
    marginTop: '8px',
  },
}
