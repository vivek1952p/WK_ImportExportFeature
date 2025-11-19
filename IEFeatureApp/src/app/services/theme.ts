import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeSubject = new BehaviorSubject<boolean>(false);
  public isDarkTheme$ = this.darkThemeSubject.asObservable();

  constructor() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme !== null) {
      this.darkThemeSubject.next(savedTheme === 'true');
    }
  }

  toggleTheme(): void {
    const newTheme = !this.darkThemeSubject.value;
    this.darkThemeSubject.next(newTheme);
    localStorage.setItem('darkTheme', newTheme.toString());
  }

  setDarkTheme(isDark: boolean): void {
    this.darkThemeSubject.next(isDark);
    localStorage.setItem('darkTheme', isDark.toString());
  }

  isDarkTheme(): boolean {
    return this.darkThemeSubject.value;
  }
}
