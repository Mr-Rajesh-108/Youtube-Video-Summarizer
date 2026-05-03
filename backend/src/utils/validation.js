// Centralized validation utilities

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

/**
 * Validates email format
 */
const validateEmail = (email) => emailRegex.test(email);

/**
 * Validates password strength:
 * - At least 6 characters
 * - Contains letters, numbers, and special characters
 */
const validatePassword = (password) => passwordRegex.test(password);

/**
 * Checks that all provided fields are non-empty strings
 */
const validateRequired = (...fields) =>
  fields.every((f) => f !== undefined && f !== null && String(f).trim() !== "");

export { validateEmail, validatePassword, validateRequired };
