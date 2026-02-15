import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface SessionData {
  messages: ChatMessage[]
  title: string
  createdAt: number
}

interface ChatState {
  sessions: Record<string, Record<string, SessionData>>
  activeScene: string
  activeSessionId: string
  isLoading: boolean
  messages: ChatMessage[]
  sessionId: string

  addUserMessage: (content: string) => void
  addAssistantMessage: (content: string) => string
  appendToLastMessage: (chunk: string) => void
  setActiveScene: (scene: string) => void
  createSession: () => void
  switchSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
  getSceneSessions: () => Array<{ id: string } & SessionData>
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setSessionId: (id: string) => void
}

let msgCounter = 0
const genId = () => `msg_${Date.now()}_${++msgCounter}`
const genSessionId = () => `s_${Date.now()}`

function saveCurrentSession(state: ChatState): Record<string, Record<string, SessionData>> {
  if (!state.activeScene || !state.activeSessionId) return state.sessions
  const sceneSessions = state.sessions[state.activeScene] ?? {}
  const existing = sceneSessions[state.activeSessionId]
  const firstUserMsg = state.messages.find((m) => m.role === 'user')
  const title = existing?.title || (firstUserMsg ? firstUserMsg.content.slice(0, 20) : '新对话')
  return {
    ...state.sessions,
    [state.activeScene]: {
      ...sceneSessions,
      [state.activeSessionId]: {
        messages: state.messages,
        title,
        createdAt: existing?.createdAt ?? Date.now(),
      },
    },
  }
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeScene: '',
      activeSessionId: '',
      isLoading: false,
      messages: [],
      sessionId: '',

      addUserMessage: (content: string) => {
        const msg: ChatMessage = {
          id: genId(), role: 'user', content, timestamp: Date.now(),
        }
        set((s) => {
          const msgs = [...s.messages, msg]
          const sessions = saveCurrentSession({ ...s, messages: msgs })
          return { messages: msgs, sessions }
        })
      },

      addAssistantMessage: (content: string) => {
        const msg: ChatMessage = {
          id: genId(), role: 'assistant', content, timestamp: Date.now(),
        }
        set((s) => {
          const msgs = [...s.messages, msg]
          const sessions = saveCurrentSession({ ...s, messages: msgs })
          return { messages: msgs, sessions }
        })
        return msg.id
      },

      appendToLastMessage: (chunk: string) => {
        set((s) => {
          const msgs = [...s.messages]
          const last = msgs[msgs.length - 1]
          if (last && last.role === 'assistant') {
            msgs[msgs.length - 1] = { ...last, content: last.content + chunk }
          }
          const sessions = saveCurrentSession({ ...s, messages: msgs })
          return { messages: msgs, sessions }
        })
      },

      setActiveScene: (scene: string) => {
        const state = get()
        // Save current session
        const sessions = saveCurrentSession(state)
        // Find most recent session for target scene
        const sceneSessions = sessions[scene] ?? {}
        const sorted = Object.entries(sceneSessions).sort(
          ([, a], [, b]) => b.createdAt - a.createdAt
        )
        if (sorted.length > 0) {
          const [sid, data] = sorted[0]
          set({
            sessions, activeScene: scene,
            activeSessionId: sid, sessionId: sid,
            messages: data.messages,
          })
        } else {
          const newId = genSessionId()
          set({
            sessions: {
              ...sessions,
              [scene]: { [newId]: { messages: [], title: '新对话', createdAt: Date.now() } },
            },
            activeScene: scene,
            activeSessionId: newId, sessionId: newId,
            messages: [],
          })
        }
      },

      createSession: () => {
        const state = get()
        const sessions = saveCurrentSession(state)
        const scene = state.activeScene
        if (!scene) return
        const newId = genSessionId()
        set({
          sessions: {
            ...sessions,
            [scene]: {
              ...(sessions[scene] ?? {}),
              [newId]: { messages: [], title: '新对话', createdAt: Date.now() },
            },
          },
          activeSessionId: newId, sessionId: newId,
          messages: [],
        })
      },

      switchSession: (sessionId: string) => {
        const state = get()
        const sessions = saveCurrentSession(state)
        const data = sessions[state.activeScene]?.[sessionId]
        if (!data) return
        set({
          sessions,
          activeSessionId: sessionId, sessionId,
          messages: data.messages,
        })
      },

      deleteSession: (sessionId: string) => {
        const state = get()
        const scene = state.activeScene
        const sceneSessions = { ...(state.sessions[scene] ?? {}) }
        delete sceneSessions[sessionId]
        const newSessions = { ...state.sessions, [scene]: sceneSessions }

        if (sessionId === state.activeSessionId) {
          const sorted = Object.entries(sceneSessions).sort(
            ([, a], [, b]) => b.createdAt - a.createdAt
          )
          if (sorted.length > 0) {
            const [sid, data] = sorted[0]
            set({
              sessions: newSessions,
              activeSessionId: sid, sessionId: sid,
              messages: data.messages,
            })
          } else {
            const newId = genSessionId()
            set({
              sessions: {
                ...newSessions,
                [scene]: { [newId]: { messages: [], title: '新对话', createdAt: Date.now() } },
              },
              activeSessionId: newId, sessionId: newId,
              messages: [],
            })
          }
        } else {
          set({ sessions: newSessions })
        }
      },

      getSceneSessions: () => {
        const { activeScene, sessions } = get()
        const sceneSessions = sessions[activeScene] ?? {}
        return Object.entries(sceneSessions)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.createdAt - a.createdAt)
      },

      clearMessages: () => set((s) => {
        const sessions = saveCurrentSession({ ...s, messages: [] })
        return { messages: [], sessions }
      }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setSessionId: (id: string) => set({ sessionId: id }),
    }),
    {
      name: 'taishi-chat',
      partialize: (state) => ({
        sessions: state.sessions,
        activeScene: state.activeScene,
        activeSessionId: state.activeSessionId,
        messages: state.messages,
        sessionId: state.sessionId,
      }),
    }
  )
)
