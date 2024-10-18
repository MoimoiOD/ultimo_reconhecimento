import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private nomeSubject = new BehaviorSubject<string>('');
  private modoCadastroSubject = new BehaviorSubject<boolean>(false);
  private resetStateSubject = new Subject<void>();

  nome$ = this.nomeSubject.asObservable();
  modoCadastro$ = this.modoCadastroSubject.asObservable();
  resetState$ = this.resetStateSubject.asObservable()

  setNome(nome: string) {
    this.nomeSubject.next(nome);
  }

  setModoCadastro(modo: boolean) {
    this.modoCadastroSubject.next(modo);
  }

  resetState() {
    this.nomeSubject.next('')
    this.modoCadastroSubject.next(false)
    this.resetStateSubject.next()
  }
}
