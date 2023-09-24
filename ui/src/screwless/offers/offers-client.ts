import { Offer } from './types';

import { 
  AppAgentClient, 
  Record, 
  ActionHash, 
  EntryHash, 
  AgentPubKey,
} from '@holochain/client';
import { isSignalFromCellWithRole, EntryRecord, ZomeClient } from '@holochain-open-dev/utils';

import { OffersSignal } from './types.js';

export class OffersClient extends ZomeClient<OffersSignal> {
  constructor(public client: AppAgentClient, public roleName: string, public zomeName = 'offers') {
    super(client, roleName, zomeName);
  }
  /** Offer */

  async createOffer(offer: Offer): Promise<EntryRecord<Offer>> {
    const record: Record = await this.callZome('create_offer', offer);
    return new EntryRecord(record);
  }
  
  async getOffer(offerHash: ActionHash): Promise<EntryRecord<Offer> | undefined> {
    const record: Record = await this.callZome('get_offer', offerHash);
    return record ? new EntryRecord(record) : undefined;
  }

  deleteOffer(originalOfferHash: ActionHash): Promise<ActionHash> {
    return this.callZome('delete_offer', originalOfferHash);
  }

  async updateOffer(originalOfferHash: ActionHash, previousOfferHash: ActionHash, updatedOffer: Offer): Promise<EntryRecord<Offer>> {
    const record: Record = await this.callZome('update_offer', {
      original_offer_hash: originalOfferHash,
      previous_offer_hash: previousOfferHash,
      updated_offer: updatedOffer
    });
    return new EntryRecord(record);
  }
  

}
