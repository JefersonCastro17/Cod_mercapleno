module.exports = {
  testEnvironment: 'node',
  verbose: true,
  roots: ['<rootDir>/tester', '<rootDir>/src'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testMatch: ['**/*.test.js', '**/*.spec.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/'],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports',
        filename: 'jest-report.html',
        expand: true,
      },
    ],
  ],
};
