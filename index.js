//
// Time helpers
//

function date2hoursMinutesAm(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const am = hours >= 12 ? "PM" : "AM";
    const trimmedHours = hours % 12;
    return {
        hours: trimmedHours === 0 ? 12 : trimmedHours,
        minutes: minutes,
        am: am
    }
}

function roundTimeMinutes(time) {
    const minutes = parseInt(time.minutes);
    const offset = minutes % 5;
    const roundedMinutes = minutes - offset;
    return {...time, minutes: roundedMinutes}
}

function time2string(time) {
    // To encode time in a string key, format doesn't matter 
    return time.hours + ":" + time.minutes + "." + time.am
}

function getCurrentTimeRounded() {
    const now = new Date();
    return roundTimeMinutes(date2hoursMinutesAm(now))
}

//
// Text input processing
//

function fullTextValidation(n, text) {
    const words = text.split(" ").filter((word) => word !== "");
    if (words.length > n) {
        return {
            isValid: false,
            errorMessage: `Too many words, ${n} is the limit`
        }
    }
    const errors = words
        .map((word, i) => word.length > n ? i : -1)
        .filter((idx) => idx != -1);
    if (errors.length !== 0) {
        const isPlural = errors.length > 1;
        const numbers = errors
            .map((e) => (e + 1))
            .join(", ");
        const errorMessage = [
            isPlural ? "Words" : "Word",
            numbers,
            isPlural ? "are" : "is",
            `too long, ${n} letters is the limit`
        ].join(" ");
        return {
            isValid: false,
            errorMessage: errorMessage
        }
    } else {
        return {isValid: true}
    }
}

// Remove all forbidden characters and capitalize
function incrementalValidation(text) {
    return text
        .split('')
        .filter((char) => char === " " || getAllowedSymbols().includes(char.toLowerCase()))
        .join('')
        .toUpperCase();
}

// Convert any text into a valid one in case user ignores warnings
function cleanUpText(n, text) {
    return text
        .toLowerCase()
        .split(" ")
        .slice(0, n)
        .map(word => {
            return word
                .slice(0, n)
                .split('')
                .filter(char => getAllowedSymbols().includes(char))
                .join('')
        })
        .join(" ");
}

//
// Letter matrix generation functions
//

function getAllowedSymbols() {
    return "abcdefghijklmnopqrstuvwxyz?!&%#$2+-'<>1234567890";
}

function getRandomSymbol() {
    const allowedSymbols = getAllowedSymbols();
    return (allowedSymbols[Math.ceil(Math.random() * (allowedSymbols.length - 1))])
}

function getRandomLine(n) {
    return Array(n).fill().map((_) => getRandomSymbol());
}

function coords2id(x, y) {
    // To encode x and y in string id, format doesn't matter
    return x + ":" + y
}

function generateTimeLettersMatrix(n) {
    // Simply append extra symblos to predfined template
    const generateExtraSymbols = () => Array(n - 11).fill().map(_ => getRandomSymbol());
    const template = 
        [
            ["i", "t", "_", "i", "s", "_", "a", "m", "_", "p", "m"],
            ["a", "_", "_", "q", "u", "a", "t", "e", "r", "_", "_"],
            ["t", "w", "e", "n", "t", "y", "_", "f", "i", "v", "e"],
            ["h", "a", "l", "f", "_", "t", "e", "n", "_", "t", "o"],
            ["p", "a", "s", "t", "_", "_", "n", "i", "n", "e", "_"],
            ["o", "n", "e", "_", "_", "t", "w", "o", "_", "_", "_"],
            ["_", "s", "i", "x", "_", "t", "h", "r", "e", "e", "_"],
            ["f", "o", "u", "r", "_", "f", "i", "v", "e", "_", "_"],
            ["e", "i", "g", "h", "t", "e", "l", "e", "v", "e", "n"],
            ["s", "e", "v", "e", "n", "t", "w", "e", "l", "v", "e"],
            ["t", "e", "n", "_", "o", "'", "c", "l", "o", "c", "k"]
        ]
        .map(line => {
            return line
                .map(symbol => symbol === "_" ? getRandomSymbol() : symbol)
                .concat(generateExtraSymbols())
        })
        .concat(Array(n - 11).fill().map(_ => getRandomLine(n)));
    return template
}

