// src/App.js
import { UserProvider } from './components/UserContext';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload'; 
import QnA from './components/QnA';
import Login from './components/Login';
import Signup from './components/Signup';
import './index.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/upload" element={<QnA/>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;