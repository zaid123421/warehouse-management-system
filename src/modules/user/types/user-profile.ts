export type UserMePermission = {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
  systemGenerated: boolean;
  active: boolean;
};

export type UserMeRole = {
  id: number;
  name: string;
  description: string;
  systemGenerated: boolean;
  active: boolean;
  system: boolean;
};

/** Normalized body from GET /v1/users/me */
export type UserMeProfile = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  position: string;
  role: UserMeRole;
  additionalPermissions: UserMePermission[];
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
  active: boolean;
  system: boolean;
};
