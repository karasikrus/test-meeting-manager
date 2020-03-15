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
```
{
	"meetingId": "27",
	"name": "jack",
	"email": "jack@mail.io"
}
```

### delete
removes participant from a meeting
```
{
    "email": "t@us.gov",
    "meetingId": "6"
}
```
