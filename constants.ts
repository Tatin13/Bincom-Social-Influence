
import { Step, StepConfig } from './types';

export const SOURCES = ['events', 'LinkedInVacancy', 'referral', 'website'];
export const MEDIUMS = ['uksummit', 'linkedin', 'email', 'whatsapp'];
export const CAMPAIGNS = ['eMigr8events', 'eMigr8VolunteerLinkedIn', 'eMigr8Assessment', 'eMigr8Referral'];

export const STEP_CONFIGS: Record<Step, StepConfig> = {
  [Step.FLOW_SELECTION]: {
    title: 'Select Campaign Type',
    description: 'What project or service are you generating a URL for?'
  },
  [Step.BASE_URL]: {
    title: 'Base URL',
    description: 'Enter the destination website URL.'
  },
  [Step.SOURCE]: {
    title: 'UTM Source',
    description: 'Select or type the traffic source (utm_source).'
  },
  [Step.MEDIUM]: {
    title: 'UTM Medium',
    description: 'Select or type the marketing medium (utm_medium).'
  },
  [Step.CAMPAIGN]: {
    title: 'UTM Campaign',
    description: 'Select or type the specific campaign (utm_campaign).'
  },
  [Step.CONTENT]: {
    title: 'UTM Content',
    description: 'Optional: Enter content identifier (utm_content).'
  },
  [Step.ID]: {
    title: 'UTM ID',
    description: 'Optional: Enter campaign ID (utm_id).'
  },
  [Step.ADDITIONAL_PARAMS]: {
    title: 'Additional Parameters',
    description: 'Add any custom key-value pairs (e.g. entry.123=value).'
  },
  [Step.CONFIRMATION]: {
    title: 'Confirmation',
    description: 'Review your parameters before generating the short link.'
  },
  [Step.RESULT]: {
    title: 'Success!',
    description: 'Your shortened URL is ready.'
  }
};
