import prisma from '../config/prisma.js';

/**
 * Searches villages by name.
 * Performs partial, case-insensitive match.
 * Returns only villageCode and name, sorted alphabetically by name.
 * Limits results to the first 20 matches.
 * 
 * @param {string} query 
 * @returns {Promise<Array>} List of matching villages
 */
export const searchVillagesByName = async (query) => {
  return await prisma.village.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive'
      }
    },
    select: {
      villageCode: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    },
    take: 20
  });
};

/**
 * Retrieves a village and its parent hierarchy by its unique villageCode.
 * Mapped to the specific response fields.
 * 
 * @param {string} villageCode 
 * @returns {Promise<object|null>} Mapped village details or null
 */
export const getVillageByCode = async (villageCode) => {
  const village = await prisma.village.findUnique({
    where: { villageCode },
    include: {
      state: { select: { name: true } },
      district: { select: { name: true } },
      subDistrict: { select: { name: true } }
    }
  });

  if (!village) {
    return null;
  }

  return {
    villageCode: village.villageCode,
    villageName: village.name,
    state: village.state.name,
    district: village.district.name,
    subDistrict: village.subDistrict.name,
    fullAddress: village.fullAddress
  };
};

/**
 * Gets filtered list of villages with pagination.
 * Supports optional stateCode, districtCode, and subDistrictCode filters.
 * Returns only villageCode and name, sorted alphabetically by name.
 * 
 * @param {object} params 
 * @param {string} [params.stateCode]
 * @param {string} [params.districtCode]
 * @param {string} [params.subDistrictCode]
 * @param {number} params.page
 * @param {number} params.limit
 * @returns {Promise<{ total: number, data: Array }>} Total count and list of villages
 */
export const getVillages = async ({ stateCode, districtCode, subDistrictCode, page, limit }) => {
  const where = {};

  if (stateCode) {
    where.state = { stateCode };
  }
  if (districtCode) {
    where.district = { districtCode };
  }
  if (subDistrictCode) {
    where.subDistrict = { subDistrictCode };
  }

  const [totalCount, villages] = await Promise.all([
    prisma.village.count({ where }),
    prisma.village.findMany({
      where,
      select: {
        villageCode: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    })
  ]);

  return {
    total: totalCount,
    data: villages
  };
};
