module.exports = {
  coverageProvider: 'v8',
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  transform: {
    '^.+\\.(ts|tsx)$': '@swc/jest',
    '^.+\\.(js|jsx)$': '@swc/jest',
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/fileMock.ts',
  },
};
