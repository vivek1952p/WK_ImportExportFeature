
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GridModule, PageService } from '@syncfusion/ej2-angular-grids';
import { ImportStorageService } from '../../services/import-storage';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF1cX2hIf0x0TXxbf1x1ZFRMY19bQH5PMyBoS35Rc0RjW3ZecXBVQ2ZdUU1wVEFc');

@Component({
  selector: 'app-import-view',
  standalone: true,
  imports: [CommonModule, GridModule, RouterModule],
  providers: [PageService],
  templateUrl: './import-view.html',
  styleUrls: ['./import-view.css']
})
export class ImportViewComponent implements OnInit {

  importData: any[] = [];
  columns: any[] = [];
  fileName: string = 'export';

  constructor(private route: ActivatedRoute, private importService: ImportStorageService) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const importObj = this.importService.getImportById(id);

    if (importObj) {
      this.importData = importObj.data;
      this.fileName = importObj.fileName.replace('.json', '');
      const keys = Object.keys(this.importData[0] || {});
      this.columns = keys.map(k => ({ field: k, headerText: k, width: 150 }));
    }
  }

  exportJson() {
    const json = JSON.stringify(this.importData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.fileName}-${new Date().getTime()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
