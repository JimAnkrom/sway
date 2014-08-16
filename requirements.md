# References
    - http://www.w3.org/TR/orientation-event/
    
    
# Non-Functional Requirements
    ### User front-end must depend on an extremely minimal set of libraries.
        - administration front end may use any libraries deemed fit
    ### OSC control mapping must be user-configurable (by admin).


# Front end (Browser app)
## Collect input sensor data
    ### Gyroscope
    ### Accelerometer
    ### GPS ?
    ### Swipe 
    ### Geomagnetic
    ### Proximity (Infrared)    

## Debug output during development
    ### Show current sensor data (maybe last 5?)

## Feedback to user
    ### POC - Move a shape around the screen

## Submit sensor data to server


# Server (node.js RESTful API) (PROPOSED/OUT OF DATE/TBD - see sway.api.js for current implementation)
    ### Administration Services
        - [POST] Authenticate - get an admin token
            parameters { u: <username>, p: <password> } (cleartext OK for now)
            returns { token: <id>, timestamp: <stamp> }
        - [POST] Calibrate - calibrate the dome positioning (ADMIN ONLY)
            parameters { token: <id>, north: <alpha>, center: { x: <x>, y: <y>, z: <z> }
        - [GET] Users - get a user list
            parameters { token: <id> }
            returns { users: [ 
                        { token: <id>, useragent: <useragent>, email: <email>, location: {x,y,z} }, ... ]
                        
    ### User Services
        - [POST] Authenticate - get a user token
            parameters { useragent: <useragent>, email: <email address> }
            returns { token: <id>, timestamp: <datetime> }
        - [POST] Control - submit a control packet 
            parameters { x: <x>, y: <y>, z: <z>, absolute: <absolute>, alpha: <alpha>, beta: <beta>, gamma: <gamma> }
            returns { ? }
        
