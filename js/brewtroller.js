Brewtroller = {};
var hosts;
var username = "admin";
var password = "password";
var connected = false;
var lastUpdate = 0;
var storedHost;
var programList = [];
var programStep1;
var programStep2;
var programName1;
var programName2;
var btVersion = 0.0;
var btUnits = "imperial";

//Inspired/Copied from BT Live Project
Brewtroller.progData = function (recipeSlot) {
	//Always stored in same units as BT (btUnits)
	var pSlot = recipeSlot;
	var isLoaded = false;
	
	var name = "";
	var batchVolume = 0;
	
	var grainWeight = 0;
	var mashRatio = 0;
	
	var spargeTemp = 0;
	var hltTemp = 0;
	var pitchTemp = 0;	
	var boilTime = 0;
	
	var strikeHeat = "0"; //TODO: make default user-configurable.
	
	var mashSteps = {
			doughIn:{names: ["Dough In"], time: 0, temp: 0},
			acid:{names: ["Acid Rest"], 	time: 0, temp: 0},
			protein:{names: ["Protein Rest"],	time: 0, temp: 0},
			sacch:{names: ["Saccharification", "Mash In"],	time: 0, temp: 0},
			sacch2:{names: ["Saccharification 2"],	time: 0, temp: 0},
			mashOut:{names: ["Mash Out"],		time: 0, temp: 0}
	};
	var boilAdditions = {
			atboil:{time: "At Boil", state: false, bitmask: 1},
			at105:{time: 105, state: false, bitmask: 2},
			at90:{time: 90,  state: false, bitmask: 4},
			at75:{time: 75,  state: false, bitmask: 8},
			at60:{time: 60,  state: false, bitmask: 16},
			at45:{time: 45,  state: false, bitmask: 32},
			at30:{time: 30,  state: false, bitmask: 64},
			at20:{time: 20,  state: false, bitmask: 128},
			at15:{time: 15,  state: false, bitmask: 256},
			at10:{time: 10,  state: false, bitmask: 512},
			at5:{time: 5,   state: false, bitmask: 1024},
			at0:{time: 0,   state: false, bitmask: 2048}
	};
	
	this.isLoaded = function () {
		return isLoaded;
	};
	this.getPSlot = function () {
		return pSlot;
	};
	this.getBoilAddBitmask = function () {
		var boilBitmask = 0;
		$.each(boilAdditions, function(key, value) {
			if(value.state) boilBitmask =  boilBitmask | value.bitmask;
		});
		return boilBitmask;
	};
	
	this.loadFromGetProgram = function (btResp) { // Takes BTResp object and loads Prog data.
		name = btResp["name"];
		
		batchVolume = parseInt(btResp["batchVolume"])/1000;
		grainWeight = parseInt(btResp["grainWeight"])/1000;
		mashRatio = parseInt(btResp["mashRatio"])/100;
		spargeTemp = parseInt(btResp["spargeTemperature"]);
		hltTemp = parseInt(btResp["hltTemperature"]);
		boilTime = parseInt(btResp["boilMinutes"]);
		pitchTemp = parseInt(btResp["pitchTemperature"]);
		strikeHeat = btResp["strikeHeatSource"]; //TODO: Determine assignment	
		
		mashSteps.doughIn.temp = parseInt(btResp["mashDoughIn_Temperature"]);
		mashSteps.doughIn.time = parseInt(btResp["mashDoughIn_Minutes"]);
		
		mashSteps.acid.temp = parseInt(btResp["mashAcid_Temperature"]);
		mashSteps.acid.time = parseInt(btResp["mashAcid_Minutes"]);
		
		mashSteps.protein.temp = parseInt(btResp["mashProtein_Temperature"]);
		mashSteps.protein.time = parseInt(btResp["mashProtein_Minutes"]);
		
		mashSteps.sacch.temp = parseInt(btResp["mashSacch_Temperature"]);
		mashSteps.sacch.time = parseInt(btResp["mashSacch_Minutes"]);
		
		mashSteps.sacch2.temp = parseInt(btResp["mashSacch2_Temperature"]);
		mashSteps.sacch2.time = parseInt(btResp["mashSacch2_Minutes"]);
		
		mashSteps.mashOut.temp = parseInt(btResp["mashMashOut_Temperature"]);
		mashSteps.mashOut.time = parseInt(btResp["mashMashOut_Minutes"]);
		
		$.each(boilAdditions, function(key, value) {
		    value.state = Boolean(parseInt(btResp["boilAdditions"])&value.bitmask);
		});
		
		isLoaded = true;
	};
	this.genSetProgram = function () { // BROKEN: Generate parameters for SetProgram BT command
        var btParams = {};
        btParams = {
        };
        
        return btParams;
	};
	this.genSetProgramName = function () { // Generate parameters for ProgramName BT command
        var btParams = {};
        btParams = {
	        "Program_Name": name
        };
        return btParams;
	};
	this.genSetProgramSettings = function () { // Generate parameters for ProgramSettings BT command
        var btParams = {};
        btParams = {
		      "Sparge_Temp": spargeTemp,
			  "HLT_Setpoint": hltTemp,
			  "Boil_Mins": boilTime,
			  "Pitch_Temp": pitchTemp,
			  "Boil_Additions": this.getBoilAddBitmask(),
			  "Mash_Liquor_Heat_Source": strikeHeat
        };
        
        return btParams;
	};
	this.genSetProgramVolumes = function () { // Generate parameters for ProgramVolumes BT command
        var btParams = {};
        btParams = {
    		  "Batch_Volume": batchVolume*1000,
    		  "Grain_Weight": grainWeight*1000,
    		  "Mash_Ratio": mashRatio*100
        };
        
        return btParams;
	};
	this.genSetProgramMashTemps = function () { // Generate parameters for ProgramMashTemps BT command
        var btParams = {};
        btParams = {
        	  "Dough_In_Temp": mashSteps.doughIn.temp,
    		  "Acid_Temp": mashSteps.acid.temp,
    		  "Protein_Temp": mashSteps.protein.temp,
    		  "Sacch_Temp": mashSteps.sacch.temp,
    		  "Sacch2_Temp": mashSteps.sacch2.temp,
    		  "Mash_Out_Temp": mashSteps.mashOut.temp
        };
        
        return btParams;
	};
	this.genSetProgramMashMins = function () { // Generate parameters for ProgramMashMins BT command
        var btParams = {};
        btParams = {
        	  "Dough_In_Mins": mashSteps.doughIn.time,
    		  "Acid_Mins": mashSteps.acid.time,
    		  "Protein_Mins": mashSteps.protein.time,
    		  "Sacch_Mins": mashSteps.sacch.time,
    		  "Sacch2_Mins": mashSteps.sacch2.time,
    		  "Mash_Out_Mins": mashSteps.mashOut.time
        };
        
        return btParams;
	};
	  
	this.loadFromBeerXML = function (beerXML) { //Takes BeerXML and loads Prog Data
		var beerJSON = $.xml2json(beerXML, true); //Use extended mode. Not as clean but safer for items that don't always have multiple items (hops/grain/mash steps).
		
		var recipe = beerJSON["RECIPE"][0];
		var xmlMashSteps = recipe["MASH"][0]["MASH_STEPS"][0]["MASH_STEP"];
		var xmlGrains =  recipe["FERMENTABLES"][0]["FERMENTABLE"];
		var xmlHops = recipe["HOPS"][0]["HOP"];
		
		var xmlGrainWeight = 0;
		var xmlGrainRatio = "";
		
		name = recipe["NAME"][0].text.substring(0,19); //Limit to 20Chars.
		batchVolume = Number(correctUnits(parseFloat(recipe["BATCH_SIZE"][0].text), "volume", "metric", btUnits)).toFixed(1);
		spargeTemp = Number(correctUnits(parseFloat(recipe["MASH"][0]["SPARGE_TEMP"][0].text),"temperature","metric", btUnits)).toFixed(0);
		hltTemp = spargeTemp; // Use sparge temp as HLT Target (need to confirm)
		boilTime = parseInt(recipe["BOIL_TIME"][0].text);
		pitchTemp = Number(correctUnits(parseFloat(recipe["PRIMARY_TEMP"][0].text),"temperature","metric", btUnits)).toFixed(0);	
	  	//this.strikeHeat = "0"; //leave at default, not contained in XML  
		
		//Add up the weight of all grains.
		$.each(xmlGrains, function(index, value) {
			  xmlGrainWeight += parseFloat(value["AMOUNT"][0].text);
		});
		grainWeight = Number(correctUnits(xmlGrainWeight,"weight","metric",btUnits)).toFixed(2);
		
		//Get Mash step info
		var stepsLoaded = 0;
		var xmlSteps = xmlMashSteps.length;
		$.each(xmlMashSteps, function(index, mashStep) {
			var stepTime = parseInt(mashStep["STEP_TIME"][0].text);
			var stepTemp = Number(correctUnits(parseFloat(mashStep["STEP_TEMP"][0].text),"temperature","metric", btUnits)).toFixed(0);
			if (index===0) xmlGrainRatio = mashStep["WATER_GRAIN_RATIO"][0].text; //Always taking grain ratio from first mash step (need to confirm)
			
			$.each(mashSteps, function(btIndex, btMashStep) {
				$.each(btMashStep.names, function(btIndex, btMashStepName) {
					if (mashStep["NAME"][0].text == btMashStepName ) { 
						btMashStep.temp = stepTemp;
						btMashStep.time = stepTime;
						stepsLoaded++;
					}
				});
			});
		});
		//if (stepsLoaded != xmlSteps)  //TODO: Tell user that we didn't import some steps.
			
		var ratioUnits = (xmlGrainRatio.lastIndexOf('l/kg')!=-1 ? "metric" : "imperial"); //If not l/kg (metric) default to qt/lbs (imperial). (need to confirm)
		mashRatio = Number(correctUnits(parseFloat(xmlGrainRatio), "ratio", ratioUnits, btUnits).toFixed(2));
		
		//Get boil addition times.
		var hopsLoaded = 0;
		$.each(xmlHops, function(index, xmlHop){
			 var hopTime = parseInt(xmlHop["TIME"][0].text);
			 $.each(boilAdditions, function(btIndex, btHop){ //TODO: Deal with XML hop times that don't exactly match BT hop times.
				 if (btHop.time == hopTime) {
					 btHop.state = true;
					 hopsLoaded++;
				 }
			 });
		});
		
		isLoaded = true;	
	};
};
//Brewtroller Web Init
Brewtroller.init = function () {
  $('#button_connect').on("click", function() {
    Brewtroller.connected.click_buttonConnect();
  });
  $('#connectionModalCancel').on("click", function() {
	Brewtroller.connected.click_buttonConnect();
  });
  $('#settingsSaveBtn').on("click", function() {
    Brewtroller.connected.saveConnectionSettings();
  });
  $('#button_reset').on("click", function() {
	Brewtroller.reset.resetPrograms(0); 
  });
  $('#reboot').on("click", function() {
		Brewtroller.reset.resetPrograms(1); 
	  });
  $('#button_nextStep1').on("click", function () {
	 Brewtroller.program.nextStep("1"); 
  });
  $('#button_nextStep2').on("click", function () {
		 Brewtroller.program.nextStep("2"); 
	  });
  $('.boilControl').on("change", function () {
	  Brewtroller.boil.control(this.name);
  });
  $("#programModalButton").on("click", function () {
	  Brewtroller.program.getProgramList();
  });
//  if ($("#hltGauge")) {
//	  $("#hltGauge").gauge({
//		  min: 32,
//		  max: 180,
//		  label: "164",
//		  unitsLabel: '' + String.fromCharCode(186),
//		  majorTicks: 10,
//		  minorTicks: 10,
//		  bands: [
//		          {color: '#F00', from: 163, to: 166}
//		          ],
//		  majorTickLabel: true,
//		  colorOfCenterCircleFill: "#FF0040"
//	  }).gauge('setValue', 162);
//  }
//  if ($("#mashGauge")) {
//	  $("#mashGauge").gauge({
//		  min: 100,
//		  max: 200,
//		  label: "156",
//		  unitsLabel: '' + String.fromCharCode(186),
//		  majorTicks: 10,
//		  minorTicks: 10,
//		  bands: [
//		          {color: '#F00', from: 153, to: 156}
//		          ],
//		  majorTickLabel: true,
//		  colorOfCenterCircleFill: "#750823"
//	  }).gauge('setValue', 154);
//  }
//  if ($("#boilGauge")) {
//	  $("#boilGauge").gauge({
//		  min: 120,
//		  max: 220,
//		  label: "212",
//		  unitsLabel: '' + String.fromCharCode(186),
//		  majorTicks: 10,
//		  minorTicks: 10,
//		  bands: [
//		          {color: '#F00', from: 211, to: 213}
//		          ],
//		  majorTickLabel: true,
//		  colorOfCenterCircleFill: "#FF0040"
//	  }).gauge('setValue', 200);
//  }
  $("#outputSave").on("click", function () {
	  var outputBitmask = [],
  	  bit;
	  $("[id^=valve] .btn-danger").each(function () {
		  $a="wfwefw";
		  if ($(this).text() === "On") {
			  bit = "1";
		  }else{
			  bit = "0";
		  }
		  outputBitmask += bit;
	  });
  var profileId = $("#valveSelect").val();
  outputDecimal = Brewtroller.valve.bitmaskBinaryDecimalConvert(outputBitmask);
  Brewtroller.valve.setValveProfileConfig(profileId, outputDecimal);
  });
  $("[id^=valve]").each(function () {
	 var idNum = $(this).attr("id").substr(5);
	 $(this).prepend(idNum);
  });
  $("[id^=valve] button").on("click", function () {
	  $("button", $(this).parent()).removeClass("btn-danger").addClass("btn-default");
	  $(this).removeClass("btn-default").addClass("btn-danger");
  });
  Brewtroller.valve.buildValveSelectBox();
  $("#valveSelect").on("change", function() {
	  var valveAddress = $("option:selected", $(this)).val();
	  $("[id^=valve] button:nth-child(2)").removeClass("btn-default").addClass("btn-danger");
	  $("[id^=valve] button:nth-child(1)").removeClass("btn-danger").addClass("btn-default");
	  var valveProfileDetails = Brewtroller.valve.getValveProfileConfig(valveAddress);
	});
  storedHost = localStorage.getItem('btHost');
  if (storedHost) {
    host = storedHost;
    $('#settingsHost').attr('placeholder', host);
    Brewtroller.connected.click_buttonConnect();
  }
  
  //display file contents
  $('#loadBeerXMLButton').on("click", function() {
	  Brewtroller.program.loadBeerXML();
  });
  
  Brewtroller.timer.setup();
  Brewtroller.temp.setup();
  $('#boilZonePanel').hide();
  $("#mashZonePanel").hide();
  $("#powerControl").hide();
  $("#powerSlider").slider().on("slide", function(ev){
	  $("#boilPower").text(ev.value);
	  Brewtroller.boil.control("2", ev.value);
  });
  $("#powerSlider").slider().on("slideStop", function(ev){
	  Brewtroller.boil.control("2", ev.value);
  });
};

