import type { Paper } from '@/types/paper.ts'

export interface ConferenceAdmin {
  _id?: string
  year: number
  location: string
  university: string
  date: Date
  status: string
  start_date: Date
  end_date: Date
  deadline_submission: Date
  deadline_review?: Date
}

export interface ActiveCategory {
  _id?: string
  name: string
  isActive: boolean
}


