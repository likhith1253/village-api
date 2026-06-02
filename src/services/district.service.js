import prisma from '../config/prisma.js';

/**
 * Gets all districts belonging to a state by stateCode.
 * Sorts districts alphabetically by name ascending.
 * Returns only id, name, and districtCode.
 * 
 * @param {string} stateCode 
 * @returns {Promise<Array|null>} Districts array, or null if state not found
 */
export const getDistrictsByState = async (stateCode) => {
  const state = await prisma.state.findUnique({
    where: { stateCode }
  });

  if (!state) {
    return null;
  }

  return await prisma.district.findMany({
    where: { stateId: state.id },
    select: {
      id: true,
      name: true,
      districtCode: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};
