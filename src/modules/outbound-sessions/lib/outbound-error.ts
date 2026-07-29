import axios from "axios";
import { getApiErrorMessage } from "@/lib/api-error";

export class OutboundError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "OutboundError";
  }
}

export function toOutboundError(err: unknown): never {
  if (err instanceof OutboundError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
    throw new OutboundError(msg, status);
  }
  if (err instanceof Error) throw new OutboundError(err.message);
  throw new OutboundError("Request failed");
}
