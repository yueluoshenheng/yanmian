import { Card } from 'antd'
import { tokens } from '../../theme/tokens'

interface Props {
  title: string
  value: number
  suffix?: string
  icon: React.ReactNode
  color: string
  extra?: React.ReactNode
}

export default function StatCard({ title, value, suffix, icon, color, extra }: Props) {
  return (
    <Card
      style={{
        ...styles.card,
        borderLeft: `3px solid ${color}`,
      }}
      styles={{ body: { padding: '20px' } }}
    >
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <span style={{ fontSize: 18, color, opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={styles.valueRow}>
        <span
          style={{
            ...styles.value,
            color,
          }}
        >
          {value}
        </span>
        {suffix && <span style={styles.suffix}>{suffix}</span>}
      </div>
      {extra}
    </Card>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: tokens.bgSecondary,
    border: `1px solid ${tokens.border}`,
    borderRadius: '10px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '13px',
    color: tokens.textSecondary,
    fontWeight: 500,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  value: {
    fontFamily: tokens.fontDisplay,
    fontSize: '36px',
    fontWeight: 700,
    lineHeight: 1,
  },
  suffix: {
    fontSize: '14px',
    color: tokens.textSecondary,
  },
}
