---
name: elevenlabs-meditation-voice-pipeline
description: Skill for the mindecho-ai-115 project only. Full end-to-end pipeline: browser mic recording, Supabase Storage upload, ElevenLabs Voice Cloning and TTS synthesis via backend proxy, text chunking, and HTML5 Audio playback with play/pause/resume toggle. Use this skill for all voice recording, ElevenLabs API, and audio playback tasks in mindecho-ai-115.
---

# ElevenLabs Meditation Voice Pipeline Skill (mindecho-ai-115 ONLY)

This skill applies EXCLUSIVELY to the mindecho-ai-115 branch.
It governs all work related to:
- Browser microphone recording (MediaRecorder API)
- Saving recordings to Supabase Storage buckets (NOT base64 in DB columns)
- ElevenLabs Instant Voice Cloning (POST /v1/voices/add)
- ElevenLabs TTS synthesis (POST /v1/text-to-speech/{voice_id})
- Long-text chunking for meditation scripts (split at paragraphs, max 8000 chars)
- HTML5 Audio playback with toggle play/pause/resume state machine

---

## 1. MICROPHONE RECORDING -- Browser MediaRecorder API

RULES:
- Call navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }) on button click inside a user-gesture handler.
- ALWAYS call await micAudioContext.resume() inside the same user-gesture handler.
  Chrome/Safari/Edge suspend AudioContext until explicitly resumed -- this was root cause of silent recording bug in mindecho-ai-115 (FIXED).
- Record via MediaRecorder with timeslice: 250 (250ms chunks), 60 seconds total.
- Validate: blob.size >= 1000 bytes = valid voice. Smaller = silence.
- Max file size: 15 MB (blob.size > 15 * 1024 * 1024).

STATE VARIABLES:
- appState.recordedAudioBlob -- current Blob
- appState.recordedAudioUrl -- ObjectURL or Base64 DataURL
- appState.isRecording -- boolean

---

## 2. SUPABASE STORAGE -- Audio File Save and Load

ARCHITECTURE (corrected from research):
- DO NOT store base64 audio in DB column (page_section). This is an anti-pattern: +33% size overhead, bloats DB, kills query speed.
- USE Supabase Storage bucket for audio files.
- Store only metadata + storage_path + public_url in DB table.

UPLOAD PATTERN (browser JS):
const { data, error } = await supabase.storage
  .from('parent-voices')
  .upload(storagePath, audioBlob, {
    contentType: 'audio/mpeg',
    upsert: true,
    cacheControl: '3600'
  });
const { data: urlData } = supabase.storage.from('parent-voices').getPublicUrl(storagePath);
const publicUrl = urlData.publicUrl;

For files over 6 MB: Supabase JS SDK automatically uses TUS resumable upload. No special code needed.

LOCAL CACHE (localStorage):
- Cache latest recording as base64 ONLY IF blob.size is less than 4 MB.
- Key: mindecho_latest_parent_voice_b64
- If blob is larger: store publicUrl in localStorage key mindecho_latest_parent_voice_url instead.
- On app load: check localStorage first. If data:audio or https:// URL found, activate #btn-create-meditation.

---

## 3. ELEVENLABS INSTANT VOICE CLONING -- POST /v1/voices/add

CRITICAL FINDING FROM RESEARCH:
ElevenLabs API does NOT allow direct browser cross-origin calls.
CORS error: No 'Access-Control-Allow-Origin' header is present.
Solution: Route ALL ElevenLabs API calls through a backend proxy.

FOR mindecho-ai-115 MVP (GitHub Pages -- no backend available):
The current implementation calls ElevenLabs directly from browser JS.
This MAY work on some browsers/configs but is NOT reliable and NOT production-safe.
The CORS issue is the primary reason voice cloning may fail silently in production.

CURRENT WORKAROUND (acceptable for MVP demo):
- Keep direct fetch calls to ElevenLabs as fallback.
- Add try/catch around ALL ElevenLabs calls.
- If CORS blocks the call, fall back to default voice ID C0qT9fWAA22Nx02a6QJY.
- Show user status: 'Using standard meditation voice (ElevenLabs direct call unavailable).'

FUTURE RECOMMENDED FIX:
Add Supabase Edge Function as proxy:
- Frontend calls POST /api/clone-voice (Supabase Edge Function)
- Edge Function holds xi-api-key in environment variables
- Edge Function proxies request to ElevenLabs and returns voice_id

FORMDATA RULES (when calling directly):
- Do NOT set Content-Type header manually. Browser sets multipart boundary automatically.
- Append: name, files (audioBlob with filename), description fields.
- Fallback voice_id: C0qT9fWAA22Nx02a6QJY

---

