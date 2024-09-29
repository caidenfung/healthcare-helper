import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';

const Patient = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically

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

  const handleNewReport = async () => {
    try {
      const response = await fetch('/api/new_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const report_id = data.report_id;
        navigate(`/helper_chat/${report_id}`); // Redirect to the helper chat page with the new report_id
      } else {
        console.error('Failed to create new report');
      }
    } catch (error) {
      console.error('Error creating new report:', error);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h4">Patient Page</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleNewReport} sx={{ fontSize: '1.25rem', py: 1.5, px: 4 }}>
              Start new screening
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Patient;