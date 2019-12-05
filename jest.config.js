module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '.+\\.(css|styl|less|svg|scss)$': '<rootDir>/node_modules/jest-css-modules-transform',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  setupFiles: ['<rootDir>/src/setupTests.ts'],
  coverageReporters: ['text', 'lcov'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/assetsTransformer.js',
    '\\.(css|less|scss)$': '<rootDir>/src/assetsTransformer.js',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
