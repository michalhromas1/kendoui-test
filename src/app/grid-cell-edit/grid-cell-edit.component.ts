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
} from '@progress/kendo-angular-grid';
import { from, Observable, of, Subject } from 'rxjs';
import { mapTo, take, takeUntil, tap } from 'rxjs/operators';
import { getProducts, Product } from '../mocks';
import { isOSMacOS } from '../operating-system';

type CellCoordinates = {
  row: number;
  col: number;
};

type HeaderColumn = ColumnComponent | CheckboxColumnComponent;

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

  private get headerColumns(): QueryList<HeaderColumn> {
    return this.grid.headerColumns;
  }

  private get totalRowCount(): number {
    return this.grid.totalCount;
  }

  private get columnCount(): number {
    return this.grid.columns.length;
  }

  private get checkboxColumnIndex(): number | undefined {
    return this.headerColumns.find((c) => this.isCheckboxColumnComponent(c))
      ?.leafIndex;
  }

  private get hasCheckboxColumn(): boolean {
    return this.checkboxColumnIndex !== undefined;
  }

  private get firstFocusableColumnIndex(): number | undefined {
    return this.focusableColumnsIndexes[0];
  }

  private get lastFocusableColumnIndex(): number | undefined {
    const focusableColumnsIndexes = this.focusableColumnsIndexes;
    const focusableColumnsIndexesCount = this.focusableColumnsIndexes.length;
    return focusableColumnsIndexes[focusableColumnsIndexesCount - 1];
  }

  private get focusableColumnsIndexes(): number[] {
    return this.headerColumns
      .filter((c) => this.isCheckboxColumnComponent(c))
      .map((c) => c.leafIndex);
  }

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

  private getNextFocusableCellCoordinates(
    currentCoordinates: CellCoordinates,
    goBackwards = false
  ): CellCoordinates | undefined {
    const { row: currentRowIdx, col: currentCellIdx } = currentCoordinates;

    const shouldWrapRow = goBackwards
      ? currentCellIdx === 1
      : this.columnCount - 1 === currentCellIdx;

    let result: CellCoordinates = {
      row: currentRowIdx,
      col: goBackwards ? currentCellIdx - 1 : currentCellIdx + 1,
    };

    if (shouldWrapRow) {
      result = {
        row: goBackwards ? currentRowIdx - 1 : currentRowIdx + 1,
        col: goBackwards
          ? this.lastFocusableColumnIndex!
          : this.firstFocusableColumnIndex!,
      };
    }

    const wouldGoToCheckbox = result.col === this.checkboxColumnIndex;
    if (wouldGoToCheckbox) {
      result.col = goBackwards ? result.col - 1 : result.col + 1;
    }

    const isOutOfBounds = result.row > this.totalRowCount || result.row < 0;

    if (isOutOfBounds) {
      return;
    }

    return result;
  }

  onTab(e: KeyboardEvent, goBackwards = false): void {
    const activeCell = this.grid.activeCell;
    const activeCellRowIndex = activeCell?.dataRowIndex;
    const activeCellColumnIndex = activeCell?.colIndex;
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

    const currentCoordinates: CellCoordinates = {
      row: activeCellRowIndex + 1, // +1 aby se nepočítal header row
      col: activeCellColumnIndex,
    };
    const nextCellCoordinates = this.getNextFocusableCellCoordinates(
      currentCoordinates,
      goBackwards
    );

    if (!nextCellCoordinates) {
      (document.activeElement as HTMLElement).blur();
      return;
    }

    const { row: nextCellRowIndex, col: nextCellColumnIndex } =
      nextCellCoordinates;

    const nextCell = this.grid.focusCell(nextCellRowIndex, nextCellColumnIndex);

    if (!nextCell) {
      return;
    }

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
    if (!header || this.isCheckboxColumnComponent(header)) {
      return of(undefined);
    }

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
    if (!header || this.isCheckboxColumnComponent(header)) {
      return of(undefined);
    }

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

  private getHeader(columnIndex: number): HeaderColumn | undefined {
    const allHeaders = this.headerColumns;
    return allHeaders.get(columnIndex);
  }

  private isCheckboxColumnComponent(
    component: unknown
  ): component is CheckboxColumnComponent {
    if (typeof component !== 'object' || component === null) {
      return false;
    }

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
