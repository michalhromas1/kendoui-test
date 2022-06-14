import {
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
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
import {
  AppDocument,
  AppDocumentFile,
  getDocuments,
  getWorkspaceProfileRelationships,
  Profile,
  WorkspaceProfileRelationship,
} from './mocked-documents';

const dropListTypes = ['file', 'attachments', 'unknown'] as const;
type DropListType = typeof dropListTypes[number];

type HeaderColumn = ColumnComponent | CheckboxColumnComponent;

type ColumnWidth = {
  idx: number;
  width: number | undefined;
};

@Component({
  selector: 'app-custom-styles',
  templateUrl: './custom-styles.component.html',
  styleUrls: ['./custom-styles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomStylesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('grid') grid!: GridComponent;
  @ViewChild('nameField') nameField!: CdkDropList;
  @ViewChild('attachmentsField') attachmentsField!: CdkDropList;

  documents = this.initialDocuments;
  preview: AppDocumentFile | undefined;
  selectedRowsDocumentIds: number[] = [];
  groups: GroupDescriptor[] = [];
  filter: CompositeFilterDescriptor = this.initialFilter;
  czech: boolean = false;
  profilePickerOpened: boolean = false;
  workspacePickerData: WorkspaceProfileRelationship[] =
    this.initialWorkspacePickerData;
  workspacePickerCheckedKeys: string[] = this.initialWorkspacePickerCheckedKeys;
  workspacePickerCheckedKeysUponPickerOpen: string[] = [];
  darkmode: boolean = false;

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

  private get initialWorkspacePickerData(): WorkspaceProfileRelationship[] {
    return getWorkspaceProfileRelationships();
  }

  private get initialWorkspacePickerCheckedKeys(): string[] {
    return this.initialWorkspacePickerData.reduce<string[]>(
      (result, w, idx) => [
        ...result,
        idx.toString(),
        ...w.profiles.map((p, i) => `${idx}_${i}`),
      ],
      []
    );
  }

  private get checkedProfilesDocuments(): AppDocument[] {
    const checkedProfileTitles = this.checkedProfiles.map((p) => p.title);

    return this.initialDocuments.filter((d) =>
      checkedProfileTitles.includes(d.profile)
    );
  }

  private get checkedProfiles(): Profile[] {
    const checkedProfileKeys = this.workspacePickerCheckedKeys
      .filter((k) => k.split('_').length === 2)
      .map((k) => k.split('_'));

    return checkedProfileKeys.map(
      ([wKey, pKey]) =>
        this.workspacePickerData[Number(wKey)].profiles[Number(pKey)]
    );
  }

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.documents = this.checkedProfilesDocuments;
    this.toggleDarkmode(false);
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

  toggleDarkmode(darkmode: boolean): void {
    const { body } = this.document;
    body.dataset['theme'] = darkmode ? 'dark' : 'light';
  }

  reset(): void {
    this.documents = this.initialDocuments;
    this.selectedRowsDocumentIds = [];
    this.groups = [];
    this.filter = this.initialFilter;
    this.preview = undefined;
    this.workspacePickerData = this.initialWorkspacePickerData;
    this.workspacePickerCheckedKeys = this.initialWorkspacePickerCheckedKeys;
    this.workspacePickerCheckedKeysUponPickerOpen = [];

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

  openProfilePicker(): void {
    this.workspacePickerCheckedKeysUponPickerOpen = deepCopy(
      this.workspacePickerCheckedKeys
    );
    this.profilePickerOpened = true;
  }

  confirmProfilePicker(): void {
    this.documents = this.checkedProfilesDocuments;
    this.closeProfilePicker();
  }

  cancelProfilePicker(): void {
    this.workspacePickerCheckedKeys = deepCopy(
      this.workspacePickerCheckedKeysUponPickerOpen
    );
    this.closeProfilePicker();
  }

  onCheckedKeysChange(keys: string[]): void {
    const changedKeys = [...this.workspacePickerCheckedKeys, ...keys].reduce<
      string[]
    >((unique, current) => {
      const duplicateIdx = unique.indexOf(current);

      if (duplicateIdx !== -1) {
        unique.splice(duplicateIdx, 1);
      } else {
        unique.push(current);
      }

      return unique;
    }, []);

    const changedKey =
      changedKeys.length === 1
        ? changedKeys[0]
        : changedKeys.filter((k) => k.split('_')[1] !== undefined)[0];

    const wasAdded = keys.includes(changedKey);
    const [workspaceKey, profileKey] = changedKey.split('_');

    const workspace = this.workspacePickerData[Number(workspaceKey)];

    if (profileKey !== undefined) {
      const wProfileCount = workspace.profiles.length;
      const checkedWProfileCount = keys.filter((k) => {
        const [wKey, pKey] = k.split('_');
        return wKey === workspaceKey && pKey !== undefined;
      }).length;

      if (wasAdded && wProfileCount === checkedWProfileCount) {
        keys = [...keys, workspaceKey];
      } else if (!wasAdded && wProfileCount !== checkedWProfileCount) {
        keys = keys.filter((k) => k !== workspaceKey);
      }

      this.workspacePickerCheckedKeys = keys;
      return;
    }

    if (wasAdded) {
      const allWProfilesKeys = workspace.profiles.map(
        (p, idx) => `${workspaceKey}_${idx}`
      );

      keys = [...keys, ...allWProfilesKeys.filter((k) => !keys.includes(k))];
    } else {
      keys = keys.filter((k) => k.split('_')[0] !== workspaceKey);
    }

    this.workspacePickerCheckedKeys = keys;
  }

  private closeProfilePicker(): void {
    this.profilePickerOpened = false;
    this.workspacePickerCheckedKeysUponPickerOpen = [];
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
