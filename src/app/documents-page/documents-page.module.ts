import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { ForceAutofocusModule } from '../force-autofocus/force-autofocus.module';
import { DocumentsPageComponent } from './documents-page.component';

@NgModule({
  declarations: [DocumentsPageComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GridModule,
    ButtonsModule,
    DropDownsModule,
    ForceAutofocusModule,
  ],
  exports: [DocumentsPageComponent],
})
export class DocumentsPageModule {}
