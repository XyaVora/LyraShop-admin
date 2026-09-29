import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { restoreSession } from "../../services/api/authApi.js";
import LoadingState from "../../components/common/LoadingState.jsx";
import { useUiStore } from "../../store/uiStore.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

export default function AppProviders({ children }) {
  const [ready, setReady] = useState(false);
  const theme = useUiStore((state) => state.theme);
  const density = useUiStore((state) => state.density);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = density;
  }, [theme, density]);

  useEffect(() => {
    let cancelled = false;
    restoreSession()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="p-5">
        <LoadingState label="Đang khởi tạo phiên..." />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}
