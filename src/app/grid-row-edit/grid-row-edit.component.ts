import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GridComponent, GridItem } from '@progress/kendo-angular-grid';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getProducts, Product } from '../mocks';

@Component({
  selector: 'app-grid-row-edit',
  templateUrl: './grid-row-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridRowEditComponent implements AfterViewInit, OnDestroy {
  @ViewChild('grid') grid!: GridComponent;

  products = getProducts().slice(0, 10);

  private currentlyEditingFormGroup: FormGroup | undefined;
  private currentlyEditingRowIndex: number | undefined;
  private unsubscriber$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.closeEditOnClickElsewhere();
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  trackBy(_index: number, { data }: GridItem): number {
    const product = data as Product;
    return product.ProductID;
  }

  onEnter(e: Event): void {
    const activeRow = this.grid.activeRow;
    const activeCell = this.grid.activeCell;
    const product = activeRow?.dataItem as Product | undefined;
    const rowIndex = activeRow?.dataRowIndex;
    const colIndex = activeCell?.colIndex;
    const shouldStartEditing = !this.grid.isEditing();

    if (!activeRow || !activeCell || !product) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (shouldStartEditing) {
      this.startRowEdit(rowIndex, product, colIndex);
      return;
    }

    this.saveRowEdit(rowIndex, this.currentlyEditingFormGroup!.value);
    this.editNextRow(rowIndex);
  }

  onEscape(e: Event): void {
    const isEditingRow = this.grid.isEditing();
    const rowIndex = this.grid.activeRow?.dataRowIndex;

    if (!isEditingRow) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.cancelRowEdit(rowIndex);
  }

  private startRowEdit(
    rowIndex: number,
    product: Product,
    columnIndex?: number
  ): void {
    const productFormGroup = this.createProductFormGroup(product);
    this.currentlyEditingFormGroup = productFormGroup;
    this.currentlyEditingRowIndex = rowIndex;

    if (columnIndex !== undefined) {
      this.grid.editRow(rowIndex, productFormGroup, { columnIndex });
      return;
    }

    this.grid.editRow(rowIndex, productFormGroup);
  }

  private saveRowEdit(rowIndex: number, updatedProduct: Product): void {
    this.products = this.products.map((p) =>
      p.ProductID === updatedProduct.ProductID ? { ...p, ...updatedProduct } : p
    );

    this.stopRowEdit(rowIndex);
  }

  private cancelRowEdit(rowIndex: number): void {
    this.stopRowEdit(rowIndex);
  }

  private stopRowEdit(rowIndex: number): void {
    this.grid.closeRow(rowIndex);
    this.currentlyEditingFormGroup = undefined;
    this.currentlyEditingRowIndex = undefined;
  }

  private createProductFormGroup = (product: Product): FormGroup => {
    const { ProductID, ProductName, UnitPrice, UnitsInStock, Discontinued } =
      product;

    return this.formBuilder.group({
      ProductID,
      ProductName,
      UnitPrice,
      Discontinued,
      UnitsInStock,
    });
  };

  private editNextRow(currentRowIndex: number): void {
    let nextRowIndex = currentRowIndex;

    while (nextRowIndex === currentRowIndex) {
      const cell = this.grid.focusNextCell();
      nextRowIndex = cell?.dataRowIndex;
    }

    const nextRow = this.grid.activeRow;
    const nextRowProduct = nextRow?.dataItem as Product | undefined;

    if (!nextRow || !nextRowProduct) {
      return;
    }

    this.startRowEdit(nextRowIndex, nextRowProduct);
  }

  private closeEditOnClickElsewhere(): void {
    this.grid.cellClick.pipe(takeUntil(this.unsubscriber$)).subscribe((e) => {
      const isClickEvent = (e.originalEvent as Event)?.type === 'click';
      const shouldCloseEditingRow = isClickEvent && this.grid.isEditing();

      if (!shouldCloseEditingRow) {
        return;
      }

      this.cancelRowEdit(this.currentlyEditingRowIndex!);
      this.cd.markForCheck();
    });
  }
}
