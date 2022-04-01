import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  QueryList,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  CheckboxColumnComponent,
  ColumnComponent,
  GridComponent,
  GridItem,
  NavigationCell,
} from '@progress/kendo-angular-grid';
import { from, Observable, of, Subject } from 'rxjs';
import { mapTo, take, takeUntil, tap } from 'rxjs/operators';
import { getProducts, Product } from '../mocks';
import { isOSMacOS } from '../operating-system';

@Component({
  selector: 'app-grid-cell-edit',
  templateUrl: './grid-cell-edit.component.html',
  styleUrls: ['./grid-cell-edit.component.scss'],
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

      if (e.originalEvent?.key !== 'Escape') {
        this.saveCell();
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
    const isEditable = this.isCellEditable(columnIndex);

    if (!activeCell || !product || !isEditable) {
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
    const activeCellColumnIndex = this.grid.activeCell?.colIndex;
    const isEditing = !!this.activeProductFormGroup;
    const header = this.getHeader(activeCellColumnIndex);
    const isCheckboxColumnComponent = this.isCheckboxColumnComponent(header);

    if (!activeCell || isCheckboxColumnComponent) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    let nextCellProduct!: Product;

    if (isEditing) {
      const currentRowUpdatedProduct = this.saveCell();
      nextCellProduct = currentRowUpdatedProduct;
      this.closeCell();
    }

    let nextCell: NavigationCell | undefined | null;
    let nextCellColumnIndex!: number;

    while (nextCell === undefined && nextCell !== null) {
      nextCell = goBackwards
        ? this.grid.focusPrevCell()
        : this.grid.focusNextCell();

      if (!nextCell) {
        nextCell = null;
        break;
      }

      nextCellColumnIndex = nextCell.colIndex;
      const nextCellHeader = this.getHeader(nextCellColumnIndex);
      const isCheckboxSelect = this.isCheckboxColumnComponent(nextCellHeader);

      nextCell = isCheckboxSelect ? undefined : nextCell;

      console.log(nextCell);
    }

    if (!nextCell) {
      return;
    }

    const nextCellRowIndex = nextCell.dataRowIndex;
    const isNextCellEditable =
      !!nextCell.dataItem && this.isCellEditable(nextCellColumnIndex);

    if (!isEditing || !isNextCellEditable) {
      return;
    }

    if (nextCellRowIndex !== activeCellRowIndex) {
      nextCellProduct = nextCell.dataItem;
    }

    this.editCell(nextCellRowIndex, nextCellColumnIndex, nextCellProduct);
  }

  onNativeCopy(e: ClipboardEvent): void {
    const isCustomKeyboardCopySupported = !!navigator?.clipboard?.writeText;

    if (isCustomKeyboardCopySupported) {
      return;
    }

    this.copy$(e, (value) => of(e.clipboardData?.setData('text', value)))
      .pipe(take(1), takeUntil(this.unsubscriber$))
      .subscribe(() => this.cd.markForCheck());
  }

  onKeyboardCopy(e: KeyboardEvent, metaKey = false): void {
    const isOSCopy = isOSMacOS() ? metaKey : !metaKey;
    const isClipboardWriteSupported = !!navigator?.clipboard?.writeText;

    if (!isClipboardWriteSupported || !isOSCopy) {
      return;
    }

    this.copy$(e, (value) => from(navigator.clipboard.writeText(value)))
      .pipe(take(1), takeUntil(this.unsubscriber$))
      .subscribe(() => this.cd.markForCheck());
  }

  onNativePaste(e: ClipboardEvent): void {
    const isCustomKeyboardPasteSupported = !!navigator?.clipboard?.readText;

    if (isCustomKeyboardPasteSupported) {
      return;
    }

    this.paste$(e, of(e.clipboardData?.getData('text') || ''))
      .pipe(take(1), takeUntil(this.unsubscriber$))
      .subscribe(() => this.cd.markForCheck());
  }

  onKeyboardPaste(e: KeyboardEvent, metaKey = false): void {
    const isOSPaste = isOSMacOS() ? metaKey : !metaKey;
    const isClipboardReadSupported = !!navigator?.clipboard?.readText;

    if (!isClipboardReadSupported || !isOSPaste) {
      return;
    }

    this.paste$(e, from(navigator.clipboard.readText()))
      .pipe(take(1), takeUntil(this.unsubscriber$))
      .subscribe(() => this.cd.markForCheck());
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

  private copy$(
    e: ClipboardEvent | KeyboardEvent,
    writeFunc$: (value: string) => Observable<void>
  ): Observable<void> {
    const activeCell = this.grid.activeCell;
    const columnIndex = this.grid.activeCell?.colIndex;
    const product = this.grid.activeCell?.dataItem as Product;
    const hasData = !!product;
    const isEditing = !!this.activeProductFormGroup;

    if (!activeCell || !hasData || isEditing) {
      return of(undefined);
    }

    e.preventDefault();
    e.stopPropagation();

    const header = this.getHeader(columnIndex);
    const selectedProperty = header.field as keyof Product;

    if (selectedProperty === undefined || selectedProperty === null) {
      return of(undefined);
    }

    const value = product[selectedProperty].toString();
    return writeFunc$(value);
  }

  private paste$(
    e: ClipboardEvent | KeyboardEvent,
    value: Observable<string>
  ): Observable<void> {
    const activeCell = this.grid.activeCell;
    const columnIndex = this.grid.activeCell?.colIndex;
    const product = this.grid.activeCell?.dataItem as Product;
    const isEditable = !!product && this.isCellEditable(columnIndex);
    const isEditing = !!this.activeProductFormGroup;

    if (!activeCell || !isEditable || isEditing) {
      return of(undefined);
    }

    e.preventDefault();
    e.stopPropagation();

    const header = this.getHeader(columnIndex);
    const selectedProperty = header.field as keyof Product;

    if (selectedProperty === undefined || selectedProperty === null) {
      return of(undefined);
    }

    return value.pipe(
      tap((value) => {
        if (!value) {
          return;
        }

        this.products = this.products.map((p) => {
          if (p.ProductID !== product.ProductID) {
            return p;
          }

          return { ...p, [selectedProperty]: value };
        });
      }),
      mapTo(undefined)
    );
  }

  private isCellEditable(columnIndex: number): boolean {
    const allRowColumns = this.grid.columnList.toArray() as ColumnComponent[];
    const rowColumn = allRowColumns.find((c) => c.leafIndex === columnIndex);
    return !!rowColumn?.editable;
  }

  private getHeader(columnIndex: number): ColumnComponent {
    const allHeaders = this.grid.headerColumns as QueryList<ColumnComponent>;
    return allHeaders.get(columnIndex)!;
  }

  private isCheckboxColumnComponent(
    component: object
  ): component is CheckboxColumnComponent {
    return 'isCheckboxColumn' in component;
  }

  private createProductFormGroup = (product: Product): FormGroup => {
    const {
      ProductID,
      ProductName,
      QuantityPerUnit,
      UnitPrice,
      UnitsInStock,
      UnitsOnOrder,
    } = product;

    return this.formBuilder.group({
      ProductID,
      ProductName,
      QuantityPerUnit,
      UnitPrice,
      UnitsInStock,
      UnitsOnOrder,
    });
  };
}
