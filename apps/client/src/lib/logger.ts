import { datadogLogs } from "@datadog/browser-logs";
import { ENVIRONMENT, VERSION, DD_CLIENT_TOKEN } from "../env";

datadogLogs.init({
  clientToken: DD_CLIENT_TOKEN,
  site: "datadoghq.com",
  service: "client",
  env: ENVIRONMENT,
  version: VERSION,
  forwardErrorsToLogs: true,
  sampleRate: 100,
});

export default datadogLogs.logger;
