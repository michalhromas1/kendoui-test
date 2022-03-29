import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CreateFormGroupArgs } from '@progress/kendo-angular-grid';
import { getProducts } from '../mocks';

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
}
