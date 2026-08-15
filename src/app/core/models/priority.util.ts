import { Priority } from './appointment.model';
import { BadgeTone } from '../../shared/ui/badge/badge.component';

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

export const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  low: 'secondary',
  medium: 'tertiary',
  high: 'danger',
  urgent: 'danger'
};

export const PRIORITY_BORDER: Record<Priority, string> = {
  low: 'border-l-secondary',
  medium: 'border-l-tertiary',
  high: 'border-l-red-500',
  urgent: 'border-l-red-600'
};

export const PRIORITY_DOT: Record<Priority, string> = {
  low: 'bg-secondary',
  medium: 'bg-tertiary',
  high: 'bg-red-500',
  urgent: 'bg-red-600'
};
