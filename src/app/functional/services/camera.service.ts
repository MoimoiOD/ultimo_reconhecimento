import { Injectable } from '@angular/core';
import { FunctionalStateService } from './functional-state.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor(private functionalStateService: FunctionalStateService) { }

  async enableCam(): Promise<void> {

    console.log('Video: ' + this.functionalStateService.video)
    if (!this.functionalStateService.video) return;
    if (!this.functionalStateService.faceDetector) {
      console.log("O Detector de Rostos ainda está carregando. Por favor, tente novamente.");
      return;
    }
    return new Promise((resolve) => {
  
      const constraints = {
        video: true
      };
  
      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          this.functionalStateService.stream = stream
          this.functionalStateService.video!.srcObject = this.functionalStateService.stream;
          resolve()
        }).catch(error => {
          console.error(`Erro ao acessar a câmera ${error}`)
          resolve()
        });
  
      console.log('Câmera inicializada com sucesso!')
    })

  }

  disableCam() {
    if (this.functionalStateService.stream) {
      this.functionalStateService.stream.getTracks().forEach(track => track.stop())
      this.functionalStateService.video!.srcObject = null
      console.log('Câmera desligada com sucesso!')
    }
    this.functionalStateService.faceDetector?.close()
    this.functionalStateService.faceDetector = null
  }

}
