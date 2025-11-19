// import { Routes } from '@angular/router';
// import { SyncTableComponent } from './components/synctable/synctable';

// export const routes: Routes = [
//   { path: '', component: SyncTableComponent },
//   { path: 'synctable', component: SyncTableComponent }
// ];
import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page';
import { ImportViewComponent } from './components/import-view/import-view';
import { MainLandingPageComponent } from './components/main-landing-page/main-landing-page';

export const routes: Routes = [
  { path: '', redirectTo: 'main-landing', pathMatch: 'full' },
  { path: 'landing', component: LandingPageComponent },
  { path: 'import/:id', component: ImportViewComponent },
  { path: 'main-landing', component: MainLandingPageComponent }

];
