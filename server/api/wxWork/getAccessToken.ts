import axios from "axios";

// Cache for access token
let accessToken: string | null = null;
let tokenExpiration: number = 0;

interface AccessTokenResponse {
    errcode: number;
    errmsg: string;
    access_token?: string;
    expires_in?: number;
}

export const getAccessToken = async (): Promise<string> => {
    const currentTime = Math.floor(Date.now() / 1000);

    // Return cached token if still valid (buffer of 60 seconds)
    if (accessToken && currentTime < tokenExpiration - 60) {
        return accessToken;
    }

    const corpid = process.env.COMPANY_ID;
    const secret = process.env.SECRET;
    const baseUrl = process.env.WXWORK_BASE_URL;

    if (!corpid || !secret || !baseUrl) {
        throw new Error("Missing WeChat Work environment variables");
    }

    const url = `${baseUrl}/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${secret}`;

    try {
        const { data } = await axios.get<AccessTokenResponse>(url);

        if (data.errcode !== 0) {
            throw new Error(`Failed to get access token: ${data.errmsg}`);
        }

        if (data.access_token && data.expires_in) {
            accessToken = data.access_token;
            tokenExpiration = currentTime + data.expires_in;
            return accessToken;
        } else {
            throw new Error("Invalid response from WeChat Work API");
        }
    } catch (error) {
        console.error("Error fetching access token:", error);
        throw error;
    }
};
