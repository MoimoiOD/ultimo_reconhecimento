import { Injectable } from '@angular/core';
import { FunctionalStateService } from './functional-state.service';
import { CapturePhotoService } from './capture-photo.service';
import { PhotoService } from './photo.service';
import { FacePositionService } from './face-position.service';

interface teste2 {
  nome: string;
  match: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProcessRecognitionService {

  constructor(
    private functionalStateService: FunctionalStateService,
    private capturePhotoService: CapturePhotoService,
    private photoService: PhotoService,
    private facePositionService: FacePositionService) {
  }

  async predictWebcam(): Promise<void> {
    console.log('Iniciando predição!')
    if (!this.functionalStateService.faceDetector || !this.functionalStateService.faceDetectorReady) {
      console.warn("FaceDetector ainda não está pronto.");
      return;
    }
    return new Promise((resolve) => {
      let startTimeMs = performance.now();

      if (this.functionalStateService.video!.videoWidth && this.functionalStateService.video!.videoHeight) {
        const detections = this.functionalStateService.faceDetector!.detectForVideo(this.functionalStateService.video!, startTimeMs).detections;
        if (detections.length > 0) {
          console.log('Rosto detectado!')
          this.functionalStateService.isDetection = false
          this.functionalStateService.isFace = true
        } else {
          console.log('Rosto não detectado!')
          this.functionalStateService.isDetection = false
          this.functionalStateService.isFace = false
        }
        resolve()
      }
    })
  }
  
  async validation(): Promise<void> {
    console.log(`Iniciando o processo de validação/autenticação!`)
    
    return new Promise((resolve) => {
      const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
      this.photoService.sendPhoto(photoBlob).subscribe({
        next: (response: teste2) => {
          if (response.match === true) {
            this.functionalStateService.labels = { header: `Acesso permitido` }
            resolve()
          } else {
            this.functionalStateService.labels = { header: `Acesso negado` }
            resolve()
          }
        },
        error: (error) => {
          this.functionalStateService.labels = { header: `Erro: ${error.detail || 'Erro na comunicação'}` };
        console.log('Erro ao enviar a foto para API:', error); // `error` agora contém o corpo do JSON retornado pela API
        resolve();
        }
      });
    })
  }

  async validationMultiplePhotos(): Promise<void> {
    return new Promise((resolve) => {
      if(this.functionalStateService.isPositionFound) {
        this.photoService.registerFace(this.functionalStateService.nomeCompleto, this.functionalStateService.photosBlob).subscribe({
          next: (response) => {
            console.log(response)
            this.functionalStateService.isPositionFound = false;
            this.functionalStateService.labels = { header: 'Cadastro realizado com sucesso' }
            resolve()
          },
          error: (error) => {
            console.log(error)
            this.functionalStateService.isPositionFound = false;
            this.functionalStateService.labels = { header: 'Erro ao realizar o cadastro' }
            resolve()
          }
        })
      }
      resolve()
      return;
    })
  }
}