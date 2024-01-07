import { Injectable } from '@angular/core';

import { fabric } from 'fabric';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FabricService {
  // draw properties are public to keep the demo more compact; but, you break it ... you buy it
  public strokeWidth: number;
  public strokeColor: string;
  public circleRadius: number;
  public circleFill: string;
  deleteIcon =
    "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
  cloneIcon =
    "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='iso-8859-1'%3F%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 55.699 55.699' width='100px' height='100px' xml:space='preserve'%3E%3Cpath style='fill:%23010002;' d='M51.51,18.001c-0.006-0.085-0.022-0.167-0.05-0.248c-0.012-0.034-0.02-0.067-0.035-0.1 c-0.049-0.106-0.109-0.206-0.194-0.291v-0.001l0,0c0,0-0.001-0.001-0.001-0.002L34.161,0.293c-0.086-0.087-0.188-0.148-0.295-0.197 c-0.027-0.013-0.057-0.02-0.086-0.03c-0.086-0.029-0.174-0.048-0.265-0.053C33.494,0.011,33.475,0,33.453,0H22.177 c-3.678,0-6.669,2.992-6.669,6.67v1.674h-4.663c-3.678,0-6.67,2.992-6.67,6.67V49.03c0,3.678,2.992,6.669,6.67,6.669h22.677 c3.677,0,6.669-2.991,6.669-6.669v-1.675h4.664c3.678,0,6.669-2.991,6.669-6.669V18.069C51.524,18.045,51.512,18.025,51.51,18.001z M34.454,3.414l13.655,13.655h-8.985c-2.575,0-4.67-2.095-4.67-4.67V3.414z M38.191,49.029c0,2.574-2.095,4.669-4.669,4.669H10.845 c-2.575,0-4.67-2.095-4.67-4.669V15.014c0-2.575,2.095-4.67,4.67-4.67h5.663h4.614v10.399c0,3.678,2.991,6.669,6.668,6.669h10.4 v18.942L38.191,49.029L38.191,49.029z M36.777,25.412h-8.986c-2.574,0-4.668-2.094-4.668-4.669v-8.985L36.777,25.412z M44.855,45.355h-4.664V26.412c0-0.023-0.012-0.044-0.014-0.067c-0.006-0.085-0.021-0.167-0.049-0.249 c-0.012-0.033-0.021-0.066-0.036-0.1c-0.048-0.105-0.109-0.205-0.194-0.29l0,0l0,0c0-0.001-0.001-0.002-0.001-0.002L22.829,8.637 c-0.087-0.086-0.188-0.147-0.295-0.196c-0.029-0.013-0.058-0.021-0.088-0.031c-0.086-0.03-0.172-0.048-0.263-0.053 c-0.021-0.002-0.04-0.013-0.062-0.013h-4.614V6.67c0-2.575,2.095-4.67,4.669-4.67h10.277v10.4c0,3.678,2.992,6.67,6.67,6.67h10.399 v21.616C49.524,43.26,47.429,45.355,44.855,45.355z'/%3E%3C/svg%3E%0A";
  configurationIcon =
    'data:image/png;base64,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';
  deleteImg = document.createElement('img');
  cloneImg = document.createElement('img');
  configurationImg = document.createElement('img');
  keyEvent = new Subject<string>();
  openConfiguration$ = new Subject();
  protected _clipboard: any;
  protected _points: Array<fabric.Circle>;
  protected _polylines: Record<string, fabric.Polyline>;
  // WE PASS CANVAS DATA FROM KEY EDITOR TO APP
  private canvasDataSubject = new Subject<fabric.Canvas | null>();
  canvasData$ = this.canvasDataSubject.asObservable();

  constructor(private dialog: MatDialog) {
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = 'blue';
    fabric.Object.prototype.cornerStyle = 'circle';
    // @ts-ignore
    fabric.Object.prototype.controls['clone'] = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: this.cloneObject,
      render: this.renderIcon(this.cloneImg),
      sizeX: 24,
      sizeY: 24,
      touchSizeX: 24,
      touchSizeY: 24,
    });
    fabric.Object.prototype.controls['deleteControl'] = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: 44,
      cursorStyle: 'pointer',
      mouseUpHandler: this.deleteObject,
      render: this.renderIcon(this.deleteImg),
      sizeX: 24,
      sizeY: 24,
      touchSizeX: 24,
      touchSizeY: 24,
    });
    fabric.Object.prototype.controls['configuration'] = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: 72,
      cursorStyle: 'pointer',
      mouseUpHandler: this.openConfiguration.bind(this),
      render: this.renderIcon(this.configurationImg),
      sizeX: 24,
      sizeY: 24,
      touchSizeX: 24,
      touchSizeY: 24,
    });
    this.cloneImg.src = this.cloneIcon;
    this.deleteImg.src = this.deleteIcon;
    this.configurationImg.src = this.configurationIcon;
    this.strokeWidth = 2;
    this.strokeColor = '#000000';
    this.circleFill = '#0000ff';
    this.circleRadius = 2;

    this._points = new Array<fabric.Circle>();
    this._polylines = {};
  }

  protected _canvas?: fabric.Canvas;

  public set canvas(surface: fabric.Canvas) {
    if (
      surface !== undefined &&
      surface != null &&
      surface instanceof fabric.Canvas
    ) {
      this._canvas = surface;
    }
  }

  updateCanvasData(canvasData: fabric.Canvas | null): void {
    this.canvasDataSubject.next(canvasData);
  }

  public clear(): void {
    if (this._canvas) {
      this._points.forEach((circle: fabric.Circle): void => {
        this._canvas?.remove(circle);
      });

      this._points.length = 0;

      Object.keys(this._polylines).forEach((name: string): void => {
        this._canvas?.remove(this._polylines[name]);
      });

      this._polylines = {};

      this._canvas.renderAll();
    }
  }

  AddRectKey(letter: string): void {
    const rect = new fabric.Rect({
      left: 100,
      top: 50,
      fill: 'yellow',
      width: 200,
      height: 100,
      //objectCaching: false,
      stroke: 'lightgreen',
      strokeWidth: 4,
      perPixelTargetFind: true,
    });

    const text = new fabric.Text(letter, {
      left: rect.left + rect.width / 2,
      top: rect.top + rect.height / 2,
      fontSize: 16,
      fill: 'black',
      originX: 'center',
      originY: 'center',
    });

    rect.on('mouseup', () => {
      this.keyEvent.next(letter);
    });

    const group = new fabric.Group([rect, text], {});

    this._canvas?.add(group);
    this._canvas?.setActiveObject(group);
  }

  AddTriangleKey(letter: string): void {
    const triangle = new fabric.Triangle({
      left: 100,
      top: 50,
      fill: 'blue',
      width: 200,
      height: 100,
      // objectCaching: false,
      stroke: 'darkblue',
      strokeWidth: 4,
      perPixelTargetFind: true,
    });

    triangle.on('mouseup', () => {
      this.keyEvent.next(letter);
    });

    const text = new fabric.Text(letter, {
      left: triangle.left + triangle.width / 2,
      top: triangle.top + triangle.height / 2,
      fontSize: 16,
      fill: 'black',
      originX: 'center',
      originY: 'center',
    });

    const group = new fabric.Group([triangle, text], {});

    this._canvas?.add(group);
    this._canvas?.setActiveObject(group);
  }

  AddOvalKey(letter: string): void {
    const oval = new fabric.Ellipse({
      left: 50,
      top: 50,
      fill: 'green',
      rx: 50,
      ry: 50,
      //objectCaching: false,
      stroke: 'darkgreen',
      strokeWidth: 4,
      perPixelTargetFind: true,
    });

    oval.on('mouseup', () => {
      this.keyEvent.next(letter);
    });

    const text = new fabric.Text(letter, {
      left: oval.left + oval.rx,
      top: oval.top + oval.ry,
      fontSize: 16,
      fill: 'black',
      originX: 'center',
      originY: 'center',
    });

    const group = new fabric.Group([oval, text], {});

    this._canvas?.add(group);
    this._canvas?.setActiveObject(group);
  }

  AddPolygonKey(letter: string, edges: number): void {
    const customShape = new fabric.Polygon(
      this.calculateRegularPolygonPoints(edges),
      {
        left: 100,
        top: 50,
        fill: 'purple',
        //objectCaching: false,
        stroke: 'darkpurple',
        strokeWidth: 4,
        perPixelTargetFind: true,
      },
    );

    customShape.on('mouseup', () => {
      this.keyEvent.next(letter);
    });

    const text = new fabric.Text(letter, {
      left: customShape.left + customShape.width / 2,
      top: customShape.top + customShape.height / 2,
      fontSize: 16,
      fill: 'black',
      originX: 'center',
      originY: 'center',
    });

    const group = new fabric.Group([customShape, text], {});

    this._canvas?.add(group);
    this._canvas?.setActiveObject(group);
  }

  renderIcon(icon) {
    return function renderIcon(ctx, left, top, styleOverride, fabricObject) {
      const size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(icon, -size / 2, -size / 2, size, size);
      ctx.restore();
    };
  }

  deleteObject(eventData: any, transform: any) {
    var target = transform.target;
    var canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
    return true;
  }

  cloneObject(eventData: any, transform: any) {
    const target = transform.target;
    const canvas = target.canvas;
    target.clone(function (cloned: any) {
      cloned.left += 10;
      cloned.top += 10;
      canvas.add(cloned);
    });
    return true;
  }

  openConfiguration(eventData: any, transform: fabric.Transform) {
    const target = transform?.target;
    const canvas = target.canvas;
    if (target) {
      this.openConfiguration$.next({ target, canvas });
    }
    return true;
  }

  calculateRegularPolygonPoints(edges: number): fabric.Point[] {
    const points: fabric.Point[] = [];
    const radius = 50; // Adjust the radius as needed

    for (let i = 0; i < edges; i++) {
      const angle = (2 * Math.PI * i) / edges;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      points.push(new fabric.Point(x, y));
    }

    return points;
  }
}
