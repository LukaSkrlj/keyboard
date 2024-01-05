import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EditorComponent } from './components/editor/editor.component';
import { KeyboardComponent } from './components/keyboard/keyboard.component';
import { FabricService } from "./fabric.service";
import { CanvasRendererComponent } from "./components/canvas-renderer/canvas-renderer.component";
import { fabric } from "fabric";

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
    CanvasRendererComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  isEdit = true;
  title = 'keyboard';
  textArea?: HTMLTextAreaElement;
  canvasData: fabric.Canvas;
  @ViewChild('frameElement') frameElement?: ElementRef;

  constructor(private _fabricService: FabricService) {}

  ngOnInit() {
    this._fabricService.canvasData$.subscribe((canvasData: fabric.Canvas | null) => {
      this.canvasData = canvasData
      this.isEdit = canvasData === null;
    });
  }

  load() {
    if (this.frameElement) {
      this.textArea =
        this.frameElement.nativeElement.contentWindow.document.getElementById(
          'Transcribe',
        );
    }
  }
}
