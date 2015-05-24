Brewtroller = {};
var hosts,
	username = "admin",
	password = "password",
	connected = false,
	lastUpdate = 0,
	storedHost,
	programList = [],
	programStep1,
	programStep2,
	programName1,
	programName2,
	hltGauge,
	mashGauge,
	boilGauge,
	hltTempSetPoint = "0",
	mashTempSetPoint = "0",
	boilTempSetPoint = "0",
	btVersion = "0.0",
	btUnits = "imperial",
        lastAutoStatus = "",
        maxOutputs = 32; //32 MAX.

//Setup Segment Display
var mashdisplay = new SegmentDisplay("mashDisplay");
mashdisplay.pattern         = "##:##:##";
mashdisplay.displayAngle    = 6;
mashdisplay.digitHeight     = 20;
mashdisplay.digitWidth      = 14;
mashdisplay.digitDistance   = 2.5;
mashdisplay.segmentWidth    = 2;
mashdisplay.segmentDistance = 0.3;
mashdisplay.segmentCount    = 7;
mashdisplay.cornerType      = 3;
mashdisplay.colorOn         = "#e95d0f";
mashdisplay.colorOff        = "#4b1e05";
mashdisplay.draw();
var display = new SegmentDisplay("boilDisplay");
display.pattern         = "##:##:##";
display.displayAngle    = 6;
display.digitHeight     = 20;
display.digitWidth      = 14;
display.digitDistance   = 2.5;
display.segmentWidth    = 2;
display.segmentDistance = 0.3;
display.segmentCount    = 7;
display.cornerType      = 3;
display.colorOn         = "#e95d0f";
display.colorOff        = "#4b1e05";
display.draw();

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
  $("#boilSetTimer").on("click", function () {
	  Brewtroller.timer.click_setTimer('boil');
  });
  $("#mashSetTimer").on("click", function () {
	  Brewtroller.timer.click_setTimer('mash');
  });
  $('.boilControl').on("change", function () {
	  Brewtroller.boil.control(this.name);
  });
  $("#programModalButton").on("click", function () {
	  Brewtroller.program.getProgramList();
  });
  hltGauge = new Gauge({
	  						renderTo : 'hltGauge',
	  						maxValue : 250,
	  						//majorTicks : ['0', '30', '60', '90', '120', '160', '212', '250'],
	  						glow : true,
	  						title : "Set: ",
	  						colors : {
	  									plate : "#000000",
	  									majorTicks : "#000000",
	  									numbers : "#FF9900",
	  									needle     : { start : '#FF9900', end : '#E68A00' }
	  								 },
	  						highlights : [
	  						              { from: 0, to: 60, color: '#0000FF' },
	  						              { from: 60, to: 160, color: '#FFFFFF' },
	  						              { from: 160, to: 250, color: '#FF3300' }
	  						             ]
	  						
						});
  mashGauge = new Gauge({
		renderTo : 'mashGauge',
		maxValue : 250,
		//majorTicks : ['0', '30', '60', '90', '120', '160', '212', '250'],
		glow : true,
		title : "Set: ",
		colors : {
					plate : "#000000",
					majorTicks : "#000000",
					numbers : "#FF9900",
					needle     : { start : '#FF9900', end : '#E68A00' }
				 },
		highlights : [
		              { from: 0, to: 60, color: '#0000FF' },
		              { from: 60, to: 160, color: '#FFFFFF' },
		              { from: 160, to: 250, color: '#FF3300' }
		             ]
		
	});
  boilGauge = new Gauge({
		renderTo : 'boilGauge',
		maxValue : 250,
		//majorTicks : ['0', '30', '60', '90', '120', '160', '212', '250'],
		glow : true,
		title : " ",
		colors : {
					plate : "#000000",
					majorTicks : "#000000",
					numbers : "#FF9900",
					needle     : { start : '#FF9900', end : '#E68A00' }
				 },
		highlights : [
		              { from: 0, to: 60, color: '#0000FF' },
		              { from: 60, to: 160, color: '#FFFFFF' },
		              { from: 160, to: 250, color: '#FF3300' }
		             ]
		
	});
  hltGauge.draw();
  mashGauge.draw();
  boilGauge.draw();
