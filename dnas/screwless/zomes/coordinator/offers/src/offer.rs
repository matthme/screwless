use hdk::prelude::*;
use offers_integrity::*;
#[hdk_extern]
pub fn create_offer(offer: Offer) -> ExternResult<Record> {
    let offer_hash = create_entry(&EntryTypes::Offer(offer.clone()))?;
    let record = get(offer_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created Offer"))
            ),
        )?;
    let path = Path::from("all_offers");
    create_link(path.path_entry_hash()?, offer_hash.clone(), LinkTypes::AllOffers, ())?;
    let offered_currency_path = Path::from(format!("{}.{}.{}", offer.airport, offer.offered_currency, offer.requested_currency)).typed(LinkTypes::AllOffers)?;
    offered_currency_path.ensure()?;
    create_link(offered_currency_path.path_entry_hash()?, offer_hash.clone(), LinkTypes::AllOffers, ())?;
    Ok(record)
}
#[hdk_extern]
pub fn get_offer(original_offer_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(original_offer_hash.clone(), LinkTypes::OfferUpdates, None)?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_offer_hash = match latest_link {
        Some(link) => ActionHash::from(link.target.clone()),
        None => original_offer_hash.clone(),
    };
    get(latest_offer_hash, GetOptions::default())
}
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateOfferInput {
    pub original_offer_hash: ActionHash,
    pub previous_offer_hash: ActionHash,
    pub updated_offer: Offer,
}
#[hdk_extern]
pub fn update_offer(input: UpdateOfferInput) -> ExternResult<Record> {
    let updated_offer_hash = update_entry(
        input.previous_offer_hash.clone(),
        &input.updated_offer,
    )?;
    create_link(
        input.original_offer_hash.clone(),
        updated_offer_hash.clone(),
        LinkTypes::OfferUpdates,
        (),
    )?;
    let record = get(updated_offer_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly updated Offer"))
            ),
        )?;
    Ok(record)
}
#[hdk_extern]
pub fn delete_offer(original_offer_hash: ActionHash) -> ExternResult<ActionHash> {
    delete_entry(original_offer_hash)
}
