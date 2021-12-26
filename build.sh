#!/usr/bin/env bash

npm install @angular/cli -g

git clone https://github.com/marcing20067/card-app-frontend.git ./frontend

cd frontend

npm install --production

npm install --dev

ng build