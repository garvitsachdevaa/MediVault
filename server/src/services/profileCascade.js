import { HealthProfile } from '../models/HealthProfile.js';
import { Membership } from '../models/Membership.js';
import { Invite } from '../models/Invite.js';
import { Document } from '../models/Document.js';
import { Prescription } from '../models/Prescription.js';
import { Medication } from '../models/Medication.js';
import { DoseLog } from '../models/DoseLog.js';
import { LabResult } from '../models/LabResult.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { Visit } from '../models/Visit.js';
import { ShareLink } from '../models/ShareLink.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';
import { deleteProfileAssets } from './storage.js';
import { notifyProfileMembers } from './notificationService.js';

// Permanently delete a profile and ALL data derived from it, including the
// Cloudinary assets under its folder. Other members are notified first.
export const deleteProfileCascade = async (profileId, excludeUserId) => {
  await notifyProfileMembers(
    profileId,
    { type: 'profile_deleted', title: 'A profile was deleted', body: 'A profile you had access to was removed.' },
    { excludeUserId }
  );

  try {
    await deleteProfileAssets(profileId);
  } catch {
    /* best effort — Cloudinary may be unconfigured */
  }

  await Promise.all([
    Document.deleteMany({ profileId }),
    Prescription.deleteMany({ profileId }),
    Medication.deleteMany({ profileId }),
    DoseLog.deleteMany({ profileId }),
    LabResult.deleteMany({ profileId }),
    TimelineEvent.deleteMany({ profileId }),
    Visit.deleteMany({ profileId }),
    ShareLink.deleteMany({ profileId }),
    Comment.deleteMany({ profileId }),
    Notification.deleteMany({ profileId }),
    Invite.deleteMany({ profileId }),
    Membership.deleteMany({ profileId }),
  ]);

  await HealthProfile.deleteOne({ _id: profileId });
};
