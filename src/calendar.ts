type CalendarChangeState = 'created' | 'updated' | 'deleted'

export interface CustomCalendarChangeEvent
  extends GoogleAppsScript.Calendar.Schema.Event {
  changeState: CalendarChangeState
}

/**
 * 変更があったカレンダーイベントを取得する
 * syncToken が存在しない場合 (初回実行時など) は空の結果を返す
 */
export function getCalendarUpdates(
  calendarId: string
): CustomCalendarChangeEvent[] {
  if (!Calendar.Events) throw new Error()

  const properties = PropertiesService.getUserProperties()
  const syncToken =
    properties.getProperty('syncToken') || fetchSyncToken(calendarId)

  let res: GoogleAppsScript.Calendar.Schema.Events
  try {
    res = Calendar.Events.list(calendarId, {
      calendarId,
      syncToken,
      showDeleted: true,
    })
    if (!res.nextSyncToken) throw new Error('nextSyncToken is undefined')
    properties.setProperty('syncToken', res.nextSyncToken)
  } catch (e) {
    properties.deleteProperty('syncToken')
    throw e
  }

  if (!res.items) return []

  return res.items.map(
    (event) =>
      ({
        changeState: detectChangeState(event),
        ...event,
      } as CustomCalendarChangeEvent)
  )
}

/**
 * フルスキャンを実行して syncToken を返す
 */
function fetchSyncToken(calendarId: string): string {
  const now = new Date()
  let res: GoogleAppsScript.Calendar.Schema.Events
  let pageToken: string | undefined = undefined
  // 現在時刻以降のイベントを取得し続ける
  while (true) {
    res = Calendar.Events!.list(calendarId, {
      calendarId,
      pageToken,
      showDeleted: true,
      timeMin: now.toISOString(),
      maxResults: 2500,
    })
    // syncToken が得られたら終了する
    if (res.nextSyncToken) return res.nextSyncToken
    if (!res.nextPageToken) throw new Error()
    pageToken = res.nextPageToken
  }
}

/**
 * イベントデータから変更内容を推定する
 */
function detectChangeState(
  event: GoogleAppsScript.Calendar.Schema.Event
): CalendarChangeState {
  if (!event.status || !event.created) throw new Error()
  if (event.status === 'cancelled') return 'deleted'
  // 作成と更新の区別がつかないが、作成時刻が10秒以上前であれば「更新」と思われる
  if (Date.now() - Date.parse(event.created) > 10 * 1000) return 'updated'
  return 'created'
}
