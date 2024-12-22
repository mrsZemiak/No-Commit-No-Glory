export interface ConferenceAdmin {
  name: string;
  year: number;
  location: string;
  conferenceDate: Date;
  submissionDeadline: Date;
  reviewDeadline: Date;
  revisionDeadline: Date;
  postConferenceRevisionDeadline: Date;
  categories: string[];
}

export interface CategoryAdmin {
  _id: string;
  name: string;
}