//Brewtroller Connected Functions

Brewtroller.connected = {
    click_buttonConnect : function () {
        if (connected) {
            connected = false;
			btVersion = 0;
            $("#button_connect").html("Connect");
            $("#button_connect").css('color', '#777777');
        } else {
            connected = true;
			Brewtroller.connected.loop();
            //Brewtroller.program.getProgramList();
//            $("#beerXMLModalButton").removeAttr("disabled");
//            $("#programModalButton").removeAttr("disabled");
        }
    },    
    loop : function () {
      if(connected === true) {
		  if (btVersion === 0) {
			  brewTrollerExecCommand(BTCMD_GetVersion, null, {}, host, username, password, Brewtroller.status.updateVersion);
		  } else {
			  brewTrollerExecCommand(BTCMD_GetStatus, null, {}, host, username, password, Brewtroller.status.printUI);
		  }
        Brewtroller.connected.checkWatchdog();
        setTimeout(Brewtroller.connected.loop, 750);
        Brewtroller.status.updateStatusBar();
      }
    },
    checkWatchdog : function () {
        var d = new Date();
        if (d.getTime() - lastUpdate > 1000) {
            $("#button_connect").html("Timeout");
            $("#button_connect").css('color', 'red');
            $("#modal_Timeout").modal();
        }else{
        	$("#modal_Timeout").modal("hide");
        }
    },
    connectWatchdog : function () {
    	var d = new Date();
        lastUpdate = d.getTime();
        $("#button_connect").css('color', '#777777');
        $("#button_connect").html("Disconnect");
    },
    saveConnectionSettings : function () {
      host = $('#settingsHost').val();
      $('#settingsHost').text("host");
      localStorage.setItem('btHost',host);
    }
    
};

