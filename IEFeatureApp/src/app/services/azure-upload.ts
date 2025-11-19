
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AzureUploadService {

  private importApiUrl = 'http://localhost:5203/api/import/upload';

  constructor(private http: HttpClient) {}

  async uploadFileThroughApi(file: File) {
    try {
      console.log('Uploading file via Import API:', file.name);

      const formData = new FormData();
      formData.append('file', file, file.name);

      const response = await firstValueFrom(
        this.http.post<any>(this.importApiUrl, formData)
      );

      console.log('Import API response:', response);
      return response;
    } catch (error) {
      console.error('Import API upload error:', error);
      throw error;
    }
  }
}
