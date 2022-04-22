#!/bin/bash

mongorestore -d idreesia-erp --gzip ~/Dropbox/Idreesia-ERP-Backup/idreesia-erp
mongorestore -d idreesia-erp --gzip ~/Workspaces/idreesia-db-backup/backup/idreesia-erp
