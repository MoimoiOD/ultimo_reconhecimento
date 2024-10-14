import { TestBed } from '@angular/core/testing';

import { StartRecognitionService } from './start-recognition.service';

describe('StartRecognitionService', () => {
  let service: StartRecognitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StartRecognitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
