module.exports = {
    preset: 'ts-jest',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',  // transform TypeScript files with ts-jest
        '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',  //  babel-jest for JS/JSX/TS/TSX files
      },
    testMatch: [
        "<rootDir>/**/*.test.ts",
        "<rootDir>/**/*.test.tsx"
    ],
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],  //extend jest-dom
    transformIgnorePatterns: [
        '/node_modules/(?!some-package-to-transform|another-package)/', //  you need to transform a specific package
      ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],  
};
  