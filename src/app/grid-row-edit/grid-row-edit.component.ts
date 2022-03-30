import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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

  // createFormGroup = (args: CreateFormGroupArgs): FormGroup => {
  //   const { ProductID, ProductName, UnitPrice, UnitsInStock, Discontinued } =
  //     args.dataItem;

  //   return this.formBuilder.group({
  //     ProductID,
  //     UnitPrice,
  //     Discontinued,
  //     ProductName,
  //     UnitsInStock,
  //   });
  // };

  trackBy(_index: number, item: GridItem): number {
    const product = item.data as Product;
    return product.ProductID;
  }
}
