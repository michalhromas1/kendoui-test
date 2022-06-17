import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TestBtnBaseComponent } from '../test-btn-base/test-btn-base.component';

@Component({
  selector: 'app-test-btn',
  templateUrl: './test-btn.component.html',
  styleUrls: ['./test-btn.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestBtnComponent
  extends TestBtnBaseComponent
  implements OnChanges, AfterViewInit
{
  @ViewChild('placeholder', { read: ViewContainerRef })
  private viewRef!: ViewContainerRef;

  private componentRef!: ComponentRef<TestBtnBaseComponent>;

  private inputNames: (keyof TestBtnComponent)[] = [];

  constructor(private cfr: ComponentFactoryResolver) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.componentRef) {
      this.setInputsAndOutputs();
      this.componentRef.changeDetectorRef.markForCheck();
      return;
    }

    this.inputNames = Object.getOwnPropertyNames(
      changes
    ) as (keyof TestBtnComponent)[];
  }

  ngAfterViewInit(): void {
    this.loadComponent();
  }

  public test(): void {
    console.log('pjwegpwejogpjg');
  }

  loadComponent(): void {
    this.viewRef.clear();

    const componentFactory =
      this.cfr.resolveComponentFactory(TestBtnBaseComponent);
    this.componentRef = this.viewRef.createComponent(componentFactory);

    this.setInputsAndOutputs();
    this.componentRef.changeDetectorRef.markForCheck();
  }

  private setInputsAndOutputs(): void {
    const instance = this.componentRef.instance;

    const ownProps = Object.getOwnPropertyNames(
      this.componentRef.instance
    ).filter((p) => p !== '__ngContext__') as (keyof TestBtnBaseComponent)[];

    const outputs = ownProps.filter(
      (p) => this.componentRef.instance[p] instanceof EventEmitter
    );

    console.log(this);
    console.log(instance);
    console.log('---');

    outputs.forEach((output) => {
      if (Object.hasOwnProperty.call(this, output)) {
        (instance as any)[output] = this[output];
      }
    });

    this.inputNames.forEach((inputName) => {
      if (ownProps.includes(inputName as any)) {
        (instance as any)[inputName] = this[inputName];
      }
    });

    console.log(this);
    console.log(instance);
  }
}
