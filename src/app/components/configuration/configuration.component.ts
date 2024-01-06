import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { fabric } from 'fabric';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-configuration',
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    CommonModule,
    MatDialogTitle,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
  ],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class ConfigurationComponent {
  letter: FormControl;

  constructor(
    public dialogRef: MatDialogRef<ConfigurationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    console.log('whatt');
    this.letter = new FormControl('');
    // Set the initial letter based on the existing text content
    const target = this.data?.target;
    const textObject = target
      .getObjects()
      .find((obj: fabric.Object) => obj.type === 'text');
    if (textObject instanceof fabric.Text) {
      this.letter.setValue(textObject.text || '');
    }
  }

  validate() {
    this.letter.patchValue(
      this.letter.value
        .replace(/\W|\d/g, '')
        .substring(this.letter.value.length - 1, this.letter.value.length)
        .toLocaleLowerCase(),
    );
  }

  confirm(): void {
    const target = this.data?.target;

    if (target) {
      // Find the text object in the group
      const textObject = target
        .getObjects()
        .find((obj: fabric.Object) => obj.type === 'text');

      if (textObject instanceof fabric.Text) {
        // Update the text content
        textObject.set({ text: this.letter.value });

        // Render the canvas to see the changes
        this.data.canvas.requestRenderAll();
      }
    }

    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
