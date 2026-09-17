import { getOAuthClient, getOAuthToken } from "@celluloid/peertube-api";
import { createClient } from "@celluloid/peertube-api/client";

export interface PeerTubeTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export async function authenticatePeerTube(
  baseUrl: string,
  usernameOrEmail: string,
  password: string,
): Promise<PeerTubeTokenResponse> {
  const client = createClient({ baseUrl: baseUrl.replace(/\/$/, "") });

  const { data: oauthClient, error: clientError } = await getOAuthClient({
    client,
  });

  if (clientError || !oauthClient?.client_id || !oauthClient?.client_secret) {
    throw new Error("connection_failed");
  }

  const { data, error, response } = await getOAuthToken({
    client,
    body: {
      grant_type: "password",
      client_id: oauthClient.client_id,
      client_secret: oauthClient.client_secret,
      username: usernameOrEmail,
      password,
    },
  });

  if (error) {
    const status = response?.status;
    if (status === 400 || status === 401) {
      throw new Error("invalid_credentials");
    }
    throw new Error("connection_failed");
  }

  if (!(data?.access_token && data?.refresh_token)) {
    throw new Error("No access token in PeerTube response");
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in ?? 86_400,
    token_type: data.token_type ?? "Bearer",
  };
}

export async function refreshPeerTubeToken(
  baseUrl: string,
  refreshToken: string,
): Promise<PeerTubeTokenResponse> {
  const client = createClient({ baseUrl: baseUrl.replace(/\/$/, "") });

  const { data: oauthClient, error: clientError } = await getOAuthClient({
    client,
  });

  if (clientError || !oauthClient?.client_id || !oauthClient?.client_secret) {
    throw new Error("connection_failed");
  }

  const { data, error, response } = await getOAuthToken({
    client,
    body: {
      grant_type: "refresh_token",
      client_id: oauthClient.client_id,
      client_secret: oauthClient.client_secret,
      refresh_token: refreshToken,
    },
  });

  if (error) {
    const status = response?.status;
    if (status === 400 || status === 401) {
      throw new Error("token_expired");
    }
    throw new Error("connection_failed");
  }

  if (!(data?.access_token && data?.refresh_token)) {
    throw new Error("No access token in PeerTube refresh response");
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in ?? 86_400,
    token_type: data.token_type ?? "Bearer",
  };
}
