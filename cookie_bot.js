//Cookie Clicker Bot version 1.3
//TODO:
//*Add method for keeping optimum cookies in bank for golden cookie after
//certain period of time, (make second autobuy to get automatically started
//(replace b_int) after that point is reached?)
//*Smarter buying of upgrades/objects (with a goal in mind even?)
//*Use setTimeout instead of setInterval for autobuy/(better?)
//*Start pledge autobuying upon unlock of pledges (trivial, add if statement to
//autobuy upgrade part) (Would only be useful after implementing optimum golden
//cookie amounts)
		
//remember to account for clicking CPS in calculations

var g_int = 0;
var c_int = 0;
var b_int = 0;
var p_int = 0;
var g_timeout = 0;
var oldEffList = [];
var nextPurchase = ["", "", "", ""];
bot_running = false;

function autobuy() {
	//Find object with highest efficiency (time to buy divided by marginal
	//CPS/dollar) and buy it if we can. If the next available upgrade is
	//cheaper, buy that instead.  Will usually get bought after the autobuy
	//cycles through the objects and gets to the most expensive item, is this
	//good or bad?

	var effList = [];
	for (var i in Game.Objects) {
		var me = Game.Objects[i];
		me.autoEff = (me.price / (Game.cookiesPs + Game.computedMouseCps * 1000
					/ 75)) / (me.storedCps / me.price * 1000000);
		effList.push(me.autoEff);
	}

	var bestEff = Math.min.apply(Math, effList);
	var toBuy = Game.ObjectsById[effList.indexOf(bestEff)];

	if (Game.UpgradesInStore[0]) {
		var nextUpgrade = Game.UpgradesInStore[0];
	} else {
		var nextUpgrade = Game.UpgradesById[0];
	}
	//var nextUpgrade = Game.UpgradesInStore[0]; //Old upgrade code, kicks in when Clicktastic unlocked.

	var i = 0; var h = Game.UpgradesInStore.length
	while ((nextUpgrade.desc.indexOf("[Switch]") >= 0 ||
				nextUpgrade.desc.indexOf("[Repeatable]") >= 0) && i < h) {
		nextUpgrade = Game.UpgradesInStore[i];
		i++;
	}

	nextPurchase = [toBuy.name, Math.round(toBuy.price), nextUpgrade.name,
				 nextUpgrade.basePrice, toBuy.price > nextUpgrade.basePrice];
	if (toBuy.price > nextUpgrade.basePrice && 
			Game.cookies > nextUpgrade.basePrice) {
		if (nextUpgrade.name == 'One mind') {
			var realConfirm = window.confirm;
			window.confirm = function() {
				window.confirm=realConfirm;
				return true;
			}
			if (nextUpgrade.desc.indexOf("[Switch]") >= 0 ||
					nextUpgrade.name == 'Elder Pledge') return;
			nextUpgrade.buy();
		}
	}

	if (Game.cookies > toBuy.price) toBuy.buy();
	oldEffList = effList;
}

function autoclicker() {
	Game.ClickCookie();
}

function g_autoclick() {
	if (Game.goldenCookie.life > 0) {
		Game.goldenCookie.click();
	}
}

function g_autoclick2() {
	window.clearTimeout(g_timeout);
	if (Game.goldenCookie.life > 0) {
		Game.goldenCookie.click();
	}
	timeToSpawn = Game.goldenCookie.delay / Game.fps;
	g_timeout = window.setTimeout(g_autoclick2, (timeToSpawn + 1) * 1000);
}

function appease_elders() {
	pledge = Game.Upgrades['Elder Pledge'];
	if (Game.pledgeT < 1 && pledge.unlocked) pledge.buy();
}

function init_bot() {
	if (!bot_running) {
		//g_int = window.setInterval(g_autoclick, 1500);
		c_int = window.setInterval(autoclicker, 75);
		b_int = window.setInterval(autobuy, 1000);
		g_autoclick2();
		bot_running = true;
		//p_int = window.setInterval(appease_elders, 60000);
	}
}

function shutdown_bot() {
	if (bot_running) {
		//window.clearInterval(g_int);
		window.clearTimeout(g_timeout);
		window.clearInterval(c_int);
		window.clearInterval(b_int);
		bot_running = false;
		//window.clearInterval(p_int);
	}
}

shutdown_bot();
init_bot();
