import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GridModule, PageService, GridComponent, SortService, FilterService } from '@syncfusion/ej2-angular-grids';
import { ImportStorageService } from '../../services/import-storage';
import { AzureUploadService } from '../../services/azure-upload';
import { ThemeService } from '../../services/theme';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF1cX2hIf0x0TXxbf1x1ZFRMY19bQH5PMyBoS35Rc0RjW3ZecXBVQ2ZdUU1wVEFc');

@Component({
  selector: 'app-main-landing-page',
  standalone: true,
  imports: [CommonModule, GridModule, RouterModule],
  providers: [PageService, SortService, FilterService],
  templateUrl: './main-landing-page.html',
  styleUrls: ['./main-landing-page.css']
})
export class MainLandingPageComponent implements OnInit {

  @ViewChild('grid') grid?: GridComponent;

  allRows: any[] = [];
  allLoans: any[] = [];
  isDarkTheme: boolean = false;

  requiredHeaders = ["LoanID", "AccountNumber", "CustomerName", "LoanType", "LoanAmount", "InterestRate", "Branch"];

  constructor(
    private storage: ImportStorageService,
    private azureService: AzureUploadService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadAllData();

    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  async loadAllData() {
    try {
      await this.storage.loadAllData();
      this.loadAllImportedRows();
      this.allLoans = this.storage.getAllLoans();
    } catch {
      this.loadAllImportedRows();
    }
  }

  loadAllImportedRows() {
    const imports = this.storage.getAllImports();
    this.allRows = imports.flatMap((imp: any) =>
      imp.data.map((row: any, index: number) => ({
        sno: 0,
        ...row,
        sourceFile: imp.fileName
      }))
    );

    this.allRows = this.allRows.map((row, index) => ({
      ...row,
      sno: index + 1
    }));
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      let jsonData;

      try {
        jsonData = JSON.parse(text);
      } catch {
        alert("Invalid JSON file.");
        return;
      }

      if (!Array.isArray(jsonData)) {
        alert("JSON must be an array.");
        return;
      }

      const firstRow = jsonData[0];
      const jsonKeys = Object.keys(firstRow);

      const missing = this.requiredHeaders.filter(h => !jsonKeys.includes(h));
      if (missing.length > 0) {
        alert("Missing keys: " + missing.join(", "));
        return;
      }

      const existingLoanIDs = new Set(this.allRows.map(r => r.LoanID));
      const duplicates: any[] = [];

      jsonData.forEach((row: any) => {
        if (existingLoanIDs.has(row.LoanID)) duplicates.push(row.LoanID);
      });

      if (duplicates.length > 0) {
        alert("Duplicate Loan IDs: " + duplicates.join(", "));
        return;
      }

      const apiResponse = await this.azureService.uploadFileThroughApi(file);

      await this.loadAllData();
      if (this.grid) this.grid.refresh();

      alert(`Imported successfully. Inserted: ${apiResponse?.insertedRows ?? 0}`);

      event.target.value = "";

    } catch (err: any) {
      alert("Error uploading file: " + (err?.message || "Unknown error"));
      event.target.value = "";
    }
  }

  exportToJson() {
    if (this.allRows.length === 0) {
      alert('No data to export.');
      return;
    }

    const exportData = this.allRows.map(row => {
      const { sno, sourceFile, ...clean } = row;
      return clean;
    });

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `all-loan-records-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
