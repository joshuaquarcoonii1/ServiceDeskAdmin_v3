import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

// Styled Components
const LoginWrapper = styled.div`
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background: linear-gradient(to right, #6a11cb, #2575fc);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  margin-bottom: 1.5rem;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: #6a11cb;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: #2575fc;
  }
`;

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (username, password, role, navigate) => {
    try {
      const response = await axios.post('http://172.20.10.2:5000/AdminLogin', { username, password, role });

      if (response.status === 200) {
        console.log('Login successful:', response.data);
        alert('Login successful!');
        localStorage.setItem('token', response.data.token);

        // Navigate based on role
        if (role === 'admin') {
          navigate('/dashboard'); // Redirect to the dashboard for admin
        } else if (role === 'clientService') {
          navigate('/another-screen'); // Redirect to the escalated complaints screen for client service
        } else {
          alert('Invalid role specified.');
        }
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(error.response.data.message || 'Login failed. Please try again.');
      } else if (error.request) {
        console.error('No response received:', error.request);
        alert('No response from the server. Please try again later.');
      } else {
        console.error('Error:', error.message);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const role = e.target.role.value;

    if (!username || !password || !role) {
      alert('Please fill out all fields.');
      return;
    }

    await handleLogin(username, password, role, navigate);
  };

  return (
    <LoginWrapper>
      <LoginContainer>
        <Title>Login</Title>
        <form onSubmit={onLoginSubmit}>
          <div>
            <label>Username:</label>
            <Input type="text" name="username" required />
          </div>
          <div>
            <label>Password:</label>
            <Input type="password" name="password" required />
          </div>
          <div>
            <label>Role:</label>
            <select name="role" required>
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="clientService">Client Service</option>
            </select>
          </div>
          <Button type="submit">Login</Button>
        </form>
      </LoginContainer>
    </LoginWrapper>
  );
};

export default Login;
