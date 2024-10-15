import { Injectable } from '@angular/core';
import { FunctionalStateService } from './functional-state.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private functionalStateService: FunctionalStateService) { }

  async alert(show: boolean) {
    if (show) {
      await this.setOpen()
      await this.delay(4000)
      await this.setClose()
    }
  }

  async setOpen(): Promise<void> {
    return new Promise((resolve) => {
      this.functionalStateService.isAlertOpen = true;
      resolve()
    })
  }

  async setClose(): Promise<void> {
    return new Promise((resolve) => {
      this.functionalStateService.isAlertOpen = false;
      this.functionalStateService.labels = { header: '', context: '' }
      resolve()
    })
  }

  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
