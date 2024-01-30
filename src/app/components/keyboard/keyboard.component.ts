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
import { FormsModule } from '@angular/forms';

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
    FormsModule,
  ],
  templateUrl: './keyboard.component.html',
  styleUrl: './keyboard.component.css',
})
export class KeyboardComponent implements OnInit, AfterViewInit {
  @ViewChild('frameElement') frameElement?: ElementRef;
  @ViewChild('canvasWrapper') canvasWrapper: ElementRef;

  @Output() keyPress = new EventEmitter<string>();
  @Output() toggleDraw: EventEmitter<fabric.Canvas | null> =
    new EventEmitter<fabric.Canvas | null>();

  keyboards: string[] = Object.keys(localStorage);
  textArea?: HTMLTextAreaElement;
  public canvas: fabric.Canvas = new fabric.Canvas('fabricSurface');
  downloadJsonHref: SafeUrl;
  isDraw: boolean = true;
  currentKeyboard: string;
  isShift: boolean = false;
  // CALCULATING PREDICTED WPM MAX
  CPSmax: number;
  digramFrequencies: Map<string, number> = new Map();
  coefficientA: number = 0.11353;
  coefficientB: number = 0.14743;
  maxPredictedWPM: number = 0.0;
  private allFabricEvents = [
    'after:render',
    'before:render',
    'canvas:cleared',
    'mouse:over',
    'mouse:out',
    'mouse:down',
    'mouse:up',
    'mouse:move',
    'mouse:wheel',
    'object:added',
    'object:modified',
    'object:moving',
    'object:over',
    'object:out',
    'object:removed',
    'object:rotating',
    'object:scaling',
    'object:selected',
    'path:created',
    'before:selection:cleared',
    'selection:cleared',
    'selection:created',
  ];
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
                'Space',
                'Shift',
                'Control',
                'Tab',
                'CapsLock',
                'Alt',
                'AltGraph',
              ].includes(letter)
            ) {
              const cursorPosition = this.getCursorPosition(
                this.textArea,
                options.e,
              );
              const currentText = this.textArea.value;
              if (letter === 'Backspace') {
                this.textArea.value =
                  currentText.substring(0, cursorPosition.start - 1) +
                  currentText.substring(cursorPosition.end);
                const newCursorPosition = cursorPosition.start - 1;
                this.setCursorPosition(this.textArea, newCursorPosition);
              } else if (letter === 'Delete') {
                this.textArea.value =
                  currentText.substring(0, cursorPosition.start) +
                  currentText.substring(cursorPosition.end + 1);
                const newCursorPosition = cursorPosition.start;
                this.setCursorPosition(this.textArea, newCursorPosition);
              } else {
                this.textArea.value =
                  currentText.substring(0, cursorPosition.start) +
                  letter +
                  currentText.substring(cursorPosition.end);
                const newCursorPosition = cursorPosition.start + letter.length;
                this.setCursorPosition(this.textArea, newCursorPosition);
              }
            }
            if (letter === 'Enter') {
              this.textArea.value += '\r\n';
            }
            if (letter === 'Space') {
              this.textArea.value += ' ';
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

  getCursorPosition(textarea: HTMLTextAreaElement, _: MouseEvent) {
    const { selectionStart, selectionEnd } = textarea;

    if (
      typeof selectionStart === 'number' &&
      typeof selectionEnd === 'number'
    ) {
      return { start: selectionStart, end: selectionEnd };
    } else {
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(textarea);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + range.toString().length;

        return { start, end };
      } else {
        return { start: 0, end: 0 };
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

    this.allFabricEvents.forEach((eventName) => {
      this.canvas.on(eventName, () => {
        const keys = this.canvas.getObjects();
        this.onInputParametersChange(keys);
      });
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
        this.keyboards = Object.keys(localStorage);
        this.onKeyboardSelect(file.name);
      };
    }
  }

  onAddShape(shape: string): void {
    const dialogRef = this.dialog.open(ConfigurationComponent, {
      data: {
        isPolygon: shape === 'polygon',
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const {
          letterInput,
          textColor,
          buttonColor,
          borderColor,
          fontSize,
          edgeCount,
        } = result;

        switch (shape) {
          case 'rect':
            this._fabricService.AddRectKey(
              letterInput,
              textColor,
              buttonColor,
              borderColor,
              fontSize,
            );
            break;
          case 'triangle':
            this._fabricService.AddTriangleKey(
              letterInput,
              textColor,
              buttonColor,
              borderColor,
              fontSize,
            );
            break;
          case 'oval':
            this._fabricService.AddOvalKey(
              letterInput,
              textColor,
              buttonColor,
              borderColor,
              fontSize,
            );
            break;
          case 'polygon':
            if (edgeCount) {
              const edges = parseInt(edgeCount, 10);

              if (!isNaN(edges) && edges >= 3) {
                this._fabricService.AddPolygonKey(
                  letterInput,
                  edges,
                  textColor,
                  buttonColor,
                  borderColor,
                  fontSize,
                );
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

  onDigramFileSelected(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target.result as string;
      this.loadDigramFrequencies(fileContent);
      const keys = this.canvas.getObjects(); // Assuming each fabric object represents a key
      this.updateMaxPredictedWPM(keys);
    };

    reader.readAsText(file);
  }

  onKeyboardSelect(keyboard: string) {
    this.canvas.loadFromJSON(localStorage.getItem(keyboard), () => {
      this.checkDrawingMode();
      const keys = this.canvas.getObjects();
      this.updateMaxPredictedWPM(keys); // Update max predicted WPM when loading a keyboard
    });
  }

  onInputParametersChange(keys: fabric.Object[]) {
    this.updateMaxPredictedWPM(keys);
  }

  loadDigramFrequencies(fileContent: string) {
    const lines = fileContent.split('\n');
    for (const line of lines) {
      if (line.length < 1) {
        return;
      }
      // first 2 chars are digrams
      const digram = line.substring(0, 2);
      // possible that digram is double space so wont split sections correctly
      // decimal point is , -> .
      if (digram === '  ') {
        const frequency =
          parseFloat(
            line.trim().split(/\s+/)[1].replace(',', '.').replace('%', ''),
          ) / 100;
        this.digramFrequencies.set(digram, frequency);
      } else {
        const frequency =
          parseFloat(
            line.trim().split(/\s+/)[2].replace(',', '.').replace('%', ''),
          ) / 100;
        this.digramFrequencies.set(digram, frequency);
      }
    }
  }

  calculateCPS(
    keys: fabric.Object[],
    digramFrequencies: Map<string, number>,
  ): number {
    let CT = 0;
    const centerPoints: fabric.Point[] = keys.map((key) =>
      key.getCenterPoint(),
    );
    // Testirati sve parove abecede + space
    for (let i = 0; i < centerPoints.length; i++) {
      for (let j = 0; j < centerPoints.length; j++) {
        let letterI = keys[i].toObject().objects[1].text.toLowerCase();
        let letterJ = keys[j].toObject().objects[1].text.toLowerCase();
        if (
          [
            'Enter',
            'Shift',
            'Control',
            'Tab',
            'CapsLock',
            'Alt',
            'AltGraph',
          ].includes(letterI) ||
          [
            'Enter',
            'Shift',
            'Control',
            'Tab',
            'CapsLock',
            'Alt',
            'AltGraph',
          ].includes(letterJ)
        ) {
          break;
        }
        if (letterI === 'space') {
          letterI = ' ';
        }
        if (letterJ === 'space') {
          letterJ = ' ';
        }
        const digram = letterI + letterJ;
        const Pij = digramFrequencies.get(digram);
        if (Pij === undefined) {
          console.log('ERROR: DIGRAM NOT FOUND ' + digram);
          return NaN;
        }
        const Aij = centerPoints[i].distanceFrom(centerPoints[j]);
        const Wj = keys[j].getScaledWidth();
        const MTij =
          (this.coefficientA + this.coefficientB) * Math.log2(Aij / Wj + 1);
        CT += MTij * Pij;
      }
    }
    return 1 / CT;
  }

  calculateMaxPredictedWPM(): number {
    return (this.CPSmax / 5) * 60;
  }

  updateMaxPredictedWPM(keys: fabric.Object[]) {
    this.CPSmax = this.calculateCPS(keys, this.digramFrequencies);
    this.maxPredictedWPM = this.calculateMaxPredictedWPM();
  }
}
