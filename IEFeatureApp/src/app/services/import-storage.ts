
// import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
// export class ImportStorageService {
//   private imports: any[] = [];

//   addImport(record: any) {
//     this.imports.push(record);
//   }

//   getAllImports() {
//     return this.imports;
//   }

//   getImportById(id: number) {
//     return this.imports.find(x => x.id === id);
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImportStorageService {

  private allImports: any[] = [];
  private apiUrl = 'http://localhost:5203/api/sas';

  constructor(private http: HttpClient) {}

  addImport(data: any) {
    this.allImports.push(data);
  }

  getAllImports() {
    return this.allImports;
  }

  getImportById(id: number) {
    return this.allImports.find(x => x.id === id);
  }

  // Fetch all imports from Azure Blob Storage
  async loadImportsFromAzure() {
    try {
      console.log('Loading imports from Azure Blob Storage...');
      
      // Step 1: Get list of all blobs
      const listResponse = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/list-blobs`)
      );

      const blobs = listResponse.blobs || [];
      console.log(`Found ${blobs.length} blobs in Azure container`);

      // Step 2: Fetch content of each blob
      const imports: any[] = [];

      for (const blob of blobs) {
        try {
          const contentResponse = await firstValueFrom(
            this.http.get<any>(`${this.apiUrl}/get-blob-content`, {
              params: { blobName: blob.name }
            })
          );

          const importObj = {
            id: Date.now() + Math.random(), // Unique ID
            fileName: blob.name,
            importDate: blob.created || new Date().toLocaleString(),
            rowCount: contentResponse.rowCount || 0,
            data: contentResponse.content || []
          };

          imports.push(importObj);
          console.log(`Loaded import: ${blob.name}`);
        } catch (error) {
          console.error(`Error loading blob ${blob.name}:`, error);
        }
      }

      // Replace local imports with Azure imports
      this.allImports = imports;
      console.log(`Successfully loaded ${imports.length} imports from Azure`);
      
      return imports;
    } catch (error) {
      console.error('Error loading imports from Azure:', error);
      return [];
    }
  }
}
