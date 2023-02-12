# Google Calendar Event Notificator
Google カレンダーの変更通知を Slack に飛ばす Google Apps Script

## Setup
1. Enable the Google Apps Script API: https://script.google.com/home/usersettings
2. Clone this repository and `npm install`
3. `npm run clasp -- login`
4. Create new script or set exsisting script ID
  - Create new script:
    1. `npm run clasp -- create --title GoogleCalendarEventNotificator --type standalone --rootDir ./dist`
    2. Create trigger from calendar source
  - Set exsisting script ID:
    1. Create `.clasp.json` file and write `{"scriptId": "<Script ID>", "rootDir": "./dist"}`

## Compile and push script
```
npm run push
```