//Program Functions
Brewtroller.program = {
  getProgramList : function () {
    brewTrollerExecCommand(BTCMD_GetProgramList, null, null, host, username, password, function(data){
    	programList = data;
    	programNumber = 0;
    	$('#recipeDetails table tbody').html("");
    	$.each(data, function(index,value) {
    		if (value !== ">" && value !== "") {
    			var recipeLine = '<tr><td id="programID">';
    			recipeLine += programNumber;
    			recipeLine += '</td><td>';
    			recipeLine += value;
    			recipeLine += '</td><td><button id="';
    			recipeLine += programNumber;
    			recipeLine += '_1" type="button" class="btn btn-default" data-dismiss="modal">Start Program</button>';
    			recipeLine += '</td></tr>';
    			recipeBtnId1 = programNumber + "_1";
    			recipeBtnId2 = programNumber + "_2";
    			$('#recipeDetails table tbody').append(recipeLine);
    			$('#' + recipeBtnId1).on("click", function () {
    				var reci = $(this).attr('id').split("_");
    			  Brewtroller.program.startStep(reci[0] - 1, "0"); 
    			  });
    			$('#' + recipeBtnId2).on("click", function () {
    			  var reci = $(this).attr('id').split("_");
    			  Brewtroller.program.startStep(reci[0] - 1, "0"); 
    			  });
    		}
    		if (index != "Response Code") {
    		  programNumber++;
    		}
    	});
    });
  },
  startStep : function (program, step) {
	  brewTrollerExecCommand(BTCMD_StartStep, step, {"Program_Index": program}, host, username, password, function(data){});
  },
  nextStep : function (zone) {
	  if (programStep1 != "255" && zone==="1") {
		  brewTrollerExecCommand(BTCMD_NextStep, programStep1, null, host, username, password, function(data){});
		}
	  if (programStep2 != "255" && zone==="2") {
		  brewTrollerExecCommand(BTCMD_NextStep, programStep2, null, host, username, password, function(data){});	  
		}
	},
  loadBeerXML : function() {
		//get file object
	      var file = $("#file").get(0).files;
	      if (file) {
	          // create reader
	          var reader = new FileReader();
	          reader.readAsText(file[0]);
	          reader.onload = function(e) {
	              // browser completed reading file - display it
	        	    var beerXML = e.target.result;
	        	    var btProg = new Brewtroller.progData($("#loadProgramNumber").val() - 1);
	        	    btProg.loadFromBeerXML(beerXML);
	        	    brewTrollerExecCommand(BTCMD_SetProgramName, btProg.getPSlot(), btProg.genSetProgramName(), host, username, password, function (data) {}); //TODO: Check response
	        	    brewTrollerExecCommand(BTCMD_SetProgramSettings, btProg.getPSlot(), btProg.genSetProgramSettings(), host, username, password, function (data) {});
	        	    brewTrollerExecCommand(BTCMD_SetProgramVolumes, btProg.getPSlot(), btProg.genSetProgramVolumes(), host, username, password, function (data) {});
	        	    brewTrollerExecCommand(BTCMD_SetProgramMashTemps, btProg.getPSlot(), btProg.genSetProgramMashTemps(), host, username, password, function (data) {});
	        	    brewTrollerExecCommand(BTCMD_SetProgramMashMins, btProg.getPSlot(), btProg.genSetProgramMashMins(), host, username, password, function (data) {});
	        	    /*
	        	    var beerJSON = $.xml2json(beerXML);
	        	    Brewtroller.program.sendRecipeToBrewtroller(beerJSON);
	        	    */
	          };
		   $("#modal_beerXMLLoader").modal("hide"); 
		   //Brewtroller.program.getProgramList(); This is being run before the new program is sent. Why?
	      }
  },
  sendRecipeToBrewtroller : function (beerJSON) {
	  var recipeSlot = $("#loadProgramNumber").val() - 1,
	  	  hopBitMask = "",
	  	  bitMaskHash = [],
	  	  bitMaskSplit,
	  	  hopTimes = [
	  	              "105",
	  	              "90",
	  	              "75",
	  	              "60",
	  	              "45",
	  	              "30",
	  	              "20",
	  	              "15",
	  	              "10",
	  	              "5",
	  	              "0",
	  	              ],
	  	  $i = 1,
	  	  recipe = beerJSON.RECIPE,
	  	  name = recipe.NAME,
	  	  batchSize = Number(correctUnits(parseFloat(beerJSON["RECIPE"]["BATCH_SIZE"]), "volume", "metric", btUnits)).toFixed(1),
	  	  grainWeight = 0,
		  grainRatio = 0,
		  ratio = "",
	  	  doughInTemp = 0, //beerJSON["RECIPE"]["DOUGHINTEMP"],
	  	  doughInTime = "0", //beerJSON["RECIPE"]["DOUGHINMINUTES"],
	  	  acidTemp = 0, //beerJSON["RECIPE"]["ACIDTEMP"],
	  	  acidTime = "0", //beerJSON["RECIPE"]["ACIDMINUTES"],
	  	  proteinTemp = 0,
	  	  proteinTime = "0",
	  	  saccTemp = 0,
	  	  saccTime = "0",
	  	  saccTemp2 = 0,
	  	  saccTime2 = "0",
	  	  mashOutTemp = 0,
	  	  mashOutTime = "0",
	  	  mashArray = [],
	  	  spargeTemp = Number(correctUnits(parseFloat(beerJSON["RECIPE"]["MASH"]["SPARGE_TEMP"]),"temperature","metric", btUnits)).toFixed(0),
	  	  boilTime = parseInt(beerJSON["RECIPE"]["BOIL_TIME"]),
		  chillTemp = Number(correctUnits(parseFloat(beerJSON["RECIPE"]["PRIMARY_TEMP"]),"temperature","metric", btUnits)).toFixed(0);	  

	  $.each(beerJSON["RECIPE"]["FERMENTABLES"]["FERMENTABLE"], function(index, value) {
		  grainWeight = grainWeight + parseFloat(value["AMOUNT"]);
		});
		grainWeight = Number(correctUnits(grainWeight,"weight","metric",btUnits)).toFixed(2);
		
		if (beerJSON["RECIPE"]["MASH"]["MASH_STEPS"]["MASH_STEP"].isArray) { //If MASH_STEP is not array, convert it to one (for further processing).
			mashArray = beerJSON["RECIPE"]["MASH"]["MASH_STEPS"]["MASH_STEP"];
		} else {
			mashArray[0] = beerJSON["RECIPE"]["MASH"]["MASH_STEPS"]["MASH_STEP"];
		}
		$.each(mashArray, function(index, value) {
			if (ratio === "") ratio = value["WATER_GRAIN_RATIO"]; //Use first entry. Need to confirm.
			var stepTime = parseInt(value["STEP_TIME"]);
			var stepTemp = Number(correctUnits(parseFloat(value["STEP_TEMP"]),"temperature","metric", btUnits)).toFixed(0);
			if(value["NAME"] == "Protein Rest") {
				proteinTime = stepTime;
				proteinTemp = stepTemp;
			}else if (value["NAME"] == "Saccharification" || mashArray.length == 1) { //If only one entry use as Saach
				saccTime = stepTime;
				saccTemp = stepTemp;
			}else if (value["NAME"] == "Mash Out") {
				mashOutTemp = stepTemp;
				mashOutTime = stepTime;
			}
	  });
	  if (ratio.lastIndexOf('qt/lb') != -1){
		  ratio = parseFloat(ratio);
		  grainRatio = Number(correctUnits(ratio, "ratio", "imperial", btUnits).toFixed(2));
	  } else if (ratio.lastIndexOf('l/kg')){
		  ratio = parseFloat(ratio);
		  grainRatio = Number(correctUnits(ratio, "ratio", "imperial", btUnits).toFixed(2));
	  }

	  if(beerJSON["RECIPE"]["HOPS"]["HOP"][0]) {
	  $.each(beerJSON["RECIPE"]["HOPS"]["HOP"], function(index, value){
		bitMaskSplit = value["TIME"].split(".");
		bitMaskHash[bitMaskSplit[0]] = "1";
	  });
  	  } else {
  		bitMaskSplit = beerJSON["RECIPE"]["HOPS"]["HOP"]["TIME"].split(".");
		bitMaskHash[bitMaskSplit[0]] = "1";  
  	  }
	  $.each(hopTimes, function (index, value) {
		  if(bitMaskHash[value]) {
			  hopBitMask = hopBitMask + "1";
		  }else{
			  hopBitMask = hopBitMask + "0";
		  }
	  });
	  brewTrollerExecCommand(BTCMD_SetProgramSettings,
			  recipeSlot,
			  {
			      "Sparge_Temp": spargeTemp,
				  "HLT_Setpoint": spargeTemp, //HLT Setpoint
				  "Boil_Mins": boilTime,
				  "Pitch_Temp": chillTemp,
				  "Boil_Additions": hopBitMask,
				  "Mash_Liquor_Heat_Source": "0"
			  },			  
			  host,
			  username,
			  password,
			  function(data){});
    
	  brewTrollerExecCommand(BTCMD_SetProgramName,
			  recipeSlot,
			  {
		  		"Program_Name": name
			  },			  
			  host,
			  username,
			  password,
			  function(data){});
	  
	  brewTrollerExecCommand(BTCMD_SetProgramMashTemps,
			  recipeSlot,
			  {
			  "Dough_In_Temp": doughInTemp,
			  "Acid_Temp": acidTemp,
			  "Protein_Temp": proteinTemp,
			  "Sacch_Temp": saccTemp,
			  "Sacch2_Temp": saccTemp2,
			  "Mash_Out_Temp": mashOutTemp
			  },			  
			  host,
			  username,
			  password,
			  function(data){});
	  
	  brewTrollerExecCommand(BTCMD_SetProgramMashMins,
			  recipeSlot,
			  {
			  "Dough_In_Mins": doughInTime,
			  "Acid_Mins": acidTime,
			  "Protein_Mins": proteinTime,
			  "Sacch_Mins": saccTime,
			  "Sacch2_Mins": saccTime2,
			  "Mash_Out_Mins": mashOutTime
			  },			  
			  host,
			  username,
			  password,
			  function(data){});
	  
	  
	  brewTrollerExecCommand(BTCMD_SetProgramVolumes,
			  recipeSlot,
			  {
			  "Batch_Volume": batchSize,
			  "Grain_Weight": grainWeight,
			  "Mash_Ratio": grainRatio
			  },			  
			  host,
			  username,
			  password,
			  function(data){});
	  
  }  
};
	//Taken from BT Live project
	var correctUnits = function(input, type, currentSystem, targetSystem) {
	 if (currentSystem == targetSystem) return input;
	  if (currentSystem == "metric"){
	    switch (type){
	      case "temperature":
	        return input * (9/5) + 32;
	      case "volume":
	        return input * 0.264;
	      case "weight":
	        return input * 2.204;
	      case "ratio":
	        return input / 0.9464;
	    }
	  } else {
	    switch (type){
	      case "temperature":
	        return (input - 32)/(9.5);
	      case "volume":
	        return input / 0.264;
	      case "weight":
	        return input / 2.204;
	      case "ratio":
  	      return input * 0.9464;
	    }
	  }
	};

