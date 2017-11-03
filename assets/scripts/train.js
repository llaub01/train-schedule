// Initialize Firebase
var config = {
	apiKey: "AIzaSyCmVmqvi4V5YcPIWGzC2vs4nn4rkQrcRzw",
	authDomain: "train-5923d.firebaseapp.com",
	databaseURL: "https://train-5923d.firebaseio.com",
	projectId: "train-5923d",
	storageBucket: "",
	messagingSenderId: "639834277527"
};

firebase.initializeApp(config);

var database = firebase.database();
var ref = database.ref();

var trainName = "";
var trainDest = "";
var trainFreq;
var trainArrTime;
var trainMinAway;
var trainMinAwayID;
var trainArrTimeID;
		
$(document).ready(function(){

	// load page with DB data on load and add to table
	ref.on("child_added", function(snapshot) {

		var trainData = snapshot.val();

		$("#table-body").append("<tr id='" + snapshot.key + "'><td>" + trainData.trainName + "</td><td>" + trainData.trainDest + "</td><td>" + trainData.trainFreq + "</td><td id=" + trainData.trainArrTimeID + ">" + trainData.trainArrTime + "</td><td id=" + trainData.trainMinAwayID + ">" + trainData.trainMinAway + "</td><td><button id='del-button' type='delete' class='btn btn-danger btn-sm' value='" + snapshot.key + "'>X</button></tr>");

	});

	// submit button add data to DB
	$("#submit-button").on("click", function(){
		
		event.preventDefault();
		trainName = $("#train-name").val().trim();
		trainDest = $("#train-dest").val().trim();
		trainFreq = $("#train-freq").val().trim();
		trainArrTime = $("#train-arrival").val();

		trainMinAway = moment(trainArrTime, "hh:mm a").fromNow(); // assumes same day. if earlier than now, reads incorrectly
		
		// time ids to manipulate later
		trainMinAwayID = "min-away-" + trainName.replace(/\s/g, "");
		trainArrTimeID = "arr-time-" + trainName.replace(/\s/g, "");

		// push to db
		ref.push({
			trainName: trainName,
			trainDest: trainDest,
			trainFreq: trainFreq,
			trainArrTime: trainArrTime,
			trainMinAway: trainMinAway,
			trainArrTimeID: trainArrTimeID,
			trainMinAwayID: trainMinAwayID,
		});

		// reset fields
		$("#train-name").val("");
		$("#train-dest").val("");
		$("#train-freq").val("");
		$("#train-arrival").val("");
		
	});

	// update minutes away every 1 min
	var interval = setInterval(function(){
  		ref.on("child_added", function(snap){

        	var data = snap.val();
        	var fbKey = snap.key;

        	// if db entry exists and arrival time has passed
        	if (data.trainArrTime < moment().format("HH:mm")) {
        		// update arrive time
        		var trainArrTimeUpd = moment(data.trainArrTime, "HH:mm").add(data.trainFreq, 'minutes');
        		trainArrTimeUpd = moment(trainArrTimeUpd, "MM/DD/YYYY hh:mm a").format("HH:mm");

        		database.ref(fbKey).update({
        			trainArrTime: trainArrTimeUpd,
    			});

        		// update how many min away
        		var timeUpd = moment(data.trainArrTime, "HH:mm").fromNow();
        		var trainMinAwayUpd = moment(timeUpd).format("HH:mm");

        		database.ref(fbKey).update({
      				trainMinAway: trainMinAwayUpd,
    			});

    			// change the page content to reflect
    			var tempArrTime = '#' + data.trainArrTimeID;
    			var tempMinAway = '#' + data.trainMinAwayID;

        		$(tempArrTime).text(data.trainArrTime);
    			$(tempMinAway).text(data.trainMinAway);
        	}
        	
        	// if db entry exists and arrival time has NOT passed
        	else if (data.trainArrTime > moment().format("HH:mm")) {
	      		// update how many min away
        		var trainMinAwayUpd = moment(data.trainArrTime, "HH:mm").fromNow();

        		database.ref(fbKey).update({
      				trainMinAway: trainMinAwayUpd,
    			});

    			// change the page content to reflect
    			var tempArrTime = '#' + data.trainArrTimeID;  //added because if statement fishes too quick for fb to be updated
    			var tempMinAway = '#' + data.trainMinAwayID;

    			$(tempArrTime).text(data.trainArrTime);
    			$(tempMinAway).text(data.trainMinAway);
        	}
  		});
	}, 30000);

	// remove button action
	$(document).on("click", "#del-button", function() {

		//remove from db
		database.ref(this.value).remove();
		
		//remove from html
		var delRow = "table tr#" + this.value;
		$(delRow).remove();
	});
});

