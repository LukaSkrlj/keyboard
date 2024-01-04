import { Component, NgZone, OnInit } from '@angular/core';
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
  protected _canvas: fabric.Canvas = new fabric.Canvas('fabricSurface');

  constructor(
    protected _fabricService: FabricService,
    protected _zone: NgZone,
  ) {}

  onToogleDraw() {}

  public ngOnInit(): void {
    this._zone.runOutsideAngular(() => {
      this._canvas = new fabric.Canvas('fabricSurface', {
        backgroundColor: '#ebebef',
        selection: false,
        preserveObjectStacking: true,
        width: 500,
        height: 500,
      });
      const rect = new fabric.Rect({
        left: 100,
        top: 50,
        fill: '#D81B60',
        width: 100,
        height: 100,
        strokeWidth: 2,
        stroke: '#880E4F',
        rx: 10,
        ry: 10,
        angle: 45,
        hasControls: true,
      });

      this._canvas.add(rect);

      // create a rectangle object
      const rect2 = new fabric.Rect({
        left: 200,
        top: 50,
        fill: '#F06292',
        width: 100,
        height: 100,
        strokeWidth: 2,
        stroke: '#880E4F',
        rx: 10,
        ry: 10,
        angle: 45,
        hasControls: true,
      });

      this._canvas.add(rect2);

      const circle1 = new fabric.Circle({
        radius: 65,
        fill: '#039BE5',
        left: 0,
      });

      const circle2 = new fabric.Circle({
        radius: 65,
        fill: '#4FC3F7',
        left: 110,
        opacity: 0.7,
      });

      const group = new fabric.Group([circle1, circle2], {
        left: 40,
        top: 250,
      });

      this._canvas.add(group);

      this._fabricService.canvas = this._canvas;
    });
  }

  onAdd() {
    this._fabricService.Add();
  }
}
