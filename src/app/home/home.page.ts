import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RotaLocalHomeService } from './service/rota-local-home.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public rotaLocalHomeService:RotaLocalHomeService

  constructor(private router: Router) {
    this.rotaLocalHomeService = new RotaLocalHomeService(router)
  }

}
