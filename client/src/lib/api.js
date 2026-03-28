import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 60000
});

export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    }
  });

  return response.data;
}

export async function runQuery(fileId, question) {
  const response = await api.post('/api/query', { fileId, question });
  return response.data;
}

export async function runRawSQL(fileId, sql) {
  const response = await api.post('/api/query/raw', { fileId, sql });
  return response.data;
}
