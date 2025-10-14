import { verify } from 'jsonwebtoken';
import { getUserById } from "@/lib/dbOperations";
import authVerificationCodes from "@/lib/authVerificationCodes";
import { revokeAuthJwt, verifyAuthJwt , signAuthJwt } from '../_jwtUtils';

export default async function (req, res) {

    if (!req.cookies.hasOwnProperty('RefreshToken')) {
        res.status(400).json({ success: false, error: "Bad Request" });
        return;
    }

    const refreshToken = req.cookies['RefreshToken'];

    const { success, data, errorCode } = verifyAuthJwt(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);

    if (success) {

        console.log("Refresh token decoded data :" , data);

        if (!data.userId) {
            res.status(400).json({ success: false, error: "Invalid Request" , errorCode });
            return;
        }

        revokeAuthJwt(data);

        const payload = { userId: data.userId };

        // creating and setting refresh token
        const refreshToken = signAuthJwt(payload, process.env.JWT_REFRESH_SECRET_KEY, {
            expiresIn: parseInt(process.env.JWT_AUTH_TOKEN_AGE),
        });

        res.setHeader('Set-Cookie', `RefreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_TOKEN_AGE}`);

        //creating and setting auth token
        const authtoken = signAuthJwt(payload, process.env.JWT_AUTH_SECRET_KEY, {
            expiresIn: parseInt(process.env.JWT_AUTH_TOKEN_AGE),
        });

        let { email, firstName, lastName, profilePictureUrl } = await getUserById(data.userId);

        res.status(200).json({
            success: true,
            data: {
                authtoken,
                userData : { email, firstName, lastName, profilePictureUrl }
            }
        });

    } else {

        if (
            errorCode == authVerificationCodes.TOKEN_EXPIRED ||
            errorCode == authVerificationCodes.TOKEN_REVOKED ||
            errorCode == authVerificationCodes.INVALID_TOKEN
        ) {

            console.log(errorCode);

            res.status(401).json({
                success: false,
                error: "Unauthorized Access",
                errorCode
            });

        } else {

            res.status(500).json({
                success: false,
                error: "Something bad happened",
                errorCode
            });

        }

    }


}