//Timer Functions
Brewtroller.timer = {
  setup : function () {
    $('#mashTimerButton').on("click", function() {
      Brewtroller.timer.click_startTimer("mash");
    });
    $('#boilTimerButton').on("click", function() {
      Brewtroller.timer.click_startTimer("boil");
    });
    $.each([ 0 , 1 ], function( index, timerId ){ 
    if (timerId === 0) {vessel = "mash";}
    if (timerId === 1) {vessel = "boil";}
    brewTrollerExecCommand(BTCMD_GetTimerStatus, timerId, null, host, username, password, function(data){
      timerStatus = data.TimerStatus;
      if (timerStatus == "0") {
        $("#" + vessel + "TimerButton").text("Manual Start");
        Brewtroller.timer.printTimer();
      }else{
        $("#" + vessel + "TimerButton").text("Pause");
        Brewtroller.timer.printTimer();
      }
    });
    });
  },
  printTimer : function (id, value, status) {
    var rStatus;
    if(status === 0) {
        rStatus = "Off";
      }else{
        rStatus = "On";
      }
    $(id).html('<small class="text-muted">timer </small><span class="timerText">' + millisecondsToTime(value) + "</span> / " + rStatus);
    },
    click_startTimer : function (vessel) {
      var timerStatus,
      timerId = "",
      setTime = "";
      if (vessel == "mash") {
        timerId = 0;
      } else if (vessel === "boil") {
        timerId = 1;
      }
      brewTrollerExecCommand(BTCMD_GetTimerStatus, timerId, null, host, username, password, function(data){
        timerStatus = data.TimerStatus;
        if (timerStatus == "0") {
          $timer = "werwe";
          brewTrollerExecCommand(BTCMD_StartTimer, timerId, {"TimerStatus": 1}, host, username, password, function(data){
          });
          $("#" + vessel + "TimerButton").text("Pause");
          Brewtroller.timer.printTimer("div_" + vessel + "Timer", "", "1");
        }else{
          $timer = "wwerwe";
          brewTrollerExecCommand(BTCMD_StartTimer, timerId, {"TimerStatus": 0}, host, username, password, function(data){
          });
          $("#" + vessel + "TimerButton").text("Manual Start");
          Brewtroller.timer.printTimer("div_" + vessel + "Timer", "", "0");
        }
      });
      
    },
    click_setTimer : function (vessel) {
        var timerId,
        	  setTime,
        	  hours,
        	  minutes;
        if (vessel == "mash") {
          timerId = 0;
          hours = $("#mashHours").val();
          minutes = $("#mashMinutes").val();
          milliseconds = hoursMinutesToMilliseconds(hours, minutes);
        } else if (vessel == "boil") {
          timerId = 1;
          hours = $("#boilHours").val();
          minutes = $("#boilMinutes").val();
          milliseconds = hoursMinutesToMilliseconds(hours, minutes);
        } else {
          alert("Unable To Set Timer");
        }
        brewTrollerExecCommand(BTCMD_SetTimerValue, timerId, {"TimerValue": milliseconds}, host, username, password, function(data){
          });
        
      }
};

