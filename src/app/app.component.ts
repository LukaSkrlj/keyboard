import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EditorComponent } from './components/editor/editor.component';
import { KeyboardComponent } from './components/keyboard/keyboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatIconModule,
    MatToolbarModule,
    EditorComponent,
    KeyboardComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  isEdit = true;
  title = 'keyboard';
  textArea?: HTMLTextAreaElement;
  @ViewChild('frameElement') frameElement?: ElementRef;

  load() {
    if (this.frameElement) {
      this.textArea =
        this.frameElement.nativeElement.contentWindow.document.getElementById(
          'Transcribe',
        );
      this.textArea?.dispatchEvent(
        new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true,
          shiftKey: false,
          key: 'a',
        }),
      );
    }
  }

  click() {
    if (this.textArea) {
      this.textArea.value = 'a';
      this.textArea.dispatchEvent(
        new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true,
          shiftKey: false,
          key: 'a',
        }),
      );
    }
  }
}
