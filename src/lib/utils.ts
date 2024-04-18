import { clsx, type ClassValue } from "clsx"
import { customAlphabet } from "nanoid"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export const uniqueId = (): string => {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  const nanoid = customAlphabet(alphabet, 36)
  return nanoid()
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export const arraysAreEqual = (array1: string[], array2: string[]): boolean => {
  if (array1.length !== array2.length) return false
  const sortedArray1 = [...array1].sort()
  const sortedArray2 = [...array2].sort()
  return sortedArray1.every((value, index) => value === sortedArray2[index])
}
