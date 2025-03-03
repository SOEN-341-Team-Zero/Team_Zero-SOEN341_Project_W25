module.exports = {
    preset: 'ts-jest',
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
    testMatch: [
        "<rootDir>/**/*.test.ts",
        "<rootDir>/**/*.test.tsx"
    ],
    testEnvironment: "jsdom",
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],  
};
  