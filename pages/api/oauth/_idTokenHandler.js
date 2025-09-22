import { decode, verify } from 'jsonwebtoken';
import NodeCache from 'node-cache';
import {createPublicKey} from 'node:crypto';

const keyCache = new NodeCache();

export class GoogleTokenVerifier {

    constructor(clientId) {
        this.clientId = clientId;
        this.googleCertsUrl = process.env.NEXT_PUBLIC_GOOGLE_CERTS_URL;
    }

    // Reads the headers from the resolved value of the return value of fetch and finds expiry time from it
    async getExpiryTimeFromHeaders(response) {

        const cacheControlHeader = response.headers.get('Cache-Control');
        let maxAge = -1; // Default value if max-age is not found

        if (cacheControlHeader) {
            const matches = cacheControlHeader.match(/max-age=(\d+)/);
            if (matches && matches[1]) {
                maxAge = parseInt(matches[1], 10);
            }
        }

        return maxAge;

    }


    /**
     * Fetch Google's public keys from JWKS endpoint
     */
    async getGooglePublicKeys() {
        // Check cache first
        const cachedKeys = keyCache.get('google-public-keys');
        if (cachedKeys) {
            return cachedKeys;
        }

        try {
            const response = await fetch(this.googleCertsUrl);

            const responseJson = await response.json();

            console.log(responseJson);

            const keys = {};

            // Convert JWK format to PEM format for each key
            for (const key of responseJson.keys) {
                const publicKey = this.jwkToPem(key);
                keys[key.kid] = publicKey;
            }

            const expirationTime = await this.getExpiryTimeFromHeaders(response);
            // Cache the keys
            keyCache.set('google-public-keys', keys , expirationTime);
            return keys;

        } catch (error) {
            throw new Error(`Failed to fetch Google public keys: ${error.message}`);
        }

    }

    /**
     * Convert JWK to PEM format
     */
    jwkToPem(jwk) {

        if (jwk.kty !== 'RSA') {
            throw new Error('Only RSA keys are supported');
        }

        // Decode base64url encoded values
        const n = Buffer.from(jwk.n, 'base64url');
        const e = Buffer.from(jwk.e, 'base64url');

        // Create public key object
        const publicKey = createPublicKey({
            key: {
                kty: 'RSA',
                n: n.toString('base64'),
                e: e.toString('base64')
            },
            format: 'jwk'
        });

        return publicKey.export({ type: 'spki', format: 'pem' });
    }

    /**
     * Verify Google ID Token manually
     */
    async verifyAndDecodeIdToken(idToken) {
        try {
            // Decode token without verification to get header
            const decodedHeader = decode(idToken, { complete: true });

            if (!decodedHeader) {
                throw new Error('Invalid token format');
            }

            // Get the key ID from header
            const kid = decodedHeader.header.kid;
            if (!kid) {
                throw new Error('Token missing key ID (kid)');
            }

            // Fetch Google's public keys
            const publicKeys = await this.getGooglePublicKeys();

            if (!publicKeys[kid]) {
                throw new Error(`Public key not found for kid: ${kid}`);
            }

            // Verify the token
            const decoded = verify(idToken, publicKeys[kid], {
                algorithms: ['RS256'],
                issuer: ['https://accounts.google.com', 'accounts.google.com'],
                audience: this.clientId
            });

            // Additional claim validations
            this.validateClaims(decoded);

            return {
                success: true,
                payload: decoded,                
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate additional claims
     */
    validateClaims(payload) {
        const now = Math.floor(Date.now() / 1000);

        // Check expiration
        if (!payload.exp || payload.exp < now) {
            throw new Error('Token has expired');
        }

        // Check issued at time (should not be in future)
        if (payload.iat && payload.iat > now + 300) { // Allow 5 min clock skew
            throw new Error('Token issued in the future');
        }

        // Check subject exists
        if (!payload.sub) {
            throw new Error('Token missing subject (sub) claim');
        }

        // Validate audience matches your client ID
        if (payload.aud !== this.clientId) {
            throw new Error('Token audience does not match client ID');
        }

        // Validate issuer
        const validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
        if (!validIssuers.includes(payload.iss)) {
            throw new Error('Invalid issuer');
        }
    }

}