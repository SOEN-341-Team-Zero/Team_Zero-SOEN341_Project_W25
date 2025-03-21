import { AppBar, Box, Button, Container, Grid, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: '#769B86', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Navigation Bar */}
      <AppBar position='static' sx={{ backgroundColor: '#729480', width: '100%', padding: 1 }} elevation={0}>
        <Container maxWidth='lg'>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography variant='h6' component='div' sx={{ cursor: 'pointer', fontWeight: 'bold', marginLeft: 0 }}>
              ChatHaven
            </Typography>
            <Box>
              <Button sx={{ color: 'white' }}>Home</Button>
              <Button sx={{ color: 'white' }} onClick={() => navigate('/register')}>Login</Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 20, color: 'white', width: '100%', background: 'linear-gradient(to bottom, #2A332E, #5F7F71)' }}>
        <Typography variant='h2' gutterBottom fontWeight='bold'>
          DISCOVER YOUR COMMUNITY...
        </Typography>
        <Typography variant='h6' paragraph>
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
      <Container maxWidth='lg' sx={{ py: 10, background: 'linear-gradient(to bottom, #769B86, #A1B1A1)', borderRadius: 4, mt: -5 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant='h5' fontWeight='bold'>
              Real-Time Chat
            </Typography>
            <Typography>
              Communicate instantly with your team and community.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant='h5' fontWeight='bold'>
              Secure Collaboration
            </Typography>
            <Typography>
              Share files securely and collaborate effortlessly.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant='h5' fontWeight='bold'>
              Easy Integration
            </Typography>
            <Typography>
              Integrate with popular tools for productivity.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Footer Section */}
      <Box sx={{ textAlign: 'center', py: 5, backgroundColor: '#2A332E', color: 'white', width: '100%', mt: 5 }}>
        <Typography variant='body2'>
          © 2025 ChatHaven. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