//Temp Functions
Brewtroller.temp = {
    setup : function() {
      $('#hltTempSetBtn').on("click", function () {
        temp = $('#hltSetTemp').val();
        Brewtroller.temp.setTemp(0, temp);
      });
      $('#mashTempSetBtn').on("click", function () {
        temp = $('#mashSetTemp').val();
        Brewtroller.temp.setTemp(1, temp);
      });
    },
    setTemp : function (vessel, temp) {
            brewTrollerExecCommand(BTCMD_SetSetpoint, vessel, {"Setpoint":temp}, host, username, password, function(data){
      });
    }  
};

//Reset Functions
Brewtroller.reset = {
	resetPrograms : function(type) {
		brewTrollerExecCommand(BTCMD_Reset, type, null, host, username, password, function(data){
	    });
		$('.program1Name').html('No Program Selected');
		$('.program2Name').html('No Program Selected');
	}
};

//Status Functions
Brewtroller.status = {
	updateVersion : function (data) {
		btVersion = parseFloat(data["btVersion"]);
		btUnits = (data["metric"]=="0" ? "metric" : "imperial");
		Brewtroller.connected.connectWatchdog();
	},
	updateStatusBar : function () {
		if(programName2 !== "255" && programName2 !== "") {
			$('#boilZonePanel').show();
//			$('#button_nextStep').show();
//			$('#button_reset').show();
		}else{
			$('#boilZonePanel').hide();
		}
		if(programName1 !== "255" && programName1 !== "") {
			$('#mashZonePanel').show();
//			$('#button_nextStep').show();
//			$('#button_reset').show();
		}else{
			$('#mashZonePanel').hide();
//			$('#button_nextStep').hide();
//			$('#button_reset').hide();
		}
		if(programName1 !== "") {
			$("#mashZonePanel .panel-title").html(programName1);
		}
		if(programName2 !== "") {
			$("#boilZonePanel .panel-title").html(programName2);
		}
		if(programStep1 == "255") {
			$("#mashZonePanel .panel-title").html('No Program Selected');
			}
		if(programStep2 == "255") {
			$("#boilZonePanel .panel-title").html('No Program Selected');
			}
		$('#currStatusProg1').html(Brewtroller.status.translateStepCode(programStep1));
		$('#currStatusProg2').html(Brewtroller.status.translateStepCode(programStep2));
	},
	translateStepCode : function (step) {
		var stepTranslate = {
							"0": "Fill",
							"1": "Delay",
							"2": "Preheat",
							"3": "Grain In",
							"4": "Refill",
							"5": "Dough In",
							"6": "Acid",
							"7": "Protein",
							"8": "Sacch",
							"9": "Sacch2",
							"10": "Mash Out",
							"11":"Mash Hold",
							"12": "Sparge",
							"13": "Boil",
							"14": "Chill",
							"255": "Idle"
							};
		return stepTranslate[step];
	},
	printUI : function (data) {
		$('#tempStatus').html(data["Mash_Zone_Active_Program_Recipe"]);
		programName1 = data["Program1_Name"];
		programName2 = data["Program2_Name"];
		programStep1 = data["Program1_Step"];
		programStep2 = data["Program2_Step"];
		$("#div_status").html("<pre>" + JSON.stringify(data, null, '\t') + "</pre>");
        printProgramThread("#div_programThread1", data.Program1_Step, data.Program1_Name);
        printProgramThread("#div_programThread2", data.Program2_Step, data.Program2_Name);
        Brewtroller.timer.printTimer("#div_mashTimer", data.Mash_TimerValue, data.Mash_TimerStatus);
        Brewtroller.timer.printTimer("#div_boilTimer", data.Boil_TimerValue, data.Boil_TimerStatus);
        printAlarm("#button_alarm", data.alarmStatus);
        //Brewtroller.status.printTemperature("#hltGauge", data.HLT_Temperature);
        Brewtroller.status.printTemperature("#div_hltTemperature", data.HLT_Temperature);
        printSetpoint("#div_hltSetpoint", data.HLT_Setpoint);
        printHeatPower("#div_hltHeatPower", data.HLT_HeatPower);
		printVolume("#div_hltVolume", data.HLT_Volume);
		printTargetVolume("#div_hltTargetVolume", data.HLT_TargetVolume);
		printFlowRate("#div_hltFlowRate", data.HLT_FlowRate);
		//Brewtroller.status.printTemperature("#mashGauge", data.Mash_Temperature);
		Brewtroller.status.printTemperature("#div_mashTemperature", data.Mash_Temperature);
        printSetpoint("#div_mashSetpoint", data.Mash_Setpoint);
        printHeatPower("#div_mashHeatPower", data.Mash_HeatPower);
		printVolume("#div_mashVolume", data.Mash_Volume);
		printTargetVolume("#div_mashTargetVolume", data.Mash_TargetVolume);
		printFlowRate("#div_mashFlowRate", data.Mash_FlowRate);
		//Brewtroller.status.printTemperature("#boilGauge", data.Kettle_Temperature);
		Brewtroller.status.printTemperature("#div_kettleTemperature", data.Kettle_Temperature);
        printSetpoint("#div_kettleSetpoint", data.Kettle_Setpoint);
        printHeatPower("#div_kettleHeatPower", data.Kettle_HeatPower);
		printVolume("#div_kettleVolume", data.Kettle_Volume);
		printTargetVolume("#div_kettleTargetVolume", data.Kettle_TargetVolume);
		printFlowRate("#div_kettleFlowRate", data.Kettle_FlowRate);
		printBoilControl("#div_boilControl", data.Boil_ControlState);
	    Brewtroller.valve.printOutputProfiles("#div_outputProfiles", data.profileStatus);
		printOutputStatus("#div_outputStatus", data.outputStatus);
		if (data.Boil_ControlState === "2") {
			$("#powerControl").show();
			$("#boilManual").parent().button("toggle");
		}else if (data.Boil_ControlState === "1") {
			$("#powerControl").hide();
			$("#boilAuto").parent().button("toggle");
		}else{
			$("#powerControl").hide();
			$("#boilOff").parent().button("toggle");
		}
        Brewtroller.connected.connectWatchdog();
    },
    
    printTemperature : function (id, temperature)
    {
    	//temperature = temperature / 100.0;
    	//$(id).gauge('setValue', temperature);
    	$(id).html('<small class="text-muted">temp </small><span class="vesselTemp">' + (temperature == 4294934528 ? "N/A" : (temperature / 100.0 + '&deg;F</span> ')));
    }
	};


