use hdk::prelude::*;
use holochain::sweettest::*;

use offers_integrity::*;



pub async fn sample_offer_1(conductor: &SweetConductor, zome: &SweetZome) -> Offer {
    Offer {
	  amount: 0.5,
	  offered_currency: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
	  requested_currency: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
	  available_from: 1674053334548000,
	  available_until: 1674053334548000,
	  airport: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
    }
}

pub async fn sample_offer_2(conductor: &SweetConductor, zome: &SweetZome) -> Offer {
    Offer {
	  amount: 1.5,
	  offered_currency: "Lorem ipsum 2".to_string(),
	  requested_currency: "Lorem ipsum 2".to_string(),
	  available_from: 1674059334548000,
	  available_until: 1674059334548000,
	  airport: "Lorem ipsum 2".to_string(),
    }
}

pub async fn create_offer(conductor: &SweetConductor, zome: &SweetZome, offer: Offer) -> Record {
    let record: Record = conductor
        .call(zome, "create_offer", offer)
        .await;
    record
}

