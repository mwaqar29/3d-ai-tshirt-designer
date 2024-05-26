import express from "express";
import * as dotenv from "dotenv";
// import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc";
// import fs from "fs";
import https from "https";
import Replicate from "replicate";

dotenv.config();

const router = express.Router();

// USING REPLICATE API

async function imageUrlToBase64(imageUrl) {
  return new Promise((resolve, reject) => {
    https.get(imageUrl, (response) => {
      let chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const base64String = buffer.toString("base64");
        resolve(base64String);
      });
      response.on("error", (error) => reject(error));
    });
  });
}

router.route("/").post(async (req, res) => {
  try {
    const input = req.body;
    const MODEL_ID = "bytedance/sdxl-lightning-4step";
    const MODEL_VERSION_ID =
      "5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f";

    const replicate = new Replicate();
    const result = await replicate.run(`${MODEL_ID}:${MODEL_VERSION_ID}`, {
      input,
    });
    console.log(result);
    if (result?.length) {
      const base64String = await imageUrlToBase64(result[0]);
      res.status(200).json({
        genImgBase64: base64String,
      });
    } else {
      console.log(result);
      throw new Error("Error in generating image");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// USING CLARIFAI PACKAGE

// const PAT = process.env.PERSONAL_ACCESS_TOKEN;
// const USER_ID = "stability-ai";
// const APP_ID = "stable-diffusion-2";
// const MODEL_ID = "stable-diffusion-xl";
// const MODEL_VERSION_ID = "68eeab068a5e4488a685fc67bc7ba71e";

// const stub = ClarifaiStub.grpc();

// const metadata = new grpc.Metadata();
// metadata.set("authorization", "Key " + PAT);

// router.route("/").post((req, res) => {
//   const { prompt } = req.body;

//   stub.PostModelOutputs(
//     {
//       user_app_id: {
//         user_id: USER_ID,
//         app_id: APP_ID,
//       },
//       model_id: MODEL_ID,
//       version_id: MODEL_VERSION_ID, // This is optional. Defaults to the latest model version
//       inputs: [
//         {
//           data: {
//             text: {
//               raw: prompt,
//             },
//           },
//         },
//       ],
//     },
//     metadata,
//     (err, response) => {
//       try {
//         if (err) {
//           throw new Error(err);
//         }

//         if (response.status.code !== 10000) {
//           throw new Error(
//             "Post models failed, status: " + response.status.description
//           );
//         }
//         // Since we have one input, one output will exist here.
//         const outputBuffer = response.outputs[0].data.image.base64;

//         // const imageFilename = "gen-image.jpg";
//         // fs.writeFileSync(imageFilename, Buffer.from(output, "base64"));
//         // console.log(`Image saved as ${imageFilename}`);
//         const buffer = Buffer.from(outputBuffer);
//         const base64String = buffer.toString("base64");
//         res.status(200).json({ genImgBase64: base64String });
//       } catch (err) {
//         res.status(500).json(err);
//       }
//     }
//   );
// });

export default router;
