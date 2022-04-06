import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ForceAutofocusDirective } from './force-autofocus.directive';

@NgModule({
  declarations: [ForceAutofocusDirective],
  imports: [CommonModule],
  exports: [ForceAutofocusDirective],
})
export class ForceAutofocusModule {}
