/**
 * @typedef {import("@minecraft/server").Player} Player
 */

/**
 * @param {string} action
 * @param {unknown} payload
 */
function sendAction(action, payload) {
  const json = JSON.stringify({ action, payload });
  console.warn(`bds_enhancer:${json}`);
}

/**
 * @param {Player} player
 * @param {string} host
 * @param {number} port
 */
export function sendTransferAction(player, host, port) {
  sendAction("transfer", { player: player.name, host, port });
}

/**
 * @param {string} playerName
 * @param {string} reason
 */
export function sendKickAction(playerName, reason) {
  sendAction("kick", { player: playerName, reason });
}

export function sendStopAction() {
  sendAction("stop");
}

export function sendReloadAction() {
  sendAction("reload");
}
