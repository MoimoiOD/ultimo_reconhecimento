// face-detection.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { FaceDetector, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { PhotoService } from './services/photo.service';
import { StateService } from '../register/services/register-state.service';
import { CapturePhotoService } from './services/capture-photo.service';
import { FacePositionService } from './services/face-position.service';
import { FunctionalStateService } from './services/functional-state.service';
import { StartRecognitionService } from './services/start-recognition.service';
import { CameraService } from './services/camera.service';
import { ProcessRecognitionService } from './services/process-recognition.service';
import { AlertService } from './services/alert.service';

@Component({
  selector: 'app-functional',
  templateUrl: './functional.page.html',
  styleUrls: ['./functional.page.scss']
})
export class FunctionalPage implements OnInit {

  private loop: boolean = true;

  public functionalStateService: FunctionalStateService;
  private startRecognitionService: StartRecognitionService;
  private cameraService: CameraService;
  private processRecognitionService: ProcessRecognitionService;
  private alertService: AlertService

  constructor(
    private router: Router, //  Instancia o Router
    private menu: MenuController, //  Instancia o MenuController
    private photoService: PhotoService, // Instancia a api de envio das fotos
    private stateService: StateService,  //  Instancia o serviço de estado
    private capturePhotoService: CapturePhotoService, // Instancia o arquivo de captura de imagem
    private facePositionService: FacePositionService,
  ) {
    this.functionalStateService = new FunctionalStateService(),
    this.startRecognitionService = new StartRecognitionService(this.functionalStateService)
    this.cameraService = new CameraService(this.functionalStateService)
    this.processRecognitionService = new ProcessRecognitionService(this.functionalStateService, this.capturePhotoService, this.photoService, this.facePositionService)
    this.alertService = new AlertService(this.functionalStateService)
  }

  async ngOnInit() {
  }

  async ionViewWillEnter() { //  Inicia a detecção de face quando a página é carregada
    this.loop = true
    this.functionalStateService.video = document.getElementById("webcam") as HTMLVideoElement; //  Pega o elemento do vídeo
    console.log('Tag vídeo capturado.')
    this.functionalStateService.canvas = document.createElement('canvas') as HTMLCanvasElement; //   Cria o elemento do canvas
    console.log('Tag canvas criado e capturado.')
    this.functionalStateService.ctx = this.functionalStateService.canvas.getContext('2d')

    if (this.functionalStateService.ctx) {
      console.log('Contexto do canvas capturado');
    } else {
      console.error('Erro ao capturar o contexto do canvas.');
    }
    console.log('Contexto do canvas capturado')
    this.stateService.nome$.subscribe(nomeCompleto => {
      this.functionalStateService.nomeCompleto = nomeCompleto
      console.log(`Nome completo do registro: ${this.functionalStateService.nomeCompleto}`)
    })
    this.stateService.modoCadastro$.subscribe(modoCadastro => {
      this.functionalStateService.modoCadastro = modoCadastro
      console.log(`Modo de cadastro: ${this.functionalStateService.modoCadastro}`)
    })

    console.log('Configurações Iniciais Finalizadas!')

    await this.startRecognitionService.initializeFaceDetector();
    await this.startRecognitionService.initializeFaceLandmarker();
    await this.cameraService.enableCam()
    if (this.functionalStateService.modoCadastro) {

    } else {
      await this.runSequenceValidation()
    }
  }

  ionViewWillLeave() {
    this.loop = false;
    this.functionalStateService.reseteState()
    this.stopDetection();
  }

  // ------------------------------- Setar informações para interface com o usuário -------------------------------

  async runSequence() {
    let show = true;
    while (true) {
      if (!this.functionalStateService.photos.rigth.confirm) {
        await this.processRecognitionService.validationMultiplePhotos()
      } else if (!this.functionalStateService.photos.left.confirm) {
        await this.alertService.alert(show)
        await this.processRecognitionService.validationMultiplePhotos()
      } else if (!this.functionalStateService.photos.close.confirm) {
        await this.alertService.alert(show)
        await this.processRecognitionService.validationMultiplePhotos()
      } else if (!this.functionalStateService.photos.far.confirm) {
        await this.alertService.alert(show)
        await this.processRecognitionService.validationMultiplePhotos()
      } else {
        await this.alertService.alert(show)
        await this.processRecognitionService.validationMultiplePhotos()
        show = false
        if (!this.functionalStateService.isPositionFound) {
          this.functionalStateService.photosBlob = []
          break
        }
      }
      console.log('Todos os métodos concluídos. Reiniciando a sequência...\n')
      await this.delay(4000)
    }
  }


  async runSequenceValidation() {
    while (this.loop) {
      await this.delay(1000);
      if (!this.loop) break;
      await this.processRecognitionService.predictWebcam()
      if (!this.loop) break;
      await this.processRecognitionService.validation()
      if (!this.loop) break;
      await this.alertService.alert(true)
      if (!this.loop) break;
      console.log('Todos os métodos concluídos. Reiniciando a sequência...\n')
      await this.delay(4000)
    }
  }

  irParaRegistro() {
    this.menu.close()
    this.router.navigate(['/register'])
  }

  sairParaHome() {
    this.router.navigate(['/home'])
  }

  stopDetection() {
    this.functionalStateService.isDetection = false
    this.cameraService.disableCam();
    if (this.functionalStateService.animationFrameId) {
      cancelAnimationFrame(this.functionalStateService.animationFrameId!)
      this.functionalStateService.animationFrameId = null
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
