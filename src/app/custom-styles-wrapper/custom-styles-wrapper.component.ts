import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-custom-styles-wrapper',
  templateUrl: './custom-styles-wrapper.component.html',
  styleUrls: ['./custom-styles-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomStylesWrapperComponent {
  @HostBinding('attr.data-theme') theme: string = 'light';

  darkmode: boolean = false;

  toggleDarkmode(darkmode: boolean): void {
    this.theme = darkmode ? 'dark' : 'light';
  }
}
