import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private teste:boolean = false

  constructor(private router: Router) {}

  async irParaValidacao() {
    this.router.navigate(['/functional'])
  }

}
