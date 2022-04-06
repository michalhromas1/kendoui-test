import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[forceAutofocus]',
})
export class ForceAutofocusDirective {
  constructor(private host: ElementRef) {}

  ngAfterViewInit() {
    this.host.nativeElement.focus();
  }
}
