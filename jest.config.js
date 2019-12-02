module.exports = {
  preset: 'ts-jest',
  // snapshotSerializers: ['enzyme-to-json/serializer'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '.+\\.(css|styl|less|svg|scss|png)$': '<rootDir>/node_modules/jest-css-modules-transform',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/src/setupTests.ts'],
  // coverageReporters: ['text', 'lcov'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,jsx,ts,tsx}', '!<rootDir>/src/**/', '!<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
