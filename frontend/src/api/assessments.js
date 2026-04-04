import api from './axiosInstance'

/**
 * Start a new assessment for a guest session.
 * @param {string} sessionId
 * @returns {Promise<{id: string, session_id: string, status: string, ...}>}
 */
export const startAssessment = (sessionId) =>
  api.post('/api/assessments/start', {
    session_id: sessionId,
    pre_confidence: 5,   // default — no pre-confidence screen in v2
  }).then(r => r.data)

/**
 * Submit answers and receive scored + AI results.
 * @param {string} assessmentId
 * @param {Record<string, number>} answers  e.g. { q1: 3, q2: 5, ... }
 */
export const submitAssessment = (assessmentId, answers) =>
  api.post('/api/assessments/submit', {
    assessment_id: assessmentId,
    answers,
  }).then(r => r.data)

/**
 * Fetch a single assessment by ID.
 * @param {string} assessmentId
 */
export const getAssessment = (assessmentId) =>
  api.get(`/api/assessments/${assessmentId}`).then(r => r.data)
