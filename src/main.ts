import { getCalendarUpdates } from './calendar'

function main({ calendarId }: { calendarId: string }) {
  getCalendarUpdates(calendarId).forEach((event) => {
    console.log(event)
    // TODO: Notify to Slack
  })
}

// そのままだと Parcel ビルド時に変数名が minify されてしまうため、
// global オブジェクトに登録することで trigger 設定が正常に動作するようにする
global.main = main
