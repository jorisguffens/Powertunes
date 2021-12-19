import * as Comlink from 'comlink';

import shuffle from "./shuffleWorker";
import replace from "./replaceWorker";
import duplicate from "./duplicateWorker";

const main = {
    shuffle,
    replace,
    duplicate
}

Comlink.expose(main);