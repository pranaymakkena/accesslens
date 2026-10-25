import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'results/:id',
    loadComponent: () => import('./pages/results/results.component').then(m => m.ResultsComponent)
  },
  {
    path: 'demo',
    loadComponent: () => import('./pages/demo/demo.component').then(m => m.DemoComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
