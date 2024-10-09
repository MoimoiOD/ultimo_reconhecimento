import { TestBed } from '@angular/core/testing';

import { CapturePhotoService } from './capture-photo.service';

describe('CapturePhotoService', () => {
  let service: CapturePhotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapturePhotoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
