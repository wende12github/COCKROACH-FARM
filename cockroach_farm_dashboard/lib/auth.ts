import { auth } from '@/lib/firebase';
import { updateFirebaseData } from '@/lib/firebase';
import { User } from 'firebase/auth';

/**
 * Sync authenticated user profile to Realtime Database
 */
export const syncUserProfile = async (user: User) => {
  if (!user || !user.uid || !user.email) {
    console.error('Invalid user data for syncing profile');
    return;
  }

  const baseProfile = {
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
    photoURL: user.photoURL || null,
    role: 'operator', // default
    permissions: {
      read: true,
      write: true,
      delete: false,
      manageUsers: false,
    },
    createdAt: Date.now(),
    lastLogin: Date.now(),
    active: true,
  };

  // Role-based overrides (you can make this dynamic later)
  if (user.email === 'admin@smartroach.com') {
    baseProfile.role = 'admin';
    baseProfile.permissions = {
      read: true,
      write: true,
      delete: true,
      manageUsers: true,
    };
  } else if (user.email === 'manager@smartroach.com') {
    baseProfile.role = 'manager';
    // manager has write but no delete/manage users
    baseProfile.permissions.delete = false;
    baseProfile.permissions.manageUsers = false;
  }

  try {
    await updateFirebaseData(`users/${user.uid}`, baseProfile);
    console.log('User profile synced successfully:', user.uid);
  } catch (error) {
    console.error('Failed to sync user profile:', error);
  }
};


export const updateLastLogin = async (uid: string) => {
  await updateFirebaseData(`users/${uid}`, { lastLogin: Date.now() });
};