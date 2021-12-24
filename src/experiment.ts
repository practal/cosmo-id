import {cleanup} from "./process";
import {normaliseWord, normaliseIdentifier} from "./normalisation";

function convertId(s : string) : string {
    return normaliseIdentifier(cleanup(s));
}

function convertWord(s : string) : string {
    return normaliseWord(cleanup(s));
}


let tasks = [
    " Cosmöpolitan Identîfiers  ",
    "Cosmopolitan Iden32tiﬁers",
    "Андре́й-Никола́евич-Колмого́ров",
    "Fréchet  -  Колмого́ров θεώρημα",
    "==",
    "-",
    "--",
    "A AA Q",
    "π",
    "αβ",
    "α β єЄ", 
    "x1",
    "1x" 
];

console.log("experimenting ...")

for (let s of tasks) {
    let id = convertId(s);
    let word = convertWord(s);
    console.log(`"${s}" -> id:"${id}", word:"${word}"`)
}