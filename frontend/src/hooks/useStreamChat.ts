import { useRef, useCallback } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'

const CHARS_PER_FRAME = 3  // 每帧释放字符数，越大越快
const FRAME_INTERVAL = 16  // ~60fps

export function useStreamChat() {
  const abortRef = useRef<AbortController | null>(null)
  const bufferRef = useRef('')
  const flushingRef = useRef(false)
  const doneRef = useRef(false)

  const flushBuffer = useCallback(() => {
    if (flushingRef.current) return
    flushingRef.current = true

    const tick = () => {
      if (bufferRef.current.length === 0) {
        flushingRef.current = false
        if (doneRef.current) {
          useChatStore.getState().setLoading(false)
          doneRef.current = false
        }
        return
      }
      const chars = bufferRef.current.slice(0, CHARS_PER_FRAME)
      bufferRef.current = bufferRef.current.slice(CHARS_PER_FRAME)
      useChatStore.getState().appendToLastMessage(chars)
      setTimeout(tick, FRAME_INTERVAL)
    }
    tick()
  }, [])

  const sendMessage = useCallback(async (message: string) => {
    const { activeScene, addUserMessage, addAssistantMessage, setLoading } =
      useChatStore.getState()
    const { token, user } = useAuthStore.getState()
    const sessionId = useChatStore.getState().sessionId

    addUserMessage(message)
    setLoading(true)
    bufferRef.current = ''
    doneRef.current = false

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          scene: activeScene,
          message,
          user_id: String(user?.user_id ?? ''),
          session_id: sessionId,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const errText = await res.text().catch(() => '请求失败')
        addAssistantMessage(`错误: ${errText}`)
        setLoading(false)
        return
      }

      addAssistantMessage('')

      const reader = res.body?.getReader()
      if (!reader) {
        useChatStore.getState().appendToLastMessage('无法读取响应流')
        setLoading(false)
        return
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        bufferRef.current += chunk
        flushBuffer()
      }

      // 标记流结束，等缓冲区清空后再关闭 loading
      doneRef.current = true
      if (bufferRef.current.length === 0) {
        setLoading(false)
        doneRef.current = false
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // 取消时立即清空缓冲区
        bufferRef.current = ''
        useChatStore.getState().appendToLastMessage('\n[已取消]')
      } else {
        addAssistantMessage('网络错误，请重试')
      }
      setLoading(false)
      doneRef.current = false
    } finally {
      abortRef.current = null
    }
  }, [flushBuffer])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { sendMessage, cancel }
}
