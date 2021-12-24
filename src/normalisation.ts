import {CosmoConfig, IdentifierCC, Primary, WordCC} from "./cosmoconfig";
import {preprocess, postprocess} from "./process";

function separateIntoPieces(config: CosmoConfig, word : string) : Primary[][] {
    let primaries = preprocess(config, word);
    if (!primaries) return undefined;
    let L = primaries.length;
    if (L == 0) { return undefined; }
    if (config.mustStartWithLetter && !config.isLetter(primaries[0])) return undefined;
    var pieces : Primary[][] = [];
    let from = 0;
    for (let i=1; i+1<L; i++) {
        if (config.isSeparator(primaries[i]) && 
            !config.isSeparator(primaries[i-1]) &&
            !config.isSeparator(primaries[i+1]))
        {
            let piece = primaries.slice(from, i);
            pieces.push(piece);
            from = i+1;
        }
    }
    if (from < L) {
        pieces.push(primaries.slice(from, L));
    }
    return pieces;
} 

function splitPiece(piece : Primary[], 
    pred : (primary : Primary) => boolean, action : (piece : Primary[]) => void) : boolean
{
    if (!piece) return false;
    let result : Primary[] = [];
    let L = piece.length;
    let i = 0;
    while (i < L && pred(piece[i])) i++;
    if (i == 0) return false;
    let p = piece.splice(0, i);
    action(p);
    return true;
}

export function normalise(config: CosmoConfig, identifier : string) : string {
    let pieces = separateIntoPieces(config, identifier);
    if (!pieces) return undefined;
    function isLetter(p : Primary) : boolean {
        return config.isLetter(p);
    }
    function isProperSymbol(p : Primary) : boolean {
        return config.isSymbol(p) && !config.isLetter(p);
    }
    let result : Primary[] = [];
    let error = false;
    function separate(primaries : readonly Primary[]) {
        if (error || primaries.length == 0) return;
        if (result.length == 0) {
            result.push(...primaries);
        } else {
            if (config.isSeparator(result[result.length - 1]) || 
                config.isSeparator(primaries[0]))
            {
                error = true;
            } else {
                result.push(config.separatorNormalform);
                result.push(...primaries);
            }
        }
    }
    function addLetters(letters : Primary[]) {
        if (letters.length == 1) {
            let nf = config.symbolNormalform(letters[0]);
            if (nf) { 
                separate(nf);
                return;
            }
        }
        let piece : Primary[] = [];
        for (let letter of letters) {
            let nf = config.letterNormalform(letter);
            if (!nf) throw new Error(`letter ${letter} has no normalform`);
            piece.push(...nf);
        }
        separate(piece);
    }
    function addSymbols(symbols : Primary[]) {
        var result : Primary[] = [];
        for (let s of symbols) {
            let nf = config.symbolNormalform(s);
            if (!nf) throw new Error(`symbol ${s} has no normalform`);
            result.push(...nf);
        }
        separate(result);
    }
    for (let piece of pieces) {
        while (
            splitPiece(piece, isLetter, addLetters) ||
            splitPiece(piece, isProperSymbol, addSymbols)
        ) {};
        if (piece.length > 0) return undefined;
    }
    if (error) return undefined; else return postprocess(result);
}

export function normaliseWord(identifier : string) : string {
    return normalise(WordCC, identifier);
}

export function normaliseIdentifier(identifier : string) : string {
    return normalise(IdentifierCC, identifier);
}
 