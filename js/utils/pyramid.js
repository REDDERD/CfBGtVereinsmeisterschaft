// js/utils/pyramid.js
// Pyramiden-Hilfsfunktionen

function getPyramidLevelForPosition(position) {
  let level = 1;
  let posInLevel = position;

  while (posInLevel > level) {
    posInLevel -= level;
    level++;
  }

  return { level, positionInLevel: posInLevel };
}

function buildPyramidLevels(positions) {
  const levels = {};
  let idx = 0;
  let levelNum = 1;

  while (idx < positions.length) {
    const levelPlayers = positions.slice(idx, idx + levelNum);
    levels[`level${levelNum}`] = levelPlayers;
    idx += levelNum;
    levelNum++;
  }

  return levels;
}

function pyramidLevelsToArray(pyramidData) {
  if (!pyramidData) {
    return [];
  }

  const levels = [];
  let levelNum = 1;

  while (pyramidData[`level${levelNum}`]) {
    const levelData = pyramidData[`level${levelNum}`];

    // Firebase stores it as array already!
    if (Array.isArray(levelData)) {
      levels.push(levelData);
    } else if (typeof levelData === "string") {
      // Fallback for string format
      levels.push(levelData.split(","));
    } else {
      console.warn(`Level ${levelNum} unexpected type:`, levelData);
    }
    levelNum++;
  }

  return levels;
}

function flattenPyramidLevels(levels) {
  const flatPositions = [];
  levels.forEach((level) => {
    level.forEach((playerId) => {
      flatPositions.push(playerId);
    });
  });
  return flatPositions;
}

function canChallenge(challengerPos, challengedPos) {
  // Herausforderer muss unter dem Herausgeforderten sein
  if (challengerPos <= challengedPos) return false;

  // Ermittle Level beider Spieler
  const challengerLevel = getPyramidLevelForPosition(challengerPos);
  const challengedLevel = getPyramidLevelForPosition(challengedPos);

  // Maximal 2 Level nach oben herausfordern
  if (challengerLevel.level - challengedLevel.level > 2) return false;

  return true;
}