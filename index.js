//Imports
import { TwitterApi } from "twitter-api-v2";
// import dotenv from 'dotenv';

//Environment & API Configs
// dotenv.config();

const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = client.readWrite;


async function test(){
    try {
        const mediaId = await client.v1.uploadMedia("./frames/frame_1.jpg");
        await rwClient.v2.tweet({
              text: "Testing frames from Github Actions",
              media: { media_ids: [mediaId] },
        });
        console.log("Posted Successfully!");
    } catch (error) {
        console.error("Error", e)
    }
}
test();