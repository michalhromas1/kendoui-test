import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { GridRowEditComponent } from './grid-row-edit.component';

@NgModule({
  declarations: [GridRowEditComponent],
  imports: [CommonModule, ReactiveFormsModule, GridModule],
  exports: [GridRowEditComponent],
})
export class GridRowEditModule {}
