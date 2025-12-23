import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';

const isDevelopment = process.env.NODE_ENV === 'development';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: isDevelopment ? 'DRY_RUN' : 'LIVE' }),
    detectBot({
      mode: isDevelopment ? 'DRY_RUN' : 'LIVE',
      allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'],
    }),
    slidingWindow({
      mode: isDevelopment ? 'DRY_RUN' : 'LIVE',
      interval: '2s',
      max: 5,
    }),
  ],
});

export default aj;