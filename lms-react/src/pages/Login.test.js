// src/pages/Login.test.js
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { AuthContext } from '../context/AuthContext';
import * as memberApi from '../api/memberApi';
import * as borrowApi from '../api/borrowApi';
import Swal from 'sweetalert2';

jest.mock('../api/memberApi', () => ({
  memberApi: {
    getMemberByUserId: jest.fn(),
    renewMembership: jest.fn(),
  },
}));

jest.mock('../api/borrowApi', () => ({
  borrowApi: {
    getMyActiveBorrows: jest.fn(),
  },
}));

const mockLogin = jest.fn();
const mockLogout = jest.fn();

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ login: mockLogin, logout: mockLogout }}>
        <Login />
      </AuthContext.Provider>
    </MemoryRouter>
  );

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();

  // Correct mock: resolve the promise AND write to localStorage exactly like AuthContext does
  mockLogin.mockImplementation(() => {
    localStorage.setItem('lms_user', JSON.stringify({ id: 'user-123' + Date.now() })); // unique id per test
    return Promise.resolve();
  });

  require('../api/borrowApi').borrowApi.getMyActiveBorrows.mockResolvedValue({ data: [] });
});

describe('Login Page', () => {
  test('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('calls login with email and password', async () => {
    renderLogin();
    await userEvent.type(screen.getByPlaceholderText(/email address/i), 'john@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'pass123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith('john@example.com', 'pass123');
  });

  test('blocks access and logs out if membership is Suspended', async () => {
    memberApi.memberApi.getMemberByUserId.mockResolvedValue({
      data: { status: 'Suspended' },
    });

    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/email address/i), 'bad@user.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'xxx');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    await waitFor(() => expect(memberApi.memberApi.getMemberByUserId).toHaveBeenCalled());
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
    expect(mockLogout).toHaveBeenCalled();
  });

  test('shows expired warning and renews when confirmed', async () => {
    memberApi.memberApi.getMemberByUserId.mockResolvedValue({
      data: { status: 'Active', joinDate: '2020-01-01' },
    });
    memberApi.memberApi.renewMembership.mockResolvedValue({});
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/email address/i), 'exp@user.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'xxx');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Membership Expired' })));
    await waitFor(() => expect(memberApi.memberApi.renewMembership).toHaveBeenCalled());
  });

  test('allows login when membership is valid', async () => {
    memberApi.memberApi.getMemberByUserId.mockResolvedValue({
      data: { status: 'Active', joinDate: new Date().toISOString().split('T')[0] },
    });

    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/email address/i), 'valid@user.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalled()); // now passes
    await waitFor(() => expect(memberApi.memberApi.getMemberByUserId).toHaveBeenCalled());

    expect(Swal.fire).not.toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' }));
    expect(mockLogout).not.toHaveBeenCalled();
  });
});