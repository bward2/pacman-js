const express = require('express');
const app = express();

const EventLog = []; // Array for holding tuples of eventName and eventTime, to send to server

const width = window.innerWidth;
const height = window.innerHeight;

EventLog.push({windowWidth: width, windowHeight: height});

console.log("Width: " + EventLog[0].windowWidth + " Height: " + EventLog[0].windowHeight);

// Listener that triggers on a key-press
window.addEventListener("keydown", e => {
   const Event = {
         eventName: e.key,
         location: null,          // Location is null (unimportant). This does not need to be added in JS,
                                  // but has been added for database coherency. Can consider removing.
         eventTime: e.timeStamp,  // MS since browser load
   };

   EventLog.push(Event); // Adding event name, location and time to the EventLog list.

   console.log(`Logged ${Event.eventName} action. Logged at ${Event.eventTime}`); // Only for testing
});

// Listener that triggers on a mouse click (or touch click)
window.addEventListener("click", e => {
   const Event = {
      eventName: "click",
      location: {x: e.clientX, y: e.clientY}, // Position of mouse at time of click.
      eventTime: e.timeStamp,
   }

   EventLog.push(Event); // Adding event name, location and time to the EventLog list.
   
   console.log(`Logged ${Event.eventName} action. Logged at ${Event.eventTime}`); // Only for testing
});

/**
   Listener that triggers on a touch swipe, logs the start and end of swipes.
   BUG: Sometimes logs several times for one swipe.
**/
window.addEventListener("touchstart", e => {
   window.addEventListener("touchend", e2 => {
      const Event = {
         eventName: "touchstart",
         location: {x: e.touches[0].clientX, y: e.touches[0].clientY},     // how to get location tree of a swipe?
         eventTime: e.timeStamp,
      }

      const Event2 = {
         eventName: "touchend",
         location: {x: e2.changedTouches[0].clientX, y: e2.changedTouches[0].clientY},     // how to get location tree of a swipe?
         eventTime: e2.timeStamp,
      }
   
      EventLog.push(Event); // Adding event name, location and time to the EventLog list.
      EventLog.push(Event2);

      console.log(`Logged ${Event.eventName} action.
         Logged at ${Event.eventTime} time, at ${Event.location.x} and ${Event.location.y}`);     // Only for testing
      console.log(`Logged ${Event2.eventName} action.
         Logged at ${Event2.eventTime} time, at ${Event2.location.x} and ${Event2.location.y}`);  // Only for testing
   });
});

// Listener that triggers on a resize
window.addEventListener("resize", e => {
   const Event = {
         eventName: "resize",
         location: null,          // Location is null (unimportant). This does not need to be added in JS,
                                  // but has been added for database coherency. Can consider removing.
         windowsize: {windowWidth: window.innerWidth, windowHeight: window.innerHeight}, //this only exists in resize events
         eventTime: e.timeStamp,  // MS since browser load
   };

   EventLog.push(Event); // Adding event name, location and time to the EventLog list.

   console.log(`Logged ${Event.eventName} action. Logged at ${Event.eventTime}.
      Screen size: width: ${Event.windowsize.windowWidth}, height: ${Event.windowsize.windowHeight}`); // Only for testing
});

// Listen for closing of the browser window from the client, so the EventLog can be sent to server
window.addEventListener("unload", e => {
   const Event = {
      eventName: "Session Ended",
      location: null,
      eventTime: e.timeStamp,  // MS since browser load
   }

   EventLog.push(Event);



   app.post('/log-data', (req, res) => {
      const count = 0;
      res.json({count});
   });
});
   // HERE WRITE LOGIC FOR SENDING EventLog TO SERVER
   /*fetch("/log-data",
               { method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(EventLog)});
});*/

/*fetch("/log-data",
               { method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: { 
                           name: "John Doe", 
                           age: 30, 
                           occupation: "Software Developer" 
                  } 
               });
*/