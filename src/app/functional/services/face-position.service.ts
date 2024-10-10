import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FacePositionService {

  constructor() { }

  identifyFacePosition(landmarks: any, direction: string, angleRange: { min: number, max: number }): boolean {
    // Supondo que "detections" contenha as landmarks do rosto
    const leftEye = landmarks[263];  // Ponto do olho esquerdo
    const rightEye = landmarks[33];  // Ponto do olho direito  

    const dx = rightEye.x - leftEye.x;
    const dz = (rightEye.z || 0) - (leftEye.z || 0); // Supondo que Z pode ser undefined

    // Calcular o ângulo no plano XZ
    let angle = Math.atan2(dz, dx);
    // Converter para graus
    let angleInDegrees = angle * (180 / Math.PI);

    // Normalizar o ângulo para ser positivo
    if (angleInDegrees < 0) {
      angleInDegrees = 360 + angleInDegrees;
    }

    // Distância euclidiana entre os olhos
    const faceWidth = Math.sqrt(
      Math.pow(leftEye.x - rightEye.x, 2) + Math.pow(leftEye.y - rightEye.y, 2)
    );

    console.log(`Ângulo calculado no plano XZ: ${angleInDegrees.toFixed(2)} graus, direção: ${direction}`);

    if (direction === 'rightDiagonal') {
      // Verifica se a inclinação está para a direita no intervalo especificado
      if (angleInDegrees >= angleRange.min && angleInDegrees <= angleRange.max) {
        console.log(`Inclinação correta para a direita! Dentro do range: ${angleRange.min}° a ${angleRange.max}°`);
        return true;
      } else {
        // console.log(`Inclinação incorreta para a direita! Fora do range: ${angleRange.min}° a ${angleRange.max}°`);
        return false;
      }
    } else if (direction === 'leftDiagonal') {
      // Verifica se a inclinação está para a esquerda (ajustar os ângulos)
      if (angleInDegrees >= angleRange.min && angleInDegrees <= angleRange.max) {
        console.log(`Inclinação correta para a esquerda! Dentro do range: ${angleRange.min}° a ${angleRange.max}°`);
        return true;
      } else {
        // console.log(`Inclinação incorreta para a esquerda! Fora do range: ${angleRange.min}° a ${angleRange.max}°`);
        return false;
      }
    } else if (direction === 'closeFront') {
      console.log('Rosto próximo capturado!');
      return faceWidth < 0.3; // Limite para rosto próximo
    } else if (direction === 'farFront') {
      console.log('Rosto distante capturado!');
      return faceWidth < 0.15; // Limite para rosto distante
    }
    return false;
  }

}
