import express from "express";
import * as dotenv from "dotenv";
import { ClarifaiStub, grpc } from "clarifai-nodejs-grpc";
// import fs from "fs";

dotenv.config();

const router = express.Router();

const PAT = process.env.PERSONAL_ACCESS_TOKEN;
const USER_ID = "stability-ai";
const APP_ID = "stable-diffusion-2";
const MODEL_ID = "stable-diffusion-xl";
const MODEL_VERSION_ID = "68eeab068a5e4488a685fc67bc7ba71e";

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + PAT);

router.route("/").post((req, res) => {
  const { prompt } = req.body;

  stub.PostModelOutputs(
    {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      model_id: MODEL_ID,
      version_id: MODEL_VERSION_ID, // This is optional. Defaults to the latest model version
      inputs: [
        {
          data: {
            text: {
              raw: prompt,
            },
          },
        },
      ],
    },
    metadata,
    (err, response) => {
      try {
        if (err) {
          throw new Error(err);
        }

        if (response.status.code !== 10000) {
          throw new Error(
            "Post models failed, status: " + response.status.description
          );
        }
        // Since we have one input, one output will exist here.
        const outputBuffer = response.outputs[0].data.image.base64;

        // const imageFilename = "gen-image.jpg";
        // fs.writeFileSync(imageFilename, Buffer.from(output, "base64"));
        // console.log(`Image saved as ${imageFilename}`);
        const buffer = Buffer.from(outputBuffer);
        const base64String = buffer.toString("base64");
        res.status(200).json({ genImgBase64: base64String });
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );
});

export default router;
