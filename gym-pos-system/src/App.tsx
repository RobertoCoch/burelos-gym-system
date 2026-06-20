import AppRouter from "./routes/AppRouter";
import { ToastProvider } from "./context/ToastContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Opcional, para no recargar a lo loco
      staleTime: 1000 * 60 * 5, // 5 minutos de cache
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
