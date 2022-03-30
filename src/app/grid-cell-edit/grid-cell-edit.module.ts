import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { GridCellEditComponent } from './grid-cell-edit.component';
import { InCellTabDirective } from './incell-tab.directive';

@NgModule({
  declarations: [GridCellEditComponent, InCellTabDirective],
  imports: [CommonModule, ReactiveFormsModule, GridModule],
  exports: [GridCellEditComponent],
})
export class GridCellEditModule {}
