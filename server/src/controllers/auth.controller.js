import { User } from '../models/User.js';
import { signToken } from '../utils/tokens.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthError } from '../utils/AppError.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email });
  await user.setPassword(password);
  await user.save();
  const token = signToken(user.id);
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash');
  const ok = user && (await user.comparePassword(password));
  // Same message for unknown email and wrong password (no account enumeration).
  if (!ok) throw new AuthError('Invalid email or password');
  const token = signToken(user.id);
  res.json({ user, token });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updateMe = asyncHandler(async (req, res) => {
  req.user.name = req.body.name;
  await req.user.save();
  res.json({ user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+passwordHash');
  const ok = await user.comparePassword(req.body.currentPassword);
  if (!ok) throw new AuthError('Current password is incorrect');
  await user.setPassword(req.body.newPassword);
  await user.save();
  res.json({ user });
});
