import { Appointment } from './appointment.model';

/** One step of a workflow. Workflows are free to define as many (or as few) as they need. */
export interface BoardColumn {
  id: string;
  title: string;
  accentClass: string;
  appointments: Appointment[];
}

/** A full pipeline (e.g. "Oncology Dept", "Urgent Care") made of an arbitrary number of steps. */
export interface Workflow {
  id: string;
  name: string;
  columns: BoardColumn[];
}
