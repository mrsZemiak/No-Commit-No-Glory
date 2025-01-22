export interface ReviewResponse {
  question: string;
  answer: string | number | null;
}

export interface Review {
  paper: string;
  reviewer: string;
  responses: ReviewResponse[];
  comments?: string;
  recommendation?: 'Publikovať' | 'Publikovať_so_zmenami' | 'Odmietnuť';
  created_at: Date;
  isDraft: boolean;
}
