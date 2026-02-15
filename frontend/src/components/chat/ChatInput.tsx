import { useState, useRef } from 'react'
import { Button, Spin } from 'antd'
import { SendOutlined, StopOutlined } from '@ant-design/icons'
import { useChatStore } from '../../stores/chatStore'
import { useStreamChat } from '../../hooks/useStreamChat'
import { tokens } from '../../theme/tokens'

export default function ChatInput() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isLoading = useChatStore((s) => s.isLoading)
  const activeScene = useChatStore((s) => s.activeScene)
  const { sendMessage, cancel } = useStreamChat()

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isLoading || !activeScene) return
    setText('')
    sendMessage(trimmed)
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = '44px'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.inputRow}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={activeScene ? '输入消息...' : '请先选择场景'}
          disabled={!activeScene}
          style={styles.textarea}
          rows={1}
        />
        {isLoading ? (
          <Button
            shape="circle"
            icon={<StopOutlined />}
            onClick={cancel}
            style={styles.stopBtn}
          />
        ) : (
          <Button
            shape="circle"
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            disabled={!text.trim() || !activeScene}
            style={styles.sendBtn}
          />
        )}
      </div>
      {isLoading && (
        <div style={styles.loadingHint}>
          <Spin size="small" />
          <span style={{ marginLeft: 8, color: tokens.textMuted, fontSize: 12 }}>
            AI 正在思考...
          </span>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '12px 24px 16px',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    border: `1px solid ${tokens.border}`,
    borderRadius: '10px',
    background: tokens.bgTertiary,
    color: tokens.textPrimary,
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: tokens.fontBody,
    lineHeight: '1.5',
    height: '44px',
    maxHeight: '120px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: '40px',
    height: '40px',
    background: tokens.amber500,
    borderColor: tokens.amber500,
    flexShrink: 0,
  },
  stopBtn: {
    width: '40px',
    height: '40px',
    background: tokens.statusRed,
    borderColor: tokens.statusRed,
    color: '#fff',
    flexShrink: 0,
  },
  loadingHint: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
    paddingLeft: '4px',
  },
}
