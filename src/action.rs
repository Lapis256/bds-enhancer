use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum Action {
    Reload(EmptyPayload),
    Stop(EmptyPayload),
    Save(EmptyPayload),
    Transfer(TransferPayload),
    Kick(KickByIdPayload),
}

#[derive(Debug, Deserialize)]
pub struct EmptyPayload;

#[derive(Debug, Deserialize)]
pub struct TransferPayload {
    pub player: String,
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Deserialize)]
pub struct KickByIdPayload {
    pub player: String,
    pub reason: String,
}
