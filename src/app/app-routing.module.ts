import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./game/game.page').then((m) => m.GamePage),
  },
  {
    path: 'lookdev',
    loadComponent: () => import('./lookdev/lookdev.page').then((m) => m.LookdevPage),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
