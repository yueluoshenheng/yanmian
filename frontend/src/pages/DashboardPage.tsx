import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tag, Spin, Badge } from 'antd'
import {
  AlertOutlined,
  BookOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'
import { useDashboardStore } from '../stores/dashboardStore'
import { ROLE_LABELS } from '../utils/constants'
import { getAllowedScenes } from '../utils/roleSceneMap'
import { tokens } from '../theme/tokens'
import StatCard from '../components/dashboard/StatCard'
import QuickActions from '../components/dashboard/QuickActions'

export default function DashboardPage() {
  useAuth()
  const user = useAuthStore((s) => s.user)
  const { data, loading, fetchDashboard } = useDashboardStore()
  const navigate = useNavigate()
  const role = user?.role ?? ''
  const scenes = getAllowedScenes(role)

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (!user) return null

  return (
    <div style={styles.container}>
      {/* Welcome header */}
      <div style={styles.header} className="fade-in-up">
        <div>
          <h1 style={styles.welcome}>
            欢迎回来，{user.display_name}
          </h1>
          <p style={styles.subtitle}>
            <Tag
              color={tokens.amber500}
              style={{ marginRight: 8, borderRadius: 4 }}
            >
              {ROLE_LABELS[role] ?? role}
            </Tag>
            泰石岩棉 AI 智能业务系统
          </p>
        </div>
        <DashboardOutlined
          style={{ fontSize: 32, color: tokens.amber500, opacity: 0.6 }}
        />
      </div>

      {loading ? (
        <div style={styles.spinWrap}>
          <Spin size="large" />
        </div>
      ) : data ? (
        <>
          {/* Stat cards grid */}
          <div style={styles.grid} className="fade-in-up">
            {data.line_status && (
              <StatCard
                title="产线状态"
                value={data.line_status.running}
                suffix="条运行中"
                icon={<DashboardOutlined />}
                color={tokens.statusGreen}
                extra={
                  <div style={styles.lineStatusExtra}>
                    <Badge color={tokens.statusYellow} text={
                      <span style={{ color: tokens.textSecondary, fontSize: 13 }}>
                        预警 {data.line_status.warning}
                      </span>
                    } />
                    <Badge color={tokens.statusRed} text={
                      <span style={{ color: tokens.textSecondary, fontSize: 13 }}>
                        停机 {data.line_status.stopped}
                      </span>
                    } />
                  </div>
                }
              />
            )}

            {data.today_shipping && (
              <StatCard
                title="今日发货"
                value={data.today_shipping.orders}
                suffix="单"
                icon={<ShoppingCartOutlined />}
                color={tokens.statusBlue}
                extra={
                  <div style={{ color: tokens.textSecondary, fontSize: 13, marginTop: 8 }}>
                    {data.today_shipping.cubic_volume} m³ · ¥{data.today_shipping.amount.toLocaleString()}
                  </div>
                }
              />
            )}

            {data.alerts && (
              <StatCard
                title="活跃告警"
                value={data.alerts.length}
                suffix="条"
                icon={<AlertOutlined />}
                color={data.alerts.length > 0 ? tokens.statusRed : tokens.statusGreen}
                extra={
                  <div style={styles.alertList}>
                    {data.alerts.slice(0, 3).map((a, i) => (
                      <div key={i} style={styles.alertItem}>
                        <Tag
                          color={
                            a.severity === 'critical'
                              ? tokens.statusRed
                              : a.severity === 'warning'
                              ? tokens.statusYellow
                              : tokens.statusBlue
                          }
                          style={{ fontSize: 11, borderRadius: 3 }}
                        >
                          {a.severity}
                        </Tag>
                        <span style={{ color: tokens.textSecondary, fontSize: 12 }}>
                          {a.line} {a.equipment}: {a.issue}
                        </span>
                      </div>
                    ))}
                  </div>
                }
              />
            )}

            <StatCard
              title="知识库更新"
              value={data.knowledge_updates.recent_count}
              suffix="篇"
              icon={<BookOutlined />}
              color={tokens.amber500}
              extra={
                <div style={{ color: tokens.textSecondary, fontSize: 13, marginTop: 8 }}>
                  最近更新: {data.knowledge_updates.last_update}
                </div>
              }
            />
          </div>

          {/* Quick actions */}
          <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 style={styles.sectionTitle}>快速操作</h3>
            <QuickActions
              scenes={scenes}
              onNavigate={(scene) => navigate(`/chat/${scene}`)}
            />
          </div>
        </>
      ) : (
        <div style={styles.spinWrap}>
          <p style={{ color: tokens.textSecondary }}>暂无数据</p>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  welcome: {
    fontFamily: tokens.fontDisplay,
    fontSize: '28px',
    fontWeight: 600,
    color: tokens.textPrimary,
    margin: 0,
  },
  subtitle: {
    color: tokens.textSecondary,
    marginTop: '8px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  spinWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
  },
  lineStatusExtra: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px',
  },
  alertList: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  alertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionTitle: {
    fontFamily: tokens.fontDisplay,
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.textPrimary,
    marginBottom: '16px',
  },
}
