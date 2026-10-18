import { User } from '../models/User.js';
import { signToken } from '../utils/tokens.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthError, AppError, ValidationError } from '../utils/AppError.js';
import { cloudinaryConfigured } from '../config/cloudinary.js';
import { detectType } from '../pipeline/ingestion/detector.js';
import { validateFile } from '../pipeline/ingestion/validator.js';
import { uploadAvatar } from '../services/storage.js';

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

export const uploadMyPhoto = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigured()) throw new AppError(503, 'STORAGE_UNCONFIGURED', 'File storage is not configured yet.');
  if (!req.file) throw new ValidationError('No file was uploaded');
  const detected = await detectType(req.file.buffer);
  if (detected.category !== 'image') throw new ValidationError('Photo must be an image');
  await validateFile(req.file.buffer, detected);
  const result = await uploadAvatar(req.file.buffer);
  req.user.photoUrl = result.secure_url;
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
