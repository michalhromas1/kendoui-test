import {
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
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
import { AppDocument, AppDocumentFile, getDocuments } from './mocked-documents';

const dropListTypes = ['file', 'attachments', 'unknown'] as const;
type DropListType = typeof dropListTypes[number];

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
  @ViewChild('nameField') nameField!: CdkDropList;
  @ViewChild('attachmentsField') attachmentsField!: CdkDropList;

  documents = this.initialDocuments;
  preview: string | undefined;

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
    this.preview = undefined;

    this.resetColumnOrder();
    this.resetColumnWidths();
  }

  openPreview(file: string): void {
    this.preview = file;
  }

  private resetColumnOrder(): void {
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

  public drop(event: CdkDragDrop<any>): void {
    const { previousContainer, container, previousIndex, currentIndex } = event;
    const prevContType = this.getDropListType(previousContainer);
    const contType = this.getDropListType(container);
    const types = [prevContType, contType];

    if (types.includes('unknown') || types.every((t) => t === 'file')) {
      return;
    }

    if (previousContainer === container) {
      moveItemInArray(container.data, previousIndex, currentIndex);
      return;
    }

    if (types.every((t) => t === 'attachments')) {
      transferArrayItem(
        previousContainer.data,
        container.data,
        previousIndex,
        currentIndex
      );

      return;
    }

    if (contType === 'file') {
      const document = container.data as AppDocument;
      const attachments = previousContainer.data as AppDocumentFile[];
      const attachment = attachments[previousIndex];

      document.id = attachment.id;
      document.file = attachment.file;
      attachments.splice(previousIndex, 1);

      return;
    }

    const document = previousContainer.data as AppDocument;
    const attachments = container.data as AppDocumentFile[];

    attachments.splice(currentIndex, 0, {
      id: document.id,
      file: document.file,
    });

    document.id = null!;
    document.file = null!;
  }

  private getDropListType(container: CdkDropList<any>): DropListType {
    const el = container.element.nativeElement as HTMLElement;
    const type = el.dataset['droplist'];
    return this.isDropListType(type) ? type : 'unknown';
  }

  private isDropListType(type: any): type is DropListType {
    return dropListTypes.includes(type);
  }
}
