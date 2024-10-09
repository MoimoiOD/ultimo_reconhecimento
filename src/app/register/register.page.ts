import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from './services/register-state.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  nomeCompleto: string = ''
  modoCadastro: boolean = false

  constructor(private router: Router, private stateService: StateService) { }

  ngOnInit() {
  }

  irParaRegistroDaFace() {
    this.modoCadastro = true
    this.stateService.setNome(this.nomeCompleto)
    this.stateService.setModoCadastro(this.modoCadastro)
    this.router.navigate(['/functional']);
  }

}
