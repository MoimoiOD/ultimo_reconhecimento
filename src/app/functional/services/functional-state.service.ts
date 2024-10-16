import { Injectable } from '@angular/core';
import { FaceDetector, FaceLandmarker } from '@mediapipe/tasks-vision';

@Injectable({
  providedIn: 'root'
})
export class FunctionalStateService {

  private _faceDetector!: FaceDetector | null;
  private _faceLandmarker!: FaceLandmarker | null;
  private _wasmUrl: string = "../assets/files";
  private _modelAssetPath: string = "../assets/models/face_landmarker.task";
  private _faceDetectorReady: boolean = false; // Valida se a inicialização foi concluida
  private _stream!: MediaStream | null; // Stream do video
  private _video!: HTMLVideoElement | null;  // Elemento do vídeo
  private _canvas!: HTMLCanvasElement | null;  // Elemento do canvas
  private _ctx!: CanvasRenderingContext2D | null;  // Contexto do canvas
  private _animationFrameId: number | null = null; //Bloqueia os frames quando a camera é desativada
  private _nomeCompleto: string = '' // Nome completo do cadastro
  private _modoCadastro: boolean = false // Confirma a camera para usar o modo de cadastro
  private _labels = { header: ''}
  private _isDetection: boolean = false;  // Valida se a detecção de face está ativada
  private _photosBlob: Blob[] = [];
  private _isAlertOpen: boolean = false;  // Abre a janela de alerta
  private _isPositionFound: boolean = false;
  private _photos = {
    rigth: { description: 'Rosto na diagonal direita', position: 'rightDiagonal', angle: { min: 140, max: 150 }, confirm: false },
    left: { description: 'Rosto na diagonal esquerda', position: 'leftDiagonal', angle: { min: 200, max: 210 }, confirm: true },
    close: { description: 'Rosto de frente perto', position: 'closeFront', angle: { min: 0, max: 0 }, confirm: true },
    far: { description: 'Rosto de frente longe', position: 'farFront', angle: { min: 0, max: 0 }, confirm: true }
  }
  private _textLabels = {
    standard: `Reconhecimento Facil`,
    entryReleased: `Entrada Liberada`,
    entryDenied: `Entrada Negada`,
    approachRigthFace: [`Vire o rosto para a direita`, `Mais para a direita`, `Um pouco mais para a direita`],
    approachLeftFace:  [`Vire o rosto para a esquerda`, `Mais para a esquerda`,  `Um pouco mais para a esquerda`],
    approachCloseFace:  [`Aproxime seu rosto`, `Um pouco mais perto`],
    approachFarFace:  [`Afaste seu rosto`, `Um pouco mais longe`]
  }

  constructor() { }

  // Getters e Setters para faceDetector
  get faceDetector(): FaceDetector | null {
    return this._faceDetector;
  }

  set faceDetector(value: FaceDetector | null) {
    this._faceDetector = value;
  }

  // Getters e Setters para faceLandmarker
  get faceLandmarker(): FaceLandmarker | null {
    return this._faceLandmarker;
  }

  set faceLandmarker(value: FaceLandmarker | null) {
    this._faceLandmarker = value;
  }

  // Getters e Setters para wasmUrl
  get wasmUrl(): string {
    return this._wasmUrl;
  }

  set wasmUrl(value: string) {
    this._wasmUrl = value;
  }

  // Getters e Setters para modelAssetPath
  get modelAssetPath(): string {
    return this._modelAssetPath;
  }

  set modelAssetPath(value: string) {
    this._modelAssetPath = value;
  }

  // Getters e Setters para faceDetectorReady
  get faceDetectorReady(): boolean {
    return this._faceDetectorReady;
  }

  set faceDetectorReady(value: boolean) {
    this._faceDetectorReady = value;
  }

  // Getters e Setters para stream
  get stream(): MediaStream | null {
    return this._stream;
  }

  set stream(value: MediaStream | null) {
    this._stream = value;
  }

