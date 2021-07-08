#!/bin/sh
while [ 1 ]
do
    file=$(gcloud pubsub subscriptions pull video-files-received-sub --format="value(DATA)" --auto-ack)
    #file="IMG_2153.MOV"
    samba_folder="/samba/claudia/to_compress/"
    echo "read message:[${file}]"
    if [ ! -z "$file" ]
    then
        echo "message is not empty: $file"
        if [ -s "${samba_folder}${file}" ] 
        then
            echo "file is not empty"
        else
            echo "file es empty"
        fi
        
    fi
    sleep 15
    if [ ! -z "$file" ] && [ -s "${samba_folder}${file}" ]
    then
        echo "file ${samba_folder}${file} was found"
        OLDIFS=$IFS
        IFS=$'\n'
        file_name=$(find "${samba_folder}${file}" -not -newermt '-10 seconds')
        echo "fileArray:${fileArray}"
        IFS=$OLDIFS
        # use for loop read all filenames
        if [ ! -z "$file_name"  ]
        then
            name_no_spaces=$(echo $file | tr " " "_")
            echo "file older than 10 seconds was found:'${file_name}' ${name_no_spaces}"
            ffmpeg -nostdin -i "${file_name}" -vcodec libx264 -crf 28 -vf "scale=1024:-1" "/tmp/${name_no_spaces}" && \
            gsutil mv "/tmp/${name_no_spaces}" gs://celtic-bivouac-307316.appspot.com/videos && \
            rm -f "${file_name}"
        fi
    fi
done
