import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RotaLocalHomeService {

  constructor(private router:Router) { }

  async irParaValidacao() {
    this.router.navigate(['/functional'])
  }
}
