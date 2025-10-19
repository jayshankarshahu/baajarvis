import { Users } from '@/models/Users';
import DbHandler from './dbHandler';
import mongoose from 'mongoose';

DbHandler.connect();

async function saveOAuthUserInfo({
    provider,
    providerUserId,
    email,
    isEmailVerified = true,
    firstName,
    lastName = "",
    profilePictureUrl
}) {

    await DbHandler.connect();

    try {

        const newUser = await Users.insertOne({
            provider,
            providerUserId,
            email,
            isEmailVerified,
            firstName,
            lastName,
            profilePictureUrl
        }, { ordered: false, limit: 1 });

        console.log('User created:', newUser);

        return {
            success: true,
            data: newUser
        };

    } catch (err) {

        console.error(`Error ${err.code} creating user`);
        console.info(err);

        if (err.code == 11000) { // 11000 error code means a duplicate key error i.e. user already exists

            const userData = await Users.findOne({email});

            return {
                success: true,
                data : userData
            };
            
        } else {
            return {
                success: false,
                error: "Something wrong happened while creating user"
            }
        }

    }

}

async function getUserById(userId) {

    const objId = new mongoose.Types.ObjectId(userId);
    
    return await Users.findOne({_id:objId});
}

export { saveOAuthUserInfo , getUserById };