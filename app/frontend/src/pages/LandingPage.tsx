import { AppBar, Box, Button, Container, Grid2 as Grid, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/UserStore';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: '#769B86', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100vw' }}>
      {/* Navigation Bar */}
      <AppBar position='static' sx={{ backgroundColor: '#729480', width: '100%', padding: 1 }} elevation={0}>
        <Container maxWidth='lg'>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography onClick={() => navigate('/')} variant='h6' component='div' sx={{ cursor: 'pointer', fontWeight: 'bold', marginLeft: 0 }}>
              ChatHaven
            </Typography>
            <Box>
              {useUserStore(state => state.isLoggedIn) && <Button sx={{ color: 'white' }} onClick={() => navigate('/home')}>Home</Button>}
              <Button sx={{ color: 'white' }} onClick={() => navigate('/login')}>Login</Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 20, color: 'white', width: '100vw', background: 'linear-gradient(to bottom, #2A332E, #5F7F71)' }}>
        <Typography variant='h2' gutterBottom fontWeight='bold'>
          DISCOVER YOUR COMMUNITY...
        </Typography>
        <Typography variant='h6'>
          ...where your community can connect, collaborate, and grow.
        </Typography>
        <Button 
          variant='contained' 
          sx={{ backgroundColor: 'white', color: '#2A332E', fontWeight: 'bold', m: 1 }}
          onClick={() => navigate('/register')}
        >
          Get Started
        </Button>
      </Box>

      {/* Features Section */}
      <Container maxWidth='lg' sx={{ py: 10, background: 'linear-gradient(to bottom, #769B86, #A1B1A1)', borderRadius: 4, mt: -5, width: '100vw' }}>
        <Grid container spacing={4}>
          <Grid size={4}>
            <Typography variant='h5' fontWeight='bold'>
              Real-Time Group Chats
            </Typography>
            <Typography>
              Communicate instantly with your team and community.
            </Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant='h5' fontWeight='bold'>
              Private Communication
            </Typography>
            <Typography>
              Chat one-on-one with your friends and coworkers securely.
            </Typography>
          </Grid>
          <Grid size={4}>
            <Typography variant='h5' fontWeight='bold'>
              Enjoy the Experience
            </Typography>
            <Typography>
              Create new direct messages, teams, and channels now.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Footer Section */}
      <Box sx={{ textAlign: 'center', py: 5, backgroundColor: '#2A332E', color: 'white', width: '100vw', mt: 'auto' }}>
        <Typography variant='body2'>
          © 2025 ChatHaven. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
