import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, TextField, Link, FormControlLabel, Checkbox } from '@mui/material';

const Register = () => {
  const [formData, setFormData] = useState({
    is_doctor: false,
    name: '',
    email: '',
    password: '',
    age: '',
    sex: '',
    city: '',
    residence_status: '',
    employment_status: '',
    allergies: '',
    medications: '',
    vaccination_history: '',
    medical_history: '',
    surgeries: '',
    smoker: '',
    drinker: '',
    exercise_frequency: '',
    outside_the_country: '',
    if_outside_country_where: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        const is_doctor = data.is_doctor;
        if (is_doctor) {
          navigate('/doctor/');
        } else {
          navigate('/patient/');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f0f4f8', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Register Page
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '1.25rem' }}>
            Already have an account? <Link href="/login/">Sign in</Link>
          </Typography>
        </Box>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_doctor}
                onChange={handleChange}
                name="is_doctor"
                color="primary"
                sx={{ transform: 'scale(1.5)' }}
              />
            }
            label={
              <Typography variant="body1" sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                Are you registering as a doctor?
              </Typography>
            }
          />
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Full name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Box>
          {!formData.is_doctor && (
            <>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Sex"
                  type="text"
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="City"
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Residence Status"
                  type="text"
                  name="residence_status"
                  value={formData.residence_status}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Employment Status"
                  type="text"
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Allergies"
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Medications"
                  type="text"
                  name="medications"
                  value={formData.medications}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Vaccination History"
                  type="text"
                  name="vaccination_history"
                  value={formData.vaccination_history}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Medical History"
                  type="text"
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Do you smoke occasionally?"
                  type="text"
                  name="smoker"
                  value={formData.smoker}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Do you drink occasionally?"
                  type="text"
                  name="drinker"
                  value={formData.drinker}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Have you had any surgeries in the past?"
                  type="text"
                  name="surgeries"
                  value={formData.surgeries}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="How frequently do you exercise?"
                  type="text"
                  name="exercise_frequency"
                  value={formData.exercise_frequency}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Have you been outside the country in the past month?"
                  type="text"
                  name="outside_the_country"
                  value={formData.outside_the_country}
                  onChange={handleChange}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="If you've been outside the country, where? If not, please enter N/A"
                  type="text"
                  name="if_outside_country_where"
                  value={formData.if_outside_country_where}
                  onChange={handleChange}
                />
              </Box>
            </>
          )}
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Register
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default Register;