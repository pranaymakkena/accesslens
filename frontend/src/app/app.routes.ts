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
    path: 'contrast',
    loadComponent: () => import('./pages/contrast-tool/contrast-tool.component').then(m => m.ContrastToolComponent)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent)
  },
  {
    path: 'graph/:id',
    loadComponent: () => import('./pages/graph/graph.component').then(m => m.GraphComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
