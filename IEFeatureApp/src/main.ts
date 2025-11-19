import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import {registerLicense} from '@syncfusion/ej2-base';
registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF1cX2hIf0x0TXxbf1x1ZFRMY19bQH5PMyBoS35Rc0RjW3ZecXBVQ2ZdUU1wVEFc');


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
