function language(thing = String) {
    let selected = document.getElementById("languages").selectedIndex;
    if (thing != "no-result") {
        if (selected == 1) {
            console.log("Setted: hungarian");
            $("html").attr("lang", "hu");
            /* Hungarian */
            return "hu";
        } else {
            console.log("Setted: english");
            $("html").attr("lang", "en-US");
            return "en-US";
        }
    } else {
        if (selected == 1) {
            /* Hungarian */
            return "Sajnos erre nem találtam adatot az adatbázisunkban.";
        } else {
            return "Unfortunately, I could not find any data on this in our database.";
        }
    }
}

function setLanguage() {
    if (language() == "en-US") {
        $("#button").text("Speak");
        $("#before label em").text("or");
        $("#before input").attr("placeholder", "Enter something here...");
    } else if (language() == "hu") {
        $("#button").text("Beszélj");
        $("#before label em").text("vagy");
        $("#before input").attr("placeholder", "Írj ide valamit...");
    }
}

$(document).ready(function() {
    /* $("#i").change(function() {
        write($("#i").text());
    }); */

    document.getElementById("languages").selectedIndex = "1";
    setLanguage();

    $("#languages").change(function() {
        setLanguage();
    });

    var SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    document.getElementById("button").onclick = () => {
        recognition.lang = language();
        console.log("Language: " + language());
        recognition.start();
        console.log('Ready command.');
    };

    recognition.onspeechend = () => {
        recognition.stop();
    }

    recognition.onnomatch = (event) => {
        write('<div class="answer">Failed to scan audio. Your device may not support the API you are using. :( Error ' + event + '</div>', "i");
    }

    recognition.onerror = (event) => {
        console.log(`Error occurred in recognition: ${event.error}`);
    }

    recognition.onresult = function(event) {
        var current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        /* document.getElementById("before") */
        /* $("#before").before('<p class="answer">' + `Result received: ${transcript}` + '</p>'); */
        console.log(transcript);
        write('<div class="question">' + transcript + '</div>', "i");
        let answer = getanswer(transcript);
        write('<div class="answer">' + answer + '</div>', "i");
        window.scrollTo(0, document.body.scrollHeight);
        let synthesis = window.speechSynthesis;
        let utter = new SpeechSynthesisUtterance();
        utter.lang = language();
        utter.rate = 0.8;
        utter.text = answer;
        synthesis.speak(utter);
        console.log("Found result.");
    };

    $("#i").keypress(function(event) {
        if(event.which == 13) {
            // pressed 'Enter'
            console.log("Pressed enter");
            write('<div class="question">' + $("#i").val() + '</div>', "i");
            write('<div class="answer">' + getanswer($("#i").val()) + '</div>', "i");
            window.scrollTo(0, document.body.scrollHeight);
        }
    });
});

function write(text) {
    $("#before").before(text);
    // IMPORTANT: $("#" + inputID).val("");, if function wite(text, inputID) {...}
}

function toDown(text = String) {
    text = text.toLowerCase();
    text = text.replaceAll("?", "");
    text = text.replaceAll(".", "");
    text = text.replaceAll("!", "");
    text = text.replaceAll(",", "");
    text = text.replaceAll(";", "");
    text = text.replaceAll("'", "");

    return text;
}

function getanswer(q) {
    $("#i").val("");
    // console.log(q);
    let most_relevant = 0;
    let most_relevant_answer = language("no-result");
    let most_relevant_action = undefined;
    if (language() == "hu") {
        
        for (const e in hungarian) { /* e for element */
            // console.log(`${hungarian[e].keywords.length}`);
            let how_many = 0;
            for (let i = 0; i < `${hungarian[e].keywords.length}`; i++) {
                // console.log(`${hungarian[e].keywords[i]}`);
                if (toDown(q).includes(toDown(`${hungarian[e].keywords[i]}`))) {
                    console.log(`keywords[i]: ${hungarian[e].keywords[i]}`);
                    how_many++; 
                }
            }
            if (how_many > most_relevant) {
                most_relevant = how_many;
                most_relevant_answer = `${hungarian[e].answer}`;
            }
        }
    } else {
        for (const e in english) { /* e for element */
            // console.log(`${english[e].keywords.length}`);
            let how_many = 0;
            for (let i = 0; i < `${english[e].keywords.length}`; i++) {
                // console.log(`${english[e].keywords[i]}`);
                if (toDown(q).includes(toDown(`${english[e].keywords[i]}`))) {
                    console.log(`keywords[i]: ${english[e].keywords[i]}`);
                    how_many++; 
                }
            }
            if (how_many > most_relevant) {
                most_relevant = how_many;
                if (`${english[e].action}` != undefined) {
                    most_relevant_action = `${english[e].action}`;
                } else {
                    most_relevant_action = undefined;
                }
                most_relevant_answer = `${english[e].answer}`;
                
            }
        }
    }
    if (most_relevant_action != undefined) {
        $("#center").after("<script>" + most_relevant_action + "</script>");
    }
    return most_relevant_answer;
}

