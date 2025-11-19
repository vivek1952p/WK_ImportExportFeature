import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AzureUploadService } from './azure-upload';

describe('AzureUploadService', () => {
  let service: AzureUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AzureUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