//  if ($("#hltGauge")) {
//	  drawGauge("#hltGauge", hltTempSetPoint);
//	  $("#hltGauge").gauge("setValue", 150);
////	  $("#hltGauge").gauge({
////		  min: 32,
////		  max: 180,
////		  unitsLabel: '' + String.fromCharCode(186),
////		  majorTicks: 10,
////		  minorTicks: 10,
////		  bands: [
////		          {color: '#F00', from: 163, to: 166}
////		          ],
////		  label: hltTempSetPoint,
////		  majorTickLabel: true,
////		  colorOfCenterCircleFill: "#CCCCCC"
////	  }).gauge('setValue', 162);
//  }
//  if ($("#mashGauge")) {
//	  drawGauge("#mashGauge", mashTempSetPoint);
//	  $("#mashGauge").gauge("setValue", 150);
////	  $("#mashGauge").gauge({
////		  min: 100,
////		  max: 200,
////		  unitsLabel: '' + String.fromCharCode(186),
////		  majorTicks: 10,
////		  minorTicks: 10,
////		  bands: [
////		          {color: '#F00', from: 153, to: 156}
////		          ],
////		  label: mashTempSetPoint,
////		  majorTickLabel: true,
////		  colorOfCenterCircleFill: "#CCCCCC"
////	  }).gauge('setValue', 154);
//  }
//  if ($("#boilGauge")) {
//	  drawGauge("#boilGauge", boilTempSetPoint);
//	  $("#boilGauge").gauge("setValue", 150);
////	  $("#boilGauge").gauge({
////		  min: 120,
////		  max: 220,
////		  unitsLabel: '' + String.fromCharCode(186),
////		  majorTicks: 10,
////		  minorTicks: 10,
////		  bands: [
////		          {color: '#F00', from: 211, to: 213}
////		          ],
////		  label: boilTempSetPoint,
////		  majorTickLabel: true,
////		  colorOfCenterCircleFill: "#CCCCCC"
////	  }).gauge('setValue', 200);
//  }
$("#activeVP :button").on("click", function() { //Any Valve profile button clicked
    Brewtroller.valve.updateActProfile($(this));
});
Brewtroller.valve.buildOutputLEDs("#div_outputLEDs", maxOutputs); 
Brewtroller.valve.buildValveProfileCfg("#outputProfileCfgSwitches", maxOutputs); 
 $("#outputSave").on("click", function () {
        var outputBitmask = 0;
        $("input:checkbox[id^=valve]:checked").each(function () { //Loop through selected valves only
            var vlvNum = parseInt(/\d+(?=\D*$)/.exec($(this).attr('id'))[0]) - 1; //get output number from id valveXX
            outputBitmask |= 1<<vlvNum;
        });
        var profileId = $("#valveSelect").val();
        Brewtroller.valve.setValveProfileConfig(profileId, (outputBitmask>>>0));
  });
  Brewtroller.valve.buildValveSelectBox();
  $("#valveSelect").on("change", function() {
          $("#outputStat").toggleClass("collapse", false);  //Make sure the div is expanded
            $('html, body').animate({
                  scrollTop: $("#outputStat").offset().top
              }, 1000);
	  var valveAddress = $("option:selected", $(this)).val();
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
        Brewtroller.connected.checkWatchdog();
        brewTrollerExecCommand(BTCMD_GetStatus, null, {}, host, username, password, Brewtroller.status.printUI);
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
    //$(id).html('<small class="text-muted">timer </small><span class="timerText">' + millisecondsToTime(value) + "</span> / " + rStatus);
    if (id) {id.setValue(millisecondsToTimerDisplay(value));}
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
          hours = $("#mashTimePicker").val().split(":")[0];
          minutes = $("#mashTimePicker").val().split(":")[1];
          milliseconds = hoursMinutesToMilliseconds(hours, minutes);
        } else if (vessel == "boil") {
          timerId = 1;
          hours = $("#boilTimePicker").val().split(":")[0];
          minutes = $("#boilTimePicker").val().split(":")[1];
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
    },
    
    printHeatPower : function (id, heatPower)
    {
        //$(id).html('<small class="text-muted">heat power </small>' + (heatPower == 0 ? "Off" : heatPower == 100 ? '<span class="text text-danger">On</span>' : (heatPower + "%")));
        $(id).html((heatPower == 0 ? '<img src="images/redOffLED.png" width="20" height="20">' : heatPower == 100 ? '<img src="images/redOnLED.png" width="20" height="20">' : '<img src="images/redOnLED.png" width="20" height="20">' + (heatPower + "%")));
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
        Brewtroller.status.printProgramThread("#div_programThread1", data.Program1_Step, data.Program1_Name);
        Brewtroller.status.printProgramThread("#div_programThread2", data.Program2_Step, data.Program2_Name);
        Brewtroller.timer.printTimer(mashdisplay, data.Mash_TimerValue, data.Mash_TimerStatus);
        Brewtroller.timer.printTimer(display, data.Boil_TimerValue, data.Boil_TimerStatus);
        printAlarm("#button_alarm", data.alarmStatus);
        Brewtroller.status.printTemperature("#hltGauge", data.HLT_Temperature);
        Brewtroller.status.printSetpoint("#div_hltSetpoint", "#hltGauge", data.HLT_Setpoint);
        Brewtroller.temp.printHeatPower("#hltLED", data.HLT_HeatPower);
		printVolume("#div_hltVolume", data.HLT_Volume);
		printTargetVolume("#div_hltTargetVolume", data.HLT_TargetVolume);
		printFlowRate("#div_hltFlowRate", data.HLT_FlowRate);
		Brewtroller.status.printTemperature("#mashGauge", data.Mash_Temperature);
        Brewtroller.status.printSetpoint("#div_mashSetpoint", "#mashGauge", data.Mash_Setpoint);
        Brewtroller.temp.printHeatPower("#mashLED", data.Mash_HeatPower);
		printVolume("#div_mashVolume", data.Mash_Volume);
		printTargetVolume("#div_mashTargetVolume", data.Mash_TargetVolume);
		printFlowRate("#div_mashFlowRate", data.Mash_FlowRate);
		Brewtroller.status.printTemperature("#boilGauge", data.Kettle_Temperature);
		Brewtroller.status.printSetpoint("#div_kettleSetpoint", "#boilGauge", data.Kettle_Setpoint);
		Brewtroller.temp.printHeatPower("#boilLED", data.Kettle_HeatPower);
		printVolume("#div_kettleVolume", data.Kettle_Volume);
		printTargetVolume("#div_kettleTargetVolume", data.Kettle_TargetVolume);
		printFlowRate("#div_kettleFlowRate", data.Kettle_FlowRate);
		printBoilControl("#div_boilControl", data.Boil_ControlState);
	    Brewtroller.valve.printOutputProfiles("#div_outputProfiles", data.profileStatus, data.autoValveStatus);
	    Brewtroller.valve.printActOutputs("#div_outputLEDs", data.outputStatus);
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
    	temperature = temperature / 100.0;
    	if (id === "#mashGauge" && temperature < 1000) {
    		mashGauge.setValue(temperature);
    	} else if (id === "#hltGauge" && temperature < 1000) {
    		hltGauge.setValue(temperature);
    	} else if (temperature < 1000) {
    		boilGauge.setValue(temperature);
    	}
    	//$(id).gauge('setValue', temperature);
    	//$(id).html('<small class="text-muted">temp </small><span class="vesselTemp">' + (temperature == 4294934528 ? "N/A" : (temperature / 100.0 + '&deg;F</span> ')));
    },
    
    printSetpoint : function(id, gauge, setpoint)
    {
        //$(id).html('<small class="text-muted">set </small><span class="vesselSet">' + (setpoint == 0 ? "N/A " : (setpoint / 100.0 + '&deg;F</span> ')));
        if (gauge === "#hltGauge") {
        	hltGauge.config.title = "Set: " + setpoint / 100 + "\xB0F";
        	hltGauge.updateConfig();
        } else if (gauge === "#mashGauge") {
        	mashGauge.config.title = "Set: " + setpoint / 100 + "\xB0F";
        	mashGauge.updateConfig();
        }
        //drawGauge();
    	
    },
    
    printProgramThread : function (id, step, recipe)
    {
        $(id).html("Step: " + step + " Recipe: " + recipe);
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
    profileData : {
            0:{name: "Fill HLT", div: "fillHLT", bitmask: 1},
            1:{name: "Fill Mash", div: "fillMash", bitmask: 2},
            2:{name: "Add Grain", div: "addGrain", bitmask: 4},
            3:{name: "Mash Heat", div: "mashHeat", bitmask: 8},
            4:{name: "Mash Idle", div: "mashIdle", bitmask: 16},
            5:{name: "Sparge In", div: "spargeIn", bitmask: 32},
            6:{name: "Sparge Out", div: "spargeOut", bitmask: 64},
            7:{name: "Boil Additions", div: "boilAdditions", bitmask: 128},
            8:{name: "Kettle Lid", div: "kettleLid", bitmask: 256},
            9:{name: "Chill H2O", div: "chillerH2O", bitmask: 512},
            10:{name: "Chill Beer", div: "chillerBeer", bitmask: 1024},
            11:{name: "Boil Recirc", div: "boilRecirc", bitmask: 2048},
            12:{name: "Drain", div: "drain", bitmask: 4096},
            13:{name: "HLT Heat", div: "hltHeat", bitmask: 8192},
            14:{name: "HLT Idle", div: "hltIdle", bitmask: 16384},
            15:{name: "Kettle Heat", div: "kettleHeat",  bitmask: 32768},
            16:{name: "Kettle Idle", div: "kettleIdle", bitmask: 65536},
            17:{name: "User 1", div: "user1", bitmask: 131072},
            18:{name: "User 2", div: "user2", bitmask: 262144},
            19:{name: "User 3", div: "user3", bitmask: 524288}
    },
	buildValveSelectBox : function () 
    {
            $.each(this.profileData, function ( index, profile ) {
                    $("#valveSelect").append('<option value="' + index + '">' + profile.name + '</option>');
            });
    },
        buildValveProfileCfg : function (divId, outputCount)
        {
            var html = '<div class="col-sm-12">';
            for (i = 0; i < outputCount; i++) {
                var index = i + 1,
                    name = "OUT" + index,
                    id = "valve" + index; 
                if (i%12===0)
                    html += '</div><div class="col-sm-12">';
                html += '<div class="btn-group-vertical outputBox">';
                html += '<label class="control-label" for="' + id + '">' + name + '</label>';
                html += '<input id="' + id + '" data-toggle="toggle" data-onstyle="success" data-offstyle="danger" data-size="small" type="checkbox">';
                html += '</div>';
            }   
            html += '</div>';
            $(divId).append(html);
        },
        buildOutputLEDs : function (divId, outputCount)
        {
            var html = '<div class="col-sm-12">';
            for (i = 0; i < outputCount; i++) {
                var index = i + 1,
                    name = "" + index,
                    id = "out" + index; 
                if (i===16)
                    html += '</div><div class="col-sm-12">';
                html += '<div class="btn-group-vertical led-box">';
                html += '<p>' + name + '</p>';
                html += '<div class="led" id="' + id + '"></div>';
                html += '</div>';
            }   
            html += '</div>';
            $(divId).append(html);
        },
	printOutputProfiles : function(id, status, autoStatus)
    {
            var actBitmask = parseInt(status);
            var autoBitmask = parseInt(autoStatus); 
            lastAutoStatus = autoStatus; //Save this so able to be called from commands that do not provide.
          
            $.each(this.profileData, function(index, profile) {
                var profileDiv = $("#" + profile.div);
                if (autoBitmask&profile.bitmask) {
                    profileDiv.removeClass("btn-success").removeClass("btn-danger").addClass("btn-primary");
                } else if (actBitmask&profile.bitmask)  {
                    profileDiv.removeClass("btn-primary").removeClass("btn-danger").addClass("btn-success");
                } else {
                    profileDiv.removeClass("btn-primary").removeClass("btn-success").addClass("btn-danger");
                    
                }
            });
	},
        printActOutputs : function(id, outputStatus)
    {
            var actBitmask = parseInt(outputStatus);
            for (i = 0; i < maxOutputs; i++) {
                var index = i + 1;
                var state = (actBitmask&(1<<i) ? true : false);
                $("#out" + index).toggleClass('led-green', state).toggleClass('led-red', !state);
            }
	},
    printValveOutputs: function (data) {
        var outputBitMask = parseInt(data.Valves);
        for (i = 0; i < maxOutputs; i++) { //Current BT max of 32bit
            $("#valve" + (i + 1)).prop('checked', outputBitMask&(1<<i)).change();
        }   
    },
    updateActProfile : function (button) {
        var profileBitmask = 0;
        $.each(this.profileData, function(index, profile) {
            if (profile.div === button.attr('id')) 
                profileBitmask = profile.bitmask;
        });
        if (!profileBitmask)
            throw new Error("BtWebApp: ERROR - Unhandled valve profile.");
        
        var action = (button.hasClass("btn-success") ? 0 : 1); // 0=UNSET, 1= SET
        brewTrollerExecCommand(
                    BTCMD_SetActValveProfile,
                    null,
                    {
                        "profileBitmask" : profileBitmask,
                        "action" : action
                    },
                    host,
                    username,
                    password,
                    function (data) {//Update display with response
                        Brewtroller.valve.printOutputProfiles("#div_outputProfiles", data.profileStatus, lastAutoStatus);
                    }
                );
    },
    getValveProfileConfig : function (valveProfile) {
    	brewTrollerExecCommand(BTCMD_GetValveProfileConfig,
                            valveProfile,
                            null,
                            host,
                            username,
                            password,
                            Brewtroller.valve.printValveOutputs
                        );
    },
    setValveProfileConfig : function (profileId, bitmask) {
    	brewTrollerExecCommand(
                            BTCMD_SetValveProfileConfig,
                            profileId,
                            {"Valve_Bits" : bitmask},
                            host,
                            username,
                            password,
                            Brewtroller.valve.printValveOutputs //Update display with returned valve outputs
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

function millisecondsToTimerDisplay(milli)
{
	
  var h = Math.floor(milli / 3600000),
  	  m = Math.floor((milli - (h * 3600000)) / 60000),
  	  s = Math.floor((milli - (m * 60000) - (h*3600000)) / 1000);

  if (h < 10) {h = "0" + h;}
  if (m < 10) {m = "0" + m;}
  if (s < 10) {s = "0" + s;}
  
  return h + ":" + m + ":" + s;
}

function hoursMinutesToMilliseconds(hours, minutes) {
	hoursToMinutes = hours * 60;
	minutesTotal = parseInt(minutes) + hoursToMinutes;
	milliseconds = minutesTotal * 60000;
	return milliseconds;
}

//Taken from BT Live project
function correctUnits(input, type, currentSystem, targetSystem) {
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
}