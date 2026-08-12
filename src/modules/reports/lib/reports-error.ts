import axios from "axios";
import { getApiErrorMessage } from "@/lib/api-error";

export class ReportsError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ReportsError";
  }
}

export async function toReportsError(err: unknown): Promise<never> {
  if (err instanceof ReportsError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    let msg = err.message || "Request failed";
    const data = err.response?.data;
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const parsed: unknown = JSON.parse(text);
        msg = getApiErrorMessage(parsed) ?? msg;
      } catch {
        /* keep axios message */
      }
    } else {
      msg = getApiErrorMessage(data) ?? msg;
    }
    throw new ReportsError(msg, status);
  }
  if (err instanceof Error) throw new ReportsError(err.message);
  throw new ReportsError("Request failed");
}
