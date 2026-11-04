# Warbound

Ett browserbaserat singleplayer-RTS med fem fantasyfraktioner, ändliga resurser,
basbyggande och strider på land, till sjöss och i luften. Byggt med Phaser,
strict TypeScript och Vite. Sparningar och inställningar lagras lokalt.

**[Spela Warbound](https://tobisen.github.io/warbound/)** · Version **0.9.0**

Välj **Campaign** för stegvis progression eller **Skirmish** för fria matcher
mot upp till fyra AI-spelare. Klicka/drag för urval, högerklicka för order.
Börja med arbetare, trä/guld, kasern och försörjning. **Commands** visar
kontrollerna; **Tech Tree** förklarar progressionen. Forskning utförs vid sin
byggnad. **Menu [P]** öppnar paus och lokal Save/Load.

Fem fraktionsroster, rasspecifika kampanjer, sjötransporter, ökolonier,
fortifikationer, magi, lag och utforskning ger flera vägar genom en match.
Sen teknik omfattar bland annat flottunderhåll, specialiserade skrov,
amfibiska trupper och stora mark-, luft- och sjöenheter.

Kör lokalt med Node.js 20.19+ inom20, eller22.12+ och npm:

```sh
npm ci
npm run dev
```

Öppna adressen Vite visar. Produktionsbygge: `npm run build`.
Tester: `npm run test:unit` (komponenter), `npm test` (hela regressionen).

Spelet är spelbart och utvecklas vidare. Långa matchers mänskligt bedömda
balans/speltid, viss slutanimation och faktisk ljudgranskning återstår.
Stora arméer kan fortfarande ge en initial bildrutetopp.

- [Spelguide och endgame](docs/guides/playing.md)
- [Teknisk och spelmässig audit](docs/audits/warbound-0.9.0.md)
- [Kommersiell Windows/Steam-plan](docs/commercial/ROADMAP.md) — audit, föreslagen1.0 och WBC-backlog; ingen implementation beställd.
- [Warbound 2-vision](docs/roadmap/warbound-2-vision.md)
- [Varsam filstädning](docs/audits/cleanup-0.9.0.md)
- [Arkitektur](ARCHITECTURE.md), [beslut](DECISIONS.md) och [utvecklarinstruktioner](AGENTS.md)
- [Aktuell status](BACKLOG.md), [överlämning](HANDOFF.md) och [releasekontroll](RELEASE_CHECKLIST.md)
- [Äldre systembeskrivningar och historik](docs/history/readme-before-0.9.md)
- [Grafik-/ljudursprung och licenser](assets/ASSET_LICENSE.md)

Inspirerat av klassiska RTS-spel. Arbetstiteln är inte juridiskt granskad
för kommersiell användning; se resurslicenserna före återanvändning.
