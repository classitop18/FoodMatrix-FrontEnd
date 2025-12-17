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
  },

  MEMBER: {
    GET_ALL_MEMBERS: "member"
  },
  HEALTH_PROFILE: {
    GET_MEMBER_HEALTH_PROFILE: (id: string) => `/health-profile/${id}`
  }
};
