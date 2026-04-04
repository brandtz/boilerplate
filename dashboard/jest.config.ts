import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-chartjs-2$': '<rootDir>/tests/__mocks__/react-chartjs-2.tsx',
    '^chart\\.js$': '<rootDir>/tests/__mocks__/chart.js.ts',
    '^chart\\.js/auto$': '<rootDir>/tests/__mocks__/chart.js.ts',
  },
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(config);
