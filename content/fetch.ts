type QueryParamValue = boolean | number | string | null | undefined;

type FetchJsonOptions = {
  body?: BodyInit;
  headers?: HeadersInit;
  method?: string;
  searchParams?: Record<string, QueryParamValue>;
  timeoutMs: number;
  validateStatus?: (status: number) => boolean;
};

type FetchJsonResponse<T> = {
  data: T;
  headers: Headers;
  responseBody: string;
  status: number;
};

export class FetchRequestError extends Error {
  code?: string;
  cause?: unknown;
  data?: unknown;
  headers?: Headers;
  responseBody?: string;
  status?: number;

  constructor(
    message: string,
    options?: {
      cause?: unknown;
      code?: string;
      data?: unknown;
      headers?: Headers;
      responseBody?: string;
      status?: number;
    },
  ) {
    super(message);
    this.name = "FetchRequestError";
    this.code = options?.code;
    this.cause = options?.cause;
    this.data = options?.data;
    this.headers = options?.headers;
    this.responseBody = options?.responseBody;
    this.status = options?.status;
  }
}

function buildUrl(
  input: string,
  searchParams?: Record<string, QueryParamValue>,
): string {
  if (!searchParams) {
    return input;
  }

  const url = new URL(input);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === null || value === undefined) {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

function extractErrorCode(error: unknown): string | undefined {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "ETIMEDOUT";
  }

  if (error instanceof TypeError) {
    return "ERR_NETWORK";
  }

  if (error && typeof error === "object") {
    if ("code" in error && typeof error.code === "string") {
      return error.code;
    }

    if ("cause" in error) {
      return extractErrorCode(error.cause);
    }
  }

  return undefined;
}

function parseResponseBody(responseBody: string, headers: Headers): unknown {
  if (responseBody.length === 0) {
    return null;
  }

  const contentType = headers.get("content-type") ?? "";
  const trimmedBody = responseBody.trim();
  const looksLikeJson =
    trimmedBody.startsWith("{") || trimmedBody.startsWith("[");
  if (!contentType.toLowerCase().includes("json") && !looksLikeJson) {
    return responseBody;
  }

  try {
    return JSON.parse(responseBody) as unknown;
  } catch {
    return responseBody;
  }
}

export async function fetchJson<T>(
  input: string,
  options: FetchJsonOptions,
): Promise<FetchJsonResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, options.timeoutMs);

  try {
    const response = await fetch(buildUrl(input, options.searchParams), {
      body: options.body,
      headers: options.headers,
      method: options.method ?? "GET",
      signal: controller.signal,
    });
    const responseBody = await response.text();
    const data = parseResponseBody(responseBody, response.headers);
    const validateStatus =
      options.validateStatus ?? ((status) => status >= 200 && status < 300);

    if (!validateStatus(response.status)) {
      throw new FetchRequestError(
        `Request failed with status ${response.status}`,
        {
          data,
          headers: response.headers,
          responseBody,
          status: response.status,
        },
      );
    }

    return {
      data: data as T,
      headers: response.headers,
      responseBody,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof FetchRequestError) {
      throw error;
    }

    throw new FetchRequestError(
      error instanceof Error ? error.message : "Request failed",
      {
        cause: error,
        code: extractErrorCode(error),
      },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
