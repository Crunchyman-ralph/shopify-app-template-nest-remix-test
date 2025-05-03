import { Injectable } from "@nestjs/common";
import { HealthCheck } from "./interfaces/health-check.interface";

@Injectable()
export class HealthService {
  check(): HealthCheck {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
