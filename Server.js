const express = require('express');
const { exec } = require('child_process');
const { Notion } = require('@neurosity/notion');

const app = express();
const PORT = 3001;

const FOCUS_THRESHOLD = 0.3;

const notion = new Notion();
let currentFocusScore = 0;

async function loginToNeurosity() {
    try {
        await notion.login({
            email: "EMAIL",
            password: "PASSWORD"
        });
        console.log("Logged in to Neurosity");
    } catch (error) {
        console.error("Error logging in:", error);
    }
}

loginToNeurosity();

notion.focus().subscribe(focusData => {
    console.log("Received focus data:", focusData);
    if (focusData && focusData.probability) {
        currentFocusScore = focusData.probability;
        console.log("Updated Focus score:", currentFocusScore);

        if (currentFocusScore > FOCUS_THRESHOLD) {
            console.log("Focus threshold crossed. Executing Flipper command.");
            const flipperCommands = [
                'input send ok press',
                'input send ok short',
                'input send ok release'
            ];
            flipperCommands.forEach(command => {
                exec(`osascript -e 'tell application "Terminal" to do script "${command}" in front window'`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing Flipper command: ${error}`);
                        return;
                    }
                    console.log(`Flipper command output for ${command}: ${stdout}`);
                });
            });
        }
    } else {
        console.log("Focus score data not received or undefined.");
    }
});

app.get('/', (req, res) => {
    res.send('Neurosity Middleware Running');
});

app.get('/focus', (req, res) => {
    res.json({ focusScore: currentFocusScore });
});

app.listen(PORT, () => {
    console.log(`Middleware listening at http://localhost:${PORT}`);
});
