const fs = require('fs');

function testLevels(levels) {
  let allPass = true;
  levels.forEach((lvl, idx) => {
    const num = idx + 1;
    const map = lvl.map;
    if (map.length !== 16) {
      console.error(`[FAIL] Level ${num} has ${map.length} rows (expected 16)`);
      allPass = false;
    }
    let dR = -1, dC = -1, tR = -1, tC = -1, eR = -1, eC = -1;
    map.forEach((row, r) => {
      if (row.length !== 30) {
        console.error(`[FAIL] Level ${num} row ${r} has length ${row.length} (expected 30)`);
        allPass = false;
      }
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === 'D') { dR = r; dC = c; }
        if (ch === 'T') { tR = r; tC = c; }
        if (ch === 'E') { eR = r; eC = c; }
      }
    });

    if (dR === -1 || tR === -1 || eR === -1) {
      console.error(`[FAIL] Level ${num} missing D(${dR}), T(${tR}), or E(${eR})`);
      allPass = false;
      return;
    }

    // Check tile under D
    const under = map[dR + 1] ? map[dR + 1][dC] : 'OOB';
    if (under !== '#' && under !== 'P' && under !== 'B') {
      console.error(`[FAIL] Level ${num} has unsafe tile under Dave at (${dC}, ${dR}): '${under}'`);
      allPass = false;
    }

    // Check head clearance at D
    if (dR > 0 && (map[dR - 1][dC] === '#' || map[dR - 1][dC] === 'P' || map[dR - 1][dC] === 'B')) {
      console.error(`[FAIL] Level ${num} Dave head blocked at (${dC}, ${dR - 1}): '${map[dR - 1][dC]}'`);
      allPass = false;
    }

    console.log(`[PASS] Level ${num}: ${lvl.name} (D at ${dC},${dR} | T at ${tC},${tR} | E at ${eC},${eR})`);
  });

  return allPass;
}

module.exports = { testLevels };
