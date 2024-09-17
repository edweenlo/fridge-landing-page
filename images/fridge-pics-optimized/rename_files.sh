#!/bin/bash

# Loop through folders -20 to -36, skipping -35
for i in {20..34} 36; do
  folder="08-19-2024-$i"
  
  if [ -d "$folder" ]; then
    echo "Processing folder: $folder"
    
    # Go into the folder and rename .JPG files to .tmp
    for file in "$folder"/*.JPG; do
      if [ -f "$file" ]; then
        mv "$file" "${file%.JPG}.tmp"
        echo "Renamed $file to ${file%.JPG}.tmp"
      fi
    done
  else
    echo "Folder $folder does not exist, skipping."
  fi
done

