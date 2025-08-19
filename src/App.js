import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Sidebar from './components/Sidebar';
import FileConverter from './components/FileConverter';

function App() {
  const [selectedFeature, setSelectedFeature] = useState('file-converter');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="app">
        <Sidebar
          selectedFeature={selectedFeature}
          onFeatureSelect={setSelectedFeature}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<FileConverter />} />
            <Route path="/file-converter" element={<FileConverter />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
