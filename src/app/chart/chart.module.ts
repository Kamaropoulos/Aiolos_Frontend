import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ChartRoutingModule } from './chart-routing.module';
import { ChartComponent } from './chart.component';

@NgModule({
  imports: [CommonModule, TranslateModule, ChartRoutingModule],
  declarations: [ChartComponent]
})
export class ChartModule {}
