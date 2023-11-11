const api_key = 'INSERT API KEY HERE';

const startTime = 1669136400; //approx release time of patch 12.22 in NA
const jakshoID = 6665;
const unspokenID = 7026;

// input summoner name
// output PUUID from riot
async function getPUUID(summonerName) {
	let response = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${api_key}`);
	let resp_json = await response.json();
	//debugLog(`PUUID of ${summonerName} is ${resp_json['puuid']}`);
	
	return resp_json['puuid'];
}

// get list of up to 100 matches
// input PUUID, query start index, queue type
// output list of match IDs, 0 <= length <= 100
async function getMatchBatch(PUUID, startInd, type) {
	const batchSize = 100;
	let response = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${PUUID}/ids?startTime=${startTime}&type=${type}&start=${startInd}&count=${batchSize}&api_key=${api_key}`);
	let matchBatch = await response.json();
	//debugLog(matchBatch);

	return matchBatch;
}

async function getAllMatches(PUUID, type) {
	let allMatches = [];
	let currInd = 0;
	let currBatch = await getMatchBatch(PUUID, currInd, type);
	
	while(currBatch.length == 100) {
		//debugLog(`batch size of ${currBatch.length}`);
		allMatches = allMatches.concat(currBatch);
		currBatch = await getMatchBatch(PUUID, currInd, type);
		currInd += 100;
	}
	//debugLog(`batch size of ${currBatch.length}`);
	allMatches = allMatches.concat(currBatch);
	
	return allMatches;
}

// input match ID
// output array
// [win team JS count, loss team JS count, personal win w/ JS, personal loss w/ JS]
async function analyzeMatch(matchId, summonerName) {
	let response = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${api_key}`);
	let matchInfo = await response.json();

	//debugLog(matchInfo['info']['participants'][0]['summonerName']);
	//debugLog(matchInfo['info']['participants'][0])

	let output = [0, 0, 0, 0];
	for(let i = 0; i < 10; i++) {
		for(let j = 0; j < 6; j++) {
			if([jakshoID, unspokenID].includes(matchInfo['info']['participants'][i][`item${j}`])) {
				if(matchInfo['info']['participants'][i]['win']) {
					output[0]++;
					if(matchInfo['info']['participants'][0]['summonerName'] == summonerName) {
						output[2]++;
					}
				} else {
					output[1]++;
					if(matchInfo['info']['participants'][0]['summonerName'] == summonerName) {
						output[3]++;
					}
				}
			}
		}
	}
	//debugLog(`${matchId} ${output}`);
	return output;
}

// submit button event listener
const submitButton = document.getElementById('submitButton');
submitButton.addEventListener("click", async function() {
	const queueType = getRadio();
	const summonerName = document.getElementById('SummName').value;
	debugLog(`input summoner name is ${summonerName}`);
	const PUUID = await getPUUID(summonerName);
	debugLog(`PUUID = ${PUUID}`);
	const allMatches = await getAllMatches(PUUID, queueType);
	debugLog(`found ${allMatches.length} matches of type ${queueType}`);

	let winLoss = [0, 0];
	let personalWL = [0, 0]
	for(const match of allMatches) {
		await delay(800);             //limit to < 1 req / second
		let matchResult = await analyzeMatch(match, summonerName);
		winLoss[0] += matchResult[0];
		winLoss[1] += matchResult[1];
		personalWL[0] += matchResult[2];
		personalWL[1] += matchResult[3];
		debugLog('analyzed match');
	}

	debugLog(`the total win/loss of Jak'Sho is ${winLoss[0]}/${winLoss[1]}`);
	let winrate = (100 * winLoss[0]) / (winLoss[0] + winLoss[1]);
	debugLog(`winrate is ${winrate}`);
	debugLog(`your personal win/loss with Jak'Sho is ${personalWL[0]}/${personalWL[1]}`)
});

// get radio button value
function getRadio() {
	let radios = document.getElementsByName('QueueType');
	for(let i = 0; i < radios.length; i++) {
		if(radios[i].checked) {
			debugLog(`selected queue type is ${radios[i].value}`);
			return radios[i].value;
		}
	}

	// none selected, default to all queue types
	return "";
}

function delay(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

// easy way to toggle all console log messages
function debugLog(msg) {
	console.log(msg);
}
