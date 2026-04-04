import api from './axiosInstance'

/**
 * Fetch learning resources for a given career role.
 * @param {'PM'|'SWE'|'ML'|'Data'} role
 * @returns {Promise<Array<{id, title, url, description, resource_type, difficulty}>>}
 */
export const getResources = (role) =>
  api.get(`/api/resources/${role}`).then(r => r.data)
