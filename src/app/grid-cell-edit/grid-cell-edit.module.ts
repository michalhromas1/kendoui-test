import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { ForceAutofocusModule } from '../force-autofocus/force-autofocus.module';
import { GridCellEditComponent } from './grid-cell-edit.component';

@NgModule({
  declarations: [GridCellEditComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GridModule,
    ButtonsModule,
    DropDownsModule,
    ForceAutofocusModule,
  ],
  exports: [GridCellEditComponent],
})
export class GridCellEditModule {}
