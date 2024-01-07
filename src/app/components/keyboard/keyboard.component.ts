import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
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
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule,
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
  isShift: boolean = false;
  private resizeObserver = new ResizeObserver(
    this.throttle((event) => {
      this.canvas.setWidth(event[0].contentRect.width);
      this.canvas.setHeight(event[0].contentRect.height);
    }, 10),
  );

  constructor(
    private dialog: MatDialog,
    protected _fabricService: FabricService,
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
            const letter = obj.toObject().objects[1].text;
            if (
              ![
                'Enter',
                'Shift',
                'Control',
                'Tab',
                'CapsLock',
                'Alt',
                'AltGraph',
              ].includes(letter)
            ) {
              const cursorPosition = this.getCursorPosition(this.textArea, options.e);
              const currentText = this.textArea.value;
              const newTextValue =
                currentText.substring(0, cursorPosition.start) +
                letter +
                currentText.substring(cursorPosition.end);

              this.textArea.value = newTextValue;

              // Move the cursor to the end of the inserted text
              const newCursorPosition = cursorPosition.start + letter.length;
              this.setCursorPosition(this.textArea, newCursorPosition);
            }
            if (letter === 'Enter') {
              this.textArea.value += '\r\n';
            }
            if (letter === 'CapsLock' || letter === 'Shift') {
              this.isShift = !this.isShift;
            }


            // Insert the new text at the specified cursor position
            this.textArea.focus();
            options.e.preventDefault();
            options.e.stopPropagation();

            this.textArea.dispatchEvent(
              new KeyboardEvent('keyup', {
                shiftKey: this.isShift,
                bubbles: true,
                cancelable: true,
                key: letter,
              }),
            );
          }
        });
      });
    }
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  getCursorPosition(textarea: HTMLTextAreaElement, event: MouseEvent) {
    const {selectionStart, selectionEnd} = textarea;

    if (typeof selectionStart === 'number' && typeof selectionEnd === 'number') {
      return {start: selectionStart, end: selectionEnd};
    } else {
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(textarea);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + range.toString().length;

        return {start, end};
      } else {
        // Default to start of the textarea
        return {start: 0, end: 0};
      }
    }
  }

  setCursorPosition(textarea: HTMLTextAreaElement, position: number) {
    textarea.setSelectionRange(position, position);
  }

  onToggleDraw() {
    this.isDraw = !this.isDraw;
    this.checkDrawingMode();
  }

  public ngOnInit(): void {
    this._fabricService.openConfiguration$.asObservable().subscribe((data) => {
      this.dialog.open(ConfigurationComponent, {
        height: '450px',
        width: '300px',
        data,
      });
    });
  }

  ngAfterViewInit() {
    this.initializeCanvas();
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
    const dialogRef = this.dialog.open(ConfigurationComponent, {
      data: {
        isPolygon: shape === 'polygon',
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const {letterInput, textColor, buttonColor, borderColor, fontSize, edgeCount} = result;
        const letter = letterInput.trim().charAt(0);

        switch (shape) {
          case 'rect':
            this._fabricService.AddRectKey(letter, textColor, buttonColor, borderColor, fontSize);
            break;
          case 'triangle':
            this._fabricService.AddTriangleKey(letter, textColor, buttonColor, borderColor, fontSize);
            break;
          case 'oval':
            this._fabricService.AddOvalKey(letter, textColor, buttonColor, borderColor, fontSize);
            break;
          case 'polygon':
            if (edgeCount) {
              const edges = parseInt(edgeCount, 10);

              if (!isNaN(edges) && edges >= 3) {
                this._fabricService.AddPolygonKey(letter, edges, textColor, buttonColor, borderColor, fontSize);
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
    })
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
