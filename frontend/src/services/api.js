import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to attempt refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && localStorage.getItem('refresh_token')) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const res = await axios.post('/api/v1/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const newToken = res.data.data.access_token;
        localStorage.setItem('access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const aiAPI = {
  uploadPdf: (formData) => api.post('/ai/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  listDocuments: (page = 1) => api.get(`/ai/documents?page=${page}`),
  generateQuestions: (params) => api.post('/ai/generate-questions', params),
  generateStudyContent: (params) => api.post('/ai/generate-study-content', params),
  chat: (params) => api.post('/ai/chat', params),
  listConversations: (page = 1) => api.get(`/ai/conversations?page=${page}`),
  getConversation: (id) => api.get(`/ai/conversations/${id}`),
};

export const teacherAPI = {
  createAssignment: (examData) => api.post('/teacher/create-assignment', examData),
  listExams: (page = 1) => api.get(`/teacher/exams?page=${page}`),
  getExam: (id) => api.get(`/teacher/exams/${id}`),
  assignToStudents: (data) => api.post('/teacher/assign-to-students', data),
  getPendingEvaluations: (page = 1) => api.get(`/teacher/pending-evaluations?page=${page}`),
  getSubmission: (attemptId) => api.get(`/teacher/submissions/${attemptId}`),
  evaluateAnswer: (evalData) => api.post('/teacher/evaluate-answer', evalData),
  getExamOverview: (examId) => api.get(`/teacher/exam-overview/${examId}`),
  getQuestionAnalytics: (examId, questionId) => api.get(`/teacher/question-analytics/${examId}/${questionId}`),
  listCohorts: () => api.get('/teacher/cohorts'),
  createCohort: (data) => api.post('/teacher/cohorts', data),
};

export const studentAPI = {
  getMyAssignments: (page = 1) => api.get(`/student/my-assignments?page=${page}`),
  startExam: (examId) => api.post('/student/start-exam', { exam_id: examId }),
  saveProgress: (attemptId, answers) => api.post('/student/save-progress', { attempt_id: attemptId, answers }),
  submitExam: (attemptId, answers) => api.post('/student/submit-exam', { attempt_id: attemptId, answers }),
  getMyResults: (page = 1) => api.get(`/student/my-results?page=${page}`),
  getResultDetail: (attemptId) => api.get(`/student/results/${attemptId}`),
};

export default api;

