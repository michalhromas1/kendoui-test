import { ChangeDetectionStrategy, Component } from '@angular/core';

const uiComponents = [
  'custom-styles',
  'documents-page',
  'grid-cell-edit',
  'grid-row-edit',
] as const;
type UIComponent = typeof uiComponents[number];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  uiComponents = [...uiComponents];
  selectedUiComponent: UIComponent = 'custom-styles';
}
