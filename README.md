# test-meeting-manager
test project

## To install 
use 
`npm install`


## To run
use 
`npm start`


## To test
use 
`npm test`

# API
## /meetings
### get
returns meetings and their participants

### post
creates a meeting, returns its id
```
{
    "name": string,
    "start_time": date,
    "end_time": date
}
```
### delete
deletes a meeting
```
{
	"id": integer
}
```

## /participants

### post
adds participant to a meeting, if there were no participant, creates one
if meeting time intersects with times of other meetings of the participant, returns their ids in an array
```
{
	"meetingId": integer,
	"name": string,
	"email": valid email string
}
```

### delete
removes participant from a meeting
```
{
    "email": valid email string,
    "meetingId": integer
}
```
