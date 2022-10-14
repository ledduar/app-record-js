
// imports
import { englishMan, englishWoman, spanishMan, spanishWoman } from "./data/content.js";
import { voicesEdge } from "./data/voices.js";

// variables
const content = document.querySelector('#contenido');
const selectVoices = document.querySelector('#optionVoices');
const containerVoices = document.querySelector('#containerVoices');
const btnPlay = document.querySelector('.btn-play');
const btnStop = document.querySelector('.btn-stop');
const models = document.querySelector('#models');
let voicesSpeech = [];
let inputText = [];
let dragStartIndex;
let indexSort = 0;
const synth = window.speechSynthesis;

// listeners
selectVoices.addEventListener('change', addVoice);
containerVoices.addEventListener('click', addElementText);
content.addEventListener('click', functionsContent);
content.addEventListener('focusin', updateText);
btnPlay.addEventListener('click', playAllText);
btnStop.addEventListener('click', stopSpeech);
models.addEventListener('click', createModel);

// funciones
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = showVoices;
}

detectBrowser();
function detectBrowser() {
    let userAgent = navigator.userAgent.match(/edg/i);
    if (userAgent) {
        models.classList.remove('d-none');
        models.classList.add('d-block');
    }
}

// Habilita el Drag and Drop de los textos
function startDragDrop() {
    const dragListItems = document.querySelectorAll('li');
    dragListItems.forEach(item => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragenter', dragEnter);
        item.addEventListener('dragleave', dragLeave);
        item.addEventListener('dragover', dragOver);
        item.addEventListener('drop', dragDrop);
    })
}

function dragStart() {
    dragStartIndex = + this.getAttribute('data-index');
}

function dragEnter() {
    this.classList.add('over');
}

function dragLeave() {
    this.classList.remove('over');
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop() {
    this.classList.remove('over');
    const dragEndIndex = + this.getAttribute('data-index');

    const textsLocalStorage = JSON.parse(localStorage.getItem('texts')) || [];
    const previousTexts = [...textsLocalStorage];
    const dragStartItem = previousTexts[dragStartIndex]

    textsLocalStorage.splice(dragStartIndex, 1);
    textsLocalStorage.splice(dragEndIndex, 0, dragStartItem);
    textsLocalStorage.forEach((item, index) => item.sort = index);
    localStorage.setItem('texts', JSON.stringify(textsLocalStorage));
    fillElementText();
}

// Crea el modelo o estructura para grabación en inglés
function createModel(e) {
    // Elije el modelo
    if (e.target.hasAttribute('model')) {
        let voices = [];
        let data = [];
        localStorage.setItem('texts', []);
        const model = e.target.getAttribute('model');
        switch (model) {
            case 'model-english-man':
                data = englishMan;
                break;
            case 'model-english-woman':
                data = englishWoman;
                break;
            case 'model-spanish-man':
                data = spanishMan;
                break;
            case 'model-spanish-woman':
                data = spanishWoman;
                break;
            case 'clear-models':
                data = [];
                voices = [];
                break;
            default:
                data = englishMan;
                break;
        }

        // Encuentra el numero de las voces
        if (data.length > 0) {
            data = detectVoice(voicesSpeech, data);
            voices = detectVoice(voicesSpeech, voicesEdge);
        }

        // Configura y muestra el modelo
        localStorage.setItem('texts', JSON.stringify(data));
        localStorage.setItem('voices', JSON.stringify(voices));
        fillElementText();
        showContainerVoices();
    }
}

// Agregar voces al arreglo
function detectVoice(array1, array2) {
    array1.forEach((a1, index) => {
        array2.forEach(a2 => {
            if (a1.name === a2.name) {
                a2.voiceID = index;
            }
        })
    });
    return array2;
}

// Mostrar select con voces del navegador
function showVoices() {
    voicesSpeech = synth.getVoices();
    voicesSpeech.forEach((v, index) => {
        const option = document.createElement('option');
        option.setAttribute('name', v.name);
        option.textContent = v.name;
        option.value = index;
        selectVoices.appendChild(option);
    })
}

// Agregar voces al arreglo
function addVoice(e) {
    let voicesSelected = JSON.parse(localStorage.getItem('voices')) || [];
    const currentOption = e.target.options[e.target.selectedIndex];
    const currentVoice = {
        voiceID: currentOption.value,
        name: currentOption.text
    }
    voicesSelected = [...voicesSelected, currentVoice];
    localStorage.setItem('voices', JSON.stringify(voicesSelected));
    showContainerVoices();
}

// Mostrar voces elegidas en el HTML
showContainerVoices();
function showContainerVoices() {
    clearContainerVoices();
    const voicesLocalStorage = JSON.parse(localStorage.getItem('voices')) || [];
    if (voicesLocalStorage.length > 0) {
        voicesLocalStorage.forEach(v => {
            const buttonVoice = document.createElement('button');
            buttonVoice.setAttribute('voice-id', v.voiceID);
            buttonVoice.innerText = v.name;
            if (v.name.includes("English") || v.name.includes("inglés")) {
                buttonVoice.classList.add('btn-voice-en');
            } else if (v.name.includes("Spanish") || v.name.includes("español")) {
                buttonVoice.classList.add('btn-voice-es');
            } else {
                buttonVoice.classList.add('btn-voice');
            }
            containerVoices.appendChild(buttonVoice);
        })
    }
}

// Limpiar las voces elegidas del HTML
function clearContainerVoices() {
    while (containerVoices.firstChild) {
        containerVoices.removeChild(containerVoices.firstChild)
    }
}

function addElementText(e) {
    if (e.target.getAttribute('voice-id')) {
        let inputText = JSON.parse(localStorage.getItem('texts')) || [];
        if (inputText.length === 0) {
            indexSort = 0;
        }
        const currentInputText = {
            sort: indexSort++,
            voiceID: e.target.getAttribute('voice-id'),
            date: Date.now(),
            rate: 1,
            repeat: 1,
            name: e.target.textContent,
            text: '',
            color: '',
        }
        if (e.target.textContent.includes('English') || e.target.textContent.includes('inglés')) {
            currentInputText.color = 'en'
        } else if (e.target.textContent.includes('Spanish') || e.target.textContent.includes('español')) {
            currentInputText.color = 'es'
        } else {
            currentInputText.color = 'none'
        }
        inputText = [...inputText, currentInputText];
        localStorage.setItem('texts', JSON.stringify(inputText));
        fillElementText();
    }
}

fillElementText();
function fillElementText() {
    clearElementText();
    const textsLocalStorage = JSON.parse(localStorage.getItem('texts')) || [];
    textsLocalStorage.forEach(({ sort, voiceID, date, rate, repeat, name, text, color }) => {
        content.innerHTML += `
        <li class="element-text" draggable="true" data-index="${sort}">
            <div class="text-content">
                <div class="drag-drop-icon">
                    <hr>
                    <hr>
                    <hr>
                </div>
                <button class="btn-play-${color} play">
                    Play
                </button>
                <textarea class="textarea" voice-id="${voiceID}" date=${date} rate="${rate}"
                    rows="1">${text}</textarea>
                <button class="btn-delete" date=${date}>
                    Eliminar
                </button>
                <div class="options">
                    <div>
                        <button date=${date} class="btn-rate less">-</button>
                        <button date=${date} class="btn-rate more">+</button>
                        <span>rate: <span class="font-bold">${rate}</span></span>
                    </div>
                    <div>
                        <button date=${date} class="btn-repeat less">-</button>
                        <button date=${date} class="btn-repeat more">+</button>
                        <span>repeat: <span class="font-bold">${repeat}</span></span>
                    </div>
                </div>
            </div>
            <div class="voices">
                <span id="voice">${name}</span>
            </div>
        </li>
        `;
    })
    startDragDrop();
}

// Limpiar input de texto del HTML
function clearElementText() {
    content.innerHTML = '';
}

// Click en algun lugar del contendio
function functionsContent(e) {
    if (e.target.classList.contains('play')) {
        playText(e);
    } else if (e.target.classList.contains('btn-delete')) {
        deleteText(e);
    } else if (e.target.classList.contains('btn-rate')) {
        changeRate(e);
    } else if (e.target.classList.contains('btn-repeat')) {
        changeRepeat(e);
    }
}

// Reproduce el texto
function playText(e) {
    speechSynthesis.cancel();
    const btnPlay = e.target;
    const textArea = btnPlay.nextElementSibling;
    const text = textArea.value;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Number(textArea.getAttribute('rate'));
    utterance.voice = voicesSpeech[Number(textArea.getAttribute('voice-id'))];
    speechSynthesis.speak(utterance);
}

// Reproduce todo el texto
function playAllText(e) {
    speechSynthesis.cancel();
    const textsLocalStorage = JSON.parse(localStorage.getItem('texts')) || [];
    textsLocalStorage.forEach(({ voiceID, rate, repeat, text }) => {
        let counter = 0;
        while (counter < repeat) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = rate;
            utterance.voice = voicesSpeech[Number(voiceID)];
            speechSynthesis.speak(utterance);
            counter++;
        }
    })
}

