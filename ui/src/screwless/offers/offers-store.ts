import { Offer } from './types';

import { lazyLoadAndPoll, AsyncReadable } from "@holochain-open-dev/stores";
import { EntryRecord, LazyHoloHashMap } from "@holochain-open-dev/utils";
import { NewEntryAction, Record, ActionHash, EntryHash, AgentPubKey } from '@holochain/client';

import { OffersClient } from './offers-client.js';

export class OffersStore {
  constructor(public client: OffersClient) {}
  
  /** Offer */

  offers = new LazyHoloHashMap((offerHash: ActionHash) =>
    lazyLoadAndPoll(async () => this.client.getOffer(offerHash), 4000)
  );
  
  /** All Offers */

  allOffers = lazyLoadAndPoll(async () => {
    const records = await this.client.getAllOffers();
    return records.map(r => r.actionHash);
  }, 4000);
}
