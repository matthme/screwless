import {
  hashProperty,
  notifyError,
  sharedStyles,
  wrapPathInSvg,
} from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { StoreSubscriber } from '@holochain-open-dev/stores';
import { EntryRecord } from '@holochain-open-dev/utils';
import { ActionHash, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete, mdiPencil } from '@mdi/js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/format-date/format-date.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { offersStoreContext } from '../context.js';
import { OffersStore } from '../offers-store.js';
import { Offer } from '../types.js';
import './edit-offer.js';

/**
 * @element offer-detail
 * @fires offer-deleted: detail will contain { offerHash }
 */
@localized()
@customElement('offer-detail')
export class OfferDetail extends LitElement {
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

  /**
   * @internal
   */
  @state()
  _editing = false;

  async deleteOffer() {
    try {
      await this.offersStore.client.deleteOffer(this.offerHash);

      this.dispatchEvent(
        new CustomEvent('offer-deleted', {
          bubbles: true,
          composed: true,
          detail: {
            offerHash: this.offerHash,
          },
        })
      );
    } catch (e: any) {
      notifyError(msg('Error deleting the offer'));
      console.error(e);
    }
  }

  renderDetail(entryRecord: EntryRecord<Offer>) {
    return html`<sl-card>
      <div slot="header" style="display: flex; flex-direction: row">
        <span style="font-size: 18px; flex: 1;">${msg('Offer')}</span>

        <sl-icon-button
          style="margin-left: 8px"
          .src=${wrapPathInSvg(mdiPencil)}
          @click=${() => {
            this._editing = true;
          }}
        ></sl-icon-button>
        <sl-icon-button
          style="margin-left: 8px"
          .src=${wrapPathInSvg(mdiDelete)}
          @click=${() => this.deleteOffer()}
        ></sl-icon-button>
      </div>

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
    </sl-card> `;
  }

  render() {
    switch (this._offer.value.status) {
      case 'pending':
        return html`<sl-card>
          <div
            style="display: flex; flex: 1; align-items: center; justify-content: center"
          >
            <sl-spinner style="font-size: 2rem;"></sl-spinner>
          </div>
        </sl-card>`;
      case 'complete':
        const offer = this._offer.value.value;

        if (!offer)
          return html`<span>${msg("The requested offer doesn't exist")}</span>`;

        if (this._editing) {
          return html`<edit-offer
            .originalOfferHash=${this.offerHash}
            .currentRecord=${offer}
            @offer-updated=${async () => {
              this._editing = false;
            }}
            @edit-canceled=${() => {
              this._editing = false;
            }}
            style="display: flex; flex: 1;"
          ></edit-offer>`;
        }

        return this.renderDetail(offer);
      case 'error':
        return html`<sl-card>
          <display-error
            .headline=${msg('Error fetching the offer')}
            .error=${this._offer.value.error.data.data}
          ></display-error>
        </sl-card>`;
    }
  }

  static styles = [sharedStyles];
}
