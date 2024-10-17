import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FacePositionService {

  constructor() { }

  identifyFacePosition(landmarks: any, direction: string, angleRange: { min: number, max: number }): boolean {
    const leftEye = landmarks[263];  
    const rightEye = landmarks[33];  

    const dx = rightEye.x - leftEye.x;
    const dz = (rightEye.z || 0) - (leftEye.z || 0);

    let angle = Math.atan2(dz, dx);
    let angleInDegrees = angle * (180 / Math.PI);

    if (angleInDegrees < 0) {
      angleInDegrees = 360 + angleInDegrees;
    }

    const faceWidth = Math.sqrt(
      Math.pow(leftEye.x - rightEye.x, 2) + Math.pow(leftEye.y - rightEye.y, 2)
    );

    console.log(`Ângulo calculado no plano XZ: ${angleInDegrees.toFixed(2)} graus, direção: ${direction}`);

    if (direction === 'rightDiagonal') {
      if (angleInDegrees >= angleRange.min && angleInDegrees <= angleRange.max) {
        console.log(`Inclinação correta para a direita! Dentro do range: ${angleRange.min}° a ${angleRange.max}°`);
        return true;
      } else {
        console.log(`Inclinação incorreta para a direita! Dentro do range: ${angleRange.min}° a ${angleRange.max}°`);
        return false;
      }
    } else if (direction === 'leftDiagonal') {
      if (angleInDegrees >= angleRange.min && angleInDegrees <= angleRange.max) {
        console.log(`Inclinação correta para a esquerda! Dentro do range: ${angleRange.min}° a ${angleRange.max}°`);
        return true;
      } else {
        return false;
      }
    } else if (direction === 'closeFront') {
      console.log(faceWidth)
      if(faceWidth > 0.15 && faceWidth < 0.2) {
        console.log('Rosto próximo capturado!');
        return true;
      } else {
        console.log('Rosto próximo não capturado!');
        return false
      }
    } else if (direction === 'farFront') {
      if(faceWidth > 0.1 && faceWidth < 0.13) {
        console.log('Rosto distante capturado!');
        return true;
      } else {
        console.log('Rosto distante não capturado!');
        return false
      }
    }
    console.log('Posição indefinida!')
    return false;
  }

}
