import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ThunderboltOutlined } from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { useStreamChat } from '../hooks/useStreamChat'
import { getAllowedScenes } from '../utils/roleSceneMap'
import { SCENE_LABELS, SCENE_DESCRIPTIONS, QUICK_ACTIONS } from '../utils/constants'
import { tokens } from '../theme/tokens'
import ChatSidebar from '../components/chat/ChatSidebar'
import MessageList from '../components/chat/MessageList'
import ChatInput from '../components/chat/ChatInput'

export default function ChatPage() {
  useAuth()
  const { scene } = useParams<{ scene?: string }>()
  const user = useAuthStore((s) => s.user)
  const { activeScene, setActiveScene, isLoading } = useChatStore()
  const { sendMessage } = useStreamChat()
  const role = user?.role ?? ''
  const scenes = getAllowedScenes(role)
  const actions = QUICK_ACTIONS[activeScene] ?? []

  useEffect(() => {
    const target = scene && scenes.includes(scene) ? scene : scenes[0] ?? ''
    if (target && target !== activeScene) {
      setActiveScene(target)
    }
  }, [scene, scenes, activeScene, setActiveScene])

  return (
    <div style={styles.wrapper}>
      <ChatSidebar />
      <div style={styles.main}>
        {/* Scene header */}
        <div style={styles.sceneHeader}>
          <h2 style={styles.sceneTitle}>
            {SCENE_LABELS[activeScene] ?? '选择场景'}
          </h2>
          <p style={styles.sceneDesc}>
            {SCENE_DESCRIPTIONS[activeScene] ?? '请从左侧导航选择一个业务场景'}
          </p>
        </div>

        {/* Messages */}
        <div style={styles.messagesArea}>
          <MessageList />
        </div>

        {/* Quick actions strip */}
        {actions.length > 0 && (
          <div style={styles.quickStrip}>
            {actions.map((a) => (
              <button
                key={a.label}
                style={styles.quickBtn}
                disabled={isLoading}
                onClick={() => sendMessage(a.message)}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = tokens.amber500
                    ;(e.currentTarget as HTMLButtonElement).style.color = tokens.amber500
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = tokens.border
                  ;(e.currentTarget as HTMLButtonElement).style.color = tokens.textSecondary
                }}
              >
                <ThunderboltOutlined style={{ fontSize: 11 }} />
                {a.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={styles.inputArea}>
          <ChatInput />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  sceneHeader: {
    padding: '16px 24px',
    borderBottom: `1px solid ${tokens.border}`,
    background: tokens.bgSecondary,
  },
  sceneTitle: {
    fontFamily: tokens.fontDisplay,
    fontSize: '20px',
    fontWeight: 600,
    color: tokens.textPrimary,
    margin: 0,
  },
  sceneDesc: {
    fontSize: '13px',
    color: tokens.textSecondary,
    margin: '4px 0 0',
  },
  messagesArea: {
    flex: 1,
    overflow: 'hidden',
  },
  quickStrip: {
    display: 'flex',
    gap: '8px',
    padding: '8px 24px',
    overflowX: 'auto',
    borderTop: `1px solid ${tokens.border}`,
    background: tokens.bgPrimary,
    flexShrink: 0,
  },
  quickBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    fontSize: '12px',
    color: tokens.textSecondary,
    background: 'transparent',
    border: `1px solid ${tokens.border}`,
    borderRadius: '16px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  inputArea: {
    borderTop: `1px solid ${tokens.border}`,
    background: tokens.bgSecondary,
  },
}
