import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridItem } from '@progress/kendo-angular-grid';
import { getProducts, Product } from '../mocks';

@Component({
  selector: 'app-grid-row-edit',
  templateUrl: './grid-row-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridRowEditComponent {
  products = getProducts().slice(0, 10);
  formGroup: FormGroup | undefined;

  private editedRowIndex: number | undefined;

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

  editHandler({ sender, rowIndex, dataItem }: any) {
    this.closeEditor(sender);

    this.formGroup = this.formBuilder.group({
      ProductID: dataItem.ProductID,
      ProductName: [dataItem.ProductName, [Validators.required]],
      UnitPrice: dataItem.UnitPrice,
      UnitsInStock: [
        dataItem.UnitsInStock,
        [Validators.required, Validators.pattern('^[0-9]{1,3}')],
      ],
      Discontinued: dataItem.Discontinued,
    });

    this.editedRowIndex = rowIndex;

    sender.editRow(rowIndex, this.formGroup);
  }

  cancelHandler({ sender, rowIndex }: any) {
    this.closeEditor(sender, rowIndex);
  }

  saveHandler({ sender, rowIndex, formGroup }: any) {
    const product: Product = formGroup.value;
    this.products = this.products.map((p) =>
      p.ProductID === product.ProductID ? { ...p, ...product } : p
    );
    sender.closeRow(rowIndex);
  }

  private closeEditor(grid: any, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }
}
