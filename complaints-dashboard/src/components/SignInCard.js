import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MuiCard from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import ForgotPassword from './ForgotPassword';
import { GoogleIcon, FacebookIcon, VRAicon } from './CustomIcons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function SignInCard() {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [role, setRole] = React.useState('Select a Role');
  const [open, setOpen] = React.useState(false);
  const [snackopen, setsnackOpen] = React.useState(false);

  const handlesnackClick = () => {
     setsnackOpen(true);
   };
   const handlesnackClose = (event, reason) => {
     if (reason === 'clickaway') {
       return;
     }
 
     setsnackOpen(false);
   };
     const action = (
     <React.Fragment>
       
       <IconButton
         size="small"
         aria-label="close"
         color="inherit"
         onClick={handlesnackClose}
       >
         <CloseIcon fontSize="small" />
       </IconButton>
     </React.Fragment>
   );
  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogin = async (username, password, role) => {
    try {
      const response = await axios.post('https://servicedeskadmin-v3.onrender.com/AdminLogin', { username, password, role });

      if (response.status === 200) {
        console.log('Login successful:', response.data);
       setsnackOpen(true);
        // alert('Login successful!');
        localStorage.setItem('token', response.data.token);

        if (role === 'admin') {
          navigate('/dashboard');
        } else if (role === 'clientService') {
          navigate('/another-screen');
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

  const onLoginSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const password = data.get('password');

    if (!username || !password || !role) {
      alert('Please fill out all fields.');
      return;
    }

    await handleLogin(username, password, role);
  };

  return (
    <Card variant="outlined">
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <VRAicon />
      </Box>
      <Typography component="h1" variant="h4" sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
        Sign in
      </Typography>
      <Box component="form" onSubmit={onLoginSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 2 }}>
        <FormControl>
          <FormLabel htmlFor="username">Email</FormLabel>
          <TextField error={emailError} helperText={emailErrorMessage} id="username" type="username" name="username" placeholder="your@username.com" autoComplete="username" autoFocus required fullWidth variant="outlined" color={emailError ? 'error' : 'primary'} />
        </FormControl>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link component="button" type="button" onClick={handleClickOpen} variant="body2" sx={{ alignSelf: 'baseline' }}>
              Forgot your password?
            </Link>
          </Box>
          <TextField error={passwordError} helperText={passwordErrorMessage} name="password" placeholder="••••••" type="password" id="password" autoComplete="current-password" autoFocus required fullWidth variant="outlined" color={passwordError ? 'error' : 'primary'} />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="role">Role</FormLabel>
          <Select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)} fullWidth>
            <MenuItem value="Select a Role">Select a Role</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="clientService">Client Service</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
        <ForgotPassword open={open} handleClose={handleClose} />
        <Button type="submit" fullWidth variant="contained"onClick={handlesnackClick}>
          Sign in
        </Button>
      </Box>
      <Snackbar
        open={snackopen}
        autoHideDuration={6000}
        onClose={handlesnackClose}
        message="Welcome to the VRA Service Desk"
        action={action}
      />
    </Card>
  );
}
