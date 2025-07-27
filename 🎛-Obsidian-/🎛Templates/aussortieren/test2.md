<%*
const fm = tp.frontmatter;

const smoked = fm.smoked || "Keine Angabe";
const water = fm.water || "Keine Angabe";
const spent = fm.spent || "Keine Angabe";
const exercise = fm.exercise || "Keine Angabe";

tR(`# Tageszusammenfassung

## Rauchen
Habe ich heute geraucht? -> ${smoked} Zigaretten

## Trinken
Wie viel habe ich getrunken? -> ${water} Liter

## Ausgaben
Heute ausgegeben: ${spent} €

## Training
Was habe ich trainiert? -> ${exercise}
`);
%>
