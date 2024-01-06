import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

@Component({
  selector: 'app-save-dialog',
  standalone: true,
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './save-dialog.component.html',
  styleUrl: './save-dialog.component.css',
})
export class SaveDialogComponent {
  control = new UntypedFormControl();

  constructor(public dialogRef: MatDialogRef<SaveDialogComponent>) {}

  onSave() {
    this.dialogRef.close(this.control.value);
  }
}
