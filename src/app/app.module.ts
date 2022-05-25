import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { AppComponent } from './app.component';
import { CustomStylesModule } from './custom-styles/custom-styles.module';
import { DocumentsPageModule } from './documents-page/documents-page.module';
import { GridCellEditModule } from './grid-cell-edit/grid-cell-edit.module';
import { GridRowEditModule } from './grid-row-edit/grid-row-edit.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    DocumentsPageModule,
    GridCellEditModule,
    GridRowEditModule,
    DropDownsModule,
    CustomStylesModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
