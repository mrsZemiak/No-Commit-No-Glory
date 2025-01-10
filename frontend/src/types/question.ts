export interface Question {
  _id: string;
  text: string;
  type: 'rating' | 'yes_no' | 'text';
  options?: { min: number; max: number };
  category: string;
}
