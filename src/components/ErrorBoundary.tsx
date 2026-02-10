import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5', p: 3 }}>
          <Paper sx={{ p: 6, textAlign: 'center', maxWidth: 500, borderRadius: 4 }}>
            <ErrorOutlineIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>Oops! Something went wrong.</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              The application encountered an unexpected error. Don't worry, your data is safe.
            </Typography>
            <Box sx={{ mb: 4, p: 2, bgcolor: '#fff5f5', borderRadius: 2, textAlign: 'left', overflow: 'auto', maxHeight: 200 }}>
                <code style={{ fontSize: '0.8rem', color: '#d32f2f' }}>
                    {this.state.error?.toString()}
                </code>
            </Box>
            <Button 
                variant="contained" 
                size="large" 
                onClick={() => window.location.href = '#/'}
                fullWidth
            >
                Return to Dashboard
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
