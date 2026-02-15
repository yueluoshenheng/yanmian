import { useAuthStore } from '../stores/authStore'

export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuthStore.getState().token
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (
    options.body &&
    typeof options.body === 'string' &&
    !headers['Content-Type']
  ) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    useAuthStore.getState().logout()
  }

  return res
}
