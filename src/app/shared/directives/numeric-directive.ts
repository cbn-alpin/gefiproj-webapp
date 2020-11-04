import {
  Directive,
  ElementRef,
  HostListener,
  Input
} from "@angular/core";

@Directive({
  selector: "[numeric]"
})
export class NumericDirective {
  @Input() decimals = 0;

  private check(value: string): RegExpMatchArray {
      if (this.decimals <= 0) {
          return String(value).match(new RegExp(/^\d+$/));
      } else {
          var regExpString =
              "^\\s*((\\d+(\\.\\d{0," +
              this.decimals +
              "})?)|((\\d*(\\.\\d{1," +
              this.decimals +
              "}))))\\s*$";
          return String(value).match(new RegExp(regExpString));
      }
  }

  private run(oldValue): void {
      setTimeout(() => {
          const currentValue: string = this.el.nativeElement.value;
          if (currentValue !== '' && !this.check(currentValue)) {
              this.el.nativeElement.value = oldValue;
          }
      });
  }

  constructor(private el: ElementRef) {}

  @HostListener("keydown", ["$event"])
  public onKeyDown(): void {
      this.run(this.el.nativeElement.value);
  }

  @HostListener("paste", ["$event"])
  public onPaste(): void {
      this.run(this.el.nativeElement.value);
  }

}

// https://gist.github.com/ahmeti/5ca97ec41f6a48ef699ee6606560d1f7