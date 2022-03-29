import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CreateFormGroupArgs, GridItem } from '@progress/kendo-angular-grid';
import { getProducts, Product } from '../mocks';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  products = getProducts().slice(0, 10);

  constructor(private formBuilder: FormBuilder) {}

  createFormGroup = (args: CreateFormGroupArgs): FormGroup => {
    const { ProductID, ProductName, UnitPrice, UnitsInStock, Discontinued } =
      args.dataItem;

    return this.formBuilder.group({
      ProductID,
      UnitPrice,
      Discontinued,
      ProductName,
      UnitsInStock,
    });
  };

  trackBy(_index: number, item: GridItem): number {
    const product = item.data as Product;
    return product.ProductID;
  }
}