function stopSpeech() {
    speechSynthesis.cancel();
}

// Elimina un elemento de texto
function deleteText(e) {
    const { date, textsLocalStorage } = getTextsLocalStorage(e);
    const restTexts = textsLocalStorage.filter(text => text.date !== date)
    localStorage.setItem('texts', JSON.stringify(restTexts));
    fillElementText();
}

// Actualiza el texto cada vez que se escriba en un input
function updateText(e) {
    const { targetDOM, date, textsLocalStorage } = getTextsLocalStorage(e);
    textsLocalStorage.forEach(element => {
        if (element.date === date) {
            targetDOM.addEventListener('input', () => {
                console.log('escribiendo...')
                element.text = targetDOM.value;
                localStorage.setItem('texts', JSON.stringify(textsLocalStorage));
            })
        }
    })
}

// Cambia la velocidad del audio
function changeRate(e) {
    const { targetDOM, date, textsLocalStorage } = getTextsLocalStorage(e);
    textsLocalStorage.forEach(element => {
        if (element.date === date) {
            if (targetDOM.classList.contains('more')) {
                element.rate += 0.1;
                element.rate > 10 ? element.rate = 10 : ''
            } else if (targetDOM.classList.contains('less')) {
                element.rate -= 0.1;
                element.rate < 0 ? element.rate = 0 : ''
            }
            element.rate = Number(element.rate.toFixed(1));
            localStorage.setItem('texts', JSON.stringify(textsLocalStorage));
            fillElementText();
        }
    })
}

function changeRepeat(e) {
    const { targetDOM, date, textsLocalStorage } = getTextsLocalStorage(e);
    textsLocalStorage.forEach(element => {
        if (element.date === date) {
            if (targetDOM.classList.contains('more')) {
                element.repeat += 1;
            } else if (targetDOM.classList.contains('less')) {
                element.repeat -= 1;
                element.repeat < 1 ? element.repeat = 1 : ''
            }
            localStorage.setItem('texts', JSON.stringify(textsLocalStorage));
            fillElementText();
        }
    })
}

function getTextsLocalStorage(e) {
    const targetDOM = e.target;
    const date = Number(targetDOM.getAttribute('date'));
    const textsLocalStorage = JSON.parse(localStorage.getItem('texts')) || [];
    return { targetDOM, date, textsLocalStorage }
}