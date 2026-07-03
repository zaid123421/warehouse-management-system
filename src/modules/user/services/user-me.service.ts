import axios from "axios";
import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { normalizeUserMeDto } from "@/modules/user/lib/user-me-dto";
import type { UserMeProfile } from "@/modules/user/types/user-profile";
import { getApiErrorMessage } from "@/lib/api-error";

export class UserMeError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "UserMeError";
  }
}

/** GET /v1/users/me */
export async function getUserMe(): Promise<UserMeProfile> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.USER.ME);
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
        getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
      throw new UserMeError(msg, status);
    }
    if (err instanceof Error) throw new UserMeError(err.message);
    throw new UserMeError("Request failed");
  }
}
