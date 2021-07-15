#!/bin/bash
token_folder="/samba/claudia/tokens/"
samba_folder="/samba/claudia/to_compress/"
sudo inotifywait -m "${samba_folder}" |
    while read dir action file; do
        if [[ "$action" =~ .*,ISDIR ]] || [ "$action" = "MODIFY" ]
        then
            continue;
        fi
        echo "The file '$file' appeared in directory '$dir' via '$action'"
        filesize=$(find "$dir$file" -printf "%s")
        echo "file size: '${filesize}'"
        if [ "$action" = "CLOSE_NOWRITE,CLOSE" ] || [ "$action" = "CLOSE_WRITE,CLOSE" ] 
        then
            echo "a file was closed"
            if [ ${filesize} -gt 0 ] 
            then
                echo "the file size is gt than 0"
                echo "calling ${file}"
                echo "${file}" > "${token_folder}${file}.token"
            else
                rm -f "${token_folder}${file}.token"
            fi
        else
            echo "the file size is 0"
        fi
        if [ "$action" = "DELETE" ]
        then
            rm -f "${token_folder}${file}.token"
        fi
    done
