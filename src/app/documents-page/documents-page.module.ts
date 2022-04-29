import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
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
    DragDropModule,
    LayoutModule,
    DialogsModule,
    InputsModule,
    FormsModule,
  ],
  exports: [DocumentsPageComponent],
})
export class DocumentsPageModule {}
