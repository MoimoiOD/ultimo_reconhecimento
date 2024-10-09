import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FunctionalPageRoutingModule } from './functional-routing.module';

import { FunctionalPage } from './functional.page';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FunctionalPageRoutingModule,
    HttpClientModule
  ],
  declarations: [FunctionalPage]
})
export class FunctionalPageModule {}
