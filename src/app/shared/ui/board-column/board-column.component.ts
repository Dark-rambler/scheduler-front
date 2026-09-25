import { Component, input, output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragStart, CdkDropList } from '@angular/cdk/drag-drop';
import { BoardCardComponent } from '../board-card/board-card.component';
import { BoardAppointment, BoardColumn } from '../../../core/models/board.model';

type EnterPredicate = (drag: CdkDrag<BoardAppointment>, drop: CdkDropList<BoardAppointment[]>) => boolean;

@Component({
  selector: 'app-board-column',
  imports: [CdkDropList, CdkDrag, BoardCardComponent],
  templateUrl: './board-column.component.html',
  host: { class: 'glass-panel flex w-80 shrink-0 flex-col rounded-3xl' }
})
export class BoardColumnComponent {
  column = input.required<BoardColumn>();
  enterPredicate = input<EnterPredicate>(() => true);
  dropped = output<CdkDragDrop<BoardAppointment[]>>();
  cardClick = output<BoardAppointment>();

  private didDrag = false;

  protected onDragStarted(_: CdkDragStart): void {
    this.didDrag = true;
  }

  protected onCardClick(appointment: BoardAppointment): void {
    if (this.didDrag) {
      this.didDrag = false;
      return;
    }
    this.cardClick.emit(appointment);
  }
}
