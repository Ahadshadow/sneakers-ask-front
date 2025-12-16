// Auth utility functions

const VIEW_MODE_KEY = 'dev_view_mode'; // 'admin' | 'seller' | null

/**
 * Set the development view mode override (for testing)
 */
export const setViewMode = (mode: 'admin' | 'seller' | null) => {
  if (mode === null) {
    localStorage.removeItem(VIEW_MODE_KEY);
  } else {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }
  // Trigger a page reload to apply the change
  window.location.reload();
};

/**
 * Get the current view mode override
 */
export const getViewMode = (): 'admin' | 'seller' | null => {
  const mode = localStorage.getItem(VIEW_MODE_KEY);
  return mode === 'admin' || mode === 'seller' ? mode : null;
};

/**
 * Helper function to check if user is a seller
 * Checks various possible ways to identify a seller user
 */
export const isSeller = (user: any): boolean => {
  if (!user) return false;
  
  // Check various possible ways to identify a seller
  if (user.role === "Bulk Seller" || user.role === "seller" || user.role === "Seller") return true;
  if (user.role?.name === "Bulk Seller" || user.role?.name === "seller" || user.role?.name === "Seller") return true;
  if (user.user_type === "seller") return true;
  if (user.role_id && typeof user.role_id === 'number') {
    // You might need to check role_id against a known seller role ID
    // For now, we'll rely on role name checks
  }
  return false;
};