// Boil Control Functions
Brewtroller.boil = {
	control : function (control, percentage) {
		var controlMode,
			controlPercentage;
		if (control == "boilOff") {
			controlMode = 0;
			controlPercentage = 0;
			$("#powerControl").hide();
		}else if (control == "boilAuto") {
			controlMode = 1;
			controlPercentage = 0;
			$("#powerControl").hide();
		}else{
			controlMode = 2;
			if (percentage) { 
				controlPercentage = percentage;
			}else{
			controlPercentage = 100;
			}	
			$("#powerControl").show();
		}
		brewTrollerExecCommand(BTCMD_SetBoilControl, null, {"Control_Mode":controlMode, "Percentage":controlPercentage}, host, username, password, function(data){
			$("#powerSlider").slider('setValue', controlPercentage);
			$("#boilPower").text(controlPercentage);
			
		});
	}
};

// Valve Control Functions
Brewtroller.valve = {
		bitmaskDecimalBinaryConvert : function (bitmask) {
			var binary = parseInt(bitmask, 10).toString(2);
			return binary;
		},
		
		bitmaskBinaryDecimalConvert : function (bitmask) {
			var decimal = parseInt(bitmask, 2);
			return decimal;
		},
		
		binaryToProfileTranslate : function (binary) {
			var binaryArray = binary.split(""),
			activeProfiles = [];
			binaryArray.reverse();
			$.each(binaryArray, function (index, value) {
				if (value === "1") {
					var activeIndex = Brewtroller.valve.profileTranslateDivId(index);
					activeProfiles.push(activeIndex);
				}
			});
			return activeProfiles;
		},
		
		profileTranslateNme : function (profileBitmask) {
		bitmaskName = {
				"1": "Fill HLT",
				"2": "Fill Mash",
				"4": "Add Grain",
				"8": "Mash Heat",
				"16": "Mash Idle",
				"32": "Sparge In",
				"64": "Sparge Out",
				"128": "Boil Additions",
				"256": "Kettle Lid",
				"512": "Chiller H20",
				"1024":"Chiller Beer",
				"2048": "Boil Recirc",
				"4096": "Drain",
				"81920": "HLT Heat",
				"16384": "HLT Idle",
				"32768": "Kettle Heat",
				"65536": "Kettle Idle",
				"131072": "User 1",
				"262144": "User 2",
				"524288": "User 3"
				};
		return bitmaskName[profileBitmask];
	},
	
	profileTranslateDivId : function (profileBitmask) {
		bitmaskIdName = {
				"0": "fillHLT",
				"1": "fillMash",
				"2": "addGrain",
				"3": "mashHeat",
				"4": "mashIdle",
				"5": "spargeIn",
				"6": "spargeOut",
				"7": "boilAdditions",
				"8": "kettleLid",
				"9": "chillerH20",
				"10":"chillerBeer",
				"11": "boilRecirc",
				"12": "drain",
				"13": "hltHeat",
				"14": "hltIdle",
				"15": "kettleHeat",
				"16": "kettleIdle",
				"17": "user1",
				"18": "user2",
				"19": "user3"
				};
		return bitmaskIdName[profileBitmask];
	},
    
	buildValveSelectBox : function () 
    {
    	var bitmaskName = {
				"0": "Fill HLT",
				"1": "Fill Mash",
				"2": "Add Grain",
				"3": "Mash Heat",
				"4": "Mash Idle",
				"5": "Sparge In",
				"6": "Sparge Out",
				"7": "Boil Additions",
				"8": "Kettle Lid",
				"9": "Chiller H20",
				"10":"Chiller Beer",
				"11": "Boil Recirc",
				"12": "Drain",
				"13": "HLT Heat",
				"14": "HLT Idle",
				"15": "Kettle Heat",
				"16": "Kettle Idle",
				"17": "User 1",
				"18": "User 2",
				"19": "User 3"
				},
    	valveSelectList = [];
    	$.each(bitmaskName, function ( index, value ) {
    		$("#valveSelect").append('<option value="' + index + '">' + value + '</option>');
    	});
    },
	
	printOutputProfiles : function(id, status)
    {
		$(".valveBtn button").removeClass("btn-danger").addClass("btn-default");
		var binary = Brewtroller.valve.bitmaskDecimalBinaryConvert(status),
			activeProfiles = Brewtroller.valve.binaryToProfileTranslate(binary);
		$.each(activeProfiles, function(index, value) {
			$("#" + value).removeClass("btn-default").addClass("btn-danger");
		});
	},
    
    getValveProfileConfig : function (valveProfile) {
    	var currValveProfile;
    	currValveProfile = brewTrollerExecCommand(BTCMD_GetValveProfileConfig,
    						   valveProfile,
    						   null,
    							host,
    							username,
    							password,
    							function(data){
    								splitDecimal = Brewtroller.valve.bitmaskDecimalBinaryConvert(data.Valves);
    								var mask = splitDecimal.split('');
    								$.each(mask, function (index, value) {
    									if (value === "1") {
    										index++;
    										$("#valve" + index + " button:first").removeClass("btn-default").addClass("btn-danger");
    										$("#valve" + index + " button:nth-child(2)").removeClass("btn-danger").addClass("btn-default");
    									} else {
    										index++;
    										$("#valve" + index + " button:first").removeClass("btn-danger").addClass("btn-default");
    										$("#valve" + index + " button:nth-child(2)").removeClass("btn-default").addClass("btn-danger");
    									}
    								});
    							});
    },
    setValveProfileConfig : function (profileId, bitmask) {
    	brewTrollerExecCommand(
    			BTCMD_SetValveProfileConfig,
    			profileId,
    			{"Valve_Bits" : bitmask},
    			host,
    			username,
    			password,
    			function(data){}
    			);
    }
};

