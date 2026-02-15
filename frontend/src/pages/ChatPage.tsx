import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { getAllowedScenes } from '../utils/roleSceneMap'
import { SCENE_LABELS, SCENE_DESCRIPTIONS } from '../utils/constants'
import { tokens } from '../theme/tokens'
import ChatSidebar from '../components/chat/ChatSidebar'
import MessageList from '../components/chat/MessageList'
import ChatInput from '../components/chat/ChatInput'

export default function ChatPage() {
  useAuth()
  const { scene } = useParams<{ scene?: string }>()
  const user = useAuthStore((s) => s.user)
  const { activeScene, setActiveScene } = useChatStore()
  const role = user?.role ?? ''
  const scenes = getAllowedScenes(role)

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
  inputArea: {
    borderTop: `1px solid ${tokens.border}`,
    background: tokens.bgSecondary,
  },
}
