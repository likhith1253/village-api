import crypto from 'crypto';
import prisma from '../config/prisma.js';

/**
 * Generates and saves a secure API key for a user.
 * @param {number} userId - The ID of the authenticated user
 * @param {string} name - Name/label for the API key
 * @returns {object} The created API key record
 */
export const generateApiKey = async (userId, name) => {
  // Generate a cryptographically secure 24-byte random hex string
  const randomHex = crypto.randomBytes(24).toString('hex');
  const key = `vap_${randomHex}`;

  // Save the key inside the database
  const apiKey = await prisma.apiKey.create({
    data: {
      key,
      name,
      userId
    }
  });

  return apiKey;
};

/**
 * Retrieves an API key and its associated user from the database.
 * @param {string} key - The API key string
 * @returns {object|null} The API key record with user data, or null
 */
export const getApiKeyWithUser = async (key) => {
  return await prisma.apiKey.findUnique({
    where: { key },
    include: {
      user: true
    }
  });
};

