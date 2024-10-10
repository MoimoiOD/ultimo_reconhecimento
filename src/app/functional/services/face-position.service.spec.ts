import { TestBed } from '@angular/core/testing';

import { FacePositionService } from './face-position.service';

describe('FacePositionService', () => {
  let service: FacePositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacePositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