const hungarian = {
    1: {
        query: "Semmi baj, nem gond",
        keywords: ["semmi baj", "nem gond", "semmi probléma", "nem okoz gondot", "nem csinál bajt", "nincs baj", "mindegy, nem kell", "nem tudsz válaszolni?", "miért nem válaszolsz?", "nem működsz", "működj"],
        answer: "Bocsánat. Valószínűleg valami gond akadt a kéréseddel..."
    },
    2: {
        query: "Mi a neved?",
        keywords: ["mi a neved", "hogy hívnak", "ki vagy"],
        answer: "A nevem Ármin. Programozó matematikus és matematikus vagyok. (Szerintem) Jó a matematika és a programozás és szerintem sokkal jobbak a logikai játékok, mint a nem logikaiak."
    }
}

let myBirthday = new Date(2010, 11, 02, 11, 59);
let now = new Date();
// console.log((now-myBirthday)/1000/60/60/24);

const english = {
    1: {
        query: "What is your name?",
        keywords: ["what is your name", "what's your name", "who are you", "your name", "indentify you"],
        answer: "My name is Armin. I'm a programmer mathematician and a mathematician. (I think) the mathematics and the programming is good and I think logic games are much better than non-logic games."
    },
    2: {
        query: "How old are you?",
        keywords: ["how old are you", "your age", "what is your age", "what's your age"],
        action: "now = new Date()",
        answer: "I am " + (now-myBirthday)/1000/60/60/24 + " days old."
    },
    3: {
        query: "What is your favourite color?",
        keywords: ["what is your favourite color", "what's your favourite color", "your favourite color", "what is your favourite colour", "what's your favourite colour", "your favorite colour"],
        answer: "My favourite color is blue. The cornflower blue. It is very good. Tip: look your question's background 😃"
    },
    4: {
        query: "What is your favourite animal?",
        keywords: ["what is your favourite animal", "what's your favourite animal", "your favourite animal", "favourite animal of you"],
        answer: "My favourite animal is bunny, because I have bunny. His name is Jim. He is a boy rabbit, his full name is Ugrifüles Jim. His father's name is Hello Donald von Romanov, his mother's name is Ugrifüles Bee."
    },
    5: {
        query: "What is your favourite book?",
        keywords: ["what is your favourite book", "what's your favourite book", "what are your favourite books", "your favourite book", "favourite book of you", "favourite books of you"],
        answer: "Harry Potter, maybe William Wenton, and many mathematics book 😺. I like mathematics."
    },
    6: {
        query: "Do you have a bunny?",
        keywords: ["do you have a bunny", "have you a bunny", "do you have a rabbit", "do you have bunny", "do you have rabbit"],
        answer: "Yes, I have. I have a rabbit called Jim. His full name is Ugrifüles Jim. But he could be called Jim von Romanov after his dad, as his name is Hello Donald von Romanov. By the way, Jim's mother name is Ugrifüles Bee 🐝"
    },
    7: {
        query: "What is your mother's name?",
        keywords: ["what is your mother's name", "what's your mother's name", "what is your mom's name", "what's your mom's name", "name of your mother", "name of your mom", "who is your mother", "who is your mom", "who is your mommey", "what is your mommey's name", "what's your mommey's name"],
        answer: "My mother name is Gabriella. I call her Mami."
    },
    8: {
        query: "Can you program?",
        keywords: ["can you program", "do you can program", "are you programmer"],
        answer: "I can program, I can in JavaScript, jQuery, Java, HTML, CSS, C++ and I learned SEO, but maybe I am not programmer yet, because I am a child."
    },
    9: {
        query: "Can you say 'hello'?",
        keywords: ["can you say hello", "can you greeting me", "can you greet me", "can you greeting"],
        answer: "Yes, I can. I say 'hello'. Hello! Well, you said that I said 'hello'. Hihihi!"
    },
    10: {
        query: "Open Google Search",
        keywords: ["open Google", "open Google Search", "Google Search"],
        answer: "Opening.",
        action: "window.open('https://google.com/', '_blank');"
    },
    11: {
        query: "Open Gmail",
        keywords: ["open Google Mail", "open Gmail", "Gmail please", "open mail", "open e-mail"],
        answer: "Opening.",
        action: "window.open('https://mail.google.com/', '_blank');"
    },
    12: {
        query: "Open Yahoo!",
        keywords: ["open Yahoo", "open Yahoo Search", "Yahoo please"],
        answer: "Opening.",
        action: "window.open('https://yahoo.com/', '_blank');"
    },
    13: {
        query: "Open Messenger",
        keywords: ["open Messenger", "open Messenger Chat", "Messenger please", "website Messenger", "website of Messenger"],
        answer: "Opening.",
        action: "window.open('https://messenger.com/', '_blank');"
    },
    14: {
        query: "Open Facebook",
        keywords: ["open Facebook", "open Messenger Chat", "Facebook please", "Facebook website", "website of Facebook"],
        answer: "Opening.",
        action: "window.open('https://facebook.com/', '_blank');"
    },
    15: {
        query: "Open DeepL",
        keywords: ["open DeepL", "open DeepL Translator", "DeepL please", "Deepl website", "website of Deepl"],
        answer: "Opening.",
        action: "window.open('https://deepl.com/', '_blank');"
    },
    16: {
        query: "Open Google Translator",
        keywords: ["open Google", "open Google Translator", "open Google Translate", "Translator please", "Google Translator website", "website of Google Translator"],
        answer: "Opening.",
        action: "window.open('https://translate.google.com/', '_blank');"
    },
    17: {
        query: "Open Discord",
        keywords: ["open Discord", "Discord please", "Discord website", "website of Discord", "Discord chat"],
        answer: "Opening.",
        action: "window.open('https://discord.com/', '_blank');"
    }
}
