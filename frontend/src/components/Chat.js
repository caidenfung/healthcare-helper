import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper } from '@mui/material';

const Chat = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const { report_id } = useParams(); // Hook to get the dynamic parameter
  const [chatLog, setChatLog] = useState([]);
  const [summary, setSummary] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [investigation, setInvestigation] = useState([]);
  const [error, setError] = useState('');
  const chatWindowRef = useRef(null);

  const handleLogout = async () => {
    try {
      const response = await fetch('/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Logout successful');
        navigate('/login'); // Redirect to the login page after successful logout
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    const fetchChatContent = async () => {
      try {
        const response = await fetch(`/api/chat/${report_id}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Chat content:', data.content);
          const chat_log = data['chat']; // Chat log as a list of each message
          const summary = data['summary']; // List where each element is a line
          const diagnoses = data['diagnoses']; // List where each element is a line
          const investigation = data['investigations']; // List where each element is a line
          console.log('Chat log:', chat_log);
          console.log('Summary:', summary);
          console.log('Potential Diagnoses:', diagnoses);
          console.log('Investigations:', investigation);
          setChatLog(chat_log);
          setSummary(summary);
          setDiagnoses(diagnoses);
          setInvestigation(investigation);
        } else {
          const errorData = await response.json();
          setError(errorData.message);
        }
      } catch (error) {
        console.error('Error fetching chat content:', error);
        setError('An error occurred. Please try again.');
      }
    };

    fetchChatContent();
  }, [report_id]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatLog]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h4">Chat Page</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e3f2fd' }}>
          <Typography variant="h6" gutterBottom>
            Chat Report ID: {report_id}
          </Typography>
          <Box
            className="chat-window"
            sx={{ maxHeight: '400px', overflowY: 'auto', mb: 2 }}
            ref={chatWindowRef}
          >
            {chatLog.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: index % 2 === 0 ? '#bbdefb' : '#c8e6c9',
                    maxWidth: '75%',
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="body1">{msg}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            {summary.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: '#e3f2fd',
                  mb: 1,
                  textAlign: 'left',
                }}
              >
                <Typography variant="body1">{item}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Potential Diagnoses
            </Typography>
            {diagnoses.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: '#e3f2fd',
                  mb: 1,
                  textAlign: 'left',
                }}
              >
                <Typography variant="body1">{item}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Investigation
            </Typography>
            {investigation.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: '#e3f2fd',
                  mb: 1,
                  textAlign: 'left',
                }}
              >
                <Typography variant="body1">{item}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Chat;