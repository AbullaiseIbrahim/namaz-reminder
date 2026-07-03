import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../middlewares/error.middleware';
import { env } from '../config/env';

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new AppError(409, 'Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      timezone: data.timezone,
      latitude: data.latitude,
      longitude: data.longitude,
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
    );

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },

  login: async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError(401, 'Invalid email or password');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid email or password');

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn } as jwt.SignOptions
    );

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },
};
