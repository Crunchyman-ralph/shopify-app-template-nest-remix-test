import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";
import { HealthCheck } from "./interfaces/health-check.interface";

@Controller("api/health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): HealthCheck {
    return this.healthService.check();
  }
}
