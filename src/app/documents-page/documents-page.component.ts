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
import {
  CompositeFilterDescriptor,
  GroupDescriptor,
} from '@progress/kendo-data-query';
import { Subject } from 'rxjs';
import { deepCopy } from '../helpers';
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
  preview: AppDocumentFile | undefined;
  selectedRowsDocumentIds: number[] = [];
  groups: GroupDescriptor[] = [];
  filter: CompositeFilterDescriptor = this.initialFilter;
  czech: boolean = false;

  private initialColumnWidths: ColumnWidth[] = [];
  private unsubscriber$ = new Subject<void>();

  private get headerColumns(): QueryList<HeaderColumn> {
    return this.grid.headerColumns;
  }

  private get initialDocuments(): AppDocument[] {
    return getDocuments();
  }

  private get initialFilter(): CompositeFilterDescriptor {
    return {
      logic: 'and',
      filters: [],
    };
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
    this.selectedRowsDocumentIds = [];
    this.groups = [];
    this.filter = this.initialFilter;
    this.preview = undefined;

    this.resetColumnOrder();
    this.resetColumnWidths();
  }

  openPreview(file: AppDocumentFile): void {
    this.preview = deepCopy(file);
  }

  closePreview(): void {
    this.preview = undefined;
  }

  deleteSelected(): void {
    this.documents = this.documents.filter(
      (d) => !this.selectedRowsDocumentIds.includes(d.id)
    );
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
      document.title = attachment.title;
      document.url = attachment.url;
      attachments.splice(previousIndex, 1);

      return;
    }

    const document = previousContainer.data as AppDocument;
    const attachments = container.data as AppDocumentFile[];

    attachments.splice(currentIndex, 0, {
      id: document.id,
      title: document.title,
      url: document.url,
    });

    document.id = null!;
    document.title = null!;
    document.url = null!;
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
