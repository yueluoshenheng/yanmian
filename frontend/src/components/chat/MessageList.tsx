import { useEffect, useRef } from 'react'
import { RobotOutlined } from '@ant-design/icons'
import { useChatStore } from '../../stores/chatStore'
import { SCENE_LABELS } from '../../utils/constants'
import { tokens } from '../../theme/tokens'
import ChatMessage from './ChatMessage'

export default function MessageList() {
  const messages = useChatStore((s) => s.messages)
  const activeScene = useChatStore((s) => s.activeScene)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div style={styles.empty}>
        <RobotOutlined style={{ fontSize: 40, color: tokens.amber500, opacity: 0.5, marginBottom: 12 }} />
        <p style={styles.emptyText}>{SCENE_LABELS[activeScene] ?? '智能助手'}</p>
        <p style={styles.emptyHint}>选择下方常用操作或输入您的问题</p>
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
    fontSize: '22px',
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
