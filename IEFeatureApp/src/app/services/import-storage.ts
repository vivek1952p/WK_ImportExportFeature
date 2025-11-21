import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportStorageService {

  private allImports: any[] = [];
  private allLoans: any[] = [];
  private blobApiUrl = 'http://localhost:5203/api/sas';
  private loanApiUrl = 'http://localhost:5203/api/loan';

  constructor(private http: HttpClient) {}

  addImport(data: any) {
    this.allImports.push(data);
  }

  getAllImports() {
    return this.allImports;
  }

  getAllLoans() {
    return this.allLoans;
  }

  getImportById(id: number) {
    return this.allImports.find(x => x.id === id);
  }


  async loadAllData() {
    try {
      console.log('Loading all data from Azure Blob and SQL...');
      
      const [imports, loans] = await Promise.all([
        this.loadImportsFromAzure(),
        this.loadLoansFromSQL()
      ]);

      console.log(`Loaded ${imports.length} file imports and ${loans.length} loan records`);
      return { imports, loans };
    } catch (error) {
      console.error('Error loading data:', error);
      return { imports: [], loans: [] };
    }
  }


  async loadImportsFromAzure() {
    try {
      console.log('Loading file history from Azure Blob Storage...');
      
  
      const listResponse = await firstValueFrom(
        this.http.get<any>(`${this.blobApiUrl}/list-blobs`)
      );

      const blobs = listResponse.blobs || [];
      console.log(`Found ${blobs.length} files in Azure Blob Storage`);


      const imports: any[] = [];

      for (const blob of blobs) {
        try {
          const contentResponse = await firstValueFrom(
            this.http.get<any>(`${this.blobApiUrl}/get-blob-content`, {
              params: { blobName: blob.name }
            })
          );

          const importObj = {
            id: Date.now() + Math.random(),
            fileName: blob.name,
            importDate: blob.created || new Date().toLocaleString(),
            rowCount: contentResponse.rowCount || 0,
            data: contentResponse.content || []
          };

          imports.push(importObj);
          console.log(`Loaded file: ${blob.name}`);
        } catch (error) {
          console.error(`Error loading blob ${blob.name}:`, error);
        }
      }

      this.allImports = imports;
      console.log(`Successfully loaded ${imports.length} files from Azure Blob`);
      
      return imports;
    } catch (error) {
      console.error('Error loading imports from Azure:', error);
      return [];
    }
  }


  private async loadLoansFromSQL() {
    try {
      console.log('Loading loan records from SQL Server...');
      
      const response = await firstValueFrom(
        this.http.get<any>(`${this.loanApiUrl}/all`)
      );

      if (response.success && response.data) {
        console.log(`Successfully loaded ${response.count} loan records from SQL`);
        this.allLoans = response.data;
        return response.data;
      }

      console.warn('No loans found in SQL Server');
      return [];
    } catch (error) {
      console.error('Error loading loans from SQL:', error);
      return [];
    }
  }
}
