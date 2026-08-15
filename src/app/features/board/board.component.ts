import { Component, computed, inject, signal } from '@angular/core';
import { CdkDragDrop, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardColumnComponent } from '../../shared/ui/board-column/board-column.component';
import { AppointmentsService } from '../../core/services/appointments.service';
import { Appointment } from '../../core/models/appointment.model';
import { BoardColumn } from '../../core/models/board.model';

@Component({
  selector: 'app-board',
  imports: [CdkDropListGroup, BoardColumnComponent],
  templateUrl: './board.component.html',
  host: { class: 'flex min-h-0 flex-1 flex-col' }
})
export class BoardComponent {
  private readonly appointmentsService = inject(AppointmentsService);

  protected readonly workflows = this.appointmentsService.getWorkflows();
  protected readonly selectedWorkflowId = signal(this.workflows[0].id);

  protected readonly columns = computed<BoardColumn[]>(() => {
    const workflow = this.workflows.find((w) => w.id === this.selectedWorkflowId()) ?? this.workflows[0];
    return workflow.columns.map((column) => ({ ...column, appointments: [...column.appointments] }));
  });

  protected selectWorkflow(id: string): void {
    this.selectedWorkflowId.set(id);
  }

  protected drop(event: CdkDragDrop<Appointment[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
  }
}
