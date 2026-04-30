import { openApiSpec } from "@/lib/openapi-spec";

/**
 * GET /api/docs/openapi.json
 * Serves the OpenAPI specification
 * 
 * Use with Swagger UI: https://swagger.io/tools/swagger-ui/
 * Online editor: https://editor.swagger.io/
 */
export async function GET() {
  return new Response(JSON.stringify(openApiSpec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
