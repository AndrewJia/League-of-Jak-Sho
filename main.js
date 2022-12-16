//const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
//const fetch = require('node-fetch');
//import fetch from 'node-fetch';

const api_key = 'RGAPI-0982a1ae-4980-4d33-84b3-4ed945bbf8fd';

const testSummonerName = 'moustachetacohat';
const testPUUID = 'Rvs-ajlKaiugM3CT4Rw39Jm6THVZqgJjRZAOeI-L0PgxqzguB_LOsXZC0H9oJeuE5NWYJ5auIu7Xsg';

const startTime = 1669136400;

//getPUUID(testSummonerName);
//getMatchBatch(testPUUID, 0, 'ranked');
analyzeMatch('NA1_4499608106');


// input summoner name
// output PUUID from riot
async function getPUUID(summonerName) {
	let response = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${api_key}`);
	let resp_json = await response.json();
	debugLog(`PUUID of ${summonerName} is ${resp_json['puuid']}`);
	
	return resp_json['puuid'];
}

// get list of up to 100 matches
// input PUUID, query start index, queue type
// output list of match IDs, 0 <= length <= 100
async function getMatchBatch(PUUID, startInd, type) {
	let response = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${PUUID}/ids?startTime=${startTime}&type=${type}&start=${startInd}&count=100&api_key=${api_key}`);
	let matchBatch = await response.json();
	debugLog(matchBatch);
	
	return matchBatch;
}

// input match ID
// output array
// [win team JS count, loss team JS count]
async function analyzeMatch(matchId) {
	let response = await fetch(`https://americas.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${api_key}`);
	let matchInfo = await response.json();
	debugLog(matchInfo['info']['participants']);
}

// submit button event listener
const submitButton = document.getElementById('submitButton');
submitButton.addEventListener("click", function() {
	debugLog(`input summoner name is ${document.getElementById('SummName').value}`)
});

// easy way to toggle all console log messages
function debugLog(msg) {
	console.log(msg);
}