## 1. Jag ville bara spela Warcraft II igen… (40 s)

Jag heter Tobias. Jag ville egentligen bara återuppleva känslan av Warcraft II. En fredagskväll började jag fundera med ChatGPT: hur svårt kan det vara att bygga ett eget litet RTS? Det blev Warbound. Jag tänkte inte att jag skulle börja ett stort spelprojekt. Jag ville ha något att spela.

## 2. Fredag → onsdag (65 s)

Det här är poängen med hela historien. På fredagen började jag planera tillsammans med ChatGPT. Sedan fick Codex små avgränsade uppdrag, och vi itererade: bygg, prova, rätta, nästa. På onsdagen fanns ett fungerande RTS i webbläsaren med enheter, resurser, byggnader och strider. Fem kalenderdagar, inte fem arbetsdagar. Jag var knappt hemma under perioden, så det här skedde på fritiden. Fem dagar gäller den första spelbara versionen, inte allt ni strax får se.

## 3. Det började inte särskilt vackert (40 s)

Här kör vi den första kompletta MVP-versionen igen. Det är en ny skärmbild av den äldre koden, inte en bild jag tog den första veckan. Rektanglar och cirklar, men det gick att markera enheter, ge order och samla resurser. Det var rätt ordning för mig: först se om spelidén fungerar, sedan bry sig om hur den ser ut.

## 4. Okej. Nu börjar det likna något. (35 s)

Samma grundidé, men senare i projektet. Till vänster den återkörda MVP:n, till höger en faktisk aktuell match med resursinsamling. Det här är inte vad som hanns med på fem dagar. Det är den fortsatta utvecklingen: många små förbättringar som till slut syns väldigt tydligt. Fortfarande samma webbläsarspel.

## 5. Mitt utvecklingsteam (65 s)

Jag var produktägaren: idéer, prioriteringar, beslut och testning. ChatGPT hjälpte mig med planering, arkitektur, backlog och tydliga Codex-direktiv. Codex implementerade, körde tester, dokumenterade och hanterade Git. Skillnaden mot kodkomplettering är att agenten driver en hel avgränsad uppgift genom flera steg. Ett riktigt exempel är RTS-024: låt spelaren bygga utan att stänga inne arbetare. Uppdraget beskrev både beteendet och vad som skulle testas. Jag behövde fortfarande granska och avgöra om resultatet var rätt.

## 6. Fem raser. Över 200 uppgifter. (45 s)

Sedan blev det förstås lite mer än ett litet RTS. Humans, Orcs, Elves, Dwarves och Goblins. Olika enheter och byggnader, sjö- och luftenheter, teknikträd och AI-motståndare. Bilderna här är uppställda gallerier av spelets faktiska runtime-sprites. De visar ett urval, inte alla avancerade enheter. Den här omfattningen kom senare, en uppgift åt gången. Det är lätt att vilja lägga till en sak till.

## 7. Hela kartan. Och detaljerna. (30 s)

Här är River Crown. Till vänster hela kartan, utzoomad: skogar, vatten, berg och vägar som formar var man kan röra sig. Till höger samma karta vid spelzoom, med träd, gruvor och skatter. Båda är faktiska spelbilder. Fog of war är avstängd i just de här dokumenterade testbilderna så att terrängen går att se. Det är en visning av kartan, inte en naturligt utforskad match.

## 8. Ett RTS. En webbläsare. (40 s)

Teknikvalen var ganska okomplicerade: Phaser för spelet, TypeScript för logiken och Vite för att köra och bygga. Git och GitHub håller ihop historiken, och den statiska byggnaden publiceras med GitHub Pages. Ingen backend eller dedikerad spelserver krävs. Det gör tröskeln låg både för mig och för den som vill prova: öppna en länk. Enkel distribution gjorde det också lätt att visa upp och testa nya versioner.

## 9. AI skriver kod. AI skriver också buggar. (60 s)

Tre saker ur den faktiska projektdokumentationen. RTS-024 beskriver hur byggnader måste respektera arbetsvägar och produktionsutgångar. Navigation handlar alltså om mer än att hitta kortaste vägen. I slutgranskningen efter RTS-178 upptäcktes en konkret highscore-regression: validatorn accepterade bara Arena för de nya uppdragen. Det rättades och fick regressionstester. Och HANDOFF skiljer tekniska kontroller från mänsklig tids-, balans- och ljudgranskning. Grönt testresultat säger inte automatiskt att ett spel är roligt. Jag behövde fortfarande spela och göra bedömningen.

## 10. Börja smått. Behåll kontrollen. (55 s)

Mina tre lärdomar är enkla. Börja med något litet och spelbart, även om det bara är fyrkanter. Låt agenten göra implementationsarbetet, men behåll kontrollen över mål, beslut och resultat. Och underskatta inte små uppgifter, tester och dokumentation. Backloggen blev ett sätt att hålla riktningen över många iterationer. För mig handlade det till slut inte bara om att skriva kod snabbare. Det gjorde det möjligt att bygga något jag annars aldrig hade hunnit med.

## 11. Det började med en idé. Nu kan du spela det. (35 s)

Det här är startsidan ni möts av när ni öppnar Warbound. Skanna koden om ni vill prova. Länken är också klickbar i presentationen. Det började med nostalgi och ett litet experiment tillsammans med ChatGPT, och blev ett spel jag faktiskt kan öppna i webbläsaren. Tack! Jag tar gärna frågor efteråt. Om länken skulle omdirigeras är QR-koden ändå gjord för exakt den adress som står på sliden.

Total: 8 minuter 30 sekunder.
