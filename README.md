Sway
====
ACTIVELY IN DEV:

OLD: Translate smartphone sensor data into control data (OSC, MIDI, DMX) via a browser.

NEW: Sway manages multi-user connectivity to route user data (source-agnostic) into output data.
Smartphone sensor code is being refactored into Shui, while client handling code is being moved to sway-client

See wiki for all (scant at the moment) documentation.

What if Sway was like express, but for realtime data?


Notes:

- All references handled... where?
- Configuration is loaded in sway.core
- Server handles most sway business logic
- Workflow handles user workflow


Create user
Then user heartbeat
then user workflow


TODO:
- [maybe] Move "user action" to "user state"
- Evaluate each config, determine what should happen on change of config
- Move to a formal event system or figure out events better


User Workflow
- User is created in , and sway.workflowController.action is called
- As user.state is null, we get the initialState specified in installation.json
- and req.user.state is created
- req.user.state is passed off to the response in sway.server.finalizeUserResponse


Sway Events
- usersService.onUserCreated ?
- usersService.onUserExpired ?
- usersService.onUserExpiredBatch ?