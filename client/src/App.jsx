import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Workspace from './pages/Workspace';

export default function App() {
  const [sessionId] = useState(() => crypto.randomUUID());

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/workspace" element={<Workspace sessionId={sessionId} />} />
      </Routes>
    </BrowserRouter>
  );
}
