use hdk::prelude::*;
use offers_integrity::*;
#[hdk_extern]
pub fn get_all_offers(_: ()) -> ExternResult<Vec<Record>> {
    let path = Path::from("all_offers");
    let links = get_links(path.path_entry_hash()?, LinkTypes::AllOffers, None)?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| GetInput::new(
            ActionHash::from(link.target).into(),
            GetOptions::default(),
        ))
        .collect();
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let records: Vec<Record> = records.into_iter().filter_map(|r| r).collect();
    Ok(records)
}


#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GetOffersForPairInput {
    airport: String,
    offered_currency: String,
    requested_currency: String,
}


#[hdk_extern]
pub fn get_offers_for_currency_pair(input: GetOffersForPairInput) -> ExternResult<Vec<Record>> {
    let offered_currency_path = Path::from(format!("{}.{}.{}", input.airport, input.offered_currency, input.requested_currency)).typed(LinkTypes::AllOffers)?;

    let links = get_links(offered_currency_path.path_entry_hash()?, LinkTypes::AllOffers, None)?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| GetInput::new(
            ActionHash::from(link.target).into(),
            GetOptions::default(),
        ))
        .collect();
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let records: Vec<Record> = records.into_iter().filter_map(|r| r).collect();
    Ok(records)
}