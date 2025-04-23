
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BatchesPage from "./pages/BatchesPage";
import StudentsPage from "./pages/StudentsPage";
import TopicsPage from "./pages/TopicsPage";
import AttendancePage from "./pages/AttendancePage";
import CheckInPage from "./pages/CheckInPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/batches" element={<BatchesPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/check-in/:batchId/:code" element={<CheckInPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
