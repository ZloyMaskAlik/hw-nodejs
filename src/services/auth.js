import createHttpError from 'http-errors';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import path from 'node:path';
import handlebars from 'handlebars';
import jwt from 'jsonwebtoken';

import fs from 'node:fs/promises';

import UserCollection from '../db/models/user.js';
import SessionCollection from '../db/models/session.js';
import {
  accessTokenLifetime,
  refreshTokenLifetime,
} from '../constants/user.js';

import { sendEmail } from '../utils/sendMail.js';
import { SMTP, TEMPLATES_DIR } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';

const createSessionData = () => ({
  accessToken: crypto.randomBytes(30).toString('base64'),
  refreshToken: crypto.randomBytes(30).toString('base64'),
  accessTokenValidUntil: Date.now() + accessTokenLifetime,
  refreshTokenValidUntil: Date.now() + refreshTokenLifetime,
});

export const registerUser = async (payload) => {
  const user = await UserCollection.findOne({ email: payload.email });
  if (user) {
    throw createHttpError(409, 'User already exists');
  }
  payload.password = await bcrypt.hash(payload.password, 10);
  return UserCollection.create(payload);
};

export const loginUser = async (email, password) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Invalid email or password');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createHttpError(401, 'Invalid email or password');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const sessionData = createSessionData();

  return SessionCollection.create({
    userId: user._id,
    ...sessionData,
  });
};

export const refreshSession = async (sessionId, refreshToken) => {
  const session = await SessionCollection.findOne({ _id: sessionId });
  if (session === null) {
    throw createHttpError(401, 'Session not found');
  }
  if (session.refreshToken !== refreshToken) {
    throw createHttpError(401, 'Invalid refresh token');
  }
  if (session.refreshTokenValidUntil < new Date()) {
    throw createHttpError(401, 'Refresh token expired');
  }

  await SessionCollection.deleteOne({ _id: session._id });
  const sessionData = createSessionData();

  return SessionCollection.create({
    userId: session.userId,
    ...sessionData,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};

export const getUser = (filter) => UserCollection.findOne(filter);

export const getSession = (filter) => SessionCollection.findOne(filter);

export const requestResetToken = async (email) => {
  const user = await UserCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.hbs',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (payload) => {
  let entries;

  try {
    entries = jwt.verify(payload.token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await UserCollection.findOne({
    email: entries.email,
    _id: entries.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  await UserCollection.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );
};