## 4. ELEVENLABS TTS SYNTHESIS -- POST /v1/text-to-speech/{voice_id}

MODEL: eleven_multilingual_v2
- Character limit: 10,000 per request (NOT 2,500 -- that is outdated)
- Best for: High-quality Russian multilingual meditation narration
- Output format: mp3_44100_128 (add as query param: ?output_format=mp3_44100_128)

VOICE SETTINGS FOR MEDITATION (optimal from research):
  stability: 0.65       -- steady, consistent -- no sudden pitch jumps
  similarity_boost: 0.80 -- close to parent voice without artifacts
  style: 0.05           -- minimal dramatic inflection for calm bedtime tone
  use_speaker_boost: true -- enhances clarity, compensates for mic quality

SSML CLEANING BEFORE SENDING:
text.replace(/<break\s+time=["'][^"']+["']\/>/gi, " ... ")
    .replace(/--/g, ", ")

RESPONSE HANDLING:
const arrayBuffer = await res.arrayBuffer();
const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
const audioUrl = URL.createObjectURL(blob);

---

## 5. TEXT CHUNKING -- Long Meditation Scripts

LIMITS (corrected from research):
  eleven_multilingual_v2: 10,000 chars per request
  10-minute script: approx 2,500 to 4,000 chars -- fits in one request
  30-minute script: approx 7,500 to 12,000 chars -- CHUNK at 8,000 chars

CHUNKING STRATEGY (split at natural boundaries):
Priority: paragraph breaks (\n\n) > sentence endings (. ! ?) > clause boundaries (,)
NEVER split mid-sentence or mid-word.

MERGE AUDIO BLOBS:
const allBuffers = await Promise.all(audioBlobs.map(b => b.arrayBuffer()));
const mergedBlob = new Blob(allBuffers, { type: 'audio/mpeg' });

---

## 6. PLAYBACK AND TOGGLE CONTROLS -- HTML5 Audio API

FUNCTION: playParentRecordedVoice()

STATE MACHINE:
  NOT PLAYING + 1st click = PLAYING  (button: pause text, red gradient)
  PLAYING + 2nd click = PAUSED       (button: resume text, green gradient)
  PAUSED + 3rd click = PLAYING       (resumes from exact position)
  END OF TRACK = NOT PLAYING         (button resets to initial green text)

RULES:
- Use persistent appState.parentAudioTrack = new Audio(url). Never recreate on each click.
- Track state with appState.isPlayingParentVoice boolean.
- On audio.onended: reset button to initial state, green gradient.

STRICT ISOLATION (NEVER VIOLATE):
- #btn-create-meditation controls ONLY parent voice / synthesized meditation track.
- #play-btn and #btn-quick-test-top control ONLY meditation1.mp3.
- These two systems are 100% independent. NEVER cross-wire them.

---

## 7. KNOWN ISSUES AND SECURITY NOTES

CORS / Direct Browser Calls:
- ElevenLabs blocks direct browser CORS calls in production.
- For MVP demo on GitHub Pages: keep try/catch + fallback to default voice.
- For production: use Supabase Edge Function as proxy with ELEVENLABS_API_KEY in env.

API Key:
- xi-api-key visible in browser DevTools for MVP. Acceptable for demo.
- Never commit to public repo without understanding this risk.
- Set credit limits in ElevenLabs dashboard as a billing safeguard.

localStorage Limit:
- Max 5-10 MB. Do not store base64 audio larger than 4 MB.
- For synthesized meditation tracks: store Supabase public URL, not base64.

AudioContext Suspension (FIXED):
- Root cause of silent recording bug: AudioContext starts suspended.
- Fixed by: await micAudioContext.resume() in user-gesture handler.

---

## 8. ROLLBACK AND SAFETY RULES

1. Preserve #play-btn behavior -- controls meditation1.mp3 only.
2. Preserve all language toggle buttons (RU/EN/HE) and their event handlers.
3. Preserve all buttons: #btn-quick-test-top, #btn-toggle-story-text, mic button.
4. When editing generatePersonalMeditation(): preserve loading state, analytics, guardrail check.
5. When editing saveParentVoiceToSupabase(): never remove localStorage cache write.

ROLLBACK PROMPT TEMPLATE:
Dlya proekta mindecho-ai-115 na diske i na servere: Vosstanovi izmeneniya [NAZVANIYE FUNKTSII].
Otmeni izmeneniya i verni funksiyu [NAZVANIYE] v sostoyaniye, v kotorom [OPISANIYE PREDYDUSHCHEGO POVEDENIYA].
Vse ostalnyye knopki, pereklyuchateli yazykov i funktsional dolzhny ostavatsya v prezhnem sostoyanii.
