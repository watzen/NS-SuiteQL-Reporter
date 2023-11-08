# NS-SuiteQL-Reporter
A suite of custom records to store, distribute and display SuiteQL reports. 

# Building (it is pre-built but if you want to rebuild it)
1. clone the repo.
2. install npm.
3. run "npm install" in the repo to install all dependencies.
4. run "npm run build-ns-scripts" to build the Netsuite Scripts.
5. run "npm run build-react-frontend" to build the React Frontend.

# Deploying
1. run "npm run deploy" to deploy the solution.

# Usage
Create a new record of the type "SuiteQL Report"
Give the record a name and paste the *working* SuiteQL
Save it
It should now display the record in view mode and display the results from the query (currently limited to 5000 rows)

You can change the labels by editing the columns in the sublist of the record
The column order is defined by the order of the columns in the SELECT
