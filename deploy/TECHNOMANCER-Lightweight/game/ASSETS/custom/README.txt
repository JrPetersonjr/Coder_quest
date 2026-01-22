Custom UI art drop zone
-----------------------
Place the new assets here so the UI can use them:
- crt-monitor.png         (CRT frame for Cast Console pane)
- technonomicon-front.png (Front cover art for Technonomicon)
- technonomicon-back.png  (Back/spine art for Technonomicon background)
- crystal-orb.png         (Glass orb for Crystal Ball display)
- static-noise.png        (B&W TV static for Crystal Ball idle state)
- glitch-static.png       (Green scanline glitch for connecting state)

Crystal Ball states:
- .idle     → B&W static noise flickers
- .connecting → Green glitch scanlines scroll
- .active   → Pulsing glow (auto after response)

Files are referenced from index.html and technonomicon.js. Keep filenames exact.
