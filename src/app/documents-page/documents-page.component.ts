import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  QueryList,
  ViewChild,
} from '@angular/core';
import {
  CheckboxColumnComponent,
  ColumnComponent,
  GridComponent,
  GridItem,
} from '@progress/kendo-angular-grid';
import { Subject } from 'rxjs';
import { AppDocument, getDocuments } from './mocked-documents';

type HeaderColumn = ColumnComponent | CheckboxColumnComponent;

type ColumnWidth = {
  idx: number;
  width: number | undefined;
};

@Component({
  selector: 'app-documents-page',
  templateUrl: './documents-page.component.html',
  styleUrls: ['./documents-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('grid') grid!: GridComponent;

  documents = this.initialDocuments;

  private initialColumnWidths: ColumnWidth[] = [];
  private unsubscriber$ = new Subject<void>();

  private get headerColumns(): QueryList<HeaderColumn> {
    return this.grid.headerColumns;
  }

  private get initialDocuments(): AppDocument[] {
    return getDocuments();
  }

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
    const document = item.data as AppDocument;
    return document.id;
  }

  reset(): void {
    this.documents = this.initialDocuments;

    this.resetColumnOrder();
    this.resetColumnWidths();
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
}
