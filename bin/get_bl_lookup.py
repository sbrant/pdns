#!/usr/bin/env python
# --------------------------------------------------------------
#
# Example script to build a blacklist lookup from online sources.
# Please read the terms of use prior to using the MalwareDomains list:
# http://www.malwaredomains.com/?page_id=1508
#
# Grab and process the latest domain list from:
# http://www.malwaredomains.com/?page_id=66
#
# --------------------------------------------------------------

import csv
import urllib
import zipfile
import re

src_url = 'http://malware-domains.com/files/domains.zip'
local_file = '/tmp/domains.zip'

def fetch_list():
    urllib.urlretrieve(src_url, local_file)

def prep_lookup():
    with zipfile.ZipFile(local_file, 'r') as zip_file:
        ext_file = zip_file.extract('domains.txt', '/tmp/')
    processedfile = open('/opt/splunk/etc/apps/pdns/lookups/domains.csv', 'w')
    processedfile.write('domain,type,original_reference\n')
    with open(ext_file, 'r') as rawfile:
        domainreader = csv.reader(rawfile, delimiter='\t')
        for row in domainreader:
            if row[0] == '##':
                continue
            else:
                processedfile.write('*'+row[2]+','+row[3]+','+row[4]+'\n')
    processedfile.close()

def main():
    fetch_list()
    prep_lookup()

if __name__ == "__main__":
    main()

