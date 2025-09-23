import { getUserById } from "@/lib/dbOperations";
import { authVerificationCodes } from "@/lib/authVerificationCodes";
import { verifyAuthJwt } from "../_jwtUtils";

export default async function (req, res) {

    if (!req.headers.hasOwnProperty('authorization')) {
        res.status(401).json({ success: false, error: "Unauthorized Access" });
        return;
    }

    const [_, authToken] = req.headers['authorization'].split(' ');

    const { success, data, errorCode } = verifyAuthJwt(authToken, process.env.JWT_AUTH_SECRET_KEY);

    if (success) {

        if (!data.userId) {
            res.status(400).json({ success: false, error: "Invalid Request" });
            return;
        }

        let { email, firstName, lastName, profilePictureUrl } = await getUserById(data.userId);


        res.status(200).json({
            success: true,
            data: {
                email, firstName, lastName, profilePictureUrl
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