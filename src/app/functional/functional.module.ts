import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { FunctionalPageRoutingModule } from './functional-routing.module';

import { FunctionalPage } from './functional.page';
import { HttpClientModule } from '@angular/common/http';
import { PhotoService } from './services/photo.service';
import { FacePositionService } from './services/face-position.service';
import { CapturePhotoService } from './services/capture-photo.service';
import { AlertService } from './services/alert.service';
import { CameraService } from './services/camera.service';
import { FunctionalStateService } from './services/functional-state.service';
import { ProcessRecognitionService } from './services/process-recognition.service';
import { StartRecognitionService } from './services/start-recognition.service';
import { RouterModule } from '@angular/router';
import { RegisterPageModule } from '../register/register.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    RouterModule.forChild([
      { path: '', component: FunctionalPage }
    ]),
  ],
  declarations: [FunctionalPage],
  providers: [
    PhotoService,
    FacePositionService,
    CapturePhotoService,
    AlertService,
    CameraService,
    FunctionalStateService,
    ProcessRecognitionService,
    StartRecognitionService
  ]
})
export class FunctionalPageModule {}
