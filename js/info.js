import collectionPhrasesES from './phrases/es.js';
import collectionPhrasesEN from './phrases/en.js';
import collectionPhrasesPT from './phrases/pt.js';
import collectionPhrasesFR from './phrases/it.js';
import collectionDate from './date/date.js';

export default function infoWeb() {
    const lang = langUser();
    const {dayNameRes, day, monthNameRes, year} = getDateFunc(lang);
    
    document.querySelector('.form_language select').value = lang.toLowerCase();
    document.querySelector('.info__date').innerHTML = `${dayNameRes} ${parseDay(day)} ${monthNameRes} ${year}`;
    document.querySelector('.info__phrase').innerHTML = getRandomtPhrase(lang, getStateDay());
    
    setInterval(() => {
        const {hours, minutes, secounds, ampm} = getTimeFunc();
        const {hoursP, minutesP, secoundsP} = parseTime(hours, minutes, secounds);

        document.querySelector('.info__time').innerHTML = `${hoursP}h : ${minutesP}m : ${secoundsP}s ${ampm}`;

        if(hours >= 20 && minutes >= 20 || hours < 5) {
            document.querySelector('.info').classList.add('info__dark');
        } else {
            document.querySelector('.info').classList.remove('info__dark');
        }
        
        if(hours == 0 && minutes == 0 && secounds == 0) { // Si es medianoche, actualiza la fecha
            const {dayNameRes, day, monthNameRes, year} = getDateFunc(lang);
            document.querySelector('.info__date').innerHTML = `${dayNameRes} ${parseDay(day)} ${monthNameRes} ${year}`;
        }
    }, 1000); // Actualizar cada segundo

    const nextUpdate = getRandomInt(120000, 200000); // Entre 2 y 3 minutos

    setInterval(() => {
        document.querySelector('.info__phrase').innerHTML = getRandomtPhrase(lang, getStateDay());
    }, nextUpdate);
}


function getTimeFunc() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const secounds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    return {
        hours,
        minutes,
        secounds,
        ampm,
    };
}
function getDateFunc(lang) {
    const now = new Date();
    const {dayNameRes, monthNameRes} = getDateNames(now.getDay(), now.getMonth(), lang);
    const day = now.getDate();
    const year = now.getFullYear();

    return {
        dayNameRes, 
        day,
        monthNameRes,
        year
    };
}
function langUser() {
    const userLang = localStorage.getItem('language') || navigator.language.toUpperCase(); // Obtiene el idioma del localStorage o el del navegador
    if (userLang != 'ES' && userLang != 'EN' && userLang != 'IT' && userLang != 'PT') {
        localStorage.setItem('language', 'EN');
        return 'EN';
    }

    return userLang; // ES, EN, IT, PT
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (200000 - 120000 + 1)) + 120000;
}
function getRandomtPhrase(langUser, stateDay) {
    let collectionPhrases;
    let stateDayFinal = stateDay + langUser;

    switch(langUser) {
        case 'ES':
            collectionPhrases = collectionPhrasesES[stateDayFinal];
            break;
        case 'EN':
            collectionPhrases = collectionPhrasesEN[stateDayFinal];
            break;
        case 'PT':
            collectionPhrases = collectionPhrasesPT[stateDayFinal];
            break;
        case 'IT':
            collectionPhrases = collectionPhrasesFR[stateDayFinal];
            break;
        default:
            collectionPhrases = collectionPhrasesEN[stateDayFinal];
    }
    return collectionPhrases[Math.floor(Math.random() * collectionPhrases.length)]; // Selecciona una frase aleatoria de la colección
}
function getStateDay() {
    const {hours, minutes, secounds, ampm} = getTimeFunc();

    if ((hours >= 5 && minutes >= 0) && (hours <= 6 && minutes <= 59)) { // Amanecer: Entre las 5:00 y las 6:59
        return 'dawnPhrases';
    } else if ((hours >= 7 && minutes >= 0) && (hours <= 10 && minutes <= 59)) { // Mañana: Entre las 7:00 y las 10:59
        return 'dayPhrases';
    } else if ((hours >= 11 && minutes >= 0) && (hours <= 13 && minutes <= 59)) { // Mediodía: Entre las 11:00 y las 13:59
        return 'middayPhrases';
    } else if ((hours >= 14 && minutes >= 0) && (hours <= 18 && minutes <= 59)) { // Tarde: Entre las 14:00 y las 18:59
        return 'afternoonPhrases';
    } else if ((hours >= 19 && minutes >= 0) && (hours <= 19 && minutes <= 59)) { // Atardecer: Entre las 19:00 y las 19:59
        return 'sunsetPhrases';
    } else { // Noche: Entre las 20:00 y las 4:59
        return 'nightPhrases'; 
    }
}
function getDateNames(dayNumber, monthNumber, lang) {
    const days = collectionDate[`dayNames${lang}`];
    const months = collectionDate[`months${lang}`];
    return {
        dayNameRes: days[dayNumber],
        monthNameRes: months[monthNumber]
    };
    
}
function parseTime(hr, mm, ss) {
    let hoursP = hr >= 0 && hr < 10 ? "0" + hr : hr;
    let minutesP = mm >= 0 && mm < 10 ? "0" + mm : mm;
    let secoundsP = ss >= 0 && ss < 10 ? "0" + ss : ss;
    return { hoursP, minutesP, secoundsP };
}
function parseDay(dd) {
    return dd >= 0 && dd < 10 ? "0" + dd : dd;
}