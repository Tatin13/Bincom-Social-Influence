
export enum Step {
  BASE_URL = 0,
  SOURCE = 1,
  MEDIUM = 2,
  CAMPAIGN = 3,
  CONTENT = 4,
  ID = 5,
  CONFIRMATION = 6,
  RESULT = 7
}

export interface UTMState {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  id: string;
}

export interface DubResponse {
  shortLink: string;
  longUrl: string;
  createdAt: string;
  metadata: UTMState;
}

export interface StepConfig {
  title: string;
  description: string;
}
