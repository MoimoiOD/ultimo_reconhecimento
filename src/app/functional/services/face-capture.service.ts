import { Injectable } from '@angular/core';
import { FunctionalStateService } from './functional-state.service';
import { FacePositionService } from './face-position.service';
import { CapturePhotoService } from './capture-photo.service';

@Injectable({
  providedIn: 'root'
})
export class FaceCaptureService {

  constructor(private functionalStateService: FunctionalStateService, private facePositionService: FacePositionService, private capturePhotoService: CapturePhotoService) { }

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
          if (!this.functionalStateService.photos.rigth.confirm && this.facePositionService!.identifyFacePosition(landmarks, this.functionalStateService.photos.rigth.position, this.functionalStateService.photos.rigth.angle)) {
            console.log('Capturando  foto do lado direito!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob);
            this.functionalStateService.photos.rigth.confirm = true;
            this.functionalStateService.photos.left.confirm = false;
            this.functionalStateService.labels = { header: 'Lado direito cadastrado' };
            resolve()
            return;
          }
        }
      }
      setTimeout(() => {
        window.requestAnimationFrame(() => { this.captureRigthFace() })
      }, 1000)
      resolve()
      return
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
          if (!this.functionalStateService.photos.left.confirm && this.facePositionService.identifyFacePosition(landmarks, this.functionalStateService.photos.left.position, this.functionalStateService.photos.left.angle)) {
            console.log('Capturando  foto do lado esquerdo!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob)
            this.functionalStateService.photos.left.confirm = true;
            this.functionalStateService.photos.close.confirm = false;
            this.functionalStateService.labels = { header: 'Lado esquerdo cadastrado' }
            resolve()
            return;
          }
        }
      }
      setTimeout(() => {
        window.requestAnimationFrame(() => { this.captureLeftFace() })
      }, 1000)
      resolve()
      return
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
          if (!this.functionalStateService.photos.close.confirm && this.facePositionService.identifyFacePosition(landmarks, this.functionalStateService.photos.close.position, this.functionalStateService.photos.close.angle)) {
            console.log('Capturando foto de frente perto!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob)
            this.functionalStateService.photos.close.confirm = true;
            this.functionalStateService.photos.far.confirm = false;
            this.functionalStateService.labels = { header: 'Frente perto cadastrado' }
            resolve()
            return;
          }
        }
      }
      setTimeout(() => {
        window.requestAnimationFrame(() => { this.captureCloseFrontFace() })
      }, 1000)
      resolve()
      return
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
          if (!this.functionalStateService.photos.far.confirm && this.facePositionService.identifyFacePosition(landmarks, this.functionalStateService.photos.far.position, this.functionalStateService.photos.far.angle)) {
            console.log('Capturando foto de frente perto!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob)
            this.functionalStateService.photos.far.confirm = true;
            this.functionalStateService.labels = { header: 'Frente longe cadastrado' }
            this.functionalStateService.isPositionFound = true;
            resolve()
            return
          }
        }
      }
      setTimeout(() => {
        window.requestAnimationFrame(() => { this.captureFarFrontFace() })
      }, 1000)
      resolve()
      return
    })
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
