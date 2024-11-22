const axios = require('axios');
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = process.env.SHEET_NAME;

async function createUser() {
    const response = await axios.post(`${API_BASE_URL}/auth/registration`, {
        username: 'your_username',
    });

    return response.data.token;
}

async function loginUser() {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'your_username',
    });

    return response.data.token;
}

async function getClientsData(token) {
    const response = await axios.get(`${API_BASE_URL}/clients`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}

async function writeToGoogleSheet(data) {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: authClient });

    const rows = data.map(client => [
        client.id,
        client.firstName,
        client.lastName,
        client.gender,
        client.address,
        client.city,
        client.phone,
        client.email,
        client.status,
    ]);

    await googleSheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'RAW',
        resource: {
            values: rows,
        },
    });
}

async function main() {
    try {
        await createUser();

        const token = await loginUser();

        const clientsData = await getClientsData(token);

        await writeToGoogleSheet(clientsData);

        console.log('Data successfully written to Google Sheets');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();