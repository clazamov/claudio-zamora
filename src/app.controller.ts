import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('lab')
  getLab(): { AMBIENTE: string | null; API_KEY: string | null } {
    return this.appService.getLabInfo();
  }
}
