// face-detection.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { FaceDetector, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { PhotoService } from './services/photo.service';
import { StateService } from '../register/services/register-state.service';
import { CapturePhotoService } from './services/capture-photo.service';
import { FacePositionService } from './services/face-position.service';

interface teste2 {
  nome: string;
  match: boolean;

}

@Component({
  selector: 'app-functional',
  templateUrl: './functional.page.html',
  styleUrls: ['./functional.page.scss']
})
export class FunctionalPage implements OnInit {
  private faceDetector!: FaceDetector | null; //Inicializa o FaceDetector

  private runningMode: string = "IMAGE"; // Modo de otimização da imagem
  private stream!: MediaStream; // Stream do video
  private faceDetectorReady: boolean = false; // Valida se a inicialização foi concluida

  private video!: HTMLVideoElement;  // Elemento do vídeo
  private canvas!: HTMLCanvasElement;  // Elemento do canvas
  private ctx!: CanvasRenderingContext2D | null;  // Contexto do canvas
  private animationFrameId: number | null = null; //Bloqueia os frames quando a camera é desativada

  private nomeCompleto: string = '' // Nome completo do cadastro
  private modoCadastro: boolean = false // Confirma a camera para usar o modo de cadastro
  nomeValidacao: string = 'Anônimo'; // Nome da pessoa que esta validando

  private isDetection: boolean = true;  // Valida se a detecção de face está ativada
  private apiConfirm: boolean = true; // Valida se a API confirma a detecção

  isAlertOpen: boolean = false;  // Abre a janela de alerta

  faceLandmarker!: FaceLandmarker;
  wasmUrl: string = "../assets/files";
  modelAssetPath: string = "../assets/models/face_landmarker.task";

  constructor(
    private router: Router, //  Instancia o Router
    private menu: MenuController, //  Instancia o MenuController
    private photoService: PhotoService, // Instancia a api de envio das fotos
    private stateService: StateService,  //  Instancia o serviço de estado
    private capturePhotoService: CapturePhotoService, // Instancia o arquivo de captura de imagem
    private facePositionService: FacePositionService
  ) { }

  async ngOnInit() {
  }

  irParaRegistro() {
    this.menu.close()
    this.router.navigate(['/register'])
  }

  sairParaHome() {
    this.router.navigate(['/home'])
  }

  ionViewWillEnter() { //  Inicia a detecção de face quando a página é carregada
    this.video = document.getElementById("webcam") as HTMLVideoElement; //  Pega o elemento do vídeo
    this.canvas = document.createElement('canvas') as HTMLCanvasElement; //   Cria o elemento do canvas

    this.ctx = this.canvas.getContext('2d') //   Pega o contexto do canvas
    this.stateService.nome$.subscribe(nomeCompleto => {
      this.nomeCompleto = nomeCompleto
    })
    console.log(this.nomeCompleto)
    this.stateService.modoCadastro$.subscribe(modoCadastro => {
      this.modoCadastro = modoCadastro
    })
    console.log(this.modoCadastro)
    this.isDetection = true // Ativa a detecção de face
    this.apiConfirm = true //  Ativa a API de confirmação

    console.log('Configurações Iniciais Finalizadas!')

    this.initializeFaceDetector();
  }

  ionViewWillLeave() {
    this.stopDetection();
  }

  async enableCam() {
    if (!this.video) return;
    if (!this.faceDetector) {
      alert("O Detector de Rostos ainda está carregando. Por favor, tente novamente.");
      return;
    }

    const self = this;
    const constraints = {
      video: true
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        self.stream = stream
        self.video.srcObject = self.stream;
      }).catch(error => {
        console.error(`Erro ao acessar a câmera ${error}`)
      });

