
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AzureUploadService{

  constructor(private http: HttpClient) {}

  getSasUrl(fileName: string) {
    return this.http.post<any>(
      'http://localhost:5203/api/sas/generate-upload-sas',
      { fileName }
    );
  }

  async uploadFileToAzure(file: File) {
    try {
      console.log('Starting Azure upload for file:', file.name);
      
      const fileName = "imports/" + Date.now() + "_" + file.name;
      console.log('Requesting SAS URL for:', fileName);
      
      const sasResponse = await firstValueFrom(
        this.getSasUrl(fileName)
      );

      if (!sasResponse || !sasResponse.uploadUrl) {
        throw new Error('Invalid SAS response: ' + JSON.stringify(sasResponse));
      }

      console.log('SAS URL received:', sasResponse.uploadUrl.split('?')[0]); // Log URL without SAS token

      const uploadUrl = sasResponse.uploadUrl;

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }

      console.log('File uploaded successfully to Azure');
      return response;
    } catch (error) {
      console.error('Azure upload error:', error);
      throw error;
    }
  }
}
