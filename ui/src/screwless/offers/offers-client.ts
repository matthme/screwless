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
}
