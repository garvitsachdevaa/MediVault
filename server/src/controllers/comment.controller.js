import { Comment } from '../models/Comment.js';
import { Membership } from '../models/Membership.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/AppError.js';
import { notifyProfileMembers } from '../services/notificationService.js';
import { getIo } from '../sockets/index.js';

// GET /api/profiles/:profileId/comments?targetType=&targetId= (viewer)
export const listComments = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query;
  if (!targetType || !targetId) throw new ValidationError('targetType and targetId are required');
  const comments = await Comment.find({ profileId: req.profile.id, targetType, targetId })
    .sort({ createdAt: 1 })
    .populate('authorId', 'name photoUrl');
  res.json({ comments });
});

// POST /api/profiles/:profileId/comments (viewer+ — anyone with access can comment)
export const createComment = asyncHandler(async (req, res) => {
  const { targetType, targetId, text } = req.body;
  if (!text?.trim()) throw new ValidationError('Comment cannot be empty');
  if (!['document', 'lab_result'].includes(targetType)) throw new ValidationError('Invalid target');

  const comment = await Comment.create({
    profileId: req.profile.id,
    targetType,
    targetId,
    authorId: req.user.id,
    text: text.trim().slice(0, 2000),
  });
  const populated = await comment.populate('authorId', 'name photoUrl');

  const io = getIo();
  if (io) io.to(`profile:${req.profile.id}`).emit('comment:new', populated);

  await notifyProfileMembers(
    req.profile.id,
    {
      type: 'comment',
      title: `New comment from ${req.user.name}`,
      body: text.trim().slice(0, 100),
      link: `/app/records/documents/${targetId}`,
    },
    { excludeUserId: req.user.id }
  );

  res.status(201).json({ comment: populated });
});

// DELETE /api/comments/:id (author or profile owner)
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new NotFoundError('Comment not found');

  const membership = await Membership.findOne({ profileId: comment.profileId, userId: req.user.id });
  if (!membership) throw new NotFoundError('Comment not found');
  if (String(comment.authorId) !== String(req.user.id) && membership.role !== 'owner') {
    throw new ForbiddenError('Only the author or an owner can delete this comment');
  }
  await comment.deleteOne();
  res.json({ ok: true });
});
