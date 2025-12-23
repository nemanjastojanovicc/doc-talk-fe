import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';

import ErrorBoundary, { ErrorFallback } from 'components/ErrorBoundary';
import { AuthProvider } from 'providers';
import Routes from 'router/components/Routes/Routes';
import routes from 'router/routes';
import { muiTheme } from 'config/muiTheme';

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <ErrorBoundary fallback={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <Toaster
                position="top-center"
                toastOptions={{ duration: 2500 }}
              />

              <Routes routes={routes} />
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
