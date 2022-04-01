import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { GridCellEditComponent } from './grid-cell-edit.component';

@NgModule({
  declarations: [GridCellEditComponent],
  imports: [CommonModule, ReactiveFormsModule, GridModule],
  exports: [GridCellEditComponent],
})
export class GridCellEditModule {}
