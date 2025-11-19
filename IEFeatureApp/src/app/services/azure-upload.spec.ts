import { TestBed } from '@angular/core/testing';

import { AzureUpload } from './azure-upload';

describe('AzureUpload', () => {
  let service: AzureUpload;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AzureUpload);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
