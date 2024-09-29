import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, List, ListItem, ListItemText, ListItemButton } from '@mui/material';

const Doctor = () => {
  const [chats, setChats] = useState([]);
  const [error, setError] = useState('');
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

  useEffect(() => {
    const fetchChats = async () => {
      try {
        console.log('Fetching chats...');
        const response = await fetch('/api/chats');
        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Chats fetched:', data);
          setChats(data);
        } else {
          const errorData = await response.json();
          console.error('Error fetching chats:', errorData.message);
          setError(errorData.message);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('An error occurred. Please try again.');
      }
    };

    fetchChats();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h4">Doctor Page</Typography>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <List>
          {chats.map((chat, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => navigate(chat.link)}
                sx={{
                  backgroundColor: '#bbdefb', // Slightly darker blue background
                  mb: 1, // Margin bottom
                  '&:hover': {
                    backgroundColor: '#90caf9', // Darker blue on hover
                  },
                  padding: 2, // Increase padding
                }}
              >
                <ListItemText
                  primary={`Name: ${chat.name}`}
                  secondary={`Report ID: ${chat.report_id}`}
                  primaryTypographyProps={{ fontSize: '1.1rem', fontWeight: 'bold' }} // Increase font size and make bold
                  secondaryTypographyProps={{ fontSize: '1rem' }} // Increase font size
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Container>
    </Box>
  );
};

export default Doctor;