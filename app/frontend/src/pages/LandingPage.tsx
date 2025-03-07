import { AppBar, Box, Button, Container, Grid, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Navigation Bar */}
      <AppBar position='static' color='transparent' elevation={0}>
        <Container maxWidth='lg'>
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography variant='h6' component='div' sx={{ cursor: 'pointer' }}>
              ChatHaven
            </Typography>
            <Box>
              <Button sx={{ color: '#2e3a2b' }}>Home</Button>
              <Button sx={{ color: '#2e3a2b' }}>Features</Button>
              <Button sx={{ color: '#2e3a2b' }}>Support</Button>
              <Button sx={{ color: '#2e3a2b' }}>Login</Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 15, backgroundColor: '#1E1E1E', opacity: 0.8, color: '#dce3dc' }}>
        <Typography variant='h2' gutterBottom>
          DISCOVER YOUR COMMUNITY...
        </Typography>
        <Typography variant='h6' color='primary' paragraph>
          ... a place where ideas spark, friendships grow, and communities thrive.
        </Typography>
        <Button 
          variant='contained' 
          color='success' 
          sx={{ m: 1 }}
          onClick={() => navigate('/register')}
        >
          Get Started
        </Button>
        <Button 
          variant='outlined' 
          color='primary' 
          sx={{ m: 1 }}
        >
          Learn More
        </Button>
      </Box>

      {/* Features Section */}
      <Container maxWidth='lg'>
        <Box sx={{ py: 5 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant='h5' gutterBottom>
                Real-Time Chat
              </Typography>
              <Typography>
                Communicate instantly with your team and community.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant='h5' gutterBottom>
                Secure Collaboration
              </Typography>
              <Typography>
                Share files securely and collaborate effortlessly.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant='h5' gutterBottom>
                Easy Integration
              </Typography>
              <Typography>
                Integrate with popular tools for productivity.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Footer Section */}
      <Box sx={{ textAlign: 'center', py: 3, mt: 5, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant='body2' color='#a1b1a1'>
          © 2025 Your Company. All rights reserved.
        </Typography>
      </Box>
    </>
  );
}
