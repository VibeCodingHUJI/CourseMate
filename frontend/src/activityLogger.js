import { supabase } from './supabaseClient';

/**
 * Logs a user action to the user_activity_logs table.
 * @param {string} userId
 * @param {string} action  - e.g. 'login', 'view_course', 'post_review'
 * @param {object} [details] - any extra context (courseId, courseName, etc.)
 */
export async function logActivity(userId, action, details = {}) {
  if (!userId) return;

  const { error } = await supabase.from('user_activity_logs').insert({
    user_id: userId,
    action_type: action,
    metadata: details,
  });

  if (error) {
    console.error('[activityLogger] Failed to log activity:', error.message);
  }
}

// Convenience wrappers for the most common actions
export const ActivityActions = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW_COURSE: 'view_course',
  POST_REVIEW: 'post_review',
  DELETE_REVIEW: 'delete_review',
  POST_QUESTION: 'post_question',
  POST_ANSWER: 'post_answer',
  UPLOAD_MATERIAL: 'upload_material',
  FOLLOW_COURSE: 'follow_course',
  UNFOLLOW_COURSE: 'unfollow_course',
  OPEN_FORUM: 'open_forum',
  SEARCH_COURSE: 'search_course',
};