//Command Helper Functions
function brewTrollerExecCommand(cmdObj, index, params, host, user, pwd, callback){
	var command = cmdObj.reqCode;
	if (cmdObj.reqIndex) {
		command += index;
	}
	command += brewtrollerParseRequestParameters(cmdObj, params);
	$.ajax({
		url: "http://" + host + "/btnic.cgi",
//		beforeSend: function (xhr) {
//           if(user != null) {
//                xhr.withCredentials = true;
//                var tok = user + ':' + password;
//                var hash = btoa(tok);
//                xhr.setRequestHeader("Authorization", "Basic " + hash);
//           }
//		},
		data: command,
		dataType: "json",
		success:function(result){
			var object = brewTrollerParseResponse(result, cmdObj);
			callback(object);
			return object;
		},
		error: function(result) {
		}
	});
}

function brewtrollerParseRequestParameters(cmdObj, params) {
	var parameters = [];
	if (cmdObj.reqParams.length) {
		for (var i = 0; i < cmdObj.reqParams.length; i++) {
			parameters[i] = params[cmdObj.reqParams[i]];
		}
	}
	return (parameters.length ? "&" + parameters.join('&') : "");
}

function brewTrollerParseResponse(result, cmdObject)
{
	if (result[0][0] != cmdObject.rspCode) {
		var errorText;
		switch (result[0]) {
			case '!':
				errorText = "Bad Command";
				break;
			case '#':
				errorText = "Bad Parameter";
				break;
			case '$':
				errorText = "Bad Index";
				break;
			default:
				errorText = "Unknown response: " + result[0];
				break;
		}
		throw new Error("BrewTroller response error: " + errorText);
	}
	var returnObject;
	returnObject = {};
	for (var i = 0; i < cmdObject.rspParams.length; i++){
		returnObject[cmdObject.rspParams[i]] = result[i];
	}
	return returnObject;
}


function millisecondsToTime(milli)
{
//	var date = new Date(milli);
//	var h = date.getHours();
//	var m = date.getMinutes();
//	var s = date.getSeconds();
	
  var h = Math.floor(milli / 3600000);
  var m = Math.floor((milli - (h * 3600000)) / 60000);
  var s = Math.floor((milli - (m * 60000) - (h*3600000)) / 1000);

  return h + "h" + m + "m" + s + "s";
}

function hoursMinutesToMilliseconds(hours, minutes) {
	hoursToMinutes = hours * 60;
	minutesTotal = parseInt(minutes) + hoursToMinutes;
	milliseconds = minutesTotal * 60000;
	return milliseconds;
}
