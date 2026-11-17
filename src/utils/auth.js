/**
 * Careerhut Authentication & Subscription State Management
 * Integrated with Supabase Auth
 */

import { supabase } from '../config/supabase';

const USER_STORAGE_KEY = 'careerhut_user';
const ONBOARDING_STORAGE_KEY = 'careerhut_onboarding';

export function formatSupabaseUser(sbUser) {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: meta.name || meta.full_name || sbUser.email?.split('@')[0] || '',
    avatar_url: meta.avatar_url || meta.picture || null,
    isAuthenticated: true,
    hasPaid: Boolean(meta.hasPaid),
    plan: meta.plan || null,
    onboarding: meta.onboarding || null,
    createdAt: sbUser.created_at || new Date().toISOString()
  };
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error reading user from storage', e);
    return null;
  }
}

export function saveUser(user) {
  if (typeof window === 'undefined') return;
  try {
    if (!user) {
      localStorage.removeItem(USER_STORAGE_KEY);
    } else {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Error saving user to storage', e);
  }
}

export function getStoredOnboarding() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveOnboarding(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
    
    // Also sync to Supabase user metadata in background if signed in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.auth.updateUser({
          data: { onboarding: data }
        }).catch(() => {});
      }
    }).catch(() => {});
  } catch (e) {
    console.error('Error saving onboarding data', e);
  }
}

export function isUserSubscribed(user) {
  return Boolean(user && user.isAuthenticated && user.hasPaid);
}

/**
 * Register account using Supabase Auth (sends confirmation email with OTP code)
 */
export async function createAccount({ name, email, password }) {
  const cleanEmail = email.trim().toLowerCase();
  
  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: password,
    options: {
      data: {
        name: name.trim() || cleanEmail.split('@')[0],
        hasPaid: false,
        plan: null
      }
    }
  });

  if (error) {
    throw error;
  }

  // Returns { user, session }
  return data;
}

/**
 * Verify OTP code sent to user's email upon signup
 */
export async function verifyEmailOtp({ email, token }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  // Try signup type first
  let res = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'signup'
  });

  // Fallback to email verification type if needed
  if (res.error) {
    const res2 = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email'
    });
    if (!res2.error) {
      res = res2;
    }
  }

  if (res.error) {
    throw res.error;
  }

  if (!res.data?.user) {
    throw new Error('Verification failed. Please check the code and try again.');
  }

  const user = formatSupabaseUser(res.data.user);
  saveUser(user);
  return user;
}

/**
 * Resend signup confirmation OTP code
 */
export async function resendConfirmationOtp(email) {
  const cleanEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: cleanEmail
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign in using Supabase Auth
 */
export async function signInUser({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: password
  });

  if (error) {
    throw error;
  }

  const user = formatSupabaseUser(data.user);
  saveUser(user);
  return user;
}

/**
 * Sign in with Google OAuth via Supabase
 */
export async function signInWithGoogle() {
  const redirectTo = typeof window !== 'undefined' 
    ? `${window.location.origin}/onboarding`
    : undefined;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Update user subscription status (persists in Supabase user metadata + local cache)
 */
export function completeSubscription(planId, userDetails = {}) {
  const current = getStoredUser();

  const updated = {
    ...(current || {}),
    ...userDetails,
    isAuthenticated: true,
    hasPaid: true,
    plan: planId, // 'weekly' | 'monthly' | 'lifetime'
    subscribedAt: new Date().toISOString()
  };

  saveUser(updated);

  // Sync with Supabase Auth user metadata
  supabase.auth.updateUser({
    data: {
      hasPaid: true,
      plan: planId,
      subscribedAt: updated.subscribedAt
    }
  }).catch((err) => {
    console.warn('Note: Could not sync subscription to Supabase user metadata', err);
  });

  return updated;
}

/**
 * Sign out from Supabase & clear cache
 */
export async function signOutUser() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Supabase sign out warning:', e);
  }
  saveUser(null);
}
