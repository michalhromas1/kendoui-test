import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GridComponent, GridItem } from '@progress/kendo-angular-grid';
import { getProducts, Product } from '../mocks';

@Component({
  selector: 'app-grid-row-edit',
  templateUrl: './grid-row-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridRowEditComponent {
  products = getProducts().slice(0, 10);

  private currentlyEditingFormGroup: FormGroup | undefined;

  constructor(private formBuilder: FormBuilder) {}

  trackBy(_index: number, { data }: GridItem): number {
    const product = data as Product;
    return product.ProductID;
  }

  onEnter(e: Event, grid: GridComponent): void {
    const activeRow = grid.activeRow;
    const activeCell = grid.activeCell;
    const product = activeRow?.dataItem as Product | undefined;
    const rowIndex = activeRow?.dataRowIndex;
    const colIndex = activeCell.colIndex;
    const shouldStartEditing = !grid.isEditing();

    if (!activeRow || !activeCell || !product) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (shouldStartEditing) {
      this.startRowEdit(grid, rowIndex, product, colIndex);
      return;
    }

    this.saveRowEdit(grid, rowIndex, this.currentlyEditingFormGroup!.value);
    this.editNextRow(grid, rowIndex);
  }

  onEscape(e: Event, grid: GridComponent): void {
    const isEditingRow = grid.isEditing();
    const rowIndex = grid.activeRow?.dataRowIndex;

    if (!isEditingRow) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    this.cancelRowEdit(grid, rowIndex);
  }

  private startRowEdit(
    grid: GridComponent,
    rowIndex: number,
    product: Product,
    columnIndex?: number
  ): void {
    const productFormGroup = this.createProductFormGroup(product);
    this.currentlyEditingFormGroup = productFormGroup;

    if (columnIndex !== undefined) {
      grid.editRow(rowIndex, productFormGroup, { columnIndex });
      return;
    }

    grid.editRow(rowIndex, productFormGroup);
  }

  private saveRowEdit(
    grid: GridComponent,
    rowIndex: number,
    updatedProduct: Product
  ): void {
    this.products = this.products.map((p) =>
      p.ProductID === updatedProduct.ProductID ? { ...p, ...updatedProduct } : p
    );

    grid.closeRow(rowIndex);
    this.currentlyEditingFormGroup = undefined;
  }

  private cancelRowEdit(grid: GridComponent, rowIndex: number): void {
    grid.closeRow(rowIndex);
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

  private editNextRow(grid: GridComponent, currentRowIndex: number): void {
    let nextRowIndex = currentRowIndex;

    while (nextRowIndex === currentRowIndex) {
      const cell = grid.focusNextCell();
      nextRowIndex = cell?.dataRowIndex;
    }

    const nextRow = grid.activeRow;
    const nextRowProduct = nextRow?.dataItem as Product | undefined;

    if (!nextRow || !nextRowProduct) {
      return;
    }

    this.startRowEdit(grid, nextRowIndex, nextRowProduct);
  }
}
