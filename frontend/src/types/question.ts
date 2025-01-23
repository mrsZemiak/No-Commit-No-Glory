export type QuestionType = 'rating' | 'text' | 'yes_no'

export interface Question {
  _id: string
  text: string
  type: QuestionType
  options?: { min: number; max: number }
  category: string
}
