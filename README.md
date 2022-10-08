# RAI Engine Cleanup

You can deploy this project on [Railway](https://railway.app/) for about 50 cents a month (which is much less than the $5 free allowance, so free, really). It will run every hour and delete engines that haven't been used in a transaction in the last six hours.

## Setup

To build the project, clone and then install the dependencies and build:

```
yarn install
yarn build
```

You'll also want to get a Railway account set up. Follow the instructions on the website for that.

Then download the Railway CLI and do 

```
railway up
```

from the project directory.

Additionally, you will need to put your credentials in the project settings, with these names:

`RAI_CLIENT_ID`  
`RAI_CLIENT_SECRET`

The script uses `process.env` to retrieve these values.