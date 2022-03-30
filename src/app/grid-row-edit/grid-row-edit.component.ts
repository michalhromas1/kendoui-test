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

  cancelHandler({ sender, rowIndex }: any) {
    sender.closeRow(rowIndex);
  }

  onEnter(e: Event, grid: GridComponent): void {
    e.preventDefault();
    e.stopPropagation();

    const activeRow = grid.activeRow;
    const product = activeRow?.dataItem as Product | undefined;
    const rowIndex = activeRow?.dataRowIndex;
    const shouldStartEditing = !grid.isEditing();

    if (!activeRow || !product) {
      return;
    }

    if (shouldStartEditing) {
      const rowFormGroup = this.startRowEdit(grid, rowIndex, product);
      this.currentlyEditingFormGroup = rowFormGroup;
      return;
    }

    this.saveRowEdit(grid, rowIndex, this.currentlyEditingFormGroup!.value);
    this.currentlyEditingFormGroup = undefined;
  }

  private startRowEdit(
    grid: GridComponent,
    rowIndex: number,
    product: Product
  ): FormGroup {
    const productFormGroup = this.createProductFormGroup(product);

    grid.editRow(rowIndex, productFormGroup);
    return productFormGroup;
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
}
