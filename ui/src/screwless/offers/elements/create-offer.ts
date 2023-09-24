import {
  hashProperty,
  hashState,
  notifyError,
  onSubmit,
  sharedStyles,
  wrapPathInSvg,
} from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { EntryRecord } from '@holochain-open-dev/utils';
import {
  ActionHash,
  AgentPubKey,
  DnaHash,
  EntryHash,
  Record,
} from '@holochain/client';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import { mdiAlertCircleOutline, mdiDelete } from '@mdi/js';
import SlAlert from '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/card/card.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import '@shoelace-style/shoelace/dist/components/range/range.js';
import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { offersStoreContext } from '../context.js';
import { OffersStore } from '../offers-store.js';
import { Offer } from '../types.js';

export const CURRENCY_LIST = ["EUR", "USD", "YEN", "CHF", "HOT", "HoloFuel"];
export const AIRPORT_LIST = ["AMS", "LAX", "LHR", "ZRH"];

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
      amount: parseFloat(fields.amount),
      offered_currency: fields.offered_currency,
      requested_currency: fields.requested_currency,
      available_from: new Date(fields.available_from).valueOf() * 1000,
      available_until: new Date(fields.available_until).valueOf() * 1000,
      airport: fields.airport,
    };

    console.log("Offer to be created: ", offer);

    try {
      this.committing = true;
      const record: EntryRecord<Offer> =
        await this.offersStore.client.createOffer(offer);

      this.dispatchEvent(
        new CustomEvent('offer-created', {
          composed: true,
          bubbles: true,
          detail: {
            offerHash: record.actionHash,
          },
        })
      );

      this.form.reset();
    } catch (e: any) {
      console.error(e.data.data);
      notifyError(msg('Error creating the offer'));
    }
    this.committing = false;
  }

  render() {
    return html` <sl-card style="flex: 1;">
      <span slot="header">${msg('Create Offer')}</span>

      <form
        id="create-form"
        style="display: flex; flex: 1; flex-direction: column;"
        ${onSubmit(fields => this.createOffer(fields))}
      >
        <div style="margin-bottom: 16px;">
          <sl-input
            name="amount"
            .label=${msg('Amount')}
            type="number"
            placeholder="Amount"
            required
          ></sl-input>
        </div>

        <div style="margin-bottom: 16px;">
          <sl-select
            name="offered_currency"
            .label=${msg('Offered Currency')}
            required
          >
            ${
              CURRENCY_LIST.map((currency) => html`
              <sl-option value="${currency}">${currency}</sl-option>
              `)
            }
          </sl-select>
        </div>

        <div style="margin-bottom: 16px;">
          <sl-select
          name="requested_currency"
          .label=${msg('Requested Currency')}
            required
          >
            ${
              CURRENCY_LIST.map((currency) => html`
              <sl-option value="${currency}">${currency}</sl-option>
              `)
            }
          </sl-select>
        </div>

        <div style="margin-bottom: 16px;">
          <sl-input
            name="available_from"
            .label=${msg('Available From')}
            type="datetime-local"
            @click=${(e: Event) => e.preventDefault()}
            required
          ></sl-input>
        </div>

        <div style="margin-bottom: 16px;">
          <sl-input
            name="available_until"
            .label=${msg('Available Until')}
            type="datetime-local"
            @click=${(e: Event) => e.preventDefault()}
            required
          ></sl-input>
        </div>

        <div style="margin-bottom: 16px;">
          <sl-select
            name="airport"
            .label=${msg('Airport')}
            required
          >
            ${
              AIRPORT_LIST.map((airport) => html`
              <sl-option value="${airport}">${airport}</sl-option>
              `)
            }
          </sl-select>
        </div>

        <sl-button variant="primary" type="submit" .loading=${this.committing}
          >${msg('Create Offer')}</sl-button
        >
      </form>
    </sl-card>`;
  }

  static styles = [sharedStyles];
}
