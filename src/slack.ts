export function postMessage(data: any) {
  const properties = PropertiesService.getScriptProperties()
  const url = properties.getProperty('SLACK_INCOMING_WEBHOOK_URL')
  if (!url)
    throw new Error('Script property SLACK_INCOMING_WEBHOOK_URL is not defined')

  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data),
  })
}
