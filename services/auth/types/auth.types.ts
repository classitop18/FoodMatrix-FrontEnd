export interface UserLoginPayload {
  emailOrUsername: string;
  password: string;
}

export interface UserRegisterPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface CheckIsPropertyExist {
  field: string;
  value: string;
}
