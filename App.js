// src/App.js
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload'; 
import QnA from './components/QnA';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard/>} />
        <Route path="/upload" element={<QnA/>} />
      </Routes>
    </Router>
  );
}

export default App;
