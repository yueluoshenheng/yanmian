export const ROLE_SCENE_MAP: Record<string, string[]> = {
  production_leader: ['equipment_tuning', 'doc_search'],
  accountant: ['doc_search', 'shipping_stats'],
  logistics: ['shipping_stats'],
  manager: ['equipment_tuning', 'doc_search', 'shipping_stats'],
}

export function getAllowedScenes(role: string): string[] {
  return ROLE_SCENE_MAP[role] ?? []
}
