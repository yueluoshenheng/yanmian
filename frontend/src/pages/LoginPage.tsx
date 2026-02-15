import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { tokens } from '../theme/tokens'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      message.success('登录成功')
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={styles.container}>
      {/* Left decorative area */}
      <div style={styles.leftPanel}>
        <div style={styles.glowOrb} />
        <div style={styles.glowOrb2} />
        <div style={styles.gridOverlay} />
        <div style={styles.brandContent}>
          <div style={styles.logoMark}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect x="4" y="4" width="24" height="24" rx="2"
                stroke={tokens.amber500} strokeWidth="2" opacity="0.8" />
              <rect x="36" y="4" width="24" height="24" rx="2"
                stroke={tokens.amber500} strokeWidth="2" opacity="0.5" />
              <rect x="4" y="36" width="24" height="24" rx="2"
                stroke={tokens.amber500} strokeWidth="2" opacity="0.5" />
              <rect x="36" y="36" width="24" height="24" rx="2"
                stroke={tokens.amber500} strokeWidth="2" opacity="0.3" />
              <circle cx="32" cy="32" r="8" fill={tokens.amber500} opacity="0.9" />
            </svg>
          </div>
          <h1 style={styles.brandTitle}>泰石岩棉</h1>
          <p style={styles.brandSubtitle}>AI 智能业务系统</p>
          <div style={styles.dividerLine} />
          <p style={styles.brandDesc}>
            生产设备智能调优 · 技术文档检索 · 发货统计分析
          </p>
          {/* Decorative geometric lines */}
          <div style={styles.geoLines}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                ...styles.geoLine,
                width: `${120 - i * 20}px`,
                opacity: 0.15 + i * 0.05,
                marginTop: '8px',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard} className="fade-in-up">
          <h2 style={styles.formTitle}>系统登录</h2>
          <p style={styles.formSubtitle}>请输入您的账号信息</p>

          <div style={styles.inputGroup}>
            <Input
              size="large"
              placeholder="用户名"
              prefix={<UserOutlined style={{ color: tokens.textMuted }} />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <Input.Password
              size="large"
              placeholder="密码"
              prefix={<LockOutlined style={{ color: tokens.textMuted }} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
            />
          </div>

          {error && <div style={styles.errorMsg}>{error}</div>}

          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleLogin}
            style={styles.loginBtn}
          >
            登 录
          </Button>

          <p style={styles.footer}>泰石岩棉 AI 智能助手 v1.0</p>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: tokens.bgPrimary,
  },
  leftPanel: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minWidth: 0,
  },
  glowOrb: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${tokens.amber500}22 0%, transparent 70%)`,
    top: '20%',
    left: '30%',
    filter: 'blur(60px)',
  },
  glowOrb2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${tokens.amber600}18 0%, transparent 70%)`,
    bottom: '15%',
    right: '20%',
    filter: 'blur(80px)',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `linear-gradient(${tokens.border}33 1px, transparent 1px), linear-gradient(90deg, ${tokens.border}33 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    opacity: 0.3,
  },
  brandContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    padding: '40px',
  },
  logoMark: {
    marginBottom: '24px',
    display: 'inline-block',
  },
  brandTitle: {
    fontFamily: tokens.fontDisplay,
    fontSize: '48px',
    fontWeight: 700,
    color: tokens.textPrimary,
    margin: 0,
    letterSpacing: '4px',
  },
  brandSubtitle: {
    fontFamily: tokens.fontDisplay,
    fontSize: '20px',
    fontWeight: 500,
    color: tokens.amber500,
    margin: '8px 0 0',
    letterSpacing: '6px',
  },
  dividerLine: {
    width: '60px',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${tokens.amber500}, transparent)`,
    margin: '24px auto',
  },
  brandDesc: {
    color: tokens.textSecondary,
    fontSize: '14px',
    letterSpacing: '2px',
  },
  geoLines: {
    marginTop: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  geoLine: {
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${tokens.amber500}, transparent)`,
  },
  rightPanel: {
    width: '480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    borderLeft: `1px solid ${tokens.border}`,
  },
  formCard: {
    width: '100%',
    maxWidth: '360px',
    padding: '40px',
    borderRadius: '16px',
    background: `${tokens.bgSecondary}CC`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${tokens.border}`,
  },
  formTitle: {
    fontFamily: tokens.fontDisplay,
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.textPrimary,
    margin: 0,
  },
  formSubtitle: {
    color: tokens.textSecondary,
    fontSize: '14px',
    margin: '8px 0 32px',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  input: {
    background: tokens.bgTertiary,
    borderColor: tokens.border,
    height: '48px',
    fontSize: '15px',
  },
  errorMsg: {
    color: tokens.statusRed,
    fontSize: '13px',
    marginBottom: '16px',
    padding: '8px 12px',
    background: `${tokens.statusRed}11`,
    borderRadius: '6px',
    border: `1px solid ${tokens.statusRed}33`,
  },
  loginBtn: {
    height: '48px',
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '8px',
    marginTop: '8px',
    background: tokens.amber500,
    borderColor: tokens.amber500,
  },
  footer: {
    textAlign: 'center',
    color: tokens.textMuted,
    fontSize: '12px',
    marginTop: '32px',
  },
}
