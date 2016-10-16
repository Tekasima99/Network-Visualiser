'use strict';

class wirelessAP
{
	static get regex() {
		//       MAC             PWR           Beacons     #Data       #/s         Channel         Speed           Enc            Cipher       Auth         ESSID
		return /^([A-F0-9:]+)[ ]+([\-0-9]+)[ ]+([0-9]+)[ ]+([0-9]+)[ ]+([0-9]+)[ ]+([0-9]{1,2})[ ]+([0-9]+e\.?)[ ]+([A-Z0-9]+)[ ]+([A-Z]+)?[ ]+([A-Z]+)?[ ]+(.+)$/;
	}

	static get regexGroups() {
		return {
			'MAC': 1,
			'Power': 2,
			'Beacons': 3,
			'Data': 4,
			'DataRate': 5,
			'Channel': 6,
			'Speed': 7,
			'Encryption': 8,
			'Cipher': 9,
			'Auth': 10,
			'ESSID': 11
		}
	};

	constructor() {
		this.seenFirst = Date.now()/1000;
	}

	update(data) {
		let prevNodeData = this.nodeData;

		let self = wirelessAP;

		this.mac = data[self.regexGroups.MAC];
		this.seenLast = Date.now()/1000;
		this.seenSecondsAgo = 0;
		this.active = true;
		this.encryption = data[self.regexGroups.Encryption];
		this.cipher = data[self.regexGroups.Cipher];
		this.authentication = data[self.regexGroups.Auth];
		this.power = parseInt(data[self.regexGroups.Power]);
		this.beaconCount = parseInt(data[self.regexGroups.Beacons]);
		this.ivCount = parseInt(data[self.regexGroups.Data]);

		var hiddenAP = /<length:[ ]+([0-9]+)>/.exec(data[self.regexGroups.ESSID]);
		if (hiddenAP !== null) {
			const APSSIDLength = parseInt(hiddenAP[1]);

			this.SSID = (APSSIDLength > 0) ? '?'.repeat(APSSIDLength):'?';
			this.SSIDLength = (APSSIDLength > 1) ? APSSIDLength:undefined;
		}
		else {
			this.SSID = data[self.regexGroups.ESSID];
			this.SSIDLength = this.SSID.length;
		}

		this.lastUpdateChangedNodeData = this.isDifferentTo(prevNodeData);
	}

	isDifferentTo(nodeDataCompare) {
		return JSON.stringify(nodeDataCompare) !== JSON.stringify(this.nodeData);
	}

	touch() {
		let prevNodeData = this.nodeData;
		this.seenSecondsAgo = this.calculateSeenSecondsAgo();
		this.active = this.determineIfActive();
		return this.isDifferentTo(prevNodeData);
	}

	determineIfActive () {
		return (this.calculateSeenSecondsAgo() < 120)
	}

	calculateSeenSecondsAgo () {
		return (Date.now()/1000)-this.seenLast;
	}

	get nodeData () {
		return {
			'mac': this.mac,
			'SSID': this.SSID,
			'active': this.determineIfActive(),
			'encryption': this.encryption,
			'power': this.power,
			'size': 17
		}
	}

}

module.exports = wirelessAP;