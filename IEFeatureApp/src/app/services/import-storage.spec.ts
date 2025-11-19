import { TestBed } from '@angular/core/testing';

import { ImportStorage } from './import-storage';

describe('ImportStorage', () => {
  let service: ImportStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportStorage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
