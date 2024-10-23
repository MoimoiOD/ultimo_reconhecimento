import { Injectable } from '@angular/core';
import { FunctionalStateService } from './functional-state.service';
import { FacePositionService } from './face-position.service';
import { CapturePhotoService } from './capture-photo.service';
import { AlertService } from './alert.service';
import { ProcessRecognitionService } from './process-recognition.service';
import { PhotoService } from './photo.service';

@Injectable({
  providedIn: 'root'
})
export class FaceCaptureService {

  private alertService: AlertService
  private processRecognitionService: ProcessRecognitionService

  constructor(
    private functionalStateService: FunctionalStateService,
    private facePositionService: FacePositionService,
    private capturePhotoService: CapturePhotoService,
    private photoService: PhotoService
  ) {
    this.alertService = new AlertService(this.functionalStateService)
    this.processRecognitionService = new ProcessRecognitionService(this.functionalStateService, this.capturePhotoService, this.photoService, this.facePositionService )
  }

  async captureRigthFace(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Ainda executando o método captureRigthFace');

      let lastVideoTime = -1;
      let results: any = undefined;

      if (lastVideoTime !== this.functionalStateService.video!.currentTime) {
        lastVideoTime = this.functionalStateService.video!.currentTime;
        results = this.functionalStateService.faceLandmarker!.detectForVideo(this.functionalStateService.video!, Date.now());
      }
      if (results && results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
          if (!this.functionalStateService.photos.rigth.confirm && this.facePositionService!.identifyFacePosition(landmarks, this.functionalStateService.photos.rigth.position, this.functionalStateService.photos.rigth.angle, this.functionalStateService)) {
            console.log('Capturando  foto do lado direito!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob);
            this.functionalStateService.photos.rigth.confirm = true;
            this.functionalStateService.photos.left.confirm = false;
            this.functionalStateService.labels = { header: 'Lado esquerdo cadastrado' };
            this.functionalStateService.textLabels.text = 'Iniciando captura da face direita'
            this.alertService.alert(true)
              .then(() => this.delay(4000)) // Aqui garantimos o delay
              .then(() => this.captureLeftFace()) // Agora chamamos o próximo passo
              .then(() => resolve()); // Resolvemos a Promise no final
            return;
          }
        }
      }
      if (!this.functionalStateService.photos.rigth.confirm) {
        setTimeout(() => {
          window.requestAnimationFrame(() => {
            this.captureRigthFace().then(() => resolve()); // Continue a execução normalmente
          });
        }, 1000);
      }
    })
  }

  async captureLeftFace(): Promise<void> {
    return new Promise((resolve) => {
      let lastVideoTime = -1;
      let results: any = undefined;

      if (lastVideoTime !== this.functionalStateService.video!.currentTime) {
        lastVideoTime = this.functionalStateService.video!.currentTime;
        results = this.functionalStateService.faceLandmarker!.detectForVideo(this.functionalStateService.video!, Date.now());
      }
      if (results && results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
          if (!this.functionalStateService.photos.left.confirm && this.facePositionService.identifyFacePosition(landmarks, this.functionalStateService.photos.left.position, this.functionalStateService.photos.left.angle, this.functionalStateService)) {
            console.log('Capturando  foto do lado esquerdo!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!);
            this.functionalStateService.photosBlob.push(photoBlob);
            this.functionalStateService.photos.left.confirm = true;
            this.functionalStateService.photos.close.confirm = false;
            this.functionalStateService.labels = { header: 'Lado esquerdo cadastrado' }
            this.functionalStateService.textLabels.text = 'Iniciando a captura frontal próxima'
            this.alertService.alert(true)
            .then(() => this.delay(4000)) // Aqui garantimos o delay
            .then(() => this.captureCloseFrontFace()) // Agora chamamos o próximo passo
            .then(() => resolve()); // Resolvemos a Promise no final
            return;
          }
        }
      }
      if (!this.functionalStateService.photos.left.confirm) {
        setTimeout(() => {
          window.requestAnimationFrame(() => {
            this.captureLeftFace().then(() => resolve()); // Continue a execução normalmente
          });
        }, 1000);
      }
    })
  }
  
  async captureCloseFrontFace(): Promise<void> {
    return new Promise((resolve) => {
      let lastVideoTime = -1;
      let results: any = undefined;
      
      if (lastVideoTime !== this.functionalStateService.video!.currentTime) {
        lastVideoTime = this.functionalStateService.video!.currentTime;
        results = this.functionalStateService.faceLandmarker!.detectForVideo(this.functionalStateService.video!, Date.now());
      }
      if (results && results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
          if (!this.functionalStateService.photos.close.confirm && this.facePositionService.identifyFacePosition(landmarks, this.functionalStateService.photos.close.position, this.functionalStateService.photos.close.angle, this.functionalStateService)) {
            console.log('Capturando foto de frente perto!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob)
            this.functionalStateService.photos.close.confirm = true;
            this.functionalStateService.photos.far.confirm = false;
            this.functionalStateService.labels = { header: 'Frente perto cadastrado' }
            this.functionalStateService.textLabels.text = 'Iniciando a captura frontal distante'
            this.alertService.alert(true)
            .then(() => this.delay(4000)) // Aqui garantimos o delay
            .then(() => this.captureFarFrontFace()) // Agora chamamos o próximo passo
            .then(() => resolve()); // Resolvemos a Promise no final
            return;
          }
        }
      }
      if (!this.functionalStateService.photos.close.confirm) {
        setTimeout(() => {
          window.requestAnimationFrame(() => {
            this.captureCloseFrontFace().then(() => resolve()); // Continue a execução normalmente
          });
        }, 1000);
      }
    })
  }

  async captureFarFrontFace(): Promise<void> {
    return new Promise((resolve) => {
      let lastVideoTime = -1;
      let results: any = undefined;

      if (lastVideoTime !== this.functionalStateService.video!.currentTime) {
        lastVideoTime = this.functionalStateService.video!.currentTime;
        results = this.functionalStateService.faceLandmarker!.detectForVideo(this.functionalStateService.video!, Date.now());
      }
      if (results && results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
          if (!this.functionalStateService.photos.far.confirm && this.facePositionService.identifyFacePosition(landmarks, this.functionalStateService.photos.far.position, this.functionalStateService.photos.far.angle, this.functionalStateService)) {
            console.log('Capturando foto de frente perto!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob)
            this.functionalStateService.photos.far.confirm = true;
            this.functionalStateService.labels = { header: 'Frente longe cadastrado' }
            this.functionalStateService.isPositionFound = true;
            this.functionalStateService.textLabels.text = 'Fim da captura!'
            this.alertService.alert(true)
              .then(() => this.delay(4000)) // Aqui garantimos o delay
              .then(() => this.processRecognitionService.validationMultiplePhotos()) // Agora chamamos o próximo passo
              .then(() => resolve()); // Resolvemos a Promise no final
            return;
          }
        }
      }
      if (!this.functionalStateService.photos.far.confirm) {
        setTimeout(() => {
          window.requestAnimationFrame(() => {
            this.captureFarFrontFace().then(() => resolve()); // Continue a execução normalmente
          });
        }, 1000);
      }
    })
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
