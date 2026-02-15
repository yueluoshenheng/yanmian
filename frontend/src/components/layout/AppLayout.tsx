import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { Layout, Menu, Button, Avatar } from 'antd'
import {
  DashboardOutlined,
  ToolOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  LogoutOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'
import { getAllowedScenes } from '../../utils/roleSceneMap'
import { SCENE_LABELS, ROLE_LABELS } from '../../utils/constants'
import { tokens } from '../../theme/tokens'

const { Header, Sider, Content } = Layout

const SCENE_ICONS: Record<string, React.ReactNode> = {
  equipment_tuning: <ToolOutlined />,
  doc_search: <FileSearchOutlined />,
  shipping_stats: <BarChartOutlined />,
}

export default function AppLayout() {
  useAuth()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const role = user?.role ?? ''
  const scenes = getAllowedScenes(role)

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    ...scenes.map((s) => ({
      key: `/chat/${s}`,
      icon: SCENE_ICONS[s] ?? <RobotOutlined />,
      label: SCENE_LABELS[s] ?? s,
    })),
  ]

  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ??
    '/dashboard'

  if (!user) return null

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        width={200}
        style={styles.sider}
      >
        {/* Logo */}
        <div style={styles.logo} onClick={() => navigate('/dashboard')}>
          <RobotOutlined style={{ fontSize: 22, color: tokens.amber500 }} />
          <span style={styles.logoText}>泰石岩棉 AI</span>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderRight: 'none' }}
        />
      </Sider>

      <Layout>
        <Header style={styles.header}>
          <div />
          <div style={styles.userArea}>
            <span style={styles.roleBadge}>
              {ROLE_LABELS[role] ?? role}
            </span>
            <Avatar
              size="small"
              style={{
                background: tokens.amber500,
                color: tokens.bgPrimary,
                fontWeight: 600,
              }}
            >
              {user.display_name?.[0] ?? 'U'}
            </Avatar>
            <span style={styles.userName}>{user.display_name}</span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              style={{ color: tokens.textSecondary }}
              size="small"
            />
          </div>
        </Header>

        <Content style={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

const styles: Record<string, React.CSSProperties> = {
  sider: {
    background: tokens.bgSecondary,
    borderRight: `1px solid ${tokens.border}`,
    overflow: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 20px',
    cursor: 'pointer',
    borderBottom: `1px solid ${tokens.border}`,
    marginBottom: '8px',
  },
  logoText: {
    fontFamily: tokens.fontDisplay,
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.textPrimary,
    letterSpacing: '1px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    height: '52px',
    lineHeight: '52px',
    background: tokens.bgSecondary,
    borderBottom: `1px solid ${tokens.border}`,
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  roleBadge: {
    fontSize: '11px',
    color: tokens.amber500,
    background: `${tokens.amber500}18`,
    padding: '2px 8px',
    borderRadius: '4px',
    border: `1px solid ${tokens.amber500}33`,
  },
  userName: {
    color: tokens.textPrimary,
    fontSize: '13px',
  },
  content: {
    overflow: 'auto',
    height: '100%',
    background: tokens.bgPrimary,
  },
}
