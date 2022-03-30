import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GridItem } from '@progress/kendo-angular-grid';
import { getProducts, Product } from '../mocks';

@Component({
  selector: 'app-grid-row-edit',
  templateUrl: './grid-row-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridRowEditComponent {
  products = getProducts().slice(0, 10);

  constructor(private formBuilder: FormBuilder) {}

  trackBy(_index: number, item: GridItem): number {
    const product = item.data as Product;
    return product.ProductID;
  }

  editHandler({ sender, rowIndex, dataItem }: any) {
    sender.closeRow(rowIndex);

    const formGroup = this.createProductFormGroup(dataItem);

    sender.editRow(rowIndex, formGroup);
  }

  cancelHandler({ sender, rowIndex }: any) {
    sender.closeRow(rowIndex);
  }

  saveHandler({ sender, rowIndex, formGroup }: any) {
    const product: Product = formGroup.value;
    this.products = this.products.map((p) =>
      p.ProductID === product.ProductID ? { ...p, ...product } : p
    );
    sender.closeRow(rowIndex);
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
