import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GridModule, PageService, GridComponent } from '@syncfusion/ej2-angular-grids';
import { ImportStorageService } from '../../services/import-storage';
import { AzureUploadService } from '../../services/azure-upload';
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1JFaF1cX2hIf0x0TXxbf1x1ZFRMY19bQH5PMyBoS35Rc0RjW3ZecXBVQ2ZdUU1wVEFc');

@Component({
  selector: 'app-main-landing-page',
  standalone: true,
  imports: [CommonModule, GridModule, RouterModule],
  providers: [PageService],
  templateUrl: './main-landing-page.html',
  styleUrls: ['./main-landing-page.css']
})
export class MainLandingPageComponent implements OnInit {

  @ViewChild('grid') grid?: GridComponent;

  allRows: any[] = [];
  allLoans: any[] = [];

  requiredHeaders = ["LoanID", "AccountNumber", "CustomerName", "LoanType", "LoanAmount", "InterestRate", "Branch"];

  constructor(
    private storage: ImportStorageService,
    private azureService: AzureUploadService
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  // Load all data from both Azure Blob (file history) and SQL (loans)
  async loadAllData() {
    try {
      console.log('Loading all data from Azure Blob and SQL...');
      const data = await this.storage.loadAllData();
      
      // Data from blob storage (file history)
      this.loadAllImportedRows();
      
      // Data from SQL (loan records)
      this.allLoans = this.storage.getAllLoans();
      
      console.log(`Loaded ${this.allRows.length} rows from imports and ${this.allLoans.length} loans from SQL`);
    } catch (error) {
      console.error('Error loading data:', error);
      this.loadAllImportedRows();
    }
  }

  // Load and add serial number
  loadAllImportedRows() {
    const imports = this.storage.getAllImports();

    this.allRows = imports.flatMap((imp: any) =>
      imp.data.map((row: any, index: number) => ({
        sno: 0, // Will fill later
        ...row,
        sourceFile: imp.fileName
      }))
    );

    // Add auto increment serial numbers
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

      // 1️⃣ Parse JSON
      try {
        jsonData = JSON.parse(text);
      } catch {
        alert("❌ Invalid JSON file.");
        return;
      }

      if (!Array.isArray(jsonData)) {
        alert("❌ JSON must be an array of objects.");
        return;
      }

      // 2️⃣ Validate required headers
      const firstRow = jsonData[0];
      const jsonKeys = Object.keys(firstRow);

      const missing = this.requiredHeaders.filter(h => !jsonKeys.includes(h));

      if (missing.length > 0) {
        alert("❌ Invalid JSON structure.\nMissing keys: " + missing.join(", "));
        return;
      }

      // 3️⃣ DUPLICATE LOAN ID CHECK
      const existingLoanIDs = new Set(this.allRows.map(r => r.LoanID));
      const duplicateLoanIds: any[] = [];

      jsonData.forEach((row: any) => {
        if (existingLoanIDs.has(row.LoanID)) {
          duplicateLoanIds.push(row.LoanID);
        }
      });

      if (duplicateLoanIds.length > 0) {
        alert("❌ Duplicate Loan IDs found:\n" + duplicateLoanIds.join(", "));
        return; // STOP — DO NOT UPLOAD
      }

      // 4️⃣ Send file to backend so API can upload + import
      const apiResponse = await this.azureService.uploadFileThroughApi(file);
      console.log("API import completed:", apiResponse);

      // 5️⃣ Reload imports + SQL data from backend
      await this.loadAllData();

      if (this.grid) this.grid.refresh();

      const inserted = apiResponse?.insertedRows ?? 0;
      const successMsg = apiResponse?.message || "File imported successfully!";
      alert(`✅ ${successMsg}\n${inserted} records saved to SQL.`);

      event.target.value = "";

    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.error?.error || err?.message || "Unknown error";
      alert("❌ Error uploading file: " + errorMessage);
      event.target.value = "";
    }
  }
}
