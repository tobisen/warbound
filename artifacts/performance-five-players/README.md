# Femspelarmatch2026-10-16

[production.json](production.json) är slutlig isolerad produktionsmätning mot
2cde753; sammanfattning/metod/begränsningar i [PERFORMANCE.md](../../PERFORMANCE.md).
Referensfiler byggs direkt från git utan checkout-/arbetskatalogändring. Samtliga
slutliga statehashar är identiska före/efter. Inga grafik-/cap-/tickändringar.

Reproduktion från reporoten med externt installerad Playwright och Chrome:

```sh
W2T_PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs \
W2T_BROWSER_EXECUTABLE='/path/to/Google Chrome' \
W2T_PROFILE_BASELINE=2cde753 \
W2T_PROFILE_OUTPUT=/tmp/five-players.json \
node scripts/profile-five-players.mjs
```

[browser.json](browser.json), [800](browser-800.png), [1280](browser-1280.png):
verklig devbrowser med fem deltagare, fyra aktiva AI och fysisk worker-selection.
Klockan stoppades endast inför reproducerbart musklick/bild; ingen FPS-mätning.
800bild visuellt granskad. Browserfixturens kamera korrigerades från basen till
arbetaren efter initialt klick utanför viewport; ingen produktionskod ändrades
av detta. Användarens CSS och units.mjs ingår i lokala bilder men i denna commit
ändras endast optimering/test/verifieringsscript/dokumentation.

Kontroller: riktade47/5, full2030/220 PASS821.02s, unit538/92 PASS29.73s,
strict build PASS med befintlig bundlevarning, scriptsyntax och diffcheck PASS.
Explorativa devprofiler/konkurrerande mätning ersätts av production.json ovan.
Ingen långtids-/mänsklig fullmatch, FPS-garanti eller ny CI/Pages hävdas.
