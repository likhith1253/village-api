import prisma from '../config/prisma.js';

/**
 * Fetch all states from Prisma sorted by name ascending.
 * Returns only required fields: id, name, stateCode.
 *
 * @returns {Promise<Array>} List of states
 */
export const getAllStates = async () => {
  return await prisma.state.findMany({
    select: {
      id: true,
      name: true,
      stateCode: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};
