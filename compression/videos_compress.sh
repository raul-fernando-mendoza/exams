#!/bin/bash
token_folder="/samba/claudia/tokens/"
samba_folder="/samba/claudia/to_compress/"
temp_folder="/samba/claudia/in_progress/"
compressed_folder="/samba/claudia/compressed/"
rejected_folder="/samba/claudia/rejected/"
while [ true ]
do
    
    OIFS="$IFS"
    IFS=$'\n'
    file_array=$(find ${token_folder}*.token ! -newermt '-10 seconds')
    for token_file in ${file_array}  
    do
        echo "remove token_file:${token_file}"
        rm -f ${token_file}
        file_no_token=$( echo ${token_file} | sed -e 's/\(.*\)\(.token$\)/\1/' )
        echo "file_no_token:${file_no_token}"
        source_name_only=$( echo $file_no_token | sed -e 's/\(.*\/\)\(.*$\)/\2/' )
        echo "source_name_only:${source_name_only}"
        name_no_spaces=$(echo $file_no_token | sed -e "s/\s/_/g" )
        echo "name_no_spaces:${name_no_spaces}"
        name_only=$( echo $name_no_spaces | sed -e 's/\(.*\/\)\(.*$\)/\2/' )
        echo "name_only: ${name_only}"
        name_mp4=$(echo $name_only  | sed -e 's/\(.*\)\(\..*$\)/\1.mp4/' )
        echo "file older than 10 seconds was found:'$source_name_only' to create: '$name_mp4'"
        echo "remove temp ${temp_folder}${name_only}"
        rm -f "${temp_folder}${name_only}"
        echo "move file '${samba_folder}${source_name_only}' ${temp_folder}$name_only"
        #cp "${samba_folder}${source_name_only}" "${temp_folder}$name_only" && \
        #rm -f '${samba_folder}${source_name_only}'
        mv "${samba_folder}${source_name_only}" "${temp_folder}$name_only"
        echo "remove compressed temp:${compressed_folder}${name_mp4}"
        rm -f "${compressed_folder}${name_mp4}"
        ( ffmpeg -nostdin -i "${temp_folder}$name_only" -vf "scale=-2:1280:flags=lanczos" -vcodec libx264 -profile:v main -level 3.1 -preset medium -crf 23 -x264-params ref=4 -acodec copy -movflags +faststart "${compressed_folder}${name_mp4}" && gsutil mv "${compressed_folder}${name_mp4}" gs://celtic-bivouac-307316.appspot.com/videos) || mv "${temp_folder}$name_only" "${rejected_folder}$name_only"
    done
    
    IFS="$OIFS"
    sleep 20
done
