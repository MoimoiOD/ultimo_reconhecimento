// face-detection.component.ts
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { PhotoService } from './services/photo.service';
import { StateService } from '../register/services/register-state.service';
import { CapturePhotoService } from './services/capture-photo.service';
import { FacePositionService } from './services/face-position.service';
import { FunctionalStateService } from './services/functional-state.service';
import { StartRecognitionService } from './services/start-recognition.service';
import { CameraService } from './services/camera.service';
import { ProcessRecognitionService } from './services/process-recognition.service';
import { AlertService } from './services/alert.service';
import { FaceCaptureService } from './services/face-capture.service';
import PQueue from 'p-queue';
import { take } from 'rxjs';
import { RouterService } from './services/router.service';

@Component({
  selector: 'app-functional',
  templateUrl: './functional.page.html',
  styleUrls: ['./functional.page.scss']
})
export class FunctionalPage implements OnInit {

  private loop: boolean = true

  public functionalStateService: FunctionalStateService
  private startRecognitionService: StartRecognitionService
  private cameraService: CameraService
  private processRecognitionService: ProcessRecognitionService
  private alertService: AlertService
  private faceCaptureService: FaceCaptureService
  private registerState: StateService
  public routerService: RouterService
  private queue = new PQueue({ concurrency: 1 })

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
    this.faceCaptureService = new FaceCaptureService(this.functionalStateService, this.facePositionService, this.capturePhotoService, this.photoService)
    this.registerState = new StateService()
    this.routerService = new RouterService(router)
  }

  async ngOnInit() {
  }

  // ------------------------------- Funções que são chamadas quando o Ionic entra e sai no componente functional.page.ts -----------------------------------

  // Função chamada quando o Ionic inicia o componente
  async ionViewWillEnter() { 
    this.functionalStateService.isDetection = false
    this.loop = true
    this.functionalStateService.video = document.getElementById("webcam") as HTMLVideoElement; //  Pega o elemento do vídeo
    this.functionalStateService.canvas = document.createElement('canvas') as HTMLCanvasElement; //   Cria o elemento do canvas
    this.functionalStateService.ctx = this.functionalStateService.canvas.getContext('2d')
    
    this.stateService.nome$.pipe(take(1)).subscribe(nomeCompleto => {
      this.functionalStateService.nomeCompleto = nomeCompleto
      console.log(`Nome completo do registro: ${this.functionalStateService.nomeCompleto}`)
    })
    this.stateService.modoCadastro$.pipe(take(1)).subscribe(modoCadastro => {
      this.functionalStateService.modoCadastro = modoCadastro
      console.log(`Modo de cadastro: ${this.functionalStateService.modoCadastro}`)
    })

    this.stateService.resetState()
    
    await this.startRecognitionService.initializeFaceDetector();
    await this.startRecognitionService.initializeFaceLandmarker();
    if (!this.functionalStateService.video!.srcObject) {
      await this.cameraService.enableCam()
    }
    if (this.functionalStateService.modoCadastro) {
      await this.delay(1000);
      await this.runSequence().then(() => {
        this.functionalStateService.isDetection = false
        this.runSequenceValidation()
      })
      // await this.runSequenceValidation()
    } else {
      await this.delay(1000)
      await this.runSequenceValidation()
    }
  }
  
  // Função chamada quando  o Ionic sai do componente
  async ionViewWillLeave() {
    await this.menu.close()
    await this.functionalStateService.faceDetector?.close();
    await this.functionalStateService.faceLandmarker?.close();
    await this.queue.clear();
    await this.stopDetection();
    await this.functionalStateService.reseteState()
  }

  // ------------------------------- Funções que definem a sequencia de passos para validar e para registrar um usuário -------------------------------

  // Sequencia para registrar um usuário
  async runSequence() {
    this.queue.add(async () => {
      this.functionalStateService.textLabels.text = 'Iniciando captura da face esquerda'
      await this.delay(6000)
      await this.faceCaptureService.captureRigthFace()
      await this.alertService.alert(true)
      await this.queue.clear()
    });
    
    await this.queue.onIdle();

  }

  // Sequencia para validar um usuário
  async runSequenceValidation() {
    if (this.functionalStateService.isDetection) {
      // console.log('Detecção está desativada. Parando a sequência.');
      return;
    }
    await this.processRecognitionService.predictWebcam()
    if (this.functionalStateService.isDetection) return;  
    await this.processRecognitionService.validation()
    if (this.functionalStateService.isDetection) return;  
    await this.alertService.alert(true)
    if (this.functionalStateService.isDetection) return;  
    console.log('Todos os métodos concluídos. Reiniciando a sequência...\n')
    // await this.delay(4000)
    if (!this.functionalStateService.isAlertOpen) {
      if (this.functionalStateService.isDetection) return;  
      await this.delay(1000)
      if (this.functionalStateService.isDetection) return;  
      this.functionalStateService.animationFrameId = window.requestAnimationFrame(() => this.runSequenceValidation())
    }
  }

  // ------------------------------- Funções para parar uma detecçção e causar um atraso -------------------------------

  // Função para finalizar a detecção e desativar a câmera
  async stopDetection(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Stop Detection foi chamado!')
      this.loop = false;
      this.functionalStateService.isDetection = true
      this.cameraService.disableCam();
      if (this.functionalStateService.animationFrameId) {
        console.log('Entrei na condição do Stop Detection!')
        cancelAnimationFrame(this.functionalStateService.animationFrameId!)
        this.functionalStateService.animationFrameId = null
      }
      resolve()
    })
  }

  // Função para causar um atraso entre as etapas
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