function time2lights(n, time) {
    // Totally based on template in order not to implement clever search
    const hours = time.hours;
    const minutes = time.minutes;
    const am = time.am;

    const isAm = am === "AM";
    const isQuater = [15, 45].includes(minutes);
    const isTwenty = [20, 25, 35, 40].includes(minutes);
    const isFive = [5, 25, 35, 55].includes(minutes);
    const isTen = [10, 50].includes(minutes);
    const isHalf = minutes === 30;
    const isOclock = minutes === 0;
    const isTo = [35, 40, 45, 50, 55].includes(minutes);
    const isPast = [5, 10, 15, 20, 25, 30].includes(minutes);

    const isHour = (h) => {
        if (isTo) {
            const nextHour = hours % 12 + 1; // If it is 12, next hour is 1, not 13
            return nextHour === h
        } else {
            return hours === h
        }
    };
    return [
        [0, 1, 3, 4].concat(isAm ? [6, 7] : [9, 10]),
        isQuater ? [0, 3, 4, 5, 6, 7, 8] : [],
        (isTwenty ? [0, 1, 2, 3, 4, 5] : []).concat(isFive ? [7, 8, 9, 10] : []),
        (isHalf ? [0, 1, 2, 3]: []).concat(isTen ? [5, 6, 7] : []).concat(isTo ? [9, 10] : []),
        (isPast ? [0, 1, 2, 3] : []).concat(isHour(9) ? [6, 7, 8, 9] : []),
        (isHour(1) ? [0, 1, 2] : (isHour(2) ? [5, 6, 7] : [])),
        (isHour(6) ? [1, 2, 3] : (isHour(3) ? [5, 6, 7, 8, 9] : [])),
        (isHour(4) ? [0, 1, 2, 3] : (isHour(5) ? [5, 6, 7, 8] : [])),
        (isHour(8) ? [0, 1, 2, 3, 4] : (isHour(11) ? [5, 6, 7, 8, 9, 10] : [])),
        (isHour(7) ? [0, 1, 2, 3, 4] : (isHour(12) ? [5, 6, 7, 8, 9, 10] : [])),
        (isHour(10) ? [0, 1, 2] : []).concat(isOclock ? [4, 5, 6, 7, 8, 9, 10] : [])
    ]
}

function generateTextLettersMatrixAndLights(n, text) {
    const words = text.split(" ");
    const linesAndlights = words.map((word) => {
        const l = word.length;
        const freeSpace = n - l - 1;
        const offset = Math.ceil(Math.random() * freeSpace);
        const lights = [];
        const line = Array(n).fill()
            .map((_, i) => {
                if (i < offset || i > offset + l - 1) {
                    return getRandomSymbol()
                } else {
                    lights.push(i);
                    return word.charAt(i - offset);
                }
            });
        return {line, lights}
    });
    let linesIdx = 0;
    const lights = Array(n).fill([]);
    const matrix = (
        Array(n).fill()
            .map((_, i) => {
                const llines = linesAndlights.length;
                const getLine = () => {
                    if (linesIdx < llines) {
                        lights[i] = linesAndlights[linesIdx].lights;
                        return linesAndlights[linesIdx++].line;
                    } else {
                        return getRandomLine(n);
                    }
                }
                if (N - i > llines) {
                    return Math.random() > 0.5 ? getLine() : getRandomLine(n);
                } else {
                    return getLine();
                }
            })
    );
    return {matrix, lights};
  }

function setupClocks(id, n) {
    return {
        clocks: document.getElementById(id),
        n: Math.max(n, 11),
        pxPerCell: 10
    }
}

