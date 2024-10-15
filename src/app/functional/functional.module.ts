import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FunctionalPageRoutingModule } from './functional-routing.module';

import { FunctionalPage } from './functional.page';
import { HttpClientModule } from '@angular/common/http';
import { PhotoService } from './services/photo.service';
import { FacePositionService } from './services/face-position.service';
import { CapturePhotoService } from './services/capture-photo.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FunctionalPageRoutingModule,
    HttpClientModule
  ],
  declarations: [FunctionalPage],
  providers: [
    PhotoService,
    FacePositionService,
    CapturePhotoService
  ]
})
export class FunctionalPageModule {}
