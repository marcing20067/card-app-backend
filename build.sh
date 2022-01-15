#!/usr/bin/env bash

git clone https://github.com/marcing20067/card-app-frontend.git ./frontend

cd frontend

npm install --production

npm install --save-dev

ng build