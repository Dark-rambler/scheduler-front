import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(DialogRef<boolean>);
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);

  protected close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
