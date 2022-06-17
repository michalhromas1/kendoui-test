import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-test-btn-base',
  templateUrl: './test-btn-base.component.html',
  styleUrls: ['./test-btn-base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestBtnBaseComponent {
  @Input() tyjo: string = '';
  @Input() noNeke: string = '';
  @Output() tyjoChange = new EventEmitter<string>();

  public tt: string = '';
  private ttt: string = '';

  public test(): void {
    console.log('test');
  }

  private testPriv(): void {
    console.log('testPriv');
  }
}
