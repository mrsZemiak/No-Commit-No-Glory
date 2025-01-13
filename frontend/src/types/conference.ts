export interface ConferenceAdmin {
  _id?: string;
  year: number;
  location: string;
  university: string;
  date: number | Date;
  status: string;
  start_date: number | Date;
  end_date: number | Date;
  deadline_submission: number | Date;
  deadline_review?: number | Date;
  created_at: Date;
}

export interface ActiveCategory {
  _id?: string;
  name: string;
  isActive: boolean;
}
