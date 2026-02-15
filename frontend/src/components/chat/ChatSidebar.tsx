import { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons'
import { useChatStore } from '../../stores/chatStore'
import { tokens } from '../../theme/tokens'

export default function ChatSidebar() {
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const isLoading = useChatStore((s) => s.isLoading)
  const createSession = useChatStore((s) => s.createSession)
  const switchSession = useChatStore((s) => s.switchSession)
  const deleteSession = useChatStore((s) => s.deleteSession)
  const getSceneSessions = useChatStore((s) => s.getSceneSessions)
  const list = getSceneSessions()
  const [hoverId, setHoverId] = useState<string | null>(null)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={createSession}
          disabled={isLoading}
          block
          style={styles.newBtn}
        >
          新建对话
        </Button>
      </div>

      <div style={styles.list}>
        {list.map((s) => {
          const isActive = s.id === activeSessionId
          const isHover = s.id === hoverId
          return (
            <div
              key={s.id}
              style={{
                ...styles.item,
                background: isActive ? tokens.bgTertiary : isHover ? tokens.bgHover : 'transparent',
                borderLeft: isActive ? `2px solid ${tokens.amber500}` : '2px solid transparent',
              }}
              onClick={() => switchSession(s.id)}
              onMouseEnter={() => setHoverId(s.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <MessageOutlined style={{ color: isActive ? tokens.amber500 : tokens.textMuted, fontSize: 13, flexShrink: 0 }} />
              <div style={styles.itemContent}>
                <div style={{ ...styles.itemTitle, color: isActive ? tokens.textPrimary : tokens.textSecondary }}>
                  {s.title}
                </div>
                <div style={styles.itemTime}>
                  {formatDate(s.createdAt)}
                </div>
              </div>
              {isHover && list.length > 1 && (
                <DeleteOutlined
                  style={styles.deleteIcon}
                  onClick={(e) => { e.stopPropagation(); deleteSession(s.id) }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '220px',
    minWidth: '220px',
    background: tokens.bgSecondary,
    borderRight: `1px solid ${tokens.border}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '12px',
    borderBottom: `1px solid ${tokens.border}`,
  },
  newBtn: {
    background: tokens.amber500,
    borderColor: tokens.amber500,
    fontWeight: 500,
    fontSize: '13px',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 0',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    position: 'relative',
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '13px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemTime: {
    fontSize: '11px',
    color: tokens.textMuted,
    marginTop: '2px',
  },
  deleteIcon: {
    fontSize: '12px',
    color: tokens.textMuted,
    padding: '4px',
    flexShrink: 0,
  },
}
