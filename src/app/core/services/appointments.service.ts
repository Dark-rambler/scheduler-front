import { Injectable } from '@angular/core';
import { Workflow } from '../models/board.model';

/** Mock data source. Swap the body of getWorkflows() for an HTTP call once the API exists. */
@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly workflows: Workflow[] = [
    {
      id: 'oncology',
      name: 'Oncology Dept',
      columns: [
        {
          id: 'scheduled',
          title: 'Scheduled',
          accentClass: 'bg-primary',
          appointments: [
            { id: 'PT-842', patientName: 'Alice Johnson', reason: 'Annual Checkup', time: '10:30 AM', priority: 'low', doctor: 'Dr. Smith' },
            { id: 'PT-845', patientName: 'Robert Davis', reason: 'Post-op Review', time: '11:15 AM', priority: 'medium' }
          ]
        },
        {
          id: 'checked-in',
          title: 'Checked In',
          accentClass: 'bg-tertiary',
          appointments: [{ id: 'PT-850', patientName: 'Maria Garcia', reason: 'Severe Pain Consult', priority: 'high', waitMinutes: 15 }]
        },
        { id: 'in-consultation', title: 'In Consultation', accentClass: 'bg-secondary', appointments: [] },
        { id: 'completed', title: 'Completed', accentClass: 'bg-gray-400', appointments: [] }
      ]
    },
    {
      id: 'urgent-care',
      name: 'Urgent Care',
      columns: [
        {
          id: 'triage',
          title: 'Triage',
          accentClass: 'bg-primary',
          appointments: [{ id: 'PT-902', patientName: 'John Doe', reason: 'Chest Pain', time: '09:05 AM', priority: 'urgent' }]
        },
        {
          id: 'waiting-room',
          title: 'Waiting Room',
          accentClass: 'bg-tertiary',
          appointments: [{ id: 'PT-905', patientName: 'Jane Roe', reason: 'Sprained Ankle', time: '09:20 AM', priority: 'medium' }]
        },
        { id: 'in-treatment', title: 'In Treatment', accentClass: 'bg-secondary', appointments: [] },
        { id: 'observation', title: 'Observation', accentClass: 'bg-indigo-400', appointments: [] },
        { id: 'discharged', title: 'Discharged', accentClass: 'bg-gray-400', appointments: [] }
      ]
    },
    {
      id: 'lab',
      name: 'Lab Services',
      columns: [
        {
          id: 'sample-collected',
          title: 'Sample Collected',
          accentClass: 'bg-primary',
          appointments: [{ id: 'SM-231', patientName: 'Carlos Diaz', reason: 'Blood Panel', priority: 'low' }]
        },
        { id: 'processing', title: 'Processing', accentClass: 'bg-tertiary', appointments: [] },
        { id: 'result-ready', title: 'Result Ready', accentClass: 'bg-secondary', appointments: [] }
      ]
    }
  ];

  getWorkflows(): Workflow[] {
    return this.workflows;
  }
}
