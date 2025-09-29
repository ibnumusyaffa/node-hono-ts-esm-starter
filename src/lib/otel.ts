import { context, propagation, SpanStatusCode, trace } from "@opentelemetry/api"
import type { Span, SpanOptions } from "@opentelemetry/api"

export async function withSpan<T>(
  tracerName: string,
  spanName: string,
  options: SpanOptions,
  fn: (span: Span) => T | Promise<T>
): Promise<T>
export async function withSpan<T>(
  tracerName: string,
  spanName: string,
  fn: (span: Span) => T | Promise<T>
): Promise<T>
export async function withSpan<T>(
  tracerName: string,
  spanName: string,
  optionsOrFn: SpanOptions | ((span: Span) => T | Promise<T>),
  fn?: (span: Span) => T | Promise<T>
) {
  const tracer = trace.getTracer(tracerName)

  const hasOptions = typeof optionsOrFn !== "function"
  const options = hasOptions ? optionsOrFn : undefined
  const callback = hasOptions ? fn : optionsOrFn

  if (!callback) {
    throw new Error("Callback function is missing")
  }

  const activeSpanFn = async (span: Span) => {
    try {
      const result = await callback(span)
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
  }

  if (options) {
    return tracer.startActiveSpan(spanName, options, activeSpanFn)
  }

  return tracer.startActiveSpan(spanName, activeSpanFn)
}

export type Carrier = {
  traceparent?: string
  tracestate?: string
}

export function getCurrentTraceparent(): Carrier | undefined {
  try {
    const headers: Record<string, string> = {}
    propagation.inject(context.active(), headers)
    return headers
  } catch (error) {
    return undefined
  }
}
