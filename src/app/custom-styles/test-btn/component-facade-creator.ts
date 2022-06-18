import {
  ChangeDetectorRef,
  EventEmitter,
  SimpleChanges,
  Type,
  ViewContainerRef,
} from '@angular/core';

type Config<BaseComponent, FacadeComponent> = {
  baseComponent: BaseComponent;
  facadeComponent: FacadeComponent;
  facadeViewRef: ViewContainerRef;
  facadeChanges: SimpleChanges;
  facadeCd: ChangeDetectorRef;
};

export class ComponentFacadeCreator<BaseComponent, FacadeComponent> {
  private baseInstance!: BaseComponent;
  private relevantInputs: (keyof BaseComponent)[] = [];
  private relevantOutputs: (keyof BaseComponent)[] = [];

  constructor(private config: Config<BaseComponent, FacadeComponent>) {
    this.createBase();
  }

  setBaseInputsAndOutputs(): void {
    [...this.relevantInputs, ...this.relevantOutputs].forEach(
      (io) =>
        ((this.baseInstance as any)[io] = (this.config.facadeComponent as any)[
          io
        ])
    );

    this.config.facadeCd.markForCheck();
  }

  private createBase(): void {
    const baseRef = this.config.facadeViewRef.createComponent(
      this.config.baseComponent as unknown as Type<BaseComponent>
    );

    this.baseInstance = baseRef.instance;
    this.relevantInputs = this.getRelevantInputs();
    this.relevantOutputs = this.getRelevantOutputs();

    this.setBaseInputsAndOutputs();
  }

  private getRelevantInputs(): (keyof BaseComponent)[] {
    const allBaseProps = this.getBaseProperties();
    return this.getRegisteredInputs().filter((inputName) =>
      allBaseProps.includes(inputName as unknown as keyof BaseComponent)
    ) as unknown as (keyof BaseComponent)[];
  }

  private getRelevantOutputs(): (keyof BaseComponent)[] {
    const allBaseOutpus = this.getAllBaseOutputs();
    return allBaseOutpus.filter((outputName) =>
      Object.hasOwnProperty.call(this.config.facadeComponent, outputName)
    );
  }

  private getRegisteredInputs(): (keyof FacadeComponent)[] {
    return Object.getOwnPropertyNames(
      this.config.facadeChanges
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
