import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CapturePhotoService {

  constructor() { }

  capturePhoto(canvas: HTMLCanvasElement, video: HTMLVideoElement, ctx: CanvasRenderingContext2D): Blob {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converte o canvas para um Blob em vez de DataURL para ser enviado para a API
    const dataUrl = canvas.toDataURL('image/png');
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }
}
