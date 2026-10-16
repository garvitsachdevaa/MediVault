import { cloudinary } from '../config/cloudinary.js';

// Upload a private (authenticated) document. Only reachable via a signed URL.
export const uploadDocument = (buffer, { profileId }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `medivault/${profileId}/documents`,
        resource_type: 'image', // PDFs upload as 'image' so page transforms work later
        type: 'authenticated',
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// Upload a public avatar image (profile or account photo).
export const uploadAvatar = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'medivault/avatars', resource_type: 'image', type: 'upload' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// Short-lived (5 min) signed URL for a private document. The plain delivery URL
// does not work for authenticated assets — only this signed, expiring link does.
export const signedDocumentUrl = (storage) => {
  const expiresAt = Math.floor(Date.now() / 1000) + 300;
  const url = cloudinary.utils.private_download_url(storage.publicId, storage.format, {
    resource_type: storage.resourceType || 'image',
    type: 'authenticated',
    expires_at: expiresAt,
  });
  return { url, expiresAt: expiresAt * 1000 };
};

export const deleteAsset = (storage) =>
  cloudinary.uploader.destroy(storage.publicId, {
    resource_type: storage.resourceType || 'image',
    type: 'authenticated',
  });
