import axios from "axios";
import { getApiErrorMessage } from "@/lib/api-error";

export class InboundError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "InboundError";
  }
}

export function toInboundError(err: unknown): never {
  if (err instanceof InboundError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
    throw new InboundError(msg, status);
  }
  if (err instanceof Error) throw new InboundError(err.message);
  throw new InboundError("Request failed");
}
