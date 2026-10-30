# Current-system video guides

Recorded on 29 October 2026 from the increment 008 local preview. The recordings use fictional accounts, requests and jobs in a separate training database. The ordinary port-3000 preview and its records are not used.

## Deliverables

Generated files live in the ignored `training-videos/2026-10-29/` directory:

- `complete-walkthrough.mp4`: the complete customer, Staff, Owner and local-testing journey.
- `customer-guide.mp4`: public browsing, guest/signed-in inquiries, account setup, invitation acceptance, job progress, messages, recovery and phone navigation.
- `staff-guide.mp4`: inquiry review/acceptance, job management, assignments/stages, customer invitations, messages, private notes, notification status and access controls.
- `owner-and-local-testing.mp4`: team invitations, role/status management, audit history and development inbox/failure tools.
- `index.html`: a local video player with role selection and chapter buttons.
- Matching SRT/VTT captions, embedded MP4 captions/chapters, a transcript and a feature checklist.

The narration is generated in English with the installed Windows speech voice. Captions follow the narration; chapter buttons allow viewers to repeat tasks. Training labels and highlighted controls are added only to the recording browser, with no application source changes. The exported lower third repeats those instructions over development-only toolbar controls.

Email/SMS are local captures. The recording explains that receipt, acceptance and portal access are separate events, and that uploads, shared company access, document generation, the solar planner, real notification delivery and deployment remain future work.

## Verification

The final exports are 19:25 (complete), 8:58 (customer), 9:15 (Staff) and 3:48 (Owner/local testing). All four decoded from beginning to end without media errors. Checks confirmed H.264 1280×720 video at approximately 15 fps, AAC narration, embedded English captions, matching SRT/VTT files, and 26/11/14/4 embedded chapters respectively. Representative final frames were visually inspected, including inquiry acceptance, customer messaging, completion and phone navigation.

The local browser player loaded all four files, sought to chapters, played video and loaded English caption cues without JavaScript errors. The complete narration measured −20.6 dB mean volume and −2.0 dB peak. These are artifact checks; the application verification record remains separate.

The normal preview remained on port 3000. The isolated training server was stopped after capture/alignment. The generated ZIP contains only the four final videos, captions, player, transcript, checklist, README, chapters and artifact verification report; private account/session checkpoints and raw recordings are excluded.

## Reproduce locally

The recorder is `scripts/record-system-tutorial.py`. Its private checkpoints, synthetic session state and raw screen recordings are under `.data/tutorial-008/`; never include those checkpoints in a shared package.

Requirements beyond the existing test environment are `imageio-ffmpeg`, Pillow, NumPy, Playwright's FFmpeg tool and the Windows `Microsoft Zira Desktop` voice. These are recording tools, not application dependencies.

```powershell
.\.venv\Scripts\python.exe -m pip install imageio-ffmpeg==0.6.0 pillow numpy
.\.venv\Scripts\python.exe -m playwright install ffmpeg
```

Start a separate development server from the project directory. Set `MIAS_DB_DIR=.data/tutorial-008/pglite`, `MIAS_BUILD_DIR=.next-verification`, `MIAS_SITE_URL=http://127.0.0.1:3300`, both notification transports to `dev-inbox`, and the training-only network/contact rate caps to 100. Use `next dev --webpack --hostname 127.0.0.1 --port 3300` with the bundled Node described in the README. Check that the port is free first; do not start another process on either database.

```powershell
.\.venv\Scripts\python.exe scripts/record-system-tutorial.py narration
.\.venv\Scripts\python.exe scripts/record-system-tutorial.py record
# Resume an interrupted capture from its private checkpoint, if necessary:
.\.venv\Scripts\python.exe scripts/record-system-tutorial.py record --resume
.\.venv\Scripts\python.exe scripts/record-system-tutorial.py align
.\.venv\Scripts\python.exe scripts/record-system-tutorial.py render
```

Recording mutates only the synthetic training copy. Keep `src/` unchanged during capture. A completely new take needs a fresh training database/checkpoint/output location; do not replay setup against an existing populated copy. The alignment phase locates the actual on-screen chapter titles, avoiding drift between the capture clock and encoded video; it uses the running training site only to render font-matched title templates. Stop the training server after alignment. Rendering reads its saved screen recordings and narration and does not open PGlite. When changing footage or narration, regenerate the corresponding cached `.data/tutorial-008/final-clips/` exports before concatenating them again.

Open `index.html` or an MP4 to watch. To serve the chapter player with browser captions, run a local static server against the output folder on a free port. No public hosting is needed.