  // Getters e Setters para video
  get video(): HTMLVideoElement | null {
    return this._video;
  }

  set video(value: HTMLVideoElement | null) {
    this._video = value;
  }

  // Getters e Setters para canvas
  get canvas(): HTMLCanvasElement | null {
    return this._canvas;
  }

  set canvas(value: HTMLCanvasElement | null) {
    this._canvas = value;
  }

  // Getters e Setters para ctx
  get ctx(): CanvasRenderingContext2D | null {
    return this._ctx;
  }

  set ctx(value: CanvasRenderingContext2D | null) {
    this._ctx = value;
  }

  // Getters e Setters para animationFrameId
  get animationFrameId(): number | null {
    return this._animationFrameId;
  }

  set animationFrameId(value: number | null) {
    this._animationFrameId = value;
  }

  // Getters e Setters para nomeCompleto
  get nomeCompleto(): string {
    return this._nomeCompleto;
  }

  set nomeCompleto(value: string) {
    this._nomeCompleto = value;
  }

  // Getters e Setters para modoCadastro
  get modoCadastro(): boolean {
    return this._modoCadastro;
  }

  set modoCadastro(value: boolean) {
    this._modoCadastro = value;
  }

  // Getters e Setters para labels
  get labels() {
    return this._labels;
  }

  set labels(value: { header: string }) {
    this._labels = value;
  }

  // Getters e Setters para isDetection
  get isDetection(): boolean {
    return this._isDetection;
  }

  set isDetection(value: boolean) {
    this._isDetection = value;
  }

  // Getters e Setters para photosBlob
  get photosBlob(): Blob[] {
    return this._photosBlob;
  }

  set photosBlob(value: Blob[]) {
    this._photosBlob = value;
  }

  // Getters e Setters para isAlertOpen
  get isAlertOpen(): boolean {
    return this._isAlertOpen;
  }

  set isAlertOpen(value: boolean) {
    this._isAlertOpen = value;
  }

  // Getters e Setters para isPositionFound
  get isPositionFound(): boolean {
    return this._isPositionFound;
  }

  set isPositionFound(value: boolean) {
    this._isPositionFound = value;
  }

  // Getters e Setters para photos
  get photos() {
    return this._photos;
  }

  set photos(value: { rigth: any; left: any; close: any; far: any }) {
    this._photos = value;
  }

  get textLabels() {
    return this._textLabels;
  }

  set textLabels(value: { standard: any, entryReleased: any, entryDenied: any, approachRigthFace: any,  approachLeftFace: any, approachCloseFace: any, approachFarFace: any }) {
    this._textLabels = value;
  }
  
  reseteState() {
    this._faceDetector = null;
    this._faceLandmarker = null; // Inicialize com um novo objeto se necessário
    this._wasmUrl = "../assets/files";
    this._modelAssetPath = "../assets/models/face_landmarker.task";
    this._faceDetectorReady = false;
    this._stream = null; // Ou um novo MediaStream se necessário
    this._video = null; // Ou um novo elemento de vídeo se necessário
    this._canvas = null; // Ou um novo canvas se necessário
    this._ctx = null; // Ou um novo contexto se necessário
    this._animationFrameId = null;
    this._nomeCompleto = '';
    this._modoCadastro = false;
    this._labels = { header: '' };
    this._isDetection = false;
    this._photosBlob = [];
    this._isAlertOpen = false;
    this._isPositionFound = false;
    this._photos = {
      rigth: { description: 'Rosto na diagonal direita', position: 'rightDiagonal', angle: { min: 140, max: 150 }, confirm: false },
      left: { description: 'Rosto na diagonal esquerda', position: 'leftDiagonal', angle: { min: 200, max: 210 }, confirm: true },
      close: { description: 'Rosto de frente perto', position: 'closeFront', angle: { min: 0, max: 0 }, confirm: true },
      far: { description: 'Rosto de frente longe', position: 'farFront', angle: { min: 0, max: 0 }, confirm: true }
    };
  }

}
