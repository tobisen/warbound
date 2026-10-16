# Talarstöd – Warbound och Agentic Coding

10 huvudslides, 480 sekunder (8 minuter). Kartan är extra och ingår inte i tiden. Tiderna är talbudgetar, inte en verifierad mänsklig repetition.

## 1. Jag ville bara spela Warcraft II igen… — 40 sek

Jag heter Tobias, och jag ville egentligen bara spela Warcraft II igen. Inte starta ett nytt stort fritidsprojekt. Bara få tillbaka den där känslan: bygga en bas, samla resurser och skicka iväg en liten armé. En fredagskväll började jag prata med ChatGPT om att bygga ett eget litet RTS. Hur svårt kan det vara? Det är ju en väldigt användbar fråga om man vill förlora sina lediga kvällar. Men den här gången blev det faktiskt ett spel: Warbound. Det intressanta är hur vi tog oss dit.

## 2. Fredag → onsdag — 55 sek

Det här är poängen med hela historien. Fredag kväll: en idé och planering med ChatGPT. Onsdag: den första fungerande RTS-versionen i webbläsaren. Enheter, resurser, byggnader och strider. Fem kalenderdagar. Inte fem dagar där jag satt åtta timmar om dagen och programmerade. Och jag var knappt hemma. Arbetet fick plats i luckorna på fritiden. Jag kunde ge Codex en avgränsad uppgift, komma tillbaka, prova resultatet och bestämma nästa steg. Det var fortfarande jag som behövde styra. Men varje liten stund behövde inte börja med att jag själv skrev all kod. Och viktigt: fem dagar gäller första versionen. Dagens Warbound växte fram senare. Annars låter det här som en ganska tveksam reklamslogan.

## 3. Det började inte särskilt vackert — 35 sek

Och här är skönheten. Eller åtminstone geometrin. Rektanglar, cirklar och en mycket optimistisk spelutvecklare. Bilden är tagen när vi återkörde den historiska MVP-koden, inte under den första veckan. Men det gick att markera enheter, ge order och samla resurser. Det var det jag ville veta först: finns det ett spel här? Snygga träd hjälper inte särskilt mycket om arbetaren inte kan gå till dem. Så första målet var något spelbart, inte något som såg färdigt ut.

## 4. Okej. Nu börjar det likna något. — 45 sek

Till vänster den gamla versionen, till höger en riktig lokal match i den senare versionen. Jag har gjort den nya bilden större så att ni faktiskt ser vad som händer. Det här kom efter femdagarsversionen. Skillnaden byggdes upp genom många små uppgifter: bättre grafik, tydligare gränssnitt och fler system som fungerade tillsammans. Ingen enskild magisk prompt som sa bygg Warcraft och sedan var vi klara. Snarare ett ganska envist nästa sak, nästa sak, nästa sak. Och hela tiden kunde jag öppna spelet och testa. Det gjorde utvecklingen konkret: jag såg om en förändring hjälpte.

## 5. Mitt utvecklingsteam — 90 sek

Här är mitt utvecklingsteam. Jag stod för idéer, prioritering, beslut och testning. ChatGPT hjälpte med planering, arkitektur och uppgiftsbeskrivningar. Codex tog implementationen, testerna, dokumentationen och Git. Med Agentic Coding menar jag att delegera en hel avgränsad utvecklingsuppgift. Inte bara be om en kodsnutt och själv pussla ihop resten. Vi gick från idé till planering, ett Codex-uppdrag, implementation, test och commit. Sedan nästa uppgift. Ett verkligt exempel är RTS-024. En byggnad kan stå på en tillåten ruta men ändå stänga inne en arbetare eller blockera vägen till resurserna. Uppgiften var att skydda vägar som redan gick att använda. Inte lösa alla tänkbara navigationsproblem eller automatiskt flytta undan enheter. Codex fick implementera samma kontroll i byggförhandsvisningen och vid klick, innan resurser drogs. Produktionen skulle vänta om utgången var blockerad och skapa exakt en enhet när den blev fri, utan ny betalning. Det verifierades med placerings- och spawn-tester och i Chromium: försök blockera en väg, bygg på en giltig plats, blockera och frigör en utgång, starta om. Det är en sammanfattning av dokumentationen, inte ett ordagrant direktiv. Min roll var fortfarande att granska och avgöra om beteendet blev rätt. Det är den arbetsfördelningen som gjorde skillnaden.

