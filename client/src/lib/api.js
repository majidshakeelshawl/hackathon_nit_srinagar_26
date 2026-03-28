import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 120000
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

export async function uploadMultiFiles(files, onProgress) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const response = await api.post('/api/upload/multi', formData, {
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

/**
 * POST /api/query/stream — SSE. Optional conversationContext: { previousSql, previousQuestion }
 */
export async function runQueryStream(fileId, question, handlers = {}, conversationContext = null) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const body = { fileId, question };
  if (conversationContext?.previousSql) {
    body.previousSql = conversationContext.previousSql;
    body.previousQuestion = conversationContext.previousQuestion || '';
  }

  const res = await fetch(`${base}/api/query/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify(body)
  });

  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || res.statusText || 'Request failed');
  }
  if (!ct.includes('text/event-stream')) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || 'Expected event stream');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const dispatch = (eventName, dataStr) => {
    if (!dataStr) return;
    let data;
    try {
      data = JSON.parse(dataStr);
    } catch {
      return;
    }
    switch (eventName) {
      case 'start':
        handlers.onStart?.();
        break;
      case 'sql_chunk':
        handlers.onSqlChunk?.(data.chunk);
        break;
      case 'sql':
        handlers.onSql?.(data.sql);
        break;
      case 'result':
        handlers.onResult?.(data);
        break;
      case 'explanation_chunk':
        handlers.onExplanationChunk?.(data.chunk);
        break;
      case 'insights':
        handlers.onInsights?.(data.bullets || []);
        break;
      case 'done':
        handlers.onDone?.();
        break;
      case 'error': {
        const msg = data.message || 'Stream error';
        handlers.onError?.(msg);
        throw new Error(msg);
      }
      default:
        break;
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const lines = block.split('\n');
      let eventName = 'message';
      const dataParts = [];
      for (const line of lines) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        else if (line.startsWith('data:')) dataParts.push(line.slice(5).trimStart());
      }
      dispatch(eventName, dataParts.join('\n'));
    }
  }
}

export async function runRawSQL(fileId, sql) {
  const response = await api.post('/api/query/raw', { fileId, sql });
  return response.data;
}

export async function createShareSnapshot(payload) {
  const response = await api.post('/api/share', payload);
  return response.data;
}

export async function fetchShareSnapshot(shareId) {
  try {
    const response = await api.get(`/api/share/${shareId}`);
    return response.data;
  } catch (e) {
    const msg = e.response?.data?.error || e.message || 'Not found';
    throw new Error(msg);
  }
}
