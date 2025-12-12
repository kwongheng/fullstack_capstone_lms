// src/pages/UserProfile.test.js
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfile from './UserProfile';
import { AuthContext } from '../context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMembers } from '../hooks/useMembers';
import { userApi } from '../api/userApi';
import Swal from 'sweetalert2';

jest.mock('../api/userApi');
jest.mock('../hooks/useMembers');

const mockUser = {
  id: '123',
  email: 'john@example.com',
  fullName: 'John Doe',
  phone: '0812345678',
  address: '123 Bangkok',
  role: 'Member',
};

const mockMemberData = {
  joinDate: '2024-01-15',
  status: 'Active',
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderUserProfile = (authUser = mockUser, memberData = mockMemberData) => {
  const mockUseMember = jest.fn().mockReturnValue({
    data: memberData,
    isLoading: false,
    error: null,
  });

  useMembers.mockReturnValue({ useMember: mockUseMember });

  userApi.getUserById.mockResolvedValue({ data: authUser });
  userApi.updateUser.mockResolvedValue({});

  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user: authUser }}>
        <UserProfile />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

describe('UserProfile Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  test('shows loading spinner while fetching', () => {
    userApi.getUserById.mockImplementation(() => new Promise(() => {}));
    renderUserProfile();
    expect(screen.getByText(/Loading profile/i)).toBeInTheDocument();
  });

  test('renders profile correctly for Member', async () => {
    renderUserProfile();

    await screen.findByText('My Profile');

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByText('MEM-0123')).toBeInTheDocument();
    expect(screen.getByText('15 Jan 2024')).toBeInTheDocument();
    expect(screen.getByText('15 Jan 2025')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('renders profile for Admin (no membership row)', async () => {
    const admin = { ...mockUser, id: '999', role: 'Admin' };
    renderUserProfile(admin, null);

    await screen.findByText('My Profile');

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.queryByText(/Member ID/i)).not.toBeInTheDocument();
  });

  test('can enter edit mode and cancel', async () => {
    renderUserProfile();
    await screen.findByText('My Profile');

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    const nameInput = screen.getByDisplayValue('John Doe');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Jane Doe');

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  test('shows phone error when phone starts with 0 or contains letters', async () => {
    renderUserProfile();
    await screen.findByText('My Profile');
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    const phoneInput = screen.getByDisplayValue('0812345678');

    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '0123456789');
    expect(screen.getByText('Invalid phone')).toBeInTheDocument();

    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, 'abc123');
    expect(screen.getByText('Invalid phone')).toBeInTheDocument();

    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '8112345678');
    expect(screen.queryByText('Invalid phone')).not.toBeInTheDocument();
  });

  test('blocks save when phone starts with 0', async () => {
    renderUserProfile();
    await screen.findByText('My Profile');
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    const phoneInput = screen.getByDisplayValue('0812345678');
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '0123456789');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith('Invalid', 'Invalid phone', 'warning')
    );
    expect(userApi.updateUser).not.toHaveBeenCalled();
  });

  test('updates profile successfully only with valid phone (no leading zero)', async () => {
    renderUserProfile();
    await screen.findByText('My Profile');
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    const nameInput = screen.getByDisplayValue('John Doe');
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');

    const phoneInput = screen.getByDisplayValue('0812345678');
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '8112345678');

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(userApi.updateUser).toHaveBeenCalledWith('123', {
        fullName: 'Updated Name',
        phone: '8112345678',
        address: '123 Bangkok',
      })
    );

    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith('Success', 'Profile updated', 'success')
    );
  });

  test('prevents save when full name is empty', async () => {
    renderUserProfile();
    await screen.findByText('My Profile');
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    const nameInput = screen.getByDisplayValue('John Doe');
    await userEvent.clear(nameInput);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(Swal.fire).toHaveBeenCalledWith('Error', 'Full Name required', 'warning')
    );
    expect(userApi.updateUser).not.toHaveBeenCalled();
  });
});