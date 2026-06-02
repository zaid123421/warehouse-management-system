import axios from "axios";
import api from "@/lib/api";
import { normalizeUserMeDto } from "@/modules/user/lib/user-me-dto";
import type { UserMeProfile } from "@/modules/user/types/user-profile";

export class UserMeError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "UserMeError";
  }
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message.trim();
  return undefined;
}

/** GET /v1/users/me */
export async function getUserMe(): Promise<UserMeProfile> {
  try {
    const { data } = await api.get<unknown>("/v1/users/me");
    const profile = normalizeUserMeDto(data);
    if (!profile) {
      throw new UserMeError("Invalid user profile response");
    }
    return profile;
  } catch (err: unknown) {
    if (err instanceof UserMeError) throw err;
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new UserMeError(msg, status);
    }
    if (err instanceof Error) throw new UserMeError(err.message);
    throw new UserMeError("Request failed");
  }
}
