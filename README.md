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
1. Create a new record of the type "SuiteQL Report"
2. Give the record a name and paste the _working_ SuiteQL
3. Save it
4. It should now display the record in view mode and display the results from the query (currently limited to 5000 rows)

* You can change the labels by editing the columns in the sublist of the record
* The column order is defined by the order of the columns in the SELECT

![image](https://github.com/watzen/NS-SuiteQL-Reporter/assets/613420/b7f18e5c-187c-4c75-a5c5-9b38c7dae6eb)

![image](https://github.com/watzen/NS-SuiteQL-Reporter/assets/613420/61cf0dc7-b4fd-459d-b089-564d9350234d)
