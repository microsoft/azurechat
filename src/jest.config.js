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
}

module.exports = config
