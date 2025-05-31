import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';

const setupSession = (res, session) => {
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expire: session.refreshTokenValidUntil,
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expire: session.refreshTokenValidUntil,
  });
};

export const registerController = async (req, res) => {
  const data = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data,
  });
};

export const loginController = async (req, res) => {
  const session = await loginUser(req.body.email, req.body.password);

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'User successfully logged in!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const refreshController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;
  const session = await refreshSession(sessionId, refreshToken);

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutController = async (req, res) => {
  const { sessionId } = req.cookies;
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  logoutUser(sessionId);
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
  res.status(204).end();
};
