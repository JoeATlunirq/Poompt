# Poompt Whisper Alchemy Server

## Setup

1. Install dependencies:

    cd server
    npm install

2. Set up Google Cloud credentials:
   - Create a Google Cloud project and enable the Speech-to-Text API.
   - Create a service account and download the JSON key file.
   - Set the environment variable before running the server:
     
     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/keyfile.json"

3. Start the server:

    npm start

The server will listen on port 5001 by default.

## API

POST /api/transcribe
- Form field: `audio` (audio file, e.g. WAV, LINEAR16, 16kHz)
- Returns: `{ transcription: string }`
