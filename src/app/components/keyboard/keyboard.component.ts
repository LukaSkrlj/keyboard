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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { SaveDialogComponent } from '../save-dialog/save-dialog.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    MatMenuModule,
  ],
  templateUrl: './keyboard.component.html',
  styleUrl: './keyboard.component.css',
})
export class KeyboardComponent implements OnInit, AfterViewInit {
  keyboards: string[] = Object.keys(localStorage);
  @Output() keyPress = new EventEmitter<string>();
  @Output() toggleDraw: EventEmitter<fabric.Canvas | null> =
    new EventEmitter<fabric.Canvas | null>();

  textArea?: HTMLTextAreaElement;
  @ViewChild('frameElement') frameElement?: ElementRef;
  @ViewChild('canvasWrapper') canvasWrapper: ElementRef;
  public canvas: fabric.Canvas = new fabric.Canvas('fabricSurface');
  downloadJsonHref: SafeUrl;
  isDraw: boolean = true;
  currentKeyboard: string;
  private resizeObserver = new ResizeObserver(
    this.throttle((event) => {
      this.canvas.setWidth(event[0].contentRect.width);
      this.canvas.setHeight(event[0].contentRect.height);
    }, 10),
  );

  constructor(
    private dialog: MatDialog,
    protected _fabricService: FabricService,
    protected _zone: NgZone,
    private sanitizer: DomSanitizer,
  ) {}

  throttle(f, delay) {
    let timer = 0;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => f.apply(this, args), delay);
    };
  }

  checkDrawingMode() {
    if (this.isDraw) {
      this.canvas.selection = true;
      this.canvas.forEachObject((obj) => {
        obj.selectable = true;
        obj.hoverCursor = undefined;
        obj.perPixelTargetFind = false;
        obj.off('mousedown');
      });
    } else {
      this.canvas.selection = false;
      this.canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.hoverCursor = 'pointer';
        obj.perPixelTargetFind = true;
        obj.on('mousedown', (options) => {
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
        });
      });
    }
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  onToggleDraw() {
    this.isDraw = !this.isDraw;
    this.checkDrawingMode();
  }

  public ngOnInit(): void {}

  ngAfterViewInit() {
    this._zone.runOutsideAngular(() => {
      this.initializeCanvas();
    });
    this.resizeObserver.observe(this.canvasWrapper.nativeElement);
  }

  initializeCanvas(): void {
    this.canvas = new fabric.Canvas('fabricSurface', {
      backgroundColor: '#ebebef',
      selection: true,
      //preserveObjectStacking: true,
      width: 500,
      height: 500,
    });

    this._fabricService.canvas = this.canvas;
  }

  onFileSelected(event) {
    if (event.target.files.length) {
      const read = new FileReader();
      const file = event.target.files[0];
      read.readAsBinaryString(file);

      read.onloadend = () => {
        localStorage.setItem(file.name, read.result.toString());
      };
    }
  }

  onAddShape(shape: string): void {
    const letterInput = prompt('Enter a letter to be inside the shape:');

    if (letterInput) {
      const letter = letterInput.trim().charAt(0).toLocaleLowerCase();

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

  load() {
    if (this.frameElement) {
      this.textArea =
        this.frameElement.nativeElement.contentWindow.document.getElementById(
          'Transcribe',
        );
    }
  }

  onSave() {
    this.dialog
      .open(SaveDialogComponent)
      .afterClosed()
      .subscribe((keyboardName) => {
        this.keyboards.push(keyboardName);

        localStorage.setItem(
          keyboardName,
          JSON.stringify(this.canvas.toJSON()),
        );
      });
  }

  onDownload() {
    this.generateDownloadJsonUri();
  }

  onDelete() {
    localStorage.removeItem(this.currentKeyboard);
    this.canvas.clear();
  }

  generateDownloadJsonUri() {
    const theJSON = JSON.stringify(this.canvas.toJSON());
    this.downloadJsonHref = this.sanitizer.bypassSecurityTrustUrl(
      'data:text/json;charset=UTF-8,' + encodeURIComponent(theJSON),
    );
  }

  onKeyboardSelect(keyboard: string) {
    this.canvas.loadFromJSON(
      localStorage.getItem(keyboard),
      this.checkDrawingMode,
    );
  }
}
