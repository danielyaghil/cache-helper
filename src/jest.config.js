// Sync object
// @type {import('@jest/types').Config.InitialOptions}
const config = {
    verbose: true,
    collectCoverageFrom: ['**/*.js'],
    coveragePathIgnorePatterns: ['/node_modules/', '/coverages/', '/docs/', '/samples/', '.*config.*', '/tests/'],
    coverageDirectory: '../coverages',
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 80,
            lines: 80,
            statements: -30
        }
    },
    moduleNameMapper: {
        '#node-web-compat': './node-web-compat-node.js'
    }
};

module.exports = config;
