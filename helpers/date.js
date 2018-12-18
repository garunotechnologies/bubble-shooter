// Очищаем текст от лишних символов
let cleanText = function(text) {
    return text.replace(/\r|\n|\t/g, '').trim();
};

//Генератор 4-х случайных чисел
let getRandomInRange = function() {
    return Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000
};

// Разделение числа на разряды
let numFormat = function(n) {
    return (n + "").split("").reverse().join("").replace(/(\d{3})/g, "$1 ").split("").reverse().join("").replace(/^ /, "");
};

// Транслитерация строки с русского на английский
let translit = function(url) {
    let space = '-';
    let text = url.toLowerCase();
    let transl = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h',
        'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': space, 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        ' ': space, '_': space, '`': space, '~': space, '!': space, '@': space,
        '#': space, '$': space, '%': space, '^': space, '&': space, '*': space,
        '(': space, ')': space, '-': space, '\=': space, '+': space, '[': space,
        ']': space, '\\': space, '|': space, '/': space, '.': space, ',': space,
        '{': space, '}': space, '\'': space, '"': space, ';': space, ':': space,
        '?': space, '<': space, '>': space, '№': space
    }

    let result = '';
    let symbol = '';

    for (let i = 0; i < text.length; i++) {

        // Если символ найден в массиве то меняем его
        if (transl[text[i]] != undefined) {
            if (symbol != transl[text[i]] || symbol != space) {
                result += transl[text[i]];
                symbol = transl[text[i]];
            }
        }
        // Если нет, то оставляем так как есть
        else {
            result += text[i];
            symbol = text[i];
        }
    }

    return cleanText(result)
};

module.exports.cleanText = cleanText;
module.exports.numFormat = numFormat;
module.exports.getRandomInRange = getRandomInRange;
module.exports.translit = translit;
