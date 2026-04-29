import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

const ProtectedComponent = () => <div>Protected</div>;
const LoginPage = () => <div>Login Page</div>;

describe('PrivateRoute', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  test('renderiza hijos cuando hay tokens', () => {
    localStorage.setItem('access_token', 'fake-token');

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <ProtectedComponent />
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  test('Redirige cuando no jhay token', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <PrivateRoute>
                <ProtectedComponent />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

});