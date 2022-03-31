import {
  ChangeDetectorRef,
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

  private unsubKeydown!: () => void;

  constructor(
    private el: ElementRef,
    private grid: GridComponent,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.grid.cellClose.pipe().subscribe((e) => {
    //   if ((e.originalEvent as KeyboardEvent)?.key !== 'Enter') {
    //     return;
    //   }

    //   this.grid.focusNextCell(this.wrap);
    //   this.cd.markForCheck();
    // });

    this.unsubKeydown = this.renderer.listen(
      this.el.nativeElement,
      'keydown',
      (e) => this.onKeydown(e)
    );
  }

  ngOnDestroy(): void {
    this.unsubKeydown();
  }

  private onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      this.handleTab(e);
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
      ? this.grid.focusPrevCell(true)
      : this.grid.focusNextCell(true);

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

    this.cd.markForCheck();
  }
}
