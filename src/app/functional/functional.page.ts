// face-detection.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController } from '@ionic/angular';
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
    private alert: AlertController,
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
    console.log('Tag vídeo capturado.')
    this.canvas = document.createElement('canvas') as HTMLCanvasElement; //   Cria o elemento do canvas
    console.log('Tag canvas criado e capturado.')

    this.ctx = this.canvas.getContext('2d') //   Pega o contexto do canvas
    console.log('Contexto do canvas capturado')
    this.stateService.nome$.subscribe(nomeCompleto => {
      this.nomeCompleto = nomeCompleto
      console.log(`Nome completo do registro: ${this.nomeCompleto}`)
    })
    this.stateService.modoCadastro$.subscribe(modoCadastro => {
      this.modoCadastro = modoCadastro
      console.log(`Modo de cadastro: ${this.modoCadastro}`)
    })
    this.isDetection = true // Ativa a detecção de face
    console.log(`Detecção ativada (isDetection): ${this.isDetection}`)
    this.apiConfirm = true //  Ativa a API de confirmação
    console.log(`API liberada (apiConfirm): ${this.apiConfirm}`)

    console.log('Configurações Iniciais Finalizadas!')

    this.initializeFaceDetector();
    this.initializeFaceLandmarker();
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
        console.log('Iniciado a predição de 4000 segundos')
        console.log('Primeira predição chamada!')
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
    console.log('Arquivos resolvidos do FaceDetector!')
    this.faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
        delegate: "GPU"
      },
      runningMode: 'VIDEO'
    });
    console.log('IA adicionada ao FaceDetector!')
    this.faceDetectorReady = true
    console.log('Detecção inicializada com sucesso!')
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

  async predictWebcam(): Promise<void> {
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
      console.log(`isDetection para entrar na condição para validar ou registrar: ${this.isDetection}`)
      if (detections.length > 0 && this.isDetection) {
        console.log(`Modo cadastro: ${this.modoCadastro}`)
        if (this.modoCadastro === false) {
          this.isDetection = false
          console.log(`A API fechou a detecção para processar a validação (isDetection): ${this.isDetection}`)
          this.validation(detections)
        } else {
          this.validationMultiplePhotos(detections)
        }
      } else {
        this.isDetection = false
      }
      console.log(`Está permitido a detecção com a animação de frame? ${this.isDetection}`)

      // if (this.isDetection) {
      //   this.animationFrameId = window.requestAnimationFrame(this.predictWebcam.bind(this));
      // }
    }
  }

  validation(detections: any) {
    const self = this
    console.log(`Iniciando o processo de validação/autenticação!`)
    const photoBlob = this.capturePhotoService.capturePhoto(this.canvas, this.video, this.ctx!)
    this.photoService.sendPhoto(photoBlob).subscribe({
      next: (response: teste2) => {
        console.log(`Foto enviada com sucesso para a API!`)
        self.isDetection = true
        console.log(`Detecção permitida pela API (isDetection): ${this.isDetection}`)
        if (response.match === true) {
          this.nomeValidacao = response.nome
          console.log('Validado com sucesso!')
          console.log(`Nome da pessoa que validou: ${this.nomeValidacao}`)
          this.setOpen(response.match)
        } else {
          console.log('Verificação inválida!')
          this.setOpen(response.match)
        }
      },
      error: (error) => {
        console.log('Erro ao enviar a foto para API:', error);
        this.setOpen(false)
      }
    });


  }

  validationMultiplePhotos(detections: any) {
    const photos = {
      rigth: { description: 'Rosto na diagonal direita', angle: 'rightDiagonal', confirm: false },
      left: { description: 'Rosto na diagonal esquerda', angle: 'leftDiagonal', confirm: true },
      close: { description: 'Rosto de frente perto', angle: 'closeFront', confirm: true },
      far: { description: 'Rosto de frente longe', angle: 'farFront', confirm: true }
    }

    const photosBlob: Blob[] = [];
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

  //------------------------------- Setar informações para interface com o usuário -------------------------------

  async setOpen(isOpen: boolean) {
    this.isAlertOpen = isOpen;

    console.log(`Valor de isOpen: ${isOpen}`)

    if (!isOpen) {
      // Reinicia a detecção quando o alerta é fechado
      console.log('Mostrei o alerta de que houve algum erro!')
      // Reinicia a detecção chamando predictWebcam novamente
      if (this.faceDetector && this.faceDetectorReady && !this.isDetection) {
        this.isAlertOpen = true;
        console.log(`Ativando o alerta: ${this.isAlertOpen}`)
        const predicao = setTimeout(() => {
          if (!this.isDetection) {
            this.isAlertOpen = false;
            console.log(`Fechando o alerta: ${this.isAlertOpen}`)
            this.isDetection = true;
            console.log(`Permitindo uma nova detecção, pois o alert já fechou!`)
          }
        }, 6000);
      }
      // console.log('Segunda predição chamada!')
      // this.predictWebcam();
    } else {
      console.log('Mostrei o alerta autorizando a entrada!')
      const alertTime = setTimeout(() => {
        console.log('Fechei o alerta de autorizado!')
        this.isAlertOpen = false;
        // this.setOpen(false); // Chama setOpen para reiniciar a detecção
        // clearInterval(alertTime);
      }, 5000);
    }
  }

  async runSequence() {
    while (true) {

    }
    console.log('Todos os métodos concluídos. Reiniciando a sequência...\n');
    await this.delay(2000);

  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
