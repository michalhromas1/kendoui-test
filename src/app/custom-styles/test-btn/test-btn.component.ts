import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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

  private baseInstance!: TestBtnBaseComponent;
  private baseCd!: ChangeDetectorRef;

  private registeredInputs: (keyof TestBtnComponent)[] = [];
  private relevantInputs: (keyof TestBtnBaseComponent)[] = [];
  private relevantOutputs: (keyof TestBtnBaseComponent)[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.baseInstance) {
      this.registeredInputs = this.getRegisteredInputs(changes);
      return;
    }

    this.setBaseInputsAndOutputs();
  }

  ngAfterViewInit(): void {
    this.createBase();
  }

  private createBase(): void {
    const baseRef = this.createBaseRef();

    this.baseInstance = baseRef.instance;
    this.baseCd = baseRef.changeDetectorRef;

    this.relevantInputs = this.getRelevantInputs();
    this.relevantOutputs = this.getRelevantOutputs();

    this.setBaseInputsAndOutputs();
  }

  private createBaseRef(): ComponentRef<TestBtnBaseComponent> {
    this.viewRef.clear();
    return this.viewRef.createComponent(TestBtnBaseComponent);
  }

  private setBaseInputsAndOutputs(): void {
    [...this.relevantInputs, ...this.relevantOutputs].forEach(
      (io) => ((this.baseInstance as any)[io] = this[io])
    );

    this.baseCd.markForCheck();
  }

  private getRegisteredInputs(
    changes: SimpleChanges
  ): (keyof TestBtnComponent)[] {
    return Object.getOwnPropertyNames(changes) as (keyof TestBtnComponent)[];
  }

  private getRelevantInputs(): (keyof TestBtnBaseComponent)[] {
    const allBaseProps = this.getBaseProperties();
    return this.registeredInputs.filter((inputName) =>
      allBaseProps.includes(inputName as keyof TestBtnBaseComponent)
    ) as (keyof TestBtnBaseComponent)[];
  }

  private getRelevantOutputs(): (keyof TestBtnBaseComponent)[] {
    const allBaseOutpus = this.getAllBaseOutputs();
    return allBaseOutpus.filter((outputName) =>
      Object.hasOwnProperty.call(this, outputName)
    );
  }

  private getAllBaseOutputs(): (keyof TestBtnBaseComponent)[] {
    return this.getBaseProperties().filter(
      (propName) => this.baseInstance[propName] instanceof EventEmitter
    );
  }

  private getBaseProperties(): (keyof TestBtnBaseComponent)[] {
    return Object.getOwnPropertyNames(this.baseInstance).filter(
      (propName) => propName !== '__ngContext__'
    ) as (keyof TestBtnBaseComponent)[];
  }
}
