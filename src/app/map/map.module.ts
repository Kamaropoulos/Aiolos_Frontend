import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { MapRoutingModule } from './map-routing.module';
import { MapComponent } from './map.component';

@NgModule({
  imports: [CommonModule, TranslateModule, MapRoutingModule],
  declarations: [MapComponent]
})
export class MapModule {}
