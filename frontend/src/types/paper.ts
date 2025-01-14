import type { Reviewer } from '@/types/user.ts'

export enum PaperStatus {
  Draft = 'Draft',
  Submitted = 'Odovzdaná',
  UnderReview = 'Posudzovanie',
  Accepted = 'Prijatá',
  AcceptedWithChanges = 'Prijatá_so_zmenami',
  Rejected = 'Odmietnutá',
}

export interface Paper {
  _id?: string;
  title: string;
  category: { name: string };
  submission_date: number;
  status: PaperStatus;
  conference: { year: number; location: string; date: Date; status: string };
  user: { first_name: string; last_name: string };
  reviewer?: Reviewer;
}
