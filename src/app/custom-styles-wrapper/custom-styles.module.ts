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
import { TooltipsModule } from '@progress/kendo-angular-tooltip';
import { TreeViewModule } from '@progress/kendo-angular-treeview';
import { ForceAutofocusModule } from '../force-autofocus/force-autofocus.module';
import { CustomStylesWrapperComponent } from './custom-styles-wrapper.component';
import { CustomStylesComponent } from './custom-styles/custom-styles.component';

@NgModule({
  declarations: [CustomStylesWrapperComponent, CustomStylesComponent],
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
    TreeViewModule,
    TooltipsModule,
  ],
  exports: [CustomStylesWrapperComponent],
})
export class CustomStylesModule {}
