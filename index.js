//Imports
import { TwitterApi } from "twitter-api-v2";
import dotenv from 'dotenv';

//Environment & API Configs
dotenv.config();

const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const rwClient = client.readWrite;


//Constants
const SIDE_A_MAX_FRAME = 8410;
const SIDE_B_MAX_FRAME = 8735;
const FILM_TITLE = "Sapta Saagaradaache Ello";
const FILE_TYPE = ".png";
const MAX_TWEET = 5;
var tweetIndex = 0;

//This function gets the last tweet posted
async function getLastTweetText(){
    logger("start", "getLastTweetText");
    var previousTweetText = "";
    try{
        const user = await rwClient.v2.userByUsername("SSE_Frames");
        const tweets = await rwClient.v2.userTimeline(user.data.id, {
            max_results: 5,
            exclude: "replies",
        });
        previousTweetText = tweets.data.data?.[0].text;
        console.log("previousTweetText", previousTweetText);
    }catch(e){
        console.log("Error", e);
    }
    logger("finish", "getLastTweetText");
    return previousTweetText;
}

//Main Function
async function main(){
    logger("start", "main");
    try {
        var previousTweetText = await getLastTweetText();
        var frame = determineFrame(previousTweetText);
        while(tweetIndex < MAX_TWEET){
            var batch = determineBatch(frame);
            var side = determineSide(frame);
            var maxFrame = determineMaxFrame(side);
            var fileName = determineFileName(frame, batch, side);
            var tweetText = prepareTweetText(side, frame, maxFrame);
            console.log("fileName", fileName);
            console.log("tweetText", tweetText);
            if(isNotNull(fileName) && isNotNull(tweetText)){
                var tweetText =  tweetText;
                const mediaId = await client.v1.uploadMedia(fileName);
                await rwClient.v2.tweet({
                    text: tweetText,
                    media: { media_ids: [mediaId] },
                });
                console.log("Posted Successfully!", tweetText);  
            }
            tweetIndex++;
            frame++;
        }
    } catch (error) {
        console.error("Error", error)
    }
    logger("finish", "main");
}

//This function determines the frame to be posted
function determineFrame(previousTweet){
    logger("start", "determineFrame");
    var frame = 1;
    if(isNotNull(previousTweet)){
        var previousFrame = parseInt(previousTweet.split("Frame")[1].split("of")[0].trim() ,10);
        frame = previousFrame++;
    }
    logger("finish", "determineFrame");
    return frame;
}

//This function determines the batch in which the frame is contained
function determineBatch(frame){
    logger("start", "determineBatch");
    var batch = "batch_1";
    if(isNotNull(frame)){
        var batchNum = Math.trunc(frame/1000);
        batchNum++;
        batch = "batch_"+ batchNum;
    }
    logger("finish", "determineBatch");
    return batch;
}

//This function determines whixh Side the frame belongs
function determineSide(frame){
    logger("start", "determineSide");
    var side = "Side A";
    if(isNotNull(frame)){
        if(frame > SIDE_A_MAX_FRAME){
            side = "Side B";
        }
    }
    logger("finish", "determineSide");
    return side;
}

//This function determines the max frame based on side
function determineMaxFrame(side){
    logger("start", "determineMaxFrame");
    var maxFrame = SIDE_A_MAX_FRAME;
    if(side == "Side B")
        maxFrame = SIDE_B_MAX_FRAME;
    logger("finish", "determineMaxFrame");
    return maxFrame;
}

//This function is used to add leading zeros when the frame is less than 1000
function determineLeadingZeros(frame){
    logger("start", "determineLeadingZeros");
    var leadingZeros = 0;
    var frameStr = frame.toString();
    var frameLength = frameStr.length;
    if(frameLength < 4)
        leadingZeros = 4 - frameLength;
    logger("finish", "determineLeadingZeros");
    return leadingZeros;
}

//This function determines the ffilename from which the frame will be picked
function determineFileName(frame, batch, side){
    logger("start", "determineFileName");
    var fileName = "./frames/";
    fileName += "side-" + side.split(" ")[1].toLowerCase() + "/";
    fileName += batch + "/";
    fileName += "frame_";
    var frameName = "";
    var leadingZeros = determineLeadingZeros(frame);
    if(leadingZeros > 0){
        for(var i=0; i<leadingZeros; i++)
            frameName += "0"
        frameName += frame;
    }
    else
        frameName = frame;
    fileName += frameName + FILE_TYPE;
    logger("finish", "determineFileName");
    return fileName;
}


//This function prepares the final tweet text to be posted
function prepareTweetText(side, frame, totalFrame){
    logger("start", "prepareTweetText");
    var tweetText = FILM_TITLE;
    tweetText += " - " + side + " Frame "+ frame + " of " + totalFrame;
    logger("finish", "prepareTweetText");
    return tweetText;

}

//Utility function to check the null value
function isNotNull(value){
    if(value != "" && value != undefined && value != null)
        return true;
    else
        return false;
}
function logger(type, functionName){
    console.log("Function "+functionName+" "+type);
}

//Main function call
main();