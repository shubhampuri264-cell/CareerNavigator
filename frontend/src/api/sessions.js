import api from './axiosInstance'

/**
 * Create a guest session — no account required.
 * @param {string} name  Required display name
 * @param {string|null} email  Optional — used to email results
 * @returns {Promise<{id: string, name: string, email: string|null, created_at: string}>}
 */
export const createSession = (name, email) =>
  api.post('/api/sessions', { name, email: email || null }).then(r => r.data)
