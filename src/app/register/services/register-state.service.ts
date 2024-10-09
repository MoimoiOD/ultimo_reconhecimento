import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private nomeSubject = new BehaviorSubject<string>('');
  private modoCadastroSubject = new BehaviorSubject<boolean>(false);

  nome$ = this.nomeSubject.asObservable();
  modoCadastro$ = this.modoCadastroSubject.asObservable();

  setNome(nome: string) {
    this.nomeSubject.next(nome);
  }

  setModoCadastro(modo: boolean) {
    this.modoCadastroSubject.next(modo);
  }
}
