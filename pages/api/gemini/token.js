import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      const client = new GoogleGenAI({});
      const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        const AuthToken = await client.authTokens.create({
          config: {
            uses: 1, // The default
            expireTime: expireTime ,// Default is 30 mins
            newSessionExpireTime: new Date(Date.now() + (1 * 60 * 1000)), // Default 1 minute in the future
            httpOptions: {apiVersion: 'v1alpha'},
          },
        });
      res.status(200).json({ token: AuthToken.name, expireTime: expireTime });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
  