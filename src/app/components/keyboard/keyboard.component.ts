import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { fabric } from 'fabric';
import { FabricService } from '../../fabric.service';
import { MatButtonModule } from '@angular/material/button';
import { ConfigurationComponent } from '../configuration/configuration.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-keyboard',
  standalone: true,
  imports: [
    MatButtonModule,
    ConfigurationComponent,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './keyboard.component.html',
  styleUrl: './keyboard.component.css',
})
export class KeyboardComponent implements OnInit {
  @Output() keyPress = new EventEmitter<string>();
  protected _canvas: fabric.Canvas = new fabric.Canvas('fabricSurface');

  @Output() toggleDraw: EventEmitter<fabric.Canvas | null> = new EventEmitter<fabric.Canvas | null>();
  private _isDrawing = true;

  constructor(
    protected _fabricService: FabricService,
    protected _zone: NgZone,
  ) {}

  onToogleDraw() {
    this._canvas.isDrawingMode = !this._canvas.isDrawingMode;
    this._fabricService.updateCanvasData(this._canvas);
  }

  public ngOnInit(): void {
    this._zone.runOutsideAngular(() => {
      this.initializeCanvas();
    });
  }

  initializeCanvas(): void {
    const canvasWidth = prompt('Enter the canvas width:');
    const canvasHeight = prompt('Enter the canvas height:');

    if (canvasWidth && canvasHeight) {
      const width = parseInt(canvasWidth, 10);
      const height = parseInt(canvasHeight, 10);

      if (!isNaN(width) && !isNaN(height)) {
        this._canvas = new fabric.Canvas('fabricSurface', {
          backgroundColor: '#ebebef',
          selection: false,
          preserveObjectStacking: true,
          width: width,
          height: height,
        });

        this._fabricService.canvas = this._canvas;
      } else {
        alert(
          'Invalid input. Please enter valid numbers for width and height.',
        );
      }
    } else {
      alert('Invalid input. Please enter values for both width and height.');
    }
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
        case 'circle':
          this._fabricService.AddCircleKey(letter);
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
