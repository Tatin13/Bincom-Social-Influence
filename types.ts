
export enum Step {
  FLOW_SELECTION = 0,
  BASE_URL = 1,
  SOURCE = 2,
  MEDIUM = 3,
  CAMPAIGN = 4,
  CONTENT = 5,
  ID = 6,
  ADDITIONAL_PARAMS = 7,
  CONFIRMATION = 8,
  RESULT = 9
}

export type FlowType = 'social' | 'other';

export interface AdditionalParam {
  key: string;
  value: string;
}

export interface UTMState {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  id: string;
  additionalParams: AdditionalParam[];
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
