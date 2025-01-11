export enum UserStatus {
  Pending = 'pending',
  Active = 'active',
  Suspended = 'suspended',
  Inactive = 'inactive',
}

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  university: string;
  status: UserStatus;
  role?: {name: string};
  isVerified: boolean;
  verificationToken: string | null;
  refreshToken: string | null;
  faculty?: string;
  about?: string;
  avatar?: string;
}
