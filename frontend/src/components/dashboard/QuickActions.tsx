import {
  ToolOutlined,
  FileSearchOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { SCENE_LABELS, SCENE_DESCRIPTIONS } from '../../utils/constants'
import { tokens } from '../../theme/tokens'

const SCENE_ICONS: Record<string, React.ReactNode> = {
  equipment_tuning: <ToolOutlined style={{ fontSize: 24 }} />,
  doc_search: <FileSearchOutlined style={{ fontSize: 24 }} />,
  shipping_stats: <BarChartOutlined style={{ fontSize: 24 }} />,
}

interface Props {
  scenes: string[]
  onNavigate: (scene: string) => void
}

export default function QuickActions({ scenes, onNavigate }: Props) {
  return (
    <div style={styles.grid}>
      {scenes.map((scene) => (
        <div
          key={scene}
          style={styles.card}
          onClick={() => onNavigate(scene)}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = tokens.amber500
            el.style.background = tokens.bgHover
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.borderColor = tokens.border
            el.style.background = tokens.bgSecondary
          }}
        >
          <div style={styles.iconWrap}>
            {SCENE_ICONS[scene]}
          </div>
          <div>
            <p style={styles.label}>{SCENE_LABELS[scene]}</p>
            <p style={styles.desc}>{SCENE_DESCRIPTIONS[scene]}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: tokens.bgSecondary,
    border: `1px solid ${tokens.border}`,
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  iconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    background: `${tokens.amber500}15`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.amber500,
    flexShrink: 0,
  },
  label: {
    fontFamily: tokens.fontDisplay,
    fontSize: '16px',
    fontWeight: 600,
    color: tokens.textPrimary,
    margin: 0,
  },
  desc: {
    fontSize: '12px',
    color: tokens.textSecondary,
    margin: '4px 0 0',
  },
}
