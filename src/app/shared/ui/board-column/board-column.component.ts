import { Component, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { BoardCardComponent } from '../board-card/board-card.component';
import { Appointment } from '../../../core/models/appointment.model';
import { BoardColumn } from '../../../core/models/board.model';

@Component({
  selector: 'app-board-column',
  imports: [CdkDropList, CdkDrag, BoardCardComponent],
  templateUrl: './board-column.component.html',
  host: { class: 'flex w-72 shrink-0 flex-col rounded-xl border border-gray-200 bg-white shadow-sm' }
})
export class BoardColumnComponent {
  column = input.required<BoardColumn>();
  dropped = output<CdkDragDrop<Appointment[]>>();
}
