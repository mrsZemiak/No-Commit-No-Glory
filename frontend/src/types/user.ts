export enum UserStatus {
  Pending = 'pending',
  Active = 'active',
  Suspended = 'suspended',
  Inactive = 'inactive',
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  university: string;
  status: UserStatus;
  role: string;
  isVerified: boolean;
  verificationToken: string | null;
  refreshToken: string | null;
}
