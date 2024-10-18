import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouterService {

  constructor(private router: Router) { }

  // Rota para cadastrar um usuário
  irParaRegistro() {
    this.router.navigate(['/register']).then(() => {
      console.log('Navegação completa para register!')
    })
  }

  // Rota para voltar para o home/página principal
  sairParaHome() {
    this.router.navigate(['/home']).then(() => {
      console.log('Navegação completa para home!')
    })
  }

}
