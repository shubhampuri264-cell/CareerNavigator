import api from './axiosInstance'

/**
 * Submit feedback for a completed assessment.
 * @param {object} payload
 * @param {string} payload.assessment_id
 * @param {string} payload.session_id
 * @param {number} payload.rating           1–5
 * @param {string} payload.accuracy         "yes" | "somewhat" | "no"
 * @param {string} [payload.response]       Free-text
 * @param {boolean} [payload.email_requested]
 * @param {string} [payload.email_override] Email to use if different from session email
 */
export const submitFeedback = (payload) =>
  api.post('/api/feedback', payload).then(r => r.data)
