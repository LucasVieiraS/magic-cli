#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import SpellChecker from 'simple-spellchecker';
import { createSpinner } from 'nanospinner';

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

// Spell Check
async function spellCheck(text) {
    function breakWord(sentence) {
        return sentence.split(" ");
    }
    async function pickLanguage() {
        console.clear();
        const answers = await inquirer.prompt({
            name: 'question',
            type: 'list',
            message: 'Pick a language:\n',
            choices: [
                'en-US',
                'en-GB',
                'de-DE',
                'es-ES',
                'es-MX',
                'fr-FR',
                'it-IT',
                'lt-LT',
                'nl-NL',
                'pl-PL',
                'pt-BR',
                'ru-RU',
                'sv-SE',
                'uk-UA',
            ],
        });
    
        return answers.question;
    }

    let language = await pickLanguage();
    let missspeled = false;
    console.clear();

    const spinner = createSpinner('Checking for spell errors...').start();
    await sleep();

    SpellChecker.getDictionary(language, function(err, dictionary) {
        console.clear();
        if (!err) {
            let words = breakWord(text);
            for (let i = 0; i < words.length; i++) {
                let currentWord = words[i].replace(/[^a-z0-9]/gi, '');
                if (currentWord.length > 1) {
                    let misspelled = ! dictionary.spellCheck(currentWord);
                    if (misspelled) {
                        missspeled = true;
                        let suggestions = dictionary.getSuggestions(currentWord);
                        if (suggestions && suggestions.length > 0) {
                            console.log(chalk.red(`Consider changing '${currentWord}' to: `))
                            console.log(chalk.yellow(suggestions.join(", ")));
                            console.log('\n');
                        } else {
                            console.log(chalk.red(`'${currentWord}' is wrong, however a suggestion wasn't found. `));
                        }
                    }
                }
            }
            if (missspeled) {
                spinner.error({
                    text: chalk.red(`Text contains errors!`)
                });
            } else {
                spinner.success({
                    text: chalk.green(`Text doesn't contain errors!`)
                });
            }
            process.exit(0);
        } else {
            console.log(err);
        }
    }); 

}

// Pyramid Builder
async function pyramidBuilder(text) {
    const height = parseInt(text);

    const spinner = createSpinner('Building the pyramid...').start();
    await sleep();

    console.clear();

    spinner.success({
        text: chalk.green(`This is your tower:`)
    });

    for (let row = 0; row < height; row++) {
        for (let column = 0; column < height; column++) {
            if (column < (height - 1)) {
                if (column < (height - (row + 1))) {
                    process.stdout.write(" ");
                } else {
                    process.stdout.write("#");
                }
            } else {
                process.stdout.write("#  #");
                for (let x = 0; x < row; x++) {
                    process.stdout.write("#");
                }
                console.log("\n");
            }
        }
    }

    process.exit(0);

}

// Coleman-Liau Index
async function readability(text) {
    function isalpha(str) {
        var code, i, len;

        for (i = 0, len = str.length; i < len; i++) {
            code = str.charCodeAt(i);
            if (!(code > 47 && code < 58) &&
                !(code > 64 && code < 91) &&
                !(code > 96 && code < 123)) {
                return false;
            }
        }
        return true;
    };
    let sentences = 0,
        words = 1,
        letters = 0;

    for (let i = 0; i < text.length; i++) {
        let currentChar = text.charAt(i);
        if (currentChar == '!' || currentChar == '.' || currentChar == '?') {
            sentences++;
        } else if (currentChar == ' ') {
            words++;
        } else if (isalpha(currentChar)) {
            letters++;
        }
    }

    console.log(chalk.greenBright(`${sentences} SENTENCES...`));
    console.log(chalk.greenBright(`${words} WORDS...`));
    console.log(chalk.greenBright(`${letters} LETTERS...`));

    let L = letters / words * 100;
    let S = sentences / words * 100;

    let index = Math.round(0.0588 * L - 0.296 * S - 15.8);

    const spinner = createSpinner('Getting readability...').start();
    await sleep();

    console.clear();
    console.log(`Index: ${index}`);
    if (index > 16) {
        spinner.success({
            text: chalk.green(`Grade 16+`)
        });
    } else if (index < 1) {
        spinner.error({
            text: chalk.red(`Before Grade 1`)
        });
    } else {
        spinner.success({
            text: chalk.blue(`Grade ${index}`)
        });
    }

    process.exit(0);

}

async function getInput(text, defaultText) {
    const answers = await inquirer.prompt({
        name: 'answer',
        type: 'input',
        message: text,
        default () {
            return defaultText;
        },
    });
    console.log(answers.answer);
    return answers.answer;
}

async function handleAnswer(answer) {
    console.clear();
    if (answer == `Coleman-Liau's Index`) {
        let text = await getInput('Insert text for result:', 'One little bird, two little birds, three little birds');
        return readability(text);
    } else if (answer == `Pyramid Builder`) {
        let height = await getInput('Insert the height for pyramid:', '4');
        return pyramidBuilder(height);
    } else if (answer == `Spell Check`) {
        let text = await getInput('Insert text to check:', 'Good grammar helps you communicate clearly and get what you want. Grammar is the groundwork of clear communication.');
        return spellCheck(text);
    } else {
        process.exit(0);
    }
}

async function handleQuestions() {
    const answers = await inquirer.prompt({
        name: 'question_1',
        type: 'list',
        message: 'Pick one of the functions:\n',
        choices: [
            `Coleman-Liau's Index`,
            `Pyramid Builder`,
            `Spell Check`,
            `None`
        ],
    });

    return handleAnswer(answers.question_1);
}

async function main() {
    console.clear();
    figlet(`Welcome to Magic Cli !\n`, (err, data) => {
        console.log(gradient.retro.multiline(data) + '\n');
        handleQuestions();
    });
};

await main();