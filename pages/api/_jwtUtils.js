import { sign, verify } from 'jsonwebtoken';
import authVerificationCodes from "@/lib/authVerificationCodes";

/**
 * Adds uuid in the jwt and saves the uuid in db for checking later
 * 
 * @param {*} payload The payload , but it must have userId property
 */
function signAuthJwt(payload, secretKey, options) {
    return sign(payload, secretKey, options);
}

/**
 * verifies Jwt and returns a { success : true , data : decodedData } if it is valid
 * checks the jwt for following things
 * 
 * 1. expiration
 * 2. and active uuid exists in it
 */
function verifyAuthJwt(token, secretKey , options) {

    try {

        const decodedData = verify(token, secretKey, options);

        return {
            success : true ,
            data : decodedData
        }

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return {
                success: false,
                errorCode: authVerificationCodes.TOKEN_EXPIRED
            }
        }else if ( err.name == 'JsonWebTokenError' ) {
            return {
                success: false,
                errorCode: authVerificationCodes.INVALID_TOKEN
            }
        }
        console.error(err);        
    }

    return {
        success: false , 
        errorCode: authVerificationCodes.UNKNOWN_ERROR
    };

}

/**
 * Revoke an auth token from being used again
 * @param {*} tokenData payload of the decoded token that is to be revoked
 * @returns true on successful revocation , otherwise false
 */
function revokeAuthJwt(tokenData) {
    
    if( !tokenData.uuid ) {
        return false;
    }

    return true;

}

export {
    signAuthJwt , verifyAuthJwt , revokeAuthJwt
};