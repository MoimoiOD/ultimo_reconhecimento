// photo.service.ts
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

interface teste {
  status_code: string;
  detail: string;
  data: {
    detail: {
      0: {
        nome: string,
        match: string
      }
    }
  };
  error: any;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
    private apiUrl = 'http://147.1.6.53:8000/face/reconhecimento_facial';// Substitua pelo seu endpoint
    private apiUrlCadastro = 'http://147.1.6.53:8000/face/cadastro'

  constructor() {}

  sendPhoto(photo: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', photo, 'photo.png');

    return from(fetch(this.apiUrl, { method: 'POST', body: formData }).then(async (response: Response) => {
      const body: teste = await response.json()
      const bodyObject = { nome: body.data.detail[0].nome, match: body.data.detail[0].match } 
      return bodyObject
    }))
  }

  registerFace(nome: string, photos: Blob[]): Observable<any> {
    const formData = new FormData();
    formData.append('name', nome)
    photos.forEach((photo, index) => {
      formData.append('files', photo, `teste_photo${index + 1}.png`)
    })
    return from(fetch(this.apiUrlCadastro, { method: 'POST', body: formData }).then(async (response: Response) => {
      console.log(response.json())
    }))
  }

}
