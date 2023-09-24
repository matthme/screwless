import { LitElement, html } from 'lit';
import { repeat } from "lit/directives/repeat.js";
import { state, property, query, customElement } from 'lit/decorators.js';
import { ActionHash, Record, DnaHash, AgentPubKey, EntryHash } from '@holochain/client';
import { EntryRecord } from '@holochain-open-dev/utils';
import { hashProperty, notifyError, hashState, sharedStyles, onSubmit, wrapPathInSvg } from '@holochain-open-dev/elements';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from "@mdi/js";

import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/range/range.js'
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { OffersStore } from '../offers-store.js';
import { offersStoreContext } from '../context.js';
import { Offer } from '../types.js';

/**
 * @element create-offer
 * @fires offer-created: detail will contain { offerHash }
 */
@localized()
@customElement('create-offer')
export class CreateOffer extends LitElement {

  /**
   * @internal
   */
  @consume({ context: offersStoreContext, subscribe: true })
  offersStore!: OffersStore;

  /**
   * @internal
   */
  @state()
  committing = false;

  /**
   * @internal
   */
  @query('#create-form')
  form!: HTMLFormElement;


  async createOffer(fields: any) {
  
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
      const record: EntryRecord<Offer> = await this.offersStore.client.createOffer(offer);

      this.dispatchEvent(new CustomEvent('offer-created', {
        composed: true,
        bubbles: true,
        detail: {
          offerHash: record.actionHash
        }
      }));
      
      this.form.reset();
    } catch (e: any) {
      console.error(e);
      notifyError(msg("Error creating the offer"));
    }
    this.committing = false;
  }

  render() {
    return html`
      <sl-card style="flex: 1;">
        <span slot="header">${msg("Create Offer")}</span>

        <form 
          id="create-form"
          style="display: flex; flex: 1; flex-direction: column;"
          ${onSubmit(fields => this.createOffer(fields))}
        >  
          <div style="margin-bottom: 16px;">
          <sl-range name="amount" .label=${msg("Amount")} min="0" max="1" step="0.1" ></sl-range>          </div>

          <div style="margin-bottom: 16px;">
          <sl-input name="offered_currency" .label=${msg("Offered Currency")}  required></sl-input>          </div>

          <div style="margin-bottom: 16px;">
          <sl-input name="requested_currency" .label=${msg("Requested Currency")}  required></sl-input>          </div>

          <div style="margin-bottom: 16px;">
          <sl-input name="available_from" .label=${msg("Available From")} type="datetime-local" @click=${(e: Event) => e.preventDefault()}  required></sl-input>          </div>

          <div style="margin-bottom: 16px;">
          <sl-input name="available_until" .label=${msg("Available Until")} type="datetime-local" @click=${(e: Event) => e.preventDefault()}  required></sl-input>          </div>

          <div style="margin-bottom: 16px;">
          <sl-input name="airport" .label=${msg("Airport")}  required></sl-input>          </div>


          <sl-button
            variant="primary"
            type="submit"
            .loading=${this.committing}
          >${msg("Create Offer")}</sl-button>
        </form> 
      </sl-card>`;
  }
  
  static styles = [sharedStyles];
}
