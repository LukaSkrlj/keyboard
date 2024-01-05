import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {fabric} from 'fabric';
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'app-canvas-renderer',
  template: '<canvas id="fabricSurface"></canvas>\n',
  styleUrls: ['./canvas-renderer.component.css'],
  standalone: true,
  imports: [
    MatButtonModule
  ]
})
export class CanvasRendererComponent implements OnChanges, AfterViewInit {
  @Input() canvasData: any | null = null;
  @Input() textArea?: HTMLTextAreaElement;

  ngAfterViewInit(): void {
    this.renderCanvas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['canvasData'] && this.canvasData) {
      this.renderCanvas();
    }
  }

  private renderCanvas(): void {
    const canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#ebebef',
      selection: false,
      preserveObjectStacking: true,
      width: 500,
      height: 500,
    });
    console.log('Canvas Data:', this.canvasData);

    canvas.loadFromJSON(JSON.stringify(this.canvasData.toJSON()), () => {
      console.log('Canvas Rendered:', canvas);
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = true;
        obj.on('mousedown', (options) => {
          console.log(obj);
          console.log();
          if (this.textArea) {
            this.textArea.value += obj.toObject().objects[1].text;
            this.textArea.dispatchEvent(
              new KeyboardEvent('keyup', {
                bubbles: true,
                cancelable: true,
                shiftKey: false,
                key: obj.toObject().objects[1].text,
              }),
            );
          }
        })
      });
      canvas.renderAll();
    });
  }
}
