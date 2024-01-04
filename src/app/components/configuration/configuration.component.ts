import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormsModule,
    CommonModule,
    MatDialogTitle,
  ],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css',
})
export class ConfigurationComponent {
  letter = new FormControl('a');

  validate() {
    this.letter.patchValue(
      this.letter.value
        .replace(/\W|\d/g, '')
        .substring(this.letter.value.length - 1, this.letter.value.length)
        .toLocaleLowerCase(),
    );
  }
}
