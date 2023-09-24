import { hashProperty, sharedStyles } from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { StoreSubscriber } from '@holochain-open-dev/stores';
import { EntryRecord } from '@holochain-open-dev/utils';
import { ActionHash, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/format-date/format-date.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { offersStoreContext } from '../context';
import { OffersStore } from '../offers-store';
import { Offer } from '../types';

/**
 * @element offer-summary
 * @fires offer-selected: detail will contain { offerHash }
 */
@localized()
@customElement('offer-summary')
export class OfferSummary extends LitElement {
  // REQUIRED. The hash of the Offer to show
  @property(hashProperty('offer-hash'))
  offerHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: offersStoreContext, subscribe: true })
  offersStore!: OffersStore;

  /**
   * @internal
   */
  _offer = new StoreSubscriber(this, () =>
    this.offersStore.offers.get(this.offerHash)
  );

  renderSummary(entryRecord: EntryRecord<Offer>) {
    return html`
      <div style="display: flex; flex-direction: column">
        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg('Amount')}</strong></span
          >
          <span style="white-space: pre-line">${entryRecord.entry.amount}</span>
        </div>

        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg('Offered Currency')}</strong></span
          >
          <span style="white-space: pre-line"
            >${entryRecord.entry.offered_currency}</span
          >
        </div>

        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg('Requested Currency')}</strong></span
          >
          <span style="white-space: pre-line"
            >${entryRecord.entry.requested_currency}</span
          >
        </div>

        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg('Available From')}</strong></span
          >
          <span style="white-space: pre-line"
            ><sl-format-date
              .date=${new Date(entryRecord.entry.available_from / 1000)}
            ></sl-format-date
          ></span>
        </div>

        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg('Available Until')}</strong></span
          >
          <span style="white-space: pre-line"
            ><sl-format-date
              .date=${new Date(entryRecord.entry.available_until / 1000)}
            ></sl-format-date
          ></span>
        </div>

        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg('Airport')}</strong></span
          >
          <span style="white-space: pre-line"
            >${entryRecord.entry.airport}</span
          >
        </div>
      </div>
    `;
  }

  renderOffer() {
    switch (this._offer.value.status) {
      case 'pending':
        return html`<div
          style="display: flex; flex: 1; align-items: center; justify-content: center"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`;
      case 'complete':
        if (!this._offer.value.value)
          return html`<span>${msg("The requested offer doesn't exist")}</span>`;

        return this.renderSummary(this._offer.value.value);
      case 'error':
        return html`<display-error
          .headline=${msg('Error fetching the offer')}
          .error=${this._offer.value.error.data.data}
        ></display-error>`;
    }
  }

  render() {
    return html`<sl-card
      style="flex: 1; cursor: grab;"
      @click=${() =>
        this.dispatchEvent(
          new CustomEvent('offer-selected', {
            composed: true,
            bubbles: true,
            detail: {
              offerHash: this.offerHash,
            },
          })
        )}
    >
      ${this.renderOffer()}
    </sl-card>`;
  }

  static styles = [sharedStyles];
}
