export interface ReviewResponse {
  question: string
  answer: string | number | null
}

export interface Review {
  _id?: string
  paper: string | any
  reviewer: string
  responses: ReviewResponse[]
  comments: string
  recommendation: 'Publikovať' | 'Publikovať_so_zmenami' | 'Odmietnuť'
  created_at: Date
  isDraft: boolean
}
