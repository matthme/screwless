import { sharedStyles } from '@holochain-open-dev/elements';
import '@holochain-open-dev/elements/dist/elements/display-error.js';
import {
  Profile,
  ProfilesClient,
  ProfilesStore,
  profilesStoreContext,
} from '@holochain-open-dev/profiles';
import '@holochain-open-dev/profiles/dist/elements/agent-avatar.js';
import '@holochain-open-dev/profiles/dist/elements/profile-list-item-skeleton.js';
import '@holochain-open-dev/profiles/dist/elements/profile-prompt.js';
import { AsyncStatus, StoreSubscriber } from '@holochain-open-dev/stores';
import {
  ActionHash,
  AppAgentClient,
  AppAgentWebsocket,
} from '@holochain/client';
import { provide } from '@lit-labs/context';
import { localized, msg } from '@lit/localize';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
// Replace 'ligth.css' with 'dark.css' if you want the dark theme
import '@shoelace-style/shoelace/dist/themes/light.css';
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { offersStoreContext } from './screwless/offers/context.js';
import './screwless/offers/elements/all-offers.js';
import './screwless/offers/elements/create-offer.js';
import { OffersClient } from './screwless/offers/offers-client.js';
import { OffersStore } from './screwless/offers/offers-store.js';
import { SlSelect } from '@shoelace-style/shoelace';
import { AIRPORT_LIST } from './screwless/offers/elements/create-offer.js';

type View =
  | { view: 'main' }
  | { view: 'create-offer' }
  | { view: 'offer-detail' };

@localized()
@customElement('holochain-app')
export class HolochainApp extends LitElement {
  @provide({ context: offersStoreContext })
  @property()
  _offersStore!: OffersStore;

  @state() _loading = true;

  @state() _view = { view: 'main' };

  @state()
  selectedAirport: string | undefined;

  @provide({ context: profilesStoreContext })
  @property()
  _profilesStore!: ProfilesStore;

  _client!: AppAgentClient;

  _myProfile!: StoreSubscriber<AsyncStatus<Profile | undefined>>;

  async firstUpdated() {
    this._client = await AppAgentWebsocket.connect('', 'screwless');

    await this.initStores(this._client);

    this._loading = false;
  }

  async initStores(appAgentClient: AppAgentClient) {
    // Don't change this
    this._profilesStore = new ProfilesStore(
      new ProfilesClient(appAgentClient, 'screwless')
    );
    this._myProfile = new StoreSubscriber(
      this,
      () => this._profilesStore.myProfile
    );
    this._offersStore = new OffersStore(
      new OffersClient(appAgentClient, 'screwless')
    );
  }

  renderMyProfile() {
    switch (this._myProfile.value.status) {
      case 'pending':
        return html`<profile-list-item-skeleton></profile-list-item-skeleton>`;
      case 'complete':
        const profile = this._myProfile.value.value;
        if (!profile) return html``;

        return html`<div
          class="row"
          style="align-items: center;"
          slot="actionItems"
        >
          <agent-avatar .agentPubKey=${this._client.myPubKey}></agent-avatar>
          <span style="margin: 0 16px;">${profile?.nickname}</span>
        </div>`;
      case 'error':
        return html`<display-error
          .headline=${msg('Error fetching the profile')}
          .error=${this._myProfile.value.error.data.data}
          tooltip
        ></display-error>`;
    }
  }

  // TODO: add here the content of your application
  renderContent() {
    switch (this._view.view) {
      case 'main':
        return html`
          <div class="column center-content" style="flex: 1;">
            <sl-select
              id="airport-input-field"
              name="airport"
              .label=${msg('Airport')}
              required
              @sl-change=${() => {
                const selectedAirport: string = (
                  this.shadowRoot!.getElementById(
                    'airport-input-field'
                  )! as SlSelect
                ).value as string;
                this.selectedAirport = selectedAirport;
              }}
            >
              ${AIRPORT_LIST.map(
                airport => html`
                  <sl-option value="${airport}">${airport}</sl-option>
                `
              )}
            </sl-select>
            <all-offers
              .airport=${this.selectedAirport}
              style="display: flex; flex: 1;"
              @offer-selected=${() => {this._view = { view: 'offer-detail' }}}
            ></all-offers>
          </div>
          <sl-button
            variant="success"
            style="position: fixed; bottom: 10px; right: 10px;"
            @click=${() => {this._view = { view: 'create-offer'}} }
          >Create Offer</sl-button>
        `;
      case 'create-offer':
        return html`
          <div class="column center-content" style="flex: 1;">
            <create-offer></create-offer>
          </div>
        `
      case 'offer-detail':
        return html`
          <div class="column center-content" style="flex: 1;">
            Contact Person
          </div>
        `
      default:
        return html`hello`;
    }
  }

  renderBackButton() {
    if (this._view.view === 'main') return html``;

    return html`
      <sl-icon-button
        name="arrow-left"
        @click=${() => {
          this._view = { view: 'main' };
        }}
      ></sl-icon-button>
    `;
  }

  render() {
    if (this._loading)
      return html`<div
        class="row"
        style="flex: 1; height: 100%; align-items: center; justify-content: center;"
      >
        <sl-spinner style="font-size: 2rem"></sl-spinner>
      </div>`;

    return html`
      <div class="column fill">
        <div
          class="row"
          style="align-items: center; color:white; background-color: var(--sl-color-primary-900); padding: 16px"
        >
          ${this.renderBackButton()}
          <span class="title" style="flex: 1">${msg('Screwless')}</span>

          ${this.renderMyProfile()}
        </div>

        <profile-prompt style="flex: 1;">
          ${this.renderContent()}
        </profile-prompt>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex: 1;
      }
    `,
    sharedStyles,
  ];
}
