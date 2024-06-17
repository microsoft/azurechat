import { revertCase } from "@/features/chat/chat-services/chat-translator-service"

describe("translator", () => {
  it("should handle empty string", () => {
    // Arrange
    const originalText = ""
    const translatedText = ""
    const expected = ""

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  it("should revert cases", () => {
    // Arrange
    const originalText = "Hello, WORLD!"
    const translatedText = "hello, world!"
    const expected = "Hello, WORLD!"

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  it("should handle extra letters in translated version", () => {
    // Arrange
    const originalText = "Color COLORS!"
    const translatedText = "colour colours!"
    const expected = "Colour COLOURS!"

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  it("should handle case and special char", () => {
    // Arrange
    const originalText = "Hi! `color`@!#'SUMMARIZE'"
    const translatedText = "hi! 'colour'@!#'summarise'"
    const expected = "Hi! `colour`@!#'SUMMARISE'"

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  it("should handle capital after code block", () => {
    // Arrange
    const originalText = "Welcome to QChat,\n\n__codeblock_1__\n\n**Color**"
    const translatedText = "welcome to qchat,\n\n__codeblock_1__\n\n**colour**"
    const expected = "Welcome to QChat,\n\n__codeblock_1__\n\n**Colour**"

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  it("should handle words wrapped in single backtick", () => {
    // Arrange
    const originalText = "`IF`, `COLOR`, and `INDIRECT`"
    const translatedText = "'if', 'colour', and 'indirect'"
    const expected = "`IF`, `COLOUR`, and `INDIRECT`"

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  it("should handle extra or missing spaces", () => {
    // Arrange
    const originalText = "Hello     __codeblock_1__\n\n    Color WORLD! Bye!"
    const translatedText = "hello __codeblock_1__\n\n    colour world! bye!"
    const expected = "Hello __codeblock_1__\n\n    Colour WORLD! Bye!"

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  it("should handle stars after code blocks", () => {
    // Arrange
    const originalText = "Welcome to QChat,\n\n__codeblock_1__\n*Color*"
    const translatedText = "welcome to qchat,\n\n__codeblock_1__\n*colour*"
    const expected = "Welcome to QChat,\n\n__codeblock_1__\n*Colour*"

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  it("should handle single quote and backtick", () => {
    // Arrange
    const originalText = "`'Tab1'!E2:E100=\"Yes\"`"
    const translatedText = "''tab1'!e2:e100=\"yes\"'"
    const expected = "`'Tab1'!E2:E100=\"Yes\"`"

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  it("should keep original words if translation splitted the words", () => {
    // Arrange
    const originalText = "on guardrail design and performance Standards:\n\n1."
    const translatedText = "on guard rail design and performance standards:\n\n1."
    const expected = "on guardrail design and performance Standards:\n\n1."

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  xit("should handle original words splited after translation properly", () => {
    // Arrange
    const originalText = "on guardrail DESIGN and performance standards:\n\n1."
    const translatedText = "on guard rail design and performance standards:\n\n1."
    const expected = "on guard rail DESIGN and performance standards:\n\n1."

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })

  xit("should handle original words are merged after translation", () => {
    // Arrange
    const originalText = "on guard rail DESIGN and performance standards:\n\n1."
    const translatedText = "on guardrail design and performance standards:\n\n1."
    const expected = "on guardrail DESIGN and performance standards:\n\n1."

    // Act
    const actual = revertCase(originalText, translatedText)

    // Assert
    expect(actual).toBe(expected)
  })
})
