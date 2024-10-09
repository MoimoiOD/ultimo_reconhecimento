import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FunctionalPage } from './functional.page';

const routes: Routes = [
  {
    path: '',
    component: FunctionalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FunctionalPageRoutingModule {}
