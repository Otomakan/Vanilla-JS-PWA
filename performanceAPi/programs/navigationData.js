if (performance) {
  const nv = performance.getEntriesByType('navigation')[0]
  const timing = performance.timing

  const totalTime  = nv.duration

  const tcpTime = nv.connectEnd - nv.connectStart
  const tlsTime = nv.connectEnd - nv.secureConnectionStart
  const dnsTime = nv.domainLookupEnd - nv.domainLookupStart

  const fetchTime = nv.responseEnd - nv.fetchStart

  const workerTime = nv.responseEnd - nv.workerStart
  const redirect = nv.redirectEnd - nv.redirectStart

  const timeToFirstByte = nv.responseStart - nv.requestStart
  const downloadTime = nv.responseEnd - nv.responseStart

  const totalTime = nv.responseEnd - nv.requestStart

  const processingTime = timing.domComplete - timing.domLoading
  


}

const getNavigatorData () => {
  const connectionType = navigator.connection
  const userAgent = navigator.userAgent
  const geoLocation = navigator.geolocation
}