import { Injectable } from '@angular/core';
import { FunctionalStateService } from './functional-state.service';
import { CapturePhotoService } from './capture-photo.service';
import { PhotoService } from './photo.service';
import { FacePositionService } from './face-position.service';
import { FaceCaptureService } from './face-capture.service';

interface teste2 {
  nome: string;
  match: boolean;

}

@Injectable({
  providedIn: 'root'
})
export class ProcessRecognitionService {

  private faceCaptureService: FaceCaptureService;

  constructor(
    private functionalStateService: FunctionalStateService, 
    private capturePhotoService: CapturePhotoService, 
    private photoService: PhotoService, 
    private facePositionService: FacePositionService) { 
      this.faceCaptureService = new FaceCaptureService(this.functionalStateService, this.facePositionService,  this.capturePhotoService);
     }

  async predictWebcam(): Promise<void> {
    console.log('Iniciando predição!')
    if (!this.functionalStateService.faceDetector || !this.functionalStateService.faceDetectorReady) {
      console.warn("FaceDetector ainda não está pronto.");
      return;
    }
    return new Promise((resolve) => {
      let startTimeMs = performance.now();

      console.log(this.functionalStateService.video!.videoWidth)
      console.log(this.functionalStateService.video!.videoHeight)
      if (this.functionalStateService.video!.videoWidth && this.functionalStateService.video!.videoHeight) {
        const detections = this.functionalStateService.faceDetector!.detectForVideo(this.functionalStateService.video!, startTimeMs).detections;
        if (detections.length > 0) {
          console.log('Rosto detectado!')
          this.functionalStateService.isDetection = true
        } else {
          console.log('Rosto não detectado!')
          this.functionalStateService.isDetection = false
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
            this.functionalStateService.labels = { header: `Acesso permitido`, context: `Bem-vindo, ${response.nome}!` }
            resolve()
          } else {
            this.functionalStateService.labels = { header: `Acesso negado`, context: `Rosto não reconhecido!` }
            resolve()
          }
        },
        error: (error) => {
          this.functionalStateService.labels = { header: `Erro de comunicação`, context: `Falha ao enviar a foto para API.` }
          console.log('Erro ao enviar a foto para API:', error);
          resolve()
        }
      });
    })
  }

  async validationMultiplePhotos(): Promise<void> {

    return new Promise((resolve) => {

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
            this.functionalStateService.photosBlob.push(photoBlob)
            this.functionalStateService.photos.rigth.confirm = true;
            this.functionalStateService.photos.left.confirm = false;
            this.functionalStateService.labels = { header: 'Foto cadastrada', context: 'Lado direito do rosto cadastrado!' }
            console.log('Cheguei no resolve')
            resolve()
            return;
          } else if (!this.functionalStateService.photos.left.confirm && this.facePositionService.identifyFacePosition(landmarks, this.functionalStateService.photos.left.position, this.functionalStateService.photos.left.angle)) {
            console.log('Capturando  foto do lado esquerdo!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob)
            this.functionalStateService.photos.left.confirm = true;
            this.functionalStateService.photos.close.confirm = false;
            this.functionalStateService.labels = { header: 'Foto cadastrada', context: 'Lado esquerdo do rosto cadastrado!' }
            resolve()
            return
          } else if (!this.functionalStateService.photos.close.confirm && this.facePositionService.identifyFacePosition(landmarks, this.functionalStateService.photos.close.position, this.functionalStateService.photos.close.angle)) {
            console.log('Capturando foto de frente perto!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob)
            this.functionalStateService.photos.close.confirm = true;
            this.functionalStateService.photos.far.confirm = false;
            this.functionalStateService.labels = { header: 'Foto cadastrada', context: 'Região frontal(próxima) do rosto cadastrado!' }
            resolve()
            return
          } else if (!this.functionalStateService.photos.far.confirm && this.facePositionService.identifyFacePosition(landmarks, this.functionalStateService.photos.far.position, this.functionalStateService.photos.far.angle)) {
            console.log('Capturando foto de frente perto!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.functionalStateService.canvas!, this.functionalStateService.video!, this.functionalStateService.ctx!)
            this.functionalStateService.photosBlob.push(photoBlob)
            this.functionalStateService.photos.far.confirm = true;
            this.functionalStateService.labels = { header: 'Foto cadastrada', context: 'Região frontal(distante) do rosto cadastrado!' }
            this.functionalStateService.isPositionFound = true;
            resolve()
            return
          } else if (this.functionalStateService.isPositionFound) {
            console.log("Todas as posições da face foram encontradas!")
            this.photoService.registerFace(this.functionalStateService.nomeCompleto, this.functionalStateService.photosBlob).subscribe({
              next: (response) => {
                console.log(response)
                this.functionalStateService.isPositionFound = false;
              },
              error: (error) => {
                console.log(error)
                this.functionalStateService.isPositionFound = false;
              }
            })
            resolve()
            return;
          } else {
            window.requestAnimationFrame(() => { this.validationMultiplePhotos() })
          }
        }
      }
      resolve()
    })
  }

}
