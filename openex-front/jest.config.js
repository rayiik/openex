const config = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ['./jest/jest.setup.js'],
    roots: ["<rootDir>/src"],
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts"
    ],
    testMatch: [
        "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
        "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}"
    ],
    transform: {
        "\\.(js|jsx|mjs|cjs|ts|tsx)$": ["esbuild-jest", {
            sourcemap: true,
            loaders: {
                '.js': 'jsx',
                '.svg': 'dataurl',
                '.png': 'dataurl',
                '.woff': 'dataurl',
                '.woff2': 'dataurl',
                '.ttf': 'dataurl'
            }
        }],
        "^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|json)$)": "<rootDir>/jest/jest.file.transform.js"
    }
};

module.exports = config;
