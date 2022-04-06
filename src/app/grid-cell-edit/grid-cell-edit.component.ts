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
  CellCloseEvent,
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

type ColumnWidth = {
  idx: number;
  width: number | undefined;
};

@Component({
  selector: 'app-grid-cell-edit',
  templateUrl: './grid-cell-edit.component.html',
  styleUrls: ['./grid-cell-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridCellEditComponent implements AfterViewInit, OnDestroy {
  @ViewChild('grid') grid!: GridComponent;

  products = this.initialProducts;
  selectedRowsProductIds: number[] = [];

  private initialColumnWidths: ColumnWidth[] = [];
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
      .filter((c) => !this.isCheckboxColumnComponent(c))
      .map((c) => c.leafIndex);
  }

  private get initialProducts(): Product[] {
    return getProducts().slice(0, 30);
  }

  constructor(
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.initialColumnWidths = this.headerColumns.map((c) => ({
      idx: c.leafIndex,
      width: c.width,
    }));
  }

  ngOnDestroy(): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  trackBy(_index: number, item: GridItem): number {
    const product = item.data as Product;
    return product.ProductID;
  }

  renameSelected(): void {
    this.closeCell();

    this.products = this.products.map((p, idx) =>
      this.selectedRowsProductIds.includes(p.ProductID)
        ? {
            ...p,
            ProductName: p.ProductName + idx,
            QuantityPerUnit: p.QuantityPerUnit + idx,
          }
        : p
    );
  }

  deleteSelected(): void {
    this.closeCell();

    this.products = this.products.filter(
      (p) => !this.selectedRowsProductIds.includes(p.ProductID)
    );
  }

  reset(): void {
    this.closeCell();

    this.products = this.initialProducts;
    this.selectedRowsProductIds = [];
    this.activeProductFormGroup = undefined;
    this.activeRowIndex = undefined;

    this.resetColumnOrder();
    this.resetColumnWidths();
  }

  onSelectionChange(): void {
    if (this.activeProductFormGroup) {
      this.saveCell();
    }

    this.closeCell();
  }

  onCellClose(e: CellCloseEvent): void {
    if (e.originalEvent?.key === 'Enter') {
      return;
    }

    if (e.originalEvent?.key !== 'Escape') {
      this.saveCell();
    }

    this.closeCell();
  }

  onDoubleClick(e: Event): void {
    this.tryEditActiveCell(e);
  }

  onEnter(e: Event): void {
    this.tryEditActiveCell(e);
  }

  onTab(e: Event, goBackwards = false): void {
    const activeCell = this.grid.activeCell;
    const activeCellColumnIndex = activeCell?.colIndex;
    const isEditing = !!this.activeProductFormGroup;
    const header = this.getHeader(activeCellColumnIndex);
    const isCheckboxColumnComponent = this.isCheckboxColumnComponent(header);
    const currentCoordinates: CellCoordinates = {
      row: activeCell.dataRowIndex + 1 /* +1 aby se nepočítal header row */,
      col: activeCell.colIndex,
    };

    if (!activeCell || isCheckboxColumnComponent) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    let nextCellProduct: Product | undefined;

    if (isEditing) {
      const currentRowUpdatedProduct = this.saveCell();
      nextCellProduct = currentRowUpdatedProduct;
      this.closeCell();
    }

    this.tryFocusAndEditNextCell(
      currentCoordinates,
      isEditing,
      nextCellProduct,
      goBackwards
    );
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

  onKeyboardCopy(e: Event, metaKey = false): void {
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

  onKeyboardPaste(e: Event, metaKey = false): void {
    const isOSPaste = isOSMacOS() ? metaKey : !metaKey;
    const isClipboardReadSupported = !!navigator?.clipboard?.readText;

    if (!isClipboardReadSupported || !isOSPaste) {
      return;
    }

    this.paste$(e, from(navigator.clipboard.readText()))
      .pipe(take(1), takeUntil(this.unsubscriber$))
      .subscribe(() => this.cd.markForCheck());
  }

  private tryEditActiveCell(e?: Event): void {
    const activeCell = this.grid.activeCell;
    const product = activeCell?.dataItem as Product | undefined;
    const rowIndex = activeCell?.dataRowIndex;
    const columnIndex = activeCell?.colIndex;
    const shouldStartEditing = !this.activeProductFormGroup;
    const isEditable = this.isCellEditable(columnIndex);

    if (!activeCell || !product || !isEditable) {
      return;
    }

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (shouldStartEditing) {
      this.editCell(rowIndex, columnIndex, product);
      return;
    }

    this.saveCell();
    this.closeCell();
  }

  private resetColumnOrder() {
    /* řešení dle https://stackoverflow.com/a/27865205 */
    const columns = this.grid.columns as QueryList<ColumnComponent>;

    columns.forEach(({ field }) => {
      columns.forEach((c, idx) => {
        if (c.field === field) {
          this.grid.reorderColumn(c, idx);
        }
      });
    });
  }

  private resetColumnWidths(): void {
    const tableEls = (
      this.grid.wrapper.nativeElement as HTMLElement
    ).querySelectorAll('table');

    tableEls.forEach((table) => {
      table.style.width = '';
      table.style.minWidth = '';
    });

    this.headerColumns.forEach((col) => {
      const colWidth = this.initialColumnWidths.find(
        (c) => c.idx === col.leafIndex
      );
      col.width = colWidth?.width!;
    });
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
    e: Event,
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

  private paste$(e: Event, value: Observable<string>): Observable<void> {
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

  private tryFocusAndEditNextCell(
    currentCoordinates: CellCoordinates,
    shouldEdit: boolean,
    product?: Product,
    goBackwards = false
  ): void {
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
    if (!shouldEdit || !isNextCellEditable) {
      return;
    }

    if (nextCellRowIndex !== currentCoordinates.row) {
      product = nextCell.dataItem;
    }

    /* nextCellRowIndex - 1 - musí se počítat s header row */
    this.editCell(nextCellRowIndex - 1, nextCellColumnIndex, product!);
  }

  private getNextFocusableCellCoordinates(
    currentCoordinates: CellCoordinates,
    goBackwards = false
  ): CellCoordinates | undefined {
    return goBackwards
      ? this.getNextFocusableCellCoordinatesBackwards(currentCoordinates)
      : this.getNextFocusableCellCoordinatesForwards(currentCoordinates);
  }

  private getNextFocusableCellCoordinatesForwards(
    currentCoordinates: CellCoordinates
  ): CellCoordinates | undefined {
    const { row: currentRowIdx, col: currentCellIdx } = currentCoordinates;
    const shouldWrapRow = currentCellIdx === this.lastFocusableColumnIndex;

    const result = {
      row: !shouldWrapRow ? currentRowIdx : currentRowIdx + 1,
      col: !shouldWrapRow
        ? currentCellIdx + 1
        : this.firstFocusableColumnIndex!,
    };

    return this.doCoordinatesExist(result) ? result : undefined;
  }

  private getNextFocusableCellCoordinatesBackwards(
    currentCoordinates: CellCoordinates
  ): CellCoordinates | undefined {
    const { row: currentRowIdx, col: currentCellIdx } = currentCoordinates;
    const shouldWrapRow = currentCellIdx === this.firstFocusableColumnIndex;

    const result = {
      row: !shouldWrapRow ? currentRowIdx : currentRowIdx - 1,
      col: !shouldWrapRow ? currentCellIdx - 1 : this.lastFocusableColumnIndex!,
    };

    return this.doCoordinatesExist(result) ? result : undefined;
  }

  private doCoordinatesExist({ row, col }: CellCoordinates): boolean {
    const doesRowExist = row >= 0 && row <= this.totalRowCount;
    const doesColExist = col >= 0 && col <= this.columnCount;

    return doesRowExist && doesColExist;
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
