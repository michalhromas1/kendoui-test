import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnChanges,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { TestBtnBaseComponent } from '../test-btn-base/test-btn-base.component';
import { ComponentFacadeCreator } from './component-facade-creator';

@Component({
  selector: 'app-test-btn',
  template: '',
  styleUrls: ['./test-btn.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestBtnComponent
  extends TestBtnBaseComponent
  implements OnChanges
{
  private cd = inject(ChangeDetectorRef);
  private viewRef = inject(ViewContainerRef);

  private baseFC!: ComponentFacadeCreator<
    TestBtnBaseComponent,
    TestBtnComponent
  >;

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.baseFC) {
      this.baseFC = new ComponentFacadeCreator({
        baseComponent: TestBtnBaseComponent as any,
        facadeComponent: this as any,
        facadeChanges: changes,
        facadeViewRef: this.viewRef,
        facadeCd: this.cd,
      });

      return;
    }

    this.baseFC.setBaseInputsAndOutputs();
  }
}
