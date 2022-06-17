import {
  ChangeDetectorRef,
  EventEmitter,
  SimpleChanges,
  Type,
  ViewContainerRef,
} from '@angular/core';

export class ComponentFacadeCreator<
  BaseComponent extends Type<BaseComponent>,
  FacadeComponent extends Type<FacadeComponent>
> {
  private baseInstance!: BaseComponent;
  private relevantInputs: (keyof BaseComponent)[] = [];
  private relevantOutputs: (keyof BaseComponent)[] = [];

  constructor(
    private baseComponent: BaseComponent,
    private facadeComponent: FacadeComponent,
    private facadeViewRef: ViewContainerRef,
    private facadeCd: ChangeDetectorRef,
    private changes: SimpleChanges
  ) {}

  createBase(): void {
    const baseRef = this.facadeViewRef.createComponent(this.baseComponent);

    this.baseInstance = baseRef.instance;
    this.relevantInputs = this.getRelevantInputs();
    this.relevantOutputs = this.getRelevantOutputs();

    this.setBaseInputsAndOutputs();
  }

  setBaseInputsAndOutputs(): void {
    [...this.relevantInputs, ...this.relevantOutputs].forEach(
      (io) =>
        ((this.baseInstance as any)[io] = (this.facadeComponent as any)[io])
    );

    this.facadeCd.markForCheck();
  }

  private getRelevantInputs(): (keyof BaseComponent)[] {
    const allBaseProps = this.getBaseProperties();
    return this.getRegisteredInputs().filter((inputName) =>
      allBaseProps.includes(inputName as keyof BaseComponent)
    ) as (keyof BaseComponent)[];
  }

  private getRelevantOutputs(): (keyof BaseComponent)[] {
    const allBaseOutpus = this.getAllBaseOutputs();
    return allBaseOutpus.filter((outputName) =>
      Object.hasOwnProperty.call(this.facadeComponent, outputName)
    );
  }

  private getRegisteredInputs(): (keyof FacadeComponent)[] {
    return Object.getOwnPropertyNames(
      this.changes
    ) as (keyof FacadeComponent)[];
  }

  private getAllBaseOutputs(): (keyof BaseComponent)[] {
    return this.getBaseProperties().filter(
      (propName) => this.baseInstance[propName] instanceof EventEmitter
    );
  }

  private getBaseProperties(): (keyof BaseComponent)[] {
    return Object.getOwnPropertyNames(this.baseInstance).filter(
      (propName) => propName !== '__ngContext__'
    ) as (keyof BaseComponent)[];
  }
}
