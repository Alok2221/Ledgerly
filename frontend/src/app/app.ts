import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: `:host { display: block; min-height: 100%; }`,
})
export class App {
  /** Ensures theme preference is applied on bootstrap. */
  private readonly _theme = inject(ThemeService);
}
