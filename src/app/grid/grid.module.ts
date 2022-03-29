import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GridModule as KendoGridModule } from '@progress/kendo-angular-grid';
import { GridComponent } from './grid.component';
import { InCellTabDirective } from './incell-tab.directive';

@NgModule({
  declarations: [GridComponent, InCellTabDirective],
  imports: [CommonModule, ReactiveFormsModule, KendoGridModule],
  exports: [GridComponent],
})
export class GridModule {}
