const { pathsToModuleNameMapper } = require("ts-jest")

const { compilerOptions } = require("./tsconfig")

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "./tests/unit/coverage",
  coverageProvider: "v8",
  roots: ["./tests/unit/"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./test-results",
        outputName: "test-results.xml",
      },
    ],
  ],
}

module.exports = config
