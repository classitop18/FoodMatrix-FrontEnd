export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh-token",
    CHANGE_PASSWORD: "/auth/change-password",
    LOGOUT: "/auth/logout",
    PROFILE: "/auth/profile",
    CHECK_IS_EXIST: "/auth/check",
    GET_CURRENT_SESSION: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    OTP_VERIFICATION: "/auth/verify-mfa",
    UPDATE_PROFILE: "/auth/",
    CHECK_PROPERTY: "/auth/exist",
  },
  ACCOUNT: {
    CREATE_ACCOUNT: "/account",
    GET_ACCOUNT: (id: string) => `/account/${id}`,
    GET_MY_ACCOUNT: "/account",
    UPDATE_ACCOUNT: (id: string) => `/account/${id}`,
    DELETE_ACCOUNT: (id: string) => `/account/${id}`,
  },

  MEMBER: {
    GET_ALL_MEMBERS: "member",
    CREATE_MEMBER: "member",
    GET_MEMBER_BY_ID: "member/:id",
    UPDATE_MEMBER: "member/:id",
    DELETE_MEMBER: "member/:id",
  },
  HEALTH_PROFILE: {
    GET_MEMBER_HEALTH_PROFILE: (id: string) => `/health-profile/${id}`,
    CREATE_HEALTH_PROFILE: "health-profile",
    UPDATE_HEALTH_PROFILE: (id: string) => `/health-profile/${id}`,
    DELETE_HEALTH_PROFILE: (id: string) => `/health-profile/${id}`,
  },

  // Pantry Management
  PANTRY: {
    GET_ITEMS: "/pantry",
    GET_EXPIRING: "/pantry/expiring",
    GET_ALERTS: "/pantry/alerts",
    ADD_ITEM: "/pantry",
    UPDATE_ITEM: (id: string) => `/pantry/${id}`,
    DELETE_ITEM: (id: string) => `/pantry/${id}`,
    DISMISS_ALERT: (alertId: string) => `/pantry/alerts/${alertId}/dismiss`,
  },

  // Ingredients
  INGREDIENTS: {
    GET_ALL: "/ingredients",
    GET_BY_ID: (id: string) => `/ingredients/${id}`,
    BY_CATEGORY: (category: string) => `/ingredients/by-category/${category}`,
    SEARCH: "/ingredients/search",
    CATEGORIES: "/ingredients/categories",
  },

  INVITATION: {
    SEND: "/invitations/send",
    ACCEPT: "/invitations/accept",
    APPROVE: "/invitations/approve",
    REJECT: "/invitations/reject",
    RESEND: "/invitations/resend",
    CANCEL: "/invitations/cancel",
    GET_ALL: "/invitations",
    GET_MY: "/invitations/my-invitations",
    VALIDATE_TOKEN: (token: string) => `/invitations/validate-token/${token}`,
  },

  // Meal Plans
  MEAL_PLAN: {
    GET_MEAL_PLANS: "/meal-plans",
    CREATE_MEAL_PLAN: "/meal-plans",
    UPDATE_MEAL_PLAN: (id: string) => `/meal-plans/${id}`,
    DELETE_MEAL_PLAN: (id: string) => `/meal-plans/${id}`,
  },

  // Recipes
  RECIPE: {
    GET_RECIPES: "/recipes",
    GET_RECIPE_BY_ID: (id: string) => `/recipes/${id}`,
    CREATE_RECIPE: "/recipes",
    UPDATE_RECIPE: (id: string) => `/recipes/${id}`,
    DELETE_RECIPE: (id: string) => `/recipes/${id}`,
    GENERATE_AI: "/recipes/generate-ai",
    SEARCH_CUSTOM: "/recipes/search-custom",
    UPDATE_STATUS: (id: string) => `/recipes/${id}/status`,
    INTERACT: (id: string) => `/recipes/${id}/interact`,
    CHECK_RECIPES_BY_DATE: "/recipes/check-by-date",
    GET_SHOPPING_LIST: (id: string) => `/recipes/${id}/shopping-list`,
    GET_MERGED_SHOPPING_LIST: `/recipes/shopping-list/merge`,
  },
};
