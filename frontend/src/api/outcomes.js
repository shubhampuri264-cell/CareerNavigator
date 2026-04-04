import api from './axiosInstance'

/**
 * Record a post-assessment confidence rating.
 * The backend computes and stores the confidence delta automatically.
 * @param {string} assessmentId
 * @param {number} postConfidence  1–10
 * @returns {Promise<{id, confidence_delta, ...}>}
 */
export const createOutcome = (assessmentId, postConfidence) =>
  api.post('/api/outcomes/', {
    assessment_id: assessmentId,
    post_confidence: postConfidence,
  }).then(r => r.data)

/**
 * Fetch all outcomes for the authenticated user.
 * @param {string} userId
 */
export const getUserOutcomes = (userId) =>
  api.get(`/api/outcomes/user/${userId}`).then(r => r.data)
