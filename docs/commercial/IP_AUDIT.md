# IP- och tillgångsaudit

2026-11-03. **Ingen juridisk clearance.** Tabellen beskriver granskade filer,
repoets ursprungsuppgifter och kvarstående frågor. Projekttext om originalitet
eller AI-generering är inte bevis för exklusivitet, rättigheter till referenser
eller frånvaro av intrång. Ingen asset, licens eller titel ändras i denna audit.

Hög risk = behöver lösas före publik kommersiell användning; medel = behöver
kontrollerad proveniens/acceptans; låg = tydligare underlag, inte garanti.
[BACKLOG](../../BACKLOG.md) WBC-012–025 äger åtgärderna.

## Inventering

| Kategori / plats från repo-root | Känd origin / kontrollerad uppgift | Licensstatus | Kommersiell användbarhet | Risk | Åtgärd |
| --- | --- | --- | --- | --- | --- |
| Produktnamn: README, `src/text.ts`, `src/config/release.ts` | Warbound är arbetstitel; annan [Warbound av Construct Games på Steam](https://store.steampowered.com/app/3078030/Warbound/?l=english) konstaterad vid webbläsning. | Ingen varumärkes-/namnclearance funnen. En butikslistning avgör inte rättsläget. | **Ej klarerad.** | Hög | WBC-012: sök liknande namn/varumärken i avsedda territorier, företagsnamn/domäner/butiker; professionell bedömning, sedan ägarbeslut. Ingen automatisk rename. |
| Legacybranding/terminologi: `package.json`, GAME_DESIGN, preferences/savekeys | `warcraft-2-tribute`, äldre Iron & Timber — A Tribute to Warcraft II; Peon, Gryphon Rider, Wyvern Rider, Gyrocopter och Human/Orc-par i config. | Namn/genrer i sig avgör inte intrång; sammanhang och likhet behöver granskas. | Metadata/marknadsföring behöver självständig identitet. Interna savekeys är kompatibilitetsdata. | Hög | WBC-012/015: bedöm helhetsintryck, lore, silhuetter/terminologi; radera inte gamla savekeys eller historiska källhänvisningar. |
| Grundsprites: `assets/sources/units.mjs`, `humans.mjs`, `faction-people.mjs`, `roster-complete.mjs`; `public/assets/units-atlas.*` | Repo-lokala pixelkompositioner och senare rasterrefresh. Användarens ändrade units.mjs lämnas orörd. | Projektvillkor i `assets/ASSET_LICENSE.md`; ingen generell rotlicens. | Villkorligt efter ägarkedja och slutpaketmappning. | Medel | WBC-013/016–020: koppla exporter till verklig slutkälla, upphov och referens; äldre ”alla kodritade”-text räcker inte. |
| Refresh/luft/nya roller: `assets/sources/visual-refresh/`, `naval-content/`, `island-fleets/`, `leviathans/`, `bosses/` | Lokala README/prompts anger imagegen-original. Källbilder och exportörer finns. Senare ark har8 riktningar×4 tillstånd, exporterade mellanframes härleds. | Vissa outputs CC0 enligt projektets notiser; andra projektvillkor. Verktygsvillkor och referensrätt behöver styrkas per körning. | **Villkorligt**, inte ”AI = säkert”. | Hög | WBC-013/015: tjänst/version/datum, prompt/inputrättigheter, redigeringskedja/hashes och outputvillkor; visuell likhetsgranskning. |
| Byggnader: `buildings.mjs`, `settlement-complete.mjs`, `visual-refresh/buildings.png`, separat aviary/siege/fleet-art | Egna kod-/imagegenkällor; flera byggnader delar raster och teamfärger. | Blandade projekt-/outputnotiser, inga generella överlåtelser funna. | Villkorligt; stilgodkännande är inte IP-godkännande. | Medel | WBC-013/021: inventera17 slag och nivå-/damage-/constructionvarianter; undvik att beställa redan fungerande byggnader igen. |
| Terräng/resurser: `world.mjs`, `reference-terrain.mjs`, `visual-refresh/resources-205.png`, `public/assets/reference-terrain-atlas.*` | Kodritad terräng + genererade resurser. `assets/sources/reference-terrain.md` anger studier av Warcraft II-kartor på Battle.net; inga externa raster uppges importerade. | Projektvillkor/outputnotiser; inga rättigheter till själva externa referenskartorna styrkta. | Egen layout/pensel kan behållas efter likhetskontroll; ”inga kopierade pixlar” avgör inte alla frågor. | Hög | WBC-013/022/043: jämför geografi, proportioner, motiv och helhetsintryck, dokumentera egna avvikelser. Ingen ny karteditor. |
| Animation: `src/presentation/animation.ts`, exporter under scripts | Framekeys omfattar8 riktningar/4 tidssteg, men äldre landark använder spegling/skuggning; cast/work/death ofta transform/fade. | Följer respektive källassets, inte en separat licens för exportnycklar. | Tekniskt spelbar; godkänd kommersiell kvalitetsnivå återstår. | Medel | WBC-015–020/034: skilj målade perspektiv/tillstånd från tidsvarianter; ändra inte löftet till ”fullt handanimerat”. |
| UI/ikoner: `assets/sources/ui.mjs`, `src/presentation/actionIcons.ts`, CSS, `public/assets/ui-atlas.*` | Egna pixel-/CSS-kompositioner; flera ikoner beskär verklig enhetsart. | Projekt-/källassetvillkor. | Villkorligt efter visuell/IP-kontroll. | Medel | WBC-013/023: läsbarhet och egen ornamentik; kreditera härledda källor. |
| Menypanorama: `assets/sources/home-fantasy-126.md`, `src/config/homeArt.ts`, publicassets | Repo anger projektgenererad illustration utan externa bildreferenser; master/export dokumenterade. | Projektvillkor; behöver tjänste-/ägarkedja. | Villkorligt; kan inte automatiskt användas som bevisad gameplay på Steam. | Medel | WBC-013/049: IP-granska, separera capsule-/menykonst från faktiska screenshots. |
| Musik/UI-synth: `scripts/export-audio.py`, `assets/audio/music.wav`, `public/audio/music.*` | Egen16s-loop och syntetiska UI-cues enligt källa/manifest. | Projektvillkor, inte licensierad extern soundtrack. | Villkorligt efter upphov och faktisk lyssning; en kort loop kan trötta. | Medel | WBC-024: långlyssna i match, kvalitetssäkra eller ersätt med eget/licensierat begränsat material. Ingen OST-kvot. |
| Combat/material-SFX: `assets/sources/audio-identity/material-effects.json`, `assets/sources/leviathans/audio.json` | Kenney/Thimras inspelningslager, egna mixar, hashes/credits i manifest. | Deklarerad CC0 för källmaterial, flera syntetiska äldre exporter. | Möjlig om per-filursprung och rättigheter bekräftas. | Låg–medel | WBC-013/024: följ varje faktiskt distribuerat lager, bevara källnotiser och kontrollera mixen vid samtidig combat. |
| Röster: `public/audio/voices/manifest.json`, `assets/sources/audio-identity/` | **405** slutklipp,81/ras i aktuellt manifest. Kokoro + OpenVoice V2; Tim Rockk/Hydroque/artisticdude/MaximB referenser. Ingen runtimegenerering/modell i spelet. |81 Human: outputCC0+modellApache;243 andra: CC0;**81 Dwarf: CC-BY-SA-3.0**. Äldre topptext63 är inaktuell. | Kräver kontroll av output, referensinspelning och rätt till karaktärs-/röstbearbetning, credits och distributionsvillkor. | Hög | WBC-013/025: korrigera framtida slutcredits utifrån81, granska varje referens/voice-conversion-rätt och modellnotis; säkra godkännande eller ersätt problemklipp. |
| Wildlife: `assets/sources/wildlife-251.md`, `public/audio/wildlife-manifest.json` | Nio inspelade utdrag: British Library/Shove/Williams deer/fox, kessir rabbit. Källor/cuts/hashes finns. | Deer/fox CC-BY-SA4.0, rabbit CC0 enligt per-filmanifest. | Kommersiell användning kan tillåtas med full efterlevnad; inte en blanket-CC0. | Medel–hög | WBC-013/025: kontrollera inspelningsrättigheter, attribution/changes och derivatens licens, håll credits läsbara offline. |
| Fonts: CSS, public | Georgia/Times New Roman/system-ui i granskad CSS; inga TTF/OTF/WOFF funna i public. | OS-font refereras; inga fontfiler paketerade i inventeringen. | Nuvarande upplägg kan återanvändas efter Windowsläsbarhetsprov. | Låg | WBC-023/028: om ny font införs krävs separat distributionslicens; lova inte fontinbäddning. |
| Kartor: `src/config/maps.ts`, `mapRegions.ts`, `islandMaps.ts`, `seaBattle.ts` |18 authored ID:n med kodbaserad geometri; äldre WCII-referens ovan. | Projektets kodvillkor/ägarskap ej övergripande fastställt. | Villkorligt efter layout-/namn-/referensgranskning. | Medel | WBC-012/043: särskilt granska benämningar som Stormgate Armada och likhetsrisk; inga slutsatser om intrång här. |
| Story/lore/repliker: `factionLore.ts`, `campaignSeries.ts`, `campaignExpeditions.ts`, `src/text.ts`, röstmanus | Egen repo-text enligt källdokument; mallar återanvänds, historik har Warcraft-hyllning. | Författarskap/AI-medverkan/överlåtelser inte fullständigt klarerade. | Kräver självständig berättelse och provenance. | Medel–hög | WBC-012/013/036/038–042: granska likheter/fraser och dokumentera vem som godkänner sluttext. |
| Bibliotek: package/lock, node_modules notices | Låsfil: Phaser4.2.1 MIT, TS7.0.2 Apache-2.0, Vite8.3.5/Vitest4.1.12 MIT. Phaser runtime, övriga bygg/test; exporter har separat Pythonverktygskedja. | Direkta licensfält kontrollerade; **inte** full transitiv SBOM/licens- eller sårbarhetsaudit. | Sannolikt återanvändbart efter slutpaketnotiser. | Medel | WBC-014: inventera faktiskt distribuerat runtime/Chromium/Electron/kodekar; notices/avtal/EULA får inte motsäga tredjepartsvillkor. |
| Lokala referenser/extra artifacts: `docs/art/`, `presentations/`, `artifacts/` | Användarens otrackade bildreferenser och historiska jämförelse-/presentationsunderlag. Origin är inte fullt styrkt i denna audit. | Inte automatiskt runtime- eller marknadsföringslicens. | Exkludera från kommersiellt paket om inte särskilt klarerade. | Hög vid distribution | WBC-003/013/049: paketallowlist, bevara filerna i arbetskopian; inga ogrundade ”hela repot är fritt”-påståenden. |

## Kontroller som saknas före clearance

En slutlig per-filförteckning behöver länka **paketfil→export→källa→upphov/
referens→rättighetsbevis→licens→changes/credits→beslut**. Sammanfattningen ovan
är en kategorigranskning, inte att alla506 publicfiler eller581 assetfiler har
individuellt juridiskt klarerats. Samma fil kan användas av flera roller.
Vite kopierar public; en framtida paketering måste kontrollera vad som verkligen
följer med. Historiska ”inga externa assets”-formuleringar har ersatts av
senare externa ljudmanifest och får inte ensamma användas i marknadsföring.

CC BY-SA tillåter kommersiellt bruk men kräver attribution och samma licens
för berörda bearbetningar samt förbjuder ytterligare begränsningar som strider
mot villkoren. Det är inte ett automatiskt krav att hela spelets kod ska vara
CC BY-SA. Kontrollera tillämpningen på just röstkonvertering, ljudmixar,
Steamdistribution/DRM och EULA med sakkunnig; sätt inte nya licenser på någon
annans material. [CC BY-SA3.0](https://creativecommons.org/licenses/by-sa/3.0/),
[CC BY-SA4.0](https://creativecommons.org/licenses/by-sa/4.0/).

CC0 tar inte bort andras varumärkes-, integritets- eller personrättigheter och
ger inga garantier. Modellkodens licens styr inte automatiskt all träningsdata,
röstlikhet eller output. [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
Repoets Apache/MIT-modellnotiser är underlag, inte extern verifiering av alla
genererings-/röstvillkor. Hämta originalvillkor och spara datum i WBC-013/025.

Steam kräver disclosure för genererat innehåll som distribueras och upplevs av
spelaren, exempelvis art, ljud och narrativ. Färdiggenererad grafik/röst hör
till den granskningen; vanlig bot-AI är en annan sak. Koden har ingen påvisad
livegenerering. Rättigheter måste finnas även om AI-användningen redovisas.
[Valve Content Survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey),
läst2026-11-03. Ägaren lämnar korrekta slutliga uppgifter i WBC-046/049.

Namnsökning bör omfatta relevanta svenska/EU/internationella register och
marknader, förväxlingsbara titlar och faktisk användning. Steamträffen är ett
konkret sökhinder, inte en genomförd varumärkesutredning. [PRV:s vägledning](https://www.prv.se/en/trademarks/)
är startpunkt. Extern jurist/varumärkesexpert, avtal och kostnader kräver
ägarbeslut; detta uppdrag köper eller kontaktar ingen.
