import { ChangeDetectionStrategy, Component } from '@angular/core';

const uiComponents = ['grid'] as const;
type UIComponent = typeof uiComponents[number];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  uiComponents = [...uiComponents];
  selectedUiComponent: UIComponent = 'grid';
}
