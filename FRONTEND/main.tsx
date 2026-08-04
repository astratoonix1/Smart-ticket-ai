import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import {
  Header,
  TicketsListPage,
  CreateTicketPage,
  TicketDetailPage,
  AdminDashboardPage,
} from './components';

const App: React.FC = () => (
  <div className="min-h-screen bg-slate-900 text-slate-100">
    <Header />
    <main className="container mx-auto p-4 md:p-6">
      <Routes>
        <Route path="/" element={<TicketsListPage />} />
        <Route path="/tickets/new" element={<CreateTicketPage />} />
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<TicketsListPage />} />
      </Routes>
    </main>
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
