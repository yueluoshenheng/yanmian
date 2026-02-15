import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { RobotOutlined } from '@ant-design/icons'
import { tokens } from '../../theme/tokens'
import type { ChatMessage as ChatMessageType } from '../../stores/chatStore'

interface Props {
  message: ChatMessageType
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div style={styles.userRow} className="fade-in-up">
        <div style={styles.userBubble}>
          <p style={styles.userText}>{message.content}</p>
          <span style={styles.userTimestamp}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.assistantRow} className="fade-in-up">
      <div style={styles.avatarWrap}>
        <RobotOutlined style={{ fontSize: 14, color: tokens.amber500 }} />
      </div>
      <div style={styles.assistantContent}>
        <div className="markdown-body">
          <Markdown remarkPlugins={[remarkGfm]}>{message.content || '...'}</Markdown>
        </div>
        <span style={styles.assistantTimestamp}>
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const styles: Record<string, React.CSSProperties> = {
  userRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '6px 24px',
  },
  userBubble: {
    maxWidth: '60%',
    padding: '10px 16px',
    borderRadius: '16px 16px 4px 16px',
    background: tokens.amber500,
  },
  userText: {
    margin: 0,
    color: tokens.bgPrimary,
    fontSize: '14px',
    lineHeight: '1.6',
    fontWeight: 500,
  },
  userTimestamp: {
    display: 'block',
    fontSize: '11px',
    color: `${tokens.bgPrimary}99`,
    marginTop: '4px',
    textAlign: 'right' as const,
  },
  assistantRow: {
    display: 'flex',
    gap: '12px',
    padding: '8px 24px',
    alignItems: 'flex-start',
  },
  avatarWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: `${tokens.amber500}18`,
    border: `1px solid ${tokens.amber500}33`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  assistantContent: {
    flex: 1,
    minWidth: 0,
    maxWidth: '85%',
  },
  assistantTimestamp: {
    display: 'block',
    fontSize: '11px',
    color: tokens.textMuted,
    marginTop: '6px',
  },
}
