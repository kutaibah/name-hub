import { configureResolver } from '@canton-names/resolver';
import { cnsConfig } from './config';

configureResolver({
  mode: cnsConfig.isDemo ? 'demo' : 'live',
  scanApiUrl: cnsConfig.scanApiUrl,
});
