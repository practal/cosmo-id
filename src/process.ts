import {CosmoConfig, IdentifierCC, Primary} from "./cosmoconfig";

export function preprocess(config : CosmoConfig, id : string): Primary[]  {
    if (!id) return undefined;
    id = id.normalize("NFD");
    var primaries : Primary[] = [];
    let L = id.length;
    var i = 0;
    while (i < L) {
        let primary = id.charCodeAt(i);
        if (!config.isPrimary(primary)) { return undefined; }
        primaries.push(primary);
        i++;
        if (config.isLetter(primary)) {
            while (i < L && config.isAllowedMark(id.charCodeAt(i))) i++;
        }
    }
    return primaries;
}

export function postprocess(primaries : Primary[]): string {
    return String.fromCodePoint(...primaries);
}

export function cleanup(id : string, sep : string = undefined, config : CosmoConfig = IdentifierCC): string {
    let pieces = id.split(/\s+/).filter(piece => piece.length > 0);

    let L = pieces.length;
    if (L == 0) return undefined;
    if (L == 1) return pieces[0];

    var failed = false; 

    let separators = pieces.map(piece => {
        let primaries = preprocess(config, piece);
        if (!primaries) { failed = true; return undefined; }
        if (primaries.length == 0) { return [false, false]; }
        let start = config.isSeparator(primaries[0]);
        let end = config.isSeparator(primaries[primaries.length - 1]);
        return [start, end];
    });

    if (failed) return undefined;
    
    if (!sep) sep = String.fromCodePoint(config.separatorNormalform);
    
    var result = pieces[0];
    for (let i = 0; i+1 < L; i++) {
        let [ , left] = separators[i];
        let [right, ] = separators[i+1];
        if (left && right) { return undefined; }
        else if (left || right) { result += pieces[i+1]; }
        else { result += sep; result += pieces[i+1]; }
    }

    return result;
}