export const API_BASE_URL = '/api'

export const SCENE_LABELS: Record<string, string> = {
  equipment_tuning: '设备调优',
  doc_search: '文档检索',
  shipping_stats: '发货统计',
}

export const SCENE_DESCRIPTIONS: Record<string, string> = {
  equipment_tuning: '生产设备智能调优，实时监控与参数优化',
  doc_search: '岩棉技术文档智能检索与知识问答',
  shipping_stats: '发货数据统计分析与报表查询',
}

export const ROLE_LABELS: Record<string, string> = {
  production_leader: '生产班长',
  accountant: '会计',
  logistics: '物流专员',
  manager: '管理层',
}

export const QUICK_ACTIONS: Record<string, Array<{ label: string; message: string }>> = {
  equipment_tuning: [
    { label: '查看A1产线状态', message: '查看一下A1车间的生产情况' },
    { label: '查看A2产线状态', message: '查看一下A2车间的生产情况' },
    { label: '查询岩棉生产流程', message: '岩棉的标准生产流程是什么？' },
    { label: '设备异常排查', message: 'A1产线有设备告警，帮我排查一下' },
  ],
  doc_search: [
    { label: '岩棉生产工艺', message: '岩棉的生产工艺流程是怎样的？' },
    { label: '熔炉操作规范', message: '熔炉的操作规范和注意事项有哪些？' },
    { label: '产品规格参数', message: '岩棉板的产品规格参数是什么？' },
    { label: '常见故障处理', message: '离心机常见故障及处理方法有哪些？' },
  ],
  shipping_stats: [
    { label: '今日发货统计', message: '今天的发货统计情况' },
    { label: '本周发货汇总', message: '本周的发货汇总数据' },
    { label: '本月发货报表', message: '生成本月的发货统计报表' },
    { label: '查询物流状态', message: '查询最近的物流配送状态' },
  ],
}
