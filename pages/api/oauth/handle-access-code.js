import { GoogleTokenVerifier } from "./_idTokenHandler";

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

    // exchange authorization code for access token & id_token
    await fetch(process.env.NEXT_PUBLIC_GOOGLE_ACCESS_TOKEN_URL, {
        method: "POST",
        body: JSON.stringify(data),
    }).then(r => r.json())
    .then( async googleApiResp => {

        const {id_token} = googleApiResp;
        handleIdTokenFromGoogle(id_token);

    })
    .catch( e => {
        console.error(e);
    });

}

/**
 * id_token is a jwt that can be read by google-client-library but we chose to do it manually so that we know what is happening
 */
async function handleIdTokenFromGoogle( id_token ) {
    
    const tokenVerifier = new GoogleTokenVerifier(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    const decodedTokenData = await tokenVerifier.verifyAndDecodeIdToken(id_token);

    console.log( "Decoded token data: ", decodedTokenData);
    

}