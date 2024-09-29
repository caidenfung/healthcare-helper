import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Patient from './components/Patient';
import Doctor from './components/Doctor';
import Chat from './components/Chat';
import Live from './components/Live';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#60c035',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/patient" element={<Patient />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/chat/:report_id" element={<Chat />} />
            <Route path="/helper_chat/:report_id" element={<Live />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;