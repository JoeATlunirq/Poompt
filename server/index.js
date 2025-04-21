// Basic Express server for audio upload and Google Speech-to-Text
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// --- GCLOUD_KEY_BASE64 support ---
if (process.env.GCLOUD_KEY_BASE64 && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const keyPath = '/tmp/gcloud-key.json';
  const keyData = Buffer.from(process.env.GCLOUD_KEY_BASE64, 'base64').toString('utf8');
  fs.writeFileSync(keyPath, keyData);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
  console.log('[GCloud] Wrote credentials to', keyPath);
}

const app = express();
const port = process.env.PORT || 5005;
const upload = multer({ dest: 'uploads/' });
app.use(cors());

// Google Cloud credentials should be set via GOOGLE_APPLICATION_CREDENTIALS env var
const speechClient = new SpeechClient();

const SYSTEM_PROMPTS = {
  cursor: `You are refining a spontaneous, unstructured developer transcript into a clean, structured, and detailed prompt specifically optimized for Cursor’s AI coding model. Include **only** the technical context, explicit coding instructions, step-by-step tasks, and strictly relevant details from the input. **Do not add any extra information, explanations, or commentary beyond clarifying the raw input itself.**\n\nRaw Input:\n{RAW_PROMPT}\n\nExpected output:\n- Clear task summary\n- Step-by-step instructions (numbered clearly)\n- Relevant technologies/frameworks (only if mentioned or directly implied)\n- Explicit technical requirements or constraints (if any mentioned)\n\nRespond strictly with the refined prompt only—no introduction or closing comments.`,
  windsurf: `You must distill the provided raw developer input into a precise, minimal, and actionable prompt optimized for the Windsurf AI coding model. Include **only essential technical details and explicitly stated tasks** from the raw input. Omit all extraneous or unrelated context. Use concise, direct instructions suitable for rapid interpretation by Windsurf.\n\nRaw Input:\n{RAW_PROMPT}\n\nExpected output:\n- Single-sentence task objective\n- Brief bullet-point action list (maximum 5 points)\n- Short code snippet or pseudocode (only if explicitly required)\n\nRespond strictly with the refined prompt only—no additional commentary before or after.`,
  v0: `Convert the given developer input into a structured, fully-contextualized, execution-ready coding prompt specifically tailored for the v0 AI model. Preserve **only explicitly relevant context, clearly stated intent, technical constraints, and precise objectives** from the original input. Do not introduce new concepts, assumptions, or unrelated context.\n\nRaw Input:\n{RAW_PROMPT}\n\nExpected output:\n- Concise summary of coding intent\n- Clearly outlined implementation approach\n- Explicit technical constraints and requirements\n- Code structure or example snippets (only if explicitly relevant from raw input)\n\nRespond strictly with the refined prompt only—no extra commentary or introductions.`,
  lovable: `Transform the provided developer voice dump into a friendly, clear, and immediately understandable prompt optimized for the Lovable AI coding model. Retain **only relevant technical information and clearly intended tasks** from the raw input. Do not add unnecessary background information or unrelated details.\n\nRaw Input:\n{RAW_PROMPT}\n\nExpected output:\n- Brief, friendly summary of developer intent\n- Clear, friendly step-by-step coding suggestions\n- Simple technical explanations (only if explicitly needed)\n- Highlighted best practices (only if directly relevant)\n\nRespond strictly with the refined prompt only—with no commentary before or after.`,
  bolt: `Precisely refine the raw, unstructured developer input into a highly-focused, concise, execution-ready prompt optimized specifically for the Bolt AI coding model. Include **only strictly relevant technical objectives, clearly defined tasks, and essential implementation details** from the raw input. Omit any extraneous information or general commentary.\n\nRaw Input:\n{RAW_PROMPT}\n\nExpected output:\n- Clear, single-line coding objective\n- Structured, brief task breakdown with clear steps\n- Short, essential implementation notes (if explicitly required)\n- Mention potential implementation challenges (only if clearly implied)\n\nRespond strictly with the refined prompt only—no introductory or concluding remarks.`
};

