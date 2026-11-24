# Structure Labeler

A single-file, client-side tool for hand-labeling song structure (sections +
boundaries) to build validation / ground-truth sets. Drop audio in, energy
proposes boundaries, drag & label them, export pipeline-compatible JSON.

Everything runs in your browser — audio never leaves your machine.

Works offline: after one online visit, a service worker (`sw.js`) keeps a copy,
so the page opens without internet. In Chrome you can also install it as an app
(the install icon in the address bar).

Live: https://medcelerate.github.io/structure-labeler/
