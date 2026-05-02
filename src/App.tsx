import { Routes, Route, Navigate } from 'react-router';
import { LandingPage } from '@/pages/LandingPage';
import { InputPage } from '@/pages/InputPage';
import { ResultPage } from '@/pages/ResultPage';
import { Atmosphere } from '@/components/Atmosphere';

function App() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#e8e4dc] font-sans antialiased overflow-hidden">
      <Atmosphere />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/diagnose" element={<InputPage />} />
        <Route path="/report" element={<ResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
