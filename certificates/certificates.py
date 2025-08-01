# Importing Image and ImageFont, ImageDraw module from PIL package 
from re import S
from PIL import Image, ImageFont, ImageDraw 
import datetime
import io
import string 
import math

def calculateSizeStringOld(str, s):
        
        w = 0
        for c in str:
                if c == 'i':
                        w = w + s/3
                elif c.isupper():
                        w = w + s 
                elif c.islower():
                        w = w + s/2.5
                elif c in string.punctuation:
                        w = w + s/2
                else:
                        w = w + s/2
        
        return w                       

def calculateWidthString(text, font):
    l = font.getlength(text)
    return l

def angleToPositive( angle:int):
        while angle<0:
            angle +=360
        return angle


    
def draw_text_angle (str:string, into:Image, at:int, down:bool):
        circle_width = 40
        full_circle_grades = 240
        font_size=36
        if at==2:
                font_size = 30
        font = ImageFont.truetype('AzeretMono-Bold.ttf', font_size) 
        # Measure the text area
        logo_w, logo_h = into.size
        mid_x = int( logo_w/2 )
        mid_y = int( logo_h/2 )
        radio = (logo_w - circle_width * 0.9)/2
        if at==2:
            radio = (logo_w - circle_width * 2.9 )/2    
        width = calculateWidthString(str,font)
        perimeter = 3.1416 * radio 
        start = (width/2) * full_circle_grades / perimeter
        start_angle = -start

        for i in range(len(str)):
                print(f"{str[:i+1]}")
                
                w = calculateWidthString(str[:i+1],font)
                s = (w * full_circle_grades) / perimeter
                angle = start_angle + s               

                text_to_be_rotated = str[i]
                (x,y, mark_width, mark_height) = font.getbbox(text_to_be_rotated)
                watermark = Image.new('RGBA', (mark_width, mark_height), (0, 0, 0, 255))
                draw = ImageDraw.Draw(watermark)
                draw.text((0, 0), text=text_to_be_rotated, font=font, fill=(255, 255, 255, 255))
                #angle = math.degrees(math.atan(logo_h/logo_w))
                if down==False:
                        watermark = watermark.rotate(-angle, expand=True)
                else:
                        watermark = watermark.rotate(angle, expand=True)
                #into = img_rotated.rotate (start, expand = False)
                # merge
                wx, wy = watermark.size
                px = int(radio * math.cos(math.radians(angleToPositive(angle-90))))
                py = int(radio * math.sin(math.radians(angleToPositive(angle-90))))
                if down==True:
                        py = -py
                into.paste(watermark, (mid_x + px - int(wx/2),mid_y + py - int(wy/2), mid_x + px - int(wx/2) + wx, mid_y + py - int(wy/2) + wy), watermark)
        return into

def createStorageCertificate( storage_client, master_name:string, logo_name:string, file_name:string, student:string, title:string, t1:string, t2:string, t3:string, t4:string,color1:string, color2:string):

        student_top = 35/100
        title_top = 45/100

        bucket_name = storage_client.project + ".appspot.com"
        
        bucket = storage_client.get_bucket(bucket_name)



        # creating a image object for the master
        blob = bucket.blob(master_name)
        bytes = blob.download_as_bytes()
        b = io.BytesIO(bytes)
        image = Image.open(b)
       
        #image = Image.open("rax_certificate.jpg")

        w,h = image.size       
        f = 35
        
        #creating the draw object
        draw = ImageDraw.Draw(image) 

        
        # writing student
        f = 150
        font = ImageFont.truetype('SecularOne-Regular.ttf', f) 
        

        left = ( w/2 ) - calculateWidthString(student,  font) / 2
        top = (h * (student_top)) - f 
        
        draw.text((left, top), student, fill ="black", font = font, align ="center") 


        #writing the title
        f = 130
        font = ImageFont.truetype('SecularOne-Regular.ttf', f) 
        left_t = ( w/2 ) - (calculateWidthString(title, font)/2)
        top_t = (h * (title_top))
        
        draw.text((left_t, top_t), title, fill ="black", font = font, align ="center") 

        #writing expiration date
        today = datetime.date.today()
        issue = "Fecha de expedición:" + str(today)  + " " + "Fecha de expiración:" + str( datetime.date(today.year + 1, today.month, today.day))
        f_i = 40
        left_i =w * (3/20) 
        top_i = (h -f_i - 4) 
        font_i = ImageFont.truetype('Quicksand-VariableFont_wght.ttf', f_i)
        
        draw.text((left_i, top_i), issue, fill ="black", font = font_i, align ="left") 
        



        #add the logo circles
        
        seal_im =Image.new("RGB", size=(500,500), color="white")
        sealDraw = ImageDraw.Draw(seal_im)
        line_size = 40   #height of text  
        offset = (int((w - seal_im.size[0] - 100)), int((h - seal_im.size[1]) - 100)) #position of the seal into the certificate   
        
        #now add the logo  to the seal       
        blob = bucket.blob(logo_name)
        bytes = blob.download_as_bytes()
        b = io.BytesIO(bytes)
        img_logo = Image.open(b) 
        #resize to the seal image
        final_size = (300 , 300 )
        img_logo = img_logo.resize( final_size )
        seal_im.paste(img_logo, (100,100))
        img_logo.close()



        #draw the circles
        if color1 != None and color1 != "":
                shape = [(0,0), seal_im.size]
                sealDraw.arc(shape, start = 0, end = 360, fill = color1, width = line_size+2) 

        if color2 != None and color2 != "":
                shape2 = [(line_size,  line_size), ( seal_im.width - line_size,  seal_im.height - line_size)]
                sealDraw.arc(shape2, start = 0, end = 360, fill = color2, width = line_size) 

        #create mask for texts
        mask_im =Image.new("L", seal_im.size, 0)

        #white the text into the mask 
        if t1 != "":
                mask_im = draw_text_angle(t1,mask_im,1,down=False)
        if t2 != "":        
                mask_im = draw_text_angle(t2,mask_im,2,down=False)
        if t3 != "":        
                mask_im = draw_text_angle(t3,mask_im,2,down=True)
        if t4 != "":        
                mask_im = draw_text_angle(t4,mask_im,1,down=True)


        if color1 != "" or color2 != "":
                white_im =Image.new("RGB", size=seal_im.size, color="white")
                seal_im.paste(white_im, (0,0), mask_im)
                
        #now paste the seal into the certificate
        image.paste(seal_im, offset)
        #image.save('certificate.png') 

        #save the seal to cloud storage
        badge_b = io.BytesIO()
        seal_im.save(badge_b,'jpeg')
        seal_im.close()
            


        blob_logo = bucket.blob(file_name + "_badge" + ".jpeg") 
        blob_logo.upload_from_string(badge_b.getvalue(), content_type="image/jpeg")
        blob_logo.make_public() 
         

        #save to the diploma cloud storage     
        
        b = io.BytesIO()
        image.save(b,'jpeg')
        image.close()

        
        blob = bucket.blob(file_name + "_certificate" + ".jpeg") 
        blob.upload_from_string(b.getvalue(), content_type="image/jpeg")
        blob.make_public() 
        return {
                "certificatePath":blob.name,
                "certificateUrl":blob.public_url,
                "certificateBadgePath":blob_logo.name,
                "certificateBadgeUrl":blob_logo.public_url
                }
        
             
        
        