function drawStaticParts(clocks) {
    const viewBoxWidth = clocks.pxPerCell * (clocks.n * 2 + 1);
    clocks.clocks.setAttribute("viewBox", `0 0 ${viewBoxWidth} ${viewBoxWidth}`);
    backgroundRect = document.querySelector("svg > rect");
    backgroundRect.setAttribute("width", viewBoxWidth);
    backgroundRect.setAttribute("height", viewBoxWidth);
}

function setRowLights(clocks, y, positions) {
    Array(clocks.n).fill()
        .map((_, i) => coords2id(i, y))
        .forEach((id, i) => {
            const element = document.getElementById(id);
            if (element !== null) {
                if (positions.includes(i)) {
                    element.classList.add("lightOn");
                } else {
                    element.classList.remove("lightOn");
                }
            }
        });
}

function turnOffLights(clocks) {
    Array(clocks.n).fill()
        .forEach((_, y) => {
            Array(clocks.n).fill()
            .map((_, i) => coords2id(i, y))
            .forEach(id => {
                const element = document.getElementById(id);
                if (element !== null) {
                    element.classList.remove("lightOn");
                }
            });
        });
}

function drawRow(clocks, y, letters) {
    Array(clocks.n).fill()
        .map((_, i) => coords2id(i, y))
        .forEach((id) => {
            const element = document.getElementById(id);
            if (element !== null) {
                clocks.clocks.removeChild(element);
            }
        });
    letters.forEach((letter, i) => drawCell(clocks, i, y, letter))
}

function drawCell(clocks, x, y, letter) {
    // These charachters are ugly in the selected font so we use another font for them
    // That requires another alignment and font-size
    const specialChars = ["?", "!", "'"];
    const isSpecialChar = specialChars.includes(letter);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");

    const idx2px = (idx) => (idx * 2 * clocks.pxPerCell) + (clocks.pxPerCell * 1.5);
    const xpx = idx2px(x);
    const ypx = idx2px(y) + (isSpecialChar ? 5 : 0);
    text.setAttribute("x", xpx);
    text.setAttribute("y", ypx);
    text.setAttribute("id", coords2id(x, y));
    text.textContent = letter;
    if (isSpecialChar) {
        text.setAttribute("font-size", 15);
        text.setAttribute("class", "symbol");
    }
    clocks.clocks.appendChild(text);
}

// Entry point

// State set up
// Clocks mode
const TIME_MODE = 0;
const TEXT_MODE = 1;

let displayMode = TIME_MODE;

function setDisplayMode(mode) {
    if ([TIME_MODE, TEXT_MODE].includes(mode)) {
        displayMode = mode;
    }
}

function getDisplayMode() {
    return displayMode
}

// Notifications storage
const notifications = {};

function addNotification(text, time) {
    const key = time2string(time);
    notifications[key] = text;
}

function getNotification() {
    const key = time2string(getCurrentTimeRounded());
    const notification = notifications[key];
    delete notifications[key];
    return notification;
}

// Changes indicators
const NO_CHANGE = 0;
const CHANGE_TO_TIME = 1;
const CHANGE_TO_TEXT = 2;

const textInput = document.getElementById("text-input");
const textInputError = document.getElementById("text-input-error-message");
const timeHours = document.getElementById("time-hours");
const timeMinutes = document.getElementById("time-minutes");
const timeAmToggle = document.getElementById("time-am-toggle");
const setNowButton = document.getElementById("set-now");
const setAtTimeButton = document.getElementById("set-at-time");
const dismissButton = document.getElementById("dismiss-button");

// Number of elements in row/column. 11 is minimum, otherwise time phrases don't fit
const N = 11;
const clocks = setupClocks("clocks", N);
// Less than a second, so that updates don't overlap
const updatesDelayMs = 900;

drawStaticParts(clocks);
const timeMatrix = generateTimeLettersMatrix(clocks.n);
timeMatrix.forEach((line, i) => drawRow(clocks, i, line));

