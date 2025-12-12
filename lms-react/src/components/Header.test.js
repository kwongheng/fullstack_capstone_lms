// src/components/Header.test.js

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { AuthContext } from '../context/AuthContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockLogout = jest.fn();

const renderHeader = (user = { email: 'john@example.com', displayName: 'Johnny' }) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user, logout: mockLogout }}>
        <Header />
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders app title', () => {
    renderHeader();
    expect(screen.getByText('Library Management System')).toBeInTheDocument();
  });

  test('shows user name from displayName', () => {
    renderHeader({ email: 'x@x.com', displayName: 'AdminUser' });
    expect(screen.getByRole('button', { name: 'AdminUser' })).toBeInTheDocument();
  });

  test('falls back to email prefix when no displayName', () => {
    renderHeader({ email: 'jane.doe@test.com' });
    expect(screen.getByRole('button', { name: 'jane.doe' })).toBeInTheDocument();
  });

  test('opens menu when user button is clicked', async () => {
    renderHeader();
    const userButton = screen.getByRole('button', { name: 'Johnny' });

    userEvent.click(userButton); // no await needed

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('closes menu when clicking outside', async () => {
    renderHeader();
    const userButton = screen.getByRole('button', { name: 'Johnny' });

    userEvent.click(userButton);
    expect(screen.getByText('Profile')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  test('does NOT close menu when clicking the user button again', async () => {
    renderHeader();
    const userButton = screen.getByRole('button', { name: 'Johnny' });

    userEvent.click(userButton);
    expect(screen.getByText('Profile')).toBeInTheDocument();

    userEvent.click(userButton); // should stay open

    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('navigates to /profile when Profile is clicked', async () => {
    renderHeader();

    userEvent.click(screen.getByRole('button', { name: 'Johnny' }));
    userEvent.click(screen.getByText('Profile'));

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('calls logout and navigates to / when Logout is clicked', async () => {
    renderHeader();

    userEvent.click(screen.getByRole('button', { name: 'Johnny' }));
    userEvent.click(screen.getByText('Logout'));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});