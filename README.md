# Google Calendar Event Notificator

## Setup
1. Enable the Google Apps Script API: https://script.google.com/home/usersettings
2. Clone this repository and `npm install`
3. `npm run clasp -- login`
4. Create new script or set exsisting script ID
  - Create new script: `npm run clasp -- create --title GoogleCalendarEventNotificator --type standalone --rootDir ./src`
  - Set exsisting script ID: Create `.clasp.json` file and write `{"scriptId": "<Script ID>", "rootDir": "./src"}`

## Compile and push script
```
npm run clasp -- push
```