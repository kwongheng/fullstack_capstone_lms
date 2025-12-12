// src/setupTests.js
import '@testing-library/jest-dom';

// 1. Mock SweetAlert2 — exactly as you had it (safe and working)
jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false })),
  close: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  isVisible: jest.fn(() => false),
}));

// 2. Mock useNavigate — exactly as you had it
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// 3. Silence React Router future warnings — exactly as you had it
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('React Router Future Flag Warning')) {
    return;
  }
  originalWarn(...args);
};