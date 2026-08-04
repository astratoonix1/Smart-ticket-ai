/* ======================= Types ======================= */

export type Role = 'user' | 'moderator' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  skills?: string[];
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  createdByName?: string;
  assignedTo?: User | string | null;
  status: string;
  priority?: string;
  helpfulNotes?: string;
  moderatorMessage?: string;
  relatedSkills?: string[];
  createdAt: string;
  updatedAt?: string;
}

/* ======================= API ======================= */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface UpdateUserData {
  email: string;
  role?: string;
  skills?: string[];
}

interface CreateTicketData {
  title: string;
  description: string;
  createdByName?: string;
}

const request = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'API request failed');
  }

  return response;
};

export const api = {
  getTickets: async (): Promise<Ticket[]> => {
    const response = await request('/tickets');
    return response.json();
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await request(`/tickets/${id}`);
    const data = await response.json();
    return data.ticket;
  },

  createTicket: async (data: CreateTicketData): Promise<Ticket> => {
    const response = await request('/tickets', { method: 'POST', body: JSON.stringify(data) });
    const resData = await response.json();
    return resData.ticket;
  },

  updateTicket: async (id: string, data: { title: string; description: string; assignedTo?: string | null }): Promise<Ticket> => {
    const response = await request(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    const resData = await response.json();
    return resData.ticket;
  },

  updateTicketStatus: async (id: string, data: { status: string; moderatorMessage?: string }): Promise<Ticket> => {
    const response = await request(`/tickets/${id}/status`, { method: 'PUT', body: JSON.stringify(data) });
    const resData = await response.json();
    return resData.ticket;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await request('/users/users');
    return response.json();
  },

  updateUser: async (data: UpdateUserData): Promise<User> => {
    const response = await request('/users/update-user', { method: 'POST', body: JSON.stringify(data) });
    const resData = await response.json();
    return resData.user;
  },
};
