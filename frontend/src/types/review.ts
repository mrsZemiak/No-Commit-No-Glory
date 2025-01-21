export interface ReviewResponse {
  question: string;
  answer: string | number;
}

export interface Review {
  paper: string;
  reviewer: string;
  responses: ReviewResponse[];
  comments?: string;
  recommendation?: 'Publikovať' | 'Publikovať_so_zmenami' | 'Odmietnuť';
  created_at: Date;
}
