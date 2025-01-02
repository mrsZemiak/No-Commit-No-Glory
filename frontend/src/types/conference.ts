export interface ConferenceAdmin {
  _id?: string;
  year: number;
  location: string;
  university: string;
  date: Date;
  status: string;
  start_date: Date;
  end_date: Date;
  deadline_submission: Date;
  deadline_review: Date;
  created_at: Date;
  user: string;
}

export interface CategoryAdmin {
  _id: string;
  name: string;
}
