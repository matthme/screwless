import {
  hashProperty,
  sharedStyles,
  wrapPathInSvg,
} from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import { StoreSubscriber } from '@holochain-open-dev/stores';
import { ActionHash, AgentPubKey, EntryHash, Record } from '@holochain/client';
import { consume } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import { mdiInformationOutline } from '@mdi/js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { offersStoreContext } from '../context.js';
import { OffersStore } from '../offers-store.js';
import './offer-summary.js';

/**
 * @element all-offers
 */
@localized()
@customElement('all-offers')
export class AllOffers extends LitElement {
  /**
   * @internal
   */
  @consume({ context: offersStoreContext, subscribe: true })
  offersStore!: OffersStore;

  @property()
  airport: string | undefined;

  /**
   * @internal
   */
  _allOffers = new StoreSubscriber(this, () => this.offersStore.allOffers);

  renderList(hashes: Array<ActionHash>) {
    if (hashes.length === 0)
      return html` <div class="column center-content">
        <sl-icon
          .src=${wrapPathInSvg(mdiInformationOutline)}
          style="color: grey; height: 64px; width: 64px; margin-bottom: 16px"
        ></sl-icon>
        <span class="placeholder">${msg('No offers found')}</span>
      </div>`;

    return html`
      <div style="display: flex; flex-direction: column; flex: 1;">
        ${hashes.map(
          hash =>
            html`<offer-summary
              .airport=${this.airport}
              .offerHash=${hash}
              style="margin-bottom: 16px; display: flex; flex: 1;"
            ></offer-summary>`
        )}
      </div>
    `;
  }

  render() {
    switch (this._allOffers.value.status) {
      case 'pending':
        return html`<div
          style="display: flex; flex: 1; align-items: center; justify-content: center"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`;
      case 'complete':
        return this.renderList(this._allOffers.value.value);
      case 'error':
        return html`<display-error
          .headline=${msg('Error fetching the offers')}
          .error=${this._allOffers.value.error.data.data}
        ></display-error>`;
    }
  }

  static styles = [sharedStyles];
}
