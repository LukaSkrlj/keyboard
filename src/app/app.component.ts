import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EditorComponent } from './components/editor/editor.component';
import { KeyboardComponent } from './components/keyboard/keyboard.component';
import { FabricService } from './fabric.service';

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
  isEdit = false;
  title = 'keyboard';
  textArea?: HTMLTextAreaElement;
  @ViewChild('frameElement') frameElement?: ElementRef;

  constructor(private _fabricService: FabricService) {
    this._fabricService.keyEvent
      .asObservable()
      .subscribe((key) => this.click(key));
  }

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

  click(key) {
    if (this.textArea) {
      console.log('click sub');
      this.textArea.value += key;
      this.textArea.dispatchEvent(
        new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true,
          shiftKey: false,
          key,
        }),
      );
    }
  }
}
