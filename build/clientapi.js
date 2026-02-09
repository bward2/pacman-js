const EventLog = []; // Array for holding tuples of eventName and eventTime, to send to server

// Listener that triggers on a key-press
window.addEventListener("keydown", e => {
   const Event = {
         eventName: e.key,
         eventX: null, // Client x and y are null. This does not need to be added in JS,
                       // but has been added for database coherency. Can consider removing.
         eventY: null,
         eventTime: e.timeStamp, // MS since browser load
   };

   EventLog.push(Event); // Adding event name and time to the EventLog list.

   console.log(`Logged ${Event.eventName} action. Logged at ${Event.eventTime}`); // Only for testing
});

window.addEventListener("click", e => {
   const Event = {
      eventName: "click",
      eventX: e.clientX, // Position of mouse at time of click.
      eventY: e.clientY,
      eventTime: e.timeStamp,
   }

   EventLog.push(Event); // Adding event name and time to the EventLog list.
   
   console.log(`Logged ${Event.eventName} action. Logged at ${Event.eventTime}`); // Only for testing
});