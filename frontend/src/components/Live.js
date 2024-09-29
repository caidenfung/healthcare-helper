import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Typography, Box, TextField, Paper } from '@mui/material';
import { keyframes } from '@emotion/react';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';

const typingAnimation = keyframes`
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
  100% { content: '.'; }
`;

const Live = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const { report_id } = useParams(); // Get the report_id from the URL
  const [messages, setMessages] = useState([{ text: `Hello! I am called the Healthcare Helper, 
    and I'm here to ask you a few more questions so your doctor can better help you. 
    What is the reason for your visit?`, sender: "system" }]);
  const [inputValue, setInputValue] = useState('');
  const [nextValue, setNextValue] = useState('');
  const [isChatActive, setIsChatActive] = useState(true);
  const [isTyping, setIsTyping] = useState(false); // State for typing indicator
  const [isTTSOn, setTTS] = useState(true);
  const chatWindowRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [usingSTT, setUsingSTT] = useState(false);
  // if (!browserSupportsSpeechRecognition) {
  //   // don't worry about this right now
  //   return <span>Browser doesn't support speech recognition.</span>;
  // }

  const handleSttToggle = async () => {
    setUsingSTT(true);
    if (!listening) {
      resetTranscript();
      SpeechRecognition.startListening();
    }
  }

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

  const handleTTS = async () => {
    setTTS(!isTTSOn);
    /*if (isTTSOn) {
      setTTS(false);
    } else {
      setTTS(true);
    }*/
  };

  const handleSendMessage = async () => {
    let userMessage = '';
    if (usingSTT) {
      userMessage = transcript.trim();
      resetTranscript();
      setUsingSTT(false);
    }
    else {
      userMessage = inputValue.trim();
    }

    if (!userMessage) {
      return;
    }

    setMessages((prevMessages) => [...prevMessages, { text: userMessage, sender: "user" }]);
    setInputValue('');
    setIsTyping(true); // Show typing indicator

    try {
      const response = await fetch('/api/helper_api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messages.length === 1 ? `Hello! I am called the Healthcare Helper, 
            and I'm here to ask you a few more questions so your doctor can better help you. 
            What is the reason for your visit? ${userMessage}` : userMessage,
          next: nextValue,
          report_id: report_id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API response:', data); // Debugging statement

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.model_response, sender: "system" },
        ]);
        setNextValue(data.next);

        if (isTTSOn) {
          fetchAndPlayTTS(data.model_response); 
        }

        // wait 0.7 seconds
        await new Promise((resolve) => setTimeout(resolve, 700));
        setIsTyping(false); // Hide typing indicator

        if (data.end) {
          setIsChatActive(false);
        }
      } else {
        console.error('Failed to send message');
        setIsTyping(false); // Hide typing indicator
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false); // Hide typing indicator
    }
  };

  const fetchAndPlayTTS = async (text) => {
    const apiKey = '1d9130ae-fc22-47ff-a57a-6cc392617cc6'; // move to secrets file lmao
    const url = 'https://api.cartesia.ai/tts/bytes';
    const headers = {
      'Cartesia-Version': '2024-09-29',
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    };
    const data = {
      transcript: text,
      model_id: 'sonic-english',
      // a0e99841-438c-4a64-b679-ae501e7d6091 (this one is faster than the others?)
      voice: { mode: 'id', id: '156fb8d2-335b-4950-9cb3-a2d33befec77' }, // can replace id with fun stuff
      output_format: { container: 'wav', encoding: 'pcm_s16le', sample_rate: 44100 },
    };

    try {
      // Fetch the TTS audio
      const response = await axios.post(url, data, { headers, responseType: 'arraybuffer' });
      const audioBlob = new Blob([response.data], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error fetching TTS audio:', error);
    }
  }
  

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
    // call tts api on first msg
  }, [messages, isTyping]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h4">Live Chat</Typography>
        <Button variant="contained" color={isTTSOn ? "success" : "primary"} onClick={handleTTS}>
          Text-to-Speech is: {isTTSOn ? "Enabled" : "Disabled"}
        </Button>
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
        
      </Box>
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#e3f2fd' }}>
          <Typography variant="h6" gutterBottom>
            Screening ID: {report_id}
          </Typography>
          <Box
            className="chat-window"
            sx={{ maxHeight: '400px', overflowY: 'auto', mb: 2 }}
            ref={chatWindowRef}
          >
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'system' ? 'flex-start' : 'flex-end',
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: msg.sender === 'system' ? '#bbdefb' : '#c8e6c9',
                    maxWidth: '75%',
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="body1">{msg.text}</Typography>
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box
                sx={{
                  p: 1,
                  mb: 1,
                  borderRadius: 1,
                  backgroundColor: '#bbdefb',
                  alignSelf: 'flex-start',
                  maxWidth: '75%',
                  textAlign: 'left',
                  '::after': {
                    content: '""',
                    animation: `${typingAnimation} 1s infinite`,
                  },
                }}
              />
            )}
          </Box>
          {isChatActive ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                value={usingSTT ? transcript : inputValue}
                onChange={(e) => {
                  console.log(e.target.value); setInputValue(e.target.value)}}
                placeholder="Type your message..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                autoComplete='off'
                sx={{ mr: 2 }}
              />
              <Button variant="contained" color="primary" onClick={handleSendMessage}>
                Send
              </Button>
              <IconButton variant="contained" color="primary" onClick={handleSttToggle}>  
                <MicIcon color={listening ? 'success' : 'disabled'}/> 
              </IconButton>   
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="contained" color="primary" onClick={() => navigate('/patient/')}>
                Return to home page
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Live;