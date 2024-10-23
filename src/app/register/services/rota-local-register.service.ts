import { Injectable, resolveForwardRef } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RotaLocalRegisterService {

  constructor(private router:Router) { }

  async irParaRegistroDaFace(): Promise<void> {
    return new Promise(resolve => {
      this.router.navigate(['/functional']);
      resolve()
    })
  }

}
