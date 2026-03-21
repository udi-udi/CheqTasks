// Suppress NestJS logger output during tests.
// Error-path tests intentionally trigger exceptions that the production code catches
// and logs; those are expected noise, not failures. We filter at process.stderr
// rather than via Logger.overrideLogger because Jest resets the module registry
// between setupFiles and test files, which would clear the override.
//
// NestJS writes two separate stderr calls per error log:
//   1. The formatted line:  "[Nest] <pid> - ... [Context] message"  ← contains "[Nest]"
//   2. The stack trace:     "Error: ...\n  at ..."                  ← no "[Nest]"
// We use a flag to suppress both.
const stderrWrite = process.stderr.write.bind(process.stderr);
let suppressNext = false;
(process.stderr as any).write = (chunk: unknown, ...rest: unknown[]): boolean => {
  if (typeof chunk === 'string') {
    if (chunk.includes('[Nest]')) {
      suppressNext = true;
      return true;
    }
    if (suppressNext) {
      suppressNext = false;
      return true;
    }
  }
  return (stderrWrite as any)(chunk, ...rest);
};
