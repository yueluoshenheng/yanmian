import { useRef, useCallback } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'

export function useStreamChat() {
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (message: string) => {
    const { activeScene, addUserMessage, addAssistantMessage, appendToLastMessage, setLoading } =
      useChatStore.getState()
    const { token, user } = useAuthStore.getState()
    const sessionId = useChatStore.getState().sessionId

    addUserMessage(message)
    setLoading(true)

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
        appendToLastMessage('无法读取响应流')
        setLoading(false)
        return
      }

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        appendToLastMessage(chunk)
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        appendToLastMessage('\n[已取消]')
      } else {
        addAssistantMessage('网络错误，请重试')
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { sendMessage, cancel }
}
