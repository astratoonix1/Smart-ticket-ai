import React, { useState, useEffect, useCallback, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { Link, NavLink, useParams, useNavigate } from 'react-router-dom';
import { api } from './api';
import { Ticket, User, Role } from './api';

/* ======================= Common UI ======================= */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', isLoading = false, className = '', ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = {
    primary: 'bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-500',
    secondary: 'bg-slate-600 text-slate-100 hover:bg-slate-700 focus:ring-slate-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-sky-400 hover:bg-sky-500/10',
  };
  const sizeStyles = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-base', lg: 'px-6 py-3 text-lg' };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => (
  <div>
    {label && <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>}
    <input
      id={id}
      className={`w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${className}`}
      {...props}
    />
  </div>
);

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = { sm: 'h-6 w-6', md: 'h-12 w-12', lg: 'h-24 w-24' };
  return <div className={`animate-spin rounded-full border-4 border-slate-700 border-t-sky-500 ${sizeClasses[size]}`}></div>;
};

/* ======================= Header ======================= */

const NavLinkItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`
    }
  >
    {children}
  </NavLink>
);

export const Header: React.FC = () => (
  <header className="bg-slate-800 shadow-lg">
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex-shrink-0 text-white font-bold text-xl flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-sky-400"><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"/><path d="M8 6V4"/><path d="M16 6V4"/><path d="M12 11h.01"/><path d="M12 16h.01"/><path d="M8 11h.01"/><path d="M8 16h.01"/><path d="M16 11h.01"/><path d="M16 16h.01"/></svg>
            SmartTicket-AI
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLinkItem to="/">Tickets</NavLinkItem>
              <NavLinkItem to="/admin">Admin</NavLinkItem>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
);

/* ======================= Ticket Card ======================= */

const PriorityBadge: React.FC<{ priority?: string }> = ({ priority }) => {
  if (!priority) return null;
  const colors: Record<string, string> = {
    LOW: 'bg-green-500/20 text-green-300',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300',
    HIGH: 'bg-orange-500/20 text-orange-300',
    URGENT: 'bg-red-500/20 text-red-300',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[priority.toUpperCase()] || ''}`}>{priority}</span>;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    TODO: 'bg-blue-500/20 text-blue-300',
    OPEN: 'bg-blue-500/20 text-blue-300',
    IN_PROGRESS: 'bg-purple-500/20 text-purple-300',
    RESOLVED: 'bg-gray-500/20 text-gray-300',
    CLOSED: 'bg-gray-600/20 text-gray-400',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status?.toUpperCase()] || ''}`}>{status}</span>;
};

const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => (
  <Link to={`/tickets/${ticket._id}`} className="block">
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 h-full flex flex-col justify-between hover:bg-slate-700/50 transition-all duration-300 border border-slate-700 hover:border-sky-500">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white pr-4">{ticket.title}</h3>
          <PriorityBadge priority={ticket.priority} />
        </div>
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{ticket.description}</p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <StatusBadge status={ticket.status} />
        <span className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  </Link>
);

/* ======================= Tickets List Page ======================= */

export const TicketsListPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTickets()
      .then(setTickets)
      .catch((err: any) => setError(err.message || 'Failed to fetch tickets.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">All Support Tickets</h1>
        <Link to="/tickets/new"><Button>Create New Ticket</Button></Link>
      </div>
      {tickets.length === 0 ? (
        <div className="text-center py-10 bg-slate-800 rounded-lg">
          <p className="text-slate-400">No tickets created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => <TicketCard key={ticket._id} ticket={ticket} />)}
        </div>
      )}
    </div>
  );
};

/* ======================= Create Ticket Page ======================= */

export const CreateTicketPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.createTicket({ title, description });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Create a New Ticket</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-500/20 text-red-300 rounded-md text-sm">{error}</div>}
          <Input
            id="title" name="title" type="text" required label="Subject"
            value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cannot reset my password"
          />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              id="description" name="description" rows={6} required
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              placeholder="Please provide as much detail as possible..."
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading} size="lg">Submit Ticket</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ======================= Ticket Detail Page ======================= */

const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-slate-400">{label}</dt>
    <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2">{children}</dd>
  </div>
);

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [moderatorMessage, setModeratorMessage] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!id) { setError('Invalid ticket ID.'); setIsLoading(false); return; }

    api.getTicketById(id)
      .then((fetchedTicket) => {
        setTicket(fetchedTicket);
        setTitle(fetchedTicket.title);
        setDescription(fetchedTicket.description);
        setStatus(fetchedTicket.status);
        setModeratorMessage(fetchedTicket.moderatorMessage || '');
        setAssignedToId((fetchedTicket.assignedTo as any)?._id || null);
      })
      .catch((err: any) => setError(err.message || 'Failed to fetch ticket details.'))
      .finally(() => setIsLoading(false));

    api.getAllUsers().then(setUsers).catch(() => {});
  }, [id]);

  const handleSave = async () => {
    try {
      if (!ticket) return;
      const updated = await api.updateTicket(ticket._id, { title, description, assignedTo: assignedToId });
      const updatedStatusTicket = await api.updateTicketStatus(ticket._id, { status, moderatorMessage });
      setTicket({ ...updated, ...updatedStatusTicket });
      setEditMode(false);
    } catch (err) {
      console.error('Error updating ticket:', err);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;
  if (!ticket) return <div className="text-center text-slate-400">Ticket not found.</div>;

  const assignedTo = (ticket.assignedTo as any)?.name || 'Unassigned';

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
          <p className="text-sm text-slate-400 mt-1">Created on {new Date(ticket.createdAt).toLocaleString()}</p>
        </div>
        <Button onClick={() => setEditMode(true)}>Edit</Button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold text-sky-400 mb-2">Description</h2>
          <p className="text-slate-300 whitespace-pre-wrap">{ticket.description}</p>

          {ticket.helpfulNotes && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-sky-400 mb-2">Helpful Notes</h2>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-slate-300">{ticket.helpfulNotes}</div>
            </div>
          )}

          {ticket.moderatorMessage && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-sky-400 mb-2">Message from Moderator</h2>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-slate-300">{ticket.moderatorMessage}</div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-sky-400 mb-2">Details</h2>
          <DetailItem label="Status"><StatusBadge status={ticket.status} /></DetailItem>
          <DetailItem label="Priority"><PriorityBadge priority={ticket.priority} /></DetailItem>
          <DetailItem label="Assigned To"><span className="px-2 py-1 text-xs font-medium rounded-md bg-slate-700 text-slate-300">{assignedTo}</span></DetailItem>
          <DetailItem label="Required Skills">
            {ticket.relatedSkills?.length ? (
              <div className="flex flex-wrap gap-2">
                {ticket.relatedSkills.map(skill => (
                  <span key={skill} className="px-2 py-1 text-xs font-medium rounded-md bg-slate-700 text-slate-300">{skill}</span>
                ))}
              </div>
            ) : <span className="px-2 py-1 text-xs font-medium rounded-md bg-slate-700 text-slate-300">Not specified</span>}
          </DetailItem>
        </div>
      </div>

      {editMode && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-slate-800 p-6 rounded-lg space-y-4 w-full max-w-md">
            <h2 className="text-xl font-bold text-white">Edit Ticket</h2>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white" placeholder="Title" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white" placeholder="Description" />
            <select value={assignedToId || ''} onChange={(e) => setAssignedToId(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white">
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white">
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <textarea value={moderatorMessage} onChange={(e) => setModeratorMessage(e.target.value)} className="w-full p-2 rounded bg-slate-700 text-white" placeholder="Message from Moderator" />
            <div className="flex space-x-2">
              <Button onClick={handleSave}>Save</Button>
              <Button onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ======================= Admin: User Management Modal ======================= */

const UserManagementModal: React.FC<{ user: User; onClose: () => void; onUpdate: (user: User) => void }> = ({ user, onClose, onUpdate }) => {
  const [role, setRole] = useState<Role>(user.role);
  const [skills, setSkills] = useState<string>(user.skills?.join(', ') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const updatedUser = await api.updateUser({ email: user.email, role, skills: skillsArray });
      onUpdate(updatedUser);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-1">Edit User: {user.name}</h2>
            <p className="text-sm text-slate-400 mb-6">{user.email}</p>
            {error && <div className="p-3 mb-4 bg-red-500/20 text-red-300 rounded-md text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
                  {['user', 'moderator', 'admin'].map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-slate-300 mb-1">Skills (comma-separated)</label>
                <input id="skills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="e.g. javascript, payments, api" />
              </div>
            </div>
          </div>
          <div className="bg-slate-700/50 px-6 py-4 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ======================= Admin Dashboard Page ======================= */

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
  const colors: Record<string, string> = {
    user: 'bg-gray-500/20 text-gray-300',
    moderator: 'bg-blue-500/20 text-blue-300',
    admin: 'bg-purple-500/20 text-purple-300',
  };
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${colors[role]}`}>{role}</span>;
};

export const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setUsers(await api.getAllUsers());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleEditUser = (user: User) => { setSelectedUser(user); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setSelectedUser(null); };
  const handleUserUpdate = (updatedUser: User) => {
    setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
    handleModalClose();
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error) return <div className="text-center text-red-400">{error}</div>;

  return (
    <>
      <div className="bg-slate-800 shadow-xl rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-6">User Management</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Skills</th>
                <th className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300"><RoleBadge role={user.role} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <div className="flex flex-wrap gap-1">{user.skills?.map(skill => <span key={skill} className="px-2 py-0.5 text-xs bg-slate-700 rounded-md">{skill}</span>)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && selectedUser && (
        <UserManagementModal user={selectedUser} onClose={handleModalClose} onUpdate={handleUserUpdate} />
      )}
    </>
  );
};
