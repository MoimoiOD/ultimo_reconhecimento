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

  private stream!: MediaStream; // Stream do video
  private faceDetectorReady: boolean = false; // Valida se a inicialização foi concluida

  private video!: HTMLVideoElement;  // Elemento do vídeo
  private canvas!: HTMLCanvasElement;  // Elemento do canvas
  private ctx!: CanvasRenderingContext2D | null;  // Contexto do canvas
  private animationFrameId: number | null = null; //Bloqueia os frames quando a camera é desativada

  private nomeCompleto: string = '' // Nome completo do cadastro
  private modoCadastro: boolean = false // Confirma a camera para usar o modo de cadastro

  labels = { header: '', context: '' }

  private isDetection: boolean = false;  // Valida se a detecção de face está ativada

  photosBlob: Blob[] = [];


  isAlertOpen: boolean = false;  // Abre a janela de alerta

  faceLandmarker!: FaceLandmarker;
  wasmUrl: string = "../assets/files";
  modelAssetPath: string = "../assets/models/face_landmarker.task";

  private isPositionFound: boolean = false;

  photos = {
    rigth: { description: 'Rosto na diagonal direita', position: 'rightDiagonal', angle: { min: 140, max: 150 }, confirm: false },
    left: { description: 'Rosto na diagonal esquerda', position: 'leftDiagonal', angle: { min: 200, max: 210 }, confirm: true },
    close: { description: 'Rosto de frente perto', position: 'closeFront', angle: { min: 0, max: 0 }, confirm: true },
    far: { description: 'Rosto de frente longe', position: 'farFront', angle: { min: 0, max: 0 }, confirm: true }
  }

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
    console.log('Tag vídeo capturado.')
    this.canvas = document.createElement('canvas') as HTMLCanvasElement; //   Cria o elemento do canvas
    console.log('Tag canvas criado e capturado.')
    this.ctx = this.canvas.getContext('2d')
    
    if (this.ctx) {
      console.log('Contexto do canvas capturado');
    } else {
      console.error('Erro ao capturar o contexto do canvas.');
    }
    console.log('Contexto do canvas capturado')
    this.stateService.nome$.subscribe(nomeCompleto => {
      this.nomeCompleto = nomeCompleto
      console.log(`Nome completo do registro: ${this.nomeCompleto}`)
    })
    this.stateService.modoCadastro$.subscribe(modoCadastro => {
      this.modoCadastro = modoCadastro
      console.log(`Modo de cadastro: ${this.modoCadastro}`)
    })

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
      setTimeout(() => {
        console.log('Iniciado a predição de 4000 segundos')
        console.log('Primeira predição chamada!')
        this.runSequenceValidation();
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
    return new Promise((resolve) => {
      let startTimeMs = performance.now();

      if (this.video.videoWidth && this.video.videoHeight) {
        const detections = this.faceDetector!.detectForVideo(this.video, startTimeMs).detections;
        if (detections.length > 0) {
          console.log('Rosto detectado!')
          this.isDetection = true
        } else {
          console.log('Rosto não detectado!')
          this.isDetection = false
        }
        resolve()
        // console.log(`Está permitido a detecção com a animação de frame? ${this.isDetection}`)

        // if (this.isDetection) {
        //   this.animationFrameId = window.requestAnimationFrame(this.predictWebcam.bind(this));
        // }
      }
    })
  }

  async validation(): Promise<void> {
    const self = this
    console.log(`Iniciando o processo de validação/autenticação!`)

    return new Promise((resolve) => {
      const photoBlob = this.capturePhotoService.capturePhoto(this.canvas, this.video, this.ctx!)
      this.photoService.sendPhoto(photoBlob).subscribe({
        next: (response: teste2) => {
          if (response.match === true) {
            this.labels = { header: `Acesso permitido`, context: `Bem-vindo, ${response.nome}!` }
            resolve()
          } else {
            this.labels = { header: `Acesso negado`, context: `Rosto não reconhecido!` }
            resolve()
          }
        },
        error: (error) => {
          this.labels = { header: `Erro de comunicação`, context: `Falha ao enviar a foto para API.` }
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

      if (lastVideoTime !== this.video.currentTime) {
        lastVideoTime = this.video.currentTime;
        results = this.faceLandmarker.detectForVideo(this.video, Date.now());
      }

      if (results && results.faceLandmarks) {
        for (const landmarks of results.faceLandmarks) {
          if (!this.photos.rigth.confirm && this.facePositionService.identifyFacePosition(landmarks, this.photos.rigth.position, this.photos.rigth.angle)) {
            console.log('Capturando  foto do lado direito!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.canvas, this.video, this.ctx!)
            this.photosBlob.push(photoBlob)
            this.photos.rigth.confirm = true;
            this.photos.left.confirm = false;
            this.labels = { header: 'Foto cadastrada', context: 'Lado direito do rosto cadastrado!' }
            console.log('Cheguei no resolve')
            resolve()
            return;
          } else if (!this.photos.left.confirm && this.facePositionService.identifyFacePosition(landmarks, this.photos.left.position, this.photos.left.angle)) {
            console.log('Capturando  foto do lado esquerdo!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.canvas, this.video, this.ctx!)
            this.photosBlob.push(photoBlob)
            this.photos.left.confirm = true;
            this.photos.close.confirm = false;
            this.labels = { header: 'Foto cadastrada', context: 'Lado esquerdo do rosto cadastrado!' }
            resolve()
            return
          } else if (!this.photos.close.confirm && this.facePositionService.identifyFacePosition(landmarks, this.photos.close.position, this.photos.close.angle)) {
            console.log('Capturando foto de frente perto!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.canvas, this.video, this.ctx!)
            this.photosBlob.push(photoBlob)
            this.photos.close.confirm = true;
            this.photos.far.confirm = false;
            this.labels = { header: 'Foto cadastrada', context: 'Região frontal(próxima) do rosto cadastrado!' }
            resolve()
            return
          } else if (!this.photos.far.confirm && this.facePositionService.identifyFacePosition(landmarks, this.photos.far.position, this.photos.far.angle)) {
            console.log('Capturando foto de frente perto!');
            const photoBlob = this.capturePhotoService.capturePhoto(this.canvas, this.video, this.ctx!)
            this.photosBlob.push(photoBlob)
            this.photos.far.confirm = true;
            this.labels = { header: 'Foto cadastrada', context: 'Região frontal(distante) do rosto cadastrado!' }
            this.isPositionFound = true;
            resolve()
            return
          } else if (this.isPositionFound) {
            console.log("Todas as posições da face foram encontradas!")
            this.photoService.registerFace(this.nomeCompleto, this.photosBlob).subscribe({
              next: (response) => {
                console.log(response)
                this.isPositionFound = false;
              },
              error: (error) => {
                console.log(error)
                this.isPositionFound = false;
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

  //------------------------------- Setar informações para interface com o usuário -------------------------------

  async runSequence() {
    let show = true;
    while (true) {
      if (!this.photos.rigth.confirm) {
        await this.validationMultiplePhotos()
      } else if (!this.photos.left.confirm) {
        await this.alert(show)
        await this.validationMultiplePhotos()
      } else if (!this.photos.close.confirm) {
        await this.alert(show)
        await this.validationMultiplePhotos()
      } else if (!this.photos.far.confirm) {
        await this.alert(show)
        await this.validationMultiplePhotos()
      } else {
        await this.alert(show)
        await this.validationMultiplePhotos()
        show = false
        if (!this.isPositionFound) {
          this.photosBlob = []
          break
        }
      }
      console.log('Todos os métodos concluídos. Reiniciando a sequência...\n')
      await this.delay(4000)
    }
    this.runSequenceValidation()
  }

  async alert(show: boolean) {
    if(show) {
      await this.setOpen()
      await this.delay(4000)
      await this.setClose()
    }
  }

  async setOpen(): Promise<void> {
    return new Promise((resolve) => {
      this.isAlertOpen = true;
      resolve()
    })
  }

  async setClose(): Promise<void> {
    return new Promise((resolve) => {
      this.isAlertOpen = false;
      this.labels = { header: '', context: '' }
      resolve()
    })
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runSequenceValidation() {
    while (true) {

      await this.predictWebcam()
      await this.validation()
      await this.setOpen()
      await this.delay(4000);
      await this.setClose()

      console.log('Todos os métodos concluídos. Reiniciando a sequência...\n')
      await this.delay(4000)
    }

  }
}
