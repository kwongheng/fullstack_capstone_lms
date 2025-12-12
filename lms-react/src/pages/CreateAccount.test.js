// src/pages/CreateAccount.test.js

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CreateAccount from './CreateAccount';
import { useUsers } from '../hooks/useUsers';
import { userApi } from '../api/userApi';
import Swal from 'sweetalert2';

jest.mock('../hooks/useUsers');
jest.mock('../api/userApi');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

// THIS IS THE ONLY THING THAT ACTUALLY WORKS
beforeEach(() => {
  Swal.fire.mockImplementation(() => ({
    then: jest.fn((cb) => cb()), // directly call the callback
  }));
});

const renderCreateAccount = () =>
  render(
    <MemoryRouter>
      <CreateAccount />
    </MemoryRouter>
  );

describe('CreateAccount Page', () => {
  const mockCreateUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUsers.mockReturnValue({ createUser: mockCreateUser });
    userApi.checkEmailAvailability.mockResolvedValue({ data: { available: true } });
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  test('creates account and navigates', async () => {
    mockCreateUser.mockImplementation((payload, { onSuccess }) => onSuccess?.());

    renderCreateAccount();

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@x.com');
    await userEvent.type(screen.getByPlaceholderText('Choose a strong password'), '123');
    await userEvent.type(screen.getAllByRole('textbox')[1], 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('e.g. 81234567'), '8111111111');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });
});