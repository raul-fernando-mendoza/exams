#!/bin/sh
sudo inotifywait -m /samba/claudia/to_compress -e close_write -e close|
    while read dir action file; do
        if [ "$action" = "CLOSE_NOWRITE,CLOSE,ISDIR" ]
        then
            continue;
        fi
        echo "The file '$file' appeared in directory '$dir' via '$action'"
        filesize=$(find "$dir$file" -printf "%s")
        echo "file size: '${filesize}'"
        if [ ${filesize} -gt 0 ] 
        then
            echo "the file size is gt than 0"
            if [ "$action" = "CLOSE_WRITE,CLOSE" ]
            then
                echo "start compression"
                echo "calling ${file}"
                gcloud pubsub topics publish video-files-received --message="$file"
            else
                echo "the action is not CLOSE_NOWRITE, CLOSE"
            fi
        else
            echo "the file size is 0"
        fi
    done