    console.log('Câmera inicializada com sucesso!')
    if (this.faceDetector) {
      const interval = setInterval(() => {
        this.predictWebcam();
        clearInterval(interval)
      }, 4000)
    }
  }

  disableCam() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.video.srcObject = null
      console.log('Câmera desligada com sucesso!')
    }
    this.faceDetector?.close()
    this.faceDetector = null
  }

  stopDetection() {
    this.isDetection = false
    this.disableCam();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  async initializeFaceDetector() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    this.faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
        delegate: "GPU"
      },
      runningMode: 'VIDEO'
    });
    console.log('Detecção inicializada com sucesso!')
    this.faceDetectorReady = true
    await this.enableCam()

  }

  async initializeFaceLandmarker() {
    this.faceLandmarker = await FaceLandmarker.createFromOptions(
      await FilesetResolver.forVisionTasks(this.wasmUrl),
      {
        baseOptions: { modelAssetPath: this.modelAssetPath, delegate: "GPU" },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
      }
    );
    console.log('FaceLandMarker iniciada com sucesso!');
  }

  predictWebcam() {
    console.log('Iniciando predição!')
    if (!this.faceDetector || !this.faceDetectorReady) {
      console.warn("FaceDetector ainda não está pronto.");
      return;
    }
    if (!this.isDetection) {
      console.log("Detecção interrompida.");
      return;
    }
    if (this.runningMode === "IMAGE") {
      this.runningMode = "VIDEO";
      this.faceDetector!.setOptions({ runningMode: "VIDEO" });
    }

    let startTimeMs = performance.now();

    if (this.video.videoWidth && this.video.videoHeight) {
      const detections = this.faceDetector!.detectForVideo(this.video, startTimeMs).detections;
      if (detections.length > 0 && this.apiConfirm) {
        if (this.modoCadastro === false) {
          console.log('Entrei no modo validação!')
          this.apiConfirm = false
          this.validation(detections)
        } else {
          console.log('Entrei no modo registro!')
          this.validationMultiplePhotos(detections)
        }
      } else {
        console.log('Nenhum rosto detectado ou detecção parada.');
        this.isDetection = false
      }
    }
    if (this.isDetection) {
      this.animationFrameId = window.requestAnimationFrame(this.predictWebcam.bind(this));
    }
  }

  validation(detections: any) {
    const photoBlob = this.capturePhotoService.capturePhoto(this.canvas, this.video, this.ctx!)
    this.photoService.sendPhoto(photoBlob).subscribe({
      next: (response: teste2) => {
        if (response.match === true) {
          this.nomeValidacao = response.nome
          this.setOpen(response.match)
        } else {
          this.setOpen(response.match)
        }
      },
      error: (error) => {
        this.apiConfirm = true;
        this.isDetection = true;
        if (this.faceDetector && this.faceDetectorReady) {
          this.predictWebcam();
        }
        console.log('Erro ao enviar a foto:', error);
      }
    });

    console.log('Rosto detectado!')
    for (let detection of detections) {
      console.log(Math.round(detection.categories[0].score * 100))
      // this.animationFrameId = window.requestAnimationFrame(this.predictWebcam.bind(this))
    }
  }

  validationMultiplePhotos(detections: any) {
    this.initializeFaceLandmarker()

    const photos = {
      rigth: { description: 'Rosto na diagonal direita', angle: 'rightDiagonal', confirm: false },
      left: { description: 'Rosto na diagonal esquerda', angle: 'leftDiagonal', confirm: true },
      close: { description: 'Rosto de frente perto', angle: 'closeFront', confirm: true },
      far: { description: 'Rosto de frente longe', angle: 'farFront', confirm: true }
    }

    const photosBlob: Blob[] = [];
    let photoIndex = 0;
    let lastVideoTime = -1;
    let results: any = undefined;

    if (lastVideoTime !== this.video.currentTime) {
      lastVideoTime = this.video.currentTime;
      results = this.faceLandmarker.detectForVideo(this.video, Date.now());
    }

    if (results && results.faceLandmarks) {
      for (const landmarks of results.faceLandmarks) {
        if (!photos.rigth.confirm && this.facePositionService.identifyFacePosition(landmarks, 'rightDiagonal', { min: 140, max: 150 })) {
          console.log('Capturando  foto do lado direito!');
          const photoBlob = this.capturePhotoService.capturePhoto(this.canvas, this.video, this.ctx!)
          photosBlob.push(photoBlob)
          photos.rigth.confirm = true;
          photos.left.confirm = false;
          this.setOpen(true)
        } else {
          console.log('Registro finalizado!')
          console.log(photosBlob)
          this.setOpen(true)
          break
        }
      }
    }
  }

  //------------------------------- Setar informações para interface com o usuário ---------------

  async setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;

    console.log('Mostrei o alerta!')

    if (!isOpen) {
      // Reinicia a detecção quando o alerta é fechado
      this.isDetection = true;
      this.apiConfirm = true;

      // Reinicia a detecção chamando predictWebcam novamente
      if (this.faceDetector && this.faceDetectorReady) {
        const predicao = setInterval(() => {
          this.predictWebcam();
          clearInterval(predicao)
        }, 6000)
      }
    } else {
      const alertTime = setInterval(() => {
        this.isAlertOpen = false;
        this.setOpen(false); // Chama setOpen para reiniciar a detecção
        clearInterval(alertTime);
      }, 5000);
    }
  }


}
