import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * TEMPORARY DEBUG ENDPOINT
 * Purpose: Diagnose production 404 issues for /de and /tr routes
 * TODO: Remove after issue is resolved
 */
export async function GET() {
  try {
    const cwd = process.cwd();
    
    // Check for critical files
    const fileChecks = {
      'src/app/[locale]/page.tsx': existsSync(join(cwd, 'src/app/[locale]/page.tsx')),
      'src/app/[locale]/layout.tsx': existsSync(join(cwd, 'src/app/[locale]/layout.tsx')),
      'src/app/page.tsx': existsSync(join(cwd, 'src/app/page.tsx')),
      'middleware.ts': existsSync(join(cwd, 'middleware.ts')),
      'next.config.js': existsSync(join(cwd, 'next.config.js')),
    };

    // Safe environment variables (no secrets)
    const safeEnv = {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
      NODE_ENV: process.env.NODE_ENV,
    };

    const debugInfo = {
      timestamp: new Date().toISOString(),
      runtime: {
        cwd: cwd,
        dirname: __dirname,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      environment: safeEnv,
      fileSystem: fileChecks,
      message: 'Debug endpoint - temporary for diagnosing production 404s',
    };

    return NextResponse.json(debugInfo, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'x-debug-endpoint': 'true',
      },
    });
  } catch (error) {
    // Even if there's an error, return something useful
    return NextResponse.json(
      {
        error: 'Debug endpoint error',
        message: error instanceof Error ? error.message : 'Unknown error',
        cwd: process.cwd(),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
