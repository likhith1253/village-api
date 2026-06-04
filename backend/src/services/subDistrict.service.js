import prisma from '../config/prisma.js';

/**
 * Gets all sub-districts belonging to a district by districtCode.
 * Sorts sub-districts alphabetically by name ascending.
 * Returns only id, subDistrictCode, and name.
 * 
 * @param {string} districtCode 
 * @returns {Promise<Array|null>} Sub-districts array, or null if district not found
 */
export const getSubDistrictsByDistrict = async (districtCode) => {
  const district = await prisma.district.findUnique({
    where: { districtCode }
  });

  if (!district) {
    return null;
  }

  return await prisma.subDistrict.findMany({
    where: { districtId: district.id },
    select: {
      id: true,
      subDistrictCode: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  });
};
