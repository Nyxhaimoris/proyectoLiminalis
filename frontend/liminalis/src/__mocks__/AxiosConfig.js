// Mock de los interceptores axios para que no nos arruine los tests
jest.mock('axios', () => ({
  create: () => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }),
}));