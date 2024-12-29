import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export function renderWithProviders(
  ui: React.ReactElement,
  {
    route = '/',
    ...renderOptions
  } = {}
) {
  window.history.pushState({}, 'Test page', route);

  return {
    ...render(ui, {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      ),
      ...renderOptions,
    }),
  };
}
