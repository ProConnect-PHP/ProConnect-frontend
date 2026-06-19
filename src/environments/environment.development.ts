export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:80/api/v1',
  paymentSimulatorEnabled: true,
  realtime: {
    enabled: true,
    key: 'proconnect-key',
    wsHost: '127.0.0.1',
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false,
    authEndpoint: 'http://localhost/api/broadcasting/auth',
  },
  mapbox: {
    accessToken: 'pk.eyJ1IjoiZ3lhYmlzaXRvIiwiYSI6ImNtcG91czhlNDA4NWcycnB5cXo5cmZtNzUifQ.Xr-oAMmAwYGU6aO0wBi5Nw',
    defaultCenter: {
      latitude: -34.9011,
      longitude: -56.1645,
    },
    defaultZoom: 11,
  },
};
