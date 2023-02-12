type CalendarChangeState = 'created' | 'updated' | 'deleted'

export interface CustomCalendarChangeEvent
  extends GoogleAppsScript.Calendar.Schema.Event {
  changeState: CalendarChangeState
}

export function getCalendarUpdates(
  calendarId: string
): CustomCalendarChangeEvent[] {
  if (!Calendar.Events) throw new Error()

  const properties = PropertiesService.getUserProperties()
  const syncToken = properties.getProperty('syncToken') || undefined

  const res = Calendar.Events.list(calendarId, {
    calendarId,
    syncToken,
    showDeleted: true,
  })

  if (res.nextSyncToken) properties.setProperty('syncToken', res.nextSyncToken)

  // syncToken が取得できない場合 (= 初回実行時) は大量のデータを取得してしまうため結果を捨てる
  if (!syncToken) return []

  if (!res.items) return []

  return res.items.map(
    (event) =>
      ({
        changeState: detectChangeState(event),
        ...event,
      } as CustomCalendarChangeEvent)
  )
}

function detectChangeState(
  event: GoogleAppsScript.Calendar.Schema.Event
): CalendarChangeState {
  if (!event.status || !event.created) throw new Error()
  if (event.status === 'cancelled') return 'deleted'
  // 作成と更新の区別がつかないが、作成時刻が10秒以上前であれば「更新」と思われる
  if (Date.now() - Date.parse(event.created) > 10 * 1000) return 'updated'
  return 'created'
}
