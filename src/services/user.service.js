import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

/**
 * Creates a new user in the database.
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's plain text password
 * @returns {object} The created user object
 */
export const createUser = async (name, email, password) => {
  console.log('USER_SERVICE_ENTERED');
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 409;
    throw error;
  }

  // Hash password with 10 salt rounds
  const passwordHash = await bcrypt.hash(password, 10);

  console.log('USER_CREATE_START');
  try {
    // Create new user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });
    console.log('USER_CREATE_SUCCESS');
    console.log('Created user id:', user.id);
    return user;
  } catch (err) {
    console.error('USER_CREATE_ERROR', err);
    throw err;
  }
};

/**
 * Authenticates a user by email and password.
 * @param {string} email - User's email
 * @param {string} password - User's plain text password
 * @returns {object} The authenticated user object
 */
export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is inactive');
    error.statusCode = 403;
    throw error;
  }

  return user;
};
