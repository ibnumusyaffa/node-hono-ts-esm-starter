import {
  type Span,
  type SpanOptions,
  SpanStatusCode,
  trace,
} from "@opentelemetry/api"

export async function withSpan<T>(
  tracerName: string,
  spanName: string,
  options: SpanOptions,
  fn: (span: Span) => T | Promise<T>
) {
  const tracer = trace.getTracer(tracerName)
  return tracer.startActiveSpan(spanName, options, async (span: Span) => {
    try {
      const result = await fn(span)
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      })
      throw error
    } finally {
      span.end()
    }
  })
}
