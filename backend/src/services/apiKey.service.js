import crypto from 'crypto';
import prisma from '../config/prisma.js';

export const generateApiKey = async (userId, name) => {
  const randomHex = crypto.randomBytes(24).toString('hex');
  const key = `vap_${randomHex}`;

  return await prisma.apiKey.create({
    data: {
      key,
      name,
      userId
    }
  });
};

export const getApiKeyWithUser = async (key) => {
  return await prisma.apiKey.findUnique({
    where: { key },
    include: {
      user: true
    }
  });
};

export const getKeysByUser = async (userId) => {
  return await prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      key: true,
      name: true,
      isActive: true,
      createdAt: true
    }
  });
};

export const updateApiKey = async (id, userId, { name, isActive }) => {
  const existingKey = await prisma.apiKey.findFirst({
    where: { id, userId }
  });
  if (!existingKey) {
    const err = new Error('API key not found');
    err.statusCode = 404;
    throw err;
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (isActive !== undefined) updateData.isActive = isActive;

  return await prisma.apiKey.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      key: true,
      name: true,
      isActive: true
    }
  });
};

export const deleteApiKey = async (id, userId) => {
  const existingKey = await prisma.apiKey.findFirst({
    where: { id, userId }
  });
  if (!existingKey) {
    const err = new Error('API key not found');
    err.statusCode = 404;
    throw err;
  }

  await prisma.apiKey.delete({
    where: { id }
  });
};
