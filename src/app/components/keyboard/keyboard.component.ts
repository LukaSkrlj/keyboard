import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { fabric } from 'fabric';
import { FabricService } from '../../fabric.service';
import { MatButtonModule } from '@angular/material/button';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-keyboard',
  standalone: true,
  imports: [
    MatButtonModule,
    ConfigurationComponent,
    MatInputModule,
    MatFormFieldModule,
    CdkDrag,
    CdkDragHandle,
    MatIconModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './keyboard.component.html',
  styleUrl: './keyboard.component.css',
})
export class KeyboardComponent implements OnInit, AfterViewInit {
  @Output() keyPress = new EventEmitter<string>();
  @Output() toggleDraw: EventEmitter<fabric.Canvas | null> =
    new EventEmitter<fabric.Canvas | null>();
  @ViewChild('canvasWrapper') canvasWrapper: ElementRef;
  protected _canvas: fabric.Canvas = new fabric.Canvas('fabricSurface');
  private resizeObserver = new ResizeObserver(
    this.throttle((event) => {
      this._canvas.setWidth(event[0].contentRect.width);
      this._canvas.setHeight(event[0].contentRect.height);
    }, 10),
  );

  constructor(
    protected _fabricService: FabricService,
    protected _zone: NgZone,
  ) {}

  throttle(f, delay) {
    let timer = 0;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => f.apply(this, args), delay);
    };
  }

  onToogleDraw() {
    this._canvas.isDrawingMode = !this._canvas.isDrawingMode;
    this._fabricService.updateCanvasData(this._canvas);
  }

  public ngOnInit(): void {}

  ngAfterViewInit() {
    this._zone.runOutsideAngular(() => {
      this.initializeCanvas();
    });
    this.resizeObserver.observe(this.canvasWrapper.nativeElement);
  }

  initializeCanvas(): void {
    this._canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#ebebef',
      selection: false,
      preserveObjectStacking: true,
      width: 500,
      height: 500,
    });

    this._fabricService.canvas = this._canvas;
  }

  onAddShape(shape: string): void {
    const letterInput = prompt('Enter a letter to be inside the shape:');

    if (letterInput) {
      const letter = letterInput.trim().charAt(0).toUpperCase(); // Take the first character and convert to uppercase

      switch (shape) {
        case 'rect':
          this._fabricService.AddRectKey(letter);
          break;
        case 'triangle':
          this._fabricService.AddTriangleKey(letter);
          break;
        case 'oval':
          this._fabricService.AddOvalKey(letter);
          break;
        case 'polygon':
          const edgesInput = prompt(
            'Enter the number of edges for the custom shape:',
          );
          if (edgesInput) {
            const edges = parseInt(edgesInput, 10);

            if (!isNaN(edges) && edges >= 3) {
              this._fabricService.AddPolygonKey(letter, edges);
            } else {
              alert(
                'Invalid input. Please enter a valid number of edges (minimum 3).',
              );
            }
          }
          break;
        default:
          console.error(`Invalid shape: ${shape}`);
      }
    }
  }
}
