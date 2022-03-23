# Importing Image and ImageFont, ImageDraw module from PIL package 
from re import S
from PIL import Image, ImageFont, ImageDraw 
import datetime
import io
import string 

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
    (x,y) = font.getsize(text)
    return x

def createStorageCertificate( storage_client, file_name, student, title):



        bucket_name = "certificates.raxacademy.com"
        
        bucket = storage_client.get_bucket(bucket_name)

        w = 1100
        h = 850
        f = 35

        # creating a image object 
        url = 'gs://certificates.raxacademy.com/rax_certificate.jpg'


        
        blob = bucket.blob("rax_certificate.jpg")
        bytes = blob.download_as_bytes()
        b = io.BytesIO(bytes)
        image = Image.open(b)
       
        #image = Image.open("rax_certificate.jpg")

        
        
        draw = ImageDraw.Draw(image) 

        
        # specified font size
        f = 25
        font = ImageFont.truetype('Quicksand-VariableFont_wght.ttf', f) 
        

        left = ( w/2 ) - calculateWidthString(student,  font) / 2
        top = (h * (5/10)) - f 
        
        draw.text((left, top), student, fill ="black", font = font, align ="center") 


        f = 35
        font = ImageFont.truetype('Quicksand-VariableFont_wght.ttf', f) 
        left_t = ( w/2 ) - (calculateWidthString(title, font)/2)
        top_t = (h * (23/40))
        
        draw.text((left_t, top_t), title, fill ="black", font = font, align ="center") 

        today = datetime.date.today()
        issue = "Fecha de expedicion:" + str(today) + "\n" + \
                "Fecha de expiracion:" + str( datetime.date(today.year + 1, today.month, today.day))
        f_i = 10
        left_i =w * (3/20) 
        top_i = (h * (16/20)) 
        font_i = ImageFont.truetype('Quicksand-VariableFont_wght.ttf', f_i)
        
        draw.text((left_i, top_i), issue, fill ="black", font = font_i, align ="left") 
        
        
        b = io.BytesIO()
        image.save(b,'jpeg')
        image.close()

        blob = bucket.blob(file_name) 
        blob.upload_from_string(b.getvalue(), content_type="image/jpeg")
        blob.make_public() 
        return blob.public_url
"""
def createLocalCertificate():
        w = 600
        h = 462
        f = 40

        # creating a image object 
        image = Image.open(r'/mnt/c/home/odroid/certificates/rax_certificate.jpg') 
        
        draw = ImageDraw.Draw(image) 

        
        # specified font size
        font = ImageFont.truetype('Yellowtail-Regular.ttf', f) 
        
        student = 'Claudia Gamboa'
        title = 'Belly Dancer Coreographer'

        left = ( w/2 ) - (len(student) * (f/5)) 
        top = (h * (5/10)) - f 
        
        draw.text((left, top), student, fill ="black", font = font, align ="center") 



        left_t = ( w/2 ) - (len(title) * (f/5)) 
        top_t = (h * (8/10)) - f 
        
        draw.text((left_t, top_t), title, fill ="black", font = font, align ="center") 

        today = datetime.date.today()
        issue = "Fecha de expedicion:" + str(today) + "\n" + \
                "Fecha de expiracion:" + str( datetime.date(today.year + 1, today.month, today.day))
        f_i = 10
        left_i =f_i * 3 
        top_i = (h * (9/10)) - f_i 
        font_i = ImageFont.truetype('Quicksand-VariableFont_wght.ttf', f_i)
        
        draw.text((left_i, top_i), issue, fill ="black", font = font_i, align ="left") 
        
        image.save("/mnt/c/home/odroid/certificates/rax_certificate_written.jpg")

"""