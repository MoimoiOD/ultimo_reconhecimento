import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from './services/register-state.service';
import { RotaLocalRegisterService } from './services/rota-local-register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  nomeCompleto: string = ''
  modoCadastro: boolean = false
  public rotaLocalRegisterService:RotaLocalRegisterService

  constructor(private router: Router, private stateService: StateService) { 
    this.rotaLocalRegisterService = new RotaLocalRegisterService(router)
  }

  ngOnInit() {
  }

  async irParaRegistroDaFace() {
    await this.adicionarDadosNoEstadoDoComponente()
    await this.rotaLocalRegisterService.irParaRegistroDaFace()
  }
  
  async adicionarDadosNoEstadoDoComponente(): Promise<void> {
    return new Promise(resolve => {
      this.modoCadastro = true
      this.stateService.setNome(this.nomeCompleto)
      this.stateService.setModoCadastro(this.modoCadastro)
      this.nomeCompleto = ''
      this.modoCadastro = false
      resolve()
    })
  }

}
