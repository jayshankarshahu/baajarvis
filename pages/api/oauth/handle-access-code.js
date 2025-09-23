import { GoogleTokenVerifier } from "./_idTokenHandler";
import { OAuthProviderOptions } from "@/models/Users";
import { saveOAuthUserInfo } from "@/lib/dbOperations";
import { signAuthJwt } from "../_jwtUtils";

export default async function (req, res) {

    const { code } = req.query;

    if (!code) {
        res.status(400).json({ success: false, error: "Access code not found" });
        return;
    }

    const data = {
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_DOMAIN}${process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL}`,
        grant_type: "authorization_code",
    };

    try {

        // exchange authorization code for access token & id_token
        const r = await fetch(process.env.NEXT_PUBLIC_GOOGLE_ACCESS_TOKEN_URL, {
            method: "POST",
            body: JSON.stringify(data),
        })

        const googleApiResp = await r.json();

        const { id_token } = googleApiResp;

        const insertInfo = await handleIdTokenFromGoogle(id_token);

        if (insertInfo.success) {

            const payload = { userId: insertInfo.data._id };

            const refreshToken = signAuthJwt(payload, process.env.JWT_REFRESH_SECRET_KEY, {
                expiresIn: parseInt(process.env.JWT_AUTH_TOKEN_AGE),
            });

            res.setHeader('Set-Cookie', `RefreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_TOKEN_AGE}`);

            const authtoken = signAuthJwt(payload, process.env.JWT_AUTH_SECRET_KEY, {
                expiresIn: parseInt(process.env.JWT_AUTH_TOKEN_AGE),
            });

            res.status(200).json({
                success: true,
                data: { authtoken }
            })

        } else {
            res.status(500).json({ success: false, error: insertInfo.error });
        }

    } catch (e) {

        console.log(e);
        res.status(500).json({ success: false, error: "Failed to retrieve user info" });

    }



}

/**
 * id_token is a jwt that can be read by google-client-library but we chose to do it manually so that we know what is happening
 */
async function handleIdTokenFromGoogle(id_token) {

    const tokenVerifier = new GoogleTokenVerifier(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    const tokenData = await tokenVerifier.verifyAndDecodeIdToken(id_token);

    if (!tokenData.success) {
        throw new Error(`Failed to verify token: ${tokenData.error}`);
    }

    const { payload } = tokenData;

    console.log("Decoded token data: ", payload);

    return await saveOAuthUserInfo({
        provider: OAuthProviderOptions.google,
        providerUserId: String(payload.sub),
        email: payload.email,
        isEmailVerified: payload.email_verified || false,
        firstName: payload.given_name || payload.name,
        lastName: payload.family_name || "",
        profilePictureUrl: payload.picture
    });

}

async function respondWithTokens(resp, payload) {

    console.log(process.env.JWT_AUTH_TOKEN_AGE);



}