export type UserMeRole = {
  id: number;
  name: string;
  description: string;
  active: boolean;
};

/** Normalized body from GET /v1/users/me */
export type UserMeProfile = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  role: UserMeRole;
  userActive: boolean;
  additionalPermissions: string[];
};
