import { Component, OnInit } from '@angular/core';

import { I18nService } from '@app/core';
import { LogsService } from '@app/logs.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  menuHidden = true;

  // This file is prety much the defult boilerplate header, except for the logService object.
  // We keep this here for a handy reference to the liveUpdates attribute of the LogsService,
  // so we can turn it on and off from the toggle in the header.
  constructor(private i18nService: I18nService, public logService: LogsService) {}

  ngOnInit() {}

  toggleMenu() {
    this.menuHidden = !this.menuHidden;
  }

  setLanguage(language: string) {
    this.i18nService.language = language;
  }

  get currentLanguage(): string {
    return this.i18nService.language;
  }

  get languages(): string[] {
    return this.i18nService.supportedLanguages;
  }
}
