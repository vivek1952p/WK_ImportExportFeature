import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLandingPage } from './main-landing-page';

describe('MainLandingPage', () => {
  let component: MainLandingPage;
  let fixture: ComponentFixture<MainLandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLandingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainLandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
