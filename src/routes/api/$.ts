import '@/polyfill';

import { OpenAPIGenerator } from '@orpc/openapi';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import { SmartCoercionHandlerPlugin } from '@orpc/json-schema';
import { createFileRoute } from '@tanstack/react-router';
import { onError } from '@orpc/server';
import { OpenAPIReferenceHandlerPlugin } from '@orpc/openapi/plugins';

import router from '@/orpc/router';
import { errorStatusMap } from '@/orpc/base';
import { serverRepos } from '@/server/composition';

const converters = [new ZodToJsonSchemaConverter()];
const generator = new OpenAPIGenerator({ converters });

const handler = new OpenAPIHandler(router, {
  errorStatusMap,
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
  plugins: [
    new SmartCoercionHandlerPlugin({ converters }),
    new OpenAPIReferenceHandlerPlugin({
      spec: () =>
        generator.generate(router, {
          base: {
            info: {
              title: 'TanStack ORPC Playground',
              version: '1.0.0',
            },
            security: [{ bearerAuth: [] }],
            components: {
              securitySchemes: {
                bearerAuth: {
                  type: 'http',
                  scheme: 'bearer',
                },
              },
            },
          },
        }),
      providerConfig: {
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: 'default-token',
            },
          },
        },
      },
    }),
  ],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: '/api',
    context: {
      headers: request.headers,
      repos: serverRepos,
    },
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