import { execSync } from 'child_process';

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  console.log('[Transcription] /api/transcribe endpoint hit');
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }
  try {
    const file = fs.readFileSync(req.file.path);
    const audioBytes = file.toString('base64');
    const audio = { content: audioBytes };
    const config = {
      encoding: 'WEBM_OPUS', // Accept browser-recorded webm audio
      sampleRateHertz: 48000, // Standard for webm/opus
      languageCode: 'en-US',
    };
    let response;
    let durationSec = 0;
    try {
      // Try to get duration using ffprobe (if available)
      const ffprobeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${req.file.path}"`;
      const durationOutput = execSync(ffprobeCmd).toString().trim();
    } catch (e) {
      durationSec = 0;
    }
    console.log(`[Transcription] Audio duration: ${durationSec}s`);
    // Always upload to GCS for backup
    const { Storage } = await import('@google-cloud/storage');
    const storage = new Storage();
    const bucketName = process.env.GCS_BUCKET_NAME || 'poopmtbucket';
    const gcsFileName = `uploads/${Date.now()}-${req.file.filename}.webm`;
    let gcsUri = `gs://${bucketName}/${gcsFileName}`;
    try {
      await storage.bucket(bucketName).upload(req.file.path, { destination: gcsFileName });
      const [exists] = await storage.bucket(bucketName).file(gcsFileName).exists();
      console.log(`[Transcription] Uploaded to GCS: ${gcsUri}`);
      console.log(`[Transcription] File exists in GCS after upload: ${exists}`);

      // Transcribe with OpenAI Whisper
      const FormData = (await import('form-data')).default;
      const fetch = (await import('node-fetch')).default;
      const form = new FormData();
      form.append('file', fs.createReadStream(req.file.path));
      form.append('model', 'whisper-1');
      // Optionally, add language or prompt here
      const openaiRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
        body: form,
      });
      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        throw new Error(`OpenAI Whisper API error: ${errText}`);
      }
      const openaiData = await openaiRes.json();
      const transcription = openaiData.text;

      // Call OpenAI GPT to refine the prompt
      let refinedPrompt = '';
      const modelKey = req.body.model || req.query.model || 'cursor';
      const systemPrompt = SYSTEM_PROMPTS[modelKey] || SYSTEM_PROMPTS['cursor'];
      if (transcription) {
        try {
          const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: transcription },
              ],
              max_tokens: 256,
              temperature: 0.4,
            }),
          });
          const gptData = await gptResponse.json();
          if (gptData.choices && gptData.choices[0]) {
            refinedPrompt = gptData.choices[0].message.content;
          }
        } catch (gptError) {
          console.error('[OpenAI GPT] Error:', gptError);
        }
      }
      fs.unlinkSync(req.file.path); // Clean up uploaded file
      res.json({ transcription, refinedPrompt });
    } catch (error) {
      console.error('Transcription error:', error);
      console.error('[Transcription] Request body:', req.body);
      console.error('[Transcription] Request file:', req.file);
      if (error.response && error.response.data) {
        const errJson = { error: error.message, apiError: error.response.data };
        console.error('[Transcription] Sending error response:', errJson);
        res.status(500).json(errJson);
      } else if (error.details) {
        const errJson = { error: error.message, details: error.details };
        console.error('[Transcription] Sending error response:', errJson);
        res.status(500).json(errJson);
      } else {
        const errJson = { error: error.message, stack: error.stack, raw: error };
        console.error('[Transcription] Sending error response:', errJson);
        res.status(500).json(errJson);
      }
      // Always clean up temp file on error
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
  } catch (error) {
    console.error('Transcription error:', error);
    console.error('[Transcription] Request body:', req.body);
    console.error('[Transcription] Request file:', req.file);
    if (error.response && error.response.data) {
      const errJson = { error: error.message, apiError: error.response.data };
      console.error('[Transcription] Sending error response:', errJson);
      res.status(500).json(errJson);
    } else if (error.details) {
      const errJson = { error: error.message, details: error.details };
      console.error('[Transcription] Sending error response:', errJson);
      res.status(500).json(errJson);
    } else {
      const errJson = { error: error.message, stack: error.stack, raw: error };
      console.error('[Transcription] Sending error response:', errJson);
      res.status(500).json(errJson);
    }
    // Always clean up temp file on error
    try { fs.unlinkSync(req.file.path); } catch(e) {}
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
