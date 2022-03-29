import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { AppComponent } from './app.component';
import { GridModule } from './grid/grid.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    GridModule,
    DropDownsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
