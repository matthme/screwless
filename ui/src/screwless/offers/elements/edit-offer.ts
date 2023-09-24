import { LitElement, html } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { state, customElement, property } from 'lit/decorators.js';
import { ActionHash, Record, EntryHash, AgentPubKey } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { hashState, notifyError, sharedStyles, hashProperty, wrapPathInSvg, onSubmit } from '@holochain-open-dev/elements';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from '@mdi/js';

import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';

import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/range/range.js'
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import { OffersStore } from '../offers-store';
import { offersStoreContext } from '../context';
import { Offer } from '../types';

/**
 * @element edit-offer
 * @fires offer-updated: detail will contain { originalOfferHash, previousOfferHash, updatedOfferHash }
 */
@localized()
@customElement('edit-offer')
export class EditOffer extends LitElement {

  // REQUIRED. The hash of the original `Create` action for this Offer
  @property(hashProperty('original-offer-hash'))
  originalOfferHash!: ActionHash;
  
  // REQUIRED. The current Offer record that should be updated
  @property()
  currentRecord!: EntryRecord<Offer>;
  
  /**
   * @internal
   */
  @consume({ context: offersStoreContext })
  offersStore!: OffersStore;

  /**
   * @internal
   */
  @state()
  committing = false;
   

  firstUpdated() {
    this.shadowRoot?.querySelector('form')!.reset();
  }

  async updateOffer(fields: any) {  
    const offer: Offer = { 
      amount: fields.amount,
      offered_currency: fields.offered_currency,
      requested_currency: fields.requested_currency,
      available_from: new Date(fields.available_from).valueOf() * 1000,
      available_until: new Date(fields.available_until).valueOf() * 1000,
      airport: fields.airport,
    };

    try {
      this.committing = true;
      const updateRecord = await this.offersStore.client.updateOffer(
        this.originalOfferHash,
        this.currentRecord.actionHash,
        offer
      );
  
      this.dispatchEvent(new CustomEvent('offer-updated', {
        composed: true,
        bubbles: true,
        detail: {
          originalOfferHash: this.originalOfferHash,
          previousOfferHash: this.currentRecord.actionHash,
          updatedOfferHash: updateRecord.actionHash
        }
      }));
    } catch (e: any) {
      console.error(e);
      notifyError(msg("Error updating the offer"));
    }
    
    this.committing = false;
  }

  render() {
    return html`
      <sl-card>
        <span slot="header">${msg("Edit Offer")}</span>

        <form 
          style="display: flex; flex: 1; flex-direction: column;"
          ${onSubmit(fields => this.updateOffer(fields))}
        >  
          <div style="margin-bottom: 16px">
        <sl-range name="amount" .label=${msg("Amount")} min="0" max="1" step="0.1"  .defaultValue=${ this.currentRecord.entry.amount }></sl-range>          </div>

          <div style="margin-bottom: 16px">
        <sl-input name="offered_currency" .label=${msg("Offered Currency")}  required .defaultValue=${ this.currentRecord.entry.offered_currency }></sl-input>          </div>

          <div style="margin-bottom: 16px">
        <sl-input name="requested_currency" .label=${msg("Requested Currency")}  required .defaultValue=${ this.currentRecord.entry.requested_currency }></sl-input>          </div>

          <div style="margin-bottom: 16px">
        <sl-input name="available_from" .label=${msg("Available From")} type="datetime-local" @click=${(e: Event) => e.preventDefault()}  required .defaultValue=${new Date(this.currentRecord.entry.available_from/1000).toLocaleString()} ></sl-input>          </div>

          <div style="margin-bottom: 16px">
        <sl-input name="available_until" .label=${msg("Available Until")} type="datetime-local" @click=${(e: Event) => e.preventDefault()}  required .defaultValue=${new Date(this.currentRecord.entry.available_until/1000).toLocaleString()} ></sl-input>          </div>

          <div style="margin-bottom: 16px">
        <sl-input name="airport" .label=${msg("Airport")}  required .defaultValue=${ this.currentRecord.entry.airport }></sl-input>          </div>



          <div style="display: flex; flex-direction: row">
            <sl-button
              @click=${() => this.dispatchEvent(new CustomEvent('edit-canceled', {
                bubbles: true,
                composed: true
              }))}
              style="flex: 1;"
            >${msg("Cancel")}</sl-button>
            <sl-button
              type="submit"
              variant="primary"
              style="flex: 1;"
              .loading=${this.committing}
            >${msg("Save")}</sl-button>

          </div>
        </form>
      </sl-card>`;
  }

  static styles = [sharedStyles];
}
