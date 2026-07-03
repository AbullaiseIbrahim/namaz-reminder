import { prisma } from '../config/database';

export const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  findById: (id: string) =>
    prisma.user.findUnique({ where: { id } }),

  create: (data: {
    name: string;
    email: string;
    passwordHash: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  }) => prisma.user.create({ data }),

  update: (id: string, data: Partial<{
    name: string;
    timezone: string;
    latitude: number;
    longitude: number;
    calculationMethod: string;
    madhab: string;
  }>) => prisma.user.update({ where: { id }, data }),
};
