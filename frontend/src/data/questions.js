/**
 * Assessment Questions
 *
 * IMPORTANT: This array must stay in sync with backend/services/scoring.py
 * QUESTION_WEIGHTS by index position.
 * If you add, remove, or reorder questions, update both files together.
 *
 * All questions use a 1–5 Likert scale.
 * scaleLabels defines the anchor labels for the two extremes.
 */
export const QUESTIONS = [
  {
    id: 'q1',
    text: 'When you encounter a complex problem, you prefer to:',
    scaleLabels: {
      1: 'Dig into code / technical details',
      5: 'Map stakeholders and define requirements',
    },
    // Weights: PM=0.4, SWE=0.2, ML=0.2, Data=0.2
  },
  {
    id: 'q2',
    text: 'Which activity energizes you the most?',
    scaleLabels: {
      1: 'Building and shipping features',
      5: 'Running roadmap meetings and driving strategy',
    },
    // Weights: PM=0.5, SWE=0.1, ML=0.2, Data=0.2
  },
  {
    id: 'q3',
    text: 'Rate your comfort writing code from scratch to solve a problem.',
    scaleLabels: {
      1: 'Not comfortable at all',
      5: 'Very comfortable — I do it daily',
    },
    // Weights: PM=0.1, SWE=0.5, ML=0.3, Data=0.1
  },
  {
    id: 'q4',
    text: 'How often do you work with large datasets, spreadsheets, or databases?',
    scaleLabels: {
      1: 'Rarely or never',
      5: 'Daily or constantly',
    },
    // Weights: PM=0.1, SWE=0.1, ML=0.3, Data=0.5
  },
  {
    id: 'q5',
    text: 'Rate your genuine interest in machine learning concepts (neural nets, embeddings, gradient descent).',
    scaleLabels: {
      1: 'No real interest',
      5: 'Deep passion — I read papers for fun',
    },
    // Weights: PM=0.1, SWE=0.2, ML=0.5, Data=0.2
  },
  {
    id: 'q6',
    text: 'How comfortable are you leading meetings, driving decisions, and aligning people across teams?',
    scaleLabels: {
      1: 'I prefer to avoid this',
      5: 'This is my natural strength',
    },
    // Weights: PM=0.5, SWE=0.1, ML=0.1, Data=0.3
  },
  {
    id: 'q7',
    text: 'Rate your experience writing SQL queries or working with relational databases.',
    scaleLabels: {
      1: "I've never written SQL",
      5: 'I write complex queries regularly',
    },
    // Weights: PM=0.1, SWE=0.2, ML=0.2, Data=0.5
  },
  {
    id: 'q8',
    text: 'How often do you build, prototype, or ship software features?',
    scaleLabels: {
      1: 'Never',
      5: "Constantly — I'm always building",
    },
    // Weights: PM=0.2, SWE=0.5, ML=0.2, Data=0.1
  },
  {
    id: 'q9',
    text: 'How comfortable are you translating technical results into plain language for non-technical stakeholders?',
    scaleLabels: {
      1: 'Very uncomfortable',
      5: 'Natural communicator — I love this',
    },
    // Weights: PM=0.5, SWE=0.1, ML=0.2, Data=0.2
  },
  {
    id: 'q10',
    text: 'Rate your interest in statistics, probability, and quantitative reasoning.',
    scaleLabels: {
      1: 'Not interested',
      5: 'Strong passion — it informs how I think',
    },
    // Weights: PM=0.1, SWE=0.1, ML=0.4, Data=0.4
  },
  {
    id: 'q11',
    text: 'How often do you write user stories, define acceptance criteria, or manage a product backlog?',
    scaleLabels: {
      1: 'Never',
      5: 'This is my regular workflow',
    },
    // Weights: PM=0.5, SWE=0.2, ML=0.1, Data=0.2
  },
  {
    id: 'q12',
    text: 'Rate your comfort with algorithms, data structures, and Big-O complexity analysis.',
    scaleLabels: {
      1: 'Not comfortable',
      5: 'Very strong — I enjoy optimizing code',
    },
    // Weights: PM=0.1, SWE=0.5, ML=0.3, Data=0.1
  },
  {
    id: 'q13',
    text: 'How interested are you in building predictive models that learn from historical data?',
    scaleLabels: {
      1: 'Not interested',
      5: 'Core passion — this is why I code',
    },
    // Weights: PM=0.1, SWE=0.1, ML=0.5, Data=0.3
  },
  {
    id: 'q14',
    text: 'How often do you use data analysis or metrics to justify or change a decision?',
    scaleLabels: {
      1: 'Rarely — I go with intuition',
      5: 'Always — I am data-first',
    },
    // Weights: PM=0.3, SWE=0.1, ML=0.2, Data=0.4
  },
  {
    id: 'q15',
    text: 'Rate your interest in system design: designing APIs, microservices, and scalable infrastructure.',
    scaleLabels: {
      1: 'No interest',
      5: 'Strong interest — I love thinking about scale',
    },
    // Weights: PM=0.2, SWE=0.5, ML=0.2, Data=0.1
  },
]

export const TOTAL_QUESTIONS = QUESTIONS.length // 15
