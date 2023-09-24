import { createContext } from '@lit-labs/context';
import { OffersStore } from './offers-store';

export const offersStoreContext = createContext<OffersStore>(
  'hc_zome_offers/store'
);

