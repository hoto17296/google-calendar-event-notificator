import { getCalendarUpdates } from './calendar'
import { postMessage } from './slack'

function main({ calendarId }: { calendarId: string }) {
  getCalendarUpdates(calendarId).forEach((event) => {
    let username: string, color: string
    switch (event.changeState) {
      case 'created':
        username = 'New calendar event created'
        color = 'good'
        break
      case 'updated':
        username = 'Calendar event updated'
        color = 'warning'
        break
      case 'deleted':
        username = 'Calendar event was cancelled'
        color = 'danger'
        break
    }
    postMessage({
      username,
      fallback: event.summary,
      attachments: [
        {
          color,
          title: event.summary,
          title_link: event.htmlLink,
          text: buildDateTimeString(event.start!, event.end!),
        },
      ],
    })
  })
}

// そのままだと Parcel ビルド時に変数名が minify されてしまうため、
// global オブジェクトに登録することで trigger 設定が正常に動作するようにする
global.main = main

function buildDateTimeString(
  start: GoogleAppsScript.Calendar.Schema.EventDateTime,
  end: GoogleAppsScript.Calendar.Schema.EventDateTime
): string {
  let text = ''
  // 時間指定の予定
  if (start.dateTime && end.dateTime) {
    text += formatDate(new Date(start.dateTime), 'yyyy/MM/dd(A) HH:mm')
    // 同日内の予定
    if (start.dateTime.substring(0, 10) === end.dateTime.substring(0, 10)) {
      text += ' - ' + formatDate(new Date(end.dateTime), 'HH:mm')
    }
    // 日をまたぐ予定
    else {
      text += ' - ' + formatDate(new Date(end.dateTime), 'yyyy/MM/dd(A) HH:mm')
    }
  }
  // 終日予定
  else if (start.date && end.date) {
    const startDate = formatDate(new Date(start.date), 'yyyy/MM/dd(A)')
    const endDate = formatDate(
      // 1日のみの終日予定であっても end.date は翌日の値が得られてしまうため、1日分戻す
      new Date(Date.parse(end.date) - 60 * 60 * 24 * 1000),
      'yyyy/MM/dd(A)'
    )
    text += startDate
    if (startDate !== endDate) text += ' - ' + endDate
  }
  return text
}

function formatDate(date: Date, format: string): string {
  format = format.replace(/yyyy/g, date.getFullYear().toString())
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2))
  format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2))
  format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2))
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2))
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2))
  format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3))
  format = format.replace(/A/g, '日月火水木金土'[date.getDay()])
  return format
}
