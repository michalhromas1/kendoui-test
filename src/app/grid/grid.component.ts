import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getProducts } from '../mocks';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  products = getProducts();
}
