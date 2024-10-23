import { Injectable } from '@angular/core';
import { FaceDetector, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { FunctionalStateService } from './functional-state.service';

@Injectable({
  providedIn: 'root'
})
export class StartRecognitionService {

  wasmUrl: string = "../assets/files";
  modelAssetPath: string = "../assets/models/face_landmarker.task";
  modelAssetPathDetector: string = "../assets/models/blaze_face_short_range.tflite";

  constructor(private functionalStateService: FunctionalStateService) { }

  async initializeFaceDetector(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(
      this.wasmUrl
    );
    console.log('Arquivos resolvidos do FaceDetector!')
    this.functionalStateService.faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: this.modelAssetPathDetector,
        delegate: "GPU"
      },
      runningMode: 'VIDEO'
    });

    return new Promise((resolve) => {
      console.log('IA adicionada ao FaceDetector!')
      this.functionalStateService.faceDetectorReady = true
      console.log('Detecção inicializada com sucesso!')
      // await this.enableCam()
      resolve()
    })

  }
  
  async initializeFaceLandmarker(): Promise<void> {
    this.functionalStateService.faceLandmarker = await FaceLandmarker.createFromOptions(
      await FilesetResolver.forVisionTasks(this.wasmUrl),
      {
        baseOptions: { modelAssetPath: this.modelAssetPath, delegate: "GPU" },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
      }
    );

    return new Promise((resolve) => {
      console.log('FaceLandMarker iniciada com sucesso!');
      resolve()
    })

  }

}