## 6. Fem raser. Över 200 uppgifter. — 45 sek

Sedan blev det förstås lite mer än ett litet RTS. Nu finns fem spelbara raser: Humans, Orcs, Elves, Dwarves och Goblins. Här ser ni ett urval av deras faktiska enheter och byggnader, hämtade ur spelets atlaser. Det finns också sjö- och luftenheter, teknikträd och AI-motståndare. Jag visar inte detta för att räkna funktioner. Poängen är att samma arbetssätt kunde fortsätta efter den första versionen. Över tvåhundra uppgifter, en i taget. Det är väldigt lätt att säga bara en sak till. Backloggen fick bli mitt försök att hålla det där under någorlunda kontroll.

## 7. Ett RTS. En webbläsare. — 40 sek

Tekniken är ganska okomplicerad. Phaser för spelet, TypeScript för logiken och Vite för att köra och bygga. Git och GitHub håller ihop historiken. GitHub Pages serverar det färdiga bygget. Allt spelande körs direkt i webbläsaren; det behövs ingen backend eller dedikerad spelserver. För den som vill prova är det bara en länk. Det var också värdefullt under utvecklingen. Jag kunde öppna en version och direkt testa vad som hade ändrats, utan att installation och distribution blev ett eget stort projekt. Tekniken gav oss en kort väg från uppgift till något spelbart.

## 8. AI skriver kod. AI skriver också buggar. — 70 sek

Det här betyder förstås inte att AI slutade skriva buggar. Ta byggnaderna igen. Att en byggnad får plats är en sak. Att arbetaren fortfarande kommer hem med veden är en annan. RTS-024 visar varför uppgiften behövde beskriva beteendet runt funktionen, inte bara själva byggknappen. Ett senare exempel var RTS-178. Nya kartval lades till, men en gammal highscore-validator accepterade fortfarande bara Arena för de berörda uppdragen. Den hittades vid slutgranskningen. Fixen accepterade kartan från uppdragskonfigurationen och bevarade gamla resultat. Den fick regressionstester och kontrollerades med en riktig Frontier-resultpost i browsern. Två ganska olika problem, samma lärdom: man måste testa hur systemen möts. Och även när testerna är gröna återstår en annan fråga: vill någon spela? Ett test kan kontrollera att en match går att vinna. Det kan inte automatiskt avgöra om tempot känns bra, om raserna är roliga eller om balansen håller. Där behöver jag fortfarande spela, lyssna och göra en mänsklig bedömning.

## 9. Börja smått. Behåll kontrollen. — 40 sek

Det jag tar med mig är egentligen tre saker. Börja smått och bygg något spelbart. Fyrkanter duger alldeles utmärkt om de hjälper dig att prova idén. Låt agenten implementera, men behåll kontrollen över vad som ska byggas och om resultatet blev rätt. Och små uppgifter, tester och dokumentation gör skillnad. De hjälper både mig och agenten att hålla riktningen mellan kvällarna. För mig var vinsten inte bara att skriva kod snabbare. AI gjorde det möjligt att bygga något jag annars aldrig hade hunnit. Det var ju trots allt bara Warcraft II jag ville spela.

## 10. Det började med en idé. Nu kan du spela det. — 20 sek

Vill ni prova finns Warbound här. Skanna koden eller öppna länken. Det började som en fredagsidé och blev ett spel jag kan öppna i webbläsaren. Tack! Jag tar gärna frågor. Och ja, det finns säkert fortfarande buggar att hitta.

## Extra. Hela kartan. Och detaljerna. — 0 sek

Extraslide utanför åttaminutersflödet. Här är River Crown. Till vänster hela kartan, utzoomad: skogar, vatten, berg och vägar som formar var man kan röra sig. Till höger samma karta vid spelzoom, med träd, gruvor och skatter. Båda är faktiska spelbilder. Fog of war är avstängd i just de här dokumenterade testbilderna så att terrängen går att se. Det är en visning av kartan, inte en naturligt utforskad match.
