import { ApiClient } from "@core/playwright-framework";

export interface MeResponse {
  username: string;
  role: string;
}

export interface PartyRecord {
  id: string;
  name?: string;
  province?: string;
}

/**
 * App API on top of the core client. Same cookies as the browser.
 */
export class PortalApi {
  constructor(private readonly api: ApiClient) {}

  async me(): Promise<MeResponse> {
    return this.api.json<MeResponse>(await this.api.get("/api/me"));
  }

  async listParties(): Promise<PartyRecord[]> {
    return this.api.json<PartyRecord[]>(await this.api.get("/api/parties"));
  }

  async createParty(data: { name: string; province: string }): Promise<PartyRecord> {
    return this.api.json<PartyRecord>(await this.api.post("/api/party", data));
  }

  async vendorStatus(): Promise<{ status: string }> {
    return this.api.json<{ status: string }>(await this.api.get("/api/vendor/status"));
  }
}
