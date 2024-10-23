// photo.service.ts
import { Injectable } from '@angular/core';
import { from, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

interface teste {
  status_code: number;
  detail: string;
  data: [{
    nome:string,
    match:boolean,
    similaridade:number,
    limite:number
  }] | null;
  error: any;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
    private apiUrl = environment.api + '/face/reconhecimento_facial';// Substitua pelo seu endpoint
    private apiUrlCadastro = environment.api + '/face/cadastro'

  constructor() {}

  sendPhoto(photo: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', photo, 'photo.png');

    return from(fetch(this.apiUrl, { method: 'POST', body: formData }).then(async (response: Response) => {
      if(!response.ok) {
        const errorBody = await response.json()
        throw errorBody;
      }
      const body: teste = await response.json()
      if(Object.keys(body.data![0]).length === 0) {
        const bodyObject = { nome: '', match: false, detail: body.detail }
        return bodyObject
      } else {
        const bodyObject = { nome: body.data![0].nome, match: body.data![0].match } 
        return bodyObject
      }
    }).catch(async error => {
      console.log('Erro ao enviar foto:', error);
      return { nome: '', match: false, detail: error.detail || 'Erro desconhecido' };
    })
  )
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
