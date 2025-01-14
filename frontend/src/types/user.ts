export enum UserStatus {
  Pending = 'Čakajúci',
  Active = 'Aktívny',
  Suspended = 'Pozastavený',
  Inactive = 'Neaktívny',
}

export interface User {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  university: string;
  status: UserStatus;
  role: {name: string};
  isVerified: boolean;
  verificationToken: string | null;
  refreshToken: string | null;
  faculty?: string;
  about?: string;
  avatar?: string;
}

export interface AdminUser {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  university: string;
  faculty?: string;
  status: UserStatus;
  role: {name: string};
  isVerified: boolean;
}

export interface Reviewer {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
}
