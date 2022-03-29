import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  CreateFormGroupArgs,
  GridComponent,
} from '@progress/kendo-angular-grid';

@Directive({
  selector: '[inCellTab]',
})
export class InCellTabDirective implements OnInit, OnDestroy {
  @Input('inCellTab') createFormGroup!: (
    args: CreateFormGroupArgs
  ) => FormGroup;
  @Input() wrap = true;

  private unsubKeydown!: () => void;
  private unsubKeyup!: () => void;

  constructor(
    private el: ElementRef,
    private grid: GridComponent,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.unsubKeydown = this.renderer.listen(
      this.el.nativeElement,
      'keydown',
      (e) => this.onKeydown(e)
    );

    this.unsubKeyup = this.renderer.listen(
      this.el.nativeElement,
      'keyup',
      (e) => this.onKeyup(e)
    );
  }

  ngOnDestroy(): void {
    this.unsubKeydown();
    this.unsubKeyup();
  }

  private onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      this.handleTab(e);
      return;
    }

    // if (e.key === 'Enter') {
    //   this.handleEnter(e);
    //   return;
    // }
  }

  private onKeyup(e: KeyboardEvent): void {
    if (e.key === 'Enter') {
      this.handleEnter(e);
      return;
    }
  }

  private handleTab(e: KeyboardEvent): void {
    const isOnEditableRow = this.grid.activeRow?.dataItem;
    if (!isOnEditableRow) {
      return;
    }

    const isContentValid = !this.grid.isEditingCell() || this.grid.closeCell();
    if (!isContentValid) {
      e.preventDefault();
      return;
    }

    const cellToFocus = e.shiftKey
      ? this.grid.focusPrevCell(this.wrap)
      : this.grid.focusNextCell(this.wrap);

    if (!cellToFocus) {
      return;
    }

    e.preventDefault();

    const dataItem = cellToFocus.dataItem;
    if (!dataItem) {
      return;
    }

    const formGroup = this.createFormGroup({
      dataItem,
    } as CreateFormGroupArgs);

    this.grid.editCell(
      cellToFocus.dataRowIndex,
      cellToFocus.colIndex,
      formGroup
    );
  }

  private handleEnter(e: KeyboardEvent): void {
    const isOnEditableRow = this.grid.activeRow?.dataItem;
    if (!isOnEditableRow) {
      return;
    } else if (this.grid.activeCell.focusGroup?.isActive) {
      const cellToFocus = this.grid.activeCell;

      if (!cellToFocus) {
        return;
      }

      const dataItem = cellToFocus.dataItem;
      if (!dataItem) {
        return;
      }

      const formGroup = this.createFormGroup({
        dataItem,
      } as CreateFormGroupArgs);

      this.grid.editCell(
        cellToFocus.dataRowIndex,
        cellToFocus.colIndex,
        formGroup
      );

      return;
    }

    console.log('e');

    e.preventDefault();

    const cellToFocus = this.grid.focusNextCell(this.wrap);

    if (!cellToFocus) {
      return;
    }

    const dataItem = cellToFocus.dataItem;
    if (!dataItem) {
      return;
    }

    const formGroup = this.createFormGroup({
      dataItem,
    } as CreateFormGroupArgs);

    this.grid.editCell(
      cellToFocus.dataRowIndex,
      cellToFocus.colIndex,
      formGroup
    );

    console.log(formGroup);
  }
}