rxjs.fromEvent(textInput, "input").subscribe(
    (value) => {
        const dirtyValue = textInput.value;
        const cleanValue = incrementalValidation(dirtyValue);
        const newCaretPosition = textInput.selectionStart - (dirtyValue.length - cleanValue.length);
        textInput.value = cleanValue;
        textInput.setSelectionRange(newCaretPosition, newCaretPosition);
        const validation = fullTextValidation(clocks.n, textInput.value);
        if (validation.isValid) {
            textInput.setCustomValidity("");
            textInputError.classList.add("invisible");
        } else {
            textInput.setCustomValidity("invalid");
            textInputError.innerText = validation.errorMessage;
            textInputError.classList.remove("invisible");
        }
    }
);

rxjs.fromEvent(timeAmToggle, "click").subscribe(
    () => {
        if (timeAmToggle.innerText === "AM"){
            timeAmToggle.innerText = "PM"
        } else {
            timeAmToggle.innerText = "AM"
        }
    }
);

rxjs.fromEvent(setNowButton, "click").subscribe(
    () => {
        const text = cleanUpText(clocks.n, textInput.value);
        addNotification(text, getCurrentTimeRounded())
    }
)

rxjs.fromEvent(setAtTimeButton, "click").subscribe(
    () => {
        const text = cleanUpText(clocks.n, textInput.value);
        const hours = timeHours.options[timeHours.selectedIndex].value;
        const minutes = timeMinutes.options[timeMinutes.selectedIndex].value;
        const am = timeAmToggle.innerText;
        addNotification(text, {hours, minutes, am})
    }
);

const timer$ = rxjs.interval(1000)
    .pipe(
        rxjs.map(value => {
            const nextNotification = getNotification();
            if (typeof nextNotification === "undefined") {
                return {
                    type: NO_CHANGE, 
                    trigger: value
                }
            } 
            return {
                type: CHANGE_TO_TEXT,
                text: nextNotification
            }
        })
    );

const dismiss$ = rxjs.fromEvent(dismissButton, "click")
    .pipe(
        rxjs.map(() => {
            return {type: CHANGE_TO_TIME}
        })
    );

rxjs.merge(timer$, dismiss$)
    .pipe(
        rxjs.distinctUntilChanged((previous, current) => {
            const pchange = previous.type;
            if (pchange !== current.type) return false
            if (pchange === CHANGE_TO_TEXT) {
                return previous.text === current.text
            }
            if (pchange === NO_CHANGE) {
                return previous.trigger === current.trigger
            }
        }),
        rxjs.map(changeValue => {
            // Emit observable with a sequence of actions, depending on current mode
            // Actions will be delayed to make transitions smooth
            if (changeValue.type === CHANGE_TO_TEXT) {
                setDisplayMode(TEXT_MODE);
                const matrixAndLights = generateTextLettersMatrixAndLights(clocks.n, changeValue.text);
                turnOffLights(clocks);
                return rxjs.from([
                    () => matrixAndLights.matrix.forEach((line, i) => drawRow(clocks, i, line)),
                    // Extra delay to have time for a backgroung change
                    () => setTimeout(() => matrixAndLights.lights.forEach((line, i) => setRowLights(clocks, i, line), updatesDelayMs))
                ])
            } else if (changeValue.type === CHANGE_TO_TIME && getDisplayMode() === TEXT_MODE) {
                setDisplayMode(TIME_MODE);
                turnOffLights(clocks);
                return rxjs.from([
                    () => timeMatrix.forEach((line, i) => drawRow(clocks, i, line))
                ])
            } else if (getDisplayMode() === TIME_MODE) {
                return rxjs.from([
                    () => time2lights(clocks.n, getCurrentTimeRounded()).forEach((line, i) => {
                        setRowLights(clocks, i, line);
                    })
                ])
            }
            return rxjs.empty()
        }),
        rxjs.concatAll(),
        rxjs.delay(updatesDelayMs)
    )
    .subscribe(action => action());