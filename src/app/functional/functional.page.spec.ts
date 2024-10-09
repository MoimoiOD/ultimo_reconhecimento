import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FunctionalPage } from './functional.page';

describe('FunctionalPage', () => {
  let component: FunctionalPage;
  let fixture: ComponentFixture<FunctionalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
