import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImportStorageService } from '../../services/import-storage';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPageComponent implements OnInit {

  importsList: any[] = [];
  isDarkTheme: boolean = false;

  constructor(
    private importService: ImportStorageService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadImports();
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  async loadImports() {
    try {
      await this.importService.loadImportsFromAzure();
      this.importsList = this.importService.getAllImports();
    } catch (error) {
      console.error('Error loading imports:', error);
      this.importsList = this.importService.getAllImports();
    }
  }
}
