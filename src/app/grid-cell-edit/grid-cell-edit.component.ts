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
  selector: 'app-grid-cell-edit',
  templateUrl: './grid-cell-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridCellEditComponent implements AfterViewInit, OnDestroy {
  @ViewChild('grid') grid!: GridComponent;

  products = getProducts().slice(0, 10);

  private activeProductFormGroup: FormGroup | undefined;
  private activeRowIndex: number | undefined;
  private unsubscriber$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.grid.cellClose.pipe(takeUntil(this.unsubscriber$)).subscribe((e) => {
      if (e.originalEvent?.key === 'Enter') {
        return;
      }

      this.closeCell();
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  trackBy(_index: number, item: GridItem): number {
    const product = item.data as Product;
    return product.ProductID;
  }

  onEnter(e: KeyboardEvent): void {
    const activeCell = this.grid.activeCell;
    const product = activeCell?.dataItem as Product | undefined;
    const rowIndex = activeCell?.dataRowIndex;
    const columnIndex = activeCell?.colIndex;
    const shouldStartEditing = !this.activeProductFormGroup;

    if (!activeCell || !product) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (shouldStartEditing) {
      this.editCell(rowIndex, columnIndex, product);
      return;
    }

    this.saveCell();
    this.closeCell();
  }

  onTab(e: KeyboardEvent, goBackwards = false): void {
    const activeCell = this.grid.activeCell;
    const activeCellRowIndex = this.grid.activeCell?.dataRowIndex;
    const isEditing = !!this.activeProductFormGroup;

    if (!activeCell) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    let nextCellProduct!: Product;

    if (isEditing) {
      nextCellProduct = this.saveCell();
      this.closeCell();
    }

    const nextCell = goBackwards
      ? this.grid.focusPrevCell()
      : this.grid.focusNextCell();

    const hasNextCellData = !!nextCell?.dataItem;
    const nextCellRowIndex = nextCell?.dataRowIndex;
    const nextCellColumnIndex = nextCell?.colIndex;

    if (!isEditing || !hasNextCellData) {
      return;
    }

    if (nextCellRowIndex !== activeCellRowIndex) {
      nextCellProduct = nextCell.dataItem;
    }

    this.editCell(nextCellRowIndex, nextCellColumnIndex, nextCellProduct);
  }

  private editCell(
    rowIndex: number,
    columnIndex: number,
    product: Product
  ): void {
    const productFormGroup = this.createProductFormGroup(product);

    this.grid.editCell(rowIndex, columnIndex, productFormGroup);

    this.activeRowIndex = rowIndex;
    this.activeProductFormGroup = productFormGroup;
  }

  private saveCell(): Product {
    const updates: Partial<Product> = this.activeProductFormGroup!.value;
    let updatedProduct!: Product;

    this.products = this.products.map((product) => {
      if (product.ProductID !== updates.ProductID) {
        return product;
      }

      updatedProduct = { ...product, ...updates };
      return updatedProduct;
    });

    return updatedProduct;
  }

  private closeCell(): void {
    this.grid.closeRow(this.activeRowIndex);

    this.activeRowIndex = undefined;
    this.activeProductFormGroup = undefined;
  }

  private createProductFormGroup = (product: Product): FormGroup => {
    const { ProductID, ProductName, UnitPrice, UnitsInStock, Discontinued } =
      product;

    return this.formBuilder.group({
      ProductID,
      UnitPrice,
      Discontinued,
      ProductName,
      UnitsInStock,
    });
  };
}
