import {
  getJobResultsResultsJobIdGet,
  getJobStatusStatusJobIdGet,
  healthCheckHealthGet,
  startDetectionAnalysePost,
} from "@celluloid/vision-api";
import { createClient } from "@celluloid/vision-api/client";

const client = createClient({
  baseUrl: "https://vision.celluloid.me",
});

const { data } = await healthCheckHealthGet({
  client,
});

console.log("health check", data);

// const { data: analysisResponse, response } = await startDetectionAnalysePost({
//   client,
//   headers: {
//     "x-api-key": "test",
//   },
//   body: {
//     project_id: "123",
//     video_url:
//       "https://pt-storage.celluloid.cloud/web-videos/a53d2ce5-0db1-49bf-9daa-be2dafd46ee9-144.mp4",
//     callback_url: "https://example.com/callback",
//   },
// });
// console.log("analysis response", analysisResponse);
// console.log("status", response.status);

const { data: jobStatus } = await getJobStatusStatusJobIdGet({
  client,
  path: {
    job_id: "7713781c-700f-4f3a-8d28-9d33768fd430",
  },
});

console.log("job status", jobStatus);

const { data: jobResults, response } = await getJobResultsResultsJobIdGet({
  client,
  path: {
    job_id: "7713781c-700f-4f3a-8d28-9d33768fd430",
  },
});

console.log("job results", jobResults);
console.log("response", response.status);
