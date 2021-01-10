import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';

@Directive({
  selector: 'input[numeric]',
})
export class NumericDirective implements OnInit {
  @Input() decimals: number = 0;
  @Input() year: boolean = false;

  private patternNumberWithoutDecimals: string;
  private patternNumberWithDecimals: string;
  private patternYear: string;

  private navigationKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'Home',
    'End',
    'ArrowLeft',
    'ArrowRight',
    'Clear',
    'Copy',
    'Paste',
  ];

  constructor(private _el: ElementRef) {}

  ngOnInit() {
    this.patternNumberWithoutDecimals = '^[0-9]*$';
    this.patternNumberWithDecimals =
      '^\\s*((\\d+(\\.\\d{0,' +
      this.decimals +
      '})?)|((\\d*(\\.\\d{1,' +
      this.decimals +
      '}))))\\s*$';
    this.patternYear = '^\\d{0,4}$';
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    const initialValue = this._el.nativeElement.value;
    const finalValue = initialValue + e.key;
    let resMatched;
    if (
      // Allow: Delete, Backspace, Tab, Escape, Enter, etc
      this.navigationKeys.indexOf(e.key) > -1 ||
      (e.key === 'a' && e.ctrlKey === true) || // Allow: Ctrl+A
      (e.key === 'c' && e.ctrlKey === true) || // Allow: Ctrl+C
      (e.key === 'v' && e.ctrlKey === true) || // Allow: Ctrl+V
      (e.key === 'x' && e.ctrlKey === true) || // Allow: Ctrl+X
      (e.key === 'a' && e.metaKey === true) || // Cmd+A (Mac)
      (e.key === 'c' && e.metaKey === true) || // Cmd+C (Mac)
      (e.key === 'v' && e.metaKey === true) || // Cmd+V (Mac)
      (e.key === 'x' && e.metaKey === true) // Cmd+X (Mac)
    ) {
      return;
    }

    if (e.key === '.' || !isNaN(Number(e.key))) {
      if (this.year) {
        resMatched = finalValue.match(new RegExp(this.patternYear));
      } else if (this.decimals <= 0) {
        resMatched = finalValue.match(
          new RegExp(this.patternNumberWithoutDecimals)
        );
      } else if (this.decimals > 0) {
        resMatched = String(finalValue).match(
          new RegExp(this.patternNumberWithDecimals)
        );
      }

      if (!resMatched) {
        e.preventDefault();
      } else {
      }
    } else {
      e.preventDefault();
    }
  }
}
