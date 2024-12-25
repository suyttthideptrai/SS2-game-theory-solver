import React from "react";
import "./style.scss";

export default function PlayerResult({ index, player }) {

  const isPSP = Array.isArray(player?.properties);
  let propertiesData = "";
  
  if (isPSP) {
    propertiesData += player.strategyName + "\n";
    let i = 1;
    for (const property of player.properties) {
      propertiesData += `Value ${i}: ${property}\n`;
      i++;
    }
  }
  
  return (
    <div className="grid-item-container">
      <div className="column">#{index}</div>
      <div className="column player-name">{player.playerName}</div>
      {
        isPSP ? 
        <div className="column">{propertiesData}</div>
        :
        <div className="column">{player.strategyName}</div>
      }
      <div className="column">{player.payoff}</div>
    </div>
  );
}