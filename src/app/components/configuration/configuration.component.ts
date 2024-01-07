import { ChangeDetectorRef, Component, Inject } from '@angular/core';
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
import { ColorPickerModule, ColorPickerService } from 'ngx-color-picker';

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
    ColorPickerModule,
  ],
  providers: [ColorPickerService],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css'], // Change from styleUrl to styleUrls
  standalone: true,
})
export class ConfigurationComponent {
  letter: FormControl;
  fontSize: FormControl;
  edgeCount: FormControl;
  buttonColor: string;
  borderColor: string;
  textColor: string;
  isPolygon= false;

  constructor(
    public dialogRef: MatDialogRef<ConfigurationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef,
  ) {
    this.letter = new FormControl('');
    this.fontSize = new FormControl(0);
    this.edgeCount = new FormControl(3);
    this.isPolygon = this.data?.isPolygon || false;
    const target = this.data?.target;
    if(target) {
      const textObject = target
        .getObjects()
        .find((obj: fabric.Object) => obj.type === 'text');
      if (textObject instanceof fabric.Text) {
        this.letter.setValue(textObject.text || '');
        this.fontSize.setValue(textObject.get('fontSize') || 16);
        if (typeof textObject.get('fill') === 'string') {
          this.textColor = textObject.get('fill').toString();
        } else {
          this.textColor = 'black';
        }
      }
      const shapeObject = target
        .getObjects()
        .find((obj: fabric.Object) => obj.type !== 'text');
      if (shapeObject) {
        this.buttonColor = shapeObject.get('fill');
        this.borderColor = shapeObject.get('stroke');
      }
    } else {
      this.textColor = 'black';
      this.fontSize.setValue(16);
      this.buttonColor = '#00FF00';
      this.borderColor = '#0000FF';
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
    const result = {
      letterInput: this.letter.value,
      textColor: this.textColor,
      buttonColor: this.buttonColor,
      borderColor: this.borderColor,
      fontSize: this.fontSize.value,
      edgeCount: this.edgeCount.value,
    };

    if (target) {
      const textObject = target
        .getObjects()
        .find((obj: fabric.Object) => obj.type === 'text');

      if (textObject instanceof fabric.Text) {
        textObject.set({ text: this.letter.value });
        textObject.set({ fill: this.textColor });
        textObject.set({ fontSize: this.fontSize.value });
      }

      const shapeObject = target
        .getObjects()
        .find((obj: fabric.Object) => obj.type != 'text');
      if (shapeObject) {
        shapeObject.set({ stroke: this.borderColor, fill: this.buttonColor });
      }
      this.data.canvas.requestRenderAll();
    }

    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  validatePositiveNumber() {
    const inputValue = this.fontSize.value;
    if (isNaN(inputValue) || inputValue <= 0) {
      this.fontSize.setValue(16);
    }
  }

  validatePolygon() {
    const inputValue = this.fontSize.value;
    if (isNaN(inputValue) || inputValue <= 0) {
      this.fontSize.setValue(16);
    }
  }
}
